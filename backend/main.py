# backend/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.connectors import airbyte_application
from core.database import engine
import models.data_models as data_models
from routers import dataset_router, schema_importer, job_router,budget_router, dashboard_router, policy_router # Import job_router
from routers.connectors import file_upload, local_database, postgresql, s3, gcs

from dotenv import load_dotenv
load_dotenv()
# Create all database tables on startup
data_models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Intelation - Differential Privacy Platform",
    description="An end-to-end platform for managing datasets, running DP jobs, and ensuring compliance.",
    version="0.6.0"
)

# --- CORS Middleware ---
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Include API Routers ---
app.include_router(dataset_router.router)
app.include_router(schema_importer.router)
app.include_router(dashboard_router.router) # Include the dashboard router
app.include_router(policy_router.router)
app.include_router(job_router.router) # Include the job router
app.include_router(budget_router.router)
app.include_router(file_upload.router)
app.include_router(local_database.router)
app.include_router(postgresql.router)
app.include_router(s3.router)
app.include_router(gcs.router)
app.include_router(airbyte_application.router)


@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to the Intelation Differential Privacy API Platform."}