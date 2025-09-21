#!/usr/bin/env python3
"""
Debug script to join channels and test SlackReader
"""
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def debug_with_channel_join():
    """Debug SlackReader after joining channels"""
    print("🔍 Debugging SlackReader with channel joining...")
    
    try:
        from llama_index.readers.slack import SlackReader
        from slack_sdk import WebClient
        
        slack_token = os.getenv("SLACK_BOT_TOKEN")
        if not slack_token:
            print("❌ No Slack token found")
            return
            
        print(f"🔑 Using Slack token: {slack_token[:10]}...")
        
        client = WebClient(token=slack_token)
        
        print("\n📋 Checking available channels...")
        try:
            channels_response = client.conversations_list(types="public_channel,private_channel")
            if channels_response["ok"]:
                channels = channels_response["channels"]
                print(f"✅ Found {len(channels)} channels:")
                
                for channel in channels:
                    channel_id = channel['id']
                    channel_name = channel['name']
                    is_member = channel.get('is_member', False)
                    print(f"   - {channel_name} (ID: {channel_id}) - Member: {is_member}")
                    
                    # Try to join the channel if not a member
                    if not is_member:
                        print(f"   🔗 Attempting to join #{channel_name}...")
                        try:
                            join_response = client.conversations_join(channel=channel_id)
                            if join_response["ok"]:
                                print(f"   ✅ Successfully joined #{channel_name}")
                            else:
                                print(f"   ❌ Failed to join #{channel_name}: {join_response['error']}")
                        except Exception as e:
                            print(f"   ❌ Error joining #{channel_name}: {e}")
                
                # Now test with the first channel
                if channels:
                    test_channel = channels[0]
                    test_channel_id = test_channel["id"]
                    test_channel_name = test_channel["name"]
                    
                    print(f"\n🎯 Testing SlackReader with #{test_channel_name} (ID: {test_channel_id})")
                    
                    # Check messages first
                    print(f"📨 Checking messages in #{test_channel_name}...")
                    try:
                        history_response = client.conversations_history(
                            channel=test_channel_id,
                            limit=20
                        )
                        if history_response["ok"]:
                            messages = history_response["messages"]
                            print(f"✅ Found {len(messages)} messages in channel")
                            
                            # Show message details
                            for i, msg in enumerate(messages[:5]):
                                text = msg.get("text", "")
                                user = msg.get("user", "unknown")
                                ts = msg.get("ts", "")
                                msg_type = msg.get("type", "message")
                                subtype = msg.get("subtype", "")
                                
                                print(f"   Message {i+1}: Type={msg_type}, Subtype={subtype}")
                                print(f"     User: {user}, TS: {ts}")
                                print(f"     Text: {text[:100]}...")
                                
                            # Now test SlackReader
                            print(f"\n🤖 Testing SlackReader with {len(messages)} messages...")
                            reader = SlackReader(slack_token=slack_token)
                            documents = reader.load_data(channel_ids=[test_channel_id])
                            
                            print(f"✅ SlackReader returned {len(documents)} documents from {len(messages)} messages")
                            
                            for i, doc in enumerate(documents):
                                print(f"\n📄 Document {i+1}:")
                                print(f"   Text length: {len(doc.text)} characters")
                                print(f"   Metadata: {json.dumps(doc.metadata, indent=2)}")
                                
                                # Analyze the document content
                                lines = doc.text.split('\n')
                                non_empty_lines = [line.strip() for line in lines if line.strip()]
                                print(f"   Non-empty lines: {len(non_empty_lines)}")
                                print(f"   First few lines:")
                                for j, line in enumerate(non_empty_lines[:5]):
                                    print(f"     {j+1}: {line[:80]}...")
                                    
                        else:
                            print(f"❌ Failed to get channel history: {history_response['error']}")
                            
                    except Exception as e:
                        print(f"❌ Error checking channel: {e}")
                        
            else:
                print(f"❌ Failed to list channels: {channels_response['error']}")
                
        except Exception as e:
            print(f"❌ Error with channels: {e}")
            
    except Exception as e:
        print(f"❌ Debug failed: {e}")

if __name__ == "__main__":
    debug_with_channel_join()