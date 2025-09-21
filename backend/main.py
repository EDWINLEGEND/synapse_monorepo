from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, ValidationError, Field
from typing import List, Dict, Any, Optional
import tempfile
import os
import logging
import shutil
import json
import uvicorn
from pathlib import Path

# Import settings and vector store
from settings import settings
from vector_store_client import VectorStoreClient

# LlamaIndex imports
from llama_index.core import VectorStoreIndex, StorageContext, Settings, SimpleDirectoryReader
from llama_index.core.node_parser import SentenceSplitter
from llama_index.core.vector_stores import MetadataFilters, MetadataFilter
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.llms.openai import OpenAI as LlamaOpenAI
from llama_index.readers.github import GithubRepositoryReader, GithubClient
from llama_index.readers.slack import SlackReader

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Synapse Backend API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom exception handler for validation errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    """Handle Pydantic validation errors with user-friendly messages."""
    errors = []
    for error in exc.errors():
        field = error.get('loc', ['unknown'])[-1]  # Get the field name
        error_type = error.get('type', 'validation_error')
        
        if error_type == 'missing':
            errors.append(f"{field} is required")
        elif error_type == 'string_too_short':
            errors.append(f"{field} cannot be empty")
        elif error_type == 'value_error':
            errors.append(f"{field} has an invalid value")
        else:
            errors.append(f"{field}: {error.get('msg', 'validation error')}")
    
    error_message = "; ".join(errors) if errors else "Invalid request data"
    logger.error(f"Validation error: {error_message}")
    
    return JSONResponse(
        status_code=422,
        content={"detail": error_message}
    )

# Create directories
DATA_DIR = Path("./data")
STORAGE_DIR = Path("./storage")
TEMP_UPLOADS_DIR = Path("./temp_uploads")
DATA_DIR.mkdir(exist_ok=True)
STORAGE_DIR.mkdir(exist_ok=True)
TEMP_UPLOADS_DIR.mkdir(exist_ok=True)

# Initialize OpenAI client (optional for testing)
client = None
try:
    if settings.OPENAI_API_KEY:
        client = OpenAI(
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL
        )
    else:
        logger.warning("OpenAI API key not found. Some features may not work.")
except Exception as e:
    logger.warning(f"Failed to initialize OpenAI client: {e}")

# Initialize vector store client
vector_store = VectorStoreClient()

# Pydantic models
class QueryRequest(BaseModel):
    question: str
    contextId: str

class QueryResponse(BaseModel):
    answer: str
    sources: List[Dict[str, Any]]

class SyncResponse(BaseModel):
    message: str

class UploadResponse(BaseModel):
    message: str

class GitHubRepoRequest(BaseModel):
    owner: str = Field(..., min_length=1, description="Repository owner username or organization")
    repo: str = Field(..., min_length=1, description="Repository name")
    branch: str = Field(default="main", min_length=1, description="Branch name")
    contextId: str = Field(..., min_length=1, description="Context identifier")

class SlackSyncRequest(BaseModel):
    channel_ids: List[str]
    contextId: str
    oldest_ts: str | None = None  # Optional timestamp to limit history

class TransformRequest(BaseModel):
    question: str
    contextId: str

class TransformResponse(BaseModel):
    transformed_question: str

# API Endpoints
@app.get("/")
async def root():
    return {"message": "Synapse API is running", "version": "1.0.0"}

