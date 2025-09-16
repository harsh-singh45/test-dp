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

    file_path = ""
    try:
        file_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}_{file.filename}")
        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())

        df = pd.read_csv(file_path)

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

        # --- THIS IS THE CRITICAL FIX ---
        # It now correctly loops through the dataframe columns and saves
        # them to the database, associated with the new dataset.
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
        # --- END OF FIX ---

        # Create a default budget for the new dataset
        new_budget = data_models.Budget(dataset_id=new_dataset.id, total_epsilon=10.0)
        db.add(new_budget)
        
        # Commit the new columns and the new budget
        db.commit()

        # Eagerly load the columns so they are included in the response
        db.refresh(new_dataset, with_for_update=True)

        return new_dataset
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")

