#!/usr/bin/env python3
"""차 백과 162종 · 실물 사진 · 원산지 데이터를 data.js 에 병합합니다.

    tea_fai_research/extra_teas.json   → 신규 65종 + 162종 원산지 국가
    tea_fai_research/tea_photos/*.jpg  → images/teas/ 로 복사
    tea_fai_research/tea_photos_map.json → 사진·저작자·라이선스 매핑

data.js 안에는 아래 표시 사이에만 씁니다(다시 돌리면 그 부분만 새로 만듭니다).

    /* ── BEGIN generated: research ── */ ... /* ── END generated: research ── */

이 스크립트는 data.js 의 나머지(계열 10종·기존 품종 97종 문구)는 건드리지 않습니다.
"""
import json
import re
import shutil
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent          # tea_fai_app/
ROOT = HERE.parent                                     # workspace
RESEARCH = ROOT / "tea_fai_research"
DATA_JS = HERE / "data.js"
IMG_OUT = HERE / "images" / "teas"

BEGIN = "  /* ── BEGIN generated: research ── */"
END = "  /* ── END generated: research ── */"

# 화면에 쓰는 나라 이름 — extra_teas.json 의 표기를 그대로 쓰고, 홍콩·대만은 광동어 표기를 더합니다
YUE_COUNTRY = {
    "香港": "香港",
    "中國": "中國",
    "台灣": "台灣",
    "日本": "日本",
    "韓國": "韓國",
    "印度": "印度",
    "斯里蘭卡": "斯里蘭卡",
    "英國": "英國",
    "愛爾蘭": "愛爾蘭",
    "德國": "德國",
    "法國": "法國",
    "義大利": "義大利",
    "越南": "越南",
    "肯尼亞": "肯雅",
    "肯亞": "肯雅",
    "尼泊爾": "尼泊爾",
    "不丹": "不丹",
    "土耳其": "土耳其",
    "南非": "南非",
    "阿根廷": "阿根廷",
    "巴西": "巴西",
    "美國": "美國",
    "墨西哥": "墨西哥",
    "埃及": "埃及",
    "摩洛哥": "摩洛哥",
    "泰國": "泰國",
    "馬來西亞": "馬來西亞",
    "印尼": "印尼",
    "喬治亞": "格魯吉亞",
    "伊朗": "伊朗",
    "希臘": "希臘",
    "西班牙": "西班牙",
    "波蘭": "波蘭",
    "俄羅斯": "俄羅斯",
    "澳洲": "澳洲",
    "紐西蘭": "紐西蘭",
    "智利": "智利",
    "秘魯": "秘魯",
    "牙買加": "牙買加",
    "模里西斯": "毛里裘斯",
    "坦尚尼亞": "坦桑尼亞",
    "盧旺達": "盧旺達",
    "馬拉威": "馬拉維",
    "辛巴威": "津巴布韋",
    "烏干達": "烏干達",
    "衣索比亞": "埃塞俄比亞",
}


# 일본어 나라 이름 — data.js 의 원산지 표기에 ja 를 더합니다
JA_COUNTRY = {
    "中國": "中国",
    "台灣": "台湾",
    "日本": "日本",
    "韓國": "韓国",
    "香港": "香港",
    "印度": "インド",
    "斯里蘭卡": "スリランカ",
    "尼泊爾": "ネパール",
    "英國": "イギリス",
    "愛爾蘭": "アイルランド",
    "德國": "ドイツ",
    "法國": "フランス",
    "俄羅斯": "ロシア",
    "土耳其": "トルコ",
    "埃及": "エジプト",
    "摩洛哥": "モロッコ",
    "南非": "南アフリカ",
    "蘇丹": "スーダン",
    "盧安達": "ルワンダ",
    "肯亞": "ケニア",
    "泰國": "タイ",
    "越南": "ベトナム",
    "馬來西亞": "マレーシア",
    "阿根廷": "アルゼンチン",
}


def js(value):
    return json.dumps(value, ensure_ascii=False, indent=2)


