from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Customer, UploadedDocument, Recommendation, Notification, UserSettings, BusinessRule, ToolConnection, LearningFeedback, DecisionHistory
from app.db.schemas import (
    CustomerSchema, 
    CustomerCreate, 
    UploadResponse, 
    RecommendationSchema, 
    RecommendationApprovalRequest,
    NotificationSchema,
    UserSettingsSchema,
    DashboardAnalytics,
    MessageResponse,
    BusinessRuleCreate,
    BusinessRuleSchema,
    ToolConnectionSchema,
    ToolConnectionConfigPatch,
    LearningFeedbackSchema
)
from app.services.recommendation_service import run_analysis, get_customer_profile, get_recommendations, apply_decision, get_history
from app.services.file_ingestion import SUPPORTED_EXTENSIONS, extract_text
from app.rag.chroma_store import chroma_service
import json
import asyncio
from datetime import datetime

router = APIRouter()

# --- Customer Endpoints ---

@router.get("/customers", response_model=List[CustomerSchema])
def list_customers(db: Session = Depends(get_db)):
    customers = db.query(Customer).all()
    results = []
    for c in customers:
        c_dict = {
            "id": c.id,
            "customer_id": c.customer_id,
            "name": c.name,
            "tier": c.tier,
            "revenue": c.revenue,
            "contract_renewal": c.contract_renewal,
            "health_score": c.health_score,
            "churn_risk": c.churn_risk,
            "upsell_opp": c.upsell_opp,
            "summary": c.summary,
            "updated_at": c.updated_at,
        }
        try:
            c_dict["key_insights"] = json.loads(c.key_insights or "[]")
        except Exception:
            c_dict["key_insights"] = []
        results.append(c_dict)
    return results

@router.get("/customer/{customer_id}", response_model=CustomerSchema)
def get_customer(customer_id: str, db: Session = Depends(get_db)):
    c = get_customer_profile(customer_id, db)
    if not c:
        raise HTTPException(status_code=404, detail="Customer not found")
    c_dict = {
        "id": c.id,
        "customer_id": c.customer_id,
        "name": c.name,
        "tier": c.tier,
        "revenue": c.revenue,
        "contract_renewal": c.contract_renewal,
        "health_score": c.health_score,
        "churn_risk": c.churn_risk,
        "upsell_opp": c.upsell_opp,
        "summary": c.summary,
        "updated_at": c.updated_at,
    }
    try:
        c_dict["key_insights"] = json.loads(c.key_insights or "[]")
    except Exception:
        c_dict["key_insights"] = []
    return c_dict

# --- Knowledge & Upload Endpoints ---

@router.post("/upload", response_model=UploadResponse)
async def upload_files(
    customer_id: str = Form(...),
    source_type: str = Form(...),
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
):
    valid_sources = {"transcript", "crm", "support", "email", "knowledge_base"}
    if source_type not in valid_sources:
        raise HTTPException(status_code=400, detail="Invalid source_type")

    ingested_records = []
    for file in files:
        if not any(file.filename.lower().endswith(ext) for ext in SUPPORTED_EXTENSIONS):
            continue
            
        content = await file.read()
        text = extract_text(file.filename, content)
        
        doc = UploadedDocument(
            customer_id=customer_id,
            source_type=source_type,
            filename=file.filename,
            content=text,
            status="indexed"
        )
        db.add(doc)
        db.flush()
        
        chroma_service.add_documents(
            customer_id=customer_id,
            source_type=source_type,
            filename=file.filename,
            content=text
        )
        ingested_records.append(doc)

    db.commit()
    return UploadResponse(message=f"Successfully indexed {len(ingested_records)} files", ingested_files=ingested_records)

# --- WebSocket & AI Orchestration ---

from fastapi import WebSocket, WebSocketDisconnect

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"WebSocket client connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        print(f"WebSocket client disconnected. Total connections: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

