from __future__ import annotations

from typing import Any, Dict, List
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, f1_score, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier, GradientBoostingRegressor, GradientBoostingClassifier


def _build_preprocessor(X: pd.DataFrame) -> ColumnTransformer:
    numeric_features = X.select_dtypes(include="number").columns.tolist()
    categorical_features = [c for c in X.columns if c not in numeric_features]

    numeric_transformer = Pipeline(
        steps=[("imputer", SimpleImputer(strategy="median")), ("scaler", StandardScaler())]
    )
    categorical_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore")),
        ]
    )

    return ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numeric_features),
            ("cat", categorical_transformer, categorical_features),
        ]
    )


def run_experiments(df: pd.DataFrame, target_col: str) -> Dict[str, Any]:
    work_df = df.copy()
    work_df = work_df.dropna(subset=[target_col])
    X = work_df.drop(columns=[target_col])
    y = work_df[target_col]

    is_classification = y.dtype == "object" or y.nunique() <= 20
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    preprocessor = _build_preprocessor(X)
    experiments: List[Dict[str, Any]] = []

    if is_classification:
        models = [
            ("LogisticRegression", LogisticRegression(max_iter=500)),
            ("RandomForestClassifier", RandomForestClassifier(n_estimators=200, random_state=42)),
            ("GradientBoostingClassifier", GradientBoostingClassifier(random_state=42)),
        ]
        for name, model in models:
            pipe = Pipeline(steps=[("preprocessor", preprocessor), ("model", model)])
            pipe.fit(X_train, y_train)
            preds = pipe.predict(X_test)
            experiments.append(
                {
                    "model": name,
                    "accuracy": round(float(accuracy_score(y_test, preds)), 4),
                    "f1_weighted": round(float(f1_score(y_test, preds, average="weighted")), 4),
                }
            )
        top_metric = max(experiments, key=lambda item: item["f1_weighted"])
        task_type = "classification"
    else:
        models = [
            ("LinearRegression", LinearRegression()),
            ("RandomForestRegressor", RandomForestRegressor(n_estimators=200, random_state=42)),
            ("GradientBoostingRegressor", GradientBoostingRegressor(random_state=42)),
        ]
        for name, model in models:
            pipe = Pipeline(steps=[("preprocessor", preprocessor), ("model", model)])
            pipe.fit(X_train, y_train)
            preds = pipe.predict(X_test)
            experiments.append(
                {
                    "model": name,
                    "rmse": round(float(np.sqrt(mean_squared_error(y_test, preds))), 4),
                    "r2": round(float(r2_score(y_test, preds)), 4),
                }
            )
        top_metric = min(experiments, key=lambda item: item["rmse"])
        task_type = "regression"

    return {
        "task_type": task_type,
        "target_col": target_col,
        "experiments": experiments,
        "best_model": top_metric,
    }
