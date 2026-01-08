# AI-Powered Documentation Assistant for Kubiya Docs

An intelligent documentation chatbot built with Retrieval-Augmented Generation (RAG) that provides instant, context-aware answers from Kubiya documentation using local LLMs via Ollama.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Technical Details](#technical-details)
- [Troubleshooting](#troubleshooting)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

This project implements an AI-powered assistant that integrates directly into Mintlify documentation pages. Users can ask natural language questions and receive accurate answers derived exclusively from the official Kubiya documentation, with full source citations for transparency and verification.

The system uses a Retrieval-Augmented Generation (RAG) pipeline to ensure responses are grounded in actual documentation content rather than relying on pre-trained knowledge that may be outdated or inaccurate.

## Features

### Core Functionality

- **Interactive Chat Interface**: Slide-in panel with conversational UI matching Kubiya brand guidelines
- **Contextual Question Answering**: Retrieves and synthesizes information from relevant documentation sections
- **Source Attribution**: Every answer includes citations to specific documentation files with content previews
- **Local Processing**: All computation happens locally without external API dependencies
- **Fast Response Times**: Optimized for 2-4 second query-to-answer latency
- **Persistent Knowledge Base**: Vector database cached on disk for rapid startup (2 seconds after initial build)

### User Experience

- **Example Questions**: Pre-populated suggestions to guide users
- **Typing Indicators**: Visual feedback during processing
- **Responsive Design**: Full functionality across desktop, tablet, and mobile devices
- **Dark Mode Support**: Automatic theme adaptation based on user preferences
- **Conversation History**: Maintains context within the chat session

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER / CLIENT LAYER                             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/HTTPS
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                               │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Mintlify Documentation Portal (Port 3000)                       │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │  📄 MDX Files (Docs Content)                               │ │  │
│  │  │  • introduction/what-is-kubiya.mdx                         │ │  │
│  │  │  • quickstart/get-started.mdx                              │ │  │
│  │  │  • core-concepts/*.mdx                                     │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  │                                                                  │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │  💬 Chat Widget (chat-widget.js)                           │ │  │
│  │  │  • Floating "Ask AI" button                                │ │  │
│  │  │  • Slide-in chat panel                                     │ │  │
│  │  │  • Message history & typing indicator                      │ │  │
│  │  │  • Source citations display                                │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ REST API (POST /api/ask)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER                                │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Flask Web Server (Port 5000)                                    │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │  API Endpoints:                                            │ │  │
│  │  │  • POST /api/ask    - Answer questions                     │ │  │
│  │  │  • GET  /api/health - Health check                         │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  │                                                                  │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │  🔗 LangChain RAG Pipeline (app.py)                        │ │  │
│  │  │  ┌──────────────────────────────────────────────────────┐ │ │  │
│  │  │  │ 1. Document Loader                                   │ │ │  │
│  │  │  │    • DirectoryLoader (MDX files)                     │ │ │  │
│  │  │  │    • TextSplitter (chunk_size=400)                   │ │ │  │
│  │  │  └──────────────────────────────────────────────────────┘ │ │  │
│  │  │  ┌──────────────────────────────────────────────────────┐ │ │  │
│  │  │  │ 2. Query Handler                                     │ │ │  │
│  │  │  │    • Question embedding                              │ │ │  │
│  │  │  │    • Similarity search (k=1)                         │ │ │  │
│  │  │  │    • Context retrieval                               │ │ │  │
│  │  │  └──────────────────────────────────────────────────────┘ │ │  │
│  │  │  ┌──────────────────────────────────────────────────────┐ │ │  │
│  │  │  │ 3. Response Generator                                │ │ │  │
│  │  │  │    • Prompt construction                             │ │ │  │
│  │  │  │    • LLM inference                                   │ │ │  │
│  │  │  │    • Source extraction                               │ │ │  │
│  │  │  └──────────────────────────────────────────────────────┘ │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
┌──────────────────────────────────┐  ┌──────────────────────────────────┐
│       DATA / STORAGE LAYER       │  │      AI / MODEL LAYER            │
│  ┌────────────────────────────┐  │  │  ┌────────────────────────────┐ │
│  │  ChromaDB (Vector Store)   │  │  │  │  Ollama (LLM Runtime)      │ │
│  │  • Embeddings storage      │  │  │  │  Port: 11434               │ │
│  │  • Similarity search       │  │  │  │  ┌──────────────────────┐  │ │
│  │  • Persistence layer       │  │  │  │  │ llama3.2:1b (800MB)  │  │ │
│  │  Location: ./chroma_db/    │  │  │  │  │ • Fast inference     │  │ │
│  │  ┌──────────────────────┐  │  │  │  │  │ • Low memory         │  │ │
│  │  │ Document Chunks:     │  │  │  │  │  │ • Temperature: 0.7   │  │ │
│  │  │ • Text content       │  │  │  │  │  └──────────────────────┘  │ │
│  │  │ • Embeddings         │  │  │  │  │                            │ │
│  │  │ • Metadata           │  │  │  │  │  ┌──────────────────────┐  │ │
│  │  │ • Source file paths  │  │  │  │  │  │ all-minilm (45MB)    │  │ │
│  │  └──────────────────────┘  │  │  │  │  │ • Text embeddings    │  │ │
│  └────────────────────────────┘  │  │  │  │ • 384 dimensions     │  │ │
└──────────────────────────────────┘  │  │  └──────────────────────┘  │ │
                                      │  └────────────────────────────┘ │
                                      └──────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         DEPLOYMENT OPTIONS                              │
│                                                                         │
│  Local Development:                   Production:                      │
│  • Windows/macOS/Linux               • Docker containers              │
│  • Python 3.11+ runtime              • Kubernetes orchestration       │
│  • Node.js 18+ for Mintlify          • Load balancer (Nginx)          │
│  • Ollama service                    • GPU acceleration (optional)    │
│                                      • Monitoring (Prometheus)        │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA FLOW                                       │
│                                                                         │
│  1. User types question in chat widget                                 │
│  2. Frontend sends POST to /api/ask                                    │
│  3. Backend embeds question using all-minilm                           │
│  4. ChromaDB retrieves top relevant chunks                             │
│  5. LangChain formats prompt with context                              │
│  6. Ollama generates answer using llama3.2:1b                          │
│  7. Backend extracts sources and formats response                      │
│  8. Frontend displays answer + sources in chat                         │
│                                                                         │
│  ⏱️  Total time: 2-4 seconds                                            │
└─────────────────────────────────────────────────────────────────────────┘

### Technology Stack

**Frontend Technologies:**
- **Mintlify**: Documentation framework and static site generator
- **Vanilla JavaScript**: Chat widget implementation
- **CSS3**: Styling and animations
- **Fetch API**: Asynchronous HTTP requests

**Backend Technologies:**
- **Python 3.11**: Primary programming language
- **Flask**: Lightweight WSGI web framework
- **Flask-CORS**: Cross-origin resource sharing handling
- **LangChain**: RAG orchestration and chain management
- **LangChain-Community**: Integration modules for Ollama and ChromaDB

**AI/ML Components:**
- **Ollama**: Local LLM runtime environment
- **Llama 3.2 (1B parameters)**: Primary language model for answer generation
- **all-minilm**: Sentence transformer for embedding generation
- **ChromaDB**: Vector database for semantic search

**Development Tools:**
- **Git**: Version control
- **npm**: Package management for frontend dependencies
- **pip**: Package management for Python dependencies

## Prerequisites

### System Requirements

- **Operating System**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM**: Minimum 4GB, recommended 8GB
- **Storage**: 5GB free space for models and data
- **CPU**: Multi-core processor recommended for faster inference

### Software Dependencies

- **Python**: Version 3.11 or higher
- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher
- **Ollama**: Latest stable release
- **Git**: For version control

## Installation

### Step 1: Clone Repository

```bash
git clone https://github.com/Infrasity-Labs/demo-docs.git
cd demo-docs
```

### Step 2: Install Ollama

Download and install Ollama from the official website: [https://ollama.ai](https://ollama.ai)

After installation, verify:

```bash
ollama --version
```

### Step 3: Download Required Models

```bash
# Download the language model (800MB)
ollama pull llama3.2:1b

# Download the embedding model (45MB)
ollama pull all-minilm

# Verify installation
ollama list
```

### Step 4: Setup Backend

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install flask flask-cors langchain langchain-community chromadb

# Verify installation
python -c "import flask, langchain, chromadb; print('Dependencies installed successfully')"
```

### Step 5: Setup Frontend

```bash
# Install Mintlify CLI globally
npm install -g mintlify

# Verify installation
mintlify --version
```

### Step 6: Initialize Services

**Terminal 1 - Start Ollama Service:**

```bash
ollama serve
```

**Terminal 2 - Start Backend Server:**

```bash
cd backend
python app.py
```

Expected output:

```
Initializing AI backend...
Models initialized

============================================================
 Kubiya Documentation AI Backend
============================================================

Step 1: Checking for existing vector database...
   Found existing vector database
   Loading from disk (takes 2-3 seconds)...
   Loaded 334 document chunks from existing database

Step 2: Setting up QA system...
   QA system ready!

RAG setup complete!

Starting Flask server...
   Backend URL: http://localhost:5000
   Ready to receive questions!
```

**Terminal 3 - Start Frontend:**

```bash
mintlify dev
```

Expected output:

```
Starting Mintlify...
Ready on http://localhost:3000
```

## Configuration

### Backend Configuration

Edit `backend/app.py` to customize model parameters:

```python
# Language Model Configuration
llm = Ollama(
    model="llama3.2:1b",                    # Model name
    base_url="http://localhost:11434",     # Ollama API endpoint
    temperature=0.7,                        # Response creativity (0.0-1.0)
    num_ctx=512,                            # Context window size
)

# Embedding Model Configuration
embeddings = OllamaEmbeddings(
    model="all-minilm",
    base_url="http://localhost:11434"
)

# Retrieval Configuration
retriever = vectorstore.as_retriever(
    search_kwargs={"k": 1}                  # Number of chunks to retrieve
)
```

### Frontend Configuration

Edit `chat-widget.js` to customize UI settings:

```javascript
const CONFIG = {
  API_URL: 'http://localhost:5000/api/ask',  // Backend endpoint
  THEME_COLOR: '#c084fc',                    // Primary color
  GRADIENT: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'  // Gradient
};
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
FLASK_ENV=development
FLASK_DEBUG=True
OLLAMA_HOST=http://localhost:11434
CHROMA_PERSIST_DIRECTORY=./chroma_db
LOG_LEVEL=INFO
```

## Usage

### Basic Usage

1. Navigate to [http://localhost:3000](http://localhost:3000) in your web browser
2. Look for the "Ask AI" button in the bottom-right corner
3. Click the button to open the chat panel
4. Type your question in the input field
5. Press Enter or click the send button
6. View the AI-generated answer and source citations

### Example Questions

- What is Kubiya?
- How do I get started with Kubiya?
- Explain Kubiya agents
- What are the core concepts?
- How do I integrate Kubiya with my workflow?

### API Usage

**Endpoint**: `POST /api/ask`

**Request Format:**

```json
{
  "question": "What is Kubiya?"
}
```

**Response Format:**

```json
{
  "answer": "Kubiya is an AI-powered platform...",
  "sources": [
    {
      "file": "introduction/what-is-kubiya.mdx",
      "preview": "Kubiya is a conversational AI platform..."
    }
  ],
  "question": "What is Kubiya?"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:5000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What is Kubiya?"}'
```

## Project Structure

```
demo-docs/
├── backend/
│   ├── app.py                    # Flask server and RAG pipeline
│   ├── chroma_db/                # Vector database (auto-generated)
│   │   ├── chroma.sqlite3        # SQLite database
│   │   └── ...                   # Embedding data
│   └── requirements.txt          # Python dependencies
│
├── introduction/
│   ├── what-is-kubiya.mdx        # Documentation content
│   └── ...
│
├── quickstart/
│   ├── get-started.mdx
│   └── ...
│
├── core-concepts/
│   ├── agents.mdx
│   └── ...
│
├── chat-widget.js                # Frontend chat UI
├── mint.json                     # Mintlify configuration
├── .gitignore                    # Git ignore rules
├── README.md                     # This file
└── LICENSE                       # License information
```

## Technical Details

### Document Processing Pipeline

**1. Ingestion Phase:**

- Directory scanning for MDX files
- Content extraction using TextLoader
- Document splitting into 400-character chunks with 40-character overlap
- Filtering of non-documentation files (backend, node_modules, etc.)
- Metadata extraction (source file, creation date, etc.)

**2. Embedding Phase:**

- Chunk text normalization
- Embedding generation using all-minilm model
- Vector storage in ChromaDB with metadata
- Index creation for efficient similarity search

**3. Query Phase:**

- Question preprocessing and normalization
- Query embedding generation
- Cosine similarity computation against stored vectors
- Top-k relevant chunk retrieval
- Context assembly for LLM prompt

### Prompt Engineering

The system uses a carefully crafted prompt template:

```python
prompt_template = """You are a Kubiya documentation assistant. Answer briefly and accurately based on the context below.

Context: {context}

Question: {question}

Answer (be concise):"""
```

This template ensures:

- Responses are grounded in documentation
- Answers remain focused and concise
- Context is properly utilized
- Hallucinations are minimized

### Error Handling

The system implements comprehensive error handling:

- **Network Errors**: Graceful degradation with user-friendly messages
- **Model Errors**: Fallback responses when LLM unavailable
- **Memory Errors**: Automatic retry with smaller context
- **Validation Errors**: Input sanitization and validation
- **Logging**: Detailed error logs for debugging

## Troubleshooting

### Common Issues

**Issue**: Ollama not responding
- **Solution**: Ensure Ollama service is running with `ollama serve`
- **Check**: Verify with `curl http://localhost:11434/api/tags`

**Issue**: Backend fails to start
- **Solution**: Check Python version (must be 3.11+)
- **Solution**: Verify all dependencies are installed: `pip list`

**Issue**: Frontend can't connect to backend
- **Solution**: Verify backend is running on port 5000
- **Solution**: Check CORS settings in `app.py`

**Issue**: Slow response times
- **Solution**: Consider using a more powerful model or GPU acceleration
- **Solution**: Reduce chunk retrieval count in retriever configuration

**Issue**: Vector database not persisting
- **Solution**: Check write permissions for `./chroma_db/` directory
- **Solution**: Verify disk space availability

## Deployment

### Production Considerations

**Security:**
- Enable CORS only for specific domains
- Implement rate limiting (e.g., 10 requests/minute per IP)
- Add authentication for sensitive documentation
- Use HTTPS for all communications
- Sanitize user inputs to prevent injection attacks

**Performance:**
- Use production WSGI server (Gunicorn or uWSGI)
- Enable response caching for common questions
- Implement request queuing for high traffic
- Consider GPU acceleration for faster inference
- Use CDN for static assets

**Monitoring:**
- Set up logging aggregation (ELK Stack, Splunk)
- Implement health checks and alerts
- Track response times and error rates
- Monitor resource usage (CPU, RAM, disk)
- Set up uptime monitoring

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Ollama
RUN curl -fsSL https://ollama.ai/install.sh | sh

# Copy backend files
COPY backend/ /app/backend/
COPY requirements.txt /app/

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Pull models
RUN ollama pull llama3.2:1b && ollama pull all-minilm

EXPOSE 5000

CMD ["python", "backend/app.py"]
```

### Production Deployment with Gunicorn

```bash
# Install Gunicorn
pip install gunicorn

# Run with 4 worker processes
gunicorn -w 4 -b 0.0.0.0:5000 backend.app:app

# With configuration file
gunicorn -c gunicorn_config.py backend.app:app
```

## Contributing

We welcome contributions to improve this project. Please follow these guidelines:

### Development Setup

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature-name`)
3. Make your changes with clear commit messages
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request with detailed description

### Code Standards

- Follow PEP 8 for Python code
- Use meaningful variable and function names
- Add docstrings for all functions and classes
- Include type hints where applicable
- Write unit tests for new features
- Update documentation for API changes

### Pull Request Process

1. Update README.md with details of changes
2. Update version numbers in relevant files
3. Ensure CI/CD pipeline passes
4. Request review from maintainers
5. Address review comments promptly

## License

This project is part of Infrasity Labs growth marketing playbooks. All rights reserved.

## Credits

### Development Team

- **Gaurav** - Lead Developer & AI Integration

### Technologies

- **Ollama** - Local LLM runtime
- **LangChain** - RAG framework
- **ChromaDB** - Vector database
- **Mintlify** - Documentation platform
- **Flask** - Web framework

### Model Credits

- **Meta AI** - Llama 3.2 language model
- **Sentence Transformers** - all-minilm embedding model

## Support

For questions, issues, or feature requests, please contact the Infrasity Labs team or open an issue on GitHub.

## Acknowledgments

Special thanks to the open-source community for providing the foundational technologies that make this project possible.

---

**Version**: 1.0.0  
**Last Updated**: January 8, 2025  
**Maintained by**: Infrasity Labs


