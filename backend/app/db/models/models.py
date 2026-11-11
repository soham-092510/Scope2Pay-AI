import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, DateTime, Numeric, Boolean,
    ForeignKey, Integer, Float
)
from sqlalchemy.orm import relationship
from app.db.session import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), default="Jordan Smith")
    company_name = Column(String(255), default="Studio Arsa Digital")
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    clients = relationship("Client", back_populates="user", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    transcripts = relationship("Transcript", back_populates="user", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="user", cascade="all, delete-orphan")


class Client(Base):
    __tablename__ = "clients"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    company = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    phone = Column(String(50), nullable=True)
    currency = Column(String(10), default="USD")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="clients")
    projects = relationship("Project", back_populates="client")
    invoices = relationship("Invoice", back_populates="client")


class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    client_id = Column(String(36), ForeignKey("clients.id", ondelete="SET NULL"), nullable=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="active")  # active, completed, on_hold
    budget = Column(Numeric(12, 2), nullable=True)
    currency = Column(String(10), default="USD")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="projects")
    client = relationship("Client", back_populates="projects")
    transcripts = relationship("Transcript", back_populates="project")
    invoices = relationship("Invoice", back_populates="project")


class Transcript(Base):
    __tablename__ = "transcripts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True, index=True)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), default="text/plain")
    content = Column(Text, nullable=False)
    raw_size = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="transcripts")
    project = relationship("Project", back_populates="transcripts")
    analyses = relationship("AnalysisRun", back_populates="transcript", cascade="all, delete-orphan")


class AnalysisRun(Base):
    __tablename__ = "analysis_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    transcript_id = Column(String(36), ForeignKey("transcripts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), default="completed")  # pending, completed, failed
    result_json = Column(Text, nullable=False)  # Full structured extraction JSON
    confidence = Column(Float, default=0.92)
    created_at = Column(DateTime, default=datetime.utcnow)

    transcript = relationship("Transcript", back_populates="analyses")
    commitments = relationship("Commitment", back_populates="analysis", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="analysis")


class Commitment(Base):
    __tablename__ = "commitments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    analysis_id = Column(String(36), ForeignKey("analysis_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(50), nullable=False)  # deliverable, milestone, payment_term, risk, contradiction
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    deadline = Column(String(100), nullable=True)
    amount = Column(Numeric(12, 2), nullable=True)
    currency = Column(String(10), default="USD")
    evidence_quote = Column(Text, nullable=True)
    speaker = Column(String(100), nullable=True)
    timestamp = Column(String(50), nullable=True)
    confidence = Column(Float, default=0.95)
    requires_review = Column(Boolean, default=False)
    status = Column(String(50), default="accepted")  # accepted, proposed, disputed, review_required

    analysis = relationship("AnalysisRun", back_populates="commitments")


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    client_id = Column(String(36), ForeignKey("clients.id", ondelete="SET NULL"), nullable=True, index=True)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True, index=True)
    analysis_id = Column(String(36), ForeignKey("analysis_runs.id", ondelete="SET NULL"), nullable=True, index=True)

    invoice_number = Column(String(50), nullable=False, index=True)
    customer_name = Column(String(255), nullable=False)
    billing_address = Column(Text, nullable=True)
    issue_date = Column(String(50), nullable=False)
    due_date = Column(String(50), nullable=False)
    payment_terms = Column(String(100), default="Net 14")
    currency = Column(String(10), default="USD")

    subtotal = Column(Numeric(12, 2), nullable=False, default=0.0)
    tax_rate = Column(Numeric(5, 2), default=0.0)  # e.g., 11.00 for 11%
    tax_amount = Column(Numeric(12, 2), default=0.0)
    discount_amount = Column(Numeric(12, 2), default=0.0)
    total_amount = Column(Numeric(12, 2), nullable=False, default=0.0)
    notes = Column(Text, nullable=True)

    status = Column(String(50), default="draft")  # draft, approved, pending_payment, paid, canceled, overdue
    paypal_order_id = Column(String(100), nullable=True, index=True)
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="invoices")
    client = relationship("Client", back_populates="invoices")
    project = relationship("Project", back_populates="invoices")
    analysis = relationship("AnalysisRun", back_populates="invoices")
    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan", order_by="InvoiceItem.sort_order")
    payment_attempts = relationship("PaymentAttempt", back_populates="invoice", cascade="all, delete-orphan")


class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    invoice_id = Column(String(36), ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False, index=True)
    description = Column(String(500), nullable=False)
    quantity = Column(Numeric(10, 2), default=1.0)
    unit_price = Column(Numeric(12, 2), default=0.0)
    total_amount = Column(Numeric(12, 2), default=0.0)
    sort_order = Column(Integer, default=0)

    invoice = relationship("Invoice", back_populates="items")


class PaymentAttempt(Base):
    __tablename__ = "payment_attempts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    invoice_id = Column(String(36), ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    paypal_order_id = Column(String(100), nullable=False, index=True)
    paypal_capture_id = Column(String(100), nullable=True, index=True)
    status = Column(String(50), default="CREATED")  # CREATED, APPROVED, COMPLETED, FAILED
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(10), default="USD")
    payer_email = Column(String(255), nullable=True)
    payer_name = Column(String(255), nullable=True)
    response_payload = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    invoice = relationship("Invoice", back_populates="payment_attempts")


class WebhookEvent(Base):
    __tablename__ = "webhook_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_id = Column(String(100), unique=True, index=True, nullable=False)
    event_type = Column(String(100), nullable=False)
    summary = Column(Text, nullable=True)
    payload = Column(Text, nullable=False)
    status = Column(String(50), default="processed")
    processed_at = Column(DateTime, default=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), nullable=True, index=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
