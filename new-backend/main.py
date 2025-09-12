# backend/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.database import engine
from models import data_models
from routers import dataset_router, job_router, budget_router, policy_router, dashboard_router
from routers.connectors import file_upload , local_database

# This line creates the database tables if they don't exist
data_models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# --- THIS IS THE FIX ---
# This block correctly configures CORS to allow your frontend to communicate.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # The origin of your frontend app
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods, including POST, GET, etc.
    allow_headers=["*"],  # Allows all headers
)
# --- END OF FIX ---

# Include all the API routers
app.include_router(dashboard_router.router)
app.include_router(dataset_router.router)
app.include_router(job_router.router)
app.include_router(budget_router.router)
app.include_router(policy_router.router)
app.include_router(file_upload.router)
app.include_router(local_database.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to the Differential Privacy API"}