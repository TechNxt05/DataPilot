import pandas as pd
import numpy as np

def enrich_data(df: pd.DataFrame) -> pd.DataFrame:
    """Adds derived temporal or categorical bin features if applicable."""
    df_enriched = df.copy()

    # Expand datetime features
    for col in df_enriched.select_dtypes(include=['datetime64', 'datetimetz']).columns:
        df_enriched[f"{col}_year"] = df_enriched[col].dt.year
        df_enriched[f"{col}_month"] = df_enriched[col].dt.month
        df_enriched[f"{col}_day"] = df_enriched[col].dt.day
        df_enriched[f"{col}_dayofweek"] = df_enriched[col].dt.dayofweek

    # Create bins for numerical data that might represent categories (e.g., age, score)
    # Simple heuristic: if range is large and > 20 unique values
    numeric_cols = df_enriched.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        if df_enriched[col].nunique() > 20 and df_enriched[col].min() >= 0:
            if 'age' in col.lower() or 'score' in col.lower() or 'amount' in col.lower():
                try:
                    df_enriched[f"{col}_binned"] = pd.qcut(df_enriched[col], q=4, labels=['Q1', 'Q2', 'Q3', 'Q4'])
                except ValueError: # duplicate bins edges
                    pass

    return df_enriched
