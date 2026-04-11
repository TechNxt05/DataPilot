from fastapi import FastAPI, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import json
import uvicorn

from core.pipeline import DataPilotPipeline
from connectors.file_loader import load_file_into_dataframe
from database.mongodb import connect_to_mongo, close_mongo_connection

app = FastAPI(title="DataPilot AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pipeline = DataPilotPipeline()

@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()

from connectors.mongo_connector import load_from_mongodb
from connectors.sql_connector import load_from_sql

@app.post("/api/preview_data")
async def preview_data_endpoint(
    source_type: str = Form("file"),
    file: UploadFile = File(None),
    db_uri: str = Form(None),
    db_name: str = Form(None),
    db_col: str = Form(None),
    sql_query: str = Form(None)
):
    try:
        if source_type == "file" and file:
            df = load_file_into_dataframe(file)
        elif source_type == "mongo" and db_uri:
            df = load_from_mongodb(db_uri, db_name, db_col)
        elif source_type == "sql" and db_uri:
            df = load_from_sql(db_uri, sql_query)
        else:
            return {"error": "Invalid source data"}
            
        preview = df.head(50).fillna("").to_dict(orient="records")
        schema = {col: str(df[col].dtype) for col in df.columns}
        return {"data": preview, "schema": schema, "total_rows": len(df), "total_cols": len(df.columns)}
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/process_file")
async def process_file_endpoint(
    prompt: str = Form(...),
    source_type: str = Form("file"),
    file: UploadFile = File(None),
    db_uri: str = Form(None),
    db_name: str = Form(None),
    db_col: str = Form(None),
    sql_query: str = Form(None)
):
    try:
        if source_type == "file" and file:
            df = load_file_into_dataframe(file)
        elif source_type == "mongo" and db_uri:
            df = load_from_mongodb(db_uri, db_name, db_col)
        elif source_type == "sql" and db_uri:
            df = load_from_sql(db_uri, sql_query)
        else:
            return {"error": "Invalid source data"}
        
        # Execute pipeline
        result = await pipeline.process_request(prompt, df)
        
        # Streamlit handling: if we return a DF, we might need to serialize it
        # Since this API might be called from Streamlit which acts as frontend,
        # we actually bypass the HTTP API for Streamlit direct internal calls to Pipeline
        # but for REST completeness:
        if "cleaned_df" in result.get("data", {}):
             result["data"]["cleaned_df"] = result["data"]["cleaned_df"].to_dict(orient="records")
             
        if "charts" in result.get("data", {}):
            serializable_charts = {}
            for k, fig in result["data"]["charts"].items():
                serializable_charts[k] = json.loads(fig.to_json())
            result["data"]["charts"] = serializable_charts
            
        return result
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
