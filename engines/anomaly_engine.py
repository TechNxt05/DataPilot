import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest

class AnomalyEngine:
    def __init__(self):
        pass

    def detect_anomalies(self, df: pd.DataFrame, contamination: float = 0.05) -> pd.DataFrame:
        # Select numeric columns
        numeric_df = df.select_dtypes(include=[np.number])
        if numeric_df.empty:
            return df
            
        # Handle NaNs
        numeric_df = numeric_df.fillna(numeric_df.median())
        
        iso = IsolationForest(contamination=contamination, random_state=42)
        preds = iso.fit_predict(numeric_df)
        
        df["is_anomaly"] = preds == -1
        df["anomaly_score"] = iso.decision_function(numeric_df)
        
        return df

    def get_summary(self, df: pd.DataFrame) -> Dict[str, Any]:
        if "is_anomaly" not in df.columns:
            return {}
            
        anomalies = df[df["is_anomaly"]]
        return {
            "total_count": len(df),
            "anomaly_count": len(anomalies),
            "anomaly_rate": len(anomalies) / len(df),
            "significant_anomalies": anomalies.head(10).to_dict(orient="records")
        }
