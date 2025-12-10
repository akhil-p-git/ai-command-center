import sys
import os

sys.path.append(os.getcwd())

from app.services import vector_store

def test_query():
    query = "What are the main features?"
    print(f"Querying: {query}")
    
    results = vector_store.query_collection("project-docs", query, n_results=3)
    
    print(f"Found {len(results)} results:")
    for i, res in enumerate(results):
        print(f"\nResult {i+1} (Score: {res['similarity_score']}):")
        print(f"Source: {res['source_file']}")
        print("-" * 50)
        print(res['content'][:200] + "...")
        print("-" * 50)

if __name__ == "__main__":
    test_query()

