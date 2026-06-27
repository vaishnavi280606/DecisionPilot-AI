from langgraph.graph import END, START, StateGraph
from sqlalchemy.orm import Session

from app.agents.nodes import (
    crm_analysis_node,
    explainability_node,
    kb_rag_node,
    memory_node,
    planner_node,
    recommendation_node,
    risk_analysis_node,
    support_ticket_node,
    transcript_analysis_node,
)
from app.agents.state import GraphState


def build_graph(db: Session):
    graph = StateGraph(GraphState)

    graph.add_node("planner", planner_node)
    graph.add_node("transcript", lambda state: transcript_analysis_node(state, db))
    graph.add_node("crm", lambda state: crm_analysis_node(state, db))
    graph.add_node("support", lambda state: support_ticket_node(state, db))
    graph.add_node("kb", kb_rag_node)
    graph.add_node("risk", risk_analysis_node)
    graph.add_node("recommendation", recommendation_node)
    graph.add_node("explainability_node", explainability_node)
    graph.add_node("memory", lambda state: memory_node(state, db))

    graph.add_edge(START, "planner")
    graph.add_edge("planner", "transcript")
    graph.add_edge("transcript", "crm")
    graph.add_edge("crm", "support")
    graph.add_edge("support", "kb")
    graph.add_edge("kb", "memory")
    graph.add_edge("memory", "risk")
    graph.add_edge("risk", "recommendation")
    graph.add_edge("recommendation", "explainability_node")
    graph.add_edge("explainability_node", END)

    return graph.compile()
