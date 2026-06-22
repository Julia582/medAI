# MedAI - Full-Stack AI Medical Assistant

A production-quality AI-powered medical document analysis platform with RAG (Retrieval-Augmented Generation) pipeline, agentic AI workflows, and a modern full-stack architecture.

## Architecture

```
├── frontend/          # Next.js 15 + React + Tailwind CSS
├── backend/           # NestJS + TypeScript + Prisma
├── ai-service/        # FastAPI + LangChain + RAG
└── README.md
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS, ShadCN UI |
| Backend | NestJS, TypeScript, Prisma ORM |
| AI Service | FastAPI, LangChain, OpenAI, FAISS |
| Database | PostgreSQL (Neon) |
| Auth | JWT, bcryptjs |
| Deployment | Vercel (FE), Render (BE + AI) |

## Features

- **JWT Authentication** - Register, Login, Refresh tokens
- **Medical Document Upload** - PDF, DOCX, TXT support
- **RAG Pipeline** - Document chunking, embeddings, vector search, context injection
- **AI Chat Assistant** - Streaming responses, chat history, markdown rendering
- **Report Summarization** - AI-powered medical document summarization
- **Risk Detection** - Identify abnormal values and health concerns
- **Medical QA** - Question answering over uploaded documents
- **Recommendations** - Smart follow-up suggestions
- **Dark Mode** - Full dark mode support
- **Responsive** - Mobile-first design

## Getting Started

### Prerequisites

- Node.js >= 18
- Python >= 3.10
- PostgreSQL database (or use Neon)
- OpenAI API key

### 1. Database Setup

Create a PostgreSQL database and get the connection URL. Update `.env` files:
- `backend/.env` - `DATABASE_URL`
- `ai-service/.env` - `DATABASE_URL`

### 2. Backend Setup

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run start:dev
```

### 3. AI Service Setup

```bash
cd ai-service
pip install -r requirements.txt
# Set OPENAI_API_KEY in .env
uvicorn app.main:app --reload --port 8000
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **AI Service**: http://localhost:8000

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/refresh` | Refresh tokens |
| GET | `/api/v1/auth/profile` | Get user profile |

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/documents/upload` | Upload document |
| GET | `/api/v1/documents` | List user documents |
| DELETE | `/api/v1/documents/:id` | Delete document |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/chat` | Create new chat |
| GET | `/api/v1/chat/history` | Get chat history |
| GET | `/api/v1/chat/:id` | Get chat details |
| POST | `/api/v1/chat/:id/messages` | Send message |

### AI Service
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/query` | Query documents |
| POST | `/api/summarize` | Summarize document |
| POST | `/api/extract-findings` | Extract medical findings |
| POST | `/api/detect-risks` | Detect health risks |
| POST | `/api/recommendations` | Get recommendations |

## Database Schema

- **users** - User accounts with hashed passwords
- **documents** - Uploaded medical documents with metadata
- **chats** - Conversation sessions
- **messages** - Individual chat messages (user/assistant)
- **embeddings** - Vector embeddings for RAG (pgvector)

## Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
vercel --prod
```

### Backend → Render
1. Create a Web Service from `backend/`
2. Set build command: `npm install && npx prisma generate && npm run build`
3. Set start command: `npm run start:prod`
4. Add environment variables from `backend/.env`

### AI Service → Render
1. Create a Web Service from `ai-service/`
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables from `ai-service/.env`

### Database → Neon
1. Create a Neon project
2. Get the connection string
3. Update `DATABASE_URL` in both backend and ai-service env vars

## Project Structure

```
MedicalAI/
├── backend/
│   ├── prisma/          # Schema + migrations
│   ├── src/
│   │   ├── auth/        # Auth module (JWT, register, login)
│   │   ├── documents/   # Document upload & management
│   │   ├── chat/        # Chat & messaging
│   │   └── common/      # Guards, interceptors, filters
│   ├── .env
│   └── package.json
├── ai-service/
│   ├── app/             # FastAPI routes & main
│   ├── agents/          # AI agents (summarizer, QA, risk, recommender)
│   ├── core/            # Config & settings
│   ├── models/          # Pydantic schemas
│   ├── rag/             # RAG pipeline (FAISS, embeddings, retrieval)
│   ├── .env
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── app/         # Next.js pages (landing, auth, dashboard, chat, etc.)
    │   ├── components/  # Reusable UI components
    │   ├── hooks/       # Custom hooks (useAuth)
    │   ├── lib/         # API client & utilities
    │   └── types/       # TypeScript types
    ├── .env.local
    └── package.json
```

## AI Agents

The system uses 4 specialized AI agents:

1. **Report Summarization Agent** - Summarizes medical documents and extracts key findings
2. **Medical QA Agent** - Answers questions about uploaded medical documents
3. **Risk Detection Agent** - Identifies abnormal values and potential health concerns
4. **Recommendation Agent** - Suggests follow-up questions and related documents

## RAG Pipeline Flow

```
User Query
  → Vector Search (FAISS)
  → Retrieve Top-K Chunks
  → Context Injection
  → LLM Response with Citations
  → Return to User
```

## License

MIT
