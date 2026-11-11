# Scope2Pay AI ⚡

> **From Conversation to Payment — Automatically.**  
> Built for the PayPal AI Hackathon.

Scope2Pay AI transforms unstructured client meeting transcripts, sales discovery calls, and project messages into verified commitments, editable invoice drafts, and official PayPal Sandbox payment requests.

---

## 🎯 The Real-World Problem

Freelancers, independent developers, and small agencies frequently face:
1. **Lost Commitments:** Important agreements and deliverables get buried in long call transcripts or chat logs.
2. **Ambiguous Scope & Terms:** Discrepancies between what was discussed versus what is billed create friction.
3. **Manual Invoice Prep:** Compiling line items, terms, and tax calculations takes hours.
4. **Delayed Settlements:** Following up on invoices without integrated instant checkout leads to cash flow stalls.

---

## 💡 The Solution: Scope2Pay AI

Scope2Pay bridges conversation intelligence and financial settlement:
1. **Conversation Ingestion:** Ingests `.txt`, `.pdf`, `.docx`, `.srt`, or `.vtt` meeting transcripts.
2. **Commitment & Evidence Extraction:** Leverages Gemini AI to identify deliverables, milestones, explicitly agreed fees, and deadlines, linking every item to verbatim quotes from the discussion.
3. **Contradiction & Missing Info Alerts:** Flags ambiguous payment terms (e.g. Net 14 vs. Net 60) and missing billing details instead of hallucinating terms.
4. **Interactive Dual-Column Invoice Builder:** Generates an editable invoice draft with real-time live preview and exact Decimal tax and discount calculations.
5. **Human Approval Gate:** The user explicitly approves the invoice before any payment order is initiated.
6. **PayPal Orders v2 Checkout:** Backend creates a PayPal Sandbox order and initiates checkout.
7. **Verified Server-Side Capture:** The backend captures the approved order, verifies the transaction reference, prevents duplicate captures, and updates the financial dashboard in real time.

---

## 🏗 Architecture & Design System

The application strictly implements the design system requested from fintech prototypes:
- **Executive Dashboard:** Overview metrics, active balance card, multi-currency wallets (USD, EUR, BDT, GBP), and cash flow bar visualizer with peak hover popover.
- **Transcript Studio (Meeting Intelligence):** Live transcript with speaker pills (`Jordan Smith`, `Morgan Lee`, `Priya Patel`), audio waveform visualizer, AI summary, topics tracker, and detected key moments.
- **Invoice Builder:** 50/50 split screen with live responsive paper preview.
- **Transactions Management:** Multi-currency net balance cards with pastel gradient accents, search, filters, and CSV export.
- **PayPal Payment Center:** Server-side order creation, checkout authorization, and instant capture receipt.

---

## 🚀 Quick Start (Local Run)

### Prerequisites
- Python 3.10+
- Node.js v18+ and npm

### 1. Automated Setup (Windows)
Run the setup script:
```powershell
.\scripts\setup.ps1
```

### 2. Manual Setup

#### Backend Setup
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
python -c "from app.main import app, seed_demo_data; seed_demo_data()"
uvicorn app.main:app --reload --port 8000
```
Backend API will be running at `http://localhost:8000/docs`.

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend UI will be running at `http://localhost:5173`.

---

## 🧪 Automated Testing

Scope2Pay includes an automated pytest suite covering:
- Document parser handling (SRT, VTT, PDF, plain text)
- Decimal calculation precision (subtotal, tax, discounts, totals)
- End-to-end workflow (health check, dashboard, invoice creation, PayPal order creation, and capture)

Run tests:
```bash
cd backend
.venv\Scripts\pytest
```

---

## 🔒 Security & Payment Safety
- **No Autonomous Money Movement:** The AI never moves funds; payment requires explicit user approval and customer checkout.
- **Decimal Precision:** All financial amounts are calculated server-side using Python `Decimal` to avoid floating-point issues.
- **Secret Isolation:** PayPal secrets and AI API keys are stored only in environment variables and never exposed to the frontend.
- **Idempotency:** Payment endpoints prevent duplicate captures and double-settlement.

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
