# Scope2Pay AI — REST API Documentation

Base URL: `/api/v1`

All responses follow standard HTTP status codes and typed JSON payloads.

---

## 1. Authentication (`/api/v1/auth`)

### `POST /auth/register`
Create a new user account.
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "full_name": "Jordan Smith",
  "company_name": "Studio Arsa Digital"
}
```

### `POST /auth/login`
Authenticate user and retrieve Bearer JWT.
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

### `GET /auth/me`
Retrieve currently authenticated user profile.

---

## 2. Dashboard (`/api/v1/dashboard`)

### `GET /dashboard`
Returns live calculated financial metrics:
- `balance`: Real-time balance including settled invoices
- `savings`: Steady growth savings metric
- `portfolio`: Settlement & escrow balance
- `cash_flow_total`: Total annual cash flow volume
- `wallets`: Multi-currency balances (USD, EUR, BDT, GBP)
- `cash_flow_monthly`: Monthly data points with peak highlighted bar
- `recent_activities`: Transaction & invoice activity feed

---

## 3. Transcripts & AI Ingestion (`/api/v1/transcripts`, `/api/v1/analysis`)

### `POST /transcripts`
Upload raw text or meeting dialogue.

### `POST /transcripts/upload`
Multipart upload supporting `.txt`, `.pdf`, `.docx`, `.srt`, `.vtt` (Max 15MB).

### `POST /analysis?transcript_id={id}`
Trigger AI extraction pipeline (Google Gemini API with deterministic fallback).
Returns structured JSON with:
- Deliverables with verbatim quotes, speakers, and timestamps
- Milestones
- Financial terms (subtotal, tax, discount, Net terms)
- Missing information warnings
- Contradiction and risk detection

---

## 4. Invoices (`/api/v1/invoices`)

### `GET /invoices`
List all invoices for the authenticated user. Optional `?status=paid` query param.

### `POST /invoices`
Create invoice. All financial totals are computed strictly server-side using Python `Decimal`:
`total = subtotal + (subtotal * tax_rate / 100) - discount`

### `POST /invoices/{id}/approve`
Explicit user approval gate before payment processing. Sets status to `approved`.

### `GET /invoices/{id}/pdf`
Returns printable, responsive HTML / PDF view.

---

## 5. PayPal Payments (`/api/v1/payments`)

### `POST /payments/create-order`
Creates a PayPal Checkout Order v2.
```json
{
  "invoice_id": "inv_uuid_here"
}
```
Returns:
- `order_id`: PayPal Order ID
- `approve_url`: PayPal checkout URL
- `amount`: Authoritative invoice amount

### `POST /payments/capture-order`
Server-side capture of approved PayPal order.
```json
{
  "invoice_id": "inv_uuid_here",
  "order_id": "order_id_here"
}
```
Verifies amount and order status with PayPal. Prevents duplicate captures.
Sets invoice status to `paid` and records transaction in `PaymentAttempt` and `AuditLog`.

### `GET /payments/{id}`
Returns verified settlement status and capture reference.
