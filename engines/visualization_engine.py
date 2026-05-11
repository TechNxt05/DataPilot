from __future__ import annotations

from typing import Any, Dict, List
import io
import base64
import json
import pandas as pd
import plotly.express as px
import plotly.utils as pu
import matplotlib.pyplot as plt
import seaborn as sns


def _fig_to_base64() -> str:
    buffer = io.BytesIO()
    plt.tight_layout()
    plt.savefig(buffer, format="png", dpi=120)
    buffer.seek(0)
    encoded = base64.b64encode(buffer.read()).decode("utf-8")
    plt.close()
    return encoded


def auto_select_visualizations(df: pd.DataFrame) -> List[Dict[str, Any]]:
    charts: List[Dict[str, Any]] = []
    numeric_cols = df.select_dtypes(include="number").columns.tolist()
    date_cols = df.select_dtypes(
        include=["datetime64[ns]", "datetime64[ns, UTC]"]
    ).columns.tolist()
    cat_cols = df.select_dtypes(include=["object", "category"]).columns.tolist()

    # 1. Line Chart (Time Series)
    if date_cols and numeric_cols:
        x_col = date_cols[0]
        y_col = numeric_cols[0]
        fig = px.line(df.sort_values(x_col), x=x_col, y=y_col, title=f"{y_col} over {x_col}", template="plotly_dark")
        charts.append(
            {
                "chart_type": "line",
                "title": f"{y_col} over {x_col}",
                "plotly_json": json.loads(fig.to_json()),
            }
        )

    # 2. Histogram (Distribution)
    if numeric_cols:
        hist_col = numeric_cols[0]
        fig = px.histogram(df, x=hist_col, marginal="box", title=f"Distribution of {hist_col}", template="plotly_dark")
        charts.append(
            {
                "chart_type": "histogram",
                "title": f"Distribution of {hist_col}",
                "plotly_json": json.loads(fig.to_json()),
            }
        )

    # 3. Scatter Plot (Correlation)
    if len(numeric_cols) >= 2:
        x_col, y_col = numeric_cols[0], numeric_cols[1]
        fig = px.scatter(df, x=x_col, y=y_col, trendline="ols", title=f"{x_col} vs {y_col}", template="plotly_dark")
        charts.append(
            {
                "chart_type": "scatter",
                "title": f"{x_col} vs {y_col}",
                "plotly_json": json.loads(fig.to_json()),
            }
        )

    # 4. Bar Chart (Top Categories)
    if cat_cols and numeric_cols:
        cat_col = cat_cols[0]
        y_col = numeric_cols[0]
        top_n = df.groupby(cat_col)[y_col].sum().sort_values(ascending=False).head(10).reset_index()
        fig = px.bar(top_n, x=cat_col, y=y_col, title=f"Top 10 {cat_col} by {y_col}", template="plotly_dark")
        charts.append(
            {
                "chart_type": "bar",
                "title": f"Top 10 {cat_col} by {y_col}",
                "plotly_json": json.loads(fig.to_json()),
            }
        )

    return charts
