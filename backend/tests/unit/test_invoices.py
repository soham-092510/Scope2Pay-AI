from decimal import Decimal
from app.api.v1.invoices import calculate_invoice_totals
from app.schemas.schemas import InvoiceItemSchema


def test_invoice_calculation_precision():
    items = [
        InvoiceItemSchema(description="Dashboard UI Design", quantity=Decimal("10"), unit_price=Decimal("750.00")),
        InvoiceItemSchema(description="Mobile App", quantity=Decimal("100"), unit_price=Decimal("50.00"))
    ]
    # Subtotal: 10 * 750 = 7500, 100 * 50 = 5000 -> 12500
    # Tax: 11% of 12500 = 1375.00
    # Discount: 500.00
    # Total: 12500 + 1375 - 500 = 13375.00
    subtotal, tax_amt, total = calculate_invoice_totals(
        items,
        tax_rate=Decimal("11.00"),
        discount_amount=Decimal("500.00")
    )

    assert subtotal == Decimal("12500.00")
    assert tax_amt == Decimal("1375.00")
    assert total == Decimal("13375.00")
