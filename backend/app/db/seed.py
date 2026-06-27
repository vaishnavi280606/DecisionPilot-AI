import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.db.database import SessionLocal, Base, engine
from app.db.models import (
    Customer,
    UploadedDocument,
    Recommendation,
    DecisionHistory,
    Notification,
    UserSettings,
    BusinessRule,
    ToolConnection,
    LearningFeedback,
)

def seed_db(db: Session):
    # Create all tables first if they don't exist
    Base.metadata.create_all(bind=engine)
    
    # Clear existing data to prevent duplications if seeding multiple times
    db.query(Customer).delete()
    db.query(UploadedDocument).delete()
    db.query(Recommendation).delete()
    db.query(DecisionHistory).delete()
    db.query(Notification).delete()
    db.query(UserSettings).delete()
    db.query(BusinessRule).delete()
    db.query(ToolConnection).delete()
    db.query(LearningFeedback).delete()
    db.commit()

    print("Cleared tables. Starting seeding...")

    # 1. User Settings
    settings = UserSettings(
        llm_model="gemini-2.5-flash",
        confidence_threshold=0.75,
        theme="dark",
        business_rules_json=json.dumps([
            "Flag churn risk > 0.50",
            "Require human review for contract value > $100K",
            "Escalate support SLAs over 24h",
        ]),
        is_active=True
    )
    db.add(settings)

    # 2. Tool Connections
    connections = [
        ToolConnection(name="CRM Connector", category="CRM", status="healthy", latency_ms=45.0, config_json=json.dumps({"sync_interval": "1h", "provider": "Salesforce"})),
        ToolConnection(name="Vector Database", category="VectorDB", status="healthy", latency_ms=12.0, config_json=json.dumps({"provider": "ChromaDB", "embeddings": "Gemini Embeddings"})),
        ToolConnection(name="LLM Engine", category="LLM", status="healthy", latency_ms=320.0, config_json=json.dumps({"model": "gemini-2.5-flash", "temperature": 0.2})),
        ToolConnection(name="Email Connector", category="Email", status="healthy", latency_ms=85.0, config_json=json.dumps({"provider": "O365", "sync_folders": ["Inbox", "Sent"]})),
        ToolConnection(name="Calendar Service", category="Calendar", status="healthy", latency_ms=110.0, config_json=json.dumps({"provider": "Google Calendar"})),
        ToolConnection(name="Analytics Engine", category="Analytics", status="healthy", latency_ms=35.0, config_json=json.dumps({"provider": "Supabase Analytics"})),
        ToolConnection(name="Notification Gateway", category="Notification", status="healthy", latency_ms=62.0, config_json=json.dumps({"channels": ["Slack", "Teams", "Email"]})),
    ]
    for conn in connections:
        db.add(conn)

    # 3. Business Rules
    rules = [
        BusinessRule(title="Automatic Upsell Trigger", description="Suggest expansion options if health score exceeds 85% and renewal window is > 6 months.", category="Expansion", condition_type="health_threshold", parameters_json=json.dumps({"health": 85, "renewal_months": 6}), priority=1, is_enabled=True),
        BusinessRule(title="High Churn Risk Intervention", description="Flag accounts with support tickets open > 48h and sentiment score < 4/10.", category="Risk", condition_type="ticket_staleness", parameters_json=json.dumps({"hours": 48, "sentiment": 0.4}), priority=2, is_enabled=True),
        BusinessRule(title="Competitor Threat Alert", description="Escalate account details if competitor names are detected in transcript sentiments.", category="Competitor", condition_type="regex_match", parameters_json=json.dumps({"competitors": ["LinearCorp", "ZendeskPlus", "HubSpotAI"]}), priority=3, is_enabled=True),
        BusinessRule(title="Enterprise Review Gate", description="Require VP of Customer Success review for any actions on accounts with revenue exceeding $2.5M.", category="Compliance", condition_type="revenue_threshold", parameters_json=json.dumps({"revenue": 2500000}), priority=4, is_enabled=True),
        BusinessRule(title="SLA Breach Renewal Hold", description="Prevent automated renewal suggestions if there is an active priority-1 support incident.", category="Billing", condition_type="sla_status", parameters_json=json.dumps({"priority": "P0"}), priority=5, is_enabled=False),
    ]
    for rule in rules:
        db.add(rule)

    # 4. Customers
    customers_data = [
        {
            "customer_id": "nexus-corp",
            "name": "Nexus Corp",
            "tier": "Strategic",
            "revenue": "$4.5M",
            "contract_renewal": "Q3 2026",
            "health_score": 88.0,
            "churn_risk": 0.08,
            "upsell_opp": 0.42,
            "summary": "Strategic account with extremely stable revenue. Major migration from Legacy API to cloud endpoints completed last month. Expanding team size shortly.",
            "key_insights": ["Expanding developer seats by 50 next month", "Legacy migration finalized", "Active engagement with renewal playbooks"],
            "metadata_json": json.dumps({
                "account_manager": "Sarah Jenkins",
                "plan": "Strategic Enterprise Suite",
                "contract_start": "2025-09-01",
                "products_in_use": ["AI Analytics", "Live Agent Sync", "Knowledge Router"],
                "expansion_history": ["+$500k ARR Q4 2025", "+$200k ARR Q2 2026"],
                "past_meetings_count": 18
            })
        },
        {
            "customer_id": "acme-logistics",
            "name": "Acme Logistics",
            "tier": "Enterprise",
            "revenue": "$2.8M",
            "contract_renewal": "Q1 2026",
            "health_score": 46.0,
            "churn_risk": 0.74,
            "upsell_opp": 0.05,
            "summary": "At-risk account. Significant frustration expressed during last three executive business reviews regarding API execution lag and support response delays.",
            "key_insights": ["Open Priority-1 tickets for > 72 hours", "Repeated competitor outreach detected", "Low engagement with client portal"],
            "metadata_json": json.dumps({
                "account_manager": "David Chen",
                "plan": "Enterprise Standard",
                "contract_start": "2024-03-15",
                "products_in_use": ["AI Analytics", "Support Automation"],
                "expansion_history": [],
                "past_meetings_count": 12
            })
        },
        {
            "customer_id": "globex-analytics",
            "name": "Globex Analytics",
            "tier": "Growth Enterprise",
            "revenue": "$1.8M",
            "contract_renewal": "Q4 2026",
            "health_score": 74.0,
            "churn_risk": 0.22,
            "upsell_opp": 0.65,
            "summary": "High growth potential account. Actively inquiring about advanced AI modules and customer feedback triggers. Account manager recently transitioned.",
            "key_insights": ["Requesting trial access for Advanced RAG API", "New CS Lead assigned", "High adoption of Analytics reports"],
            "metadata_json": json.dumps({
                "account_manager": " Sarah Jenkins",
                "plan": "Scale Core Suite",
                "contract_start": "2025-06-01",
                "products_in_use": ["AI Analytics", "Knowledge Router"],
                "expansion_history": ["+$150k ARR Q1 2026"],
                "past_meetings_count": 6
            })
        },
        {
            "customer_id": "vertex-systems",
            "name": "Vertex Systems",
            "tier": "Enterprise",
            "revenue": "$950K",
            "contract_renewal": "Q2 2026",
            "health_score": 92.0,
            "churn_risk": 0.04,
            "upsell_opp": 0.18,
            "summary": "Exceedingly happy client. Integration metrics are fully stable with 99.9% uptime. Low volume of tickets, all resolved within standard SLA timelines.",
            "key_insights": ["High user satisfaction NPS of 9", "Zero open escalations", "Ready to cross-sell Email Automation"],
            "metadata_json": json.dumps({
                "account_manager": "Emma Watson",
                "plan": "Standard Enterprise Plan",
                "contract_start": "2025-05-10",
                "products_in_use": ["AI Analytics", "Knowledge Router"],
                "expansion_history": ["+$80k ARR Q3 2025"],
                "past_meetings_count": 15
            })
        },
        {
            "customer_id": "heliux-energy",
            "name": "Heliux Energy",
            "tier": "Strategic",
            "revenue": "$5.8M",
            "contract_renewal": "Q3 2026",
            "health_score": 62.0,
            "churn_risk": 0.48,
            "upsell_opp": 0.35,
            "summary": "Strategic client in renewal window negotiations. Experiencing integration errors on the analytics sync node which is impacting business reporting visibility.",
            "key_insights": ["Negotiating price terms for 2-year renewal", "Integration error logs flagged on DB connector", "Active support ticket escalated"],
            "metadata_json": json.dumps({
                "account_manager": "David Chen",
                "plan": "Strategic Enterprise Suite",
                "contract_start": "2024-08-01",
                "products_in_use": ["AI Analytics", "Live Agent Sync", "Knowledge Router"],
                "expansion_history": ["+$1.2M ARR Q1 2025"],
                "past_meetings_count": 22
            })
        }
    ]

    customers = []
    for c in customers_data:
        cust = Customer(
            customer_id=c["customer_id"],
            name=c["name"],
            tier=c["tier"],
            revenue=c["revenue"],
            contract_renewal=c["contract_renewal"],
            health_score=c["health_score"],
            churn_risk=c["churn_risk"],
            upsell_opp=c["upsell_opp"],
            summary=c["summary"],
            key_insights=json.dumps(c["key_insights"]),
            metadata_json=c["metadata_json"],
        )
        db.add(cust)
        customers.append(cust)
    db.flush()

    # 5. Documents (Transcripts, CRM logs, Support tickets, Email logs)
    documents = [
        # Nexus Corp documents
        UploadedDocument(
            customer_id="nexus-corp",
            source_type="transcript",
            filename="Q2_CS_Milestone_Review.txt",
            status="indexed",
            content="""Sarah: Thanks for joining today's review. The core API migration is fully complete. How is the team feeling?
Client: Honestly, the dashboard loading speeds have improved significantly. We are extremely pleased. We do have one complaint: the auto-refresh latency on the logs list is slightly higher than we wanted, but the feature requests for seats expansions are ready.
Sarah: Understood. I will raise a ticket for the auto-refresh latency. Regarding the 50 new seats, I have drafted the expansion contract.
Client: Perfect. Competitor outreach from HubSpotAI was received last week, but we told them we are fully committed to DecisionPilot.
Action Items:
- Sarah to send seats contract.
- Engineering to look into logs auto-refresh latency.
Sentiment: Highly Positive (Sentiment Score: 8.5/10)"""
        ),
        UploadedDocument(
            customer_id="nexus-corp",
            source_type="support",
            filename="SLA_Query_Logs_Issue.txt",
            status="indexed",
            content="""Ticket: #5021 - Webhook Retries Delay
Priority: Medium
Severity: Level-3
Status: Resolved
Resolution Time: 2.5 hours
CES: 9/10
Client reported that webhook payloads were delayed by 5 minutes during peak hours. Investigation revealed a Redis queue backlog. Reconfigured partition key to distribute traffic. Webhooks resolved immediately. No escalations."""
        ),
        UploadedDocument(
            customer_id="nexus-corp",
            source_type="email",
            filename="Email_Seat_Expansion_Confirmation.txt",
            status="indexed",
            content="""From: Sarah Jenkins <s.jenkins@decisionpilot.ai>
To: John Doe <j.doe@nexuscorp.com>
Subject: Re: Expansion Seats Invoice Setup

Hi John,
Thanks for confirming the expansion order. I have applied the custom strategic tier pricing rules, which adds the 50 developer licenses to your account dashboard starting Monday. Please find the draft invoice under the contract overview tab.
Best,
Sarah
-- Summary: Seat expansion finalized. Sent contract draft.
-- Sentiment: Positive"""
        ),

        # Acme Logistics documents
        UploadedDocument(
            customer_id="acme-logistics",
            source_type="transcript",
            filename="Critical_Escalation_Meeting.txt",
            status="indexed",
            content="""David: I wanted to address the SLA breaches you reported. Can you detail the core failures?
Client: The system went offline twice last week. Our warehouse delivery drivers could not query routing APIs, which led to a complete shipping backlog. It is a critical complaint!
Client: Additionally, ZendeskPlus and LinearCorp have reached out with SLA guarantees. If this API lag persists, we will churn.
David: We are currently scaling the db connector tool layer.
Action Items:
- Database Architect to review partition indexing.
- David to send service credit options.
Sentiment: Negative (Sentiment Score: 2.2/10)"""
        ),
        UploadedDocument(
            customer_id="acme-logistics",
            source_type="support",
            filename="API_Crash_Incident.txt",
            status="indexed",
            content="""Ticket: #4982 - Router Endpoint 500 Crash
Priority: High
Severity: Level-1
Status: Open
Resolution Time: Ongoing (>72 hours)
CES: Pending
Escalations: Escalated to engineering lead.
Incident report: The routing API failed with 500 Internal Server errors under a load of 150 requests/sec. Database connections exhausted. Temporary fix applied, but database pool indexing requires a structural redesign to prevent query deadlocks."""
        ),
        UploadedDocument(
            customer_id="acme-logistics",
            source_type="email",
            filename="Threat_Outreach_Alert.txt",
            status="indexed",
            content="""From: VP Ops <vp.ops@acmelogistics.com>
To: David Chen <d.chen@decisionpilot.ai>
Subject: SLA Compensation Request

David,
Following up on our call. This is the third outage this quarter. We require a formal Root Cause Analysis (RCA) and SLA credit compensation by Friday. We are currently evaluating alternatives, including LinearCorp, which offers 99.99% uptime guarantees.
-- Summary: Client demanding service credits and RCA due to recurring downtime. Active churn threat.
-- Sentiment: Angry / Critical"""
        ),

        # Heliux Energy documents
        UploadedDocument(
            customer_id="heliux-energy",
            source_type="support",
            filename="Support_Ticket_Analytics_Timeout.txt",
            status="indexed",
            content="""Ticket: #5108 - Analytics Dashboard Timeout
Priority: High
Severity: Level-2
Status: Open
Resolution Time: 36 hours
CES: Pending
Escalations: Escalated to customer success manager.
Client reports that querying annual usage trends returns a gateway timeout error. Log inspection points to large data aggregates on database sync tasks."""
        ),
    ]

    for doc in documents:
        db.add(doc)
    db.flush()

    # 6. Recommendations & History
    recs_data = [
        {
            "customer_id": "nexus-corp",
            "title": "Proactive Seat Expansion Upsell",
            "details": "Trigger seat expansion terms and send strategic contracts. Customer sentiment is high and legacy migrations have completed successfully.",
            "priority": "High",
            "confidence_score": 0.94,
            "impact": "Increases ARR by $60,000 (+15% account value)",
            "evidence": "Customer confirmed need for 50 additional licenses in Q2 CS Review transcript. Uptime at 99.99%.",
            "reasoning_chain": json.dumps([
                "Planner Agent: Established upsell scenario identification based on contract timing.",
                "Transcript Agent: Identified verbal seat expansion requests in Q2 CS review.",
                "CRM Agent: Validated Strategic Tier and $4.5M ARR status.",
                "Business Rules Engine: Applied Upsell Rule priority #1 (Health > 85%, Renewal > 6M).",
                "Recommendation Agent: Built Proactive Seats contract outline.",
                "Explainability Agent: Formulated confidence mapping (94%)."
            ]),
            "status": "approved",
            "decision": "approved",
            "edited_action": "Proceed with 50 developer seats at standard strategic discount rates.",
            "outcome_notes": "Invoice generated. Client approved contract and seats went active on Monday. ARR updated successfully."
        },
        {
            "customer_id": "acme-logistics",
            "name": "Acme Logistics",
            "title": "Immediate Technical SLA Credit & Architecture Audit",
            "details": "Submit formal RCA to executive sponsor and credit the account for downtime. Schedule emergency database optimization workshop with core engineering.",
            "priority": "High",
            "confidence_score": 0.88,
            "impact": "Mitigates active churn threat. Saves $2.8M contract value.",
            "evidence": "High churn risk (74%), Open ticket #4982 for > 72 hours, competitor mention (LinearCorp) in email alert.",
            "reasoning_chain": json.dumps([
                "Planner Agent: Initiated risk mitigation protocol.",
                "Support Agent: Detected Open Priority-1 ticket #4982 with severe resolution lag.",
                "Risk Analysis Agent: Flagged churn risk index at 0.74 due to competitive outreach.",
                "Business Rules Engine: Executed High Churn intervention rules.",
                "Explainability Agent: Checked evidence mapping against SLAs."
            ]),
            "status": "pending",
            "decision": None,
            "edited_action": None,
            "outcome_notes": None
        },
        {
            "customer_id": "globex-analytics",
            "title": "Advanced RAG Add-On Proposal",
            "details": "Deliver custom trial access link for Advanced RAG API and schedule a CS demo session. Globex is exploring advanced semantic search tools.",
            "priority": "Medium",
            "confidence_score": 0.82,
            "impact": "Adds $24,000 ARR in Q3 product expansion.",
            "evidence": "Search log inquiry and customer requests recorded in CSM handover records.",
            "reasoning_chain": json.dumps([
                "Planner Agent: Flagged expansion window query.",
                "Knowledge Agent: Retrieved playbook 'Semantic Add-on upsell paths'.",
                "Recommendation Agent: Compiled customized trial outline."
            ]),
            "status": "pending",
            "decision": None,
            "edited_action": None,
            "outcome_notes": None
        }
    ]

    for r_data in recs_data:
        rec = Recommendation(
            customer_id=r_data["customer_id"],
            title=r_data["title"],
            details=r_data["details"],
            priority=r_data["priority"],
            confidence_score=r_data["confidence_score"],
            impact=r_data["impact"],
            evidence=r_data["evidence"],
            reasoning_chain=r_data["reasoning_chain"],
            status=r_data["status"],
        )
        db.add(rec)
        db.flush()

        if r_data["decision"]:
            history = DecisionHistory(
                recommendation_id=rec.id,
                decision=r_data["decision"],
                edited_action=r_data["edited_action"] or "",
                outcome_notes=r_data["outcome_notes"] or "",
            )
            db.add(history)
            
            # Seed learning feedback as well for approved items
            feedback = LearningFeedback(
                recommendation_id=rec.id,
                customer_id=rec.customer_id,
                outcome="upsold",
                accuracy_rating=0.95,
                feedback_notes="Successful seat expansion. The prompt and reasoning were 100% accurate to conversation.",
                learned_pattern="Highly positive customer conversation about seat count triggers high likelihood expansion contract completion.",
                playbook_updated=True
            )
            db.add(feedback)
            
    # Add some additional historic learning items
    historic_feedbacks = [
        LearningFeedback(customer_id="vertex-systems", outcome="renewed", accuracy_rating=0.98, feedback_notes="Standard renewal approved without issues.", learned_pattern="Regular CSM checkins and uptime >99.9% correlates with 98% renewal rate.", playbook_updated=False),
        LearningFeedback(customer_id="acme-logistics", outcome="churned", accuracy_rating=0.45, feedback_notes="Lost contract due to recurring server failures.", learned_pattern="Priority-1 issues open > 48h increases churn risk by 4x. Playbooks updated to escalate immediately.", playbook_updated=True),
    ]
    for hf in historic_feedbacks:
        db.add(hf)

    # 7. Notifications
    notifications = [
        Notification(type="recommendation", title="New High-Value Upsell Generated", message="Strategic upsell generated for Nexus Corp. seat expansion contract. Estimated impact: +$60k ARR.", is_read=False),
        Notification(type="system", title="Acme Logistics Churn Risk Alert", message="Acme Logistics churn index spiked to 74% following Router endpoint crash #4982.", is_read=False),
        Notification(type="system", title="Heliux Energy Renewal Due", message="Heliux Energy contract renewal window is entering Q3. Initial terms pending.", is_read=True),
        Notification(type="upload", title="Transcript Ingestion Completed", message="Q2 CS Milestone Review for Nexus Corp has been indexed and chunked in ChromaDB.", is_read=True),
    ]
    for n in notifications:
        db.add(n)

    db.commit()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    import os
    db_file = "decisionpilot.db"
    if os.path.exists(db_file):
        try:
            os.remove(db_file)
            print(f"Deleted existing database file at {db_file}")
        except Exception as e:
            print(f"Could not delete database file: {e}")
            
    db = SessionLocal()
    try:
        seed_db(db)
    finally:
        db.close()
