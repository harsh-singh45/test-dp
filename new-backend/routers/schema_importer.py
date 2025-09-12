# backend/routers/schema_importer.py
# new router file dedicated to handling the schema import logic. It contains a single endpoint that accepts a JSON payload, validates it, and creates a new dataset entry.

import uuid
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime

import schemas.data_schemas as schemas
import models.data_models as models
from core.database import get_db

router = APIRouter(
    prefix="/datasets",
    tags=["Dataset Registry"] # Use the same tag to group with other dataset operations
)

@router.post("/import-schema", response_model=schemas.DatasetSchema, summary="Import a dataset schema from a JSON definition")
async def import_schema(
    request: schemas.SchemaImportRequest, 
    db: Session = Depends(get_db)
):
    """
    Registers a new dataset from a predefined schema without connecting to the data.
    This creates a placeholder in the registry that can be connected later.
    """
    try:
        dataset_id = str(uuid.uuid4())
        
        # Create the dataset record with placeholder details
        db_dataset = models.Dataset(
            id=dataset_id,
            name=request.dataset_name,
            source_type="schema_import",
            connection_details={"status": "pending_connection"},
            row_count=0,
            created_at=datetime.utcnow()
        )
        db.add(db_dataset)

        if not request.columns:
            raise HTTPException(status_code=400, detail="Schema must contain at least one column.")

        for col in request.columns:
            # UPDATED: Use models.DatasetColumn
            db_column = models.DatasetColumn(
                name=col.name,
                dtype=col.dtype,
                dataset_id=dataset_id
            )
            db.add(db_column)
        
        db.commit()
        db.refresh(db_dataset)
        
        return db_dataset

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to import schema: {str(e)}")