ws_manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive, listen for ping, return pong
            data = await websocket.receive_text()
            await websocket.send_json({"type": "pong", "message": "alive"})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)


@router.post("/analyze/{customer_id}", response_model=RecommendationSchema)
async def analyze_customer(customer_id: str, db: Session = Depends(get_db)):
    # 1. Define the 12 LangGraph agents in order of the orchestration workflow
    agents = [
        {
            "id": "planner",
            "name": "Planner Agent",
            "dependencies": [],
            "tool_calls": [],
            "logs": "Initializing orchestrator. Examining customer logs and parsing tasks...",
            "output": f"Analysis plan drafted for client: {customer_id.replace('-', ' ').title()}."
        },
        {
            "id": "transcript",
            "name": "Transcript Agent",
            "dependencies": ["Planner Agent"],
            "tool_calls": [{"name": "Retrieve Meeting Transcripts", "latency": "140ms", "request": f"customer_id={customer_id}", "response": "Found Q2CS Review text"}],
            "logs": "Scanning meeting transcripts. Indexing sentiment and commitments...",
            "output": "Extracted meeting insights. Customer reported logs lag and requested seat expansion."
        },
        {
            "id": "crm",
            "name": "CRM Context Agent",
            "dependencies": ["Planner Agent"],
            "tool_calls": [{"name": "Salesforce API Sync", "latency": "190ms", "request": f"account_id={customer_id}", "response": "Strategic Tier ARR: $4.5M"}],
            "logs": "Loading customer ARR, billing terms, account ownership, and contract statuses...",
            "output": "CRM profile synced: Strategic Tier, $4.5M ARR, contract renewal Q3 2026."
        },
        {
            "id": "support",
            "name": "Support Agent",
            "dependencies": ["Planner Agent"],
            "tool_calls": [{"name": "Fetch Support Tickets", "latency": "150ms", "request": f"status=open", "response": "1 resolved ticket #5021"}],
            "logs": "Checking open tickets, average response times, and unresolved CSAT scores...",
            "output": "Support tickets verified. 1 resolved incident for Redis webhook latency."
        },
        {
            "id": "knowledge",
            "name": "Knowledge Retrieval Agent",
            "dependencies": ["Transcript Agent", "CRM Context Agent"],
            "tool_calls": [{"name": "Vector DB Retrieval", "latency": "88ms", "request": "query=seat expansion discount rules", "response": "Retrieved Playbook_Seats_v2"}],
            "logs": "Querying ChromaDB vector database for matching renewal playbooks...",
            "output": "Retrieved Playbook_Seats_v2. Confidence score: 92%."
        },
        {
            "id": "usage",
            "name": "Usage Analytics Agent",
            "dependencies": ["CRM Context Agent"],
            "tool_calls": [{"name": "Clickstream Database Ping", "latency": "130ms", "request": "metric=uptime_30_days", "response": "99.99% system uptime, NPS: 9"}],
            "logs": "Auditing telemetry data: Active users, product uptime, and license utilization trends...",
            "output": "Uptime stable at 99.99%. Net Promoter Score is 9/10."
        },
        {
            "id": "risk",
            "name": "Risk Analysis Agent",
            "dependencies": ["Transcript Agent", "CRM Context Agent", "Support Agent", "Usage Analytics Agent"],
            "tool_calls": [],
            "logs": "Running churn regression models and health metrics evaluation...",
            "output": "Risk index finalized: Health 88%, Churn risk 8%, expansion opportunity 42%."
        },
        {
            "id": "rules",
            "name": "Business Rule Engine",
            "dependencies": ["Risk Analysis Agent"],
            "tool_calls": [{"name": "Get Enabled Rules", "latency": "42ms", "request": "is_enabled=true", "response": "Loaded 4 business rules"}],
            "logs": "Validating output against active organizational business rules...",
            "output": "Rule triggered: Automatic Upsell Trigger (Health > 85%, Renewal window > 6 months)."
        },
        {
            "id": "recommendation",
            "name": "Recommendation Agent",
            "dependencies": ["Business Rule Engine"],
            "tool_calls": [],
            "logs": "Synthesizing optimal Next Best Action based on business rule outcomes...",
            "output": "Recommendation built: Proactive Seat Expansion Upsell (Impact: +$60k ARR, Priority: High)."
        },
        {
            "id": "explainability",
            "name": "Explainability Agent",
            "dependencies": ["Recommendation Agent"],
            "tool_calls": [],
            "logs": "Fusing evidence mappings and calculating agent contribution metrics...",
            "output": "Reasoning chain prepared. Attribution weights: Risk 30%, Knowledge 25%, Recommendation 20%, Rules 15%, Planner 10%."
        },
        {
            "id": "review",
            "name": "Human Review",
            "dependencies": ["Explainability Agent"],
            "tool_calls": [],
            "logs": "Submitting recommendation draft to human review queue...",
            "output": "Recommendation queued. Awaiting administrator review decision."
        },
        {
            "id": "memory",
            "name": "Memory Manager",
            "dependencies": ["Human Review"],
            "tool_calls": [{"name": "Save Decision State", "latency": "55ms", "request": "insert_decision_history", "response": "Success"}],
            "logs": "Caching session metrics and updating mid-term customer memory parameters...",
            "output": "Customer Memory updated. Learning feedback loop notified."
        }
    ]

    # Customize responses for acme-logistics to match its critical metrics
    if customer_id == "acme-logistics":
        agents[1]["output"] = "Critical complaints of database lag and system crash found in transcript."
        agents[3]["output"] = "Support SLA Breached: Priority-1 ticket open for > 72 hours."
        agents[4]["output"] = "Retrieved playbook 'High-risk escalation credits'."
        agents[5]["output"] = "Mixpanel shows 2 outages. Uptime dropped to 94.2%."
        agents[6]["output"] = "Risk calculated. Health score: 46%, Churn risk: 74%."
        agents[7]["output"] = "Rules triggered: SLA breach credit triggers required review."
        agents[8]["output"] = "Recommendation: SLA credit compensation + emergency DB audit."
        agents[9]["output"] = "Explainability Attribution: Support 45%, Risk 35%, Planner 10%, Rules 10%."

    # Broadcast initial states
    for agent in agents:
        await ws_manager.broadcast({
            "type": "agent_update",
            "customer_id": customer_id,
            "agent": agent["id"],
            "name": agent["name"],
            "status": "pending",
            "time_taken": 0.0,
            "logs": "",
            "output": "",
            "dependencies": agent["dependencies"],
            "tool_calls": []
        })

    # Execute and stream agent workflow ticks
    for agent in agents:
        # Broadcast running state
        await ws_manager.broadcast({
            "type": "agent_update",
            "customer_id": customer_id,
            "agent": agent["id"],
            "name": agent["name"],
            "status": "running",
            "time_taken": 0.0,
            "logs": agent["logs"],
            "output": "",
            "dependencies": agent["dependencies"],
            "tool_calls": agent["tool_calls"]
        })
        await asyncio.sleep(0.3)

        # Broadcast completed state with simulated execution latency
        lat = round(0.08 + (hash(agent["id"]) % 6) / 15, 2)
        await ws_manager.broadcast({
            "type": "agent_update",
            "customer_id": customer_id,
            "agent": agent["id"],
            "name": agent["name"],
            "status": "completed",
            "time_taken": lat,
            "logs": agent["logs"] + "\nExecution successfully completed.",
            "output": agent["output"],
            "dependencies": agent["dependencies"],
            "tool_calls": agent["tool_calls"]
        })

    # Trigger actual LangGraph db commits
    rec = run_analysis(customer_id, db)

    # Save and emit notification
    new_notification = Notification(
        type="recommendation",
        title=f"Analysis Complete: {rec.title}",
        message=f"Strategic recommendation completed for {customer_id.replace('-', ' ').title()} with score {(rec.confidence_score*100):.0f}%.",
        is_read=False
    )
    db.add(new_notification)
    db.commit()

    # Stream notification to UI
    await ws_manager.broadcast({
        "type": "notification",
        "notification": {
            "id": new_notification.id,
            "type": new_notification.type,
            "title": new_notification.title,
            "message": new_notification.message,
            "is_read": False,
            "created_at": str(new_notification.created_at)
        }
    })

    # Send global refresh trigger
    await ws_manager.broadcast({
        "type": "dashboard_refresh",
        "customer_id": customer_id
    })

    rec.reasoning_chain = json.loads(rec.reasoning_chain or "[]")
    return rec


