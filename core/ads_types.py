from __future__ import annotations

from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field


class ExecutionStep(BaseModel):
    step_id: str
    title: str
    description: str
    tool: Literal[
        "eda",
        "feature_engineering",
        "visualization",
        "sql",
        "ml_experiment",
        "insight_generation",
        "python",
    ] = "python"
    expected_output: str = ""


class ExecutionPlan(BaseModel):
    goal: str
    inferred_task_type: Literal["analysis", "regression", "classification", "query", "eda"] = "analysis"
    steps: List[ExecutionStep] = Field(default_factory=list)
    assumptions: List[str] = Field(default_factory=list)


class ExecutionCell(BaseModel):
    cell_id: str
    step_id: str
    title: str
    code: str
    language: str = "python"
    status: Literal["pending", "running", "success", "error", "critic_retry"] = "pending"
    stdout: str = ""
    error: Optional[str] = None
    artifacts: Dict[str, Any] = Field(default_factory=dict)
    logs: List[str] = Field(default_factory=list)
    critic_feedback: Optional[str] = None


class CriticVerdict(BaseModel):
    should_retry: bool = False
    reason: str = ""
    suggested_patch: str = ""
    confidence: float = 0.5


class ADSRunResponse(BaseModel):
    status: Literal["success", "partial_success", "error"]
    plan: ExecutionPlan
    cells: List[ExecutionCell]
    insights: List[str] = Field(default_factory=list)
    memory: Dict[str, Any] = Field(default_factory=dict)
    logs: List[str] = Field(default_factory=list)
