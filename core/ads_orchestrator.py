from __future__ import annotations

from typing import Any, Callable, Dict, List, Optional
import pandas as pd

from agents.planner_agent import build_plan
from agents.executor_agent import execute_step, generate_insight_narration
from agents.critic_agent import evaluate_cell
from core.ads_types import ADSRunResponse, ExecutionCell
from core.memory import memory_store
from core.tool_registry import ToolRegistry


class ADSOrchestrator:
    def __init__(self, max_iterations: int = 2) -> None:
        self.max_iterations = max_iterations
        self.registry = ToolRegistry()
        self.registry.register("eda", "Profile dataframe and schema.", execute_step)
        self.registry.register("feature_engineering", "Prepare data for modeling.", execute_step)
        self.registry.register("visualization", "Automatic chart generation.", execute_step)
        self.registry.register("sql", "Natural language to SQL execution.", execute_step)
        self.registry.register("ml_experiment", "Train and compare ML models.", execute_step)
        self.registry.register("insight_generation", "Narrative insight generation.", execute_step)

    async def run(
        self,
        session_id: str,
        user_query: str,
        df: pd.DataFrame,
        sql_connection_string: Optional[str] = None,
        stream_callback: Optional[Callable[[Dict[str, Any]], None]] = None,
    ) -> ADSRunResponse:
        schema = {col: str(df[col].dtype) for col in df.columns}
        plan = build_plan(user_query, df, schema)
        memory_store.add_query(session_id, user_query)
        logs: List[str] = [
            f"ADS initialized. Goal mapped to {len(plan.steps)} neural steps.",
            f"Inferred task trajectory: {plan.inferred_task_type.upper()}.",
            f"Assumptions locked: {', '.join(plan.assumptions[:2])}...",
        ]
        cells: List[ExecutionCell] = []

        if stream_callback:
            stream_callback({"type": "planner", "payload": plan.model_dump()})
            for log in logs:
                stream_callback({"type": "log", "payload": {"message": log}})

        for step in plan.steps:
            retries = 0
            final_cell: Optional[ExecutionCell] = None
            while retries <= self.max_iterations:
                if stream_callback:
                    stream_callback(
                        {
                            "type": "log",
                            "payload": {
                                "message": f"Running step '{step.title}' (attempt {retries + 1})."
                            },
                        }
                    )

                sql_context = None
                if step.tool == "sql" and sql_connection_string:
                    sql_context = {
                        "prompt": user_query,
                        "schema": str(schema),
                        "connection_string": sql_connection_string,
                    }
                cell = execute_step(step, df, sql_context=sql_context)
                verdict = evaluate_cell(cell)
                cell.critic_feedback = verdict.reason

                if verdict.should_retry and retries < self.max_iterations:
                    cell.status = "critic_retry"
                    cell.logs.append(f"Critic requested retry: {verdict.suggested_patch}")
                    retries += 1
                    if stream_callback:
                        stream_callback({"type": "cell", "payload": cell.model_dump()})
                    continue

                final_cell = cell
                break

            if final_cell is None:
                final_cell = cell

            cells.append(final_cell)
            memory_store.add_step_record(
                session_id,
                {
                    "step_id": step.step_id,
                    "title": step.title,
                    "status": final_cell.status,
                    "critic_feedback": final_cell.critic_feedback,
                },
            )
            if stream_callback:
                stream_callback({"type": "cell", "payload": final_cell.model_dump()})

        narrative = generate_insight_narration(plan.goal, cells)
        insights = [line.strip("- ").strip() for line in narrative.splitlines() if line.strip()]
        status = (
            "success"
            if all(cell.status in {"success", "critic_retry"} for cell in cells)
            else "partial_success"
        )
        logs.append("Neural pipeline synchronized. Mission complete.")
        if stream_callback:
            stream_callback({"type": "log", "payload": {"message": "Neural pipeline synchronized. Mission complete."}})
            stream_callback({"type": "insights", "payload": insights})

        return ADSRunResponse(
            status=status,  # type: ignore[arg-type]
            plan=plan,
            cells=cells,
            insights=insights,
            memory=memory_store.snapshot(session_id),
            logs=logs,
        )
