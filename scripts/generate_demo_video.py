import os
import sys
import asyncio
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

WORKSPACE_DIR = Path(__file__).resolve().parent.parent
FRAMES_DIR = WORKSPACE_DIR / "temp_frames"
OUTPUT_VIDEO = WORKSPACE_DIR / "Scope2Pay_AI_Demo.mp4"
EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

os.makedirs(FRAMES_DIR, exist_ok=True)


def draw_caption_banner(img: Image.Image, step_label: str, title: str, description: str) -> Image.Image:
    """Overlay a modern fintech caption bar with glowing badge and typography."""
    img = img.convert("RGBA")
    width, height = img.size

    # Banner dimensions
    banner_height = 140
    banner_y = height - banner_height - 30
    banner_margin = 60
    banner_w = width - (banner_margin * 2)

    # Semi-transparent dark overlay card
    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # Card background (frosted slate with subtle border)
    card_box = [banner_margin, banner_y, banner_margin + banner_w, banner_y + banner_height]
    draw.rounded_rectangle(card_box, radius=20, fill=(15, 23, 42, 235), outline=(51, 65, 85, 255), width=2)

    # Step Badge (Emerald pill)
    badge_x = banner_margin + 25
    badge_y = banner_y + 20
    badge_w = 190
    badge_h = 32
    draw.rounded_rectangle([badge_x, badge_y, badge_x + badge_w, badge_y + badge_h], radius=16, fill=(5, 150, 105, 255))
    
    # Text fonts (using system font or fallback)
    try:
        font_badge = ImageFont.truetype("arialbd.ttf", 14)
        font_title = ImageFont.truetype("arialbd.ttf", 22)
        font_desc = ImageFont.truetype("arial.ttf", 16)
    except Exception:
        font_badge = ImageFont.load_default()
        font_title = ImageFont.load_default()
        font_desc = ImageFont.load_default()

    draw.text((badge_x + 14, badge_y + 7), step_label.upper(), fill=(255, 255, 255, 255), font=font_badge)

    # Title
    draw.text((badge_x + badge_w + 20, badge_y + 4), title, fill=(255, 255, 255, 255), font=font_title)

    # Description
    draw.text((badge_x, badge_y + 48), description, fill=(203, 213, 225, 255), font=font_desc)

    combined = Image.alpha_composite(img, overlay)
    return combined.convert("RGB")


