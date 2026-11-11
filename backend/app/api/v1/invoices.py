import uuid
from decimal import Decimal
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.models import Invoice, InvoiceItem, User, AuditLog
from app.schemas.schemas import (
    InvoiceCreate, InvoiceUpdate, InvoiceResponse, InvoiceItemSchema
)
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/invoices", tags=["Invoices"])


def generate_invoice_number(db: Session, user_id: str) -> str:
    count = db.query(Invoice).filter(Invoice.user_id == user_id).count() + 1
    return f"INV-{datetime.utcnow().year}-{count:04d}"


def calculate_invoice_totals(
    items: List[InvoiceItemSchema],
    tax_rate: Decimal = Decimal("0.0"),
    discount_amount: Decimal = Decimal("0.0")
) -> tuple[Decimal, Decimal, Decimal]:
    """Calculate Subtotal, Tax Amount, Total Amount with Decimal precision."""
    subtotal = Decimal("0.0")
    for item in items:
        item.total_amount = Decimal(str(item.quantity)) * Decimal(str(item.unit_price))
        subtotal += item.total_amount
    
    tax_amt = (subtotal * (Decimal(str(tax_rate)) / Decimal("100.0"))).quantize(Decimal("0.01"))
    total = (subtotal + tax_amt - Decimal(str(discount_amount))).quantize(Decimal("0.01"))
    if total < Decimal("0.0"):
        total = Decimal("0.0")
    return subtotal, tax_amt, total


