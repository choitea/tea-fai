/* ============================================================
   티키피디아(Teakipedia) — 다국어 지원 (한국어 · English · 简体中文 · 繁體中文)
   · 저장 키: teafai.lang.v1
   · 정적 문구: HTML의 data-i18n / data-i18n-html / data-i18n-ph /
     data-i18n-aria / data-i18n-content 속성
   · 한국어는 HTML에 적힌 원문을 그대로 쓰고, 전환할 때 되돌립니다.
   ============================================================ */
window.TEAFaiI18N = (function () {
  "use strict";

  var STORE_KEY = "teafai.lang.v1";
  var LANGS = ["ko", "en", "zh-CN", "zh-TW"];
  var LABEL = { ko: "한국어", en: "EN", "zh-CN": "简中", "zh-TW": "繁中" };
  var HTML_LANG = { ko: "ko", en: "en", "zh-CN": "zh-Hans", "zh-TW": "zh-Hant" };
  var LOCALE = { ko: "ko-KR", en: "en-US", "zh-CN": "zh-CN", "zh-TW": "zh-TW" };

  /* ---------------- 언어 감지 · 저장 ---------------- */

  function normalize(raw) {
    if (raw == null) return null;
    var s = String(raw).trim().toLowerCase();
    if (!s) return null;
    if (s === "ko" || s.indexOf("ko-") === 0 || s.indexOf("ko_") === 0) return "ko";
    if (
      s === "zh-tw" ||
      s === "zh-hk" ||
      s === "zh-mo" ||
      s === "zh-hant" ||
      s.indexOf("zh-hant") === 0 ||
      s.indexOf("zh-tw") === 0 ||
      s.indexOf("zh-hk") === 0
    )
      return "zh-TW";
    if (s.indexOf("zh") === 0) return "zh-CN";
    if (s.indexOf("en") === 0) return "en";
    return null;
  }

  function stored() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      if (raw == null) return null;
      var val = raw;
      try {
        val = JSON.parse(raw);
      } catch (e) {
        /* 예전 값이 따옴표 없는 문자열이어도 받아들입니다 */
      }
      return normalize(val);
    } catch (e) {
      return null;
    }
  }

  function save(lang) {
    var picked = normalize(lang);
    if (!picked) return;
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(picked));
    } catch (e) {
      /* 저장 공간이 없으면 이번 방문에만 적용됩니다 */
    }
  }

  function fromBrowser() {
    var list = [];
    try {
      if (window.navigator.languages && window.navigator.languages.length) list = window.navigator.languages;
      else if (window.navigator.language) list = [window.navigator.language];
    } catch (e) {
      list = [];
    }
    for (var i = 0; i < list.length; i++) {
      var hit = normalize(list[i]);
      if (hit) return hit;
    }
    return null;
  }

  function detect() {
    return stored() || fromBrowser() || "ko";
  }

  /* ---------------- 문구 사전 ---------------- */

  var UI = {
    ko: {
      "meta.desc":
        "녹차·백차·우롱차·홍차·흑차·얼그레이의 우림 온도와 시간, 차 백과, 시음 노트를 한 곳에. 《찻잎의 시간, 오늘의 한 잔》과 《얼그레이의 모든 것》을 바탕으로 만든 티키피디아 앱.",
      "a11y.lang": "언어",
      "brand.name": "티키피디아",
      "brand.sub": "Teakipedia",
      "tab.home": "오늘의 차",
      "tab.timer": "우림 타이머",
      "tab.guide": "차 백과",
      "tab.notes": "시음 노트",
      "a11y.tabbar": "주요 화면",
      "title.home": "티키피디아 — 차 백과 & 우림 타이머",
      "title.timer": "우림 타이머 — 티키피디아",
      "title.guide": "차 백과 — 티키피디아",
      "title.notes": "시음 노트 — 티키피디아",
      "home.title": "오늘은 어떤<br />한 잔이 필요하세요?",
      "home.lead": "기분을 고르면 어울리는 차와 우리는 법을 골라 드립니다.",
      "a11y.mood": "기분·상황 선택",
      "home.channel": "티파이 채널",
      "home.channelSub": "차 한 잔과 함께",
      "home.lofiLabel": "Lo-fi playlist",
      "home.lofiTitle": "우리기 좋은<br />로파이",
      "home.sleepLabel": "Sleep sound",
      "home.sleepTitle": "잠들기 전<br />수면 사운드",
      "home.bookTitle": "전자책 《찻잎의 시간, 오늘의 한 잔》",
      "home.bookSub": "유페이퍼 서점 · 얼그레이 편도 함께",
      "home.blogTitle": "네이버 블로그",
      "home.youtubeTitle": "유튜브 채널 @TeaFai",
      "home.youtubeSub": "차 이야기와 우리기 영상",
      "home.quoteKicker": "책에서 한 줄",
      "home.quote":
        "녹차는 1분을 기다리고, 우롱차는 30초를 기다리고, 흑차는 20년을 기다린다. 같은 잎이 어떤 시간을 통과했는지 알면, 우리가 컵 앞에서 보내는 3분도 그 시간의 일부가 된다.",
      "home.quoteCite": "《찻잎의 시간, 오늘의 한 잔》 에필로그",
      "home.privacy": "개인정보처리방침",
      "home.recentTitle": "최근 시음",
      "home.recentSub": "시음 노트",
      "home.recentEmpty": "감상은 비워 두었습니다.",
      "reco.pick": "추천 한 잔",
      "reco.temp": "물 온도",
      "reco.leaf": "{water} 물",
      "reco.first": "첫 우리",
      "reco.brew": "바로 우리기",
      "reco.alt": "{name} 보기",
      "reco.ox": "산화 {value}",
      "toast.recoSet": "{name} {dur}로 맞춰 두었습니다",
      "toast.toTimer": "{name} 타이머로 이동했습니다",
      "timer.kicker": "Steeping timer",
      "timer.title": "우림 타이머",
      "timer.lead": "차를 고르고 몇 번째 포인지 고르면 책의 기준 시간으로 맞춰 드립니다.",
      "a11y.tea": "차 종류 선택",
      "a11y.steep": "포 수 선택",
      "state.ready": "준비",
      "state.running": "우리는 중",
      "state.paused": "잠깐 멈춤",
      "state.done": "다 우렸습니다",
      "timer.ring": "{name} · {n}포",
      "timer.steep": "{n}포",
      "a11y.minus": "10초 줄이기",
      "a11y.plus": "10초 늘리기",
      "adjust.zero": "±10초",
      "adjust.plus": "+{n}초",
      "adjust.minus": "{n}초",
      "btn.start": "우리기 시작",
      "btn.pause": "일시정지",
      "btn.resume": "계속하기",
      "btn.next": "다음 포 우리기",
      "btn.again": "다시 우리기",
      "btn.reset": "초기화",
      "timer.panel": "이 차의 우리기",
      "timer.mute": "알림음",
      "timer.muteOn": "은은한 종소리로 알려 드립니다",
      "timer.muteOff": "소리 없이 화면으로만 알려 드립니다",
      "a11y.mute": "알림음 음소거",
      "info.temp": "물 온도",
      "info.tempValue": "{range} · 계량은 {temp}℃ 기준",
      "info.leaf": "잎의 양",
      "info.leafValue": "{leaf} / {water} — {ratio}",
      "info.rounds": "우리는 횟수",
      "info.this": "이번 포",
      "info.thisValue": "{dur} (1포 기준 {base})",
      "info.tip": "포인트",
      "info.rinse": "세차",
      "rinse.dark": "끓는 물로 10~20초, 한두 번",
      "rinse.oolong": "첫 물은 버려 잎을 데웁니다",
      "timer.thirdNote":
        "이 차는 1~2회가 적정입니다. 세 번째 포는 향이 줄고 떫은맛이 앞서니 짧게 즐기세요. ({basis})",
      "guide.kicker": "Tea encyclopedia",
      "guide.title": "차 백과",
      "guide.lead": "산화도, 제다, 향미, 페어링, 보관까지 — 두 권의 책에서 정리했습니다.",
      "guide.search": "차 이름, 향, 산지로 찾기",
      "a11y.search": "차 백과 검색",
      "a11y.filter": "차류 필터",
      "guide.all": "전체",
      "guide.empty":
        "‘{q}’에 해당하는 차를 찾지 못했습니다.<br />산지(하동, 아삼), 향(머스캣, 꿀), 상황(식후)으로 다시 찾아보세요.",
      "guide.ox": "산화도",
      "fact.temp": "물 온도",
      "fact.leaf": "잎 · 물",
      "fact.first": "첫 우리",
      "detail.process": "제다 핵심",
      "detail.varieties": "대표 품종",
      "detail.flavor": "향미 노트",
      "detail.pairing": "음식 페어링",
      "detail.keep": "보관 · 구매",
      "detail.brew": "우리기 포인트",
      "guide.toTimer": "이 차로 타이머 맞추기",
      "guide.source": "출처",
      "guide.sourceText":
        "《찻잎의 시간, 오늘의 한 잔》, 《최초의 가향 홍차 — 얼그레이의 모든 것》(최티).",
      "guide.sourceNote":
        "수치는 책의 부록 표와 각 장의 서술을 기준으로 하고, 산지·등급은 스리랑카 티보드 7대 산지, 인도 티보드 GI, 일본 농림수산성 음용 기준, 중국 6대 다류 분류로 교차 확인했습니다. 농장과 해에 따라 달라지는 값은 검증된 범위로 적었습니다. 입맛에 맞춰 ±10초로 조율해 보세요.",
      "notes.kicker": "Tasting notes",
      "notes.title": "시음 노트",
      "notes.lead": "오늘 우린 차를 한 줄로 남겨 두면, 다음 잔이 조금 더 정확해집니다.",
      "notes.statCups": "기록한 잔",
      "notes.statAvg": "평균 별점",
      "unit.cup": "잔",
      "unit.point": "점",
      "notes.formTea": "차 종류",
      "notes.formName": "이름 · 산지",
      "notes.namePh": "예: 하동 우전, 2026 봄",
      "notes.formRating": "별점",
      "notes.formText": "한 줄 감상",
      "notes.textPh": "예: 75도에서 1분, 떫음 없이 단맛이 오래 남았다.",
      "notes.save": "노트 저장",
      "notes.log": "기록",
      "count.cups": "{n}잔",
      "a11y.star": "{n}점",
      "notes.starNone": "선택",
      "notes.empty":
        "아직 기록이 없습니다.<br />오늘 우린 차 한 잔을 남겨 보세요. 차 종류와 별점만 있으면 됩니다.",
      "a11y.delete": "{name} 기록 삭제",
      "toast.nameNeeded": "차 이름을 적어 주세요 (예: 하동 우전)",
      "toast.ratingNeeded": "별점을 골라 주세요",
      "toast.saved": "시음 노트에 남겼습니다",
      "toast.deleted": "기록을 삭제했습니다",
      "toast.reset": "타이머를 초기화했습니다",
      "toast.done": "{name} {n}포, 다 우렸습니다. 잎을 건져 주세요"
    },

    en: {
      "meta.desc":
        "Steeping temperatures and times for green, white, oolong, black and dark tea and Earl Grey, with a tea encyclopedia and tasting notes — a Teakipedia app built from the books Time of Tea Leaves, Today's Cup and Everything About Earl Grey.",
      "a11y.lang": "Language",
      "brand.name": "Teakipedia",
      "brand.sub": "",
      "tab.home": "Today",
      "tab.timer": "Timer",
      "tab.guide": "Tea guide",
      "tab.notes": "Notes",
      "a11y.tabbar": "Main screens",
      "title.home": "Teakipedia — Tea Encyclopedia & Steeping Timer",
      "title.timer": "Steeping Timer — Teakipedia",
      "title.guide": "Tea Encyclopedia — Teakipedia",
      "title.notes": "Tasting Notes — Teakipedia",
      "home.title": "What kind of cup<br />do you need today?",
      "home.lead": "Pick a mood and we'll choose a tea and the way to steep it.",
      "a11y.mood": "Choose a mood",
      "home.channel": "Tea Fai channels",
      "home.channelSub": "With a cup of tea",
      "home.lofiLabel": "Lo-fi playlist",
      "home.lofiTitle": "Lo-fi<br />to steep by",
      "home.sleepLabel": "Sleep sound",
      "home.sleepTitle": "Sleep sounds<br />before bed",
      "home.bookTitle": "E-book — Time of Tea Leaves, Today's Cup",
      "home.bookSub": "Upaper bookstore · the Earl Grey volume too",
      "home.blogTitle": "Naver blog",
      "home.youtubeTitle": "YouTube channel @TeaFai",
      "home.youtubeSub": "Tea stories and steeping videos",
      "home.quoteKicker": "One line from the book",
      "home.quote":
        "Green tea waits one minute, oolong thirty seconds, dark tea twenty years. Know what time the same leaf has passed through, and the three minutes we spend in front of the cup become part of it too.",
      "home.quoteCite": "Epilogue, Time of Tea Leaves, Today's Cup",
      "home.privacy": "Privacy policy",
      "home.recentTitle": "Latest tasting",
      "home.recentSub": "Tasting notes",
      "home.recentEmpty": "No note was written.",
      "reco.pick": "Our pick",
      "reco.temp": "Water",
      "reco.leaf": "{water} water",
      "reco.first": "First steep",
      "reco.brew": "Steep it now",
      "reco.alt": "See {name}",
      "reco.ox": "{value} oxidised",
      "toast.recoSet": "{name} set to {dur}",
      "toast.toTimer": "Moved to the {name} timer",
      "timer.kicker": "Timer",
      "timer.title": "Steeping timer",
      "timer.lead":
        "Choose a tea and which infusion you're on, and the timer follows the times in the book.",
      "a11y.tea": "Choose a tea",
      "a11y.steep": "Choose the infusion",
      "state.ready": "Ready",
      "state.running": "Steeping",
      "state.paused": "Paused",
      "state.done": "Time's up",
      "timer.ring": "{name} · infusion {n}",
      "timer.steep": "No. {n}",
      "a11y.minus": "10 seconds less",
      "a11y.plus": "10 seconds more",
      "adjust.zero": "±10 sec",
      "adjust.plus": "+{n} sec",
      "adjust.minus": "{n} sec",
      "btn.start": "Start steeping",
      "btn.pause": "Pause",
      "btn.resume": "Resume",
      "btn.next": "Next infusion",
      "btn.again": "Steep again",
      "btn.reset": "Reset",
      "timer.panel": "How to steep this tea",
      "timer.mute": "Chime",
      "timer.muteOn": "A soft bell lets you know",
      "timer.muteOff": "Silent — the screen tells you",
      "a11y.mute": "Mute the chime",
      "info.temp": "Water",
      "info.tempValue": "{range} · ratio measured at {temp} °C",
      "info.leaf": "Leaf",
      "info.leafValue": "{leaf} / {water} — {ratio}",
      "info.rounds": "Infusions",
      "info.this": "This infusion",
      "info.thisValue": "{dur} (first infusion {base})",
      "info.tip": "Point",
      "info.rinse": "Rinse",
      "rinse.dark": "Boiling water, 10–20 seconds, once or twice",
      "rinse.oolong": "Discard the first pour to warm the leaf",
      "timer.thirdNote":
        "One or two infusions suit this tea. A third loses aroma and leads with astringency, so keep it short. ({basis})",
      "guide.kicker": "Tea library",
      "guide.title": "Tea encyclopedia",
      "guide.lead":
        "Oxidation, processing, flavour, pairing, storage — gathered from two books.",
      "guide.search": "Search by name, aroma or origin",
      "a11y.search": "Search the tea encyclopedia",
      "a11y.filter": "Filter by tea type",
      "guide.all": "All",
      "guide.empty":
        "No tea matched “{q}”.<br />Try an origin (Hadong, Assam), an aroma (muscatel, honey) or an occasion (after a meal).",
      "guide.ox": "Oxidation",
      "fact.temp": "Water",
      "fact.leaf": "Leaf · water",
      "fact.first": "First steep",
      "detail.process": "How it's made",
      "detail.varieties": "Representative teas",
      "detail.flavor": "Flavour notes",
      "detail.pairing": "Food pairing",
      "detail.keep": "Storage & buying",
      "detail.brew": "Steeping tips",
      "guide.toTimer": "Set the timer for this tea",
      "guide.source": "Sources",
      "guide.sourceText":
        "Time of Tea Leaves, Today's Cup; The First Scented Black Tea — Everything About Earl Grey (Choi Ti).",
      "guide.sourceNote":
        "Figures follow the books' appendix tables and chapter text; origins and grades were cross-checked against the Sri Lanka Tea Board's seven regions, the Tea Board of India GI register, Japan's MAFF brewing standards and China's six tea families. Where a value varies by garden or season, a verified range is given. Adjust by ±10 seconds to your taste.",
      "notes.kicker": "Notebook",
      "notes.title": "Tasting notes",
      "notes.lead":
        "Leave one line about the cup you steeped today and the next cup gets a little more precise.",
      "notes.statCups": "Cups logged",
      "notes.statAvg": "Average score",
      "unit.cup": " cups",
      "unit.point": " / 5",
      "notes.formTea": "Tea",
      "notes.formName": "Name · origin",
      "notes.namePh": "e.g. Hadong Ujeon, spring 2026",
      "notes.formRating": "Rating",
      "notes.formText": "One line",
      "notes.textPh": "e.g. 75 °C for one minute — sweet for a long time, no astringency.",
      "notes.save": "Save note",
      "notes.log": "Log",
      "count.cups": "{n} cups",
      "a11y.star": "{n} of 5",
      "notes.starNone": "Pick",
      "notes.empty":
        "Nothing logged yet.<br />Leave a note about the cup you steeped today. Tea type and a rating are enough.",
      "a11y.delete": "Delete the note for {name}",
      "toast.nameNeeded": "Please write the tea's name (e.g. Hadong Ujeon)",
      "toast.ratingNeeded": "Please pick a rating",
      "toast.saved": "Saved to your tasting notes",
      "toast.deleted": "Note deleted",
      "toast.reset": "Timer reset",
      "toast.done": "{name}, infusion {n} — done. Lift the leaves out."
    },

    "zh-CN": {
      "meta.desc":
        "绿茶、白茶、乌龙茶、红茶、黑茶与伯爵茶的冲泡温度与时间，加上茶百科和品茶笔记——《茶叶的时间，今天的一杯》与《伯爵茶的一切》里整理出来的 Teakipedia 应用。",
      "a11y.lang": "语言",
      "brand.name": "茶基百科",
      "brand.sub": "Teakipedia",
      "tab.home": "今日",
      "tab.timer": "计时",
      "tab.guide": "茶百科",
      "tab.notes": "品茶笔记",
      "a11y.tabbar": "主要画面",
      "title.home": "茶基百科 — 茶百科与冲泡计时",
      "title.timer": "冲泡计时 — 茶基百科",
      "title.guide": "茶百科 — 茶基百科",
      "title.notes": "品茶笔记 — 茶基百科",
      "home.title": "今天，你想要<br />怎样的一杯茶？",
      "home.lead": "选一种心情，我们为你挑一款茶和冲泡的方法。",
      "a11y.mood": "选择心情与场合",
      "home.channel": "Tea Fai 频道",
      "home.channelSub": "与一杯茶相伴",
      "home.lofiLabel": "Lo-fi playlist",
      "home.lofiTitle": "适合冲泡时的<br />Lo-fi",
      "home.sleepLabel": "Sleep sound",
      "home.sleepTitle": "睡前的<br />助眠声音",
      "home.bookTitle": "电子书《茶叶的时间，今天的一杯》",
      "home.bookSub": "Upaper 书店 · 另有伯爵茶篇",
      "home.blogTitle": "Naver 博客",
      "home.youtubeTitle": "YouTube 频道 @TeaFai",
      "home.youtubeSub": "茶故事与冲泡视频",
      "home.quoteKicker": "书中的一句话",
      "home.quote":
        "绿茶等待一分钟，乌龙茶等待三十秒，黑茶等待二十年。知道同一片叶子经过了怎样的时间，我们在杯前度过的三分钟也成了那时间的一部分。",
      "home.quoteCite": "《茶叶的时间，今天的一杯》结语",
      "home.privacy": "隐私政策",
      "home.recentTitle": "最近的品饮",
      "home.recentSub": "品茶笔记",
      "home.recentEmpty": "没有写感想。",
      "reco.pick": "推荐一杯",
      "reco.temp": "水温",
      "reco.leaf": "{water} 水",
      "reco.first": "第一泡",
      "reco.brew": "马上冲泡",
      "reco.alt": "看看{name}",
      "reco.ox": "发酵度 {value}",
      "toast.recoSet": "已将{name}设为{dur}",
      "toast.toTimer": "已切换到{name}计时",
      "timer.kicker": "冲泡",
      "timer.title": "冲泡计时",
      "timer.lead": "选好茶和第几泡，我们会按书中的标准时间为你计时。",
      "a11y.tea": "选择茶类",
      "a11y.steep": "选择泡数",
      "state.ready": "准备",
      "state.running": "冲泡中",
      "state.paused": "暂停",
      "state.done": "已泡好",
      "timer.ring": "{name} · 第{n}泡",
      "timer.steep": "第{n}泡",
      "a11y.minus": "减少10秒",
      "a11y.plus": "增加10秒",
      "adjust.zero": "±10秒",
      "adjust.plus": "+{n}秒",
      "adjust.minus": "{n}秒",
      "btn.start": "开始冲泡",
      "btn.pause": "暂停",
      "btn.resume": "继续",
      "btn.next": "下一泡",
      "btn.again": "再泡一次",
      "btn.reset": "重置",
      "timer.panel": "这款茶的冲泡",
      "timer.mute": "提示音",
      "timer.muteOn": "以轻柔的铃声提醒你",
      "timer.muteOff": "静音，只在画面上提醒",
      "a11y.mute": "关闭提示音",
      "info.temp": "水温",
      "info.tempValue": "{range} · 用量以{temp}℃为准",
      "info.leaf": "茶量",
      "info.leafValue": "{leaf} / {water} — {ratio}",
      "info.rounds": "可泡次数",
      "info.this": "本次冲泡",
      "info.thisValue": "{dur}（第一泡为{base}）",
      "info.tip": "要点",
      "info.rinse": "洗茶",
      "rinse.dark": "用沸水10~20秒，一两次",
      "rinse.oolong": "第一次注水倒掉，温热茶叶",
      "timer.thirdNote": "这款茶适合1~2泡。第三泡香气减弱、涩味突前，请短泡享用。（{basis}）",
      "guide.kicker": "茶叶",
      "guide.title": "茶百科",
      "guide.lead": "从发酵度、制茶、香气、搭配到保存——整理自两本书。",
      "guide.search": "按茶名、香气、产地搜索",
      "a11y.search": "搜索茶百科",
      "a11y.filter": "按茶类筛选",
      "guide.all": "全部",
      "guide.empty":
        "没有找到与“{q}”相符的茶。<br />试试按产地（河东、阿萨姆）、香气（麝香葡萄、蜂蜜）或场合（饭后）再找。",
      "guide.ox": "发酵度",
      "fact.temp": "水温",
      "fact.leaf": "茶量 · 水",
      "fact.first": "第一泡",
      "detail.process": "制茶要点",
      "detail.varieties": "代表品种",
      "detail.flavor": "香气笔记",
      "detail.pairing": "食物搭配",
      "detail.keep": "保存 · 购买",
      "detail.brew": "冲泡要点",
      "guide.toTimer": "用这款茶计时",
      "guide.source": "出处",
      "guide.sourceText":
        "《茶叶的时间，今天的一杯》《最初的加香红茶——伯爵茶的一切》（Choi Ti）。",
      "guide.sourceNote":
        "数值依据书末附表与各章叙述，产地与等级按斯里兰卡茶叶局七大产区、印度茶叶局GI、日本农林水产省冲泡标准、中国六大茶类分类交叉核对。因茶园与年份而异的值以已验证的范围标注。可按口味用±10秒微调。",
      "notes.kicker": "品饮",
      "notes.title": "品茶笔记",
      "notes.lead": "把今天泡的茶用一句话记下，下一杯会更准确。",
      "notes.statCups": "记录杯数",
      "notes.statAvg": "平均评分",
      "unit.cup": "杯",
      "unit.point": "分",
      "notes.formTea": "茶类",
      "notes.formName": "名称 · 产地",
      "notes.namePh": "例：河东雨前，2026年春",
      "notes.formRating": "评分",
      "notes.formText": "一句感想",
      "notes.textPh": "例：75度1分钟，没有涩味，甜味留得久。",
      "notes.save": "保存笔记",
      "notes.log": "记录",
      "count.cups": "{n}杯",
      "a11y.star": "{n}分",
      "notes.starNone": "选择",
      "notes.empty":
        "还没有记录。<br />把今天泡的一杯茶记下来吧。只要茶类和评分就够了。",
      "a11y.delete": "删除{name}的记录",
      "toast.nameNeeded": "请填写茶名（例：河东雨前）",
      "toast.ratingNeeded": "请选择评分",
      "toast.saved": "已记入品茶笔记",
      "toast.deleted": "记录已删除",
      "toast.reset": "计时器已重置",
      "toast.done": "{name}第{n}泡泡好了，请取出茶叶。"
    },

    "zh-TW": {
      "meta.desc":
        "綠茶、白茶、烏龍茶、紅茶、黑茶與伯爵茶的沖泡溫度與時間，加上茶百科和品茶筆記——《茶葉的時間，今天的一杯》與《伯爵茶的一切》裡整理出來的 Teakipedia 應用。",
      "a11y.lang": "語言",
      "brand.name": "茶基百科",
      "brand.sub": "Teakipedia",
      "tab.home": "今日",
      "tab.timer": "計時",
      "tab.guide": "茶百科",
      "tab.notes": "品茶筆記",
      "a11y.tabbar": "主要畫面",
      "title.home": "茶基百科 — 茶百科與沖泡計時",
      "title.timer": "沖泡計時 — 茶基百科",
      "title.guide": "茶百科 — 茶基百科",
      "title.notes": "品茶筆記 — 茶基百科",
      "home.title": "今天，你想要<br />怎樣的一杯茶？",
      "home.lead": "選一種心情，我們為你挑一款茶和沖泡的方法。",
      "a11y.mood": "選擇心情與場合",
      "home.channel": "Tea Fai 頻道",
      "home.channelSub": "與一杯茶相伴",
      "home.lofiLabel": "Lo-fi playlist",
      "home.lofiTitle": "適合沖泡時的<br />Lo-fi",
      "home.sleepLabel": "Sleep sound",
      "home.sleepTitle": "睡前的<br />助眠聲音",
      "home.bookTitle": "電子書《茶葉的時間，今天的一杯》",
      "home.bookSub": "Upaper 書店 · 另有伯爵茶篇",
      "home.blogTitle": "Naver 部落格",
      "home.youtubeTitle": "YouTube 頻道 @TeaFai",
      "home.youtubeSub": "茶故事與沖泡影片",
      "home.quoteKicker": "書中的一句話",
      "home.quote":
        "綠茶等待一分鐘，烏龍茶等待三十秒，黑茶等待二十年。知道同一片葉子經過了什麼樣的時間，我們在杯前度過的三分鐘也成了那時間的一部分。",
      "home.quoteCite": "《茶葉的時間，今天的一杯》結語",
      "home.privacy": "隱私權政策",
      "home.recentTitle": "最近的品飲",
      "home.recentSub": "品茶筆記",
      "home.recentEmpty": "沒有寫感想。",
      "reco.pick": "推薦一杯",
      "reco.temp": "水溫",
      "reco.leaf": "{water} 水",
      "reco.first": "第一泡",
      "reco.brew": "馬上沖泡",
      "reco.alt": "看看{name}",
      "reco.ox": "發酵度 {value}",
      "toast.recoSet": "已將{name}設為{dur}",
      "toast.toTimer": "已切換到{name}計時",
      "timer.kicker": "沖泡",
      "timer.title": "沖泡計時",
      "timer.lead": "選好茶和第幾泡，我們會按書中的標準時間為你計時。",
      "a11y.tea": "選擇茶類",
      "a11y.steep": "選擇泡數",
      "state.ready": "準備",
      "state.running": "沖泡中",
      "state.paused": "暫停",
      "state.done": "已泡好",
      "timer.ring": "{name} · 第{n}泡",
      "timer.steep": "第{n}泡",
      "a11y.minus": "減少10秒",
      "a11y.plus": "增加10秒",
      "adjust.zero": "±10秒",
      "adjust.plus": "+{n}秒",
      "adjust.minus": "{n}秒",
      "btn.start": "開始沖泡",
      "btn.pause": "暫停",
      "btn.resume": "繼續",
      "btn.next": "下一泡",
      "btn.again": "再泡一次",
      "btn.reset": "重設",
      "timer.panel": "這款茶的沖泡",
      "timer.mute": "提示音",
      "timer.muteOn": "以輕柔的鈴聲提醒你",
      "timer.muteOff": "靜音，只在畫面上提醒",
      "a11y.mute": "關閉提示音",
      "info.temp": "水溫",
      "info.tempValue": "{range} · 用量以{temp}℃為準",
      "info.leaf": "茶量",
      "info.leafValue": "{leaf} / {water} — {ratio}",
      "info.rounds": "可泡次數",
      "info.this": "本次沖泡",
      "info.thisValue": "{dur}（第一泡為{base}）",
      "info.tip": "要點",
      "info.rinse": "洗茶",
      "rinse.dark": "用沸水10~20秒，一兩次",
      "rinse.oolong": "第一次注水倒掉，溫熱茶葉",
      "timer.thirdNote": "這款茶適合1~2泡。第三泡香氣減弱、澀味突前，請短泡享用。（{basis}）",
      "guide.kicker": "茶葉",
      "guide.title": "茶百科",
      "guide.lead": "從發酵度、製茶、香氣、搭配到保存——整理自兩本書。",
      "guide.search": "按茶名、香氣、產地搜尋",
      "a11y.search": "搜尋茶百科",
      "a11y.filter": "按茶類篩選",
      "guide.all": "全部",
      "guide.empty":
        "沒有找到與「{q}」相符的茶。<br />試試按產地（河東、阿薩姆）、香氣（麝香葡萄、蜂蜜）或場合（飯後）再找。",
      "guide.ox": "發酵度",
      "fact.temp": "水溫",
      "fact.leaf": "茶量 · 水",
      "fact.first": "第一泡",
      "detail.process": "製茶要點",
      "detail.varieties": "代表品種",
      "detail.flavor": "香氣筆記",
      "detail.pairing": "食物搭配",
      "detail.keep": "保存 · 購買",
      "detail.brew": "沖泡要點",
      "guide.toTimer": "用這款茶計時",
      "guide.source": "出處",
      "guide.sourceText":
        "《茶葉的時間，今天的一杯》《最初的加香紅茶——伯爵茶的一切》（Choi Ti）。",
      "guide.sourceNote":
        "數值依據書末附表與各章敘述，產地與等級按斯里蘭卡茶葉局七大產區、印度茶葉局GI、日本農林水產省沖泡標準、中國六大茶類分類交叉核對。因茶園與年份而異的值以已驗證的範圍標註。可按口味用±10秒微調。",
      "notes.kicker": "品飲",
      "notes.title": "品茶筆記",
      "notes.lead": "把今天泡的茶用一句話記下，下一杯會更準確。",
      "notes.statCups": "記錄杯數",
      "notes.statAvg": "平均評分",
      "unit.cup": "杯",
      "unit.point": "分",
      "notes.formTea": "茶類",
      "notes.formName": "名稱 · 產地",
      "notes.namePh": "例：河東雨前，2026年春",
      "notes.formRating": "評分",
      "notes.formText": "一句感想",
      "notes.textPh": "例：75度1分鐘，沒有澀味，甜味留得久。",
      "notes.save": "儲存筆記",
      "notes.log": "記錄",
      "count.cups": "{n}杯",
      "a11y.star": "{n}分",
      "notes.starNone": "選擇",
      "notes.empty":
        "還沒有記錄。<br />把今天泡的一杯茶記下來吧。只要茶類和評分就夠了。",
      "a11y.delete": "刪除{name}的記錄",
      "toast.nameNeeded": "請填寫茶名（例：河東雨前）",
      "toast.ratingNeeded": "請選擇評分",
      "toast.saved": "已記入品茶筆記",
      "toast.deleted": "記錄已刪除",
      "toast.reset": "計時器已重設",
      "toast.done": "{name}第{n}泡泡好了，請取出茶葉。"
    }
  };

  /* 개인정보처리방침 (한국어는 privacy.html의 원문을 그대로 씁니다) */
  var PRIVACY = {
    ko: {
      "pv.title": "개인정보처리방침 — 티키피디아(Teakipedia)",
      "pv.desc":
        "티키피디아(Teakipedia) 앱의 개인정보처리방침. 회원가입이 없고, 시음 노트와 타이머 설정, 선택한 언어를 기기 브라우저 저장소에만 보관하며 개인정보를 수집·전송하지 않습니다."
    },
    en: {
      "pv.title": "Privacy Policy — Teakipedia",
      "pv.desc":
        "Privacy policy for the Teakipedia app. There is no sign-up; tasting notes, timer settings and the chosen language stay in your device's browser storage, and no personal data is collected or sent.",
      "pv.back": "Back to the app",
      "pv.kicker": "Privacy Policy",
      "pv.h1": "Teakipedia Privacy Policy",
      "pv.lead":
        'Teakipedia is an app with a tea encyclopedia, a steeping timer and tasting notes. It has <span class="key">no sign-up and collects no personal data, sending nothing to a server.</span> Your tasting notes, timer settings and chosen language stay only in your device\'s browser storage.',
      "pv.metaDate": "Effective 20 November 2026",
      "pv.metaVersion": "Version 1.0",
      "pv.metaContact": "Contact rotroka@gmail.com",
      "pv.s1.title": "Personal data we collect",
      "pv.s1.body":
        'Teakipedia <span class="key">collects no personal data at all</span> — no name, phone number, email, address, location, photos, contacts or device identifier. There is no sign-up or sign-in, and no feature that sends your information to our own server or anywhere else.',
      "pv.account": "<b>Account</b> — none. Install the app and use it straight away.",
      "pv.server": "<b>Server</b> — Teakipedia runs no server that stores your data.",
      "pv.ads": "<b>Ads and analytics</b> — no advertising SDK, no traffic statistics, no behaviour analytics.",
      "pv.s2.title": "What is stored on your device",
      "pv.s2.body":
        'For convenience the app stores the items below <span class="key">only in your device\'s browser local storage (localStorage)</span>. They are never sent to a server and cannot be seen from outside your device.',
      "pv.thItem": "Item",
      "pv.thWhat": "Contents",
      "pv.kNotes": "Tasting notes",
      "pv.vNotes": "The tea name, rating, one-line note and date you entered yourself",
      "pv.kMuted": "Chime setting",
      "pv.vMuted": "Whether the timer's completion chime is on",
      "pv.kLastTea": "Last tea chosen",
      "pv.vLastTea": "The tea type you picked most recently",
      "pv.kLang": "Language",
      "pv.vLang":
        "The language you chose with the language switch (한국어 · EN · 简中 · 繁中), so the app opens in it next time",
      "pv.s2.note":
        "You can check or delete these values in the app at any time; they go when you delete the app or clear the site's data in your browser. Teakipedia keeps no copy, so a deleted record cannot be restored.",
      "pv.s3.title": "Temporary storage for offline use",
      "pv.s3.body":
        "So the app opens without a connection, Teakipedia keeps a copy of its own screen files (HTML, CSS, JS, icons) in your browser cache through a service worker. That is a copy of the app itself, not your personal data or your notes. When the app is updated, the files refresh automatically.",
      "pv.s4.title": "Device permissions",
      "pv.s4.body":
        'Teakipedia <span class="key">requests no device permissions</span> — no camera, microphone, location, contacts, photos, notifications or storage. The end of a timer is announced inside the app by the screen and the chime; no push or background notification is sent.',
      "pv.s5.title": "External links",
      "pv.s5.body":
        "The app links to a YouTube channel, a Naver blog and a Upaper e-book store. Tapping a link opens that site in your browser, and from then on its own privacy policy applies. Teakipedia passes no information about you to those sites.",
      "pv.s6.title": "Sharing with third parties",
      "pv.s6.body":
        "Because no personal data is collected, there is nothing to provide to third parties or to entrust for processing. Your records are never sold, shared or read.",
      "pv.s7.title": "Children's privacy",
      "pv.s7.body":
        "Teakipedia collects no personal data from anyone, including children under 14. The app is safe for all ages, and there is no field anywhere to enter personal information.",
      "pv.s8.title": "Your rights",
      "pv.s8.body":
        'You can view and delete the records you wrote one by one on the app\'s <span class="key">Tasting notes</span> screen at any time. To clear everything at once, delete this site\'s data in your browser or delete the app; the chosen language goes with it. Teakipedia keeps no copy outside your device, so there is no separate deletion request to make.',
      "pv.s9.title": "Changes to this policy",
      "pv.s9.body":
        "If the app's features change and this policy needs editing, the new policy and its effective date are posted on this page first. If a change would introduce any collection of personal data, the app itself will tell you too.",
      "pv.s10.title": "Contact",
      "pv.s10.body": "If you have a question or a request about this policy, write to us.",
      "pv.footer":
        "Teakipedia — Tea encyclopedia & steeping timer · made from Time of Tea Leaves, Today's Cup and The First Scented Black Tea — Everything About Earl Grey.",
      "pv.openApp": "Open the app"
    },
    "zh-CN": {
      "pv.title": "隐私政策 — 茶基百科",
      "pv.desc":
        "Teakipedia 应用的隐私政策。本应用没有注册，品茶笔记、计时设定与所选语言只保存在使用者的设备浏览器中，不收集也不传送个人信息。",
      "pv.back": "返回应用",
      "pv.kicker": "Privacy Policy",
      "pv.h1": "茶基百科 隐私政策",
      "pv.lead":
        'Teakipedia 是一款包含茶百科、冲泡计时和品茶笔记的应用。它<span class="key">没有注册，也不收集个人信息，不会向服务器传送任何内容。</span>品茶笔记、计时设定和所选语言只留在使用者的设备浏览器中。',
      "pv.metaDate": "生效日 2026年11月20日",
      "pv.metaVersion": "版本 1.0",
      "pv.metaContact": "联系 rotroka@gmail.com",
      "pv.s1.title": "收集的个人信息",
      "pv.s1.body":
        'Teakipedia <span class="key">不收集任何个人信息</span>——姓名、电话号码、电子邮件、地址、位置、照片、通讯录、设备识别码都不收集。没有注册与登录流程，也没有把使用者信息送到自有服务器或外部的地方。',
      "pv.account": "<b>账户</b>——不设立。安装后即可使用。",
      "pv.server": "<b>服务器</b>——Teakipedia 不运营存放使用者数据的服务器。",
      "pv.ads": "<b>广告与分析</b>——没有广告 SDK、访问统计或行为分析工具。",
      "pv.s2.title": "保存在设备上的信息",
      "pv.s2.body":
        '为了使用方便，应用将下列信息<span class="key">只保存在使用者设备的浏览器本地存储（localStorage）</span>中。这些值不会传送到服务器，设备之外也无法查看。',
      "pv.thItem": "保存项",
      "pv.thWhat": "内容",
      "pv.kNotes": "品茶笔记",
      "pv.vNotes": "使用者自己填写的茶名、评分、一句感想与日期",
      "pv.kMuted": "提示音设定",
      "pv.vMuted": "计时结束提示音是否开启",
      "pv.kLastTea": "最近选择的茶",
      "pv.vLastTea": "最后选择的茶类",
      "pv.kLang": "语言设定",
      "pv.vLang": "用语言切换选择的语言（한국어 · EN · 简中 · 繁中），下次打开时以该语言显示",
      "pv.s2.note":
        "保存的值随时可以在应用内查看、删除；删除应用或清除浏览器中此网站的数据时会一起删除。Teakipedia 不持有这些值的副本，所以已删除的记录无法恢复。",
      "pv.s3.title": "为了离线使用而临时保存",
      "pv.s3.body":
        "为了让应用在没有网络时也能打开，Teakipedia 通过服务工作者把应用的画面文件（HTML、CSS、JS、图标）临时保存在设备浏览器缓存中。那只是应用本身的副本，不是使用者的个人信息或记录。应用更新时画面文件会自动换成最新版本。",
      "pv.s4.title": "设备权限",
      "pv.s4.body":
        'Teakipedia <span class="key">不请求任何设备权限</span>——相机、麦克风、位置、通讯录、照片、通知、存储空间都不请求。计时结束只在应用画面内以显示和提示音告知，不发送推送或后台通知。',
      "pv.s5.title": "外部链接",
      "pv.s5.body":
        "应用内有前往 YouTube 频道、Naver 博客、Upaper 电子书书店的链接。点击链接后由使用者的浏览器打开该网站，此后适用该网站的隐私政策，Teakipedia 不会把使用者信息交给该网站。",
      "pv.s6.title": "第三方提供与委托处理",
      "pv.s6.body":
        "因为不收集个人信息，也没有向第三方提供或委托处理的信息。不会出售、共享或查看使用者的记录。",
      "pv.s7.title": "儿童的隐私",
      "pv.s7.body":
        "Teakipedia 不收集包括未满14岁儿童在内任何使用者的个人信息。所有年龄都可以安全使用，应用里也没有填写个人信息的栏位。",
      "pv.s8.title": "使用者的权利",
      "pv.s8.body":
        '使用者随时可以在应用的<span class="key">品茶笔记</span>画面查看自己写的记录并逐条删除。若要一次全部清除，请在设备浏览器中删除此网站的数据或删除应用，所选语言设定也会一起清除。Teakipedia 不在设备之外保存副本，因此不需要另外提出删除请求。',
      "pv.s9.title": "政策的变更",
      "pv.s9.body":
        "应用功能改变而需要修改本政策时，会先在本页公布新的政策和生效日。若变更会新增个人信息的收集，也会在应用内告知。",
      "pv.s10.title": "联系",
      "pv.s10.body": "对本隐私政策有疑问或请求，请用下面的方式告诉我们。",
      "pv.footer":
        "茶基百科 — 茶百科与冲泡计时 · 依据《茶叶的时间，今天的一杯》《最初的加香红茶——伯爵茶的一切》制作的应用。",
      "pv.openApp": "打开应用"
    },
    "zh-TW": {
      "pv.title": "隱私權政策 — 茶基百科",
      "pv.desc":
        "Teakipedia 應用的隱私權政策。本應用沒有註冊，品茶筆記、計時設定與所選語言只保存在使用者的裝置瀏覽器中，不收集也不傳送個人資訊。",
      "pv.back": "返回應用",
      "pv.kicker": "Privacy Policy",
      "pv.h1": "茶基百科 隱私權政策",
      "pv.lead":
        'Teakipedia 是一款包含茶百科、沖泡計時和品茶筆記的應用。它<span class="key">沒有註冊，也不收集個人資訊，不會向伺服器傳送任何內容。</span>品茶筆記、計時設定和所選語言只留在使用者的裝置瀏覽器中。',
      "pv.metaDate": "生效日 2026年11月20日",
      "pv.metaVersion": "版本 1.0",
      "pv.metaContact": "聯絡 rotroka@gmail.com",
      "pv.s1.title": "收集的個人資訊",
      "pv.s1.body":
        'Teakipedia <span class="key">不收集任何個人資訊</span>——姓名、電話號碼、電子郵件、地址、位置、照片、通訊錄、裝置識別碼都不收集。沒有註冊與登入流程，也沒有把使用者資訊送到自有伺服器或外部的地方。',
      "pv.account": "<b>帳號</b>——不設立。安裝後即可使用。",
      "pv.server": "<b>伺服器</b>——Teakipedia 不營運存放使用者資料的伺服器。",
      "pv.ads": "<b>廣告與分析</b>——沒有廣告 SDK、流量統計或行為分析工具。",
      "pv.s2.title": "保存在裝置上的資訊",
      "pv.s2.body":
        '為了使用方便，應用將下列資訊<span class="key">只保存在使用者裝置的瀏覽器本機儲存（localStorage）</span>中。這些值不會傳送到伺服器，裝置之外也無法查看。',
      "pv.thItem": "保存項",
      "pv.thWhat": "內容",
      "pv.kNotes": "品茶筆記",
      "pv.vNotes": "使用者自己填寫的茶名、評分、一句感想與日期",
      "pv.kMuted": "提示音設定",
      "pv.vMuted": "計時結束提示音是否開啟",
      "pv.kLastTea": "最近選擇的茶",
      "pv.vLastTea": "最後選擇的茶類",
      "pv.kLang": "語言設定",
      "pv.vLang": "用語言切換選擇的語言（한국어 · EN · 简中 · 繁中），下次開啟時以該語言顯示",
      "pv.s2.note":
        "保存的值隨時可以在應用內查看、刪除；刪除應用或清除瀏覽器中此網站的資料時會一起刪除。Teakipedia 不持有這些值的副本，所以已刪除的記錄無法恢復。",
      "pv.s3.title": "為了離線使用而暫時保存",
      "pv.s3.body":
        "為了讓應用在沒有網路時也能開啟，Teakipedia 透過 Service Worker 把應用的畫面檔案（HTML、CSS、JS、圖示）暫時保存在裝置瀏覽器快取中。那只是應用本身的副本，不是使用者的個人資訊或記錄。應用更新時畫面檔案會自動換成最新版本。",
      "pv.s4.title": "裝置權限",
      "pv.s4.body":
        'Teakipedia <span class="key">不請求任何裝置權限</span>——相機、麥克風、位置、通訊錄、照片、通知、儲存空間都不請求。計時結束只在應用畫面內以顯示和提示音告知，不發送推播或背景通知。',
      "pv.s5.title": "外部連結",
      "pv.s5.body":
        "應用內有前往 YouTube 頻道、Naver 部落格、Upaper 電子書書店的連結。點擊連結後由使用者的瀏覽器開啟該網站，此後適用該網站的隱私權政策，Teakipedia 不會把使用者資訊交給該網站。",
      "pv.s6.title": "第三方提供與委託處理",
      "pv.s6.body":
        "因為不收集個人資訊，也沒有向第三方提供或委託處理的資訊。不會出售、共享或查看使用者的記錄。",
      "pv.s7.title": "兒童的隱私",
      "pv.s7.body":
        "Teakipedia 不收集包括未滿14歲兒童在內任何使用者的個人資訊。所有年齡都可以安全使用，應用裡也沒有填寫個人資訊的欄位。",
      "pv.s8.title": "使用者的權利",
      "pv.s8.body":
        '使用者隨時可以在應用的<span class="key">品茶筆記</span>畫面查看自己寫的記錄並逐條刪除。若要一次全部清除，請在裝置瀏覽器中刪除此網站的資料或刪除應用，所選語言設定也會一起清除。Teakipedia 不在裝置之外保存副本，因此不需要另外提出刪除請求。',
      "pv.s9.title": "政策的變更",
      "pv.s9.body":
        "應用功能改變而需要修改本政策時，會先在本頁公布新的政策和生效日。若變更會新增個人資訊的收集，也會在應用內告知。",
      "pv.s10.title": "聯絡",
      "pv.s10.body": "對本隱私權政策有疑問或請求，請用下面的方式告訴我們。",
      "pv.footer":
        "茶基百科 — 茶百科與沖泡計時 · 依據《茶葉的時間，今天的一杯》《最初的加香紅茶——伯爵茶的一切》製作的應用。",
      "pv.openApp": "開啟應用"
    }
  };

  /* 새 화면에서 쓰는 문구 */
  var EXTRA = {
    ko: {
      "detail.origin": "산지",
      "detail.story": "이름과 유래",
      "unit.teas": "{n}종",
      "a11y.group": "계열 선택"
    },
    en: {
      "detail.origin": "Where it comes from",
      "detail.story": "Name & story",
      "unit.teas": "{n} teas",
      "a11y.group": "Choose a tea family"
    },
    "zh-CN": {
      "detail.origin": "产地",
      "detail.story": "名称与由来",
      "unit.teas": "{n}款",
      "a11y.group": "选择大类"
    },
    "zh-TW": {
      "detail.origin": "產地",
      "detail.story": "名稱與由來",
      "unit.teas": "{n}款",
      "a11y.group": "選擇大類"
    }
  };

  var dictFor = {};

  function dict(lang) {
    if (dictFor[lang]) return dictFor[lang];
    var base = UI[lang] || {};
    var privacy = PRIVACY[lang] || {};
    var extras = EXTRA[lang] || {};
    var merged = {};
    var k;
    for (k in base) merged[k] = base[k];
    for (k in privacy) merged[k] = privacy[k];
    for (k in extras) merged[k] = extras[k];
    dictFor[lang] = merged;
    return merged;
  }

  function t(lang, key, vars) {
    var d = dict(lang);
    var raw = d[key];
    if (raw == null && lang !== "ko") raw = UI.ko[key];
    if (raw == null) return key;
    if (!vars) return raw;
    return String(raw).replace(/\{(\w+)\}/g, function (m, name) {
      return vars[name] == null ? m : String(vars[name]);
    });
  }

  /* ---------------- 정적 문구 적용 ---------------- */

  function koOf(el, kind, read) {
    if (!el.__ko) el.__ko = {};
    if (!(kind in el.__ko)) el.__ko[kind] = read();
    return el.__ko[kind];
  }

  function applyStatic(lang, root) {
    root = root || document;
    var d = dict(lang);
    var isKo = lang === "ko";

    function pickValue(el, kind, key, current) {
      // HTML에 적힌 한국어 원문을 처음 한 번만 기억해 둡니다
      var original = koOf(el, kind, function () {
        return current;
      });
      if (isKo) return original;
      var next = d[key];
      return next == null ? original : next;
    }

    var nodes, i;
    nodes = root.querySelectorAll("[data-i18n]");
    for (i = 0; i < nodes.length; i++) {
      nodes[i].textContent = pickValue(
        nodes[i],
        "text",
        nodes[i].getAttribute("data-i18n"),
        nodes[i].textContent
      );
    }
    nodes = root.querySelectorAll("[data-i18n-html]");
    for (i = 0; i < nodes.length; i++) {
      nodes[i].innerHTML = pickValue(
        nodes[i],
        "html",
        nodes[i].getAttribute("data-i18n-html"),
        nodes[i].innerHTML
      );
    }
    nodes = root.querySelectorAll("[data-i18n-ph]");
    for (i = 0; i < nodes.length; i++) {
      nodes[i].placeholder = pickValue(
        nodes[i],
        "ph",
        nodes[i].getAttribute("data-i18n-ph"),
        nodes[i].placeholder
      );
    }
    nodes = root.querySelectorAll("[data-i18n-aria]");
    for (i = 0; i < nodes.length; i++) {
      nodes[i].setAttribute(
        "aria-label",
        pickValue(
          nodes[i],
          "aria",
          nodes[i].getAttribute("data-i18n-aria"),
          nodes[i].getAttribute("aria-label") || ""
        )
      );
    }
    nodes = root.querySelectorAll("[data-i18n-content]");
    for (i = 0; i < nodes.length; i++) {
      nodes[i].setAttribute(
        "content",
        pickValue(
          nodes[i],
          "content",
          nodes[i].getAttribute("data-i18n-content"),
          nodes[i].getAttribute("content") || ""
        )
      );
    }
  }

  function setDocumentLang(lang) {
    try {
      document.documentElement.lang = HTML_LANG[lang] || "ko";
      document.documentElement.setAttribute("data-lang", lang);
    } catch (e) {}
  }

  /* ---------------- 언어 전환 컨트롤 ---------------- */

  function mountSwitcher(el, lang, onChange) {
    if (!el) return;
    el.innerHTML = "";
    el.setAttribute("role", "group");
    for (var i = 0; i < LANGS.length; i++) {
      (function (code) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "lang-btn";
        b.setAttribute("data-lang", code);
        b.setAttribute("lang", HTML_LANG[code] || code);
        b.setAttribute("aria-pressed", String(code === lang));
        b.textContent = LABEL[code];
        b.addEventListener("click", function () {
          if (code === lang) return;
          onChange(code);
        });
        el.appendChild(b);
      })(LANGS[i]);
    }
  }

  /* ---------------- 날짜 · 시간 표기 ---------------- */

  var WEEK = {
    ko: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"],
    en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    "zh-CN": ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
    "zh-TW": ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
  };
  var MONTH = {
    en: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ],
    enShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  };

  function pad2(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function fmtDate(lang, date) {
    var d = date || new Date();
    var y = d.getFullYear();
    var m = d.getMonth() + 1;
    var day = d.getDate();
    var w = d.getDay();
    if (lang === "en") return WEEK.en[w] + ", " + MONTH.en[m - 1] + " " + day + ", " + y;
    if (lang === "zh-CN" || lang === "zh-TW") return y + "年" + m + "月" + day + "日 " + WEEK[lang][w];
    return y + "년 " + m + "월 " + day + "일 " + WEEK.ko[w];
  }

  function fmtDateTime(lang, ts) {
    var d = new Date(ts);
    var hhmm = pad2(d.getHours()) + ":" + pad2(d.getMinutes());
    if (lang === "en") return MONTH.enShort[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear() + " " + hhmm;
    if (lang === "zh-CN") return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()) + " " + hhmm;
    return d.getFullYear() + "." + pad2(d.getMonth() + 1) + "." + pad2(d.getDate()) + " " + hhmm;
  }

  function fmtDuration(lang, sec) {
    sec = Math.max(0, Math.round(sec));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    if (lang === "en") {
      if (m && s) return m + " min " + s + " sec";
      if (m) return m + " min";
      return s + " sec";
    }
    if (lang === "zh-CN" || lang === "zh-TW") {
      if (m && s) return m + "分" + s + "秒";
      if (m) return m + "分";
      return s + "秒";
    }
    if (m && s) return m + "분 " + s + "초";
    if (m) return m + "분";
    return s + "초";
  }

  return {
    STORE_KEY: STORE_KEY,
    LANGS: LANGS,
    LABEL: LABEL,
    LOCALE: LOCALE,
    HTML_LANG: HTML_LANG,
    normalize: normalize,
    detect: detect,
    stored: stored,
    save: save,
    t: t,
    applyStatic: applyStatic,
    setDocumentLang: setDocumentLang,
    mountSwitcher: mountSwitcher,
    fmtDate: fmtDate,
    fmtDateTime: fmtDateTime,
    fmtDuration: fmtDuration
  };
})();