def create_title_card() -> Image.Image:
    """Create a high-impact intro title card."""
    width, height = 1920, 1080
    img = Image.new("RGB", (width, height), (15, 23, 42))
    draw = ImageDraw.Draw(img)

    # Decorative glow
    draw.ellipse([width//2 - 350, height//2 - 300, width//2 + 350, height//2 + 100], fill=(6, 78, 59))

    try:
        font_huge = ImageFont.truetype("arialbd.ttf", 72)
        font_sub = ImageFont.truetype("arialbd.ttf", 28)
        font_meta = ImageFont.truetype("arial.ttf", 22)
    except Exception:
        font_huge = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_meta = ImageFont.load_default()

    draw.text((width//2, height//2 - 80), "Scope2Pay AI ⚡", fill=(255, 255, 255), font=font_huge, anchor="mm")
    draw.text((width//2, height//2 + 10), "From Conversation to Payment — Automatically", fill=(16, 185, 129), font=font_sub, anchor="mm")
    draw.text((width//2, height//2 + 80), "PayPal AI Hackathon · Live Product Prototype Demonstration", fill=(203, 213, 225), font=font_meta, anchor="mm")
    draw.text((width//2, height - 100), "FastAPI · React · TypeScript · PayPal Orders v2 · Google Gemini AI", fill=(148, 163, 184), font=font_meta, anchor="mm")

    return img


def create_outro_card() -> Image.Image:
    """Create a professional outro card."""
    width, height = 1920, 1080
    img = Image.new("RGB", (width, height), (15, 23, 42))
    draw = ImageDraw.Draw(img)

    # Decorative glow
    draw.ellipse([width//2 - 350, height//2 - 300, width//2 + 350, height//2 + 100], fill=(0, 48, 135))

    try:
        font_huge = ImageFont.truetype("arialbd.ttf", 64)
        font_sub = ImageFont.truetype("arialbd.ttf", 26)
        font_meta = ImageFont.truetype("arial.ttf", 20)
    except Exception:
        font_huge = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_meta = ImageFont.load_default()

    draw.text((width//2, height//2 - 80), "Scope2Pay AI is Hackathon-Ready! 🚀", fill=(255, 255, 255), font=font_huge, anchor="mm")
    draw.text((width//2, height//2 + 10), "GitHub: https://github.com/soham-092510/Scope2Pay-AI", fill=(56, 189, 248), font=font_sub, anchor="mm")
    draw.text((width//2, height//2 + 80), "Open Source under MIT License · Render Deployment Ready", fill=(226, 232, 240), font=font_meta, anchor="mm")

    return img


async def capture_scenes():
    from playwright.async_api import async_playwright

    print("Starting Playwright Edge browser...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=EDGE_PATH, headless=True)
        page = await browser.new_page(viewport={"width": 1920, "height": 1080})

        scenes = [
            {
                "type": "custom_title",
                "duration_sec": 3.0,
                "label": "INTRO",
                "title": "Welcome to Scope2Pay AI",
                "desc": "Converts client conversations into verified commitments, invoices, and PayPal settlements."
            },
            {
                "url": "http://127.0.0.1:5173/dashboard",
                "duration_sec": 4.0,
                "label": "STEP 1 · DASHBOARD",
                "title": "Executive Financial Operations Dashboard",
                "desc": "Tracks multi-currency balances (USD, EUR, BDT, GBP), cash flow bar visualizer, and verified transactions."
            },
            {
                "url": "http://127.0.0.1:5173/transcripts",
                "duration_sec": 5.0,
                "label": "STEP 2 · AI TRANSCRIPT",
                "title": "Transcript Studio & Waveform Intelligence",
                "desc": "Ingests meeting dialogue with speaker tags (Jordan, Morgan, Priya) & audio waveform player."
            },
            {
                "url": "http://127.0.0.1:5173/transcripts",
                "duration_sec": 4.0,
                "label": "STEP 3 · EVIDENCE EXTRACTION",
                "title": "Verbatim Quote Linking & Commitment Extraction",
                "desc": "AI maps agreed deliverables ($7,500 UI + $5,000 App) with zero hallucinations & flags ambiguities."
            },
            {
                "url": "http://127.0.0.1:5173/invoices/new",
                "duration_sec": 5.0,
                "label": "STEP 4 · INVOICE BUILDER",
                "title": "50/50 Dual-Column Editor with Real-Time Paper Preview",
                "desc": "Pre-filled deliverables, editable quantities, Net 14 terms, Decimal tax calculation, and live paper preview."
            },
            {
                "url": "http://127.0.0.1:5173/payments",
                "duration_sec": 4.5,
                "label": "STEP 5 · PAYPAL CHECKOUT",
                "title": "PayPal Orders API v2 Server-Side Integration",
                "desc": "Creates official PayPal Sandbox order (intent: CAPTURE) and presents customer approval interface."
            },
            {
                "url": "http://127.0.0.1:5173/payments",
                "duration_sec": 4.5,
                "label": "STEP 6 · PAYMENT CAPTURE",
                "title": "Verified Server-Side Capture & Instant Settlement",
                "desc": "Backend captures the approved order, verifies transaction status, and updates database transactionally."
            },
            {
                "url": "http://127.0.0.1:5173/transactions",
                "duration_sec": 4.0,
                "label": "STEP 7 · TRANSACTIONS",
                "title": "Financial Operations & CSV Export",
                "desc": "Multi-currency accounts with pastel gradient cards, status filters, payment methods, and CSV export."
            },
            {
                "type": "custom_outro",
                "duration_sec": 3.5,
                "label": "SUMMARY",
                "title": "Production-Ready PayPal + AI Solution",
                "desc": "Evidence-first, human-controlled, and financially reliable. Pushed to GitHub repository."
            }
        ]

        frame_idx = 0
        fps = 25

        for scene in scenes:
            print(f"Rendering: {scene['label']} - {scene['title']}")
            if scene.get("type") == "custom_title":
                base_img = create_title_card()
            elif scene.get("type") == "custom_outro":
                base_img = create_outro_card()
            else:
                await page.goto(scene["url"])
                await page.wait_for_timeout(1800)
                temp_snap = FRAMES_DIR / "temp_snap.png"
                await page.screenshot(path=str(temp_snap))
                raw_img = Image.open(temp_snap)
                base_img = draw_caption_banner(raw_img, scene["label"], scene["title"], scene["desc"])

            # Repeat frame for the scene duration
            total_frames = int(scene["duration_sec"] * fps)
            for _ in range(total_frames):
                frame_path = FRAMES_DIR / f"frame_{frame_idx:05d}.png"
                base_img.save(frame_path)
                frame_idx += 1

        await browser.close()
        print(f"Total frames generated: {frame_idx}")


def compile_video():
    print(f"Compiling frames into video via ffmpeg: {OUTPUT_VIDEO}")
    cmd = [
        "ffmpeg",
        "-y",
        "-framerate", "25",
        "-i", str(FRAMES_DIR / "frame_%05d.png"),
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-crf", "19",
        "-preset", "fast",
        str(OUTPUT_VIDEO)
    ]
    subprocess.run(cmd, check=True)
    print(f"Video compiled successfully! File saved at: {OUTPUT_VIDEO}")


if __name__ == "__main__":
    asyncio.run(capture_scenes())
    compile_video()
