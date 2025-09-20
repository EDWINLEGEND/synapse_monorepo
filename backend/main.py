from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import shutil
from pathlib import Path
import logging
from typing import List, Dict, Any
import uvicorn

# LlamaIndex imports
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, StorageContext, load_index_from_storage
from llama_index.core.node_parser import SentenceSplitter
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.core import Settings
from llama_index.readers.slack import SlackReader
from llama_index.readers.github import GitHubRepositoryReader

# Initialize FastAPI app
app = FastAPI(title="Synapse API", description="Unified Knowledge Engine", version="1.0.0")

# Add CORS middleware for frontend integration
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

# Initialize directories
DATA_DIR = Path("./data")
STORAGE_DIR = Path("./storage")
DATA_DIR.mkdir(exist_ok=True)
STORAGE_DIR.mkdir(exist_ok=True)

# Configure LlamaIndex settings
Settings.llm = OpenAI(model="gpt-4o-mini", temperature=0.1)
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small")
Settings.node_parser = SentenceSplitter(chunk_size=512, chunk_overlap=20)

# Global index variable
index = None

def get_or_create_index():
    """Get existing index or create new one"""
    global index
    if index is None:
        try:
            # Try to load existing index
            storage_context = StorageContext.from_defaults(persist_dir=str(STORAGE_DIR))
            index = load_index_from_storage(storage_context)
            logger.info("Loaded existing index from storage")
        except:
            # Create new index if none exists
            index = VectorStoreIndex([])
            logger.info("Created new empty index")
    return index

def persist_index():
    """Save index to storage"""
    if index:
        index.storage_context.persist(persist_dir=str(STORAGE_DIR))
        logger.info("Index persisted to storage")

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
    """Health check endpoint"""
    return {"message": "Synapse API is running", "status": "healthy"}

@app.post("/api/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """
    Epic 1, User Story 1.1: Document Upload
    Upload .txt or .md files to be processed and added to the vector index
    """
    try:
        # Validate file type
        if not file.filename.endswith(('.txt', '.md')):
            raise HTTPException(status_code=400, detail="Only .txt and .md files are supported")
        
        # Save uploaded file
        file_path = DATA_DIR / file.filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Load and index the document
        documents = SimpleDirectoryReader(input_files=[str(file_path)]).load_data()
        
        # Get or create index
        current_index = get_or_create_index()
        
        # Add documents to index
        for doc in documents:
            doc.metadata["source_type"] = "document"
            doc.metadata["filename"] = file.filename
        
        current_index.insert_nodes([doc.as_node() for doc in documents])
        persist_index()
        
        logger.info(f"Successfully uploaded and indexed: {file.filename}")
        return UploadResponse(message="File uploaded successfully.")
        
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.post("/api/sync/slack", response_model=SyncResponse)
async def sync_slack(channel_ids: str = Form(...)):
    """
    Epic 1, User Story 1.2: Slack Sync
    Fetch channel history and add conversations to the vector index
    """
    try:
        # Parse channel IDs (comma-separated)
        channels = [ch.strip() for ch in channel_ids.split(",")]
        
        # Initialize Slack reader
        slack_token = os.getenv("SLACK_BOT_TOKEN")
        if not slack_token:
            raise HTTPException(status_code=400, detail="SLACK_BOT_TOKEN environment variable not set")
        
        reader = SlackReader(slack_token=slack_token)
        
        # Get or create index
        current_index = get_or_create_index()
        
        # Load documents from each channel
        for channel_id in channels:
            try:
                documents = reader.load_data(channel_ids=[channel_id])
                
                # Add metadata
                for doc in documents:
                    doc.metadata["source_type"] = "slack"
                    doc.metadata["channel_id"] = channel_id
                
                # Add to index
                current_index.insert_nodes([doc.as_node() for doc in documents])
                logger.info(f"Synced Slack channel: {channel_id}")
                
            except Exception as e:
                logger.error(f"Error syncing channel {channel_id}: {str(e)}")
        
        persist_index()
        return SyncResponse(message="Slack channels synced.")
        
    except Exception as e:
        logger.error(f"Error syncing Slack: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error syncing Slack: {str(e)}")

@app.post("/api/sync/github", response_model=SyncResponse)
async def sync_github(owner: str = Form(...), repo: str = Form(...)):
    """
    Epic 1, User Story 1.3: GitHub Sync
    Fetch repo issues, PRs, comments and add them to the vector index
    """
    try:
        # Initialize GitHub reader
        github_token = os.getenv("GITHUB_TOKEN")
        if not github_token:
            raise HTTPException(status_code=400, detail="GITHUB_TOKEN environment variable not set")
        
        reader = GitHubRepositoryReader(
            github_token=github_token,
            owner=owner,
            repo=repo,
            use_parser=False,
            verbose=True
        )
        
        # Load documents (issues, PRs, etc.)
        documents = reader.load_data(branch="main")
        
        # Get or create index
        current_index = get_or_create_index()
        
        # Add metadata
        for doc in documents:
            doc.metadata["source_type"] = "github"
            doc.metadata["owner"] = owner
            doc.metadata["repo"] = repo
        
        # Add to index
        current_index.insert_nodes([doc.as_node() for doc in documents])
        persist_index()
        
        logger.info(f"Successfully synced GitHub repo: {owner}/{repo}")
        return SyncResponse(message="GitHub repo synced.")
        
    except Exception as e:
        logger.error(f"Error syncing GitHub: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error syncing GitHub: {str(e)}")

@app.post("/api/query", response_model=QueryResponse)
async def query_knowledge(request: QueryRequest):
    """
    Epic 2, User Stories 2.1 & 2.2: Query & Answer with Source Citation
    Process natural language questions and return LLM answers with sources
    """
    try:
        # Get index
        current_index = get_or_create_index()
        
        if len(current_index.docstore.docs) == 0:
            raise HTTPException(status_code=400, detail="No documents in knowledge base. Please upload documents or sync data sources first.")
        
        # Create query engine
        query_engine = current_index.as_query_engine(
            similarity_top_k=5,
            response_mode="compact"
        )
        
        # Execute query
        response = query_engine.query(request.question)
        
        # Extract sources with metadata
        sources = []
        if hasattr(response, 'source_nodes'):
            for node in response.source_nodes:
                source_info = {
                    "content": node.node.text[:200] + "..." if len(node.node.text) > 200 else node.node.text,
                    "score": float(node.score) if hasattr(node, 'score') else 0.0,
                    "metadata": node.node.metadata
                }
                sources.append(source_info)
        
        return QueryResponse(
            answer=str(response),
            sources=sources
        )
        
    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)