# backend/schemas/data_schemas.py

from pydantic import BaseModel, ConfigDict
from typing import List, Dict, Any, Optional
import datetime
from enum import Enum

# --- Enums for API validation ---

class DPMetric(str, Enum):
    """Enumeration for the available differential privacy metrics."""
    count = "count"
    sum = "sum"
    mean = "mean"
    median = "median"
    variance = "variance"
    std = "std"
    min = "min"
    max = "max"
    histogram = "histogram"

# NEW: Enum for DP Mechanism
class DPMechanism(str, Enum):
    """Enumeration for the available differential privacy mechanisms."""
    laplace = "laplace"
    gaussian = "gaussian"
    exponential = "exponential"

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

# --- Schemas for Phase 2 ---

class JobCreateRequest(BaseModel):
    """Defines the request body for creating a new DP Job."""
    dataset_id: str
    metrics: List[DPMetric]
    epsilon: float
    columns: Optional[List[str]] = None
    # NEW: Link to a budget
    budget_id: Optional[str] = None
    # NEW: Add mechanism and delta
    mechanism: DPMechanism = DPMechanism.laplace
    delta: Optional[float] = None


class JobResultSchema(BaseModel):
    """API schema for a single job result."""
    analysis_type: str
    column_name: str
    result: Any
    model_config = ConfigDict(from_attributes=True)

class JobSchema(BaseModel):
    """API schema for a DP Job."""
    id: str
    status: str
    epsilon: float
    created_at: datetime.datetime
    dataset_id: str
    results: List[JobResultSchema] = []
    # NEW: Include budget_id in the response
    budget_id: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class JobPreviewRequest(BaseModel):
    """Defines the request body for the DP utility preview endpoint."""
    dataset_id: str
    metric: DPMetric
    epsilon: float
    column: str

class JobPreviewResponse(BaseModel):
    """Defines the response for the DP utility preview."""
    actual_value: float
    private_value: float
    epsilon: float
    column: str
    metric: str


# --- NEW SCHEMAS FOR BUDGET MANAGER ---

class BudgetSchema(BaseModel):
    """API schema for a privacy budget."""
    id: str
    name: str
    epsilon_allocated: float
    # NEW: Include epsilon_spent in the response
    epsilon_spent: float
    period: str
    model_config = ConfigDict(from_attributes=True)

class BudgetCreateRequest(BaseModel):
    """Request body for creating a new budget."""
    name: str
    epsilon_allocated: float
    period: str = "monthly"

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

# --- NEW SCHEMAS FOR DASHBOARD ---
class DashboardKPISchema(BaseModel):
    """API schema for the main dashboard KPIs."""
    total_epsilon_spent_monthly: float
    avg_epsilon_per_job: float
    jobs_total_24h: int
    jobs_completed_24h: int
    jobs_failed_24h: int
    recent_jobs: List[JobSchema] = []

class PolicySchema(BaseModel):
    """API schema for the global privacy policy."""
    max_epsilon_per_job: float
    model_config = ConfigDict(from_attributes=True)

class PolicyUpdateRequest(BaseModel):
    """Request body for updating the global policy."""
    max_epsilon_per_job: float

class AirbyteApplicationRequest(BaseModel):
    """Defines the request body for an Airbyte Cloud Application."""
    dataset_name: str
    airbyte_client_id: str
    airbyte_client_secret: str
    airbyte_connection_id: str
    db_host: str
    db_port: int = 5432
    db_user: str
    db_password: str
    db_name: str
    db_table: str