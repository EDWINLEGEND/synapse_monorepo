# Synapse - Unified Knowledge Engine

Synapse is a full-stack application that combines a Next.js frontend with a FastAPI backend to create a unified knowledge engine. The system supports document upload, Slack/GitHub integration, and intelligent querying using RAG (Retrieval-Augmented Generation) with OpenAI.

## Project Structure

```
Synapse-v2/
├── backend/          # FastAPI backend server
├── src/             # Next.js frontend application
├── public/          # Static assets
└── components.json  # UI component configuration
```

## Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.9 or higher)
- **npm** or **yarn** or **pnpm**
- **OpenAI API Key** (or compatible API endpoint)

## Environment Setup

### Backend Configuration

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a `.env` file with the following variables:
```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1

# Slack Integration (optional)
SLACK_BOT_TOKEN=your_slack_bot_token_here

# GitHub Integration (optional)
GITHUB_TOKEN=your_github_token_here
```

**Note**: You can use custom OpenAI-compatible endpoints by updating the `OPENAI_BASE_URL` variable.

### Frontend Configuration

The frontend uses environment variables for API communication. Create a `.env.local` file in the root directory if needed:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Installation & Setup

### 1. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Install Frontend Dependencies

```bash
# From the root directory
npm install
# or
yarn install
# or
pnpm install
```

## Running the Application

### Start the Backend Server

```bash
cd backend
python run.py
```

The backend API will be available at: `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/`

### Start the Frontend Development Server

```bash
# From the root directory
npm run dev
# or
yarn dev
# or
pnpm dev
```

The frontend will be available at: `http://localhost:3000`

## Features

### 🔍 **Knowledge Querying**
- Upload documents and query them using natural language
- Semantic search with OpenAI embeddings
- RAG-powered responses with source citations
- **Context-aware isolation**: Complete data separation between projects
- **Multi-project support**: Query specific contexts or across all projects

### 🔗 **Data Integration**
- **Slack**: Sync messages from specified channels with context tagging
- **GitHub**: Import repository content and documentation with project isolation
- **File Upload**: Support for text documents with contextId assignment

### 🎨 **Modern UI**
- Built with Next.js 15 and React 19
- Tailwind CSS for styling
- Dark/Light theme support
- Responsive design
- **Context management**: Visual indicators for project separation

## API Endpoints

### Core Endpoints
- `GET /` - Health check
- `POST /api/upload` - Upload and process documents (supports contextId parameter)
- `POST /api/query` - Query the knowledge base (supports contextId filtering)
- `POST /api/sync/slack` - Sync Slack channels (with context tagging)
- `POST /api/sync/github` - Sync GitHub repositories (with context isolation)

### Context-Aware Features
- **contextId Parameter**: All endpoints support optional contextId for project isolation
- **Data Separation**: Complete isolation between different projects/contexts
- **Query Filtering**: Responses limited to specified context when contextId provided
- **Cross-Context Prevention**: No data leakage between different contexts

### Documentation
Visit `http://localhost:8000/docs` for interactive API documentation.

## Development

### Frontend Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Backend Development
```bash
cd backend
python run.py        # Start development server with hot reload
```

## Troubleshooting

### Common Issues

1. **Backend fails to start**: Ensure all environment variables are set in `.env`
2. **OpenAI API errors**: Verify your API key and base URL configuration
3. **Frontend can't connect**: Check that the backend is running on port 8000
4. **Dependency issues**: Try deleting `node_modules` and reinstalling

### Python Dependencies
If you encounter issues with Python dependencies, try:
```bash
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both frontend and backend
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Learn More

### Next.js Resources
- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial

### FastAPI Resources
- [FastAPI Documentation](https://fastapi.tiangolo.com/) - comprehensive FastAPI guide
- [OpenAI API Documentation](https://platform.openai.com/docs) - OpenAI API reference
