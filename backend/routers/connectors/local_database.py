# backend/routers/connectors/local_database.py

import pandas as pd
import uuid
import os
import tempfile
from sqlalchemy import create_engine, inspect
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from datetime import datetime

import schemas.data_schemas as schemas
import models.data_models as models
from core.database import get_db
# Import the updated helper function from the file_upload router
from .file_upload import _register_dataframe_as_dataset

router = APIRouter(
    prefix="/connect/local-database",
    tags=["Data Connectors"]
)

@router.post("/", response_model=schemas.DatasetSchema, summary="Connect via Database Upload")
async def connect_local_database_upload(
    dataset_name: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Connects to a data source by uploading a database file (e.g., SQLite),
    inspects its first table, and registers it as a new dataset.
    """
    tmp_path = None
    temp_engine = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".db") as tmp:
            contents = await file.read()
            tmp.write(contents)
            tmp_path = tmp.name

        temp_engine = create_engine(f"sqlite:///{tmp_path}")
        inspector = inspect(temp_engine)
        
        table_names = inspector.get_table_names()
        if not table_names:
            raise HTTPException(status_code=400, detail="No tables found in the uploaded database file.")
        
        table_to_scan = table_names[0]
        
        df = pd.read_sql_table(table_to_scan, temp_engine)
        
        connection_details = {"filename": file.filename, "handler": "database_upload", "table": table_to_scan}

        return _register_dataframe_as_dataset(df, dataset_name, "database_upload", connection_details, db)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process the uploaded database: {str(e)}")
    finally:
        if temp_engine:
            temp_engine.dispose()
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)

