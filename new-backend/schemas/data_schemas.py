from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

# Corrected to exactly match the fields in models.data_models.DatasetColumn
class DatasetColumn(BaseModel):
    name: str
    dtype: str # CORRECTED: Was 'data_type'
    min_val: Optional[float] = None
    max_val: Optional[float] = None
    clamp: bool
    is_pii: bool # CORRECTED: Was 'pii'
    is_categorical: bool

    class Config:
        from_attributes = True


class Budget(BaseModel):
    id: int
    dataset_id: int
    total_epsilon: float
    total_delta: float
    consumed_epsilon: float
    consumed_delta: float

    class Config:
        from_attributes = True
        

# Corrected to exactly match the fields in models.data_models.Dataset
class Dataset(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    source_type: str
    total_records: Optional[int] = None
    row_count: Optional[int] = None
    created_at: datetime
    columns: List[DatasetColumn] = []
    status: str
    budget: Optional[Budget] = None # This will hold the nested budget object

    class Config:
        from_attributes = True


# Corrected to exactly match the fields in models.data_models.Job
class Job(BaseModel):
    id: int
    dataset_name: str = "N/A"
    status: str
    query_type: str
    created_at: datetime
    epsilon: float # CORRECTED: Was 'epsilon_spent'
    result: Optional[str] = None
    errors: Optional[str] = None
    delta: Optional[float] = 0.0

    class Config:
        from_attributes = True

# This schema is now correctly aligned with the Job schema
class JobDetail(Job):
    pass



class Policy(BaseModel):
    max_epsilon_per_job: float
    # default_delta is not in your model, so it is removed here

    class Config:
        from_attributes = True


class DatasetBudget(BaseModel):
    id: int
    name: str
    budget_used: float
    delta_used: float = 0.0
    total_epsilon: float 
    total_delta: float   


class PrivacyBudget(BaseModel):
    total_budget: float
    used_budget: float
    remaining_budget: float
    percentage_used: float
    total_delta: float 
    used_delta: float 
    remaining_delta: float 
    percentage_used_delta: float 
    datasets: List[DatasetBudget] = []


class DashboardKpis(BaseModel):
    total_queries: int
    total_datasets: int
    epsilon_spent: float
    queries_by_type: dict
    recent_queries: List[Job]


class JobCreate(BaseModel):
    dataset_id: int
    query_type: str
    epsilon: float
    delta: Optional[float] = None
    mechanism: str
    column_name: str


class BudgetCreate(BaseModel):
    dataset_id: int
    total_epsilon: float


class PolicyUpdate(BaseModel):
    max_epsilon_per_job: float

class BudgetUpdate(BaseModel):
    epsilon_to_add: float
    delta_to_add: float


class AlertBase(BaseModel):
    dataset_id: int  # Frontend will send the dataset_id
    threshold: float # FIX: Renamed from budget_threshold to match the model
    email: str

class AlertCreate(AlertBase):
    pass

class Alert(BaseModel): # FIX: Modified to reflect the actual model structure
    id: int
    budget_id: int
    threshold: float
    email: str
    triggered: bool

    class Config:
        from_attributes = True


class AuditLog(BaseModel):
    id: int
    timestamp: datetime
    user: str
    action: str
    details: str
    status: str       
    ip_address: str   

    class Config:
        from_attributes = True

class Report(BaseModel):
    id: int
    name: str
    type: str
    file_path: str
    size_kb: float
    created_at: datetime

    class Config:
        from_attributes = True

class ReportCreate(BaseModel):
    name: str
    type: str
    dataset_ids: List[int] # A list of dataset IDs to include in the report


class SimulationCreate(BaseModel):
    dataset_id: int
    column_name: str
    query_type: str
    mechanism: str
    epsilon: float
    queries: int
    sensitivity: float
    delta: Optional[float] = 0.0

class SimulationResult(BaseModel):
    true_result: float
    dp_result: float
    epsilon: float
    delta: Optional[float]
    mechanism: str
    query_type: str
    column_name: str


class Settings(BaseModel):
    global_epsilon: float
    default_mechanism: str
    auto_backup: bool
    budget_alerts: bool
    alert_threshold: int
    log_retention: int
    max_concurrent_queries: int

    class Config:
        from_attributes = True


class SettingsUpdate(BaseModel):
    global_epsilon: float
    default_mechanism: str
    auto_backup: bool
    budget_alerts: bool
    alert_threshold: int
    log_retention: int
    max_concurrent_queries: int