import os
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import datetime

from core.database import get_db
from models import data_models
from schemas import data_schemas

router = APIRouter()

REPORTS_DIR = "generated_reports"
os.makedirs(REPORTS_DIR, exist_ok=True)

@router.get("/", response_model=List[data_schemas.Report])
def get_reports(db: Session = Depends(get_db)):
    return db.query(data_models.Report).order_by(data_models.Report.created_at.desc()).all()

@router.post("/", response_model=data_schemas.Report)
def generate_report(report_in: data_schemas.ReportCreate, db: Session = Depends(get_db)):
    df = pd.DataFrame()

    # --- THIS IS THE FIX: Conditional logic for report types ---
    if report_in.type == 'Query Performance':
        jobs = db.query(data_models.Job).filter(data_models.Job.dataset_id.in_(report_in.dataset_ids)).all()
        if not jobs:
            raise HTTPException(status_code=404, detail="No job data found for the selected datasets.")
        
        report_data = [{
            "job_id": j.id, "dataset_id": j.dataset_id, "status": j.status,
            "query_type": j.query_type, "epsilon": j.epsilon, "delta": j.delta,
            "created_at": j.created_at.isoformat()
        } for j in jobs]
        df = pd.DataFrame(report_data)

    elif report_in.type == 'Budget Analysis':
        budgets = db.query(data_models.Budget, data_models.Dataset.name.label("dataset_name"))\
            .join(data_models.Dataset, data_models.Budget.dataset_id == data_models.Dataset.id)\
            .filter(data_models.Budget.dataset_id.in_(report_in.dataset_ids)).all()
        
        if not budgets:
            raise HTTPException(status_code=404, detail="No budget data found for the selected datasets.")

        report_data = [{
            "dataset_name": name, "total_epsilon": b.total_epsilon, "consumed_epsilon": b.consumed_epsilon,
            "remaining_epsilon": b.total_epsilon - b.consumed_epsilon, "total_delta": b.total_delta,
            "consumed_delta": b.consumed_delta, "remaining_delta": b.total_delta - b.consumed_delta
        } for b, name in budgets]
        df = pd.DataFrame(report_data)

    elif report_in.type == 'Mechanism Usage Summary':
        jobs = db.query(data_models.Job).filter(data_models.Job.dataset_id.in_(report_in.dataset_ids)).all()
        if not jobs:
            raise HTTPException(status_code=404, detail="No job data found for mechanism analysis.")
            
        mechanism_data = [j.mechanism for j in jobs if j.mechanism]
        if not mechanism_data:
            raise HTTPException(status_code=404, detail="No jobs with mechanism information found.")
        
        mechanism_counts = pd.Series(mechanism_data).value_counts().reset_index()
        mechanism_counts.columns = ['mechanism', 'count']
        df = mechanism_counts
        
    else:
        raise HTTPException(status_code=400, detail="Invalid report type specified.")

    # --- File saving logic (unchanged) ---
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_name = "".join(c if c.isalnum() else "_" for c in report_in.name)
    file_name = f"{safe_name}_{timestamp}.csv"
    file_path = os.path.join(REPORTS_DIR, file_name)
    
    df.to_csv(file_path, index=False)
    
    file_size_kb = os.path.getsize(file_path) / 1024

    db_report = data_models.Report(
        name=report_in.name,
        type=report_in.type,
        file_path=file_path,
        size_kb=round(file_size_kb, 2)
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    return db_report

@router.get("/{report_id}/download")
def download_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(data_models.Report).filter(data_models.Report.id == report_id).first()
    if not report or not os.path.exists(report.file_path):
        raise HTTPException(status_code=404, detail="Report file not found.")
        
    return FileResponse(path=report.file_path, filename=os.path.basename(report.file_path), media_type='text/csv')