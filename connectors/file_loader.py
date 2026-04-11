import pandas as pd
import io
from fastapi import UploadFile

def load_file_into_dataframe(file: UploadFile) -> pd.DataFrame:
    """Reads various file formats and converts them into a Pandas DataFrame."""
    filename = file.filename.lower()
    contents = file.file.read()
    
    if filename.endswith('.csv'):
        return pd.read_csv(io.BytesIO(contents))
    elif filename.endswith('.xlsx') or filename.endswith('.xls'):
        return pd.read_excel(io.BytesIO(contents))
    elif filename.endswith('.json'):
        # using lines=True for JSON lines, but fallback to regular if it fails
        try:
            return pd.read_json(io.BytesIO(contents))
        except ValueError:
            return pd.read_json(io.BytesIO(contents), lines=True)
    elif filename.endswith('.parquet'):
        return pd.read_parquet(io.BytesIO(contents))
    else:
        raise ValueError(f"Unsupported file format: {filename}")
