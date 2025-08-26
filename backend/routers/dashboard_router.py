# backend/routers/dashboard_router.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

import schemas.data_schemas as schemas
import models.data_models as models
from core.database import get_db

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

@router.get("/kpis", response_model=schemas.DashboardKPISchema, summary="Get main dashboard KPIs")
async def get_dashboard_kpis(db: Session = Depends(get_db)):
    """
    Calculates and returns the key performance indicators for the main dashboard.
    """
    now = datetime.utcnow()
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    twenty_four_hours_ago = now - timedelta(hours=24)

    # Calculate total epsilon spent this month from successful jobs
    total_epsilon_spent_monthly_result = db.query(func.sum(models.Job.epsilon)).filter(
        models.Job.status == "completed",
        models.Job.created_at >= start_of_month
    ).scalar()
    total_epsilon_spent_monthly = total_epsilon_spent_monthly_result or 0.0

    # Calculate average epsilon per job
    avg_epsilon_per_job_result = db.query(func.avg(models.Job.epsilon)).filter(
        models.Job.status == "completed"
    ).scalar()
    avg_epsilon_per_job = avg_epsilon_per_job_result or 0.0

    # Get job counts for the last 24 hours
    jobs_total_24h = db.query(models.Job).filter(models.Job.created_at >= twenty_four_hours_ago).count()
    jobs_completed_24h = db.query(models.Job).filter(
        models.Job.status == "completed",
        models.Job.created_at >= twenty_four_hours_ago
    ).count()
    jobs_failed_24h = db.query(models.Job).filter(
        models.Job.status == "failed",
        models.Job.created_at >= twenty_four_hours_ago
    ).count()

    # Get the 5 most recent jobs
    recent_jobs = db.query(models.Job).order_by(models.Job.created_at.desc()).limit(5).all()

    return schemas.DashboardKPISchema(
        total_epsilon_spent_monthly=total_epsilon_spent_monthly,
        avg_epsilon_per_job=avg_epsilon_per_job,
        jobs_total_24h=jobs_total_24h,
        jobs_completed_24h=jobs_completed_24h,
        jobs_failed_24h=jobs_failed_24h,
        recent_jobs=recent_jobs
    )