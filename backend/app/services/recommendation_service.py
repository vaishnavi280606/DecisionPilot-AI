import json
from datetime import datetime
from typing import List, Tuple
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.agents.graph import build_graph
from app.db.models import Customer, DecisionHistory, Recommendation


def run_analysis(customer_id: str, db: Session) -> Recommendation:
    workflow = build_graph(db)
    # The evidence field in state could be populated from recent transcript texts
    result = workflow.invoke({"customer_id": customer_id, "evidence": []})

    recommendations_data = result.get("recommendations", [])
    primary = recommendations_data[0] if recommendations_data else {
        "title": "Insufficient Signal for Action",
        "details": "The AI orchestrator requires more enterprise signals (Transcripts/CRM) to generate a high-confidence recommendation.",
        "priority": "Low",
        "confidence_score": 0.0,
        "impact": "None identified",
        "evidence": "N/A",
    }

    # reasoning_chain is expected to be a list of strings from the agents
    reasoning = result.get("reasoning_chain", ["Planner initiated", "Information gathering..."])

    recommendation = Recommendation(
        customer_id=customer_id,
        title=primary.get("title", "Strategic Insight"),
        details=primary.get("details", ""),
        priority=primary.get("priority", "Medium"),
        confidence_score=float(primary.get("confidence_score", 0.0)),
        impact=primary.get("impact", ""),
        evidence=primary.get("evidence", ""),
        reasoning_chain=json.dumps(reasoning),
        status="pending",
    )
    db.add(recommendation)

    # Update or Create Customer Profile
    customer = db.query(Customer).filter(Customer.customer_id == customer_id).first()
    if not customer:
        customer = Customer(customer_id=customer_id, name=customer_id.replace("-", " ").title())
        db.add(customer)

    customer.summary = result.get("summary", "")
    customer.health_score = float(result.get("health_score", customer.health_score))
    customer.churn_risk = float(result.get("churn_risk", customer.churn_risk))
    customer.upsell_opp = float(result.get("upsell_opp", customer.upsell_opp))
    customer.key_insights = json.dumps(result.get("key_insights", []))
    customer.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(recommendation)
    return recommendation


def get_customer_profile(customer_id: str, db: Session) -> Customer | None:
    return db.query(Customer).filter(Customer.customer_id == customer_id).first()


def get_recommendations(customer_id: str, db: Session) -> List[Recommendation]:
    return (
        db.query(Recommendation)
        .filter(Recommendation.customer_id == customer_id)
        .order_by(desc(Recommendation.created_at))
        .all()
    )


def apply_decision(
    recommendation: Recommendation,
    decision: str,
    edited_action: str = "",
    outcome_notes: str = "",
    db: Session = None,
) -> Recommendation:
    recommendation.status = decision
    
    # Save the decision in history
    history = DecisionHistory(
        recommendation_id=recommendation.id,
        decision=decision,
        edited_action=edited_action,
        outcome_notes=outcome_notes
    )
    db.add(history)

    db.commit()
    db.refresh(recommendation)
    return recommendation


def get_history(customer_id: str, db: Session) -> List[Tuple[DecisionHistory, Recommendation]]:
    return (
        db.query(DecisionHistory, Recommendation)
        .join(Recommendation, Recommendation.id == DecisionHistory.recommendation_id)
        .filter(Recommendation.customer_id == customer_id)
        .order_by(desc(DecisionHistory.created_at))
        .all()
    )
