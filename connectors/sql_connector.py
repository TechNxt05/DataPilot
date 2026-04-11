import pandas as pd
import sqlite3
from sqlalchemy import create_engine
from utils.logger import get_logger

logger = get_logger("sql_connector")

def load_from_sql(connection_string: str, query: str) -> pd.DataFrame:
    """Connects to a SQL database (postgres, mysql, sqlite) and extracts data into a DataFrame."""
    try:
        # Check if it's a direct sqlite filepath instead of an sqlalchemy connection string
        if connection_string.endswith('.sqlite') or connection_string.endswith('.db'):
            conn = sqlite3.connect(connection_string)
            df = pd.read_sql_query(query, conn)
            conn.close()
        else:
            engine = create_engine(connection_string)
            df = pd.read_sql(query, engine)
            
        logger.info(f"Successfully loaded {len(df)} records from SQL Database.")
        return df
    except Exception as e:
        logger.error(f"Error loading from SQL DB: {e}")
        raise
