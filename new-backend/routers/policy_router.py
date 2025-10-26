# new-backend/routers/policy_router.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from schemas import data_schemas
from models import data_models

router = APIRouter()

@router.get("/api/policy", response_model=data_schemas.Policy)
def get_policy(db: Session = Depends(get_db)):
    policy = db.query(data_models.Policy).first()
    # If no policy exists, create a default one
    if not policy:
        policy = data_models.Policy(max_epsilon_per_job=1.0, default_delta=0.00001)
        db.add(policy)
        db.commit()
        db.refresh(policy)
    return policy

@router.put("/api/policy", response_model=data_schemas.Policy)
def update_policy(policy_data: data_schemas.PolicyUpdate, db: Session = Depends(get_db)):
    policy = db.query(data_models.Policy).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found. Please create one first.")
        
    policy.max_epsilon_per_job = policy_data.max_epsilon_per_job
    policy.default_delta = policy_data.default_delta
    db.commit()
    db.refresh(policy)
    return policy

# @router.post("/policies", response_model=data_schemas.Policy)
# def create_policy(policy: data_schemas.PolicyCreate, db: Session = Depends(get_db)):
#     """
#     Create a new policy.
#     """
#     db_policy = data_models.Policy(**policy.dict())
#     db.add(db_policy)

#     # Add an audit log entry
#     log_entry = data_models.AuditLog(
#         user="system",
#         action="create_policy",
#         details=f"Policy '{policy.name}' was created."
#     )
#     db.add(log_entry)

#     db.commit()
#     db.refresh(db_policy)
#     return db_policy