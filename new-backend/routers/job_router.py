import os
import json
import pandas as pd
import numpy as np
import diffprivlib.mechanisms as dp_mech
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from typing import List

from core.database import get_db
from schemas import data_schemas
from models import data_models


router = APIRouter()


# --- THIS HELPER FUNCTION IS THE CORE FIX ---
# It correctly reads the dataset's source_type and uses the right
# method to load the data into a pandas DataFrame.
def get_dataframe_from_source(dataset: data_models.Dataset) -> pd.DataFrame:
    source_type = dataset.source_type
    conn_details = dataset.connection_details

    try:
        if source_type == "file_upload" or source_type == "csv":
            file_path = conn_details.get("path")
            if not file_path or not os.path.exists(file_path):
                raise FileNotFoundError(f"Data file not found at path: {file_path}")
            return pd.read_csv(file_path)

        elif source_type == "local_database":
            file_path = conn_details.get("path")
            table_name = conn_details.get("table")
            if not file_path or not os.path.exists(file_path):
                raise FileNotFoundError(f"Database file not found at path: {file_path}")
            if not table_name:
                raise ValueError("Table name not found in connection details for database.")
            
            engine = create_engine(f"sqlite:///{file_path}")
            with engine.connect() as connection:
                return pd.read_sql_table(table_name, connection)
        
        else:
            raise NotImplementedError(f"Data source type '{source_type}' is not supported.")

    except Exception as e:
        # Re-raise the exception to be handled by the main job logic
        raise e


def run_dp_calculation(query_type: str, mechanism: str, data: pd.Series, epsilon: float, delta: float):
    if data.empty:
        return {"private_value": 0, "actual_value": 0}

    actual_value = 0
    private_value = 0
    sensitivity = 1.0 # Default sensitivity for count

    # Determine sensitivity based on query type and data range
    if query_type.lower() in ['sum', 'mean', 'std']:
        min_val = data.min()
        max_val = data.max()
        if pd.isna(min_val) or pd.isna(max_val):
             raise ValueError("Min/max values for sensitivity calculation are null.")
        sensitivity = float(max_val - min_val)
    elif query_type.lower() == 'variance':
        min_val = data.min()
        max_val = data.max()
        if pd.isna(min_val) or pd.isna(max_val):
            raise ValueError("Min/max values for sensitivity calculation are null.")
        sensitivity = float((max_val - min_val) ** 2)

    # Select the correct DP mechanism
    if mechanism.lower() == 'laplace':
        dp_mechanism = dp_mech.Laplace(epsilon=epsilon, sensitivity=sensitivity)
    elif mechanism.lower() == 'gaussian':
        if not delta or delta <= 0:
            raise ValueError("Gaussian mechanism requires a non-zero delta.")
        dp_mechanism = dp_mech.Gaussian(epsilon=epsilon, delta=delta, sensitivity=sensitivity)
    else:
        raise HTTPException(status_code=400, detail=f"Mechanism '{mechanism}' not supported.")

    # Perform the calculation
    if query_type.lower() == 'count':
        actual_value = float(len(data))
        # Sensitivity for count is always 1, regardless of data range
        count_mechanism = dp_mech.Laplace(epsilon=epsilon, sensitivity=1)
        private_value = count_mechanism.randomise(actual_value)
    elif query_type.lower() == 'sum':
        actual_value = float(data.sum())
        private_value = dp_mechanism.randomise(actual_value)
    elif query_type.lower() == 'mean':
        actual_value = float(data.mean())
        private_value = dp_mechanism.randomise(actual_value)
    elif query_type.lower() == 'variance':
        actual_value = float(data.var())
        private_value = dp_mechanism.randomise(actual_value)
    elif query_type.lower() == 'std':
        actual_value = float(data.std())
        private_value = dp_mechanism.randomise(actual_value)
    elif query_type.lower() == 'histogram':
        sensitivity = 1
        if mechanism.lower() == 'laplace':
            dp_mechanism = dp_mech.Laplace(epsilon=epsilon, sensitivity=sensitivity)
        elif mechanism.lower() == 'gaussian':
            dp_mechanism = dp_mech.Gaussian(epsilon=epsilon, delta=delta, sensitivity=sensitivity)

        if pd.api.types.is_numeric_dtype(data):
            min_val, max_val = data.min(), data.max()
            counts, bin_edges = np.histogram(data, bins=10, range=(min_val, max_val))
            bin_labels = [f"{bin_edges[i]:.0f}-{bin_edges[i+1]:.0f}" for i in range(len(bin_edges)-1)]
            actual_histogram = dict(zip(bin_labels, counts.tolist()))
            private_histogram = {k: dp_mechanism.randomise(float(v)) for k, v in actual_histogram.items()}
        else:
            actual_counts = data.value_counts().to_dict()
            private_histogram = {k: dp_mechanism.randomise(v) for k, v in actual_counts.items()}
            actual_histogram = actual_counts
        
        return {"private_histogram": private_histogram, "actual_histogram": actual_histogram}
    else:
        raise HTTPException(status_code=400, detail=f"Query type '{query_type}' not supported.")

    return {"private_value": round(private_value, 2), "actual_value": round(actual_value, 2)}


