#!/usr/bin/env python3
"""index.html + CSS + JS를 하나로 합쳐 단일 HTML 파일을 만듭니다.

파트너·추천 데이터(data/shops.json, data/affiliate.json)는 단일 파일에서도
보이도록 <script id="teafai-seed" type="application/json"> 안에 함께 넣습니다.
온라인으로 열면 앱이 data/*.json을 먼저 읽고, 실패하면 이 내장 사본을 씁니다.
"""
import json
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

# 내장 데이터 사본
shops = json.loads((BASE / "data" / "shops.json").read_text(encoding="utf-8"))
affiliate = json.loads((BASE / "data" / "affiliate.json").read_text(encoding="utf-8"))
seed = json.dumps(
    {"shops": shops.get("shops", []), "affiliate": affiliate},
    ensure_ascii=False,
    separators=(",", ":"),
)
seed = seed.replace("</", "<\\/")
html = re.sub(
    r'(<script id="teafai-seed" type="application/json">).*?(</script>)',
    lambda m: m.group(1) + seed + m.group(2),
    html,
    count=1,
    flags=re.S,
)

out = BASE / "tea_fai_app_standalone.html"
out.write_text(html, encoding="utf-8")
print(f"wrote {out} ({len(html):,} bytes)")
