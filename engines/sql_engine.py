from __future__ import annotations

from typing import Any, Dict
import pandas as pd

from llm.model_router import query_llm
from connectors.sql_connector import load_from_sql


def nl_to_sql(question: str, schema: Dict[str, str]) -> str:
    system_prompt = (
        "You are an expert SQL translator. Return ONLY SQL query text without markdown fences."
    )
    user_prompt = (
        f"Question: {question}\nSchema: {schema}\n"
        "Use safe read-only SQL and limit output when appropriate."
    )
    response = query_llm(system_prompt, user_prompt)
    return response.strip().replace("```sql", "").replace("```", "").strip()


def execute_sql_plan(connection_string: str, sql: str) -> Dict[str, Any]:
    df = load_from_sql(connection_string, sql)
    return {
        "rows": len(df),
        "columns": list(df.columns),
        "preview": df.head(25).fillna("").to_dict(orient="records"),
        "dataframe": df,
    }
