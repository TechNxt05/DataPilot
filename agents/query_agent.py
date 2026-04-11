from llm.model_router import query_llm

def generate_query(nl_query: str, db_type: str, schema: dict) -> str:
    """Uses LLM to generate SQL or Mongo query based on user's natural language input."""
    system_prompt = f"""You are the Query Generation Agent.
    Your job is to convert natural language into a database query.
    Target DB: {db_type.upper()}
    Dataset Schema: {schema}
    
    If Target DB is SQL (Postgres, MySQL, SQLite), return only plain text SQL. Do not include formatting backticks or explanation.
    If Target DB is MONGO, return only a valid JSON array representing the aggregation pipeline. Do not include formatting backticks or explanation.
    """
    
    response = query_llm(system_prompt, nl_query)
    
    # Simple formatting cleanup just in case
    clean_resp = response.strip()
    if clean_resp.startswith("```sql"):
        clean_resp = clean_resp.replace("```sql", "").replace("```", "").strip()
    elif clean_resp.startswith("```json"):
        clean_resp = clean_resp.replace("```json", "").replace("```", "").strip()
    elif clean_resp.startswith("```"):
        clean_resp = clean_resp.replace("```", "").strip()
        
    return clean_resp
