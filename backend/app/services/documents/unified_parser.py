import re
import io
from typing import Tuple


def parse_srt_or_vtt(content_str: str) -> str:
    """Extract readable text from SRT or VTT while preserving speakers and timestamps."""
    lines = content_str.splitlines()
    cleaned_lines = []
    
    timestamp_pattern = re.compile(r'(\d{2}:\d{2}:\d{2}[,\.]\d{3}|\d{2}:\d{2}[,\.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,\.]\d{3}|\d{2}:\d{2}[,\.]\d{3})')
    
    current_time = None
    for line in lines:
        line = line.strip()
        if not line or line.isdigit() or line == "WEBVTT":
            continue
        ts_match = timestamp_pattern.search(line)
        if ts_match:
            current_time = ts_match.group(1).split(',')[0].split('.')[0]
            continue
        if current_time:
            cleaned_lines.append(f"[{current_time}] {line}")
            current_time = None
        else:
            cleaned_lines.append(line)
            
    return "\n".join(cleaned_lines) if cleaned_lines else content_str


def parse_pdf(file_bytes: bytes) -> str:
    try:
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(file_bytes))
        text_parts = []
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
        return "\n\n".join(text_parts)
    except Exception as e:
        return f"[PDF Extraction error: {str(e)}]"


def parse_docx(file_bytes: bytes) -> str:
    try:
        from docx import Document
        doc = Document(io.BytesIO(file_bytes))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        return "\n\n".join(paragraphs)
    except Exception as e:
        return f"[DOCX Extraction error: {str(e)}]"


def parse_document(filename: str, file_bytes: bytes) -> Tuple[str, str]:
    """Parse various document formats into clean text and return (extracted_text, detected_type)."""
    fn_lower = filename.lower()
    
    if fn_lower.endswith(".pdf"):
        return parse_pdf(file_bytes), "application/pdf"
    elif fn_lower.endswith(".docx"):
        return parse_docx(file_bytes), "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    elif fn_lower.endswith(".srt") or fn_lower.endswith(".vtt"):
        text = file_bytes.decode("utf-8", errors="replace")
        return parse_srt_or_vtt(text), "text/vtt"
    else:
        # Default to UTF-8 plain text/markdown
        return file_bytes.decode("utf-8", errors="replace"), "text/plain"
