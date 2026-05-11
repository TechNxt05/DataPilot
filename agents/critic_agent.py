from __future__ import annotations
import json
from typing import Dict, Any
from core.ads_types import ExecutionCell
from llm.model_router import query_llm

class CriticAgent:
    def __init__(self):
        self.agent_id = "CriticAgent"

    def evaluate_cell(self, cell: ExecutionCell) -> Dict[str, Any]:
        if cell.status == "error":
            return {
                "should_retry": True,
                "reason": f"Execution failed: {cell.error}",
                "patch": "Analyze the stack trace and fix the logic.",
                "confidence": 0.0
            }

        prompt = (
            "You are a Senior Data Science Critic. Evaluate the technical rigor and validity of this execution.\n"
            "If the results look empty, statistically suspicious, or depth-less, mark 'should_retry': true.\n"
            "Return JSON: {'should_retry': bool, 'reason': str, 'patch': str, 'confidence': float}"
        )

        context = {
            "node_id": cell.node_id,
            "code": cell.code,
            "stdout": cell.stdout[:1000],
            "artifacts_keys": list(cell.artifacts.keys())
        }

        try:
            response = query_llm(prompt, json.dumps(context))
            if "```json" in response:
                response = response.split("```json")[1].split("```")[0].strip()
            return json.loads(response)
        except:
            return {"should_retry": False, "reason": "Evaluation skipped.", "patch": "", "confidence": 0.8}