@router.post("/api/jobs", response_model=data_schemas.Job, status_code=201)
def create_job(job_data: data_schemas.JobCreate, db: Session = Depends(get_db)):
    dataset = db.query(data_models.Dataset).filter(data_models.Dataset.id == job_data.dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    budget = db.query(data_models.Budget).filter(data_models.Budget.dataset_id == job_data.dataset_id).first()
    if not budget:
        raise HTTPException(status_code=400, detail="No budget found for this dataset.")
    
    job_delta = job_data.delta or 0.0

    if (budget.consumed_epsilon + job_data.epsilon) > budget.total_epsilon or \
       (budget.consumed_delta + job_delta) > budget.total_delta:
        raise HTTPException(status_code=400, detail="Privacy budget exceeded for epsilon or delta")

    new_job = data_models.Job(
        dataset_id=dataset.id,
        status="Running",
        query_type=f"{job_data.query_type.upper()} on {job_data.column_name}",
        epsilon=job_data.epsilon,
        delta=job_delta,
        mechanism=job_data.mechanism
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    try:
        df = get_dataframe_from_source(dataset)
        column_name = job_data.column_name
        if column_name not in df.columns:
            raise Exception(f"Column '{column_name}' not found in the dataset.")
        
        if job_data.query_type.lower() != 'histogram' and not pd.api.types.is_numeric_dtype(df[column_name]):
            raise Exception(f"Column '{column_name}' is not numeric and cannot be used for this query.")
        
        result_dict = run_dp_calculation(
            query_type=job_data.query_type,
            mechanism=job_data.mechanism,
            data=df[column_name].dropna(),
            epsilon=job_data.epsilon,
            delta=job_delta
        )

        new_job.status = "Completed"
        new_job.result = json.dumps(result_dict)
        budget.consumed_epsilon += job_data.epsilon
        budget.consumed_delta += job_delta
        db.commit()

        # --- NEW: Check for budget alerts ---
        percentage_epsilon_used = (budget.consumed_epsilon / budget.total_epsilon) * 100
        alerts = db.query(data_models.Alert).filter(data_models.Alert.budget_id == budget.id, data_models.Alert.triggered == False).all()
        for alert in alerts:
            if percentage_epsilon_used >= alert.threshold:
                # In a real application, you would send an email here.
                # For now, we'll print to the console to simulate the action.
                print(f"ALERT: Budget for dataset '{dataset.name}' has exceeded {alert.threshold}% threshold. Notifying {alert.email}.")
                alert.triggered = True
                db.commit()

        db.refresh(new_job)

    except Exception as e:
        new_job.status = "Failed"
        new_job.errors = str(e)
        db.commit()
        db.refresh(new_job)
        raise HTTPException(status_code=400, detail=str(e))

    response_schema = data_schemas.Job.from_orm(new_job)
    response_schema.dataset_name = dataset.name
    return response_schema


@router.get("/api/queries", response_model=List[data_schemas.Job])
def get_queries(db: Session = Depends(get_db)):
    jobs = db.query(data_models.Job).order_by(data_models.Job.id.desc()).all()
    job_schemas = []
    for job in jobs:
        job_schema = data_schemas.Job.from_orm(job)
        job_schema.dataset_name = job.dataset.name if job.dataset else "N/A"
        job_schemas.append(job_schema)
    return job_schemas


@router.get("/api/jobs/{job_id}", response_model=data_schemas.JobDetail)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(data_models.Job).filter(data_models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job_schema = data_schemas.JobDetail.from_orm(job)
    job_schema.dataset_name = job.dataset.name if job.dataset else "N/A"
    
    if job.result:
        try:
            job_schema.result = json.loads(job.result)
        except json.JSONDecodeError:
            job_schema.result = {"raw_result": job.result}
            
    return job_schema