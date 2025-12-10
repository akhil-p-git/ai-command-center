import os
import chromadb
from chromadb.config import Settings
from chromadb.api import ClientAPI
from typing import List, Dict, Optional

# Initialize ChromaDB client
CHROMA_DB_PATH = "./chroma_db"
client = chromadb.PersistentClient(path=CHROMA_DB_PATH)


def get_or_create_collection(name: str):
    """Get or create a ChromaDB collection"""
    return client.get_or_create_collection(name=name)


def add_documents(collection_name: str, documents: List[str], metadatas: List[Dict], ids: List[str]):
    """Add documents to a collection"""
    collection = get_or_create_collection(collection_name)
    collection.add(
        documents=documents,
        metadatas=metadatas,
        ids=ids
    )


def query_collection(collection_name: str, query_text: str, n_results: int = 3) -> List[Dict]:
    """Query a collection for relevant documents"""
    collection = get_or_create_collection(collection_name)
    results = collection.query(
        query_texts=[query_text],
        n_results=n_results
    )
    
    # Process results into a cleaner format
    formatted_results = []
    
    if not results or not results['documents']:
        return []
        
    for i in range(len(results['documents'][0])):
        formatted_results.append({
            "content": results['documents'][0][i],
            "source_file": results['metadatas'][0][i].get("source_file", "unknown"),
            "chunk_index": results['metadatas'][0][i].get("chunk_index", 0),
            "similarity_score": results['distances'][0][i] if 'distances' in results else 0.0
        })
        
    return formatted_results


def delete_collection(name: str):
    """Delete a collection"""
    try:
        client.delete_collection(name=name)
    except ValueError:
        pass  # Collection doesn't exist


def list_collections() -> List[str]:
    """List all collections"""
    return [c.name for c in client.list_collections()]

