# new-backend/routers/dataset_router.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from schemas import data_schemas
from models import data_models
from models import data_models

router = APIRouter()

@router.get("/api/datasets", response_model=List[data_schemas.Dataset])
def get_datasets(db: Session = Depends(get_db)):
    datasets = db.query(data_models.Dataset).all()
    return datasets

@router.get("/api/datasets/{dataset_id}", response_model=data_schemas.Dataset)
def get_dataset(dataset_id: int, db: Session = Depends(get_db)):
    dataset = db.query(data_models.Dataset).filter(data_models.Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return dataset
