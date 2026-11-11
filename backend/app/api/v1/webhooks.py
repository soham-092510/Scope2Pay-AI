from fastapi import APIRouter, Request, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.models import WebhookEvent, Invoice, PaymentAttempt, AuditLog
import json

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])


@router.post("/paypal")
async def handle_paypal_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Process incoming PayPal webhook notifications.
    Validates event structure and updates invoice and payment records transactionally.
    """
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event_id = payload.get("id")
    event_type = payload.get("event_type", "UNKNOWN")
    summary = payload.get("summary", "")

    if not event_id:
        raise HTTPException(status_code=400, detail="Missing webhook event id")

    # Check for duplicate webhook processing
    existing = db.query(WebhookEvent).filter(WebhookEvent.event_id == event_id).first()
    if existing:
        return {"status": "already_processed", "event_id": event_id}

    webhook_event = WebhookEvent(
        event_id=event_id,
        event_type=event_type,
        summary=summary,
        payload=json.dumps(payload),
        status="processed"
    )
    db.add(webhook_event)

    # Handle payment completed event
    if event_type in ("PAYMENT.CAPTURE.COMPLETED", "CHECKOUT.ORDER.APPROVED"):
        resource = payload.get("resource", {})
        order_id = resource.get("id") or resource.get("supplementary_data", {}).get("related_ids", {}).get("order_id")
        
        if order_id:
            inv = db.query(Invoice).filter(Invoice.paypal_order_id == order_id).first()
            if inv:
                inv.status = "paid"
                db.add(AuditLog(
                    user_id=inv.user_id,
                    action=f"WEBHOOK_{event_type}",
                    entity_type="invoice",
                    entity_id=inv.id,
                    details=f"Payment status verified via PayPal webhook: {event_type}"
                ))

    db.commit()
    return {"status": "success", "event_id": event_id}
