from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Any
from datetime import datetime
from decimal import Decimal


# --- Auth Schemas ---
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = "Jordan Smith"
    company_name: Optional[str] = "Studio Arsa Digital"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    company_name: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# --- Client Schemas ---
class ClientCreate(BaseModel):
    name: str
    email: Optional[str] = None
    company: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    currency: Optional[str] = "USD"


class ClientResponse(ClientCreate):
    id: str
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Project Schemas ---
class ProjectCreate(BaseModel):
    name: str
    client_id: Optional[str] = None
    description: Optional[str] = None
    budget: Optional[Decimal] = None
    currency: Optional[str] = "USD"


class ProjectResponse(ProjectCreate):
    id: str
    user_id: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Transcript Schemas ---
class TranscriptCreate(BaseModel):
    filename: str = "meeting_transcript.txt"
    content: str
    project_id: Optional[str] = None


class TranscriptResponse(BaseModel):
    id: str
    user_id: str
    project_id: Optional[str] = None
    filename: str
    file_type: str
    raw_size: int
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- AI Analysis Schemas ---
class EvidenceItem(BaseModel):
    quote: str
    speaker: Optional[str] = None
    timestamp: Optional[str] = None


class DeliverableItem(BaseModel):
    title: str
    description: Optional[str] = None
    deadline: Optional[str] = None
    estimated_amount: Optional[Decimal] = None
    currency: Optional[str] = "USD"
    evidence: List[EvidenceItem] = []
    confidence: float = 0.95
    requires_review: bool = False
    status: str = "accepted"  # accepted, proposed, disputed


class MilestoneItem(BaseModel):
    title: str
    deadline: Optional[str] = None
    amount: Optional[Decimal] = None
    status: str = "pending"


class FinancialTerms(BaseModel):
    currency: Optional[str] = "USD"
    total_amount: Optional[Decimal] = None
    payment_terms: Optional[str] = "Net 14"
    payment_schedule: List[str] = []
    tax_rate: Optional[Decimal] = Decimal("0.0")
    discount: Optional[Decimal] = Decimal("0.0")


class AnalysisResult(BaseModel):
    client: Optional[dict] = Field(default_factory=lambda: {"name": None, "company": None, "email": None})
    project: Optional[dict] = Field(default_factory=lambda: {"name": None, "description": None})
    deliverables: List[DeliverableItem] = []
    milestones: List[MilestoneItem] = []
    financial_terms: FinancialTerms = Field(default_factory=FinancialTerms)
    missing_information: List[str] = []
    contradictions: List[str] = []
    risks: List[str] = []
    summary: str = ""
    overall_confidence: float = 0.90


class AnalysisResponse(BaseModel):
    id: str
    transcript_id: str
    status: str
    confidence: float
    result: AnalysisResult
    created_at: datetime


class AnalysisReviewRequest(BaseModel):
    result: AnalysisResult


# --- Invoice Schemas ---
class InvoiceItemSchema(BaseModel):
    id: Optional[str] = None
    description: str
    quantity: Decimal = Decimal("1.0")
    unit_price: Decimal = Decimal("0.0")
    total_amount: Decimal = Decimal("0.0")

    class Config:
        from_attributes = True


class InvoiceCreate(BaseModel):
    client_id: Optional[str] = None
    project_id: Optional[str] = None
    analysis_id: Optional[str] = None
    customer_name: str
    billing_address: Optional[str] = None
    issue_date: str
    due_date: str
    payment_terms: str = "Net 14"
    currency: str = "USD"
    tax_rate: Decimal = Decimal("0.0")
    discount_amount: Decimal = Decimal("0.0")
    notes: Optional[str] = None
    items: List[InvoiceItemSchema]


class InvoiceUpdate(BaseModel):
    customer_name: Optional[str] = None
    billing_address: Optional[str] = None
    issue_date: Optional[str] = None
    due_date: Optional[str] = None
    payment_terms: Optional[str] = None
    currency: Optional[str] = None
    tax_rate: Optional[Decimal] = None
    discount_amount: Optional[Decimal] = None
    notes: Optional[str] = None
    items: Optional[List[InvoiceItemSchema]] = None
    status: Optional[str] = None


class InvoiceResponse(BaseModel):
    id: str
    user_id: str
    client_id: Optional[str] = None
    project_id: Optional[str] = None
    analysis_id: Optional[str] = None
    invoice_number: str
    customer_name: str
    billing_address: Optional[str] = None
    issue_date: str
    due_date: str
    payment_terms: str
    currency: str
    subtotal: Decimal
    tax_rate: Decimal
    tax_amount: Decimal
    discount_amount: Decimal
    total_amount: Decimal
    notes: Optional[str] = None
    status: str
    paypal_order_id: Optional[str] = None
    paid_at: Optional[datetime] = None
    created_at: datetime
    items: List[InvoiceItemSchema] = []

    class Config:
        from_attributes = True


# --- PayPal Payment Schemas ---
class CreateOrderRequest(BaseModel):
    invoice_id: str
    return_url: Optional[str] = None
    cancel_url: Optional[str] = None


class CreateOrderResponse(BaseModel):
    order_id: str
    status: str
    approve_url: Optional[str] = None
    amount: Decimal
    currency: str


class CaptureOrderRequest(BaseModel):
    invoice_id: str
    order_id: str


class CaptureOrderResponse(BaseModel):
    capture_id: str
    order_id: str
    status: str
    amount: Decimal
    currency: str
    payer_email: Optional[str] = None
    payer_name: Optional[str] = None
    invoice_status: str


class PaymentStatusResponse(BaseModel):
    order_id: str
    status: str
    amount: Decimal
    currency: str
    invoice_id: str
    is_paid: bool
    paid_at: Optional[datetime] = None


# --- Dashboard Schemas ---
class RecentActivity(BaseModel):
    id: str
    activity: str
    order_id: str
    date: str
    time: str
    price: Decimal
    currency: str
    status: str  # Completed, Pending, Canceled


class DashboardMetrics(BaseModel):
    balance: Decimal
    balance_change_pct: float
    savings: Decimal
    savings_change_pct: float
    portfolio: Decimal
    portfolio_change_pct: float
    cash_flow_total: Decimal
    wallets: List[dict]
    cash_flow_monthly: List[dict]
    recent_activities: List[RecentActivity]
    total_invoices: int
    paid_invoices: int
    pending_invoices: int
    outstanding_amount: Decimal


# --- Settings Schemas ---
class SettingsStatusResponse(BaseModel):
    gemini_configured: bool
    gemini_model: str
    paypal_mode: str
    paypal_configured: bool
    paypal_client_id_preview: Optional[str] = None


class SettingsUpdateRequest(BaseModel):
    gemini_api_key: Optional[str] = None
    paypal_client_id: Optional[str] = None
    paypal_client_secret: Optional[str] = None
    paypal_mode: Optional[str] = "sandbox"
