"""
Custom OpenAI Embedding wrapper that bypasses LlamaIndex's API key handling issues
"""
from typing import List
from llama_index.core.embeddings import BaseEmbedding
from openai import OpenAI
from settings import settings


class CustomOpenAIEmbedding(BaseEmbedding):
    """Custom OpenAI embedding that uses direct OpenAI client"""
    
    def __init__(self, model: str = "text-embedding-3-small", **kwargs):
        super().__init__(**kwargs)
        self._model = model
        self._client = OpenAI(
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL
        )
    
    def _get_query_embedding(self, query: str) -> List[float]:
        """Get embedding for a query"""
        response = self._client.embeddings.create(
            input=query,
            model=self._model
        )
        return response.data[0].embedding
    
    def _get_text_embedding(self, text: str) -> List[float]:
        """Get embedding for text"""
        response = self._client.embeddings.create(
            input=text,
            model=self._model
        )
        return response.data[0].embedding
    
    def _get_text_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Get embeddings for multiple texts"""
        response = self._client.embeddings.create(
            input=texts,
            model=self._model
        )
        return [data.embedding for data in response.data]
    
    async def _aget_query_embedding(self, query: str) -> List[float]:
        """Async version of get_query_embedding"""
        return self._get_query_embedding(query)
    
    async def _aget_text_embedding(self, text: str) -> List[float]:
        """Async version of get_text_embedding"""
        return self._get_text_embedding(text)
    
    async def _aget_text_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Async version of get_text_embeddings"""
        return self._get_text_embeddings(texts)