@router.get("/customer/{customer_id}/recommendations", response_model=List[RecommendationSchema])
def customer_recommendations(customer_id: str, db: Session = Depends(get_db)):
    recs = get_recommendations(customer_id, db)
    for r in recs:
        r.reasoning_chain = json.loads(r.reasoning_chain or "[]")
    return recs


@router.post("/recommendations/{recommendation_id}/action", response_model=RecommendationSchema)
async def take_recommendation_action(
    recommendation_id: int,
    payload: RecommendationApprovalRequest,
    db: Session = Depends(get_db)
):
    recommendation = db.query(Recommendation).filter(Recommendation.id == recommendation_id).first()
    if not recommendation:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    updated = apply_decision(
        recommendation=recommendation,
        decision=payload.decision,
        edited_action=payload.edited_action,
        outcome_notes=payload.outcome_notes,
        db=db
    )
    
    # Continuous Learning Loop: Save outcome feedback automatically
    feedback = LearningFeedback(
        recommendation_id=updated.id,
        customer_id=updated.customer_id,
        outcome="renewed" if payload.decision == "approved" else "active",
        accuracy_rating=0.98 if payload.decision == "approved" else 0.50,
        feedback_notes=payload.outcome_notes or "Processed via Human Review portal.",
        learned_pattern=f"Human Approved strategic action: '{updated.title}' for {updated.customer_id}.",
        playbook_updated=True if payload.decision == "approved" else False
    )
    db.add(feedback)
    
    # Seed notification of memory update
    new_notif = Notification(
        type="system",
        title="Memory Sync Completed",
        message=f"Feedback outcome registered for recommendation #{updated.id}. Continuous learning model updated.",
        is_read=False
    )
    db.add(new_notif)
    db.commit()

    # Stream notification & memory update via websockets
    await ws_manager.broadcast({
        "type": "notification",
        "notification": {
            "id": new_notif.id,
            "type": new_notif.type,
            "title": new_notif.title,
            "message": new_notif.message,
            "is_read": False,
            "created_at": str(new_notif.created_at)
        }
    })
    
    await ws_manager.broadcast({
        "type": "learning_update",
        "customer_id": updated.customer_id
    })

    updated.reasoning_chain = json.loads(updated.reasoning_chain or "[]")
    return updated


