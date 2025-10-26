# # backend/core/database.py

# from sqlalchemy import create_engine
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import sessionmaker

# # Define the location of the SQLite database file.
# # It will be created in the 'backend' directory.
# DATABASE_URL = "sqlite:///./database.db"

# # Create the SQLAlchemy engine.
# # The 'check_same_thread' argument is needed only for SQLite.
# engine = create_engine(
#     DATABASE_URL, connect_args={"check_same_thread": False}
# )

# # Create a SessionLocal class. Each instance of this class will be a database session.
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# # Create a Base class. Our database models will inherit from this class.
# Base = declarative_base()

# # Dependency to get a DB session
# def get_db():
#     """
#     A dependency for API endpoints to get a database session.
#     It ensures the database connection is always closed after the request.
#     """
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()


# backend/core/database.py

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

# --- THIS IS THE CRITICAL CHANGE ---
# Build the PostgreSQL connection string from environment variables
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "dp_platform_db")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Create the SQLAlchemy engine.
# The 'check_same_thread' argument is specific to SQLite and MUST be removed for PostgreSQL.
engine = create_engine(DATABASE_URL)

# --- The rest of the file is unchanged ---

# Create a SessionLocal class. Each instance of this class will be a database session.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a Base class. Our database models will inherit from this class.
Base = declarative_base()

# Dependency to get a DB session
def get_db():
    """
    A dependency for API endpoints to get a database session.
    It ensures the database connection is always closed after the request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()