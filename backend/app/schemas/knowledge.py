from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class CollectionCreate(BaseModel):
    name: str
    description: Optional[str] = None


class CollectionResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    doc_count: int
    vector_count: int
    last_indexed: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class CollectionListResponse(BaseModel):
    items: List[CollectionResponse]
    total: int


class ChunkResponse(BaseModel):
    id: str
    collection_id: str
    content: str
    source_file: str
    chunk_index: int
    created_at: datetime

    class Config:
        from_attributes = True


class QueryRequest(BaseModel):
    collection_id: str
    query: str
    n_results: int = 3


class QueryResult(BaseModel):
    content: str
    source_file: str
    chunk_index: int
    similarity_score: float


class QueryResponse(BaseModel):
    query: str
    results: List[QueryResult]
    collection_id: str
