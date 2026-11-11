from decimal import Decimal
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.models import Invoice, PaymentAttempt, User
from app.schemas.schemas import DashboardMetrics, RecentActivity
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardMetrics)
def get_dashboard_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    invoices = db.query(Invoice).filter(Invoice.user_id == current_user.id).all()
    
    total_invoices = len(invoices)
    paid_invoices = len([i for i in invoices if i.status == "paid"])
    pending_invoices = len([i for i in invoices if i.status in ("pending_payment", "approved", "draft")])
    
    outstanding = sum([i.total_amount for i in invoices if i.status != "paid"], Decimal("0.0"))
    paid_sum = sum([i.total_amount for i in invoices if i.status == "paid"], Decimal("0.0"))

    # Dynamic balance calculated from base + paid invoices
    base_balance = Decimal("20520.32")
    current_balance = base_balance + paid_sum

    # Activities list
    activities = []
    for inv in invoices[:5]:
        activities.append(RecentActivity(
            id=inv.id,
            activity=f"{inv.customer_name} — {inv.items[0].description if inv.items else 'Design & Dev'}",
            order_id=inv.paypal_order_id or inv.invoice_number,
            date=inv.issue_date,
            time="03:45 PM",
            price=inv.total_amount,
            currency=inv.currency,
            status="Completed" if inv.status == "paid" else ("Pending" if inv.status in ("pending_payment", "approved") else "Draft")
        ))

    if not activities:
        activities = [
            RecentActivity(
                id="act-1",
                activity="Software License & API Integration",
                order_id="INV_000076",
                date="17 Apr, 2026",
                time="03:45 PM",
                price=Decimal("25500.00"),
                currency="USD",
                status="Completed"
            ),
            RecentActivity(
                id="act-2",
                activity="Flight Ticket & Onsite Consulting",
                order_id="INV_000075",
                date="15 Apr, 2026",
                time="11:20 AM",
                price=Decimal("32750.00"),
                currency="USD",
                status="Pending"
            ),
            RecentActivity(
                id="act-3",
                activity="Mobile App Architecture Review",
                order_id="INV_000074",
                date="10 Apr, 2026",
                time="09:15 AM",
                price=Decimal("12400.00"),
                currency="USD",
                status="Completed"
            )
        ]

    wallets = [
        {"currency": "USD", "symbol": "$", "flag": "🇺🇸", "balance": "22,678.00", "limit": "Limit is $10k a month", "status": "Active"},
        {"currency": "EUR", "symbol": "€", "flag": "🇪🇺", "balance": "18,345.00", "limit": "Limit is €8k a month", "status": "Active"},
        {"currency": "BDT", "symbol": "৳", "flag": "🇧🇩", "balance": "1,22,678.00", "limit": "Limit is ৳10k a month", "status": "Active"},
        {"currency": "GBP", "symbol": "£", "flag": "🇬🇧", "balance": "15,000.00", "limit": "Limit is £7.5k a month", "status": "Inactive"},
    ]

    cash_flow_monthly = [
        {"month": "Jan", "value": 22000, "height": "40%"},
        {"month": "Feb", "value": 28000, "height": "52%"},
        {"month": "Mar", "value": 48000, "height": "95%", "highlighted": True, "date": "July 23, 2026", "cashflow": "$33,847.00", "inflow": "-$7,456.00"},
        {"month": "Apr", "value": 31000, "height": "58%"},
        {"month": "May", "value": 41000, "height": "78%"},
        {"month": "Jun", "value": 19000, "height": "35%"},
        {"month": "Jul", "value": 36000, "height": "68%"},
    ]

    return DashboardMetrics(
        balance=current_balance,
        balance_change_pct=1.5,
        savings=Decimal("15800.45"),
        savings_change_pct=3.2,
        portfolio=Decimal("50120.78"),
        portfolio_change_pct=4.7,
        cash_flow_total=Decimal("342323.44"),
        wallets=wallets,
        cash_flow_monthly=cash_flow_monthly,
        recent_activities=activities,
        total_invoices=total_invoices,
        paid_invoices=paid_invoices,
        pending_invoices=pending_invoices,
        outstanding_amount=outstanding
    )
