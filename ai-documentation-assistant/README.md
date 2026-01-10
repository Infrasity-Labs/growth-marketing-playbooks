<div align="center">

# AI Documentation Assistant

**An RAG-powered documentation assistant that answers questions directly from your docs.**

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![License](https://img.shields.io/badge/License-Infrasity%20Labs-green.svg)](#license)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)](#prerequisites)
[![Ollama](https://img.shields.io/badge/Powered%20by-Ollama-orange.svg)](https://ollama.ai)

</div>

---

An AI documentation assistant built with Retrieval-Augmented Generation (RAG). It provides fast, accurate, source-backed answers from your documentation using a fully local AI stack powered by Ollama—no external API calls, complete data privacy, and verifiable citations.

This implementation uses Kubiya docs as the example documentation set. The assistant answers strictly from indexed content, not from general LLM knowledge, ensuring consistent, private, and auditable results.

---

## Features

- **Semantic Search** — Natural language queries matched against documentation content using vector embeddings
- **Source Attribution** — Every answer includes clickable citations to the original source files
- **Fully Local** — Runs entirely on your machine with Ollama; no external API dependencies
- **Mintlify Integration** — Embeddable chat widget for any Mintlify-powered documentation site
- **Grounded Responses** — Answers constrained to retrieved context, reducing hallucinations
- **Real-time Interaction** — Conversational UI with starter questions and scrollable history

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Product Walkthrough](#product-walkthrough)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Contributing](#contributing)
- [License](#license)

---

## Architecture

![System Architecture Diagram](assets/images/arch.png)

The system follows a three-layer architecture:

| Layer | Components |
|-------|------------|
| **Client** | Mintlify documentation site, embedded chat widget, user interaction handling |
| **Application** | Flask backend API, LangChain RAG pipeline, query processing and orchestration |
| **Data & AI** | ChromaDB vector store, Ollama local inference engine, embedding and generation models |

### How It Works

1. User submits a question from the UI
2. Backend generates a query embedding
3. Vector database retrieves relevant context
4. LLM generates a grounded answer using only retrieved content
5. Source references are attached to the response
6. UI renders the answer with citations

This design enables local deployment, predictable latency, and full data ownership.

---

## Getting Started

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Python | 3.11+ |
| Node.js | 18+ |
| Ollama | Latest |
| RAM | 8 GB minimum |
| Disk Space | 5 GB free |

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/Infrasity-Labs/growth-marketing-playbooks.git
cd growth-marketing-playbooks/ai-documentation-assistant
```

**2. Install Ollama and download models**

Download Ollama from [ollama.ai](https://ollama.ai), then pull the required models:

```bash
ollama pull llama3.2:1b
ollama pull all-minilm
```

**3. Set up the backend**

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install flask flask-cors langchain langchain-community chromadb
```

**4. Install Mintlify**

```bash
npm install -g mintlify
```

**5. Start all services**

Run each command in a separate terminal:

```bash
# Terminal 1 – Ollama
ollama serve

# Terminal 2 – Backend
cd backend && python app.py

# Terminal 3 – Frontend
mintlify dev
```

Open your browser to `http://localhost:3000`

---

## Usage

Once running, click the **Ask AI** button on the documentation site to open the chat interface.

**Example queries:**

```
What is Kubiya?
How do I get started?
What are Kubiya agents?
How does Kubiya handle orchestration?
What integrations does Kubiya support?
```

The assistant will return a concise answer with source citations you can click to verify.

---

## Product Walkthrough

### Ask AI Interface

![Ask AI Interface](assets/images/ragr1.gif)

The Ask AI interface appears as a floating button inside the documentation website. When clicked, it opens a slide-in chat panel where users can interact with the documentation assistant.

**Key elements:**

- Clean chat interface aligned with the documentation theme
- Input box for natural language questions
- Quick suggestion buttons for first-time users
- Scrollable conversation history
- Send button and keyboard submission support

The interface shows starter questions so users immediately know what kinds of queries work well:

- What is Kubiya?
- How do I get started?
- Tell me about agents

#### Sample Questions for Testing

Use these queries to validate search accuracy, retrieval quality, and response grounding:

- What is Kubiya and what problem does it solve?
- How does Kubiya manage AI workloads?
- What are the core concepts in Kubiya?
- What is the purpose of the MCP server?
- How does Kubiya handle governance and access control?
- What APIs are available in Kubiya?

---

### AI Response and Source Attribution

![AI Response with Sources](assets/images/ragr2.gif)

When a user submits a question:

1. The query is sent to the backend API
2. The query is embedded into a vector representation
3. The vector database performs semantic similarity search
4. Relevant documentation chunks are retrieved
5. The language model generates an answer using only retrieved context
6. Source references are attached to the response

**The response UI displays:**

- A concise and relevant answer
- A list of source files used to generate the answer
- Snippets from each source for verification

**This approach ensures:**

- Answers remain factual and grounded
- Users can validate information instantly
- Reduced hallucinations (answers are constrained to retrieved context)
- Higher trust in documentation accuracy

---

## Project Structure

```
ai-documentation-assistant/
├── backend/                # Flask API, RAG pipeline, vector DB logic
├── core-concepts/          # MDX documentation content
├── introduction/           # Introduction docs
├── quickstart/             # Getting started docs
├── assets/
│   └── images/             # README screenshots and diagrams
├── chat-widget.js          # Frontend chat widget
├── docs.json               # Mintlify configuration
└── README.md               # Project documentation
```

---

## Tech Stack

| Category | Technologies |
|----------|--------------|
| **Frontend** | Mintlify, Vanilla JavaScript, HTML5, CSS3 |
| **Backend** | Python 3.11, Flask, Flask-CORS, LangChain |
| **AI & Data** | Ollama, Llama 3.2, all-MiniLM, ChromaDB |
| **Tooling** | Git, npm, pip, Virtualenv |

---

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "Add meaningful description"`
4. Push to your fork and open a pull request

**Guidelines:**

- Follow PEP8 for Python code
- Keep commits small and focused
- Update documentation when behavior changes
- Test locally before submitting

---

## License

This project is maintained by **Infrasity Labs**. All rights reserved unless otherwise specified.

---

<div align="center">

**Version 1.0.0** · Last Updated January 2026

</div>
