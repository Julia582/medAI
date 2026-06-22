from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    openai_api_key: str = ""
    llm_model: str = "gpt-4o-mini"
    embedding_model: str = "text-embedding-3-small"
    chunk_size: int = 1000
    chunk_overlap: int = 200
    top_k: int = 5
    database_url: str = "postgresql://localhost/medicalai"
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:4000"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
