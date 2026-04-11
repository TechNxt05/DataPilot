import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from utils.logger import get_logger

load_dotenv()
logger = get_logger("database")

MONGODB_URI = os.getenv("MONGODB_URI")
client: AsyncIOMotorClient = None
db = None

async def connect_to_mongo():
    global client, db
    if MONGODB_URI and MONGODB_URI != "your_mongodb_connection_string_here":
        try:
            client = AsyncIOMotorClient(MONGODB_URI)
            db = client.datapilot
            logger.info("Connected to MongoDB Atlas successfully.")
        except Exception as e:
            logger.error(f"Could not connect to MongoDB: {e}")
    else:
        logger.warning("MONGODB_URI not found or not set properly. Running without persistent MongoDB logging.")

async def close_mongo_connection():
    global client
    if client:
        client.close()
        logger.info("MongoDB connection closed.")

def get_db():
    return db
