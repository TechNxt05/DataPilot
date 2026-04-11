from pymongo import MongoClient
import pandas as pd
from utils.logger import get_logger

logger = get_logger("mongo_connector")

def load_from_mongodb(connection_string: str, database_name: str, collection_name: str, query: dict = None) -> pd.DataFrame:
    """Connects to a MongoDB database and extracts data into a DataFrame."""
    if query is None:
        query = {}
    try:
        client = MongoClient(connection_string)
        db = client[database_name]
        collection = db[collection_name]
        
        cursor = collection.find(query)
        df = pd.DataFrame(list(cursor))
        
        if '_id' in df.columns:
            # We can convert ObjectId to string or drop it
            df['_id'] = df['_id'].astype(str)
            
        logger.info(f"Successfully loaded {len(df)} records from MongoDB.")
        return df
    except Exception as e:
        logger.error(f"Error loading from MongoDB: {e}")
        raise
