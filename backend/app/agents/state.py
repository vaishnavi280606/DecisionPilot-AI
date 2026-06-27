from typing import Any, Dict, List, TypedDict


class GraphState(TypedDict, total=False):
    customer_id: str
    planner_plan: str
    transcript_findings: str
    crm_findings: str
    support_findings: str
    kb_findings: str
    
    # Risk Metrics
    risk_findings: str
    health_score: float
    churn_risk: float
    upsell_opp: float
    
    # AI Output
    recommendations: List[Dict[str, Any]]
    explainability: str
    reasoning_chain: List[str] # Sequential logs of agent thoughts
    memory_notes: str
    
    # Global Knowledge
    evidence: List[str]
    key_insights: List[str]
    summary: str
