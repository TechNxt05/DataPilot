from database.mongodb import get_db
import datetime
from utils.logger import get_logger

logger = get_logger("feature_request_agent")

async def log_feature_request(feature_name: str, description: str, user_prompt: str, dataset_type: str = "unknown"):
    """Logs an unmet requirement to MongoDB Atlas."""
    db = get_db()
    if db is None:
        logger.warning("No DB connection to log feature request.")
        return

    req_doc = {
        "feature_name": feature_name,
        "description": description,
        "user_prompt": user_prompt,
        "dataset_type": dataset_type,
        "timestamp": datetime.datetime.utcnow(),
        "status": "pending"
    }

    try:
        await db.feature_requests.insert_one(req_doc)
        logger.info(f"Logged feature request for: {feature_name}")
    except Exception as e:
        logger.error(f"Failed to insert feature request: {e}")
