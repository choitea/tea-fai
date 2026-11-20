# 티파이(Tea Fai) — 차 백과 & 우림 타이머

《찻잎의 시간, 오늘의 한 잔》과 《최초의 가향 홍차 — 얼그레이의 모든 것》에 실린
산화도·제다·향미·페어링·우림 수치를 그대로 옮겨 만든 안드로이드용 PWA입니다.

## 폴더 구성

| 파일 | 설명 |
| --- | --- |
| `index.html` | 앱 본체 (화면 뼈대 + 아이콘 스프라이트) |
| `styles.css` | 찻집 에디토리얼 스타일 (배경 `#F7F3EB`, 찻잎 그린 `#243E32`, 앰버 `#B97A3D`) |
| `data.js` | 차 6종 데이터 · 기분별 추천 · 링크 (책 수치 원본) |
| `app.js` | 탭 전환, 우림 타이머, 차 백과, 시음 노트(localStorage) |
| `manifest.webmanifest` | PWA 설치 정보 (이름·아이콘·테마 색) |
| `sw.js` | 오프라인 캐시 (앱 껍데기 캐시 우선) |
| `privacy.html` | 개인정보처리방침 (회원가입·서버 전송 없음, 기기 저장소에만 보관) |
| `icons/icon-192.png`, `icons/icon-512.png`, `icons/icon-maskable-512.png` | 홈 화면 아이콘 |
| `tea_fai_app_standalone.html` | CSS/JS를 모두 인라인한 단일 파일 (파일로 바로 열기) |
| `preview_home.png` · `preview_timer.png` · `preview_guide.png` · `preview_notes.png` | 390×844 화면 캡처 |
| `build_standalone.py` | `index.html` + CSS + JS → 단일 파일 재생성 |
| `make_icons.py` | 아이콘 재생성 |

## 바로 열기

- **웹에서 바로 쓰기 (설치 없이)**: <https://choitea.github.io/tea-fai/>
  - 폰 브라우저에서 주소를 열고 메뉴 → **홈 화면에 추가**를 누르면 주소창 없는 앱으로 설치됩니다.
  - 개인정보처리방침: <https://choitea.github.io/tea-fai/privacy.html>
- **단일 파일**: `tea_fai_app_standalone.html`을 브라우저로 열면 끝 (인터넷 없이도 동작).
- **앱처럼 설치**: 아래처럼 로컬 서버를 띄운 뒤 `http://<PC IP>:8000/index.html`을 폰 크롬에서 연다.
  주소창 메뉴 → **홈 화면에 추가**를 누르면 주소창 없는 앱으로 실행되고 오프라인에서도 열립니다.

  ```bash
  cd tea_fai_app
  python3 -m http.server 8000
  ```

  폰과 PC가 같은 와이파이에 있어야 합니다. 웹에 올릴 때는 폴더째 HTTPS 도메인에 두면 됩니다
  (서비스 워커는 HTTPS 또는 localhost에서만 동작).

## 데이터 다시 만들기

```bash
python3 build_standalone.py   # 단일 HTML 재생성 (HTML/CSS/JS 수정 후)
python3 make_icons.py         # 아이콘 재생성
```

## 검증한 것

- 390×844 모바일 뷰포트에서 4개 탭 모두 렌더링, 가로 넘침 없음, 콘솔 에러 없음
- 타이머: 프리셋별 기본 시간, 1·2·3포 전환, ±10초, 시작/일시정지/초기화, 완료 알림
- 차 백과: 키워드 검색, 차류 필터, 카드 펼침, "이 차로 타이머 맞추기"
- 시음 노트: 저장 → 새로고침 후 유지 → 삭제
- 서비스 워커 등록 및 오프라인 재접속, 단일 파일 실행
