#!/usr/bin/env python3
"""언어 선택 버튼에 쓰는 국기 SVG 5종을 만듭니다 (icons/flags/).

    ko.svg     태극기
    en.svg     미국 성조기 + 영국 유니언잭 (대각선으로 반씩)
    zh-CN.svg  오성홍기
    zh-TW.svg  청천백일만지홍기
    yue.svg    반환 전 영국령 홍콩 청색기 (1959–1997)

18×12px 로 그려지는 작은 아이콘이라 공식 비례보다 큰 형태·색의 가독성을
우선해 단순화했습니다. viewBox 는 모두 0 0 30 20 (3:2)입니다.
"""
import math
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "icons" / "flags"
W, H = 30, 20


def star(cx, cy, r, fill="#FFDE00", rot=-90):
    pts = []
    for i in range(10):
        rad = r if i % 2 == 0 else r * 0.40
        a = math.radians(rot + i * 36)
        pts.append(f"{cx + rad * math.cos(a):.2f},{cy + rad * math.sin(a):.2f}")
    return f'<polygon points="{" ".join(pts)}" fill="{fill}"/>'


def union_jack(w, h, x=0, y=0):
    """유니언잭 — 파랑 바탕 + 흰·빨강 대각선 + 흰·빨강 십자."""
    s = [f'<g transform="translate({x},{y})">']
    s.append(f'<rect width="{w:.2f}" height="{h:.2f}" fill="#012169"/>')
    s.append(
        f'<path d="M0,0 L{w:.2f},{h:.2f} M{w:.2f},0 L0,{h:.2f}" stroke="#FFFFFF" '
        f'stroke-width="{h*0.24:.2f}"/>'
    )
    s.append(
        f'<path d="M0,0 L{w:.2f},{h:.2f} M{w:.2f},0 L0,{h:.2f}" stroke="#C8102E" '
        f'stroke-width="{h*0.09:.2f}"/>'
    )
    s.append(
        f'<path d="M{w/2:.2f},0 V{h:.2f} M0,{h/2:.2f} H{w:.2f}" stroke="#FFFFFF" '
        f'stroke-width="{h*0.38:.2f}"/>'
    )
    s.append(
        f'<path d="M{w/2:.2f},0 V{h:.2f} M0,{h/2:.2f} H{w:.2f}" stroke="#C8102E" '
        f'stroke-width="{h*0.20:.2f}"/>'
    )
    s.append("</g>")
    return "".join(s)


