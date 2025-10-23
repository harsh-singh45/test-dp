# new-backend/models/data_models.py (Your code, corrected and finalized)

import datetime
import json
from sqlalchemy import Column, String, Integer, DateTime, Text, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base # Using your existing Base

class Dataset(Base):
    __tablename__ = 'datasets'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, unique=True)
    description = Column(String, nullable=True)
    total_records = Column(Integer, nullable=True)
    source_type = Column(String)
    
    # This column is now guaranteed to be in the new database
    status = Column(String, default="Available")

    _connection_details = Column("connection_details", String)
    
    row_count = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    privacy_unit_key = Column(String, default="user_id")
    l0_sensitivity = Column(Integer, default=12)
    linf_sensitivity = Column(Integer, default=1)
    
    @property
    def connection_details(self):
        return json.loads(self._connection_details) if self._connection_details else {}

    @connection_details.setter
    def connection_details(self, value):
        self._connection_details = json.dumps(value)

    columns = relationship("DatasetColumn", back_populates="dataset", cascade="all, delete-orphan")
    jobs = relationship("Job", back_populates="dataset", cascade="all, delete-orphan")
    
    # This defines a one-to-one relationship to the Budget table
    budget = relationship("Budget", back_populates="dataset", uselist=False, cascade="all, delete-orphan")


class DatasetColumn(Base):
    """SQLAlchemy model for the 'columns' table with detailed metadata."""
    __tablename__ = "columns"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    dtype = Column(String)
    min_val = Column(Float, nullable=True)
    max_val = Column(Float, nullable=True)
    clamp = Column(Boolean, default=True)
    is_pii = Column(Boolean, default=False)
    is_categorical = Column(Boolean, default=False)
    dataset_id = Column(Integer, ForeignKey("datasets.id")) # Changed to Integer to match the primary key
    dataset = relationship("Dataset", back_populates="columns")


class Job(Base):
    __tablename__ = 'jobs'
    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey('datasets.id'))
    status = Column(String)
    query_type = Column(String)
    mechanism = Column(String, nullable=True)
    epsilon = Column(Float)
    delta = Column(Float, nullable=True, default=0.0)
    result = Column(String, nullable=True)
    errors = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow) # Corrected to match your version
    
    dataset = relationship("Dataset", back_populates="jobs")
    results = relationship("JobResult", back_populates="job") # Your original relationship


class JobResult(Base):
    """SQLAlchemy model for the results of a DP job."""
    __tablename__ = "job_results"
    id = Column(Integer, primary_key=True, index=True)
    analysis_type = Column(String)
    column_name = Column(String)
    result = Column(Text) 
    job_id = Column(Integer, ForeignKey("jobs.id")) # Changed to Integer to match the primary key
    job = relationship("Job", back_populates="results")


class Budget(Base):
    __tablename__ = 'budgets'
    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey('datasets.id'))
    total_epsilon = Column(Float)
    total_delta = Column(Float, default=5e-5)
    consumed_epsilon = Column(Float, default=0.0)
    consumed_delta = Column(Float, default=0.0)
    dataset = relationship("Dataset", back_populates="budget")


class Policy(Base):
    """SQLAlchemy model for storing global privacy guardrails."""
    __tablename__ = "policy"
    id = Column(Integer, primary_key=True)
    max_epsilon_per_job = Column(Float, default=2.0)


class Alert(Base):
    __tablename__ = 'alerts'
    id = Column(Integer, primary_key=True, index=True)
    budget_id = Column(Integer, ForeignKey('budgets.id'))
    threshold = Column(Float)  # e.g., 80.0 for 80%
    email = Column(String, nullable=False)
    triggered = Column(Boolean, default=False) # To avoid sending repeated alerts
    
    budget = relationship("Budget")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    user = Column(String)
    action = Column(String)
    details = Column(String)
    status = Column(String)       
    ip_address = Column(String)   


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    type = Column(String)  # e.g., 'Budget Analysis', 'Query Performance'
    file_path = Column(String) # Path to the generated CSV file
    size_kb = Column(Float)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Settings(Base):
    __tablename__ = 'settings'
    id = Column(Integer, primary_key=True, index=True)
    global_epsilon = Column(Float, default=10.0)
    default_mechanism = Column(String, default='laplace')
    auto_backup = Column(Boolean, default=True)
    budget_alerts = Column(Boolean, default=True)
    alert_threshold = Column(Integer, default=80)
    log_retention = Column(Integer, default=90)
    max_concurrent_queries = Column(Integer, default=10)