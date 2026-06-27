# DecisionPilot AI - Intelligent Next Best Action Platform

DecisionPilot AI is a full-stack intelligent orchestration platform that fuses enterprise signals from meeting transcripts, CRM records, support tickets, emails, and knowledge-base documents to generate explainable next-best actions.

## Stack

- Frontend: React + TypeScript + Tailwind CSS + Shadcn-style UI components
- Backend: FastAPI + SQLAlchemy
- Agent Orchestration: LangGraph multi-agent workflow
- LLM: Gemini 2.5 Flash (`gemini-2.5-flash`)
- Vector Store: ChromaDB (embeddings for RAG)
- Relational Store: SQLite for development (can switch to PostgreSQL)

## Architecture

- Clean architecture with reusable modules:
  - `backend/app/api`: HTTP routes
  - `backend/app/services`: business services (ingestion, recommendation workflow integration)
  - `backend/app/agents`: LangGraph state, node logic, graph composition
  - `backend/app/rag`: ChromaDB integration
  - `backend/app/db`: persistence models, schemas, and database setup

### Multi-Agent Roles

1. Planner Agent: defines analysis plan across enterprise data sources.
2. Transcript Analysis Agent: extracts meeting intent, blockers, sentiment, urgency.
3. CRM Agent: analyzes pipeline, renewals, and expansion indicators.
4. Support Ticket Agent: identifies recurring issues and operational risk.
5. Knowledge Base (RAG) Agent: retrieves relevant enterprise playbooks from ChromaDB.
6. Risk Analysis Agent: computes risk score and opportunity profile.
7. Recommendation Agent: generates next-best-action recommendations with confidence.
8. Explainability Agent: summarizes rationale and supporting evidence.
9. Memory Agent: incorporates historical decision outcomes.

## Features

- Upload data by source type (`transcript`, `crm`, `support`, `email`, `knowledge_base`)
- Supported document formats: PDF, DOCX, CSV, TXT/MD, EML
- Document text extraction and indexing into ChromaDB
- End-to-end LangGraph orchestration for customer analysis
- Explainable recommendations with confidence and evidence
- Human-in-the-Loop decision interface:
  - Approve
  - Reject
  - Approve with Edit
- Decision and outcome memory persisted for future recommendations
- Dashboard sections:
  - Uploads
  - Customer Summary
  - Risk Score
  - Recommendations
  - Evidence / Explainability
  - Approval
  - Recommendation History

## Setup

## 1) Backend

1. Open terminal and navigate:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   .venv\\Scripts\\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment:
   ```bash
   copy .env.example .env
   ```
5. Edit `.env` and set:
   - `GOOGLE_API_KEY`
   - Optionally `DATABASE_URL` (use PostgreSQL URL in production)
6. Start API:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

## 2) Frontend

1. Open a second terminal and navigate:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run dev server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173`.

## API Endpoints

- `POST /api/upload` - upload and index source files
- `POST /api/analyze/{customer_id}` - run LangGraph orchestration
- `GET /api/customer/{customer_id}/summary` - customer summary and risk score
- `GET /api/customer/{customer_id}/recommendations` - generated recommendations
- `POST /api/recommendations/{recommendation_id}/approval` - approve/reject/edit recommendation
- `GET /api/customer/{customer_id}/history` - recommendation decision history

## Production Notes

- Replace SQLite with PostgreSQL by setting `DATABASE_URL`.
- Persist Chroma data directory in durable storage.
- Add authentication/authorization before production use.
- Add observability (traces, structured logging, metrics).
- Extend agent prompts with domain-specific ontologies and policy constraints.

## Project Structure

```text
backend/
  app/
    agents/
    api/
    core/
    db/
    rag/
    services/
  requirements.txt
frontend/
  src/
    components/
      dashboard/
      ui/
    lib/
  package.json
README.md
```
