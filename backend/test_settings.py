#!/usr/bin/env python3
"""
Test script to verify the centralized settings configuration.

This script tests that all environment variables are loaded correctly
from the .env file using the new Pydantic settings system.
"""

import sys
from pathlib import Path

# Add the backend directory to the Python path
sys.path.insert(0, str(Path(__file__).parent))

def test_settings():
    """Test the centralized settings configuration."""
    print("🔧 Testing Centralized Settings Configuration")
    print("=" * 50)
    
    try:
        # Import the settings
        from settings import settings
        print("✅ Successfully imported centralized settings")
        
        # Test required OpenAI settings
        print(f"\n📋 OpenAI Configuration:")
        print(f"   API Key: {'✅ Set' if settings.OPENAI_API_KEY else '❌ Missing'}")
        print(f"   Base URL: {settings.OPENAI_BASE_URL}")
        
        # Test optional integration tokens
        print(f"\n🔗 Integration Tokens:")
        print(f"   Slack Bot Token: {'✅ Set' if settings.SLACK_BOT_TOKEN else '⚠️  Not set (optional)'}")
        print(f"   GitHub Token: {'✅ Set' if settings.GITHUB_TOKEN else '⚠️  Not set (optional)'}")
        
        # Test application configuration
        print(f"\n⚙️  Application Configuration:")
        print(f"   Debug Mode: {settings.DEBUG}")
        print(f"   Log Level: {settings.LOG_LEVEL}")
        print(f"   Host: {settings.HOST}")
        print(f"   Port: {settings.PORT}")
        print(f"   ChromaDB Path: {settings.CHROMA_DB_PATH}")
        
        # Test OpenAI client initialization
        print(f"\n🤖 Testing OpenAI Client Initialization:")
        try:
            from openai import OpenAI
            client = OpenAI(
                api_key=settings.OPENAI_API_KEY,
                base_url=settings.OPENAI_BASE_URL
            )
            print("✅ OpenAI client initialized successfully")
            
            # Test a simple embedding request
            response = client.embeddings.create(
                model="text-embedding-3-small",
                input="Test configuration"
            )
            print(f"✅ OpenAI embedding test successful (dimension: {len(response.data[0].embedding)})")
            
        except Exception as e:
            print(f"❌ OpenAI client test failed: {e}")
            return False
        
        # Test LlamaIndex configuration
        print(f"\n🦙 Testing LlamaIndex Configuration:")
        try:
            from llama_index.embeddings.openai import OpenAIEmbedding
            from llama_index.llms.openai import OpenAI as LlamaOpenAI
            
            # Test embedding model
            embed_model = OpenAIEmbedding(
                model="text-embedding-3-small",
                api_key=settings.OPENAI_API_KEY,
                base_url=settings.OPENAI_BASE_URL
            )
            print("✅ LlamaIndex embedding model configured successfully")
            
            # Test LLM
            llm = LlamaOpenAI(
                model="gpt-4o-mini",
                api_key=settings.OPENAI_API_KEY,
                base_url=settings.OPENAI_BASE_URL
            )
            print("✅ LlamaIndex LLM configured successfully")
            
        except Exception as e:
            print(f"❌ LlamaIndex configuration test failed: {e}")
            return False
        
        print(f"\n🎉 All configuration tests passed!")
        print("The centralized settings system is working correctly.")
        return True
        
    except Exception as e:
        print(f"❌ Settings configuration test failed: {e}")
        return False

if __name__ == "__main__":
    success = test_settings()
    sys.exit(0 if success else 1)