def copy_photos(photos):
    IMG_OUT.mkdir(parents=True, exist_ok=True)
    copied = 0
    for meta in photos.values():
        src = RESEARCH / meta["path"].split("tea_fai_research/", 1)[-1]
        src = RESEARCH / "tea_photos" / meta["file"]
        dst = IMG_OUT / meta["file"]
        if not src.exists():
            raise SystemExit(f"사진이 없습니다: {src}")
        if not dst.exists() or dst.stat().st_size != src.stat().st_size:
            shutil.copy2(src, dst)
            copied += 1
    return copied


def main():
    extras = json.loads((RESEARCH / "extra_teas.json").read_text(encoding="utf-8"))
    pmap = json.loads((RESEARCH / "tea_photos_map.json").read_text(encoding="utf-8"))

    new_teas = extras["teas"]
    countries = extras["originCountry"]
    photos = pmap["photos"]

    copied = copy_photos(photos)
    total_bytes = sum(p.stat().st_size for p in IMG_OUT.glob("*.jpg"))

    # 사진 메타 — 화면에 필요한 것만 남겨 data.js 를 가볍게 유지합니다
    photo_rows = {}
    for tea_id, p in photos.items():
        src = p["source"]
        photo_rows[tea_id] = {
            "f": p["file"],
            "m": p["match"],
            "cr": src.get("artist", ""),
            "lic": src.get("license", ""),
            "lu": src.get("licenseUrl", ""),
            "pg": src.get("commonsPage", ""),
        }

    # 원산지 — ko·en·zh-CN·zh-TW·yue
    origin_rows = {}
    for tea_id, c in countries.items():
        tw = c.get("zh-TW") or c.get("zh-CN") or ""
        origin_rows[tea_id] = {
            "ko": c.get("ko", ""),
            "en": c.get("en", ""),
            "zh-CN": c.get("zh-CN", ""),
            "zh-TW": tw,
            "yue": YUE_COUNTRY.get(tw, tw),
            "ja": JA_COUNTRY.get(tw, tw),
            "code": c.get("code", ""),
        }

    trait_rows = {t["id"]: t.get("traits", "") for t in new_teas if t.get("traits")}

    block = "\n".join(
        [
            BEGIN,
            "  /* ── 신규 65종 (tea_fai_research/extra_teas.json) ── */",
            "  var EXTRA_TEAS = " + js(new_teas) + ";",
            "  TEAS = TEAS.concat(EXTRA_TEAS);",
            "",
            "  /* ── 신규 65종 취향 태그 ── */",
            "  Object.assign(TRAITS, " + js(trait_rows) + ");",
            "",
            "  /* ── 162종 실물 사진 (tea_fai_research/tea_photos_map.json) ──",
            "     f=파일(images/teas/), m=exact|family, cr=저작자, lic=라이선스, lu=라이선스 주소, pg=원본 페이지 */",
            "  var PHOTOS = " + js(photo_rows) + ";",
            "",
            "  /* ── 162종 원산지 국가 ── */",
            "  var ORIGIN = " + js(origin_rows) + ";",
            END,
        ]
    )

    src = DATA_JS.read_text(encoding="utf-8")
    if BEGIN in src and END in src:
        start = src.index(BEGIN)
        stop = src.index(END) + len(END)
        src = src[:start] + block + src[stop:]
    else:
        # TRAITS 정의가 끝난 뒤(var links 앞)에 넣습니다 — Object.assign(TRAITS, …) 이
        # TRAITS 가 만들어진 다음에 실행되어야 하기 때문입니다.
        anchor = "\n  var links = {"
        if anchor not in src:
            raise SystemExit("data.js 에서 삽입 위치를 찾지 못했습니다")
        src = src.replace(anchor, "\n" + block + anchor, 1)
    DATA_JS.write_text(src, encoding="utf-8")

    print(f"신규 {len(new_teas)}종 · 원산지 {len(origin_rows)}종 · 사진 {len(photo_rows)}장")
    print(f"사진 복사 {copied}장 → images/teas/ (총 {total_bytes/1024/1024:.2f} MB)")
    print(f"data.js {len(src)/1024/1024:.2f} MB")


if __name__ == "__main__":
    main()
