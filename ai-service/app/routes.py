from fastapi import APIRouter, HTTPException, UploadFile, File
from loguru import logger

from models.schemas import QueryRequest, QueryResponse, ProcessDocumentResponse
from rag.pipeline import RAGPipeline
from agents.summarizer import ReportSummarizationAgent
from agents.medical_qa import MedicalQAAgent
from agents.risk_detector import RiskDetectionAgent
from agents.recommender import RecommendationAgent

router = APIRouter()
rag = RAGPipeline()

summarizer = ReportSummarizationAgent()
qa_agent = MedicalQAAgent()
risk_agent = RiskDetectionAgent()
recommender = RecommendationAgent()


@router.post("/process-document", response_model=ProcessDocumentResponse)
async def process_document(file: UploadFile = File(...)):
    try:
        content = await file.read()
        chunks = await rag.process_document(content, file.filename)
        return ProcessDocumentResponse(
            filename=file.filename,
            chunks=len(chunks),
            status="success",
        )
    except Exception as e:
        logger.error(f"Document processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    try:
        result = await rag.query(
            query=request.query,
            document_id=request.document_id,
            history=request.history,
        )
        return result
    except Exception as e:
        logger.error(f"Query error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/summarize")
async def summarize(request: QueryRequest):
    try:
        result = await summarizer.run(request.query, request.document_id)
        return {"summary": result}
    except Exception as e:
        logger.error(f"Summarization error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/extract-findings")
async def extract_findings(request: QueryRequest):
    try:
        result = await qa_agent.extract_findings(request.query, request.document_id)
        return {"findings": result}
    except Exception as e:
        logger.error(f"Extract findings error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/detect-risks")
async def detect_risks(request: QueryRequest):
    try:
        result = await risk_agent.analyze(request.query, request.document_id)
        return {"risks": result}
    except Exception as e:
        logger.error(f"Risk detection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/recommendations")
async def recommendations(request: QueryRequest):
    try:
        result = await recommender.generate(request.query, request.document_id)
        return {"recommendations": result}
    except Exception as e:
        logger.error(f"Recommendation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
