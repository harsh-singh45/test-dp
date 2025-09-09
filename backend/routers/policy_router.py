# backend/routers/policy_router.py

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

import schemas.data_schemas as schemas
import models.data_models as models
from core.database import get_db

router = APIRouter(
    prefix="/policy",
    tags=["Policy & Guardrails"]
)

def get_policy(db: Session) -> models.Policy:
    """Helper function to get the current policy, creating it if it doesn't exist."""
    policy = db.query(models.Policy).first()
    if not policy:
        # We ensure there's only ever one policy row with a fixed ID.
        policy = models.Policy(id=1)
        db.add(policy)
        db.commit()
        db.refresh(policy)
    return policy

@router.get("/", response_model=schemas.PolicySchema, summary="Get the current global policy")
async def read_policy(db: Session = Depends(get_db)):
    """
    Retrieves the current organization-wide privacy guardrails.
    """
    return get_policy(db)

@router.put("/", response_model=schemas.PolicySchema, summary="Update the global policy")
async def update_policy(
    request: schemas.PolicyUpdateRequest,
    db: Session = Depends(get_db)
):
    """
    Updates the organization-wide privacy guardrails.
    """
    if request.max_epsilon_per_job <= 0:
        raise HTTPException(status_code=400, detail="Maximum epsilon must be greater than zero.")
    
    policy = get_policy(db)
    policy.max_epsilon_per_job = request.max_epsilon_per_job
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return policy