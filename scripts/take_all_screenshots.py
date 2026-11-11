import asyncio
import shutil
from pathlib import Path
from playwright.async_api import async_playwright

WORKSPACE_DIR = Path(__file__).resolve().parent.parent
SCREENSHOTS_DIR = WORKSPACE_DIR / "screenshots"
BRAIN_DIR = Path(r"C:\Users\HP\.gemini\antigravity\brain\483d1e6a-b903-40e2-bb79-9b2722f4acee\screenshots")
EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

PAGES = [
    {
        "filename": "01_executive_dashboard.png",
        "url": "http://127.0.0.1:5173/dashboard",
        "title": "Executive Financial Overview Dashboard"
    },
    {
        "filename": "02_transcript_studio.png",
        "url": "http://127.0.0.1:5173/transcripts",
        "title": "Transcript Studio & Waveform Intelligence"
    },
    {
        "filename": "03_invoice_builder.png",
        "url": "http://127.0.0.1:5173/invoices/new",
        "title": "Dual-Column Invoice Builder & Paper Preview"
    },
    {
        "filename": "04_invoices_management.png",
        "url": "http://127.0.0.1:5173/invoices",
        "title": "Invoice Management & Status Tracker"
    },
    {
        "filename": "05_transactions.png",
        "url": "http://127.0.0.1:5173/transactions",
        "title": "Transactions & Financial Balances"
    },
    {
        "filename": "06_paypal_checkout.png",
        "url": "http://127.0.0.1:5173/payments",
        "title": "PayPal Orders API v2 Checkout & Settlement"
    },
    {
        "filename": "07_projects.png",
        "url": "http://127.0.0.1:5173/projects",
        "title": "Project Deliverables & Milestones"
    },
    {
        "filename": "08_clients.png",
        "url": "http://127.0.0.1:5173/clients",
        "title": "Client Directory & Accounts"
    },
    {
        "filename": "09_reports.png",
        "url": "http://127.0.0.1:5173/reports",
        "title": "Financial Analytics & Revenue Reports"
    },
    {
        "filename": "10_settings.png",
        "url": "http://127.0.0.1:5173/settings",
        "title": "Platform Settings & PayPal Configuration"
    }
]

async def capture():
    SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)
    BRAIN_DIR.mkdir(parents=True, exist_ok=True)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=EDGE_PATH, headless=True)
        page = await browser.new_page(viewport={"width": 1920, "height": 1080})
        
        for item in PAGES:
            print(f"Capturing: {item['title']} -> {item['filename']}")
            await page.goto(item['url'], wait_until="networkidle")
            await page.wait_for_timeout(1000)
            target_path = SCREENSHOTS_DIR / item['filename']
            await page.screenshot(path=str(target_path), full_page=False)
            
            # Copy to brain dir for direct markdown rendering
            shutil.copy2(target_path, BRAIN_DIR / item['filename'])
            
        await browser.close()
    print("All screenshots successfully captured!")

if __name__ == "__main__":
    asyncio.run(capture())
