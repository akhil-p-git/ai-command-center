import shutil
import tempfile
import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import KnowledgeCollection, KnowledgeChunk
from app.schemas import (
    CollectionCreate, CollectionResponse, CollectionListResponse,
    QueryRequest, QueryResponse, QueryResult
)
from app.services import document_processor, vector_store

router = APIRouter()


@router.get("/collections", response_model=CollectionListResponse)
async def list_collections(db: Session = Depends(get_db)):
    collections = db.query(KnowledgeCollection).order_by(KnowledgeCollection.created_at.desc()).all()

    items = [
        CollectionResponse(
            id=c.id,
            name=c.name,
            description=c.description,
            doc_count=c.doc_count,
            vector_count=c.vector_count,
            last_indexed=c.last_indexed,
            created_at=c.created_at
        ) for c in collections
    ]

    return CollectionListResponse(items=items, total=len(items))


@router.get("/collections/{collection_id}", response_model=CollectionResponse)
async def get_collection(collection_id: str, db: Session = Depends(get_db)):
    collection = db.query(KnowledgeCollection).filter(
        KnowledgeCollection.id == collection_id
    ).first()

    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")

    return CollectionResponse(
        id=collection.id,
        name=collection.name,
        description=collection.description,
        doc_count=collection.doc_count,
        vector_count=collection.vector_count,
        last_indexed=collection.last_indexed,
        created_at=collection.created_at
    )


@router.post("/collections", response_model=CollectionResponse)
async def create_collection(data: CollectionCreate, db: Session = Depends(get_db)):
    # Check if collection with same name exists
    existing = db.query(KnowledgeCollection).filter(
        KnowledgeCollection.name == data.name
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Collection with this name already exists")

    collection = KnowledgeCollection(
        name=data.name,
        description=data.description
    )
    db.add(collection)
    db.commit()
    db.refresh(collection)

    return CollectionResponse(
        id=collection.id,
        name=collection.name,
        description=collection.description,
        doc_count=collection.doc_count,
        vector_count=collection.vector_count,
        last_indexed=collection.last_indexed,
        created_at=collection.created_at
    )


@router.post("/collections/{collection_id}/ingest", response_model=CollectionResponse)
async def ingest_document(
    collection_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    collection = db.query(KnowledgeCollection).filter(
        KnowledgeCollection.id == collection_id
    ).first()

    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")

    # Create temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
        shutil.copyfileobj(file.file, temp_file)
        temp_path = temp_file.name

    try:
        # Process and store
        chunks_count = document_processor.process_and_store(
            file_path=temp_path,
            collection_name=collection.name,
            db=db
        )
        
        # Refresh collection to get updated stats
        db.refresh(collection)
        
        return CollectionResponse(
            id=collection.id,
            name=collection.name,
            description=collection.description,
            doc_count=collection.doc_count,
            vector_count=collection.vector_count,
            last_indexed=collection.last_indexed,
            created_at=collection.created_at
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")
    finally:
        # Cleanup temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)


@router.post("/query", response_model=QueryResponse)
async def query_collection(data: QueryRequest, db: Session = Depends(get_db)):
    collection = db.query(KnowledgeCollection).filter(
        KnowledgeCollection.id == data.collection_id
    ).first()

    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")

    # Use vector store for search
    results_raw = vector_store.query_collection(
        collection_name=collection.name,
        query_text=data.query,
        n_results=data.n_results
    )

    results = [
        QueryResult(
            content=r["content"],
            source_file=r["source_file"],
            chunk_index=r["chunk_index"],
            similarity_score=r["similarity_score"]
        ) for r in results_raw
    ]

    return QueryResponse(
        query=data.query,
        results=results,
        collection_id=data.collection_id
    )
