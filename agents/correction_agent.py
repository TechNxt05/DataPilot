import pandas as pd
import numpy as np

def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Fixes missing values, removes duplicates, handles types."""
    df_clean = df.copy()

    # 1. Drop duplicates
    if df_clean.duplicated().sum() > 0:
        df_clean.drop_duplicates(inplace=True)

    # 2. Impute missing values
    for col in df_clean.columns:
        if df_clean[col].isnull().sum() > 0:
            if pd.api.types.is_numeric_dtype(df_clean[col]):
                # Median for numeric
                df_clean[col].fillna(df_clean[col].median(), inplace=True)
            elif pd.api.types.is_object_dtype(df_clean[col]):
                # Mode for categorical/text
                if not df_clean[col].mode().empty:
                    df_clean[col].fillna(df_clean[col].mode()[0], inplace=True)
                else:
                    df_clean[col].fillna("Unknown", inplace=True)

    # 3. Standardize dates string to datetime if possible
    for col in df_clean.select_dtypes(include=['object']):
        if df_clean[col].str.match(r'^\d{4}-\d{2}-\d{2}').any() or 'date' in col.lower():
            try:
                df_clean[col] = pd.to_datetime(df_clean[col])
            except (ValueError, TypeError):
                pass
                
    return df_clean
