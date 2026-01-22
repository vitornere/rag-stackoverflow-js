# RAG JavaScript Assistant

A Retrieval-Augmented Generation (RAG) application that answers questions about JavaScript using the "Eloquent JavaScript" book as its knowledge base.

![RAG Flow](https://miro.medium.com/v2/resize:fit:1400/1*Jq9bEbitg1Pv4oASwEQwJg.png)

## 🎯 Overview

This project demonstrates a complete RAG pipeline built with:

- **LangChain & LangGraph** - Orchestrating the RAG workflow
- **Google Gemini** - LLM for embeddings (`text-embedding-004`) and generation (`gemini-2.0-flash`)
- **ChromaDB** - Vector database for semantic search
- **React** - Chat interface frontend
- **Express** - REST API server

## 📁 Project Structure

```
rag-stackoverflow-js/
├── apps/
│   ├── chat/          # React frontend (Vite)
│   ├── server/        # Express API server
│   └── manual/        # Manual RAG implementation (without LangChain)
├── libs/
│   └── langchain/     # Reusable RAG library
├── docker-compose.yml # ChromaDB container
└── .env               # Environment variables
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 10+
- Docker & Docker Compose
- Google AI API Key ([Get one here](https://aistudio.google.com/apikey))

### 1. Clone and Install

```bash
git clone https://github.com/your-username/rag-stackoverflow-js.git
cd rag-stackoverflow-js
pnpm install
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
GOOGLE_GENAI_API_KEY=your-api-key-here
DEBUG=true  # Optional: Enable debug logs
```

### 3. Start ChromaDB

```bash
docker-compose up -d
```

### 4. Prepare the Knowledge Base

Load the "Eloquent JavaScript" book into the vector database:

```bash
pnpm run prepare:langchain
```

This will:
- Fetch the book from [eloquentjavascript.net](https://eloquentjavascript.net)
- Split it into chunks (1500 chars with 300 overlap)
- Generate embeddings using Google's `text-embedding-004`
- Store vectors in ChromaDB

### 5. Start the Application

```bash
# Terminal 1: Start the API server
pnpm run dev:server

# Terminal 2: Start the web interface
pnpm run dev:web
```

- **API Server**: http://localhost:3333
- **Web Interface**: http://localhost:5173

## 🔧 Architecture

### RAG Pipeline (LangGraph)

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   START     │────▶│   RETRIEVE   │────▶│   GENERATE   │────▶ END
└─────────────┘     └──────────────┘     └──────────────┘
                           │                     │
                           ▼                     ▼
                     ChromaDB              Google Gemini
                  (Vector Search)         (gemini-2.0-flash)
```

### Packages

| Package | Description |
|---------|-------------|
| `@rag-stackoverflow-js/langchain` | Core RAG library with LangChain/LangGraph |
| `@rag-stackoverflow-js/server` | Express API exposing `/ask` endpoint |
| `@rag-stackoverflow-js/chat` | React chat interface |

## 📡 API

### POST /ask

Ask a question about JavaScript:

```bash
curl -X POST http://localhost:3333/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What is a closure in JavaScript?"}'
```

Response:

```json
{
  "response": "A closure is a function that has access to variables from its outer scope..."
}
```

## 🐛 Debug Mode

Enable detailed logging by setting `DEBUG=true` in your `.env`:

```
[langchain] === New request ===
[langchain] Question: What is a closure?
[langchain] RETRIEVE: Searching for similar documents...
[langchain] RETRIEVE: Found 4 documents
[langchain] GENERATE: Invoking LLM...
[langchain] Total time: 2341 ms
[langchain] === Request complete ===
```

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm run dev:web` | Start React frontend |
| `pnpm run dev:server` | Start API server |
| `pnpm run prepare:langchain` | Load documents into ChromaDB |

## 📚 Tech Stack

- **Runtime**: Node.js with ES Modules
- **Package Manager**: pnpm (workspaces)
- **AI/ML**: LangChain, LangGraph, Google Generative AI
- **Vector DB**: ChromaDB
- **Frontend**: React 19, Vite
- **Backend**: Express 5
- **Environment**: dotenvx

## 📝 License

ISC

---

Built with ❤️ as part of [Rocketseat](https://rocketseat.com.br) post-graduation program.
