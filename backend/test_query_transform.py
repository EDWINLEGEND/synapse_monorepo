import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_query_transform():
    """Test the query transformation endpoint with various examples."""
    print("🚀 Starting Query Transform tests...")
    
    # Test backend server health
    print("\n🏥 Testing backend server health...")
    try:
        response = requests.get("http://127.0.0.1:8000/")
        if response.status_code == 200:
            print("✅ Backend server is running")
        else:
            print(f"❌ Backend server health check failed: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Cannot connect to backend server: {e}")
        return
    
    print("\n" + "="*60)
    print("🔄 Testing Query Transform functionality...")
    
    # Test cases with various types of queries
    test_cases = [
        {
            "name": "Simple UI Query",
            "question": "info on UI"
        },
        {
            "name": "Login Bug Query", 
            "question": "login bug"
        },
        {
            "name": "API Documentation Query",
            "question": "how to use the API"
        },
        {
            "name": "Database Issue Query",
            "question": "database connection problems"
        },
        {
            "name": "Performance Query",
            "question": "app is slow"
        }
    ]
    
    successful_tests = 0
    total_tests = len(test_cases)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📝 Test {i}/{total_tests}: {test_case['name']}")
        print(f"   Original: '{test_case['question']}'")
        
        try:
            transform_data = {
                "question": test_case['question']
            }
            
            response = requests.post(
                "http://127.0.0.1:8000/api/query/transform",
                json=transform_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                result = response.json()
                transformed = result['transformed_question']
                print(f"   ✅ Transformed: '{transformed}'")
                print(f"   📊 Length increase: {len(test_case['question'])} → {len(transformed)} chars")
                successful_tests += 1
            else:
                print(f"   ❌ Transform failed: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"   ❌ Error during transform: {e}")
    
    print("\n" + "="*60)
    print(f"🏁 Tests completed: {successful_tests}/{total_tests} successful")
    
    if successful_tests == total_tests:
        print("✅ All tests passed! Query transformation is working correctly.")
    else:
        print(f"⚠️  {total_tests - successful_tests} tests failed.")
    
    print("\n📝 Notes:")
    print("   - The transform endpoint enhances queries for better RAG retrieval")
    print("   - Transformed queries should be more specific and detailed")
    print("   - Frontend should use transformed queries for /api/query calls")
    print("   - This endpoint is stateless and doesn't access the vector store")

if __name__ == "__main__":
    test_query_transform()