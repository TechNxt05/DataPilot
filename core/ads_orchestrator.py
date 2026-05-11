from __future__ import annotations
import asyncio
import json
import logging
from typing import Dict, Any, List, Optional, Callable
import pandas as pd

from core.ads_types import (
    ADSRunResponse, 
    ExecutionGraph, 
    ExecutionNode, 
    ExecutionCell, 
    AgentStatus,
    Hypothesis,
    StrategicReport
)
from agents.planner_agent import PlannerAgent
from agents.executor_agent import ExecutorAgent
from agents.critic_agent import CriticAgent
from agents.reflection_agent import ReflectionAgent
from agents.hypothesis_agent import HypothesisAgent
from agents.narrator_agent import InsightNarratorAgent
from agents.memory_agent import MemoryAgent

class ADSOrchestrator:
    def __init__(self):
        self.planner = PlannerAgent()
        self.executor = ExecutorAgent()
        self.critic = CriticAgent()
        self.reflector = ReflectionAgent()
        self.hypothesizer = HypothesisAgent()
        self.narrator = InsightNarratorAgent()
        self.memory = MemoryAgent()

    async def run(
        self,
        session_id: str,
        user_query: str,
        df: pd.DataFrame,
        sql_connection_string: Optional[str] = None,
        stream_callback: Optional[Callable[[Dict[str, Any]], None]] = None,
    ) -> ADSRunResponse:
        
        def emit(event_type: str, payload: Any):
            if stream_callback:
                stream_callback({"type": event_type, "payload": payload})

        # 1. Planning Phase
        emit("agent_state", {"agent_id": "PlannerAgent", "state": "planning", "message": "Decomposing strategic goal into execution DAG..."})
        schema = {col: str(df[col].dtype) for col in df.columns}
        graph = self.planner.build_graph(user_query, df, schema)
        emit("planner", graph.model_dump())

        # 2. Execution Phase (DAG Traversal)
        executed_nodes = {}
        cells = []
        context = {"results": {}, "session_id": session_id}
        
        # Simple topological sort/execution loop for DAG
        pending_nodes = list(graph.nodes)
        
        while pending_nodes:
            runnable = [n for n in pending_nodes if all(dep in executed_nodes for dep in n.dependencies)]
            if not runnable:
                if pending_nodes:
                    logging.error(f"Deadlock detected in DAG: {pending_nodes}")
                break
            
            for node in runnable:
                emit("agent_state", {"agent_id": "ExecutorAgent", "state": "executing", "message": f"Processing node: {node.title}"})
                
                cell = await self.executor.execute_node(node, df, context)
                
                # 3. Criticism Phase
                emit("agent_state", {"agent_id": "CriticAgent", "state": "debating", "message": "Evaluating execution quality..."})
                verdict = self.critic.evaluate_cell(cell)
                
                # 4. Self-Healing Phase
                if verdict.get("should_retry", False):
                    emit("agent_state", {"agent_id": "ReflectionAgent", "state": "healing", "message": f"Healing logic: {verdict['reason']}"})
                    fixed_code = self.reflector.debug_and_fix(cell, verdict["reason"])
                    cell.code = fixed_code
                    cell.reflection = verdict["reason"]
                    # Re-run
                    cell = await self.executor.execute_node(node, df, context)
                
                cells.append(cell)
                executed_nodes[node.id] = cell
                pending_nodes.remove(node)
                emit("cell", cell.model_dump())

        # 5. Hypothesis Generation
        emit("agent_state", {"agent_id": "HypothesisAgent", "state": "executing", "message": "Generating strategic hypotheses..."})
        hypotheses = self.hypothesizer.generate_hypotheses(user_query, cells)
        emit("hypotheses", [h.model_dump() for h in hypotheses])

        # 6. Final Synthesis
        emit("agent_state", {"agent_id": "NarratorAgent", "state": "executing", "message": "Synthesizing executive report..."})
        report = self.narrator.synthesize_report(user_query, cells, hypotheses)
        
        emit("agent_state", {"agent_id": "ADS", "state": "success", "message": "Neural pipeline synchronized. Mission complete."})

        return ADSRunResponse(
            session_id=session_id,
            status="success",
            graph=graph,
            cells=cells,
            hypotheses=hypotheses,
            report=report,
            logs=["Analytical mission complete."]
        )