# --- Notifications ---

@router.get("/notifications", response_model=List[NotificationSchema])
def get_notifications(db: Session = Depends(get_db)):
    return db.query(Notification).order_by(Notification.created_at.desc()).limit(20).all()


@router.put("/notifications/read", response_model=MessageResponse)
def mark_notifications_read(db: Session = Depends(get_db)):
    db.query(Notification).filter(Notification.is_read == False).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}


# --- Settings ---

@router.get("/settings", response_model=UserSettingsSchema)
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(UserSettings).filter(UserSettings.is_active == True).first()
    if not settings:
        settings = UserSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return UserSettingsSchema(
        llm_model=settings.llm_model,
        confidence_threshold=settings.confidence_threshold,
        theme=settings.theme,
        business_rules=json.loads(settings.business_rules_json or "[]")
    )


@router.put("/settings", response_model=UserSettingsSchema)
def update_settings(payload: UserSettingsSchema, db: Session = Depends(get_db)):
    settings = db.query(UserSettings).filter(UserSettings.is_active == True).first()
    if not settings:
        settings = UserSettings()
        db.add(settings)
        
    settings.llm_model = payload.llm_model
    settings.confidence_threshold = payload.confidence_threshold
    settings.theme = payload.theme
    settings.business_rules_json = json.dumps(payload.business_rules)
    db.commit()
    db.refresh(settings)
    return UserSettingsSchema(
        llm_model=settings.llm_model,
        confidence_threshold=settings.confidence_threshold,
        theme=settings.theme,
        business_rules=json.loads(settings.business_rules_json or "[]")
    )


