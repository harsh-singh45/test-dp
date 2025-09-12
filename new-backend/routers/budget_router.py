# new-backend/routers/budget_router.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from schemas import data_schemas
from models import data_models

router = APIRouter()


@router.get("/api/budgets", response_model=List[data_schemas.Budget])
def get_budgets(db: Session = Depends(get_db)):
    budgets = db.query(data_models.Budget).all()
    return budgets


@router.post("/api/budgets", response_model=data_schemas.Budget, status_code=201)
def create_budget(budget_data: data_schemas.BudgetCreate, db: Session = Depends(get_db)):
    existing_budget = db.query(data_models.Budget).filter(data_models.Budget.dataset_id == budget_data.dataset_id).first()
    if existing_budget:
        raise HTTPException(status_code=400, detail="Budget for this dataset already exists")

    new_budget = data_models.Budget(
        dataset_id=budget_data.dataset_id,
        total_epsilon=budget_data.total_epsilon,
        consumed_epsilon=0.0
    )
    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)
    return new_budget


@router.post("/api/budgets/{budget_id}/reset", response_model=data_schemas.Budget)
def reset_budget(budget_id: int, db: Session = Depends(get_db)):
    budget = db.query(data_models.Budget).filter(data_models.Budget.id == budget_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    
    budget.consumed_epsilon = 0.0
    db.commit()
    db.refresh(budget)
    return budget


@router.get("/api/privacy_budget", response_model=data_schemas.PrivacyBudget)
def get_privacy_budget(db: Session = Depends(get_db)):
    all_budgets = db.query(data_models.Budget).all()

    total_budget = sum(b.total_epsilon for b in all_budgets)
    used_budget = sum(b.consumed_epsilon for b in all_budgets)

    remaining_budget = total_budget - used_budget
    percentage_used = (used_budget / total_budget * 100) if total_budget > 0 else 0

    dataset_budgets = [
        data_schemas.DatasetBudget(
            name=b.dataset.name if b.dataset else "Unknown",
            budget_used=b.consumed_epsilon
        ) for b in all_budgets
    ]

    return data_schemas.PrivacyBudget(
        total_budget=total_budget,
        used_budget=round(used_budget, 2),
        remaining_budget=round(remaining_budget, 2),
        percentage_used=round(percentage_used, 2),
        datasets=dataset_budgets
    )