#!/usr/bin/env python3
"""
OpenAI API Diagnostic Script
This script tests the OpenAI proxy service in isolation to diagnose connection issues.
"""

import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from settings import Settings
from openai import OpenAI

def test_openai_connection():
    """Test OpenAI API connection and basic functionality"""
    print("🔍 OpenAI API Diagnostic Test")
    print("=" * 50)
    
    try:
        # Load settings
        settings = Settings()
        print(f"📋 Configuration:")
        print(f"   API Key: {settings.OPENAI_API_KEY[:20]}..." if settings.OPENAI_API_KEY else "   API Key: Not set")
        print(f"   Base URL: {settings.OPENAI_BASE_URL}")
        print()
        
        # Initialize OpenAI client
        print("🤖 Initializing OpenAI client...")
        client = OpenAI(
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL
        )
        print("✅ Client initialized successfully")
        print()
        
        # Test 1: Simple embedding request
        print("🧪 Test 1: Testing embeddings endpoint...")
        try:
            response = client.embeddings.create(
                model="text-embedding-ada-002",
                input="This is a test message for embedding."
            )
            embedding_dim = len(response.data[0].embedding)
            print(f"✅ Embeddings test successful (dimension: {embedding_dim})")
        except Exception as e:
            print(f"❌ Embeddings test failed: {e}")
            return False
        
        print()
        
        # Test 2: Simple chat completion request
        print("🧪 Test 2: Testing chat completions endpoint...")
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "user", "content": "Say 'Hello, this is a test!'"}
                ],
                max_tokens=50
            )
            message = response.choices[0].message.content
            print(f"✅ Chat completion test successful")
            print(f"   Response: {message}")
        except Exception as e:
            print(f"❌ Chat completion test failed: {e}")
            return False
        
        print()
        print("🎉 All OpenAI API tests passed successfully!")
        return True
        
    except Exception as e:
        print(f"💥 Critical error during OpenAI testing: {e}")
        print(f"   Error type: {type(e).__name__}")
        return False

def diagnose_connection_issues():
    """Provide diagnostic information for connection issues"""
    print("\n🔧 Connection Diagnostic Information:")
    print("=" * 50)
    
    settings = Settings()
    
    print("📊 Current Configuration:")
    print(f"   OPENAI_API_KEY: {'Set' if settings.OPENAI_API_KEY else 'Not set'}")
    print(f"   OPENAI_BASE_URL: {settings.OPENAI_BASE_URL}")
    print()
    
    print("🌐 Possible Issues:")
    print("   1. winfunc.com proxy service is down or overloaded")
    print("   2. API key is invalid or expired")
    print("   3. Rate limiting or billing issues")
    print("   4. Network connectivity problems")
    print("   5. Proxy service configuration issues")
    print()
    
    print("🛠️  Recommended Actions:")
    print("   1. Check winfunc.com service status")
    print("   2. Verify API key validity")
    print("   3. Try again in a few minutes")
    print("   4. Contact winfunc.com support if issues persist")

if __name__ == "__main__":
    success = test_openai_connection()
    
    if not success:
        diagnose_connection_issues()
        sys.exit(1)
    else:
        print("\n✅ OpenAI proxy service is working correctly!")
        sys.exit(0)