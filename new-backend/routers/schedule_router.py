import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from models import data_models
from schemas import data_schemas

router = APIRouter(
    prefix="/api/schedules",
    tags=["Report Schedules"],
)

@router.post("/", response_model=data_schemas.ReportSchedule, status_code=201)
def create_schedule(schedule: data_schemas.ReportScheduleCreate, db: Session = Depends(get_db)):
    # Convert list of dataset IDs to a JSON string for storage
    dataset_ids_str = json.dumps(schedule.dataset_ids)
    db_schedule = data_models.ReportSchedule(
        name=schedule.name,
        report_type=schedule.report_type,
        dataset_ids_json=dataset_ids_str,
        frequency=schedule.frequency
    )
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    
    # For the response, convert the JSON string back to a list
    response_schedule = data_schemas.ReportSchedule(
        id=db_schedule.id,
        name=db_schedule.name,
        report_type=db_schedule.report_type,
        dataset_ids=json.loads(db_schedule.dataset_ids_json),
        frequency=db_schedule.frequency,
        created_at=db_schedule.created_at
    )
    return response_schedule


@router.get("/", response_model=List[data_schemas.ReportSchedule])
def get_schedules(db: Session = Depends(get_db)):
    db_schedules = db.query(data_models.ReportSchedule).order_by(data_models.ReportSchedule.created_at.desc()).all()
    # Convert each schedule's dataset_ids_json back to a list for the response
    schedules = []
    for s in db_schedules:
        schedules.append(data_schemas.ReportSchedule(
            id=s.id,
            name=s.name,
            report_type=s.report_type,
            dataset_ids=json.loads(s.dataset_ids_json),
            frequency=s.frequency,
            created_at=s.created_at
        ))
    return schedules

@router.delete("/{schedule_id}", status_code=204)
def delete_schedule(schedule_id: int, db: Session = Depends(get_db)):
    db_schedule = db.query(data_models.ReportSchedule).filter(data_models.ReportSchedule.id == schedule_id).first()
    if not db_schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    db.delete(db_schedule)
    db.commit()
    return None