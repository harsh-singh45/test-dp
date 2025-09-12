# Differential Privacy Platform Backend

This is the FastAPI backend for the Differential Privacy Platform. It
provides a complete API for managing datasets, executing differentially
private queries, and handling privacy budgets.



The backend is functional for its core workflow:

-   **Data Ingestion**: Users can upload CSV and SQLite database files.
    The backend correctly inspects these files, infers the schema, and
    saves the dataset and its column metadata to the database.
-   **Dynamic DP Queries**: Users can run queries (count, sum, mean) on
    any numeric column of a registered dataset.
-   **Selectable Mechanisms**: The backend supports both Laplace and
    Gaussian privacy mechanisms, applied dynamically based on the user's
    request.
-   **Privacy Budget Management**: Budgets are automatically created for
    new datasets and are correctly debited when jobs are successfully
    completed.
-   **Full API Support**: All necessary "read" endpoints for the
    frontend UI (dashboard KPIs, dataset lists, job history, etc.) are
    implemented.

## Tech Stack

-   **Framework**: FastAPI
-   **Database**: SQLAlchemy with a SQLite backend
-   **Differential Privacy**: diffprivlib for robust DP mechanism
    implementations
-   **Data Handling**: Pandas

## Setup and Installation

### 1. Prerequisites

-   Python 3.10+
-   A Python virtual environment tool (like venv)

### 2. Installation

Clone the repository and navigate into the `new-backend` directory.

``` bash
# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install the required packages
pip install -r requirements.txt
```


### 3. Running the Server

Once the database is seeded, you can start the FastAPI server.

``` bash
uvicorn main:app --reload
```

The server will be running at http://127.0.0.1:8000. It is now ready to
accept requests from the frontend platform.

## How to Use (Workflow)

1.  **Start the Backend Server** as described above.\
2.  **Start the Frontend Platform** (`npm run dev` in the platform
    directory).\
3.  **Add Data**: Navigate to the "Datasets" page and use the "Add
    Dataset" feature to upload a new CSV or SQLite file.\
4.  **Run a Query**: Navigate to the "Queries" page, click "New Query",
    select your newly uploaded dataset, choose a numeric column, and
    execute a query.\
5.  **Check Results**: The new job will appear in the query history, and
    the privacy budget for that dataset will be updated on the
    "Accounting" page.