@app.post("/api/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...), contextId: str = Form(...)):
    """Upload and process a document using LlamaIndex."""
    temp_file_path = None
    
    try:
        logger.info(f"Starting upload process for file: {file.filename}, contextId: {contextId}")
        
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Save uploaded file to temporary location
        temp_file_path = TEMP_UPLOADS_DIR / file.filename
        logger.info(f"Saving file to temporary location: {temp_file_path}")
        
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Also save to data directory for persistence
        file_path = DATA_DIR / file.filename
        logger.info(f"Saving file to data directory: {file_path}")
        
        with open(file_path, "wb") as buffer:
            file.file.seek(0)  # Reset file pointer
            shutil.copyfileobj(file.file, buffer)
        
        # Load the document using LlamaIndex SimpleDirectoryReader
        logger.info(f"Loading document with SimpleDirectoryReader: {temp_file_path}")
        documents = SimpleDirectoryReader(input_files=[str(temp_file_path)]).load_data()
        
        if not documents:
            raise HTTPException(status_code=400, detail="Failed to load document content")
        
        # Add contextId metadata to all documents
        logger.info(f"Adding metadata to {len(documents)} document(s)")
        for doc in documents:
            doc.metadata.update({
                "source": "file_upload",
                "filename": file.filename,
                "contextId": contextId
            })
        
        # Create the index using LlamaIndex - this handles chunking, embedding, and storage automatically
        logger.info("Creating vector index from documents")
        index = VectorStoreIndex.from_documents(
            documents,
            storage_context=vector_store.get_storage_context()
        )
        
        # Clean up the temporary file
        if temp_file_path and temp_file_path.exists():
            temp_file_path.unlink()
            logger.info(f"Cleaned up temporary file: {temp_file_path}")
        
        logger.info(f"Successfully processed {file.filename} using LlamaIndex for context: {contextId}")
        return UploadResponse(message=f"Successfully uploaded and processed {file.filename}")
        
    except HTTPException:
        # Re-raise HTTP exceptions (validation errors)
        raise
    except FileNotFoundError as e:
        logger.error(f"File not found error during upload: {e}", exc_info=True)
        if temp_file_path and temp_file_path.exists():
            temp_file_path.unlink()
        raise HTTPException(
            status_code=400, 
            detail=f"File processing failed: {str(e)}"
        )
    except PermissionError as e:
        logger.error(f"Permission error during file upload: {e}", exc_info=True)
        if temp_file_path and temp_file_path.exists():
            temp_file_path.unlink()
        raise HTTPException(
            status_code=500, 
            detail="File system permission error. Please try again or contact support."
        )
    except Exception as e:
        # Clean up temporary file if it exists
        if temp_file_path and temp_file_path.exists():
            temp_file_path.unlink()
            logger.info(f"Cleaned up temporary file after error: {temp_file_path}")
        
        # Log the full error with traceback for debugging
        logger.error(f"Unexpected error during file upload: {e}", exc_info=True)
        
        # Check for specific error types and provide user-friendly messages
        error_message = str(e)
        if "OpenAI" in error_message or "API" in error_message:
            raise HTTPException(
                status_code=503, 
                detail="External AI service is temporarily unavailable. Please try again later."
            )
        elif "ChromaDB" in error_message or "vector" in error_message.lower():
            raise HTTPException(
                status_code=503, 
                detail="Vector database is temporarily unavailable. Please try again later."
            )
        elif "embedding" in error_message.lower():
            raise HTTPException(
                status_code=503, 
                detail="Document embedding service is temporarily unavailable. Please try again later."
            )
        else:
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to process file upload. Error: {error_message}"
            )



