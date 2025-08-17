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

    # --- New Detailed Metadata Fields ---
    privacy_unit_key = Column(String, default="user_id")
    l0_sensitivity = Column(Integer, default=12) # Partitions per user
    linf_sensitivity = Column(Integer, default=1) # Rows per partition per user
    
    @property
    def connection_details(self):
        return json.loads(self._connection_details)

    @connection_details.setter
    def connection_details(self, value):
        self._connection_details = json.dumps(value)

    columns = relationship("Column", back_populates="dataset")

class Column(Base):
    """SQLAlchemy model for the 'columns' table with detailed metadata."""
    __tablename__ = "columns"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    dtype = Column(String)
    
    # --- New Detailed Metadata Fields ---
    min_val = Column(Float, nullable=True)
    max_val = Column(Float, nullable=True)
    clamp = Column(Boolean, default=True)
    is_pii = Column(Boolean, default=False)
    is_categorical = Column(Boolean, default=False)
    
    dataset_id = Column(String, ForeignKey("datasets.id"))
    dataset = relationship("Dataset", back_populates="columns")

