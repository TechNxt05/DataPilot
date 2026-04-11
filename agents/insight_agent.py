import pandas as pd
import numpy as np

def generate_insights(df: pd.DataFrame) -> dict:
    """Computes basic stats, correlations, and distributions."""
    insights = {
        "summary": {},
        "correlations": [],
        "distributions": {}
    }
    
    numeric_df = df.select_dtypes(include=[np.number])
    
    # 1. Descriptive stats
    if not numeric_df.empty:
        summary_df = numeric_df.describe().T
        insights["summary"] = summary_df.to_dict(orient="index")
        
        # 2. Correlations (top strong pairs)
        corr_matrix = numeric_df.corr().abs()
        upper = corr_matrix.where(np.triu(np.ones(corr_matrix.shape), k=1).astype(bool))
        # Find pairs with correlation > 0.5
        for col1 in upper.columns:
            for col2 in upper.index:
                val = upper.loc[col2, col1]
                if not pd.isna(val) and val > 0.5:
                    insights["correlations"].append({
                        "feature_1": col2,
                        "feature_2": col1,
                        "correlation": round(val, 3)
                    })

    # 3. Distributions (categorical value counts)
    cat_df = df.select_dtypes(include=['object', 'category'])
    for col in cat_df.columns:
        if df[col].nunique() <= 10:
            insights["distributions"][col] = df[col].value_counts().to_dict()

    return insights
