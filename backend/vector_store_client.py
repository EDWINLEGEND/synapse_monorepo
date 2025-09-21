"""
Vector Store Client for Synapse Knowledge Base

This module provides a ChromaDB-based persistent vector store client
for storing and retrieving document embeddings, now integrated with LlamaIndex.
"""

import chromadb
from chromadb.config import Settings
import logging
from typing import List, Dict, Any, Optional
import os
from pathlib import Path

# LlamaIndex imports
from llama_index.core import VectorStoreIndex, StorageContext, Settings as LlamaSettings
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.vector_stores.chroma import ChromaVectorStore

# Import centralized settings
from settings import settings

logger = logging.getLogger(__name__)

class VectorStoreClient:
    """ChromaDB-based vector store client for document embeddings with LlamaIndex integration."""
    
    def __init__(self, db_path: str = "./chroma_db"):
        """
        Initialize the ChromaDB client with persistent storage and LlamaIndex integration.
        
        Args:
            db_path: Path to store the ChromaDB database files
        """
        self.db_path = Path(db_path)
        self.db_path.mkdir(exist_ok=True)
        
        # Initialize ChromaDB client with persistent storage
        self.client = chromadb.PersistentClient(path=str(self.db_path))
        
        # Create or get the main collection for the knowledge base
        self.collection = self.client.get_or_create_collection(
            name="synapse_knowledge_base",
            metadata={"description": "Main knowledge base for Synapse application"}
        )
        
        # Set up LlamaIndex components
        self._setup_llamaindex()
        
        logger.info(f"ChromaDB client initialized with database at: {self.db_path}")
        logger.info(f"Collection 'synapse_knowledge_base' ready with {self.collection.count()} documents")
        logger.info("LlamaIndex integration configured successfully")
    
    def _setup_llamaindex(self):
        """Set up LlamaIndex StorageContext and configure global settings."""
        # Create the LlamaIndex vector store adapter
        self.vector_store = ChromaVectorStore(chroma_collection=self.collection)
        
        # Define the storage context
        self.storage_context = StorageContext.from_defaults(vector_store=self.vector_store)
        
        # Configure LlamaIndex global settings using custom embedding
        from custom_openai_embedding import CustomOpenAIEmbedding
        
        embed_model = CustomOpenAIEmbedding(model="text-embedding-3-small")
        
        # Set global embedding model
        LlamaSettings.embed_model = embed_model
        
        logger.info("LlamaIndex contexts configured with custom OpenAI embeddings and ChromaDB storage")
    
    def get_storage_context(self) -> StorageContext:
        """Get the configured StorageContext for LlamaIndex operations."""
        return self.storage_context
    
    def get_vector_store(self) -> ChromaVectorStore:
        """Get the ChromaVectorStore adapter for LlamaIndex operations."""
        return self.vector_store
    
    def add_documents(
        self,
        documents: List[str],
        embeddings: List[List[float]],
        metadatas: List[Dict[str, Any]],
        ids: List[str]
    ) -> None:
        """
        Add documents with their embeddings to the vector store.
        
        Args:
            documents: List of document text chunks
            embeddings: List of embedding vectors for each document
            metadatas: List of metadata dictionaries for each document
            ids: List of unique identifiers for each document
        """
        try:
            self.collection.add(
                documents=documents,
                embeddings=embeddings,
                metadatas=metadatas,
                ids=ids
            )
            logger.info(f"Added {len(documents)} documents to the vector store")
        except Exception as e:
            logger.error(f"Error adding documents to vector store: {e}")
            raise
    
    def search_documents(
        self,
        query_embedding: List[float],
        n_results: int = 5,
        where: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Search for similar documents using embedding similarity.
        
        Args:
            query_embedding: The embedding vector of the query
            n_results: Number of results to return
            where: Optional metadata filter conditions
            
        Returns:
            Dictionary containing search results with documents, metadatas, and distances
        """
        try:
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=n_results,
                where=where
            )
            logger.info(f"Search completed, found {len(results['documents'][0])} results")
            return results
        except Exception as e:
            logger.error(f"Error searching documents: {e}")
            raise
    
    def get_document_count(self) -> int:
        """Get the total number of documents in the vector store."""
        return self.collection.count()
    
    def delete_documents(self, ids: List[str]) -> None:
        """
        Delete documents by their IDs.
        
        Args:
            ids: List of document IDs to delete
        """
        try:
            self.collection.delete(ids=ids)
            logger.info(f"Deleted {len(ids)} documents from the vector store")
        except Exception as e:
            logger.error(f"Error deleting documents: {e}")
            raise
    
    def clear_collection(self) -> None:
        """Clear all documents from the collection."""
        try:
            # Delete the collection and recreate it
            self.client.delete_collection(name="synapse_knowledge_base")
            self.collection = self.client.get_or_create_collection(
                name="synapse_knowledge_base",
                metadata={"description": "Main knowledge base for Synapse application"}
            )
            logger.info("Cleared all documents from the vector store")
        except Exception as e:
            logger.error(f"Error clearing collection: {e}")
            raise
    
    def get_documents_by_context(self, context_id: str) -> Dict[str, Any]:
        """
        Get all documents for a specific context ID.
        
        Args:
            context_id: The context ID to filter by
            
        Returns:
            Dictionary containing all documents for the given context
        """
        try:
            results = self.collection.get(
                where={"contextId": context_id}
            )
            logger.info(f"Found {len(results['documents'])} documents for context: {context_id}")
            return results
        except Exception as e:
            logger.error(f"Error getting documents by context: {e}")
            raise

# Global instance for the application
vector_store = VectorStoreClient()