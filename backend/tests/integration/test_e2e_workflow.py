import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_complete_scope2pay_workflow():
    # 1. Health check
    resp = client.get("/api/v1/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "healthy"

    # 2. Check Dashboard Metrics
    dash_resp = client.get("/api/v1/dashboard")
    assert dash_resp.status_code == 200
    data = dash_resp.json()
    assert "balance" in data
    assert "cash_flow_monthly" in data

    # 3. List Invoices
    inv_resp = client.get("/api/v1/invoices")
    assert inv_resp.status_code == 200
    invoices = inv_resp.json()
    assert len(invoices) >= 1
    invoice = invoices[0]
    invoice_id = invoice["id"]

    # 4. Create PayPal Order for Invoice
    order_resp = client.post("/api/v1/payments/create-order", json={"invoice_id": invoice_id})
    assert order_resp.status_code == 200
    order_data = order_resp.json()
    order_id = order_data["order_id"]
    assert order_id is not None
    assert order_data["status"] in ("CREATED", "APPROVED")

    # 5. Capture PayPal Order
    capture_resp = client.post("/api/v1/payments/capture-order", json={"invoice_id": invoice_id, "order_id": order_id})
    assert capture_resp.status_code == 200
    capture_data = capture_resp.json()
    assert capture_data["invoice_status"] == "paid"

    # 6. Verify Payment Status Endpoint
    status_resp = client.get(f"/api/v1/payments/{invoice_id}")
    assert status_resp.status_code == 200
    status_data = status_resp.json()
    assert status_data["is_paid"] is True
