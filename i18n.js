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
  var HTML_LANG = { ko: "ko", en: "en", "zh-CN": "zh-CN", "zh-TW": "zh-TW" };
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
      "reco.first": "윤차",
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
      "guide.kicker": "Teakipedia",
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
      "fact.first": "윤차",
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
        "Steeping temperatures and times for green, white, oolong, black and dark tea and Earl Grey, with a tea guide and tasting notes — Teakipedia, built from the books Time of Tea Leaves, Today's Cup and Everything About Earl Grey.",
      "a11y.lang": "Language",
      "brand.name": "Teakipedia",
      "brand.sub": "",
      "tab.home": "Today",
      "tab.timer": "Timer",
      "tab.guide": "Tea guide",
      "tab.notes": "Notes",
      "a11y.tabbar": "Main screens",
      "title.home": "Teakipedia — Tea Guide & Steeping Timer",
      "title.timer": "Steeping Timer — Teakipedia",
      "title.guide": "Tea Guide — Teakipedia",
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
      "guide.kicker": "Teakipedia",
      "guide.title": "Tea guide",
      "guide.lead":
        "Oxidation, processing, flavour, pairing, storage — gathered from two books.",
      "guide.search": "Search by name, aroma or origin",
      "a11y.search": "Search the tea guide",
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
      "guide.kicker": "Teakipedia",
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
      "guide.kicker": "Teakipedia",
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
        'Teakipedia is an app with a tea guide, a steeping timer and tasting notes. It has <span class="key">no sign-up and collects no personal data, sending nothing to a server.</span> Your tasting notes, timer settings and chosen language stay only in your device\'s browser storage.',
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
        "Teakipedia — Tea guide & steeping timer · made from Time of Tea Leaves, Today's Cup and The First Scented Black Tea — Everything About Earl Grey.",
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

  /* 나에게 맞는 차 찾기 — 10문항 취향 테스트 */
  var QUIZ = {
    ko: {
      "title.quiz": "나에게 맞는 차 찾기 — 티키피디아",
      "quiz.cardKicker": "취향 테스트",
      "quiz.cardTitle": "나에게 맞는 차 찾기",
      "quiz.cardSub": "10문항 · 1분이면 93종 중 내 잔을 찾습니다",
      "quiz.cardCta": "시작",
      "quiz.kicker": "Find your cup",
      "quiz.title": "나에게 맞는 차 찾기",
      "quiz.lead":
        "10문항에 답하면 6대 다류부터 대용차·허브차·블렌딩차·과일차까지 93종에서 골라 드립니다.",
      "quiz.progress": "{n} / {total}",
      "quiz.backAria": "이전 문항",
      "quiz.a11yProgress": "진행 상황",
      "quiz.resultKicker": "Best match",
      "quiz.resultTitle": "당신의 잔을 찾았습니다",
      "quiz.resultLead": "10문항의 답에서 가장 가까운 차를 골랐습니다.",
      "quiz.best": "가장 잘 맞는 차",
      "quiz.altTitle": "함께 권하는 두 잔",
      "quiz.altCount": "2잔",
      "quiz.whyOne": "고르신 «{a}» 취향에 맞춰, 이 향미가 가장 가까운 차입니다.",
      "quiz.whyTwo": "고르신 «{a}», «{b}» 취향에 맞춰, 이 향미가 가장 가까운 차입니다.",
      "quiz.brew": "바로 우리기",
      "quiz.guide": "백과에서 보기",
      "quiz.restart": "다시 테스트하기",
      "quiz.origin": "산지",
      "quiz.firstSteep": "윤차",
      "quiz.q1": "주로 언제, 왜 차를 마시나요?",
      "quiz.q1a": "아침에 눈을 뜨우고 집중할 때",
      "quiz.q1b": "식후에 개운하게",
      "quiz.q1c": "오후에 잠깐 쉬어 갈 때",
      "quiz.q1d": "밤에, 카페인 걱정 없이",
      "quiz.q2": "끌리는 향은 어느 쪽인가요?",
      "quiz.q2a": "구수하고 고소한 볶음향",
      "quiz.q2b": "화사한 꽃향",
      "quiz.q2c": "달콤하고 잘 익은 과일향",
      "quiz.q2d": "풀내음·청량함",
      "quiz.q2e": "묵직하고 달큰한 몰트·숙성향",
      "quiz.q2f": "상큼한 시트러스·허브",
      "quiz.q3": "바디감과 목넘김은?",
      "quiz.q3a": "물처럼 가볍고 맑게",
      "quiz.q3b": "부드럽고 균형 있게",
      "quiz.q3c": "진하고 묵직하게",
      "quiz.q4": "어떻게 마시는 걸 좋아하나요?",
      "quiz.q4a": "따뜻하게, 스트레이트로",
      "quiz.q4b": "시원하게, 아이스·냉침으로",
      "quiz.q4c": "우유를 넣어 밀크티·라떼로",
      "quiz.q5": "카페인은 어느 정도가 좋나요?",
      "quiz.q5a": "카페인 OK, 각성되는 게 좋아요",
      "quiz.q5b": "적당히, 오후까지면 충분해요",
      "quiz.q5c": "디카페인·카페인 프리로",
      "quiz.q6": "어떤 맛이 끌리나요?",
      "quiz.q6a": "단맛·감칠맛, 둥근 여운",
      "quiz.q6b": "깔끔하고 씁쓸한 수렴미",
      "quiz.q6c": "향이 화려한 블렌딩·가향차",
      "quiz.q6d": "곡물·한방의 익숙한 맛",
      "quiz.q7": "훈연향·로스팅(배전)은?",
      "quiz.q7a": "진한 훈연·로스팅을 좋아해요",
      "quiz.q7b": "은은하게만",
      "quiz.q7c": "없이 깨끗한 편이 좋아요",
      "quiz.q8": "차와 함께 무엇을 하나요?",
      "quiz.q8a": "식사와 함께",
      "quiz.q8b": "디저트·간식과 함께",
      "quiz.q8c": "혼자 천천히, 공복에도",
      "quiz.q9": "우리는 방식은?",
      "quiz.q9a": "간편하게 한 번, 큰 컵이나 티백",
      "quiz.q9b": "여러 번 나눠 공푸차·다도로",
      "quiz.q10": "오늘의 기분과 계절은?",
      "quiz.q10a": "차분히 정리하고 싶어요",
      "quiz.q10b": "활력과 집중이 필요해요",
      "quiz.q10c": "포근하게 위로받고 싶어요",
      "quiz.q10d": "상쾌하게 환기하고 싶어요"
    },
    en: {
      "title.quiz": "What tea suits me? — Teakipedia",
      "quiz.cardKicker": "Taste test",
      "quiz.cardTitle": "What tea suits me?",
      "quiz.cardSub": "10 questions · one minute · 93 teas",
      "quiz.cardCta": "Start",
      "quiz.kicker": "Find your cup",
      "quiz.title": "What tea suits me?",
      "quiz.lead":
        "Answer ten questions and we pick from 93 teas — the six tea families, everyday teas, herbs, blends and fruit teas.",
      "quiz.progress": "{n} / {total}",
      "quiz.backAria": "Previous question",
      "quiz.a11yProgress": "Progress",
      "quiz.resultKicker": "Best match",
      "quiz.resultTitle": "We found your cup",
      "quiz.resultLead": "Chosen from your ten answers — the closest match in the tea guide.",
      "quiz.best": "Best match",
      "quiz.altTitle": "Two more to try",
      "quiz.altCount": "2 cups",
      "quiz.whyOne": "Matching your “{a}” answer, this is the closest cup.",
      "quiz.whyTwo": "Matching your “{a}” and “{b}” answers, this is the closest cup.",
      "quiz.brew": "Brew this now",
      "quiz.guide": "Open in tea guide",
      "quiz.restart": "Take the test again",
      "quiz.origin": "Origin",
      "quiz.firstSteep": "First infusion",
      "quiz.q1": "When do you usually drink tea, and why?",
      "quiz.q1a": "Morning — to wake up and focus",
      "quiz.q1b": "After a meal, to freshen up",
      "quiz.q1c": "Afternoon — a short pause",
      "quiz.q1d": "At night, without worrying about caffeine",
      "quiz.q2": "Which aroma pulls you in?",
      "quiz.q2a": "Toasted, nutty roast",
      "quiz.q2b": "Bright floral",
      "quiz.q2c": "Ripe, sweet fruit",
      "quiz.q2d": "Green grass and freshness",
      "quiz.q2e": "Deep malt and aged sweetness",
      "quiz.q2f": "Zesty citrus and herbs",
      "quiz.q3": "Body and mouthfeel?",
      "quiz.q3a": "Light and clear, like water",
      "quiz.q3b": "Soft and balanced",
      "quiz.q3c": "Rich and full",
      "quiz.q4": "How do you like to drink it?",
      "quiz.q4a": "Hot, straight",
      "quiz.q4b": "Iced or cold-brewed",
      "quiz.q4c": "With milk — milk tea or a latte",
      "quiz.q5": "How much caffeine suits you?",
      "quiz.q5a": "Caffeine is fine — I like the lift",
      "quiz.q5b": "Moderate — enough until the afternoon",
      "quiz.q5c": "Decaf or caffeine-free, please",
      "quiz.q6": "Which taste appeals?",
      "quiz.q6a": "Sweet, savoury umami with a round finish",
      "quiz.q6b": "Crisp, lightly bitter, astringent",
      "quiz.q6c": "A showy blended or scented tea",
      "quiz.q6d": "Familiar grain and herbal notes",
      "quiz.q7": "Smoke and roast?",
      "quiz.q7a": "I love a strong smoky, roasted note",
      "quiz.q7b": "Only a whisper of it",
      "quiz.q7c": "Keep it clean, without either",
      "quiz.q8": "What is the cup alongside?",
      "quiz.q8a": "A meal",
      "quiz.q8b": "Dessert or a snack",
      "quiz.q8c": "Just me, slowly — even on an empty stomach",
      "quiz.q9": "How do you brew?",
      "quiz.q9a": "One easy steep in a big cup or a tea bag",
      "quiz.q9b": "Several short infusions, gongfu or a tea ceremony",
      "quiz.q10": "Today's mood and season?",
      "quiz.q10a": "I want to settle and clear my head",
      "quiz.q10b": "I need energy and focus",
      "quiz.q10c": "I want something cosy and comforting",
      "quiz.q10d": "I want something bright and refreshing"
    },
    "zh-CN": {
      "title.quiz": "找到适合我的茶 — 茶基百科",
      "quiz.cardKicker": "口味测试",
      "quiz.cardTitle": "找到适合我的茶",
      "quiz.cardSub": "10题 · 1分钟，从93款中找出你的那一杯",
      "quiz.cardCta": "开始",
      "quiz.kicker": "Find your cup",
      "quiz.title": "找到适合我的茶",
      "quiz.lead":
        "答完10题，就从六大茶类到代用茶、花草茶、拼配茶、水果茶共93款中为你挑选。",
      "quiz.progress": "{n} / {total}",
      "quiz.backAria": "上一题",
      "quiz.a11yProgress": "进度",
      "quiz.resultKicker": "Best match",
      "quiz.resultTitle": "找到属于你的一杯",
      "quiz.resultLead": "根据十个回答，从百科中选出了最贴近的一杯。",
      "quiz.best": "最合适的一杯",
      "quiz.altTitle": "再推荐两杯",
      "quiz.altCount": "2杯",
      "quiz.whyOne": "按你选择的「{a}」，这款茶的香气最贴近。",
      "quiz.whyTwo": "按你选择的「{a}」「{b}」，这款茶的香气最贴近。",
      "quiz.brew": "马上冲泡",
      "quiz.guide": "在百科中查看",
      "quiz.restart": "重新测试",
      "quiz.origin": "产地",
      "quiz.firstSteep": "第一泡",
      "quiz.q1": "你通常在什么时候、为什么喝茶？",
      "quiz.q1a": "早上，唤醒自己、集中精神",
      "quiz.q1b": "饭后，清爽一下",
      "quiz.q1c": "下午，短暂歇一口气",
      "quiz.q1d": "夜里，不用担心咖啡因",
      "quiz.q2": "哪种香气最吸引你？",
      "quiz.q2a": "烘焙般的坚果香",
      "quiz.q2b": "明亮的花香",
      "quiz.q2c": "熟透的甜果香",
      "quiz.q2d": "青草与清凉感",
      "quiz.q2e": "厚重的麦芽与陈香",
      "quiz.q2f": "清爽的柑橘与草本",
      "quiz.q3": "口感与入喉感？",
      "quiz.q3a": "像水一样轻而清",
      "quiz.q3b": "柔和而平衡",
      "quiz.q3c": "浓厚而有分量",
      "quiz.q4": "你喜欢怎么喝？",
      "quiz.q4a": "热饮，纯饮",
      "quiz.q4b": "冰饮或冷泡",
      "quiz.q4c": "加牛奶，做奶茶或拿铁",
      "quiz.q5": "咖啡因能接受到什么程度？",
      "quiz.q5a": "可以，喜欢有提神感",
      "quiz.q5b": "适量，到下午为止",
      "quiz.q5c": "低因或无咖啡因",
      "quiz.q6": "哪种味道更吸引你？",
      "quiz.q6a": "甜味、鲜味，圆润的回味",
      "quiz.q6b": "干净、微苦、收涩",
      "quiz.q6c": "香气华丽的拼配或加香茶",
      "quiz.q6d": "谷物、汉方熟悉的味道",
      "quiz.q7": "烟熏与焙火？",
      "quiz.q7a": "喜欢浓的烟熏与焙火",
      "quiz.q7b": "只要淡淡一点",
      "quiz.q7c": "不要，干净清爽更好",
      "quiz.q8": "这杯茶配什么？",
      "quiz.q8a": "配正餐",
      "quiz.q8b": "配甜点或点心",
      "quiz.q8c": "一个人慢慢喝，空腹也可以",
      "quiz.q9": "冲泡方式？",
      "quiz.q9a": "简单一次，大杯或茶包",
      "quiz.q9b": "多次短泡，功夫茶或茶道",
      "quiz.q10": "今天的心情与季节？",
      "quiz.q10a": "想安静整理思绪",
      "quiz.q10b": "需要活力与专注",
      "quiz.q10c": "想被温暖地安慰",
      "quiz.q10d": "想清爽地换口气"
    },
    "zh-TW": {
      "title.quiz": "找到適合我的茶 — 茶基百科",
      "quiz.cardKicker": "口味測試",
      "quiz.cardTitle": "找到適合我的茶",
      "quiz.cardSub": "10題 · 1分鐘，從93款中找出你的那一杯",
      "quiz.cardCta": "開始",
      "quiz.kicker": "Find your cup",
      "quiz.title": "找到適合我的茶",
      "quiz.lead":
        "答完10題，就從六大茶類到代用茶、花草茶、拼配茶、水果茶共93款中為你挑選。",
      "quiz.progress": "{n} / {total}",
      "quiz.backAria": "上一題",
      "quiz.a11yProgress": "進度",
      "quiz.resultKicker": "Best match",
      "quiz.resultTitle": "找到屬於你的一杯",
      "quiz.resultLead": "根據十個回答，從百科中選出了最貼近的一杯。",
      "quiz.best": "最合適的一杯",
      "quiz.altTitle": "再推薦兩杯",
      "quiz.altCount": "2杯",
      "quiz.whyOne": "按你選擇的「{a}」，這款茶的香氣最貼近。",
      "quiz.whyTwo": "按你選擇的「{a}」「{b}」，這款茶的香氣最貼近。",
      "quiz.brew": "馬上沖泡",
      "quiz.guide": "在百科中查看",
      "quiz.restart": "重新測試",
      "quiz.origin": "產地",
      "quiz.firstSteep": "第一泡",
      "quiz.q1": "你通常在什麼時候、為什麼喝茶？",
      "quiz.q1a": "早上，喚醒自己、集中精神",
      "quiz.q1b": "飯後，清爽一下",
      "quiz.q1c": "下午，短暫歇一口氣",
      "quiz.q1d": "夜裡，不用擔心咖啡因",
      "quiz.q2": "哪種香氣最吸引你？",
      "quiz.q2a": "烘焙般的堅果香",
      "quiz.q2b": "明亮的花香",
      "quiz.q2c": "熟透的甜果香",
      "quiz.q2d": "青草與清涼感",
      "quiz.q2e": "厚重的麥芽與陳香",
      "quiz.q2f": "清爽的柑橘與草本",
      "quiz.q3": "口感與入喉感？",
      "quiz.q3a": "像水一樣輕而清",
      "quiz.q3b": "柔和而平衡",
      "quiz.q3c": "濃厚而有分量",
      "quiz.q4": "你喜歡怎麼喝？",
      "quiz.q4a": "熱飲，純飲",
      "quiz.q4b": "冰飲或冷泡",
      "quiz.q4c": "加牛奶，做奶茶或拿鐵",
      "quiz.q5": "咖啡因能接受到什麼程度？",
      "quiz.q5a": "可以，喜歡有提神感",
      "quiz.q5b": "適量，到下午為止",
      "quiz.q5c": "低因或無咖啡因",
      "quiz.q6": "哪種味道更吸引你？",
      "quiz.q6a": "甜味、鮮味，圓潤的回味",
      "quiz.q6b": "乾淨、微苦、收澀",
      "quiz.q6c": "香氣華麗的拼配或加香茶",
      "quiz.q6d": "穀物、漢方熟悉的味道",
      "quiz.q7": "煙燻與焙火？",
      "quiz.q7a": "喜歡濃的煙燻與焙火",
      "quiz.q7b": "只要淡淡一點",
      "quiz.q7c": "不要，乾淨清爽更好",
      "quiz.q8": "這杯茶配什麼？",
      "quiz.q8a": "配正餐",
      "quiz.q8b": "配甜點或點心",
      "quiz.q8c": "一個人慢慢喝，空腹也可以",
      "quiz.q9": "沖泡方式？",
      "quiz.q9a": "簡單一次，大杯或茶包",
      "quiz.q9b": "多次短泡，功夫茶或茶道",
      "quiz.q10": "今天的心情與季節？",
      "quiz.q10a": "想安靜整理思緒",
      "quiz.q10b": "需要活力與專注",
      "quiz.q10c": "想被溫暖地安慰",
      "quiz.q10d": "想清爽地換口氣"
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

  /* 파트너 티룸 · 콘텐츠 연결 */
  var SHOPS = {
    ko: {
      "weekday.mon": "월",
      "weekday.tue": "화",
      "weekday.wed": "수",
      "weekday.thu": "목",
      "weekday.fri": "금",
      "weekday.sat": "토",
      "weekday.sun": "일",
      "shop.title": "티룸에서 마시기",
      "shop.sub": "1호 파트너 {n}곳",
      "shop.partner": "파트너",
      "shop.open": "영업 중",
      "shop.closed": "영업 종료",
      "shop.closedToday": "오늘 휴무",
      "shop.before": "{time} 오픈",
      "shop.hours": "영업시간",
      "shop.lastOrder": "라스트오더 {time}",
      "shop.menu": "대표 메뉴",
      "shop.address": "오시는 길",
      "shop.map": "지도",
      "shop.place": "플레이스",
      "shop.call": "전화",
      "shop.detail": "자세히",
      "shop.collapse": "접기",
      "shop.mapAria": "{name} 지도를 엽니다",
      "shop.priceUnknown": "가격 미확인",
      "shop.match": "내 취향 {n}개 일치",
      "shop.atTea": "이 차를 내는 찻집",
      "shop.atTeaSub": "파트너 티룸",
      "buy.title": "이 차, 집에서 마시려면",
      "buy.sub": "추천 찻잎·다구",
      "buy.priceNote": "판매처 기준가",
      "buy.video": "이 차 이야기 보기"
    },
    en: {
      "weekday.mon": "Mon",
      "weekday.tue": "Tue",
      "weekday.wed": "Wed",
      "weekday.thu": "Thu",
      "weekday.fri": "Fri",
      "weekday.sat": "Sat",
      "weekday.sun": "Sun",
      "shop.title": "Have it in a tea room",
      "shop.sub": "{n} first partner shops",
      "shop.partner": "Partner",
      "shop.open": "Open now",
      "shop.closed": "Closed for today",
      "shop.closedToday": "Closed today",
      "shop.before": "Opens {time}",
      "shop.hours": "Hours",
      "shop.lastOrder": "Last order {time}",
      "shop.menu": "Signature menu",
      "shop.address": "Getting there",
      "shop.map": "Map",
      "shop.place": "Place page",
      "shop.call": "Call",
      "shop.detail": "Details",
      "shop.collapse": "Close",
      "shop.mapAria": "Open the map for {name}",
      "shop.priceUnknown": "Price not listed",
      "shop.match": "{n} of your taste tags",
      "shop.atTea": "Tea rooms serving this tea",
      "shop.atTeaSub": "Partner tea rooms",
      "buy.title": "To brew this at home",
      "buy.sub": "Leaves & teaware",
      "buy.priceNote": "Seller's listed price",
      "buy.video": "Watch the story of this tea"
    },
    "zh-CN": {
      "weekday.mon": "周一",
      "weekday.tue": "周二",
      "weekday.wed": "周三",
      "weekday.thu": "周四",
      "weekday.fri": "周五",
      "weekday.sat": "周六",
      "weekday.sun": "周日",
      "shop.title": "到茶室喝一杯",
      "shop.sub": "首批合作茶室 {n} 家",
      "shop.partner": "合作伙伴",
      "shop.open": "营业中",
      "shop.closed": "今日已打烊",
      "shop.closedToday": "今日休息",
      "shop.before": "{time} 开门",
      "shop.hours": "营业时间",
      "shop.lastOrder": "最后点单 {time}",
      "shop.menu": "招牌菜单",
      "shop.address": "如何前往",
      "shop.map": "地图",
      "shop.place": "主页",
      "shop.call": "电话",
      "shop.detail": "详情",
      "shop.collapse": "收起",
      "shop.mapAria": "打开{name}地图",
      "shop.priceUnknown": "价格未确认",
      "shop.match": "契合你的 {n} 个口味标签",
      "shop.atTea": "供应这款茶的茶室",
      "shop.atTeaSub": "合作茶室",
      "buy.title": "想在家泡这一杯",
      "buy.sub": "推荐茶叶与茶具",
      "buy.priceNote": "卖家标价",
      "buy.video": "看这款茶的故事"
    },
    "zh-TW": {
      "weekday.mon": "週一",
      "weekday.tue": "週二",
      "weekday.wed": "週三",
      "weekday.thu": "週四",
      "weekday.fri": "週五",
      "weekday.sat": "週六",
      "weekday.sun": "週日",
      "shop.title": "到茶室喝一杯",
      "shop.sub": "首批合作茶室 {n} 家",
      "shop.partner": "合作夥伴",
      "shop.open": "營業中",
      "shop.closed": "今日已打烊",
      "shop.closedToday": "今日休息",
      "shop.before": "{time} 開門",
      "shop.hours": "營業時間",
      "shop.lastOrder": "最後點單 {time}",
      "shop.menu": "招牌菜單",
      "shop.address": "如何前往",
      "shop.map": "地圖",
      "shop.place": "主頁",
      "shop.call": "電話",
      "shop.detail": "詳情",
      "shop.collapse": "收合",
      "shop.mapAria": "開啟{name}地圖",
      "shop.priceUnknown": "價格未確認",
      "shop.match": "契合你的 {n} 個口味標籤",
      "shop.atTea": "供應這款茶的茶室",
      "shop.atTeaSub": "合作茶室",
      "buy.title": "想在家泡這一杯",
      "buy.sub": "推薦茶葉與茶具",
      "buy.priceNote": "賣家標價",
      "buy.video": "看這款茶的故事"
    }
  };

  var dictFor = {};

  function dict(lang) {
    if (dictFor[lang]) return dictFor[lang];
    var base = UI[lang] || {};
    var privacy = PRIVACY[lang] || {};
    var quiz = QUIZ[lang] || {};
    var extras = EXTRA[lang] || {};
    var shops = SHOPS[lang] || {};
    var merged = {};
    var k;
    for (k in base) merged[k] = base[k];
    for (k in privacy) merged[k] = privacy[k];
    for (k in quiz) merged[k] = quiz[k];
    for (k in extras) merged[k] = extras[k];
    for (k in shops) merged[k] = shops[k];
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
