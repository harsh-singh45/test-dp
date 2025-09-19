# new-backend/seed.py (Corrected to match YOUR models)

import os
from core.database import SessionLocal, engine
from models import data_models
from models.data_models import Dataset, Budget # Import specific models

# This will create all tables based on the corrected models file
print("Initializing database...")
data_models.Base.metadata.create_all(bind=engine)
print("Database initialized.")

db = SessionLocal()

try:
    print("Seeding database...")
    
    existing_dataset = db.query(Dataset).filter(Dataset.name == "Sample Customer Data").first()
    
    if not existing_dataset:
        file_path = os.path.abspath("sample_data.csv")
        
        # Create the Dataset object using the columns from YOUR model
        new_dataset = Dataset(
            name="Sample Customer Data",
            description="A small sample dataset of customer ages and cities.",
            source_type="csv",
            # The 'connection_details' property expects a dict, not a string
            connection_details={"path": file_path},
            total_records=6, # Your model includes this
            row_count=6      # Your model also includes this
        )
        db.add(new_dataset)
        db.commit()
        db.refresh(new_dataset)
        print(f"Dataset '{new_dataset.name}' created.")

        # Create a budget for the new dataset
        new_budget = Budget(
            dataset_id=new_dataset.id,
            total_epsilon=10.0,
            consumed_epsilon=0.0
        )
        db.add(new_budget)
        db.commit()
        print("Budget created successfully.")
    else:
        print("Database already seeded. Skipping.")

finally:
    db.close()

print("\nDatabase seeding complete!")