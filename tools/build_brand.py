#!/usr/bin/env python3
"""티키피디아 앱 아이콘 · 헤더 배지를 '단정한 고딕 茶'(sans500)로 다시 만듭니다.

`src_brand/v2/orthodox.py` 의 글리프 함수를 그대로 씁니다 — 획을 손대지 않고
Noto Sans KR 500 의 茶 외곽선을 뽑아 PNG 와 SVG 를 같은 모양으로 그립니다.

    icons/icon-512.png            PWA · 플레이스토어 아이콘 (둥근 모서리)
    icons/icon-192.png            PWA
    icons/favicon-32.png          브라우저 탭
    icons/apple-touch-icon.png    iOS (모서리는 iOS 가 깎음)
    icons/icon-maskable-512.png   안드로이드 마스커블 (84% 안전영역)
    icons/logo_tea_mark.svg/.png  헤더 27px 배지
    icons/logo_tea_mark_round.svg/.png
"""
import importlib.util
import os
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent.parent      # workspace
APP = ROOT / "tea_fai_app"
OUT = APP / "icons"
KEY = "sans500"          # 단정한 고딕 茶
MASKABLE_INK = 0.46      # 512 캔버스에서 茶가 안전원(80%) 안에 들어오는 크기


def load_orthodox():
    spec = importlib.util.spec_from_file_location("ORTHO", ROOT / "src_brand" / "v2" / "orthodox.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def main():
    O = load_orthodox()
    OUT.mkdir(exist_ok=True)
    cwd = os.getcwd()
    os.chdir(ROOT)
    try:
        O.glyph(KEY)                                    # 폰트에서 茶 외곽선을 먼저 뽑습니다
        icon = O.down(O.compose(KEY, 512 * 4, ink=0.60), 512)
        rounded = O.down(O.rounded_alpha(O.compose(KEY, 512 * 4, ink=0.60)), 512)
        rounded.save(OUT / "icon-512.png", optimize=True)
        rounded.resize((192, 192), Image.LANCZOS).save(OUT / "icon-192.png", optimize=True)
        rounded.resize((32, 32), Image.LANCZOS).save(OUT / "favicon-32.png", optimize=True)
        O.down(O.compose(KEY, 1024 * 2, ink=0.60, glow=0.045), 1024).resize(
            (180, 180), Image.LANCZOS
        ).save(OUT / "apple-touch-icon.png", optimize=True)
        O.down(O.compose(KEY, 512 * 4, ink=MASKABLE_INK), 512).save(
            OUT / "icon-maskable-512.png", optimize=True
        )

        badge = O.badge_svg(key=KEY)
        O.write_svg(str(OUT / "logo_tea_mark.svg"), badge)
        O.svg_png(badge, 512).save(OUT / "logo_tea_mark.png", optimize=True)

        rnd = O.badge_svg(radius_f=0.5, frame=False, key=KEY)
        O.write_svg(str(OUT / "logo_tea_mark_round.svg"), rnd)
        O.svg_png(rnd, 512).save(OUT / "logo_tea_mark_round.png", optimize=True)
    finally:
        os.chdir(cwd)
    print("icons:", sorted(p.name for p in OUT.glob("*.png")))


if __name__ == "__main__":
    main()
