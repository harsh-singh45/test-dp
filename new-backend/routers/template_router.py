from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from schemas import data_schemas
from models import data_models

router = APIRouter(
    prefix="/api/templates",
    tags=["Query Templates"],
)

@router.post("/", response_model=data_schemas.QueryTemplate, status_code=201)
def create_template(template: data_schemas.QueryTemplateCreate, db: Session = Depends(get_db)):
    db_template = data_models.QueryTemplate(**template.dict())
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

@router.get("/", response_model=List[data_schemas.QueryTemplate])
def get_templates(db: Session = Depends(get_db)):
    return db.query(data_models.QueryTemplate).order_by(data_models.QueryTemplate.name).all()

@router.put("/{template_id}", response_model=data_schemas.QueryTemplate)
def update_template(template_id: int, template_update: data_schemas.QueryTemplateUpdate, db: Session = Depends(get_db)):
    db_template = db.query(data_models.QueryTemplate).filter(data_models.QueryTemplate.id == template_id).first()
    if not db_template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    for key, value in template_update.dict().items():
        setattr(db_template, key, value)
        
    db.commit()
    db.refresh(db_template)
    return db_template

@router.delete("/{template_id}", status_code=204)
def delete_template(template_id: int, db: Session = Depends(get_db)):
    db_template = db.query(data_models.QueryTemplate).filter(data_models.QueryTemplate.id == template_id).first()
    if not db_template:
        raise HTTPException(status_code=404, detail="Template not found")
    db.delete(db_template)
    db.commit()
    return None