from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from core.database import get_db
from schemas import data_schemas
from models import data_models
from routers.job_router import get_dataframe_from_source

import pandas as pd

router = APIRouter()

@router.get("/api/datasets", response_model=List[data_schemas.Dataset])
def get_datasets(db: Session = Depends(get_db)):
    """
    Retrieves all datasets.
    
    THE FIX: `options(joinedload(data_models.Dataset.budget))` tells SQLAlchemy 
    to perform a JOIN and fetch the related Budget object for each dataset in a 
    single, efficient query. This is the key change that populates the `budget` 
    field in the API response.
    """
    datasets = db.query(data_models.Dataset).options(
        joinedload(data_models.Dataset.budget)
    ).order_by(data_models.Dataset.id.desc()).all()
    return datasets


@router.get("/api/datasets/{dataset_id}", response_model=data_schemas.Dataset)
def get_dataset(dataset_id: int, db: Session = Depends(get_db)):
    """
    Retrieves a single dataset, also ensuring its budget information is included.
    """
    dataset = db.query(data_models.Dataset).options(
        joinedload(data_models.Dataset.budget)
    ).filter(data_models.Dataset.id == dataset_id).first()
    
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return dataset


@router.delete("/api/datasets/{dataset_id}", status_code=204)
def delete_dataset(dataset_id: int, db: Session = Depends(get_db)):
    """
    Deletes a dataset. The `cascade` setting in the database model ensures 
    that its related budget, columns, and jobs are also automatically deleted.
    """
    dataset = db.query(data_models.Dataset).filter(data_models.Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    db.delete(dataset)
    db.commit()
    return None

@router.get("/api/datasets/{dataset_id}/preview")
def get_dataset_preview(dataset_id: int, db: Session = Depends(get_db)):
    """
    Returns metadata and the first 10 rows for a dataset with data, 
    or just the schema information for a schema-only import.
    """
    dataset = db.query(data_models.Dataset).options(
        joinedload(data_models.Dataset.columns)
    ).filter(data_models.Dataset.id == dataset_id).first()

    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    # --- START OF FIX ---
    # If the dataset is just a schema, return the metadata without data rows.
    if dataset.source_type == "schema_import":
        return {
            "metadata": {
                "id": dataset.id,
                "name": dataset.name,
                "description": dataset.description,
                "sourceType": dataset.source_type,
                "columns": [{"name": col.name, "dtype": col.dtype} for col in dataset.columns],
            },
            "previewRows": [] # Return an empty array for the preview
        }
    # --- END OF FIX ---

    try:
        df = get_dataframe_from_source(dataset)
        # Replace NaN, inf, -inf with None for JSON serialization
        df = df.replace([float('inf'), float('-inf')], pd.NA)
        df = df.where(pd.notnull(df), pd.NA)
        # Convert all missing values to None for JSON
        preview_rows = df.head(10).fillna(value=pd.NA).replace({pd.NA: None}).to_dict(orient="records")
        
        for row in preview_rows:
            for k, v in row.items():
                if isinstance(v, float) and (pd.isna(v) or v in [float('inf'), float('-inf')]):
                    row[k] = None
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")

    return {
        "metadata": {
            "id": dataset.id,
            "name": dataset.name,
            "description": dataset.description,
            "sourceType": getattr(dataset, "source_type", "file_upload"),
            "columns": df.columns.tolist(),
        },
        "previewRows": preview_rows
    }

@router.put("/api/datasets/{dataset_id}", response_model=data_schemas.Dataset)
def update_dataset(dataset_id: int, dataset_update: data_schemas.DatasetUpdate, db: Session = Depends(get_db)):
    """
    Updates a dataset's name and description.
    """
    db_dataset = db.query(data_models.Dataset).filter(data_models.Dataset.id == dataset_id).first()
    if not db_dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    # If the name is being changed, check if the new name is already taken.
    if dataset_update.name != db_dataset.name:
        existing_dataset = db.query(data_models.Dataset).filter(data_models.Dataset.name == dataset_update.name).first()
        if existing_dataset:
            raise HTTPException(status_code=400, detail=f"A dataset with the name '{dataset_update.name}' already exists.")

    # Update the dataset fields
    db_dataset.name = dataset_update.name
    db_dataset.description = dataset_update.description
    
    # Add an audit log for the update action
    log_entry = data_models.AuditLog(
        user="system",
        action="UPDATE_DATASET",
        details=f"Dataset ID {dataset_id} was updated. New name: '{dataset_update.name}'.",
        status="SUCCESS",
        ip_address="127.0.0.1" # Placeholder IP
    )
    db.add(log_entry)
    
    db.commit()
    db.refresh(db_dataset)
    return db_dataset