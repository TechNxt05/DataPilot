from __future__ import annotations
import json
from core.ads_types import CriticVerdict, ExecutionCell
from llm.model_router import query_llm


def evaluate_cell(cell: ExecutionCell) -> CriticVerdict:
    if cell.status == "error":
        return CriticVerdict(
            should_retry=True,
            reason=f"Cell failed with runtime error: {cell.error}",
            suggested_patch="Add null-safe operations and explicit column checks before transformation.",
            confidence=0.95,
        )

    # Use LLM for semantic critique
    try:
        context = {
            "title": cell.title,
            "status": cell.status,
            "stdout": cell.stdout[:1000],
            "artifacts_keys": list(cell.artifacts.keys()),
        }
        
        prompt = (
            "You are a Senior ADS Quality Critic. Evaluate this execution cell for technical rigor.\n"
            "If the output is empty or lacks depth, mark 'should_retry': true.\n"
            "Return JSON: {'should_retry': bool, 'reason': str, 'suggested_patch': str, 'confidence': float}"
        )
        
        response = query_llm(prompt, f"Cell Context: {context}")
        parsed = json.loads(response)
        return CriticVerdict(**parsed)
    except Exception:
        # Fallback to simple logic
        if cell.status == "success" and not cell.stdout.strip() and not cell.artifacts:
            return CriticVerdict(
                should_retry=True,
                reason="No evidence of execution output.",
                suggested_patch="Emit structured logs and attach artifacts.",
                confidence=0.65,
            )
        return CriticVerdict(should_retry=False, reason="Execution appears correct.", confidence=0.8)
