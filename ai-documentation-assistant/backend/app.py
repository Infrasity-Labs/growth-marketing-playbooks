# Import necessary libraries
from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.llms import Ollama
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
import os
import json
import re
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configuration from environment variables
PRODUCT_NAME = os.getenv("PRODUCT_NAME", "Your Product")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
LLM_MODEL = os.getenv("LLM_MODEL", "llama3.2:1b")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "all-minilm")
LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.7"))
FLASK_DEBUG = os.getenv("FLASK_DEBUG", "false").lower() == "true"
PORT = int(os.getenv("PORT", "5000"))
HOST = os.getenv("HOST", "0.0.0.0")
DOCS_PATH = os.getenv("DOCS_PATH", "../")
CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH", "./chroma_db")
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "500"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "50"))
RETRIEVAL_K = int(os.getenv("RETRIEVAL_K", "2"))

app = Flask(__name__)
CORS(app)

print("🚀 Initializing AI backend...")
print(f"   📦 Product: {PRODUCT_NAME}")
print(f"   🤖 LLM Model: {LLM_MODEL}")
print(f"   🔍 Embedding Model: {EMBEDDING_MODEL}")
print(f"   🌐 Ollama URL: {OLLAMA_URL}")

# Initialize Ollama models with configuration from environment
llm = Ollama(
    model=LLM_MODEL,
    base_url=OLLAMA_URL,
    temperature=LLM_TEMPERATURE
)

embeddings = OllamaEmbeddings(
    model=EMBEDDING_MODEL,
    base_url=OLLAMA_URL
)

print("✅ Models initialized")

# GLOBAL VARIABLES - Make accessible to all endpoints
qa_chain = None
vectorstore = None

def setup_rag():
    """
    Sets up RAG pipeline - loads existing ChromaDB if available (FAST!)
    """
    global vectorstore  # ✅ Make global for suggestions endpoint
    
    print("\n📚 Step 1: Checking for existing vector database...")
    
    chroma_db_path = CHROMA_DB_PATH
    
    # Check if ChromaDB already exists
    if os.path.exists(chroma_db_path) and os.path.isdir(chroma_db_path):
        print(f"   ✅ Found existing vector database at: {chroma_db_path}")
        print("   ⚡ Loading from disk (takes 2-3 seconds)...")
        
        try:
            # Load existing vectorstore - MUCH FASTER than recreating!
            vectorstore = Chroma(
                persist_directory=chroma_db_path,
                embedding_function=embeddings
            )
            
            # Get collection info
            try:
                collection = vectorstore._collection
                doc_count = collection.count()
                print(f"   ✅ Loaded {doc_count} document chunks from existing database")
                print("   ⏱️  Loading time: ~2 seconds (instead of 15 minutes!)")
            except:
                print(f"   ✅ Vector database loaded successfully")
            
        except Exception as e:
            print(f"   ⚠️  Error loading existing database: {e}")
            print("   🔄 Will recreate database from scratch...")
            vectorstore = create_vectorstore_from_scratch()
    else:
        print("   ℹ️  No existing database found")
        print("   📝 Creating new vector database (this will take 2-5 minutes on first run)...")
        vectorstore = create_vectorstore_from_scratch()
    
    if vectorstore is None:
        return None
    
    # Create QA system
    print("\n🤖 Step 2: Setting up QA system...")
    
    prompt_template = f"""You are a helpful AI assistant for {PRODUCT_NAME} documentation.
Use the following documentation context to answer the question accurately and concisely.

Important guidelines:
- Only answer based on the provided documentation context
- If the answer is not in the context, say "I don't have information about that in the documentation"
- Be clear, helpful, and accurate
- Keep answers concise but complete

Documentation Context:
{{context}}

Question: {{question}}

Answer:"""

    PROMPT = PromptTemplate(
        template=prompt_template,
        input_variables=["context", "question"]
    )
    
    qa = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=vectorstore.as_retriever(
            search_kwargs={"k": RETRIEVAL_K}
        ),
        return_source_documents=True,
        chain_type_kwargs={"prompt": PROMPT}
    )
    
    print("   ✅ QA system ready!")
    print("\n🎉 RAG setup complete!\n")
    
    return qa

