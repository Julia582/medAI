from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from core.config import settings


class ReportSummarizationAgent:
    def __init__(self):
        self.llm = ChatOpenAI(
            model=settings.llm_model,
            temperature=0.1,
            api_key=settings.openai_api_key,
        )
        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """You are a medical report summarization specialist.
Summarize the medical document clearly and concisely.

Include:
- Patient overview
- Key findings and diagnoses
- Medications and treatments
- Test results and values
- Doctor recommendations

Use clear, patient-friendly language while preserving medical accuracy.""",
                ),
                ("human", "Summarize this medical document:\n\n{document}"),
            ]
        )
        self.chain = self.prompt | self.llm

    async def run(self, document_text: str, document_id: str = None) -> str:
        response = self.chain.invoke({"document": document_text})
        return response.content
