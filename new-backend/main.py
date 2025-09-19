# backend/main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.database import engine
from models import data_models
from routers import dataset_router, job_router, budget_router, policy_router, dashboard_router, alert_router
from routers.connectors import file_upload , local_database
from fastapi_mail import ConnectionConfig
from dotenv import load_dotenv

load_dotenv()
# This line creates the database tables if they don't exist
data_models.Base.metadata.create_all(bind=engine)

# Mail configuration

app = FastAPI()

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME", "user@example.com"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD", "password"),
    MAIL_FROM=os.getenv("MAIL_FROM", "user@example.com"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.example.com"),
    MAIL_STARTTLS=os.getenv("MAIL_STARTTLS", "True").lower() == "true",
    MAIL_SSL_TLS=os.getenv("MAIL_SSL_TLS", "False").lower() == "true",
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
    # For development, print emails to console instead of sending
    # In production, set SUPPRESS_SEND=0 in your environment
    SUPPRESS_SEND=0
)

# --- DEBUGGING: Print the loaded configuration to the console ---
print("--- Mail Configuration Loaded ---")
print(f"MAIL_USERNAME: {conf.MAIL_USERNAME}")
print(f"MAIL_SERVER: {conf.MAIL_SERVER}")
print(f"MAIL_PORT: {conf.MAIL_PORT}")
print("---------------------------------")

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
# app.include_router(alert_router.router)
app.include_router(alert_router.router)


app.state.mail_config = conf

@app.get("/")
def read_root():
    return {"message": "Welcome to the Differential Privacy API"}