@app.post("/api/sync/slack")
async def sync_slack(
    channel_ids: str = Form(...),
    contextId: str = Form(None),
    token: str = Form(None)
):
    """Sync data from Slack channels using LlamaIndex SlackReader."""
    try:
        import asyncio
        
        # Configure LlamaIndex settings for OpenAI using custom embedding
        from custom_openai_embedding import CustomOpenAIEmbedding
        
        Settings.embed_model = CustomOpenAIEmbedding(model="text-embedding-3-small")
        Settings.llm = LlamaOpenAI(
            model="gpt-4o-mini", 
            api_key=settings.OPENAI_API_KEY,
            api_base=settings.OPENAI_BASE_URL
        )
        
        # Parse comma-separated channel IDs
        if not channel_ids or not channel_ids.strip():
            raise HTTPException(
                status_code=422, 
                detail="Please provide at least one Slack channel ID"
            )
        
        channel_list = [ch.strip() for ch in channel_ids.split(',') if ch.strip()]
        
        if not channel_list:
            raise HTTPException(
                status_code=422, 
                detail="Please provide valid Slack channel IDs"
            )
        
        logger.info(f"Slack sync requested for channels: {channel_list} with context: {contextId}")
        
        # Get Slack token from form data or environment
        slack_token = token or settings.SLACK_BOT_TOKEN
        if not slack_token:
            raise HTTPException(status_code=422, detail="Slack token is required for syncing")
        
        # Function to run Slack sync in a separate thread
        def sync_slack_channels():
            try:
                logger.info(f"Starting Slack sync for channels: {channel_list}")
                
                # Initialize Slack reader
                reader = SlackReader(slack_token=slack_token)
                logger.info("SlackReader initialized successfully")
                
                # Load data from specified channels
                load_kwargs = {"channel_ids": channel_list}
                logger.info(f"Calling SlackReader.load_data with parameters: {load_kwargs}")
                
                # This is the critical call where silent failures often occur
                slack_documents = reader.load_data(**load_kwargs)
                
                # Add this new log line to track what SlackReader actually returned
                logger.info(f"SlackReader returned {len(slack_documents)} documents.")
                
                # Check for empty results and provide detailed warning
                if not slack_documents:
                    logger.warning("No documents were returned from SlackReader. This could indicate:")
                    logger.warning("1. Bot is not a member of the specified channel(s)")
                    logger.warning("2. Missing required Slack scopes (channels:history, groups:history, etc.)")
                    logger.warning("3. Channel ID(s) are invalid or channel is empty")
                    logger.warning("4. Bot token lacks proper permissions")
                    return []
                
                # Log details about the documents retrieved
                logger.info(f"Successfully retrieved {len(slack_documents)} documents from Slack")
                for i, doc in enumerate(slack_documents[:3]):  # Log first 3 documents for debugging
                    logger.info(f"Document {i+1}: {len(doc.text)} characters, metadata keys: {list(doc.metadata.keys())}")
                
                # Add custom metadata tags for easy filtering later
                # Convert channel_list to JSON string to avoid ChromaDB metadata type errors
                channels_json_string = json.dumps(channel_list)
                
                for doc in slack_documents:
                    doc.metadata.update({
                        "source": "slack",
                        "synced_from_channels": channels_json_string,
                        "contextId": contextId
                    })
                
                logger.info(f"Added metadata to {len(slack_documents)} documents")
                return slack_documents
                
            except Exception as e:
                logger.error(f"Error in sync_slack_channels: {e}", exc_info=True)
                raise
        
        # Run the sync operation in a separate thread to avoid event loop conflicts
        slack_documents = await asyncio.to_thread(sync_slack_channels)
        
        # Check if we got any documents and provide appropriate response
        if not slack_documents:
            logger.warning("Slack sync completed but no documents were retrieved")
            return {
                "status": "warning",
                "message": "Sync completed, but 0 messages were found. Ensure the bot is in the channel and the channel is not empty.",
                "syncedCount": 0,
                "document_count": 0,
                "channels": channel_list,
                "suggestions": [
                    "Verify bot is a member of the channel (use /who command in Slack)",
                    "Check bot token scopes include channels:history, groups:history, etc.",
                    "Confirm channel IDs are correct and channels contain messages"
                ]
            }
        
        logger.info(f"Processing {len(slack_documents)} documents for vector store insertion")
        
        # Create ChromaVectorStore from existing collection
        chroma_vector_store = ChromaVectorStore(chroma_collection=vector_store.collection)
        
        # Load the existing index from the vector store
        index = VectorStoreIndex.from_vector_store(chroma_vector_store)
        
        # Insert the new Slack documents into the existing index
        for doc in slack_documents:
            index.insert(doc)
        
        logger.info(f"Successfully inserted {len(slack_documents)} documents into vector store")
        
        return {
            "status": "success",
            "message": f"Successfully synced {len(slack_documents)} documents from Slack channels: {', '.join(channel_list)}",
            "syncedCount": len(slack_documents),
            "document_count": len(slack_documents),
            "channels": channel_list
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions to preserve status codes and messages
        raise
    except Exception as e:
        logger.error(f"Error syncing Slack: {e}")
        raise HTTPException(status_code=500, detail=f"Slack sync failed: {str(e)}")

@app.post("/api/sync/github", response_model=SyncResponse)
async def sync_github(repo_details: GitHubRepoRequest):
    """Sync data from GitHub repository using LlamaIndex GithubRepositoryReader."""
    try:
        import asyncio
        
        logger.info(f"GitHub sync requested for {repo_details.owner}/{repo_details.repo} with context: {repo_details.contextId}")
        
        # Get GitHub token from environment
        github_token = settings.GITHUB_TOKEN
        if not github_token:
            raise HTTPException(status_code=400, detail="GitHub token not configured")
        
        # Function to run GitHub sync in a separate thread
        def sync_github_repo():
            # Initialize GitHub client and reader
            github_client = GithubClient(github_token=github_token, verbose=True)
            reader = GithubRepositoryReader(
                github_client=github_client,
                owner=repo_details.owner,
                repo=repo_details.repo,
                # Filter to include only relevant file types
                filter_file_extensions=(['.py', '.ts', '.js', '.md', '.txt', '.json', '.yml', '.yaml'], GithubRepositoryReader.FilterType.INCLUDE),
                # Set verbose=True to fetch issues and PRs as well
                verbose=True,
                concurrent_requests=5,
            )
            
            # Load the data from the repository
            github_documents = reader.load_data(branch=repo_details.branch)
            
            # Add custom metadata tags for easy filtering later
            for doc in github_documents:
                doc.metadata.update({
                    "source": "github",
                    "owner": repo_details.owner,
                    "repo": repo_details.repo,
                    "branch": repo_details.branch,
                    "contextId": repo_details.contextId
                })
            
            return github_documents
        
        # Run the sync operation in a separate thread to avoid event loop conflicts
        github_documents = await asyncio.to_thread(sync_github_repo)
        
        # Create ChromaVectorStore from existing collection
        chroma_vector_store = ChromaVectorStore(chroma_collection=vector_store.collection)
        
        # Load the existing index from the vector store
        index = VectorStoreIndex.from_vector_store(chroma_vector_store)
        
        # Insert the new GitHub documents into the existing index
        for doc in github_documents:
            index.insert(doc)
        
        return SyncResponse(message=f"Successfully synced {len(github_documents)} documents from {repo_details.owner}/{repo_details.repo}")
        
    except Exception as e:
        logger.error(f"Error syncing GitHub: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/sync/cancel", response_model=SyncResponse)
async def cancel_sync():
    """Cancel ongoing sync operations."""
    try:
        # In a real implementation, you would cancel ongoing sync operations
        # For now, we'll just return a success message
        logger.info("Sync cancellation requested")
        return SyncResponse(message="Sync operations cancelled successfully")
        
    except Exception as e:
        logger.error(f"Error cancelling sync: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/query", response_model=QueryResponse)
async def query_knowledge(request: QueryRequest):
    """Query the knowledge base using RAG with LlamaIndex."""
    try:
        # Configure LlamaIndex settings using custom embedding
        from custom_openai_embedding import CustomOpenAIEmbedding
        
        Settings.embed_model = CustomOpenAIEmbedding(model="text-embedding-3-small")
        Settings.llm = LlamaOpenAI(
            model="gpt-4o-mini", 
            api_key=settings.OPENAI_API_KEY,
            api_base=settings.OPENAI_BASE_URL
        )
        
        # Create ChromaVectorStore from existing collection
        chroma_vector_store = ChromaVectorStore(chroma_collection=vector_store.collection)
        
        # Load the index from the vector store
        index = VectorStoreIndex.from_vector_store(chroma_vector_store)
        
        # Create metadata filter for contextId
        filters = MetadataFilters(
            filters=[
                MetadataFilter(key="contextId", value=request.contextId)
            ]
        )
        
        # Create query engine with context filter
        query_engine = index.as_query_engine(filters=filters)
        
        # Query the engine
        response = query_engine.query(request.question)
        
        # Process the response
        answer = response.response
        sources = []
        
        for i, source_node in enumerate(response.source_nodes):
            # Extract metadata from the source node
            metadata = source_node.metadata or {}
            
            # Create source entry
            sources.append({
                "id": source_node.node_id,
                "content": source_node.get_content(),
                "metadata": metadata
            })
        
        return QueryResponse(answer=answer, sources=sources)
        
    except ImportError as e:
        logger.error(f"Import error in query endpoint: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Configuration error: Missing required dependencies. Please check server setup."
        )
    except Exception as e:
        from openai import APIError, RateLimitError, APIConnectionError
        
        # Handle specific OpenAI API errors
        if isinstance(e, APIError):
            logger.error(f"OpenAI API error during query: {e}", exc_info=True)
            raise HTTPException(
                status_code=503,
                detail=f"AI service is currently unavailable. Please try again later. Error: {str(e)}"
            )
        elif isinstance(e, RateLimitError):
            logger.error(f"OpenAI rate limit exceeded: {e}", exc_info=True)
            raise HTTPException(
                status_code=429,
                detail="AI service rate limit exceeded. Please try again in a few moments."
            )
        elif isinstance(e, APIConnectionError):
            logger.error(f"OpenAI connection error: {e}", exc_info=True)
            raise HTTPException(
                status_code=503,
                detail="Unable to connect to AI service. Please check your internet connection and try again."
            )
        
        # Handle ChromaDB/Vector store errors
        elif "chroma" in str(e).lower() or "vector" in str(e).lower():
            logger.error(f"Vector database error during query: {e}", exc_info=True)
            raise HTTPException(
                status_code=503,
                detail="Vector database is temporarily unavailable. Please try again later."
            )
        
        # Handle general errors
        else:
            logger.error(f"Unexpected error during query: {e}", exc_info=True)
            raise HTTPException(
                status_code=500,
                detail="An internal server error occurred while processing your query. Please try again later."
            )

@app.post("/api/query/transform", response_model=TransformResponse)
async def transform_query(request: TransformRequest):
    """Transform a user's simple question into a detailed, optimized query for better RAG results."""
    try:
        # Define the powerful system prompt for query transformation
        system_prompt = (
            "You are an expert at rewriting user questions into detailed, specific search queries "
            "for a Retrieval-Augmented Generation (RAG) system. The system contains knowledge from "
            "documents, GitHub issues, pull requests, and Slack conversations. "
            "Rewrite the following user question to be as specific as possible, including potential "
            "keywords and concepts that would help find the most relevant information. "
            "Focus on technical details, code snippets, error messages, feature names, and context "
            "that would improve search accuracy. Make the query comprehensive but focused."
        )
        
        # Use the existing OpenAI client to call GPT-4o-mini
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.question}
            ],
            temperature=0.3,  # Lower temperature for more consistent transformations
            max_tokens=500    # Reasonable limit for transformed queries
        )
        
        transformed_question = response.choices[0].message.content.strip()
        
        logger.info(f"Query transformed: '{request.question}' -> '{transformed_question}'")
        
        return TransformResponse(transformed_question=transformed_question)
        
    except Exception as e:
        logger.error(f"Error transforming query: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to transform query: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)