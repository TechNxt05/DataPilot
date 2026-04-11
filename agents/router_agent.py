import json
import logging
from llm.model_router import query_llm
from utils.logger import get_logger

logger = get_logger("router_agent")

def route_query(user_prompt: str) -> dict:
    """Uses LLM to determine the user's intent."""
    system_prompt = """You are the Router Agent for DataPilot AI.
    Your job is to determine the intent of the user's prompt related to dataset operations.
    Valid intents are:
    - "clean": clean this dataset, remove nulls, etc.
    - "visualize": show me a chart, plot trends.
    - "analyze": give me insights, correlation, stats.
    - "ml": run machine learning, predict, classify, cluster, detect outliers.
    - "query": write a SQL or MongoDB query.
    - "suggest": suggest ML tasks, capability mapping.
    - "unsupported": anything else, unrelated tasks, deep learning requests, API integrations, poems, etc.
    
    Must return strictly a JSON object with 'intent' and 'details' keys.
    Example: {"intent": "clean", "details": "User requested dataset cleaning"}
    """
    
    try:
        response = query_llm(system_prompt, user_prompt)
        # Attempt to parse json
        # Since LLMs can sometimes add markdown block around json
        if "```json" in response:
            clean_resp = response.split("```json")[-1].split("```")[0].strip()
            return json.loads(clean_resp)
        elif "```" in response:
            clean_resp = response.split("```")[-1].split("```")[0].strip()
            return json.loads(clean_resp)
        return json.loads(response)
    except Exception as e:
        logger.error(f"Router fails to parse LLM intent: {e}")
        # Default to a safe fallback
        return {"intent": "unsupported", "details": str(response)}
