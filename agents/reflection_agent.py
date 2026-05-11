from __future__ import annotations
import json
from typing import Dict, Any
from core.ads_types import ExecutionCell
from llm.model_router import query_llm

class ReflectionAgent:
    def __init__(self):
        self.agent_id = "ReflectionAgent"

    def debug_and_fix(self, cell: ExecutionCell, error_context: str) -> str:
        prompt = (
            "You are a Self-Healing AI Engineer. You need to fix broken Python code.\n"
            "Analyze the provided code and the error trace.\n"
            "Produce a corrected version of the code that fixes the bug while achieving the original goal.\n"
            "Return ONLY the corrected code."
        )

        context = {
            "original_code": cell.code,
            "error": cell.error or error_context,
            "stdout": cell.stdout
        }

        fixed_code = query_llm(prompt, json.dumps(context))
        
        if "```python" in fixed_code:
            fixed_code = fixed_code.split("```python")[1].split("```")[0].strip()
        elif "```" in fixed_code:
            fixed_code = fixed_code.split("```")[1].split("```")[0].strip()
            
        return fixed_code