def create_vectorstore_from_scratch():
    """
    Helper function to create vector database from documentation files
    Only called on first run or when database needs to be rebuilt
    """
    global vectorstore  # ✅ Make global
    
    print("\n   📂 Step A: Loading documentation files...")
    
    # Path to parent directory (where all doc folders are)
    docs_path = os.path.join(os.path.dirname(__file__), DOCS_PATH)
    docs_path = os.path.abspath(docs_path)
    
    print(f"      Loading from: {docs_path}")
    
    # Load all MDX files
    loader = DirectoryLoader(
        docs_path,
        glob="**/*.mdx",
        loader_cls=TextLoader,
        loader_kwargs={'encoding': 'utf-8'},
        show_progress=True
    )
    
    all_documents = loader.load()
    print(f"      📄 Found {len(all_documents)} total MDX files")
    
    # Filter out unwanted files (backend, node_modules, etc.)
    documents = []
    excluded_folders = ['backend', 'node_modules', '.git', 'chroma_db', 'dist', 'build']
    
    for doc in all_documents:
        source = doc.metadata.get('source', '')
        source_lower = source.lower().replace('\\', '/')
        path_parts = source_lower.split('/')
        
        should_exclude = False
        for excluded in excluded_folders:
            if excluded in path_parts:
                should_exclude = True
                break
        
        if not should_exclude:
            documents.append(doc)
    
    print(f"      ✅ Kept {len(documents)} documentation files (filtered out {len(all_documents) - len(documents)} files)")
    
    if len(documents) == 0:
        print("      ⚠️  WARNING: No documents found after filtering!")
        print("      Using all documents without filtering...")
        documents = all_documents
    
    # Split documents into chunks
    print("\n   ✂️  Step B: Splitting documents into chunks...")
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        length_function=len,
        separators=["\n\n", "\n", " ", ""]
    )
    
    chunks = text_splitter.split_documents(documents)
    print(f"      ✅ Created {len(chunks)} chunks from {len(documents)} documents")
    
    # Create vector database
    print("\n   🔮 Step C: Creating vector database (embedding text)...")
    print("      ⏳ This takes 2-5 minutes on first run...")
    print("      ℹ️  Next time you restart, it will load in 2 seconds!")
    
    try:
        vectorstore = Chroma.from_documents(
            documents=chunks,
            embedding=embeddings,
            persist_directory=CHROMA_DB_PATH
        )
        print(f"      ✅ Vector database created and saved to {CHROMA_DB_PATH}")
        return vectorstore
    except Exception as e:
        print(f"      ❌ Error creating vector database: {str(e)}")
        print("      Make sure Ollama is running: ollama serve")
        return None

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "message": f"{PRODUCT_NAME} AI backend is running!",
        "models": {
            "llm": LLM_MODEL,
            "embeddings": EMBEDDING_MODEL
        },
        "file_type": "mdx",
        "database": "chroma_db"
    })

@app.route('/api/ask', methods=['POST'])
def ask():
    """Answer questions about documentation with improved error handling"""
    try:
        data = request.json
        question = data.get('question', '').strip()
        
        if not question:
            return jsonify({"error": "No question provided"}), 400
        
        print(f"\n❓ Question: {question}")
        print("   🔍 Searching documentation...")
        
        # Get answer from RAG with comprehensive error handling
        try:
            result = qa_chain({"query": question})
            answer = result['result']
            
            # Extract sources
            sources = []
            if 'source_documents' in result:
                for doc in result['source_documents']:
                    source_file = doc.metadata.get('source', 'Unknown')
                    try:
                        # Make path relative and clean
                        source_file = os.path.relpath(
                            source_file, 
                            os.path.join(os.path.dirname(__file__), "..")
                        )
                        source_file = source_file.replace('\\', '/')
                    except:
                        source_file = os.path.basename(source_file)
                    
                    sources.append({
                        'file': source_file,
                        'preview': doc.page_content[:150] + "..."
                    })
            
            print(f"   ✅ Answer generated using {len(sources)} source documents")
            
            return jsonify({
                "answer": answer,
                "sources": sources,
                "question": question
            })
            
        except ValueError as ve:
            # Ollama-specific errors (memory, model issues, etc.)
            error_msg = str(ve)
            print(f"   ❌ Ollama Error: {error_msg}")
            
            if "memory" in error_msg.lower():
                return jsonify({
                    "error": "Model out of memory",
                    "answer": "⚠️ **Memory Issue**\n\nThe AI model needs more RAM. Try:\n\n1. Close other applications\n2. Restart Ollama: `taskkill /F /IM ollama.exe` then `ollama serve`\n3. If problem persists, the model may be too large for your system\n\nPlease try your question again in a moment.",
                    "sources": []
                }), 200
            elif "not found" in error_msg.lower() or "model" in error_msg.lower():
                return jsonify({
                    "error": "Model not found",
                    "answer": "⚠️ **Model Not Loaded**\n\nPlease run: `ollama pull llama3.2:1b`\n\nThen restart the backend.",
                    "sources": []
                }), 200
            else:
                return jsonify({
                    "error": "AI service error",
                    "answer": f"⚠️ **AI Service Error**\n\nThe AI encountered an issue: {error_msg}\n\nPlease try again or check the backend logs.",
                    "sources": []
                }), 200
        
        except Exception as e:
            # Generic errors
            print(f"   ❌ Unexpected Error: {str(e)}")
            import traceback
            traceback.print_exc()
            
            return jsonify({
                "error": "Internal error",
                "answer": "⚠️ **Unexpected Error**\n\nThe backend encountered an unexpected issue. Please try:\n\n1. A different question\n2. Restarting the backend\n3. Checking the terminal logs\n\nError details are in the backend console.",
                "sources": []
            }), 200
    
    except Exception as e:
        print(f"   ❌ Request Error: {str(e)}")
        return jsonify({
            "error": "Failed to process request",
            "details": str(e)
        }), 500

