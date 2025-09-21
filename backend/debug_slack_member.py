#!/usr/bin/env python3
"""
Debug script to test SlackReader with a channel where bot is a member
"""
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def debug_member_channel():
    """Debug SlackReader with the all-zentinel channel where bot is a member"""
    print("🔍 Testing SlackReader with member channel...")
    
    try:
        from llama_index.readers.slack import SlackReader
        from slack_sdk import WebClient
        
        slack_token = os.getenv("SLACK_BOT_TOKEN")
        if not slack_token:
            print("❌ No Slack token found")
            return
            
        print(f"🔑 Using Slack token: {slack_token[:10]}...")
        
        client = WebClient(token=slack_token)
        
        # Test with the channel where bot is a member
        test_channel_id = "C09G7M4ML4A"  # all-zentinel
        test_channel_name = "all-zentinel"
        
        print(f"\n🎯 Testing with #{test_channel_name} (ID: {test_channel_id})")
        
        # Check messages first
        print(f"📨 Checking messages in #{test_channel_name}...")
        try:
            history_response = client.conversations_history(
                channel=test_channel_id,
                limit=50  # Get more messages to see the pattern
            )
            if history_response["ok"]:
                messages = history_response["messages"]
                print(f"✅ Found {len(messages)} messages in channel")
                
                # Analyze message types
                message_types = {}
                user_messages = 0
                bot_messages = 0
                
                for i, msg in enumerate(messages):
                    text = msg.get("text", "")
                    user = msg.get("user", "unknown")
                    ts = msg.get("ts", "")
                    msg_type = msg.get("type", "message")
                    subtype = msg.get("subtype", "")
                    
                    # Count message types
                    key = f"{msg_type}:{subtype}" if subtype else msg_type
                    message_types[key] = message_types.get(key, 0) + 1
                    
                    if subtype == "bot_message":
                        bot_messages += 1
                    elif msg_type == "message" and not subtype:
                        user_messages += 1
                    
                    if i < 10:  # Show first 10 messages
                        print(f"   Message {i+1}: Type={msg_type}, Subtype={subtype}")
                        print(f"     User: {user}, TS: {ts}")
                        print(f"     Text: {text[:100]}...")
                        print()
                
                print(f"\n📊 Message Analysis:")
                print(f"   Total messages: {len(messages)}")
                print(f"   User messages: {user_messages}")
                print(f"   Bot messages: {bot_messages}")
                print(f"   Message types: {json.dumps(message_types, indent=2)}")
                
                # Now test SlackReader
                print(f"\n🤖 Testing SlackReader with {len(messages)} messages...")
                reader = SlackReader(slack_token=slack_token)
                documents = reader.load_data(channel_ids=[test_channel_id])
                
                print(f"✅ SlackReader returned {len(documents)} documents from {len(messages)} messages")
                print(f"📈 Conversion ratio: {len(messages)} messages → {len(documents)} documents")
                
                for i, doc in enumerate(documents):
                    print(f"\n📄 Document {i+1}:")
                    print(f"   Text length: {len(doc.text)} characters")
                    print(f"   Metadata keys: {list(doc.metadata.keys())}")
                    
                    # Show metadata details
                    for key, value in doc.metadata.items():
                        if isinstance(value, str) and len(value) > 100:
                            print(f"   {key}: {value[:100]}...")
                        else:
                            print(f"   {key}: {value}")
                    
                    # Analyze document content structure
                    lines = doc.text.split('\n')
                    non_empty_lines = [line.strip() for line in lines if line.strip()]
                    print(f"   Total lines: {len(lines)}")
                    print(f"   Non-empty lines: {len(non_empty_lines)}")
                    
                    # Look for patterns that indicate multiple messages
                    user_mentions = doc.text.count("User:")
                    timestamps = doc.text.count("Timestamp:")
                    message_separators = doc.text.count("---")
                    
                    print(f"   Potential message indicators:")
                    print(f"     User mentions: {user_mentions}")
                    print(f"     Timestamps: {timestamps}")
                    print(f"     Separators: {message_separators}")
                    
                    print(f"   First 500 characters:")
                    print(f"   {doc.text[:500]}...")
                    
            else:
                print(f"❌ Failed to get channel history: {history_response['error']}")
                
        except Exception as e:
            print(f"❌ Error checking channel: {e}")
            
    except Exception as e:
        print(f"❌ Debug failed: {e}")

if __name__ == "__main__":
    debug_member_channel()