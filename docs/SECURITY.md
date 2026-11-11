# Security & Financial Integrity Specifications

Scope2Pay AI adheres to strict FinTech and Agentic Commerce security standards.

## 1. Zero Autonomous Payment Authorization
- AI **never** authorizes, executes, or moves money autonomously.
- AI only prepares structured invoice drafts from transcript evidence.
- Every payment requires explicit two-factor human control:
  1. The freelancer/business owner reviews and approves the invoice (`POST /api/v1/invoices/:id/approve`).
  2. The buyer/client explicitly approves the transaction via PayPal Sandbox checkout.

## 2. Server-Side Monetary Calculation
- Client-side amounts in the frontend are strictly non-authoritative.
- The FastAPI backend calculates all subtotals, tax percentages, discounts, and totals using Python's `Decimal` module (`Numeric(12, 2)` in SQLite/PostgreSQL), preventing binary floating-point round-off errors.

## 3. PayPal Sandbox Secrets Isolation
- `PAYPAL_CLIENT_SECRET` and `GEMINI_API_KEY` are stored strictly in backend environment variables.
- Secrets are **never** bundled or transmitted to the browser/React frontend.

## 4. Idempotency & Duplicate Capture Prevention
- Invoices are checked for prior capture before executing `POST /v2/checkout/orders/:id/capture`.
- Database transactions wrap the capture update, ensuring the invoice cannot be double-paid.

## 5. Webhook Signature Verification
- Inbound PayPal webhooks are checked against duplicate `event_id` records in `webhook_events`.
- Only verified PayPal capture and checkout events transition invoice state to `paid`.

## 6. Password Hashing & Data Isolation
- Passwords are encrypted with PBKDF2 HMAC-SHA256 with 100,000 rounds and unique application salting.
- All database queries filter on `user_id == current_user.id` to guarantee tenant isolation.
