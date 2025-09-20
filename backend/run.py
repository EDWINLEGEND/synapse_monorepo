#!/usr/bin/env python3
"""
Synapse Backend Server Runner
"""
import os
import sys
from pathlib import Path
import uvicorn
from dotenv import load_dotenv

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Load environment variables
env_file = backend_dir / ".env"
if env_file.exists():
    load_dotenv(env_file)
    print(f"✅ Loaded environment variables from {env_file}")
else:
    print(f"⚠️  No .env file found at {env_file}")
    print("   Copy .env.example to .env and configure your API keys")

# Check for required environment variables
required_vars = ["OPENAI_API_KEY"]
missing_vars = [var for var in required_vars if not os.getenv(var)]

if missing_vars:
    print(f"❌ Missing required environment variables: {', '.join(missing_vars)}")
    print("   Please set these in your .env file")
    sys.exit(1)

# Import the FastAPI app
from main import app

if __name__ == "__main__":
    print("🚀 Starting Synapse Backend Server...")
    print("📖 API Documentation: http://127.0.0.1:8000/docs")
    print("🔍 Health Check: http://127.0.0.1:8000/")
    
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )