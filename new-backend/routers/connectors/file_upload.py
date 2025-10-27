import os
import uuid
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.orm import Session

from core.database import get_db
from models import data_models
from schemas import data_schemas

router = APIRouter()

UPLOAD_DIR = "uploaded_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/api/connect/file-upload", response_model=data_schemas.Dataset, status_code=201)
def upload_file(
    db: Session = Depends(get_db),
    file: UploadFile = File(...),
    dataset_name: str = Form(...)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file type. Only CSV files are supported.")

    # --- START OF FIX ---
    # Check if a dataset with this name already exists
    existing_dataset = db.query(data_models.Dataset).filter(data_models.Dataset.name == dataset_name).first()

    file_path = ""
    try:
        file_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}_{file.filename}")
        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())

        df = pd.read_csv(file_path)

        if existing_dataset:
            # If it's a schema-only import, update it.
            if existing_dataset.status == "Schema Imported (No Data)":
                # Validate columns
                schema_columns = {col.name for col in existing_dataset.columns}
                uploaded_columns = set(df.columns)
                if schema_columns != uploaded_columns:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Uploaded file columns do not match the imported schema. Expected: {schema_columns}, Got: {uploaded_columns}"
                    )
                
                # Update the existing dataset
                existing_dataset.description = f"Uploaded CSV file: {file.filename}"
                existing_dataset.source_type = "file_upload"
                existing_dataset.connection_details = {"path": os.path.abspath(file_path)}
                existing_dataset.total_records = len(df)
                existing_dataset.row_count = len(df)
                existing_dataset.status = "Available" # Update status

                
                db.commit()
                db.refresh(existing_dataset)
                return existing_dataset
            else:
                # If it's a fully registered dataset, throw an error.
                raise HTTPException(status_code=400, detail=f"Dataset with name '{dataset_name}' already exists.")
        
        # If no existing dataset, create a new one as before
        new_dataset = data_models.Dataset(
            name=dataset_name,
            description=f"Uploaded CSV file: {file.filename}",
            source_type="file_upload",
            connection_details={"path": os.path.abspath(file_path)},
            total_records=len(df),
            row_count=len(df)
        )
        db.add(new_dataset)
        db.commit()
        db.refresh(new_dataset)

        for col_name in df.columns:
            column_data = df[col_name].dropna()
            is_numeric = pd.api.types.is_numeric_dtype(column_data)
            
            db_column = data_models.DatasetColumn(
                dataset_id=new_dataset.id,
                name=col_name,
                dtype=str(column_data.dtype),
                min_val=float(column_data.min()) if is_numeric and not column_data.empty else None,
                max_val=float(column_data.max()) if is_numeric and not column_data.empty else None,
                is_pii='id' in col_name.lower() or 'email' in col_name.lower()
            )
            db.add(db_column)
        
        settings = db.query(data_models.Settings).first()
        default_epsilon = settings.global_epsilon if settings else 10.0

        new_budget = data_models.Budget(dataset_id=new_dataset.id, total_epsilon=default_epsilon)
        db.add(new_budget)
        
        log_entry = data_models.AuditLog(
            user="system",
            action="CREATE_DATASET",
            details=f"Dataset '{file.filename}' created from file upload.",
            status="SUCCESS",
            ip_address="127.0.0.1"
        )
        db.add(log_entry)
        db.commit()

        db.refresh(new_dataset, with_for_update=True)
        return new_dataset
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        # Re-raise HTTPException to show the user, otherwise raise a generic 500
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")
    # --- END OF FIX ---