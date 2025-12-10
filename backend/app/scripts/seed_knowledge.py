import sys
import os

# Add backend directory to path so we can import app modules
# Assumes running from backend directory
sys.path.append(os.getcwd())

from app.core.database import SessionLocal
from app.services import document_processor

def seed_knowledge():
    print("Seeding knowledge base...")
    
    db = SessionLocal()
    try:
        # PRD is in the project root
        # If running from backend/, it is ../PRD.md
        prd_path = os.path.abspath(os.path.join(os.getcwd(), "../PRD.md"))
        
        if not os.path.exists(prd_path):
            print(f"Error: PRD.md not found at {prd_path}")
            return
            
        print(f"Processing {prd_path}...")
        
        chunks = document_processor.process_and_store(
            file_path=prd_path,
            collection_name="project-docs",
            db=db
        )
        
        print(f"Successfully seeded 'project-docs' with {chunks} chunks from PRD.md")
        
    except Exception as e:
        print(f"Error seeding knowledge: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    seed_knowledge()

