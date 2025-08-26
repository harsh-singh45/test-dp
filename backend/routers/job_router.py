# backend/routers/job_router.py

import uuid
import pandas as pd
import pydp as dp
import numpy as np
import os
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from sqlalchemy import create_engine
from typing import List, Optional
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg') # Use non-interactive backend
import io # Import io for streaming
from fastapi.responses import StreamingResponse # Import for file streaming
from sqlalchemy.orm import Session
from .policy_router import get_policy
import json

# --- Assume these imports for S3 and GCS would be added in a production scenario ---
# import boto3
# from google.cloud import storage
# from google.oauth2 import service_account

import schemas.data_schemas as schemas
import models.data_models as models
from core.database import get_db

router = APIRouter(
    prefix="/jobs",
    tags=["DP Jobs"]
)

def _get_dataframe_from_source(dataset: models.Dataset) -> pd.DataFrame:
    """
    Reconnects to a data source based on its stored connection details
    and fetches the data into a pandas DataFrame.
    """
    source_type = dataset.source_type
    details = dataset.connection_details

    try:
        if source_type == "file_upload":
            file_path = details.get("file_path")
            if not file_path or not os.path.exists(file_path):
                raise HTTPException(status_code=404, detail=f"File not found at path: {file_path}. The file may have been moved or deleted.")
            print(f"Reading real data from: {file_path}") # For debugging
            return pd.read_csv(file_path)

        elif source_type == "postgresql":
            password = details.get('password', '')
            user = details.get('user')
            host = details.get('host')
            port = details.get('port')
            database = details.get('database')
            table = details.get('table')

            if not all([user, host, port, database, table]):
                raise HTTPException(status_code=400, detail="PostgreSQL connection details are incomplete.")

            db_uri = f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{database}"
            
            remote_engine = create_engine(db_uri)
            with remote_engine.connect() as connection:
                print(f"Reading real data from PostgreSQL table: {table}") # For debugging
                return pd.read_sql_table(table, connection)
        
        elif source_type == "database_upload":
            file_path = details.get("file_path")
            table_name = details.get("table")
            if not file_path or not os.path.exists(file_path):
                raise HTTPException(status_code=404, detail=f"Database file not found at path: {file_path}.")
            if not table_name:
                raise HTTPException(status_code=400, detail="Table name not found in connection details.")
            
            engine = create_engine(f"sqlite:///{file_path}")
            with engine.connect() as connection:
                print(f"Reading real data from SQLite file: {file_path}, table: {table_name}") # For debugging
                return pd.read_sql_table(table_name, connection)
        
        elif source_type in ["aws_s3", "google_cloud_storage"]:
            raise HTTPException(
                status_code=501, 
                detail=f"Securely fetching data from '{source_type}' requires an IAM role or a credential management system, which is not yet implemented."
            )

        else:
            raise HTTPException(status_code=400, detail=f"Unknown data source type: '{source_type}'")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to connect or process data source '{source_type}': {str(e)}")


