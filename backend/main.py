from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import shutil
from pathlib import Path
import logging
from typing import List, Dict, Any
import uvicorn
import json
import openai
from openai import OpenAI
import tiktoken
import numpy as np
import time

# Initialize FastAPI app
app = FastAPI(title="Synapse API", description="Unified Knowledge Engine", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create directories
DATA_DIR = Path("./data")
STORAGE_DIR = Path("./storage")
DATA_DIR.mkdir(exist_ok=True)
STORAGE_DIR.mkdir(exist_ok=True)

# Initialize OpenAI client
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_BASE_URL")
)

# Simple in-memory document storage
documents = []

def chunk_text(text: str, max_tokens: int = 500) -> List[str]:
    """Split text into chunks based on token count."""
    encoding = tiktoken.encoding_for_model("gpt-4")
    tokens = encoding.encode(text)
    
    chunks = []
    for i in range(0, len(tokens), max_tokens):
        chunk_tokens = tokens[i:i + max_tokens]
        chunk_text = encoding.decode(chunk_tokens)
        chunks.append(chunk_text)
    
    return chunks

def get_embedding(text: str) -> List[float]:
    """Get embedding for text using OpenAI."""
    try:
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=text
        )
        return response.data[0].embedding
    except Exception as e:
        logger.error(f"Error getting embedding: {e}")
        return []

def cosine_similarity(a: List[float], b: List[float]) -> float:
    """Calculate cosine similarity between two vectors."""
    if not a or not b:
        return 0.0
    
    a_np = np.array(a)
    b_np = np.array(b)
    
    return np.dot(a_np, b_np) / (np.linalg.norm(a_np) * np.linalg.norm(b_np))

def search_documents(query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """Search documents using semantic similarity."""
    if not documents:
        return []
    
    query_embedding = get_embedding(query)
    if not query_embedding:
        return []
    
    # Calculate similarities
    results = []
    for doc in documents:
        if 'embedding' in doc and doc['embedding']:
            similarity = cosine_similarity(query_embedding, doc['embedding'])
            results.append({
                'content': doc['content'],
                'source': doc['source'],
                'similarity': similarity
            })
    
    # Sort by similarity and return top_k
    results.sort(key=lambda x: x['similarity'], reverse=True)
    return results[:top_k]

# Pydantic models
class QueryRequest(BaseModel):
    question: str

class QueryResponse(BaseModel):
    answer: str
    sources: List[Dict[str, Any]]

class SyncResponse(BaseModel):
    message: str

class UploadResponse(BaseModel):
    message: str

# API Endpoints
@app.get("/")
async def root():
    return {"message": "Synapse API is running", "version": "1.0.0"}

@app.post("/api/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """Upload and process a document."""
    try:
        # Save uploaded file
        file_path = DATA_DIR / file.filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Read and process the file
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Chunk the content
        chunks = chunk_text(content)
        
        # Process each chunk
        for i, chunk in enumerate(chunks):
            embedding = get_embedding(chunk)
            documents.append({
                'content': chunk,
                'source': f"{file.filename} (chunk {i+1})",
                'embedding': embedding
            })
        
        logger.info(f"Processed {len(chunks)} chunks from {file.filename}")
        return UploadResponse(message=f"Successfully uploaded and processed {file.filename}")
        
    except Exception as e:
        logger.error(f"Error uploading document: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/sync/slack", response_model=SyncResponse)
async def sync_slack(channel_ids: str = Form(...)):
    """Sync data from Slack channels (simplified implementation)."""
    try:
        # This is a simplified implementation
        # In a real scenario, you would use the Slack API to fetch messages
        logger.info(f"Slack sync requested for channels: {channel_ids}")
        
        # Mock data for demonstration
        mock_content = f"Mock Slack data from channels: {channel_ids}"
        chunks = chunk_text(mock_content)
        
        for i, chunk in enumerate(chunks):
            embedding = get_embedding(chunk)
            documents.append({
                'content': chunk,
                'source': f"Slack channels: {channel_ids} (chunk {i+1})",
                'embedding': embedding
            })
        
        return SyncResponse(message=f"Successfully synced Slack channels: {channel_ids}")
        
    except Exception as e:
        logger.error(f"Error syncing Slack: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/sync/github", response_model=SyncResponse)
async def sync_github(owner: str = Form(...), repo: str = Form(...)):
    """Sync data from GitHub repository (simplified implementation)."""
    try:
        # This is a simplified implementation
        # In a real scenario, you would use the GitHub API to fetch repository content
        logger.info(f"GitHub sync requested for {owner}/{repo}")
        
        # Mock data for demonstration
        mock_content = f"Mock GitHub repository data from {owner}/{repo}"
        chunks = chunk_text(mock_content)
        
        for i, chunk in enumerate(chunks):
            embedding = get_embedding(chunk)
            documents.append({
                'content': chunk,
                'source': f"GitHub: {owner}/{repo} (chunk {i+1})",
                'embedding': embedding
            })
        
        return SyncResponse(message=f"Successfully synced GitHub repository: {owner}/{repo}")
        
    except Exception as e:
        logger.error(f"Error syncing GitHub: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/query", response_model=QueryResponse)
async def query_knowledge(request: QueryRequest):
    """Query the knowledge base using RAG."""
    try:
        # Search for relevant documents
        relevant_docs = search_documents(request.question)
        
        if not relevant_docs:
            return QueryResponse(
                answer="I don't have enough information to answer your question. Please upload some documents first.",
                sources=[]
            )
        
        # Prepare context from relevant documents
        context = "\n\n".join([doc['content'] for doc in relevant_docs[:3]])
        
        # Generate response using OpenAI
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that answers questions based on the provided context. If the context doesn't contain enough information to answer the question, say so clearly."
                },
                {
                    "role": "user",
                    "content": f"Context:\n{context}\n\nQuestion: {request.question}"
                }
            ],
            temperature=0.1
        )
        
        answer = response.choices[0].message.content
        
        # Prepare sources with proper metadata structure
        sources = []
        for i, doc in enumerate(relevant_docs[:3]):
            source_text = doc['source']
            
            # Determine source type and metadata based on source text
            if "Slack" in source_text:
                source_type = "slack"
                metadata = {
                    "type": "slack",
                    "channel": source_text.split("channels: ")[1].split(" (")[0] if "channels: " in source_text else "Unknown"
                }
            elif "GitHub" in source_text:
                source_type = "github"
                repo_info = source_text.split("GitHub: ")[1].split(" (")[0] if "GitHub: " in source_text else "Unknown"
                metadata = {
                    "type": "github",
                    "pr": repo_info
                }
            else:
                source_type = "document"
                filename = source_text.split(" (chunk")[0] if " (chunk" in source_text else source_text
                metadata = {
                    "type": "document",
                    "filename": filename
                }
            
            sources.append({
                "id": f"source_{i}_{int(time.time() * 1000)}",
                "content": doc['content'][:200] + "..." if len(doc['content']) > 200 else doc['content'],
                "metadata": metadata
            })
        
        
        return QueryResponse(answer=answer, sources=sources)
        
    except Exception as e:
        logger.error(f"Error querying knowledge: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)