import sys
import os

# Add parent directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import Base, engine
import app.models  # Ensure all models are imported so metadata knows them

def create_tables():
    print("Creating all database tables for StatSkill AI...")
    Base.metadata.create_all(bind=engine)
    print("All tables created successfully in statskill_ai_db!")

if __name__ == "__main__":
    create_tables()
