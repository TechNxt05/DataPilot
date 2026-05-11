from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import json
import uvicorn
import asyncio

from core.pipeline import DataPilotPipeline
from core.ads_orchestrator import ADSOrchestrator
from core.memory import memory_store
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
ads_orchestrator = ADSOrchestrator()

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


@app.post("/api/ads/preview_data")
async def ads_preview_data_endpoint(
    source_type: str = Form("file"),
    file: UploadFile = File(None),
    db_uri: str = Form(None),
    db_name: str = Form(None),
    db_col: str = Form(None),
    sql_query: str = Form(None),
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

        memory = memory_store.create_session()
        memory_store.upsert_dataset(memory.session_id, df)
        preview = df.head(50).fillna("").to_dict(orient="records")
        schema = {col: str(df[col].dtype) for col in df.columns}
        return {
            "session_id": memory.session_id,
            "data": preview,
            "schema": schema,
            "total_rows": len(df),
            "total_cols": len(df.columns),
        }
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


@app.post("/api/ads/run")
async def ads_run_endpoint(
    session_id: str = Form(...),
    prompt: str = Form(...),
    sql_connection_string: str = Form(None),
):
    memory = memory_store.get_session(session_id)
    if memory is None or memory.dataframe is None:
        return {"error": "Invalid or expired session. Preview data again."}

    response = await ads_orchestrator.run(
        session_id=session_id,
        user_query=prompt,
        df=memory.dataframe,
        sql_connection_string=sql_connection_string,
    )
    return response.model_dump()


@app.get("/api/ads/stream")
async def ads_stream_endpoint(
    session_id: str,
    prompt: str,
    sql_connection_string: str = "",
):
    memory = memory_store.get_session(session_id)
    if memory is None or memory.dataframe is None:
        async def invalid_stream():
            yield "data: " + json.dumps({"type": "error", "payload": "Invalid session"}) + "\n\n"
        return StreamingResponse(invalid_stream(), media_type="text/event-stream")

    queue: asyncio.Queue = asyncio.Queue()

    def push(event):
        queue.put_nowait(event)

    async def event_generator():
        run_task = asyncio.create_task(
            ads_orchestrator.run(
                session_id=session_id,
                user_query=prompt,
                df=memory.dataframe,
                sql_connection_string=sql_connection_string or None,
                stream_callback=push,
            )
        )
        while True:
            if run_task.done() and queue.empty():
                result = run_task.result().model_dump()
                yield "data: " + json.dumps({"type": "final", "payload": result}) + "\n\n"
                break
            try:
                event = await asyncio.wait_for(queue.get(), timeout=0.5)
                yield "data: " + json.dumps(event) + "\n\n"
            except asyncio.TimeoutError:
                continue

    return StreamingResponse(event_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
