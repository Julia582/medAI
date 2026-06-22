from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.routes import router
from core.config import settings

app = FastAPI(
    title="Medical AI Assistant - RAG Service",
    version="1.0.0",
    description="AI-powered medical document analysis and Q&A",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.on_event("startup")
async def startup():
    logger.info(f"AI Service starting - model: {settings.llm_model}")


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "medical-ai-rag"}
