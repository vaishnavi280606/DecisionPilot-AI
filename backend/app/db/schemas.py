from datetime import datetime
from typing import Literal, List, Optional
from pydantic import BaseModel, Field


# --- Generic Responses ---
class MessageResponse(BaseModel):
    message: str


# --- Customer Schemas ---
class CustomerBase(BaseModel):
    customer_id: str
    name: str
    tier: str = "Enterprise"
    revenue: str = "$0"
    contract_renewal: str = "Unknown"
    health_score: float = 0.0
    churn_risk: float = 0.0
    upsell_opp: float = 0.0
    summary: str = ""
    key_insights: List[str] = []

class CustomerCreate(CustomerBase):
    pass

class CustomerSchema(CustomerBase):
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True


# --- Document Schemas ---
class DocumentSchema(BaseModel):
    id: int
    customer_id: str
    source_type: str
    filename: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class UploadResponse(BaseModel):
    message: str
    ingested_files: List[DocumentSchema]


# --- Recommendation Schemas ---
class RecommendationSchema(BaseModel):
    id: int
    customer_id: str
    title: str
    details: str
    priority: str
    confidence_score: float
    impact: str
    evidence: str
    reasoning_chain: List[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class RecommendationApprovalRequest(BaseModel):
    decision: Literal["approved", "rejected"]
    edited_action: Optional[str] = ""
    outcome_notes: Optional[str] = ""


# --- Notification Schemas ---
class NotificationSchema(BaseModel):
    id: int
    type: str
    title: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# --- Settings Schemas ---
class UserSettingsSchema(BaseModel):
    llm_model: str
    confidence_threshold: float
    theme: str
    business_rules: List[str]

    class Config:
        from_attributes = True


# --- Analytics Schemas ---
class DashboardAnalytics(BaseModel):
    total_customers: int
    active_recommendations: int
    avg_health_score: float
    high_risk_customers: int
    revenue_at_risk: str


# --- Business Rules Schemas ---
class BusinessRuleBase(BaseModel):
    title: str
    description: str = ""
    category: str = "Risk"
    condition_type: str = "threshold"
    parameters_json: str = "{}"
    priority: int = 1
    is_enabled: bool = True

class BusinessRuleCreate(BusinessRuleBase):
    pass

class BusinessRuleSchema(BusinessRuleBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- Tool Connections Schemas ---
class ToolConnectionBase(BaseModel):
    name: str
    category: str
    status: str = "healthy"
    latency_ms: float = 0.0
    config_json: str = "{}"

class ToolConnectionSchema(ToolConnectionBase):
    id: int
    last_sync: datetime

    class Config:
        from_attributes = True

class ToolConnectionConfigPatch(BaseModel):
    config_json: str


# --- Learning Feedback Schemas ---
class LearningFeedbackBase(BaseModel):
    recommendation_id: Optional[int] = None
    customer_id: str = ""
    outcome: str
    accuracy_rating: float = 1.0
    feedback_notes: str = ""
    learned_pattern: str = ""
    playbook_updated: bool = False

class LearningFeedbackSchema(LearningFeedbackBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

