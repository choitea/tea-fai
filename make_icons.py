#!/usr/bin/env python3
"""티키피디아 PWA 아이콘 — `tea_fai_brand/`의 茶 대표 이미지에서 다시 만듭니다.

    tea_fai_brand/icon-512-rounded.png  → icons/icon-192.png, icon-512.png, favicon-32.png
    tea_fai_brand/icon-1024.png         → icons/apple-touch-icon.png (iOS가 모서리를 직접 깎습니다)
    src_brand/brand.py                  → icons/icon-maskable-512.png (안전영역에 맞춘 84% 크기 茶)

마스커블 아이콘만 `../src_brand/brand.py`(numpy·fontTools·Pillow 필요)를 씁니다.
그 폴더가 없는 곳에서 돌리면 마스커블은 건드리지 않고 나머지만 갱신합니다.
"""
import importlib.util
import os
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
BRAND = HERE.parent / "tea_fai_brand"
BRAND_SRC = HERE.parent / "src_brand" / "brand.py"
OUT = HERE / "icons"
MASKABLE_INK = 0.46   # 512 캔버스에서 茶가 80% 안전원 안에 들어오는 크기


def load_brand_builder():
    if not BRAND_SRC.exists():
        return None
    spec = importlib.util.spec_from_file_location("BR", BRAND_SRC)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def main():
    OUT.mkdir(exist_ok=True)
    rounded = Image.open(BRAND / "icon-512-rounded.png").convert("RGBA")
    full = Image.open(BRAND / "icon-1024.png").convert("RGBA")

    rounded.resize((192, 192), Image.LANCZOS).save(OUT / "icon-192.png", optimize=True)
    rounded.save(OUT / "icon-512.png", optimize=True)
    rounded.resize((32, 32), Image.LANCZOS).save(OUT / "favicon-32.png", optimize=True)
    full.resize((180, 180), Image.LANCZOS).save(OUT / "apple-touch-icon.png", optimize=True)

    for name in ("logo_tea_mark.png", "logo_tea_mark.svg"):
        (OUT / name).write_bytes((BRAND / name).read_bytes())

    BR = load_brand_builder()
    if BR is None:
        print("src_brand/brand.py 가 없어 마스커블 아이콘은 그대로 둡니다")
    else:
        # brand.py 는 저장소 뿌리 기준 상대 경로로 폰트를 엽니다
        cwd = os.getcwd()
        os.chdir(HERE.parent)
        try:
            BR.icon(512, ink=MASKABLE_INK).save(OUT / "icon-maskable-512.png", optimize=True)
        finally:
            os.chdir(cwd)
    print("icons done:", sorted(os.listdir(OUT)))


if __name__ == "__main__":
    main()