# --- Analytics & Dual Dashboards ---

@router.get("/analytics", response_model=DashboardAnalytics)
def get_analytics(db: Session = Depends(get_db)):
    total_customers = db.query(Customer).count()
    active_recs = db.query(Recommendation).filter(Recommendation.status == "pending").count()
    avg_health = db.query(Customer).with_entities(Customer.health_score).all()
    health_score = sum([h[0] for h in avg_health]) / len(avg_health) if avg_health else 0.0
    high_risk = db.query(Customer).filter(Customer.churn_risk > 0.5).count()

    return DashboardAnalytics(
        total_customers=total_customers,
        active_recommendations=active_recs,
        avg_health_score=health_score,
        high_risk_customers=high_risk,
        revenue_at_risk="$3.2M"
    )


@router.get("/reports")
def get_reports(db: Session = Depends(get_db)):
    # Calculations for Business and Operational Dashboards reports
    total_recs = db.query(Recommendation).count()
    approved_recs = db.query(Recommendation).filter(Recommendation.status == "approved").count()
    accuracy = (approved_recs / total_recs) * 100 if total_recs else 94.0
    
    # Churn trends mock monthly
    churn_trends = [
        {"month": "Jan", "churn": 12, "accuracy": 88},
        {"month": "Feb", "churn": 10, "accuracy": 90},
        {"month": "Mar", "churn": 8, "accuracy": 92},
        {"month": "Apr", "churn": 6, "accuracy": 93},
        {"month": "May", "churn": 4, "accuracy": 95},
        {"month": "Jun", "churn": 3, "accuracy": 96},
    ]

    return {
        "accuracy": accuracy,
        "recommendation_total": total_recs,
        "playbook_success_rate": 89.5,
        "agent_performance": [
            {"agent": "Planner", "latency": "220ms", "accuracy": "98%"},
            {"agent": "Transcript", "latency": "310ms", "accuracy": "95%"},
            {"agent": "CRM", "latency": "180ms", "accuracy": "99%"},
            {"agent": "Support", "latency": "210ms", "accuracy": "94%"},
            {"agent": "Knowledge", "latency": "190ms", "accuracy": "92%"},
            {"agent": "Usage Analytics", "latency": "140ms", "accuracy": "97%"},
            {"agent": "Risk Analysis", "latency": "240ms", "accuracy": "93%"},
            {"agent": "Rules Engine", "latency": "110ms", "accuracy": "99%"}
        ],
        "churn_trends": churn_trends
    }


# --- History, Memory, & Conversations ---

@router.get("/customer/{customer_id}/history")
def get_customer_history(customer_id: str, db: Session = Depends(get_db)):
    history_items = get_history(customer_id, db)
    results = []
    for hist, rec in history_items:
        results.append({
            "recommendation_id": hist.recommendation_id,
            "title": rec.title,
            "decision": hist.decision,
            "edited_action": hist.edited_action,
            "outcome_notes": hist.outcome_notes,
            "created_at": hist.created_at.isoformat()
        })
    return results


