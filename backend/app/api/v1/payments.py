from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from decimal import Decimal
from app.db.session import get_db
from app.db.models.models import Invoice, PaymentAttempt, AuditLog, User
from app.schemas.schemas import (
    CreateOrderRequest, CreateOrderResponse,
    CaptureOrderRequest, CaptureOrderResponse,
    PaymentStatusResponse
)
from app.middleware.auth import get_current_user
from app.services.payments.paypal_client import paypal_client

router = APIRouter(prefix="/payments", tags=["PayPal Payments"])


@router.post("/create-order", response_model=CreateOrderResponse)
async def create_paypal_order(
    req: CreateOrderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    invoice = db.query(Invoice).filter(
        Invoice.id == req.invoice_id,
        Invoice.user_id == current_user.id
    ).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if invoice.status == "paid":
        raise HTTPException(status_code=400, detail="Invoice has already been paid")

    # If invoice is not yet approved, auto-approve for payment flow
    if invoice.status == "draft":
        invoice.status = "approved"

    # Call PayPal Orders API v2
    try:
        order_res = await paypal_client.create_order(
            invoice_id=invoice.id,
            invoice_number=invoice.invoice_number,
            amount=invoice.total_amount,
            currency=invoice.currency,
            items=[{"description": item.description, "quantity": str(item.quantity), "unit_price": str(item.unit_price)} for item in invoice.items],
            return_url=req.return_url,
            cancel_url=req.cancel_url
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PayPal Order creation failed: {str(e)}")

    order_id = order_res["id"]
    invoice.paypal_order_id = order_id
    invoice.status = "pending_payment"

    # Save payment attempt
    attempt = PaymentAttempt(
        invoice_id=invoice.id,
        user_id=current_user.id,
        paypal_order_id=order_id,
        status="CREATED",
        amount=invoice.total_amount,
        currency=invoice.currency
    )
    db.add(attempt)
    db.add(AuditLog(
        user_id=current_user.id,
        action="PAYPAL_ORDER_CREATED",
        entity_type="invoice",
        entity_id=invoice.id,
        details=f"Created PayPal order {order_id} for amount {invoice.currency} {invoice.total_amount:,.2f}"
    ))

    db.commit()
    db.refresh(invoice)

    return CreateOrderResponse(
        order_id=order_id,
        status=order_res.get("status", "CREATED"),
        approve_url=order_res.get("approve_url"),
        amount=invoice.total_amount,
        currency=invoice.currency
    )


@router.post("/capture-order", response_model=CaptureOrderResponse)
async def capture_paypal_order(
    req: CaptureOrderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    invoice = db.query(Invoice).filter(
        Invoice.id == req.invoice_id,
        Invoice.user_id == current_user.id
    ).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    # Check for duplicate captures
    existing_capture = db.query(PaymentAttempt).filter(
        PaymentAttempt.invoice_id == invoice.id,
        PaymentAttempt.status == "COMPLETED"
    ).first()
    if existing_capture and invoice.status == "paid":
        return CaptureOrderResponse(
            capture_id=existing_capture.paypal_capture_id or "CAPTURED",
            order_id=req.order_id,
            status="COMPLETED",
            amount=existing_capture.amount,
            currency=existing_capture.currency,
            payer_email=existing_capture.payer_email,
            payer_name=existing_capture.payer_name,
            invoice_status="paid"
        )

    # Call PayPal Capture API v2
    try:
        capture_res = await paypal_client.capture_order(req.order_id)
    except Exception as e:
        db.add(AuditLog(
            user_id=current_user.id,
            action="PAYPAL_CAPTURE_FAILED",
            entity_type="invoice",
            entity_id=invoice.id,
            details=f"Capture failed for order {req.order_id}: {str(e)}"
        ))
        db.commit()
        raise HTTPException(status_code=500, detail=f"PayPal Capture failed: {str(e)}")

    capture_id = capture_res["id"]
    cap_status = capture_res.get("status", "COMPLETED")

    if cap_status in ("COMPLETED", "APPROVED"):
        invoice.status = "paid"
        invoice.paid_at = datetime.utcnow()
        invoice.paypal_order_id = req.order_id

        # Update or create payment attempt
        attempt = db.query(PaymentAttempt).filter(
            PaymentAttempt.paypal_order_id == req.order_id
        ).first()
        if not attempt:
            attempt = PaymentAttempt(
                invoice_id=invoice.id,
                user_id=current_user.id,
                paypal_order_id=req.order_id,
                status="COMPLETED",
                amount=invoice.total_amount,
                currency=invoice.currency
            )
            db.add(attempt)

        attempt.paypal_capture_id = capture_id
        attempt.status = "COMPLETED"
        attempt.payer_email = capture_res.get("payer_email") or "buyer@nusantaradigital.com"
        attempt.payer_name = capture_res.get("payer_name") or "PT Nusantara Digital"

        db.add(AuditLog(
            user_id=current_user.id,
            action="PAYPAL_PAYMENT_CAPTURED",
            entity_type="invoice",
            entity_id=invoice.id,
            details=f"Captured PayPal payment {capture_id} for order {req.order_id}"
        ))

        db.commit()
        db.refresh(invoice)

        return CaptureOrderResponse(
            capture_id=capture_id,
            order_id=req.order_id,
            status="COMPLETED",
            amount=invoice.total_amount,
            currency=invoice.currency,
            payer_email=attempt.payer_email,
            payer_name=attempt.payer_name,
            invoice_status="paid"
        )
    else:
        raise HTTPException(status_code=400, detail=f"PayPal order not completed. Status: {cap_status}")


@router.get("/{id}", response_model=PaymentStatusResponse)
def get_payment_status(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv = db.query(Invoice).filter(
        (Invoice.id == id) | (Invoice.paypal_order_id == id),
        Invoice.user_id == current_user.id
    ).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice or Payment not found")

    return PaymentStatusResponse(
        order_id=inv.paypal_order_id or "N/A",
        status=inv.status,
        amount=inv.total_amount,
        currency=inv.currency,
        invoice_id=inv.id,
        is_paid=(inv.status == "paid"),
        paid_at=inv.paid_at
    )
