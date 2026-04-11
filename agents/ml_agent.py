import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression, LogisticRegression, Ridge
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier, IsolationForest
from sklearn.cluster import KMeans
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score, classification_report

def suggest_and_run_model(df: pd.DataFrame, target_col: str = None):
    """Detects ML task, pre-processes, runs generic models, returns metrics."""
    result = {"task": "Unknown", "metrics": {}, "feature_importance": {}}
    
    # 1. Prepare data (Drop NaNs strictly for ML here, label encoding)
    df_ml = df.dropna().copy()
    
    # Convert categorical to dummy
    cat_cols = df_ml.select_dtypes(include=['object', 'category']).columns
    # Drop columns with too many unique values to prevent explosion
    cols_to_drop = [c for c in cat_cols if df_ml[c].nunique() > 20]
    df_ml = df_ml.drop(columns=cols_to_drop)
    df_ml = pd.get_dummies(df_ml, drop_first=True)
    
    # 2. Decide Task
    if target_col and target_col in df.columns:
        y = getattr(df, target_col, df_ml.get(target_col, None))
        
        # If target has been dropped by get_dummies, it means it was a categorical column
        if target_col not in df_ml.columns: 
            # Re-attach as int encoded
            df_ml[target_col] = df[target_col].astype('category').cat.codes
            
        y = df_ml[target_col]
        X = df_ml.drop(columns=[target_col])
        
        if X.empty:
            return {"error": "Not enough features to train a model."}
            
        if pd.api.types.is_numeric_dtype(y) and df[target_col].nunique() > 10:
            result["task"] = "Regression"
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            model = RandomForestRegressor(n_estimators=50, random_state=42)
            model.fit(X_train, y_train)
            preds = model.predict(X_test)
            
            result["metrics"]["R2"] = r2_score(y_test, preds)
            result["metrics"]["MSE"] = mean_squared_error(y_test, preds)
            # feature importance
            imps = dict(zip(X.columns, model.feature_importances_))
            result["feature_importance"] = dict(sorted(imps.items(), key=lambda item: item[1], reverse=True)[:10])
            
        else:
            result["task"] = "Classification"
            # Ensure y is integer
            y = y.astype(int)
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            model = RandomForestClassifier(n_estimators=50, random_state=42)
            model.fit(X_train, y_train)
            preds = model.predict(X_test)
            
            result["metrics"]["Accuracy"] = accuracy_score(y_test, preds)
            imps = dict(zip(X.columns, model.feature_importances_))
            result["feature_importance"] = dict(sorted(imps.items(), key=lambda item: item[1], reverse=True)[:10])

    else:
        # No target column: Clustering and Anomaly Detection
        X = df_ml
        if X.empty:
            return {"error": "Not enough features to train a model."}
            
        result["task"] = "Clustering & Anomaly Detection"
        
        # KMeans
        kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
        clusters = kmeans.fit_predict(X)
        result["metrics"]["KMeans_Inertia"] = kmeans.inertia_
        
        # Isolation Forest
        iso = IsolationForest(contamination=0.05, random_state=42)
        anomalies = iso.fit_predict(X)
        num_anomalies = list(anomalies).count(-1)
        result["metrics"]["Anomalies_Detected"] = num_anomalies

    return result
