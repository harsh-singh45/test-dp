# backend/routers/budget_router.py

import uuid
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

import schemas.data_schemas as schemas
import models.data_models as models
from core.database import get_db

router = APIRouter(
    prefix="/budgets",
    tags=["Budget Manager"]
)

@router.post("/", response_model=schemas.BudgetSchema, summary="Create a new privacy budget ledger")
async def create_budget(
    request: schemas.BudgetCreateRequest,
    db: Session = Depends(get_db)
):
    """
    Creates a new budget for tracking epsilon usage.
    """
    db_budget = models.Budget(
        id=str(uuid.uuid4()),
        name=request.name,
        epsilon_allocated=request.epsilon_allocated,
        period=request.period
    )
    db.add(db_budget)
    try:
        db.commit()
        db.refresh(db_budget)
        return db_budget
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to create budget. A budget with this name may already exist. Error: {e}")


@router.get("/", response_model=List[schemas.BudgetSchema], summary="List all privacy budgets")
async def list_budgets(db: Session = Depends(get_db)):
    """
    Retrieves all privacy budget ledgers from the database.
    """
    budgets = db.query(models.Budget).all()
    return budgets

# --- NEW ENDPOINT FOR BUDGET RESET ---
@router.put("/{budget_id}/reset", response_model=schemas.BudgetSchema, summary="Reset a budget's spent epsilon")
async def reset_budget(
    budget_id: str,
    db: Session = Depends(get_db)
):
    """
    Resets the epsilon_spent for a specific budget back to 0.
    This would typically be done at the start of a new period (e.g., a new month).
    """
    budget = db.query(models.Budget).filter(models.Budget.id == budget_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found.")
    
    budget.epsilon_spent = 0.0
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget