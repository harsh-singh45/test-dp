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


class Budget(BaseModel):
    id: int
    dataset_id: int
    total_epsilon: float
    total_delta: float
    consumed_epsilon: float
    consumed_delta: float

    class Config:
        from_attributes = True


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
    threshold: float
    email: str

class AlertCreate(AlertBase):
    pass

class Alert(AlertBase):
    id: int
    budget_id: int
    triggered: bool

    class Config:
        from_attributes = True