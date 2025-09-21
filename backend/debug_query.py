#!/usr/bin/env python3
"""
Debug script to test query functionality and see what's in the database
"""

import requests
import json

def test_query(context_id, question):
    """Test a query with specific context"""
    print(f"\n🔍 Testing query in context '{context_id}': {question}")
    
    payload = {
        'question': question,
        'contextId': context_id
    }
    
    try:
        response = requests.post('http://127.0.0.1:8000/api/query', json=payload, timeout=30)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Answer: {result['answer'][:300]}...")
            print(f"Sources: {len(result['sources'])}")
            
            for i, source in enumerate(result['sources']):
                metadata = source.get('metadata', {})
                print(f"  Source {i}: contextId={metadata.get('contextId')}, filename={metadata.get('filename')}, source={metadata.get('source')}")
                print(f"    Content preview: {source.get('content', '')[:100]}...")
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    print("Debug Query Test")
    print("=" * 50)
    
    # Test queries in both contexts
    test_query("project-a", "What documents are available?")
    test_query("project-b", "What documents are available?")
    test_query("project-a", "Tell me about fruit")
    test_query("project-b", "Tell me about fruit")