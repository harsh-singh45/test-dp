import uuid
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from core.database import get_db
import models.data_models as models
import schemas.data_schemas as schemas

router = APIRouter(
    prefix="/datasets",
    tags=["Dataset Management"]
)

@router.post("/import-schema", response_model=schemas.Dataset, summary="Import a dataset schema from a JSON definition")
def import_schema(
    request: schemas.SchemaImportRequest, 
    db: Session = Depends(get_db)
):
    """
    Registers a new dataset from a predefined schema without connecting to the data.
    This creates a placeholder in the registry that can be connected later.
    """
    # Check if a dataset with this name already exists
    existing_dataset = db.query(models.Dataset).filter(models.Dataset.name == request.dataset_name).first()
    if existing_dataset:
        raise HTTPException(status_code=400, detail=f"Dataset with name '{request.dataset_name}' already exists.")

    try:
        # Create the dataset record with placeholder details
        db_dataset = models.Dataset(
            name=request.dataset_name,
            description=request.meta.description if request.meta else None,
            source_type="schema_import",
            status="Schema Imported (No Data)", # Set the initial status
            connection_details={"status": "pending_connection"},
            row_count=0,
            total_records=0
        )
        db.add(db_dataset)
        db.flush() # Flush to get the ID for the columns

        if not request.columns:
            raise HTTPException(status_code=400, detail="Schema must contain at least one column.")

        for col in request.columns:
            db_column = models.DatasetColumn(
                name=col.name,
                dtype=col.type, # Map from 'type' in JSON to 'dtype' in DB
                dataset_id=db_dataset.id,
                # Set defaults for placeholder columns
                is_pii=False,
                clamp=False,
                is_categorical=False
            )
            db.add(db_column)

        # Get the default epsilon from global settings and create a budget
        settings = db.query(models.Settings).first()
        default_epsilon = settings.global_epsilon if settings else 10.0

        new_budget = models.Budget(
            dataset_id=db_dataset.id,
            total_epsilon=default_epsilon
        )
        db.add(new_budget)
        
        db.commit()
        db.refresh(db_dataset)
        
        return db_dataset

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to import schema: {str(e)}")