# Synapse Backend

FastAPI-based backend for the Synapse unified knowledge engine.

## Setup

1. **Install Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Run Server**
   ```bash
   python main.py
   ```

## API Endpoints

- **GET /** - Health check
- **POST /api/upload** - Upload documents (.txt, .md)
- **POST /api/sync/slack** - Sync Slack channels
- **POST /api/sync/github** - Sync GitHub repositories
- **POST /api/query** - Query knowledge base

## API Documentation

Visit `http://127.0.0.1:8000/docs` for interactive API documentation.

## Directory Structure

```
backend/
├── main.py              # FastAPI application
├── requirements.txt     # Python dependencies
├── .env.example        # Environment variables template
├── data/               # Uploaded documents (auto-created)
└── storage/            # Vector index storage (auto-created)
```

## Environment Variables

- `OPENAI_API_KEY` - Required for LLM and embeddings
- `SLACK_BOT_TOKEN` - Optional, for Slack integration
- `GITHUB_TOKEN` - Optional, for GitHub integration

## Usage Examples

### Upload Document
```bash
curl -X POST "http://127.0.0.1:8000/api/upload" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@document.txt"
```

### Query Knowledge Base
```bash
curl -X POST "http://127.0.0.1:8000/api/query" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the main topic of the documents?"}'
```