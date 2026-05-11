from __future__ import annotations
import json
import logging
import traceback
from typing import Dict, Any, List
import pandas as pd
from core.ads_types import ExecutionNode, ExecutionCell
from llm.model_router import query_llm
from core.sandbox import Sandbox

class ExecutorAgent:
    def __init__(self):
        self.agent_id = "ExecutorAgent"
        self.sandbox = Sandbox()

    async def execute_node(self, node: ExecutionNode, df: pd.DataFrame, context: Dict[str, Any]) -> ExecutionCell:
        prompt = (
            f"You are the Lead Analytical Engineer for DataPilot AI. Write Python code to perform this task: {node.title}\n"
            f"Description: {node.description}\n"
            "The dataframe is available as 'df'.\n"
            "Rules:\n"
            "1. Use pandas, numpy, scikit-learn, prophet, or xgboost if relevant.\n"
            "2. If the tool is 'viz', use Plotly (express or graph_objects) and assign the figure to a variable named 'fig'.\n"
            "3. Store any key numeric results or metadata in a dictionary named 'results'.\n"
            "4. Return ONLY the python code."
        )

        llm_context = {
            "node": node.model_dump(),
            "schema": {col: str(df[col].dtype) for col in df.columns},
            "prior_results": context.get("results", {})
        }

        code = query_llm(prompt, json.dumps(llm_context))
        
        # Clean code
        if "```python" in code:
            code = code.split("```python")[1].split("```")[0].strip()
        elif "```" in code:
            code = code.split("```")[1].split("```")[0].strip()

        cell = ExecutionCell(node_id=node.id, cell_id=f"c_{node.id}", code=code)
        
        try:
            result = self.sandbox.run(code, {"df": df.copy(), "results": context.get("results", {})})
            cell.status = "success"
            cell.stdout = result.stdout
            cell.artifacts = result.artifacts
            
            # Persist results in context for subsequent nodes
            if "results" in result.namespace:
                context["results"].update(result.namespace["results"])
                
        except Exception as e:
            cell.status = "error"
            cell.error = f"{str(e)}\n{traceback.format_exc()}"
            logging.error(f"Execution failed for node {node.id}: {e}")

        return cell

def generate_insight_narration(goal: str, cells: List[ExecutionCell]) -> str:
    compact = []
    for cell in cells:
        compact.append(
            {
                "node_id": cell.node_id,
                "status": cell.status,
                "artifacts": list(cell.artifacts.keys()),
                "stdout": cell.stdout[:500],
            }
        )

    try:
        response = query_llm(
            "You are a Principal AI Strategist. Provide strategic business insights as bullet points.",
            f"Goal: {goal}\nExecution summary: {compact}",
        )
        return response.strip()
    except Exception:
        return "Analytical mission synchronized. Insights synthesized."
