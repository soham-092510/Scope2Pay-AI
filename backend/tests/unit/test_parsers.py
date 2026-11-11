from app.services.documents.unified_parser import parse_srt_or_vtt, parse_document


def test_srt_parsing():
    srt_content = """1
00:00:01,000 --> 00:00:04,000
Morgan: We need the mobile app by next month.

2
00:00:05,000 --> 00:00:08,000
Jordan: We can do $5,000 for that scope.
"""
    parsed = parse_srt_or_vtt(srt_content)
    assert "Morgan: We need the mobile app" in parsed
    assert "Jordan: We can do $5,000" in parsed
    assert "[00:00:01]" in parsed


def test_text_parsing():
    content = b"Client discussion about deliverables and pricing."
    text, mime = parse_document("notes.txt", content)
    assert mime == "text/plain"
    assert "deliverables" in text
