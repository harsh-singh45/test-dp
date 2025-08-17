# backend/routers/dataset_router.py

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

import schemas.data_schemas as schemas
import models.data_models as models
from core.database import get_db

router = APIRouter(
    prefix="/datasets",
    tags=["Dataset Registry"]
)

@router.get("/", response_model=List[schemas.DatasetSchema], summary="List all registered datasets")
async def list_datasets(db: Session = Depends(get_db)):
    """
    Retrieves a list of all datasets from the SQLite database.
    """
    datasets = db.query(models.Dataset).all()
    return datasets

@router.get("/{dataset_id}", response_model=schemas.DatasetSchema, summary="Get a specific dataset by ID")
async def get_dataset(dataset_id: str, db: Session = Depends(get_db)):
    """
    Fetches a single dataset by its ID from the SQLite database.
    """
    dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    if dataset is None:
        raise HTTPException(status_code=404, detail=f"Dataset with ID '{dataset_id}' not found.")
    return dataset
