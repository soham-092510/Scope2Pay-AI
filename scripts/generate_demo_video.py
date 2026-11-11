import os
import sys
import asyncio
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

WORKSPACE_DIR = Path(__file__).resolve().parent.parent
FRAMES_DIR = WORKSPACE_DIR / "temp_frames"
OUTPUT_VIDEO = WORKSPACE_DIR / "Scope2Pay_AI_Demo.mp4"
THUMBNAIL_FILE = WORKSPACE_DIR / "thumbnail.png"
EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

os.makedirs(FRAMES_DIR, exist_ok=True)


def draw_caption_banner(img: Image.Image, step_label: str, title: str, description: str) -> Image.Image:
    """Overlay a clean, focused caption bar at the bottom."""
    img = img.convert("RGBA")
    width, height = img.size

    banner_height = 120
    banner_y = height - banner_height - 30
    banner_margin = 60
    banner_w = width - (banner_margin * 2)

    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # Card background
    card_box = [banner_margin, banner_y, banner_margin + banner_w, banner_y + banner_height]
    draw.rounded_rectangle(card_box, radius=18, fill=(15, 23, 42, 235), outline=(51, 65, 85, 255), width=2)

    # Step Badge
    badge_x = banner_margin + 25
    badge_y = banner_y + 18
    badge_w = 170
    badge_h = 30
    draw.rounded_rectangle([badge_x, badge_y, badge_x + badge_w, badge_y + badge_h], radius=15, fill=(5, 150, 105, 255))

    try:
        font_badge = ImageFont.truetype("arialbd.ttf", 13)
        font_title = ImageFont.truetype("arialbd.ttf", 20)
        font_desc = ImageFont.truetype("arial.ttf", 15)
    except Exception:
        font_badge = ImageFont.load_default()
        font_title = ImageFont.load_default()
        font_desc = ImageFont.load_default()

    draw.text((badge_x + 12, badge_y + 6), step_label.upper(), fill=(255, 255, 255, 255), font=font_badge)
    draw.text((badge_x + badge_w + 18, badge_y + 4), title, fill=(255, 255, 255, 255), font=font_title)
    draw.text((badge_x, badge_y + 46), description, fill=(203, 213, 225, 255), font=font_desc)

    combined = Image.alpha_composite(img, overlay)
    return combined.convert("RGB")


def get_user_thumbnail_frame() -> Image.Image:
    """Return the user's custom thumbnail image perfectly scaled to 1920x1080 without extra overlays."""
    if THUMBNAIL_FILE.exists():
        im = Image.open(THUMBNAIL_FILE).convert("RGB")
        target_w, target_h = 1920, 1080
        # Scale to fill 1920x1080
        im_resized = im.resize((target_w, target_h), Image.Resampling.LANCZOS)
        return im_resized
    else:
        return Image.new("RGB", (1920, 1080), (15, 23, 42))


async def capture_scenes():
    from playwright.async_api import async_playwright

    print("Capturing live prototype screens...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=EDGE_PATH, headless=True)
        page = await browser.new_page(viewport={"width": 1920, "height": 1080})

        scenes = [
            {
                "type": "user_thumbnail",
                "duration_sec": 3.0,
                "label": "INTRO",
                "title": "",
                "desc": ""
            },
            {
                "url": "http://127.0.0.1:5173/dashboard",
                "duration_sec": 4.5,
                "label": "STEP 1 · DASHBOARD",
                "title": "Executive Financial Operations Dashboard",
                "desc": "Real-time tracking of multi-currency balances (USD, EUR, BDT, GBP), cash flow bar chart, and recent activities."
            },
            {
                "url": "http://127.0.0.1:5173/transcripts",
                "duration_sec": 5.0,
                "label": "STEP 2 · AI TRANSCRIPT",
                "title": "Transcript Studio & Waveform Intelligence",
                "desc": "Meeting dialogue with speaker tags (Jordan, Morgan, Priya), audio waveform player, and detected key commitments."
            },
            {
                "url": "http://127.0.0.1:5173/invoices/new",
                "duration_sec": 5.0,
                "label": "STEP 3 · INVOICE BUILDER",
                "title": "50/50 Dual-Column Editor with Real-Time Paper Preview",
                "desc": "Pre-filled deliverables, editable quantities, Net 14 terms, Decimal tax calculation, and live paper preview."
            },
            {
                "url": "http://127.0.0.1:5173/payments",
                "duration_sec": 5.0,
                "label": "STEP 4 · PAYPAL SETTLEMENT",
                "title": "PayPal Orders API v2 Checkout & Verified Capture",
                "desc": "Server-side order creation, customer sandbox checkout approval, and verified instant payment capture."
            },
            {
                "url": "http://127.0.0.1:5173/transactions",
                "duration_sec": 4.0,
                "label": "STEP 5 · TRANSACTIONS",
                "title": "Financial Operations & CSV Export",
                "desc": "Multi-currency net balance cards with pastel gradient accents, status filters, payment methods, and CSV export."
            },
            {
                "type": "user_thumbnail",
                "duration_sec": 3.0,
                "label": "OUTRO",
                "title": "",
                "desc": ""
            }
        ]

        frame_idx = 0
        fps = 25

        for scene in scenes:
            if scene.get("type") == "user_thumbnail":
                print("Adding user custom thumbnail scene (Beginning/End)...")
                base_img = get_user_thumbnail_frame()
            else:
                print(f"Rendering: {scene['label']} - {scene['title']}")
                await page.goto(scene["url"])
                await page.wait_for_timeout(1800)
                temp_snap = FRAMES_DIR / "temp_snap.png"
                await page.screenshot(path=str(temp_snap))
                raw_img = Image.open(temp_snap)
                base_img = draw_caption_banner(raw_img, scene["label"], scene["title"], scene["desc"])

            total_frames = int(scene["duration_sec"] * fps)
            for _ in range(total_frames):
                frame_path = FRAMES_DIR / f"frame_{frame_idx:05d}.png"
                base_img.save(frame_path)
                frame_idx += 1

        await browser.close()
        print(f"Total frames rendered: {frame_idx}")


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