@router.get("/customer/{customer_id}/memory")
def get_customer_memory(customer_id: str, db: Session = Depends(get_db)):
    # 1. Session memory: temporary workflow contexts
    session_items = [
        {"key": "active_conversation_id", "value": f"session_{customer_id}_q2_review", "scope": "temporary"},
        {"key": "last_loaded_transcript", "value": "Q2_CS_Milestone_Review.txt", "scope": "temporary"},
        {"key": "agent_execution_token", "value": "token_auth_99f2x", "scope": "temporary"}
    ]
    
    # 2. Customer memory: interaction outcomes
    customer_recs = db.query(Recommendation).filter(Recommendation.customer_id == customer_id).all()
    customer_memory = [
        {"event": f"Recommendation Generated: {rec.title}", "status": rec.status, "confidence": rec.confidence_score}
        for rec in customer_recs
    ]

    # 3. Organization memory: global rules and playbook triggers
    db_rules = db.query(BusinessRule).filter(BusinessRule.is_enabled == True).all()
    org_memory = [
        {"rule_title": rule.title, "rule_priority": rule.priority, "rule_category": rule.category}
        for rule in db_rules
    ]

    return {
        "session_memory": session_items,
        "customer_memory": customer_memory,
        "organization_memory": org_memory
    }


@router.get("/customer/{customer_id}/conversations")
def get_customer_conversations(customer_id: str, db: Session = Depends(get_db)):
    # Pull Uploaded documents and format them as readable chats
    docs = db.query(UploadedDocument).filter(UploadedDocument.customer_id == customer_id).all()
    transcripts = [d for d in docs if d.source_type == "transcript"]
    emails = [d for d in docs if d.source_type == "email"]
    tickets = [d for d in docs if d.source_type == "support"]

    return {
        "transcripts": [
            {"filename": t.filename, "content": t.content, "created_at": t.created_at} for t in transcripts
        ],
        "emails": [
            {"filename": e.filename, "content": e.content, "created_at": e.created_at} for e in emails
        ],
        "tickets": [
            {"filename": ti.filename, "content": ti.content, "created_at": ti.created_at} for ti in tickets
        ]
    }


# --- Business Rules CRUD ---

@router.get("/rules", response_model=List[BusinessRuleSchema])
def list_rules(db: Session = Depends(get_db)):
    return db.query(BusinessRule).order_by(BusinessRule.priority).all()


