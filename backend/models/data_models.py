# backend/models/data_models.py

import datetime
import json
from sqlalchemy import Column, String, Integer, DateTime, Text, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship

from core.database import Base

class Dataset(Base):
    """SQLAlchemy model for the 'datasets' table with detailed metadata."""
    __tablename__ = "datasets"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    source_type = Column(String)
    _connection_details = Column("connection_details", Text, default='{}')
    row_count = Column(Integer)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    privacy_unit_key = Column(String, default="user_id")
    l0_sensitivity = Column(Integer, default=12)
    linf_sensitivity = Column(Integer, default=1)
    
    @property
    def connection_details(self):
        return json.loads(self._connection_details)

    @connection_details.setter
    def connection_details(self, value):
        self._connection_details = json.dumps(value)

    columns = relationship("DatasetColumn", back_populates="dataset")

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
    
    dataset_id = Column(String, ForeignKey("datasets.id"))
    dataset = relationship("Dataset", back_populates="columns")

class Job(Base):
    """SQLAlchemy model for the 'jobs' table."""
    __tablename__ = "jobs"

    id = Column(String, primary_key=True, index=True)
    status = Column(String, default="running")
    epsilon = Column(Float)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    dataset_id = Column(String, ForeignKey("datasets.id"))
    
    # NEW: Link to the budget ledger
    budget_id = Column(String, ForeignKey("budgets.id"), nullable=True)
    budget = relationship("Budget")

    results = relationship("JobResult", back_populates="job")

class JobResult(Base):
    """SQLAlchemy model for the results of a DP job."""
    __tablename__ = "job_results"

    id = Column(Integer, primary_key=True, index=True)
    analysis_type = Column(String)
    column_name = Column(String)
    result = Column(Text) 
    job_id = Column(String, ForeignKey("jobs.id"))

    job = relationship("Job", back_populates="results")

class Budget(Base):
    """SQLAlchemy model for privacy budget ledgers."""
    __tablename__ = "budgets"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    epsilon_allocated = Column(Float)
    # NEW: Track epsilon spending
    epsilon_spent = Column(Float, default=0.0)
    period = Column(String, default="monthly")

# --- NEW MODEL FOR POLICY/GUARDRAILS ---
class Policy(Base):
    """SQLAlchemy model for storing global privacy guardrails."""
    __tablename__ = "policy"

    id = Column(Integer, primary_key=True) # Simple primary key for a single-row table
    max_epsilon_per_job = Column(Float, default=2.0)
    # Future guardrails like max_epsilon_per_month can be added here