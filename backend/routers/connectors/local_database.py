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

# Use the same upload directory as the file_upload connector
UPLOAD_DIRECTORY = "uploaded_files"
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

@router.post("/", response_model=schemas.DatasetSchema, summary="Connect via Database Upload")
async def connect_local_database_upload(
    dataset_name: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Connects to a data source by uploading a database file (e.g., SQLite),
    inspects its first table, and registers it as a new dataset.
    The uploaded file is saved for future job processing.
    """
    
    # Generate a unique path for the uploaded database file
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIRECTORY, unique_filename)
    temp_engine = None

    try:
        # Save the uploaded file to our persistent storage
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)

        # Create an engine to inspect the saved database file
        temp_engine = create_engine(f"sqlite:///{file_path}")
        inspector = inspect(temp_engine)
        
        table_names = inspector.get_table_names()
        if not table_names:
            raise HTTPException(status_code=400, detail="No tables found in the uploaded database file.")
        
        table_to_scan = table_names[0]
        
        # Read the table for schema inference
        df = pd.read_sql_table(table_to_scan, temp_engine)
        
        # Store the persistent file path and table name for future jobs
        connection_details = {
            "file_path": file_path, 
            "original_filename": file.filename,
            "handler": "database_upload", 
            "table": table_to_scan
        }

        return _register_dataframe_as_dataset(df, dataset_name, "database_upload", connection_details, db)

    except Exception as e:
        # Clean up the saved file if an error occurs
        if os.path.exists(file_path):
            os.unlink(file_path)
        raise HTTPException(status_code=500, detail=f"Failed to process the uploaded database: {str(e)}")
    finally:
        if temp_engine:
            temp_engine.dispose()