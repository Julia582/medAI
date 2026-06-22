from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from core.config import settings


class RiskDetectionAgent:
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
                    """You are a medical risk detection specialist.
Analyze the medical document for potential risks and abnormal findings.

For each risk detected, provide:
1. **Finding** - What was observed
2. **Severity** - Low / Medium / High / Critical
3. **Normal Range** - What the expected value should be
4. **Patient Value** - What the actual value is
5. **Recommendation** - What action should be considered

Only flag genuine abnormalities. If everything is normal, state that clearly.""",
                ),
                ("human", "Analyze this medical document for risks:\n\n{document}"),
            ]
        )
        self.chain = self.prompt | self.llm

    async def analyze(self, document_text: str, document_id: str = None) -> str:
        response = self.chain.invoke({"document": document_text})
        return response.content
