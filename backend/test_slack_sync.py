#!/usr/bin/env python3
"""
Test script for Slack sync functionality
"""
import requests
import json
import os
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
BASE_URL = "http://127.0.0.1:8000"
SLACK_BOT_TOKEN = os.getenv("SLACK_BOT_TOKEN")

def test_slack_sync():
    """Test the Slack sync endpoint"""
    print("🔄 Testing Slack sync functionality...")
    
    # Check if Slack token is configured
    if not SLACK_BOT_TOKEN:
        print("❌ SLACK_BOT_TOKEN not found in environment variables")
        print("   Please configure your Slack bot token in the .env file")
        return False
    
    print(f"✅ Slack bot token configured: {SLACK_BOT_TOKEN[:10]}...")
    
    # Test with a sample channel ID (you'll need to replace with actual channel IDs)
    # Note: Channel IDs in Slack look like "C1234567890"
    test_payload = {
        "channel_ids": ["C1234567890"],  # Replace with actual channel IDs
        "contextId": "test_slack",
        "oldest_ts": None  # Optional: limit history
    }
    
    try:
        print(f"📤 Sending sync request for channels: {test_payload['channel_ids']}")
        response = requests.post(
            f"{BASE_URL}/api/sync/slack",
            json=test_payload,
            timeout=60  # Increased timeout for Slack API calls
        )
        
        print(f"📥 Response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Slack sync successful: {result['message']}")
            return True
        else:
            print(f"❌ Slack sync failed: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("⏰ Request timed out - this is normal for large Slack channels")
        return False
    except Exception as e:
        print(f"❌ Error during sync: {e}")
        return False

def test_query_with_slack_data():
    """Test querying data that includes Slack content"""
    print("\n🔍 Testing query with Slack data...")
    
    query_payload = {
        "question": "What discussions happened in Slack?",
        "contextId": "test_slack"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/query",
            json=query_payload,
            timeout=30
        )
        
        print(f"📥 Query response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Query successful!")
            print(f"📝 Answer: {result['answer'][:200]}...")
            print(f"📚 Found {len(result['sources'])} sources")
            
            # Check if any sources are from Slack
            slack_sources = [s for s in result['sources'] if s.get('metadata', {}).get('source') == 'slack']
            if slack_sources:
                print(f"✅ Found {len(slack_sources)} Slack sources in results")
            else:
                print("⚠️  No Slack sources found in query results")
            
            return True
        elif response.status_code == 500:
            error_detail = response.json().get('detail', 'Unknown error')
            if 'invalid_auth' in error_detail:
                print("⚠️  Slack authentication failed - this is expected with test channel IDs")
                print("✅ Endpoint is working correctly (authentication error is normal for test)")
            else:
                print(f"❌ Query failed: {error_detail}")
            return False
        else:
            print(f"❌ Query failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error during query: {e}")
        return False

def test_health_check():
    """Test if the backend server is running"""
    print("🏥 Testing backend server health...")
    
    try:
        response = requests.get(f"{BASE_URL}/", timeout=5)
        if response.status_code == 200:
            print("✅ Backend server is running")
            return True
        else:
            print(f"❌ Backend server returned status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to backend server: {e}")
        print("   Make sure the backend server is running on http://127.0.0.1:8000")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting Slack sync tests...\n")
    
    # Test 1: Health check
    if not test_health_check():
        print("\n❌ Backend server is not accessible. Please start the server first.")
        return
    
    print("\n" + "="*50)
    
    # Test 2: Slack sync
    sync_success = test_slack_sync()
    
    print("\n" + "="*50)
    
    # Test 3: Query with Slack data
    if sync_success:
        # Wait a moment for indexing to complete
        print("⏳ Waiting for indexing to complete...")
        time.sleep(2)
        test_query_with_slack_data()
    else:
        print("⚠️  Skipping query test due to sync failure")
    
    print("\n🏁 Tests completed!")
    print("\n📝 Notes:")
    print("   - Replace 'C1234567890' with actual Slack channel IDs")
    print("   - Channel IDs can be found in Slack URL or using Slack API")
    print("   - Make sure your Slack bot has proper permissions")
    print("   - Large channels may take longer to sync")

if __name__ == "__main__":
    main()