# 🔥 NEW ENDPOINT: Dynamic Follow-up Suggestions 
@app.route('/api/suggestions', methods=['POST'])
def get_suggestions():
    """Generate 3 SMART follow-up questions based on recent conversation"""
    try:
        data = request.json
        last_question = data.get('question', '').strip()
        
        if not last_question or not vectorstore:
            return jsonify({"suggestions": []})
        
        print(f"\n💡 Generating suggestions for: {last_question[:50]}...")
        
        # Get MORE relevant docs (k=6) for better context
        relevant_docs = vectorstore.similarity_search(last_question, k=6)
        context = "\n\n".join([doc.page_content for doc in relevant_docs[:4]])
        
        # 🔥 IMPROVED PROMPT - Much more specific
        suggestion_prompt = f"""You are generating 3 follow-up questions for {PRODUCT_NAME} documentation.

USER ASKED: "{last_question}"

RELEVANT DOCS: {context[:3000]}

Generate EXACTLY 3 specific follow-up questions that:
1. Directly relate to the user's question topic
2. Use key terms/phrases from the docs above  
3. Are actionable (How to..., What are..., Can I...)
4. Max 70 characters each
5. Sound natural for documentation users

Return ONLY valid JSON array:
["Question 1?", "Question 2?", "Question 3?"]"""

        suggestions_raw = llm(suggestion_prompt)
        
        # Better JSON parsing
        try:
            json_match = re.search(r'\[.*\]', suggestions_raw, re.DOTALL | re.IGNORECASE)
            if json_match:
                suggestion_list = json.loads(json_match.group(0))
            else:
                raise ValueError("No JSON")
        except:
            # 🔥 BETTER FALLBACK - Extract key terms from docs
            key_topics = []
            for doc in relevant_docs[:3]:
                # Extract technical terms, file names, commands
                content = doc.page_content.lower()
                # Check for common documentation topics
                if 'agent' in content or 'workflow' in content:
                    if 'agent' in content:
                        key_topics.append('agents')
                    if 'workflow' in content or 'workload' in content:
                        key_topics.append('workflows')
                    if 'quickstart' in content or 'get started' in content:
                        key_topics.append('setup')
                    if 'installation' in content:
                        key_topics.append('install')
            
            # Smart fallback based on actual docs
            if key_topics:
                topic = key_topics[0]
                suggestion_list = [
                    f"How do I setup {topic}?",
                    f"What are {topic} best practices?", 
                    f"Common {topic} errors?"
                ]
            else:
                suggestion_list = [
                    "How do I get started with this?",
                    "What are the next steps?",
                    "Any common issues?"
                ]
        
        # Clean and validate
        clean_suggestions = []
        for sug in suggestion_list[:3]:
            if isinstance(sug, str) and len(sug.strip()) > 10 and len(sug) < 80 and '?' in sug:
                clean_suggestions.append(sug.strip())
        
        # Ensure exactly 3 good ones
        while len(clean_suggestions) < 3:
            clean_suggestions.append("How do I implement this?")
        
        print(f"   ✅ Generated: {clean_suggestions}")
        return jsonify({"suggestions": clean_suggestions})
        
    except Exception as e:
        print(f"   ❌ Suggestions error: {str(e)}")
        return jsonify({"suggestions": ["How to setup?", "Best practices?", "Common issues?"]})


if __name__ == '__main__':
    print("\n" + "="*60)
    print(f" 🤖 {PRODUCT_NAME} Documentation AI Backend")
    print("="*60)
    
    # Setup RAG pipeline
    qa_chain = setup_rag()
    
    if qa_chain is None:
        print("\n❌ Failed to setup RAG. Exiting...")
        print("\n   Troubleshooting:")
        print("   1. Make sure you have .mdx files in your docs folders")
        print("   2. Check that Ollama is running: ollama serve")
        print("   3. Verify models are installed: ollama list")
        print("   4. Check if llama3.2:1b is downloaded: ollama pull llama3.2:1b")
        exit(1)
    
    # Start Flask server
    print("\n🌐 Starting Flask server...")
    print(f"   Backend URL: http://{HOST}:{PORT}")
    print(f"   Health check: http://{HOST}:{PORT}/api/health")
    print(f"   Ask endpoint: http://{HOST}:{PORT}/api/ask")
    print(f"   🔥 NEW: Suggestions endpoint: http://{HOST}:{PORT}/api/suggestions")
    print("\n   💡 Test with curl:")
    print(f'   curl -X POST http://{HOST}:{PORT}/api/ask -H "Content-Type: application/json" -d "{{\\"question\\":\\"What is {PRODUCT_NAME}?\\"}}"')
    print("\n   🎯 Frontend chat: http://localhost:3000")
    print("\n   Ready to receive questions!")
    print("   Press Ctrl+C to stop the server\n")
    
    app.run(
        debug=FLASK_DEBUG,
        port=PORT,
        host=HOST
    )
