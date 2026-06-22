from pydantic import BaseModel
from typing import List, Optional


class MessageHistory(BaseModel):
    role: str
    content: str


class QueryRequest(BaseModel):
    query: str
    document_id: Optional[str] = None
    history: List[MessageHistory] = []


class Source(BaseModel):
    document_id: str
    chunk_text: str
    score: float
    source: str


class QueryResponse(BaseModel):
    answer: str
    sources: List[Source] = []


class ProcessDocumentResponse(BaseModel):
    filename: str
    chunks: int
    status: str
