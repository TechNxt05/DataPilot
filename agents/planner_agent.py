from __future__ import annotations

import json
from typing import Dict, List
import pandas as pd

from core.ads_types import ExecutionPlan, ExecutionStep
from llm.model_router import query_llm


def build_plan(user_query: str, df: pd.DataFrame, schema: Dict[str, str]) -> ExecutionPlan:
    lowered = user_query.lower()
    is_audit = any(token in lowered for token in ["audit", "deep-dive", "discovery", "magic wand"])
    
    base_steps: List[ExecutionStep] = [
        ExecutionStep(
            step_id="s1",
            title="Intelligent Data Profiling",
            description="Perform deep schema inspection and statistical distribution analysis.",
            tool="eda",
            expected_output="comprehensive data profile",
        ),
        ExecutionStep(
            step_id="s2",
            title="Automated Data Cleaning",
            description="Handle missing values, identify outliers, and normalize distributions.",
            tool="feature_engineering",
            expected_output="cleaned dataframe",
        ),
        ExecutionStep(
            step_id="s3",
            title="Strategic Visualization",
            description="Generate high-impact Plotly visualizations for key data relationships.",
            tool="visualization",
            expected_output="interactive charts",
        ),
    ]

    inferred = "analysis"
    if is_audit:
        inferred = "eda"
        base_steps.append(
            ExecutionStep(
                step_id="s4",
                title="Correlation & Dependency Mapping",
                description="Analyze feature interactions and identify key business drivers.",
                tool="ml_experiment",
                expected_output="correlation matrix and driver analysis",
            )
        )
    elif any(token in lowered for token in ["predict", "forecast", "regression"]):
        inferred = "regression"
        base_steps.append(
            ExecutionStep(
                step_id="s4",
                title="Predictive Modeling Suite",
                description="Train and compare multiple regression models for target estimation.",
                tool="ml_experiment",
                expected_output="model performance leaderboard",
            )
        )
    elif any(token in lowered for token in ["classify", "churn", "risk", "segment"]):
        inferred = "classification"
        base_steps.append(
            ExecutionStep(
                step_id="s4",
                title="Classification Framework",
                description="Execute classification algorithms and evaluate decision boundaries.",
                tool="ml_experiment",
                expected_output="classification metrics and confusion matrix",
            )
        )

    if any(token in lowered for token in ["sql", "database", "top", "customers"]):
        inferred = "query"
        base_steps.append(
            ExecutionStep(
                step_id="s_sql",
                title="Neural SQL Synthesis",
                description="Convert natural language to optimized SQL and execute on data source.",
                tool="sql",
                expected_output="structured query result",
            )
        )

    base_steps.append(
        ExecutionStep(
            step_id="s_final",
            title="Strategic Insight Narration",
            description="Synthesize all findings into a high-level business narrative.",
            tool="insight_generation",
            expected_output="executive summary",
        )
    )

    # Optional LLM shaping for better assumptions
    assumptions: List[str] = [f"Input dataset initialized with {len(df)} rows and {len(df.columns)} features."]
    try:
        response = query_llm(
            "Return JSON object with key 'assumptions' (array of 3-5 short strings).",
            f"User request: {user_query}\nSchema: {schema}\nContext: {'Autonomous Discovery Audit' if is_audit else 'Standard Query'}",
        )
        parsed = json.loads(response)
        if isinstance(parsed, dict) and isinstance(parsed.get("assumptions"), list):
            assumptions.extend([str(x) for x in parsed["assumptions"][:4]])
    except Exception:
        pass

    return ExecutionPlan(
        goal=user_query,
        inferred_task_type=inferred,  # type: ignore[arg-type]
        steps=base_steps,
        assumptions=assumptions,
    )
