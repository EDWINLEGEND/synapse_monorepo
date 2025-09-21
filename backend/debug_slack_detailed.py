#!/usr/bin/env python3
"""
Detailed debug script to understand SlackReader's message processing
"""
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def debug_slack_reader_detailed():
    """Debug SlackReader's message processing in detail"""
    print("🔍 Detailed SlackReader debugging...")
    
    try:
        from llama_index.readers.slack import SlackReader
        from slack_sdk import WebClient
        
        slack_token = os.getenv("SLACK_BOT_TOKEN")
        if not slack_token:
            print("❌ No Slack token found")
            return
            
        print(f"🔑 Using Slack token: {slack_token[:10]}...")
        
        # First, let's check what channels are available
        client = WebClient(token=slack_token)
        
        print("\n📋 Checking available channels...")
        try:
            channels_response = client.conversations_list(types="public_channel,private_channel")
            if channels_response["ok"]:
                channels = channels_response["channels"]
                print(f"✅ Found {len(channels)} channels:")
                for channel in channels[:5]:  # Show first 5 channels
                    print(f"   - {channel['name']} (ID: {channel['id']})")
                
                # Use the first available channel for testing
                if channels:
                    test_channel_id = channels[0]["id"]
                    test_channel_name = channels[0]["name"]
                    print(f"\n🎯 Using channel '{test_channel_name}' (ID: {test_channel_id}) for testing")
                    
                    # Check messages in this channel
                    print(f"\n📨 Checking messages in #{test_channel_name}...")
                    try:
                        history_response = client.conversations_history(
                            channel=test_channel_id,
                            limit=10
                        )
                        if history_response["ok"]:
                            messages = history_response["messages"]
                            print(f"✅ Found {len(messages)} messages in channel")
                            
                            for i, msg in enumerate(messages[:3]):  # Show first 3 messages
                                text = msg.get("text", "")[:100]
                                user = msg.get("user", "unknown")
                                ts = msg.get("ts", "")
                                print(f"   Message {i+1}: User {user}, TS: {ts}")
                                print(f"   Text: {text}...")
                                
                            # Now test SlackReader with this real channel
                            print(f"\n🤖 Testing SlackReader with real channel {test_channel_id}...")
                            reader = SlackReader(slack_token=slack_token)
                            documents = reader.load_data(channel_ids=[test_channel_id])
                            
                            print(f"✅ SlackReader returned {len(documents)} documents")
                            
                            for i, doc in enumerate(documents):
                                print(f"\n📄 Document {i+1}:")
                                print(f"   Text length: {len(doc.text)} characters")
                                print(f"   Metadata keys: {list(doc.metadata.keys())}")
                                print(f"   First 200 chars: {doc.text[:200]}...")
                                
                                # Count how many individual messages are in this document
                                # Messages in Slack are often separated by timestamps or user mentions
                                message_indicators = doc.text.count("User:") + doc.text.count("@") + doc.text.count("[")
                                print(f"   Estimated messages in document: {message_indicators}")
                                
                        else:
                            print(f"❌ Failed to get channel history: {history_response['error']}")
                            
                    except Exception as e:
                        print(f"❌ Error checking channel history: {e}")
                        
                else:
                    print("❌ No channels available for testing")
                    
            else:
                print(f"❌ Failed to list channels: {channels_response['error']}")
                
        except Exception as e:
            print(f"❌ Error listing channels: {e}")
            
    except Exception as e:
        print(f"❌ Debug failed: {e}")

if __name__ == "__main__":
    debug_slack_reader_detailed()