# backend/routers/connectors/gcs.py

import pandas as pd
import uuid
import json
import io
from google.oauth2 import service_account
from google.cloud import storage
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime

import schemas.data_schemas as schemas
import models.data_models as models
from core.database import get_db
# Import the updated helper function
from .file_upload import _register_dataframe_as_dataset

router = APIRouter(
    prefix="/connect/gcs",
    tags=["Data Connectors"]
)

@router.post("/", response_model=schemas.DatasetSchema, summary="Connect to a file in Google Cloud Storage")
async def connect_gcs(
    request: schemas.GCSConnectionRequest, 
    db: Session = Depends(get_db)
):
    """
    Connects to Google Cloud Storage, reads the specified CSV file,
    and registers it as a new dataset.
    """
    try:
        # Load credentials from the provided JSON string
        credentials_info = json.loads(request.service_account_json)
        credentials = service_account.Credentials.from_service_account_info(credentials_info)
        
        # Create a GCS client
        storage_client = storage.Client(credentials=credentials)
        
        # Get the bucket and blob (file)
        bucket = storage_client.bucket(request.bucket_name)
        blob = bucket.blob(request.file_key)
        
        # Download the file's content as bytes
        content = blob.download_as_bytes()
        
        # Read the CSV content into a pandas DataFrame
        df = pd.read_csv(io.BytesIO(content))

        connection_details = {
            "handler": "gcs",
            "bucket": request.bucket_name,
            "key": request.file_key,
        }

        # Use the shared helper function to register the dataset
        return _register_dataframe_as_dataset(
            df, 
            request.dataset_name, 
            "google_cloud_storage", 
            connection_details, 
            db
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to connect or process GCS source: {str(e)}")