@router.post("/", response_model=schemas.JobSchema, summary="Create and run a new DP Job")
async def create_dp_job(
    request: schemas.JobCreateRequest,
    db: Session = Depends(get_db)
):
    """
    Creates and executes a new Differentially Private Job.
    """
    dataset = db.query(models.Dataset).filter(models.Dataset.id == request.dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")

    policy = get_policy(db)
    if request.epsilon > policy.max_epsilon_per_job:
        raise HTTPException(
            status_code=400,
            detail=f"Job epsilon ({request.epsilon}) exceeds the organization's maximum limit of {policy.max_epsilon_per_job}."
        )    
    budget = None
    if request.budget_id:
        budget = db.query(models.Budget).filter(models.Budget.id == request.budget_id).first()
        if not budget:
            raise HTTPException(status_code=404, detail=f"Budget with ID '{request.budget_id}' not found.")
        
        # Check if the job's epsilon exceeds the remaining budget
        if (budget.epsilon_spent + request.epsilon) > budget.epsilon_allocated:
            raise HTTPException(
                status_code=400, 
                detail=f"Job epsilon ({request.epsilon}) exceeds the remaining budget of {budget.epsilon_allocated - budget.epsilon_spent:.2f} for '{budget.name}'."
            )
    
    job_id = str(uuid.uuid4())
    db_job = models.Job(
        id=job_id,
        dataset_id=request.dataset_id,
        epsilon=request.epsilon,
        status="running",
        budget_id=request.budget_id
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)

    try:
        # This now uses the real data fetching function.
        df = _get_dataframe_from_source(dataset)

        col_meta = {c.name: c for c in dataset.columns if c.dtype in ['int64', 'float64'] and c.min_val is not None and c.max_val is not None}
        if not col_meta:
            raise HTTPException(status_code=400, detail="Selected dataset has no numeric columns with defined bounds to analyze.")
        
        cols_to_analyze = request.columns or list(col_meta.keys())
        
        if not (cols_to_analyze and request.metrics):
             raise HTTPException(status_code=400, detail="You must select at least one column and one metric.")

        # epsilon_per_metric = request.epsilon / (len(cols_to_analyze) * len(request.metrics))
        epsilon = request.epsilon

        for col_name in cols_to_analyze:
            if col_name not in df.columns:
                continue # Skip columns that might exist in schema but not in the fetched dataframe
            if col_name not in col_meta:
                 raise HTTPException(status_code=400, detail=f"Column '{col_name}' is not numeric or has no defined bounds in the registry.")

            # --- HISTOGRAM LOGIC ---
            if schemas.DPMetric.histogram in request.metrics:
                if col_meta[col_name].is_categorical:
                    col_data = df[col_name].dropna().tolist()
                    unique_vals = list(set(col_data))
                    
                    if len(unique_vals) > 50: 
                        print(f"Skipping histogram for high-cardinality column: {col_name}")
                        continue

                    epsilon_per_bin = epsilon / len(unique_vals) if unique_vals else epsilon
                    
                    hist_result = {}
                    for val in unique_vals:
                        val_count_data = [1 for x in col_data if x == val]
                        dp_count_algo = dp.algorithms.laplacian.Count(epsilon=epsilon_per_bin)
                        noisy_count = dp_count_algo.quick_result(val_count_data)
                        
                        # CORRECTED: Post-processing to clamp negative counts to zero.
                        hist_result[str(val)] = max(0, noisy_count)

                    db_result = models.JobResult(
                        job_id=job_id,
                        analysis_type="DP Histogram",
                        column_name=col_name,
                        result=json.dumps(hist_result)
                    )
                    db.add(db_result)

            # --- NUMERIC METRICS LOGIC ---
            is_numeric = col_meta[col_name].dtype in ['int64', 'float64'] and col_meta[col_name].min_val is not None
            if is_numeric and any(m != schemas.DPMetric.histogram for m in request.metrics):
                col_data_int = [int(x) for x in df[col_name].dropna().tolist()]
                lower_bound = int(col_meta[col_name].min_val)
                upper_bound = int(col_meta[col_name].max_val)

                def run_and_save(metric_name, algorithm):
                    result_val = algorithm.quick_result(col_data_int)
                    db_result = models.JobResult(
                        job_id=job_id,
                        analysis_type=f"DP {metric_name.title()}",
                        column_name=col_name,
                        result=str(result_val)
                    )
                    db.add(db_result)

            if schemas.DPMetric.count in request.metrics:
                run_and_save("Count", dp.algorithms.laplacian.Count(epsilon=epsilon))
            if schemas.DPMetric.sum in request.metrics:
                run_and_save("Sum", dp.algorithms.laplacian.BoundedSum(epsilon=epsilon, lower_bound=lower_bound, upper_bound=upper_bound))
            if schemas.DPMetric.mean in request.metrics:
                run_and_save("Mean", dp.algorithms.laplacian.BoundedMean(epsilon=epsilon, lower_bound=lower_bound, upper_bound=upper_bound))
            if schemas.DPMetric.median in request.metrics:
                run_and_save("Median", dp.algorithms.laplacian.Median(epsilon=epsilon, lower_bound=lower_bound, upper_bound=upper_bound))
            if schemas.DPMetric.min in request.metrics:
                run_and_save("Min", dp.algorithms.laplacian.Min(epsilon=epsilon, lower_bound=lower_bound, upper_bound=upper_bound))
            if schemas.DPMetric.max in request.metrics:
                run_and_save("Max", dp.algorithms.laplacian.Max(epsilon=epsilon, lower_bound=lower_bound, upper_bound=upper_bound))
            if schemas.DPMetric.variance in request.metrics:
                run_and_save("Variance", dp.algorithms.laplacian.BoundedVariance(epsilon=epsilon, lower_bound=lower_bound, upper_bound=upper_bound))
            if schemas.DPMetric.std in request.metrics:
                run_and_save("Standard Deviation", dp.algorithms.laplacian.BoundedStandardDeviation(epsilon=epsilon, lower_bound=lower_bound, upper_bound=upper_bound))


        db_job.status = "completed"
        if budget:
            budget.epsilon_spent += request.epsilon
            db.add(budget)
        db.commit()
        db.refresh(db_job)
        return db_job

    except Exception as e:
        db_job.status = "failed"
        db.commit()
        db.refresh(db_job)
        raise e


@router.post("/preview", response_model=schemas.JobPreviewResponse, summary="Get a DP utility preview")
async def get_dp_preview(
    request: schemas.JobPreviewRequest,
    db: Session = Depends(get_db)
):
    """
    Runs a single DP calculation without saving a job to provide a preview
    of the privacy-utility tradeoff for a given epsilon.
    """
    dataset = db.query(models.Dataset).filter(models.Dataset.id == request.dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")

    col_meta = next((c for c in dataset.columns if c.name == request.column), None)
    if not col_meta or col_meta.min_val is None or col_meta.max_val is None:
        raise HTTPException(status_code=400, detail=f"Column '{request.column}' is not numeric or has no defined bounds.")

    col_data = []
    df = _get_dataframe_from_source(dataset)
    if request.column not in df.columns:
        raise HTTPException(status_code=404, detail=f"Column '{request.column}' not found in the actual data source.")
        
    # CORRECTED: Ensure the sample size is not larger than the population
    clean_data = df[request.column].dropna()
    sample_size = min(1000, len(clean_data))
        
    if sample_size > 0:
        sample_df = clean_data.sample(n=sample_size, random_state=42)
        col_data = [int(x) for x in sample_df.tolist()]
    
    lower_bound = int(col_meta.min_val)
    upper_bound = int(col_meta.max_val)

    actual_value = 0.0
    if request.metric == "count":
        actual_value = float(len(col_data))
    elif request.metric == "sum":
        actual_value = float(sum(col_data))
    elif request.metric == "mean":
        actual_value = float(np.mean(col_data))

    private_value = 0.0
    if request.metric == "count":
        private_value = dp.algorithms.laplacian.Count(epsilon=request.epsilon).quick_result(col_data)
    elif request.metric == "sum":
        private_value = dp.algorithms.laplacian.BoundedSum(epsilon=request.epsilon, lower_bound=lower_bound, upper_bound=upper_bound).quick_result(col_data)
    elif request.metric == "mean":
        private_value = dp.algorithms.laplacian.BoundedMean(epsilon=request.epsilon, lower_bound=lower_bound, upper_bound=upper_bound).quick_result(col_data)

    return schemas.JobPreviewResponse(
        actual_value=actual_value,
        private_value=private_value,
        epsilon=request.epsilon,
        column=request.column,
        metric=request.metric.value
    )


@router.get("/", response_model=List[schemas.JobSchema], summary="List all DP Jobs")
async def list_jobs(db: Session = Depends(get_db)):
    """
    Retrieves a list of all DP jobs from the database.
    """
    jobs = db.query(models.Job).order_by(models.Job.created_at.desc()).all()
    return jobs

@router.get("/{job_id}", response_model=schemas.JobSchema, summary="Get a specific DP Job by ID")
async def get_job(job_id: str, db: Session = Depends(get_db)):
    """
    Fetches a single DP job by its ID, including its results.
    """
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if job is None:
        raise HTTPException(status_code=404, detail=f"Job with ID '{job_id}' not found.")
    return job

# --- NEW ENDPOINT FOR DOWNLOADING RESULTS ---

@router.get("/{job_id}/results.csv", summary="Download job results as a CSV file")
async def download_job_results(
    job_id: str,
    db: Session = Depends(get_db)
):
    """
    Fetches the results for a specific job, formats them as a CSV,
    and returns it as a downloadable file.
    """
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    if job.status != "completed":
        raise HTTPException(status_code=400, detail="Job has not completed successfully.")
    
    # Convert results to a DataFrame
    results_list = [
        {
            "analysis_type": res.analysis_type,
            "column_name": res.column_name,
            "result": res.result
        } for res in job.results
    ]
    if not results_list:
        raise HTTPException(status_code=404, detail="No results found for this job.")

    results_df = pd.DataFrame(results_list)
    
    # Create an in-memory text stream
    stream = io.StringIO()

    # --- Add Privacy Metadata "Watermark" ---
    stream.write(f"# Job ID: {job.id}\n")
    stream.write(f"# Dataset ID: {job.dataset_id}\n")
    stream.write(f"# Epsilon Used: {job.epsilon}\n")
    stream.write(f"# Generated On: {datetime.utcnow().isoformat()}Z\n")
    stream.write("\n") # Add a blank line for readability
    
    # Write DataFrame to the stream
    results_df.to_csv(stream, index=False)
    
    # --- Create the Streaming Response ---
    response = StreamingResponse(
        iter([stream.getvalue()]),
        media_type="text/csv"
    )
    response.headers["Content-Disposition"] = f"attachment; filename=job_{job.id}_results.csv"
    
    return response

# --- NEW ENDPOINT FOR VISUALIZATION ---

@router.get("/{job_id}/visualize", summary="Generate a comparison visualization of the job results")
async def visualize_job_results(job_id: str, db: Session = Depends(get_db)):
    """
    Generates a grouped bar chart comparing the true vs. private results
    for a completed job.
    """
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job or job.status != "completed":
        raise HTTPException(status_code=400, detail="Job not found or not completed.")

    dataset = db.query(models.Dataset).filter(models.Dataset.id == job.dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Associated dataset not found.")

    df = _get_dataframe_from_source(dataset)
    
    chart_data = []
    for res in job.results:
        try:
            private_value = float(res.result)
            col_name = res.column_name
            metric = res.analysis_type.replace('DP ', '').lower()
            
            if col_name not in df.columns:
                continue

            clean_data = df[col_name].dropna()
            
            actual_value = 0.0
            if metric == "count":
                actual_value = float(len(clean_data))
            elif metric == "sum":
                actual_value = float(clean_data.sum())
            elif metric == "mean":
                actual_value = float(clean_data.mean())
            
            if actual_value != 0.0: # Only include metrics we can calculate a true value for
                chart_data.append({
                    "label": f"{col_name}\n({metric})",
                    "private_value": private_value,
                    "actual_value": actual_value
                })
        except (ValueError, TypeError):
            continue

    if not chart_data:
        raise HTTPException(status_code=400, detail="No numeric results available to visualize for this job.")

    labels = [item["label"] for item in chart_data]
    private_values = [item["private_value"] for item in chart_data]
    actual_values = [item["actual_value"] for item in chart_data]

    x = np.arange(len(labels))
    width = 0.35

    plt.style.use('dark_background')
    fig, ax = plt.subplots(figsize=(12, 7))
    
    rects1 = ax.bar(x - width/2, actual_values, width, label='True Value', color='#4a5568')
    rects2 = ax.bar(x + width/2, private_values, width, label='Private Value', color='#7aa2f7')

    ax.set_ylabel('Values')
    ax.set_title(f'True vs. Private Results (ε={job.epsilon})')
    ax.set_xticks(x)
    ax.set_xticklabels(labels, rotation=45, ha="right")
    ax.legend()
    
    fig.tight_layout()

    buf = io.BytesIO()
    fig.savefig(buf, format='png', transparent=True)
    buf.seek(0)
    plt.close(fig)

    return StreamingResponse(buf, media_type="image/png")

@router.get("/{job_id}/histogram/{column_name}", summary="Generate a visualization for a specific histogram result")
async def visualize_histogram_result(
    job_id: str,
    column_name: str,
    db: Session = Depends(get_db)
):
    """
    Generates a bar chart for a specific DP Histogram result from a completed job.
    """
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job or job.status != "completed":
        raise HTTPException(status_code=400, detail="Job not found or not completed.")

    histogram_result = None
    for res in job.results:
        if res.column_name == column_name and res.analysis_type == "DP Histogram":
            try:
                histogram_result = json.loads(res.result)
                break
            except json.JSONDecodeError:
                raise HTTPException(status_code=500, detail="Failed to parse stored histogram result.")

    if not histogram_result:
        raise HTTPException(status_code=404, detail=f"Histogram result for column '{column_name}' not found in this job.")

    labels = list(histogram_result.keys())
    values = [float(v) for v in histogram_result.values()]

    plt.style.use('dark_background')
    fig, ax = plt.subplots(figsize=(10, 6))
    
    ax.bar(labels, values, color='#7aa2f7')
    ax.set_ylabel('Differentially Private Count')
    ax.set_title(f'DP Histogram for "{column_name}" (ε={job.epsilon})')
    
    # CORRECTED: Set rotation and alignment on the labels, not the ticks
    ax.set_xticks(np.arange(len(labels)))
    ax.set_xticklabels(labels, rotation=45, ha="right")
    
    fig.tight_layout()

    buf = io.BytesIO()
    fig.savefig(buf, format='png', transparent=True)
    buf.seek(0)
    plt.close(fig)

    return StreamingResponse(buf, media_type="image/png")