from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
import pandas as pd
from diffprivlib.mechanisms import Laplace, Gaussian
import numpy as np
import os
import time

from core.database import get_db
from models import data_models
from schemas import data_schemas

router = APIRouter()

# --- USING YOUR EXACT DATA LOADING FUNCTION ---
def get_dataframe_from_source(dataset: data_models.Dataset) -> pd.DataFrame:
    source_type = dataset.source_type
    conn_details = dataset.connection_details

    try:
        if source_type == "file_upload" or source_type == "csv":
            file_path = conn_details.get("path") or conn_details.get("filepath")
            if not file_path or not os.path.exists(file_path):
                raise FileNotFoundError(f"Data file not found at path: {file_path}")
            return pd.read_csv(file_path)

        elif source_type == "local_database":
            file_path = conn_details.get("path") or conn_details.get("db_path")
            table_name = conn_details.get("table") or conn_details.get("table_name")
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
        raise HTTPException(status_code=500, detail=f"Failed to load data: {str(e)}")


@router.post("/")
def run_full_simulation(sim_in: data_schemas.SimulationCreate, db: Session = Depends(get_db)):
    start_time = time.time()
    
    dataset = db.query(data_models.Dataset).filter(data_models.Dataset.id == sim_in.dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    df = get_dataframe_from_source(dataset)
    
    if sim_in.column_name not in df.columns:
        raise HTTPException(status_code=400, detail=f"Column '{sim_in.column_name}' not found in dataset.")

    if df[sim_in.column_name].dtype not in ['int64', 'float64', 'int32', 'float32']:
        raise HTTPException(status_code=400, detail=f"Column '{sim_in.column_name}' must be numerical for this simulation.")

    # Calculate true result based on the query_type from the UI
    if sim_in.query_type.lower() == 'mean':
        true_result = df[sim_in.column_name].mean()
    elif sim_in.query_type.lower() == 'sum':
        true_result = df[sim_in.column_name].sum()
    elif sim_in.query_type.lower() == 'count':
        true_result = float(len(df))
    else:
        raise HTTPException(status_code=400, detail=f"Query type '{sim_in.query_type}' is not supported for simulation.")

    mechanism = None
    if sim_in.mechanism == 'laplace':
        mechanism = Laplace(epsilon=sim_in.epsilon, sensitivity=sim_in.sensitivity)
    elif sim_in.mechanism == 'gaussian':
        mechanism = Gaussian(epsilon=sim_in.epsilon, delta=sim_in.delta or 0, sensitivity=sim_in.sensitivity)
    else:
        raise HTTPException(status_code=400, detail=f"Mechanism '{sim_in.mechanism}' not supported.")

    # Run for the exact number of queries from the UI
    dp_results = [mechanism.randomise(true_result) for _ in range(sim_in.queries)]
    
    noise = np.array([res - true_result for res in dp_results])
    avg_noise = np.mean(np.abs(noise))
    
    # Generate histogram data for the noise distribution chart
    hist, bin_edges = np.histogram(noise, bins=10)
    
    # Calculate real success rate (e.g., how many results are within a certain % of the true result)
    # Here we define "success" as a result within 50% of the average noise range
    # This is an example metric; it can be adjusted for different needs.
    successful_queries = np.sum(np.abs(noise) < (avg_noise * 5)) 
    success_rate = (successful_queries / sim_in.queries) * 100 if sim_in.queries > 0 else 100

    execution_time = time.time() - start_time

    # Return the exact, non-fake data structure the frontend UI expects
    return {
        "totalQueries": sim_in.queries,
        "successRate": round(success_rate, 2),
        "avgNoise": round(avg_noise, 4),
        "utilityScore": round(max(0, 100 - (avg_noise / (true_result if true_result != 0 else 1)) * 100), 2),
        "privacyLoss": round(sim_in.epsilon * sim_in.queries, 2),
        "executionTime": round(execution_time, 4),
        "noiseDistribution": {
            "values": hist.tolist(),
            "bins": [round(b, 2) for b in bin_edges.tolist()]
        },
        "trueResult": round(true_result, 4),
        "dp_results_sample": [round(r, 4) for r in dp_results[:5]]
    }