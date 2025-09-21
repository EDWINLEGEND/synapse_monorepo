#!/usr/bin/env python3
"""
Debug script to directly inspect ChromaDB database for context isolation verification
"""

import chromadb
from pathlib import Path
import json

def inspect_database():
    """Inspect the ChromaDB database directly to verify context isolation"""
    print("🔍 Inspecting ChromaDB Database for Context Isolation")
    print("=" * 60)
    
    # Initialize ChromaDB client
    db_path = Path("./chroma_db")
    if not db_path.exists():
        print("❌ ChromaDB database not found")
        return
    
    client = chromadb.PersistentClient(path=str(db_path))
    
    try:
        # Get the main collection
        collection = client.get_collection("synapse_knowledge_base")
        print(f"✅ Found collection: {collection.name}")
        print(f"📊 Total documents in collection: {collection.count()}")
        
        # Get all documents
        all_docs = collection.get()
        print(f"📄 Retrieved {len(all_docs['documents'])} documents")
        
        # Group documents by contextId
        context_groups = {}
        for i, metadata in enumerate(all_docs['metadatas']):
            context_id = metadata.get('contextId', 'no-context')
            if context_id not in context_groups:
                context_groups[context_id] = []
            context_groups[context_id].append({
                'id': all_docs['ids'][i],
                'metadata': metadata,
                'content_preview': all_docs['documents'][i][:100] + "..." if len(all_docs['documents'][i]) > 100 else all_docs['documents'][i]
            })
        
        print(f"\n📋 Context Groups Found: {len(context_groups)}")
        print("-" * 40)
        
        for context_id, docs in context_groups.items():
            print(f"\n🏷️  Context: {context_id}")
            print(f"   Documents: {len(docs)}")
            
            for doc in docs:
                filename = doc['metadata'].get('filename', 'unknown')
                source = doc['metadata'].get('source', 'unknown')
                print(f"   - {filename} (source: {source})")
                print(f"     Content: {doc['content_preview']}")
        
        # Test specific context queries
        print(f"\n🔍 Testing Context-Specific Queries")
        print("-" * 40)
        
        # Query for test-project-alpha context
        alpha_docs = collection.get(where={"contextId": "test-project-alpha"})
        print(f"📁 test-project-alpha: {len(alpha_docs['documents'])} documents")
        for i, metadata in enumerate(alpha_docs['metadatas']):
            filename = metadata.get('filename', 'unknown')
            print(f"   - {filename}")
        
        # Query for test-project-bravo context
        bravo_docs = collection.get(where={"contextId": "test-project-bravo"})
        print(f"📁 test-project-bravo: {len(bravo_docs['documents'])} documents")
        for i, metadata in enumerate(bravo_docs['metadatas']):
            filename = metadata.get('filename', 'unknown')
            print(f"   - {filename}")
        
        # Verify isolation
        print(f"\n✅ Data Isolation Verification")
        print("-" * 40)
        
        alpha_has_bravo_data = False
        bravo_has_alpha_data = False
        
        # Check if alpha context has any bravo-specific content
        for doc in alpha_docs['documents']:
            if 'Yellow Sparrow' in doc or 'Project Bravo' in doc:
                alpha_has_bravo_data = True
                break
        
        # Check if bravo context has any alpha-specific content  
        for doc in bravo_docs['documents']:
            if 'Blue Parrot' in doc or 'Project Alpha' in doc or 'Red Dragon' in doc:
                bravo_has_alpha_data = True
                break
        
        if not alpha_has_bravo_data and not bravo_has_alpha_data:
            print("✅ Data isolation VERIFIED: No cross-context contamination detected")
        else:
            print("❌ Data isolation FAILED:")
            if alpha_has_bravo_data:
                print("   - Alpha context contains Bravo data")
            if bravo_has_alpha_data:
                print("   - Bravo context contains Alpha data")
        
        return True
        
    except Exception as e:
        print(f"❌ Error inspecting database: {e}")
        return False

if __name__ == "__main__":
    inspect_database()