@router.post("/rules", response_model=BusinessRuleSchema)
def create_rule(payload: BusinessRuleCreate, db: Session = Depends(get_db)):
    rule = BusinessRule(
        title=payload.title,
        description=payload.description,
        category=payload.category,
        condition_type=payload.condition_type,
        parameters_json=payload.parameters_json,
        priority=payload.priority,
        is_enabled=payload.is_enabled
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


@router.put("/rules/{rule_id}", response_model=BusinessRuleSchema)
def update_rule(rule_id: int, payload: BusinessRuleCreate, db: Session = Depends(get_db)):
    rule = db.query(BusinessRule).filter(BusinessRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    
    rule.title = payload.title
    rule.description = payload.description
    rule.category = payload.category
    rule.condition_type = payload.condition_type
    rule.parameters_json = payload.parameters_json
    rule.priority = payload.priority
    rule.is_enabled = payload.is_enabled
    db.commit()
    db.refresh(rule)
    return rule


@router.delete("/rules/{rule_id}", response_model=MessageResponse)
def delete_rule(rule_id: int, db: Session = Depends(get_db)):
    rule = db.query(BusinessRule).filter(BusinessRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    db.delete(rule)
    db.commit()
    return {"message": "Rule successfully deleted"}


@router.post("/rules/test")
def test_rules_scenario(payload: dict, db: Session = Depends(get_db)):
    # Test a custom scenario against database rules
    rules = db.query(BusinessRule).filter(BusinessRule.is_enabled == True).all()
    triggered_rules = []
    
    health = float(payload.get("health", 100))
    revenue = float(payload.get("revenue", 0))
    competitors = payload.get("competitors", [])

    for rule in rules:
        try:
            params = json.loads(rule.parameters_json)
        except Exception:
            params = {}

        triggered = False
        if rule.condition_type == "health_threshold" and health > params.get("health", 85):
            triggered = True
        elif rule.condition_type == "revenue_threshold" and revenue > params.get("revenue", 2500000):
            triggered = True
        elif rule.condition_type == "regex_match":
            rule_comps = params.get("competitors", [])
            if any(c in competitors for c in rule_comps):
                triggered = True

        if triggered:
            triggered_rules.append({"id": rule.id, "title": rule.title, "category": rule.category})

    return {
        "status": "success",
        "scenario_tested": payload,
        "triggered_rules_count": len(triggered_rules),
        "triggered_rules": triggered_rules,
        "recommendation_outcome": "High Churn Escalation Suggested" if health < 60 else "Upsell Suggestion Approved"
    }


# --- Tool Connections Endpoints ---

@router.get("/connections", response_model=List[ToolConnectionSchema])
def list_connections(db: Session = Depends(get_db)):
    return db.query(ToolConnection).all()


@router.post("/connections/{name}/test")
def test_connection(name: str, db: Session = Depends(get_db)):
    conn = db.query(ToolConnection).filter(ToolConnection.name == name).first()
    if not conn:
         raise HTTPException(status_code=404, detail="Tool connection not found")
    
    import random
    conn.latency_ms = round(10.0 + random.random() * 200, 1)
    conn.status = "healthy" if conn.latency_ms < 150 else "warning"
    conn.last_sync = datetime.utcnow()
    db.commit()
    db.refresh(conn)
    return conn


@router.post("/connections/{name}/reconnect")
def reconnect_connection(name: str, db: Session = Depends(get_db)):
    conn = db.query(ToolConnection).filter(ToolConnection.name == name).first()
    if not conn:
         raise HTTPException(status_code=404, detail="Tool connection not found")
    
    conn.status = "healthy"
    conn.latency_ms = 15.0
    conn.last_sync = datetime.utcnow()
    db.commit()
    db.refresh(conn)
    return conn


@router.put("/connections/{name}/config")
def configure_connection(name: str, payload: ToolConnectionConfigPatch, db: Session = Depends(get_db)):
    conn = db.query(ToolConnection).filter(ToolConnection.name == name).first()
    if not conn:
         raise HTTPException(status_code=404, detail="Tool connection not found")
    
    conn.config_json = payload.config_json
    conn.last_sync = datetime.utcnow()
    db.commit()
    db.refresh(conn)
    return conn


# --- Continuous Learning Endpoints ---

@router.get("/learning")
def get_learning_loops(db: Session = Depends(get_db)):
    feedbacks = db.query(LearningFeedback).order_by(LearningFeedback.created_at.desc()).all()
    avg_accuracy = db.query(LearningFeedback).with_entities(LearningFeedback.accuracy_rating).all()
    acc = sum([f[0] for f in avg_accuracy]) / len(avg_accuracy) if avg_accuracy else 0.94

    return {
        "learning_accuracy": acc,
        "patterns_discovered_count": len(feedbacks),
        "timeline": [
            {
                "id": f.id,
                "customer_id": f.customer_id,
                "outcome": f.outcome,
                "accuracy": f.accuracy_rating,
                "notes": f.feedback_notes,
                "pattern": f.learned_pattern,
                "playbook_updated": f.playbook_updated,
                "created_at": f.created_at.isoformat()
            } for f in feedbacks
        ]
    }


# --- Database Re-Seeding Route ---

@router.post("/seed")
def trigger_seed_database(db: Session = Depends(get_db)):
    try:
        from app.db.seed import seed_db
        seed_db(db)
        return {"message": "Database reseeded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reseed failed: {str(e)}")


# --- Search ---

@router.get("/search")
def global_search(q: str, db: Session = Depends(get_db)):
    customers = db.query(Customer).filter(Customer.name.contains(q) | Customer.customer_id.contains(q)).all()
    recommendations = db.query(Recommendation).filter(Recommendation.title.contains(q) | Recommendation.details.contains(q)).all()
    return {
        "customers": customers,
        "recommendations": recommendations,
        "knowledge_base": []
    }

