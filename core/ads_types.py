from __future__ import annotations

from typing import Any, Dict, List, Literal, Optional, Union
from pydantic import BaseModel, Field


class AgentStatus(BaseModel):
    agent_id: str
    state: Literal["idle", "planning", "executing", "debating", "healing", "success", "failure"] = "idle"
    message: str = ""
    timestamp: float = 0.0


class ExecutionNode(BaseModel):
    id: str
    type: str = "task"
    title: str
    description: str
    tool: str
    dependencies: List[str] = Field(default_factory=list)
    status: Literal["pending", "running", "success", "error", "healed", "skipped"] = "pending"
    owner: str = "ExecutorAgent"
    output_preview: Optional[str] = None
    confidence: float = 1.0


class ExecutionGraph(BaseModel):
    nodes: List[ExecutionNode] = Field(default_factory=list)
    edges: List[Dict[str, str]] = Field(default_factory=list)


class ExecutionCell(BaseModel):
    cell_id: str
    node_id: str
    code: str
    status: str = "pending"
    stdout: str = ""
    error: Optional[str] = None
    artifacts: Dict[str, Any] = Field(default_factory=dict)
    logs: List[str] = Field(default_factory=list)
    reflection: Optional[str] = None


class Hypothesis(BaseModel):
    id: str
    statement: str
    explanation: str
    confidence: float
    evidence: List[str] = Field(default_factory=list)
    conflicting_evidence: List[str] = Field(default_factory=list)
    status: Literal["proposed", "validated", "rejected"] = "proposed"


class StrategicReport(BaseModel):
    title: str
    summary: str
    key_findings: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    artifacts: List[str] = Field(default_factory=list)


class ADSRunResponse(BaseModel):
    session_id: str
    status: str
    graph: ExecutionGraph
    cells: List[ExecutionCell] = Field(default_factory=list)
    hypotheses: List[Hypothesis] = Field(default_factory=list)
    report: Optional[StrategicReport] = None
    agent_states: List[AgentStatus] = Field(default_factory=list)
    logs: List[str] = Field(default_factory=list)
