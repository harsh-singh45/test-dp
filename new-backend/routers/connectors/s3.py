# backend/routers/connectors/s3.py

import pandas as pd
import uuid
import boto3
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime

import schemas.data_schemas as schemas
import models.data_models as models
from core.database import get_db
# Import the updated helper function
from .file_upload import _register_dataframe_as_dataset

router = APIRouter(
    prefix="/connect/s3",
    tags=["Data Connectors"]
)

@router.post("/", response_model=schemas.DatasetSchema, summary="Connect to a file in an AWS S3 Bucket")
async def connect_s3(
    request: schemas.S3ConnectionRequest, 
    db: Session = Depends(get_db)
):
    """
    Connects to an AWS S3 bucket (or a compatible service like MinIO),
    reads the specified CSV file, and registers it as a new dataset.
    """
    try:
        # Create a dictionary for the S3 client configuration
        s3_config = {
            'aws_access_key_id': request.aws_access_key_id,
            'aws_secret_access_key': request.aws_secret_access_key,
        }
        
        # If an endpoint_url is provided, use it (for MinIO)
        if request.endpoint_url:
            s3_config['endpoint_url'] = request.endpoint_url

        s3_client = boto3.client('s3', **s3_config)

        # Get the file object from S3
        response = s3_client.get_object(Bucket=request.bucket_name, Key=request.file_key)
        
        # Read the CSV file's content directly into a pandas DataFrame
        df = pd.read_csv(response.get("Body"))

        connection_details = {
            "handler": "s3",
            "bucket": request.bucket_name,
            "key": request.file_key,
        }

        # Use the shared helper function to register the dataset
        return _register_dataframe_as_dataset(
            df, 
            request.dataset_name, 
            "aws_s3", 
            connection_details, 
            db
        )

    except Exception as e:
        # This will catch common Boto3 errors like invalid credentials or file not found
        raise HTTPException(status_code=500, detail=f"Failed to connect or process S3 source: {str(e)}")

