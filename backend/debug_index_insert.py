#!/usr/bin/env python3
"""
Debug script to test index.insert() operation
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_index_insert():
    """Test the index.insert() operation that's causing the 401 error"""
    print("🔍 Testing index.insert() operation...")
    
    try:
        # Configure LlamaIndex settings
        from llama_index.core import Settings, Document
        from llama_index.embeddings.openai import OpenAIEmbedding
        from llama_index.llms.openai import OpenAI as LlamaOpenAI
        from llama_index.vector_stores.chroma import ChromaVectorStore
        from llama_index.core import VectorStoreIndex
        from vector_store_client import vector_store
        from settings import settings
        
        print("✅ Imports successful")
        
        # Configure LlamaIndex settings
        Settings.embed_model = OpenAIEmbedding(
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL
        )
        Settings.llm = LlamaOpenAI(
            model="gpt-4o-mini", 
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL
        )
        print("✅ LlamaIndex settings configured")
        
        # Create ChromaVectorStore from existing collection
        chroma_vector_store = ChromaVectorStore(chroma_collection=vector_store.collection)
        print("✅ ChromaVectorStore created")
        
        # Load the existing index from the vector store
        index = VectorStoreIndex.from_vector_store(chroma_vector_store)
        print("✅ VectorStoreIndex loaded")
        
        # Create a test document
        test_doc = Document(
            text="This is a test document for debugging the index insert operation.",
            metadata={
                "source": "test",
                "contextId": "debug_test"
            }
        )
        print("✅ Test document created")
        
        # Try to insert the document (this is where the 401 error likely occurs)
        print("🔄 Attempting to insert document...")
        index.insert(test_doc)
        print("✅ Document inserted successfully!")
        
    except Exception as e:
        print(f"❌ Index insert failed: {e}")
        if "401" in str(e):
            print("🔍 Confirmed: 401 error occurs during index.insert()")
            print("🔍 This means the embedding generation is failing")
        else:
            print(f"🔍 Different error type: {type(e)}")

if __name__ == "__main__":
    test_index_insert()