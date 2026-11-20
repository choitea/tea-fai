#!/usr/bin/env python3
"""티파이 PWA 아이콘 생성 — 한 줄기에서 뻗은 찻잎 두 장(크림 + 앰버)."""
import math
import os
from PIL import Image, ImageDraw

OUT = "tea_fai_app/icons"
BG = (36, 62, 50)
BG_DARK = (27, 46, 37)
CREAM = (243, 237, 225)
AMBER = (185, 122, 61)

SS = 4  # supersample


def leaf_layer(size, length, width, color, vein_color):
    """가로로 누운 잎 하나. 줄기 끝은 (cx - length/2, cy)."""
    layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    steps = 260
    cx, cy = size / 2, size / 2
    top, bottom = [], []
    for i in range(steps + 1):
        t = i / steps
        x = (t - 0.5) * length
        w = math.sin(math.pi * t) ** 0.8 * width
        top.append((cx + x, cy - w))
        bottom.append((cx + x, cy + w))
    d.polygon(top + bottom[::-1], fill=color)
    # 중앙 잎맥 (줄기에서 끝으로 가늘게)
    d.line(
        [(cx - length / 2 + length * 0.04, cy), (cx + length / 2 - length * 0.03, cy)],
        fill=vein_color,
        width=max(2, int(width * 0.10)),
    )
    # 잔맥 세 개만, 짧게
    for k in range(3):
        t = 0.34 + k * 0.19
        x = cx + (t - 0.5) * length
        curl = math.sin(math.pi * t) ** 0.8 * width
        d.line(
            [(x, cy), (x + curl * 0.55, cy - curl * 0.5)],
            fill=vein_color,
            width=max(1, int(width * 0.05)),
        )
        d.line(
            [(x, cy), (x + curl * 0.55, cy + curl * 0.5)],
            fill=vein_color,
            width=max(1, int(width * 0.05)),
        )
    return layer


def sprig(size, scale):
    """줄기 한 점에서 두 잎이 뻗은 그림을 투명 배경에 그립니다."""
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    anchor = (size * 0.31, size * 0.79)

    specs = [
        # (길이 비율, 폭 비율, 색, 잎맥색, 각도, 순서)
        (0.92, 0.185, AMBER + (255,), BG + (140,), -14),
        (1.00, 0.200, CREAM + (255,), BG + (120,), -56),
    ]
    for length_r, width_r, color, vein, angle in specs:
        L = size * scale * length_r
        W = size * scale * width_r
        layer = leaf_layer(size, L, W, color, vein)
        stem = (size / 2 - L / 2, size / 2)
        rotated = layer.rotate(angle, resample=Image.BICUBIC, center=stem)
        shifted = rotated.transform(
            rotated.size,
            Image.AFFINE,
            (1, 0, anchor[0] - stem[0], 0, 1, anchor[1] - stem[1]),
            resample=Image.BICUBIC,
        )
        canvas.alpha_composite(shifted)
    return canvas


def make_icon(px, maskable=False):
    size = px * SS
    bg = Image.new("RGB", (size, size), BG)
    grad = Image.new("L", (1, size))
    for y in range(size):
        grad.putpixel((0, y), int(255 * (y / size) ** 1.5))
    bg = Image.composite(Image.new("RGB", (size, size), BG_DARK), bg, grad.resize((size, size)))

    if maskable:
        tile = bg.convert("RGBA")
        scale = 0.50
    else:
        mask = Image.new("L", (size, size), 0)
        ImageDraw.Draw(mask).rounded_rectangle(
            [0, 0, size - 1, size - 1], radius=int(size * 0.225), fill=255
        )
        tile = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        tile.paste(bg, (0, 0), mask)
        scale = 0.62

    tile.alpha_composite(sprig(size, scale))
    return tile.resize((px, px), Image.LANCZOS)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    make_icon(192).save(f"{OUT}/icon-192.png")
    make_icon(512).save(f"{OUT}/icon-512.png")
    make_icon(512, maskable=True).save(f"{OUT}/icon-maskable-512.png")

    sheet = Image.new("RGB", (880, 340), (247, 243, 235))
    for img, box in [
        (make_icon(280), (30, 30)),
        (make_icon(96), (350, 30)),
        (make_icon(200, maskable=True), (480, 30)),
        (make_icon(120), (710, 30)),
    ]:
        sheet.paste(img, box, img)
    sheet.save(f"{OUT}/_contact_sheet.png")
    print("icons done")