@router.get("", response_model=List[InvoiceResponse])
def list_invoices(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    q = db.query(Invoice).filter(Invoice.user_id == current_user.id)
    if status:
        q = q.filter(Invoice.status == status)
    invoices = q.order_by(Invoice.created_at.desc()).all()
    return [InvoiceResponse.model_validate(inv) for inv in invoices]


@router.post("", response_model=InvoiceResponse)
def create_invoice(
    req: InvoiceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv_num = generate_invoice_number(db, current_user.id)
    subtotal, tax_amt, total = calculate_invoice_totals(
        req.items,
        tax_rate=req.tax_rate,
        discount_amount=req.discount_amount
    )

    invoice = Invoice(
        user_id=current_user.id,
        client_id=req.client_id,
        project_id=req.project_id,
        analysis_id=req.analysis_id,
        invoice_number=inv_num,
        customer_name=req.customer_name,
        billing_address=req.billing_address,
        issue_date=req.issue_date,
        due_date=req.due_date,
        payment_terms=req.payment_terms,
        currency=req.currency,
        subtotal=subtotal,
        tax_rate=req.tax_rate,
        tax_amount=tax_amt,
        discount_amount=req.discount_amount,
        total_amount=total,
        notes=req.notes,
        status="draft"
    )
    db.add(invoice)
    db.flush()

    item_schemas = []
    for idx, it in enumerate(req.items):
        item_tot = Decimal(str(it.quantity)) * Decimal(str(it.unit_price))
        inv_item = InvoiceItem(
            invoice_id=invoice.id,
            description=it.description,
            quantity=it.quantity,
            unit_price=it.unit_price,
            total_amount=item_tot,
            sort_order=idx
        )
        db.add(inv_item)
        item_schemas.append(InvoiceItemSchema(
            id=inv_item.id,
            description=inv_item.description,
            quantity=inv_item.quantity,
            unit_price=inv_item.unit_price,
            total_amount=inv_item.total_amount
        ))

    db.add(AuditLog(
        user_id=current_user.id,
        action="INVOICE_CREATED",
        entity_type="invoice",
        entity_id=invoice.id,
        details=f"Created invoice {inv_num} for amount ${total:,.2f}"
    ))

    db.commit()
    db.refresh(invoice)
    return InvoiceResponse.model_validate(invoice)


@router.get("/{id}", response_model=InvoiceResponse)
def get_invoice(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv = db.query(Invoice).filter(Invoice.id == id, Invoice.user_id == current_user.id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return InvoiceResponse.model_validate(inv)


@router.patch("/{id}", response_model=InvoiceResponse)
def update_invoice(
    id: str,
    req: InvoiceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv = db.query(Invoice).filter(Invoice.id == id, Invoice.user_id == current_user.id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if req.customer_name is not None:
        inv.customer_name = req.customer_name
    if req.billing_address is not None:
        inv.billing_address = req.billing_address
    if req.issue_date is not None:
        inv.issue_date = req.issue_date
    if req.due_date is not None:
        inv.due_date = req.due_date
    if req.payment_terms is not None:
        inv.payment_terms = req.payment_terms
    if req.currency is not None:
        inv.currency = req.currency
    if req.notes is not None:
        inv.notes = req.notes
    if req.status is not None:
        inv.status = req.status

    if req.items is not None:
        # Replace items
        db.query(InvoiceItem).filter(InvoiceItem.invoice_id == inv.id).delete()
        subtotal, tax_amt, total = calculate_invoice_totals(
            req.items,
            tax_rate=req.tax_rate if req.tax_rate is not None else inv.tax_rate,
            discount_amount=req.discount_amount if req.discount_amount is not None else inv.discount_amount
        )
        inv.subtotal = subtotal
        inv.tax_rate = req.tax_rate if req.tax_rate is not None else inv.tax_rate
        inv.tax_amount = tax_amt
        inv.discount_amount = req.discount_amount if req.discount_amount is not None else inv.discount_amount
        inv.total_amount = total

        for idx, it in enumerate(req.items):
            item_tot = Decimal(str(it.quantity)) * Decimal(str(it.unit_price))
            db.add(InvoiceItem(
                invoice_id=inv.id,
                description=it.description,
                quantity=it.quantity,
                unit_price=it.unit_price,
                total_amount=item_tot,
                sort_order=idx
            ))

    db.commit()
    db.refresh(inv)
    return InvoiceResponse.model_validate(inv)


@router.post("/{id}/approve", response_model=InvoiceResponse)
def approve_invoice(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv = db.query(Invoice).filter(Invoice.id == id, Invoice.user_id == current_user.id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    inv.status = "approved"
    db.add(AuditLog(
        user_id=current_user.id,
        action="INVOICE_APPROVED",
        entity_type="invoice",
        entity_id=inv.id,
        details=f"Invoice {inv.invoice_number} approved for payment processing"
    ))
    db.commit()
    db.refresh(inv)
    return InvoiceResponse.model_validate(inv)


@router.get("/{id}/pdf")
def get_invoice_pdf_view(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv = db.query(Invoice).filter(Invoice.id == id, Invoice.user_id == current_user.id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    items_rows = "".join([
        f"""<tr>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">{item.description}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">{item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">{inv.currency} {item.unit_price:,.2f}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 600;">{inv.currency} {item.total_amount:,.2f}</td>
        </tr>""" for item in inv.items
    ])

    html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Invoice {inv.invoice_number}</title>
<style>
body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px; color: #0f172a; background: #fff; }}
.header {{ display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #059669; padding-bottom: 20px; }}
.logo {{ font-size: 24px; font-weight: 800; color: #02542D; }}
.tagline {{ font-size: 13px; color: #64748b; }}
.grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin: 30px 0; }}
table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
th {{ background: #f8fafc; padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase; color: #475569; }}
.totals {{ margin-top: 30px; margin-left: auto; width: 320px; }}
.totals-row {{ display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9; }}
.totals-total {{ font-size: 18px; font-weight: 800; color: #02542D; border-top: 2px solid #059669; padding-top: 10px; }}
.badge {{ display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; }}
.badge-paid {{ background: #dcfce7; color: #15803d; }}
.badge-draft {{ background: #f1f5f9; color: #475569; }}
.badge-approved {{ background: #e0f2fe; color: #0369a1; }}
@media print {{ body {{ margin: 0; }} .no-print {{ display: none; }} }}
</style>
</head>
<body>
<div class="no-print" style="margin-bottom: 20px; text-align: right;">
    <button onclick="window.print()" style="padding: 8px 16px; background: #059669; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Print / Save as PDF</button>
</div>
<div class="header">
    <div>
        <div class="logo">Scope2Pay AI</div>
        <div class="tagline">From Conversation to Payment · Verified Invoice</div>
    </div>
    <div style="text-align: right;">
        <h1 style="margin: 0; font-size: 24px;">INVOICE</h1>
        <div style="font-size: 14px; font-weight: 600; color: #059669;">#{inv.invoice_number}</div>
        <div style="margin-top: 6px;"><span class="badge badge-{inv.status}">{inv.status}</span></div>
    </div>
</div>
<div class="grid">
    <div>
        <h4 style="margin: 0 0 8px 0; color: #64748b; font-size: 12px; text-transform: uppercase;">Billed By</h4>
        <strong>{current_user.company_name or 'Studio Arsa Digital'}</strong><br>
        {current_user.full_name}<br>
        {current_user.email}
    </div>
    <div>
        <h4 style="margin: 0 0 8px 0; color: #64748b; font-size: 12px; text-transform: uppercase;">Billed To</h4>
        <strong>{inv.customer_name}</strong><br>
        {inv.billing_address or 'Jakarta Selatan, DKI Jakarta'}<br>
        <strong>Issue Date:</strong> {inv.issue_date} | <strong>Due Date:</strong> {inv.due_date}<br>
        <strong>Terms:</strong> {inv.payment_terms}
    </div>
</div>
<table>
    <thead>
        <tr>
            <th>Description</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Unit Price</th>
            <th style="text-align: right;">Amount</th>
        </tr>
    </thead>
    <tbody>
        {items_rows}
    </tbody>
</table>
<div class="totals">
    <div class="totals-row"><span>Subtotal:</span><span>{inv.currency} {inv.subtotal:,.2f}</span></div>
    <div class="totals-row"><span>Discount:</span><span>-{inv.currency} {inv.discount_amount:,.2f}</span></div>
    <div class="totals-row"><span>Tax ({inv.tax_rate}%):</span><span>{inv.currency} {inv.tax_amount:,.2f}</span></div>
    <div class="totals-row totals-total"><span>Total:</span><span>{inv.currency} {inv.total_amount:,.2f}</span></div>
</div>
<div style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 13px; color: #64748b;">
    <strong>Notes:</strong> {inv.notes or 'Thank you for your business. Please complete payment via PayPal checkout before the due date.'}
</div>
</body>
</html>"""
    return HTMLResponse(content=html)
