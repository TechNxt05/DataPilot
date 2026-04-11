import pandas as pd

def calculate_quality_score(df: pd.DataFrame, issues: dict) -> dict:
    """Generates a data quality score out of 100 based on detection logic."""
    score = 100
    
    total_cells = issues["total_rows"] * issues["total_cols"]
    
    # Penalize for duplicates (up to 20 points)
    duplicate_ratio = issues.get("duplicates", 0) / (issues["total_rows"] or 1)
    score -= min(20, duplicate_ratio * 100)
    
    # Penalize for missing values (up to 40 points)
    missing_cells = sum(issues.get("missing_values", {}).values())
    missing_ratio = missing_cells / (total_cells or 1)
    score -= min(40, missing_ratio * 100)
    
    # Outliers (up to 10 points)
    outlier_cells = sum(issues.get("outliers", {}).values())
    outlier_ratio = outlier_cells / (total_cells or 1)
    score -= min(10, outlier_ratio * 100)
    
    # Ensure score is within valid range
    final_score = max(0, min(100, int(score)))
    
    return {
        "score": final_score,
        "metrics": {
            "duplicate_penalty": min(20, duplicate_ratio * 100),
            "missing_penalty": min(40, missing_ratio * 100),
            "outlier_penalty": min(10, outlier_ratio * 100)
        }
    }
