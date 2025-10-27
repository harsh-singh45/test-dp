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
    # Add an audit log entry
    dataset = db.query(data_models.Dataset).filter(data_models.Dataset.id == budget_data.dataset_id).first()
    log_entry = data_models.AuditLog(
        user="system",
        action="create_budget",
        details=f"Budget created for dataset '{dataset.name if dataset else 'N/A'}' with total epsilon {budget_data.total_epsilon}.",
        status="SUCCESS", ip_address="127.0.0.1"
    )
    db.add(log_entry)
    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)
    return new_budget


@router.put("/api/budgets/{budget_id}", response_model=data_schemas.Budget)
def update_budget(budget_id: int, budget_data: data_schemas.BudgetUpdate, db: Session = Depends(get_db)):
    budget = db.query(data_models.Budget).filter(data_models.Budget.id == budget_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    
    # Update fields from the request
    budget.total_epsilon += budget_data.epsilon_to_add
    budget.total_delta += budget_data.delta_to_add

    log_entry = data_models.AuditLog(
        user="system",
        action="BUDGET_ALLOCATED",
        details=f"Allocated to budget for dataset ID {budget.dataset_id}. Epsilon added: {budget_data.epsilon_to_add}, Delta added: {budget_data.delta_to_add}.",
        status="SUCCESS",
        ip_address="127.0.0.1"
    )
    db.add(log_entry)

    
    db.commit()
    db.refresh(budget)
    return budget


@router.post("/api/budgets/{budget_id}/reset", response_model=data_schemas.Budget)
def reset_budget(budget_id: int, db: Session = Depends(get_db)):
    budget = db.query(data_models.Budget).filter(data_models.Budget.id == budget_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    
    # Reset consumed values to zero
    budget.consumed_epsilon = 0.0
    budget.consumed_delta = 0.0 # <-- Also reset delta

    log_entry = data_models.AuditLog(
        user="system",
        action="BUDGET_RESET",
        details=f"Budget for dataset ID {budget.dataset_id} was reset.",
        status="SUCCESS",
        ip_address="127.0.0.1"
    )
    db.add(log_entry)
    db.commit()
    db.refresh(budget)
    return budget


@router.get("/api/privacy_budget", response_model=data_schemas.PrivacyBudget)
def get_privacy_budget(db: Session = Depends(get_db)):
    all_budgets = db.query(data_models.Budget).all()

    # Epsilon calculations
    total_budget = sum(b.total_epsilon for b in all_budgets)
    used_budget = sum(b.consumed_epsilon for b in all_budgets)

    remaining_budget = total_budget - used_budget
    percentage_used = (used_budget / total_budget * 100) if total_budget > 0 else 0

    # --- NEW: Delta calculations ---
    total_delta = sum(b.total_delta for b in all_budgets if b.total_delta)
    used_delta = sum(b.consumed_delta for b in all_budgets if b.consumed_delta)
    remaining_delta = total_delta - used_delta
    percentage_used_delta = (used_delta / total_delta * 100) if total_delta > 0 else 0

    dataset_budgets = [
        data_schemas.DatasetBudget(
            id=b.id,
            name=b.dataset.name if b.dataset else "Unknown",
            budget_used=b.consumed_epsilon,
            delta_used=b.consumed_delta, 
            total_epsilon=b.total_epsilon, 
            total_delta=b.total_delta      
        ) for b in all_budgets
    ]

    return data_schemas.PrivacyBudget(
        total_budget=total_budget,
        used_budget=round(used_budget, 4),
        remaining_budget=round(remaining_budget, 4),
        percentage_used=round(percentage_used, 2),
        total_delta=total_delta,
        used_delta=round(used_delta, 6),
        remaining_delta=round(remaining_delta, 6),
        percentage_used_delta=round(percentage_used_delta, 2),
        datasets=dataset_budgets
    )