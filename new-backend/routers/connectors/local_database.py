import os
import uuid
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import Session

from core.database import get_db
from models import data_models
from schemas import data_schemas

router = APIRouter()

UPLOAD_DIR = "uploaded_files"

@router.post("/api/connect/local-database", response_model=data_schemas.Dataset, status_code=201)
def upload_database_file(
    db: Session = Depends(get_db),
    file: UploadFile = File(...),
    dataset_name: str = Form(...)
):
    if not file.filename.endswith(('.db', '.sqlite', '.sqlite3')):
        raise HTTPException(status_code=400, detail="Invalid file type. Only .db, .sqlite, or .sqlite3 files are supported.")

    # --- START OF FIX ---
    # Check if a dataset with this name already exists
    existing_dataset = db.query(data_models.Dataset).filter(data_models.Dataset.name == dataset_name).first()

    file_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}_{file.filename}")
    temp_engine = None

    try:
        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())

        temp_engine = create_engine(f"sqlite:///{file_path}")
        inspector = inspect(temp_engine)
        table_names = inspector.get_table_names()

        if not table_names:
            raise HTTPException(status_code=400, detail="No tables found in the uploaded database file.")
        
        table_to_read = table_names[0]
        df = pd.read_sql_table(table_to_read, temp_engine)

        if existing_dataset:
            if existing_dataset.status == "Schema Imported (No Data)":
                schema_columns = {col.name for col in existing_dataset.columns}
                uploaded_columns = set(df.columns)
                if schema_columns != uploaded_columns:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Uploaded DB columns do not match imported schema. Expected: {schema_columns}, Got: {uploaded_columns}"
                    )

                existing_dataset.description = f"Uploaded DB: {file.filename}, Table: {table_to_read}"
                existing_dataset.source_type = "local_database"
                existing_dataset.connection_details = {"path": os.path.abspath(file_path), "table": table_to_read}
                existing_dataset.total_records = len(df)
                existing_dataset.row_count = len(df)
                existing_dataset.status = "Available"
                
                db.commit()
                db.refresh(existing_dataset)
                return existing_dataset
            else:
                raise HTTPException(status_code=400, detail=f"Dataset with name '{dataset_name}' already exists.")

        new_dataset = data_models.Dataset(
            name=dataset_name,
            description=f"Uploaded DB: {file.filename}, Table: {table_to_read}",
            source_type="local_database",
            connection_details={"path": os.path.abspath(file_path), "table": table_to_read},
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
                is_pii='id' in col_name.lower() or 'email' in col_name.lower(),
                clamp=is_numeric,
                is_categorical=column_data.nunique() < 50
            )
            db.add(db_column)
        
        settings = db.query(data_models.Settings).first()
        default_epsilon = settings.global_epsilon if settings else 10.0

        new_budget = data_models.Budget(dataset_id=new_dataset.id, total_epsilon=default_epsilon)
        db.add(new_budget)

        log_entry = data_models.AuditLog(
            user="system",
            action="CREATE_DATASET",
            details=f"Dataset '{dataset_name}' created from local database connection.",
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
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Failed to process database file: {str(e)}")
    finally:
        if temp_engine:
            temp_engine.dispose()
    # --- END OF FIX ---