from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from decimal import Decimal
from app.db.session import get_db
from app.db.models.models import Invoice, PaymentAttempt, User
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/summary")
def get_reports_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    invoices = db.query(Invoice).filter(Invoice.user_id == current_user.id).all()
    
    total_revenue = sum([i.total_amount for i in invoices if i.status == "paid"], Decimal("0.0"))
    pending_revenue = sum([i.total_amount for i in invoices if i.status in ("pending_payment", "approved", "draft")], Decimal("0.0"))
    
    return {
        "total_revenue": total_revenue,
        "pending_revenue": pending_revenue,
        "total_invoices_count": len(invoices),
        "paid_invoices_count": len([i for i in invoices if i.status == "paid"]),
        "currency": "USD"
    }
