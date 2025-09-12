import pandas as pd
import httpx
import time
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

import schemas.data_schemas as schemas
from core.database import get_db
from .file_upload import _register_dataframe_as_dataset

router = APIRouter(
    prefix="/connect/airbyte-application",
    tags=["Data Connectors"]
)

AIRBYTE_TOKEN_URL = "https://api.airbyte.com/v1/applications/token"
AIRBYTE_API_BASE = "https://api.airbyte.com/v1"

async def get_airbyte_access_token(client_id: str, client_secret: str) -> str:
    json_payload = {"client_id": client_id, "client_secret": client_secret}
    async with httpx.AsyncClient() as client:
        response = await client.post(AIRBYTE_TOKEN_URL, json=json_payload)
        if response.status_code != 200:
            raise HTTPException(status_code=401, detail=f"Could not authenticate with Airbyte. Check Client ID/Secret. Response: {response.text}")
        return response.json()["access_token"]

@router.post("/", response_model=schemas.DatasetSchema, summary="Connect via Airbyte Cloud Application")
async def connect_airbyte_application(request: schemas.AirbyteApplicationRequest, db: Session = Depends(get_db)):
    try:
        access_token = await get_airbyte_access_token(request.airbyte_client_id, request.airbyte_client_secret)
        headers = {"Authorization": f"Bearer {access_token}"}

        async with httpx.AsyncClient() as client:
            sync_response = await client.post(f"{AIRBYTE_API_BASE}/connections/{request.airbyte_connection_id}/sync", headers=headers)
            if sync_response.status_code != 204:
                raise HTTPException(status_code=sync_response.status_code, detail=f"Failed to trigger Airbyte sync. This is likely a permission issue. Ensure your user is an Organization Admin. Response: {sync_response.text}")
            time.sleep(30)

        db_uri = f"postgresql+psycopg2://{request.db_user}:{request.db_password}@{request.db_host}:{request.db_port}/{request.db_name}"
        engine = create_engine(db_uri)
        with engine.connect() as connection:
            df = pd.read_sql_table(request.db_table, connection)

        connection_details = {"handler": "airbyte_application", "connection_id": request.airbyte_connection_id}
        return _register_dataframe_as_dataset(df, request.dataset_name, "airbyte_cloud_app", connection_details, db)

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")