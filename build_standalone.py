#!/usr/bin/env python3
"""index.html + CSS + JS를 하나로 합쳐 단일 HTML 파일을 만듭니다."""
import re
from pathlib import Path

BASE = Path(__file__).parent
html = (BASE / "index.html").read_text(encoding="utf-8")
css = (BASE / "styles.css").read_text(encoding="utf-8")
data_js = (BASE / "data.js").read_text(encoding="utf-8")
i18n_js = (BASE / "i18n.js").read_text(encoding="utf-8")
app_js = (BASE / "app.js").read_text(encoding="utf-8")

# PWA 전용 태그는 단일 파일에서 뺍니다
html = re.sub(r'\s*<link rel="manifest"[^>]*>', "", html)
html = re.sub(r'\s*<link rel="apple-touch-icon"[^>]*>', "", html)
html = re.sub(r'\s*<link rel="icon"[^>]*>', "", html)

html = html.replace(
    '<link rel="stylesheet" href="styles.css" />',
    "<style>\n" + css + "\n</style>",
)
html = html.replace(
    '<script src="i18n.js"></script>\n    <script src="data.js"></script>\n    <script src="app.js"></script>',
    "<script>\n"
    + i18n_js
    + "\n</script>\n    <script>\n"
    + data_js
    + "\n</script>\n    <script>\n"
    + app_js
    + "\n</script>",
)
html = html.replace(
    "<title>티키피디아 — 차 백과 &amp; 우림 타이머</title>",
    "<title>티키피디아 — 차 백과 &amp; 우림 타이머 (단일 파일)</title>",
)

out = BASE / "tea_fai_app_standalone.html"
out.write_text(html, encoding="utf-8")
print(f"wrote {out} ({len(html):,} bytes)")