def usa(w, h, x=0, y=0):
    s = [f'<g transform="translate({x},{y})">']
    stripe = h / 13.0
    for i in range(13):
        color = "#B22234" if i % 2 == 0 else "#FFFFFF"
        s.append(f'<rect y="{i*stripe:.2f}" width="{w:.2f}" height="{stripe:.2f}" fill="{color}"/>')
    cw, ch = w * 0.44, stripe * 7
    s.append(f'<rect width="{cw:.2f}" height="{ch:.2f}" fill="#3C3B6E"/>')
    for row in range(4):
        cy = ch * (0.18 + row * 0.22)
        dots = 5 if row % 2 == 0 else 4
        for col in range(dots):
            cx = cw * (0.14 + col * (0.72 / (dots - 1)))
            s.append(f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="{h*0.022:.2f}" fill="#FFFFFF"/>')
    s.append("</g>")
    return "".join(s)


def taegeukgi():
    s = [f'<rect width="{W}" height="{H}" fill="#FFFFFF"/>']
    cx, cy, r = W / 2, H / 2, H * 0.25          # 태극 지름 = 세로의 1/2
    s.append(f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="{r:.2f}" fill="#0047A0"/>')
    s.append(
        f'<path d="M{cx-r:.2f},{cy:.2f} A{r:.2f},{r:.2f} 0 0 1 {cx+r:.2f},{cy:.2f} '
        f'A{r/2:.2f},{r/2:.2f} 0 0 0 {cx:.2f},{cy:.2f} '
        f'A{r/2:.2f},{r/2:.2f} 0 0 1 {cx-r:.2f},{cy:.2f} Z" fill="#CD2E3A"/>'
    )

    def trigram(tx, ty, rot, pattern):
        # pattern: 1 = 긴 막대, 0 = 가운데가 갈라진 막대
        bar_len, bar_h, gap = 5.0, 1.10, 0.85
        out = [f'<g transform="translate({tx:.2f},{ty:.2f}) rotate({rot})">']
        y = -(3 * bar_h + 2 * gap) / 2
        for v in pattern:
            if v:
                out.append(
                    f'<rect x="{-bar_len/2:.2f}" y="{y:.2f}" width="{bar_len}" '
                    f'height="{bar_h}" rx="0.18" fill="#0F0F0F"/>'
                )
            else:
                bw = bar_len / 2 - 0.6
                out.append(
                    f'<rect x="{-bar_len/2:.2f}" y="{y:.2f}" width="{bw:.2f}" '
                    f'height="{bar_h}" rx="0.18" fill="#0F0F0F"/>'
                )
                out.append(
                    f'<rect x="{bar_len/2 - bw:.2f}" y="{y:.2f}" width="{bw:.2f}" '
                    f'height="{bar_h}" rx="0.18" fill="#0F0F0F"/>'
                )
            y += bar_h + gap
        out.append("</g>")
        return "".join(out)

    # 네 모서리 — 가운데를 향하는 대각선에 수직으로 놓습니다
    s.append(trigram(6.4, 4.3, -45, (1, 1, 1)))    # 건(乾)
    s.append(trigram(23.6, 4.3, 45, (0, 1, 0)))    # 감(坎)
    s.append(trigram(6.4, 15.7, 45, (1, 0, 1)))    # 리(離)
    s.append(trigram(23.6, 15.7, -45, (0, 0, 0)))  # 곤(坤)
    return "".join(s)


def china():
    s = [f'<rect width="{W}" height="{H}" fill="#DE2910"/>']
    s.append(star(5.6, 5.2, 3.3))
    for (x, y) in ((10.4, 1.9), (12.6, 4.2), (12.6, 7.0), (10.4, 9.2)):
        s.append(star(x, y, 1.25))
    return "".join(s)


def taiwan():
    s = [f'<rect width="{W}" height="{H}" fill="#FE0000"/>']
    s.append(f'<rect width="{W/2:.2f}" height="{H/2:.2f}" fill="#000095"/>')
    cx, cy = W / 4, H / 4
    r1, r2 = H * 0.155, H * 0.245
    rays = []
    for i in range(12):
        a = math.radians(i * 30 - 90)
        half = math.radians(10)
        p = [
            (cx + r1 * math.cos(a - half), cy + r1 * math.sin(a - half)),
            (cx + r2 * math.cos(a), cy + r2 * math.sin(a)),
            (cx + r1 * math.cos(a + half), cy + r1 * math.sin(a + half)),
        ]
        rays.append(
            '<polygon points="'
            + " ".join(f"{x:.2f},{y:.2f}" for x, y in p)
            + '" fill="#FFFFFF"/>'
        )
    s.append("".join(rays))
    s.append(f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="{r1:.2f}" fill="#FFFFFF"/>')
    s.append(f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="{r1*0.62:.2f}" fill="#000095"/>')
    return "".join(s)


def hongkong_colonial():
    s = [f'<rect width="{W}" height="{H}" fill="#1A3E8C"/>']
    s.append(union_jack(W / 2, H / 2))
    cx, cy, r = W * 0.715, H * 0.5, H * 0.30
    s.append(f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="{r:.2f}" fill="#FFFFFF"/>')
    # 1959 문장 — 작은 크기용으로 방패와 범선만 크게 남깁니다
    s.append(
        f'<path d="M{cx-3.1:.2f},{cy-2.9:.2f} h6.2 v3.4 q0,2.6 -3.1,4.1 '
        f'q-3.1,-1.5 -3.1,-4.1 z" fill="#F7F1E3" stroke="#9A3B2E" stroke-width="0.6"/>'
    )
    s.append(
        f'<path d="M{cx-2.3:.2f},{cy+0.9:.2f} q2.3,1.3 4.6,0 l-0.5,-0.8 h-3.6 z" fill="#1A3E8C"/>'
    )
    for dx, h in ((-1.15, 2.6), (0.0, 3.2), (1.15, 2.4)):
        s.append(
            f'<path d="M{cx+dx:.2f},{cy+0.3:.2f} v-{h:.2f} l-0.95,{h*0.82:.2f} z" fill="#B0472F"/>'
        )
    return "".join(s)


def japan():
    """일장기 — 흰 바탕 가운데 붉은 원(지름 = 세로의 3/5)."""
    return (
        f'<rect width="{W}" height="{H}" fill="#FFFFFF"/>'
        f'<circle cx="{W/2}" cy="{H/2}" r="{H*0.30:.2f}" fill="#BC002D"/>'
        f'<rect x="0.25" y="0.25" width="{W-0.5}" height="{H-0.5}" fill="none" '
        f'stroke="#00000018" stroke-width="0.5"/>'
    )


def wrap(name, body, label):
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
        f'width="{W}" height="{H}" role="img" aria-label="{label}">{body}</svg>'
    )
    (OUT / f"{name}.svg").write_text(svg, encoding="utf-8")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    wrap("ko", taegeukgi(), "태극기 (한국어)")
    wrap(
        "en",
        '<clipPath id="uk"><polygon points="0,0 30,0 0,20"/></clipPath>'
        '<clipPath id="us"><polygon points="30,0 30,20 0,20"/></clipPath>'
        f'<g clip-path="url(#uk)">{union_jack(W, H)}</g>'
        f'<g clip-path="url(#us)"><g transform="translate(30,0) scale(-1,1)">{usa(W, H)}</g></g>',
        "미국·영국 (English)",
    )
    wrap("zh-CN", china(), "五星红旗 (简体中文)")
    wrap("zh-TW", taiwan(), "青天白日滿地紅 (繁體中文)")
    wrap("ja", japan(), "日の丸 (日本語)")
    wrap("yue", hongkong_colonial(), "英屬香港旗 (粵語)")
    print("flags:", sorted(p.name for p in OUT.glob("*.svg")))


if __name__ == "__main__":
    main()
