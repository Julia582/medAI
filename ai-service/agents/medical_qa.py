from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from core.config import settings


class MedicalQAAgent:
    def __init__(self):
        self.llm = ChatOpenAI(
            model=settings.llm_model,
            temperature=0.1,
            api_key=settings.openai_api_key,
        )
        self.extract_prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """You are a medical information extraction specialist.
Extract key medical findings from the document text. For each finding include:
- What was found
- Its significance
- Any associated values or measurements
- Whether it is normal or abnormal

Format as a structured list using markdown.""",
                ),
                ("human", "Extract findings from this document:\n\n{document}"),
            ]
        )
        self.chain = self.extract_prompt | self.llm

    async def extract_findings(
        self, document_text: str, document_id: str = None
    ) -> str:
        response = self.chain.invoke({"document": document_text})
        return response.content
