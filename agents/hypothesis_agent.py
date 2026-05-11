from __future__ import annotations
import json
from typing import List, Dict, Any
from core.ads_types import Hypothesis, ExecutionCell
from llm.model_router import query_llm

class HypothesisAgent:
    def __init__(self):
        self.agent_id = "HypothesisAgent"

    def generate_hypotheses(self, goal: str, cells: List[ExecutionCell]) -> List[Hypothesis]:
        prompt = (
            "You are a Principal Business Strategist and Causal Inference expert.\n"
            "Based on the analysis results provided, generate 3-5 strategic hypotheses explaining the data patterns.\n"
            "Each hypothesis must have: statement, explanation, confidence (0-1), evidence, and conflicting_evidence.\n"
            "Return JSON: [{'statement': '...', 'explanation': '...', 'confidence': 0.8, 'evidence': [], 'conflicting_evidence': []}]"
        )

        context = {
            "goal": goal,
            "results": [
                {
                    "node_id": c.node_id,
                    "stdout": c.stdout[:500],
                    "artifacts": list(c.artifacts.keys())
                } for c in cells if c.status == "success"
            ]
        }

        try:
            response = query_llm(prompt, json.dumps(context))
            if "```json" in response:
                response = response.split("```json")[1].split("```")[0].strip()
            data = json.loads(response)
            
            hypotheses = []
            for i, h in enumerate(data):
                hypotheses.append(Hypothesis(id=f"h_{i}", **h))
            return hypotheses
        except:
            return []
