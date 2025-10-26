# new-backend/routers/alert_router.py

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from core.database import get_db
from models.data_models import Alert, Budget # Import Budget to use it in the join
from schemas.data_schemas import AlertCreate, Alert as AlertSchema
from typing import List
from fastapi_mail import FastMail, MessageSchema
from models import data_models

router = APIRouter(
    prefix="/api/v1/alerts",
    tags=["alerts"],
)

async def send_alert_email(
    request: Request,
    recipient_email: str,
    dataset_name: str,
    spent_epsilon: float,
    total_epsilon: float,
    threshold: float
):
    """Sends a budget alert email."""
    percentage_spent = (spent_epsilon / total_epsilon) * 100
    html = f"""
    <html>
    <body>
        <h2>Privacy Budget Alert for Dataset: {dataset_name}</h2>
        <p>This is an automated alert to inform you that the privacy budget usage for the dataset <strong>{dataset_name}</strong> has exceeded the configured threshold of {threshold}%.</p>
        <ul>
            <li><strong>Current Epsilon Spent:</strong> {spent_epsilon:.4f}</li>
            <li><strong>Total Epsilon Budget:</strong> {total_epsilon}</li>
            <li><strong>Percentage Used:</strong> {percentage_spent:.2f}%</li>
        </ul>
        <p>Please review the recent queries on this dataset to manage the remaining budget effectively.</p>
    </body>
    </html>
    """

    message = MessageSchema(
        subject=f"DP Platform Alert: Budget Threshold Exceeded for {dataset_name}",
        recipients=[recipient_email],
        body=html,
        subtype="html"
    )

    fm = FastMail(request.app.state.mail_config)
    await fm.send_message(message)


@router.post("/", response_model=AlertSchema)
def create_alert(alert: AlertCreate, db: Session = Depends(get_db)):
    budget = db.query(Budget).filter(Budget.dataset_id == alert.dataset_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail=f"Budget for dataset_id {alert.dataset_id} not found.")

    db_alert = Alert(
        budget_id=budget.id,
        threshold=alert.threshold,
        email=alert.email
    )
    db.add(db_alert)
    log_entry = data_models.AuditLog(
        user="system",
        action="CREATE_ALERT",
        details=f"Alert created for dataset ID {alert.dataset_id} with threshold {alert.threshold}%.",
        status="SUCCESS",
        ip_address="127.0.0.1"
    )
    db.add(log_entry)
    db.commit()
    db.refresh(db_alert)
    return db_alert

# --- FIX START ---
# The query has been changed to correctly join the Alert and Budget tables
# and filter by the dataset_id on the Budget table.
@router.get("/{dataset_id}", response_model=List[AlertSchema])
def get_alerts_for_dataset(dataset_id: int, db: Session = Depends(get_db)):
    alerts = db.query(Alert).join(Budget).filter(Budget.dataset_id == dataset_id).all()
    return alerts
# --- FIX END ---

@router.delete("/{alert_id}", status_code=204)
def delete_alert(alert_id: int, db: Session = Depends(get_db)):
    db_alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if db_alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    db.delete(db_alert)
    db.commit()
    return None