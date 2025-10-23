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

        # --- THIS IS THE CRITICAL FIX ---
        # It now correctly loops through the dataframe columns and saves them
        # to the database, associated with the new dataset.
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
                # Add other metadata fields from your model here if needed
                clamp=is_numeric,
                is_categorical=column_data.nunique() < 50
            )
            db.add(db_column)
        # --- END OF FIX ---
        
        settings = db.query(data_models.Settings).first()
        default_epsilon = settings.global_epsilon if settings else 10.0

        # Create a default budget for the new dataset
        new_budget = data_models.Budget(dataset_id=new_dataset.id, total_epsilon=default_epsilon)
        db.add(new_budget)

        log_entry = data_models.AuditLog(
            user="system",
            action="CREATE_DATASET",
            details=f"Dataset '{dataset_name}' created from local database connection.",
            status="SUCCESS", # Set a status
            ip_address="127.0.0.1" # Mock IP, replace with real one later
        )
        db.add(log_entry)


        # Commit the new columns and the new budget
        db.commit()
        
        # Eagerly load the columns so they are included in the API response
        db.refresh(new_dataset, with_for_update=True) 
        
        return new_dataset
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Failed to process database file: {str(e)}")
    finally:
        if temp_engine:
            temp_engine.dispose()

