from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from typing import List, Optional
import PyPDF2
import docx
import io
import os
from loguru import logger

from core.config import settings
from models.schemas import QueryResponse, Source


class RAGPipeline:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(
            model=settings.embedding_model,
            api_key=settings.openai_api_key,
        )
        self.llm = ChatOpenAI(
            model=settings.llm_model,
            temperature=0.1,
            api_key=settings.openai_api_key,
        )
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.chunk_size,
            chunk_overlap=settings.chunk_overlap,
            separators=["\n\n", "\n", ". ", " ", ""],
        )
        self.vectorstores: dict[str, FAISS] = {}

    async def process_document(self, content: bytes, filename: str) -> List[str]:
        text = self._extract_text(content, filename)
        chunks = self.text_splitter.split_text(text)

        if "global" not in self.vectorstores:
            self.vectorstores["global"] = FAISS.from_texts(chunks, self.embeddings)
        else:
            self.vectorstores["global"].add_texts(chunks)

        logger.info(f"Processed {filename}: {len(chunks)} chunks")
        return chunks

    def _extract_text(self, content: bytes, filename: str) -> str:
        ext = os.path.splitext(filename)[1].lower()

        if ext == ".pdf":
            return self._extract_pdf(content)
        elif ext == ".docx":
            return self._extract_docx(content)
        else:
            return content.decode("utf-8", errors="ignore")

    def _extract_pdf(self, content: bytes) -> str:
        text = []
        with io.BytesIO(content) as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text.append(page.extract_text() or "")
        return "\n".join(text)

    def _extract_docx(self, content: bytes) -> str:
        with io.BytesIO(content) as f:
            doc = docx.Document(f)
            return "\n".join(p.text for p in doc.paragraphs)

    async def query(
        self,
        query: str,
        document_id: Optional[str] = None,
        history: Optional[List[dict]] = None,
    ) -> QueryResponse:
        if (
            "global" not in self.vectorstores
            or self.vectorstores["global"].index.ntotal == 0
        ):
            return QueryResponse(
                answer="No documents have been uploaded yet. Please upload a medical document first.",
                sources=[],
            )

        retriever = self.vectorstores["global"].as_retriever(
            search_kwargs={"k": settings.top_k}
        )

        docs = retriever.invoke(query)
        context = "\n\n".join(doc.page_content for doc in docs)

        chat_history = []
        if history:
            for msg in history[-6:]:
                role = msg.get("role", "")
                content = msg.get("content", "")
                if role == "user":
                    chat_history.append(HumanMessage(content=content))
                elif role == "assistant":
                    chat_history.append(AIMessage(content=content))

        system_prompt = """You are a helpful medical AI assistant. Use the provided context to answer the user's question accurately.

Guidelines:
- Answer based on the medical document context provided
- If the information is not in the context, say "I cannot find this information in the provided documents"
- Cite specific sections from the context when possible
- Use patient-friendly language
- Highlight any abnormal values or concerns
- Do not provide definitive medical diagnoses - encourage consulting a doctor

Context:
{context}"""

        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", system_prompt),
                MessagesPlaceholder(variable_name="chat_history"),
                ("human", "{input}"),
            ]
        )

        chain = prompt | self.llm

        response = chain.invoke(
            {
                "context": context,
                "chat_history": chat_history,
                "input": query,
            }
        )

        sources = [
            Source(
                document_id=document_id or "unknown",
                chunk_text=doc.page_content[:200],
                score=1.0,
                source=f"Chunk {i + 1}",
            )
            for i, doc in enumerate(docs)
        ]

        return QueryResponse(answer=response.content, sources=sources)
