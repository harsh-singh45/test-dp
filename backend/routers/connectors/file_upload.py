# backend/routers/connectors/file_upload.py

import pandas as pd
import io
import uuid
import os
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from datetime import datetime

import schemas.data_schemas as schemas
import models.data_models as models
from core.database import get_db

router = APIRouter(
    prefix="/connect/file-upload",
    tags=["Data Connectors"]
)

# Define the directory to store uploaded files
UPLOAD_DIRECTORY = "uploaded_files"
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)


@router.post("/", response_model=schemas.DatasetSchema, summary="Connect via CSV File Upload")
async def connect_file_upload(
    dataset_name: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file type. Only CSV files are supported.")
    
    try:
        # Generate a unique filename to prevent overwrites
        unique_filename = f"{uuid.uuid4()}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIRECTORY, unique_filename)

        # Save the file to the persistent store
        with open(file_path, "wb") as buffer:
            contents = await file.read()
            buffer.write(contents)
        
        # Now, read the saved file into a DataFrame for schema inference
        df = pd.read_csv(file_path)
        
        # Store the unique path, not the original filename
        connection_details = {"file_path": file_path, "original_filename": file.filename, "handler": "file_upload"}

        return _register_dataframe_as_dataset(df, dataset_name, "file_upload", connection_details, db)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file upload: {str(e)}")


def _register_dataframe_as_dataset(df: pd.DataFrame, name: str, source_type: str, conn_details: dict, db: Session):
    """
    Helper function to register a dataset from a pandas DataFrame,
    now with detailed metadata inference.
    """
    try:
        dataset_id = str(uuid.uuid4())
        db_dataset = models.Dataset(
            id=dataset_id,
            name=name,
            source_type=source_type,
            connection_details=conn_details,
            row_count=len(df),
            created_at=datetime.utcnow(),
            privacy_unit_key="user_id",
            l0_sensitivity=12,
            linf_sensitivity=1
        )
        db.add(db_dataset)

        for col_name in df.columns:
            column_data = df[col_name].dropna()
            is_numeric = pd.api.types.is_numeric_dtype(column_data)
            is_categorical = column_data.nunique() < 50 and not pd.api.types.is_datetime64_any_dtype(column_data)

            db_column = models.DatasetColumn(
                name=col_name,
                dtype=str(column_data.dtype),
                dataset_id=dataset_id,
                min_val=float(column_data.min()) if is_numeric else None,
                max_val=float(column_data.max()) if is_numeric else None,
                clamp=is_numeric,
                is_pii='id' in col_name.lower() or 'email' in col_name.lower(),
                is_categorical=is_categorical
            )
            db.add(db_column)
        
        db.commit()
        db.refresh(db_dataset)
        
        return db_dataset
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to save dataset to registry: {str(e)}")