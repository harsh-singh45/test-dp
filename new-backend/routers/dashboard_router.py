# new-backend/routers/dashboard_router.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.database import get_db
from schemas import data_schemas
from models import data_models

router = APIRouter()

@router.get("/api/dashboard/kpis", response_model=data_schemas.DashboardKpis)
def get_kpis(db: Session = Depends(get_db)):
    # For Phase 1, we return default/empty values.
    # In the future, this will be calculated from the database.
    total_queries = db.query(data_models.Job).count()
    total_datasets = db.query(data_models.Dataset).count()
    
    # Placeholder logic for epsilon spent
    epsilon_spent = sum(j.epsilon for j in db.query(data_models.Job).all() if j.epsilon)

    recent_jobs = db.query(data_models.Job).order_by(data_models.Job.id.desc()).limit(5).all()

    # Convert Job models to Job schemas
    recent_queries_schemas = [
        data_schemas.Job.from_orm(job) for job in recent_jobs
    ]

    return data_schemas.DashboardKpis(
        total_queries=total_queries,
        total_datasets=total_datasets,
        epsilon_spent=epsilon_spent,
        queries_by_type={"count": 0, "sum": 0, "mean": 0}, # Placeholder
        recent_queries=recent_queries_schemas
    )