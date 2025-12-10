import os
import uuid
from typing import List
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.models import KnowledgeChunk, KnowledgeCollection
from app.services import vector_store


def load_document(file_path: str) -> str:
    """
    Load a document from a file path.
    Supports .md and .txt files.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    
    # Simple text loading for now
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()


def chunk_document(text: str, chunk_size: int = 500, chunk_overlap: int = 50) -> List[str]:
    """
    Split text into chunks using RecursiveCharacterTextSplitter.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
    )
    return splitter.split_text(text)


def process_and_store(file_path: str, collection_name: str, db: Session) -> int:
    """
    Load document, chunk it, and store in ChromaDB and KnowledgeChunk table.
    Updates KnowledgeCollection stats.
    
    Returns:
        Number of chunks created
    """
    # 1. Load document
    content = load_document(file_path)
    
    # 2. Chunk document
    chunks = chunk_document(content)
    
    if not chunks:
        return 0
        
    # 3. Get or create collection in DB
    collection_db = db.query(KnowledgeCollection).filter(
        KnowledgeCollection.name == collection_name
    ).first()
    
    if not collection_db:
        # Create if not exists
        collection_db = KnowledgeCollection(
            name=collection_name,
            description=f"Collection for {collection_name}"
        )
        db.add(collection_db)
        db.commit()
        db.refresh(collection_db)
    
    # 4. Prepare data for Vector Store and DB
    ids = []
    documents = []
    metadatas = []
    chunk_objs = []
    
    source_file = os.path.basename(file_path)
    
    for i, chunk_text in enumerate(chunks):
        chunk_id = str(uuid.uuid4())
        ids.append(chunk_id)
        documents.append(chunk_text)
        metadatas.append({
            "source_file": source_file,
            "chunk_index": i,
            "collection_id": collection_db.id
        })
        
        # DB Object
        chunk_obj = KnowledgeChunk(
            id=chunk_id,
            collection_id=collection_db.id,
            content=chunk_text,
            source_file=source_file,
            chunk_index=i
        )
        chunk_objs.append(chunk_obj)
    
    # 5. Add to Vector Store
    vector_store.add_documents(collection_name, documents, metadatas, ids)
    
    # 6. Add to Database
    db.add_all(chunk_objs)
    
    # 7. Update Collection stats
    collection_db.doc_count += 1
    collection_db.vector_count += len(chunks)
    collection_db.last_indexed = datetime.now(timezone.utc)
    
    db.commit()
    
    return len(chunks)

