# backend/schemas/data_schemas.py

from pydantic import BaseModel, ConfigDict
from typing import List, Dict, Any, Optional
import datetime

# --- API Schemas (for responses) ---

class ColumnSchema(BaseModel):
    """Defines the API schema for a single column with detailed metadata."""
    name: str
    dtype: str
    min_val: Optional[float] = None
    max_val: Optional[float] = None
    clamp: bool
    is_pii: bool
    is_categorical: bool
    model_config = ConfigDict(from_attributes=True)

class DatasetSchema(BaseModel):
    """Defines the API schema for a registered dataset with detailed metadata."""
    id: str
    name: str
    source_type: str
    connection_details: Dict[str, Any]
    row_count: int
    privacy_unit_key: str
    l0_sensitivity: int
    linf_sensitivity: int
    columns: List[ColumnSchema] = []
    created_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)

# --- Connector Schemas (for requests) ---

class PostgresConnectionRequest(BaseModel):
    """Defines the request body for the PostgreSQL connector."""
    dataset_name: str
    host: str
    port: int = 5432
    user: str
    password: str
    dbname: str
    table_name: str

class S3ConnectionRequest(BaseModel):
    """Defines the request body for the AWS S3 connector."""
    dataset_name: str
    aws_access_key_id: str
    aws_secret_access_key: str
    bucket_name: str
    file_key: str
    endpoint_url: Optional[str] = None

class GCSConnectionRequest(BaseModel):
    """Defines the request body for the Google Cloud Storage connector."""
    dataset_name: str
    bucket_name: str
    file_key: str
    service_account_json: str

# --- Schema Import Schema ---

class SchemaImportColumn(BaseModel):
    """Defines a single column within a schema import request."""
    name: str
    dtype: str

class SchemaImportRequest(BaseModel):
    """Defines the request body for the /import-schema endpoint."""
    dataset_name: str
    columns: List[SchemaImportColumn]

