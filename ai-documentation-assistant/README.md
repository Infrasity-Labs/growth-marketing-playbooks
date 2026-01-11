<div align="center">

# AI Documentation Assistant

**Turn your product docs into an AI-powered knowledge base your users can query.**

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)](#prerequisites)
[![Ollama](https://img.shields.io/badge/Powered%20by-Ollama-orange.svg)](https://ollama.ai)

</div>

---

## Build an AI Chatbot That Answers Questions From Your Docs

Your documentation is a goldmine—but users don't read it. They search, skim, and leave frustrated.

This playbook shows you how to build an AI assistant that:
- **Answers questions directly from your docs** (not generic LLM knowledge)
- **Cites sources** so users can verify answers
- **Runs locally** with no API costs or data privacy concerns
- **Embeds into your existing doc site** as a chat widget

By the end, you'll have a working RAG (Retrieval-Augmented Generation) system that makes your documentation actually useful.

> 💡 **This repo uses Kubiya docs as a working example.** Replace them with your own docs and you're live.

---

## System Architecture: RAG Pipeline Overview

![System Architecture Diagram](assets/images/arch.png)

| Layer | What It Does |
|-------|--------------|
| **Chat Widget** | Floating "Ask AI" button embedded in your doc site |
| **Flask Backend** | Receives queries, retrieves context, generates answers |
| **Vector Database** | Stores your docs as embeddings for semantic search |
| **Local LLM** | Generates answers using only retrieved context (no hallucinations) |

### The Flow

```
User asks question → Query embedded → Similar docs retrieved → LLM generates answer → Sources attached → Response displayed
```

No external API calls. No data leaves your machine. Full control.

---

## Installation and Setup

### Prerequisites

| Requirement | Version | Why |
|-------------|---------|-----|
| Python | 3.11+ | Backend runtime |
| Node.js | 18+ | Mintlify doc server |
| Ollama | Latest | Local LLM inference |
| RAM | 8 GB+ | Model loading |
| Disk | 5 GB free | Models + vector DB |

### Installation

**1. Clone and navigate**

```bash
git clone https://github.com/Infrasity-Labs/growth-marketing-playbooks.git
cd growth-marketing-playbooks/ai-documentation-assistant
```

**2. Install Ollama + models**

Download from [ollama.ai](https://ollama.ai), then:

```bash
ollama pull llama3.2:1b    # Fast, lightweight (use 8b for better quality)
ollama pull all-minilm      # Embedding model for semantic search
```

**3. Set up backend**

```bash
cd backend
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install flask flask-cors langchain langchain-community chromadb
```

**4. Install Mintlify**

```bash
npm install -g mintlify
```

**5. Start everything** (3 terminals)

```bash
# Terminal 1: LLM server
ollama serve

# Terminal 2: Backend API
cd backend && python app.py

# Terminal 3: Doc site
mintlify dev
```

Open `http://localhost:3000` → Click **Ask AI** → Start querying.

---

## How to Connect Your Own Documentation

This is the important part. Here's how to make this work with **your** documentation:

### Step 1: Replace the Documentation Files

The example uses Kubiya docs in these folders:

```
core-concepts/     → Your conceptual docs (MDX format)
introduction/      → Your intro/overview pages
quickstart/        → Your getting started guides
```

**Delete the example files and add your own MDX docs.**

Supported formats:
- `.mdx` (recommended for Mintlify)
- `.md` (plain Markdown)

### Step 2: Update Mintlify Config

Edit `docs.json` to match your doc structure:

```json
{
  "name": "Your Product Name",
  "navigation": [
    {
      "group": "Getting Started",
      "pages": ["introduction/overview", "quickstart/install"]
    }
  ]
}
```

See [Mintlify docs](https://mintlify.com/docs) for full configuration options.

### Step 3: Customize the Chat Widget

Edit `chat-widget.js` to update:

- **Starter questions** — Replace Kubiya-specific questions with ones relevant to your product
- **Branding** — Update colors, icons, button text
- **API endpoint** — Change if you're deploying the backend elsewhere

```javascript
// Example: Update starter questions
const starterQuestions = [
  "What is [Your Product]?",
  "How do I get started?",
  "What integrations are available?"
];
```

### Step 4: Rebuild the Vector Index

The vector database auto-rebuilds when you restart the backend:

```bash
cd backend && python app.py
```

ChromaDB will re-index all docs in the configured directories.

### Step 5: Test Your Setup

Try these query patterns against your docs:

| Query Type | Example |
|------------|---------|
| Definition | "What is [feature]?" |
| How-to | "How do I [task]?" |
| Comparison | "What's the difference between X and Y?" |
| Troubleshooting | "Why is [thing] not working?" |

If answers seem off, check that your docs actually contain the information—RAG can only retrieve what exists.

---

## Understanding RAG: How Retrieval-Augmented Generation Works

### RAG in 60 Seconds

Traditional LLMs hallucinate because they generate from memory. RAG fixes this:

1. **Indexing**: Your docs are split into chunks and converted to vector embeddings
2. **Retrieval**: User query is embedded → similar chunks are found via cosine similarity
3. **Generation**: LLM receives *only* the retrieved chunks as context
4. **Grounding**: Answer is constrained to what's in the context (no making stuff up)

### Why Local?

| Concern | Cloud LLMs | This Approach |
|---------|-----------|---------------|
| **Cost** | Pay per token | Free after setup |
| **Privacy** | Data leaves your infra | Everything stays local |
| **Latency** | Network round-trip | ~1-2s on modern hardware |
| **Control** | Vendor lock-in | Swap models anytime |

---

## Demo: Chat Interface and Source Citations

### The Chat Interface

![Ask AI Interface](assets/images/ragr1.gif)

- Floating button integrates with your doc theme
- Starter questions help users get started
- Scrollable conversation history
- Keyboard shortcuts (Enter to send)

### Answers with Sources

![AI Response with Sources](assets/images/ragr2.gif)

Every response includes:
- Concise, grounded answer
- List of source files used
- Clickable snippets for verification

Users can **trust** the answers because they can **verify** them.

---

## Project Structure

```
ai-documentation-assistant/
├── backend/
│   └── app.py              # Flask API + RAG pipeline
├── core-concepts/          # Example docs (replace with yours)
├── introduction/           # Example docs (replace with yours)
├── quickstart/             # Example docs (replace with yours)
├── assets/images/          # Screenshots for README
├── chat-widget.js          # Embeddable chat UI
├── docs.json               # Mintlify configuration
└── README.md
```

---

## Customizing Models, Chunk Sizes, and Embeddings

### Changing the LLM Model

In `backend/app.py`, update the model name:

```python
# Smaller/faster
model = "llama3.2:1b"

# Better quality
model = "llama3.2:8b"

# Even better (needs more RAM)
model = "llama3.1:70b"
```

### Adjusting Chunk Size

Larger chunks = more context but less precision. Default is usually fine, but you can tune:

```python
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,      # Characters per chunk
    chunk_overlap=200     # Overlap between chunks
)
```

### Changing the Embedding Model

The default `all-minilm` is fast and good enough. For better retrieval:

```bash
ollama pull nomic-embed-text
```

Then update the backend to use it.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Ollama not found" | Make sure `ollama serve` is running in a separate terminal |
| Port 3000 in use | Kill the process or use `mintlify dev --port 3001` |
| Slow responses | Use a smaller model (`llama3.2:1b`) or add more RAM |
| Wrong answers | Check if your docs actually contain the information |
| Empty responses | Verify docs are in MDX/MD format and in the right folders |

---

## Tech Stack

| Category | Technologies |
|----------|--------------|
| **Frontend** | Mintlify, Vanilla JS, HTML5, CSS3 |
| **Backend** | Python 3.11, Flask, Flask-CORS, LangChain |
| **AI/ML** | Ollama, Llama 3.2, all-MiniLM, ChromaDB |
| **Tooling** | Git, npm, pip, venv |

---

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add feature"`
4. Push and open a PR

Please follow PEP8 for Python and test locally before submitting.

---

<div align="center">

**Built by [Infrasity](https://infrasity.com)** — We help DevTools teams turn documentation into adoption engines.

</div>