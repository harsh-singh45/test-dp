from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.database import get_db
from models import data_models
from schemas import data_schemas

router = APIRouter()


@router.get("/api/settings", response_model=data_schemas.Settings)
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(data_models.Settings).first()
    if not settings:
        settings = data_models.Settings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.put("/api/settings", response_model=data_schemas.Settings)
def update_settings(settings_data: data_schemas.SettingsUpdate, db: Session = Depends(get_db)):
    settings = db.query(data_models.Settings).first()
    if not settings:
        settings = data_models.Settings()
        db.add(settings)

    for field, value in settings_data.dict().items():
        setattr(settings, field, value)

    db.commit()
    db.refresh(settings)
    return settings