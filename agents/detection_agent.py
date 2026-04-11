import pandas as pd
import numpy as np

def detect_issues(df: pd.DataFrame) -> dict:
    """Analyzes a dataframe for missing values, duplicates, outliers, and schema info."""
    issues = {
        "missing_values": {},
        "duplicates": 0,
        "outliers": {},
        "schema": {},
        "total_rows": len(df),
        "total_cols": len(df.columns)
    }

    # Missing values
    missing = df.isnull().sum()
    issues["missing_values"] = missing[missing > 0].to_dict()

    # Duplicates
    issues["duplicates"] = int(df.duplicated().sum())

    # Outliers (using simplified IQR for numeric)
    for col in df.select_dtypes(include=[np.number]).columns:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        outlier_condition = (df[col] < (Q1 - 1.5 * IQR)) | (df[col] > (Q3 + 1.5 * IQR))
        outliers_count = outlier_condition.sum()
        if outliers_count > 0:
            issues["outliers"][col] = int(outliers_count)

    # Schema
    for col in df.columns:
        issues["schema"][col] = str(df[col].dtype)

    return issues
