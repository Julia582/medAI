from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from core.config import settings


class RecommendationAgent:
    def __init__(self):
        self.llm = ChatOpenAI(
            model=settings.llm_model,
            temperature=0.3,
            api_key=settings.openai_api_key,
        )
        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """You are a medical recommendation specialist.
Based on the medical document and user question, provide helpful recommendations.

Generate:
1. **Follow-up Questions** - 3-5 relevant questions the patient should ask their doctor
2. **Related Topics** - Medical topics the patient should research
3. **Document Suggestions** - What other medical records might be relevant
4. **Action Items** - Practical next steps for the patient

Be helpful but always remind patients to consult their healthcare provider.""",
                ),
                (
                    "human",
                    "Based on this document:\n{document}\n\nAnd this question: {question}\n\nWhat do you recommend?",
                ),
            ]
        )
        self.chain = self.prompt | self.llm

    async def generate(self, question: str, document_text: str = None) -> str:
        response = self.chain.invoke(
            {
                "document": document_text or "No specific document referenced.",
                "question": question,
            }
        )
        return response.content
