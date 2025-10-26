from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from models import data_models
from schemas import data_schemas

router = APIRouter()

@router.get("/audit-logs", response_model=List[data_schemas.AuditLog])
def get_audit_logs(db: Session = Depends(get_db)):
    """
    Retrieve all audit logs, sorted by most recent.
    """
    return db.query(data_models.AuditLog).order_by(data_models.AuditLog.timestamp.desc()).all()