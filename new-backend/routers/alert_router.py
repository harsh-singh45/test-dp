from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from models import data_models
from schemas import data_schemas

router = APIRouter()

@router.post("/api/budgets/{budget_id}/alerts", response_model=data_schemas.Alert, status_code=201)
def create_alert_for_budget(budget_id: int, alert: data_schemas.AlertCreate, db: Session = Depends(get_db)):
    # Optional: Check if an alert already exists and update it, or allow multiple.
    # For simplicity, we'll just create a new one.
    db_alert = data_models.Alert(**alert.model_dump(), budget_id=budget_id)
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

@router.get("/api/budgets/{budget_id}/alerts", response_model=List[data_schemas.Alert])
def get_alerts_for_budget(budget_id: int, db: Session = Depends(get_db)):
    alerts = db.query(data_models.Alert).filter(data_models.Alert.budget_id == budget_id).all()
    return alerts

@router.delete("/api/alerts/{alert_id}", status_code=204)
def delete_alert(alert_id: int, db: Session = Depends(get_db)):
    db_alert = db.query(data_models.Alert).filter(data_models.Alert.id == alert_id).first()
    if db_alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    db.delete(db_alert)
    db.commit()
    return None