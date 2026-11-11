import os
from decimal import Decimal
from datetime import datetime
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.core.config import settings
from app.db.session import engine, Base, SessionLocal
from app.db.models.models import User, Client, Project, Transcript, Invoice, InvoiceItem
from app.core.security import hash_password

# API Routers
from app.api.v1.auth import router as auth_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.clients import router as clients_router
from app.api.v1.projects import router as projects_router
from app.api.v1.transcripts import router as transcripts_router
from app.api.v1.analysis import router as analysis_router
from app.api.v1.invoices import router as invoices_router
from app.api.v1.payments import router as payments_router
from app.api.v1.webhooks import router as webhooks_router
from app.api.v1.reports import router as reports_router
from app.api.v1.settings import router as settings_router

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Scope2Pay AI",
    description="From Conversation to Payment — Verified Agentic FinTech Platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include v1 Routers
api_v1 = FastAPI()
api_v1.include_router(auth_router)
api_v1.include_router(dashboard_router)
api_v1.include_router(clients_router)
api_v1.include_router(projects_router)
api_v1.include_router(transcripts_router)
api_v1.include_router(analysis_router)
api_v1.include_router(invoices_router)
api_v1.include_router(payments_router)
api_v1.include_router(webhooks_router)
api_v1.include_router(reports_router)
api_v1.include_router(settings_router)


@api_v1.get("/health")
def health_check():
    return {
        "status": "healthy",
        "app": "Scope2Pay AI",
        "timestamp": datetime.utcnow().isoformat(),
        "paypal_mode": settings.PAYPAL_MODE,
        "paypal_configured": bool(settings.PAYPAL_CLIENT_ID and settings.PAYPAL_CLIENT_SECRET),
        "gemini_configured": bool(settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY) > 10)
    }


app.mount("/api/v1", api_v1)


def seed_demo_data():
    """Seed initial sample project, transcript, and verified invoice for seamless hackathon demonstration."""
    db = SessionLocal()
    try:
        demo_email = "jordan@scope2pay.ai"
        user = db.query(User).filter(User.email == demo_email).first()
        if not user:
            user = User(
                email=demo_email,
                password_hash=hash_password("DemoPassword123!"),
                full_name="Jordan Smith",
                company_name="Studio Arsa Digital",
                avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
            )
            db.add(user)
            db.flush()

        # Seed Client if missing
        client = db.query(Client).filter(Client.user_id == user.id).first()
        if not client:
            client = Client(
                user_id=user.id,
                name="PT Nusantara Digital Solusi",
                email="procurement@nusantaradigital.com",
                company="PT Nusantara Digital",
                address="Jl. Jendral Sudirman No. 45 Jakarta Selatan, DKI Jakarta 12190 Indonesia",
                phone="+62 21 555 0192",
                currency="USD"
            )
            db.add(client)
            db.flush()

        # Seed Project
        proj = db.query(Project).filter(Project.user_id == user.id).first()
        if not proj:
            proj = Project(
                user_id=user.id,
                client_id=client.id,
                name="Executive FinTech Dashboard & Mobile App",
                description="Complete meeting-to-payment automated platform with PayPal checkout",
                budget=Decimal("15875.00"),
                currency="USD"
            )
            db.add(proj)
            db.flush()

        # Seed Sample Transcript
        trans = db.query(Transcript).filter(Transcript.user_id == user.id).first()
        if not trans:
            sample_text = """[10:32 AM] Jordan Smith (You): Before we dive into pricing, I want to understand the current workflow. Walk me through what happens when your reps finish a call today.
[10:33 AM] Morgan Lee (Client): Honestly, it's messy. Reps type rough notes into Salesforce — maybe 40% of what was actually discussed. My managers have no visibility into what's really happening in calls, and coaching is just based on vibes.
[10:35 AM] Priya Patel (Client): And we've been burned by tools before. The last platform we tried felt like it was built for enterprise — 9-month rollout, seat minimums, our ops team hated it.
[10:37 AM] Jordan Smith (You): That's exactly why we built Scope2Pay differently. No seat minimums, you're live in under a week, and every call is auto-synced back to Salesforce with full context.
[10:39 AM] Morgan Lee (Client): Okay, I'm listening. What would onboarding look like for a team of 22? And does this integrate with HubSpot too — we have a few holdouts on the SDR side.
[10:41 AM] Jordan Smith (You): Yes — Scope2Pay is one of the few platforms that treats Salesforce and HubSpot equally. Reps keep using whichever CRM they're already in; Scope2Pay writes to both. We can usually get a team of 22 fully live inside 7 business days.
[10:43 AM] Priya Patel (Client): What about security? We're SOC 2 Type II ourselves and our InfoSec team will want SSO, SCIM and an audit trail before they sign anything.
[10:45 AM] Jordan Smith (You): We are fully SOC 2 Type II compliant. Let's agree on scope: We will deliver the Executive Dashboard UI Design at $7,500 and the Mobile App Client Experience at $5,000, with a $500 package discount, under Net 14 payment terms via PayPal.
[10:47 AM] Morgan Lee (Client): That pricing works for us. Send over the invoice draft with the Net 14 terms and PayPal checkout, and we will approve it right away."""
            
            trans = Transcript(
                user_id=user.id,
                project_id=proj.id,
                filename="Acme_Corp_Product_Discovery.txt",
                file_type="text/plain",
                content=sample_text,
                raw_size=len(sample_text.encode("utf-8"))
            )
            db.add(trans)
            db.flush()

        # Seed Invoice matching Screenshot 3
        inv = db.query(Invoice).filter(Invoice.user_id == user.id).first()
        if not inv:
            inv = Invoice(
                user_id=user.id,
                client_id=client.id,
                project_id=proj.id,
                invoice_number="INV-2026-0001",
                customer_name="PT Nusantara Digital Solusi",
                billing_address="Jl. Jendral Sudirman No. 45 Jakarta Selatan, DKI Jakarta 12190 Indonesia",
                issue_date="29 January 2026",
                due_date="12 February 2026",
                payment_terms="Net 14",
                currency="USD",
                subtotal=Decimal("12500.00"),
                tax_rate=Decimal("11.00"),
                tax_amount=Decimal("1375.00"),
                discount_amount=Decimal("500.00"),
                total_amount=Decimal("13375.00"),
                notes="Thank you for your trust. Please complete the payment before the due date.",
                status="approved",
                paypal_order_id="SANDBOX-ORD-7A9B3F4C1"
            )
            db.add(inv)
            db.flush()

            item1 = InvoiceItem(
                invoice_id=inv.id,
                description="Dashboard UI Design",
                quantity=Decimal("10.00"),
                unit_price=Decimal("750.00"),
                total_amount=Decimal("7500.00"),
                sort_order=0
            )
            item2 = InvoiceItem(
                invoice_id=inv.id,
                description="Mobile App",
                quantity=Decimal("100.00"),
                unit_price=Decimal("50.00"),
                total_amount=Decimal("5000.00"),
                sort_order=1
            )
            db.add_all([item1, item2])

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[Seed Error]: {e}")
    finally:
        db.close()


@app.on_event("startup")
def on_startup():
    seed_demo_data()


# Serve static build in production (e.g., Render)
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_react_app(full_path: str):
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"error": "Frontend build not found"}
