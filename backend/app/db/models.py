from datetime import datetime
import json
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    customer_id: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    tier: Mapped[str] = mapped_column(String(50), default="Enterprise")
    revenue: Mapped[str] = mapped_column(String(100), default="$0")
    contract_renewal: Mapped[str] = mapped_column(String(100), default="Unknown")
    health_score: Mapped[float] = mapped_column(Float, default=0.0)
    churn_risk: Mapped[float] = mapped_column(Float, default=0.0)
    upsell_opp: Mapped[float] = mapped_column(Float, default=0.0)
    summary: Mapped[str] = mapped_column(Text, default="")
    key_insights: Mapped[str] = mapped_column(Text, default="[]")
    
    # Extended CRM Metadata (Stored as JSON string for flexibility)
    metadata_json: Mapped[str] = mapped_column(Text, default="{}")
    
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def get_metadata(self):
        return json.loads(self.metadata_json)

    def set_metadata(self, data):
        self.metadata_json = json.dumps(data)


class UploadedDocument(Base):
    __tablename__ = "uploaded_documents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    customer_id: Mapped[str] = mapped_column(String(255), index=True)
    source_type: Mapped[str] = mapped_column(String(100), index=True)
    filename: Mapped[str] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(50), default="indexed") # uploading, processing, indexed
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Recommendation(Base):
    __tablename__ = "recommendations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    customer_id: Mapped[str] = mapped_column(String(255), index=True)
    title: Mapped[str] = mapped_column(String(255))
    details: Mapped[str] = mapped_column(Text)
    priority: Mapped[str] = mapped_column(String(50), default="Medium")
    confidence_score: Mapped[float] = mapped_column(Float)
    impact: Mapped[str] = mapped_column(Text, default="")
    evidence: Mapped[str] = mapped_column(Text)
    reasoning_chain: Mapped[str] = mapped_column(Text, default="[]") # JSON list of agent steps
    
    status: Mapped[str] = mapped_column(String(50), default="pending") # pending, approved, rejected
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    decision: Mapped["DecisionHistory"] = relationship(back_populates="recommendation", uselist=False)


class DecisionHistory(Base):
    __tablename__ = "decision_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    recommendation_id: Mapped[int] = mapped_column(ForeignKey("recommendations.id"), unique=True)
    decision: Mapped[str] = mapped_column(String(50)) # approved, rejected
    edited_action: Mapped[str] = mapped_column(Text, default="")
    outcome_notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    recommendation: Mapped[Recommendation] = relationship(back_populates="decision")


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    type: Mapped[str] = mapped_column(String(50)) # recommendation, upload, system
    title: Mapped[str] = mapped_column(String(255))
    message: Mapped[str] = mapped_column(Text)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class UserSettings(Base):
    __tablename__ = "user_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    llm_model: Mapped[str] = mapped_column(String(100), default="gemini-1.5-flash")
    confidence_threshold: Mapped[float] = mapped_column(Float, default=0.7)
    theme: Mapped[str] = mapped_column(String(20), default="dark")
    business_rules_json: Mapped[str] = mapped_column(Text, default="[]")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class BusinessRule(Base):
    __tablename__ = "business_rules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    category: Mapped[str] = mapped_column(String(100), default="Risk")
    condition_type: Mapped[str] = mapped_column(String(100), default="threshold")
    parameters_json: Mapped[str] = mapped_column(Text, default="{}")
    priority: Mapped[int] = mapped_column(Integer, default=1)
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ToolConnection(Base):
    __tablename__ = "tool_connections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    category: Mapped[str] = mapped_column(String(100))
    status: Mapped[str] = mapped_column(String(50), default="healthy") # healthy, warning, offline
    latency_ms: Mapped[float] = mapped_column(Float, default=0.0)
    last_sync: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    config_json: Mapped[str] = mapped_column(Text, default="{}")


class LearningFeedback(Base):
    __tablename__ = "learning_feedback"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    recommendation_id: Mapped[int] = mapped_column(Integer, nullable=True)
    customer_id: Mapped[str] = mapped_column(String(255), default="")
    outcome: Mapped[str] = mapped_column(String(100)) # renewed, churned, upsold, active
    accuracy_rating: Mapped[float] = mapped_column(Float, default=1.0)
    feedback_notes: Mapped[str] = mapped_column(Text, default="")
    learned_pattern: Mapped[str] = mapped_column(Text, default="")
    playbook_updated: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

