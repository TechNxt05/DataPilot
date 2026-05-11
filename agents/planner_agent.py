from __future__ import annotations

import json
from typing import Dict, List
import pandas as pd
from core.ads_types import ExecutionGraph, ExecutionNode
from llm.model_router import query_llm


class PlannerAgent:
    def __init__(self):
        self.agent_id = "PlannerAgent"

    def build_graph(self, user_query: str, df: pd.DataFrame, schema: Dict[str, str]) -> ExecutionGraph:
        prompt = (
            "You are the Lead Strategic Planner for DataPilot AI. "
            "Your goal is to decompose a user request into a high-fidelity execution DAG (Directed Acyclic Graph).\n\n"
            "Rules:\n"
            "1. Identify the core intent (EDA, Forecasting, Anomaly Detection, Hypothesis Testing).\n"
            "2. Define tasks as nodes with specific 'tool' types (eda, cleaning, viz, model, forecast, anomaly, report).\n"
            "3. Define dependencies between nodes (e.g., viz depends on cleaning).\n"
            "4. For complex requests, branch the analysis (e.g., run regional and temporal analysis in parallel).\n\n"
            "Return ONLY a JSON object:\n"
            "{\n"
            "  'nodes': [\n"
            "    {'id': 'n1', 'title': '...', 'description': '...', 'tool': '...', 'dependencies': []}\n"
            "  ],\n"
            "  'edges': [\n"
            "    {'source': 'n1', 'target': 'n2'}\n"
            "  ]\n"
            "}"
        )

        context = {
            "query": user_query,
            "df_info": f"Rows: {len(df)}, Columns: {list(df.columns)}",
            "schema": schema
        }

        response = query_llm(prompt, json.dumps(context))
        
        try:
            # Simple cleaning in case of markdown blocks
            clean_res = response.strip()
            if "```json" in clean_res:
                clean_res = clean_res.split("```json")[1].split("```")[0].strip()
            
            data = json.loads(clean_res)
            
            nodes = [ExecutionNode(**n) for n in data.get("nodes", [])]
            return ExecutionGraph(nodes=nodes, edges=data.get("edges", []))
        except Exception as e:
            # Fallback to basic linear graph if LLM fails
            return self._get_fallback_graph(user_query)

    def _get_fallback_graph(self, query: str) -> ExecutionGraph:
        nodes = [
            ExecutionNode(id="n1", title="Data Profiling", description="Statistical overview of the dataset.", tool="eda"),
            ExecutionNode(id="n2", title="Cleaning", description="Handling missing values and anomalies.", tool="cleaning", dependencies=["n1"]),
            ExecutionNode(id="n3", title="Viz", description="Generating interactive holographic charts.", tool="viz", dependencies=["n2"]),
            ExecutionNode(id="n4", title="Final Report", description="Synthesizing insights.", tool="report", dependencies=["n3"])
        ]
        edges = [
            {"source": "n1", "target": "n2"},
            {"source": "n2", "target": "n3"},
            {"source": "n3", "target": "n4"}
        ]
        return ExecutionGraph(nodes=nodes, edges=edges)
