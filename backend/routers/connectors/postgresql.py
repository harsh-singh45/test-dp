# backend/routers/connectors/postgresql.py

import pandas as pd
import uuid
from sqlalchemy import create_engine
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

import schemas.data_schemas as schemas
from core.database import get_db # <-- Make sure get_db is imported
from .file_upload import _register_dataframe_as_dataset

router = APIRouter(
    prefix="/connect/postgresql",
    tags=["Data Connectors"]
)

@router.post("/", response_model=schemas.DatasetSchema, summary="Connect to a PostgreSQL Database")
async def connect_postgresql(
    request: schemas.PostgresConnectionRequest, 
    db: Session = Depends(get_db) # <-- CORRECTED THIS LINE
):
    """
    Connects to a remote PostgreSQL database, inspects the specified table,
    and registers it as a new dataset.
    """
    try:
        # Construct the database URI from the request details
        db_uri = (
            f"postgresql+psycopg2://{request.user}:{request.password}@"
            f"{request.host}:{request.port}/{request.dbname}"
        )
        
        # Create a temporary engine to connect to the remote database
        remote_engine = create_engine(db_uri)

        # Check the connection and read the table into a pandas DataFrame
        with remote_engine.connect() as connection:
            df = pd.read_sql_table(request.table_name, connection)

        # Storing credentials for development. THIS IS INSECURE.
        connection_details = {
            "handler": "postgresql",
            "host": request.host,
            "port": request.port,
            "database": request.dbname,
            "table": request.table_name,
            "user": request.user,
            "password": request.password, # WARNING: Storing passwords is not secure.
        }

        # Use the shared helper function to register the dataset
        return _register_dataframe_as_dataset(
            df, 
            request.dataset_name, 
            "postgresql", 
            connection_details, 
            db
        )

    except Exception as e:
        # Catch common errors like connection failure, table not found, etc.
        raise HTTPException(status_code=500, detail=f"Failed to connect or process PostgreSQL source: {str(e)}")