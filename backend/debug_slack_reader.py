#!/usr/bin/env python3
"""
Debug script to understand SlackReader's OpenAI usage
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_slack_reader_without_openai():
    """Test SlackReader without OpenAI configuration"""
    print("🔍 Testing SlackReader OpenAI dependency...")
    
    try:
        # Import SlackReader
        from llama_index.readers.slack import SlackReader
        print("✅ SlackReader imported successfully")
        
        # Try to create SlackReader with valid Slack token but no OpenAI
        slack_token = os.getenv("SLACK_BOT_TOKEN")
        if not slack_token:
            print("❌ No Slack token found")
            return
            
        print(f"🔑 Using Slack token: {slack_token[:10]}...")
        
        # Initialize SlackReader
        reader = SlackReader(slack_token=slack_token)
        print("✅ SlackReader initialized successfully")
        
        # Try to load data (this might trigger OpenAI usage)
        print("📥 Attempting to load data from test channel...")
        try:
            documents = reader.load_data(channel_ids=["C1234567890"])
            print(f"✅ Load data completed: {len(documents)} documents")
        except Exception as e:
            print(f"❌ Load data failed: {e}")
            if "401" in str(e) and "openai" in str(e).lower():
                print("🔍 This confirms SlackReader uses OpenAI internally")
            elif "invalid_auth" in str(e):
                print("🔍 This is a Slack authentication error, not OpenAI")
            else:
                print(f"🔍 Unknown error type: {type(e)}")
        
    except Exception as e:
        print(f"❌ SlackReader test failed: {e}")
        if "401" in str(e) and "openai" in str(e).lower():
            print("🔍 SlackReader uses OpenAI during initialization")

def test_with_openai_config():
    """Test SlackReader with OpenAI configuration"""
    print("\n🤖 Testing SlackReader with OpenAI configuration...")
    
    try:
        # Configure LlamaIndex settings
        from llama_index.core import Settings
        from llama_index.embeddings.openai import OpenAIEmbedding
        from llama_index.llms.openai import OpenAI as LlamaOpenAI
        from settings import settings
        
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
        
        # Now try SlackReader
        from llama_index.readers.slack import SlackReader
        slack_token = os.getenv("SLACK_BOT_TOKEN")
        
        reader = SlackReader(slack_token=slack_token)
        print("✅ SlackReader initialized with OpenAI config")
        
        # Try to load data
        try:
            documents = reader.load_data(channel_ids=["C1234567890"])
            print(f"✅ Load data completed: {len(documents)} documents")
        except Exception as e:
            print(f"❌ Load data failed: {e}")
            if "invalid_auth" in str(e) and "slack" in str(e).lower():
                print("✅ This is expected - invalid Slack channel ID")
            else:
                print(f"🔍 Unexpected error: {type(e)}")
        
    except Exception as e:
        print(f"❌ Test with OpenAI config failed: {e}")

if __name__ == "__main__":
    test_slack_reader_without_openai()
    test_with_openai_config()