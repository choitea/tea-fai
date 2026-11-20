/* ============================================================
   티키피디아(Teakipedia) — 화면 로직
   · 오늘의 차 / 우림 타이머 / 차 백과 / 시음 노트
   ============================================================ */
(function () {
  "use strict";

  var D = window.TEAFaiData;
  var L = window.TEAFaiI18N;

  var NOTES_KEY = "teafai.notes.v1";
  var MUTE_KEY = "teafai.muted.v1";
  var LAST_TEA_KEY = "teafai.lastTea.v1";

  var RING_R = 116;
  var RING_C = 2 * Math.PI * RING_R;

  var lang = L.detect();

  /* ---------------- 공용 유틸 ---------------- */
  function t(key, vars) {
    return L.t(lang, key, vars);
  }
  function $(sel, root) {
    return (root || document).querySelector(sel);
  }
  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }
  function pad2(n) {
    return (n < 10 ? "0" : "") + n;
  }
  function fmtClock(sec) {
    sec = Math.max(0, Math.round(sec));
    return pad2(Math.floor(sec / 60)) + ":" + pad2(sec % 60);
  }
  function fmtDur(sec) {
    return L.fmtDuration(lang, sec);
  }
  function clamp(v, lo, hi) {
    return Math.min(hi, Math.max(lo, v));
  }
  function esc(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  function storeGet(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }
  function storeSet(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* 저장 공간이 없으면 조용히 넘어갑니다 */
    }
  }

  var toastTimer = null;
  function toast(msg) {
    var node = $("#toast");
    if (!node) return;
    node.textContent = msg;
    node.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      node.classList.remove("show");
    }, 2400);
  }

  function starsMark(n) {
    var out = "";
    for (var i = 1; i <= 5; i++) out += i <= n ? "★" : "☆";
    return out;
  }

  /* ---------------- 화면 전환 ---------------- */
  var currentView = "home";
  var VIEWS = ["home", "quiz", "timer", "guide", "shops", "community", "notes"];

  function titleFor(view) {
    return t("title." + view);
  }

  function go(view) {
    if (VIEWS.indexOf(view) < 0) return;
    currentView = view;
    $$(".view").forEach(function (sec) {
      sec.classList.toggle("active", sec.id === "view-" + view);
    });
    $$(".tab").forEach(function (tab) {
      /* 취향 테스트는 오늘의 차에서 열리므로 홈 탭을 켜 둡니다 */
      var on = tab.getAttribute("data-view") === (view === "quiz" ? "home" : view);
      tab.classList.toggle("active", on);
      if (on) tab.setAttribute("aria-current", "page");
      else tab.removeAttribute("aria-current");
    });
    document.title = titleFor(view);
    window.scrollTo(0, 0);
    if (view === "home") renderRecentNote();
    if (view === "shops") {
      renderPartnerShops();
      renderCafeList();
    }
    if (view === "community") renderPostList();
    if (view === "guide") {
      renderTeaList();
      renderBagList();
    }
  }

  $$(".tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      go(tab.getAttribute("data-view"));
    });
  });

  /* ============================================================
     1. 오늘의 차
     ============================================================ */
  var homeState = { mood: null };

  function moodById(id) {
    for (var i = 0; i < D.moods.length; i++) if (D.moods[i].id === id) return D.moods[i];
    return D.moods[0];
  }
  function defaultMoodId() {
    var h = new Date().getHours();
    if (h >= 5 && h < 11) return "morning";
    if (h >= 11 && h < 15) return "aftermeal";
    if (h >= 15 && h < 19) return "afternoon";
    return "night";
  }

  function renderHomeDate() {
    var node = $("#homeDate");
    if (!node) return;
    node.textContent = L.fmtDate(lang, new Date());
  }

  function renderMoodChips() {
    var wrap = $("#moodChips");
    if (!wrap) return;
    wrap.innerHTML = "";
    D.moods.forEach(function (m) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip";
      btn.setAttribute("aria-pressed", String(m.id === homeState.mood));
      btn.innerHTML = '<svg><use href="#ic-' + m.icon + '"/></svg><span>' + esc(m.label) + "</span>";
      btn.addEventListener("click", function () {
        homeState.mood = m.id;
        renderMoodChips();
        renderReco();
      });
      wrap.appendChild(btn);
    });
  }

  function renderReco() {
    var area = $("#recoArea");
    if (!area) return;
    var mood = moodById(homeState.mood);
    var tea = D.byId(mood.teaId);
    var alt = D.byId(mood.alt);
    var oxText = /^\d/.test(tea.oxidation || "")
      ? t("reco.ox", { value: tea.oxidation })
      : tea.oxidation || "";

    area.innerHTML =
      '<article class="reco" data-glyph="' +
      esc(tea.hanja) +
      '">' +
      '<div class="reco-top">' +
      "<span>" +
      esc(mood.label) +
      "</span><span>·</span><span>" +
      esc(t("reco.pick")) +
      "</span>" +
      "</div>" +
      '<div class="reco-tea">' +
      '<span class="reco-glyph" style="background:' +
      tea.accent +
      "33;border-color:" +
      tea.accent +
      '66">' +
      esc(tea.hanja) +
      "</span>" +
      "<span>" +
      '<span class="reco-name">' +
      esc(tea.name) +
      "</span>" +
      '<span class="reco-sub">' +
      esc(tea.sub) +
      " · " +
      esc(oxText) +
      "</span></span>" +
      "</div>" +
      '<p class="reco-headline">' +
      esc(mood.headline) +
      "</p>" +
      '<p class="reco-reason">' +
      esc(mood.reason) +
      "</p>" +
      '<div class="reco-stats">' +
      '<div class="reco-stat"><b>' +
      esc(tea.temp) +
      "℃</b><span>" +
      esc(t("reco.temp")) +
      "</span></div>" +
      '<div class="reco-stat"><b>' +
      esc(tea.leaf) +
      "</b><span>" +
      esc(t("reco.leaf", { water: tea.water })) +
      "</span></div>" +
      '<div class="reco-stat"><b>' +
      esc(fmtDur(tea.steeps[0])) +
      "</b><span>" +
      esc(t("reco.first")) +
      "</span></div>" +
      "</div>" +
      '<p class="reco-reason" style="font-size:12px;opacity:.7;margin-bottom:14px">' +
      esc(mood.tip) +
      "</p>" +
      '<div class="reco-actions">' +
      '<button class="btn btn-primary" type="button" id="recoBrew">' +
      esc(t("reco.brew")) +
      "</button>" +
      '<button class="btn btn-ghost" type="button" id="recoAlt">' +
      esc(t("reco.alt", { name: alt.name })) +
      "</button>" +
      "</div>" +
      "</article>";

    $("#recoBrew").addEventListener("click", function () {
      setTimerTea(tea.id, 1);
      go("timer");
      toast(t("toast.recoSet", { name: tea.name, dur: fmtDur(tea.steeps[0]) }));
    });
    $("#recoAlt").addEventListener("click", function () {
      setTimerTea(alt.id, 1);
      go("timer");
      toast(t("toast.toTimer", { name: alt.name }));
    });
  }

  function renderRecentNote() {
    var wrap = $("#recentNote");
    if (!wrap) return;
    var notes = loadNotes();
    if (!notes.length) {
      wrap.innerHTML = "";
      return;
    }
    var n = notes[0];
    var tea = D.byId(n.teaId);
    wrap.innerHTML =
      '<div class="section-head"><h2>' +
      esc(t("home.recentTitle")) +
      "</h2><span>" +
      esc(t("home.recentSub")) +
      "</span></div>" +
      '<button class="note-item" type="button" id="recentNoteBtn" style="display:block;width:100%;text-align:left;padding-right:15px">' +
      '<span class="note-top" style="display:flex"><span class="note-tea" style="background:' +
      tea.accentSoft +
      ";color:" +
      tea.accent +
      '">' +
      esc(tea.name) +
      '</span><span class="note-stars">' +
      starsMark(n.rating) +
      "</span>" +
      '<span class="note-date">' +
      esc(noteDate(n)) +
      "</span></span>" +
      '<span class="note-name" style="display:block;font-size:14.5px">' +
      esc(n.name) +
      "</span>" +
      '<span class="note-text" style="display:block">' +
      esc(n.note || t("home.recentEmpty")) +
      "</span>" +
      "</button>";
    $("#recentNoteBtn").addEventListener("click", function () {
      go("notes");
    });
  }

  /* ============================================================
     2. 우림 타이머
     ============================================================ */
  var timer = {
    teaId: null,
    groupId: "green",
    steep: 1,
    adjust: 0,
    total: 90,
    remaining: 90,
    running: false,
    done: false,
    endAt: 0,
    interval: null,
    muted: storeGet(MUTE_KEY, false),
    wakeLock: null,
    audio: null,
    /* 티백 제품을 골랐을 때만 채워집니다(제품별 온도·시간으로 우리기) */
    custom: null
  };

  function timerTea() {
    return D.byId(timer.teaId || "green-longjing");
  }

  /* 타이머 화면이 쓰는 값 — 잎차면 그 차, 티백이면 제품의 우리기 기준 */
  function timerView() {
    var tea = timerTea();
    var c = timer.custom;
    if (!c) return tea;
    return {
      name: c.name,
      accent: c.accent || tea.accent,
      tempRange: c.temp + "℃",
      temp: c.temp,
      leaf: c.bag || "1",
      water: "200ml",
      ratioNote: "",
      rounds: c.rounds || "1",
      steeps: [c.seconds],
      maxSteep: 1,
      steepBasis: c.note || "",
      brewTip: c.note || "",
      group: c.group || tea.group,
      isBag: true,
      brand: c.brand || ""
    };
  }
  function maxSteep() {
    return Math.min(3, timerView().maxSteep || 3);
  }
  function baseSeconds() {
    var view = timerView();
    return view.steeps[clamp(timer.steep, 1, view.steeps.length) - 1];
  }

  function renderGroupChips() {
    var wrap = $("#groupChips");
    if (!wrap) return;
    wrap.innerHTML = "";
    D.groups.forEach(function (g) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip small";
      btn.setAttribute("aria-pressed", String(g.id === timer.groupId));
      btn.innerHTML =
        '<span class="dot" style="background:' + g.accent + '"></span><span>' + esc(g.name) + "</span>";
      btn.addEventListener("click", function () {
        if (timer.groupId === g.id) return;
        var list = D.teasOf(g.id);
        if (list.length) setTimerTea(list[0].id, 1);
      });
      wrap.appendChild(btn);
    });
  }

  function renderTeaChips() {
    var wrap = $("#teaChips");
    if (!wrap) return;
    wrap.innerHTML = "";
    var list = D.teasOf(timer.groupId);
    list.forEach(function (tea) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip small";
      btn.setAttribute("aria-pressed", String(tea.id === timer.teaId));
      btn.innerHTML =
        "<span>" +
        esc(tea.name) +
        "</span><span style='opacity:.55;font-size:11px'>" +
        esc(tea.temp) +
        "℃</span>";
      btn.addEventListener("click", function () {
        setTimerTea(tea.id, 1);
      });
      wrap.appendChild(btn);
    });
  }

  function renderSteepRow() {
    var wrap = $("#steepRow");
    if (!wrap) return;
    var view = timerView();
    wrap.innerHTML = "";
    if (view.isBag) {
      var one = document.createElement("button");
      one.type = "button";
      one.className = "steep-btn bag";
      one.setAttribute("aria-pressed", "true");
      one.innerHTML = "<b>" + esc(t("bag.tabBag")) + "</b><span>" + esc(fmtDur(baseSeconds())) + "</span>";
      one.addEventListener("click", function () {});
      wrap.appendChild(one);
      wrap.className = "steep-row one";
      return;
    }
    var count = maxSteep();
    for (var i = 1; i <= count; i++) {
      (function (idx) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "steep-btn";
        btn.setAttribute("aria-pressed", String(idx === timer.steep));
        btn.innerHTML =
          "<b>" +
          esc(t("timer.steep", { n: idx })) +
          "</b><span>" +
          esc(fmtDur(view.steeps[idx - 1])) +
          "</span>";
        btn.addEventListener("click", function () {
          if (timer.steep === idx && !timer.done) return;
          setTimerSteep(idx);
        });
        wrap.appendChild(btn);
      })(i);
    }
    wrap.className = "steep-row" + (count === 2 ? " two" : count === 1 ? " one" : "");
  }

  function renderTimerText() {
    var view = timerView();
    $("#ringTime").textContent = fmtClock(timer.remaining);
    $("#ringTea").textContent = t("timer.ring", { name: view.name, n: timer.steep });
    var stateNode = $("#ringState");
    var ring = $("#ring");
    ring.classList.toggle("running", timer.running);
    ring.classList.toggle("done", timer.done);
    if (timer.done) stateNode.textContent = t("state.done");
    else if (timer.running) stateNode.textContent = t("state.running");
    else if (timer.remaining < timer.total) stateNode.textContent = t("state.paused");
    else stateNode.textContent = t("state.ready");

    var progress = timer.total > 0 ? 1 - timer.remaining / timer.total : 0;
    var circle = $("#ringProgress");
    circle.style.strokeDasharray = String(RING_C);
    circle.style.strokeDashoffset = timer.done ? "0" : String(-RING_C * clamp(progress, 0, 1));
    circle.style.stroke = timer.done ? "#B97A3D" : view.accent;

    var startBtn = $("#startBtn");
    if (timer.done) startBtn.textContent = timer.steep < maxSteep() ? t("btn.next") : t("btn.again");
    else if (timer.running) startBtn.textContent = t("btn.pause");
    else if (timer.remaining < timer.total) startBtn.textContent = t("btn.resume");
    else startBtn.textContent = t("btn.start");

    $("#adjustLabel").textContent =
      timer.adjust === 0
        ? t("adjust.zero")
        : timer.adjust > 0
        ? t("adjust.plus", { n: timer.adjust })
        : t("adjust.minus", { n: timer.adjust });
    $("#minus10").disabled = timer.total <= 10;
    $("#plus10").disabled = timer.total >= 1200;

    var note = view.isBag ? t("bag.timerNote") : view.steepBasis || "";
    if (!view.isBag && timer.steep > maxSteep() && view.steepBasis) {
      note = t("timer.thirdNote", { basis: view.steepBasis });
    }
    $("#steepNote").textContent = note;
  }

  function renderBrewInfo() {
    var view = timerView();
    $("#panelTemp").textContent = view.tempRange;
    var rows;
    if (view.isBag) {
      rows = [
        [t("info.temp"), t("info.tempValue", { range: view.tempRange, temp: view.temp })],
        [t("bag.size"), view.brand ? view.brand + " · " + view.leaf : view.leaf],
        [t("info.rounds"), view.rounds],
        [t("info.this"), fmtDur(baseSeconds())],
        [t("info.tip"), view.brewTip]
      ];
    } else {
      rows = [
        [t("info.temp"), t("info.tempValue", { range: view.tempRange, temp: view.temp })],
        [t("info.leaf"), t("info.leafValue", { leaf: view.leaf, water: view.water, ratio: view.ratioNote || "" })],
        [t("info.rounds"), view.rounds || ""],
        [t("info.this"), t("info.thisValue", { dur: fmtDur(baseSeconds()), base: fmtDur(view.steeps[0]) })],
        [t("info.tip"), view.brewTip || ""]
      ];
      if (view.group === "dark") rows.splice(3, 0, [t("info.rinse"), t("rinse.dark")]);
      if (view.group === "oolong") rows.splice(3, 0, [t("info.rinse"), t("rinse.oolong")]);
    }
    $("#brewInfo").innerHTML = rows
      .map(function (r) {
        return '<div class="kv"><dt>' + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd></div>";
      })
      .join("");
  }

  function renderMute() {
    var sw = $("#muteToggle");
    if (!sw) return;
    sw.setAttribute("aria-checked", String(timer.muted));
    $("#muteDesc").textContent = timer.muted ? t("timer.muteOff") : t("timer.muteOn");
    var ico = $("#muteIcon");
    if (ico) ico.innerHTML = '<use href="#ic-' + (timer.muted ? "mute" : "sound") + '"/>';
  }

  function resetTimer(keepAdjust) {
    stopTick();
    timer.running = false;
    timer.done = false;
    if (!keepAdjust) timer.adjust = 0;
    timer.total = clamp(baseSeconds() + timer.adjust, 10, 1200);
    timer.remaining = timer.total;
    renderTimerText();
    renderDoneExtra();
  }

  function setTimerTea(id, steep) {
    var tea = D.byId(id);
    timer.custom = null;
    timer.teaId = tea.id;
    timer.groupId = tea.group;
    timer.steep = steep || 1;
    timer.adjust = 0;
    storeSet(LAST_TEA_KEY, tea.id);
    renderBagMode();
    renderGroupChips();
    renderTeaChips();
    renderSteepRow();
    renderBrewInfo();
    resetTimer();
  }

  function setTimerSteep(idx) {
    timer.steep = idx;
    timer.adjust = 0;
    renderSteepRow();
    renderBrewInfo();
    resetTimer();
  }

  function stopTick() {
    if (timer.interval) {
      window.clearInterval(timer.interval);
      timer.interval = null;
    }
  }

  function startTick() {
    stopTick();
    timer.interval = window.setInterval(tick, 200);
  }

  function tick() {
    if (!timer.running) return;
    var left = (timer.endAt - Date.now()) / 1000;
    if (left <= 0) {
      finishTimer();
      return;
    }
    timer.remaining = left;
    renderTimerText();
  }

  function startTimer() {
    if (timer.running) return;
    if (timer.done) {
      timer.done = false;
      if (timer.steep < maxSteep()) timer.steep += 1;
      timer.adjust = 0;
      renderSteepRow();
      renderBrewInfo();
      renderDoneExtra();
      timer.total = clamp(baseSeconds(), 10, 1200);
      timer.remaining = timer.total;
    }
    if (timer.remaining <= 0) timer.remaining = timer.total;
    timer.endAt = Date.now() + timer.remaining * 1000;
    timer.running = true;
    startTick();
    renderTimerText();
    unlockAudio();
    requestWakeLock();
  }

  function pauseTimer() {
    if (!timer.running) return;
    timer.remaining = Math.max(0, (timer.endAt - Date.now()) / 1000);
    timer.running = false;
    stopTick();
    releaseWakeLock();
    renderTimerText();
  }

  function finishTimer() {
    timer.remaining = 0;
    timer.running = false;
    timer.done = true;
    stopTick();
    releaseWakeLock();
    renderTimerText();
    playChime();
    if (navigator.vibrate) {
      try {
        navigator.vibrate([90, 70, 90]);
      } catch (e) {}
    }
    toast(t("toast.done", { name: timerView().name, n: timer.steep }));
    renderDoneExtra();
  }

  function adjustTimer(delta) {
    var proposed = clamp(timer.total + delta, 10, 1200);
    var applied = proposed - timer.total;
    if (!applied) return;
    timer.total = proposed;
    timer.adjust += applied;
    if (timer.remaining + applied < 1) timer.remaining = 1;
    else timer.remaining += applied;
    if (timer.running) timer.endAt += applied * 1000;
    if (timer.done) {
      timer.done = false;
      timer.remaining = timer.total;
    }
    renderTimerText();
  }

  /* ---- Web Audio: 은은한 종소리 ---- */
  function unlockAudio() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!timer.audio) timer.audio = new AC();
      if (timer.audio.state === "suspended") timer.audio.resume();
    } catch (e) {}
  }

  function playChime() {
    if (timer.muted) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!timer.audio) timer.audio = new AC();
      var ctx = timer.audio;
      if (ctx.state === "suspended") ctx.resume();
      var now = ctx.currentTime + 0.03;

      function bell(freq, start, peak, dur) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(peak, start + 0.09);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + dur + 0.05);
      }

      bell(261.63, now, 0.05, 4.2);
      bell(523.25, now + 0.02, 0.07, 3.4);
      bell(659.25, now + 0.22, 0.05, 3.2);
      bell(783.99, now + 0.42, 0.035, 2.8);
    } catch (e) {}
  }

  function requestWakeLock() {
    try {
      if (!("wakeLock" in navigator) || timer.wakeLock) return;
      navigator.wakeLock
        .request("screen")
        .then(function (lock) {
          timer.wakeLock = lock;
          lock.addEventListener("release", function () {
            timer.wakeLock = null;
          });
        })
        .catch(function () {});
    } catch (e) {}
  }
  function releaseWakeLock() {
    try {
      if (timer.wakeLock) {
        timer.wakeLock.release();
        timer.wakeLock = null;
      }
    } catch (e) {}
  }

  function bindTimer() {
    $("#startBtn").addEventListener("click", function () {
      if (timer.done) {
        startTimer();
        return;
      }
      if (timer.running) pauseTimer();
      else startTimer();
    });
    $("#resetBtn").addEventListener("click", function () {
      resetTimer();
      toast(t("toast.reset"));
    });
    $("#minus10").addEventListener("click", function () {
      adjustTimer(-10);
    });
    $("#plus10").addEventListener("click", function () {
      adjustTimer(10);
    });
    $("#muteToggle").addEventListener("click", function () {
      timer.muted = !timer.muted;
      storeSet(MUTE_KEY, timer.muted);
      renderMute();
      if (!timer.muted) playChime();
    });

    document.addEventListener("visibilitychange", function () {
      if (!document.hidden && timer.running) tick();
    });
  }

  /* ============================================================
     3. 차 백과
     ============================================================ */
  var guideState = { q: "", filter: "all", open: null };

  function renderFilterChips() {
    var wrap = $("#filterChips");
    if (!wrap) return;
    var items = [{ id: "all", name: t("guide.all") }].concat(
      D.groups.map(function (g) {
        return { id: g.id, name: g.name };
      })
    );
    wrap.innerHTML = "";
    items.forEach(function (item) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip small";
      btn.setAttribute("aria-pressed", String(guideState.filter === item.id));
      btn.textContent = item.name;
      btn.addEventListener("click", function () {
        guideState.filter = item.id;
        renderFilterChips();
        renderTeaList();
      });
      wrap.appendChild(btn);
    });
  }

  function haystack(item) {
    return [
      item.name,
      item.sub,
      item.oneLine,
      item.process,
      item.story,
      item.origin,
      item.flavor,
      item.pairing,
      item.keep,
      item.brewTip,
      item.rounds,
      item.groupName,
      (item.alias || []).join(" "),
      (item.varieties || []).join(" "),
      D.searchText(item.id)
    ]
      .join(" ")
      .toLowerCase();
  }

  function cardHtml(item) {
    var open = guideState.open === item.id;
    var isGroup = item.kind === "group";
    var native = D.nativeOf(item, lang);
    var nativeLine = [];
    if (native) nativeLine.push(esc(native));
    var subLow = (item.sub || "").toLowerCase();
    var nameLow = (item.name || "").toLowerCase();
    if (item.sub && subLow !== native.toLowerCase() && subLow !== nameLow) nativeLine.push(esc(item.sub));

    var facts = [
      [t("fact.temp"), item.tempRange],
      [t("fact.leaf"), item.leaf + " / " + item.water],
      [t("fact.first"), fmtDur(item.steeps[0])]
    ];

    var details = [];
    if (isGroup) {
      details.push([t("detail.process"), item.process]);
      details.push(["", (item.varieties || []).map(function (v) {
        return '<span class="tag">' + esc(v) + "</span>";
      }).join("")]);
    } else {
      if (item.origin) details.push([t("detail.origin"), item.origin]);
      if (item.process) details.push([t("detail.process"), item.process]);
      if (item.story) details.push([t("detail.story"), item.story]);
    }
    if (item.flavor) details.push([t("detail.flavor"), item.flavor]);
    if (item.pairing) details.push([t("detail.pairing"), item.pairing]);
    if (item.keep) details.push([t("detail.keep"), item.keep]);
    if (item.brewTip) details.push([t("detail.brew"), item.brewTip]);

    var detailHtml = details
      .map(function (d) {
        if (!d[1]) return "";
        if (!d[0]) return '<div class="detail"><div class="tags">' + d[1] + "</div></div>";
        return '<div class="detail"><h4>' + esc(d[0]) + "</h4><p>" + esc(d[1]) + "</p></div>";
      })
      .join("");

    return (
      '<article class="tea-card' +
      (open ? " open" : "") +
      (isGroup ? " is-group" : "") +
      '" data-tea="' +
      item.id +
      '">' +
      '<button class="tea-main" type="button" data-toggle="' +
      item.id +
      '" aria-expanded="' +
      open +
      '">' +
      '<div class="tea-head">' +
      '<span class="tea-glyph" style="background:' +
      item.accentSoft +
      ";color:" +
      item.accent +
      '">' +
      esc(item.hanja) +
      "</span>" +
      '<span class="tea-title"><b>' +
      esc(item.name) +
      '</b><span class="tea-native">' +
      nativeLine.join(" · ") +
      '</span><span class="tea-meta">' +
      esc(item.groupName) +
      (isGroup ? " · " + esc(t("unit.teas", { n: item.count })) : " · " + esc(item.rounds || "")) +
      "</span></span>" +
      '<span class="tea-caret"><svg width="17" height="17"><use href="#ic-caret"/></svg></span>' +
      "</div>" +
      '<p class="tea-oneline">' +
      esc(item.oneLine) +
      "</p>" +
      '<div class="ox"><div class="ox-top"><span>' +
      esc(t("guide.ox")) +
      "</span><b>" +
      esc(item.oxidation || "") +
      '</b></div><div class="ox-track"><div class="ox-fill' +
      (/^\d/.test(item.oxidation || "") ? "" : " qual") +
      '" style="width:' +
      item.oxidationValue +
      "%;background:" +
      item.accent +
      '"></div></div></div>' +
      '<div class="tea-facts">' +
      facts
        .map(function (f) {
          return '<div class="tea-fact"><span>' + esc(f[0]) + "</span><b>" + esc(f[1]) + "</b></div>";
        })
        .join("") +
      "</div>" +
      "</button>" +
      '<div class="tea-more"><div><div class="tea-more-inner">' +
      detailHtml +
      (isGroup ? "" : teaShopBlockHtml(item.id) + buyBlockHtml(item)) +
      '<button class="btn btn-dark btn-block" type="button" data-timer="' +
      item.id +
      '">' +
      esc(t("guide.toTimer")) +
      "</button>" +
      "</div></div></div>" +
      "</article>"
    );
  }

  function renderTeaList() {
    var list = $("#teaList");
    if (!list) return;
    var q = guideState.q.trim().toLowerCase();
    var out = [];

    D.groups.forEach(function (g) {
      if (guideState.filter !== "all" && guideState.filter !== g.id) return;
      var cards = [g].concat(D.teasOf(g.id)).filter(function (item) {
        if (!q) return true;
        return haystack(item).indexOf(q) >= 0;
      });
      if (!cards.length) return;
      if (guideState.filter === "all") {
        out.push(
          '<div class="group-head"><h2>' +
            esc(g.name) +
            "</h2><span>" +
            esc(t("unit.teas", { n: D.teasOf(g.id).length })) +
            " · " +
            esc(g.tempRange) +
            "</span></div>"
        );
      }
      cards.forEach(function (item) {
        out.push(cardHtml(item));
      });
    });

    if (!out.length) {
      list.innerHTML =
        '<div class="empty">' +
        t("guide.empty", { q: esc(guideState.q) }) +
        "</div>";
      return;
    }
    list.innerHTML = out.join("");

    $$("[data-toggle]", list).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-toggle");
        var card = list.querySelector('[data-tea="' + id + '"]');
        var wasOpen = card && card.classList.contains("open");
        $$(".tea-card.open", list).forEach(function (c) {
          c.classList.remove("open");
          var b = c.querySelector("[data-toggle]");
          if (b) b.setAttribute("aria-expanded", "false");
        });
        if (wasOpen) {
          guideState.open = null;
          return;
        }
        guideState.open = id;
        card.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
        window.setTimeout(function () {
          card.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 160);
      });
    });
    $$("[data-timer]", list).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-timer");
        setTimerTea(id, 1);
        go("timer");
        toast(t("toast.toTimer", { name: D.byId(id).name }));
      });
    });
  }

  /* 백과의 해당 카드를 펼쳐 보여 줍니다 (퀴즈 결과 연결) */
  function openTeaInGuide(id) {
    guideState.q = "";
    guideState.filter = "all";
    guideState.open = id;
    var input = $("#searchInput");
    if (input) input.value = "";
    renderFilterChips();
    openGuideTab("leaf");
    window.setTimeout(function () {
      var card = $('#teaList [data-tea="' + id + '"]');
      if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 200);
  }

  /* ============================================================
     4. 시음 노트
     ============================================================ */
  var noteState = { rating: 0 };

  function loadNotes() {
    var raw = storeGet(NOTES_KEY, []);
    if (!Array.isArray(raw)) return [];
    return raw
      .filter(function (n) {
        return n && n.id && D.byId(n.teaId);
      })
      .sort(function (a, b) {
        return b.createdAt - a.createdAt;
      });
  }
  function saveNotes(list) {
    storeSet(NOTES_KEY, list);
  }
  function noteDate(n) {
    return n.createdAt ? L.fmtDateTime(lang, n.createdAt) : n.dateLabel || "";
  }

  function renderNoteSelect() {
    var sel = $("#noteTea");
    if (!sel) return;
    var prev = sel.value;
    var html = D.groups
      .map(function (g) {
        var opts = D.teasOf(g.id)
          .map(function (tea) {
            return '<option value="' + tea.id + '">' + esc(tea.name) + "</option>";
          })
          .join("");
        return '<optgroup label="' + esc(g.name) + '">' + opts + "</optgroup>";
      })
      .join("");
    sel.innerHTML = html;
    var last = storeGet(LAST_TEA_KEY, null);
    if (prev) sel.value = prev;
    else if (last && D.byId(last).id === last) sel.value = last;
  }

  function renderStarRow() {
    var row = $("#starRow");
    if (!row) return;
    row.innerHTML = "";
    for (var i = 1; i <= 5; i++) {
      (function (v) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "star" + (v <= noteState.rating ? " on" : "");
        b.textContent = "★";
        b.setAttribute("aria-label", t("a11y.star", { n: v }));
        b.setAttribute("aria-pressed", String(v <= noteState.rating));
        b.addEventListener("click", function () {
          noteState.rating = v;
          renderStarRow();
        });
        row.appendChild(b);
      })(i);
    }
    var label = document.createElement("span");
    label.className = "stars-num";
    label.textContent = noteState.rating ? noteState.rating + ".0" : t("notes.starNone");
    row.appendChild(label);
  }

  function renderNotes() {
    var notes = loadNotes();
    var list = $("#noteList");
    var count = notes.length;
    $("#statCount").innerHTML = count + "<small>" + esc(t("unit.cup")) + "</small>";
    $("#noteCountLabel").textContent = t("count.cups", { n: count });

    if (count) {
      var sum = notes.reduce(function (acc, n) {
        return acc + (Number(n.rating) || 0);
      }, 0);
      $("#statAvg").innerHTML = (sum / count).toFixed(1) + "<small>" + esc(t("unit.point")) + "</small>";
    } else {
      $("#statAvg").textContent = "—";
    }

    if (!count) {
      list.innerHTML = '<div class="empty">' + t("notes.empty") + "</div>";
      return;
    }

    list.innerHTML = notes
      .map(function (n) {
        var tea = D.byId(n.teaId);
        return (
          '<article class="note-item">' +
          '<div class="note-top">' +
          '<span class="note-tea" style="background:' +
          tea.accentSoft +
          ";color:" +
          tea.accent +
          '">' +
          esc(tea.name) +
          "</span>" +
          '<span class="note-stars">' +
          starsMark(Number(n.rating)) +
          "</span>" +
          '<span class="note-date">' +
          esc(noteDate(n)) +
          "</span>" +
          "</div>" +
          '<h3 class="note-name">' +
          esc(n.name) +
          "</h3>" +
          (n.note ? '<p class="note-text">' + esc(n.note) + "</p>" : "") +
          '<button class="note-del" type="button" data-del="' +
          n.id +
          '" aria-label="' +
          esc(t("a11y.delete", { name: n.name })) +
          '"><svg width="16" height="16"><use href="#ic-trash"/></svg></button>' +
          "</article>"
        );
      })
      .join("");

    $$("[data-del]", list).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-del");
        var next = loadNotes().filter(function (n) {
          return n.id !== id;
        });
        saveNotes(next);
        renderNotes();
        renderRecentNote();
        toast(t("toast.deleted"));
      });
    });
  }

  function submitNote(e) {
    e.preventDefault();
    var teaId = $("#noteTea").value;
    var name = $("#noteName").value.trim();
    var text = $("#noteText").value.trim();
    if (!name) {
      toast(t("toast.nameNeeded"));
      $("#noteName").focus();
      return;
    }
    if (!noteState.rating) {
      toast(t("toast.ratingNeeded"));
      return;
    }
    var notes = loadNotes();
    var now = Date.now();
    notes.push({
      id: "n" + now + Math.random().toString(36).slice(2, 6),
      teaId: teaId,
      name: name,
      rating: noteState.rating,
      note: text,
      createdAt: now,
      dateLabel: L.fmtDateTime(lang, now)
    });
    saveNotes(notes);
    $("#noteName").value = "";
    $("#noteText").value = "";
    noteState.rating = 0;
    renderStarRow();
    renderNotes();
    renderRecentNote();
    toast(t("toast.saved"));
  }

  /* ============================================================
     5. 나에게 맞는 차 찾기 (10문항 취향 테스트)
     ============================================================ */
  /* 문항과 선택지의 태그 점수 — data.js의 TRAITS 태그와 맞춥니다 */
  var QUIZ = [
    {
      key: "quiz.q1",
      opts: [
        { key: "quiz.q1a", tags: { "t-morning": 6, "m-energy": 4 } },
        { key: "quiz.q1b", tags: { "t-aftermeal": 6, "k-crisp": 3 } },
        { key: "quiz.q1c", tags: { "t-afternoon": 6, "m-calm": 3 } },
        { key: "quiz.q1d", tags: { "t-night": 7, "c-none": 5, "c-low": 3, "c-high": -4, "c-mid": -1 } }
      ]
    },
    {
      key: "quiz.q2",
      opts: [
        { key: "quiz.q2a", tags: { "a-roast": 7, "r-smoke": 2 } },
        { key: "quiz.q2b", tags: { "a-floral": 7, "m-calm": 2 } },
        { key: "quiz.q2c", tags: { "a-fruit": 7, "k-sweet": 2 } },
        { key: "quiz.q2d", tags: { "a-grass": 7, "m-refresh": 3 } },
        { key: "quiz.q2e", tags: { "a-malt": 7, "b-full": 2, "k-sweet": 2 } },
        { key: "quiz.q2f", tags: { "a-herb": 7, "m-refresh": 2 } }
      ]
    },
    {
      key: "quiz.q3",
      opts: [
        { key: "quiz.q3a", tags: { "b-light": 7, "m-refresh": 2 } },
        { key: "quiz.q3b", tags: { "b-medium": 7, "k-sweet": 2 } },
        { key: "quiz.q3c", tags: { "b-full": 7, "k-crisp": 1 } }
      ]
    },
    {
      key: "quiz.q4",
      opts: [
        { key: "quiz.q4a", tags: { "s-hot": 6 } },
        { key: "quiz.q4b", tags: { "s-iced": 6, "m-refresh": 3 } },
        { key: "quiz.q4c", tags: { "s-milk": 7, "b-full": 2, "k-sweet": 2 } }
      ]
    },
    {
      key: "quiz.q5",
      opts: [
        { key: "quiz.q5a", tags: { "c-high": 7, "c-mid": 4, "c-low": 1 } },
        { key: "quiz.q5b", tags: { "c-mid": 7, "c-low": 4, "c-high": 1 } },
        {
          key: "quiz.q5c",
          tags: { "c-none": 8, "c-low": 3, "c-mid": -2, "c-high": -9 },
          caffeineFree: true
        }
      ]
    },
    {
      key: "quiz.q6",
      opts: [
        { key: "quiz.q6a", tags: { "k-sweet": 7, "b-medium": 1 } },
        { key: "quiz.q6b", tags: { "k-crisp": 7, "r-clean": 1 } },
        { key: "quiz.q6c", tags: { "k-blend": 10, "a-fruit": 2, "a-floral": 2 }, groups: ["blended"] },
        { key: "quiz.q6d", tags: { "k-grain": 10, "a-roast": 2 }, groups: ["herbal", "herb"] }
      ]
    },
    {
      key: "quiz.q7",
      opts: [
        { key: "quiz.q7a", tags: { "r-smoke": 7, "a-roast": 3 } },
        { key: "quiz.q7b", tags: { "r-smoke": 3, "r-clean": 3 } },
        { key: "quiz.q7c", tags: { "r-clean": 7 } }
      ]
    },
    {
      key: "quiz.q8",
      opts: [
        { key: "quiz.q8a", tags: { "p-meal": 7 } },
        { key: "quiz.q8b", tags: { "p-dessert": 7, "k-sweet": 2 } },
        { key: "quiz.q8c", tags: { "p-solo": 7, "m-calm": 3 } }
      ]
    },
    {
      key: "quiz.q9",
      opts: [
        { key: "quiz.q9a", tags: { "w-quick": 7 } },
        { key: "quiz.q9b", tags: { "w-gongfu": 7, "m-calm": 2 } }
      ]
    },
    {
      key: "quiz.q10",
      opts: [
        { key: "quiz.q10a", tags: { "m-calm": 7 } },
        { key: "quiz.q10b", tags: { "m-energy": 7, "c-high": 1 } },
        { key: "quiz.q10c", tags: { "m-cozy": 7 } },
        { key: "quiz.q10d", tags: { "m-refresh": 7 } }
      ]
    }
  ];

  var quizState = { step: 0, answers: [], result: null, timer: null };

  function traitList(teaId) {
    var raw = (D.traits && D.traits[teaId]) || "";
    return raw ? raw.split(" ") : [];
  }
  function hasTrait(teaId, tag) {
    return traitList(teaId).indexOf(tag) >= 0;
  }

  function openQuiz() {
    quizState = { step: 0, answers: [], result: null, timer: null };
    go("quiz");
    renderQuiz();
  }

  function quizAnswered(i) {
    return quizState.answers[i] != null;
  }

  function quizOptionPressed(i, o) {
    return quizState.answers[i] === o;
  }

  function chooseQuizOption(i, o) {
    quizState.answers[i] = o;
    var nodes = $$(".quiz-opt", $("#quizBody"));
    nodes.forEach(function (btn) {
      var on = Number(btn.getAttribute("data-opt")) === o;
      btn.classList.toggle("pressed", on);
      btn.setAttribute("aria-pressed", String(on));
    });
    window.clearTimeout(quizState.timer);
    quizState.timer = window.setTimeout(function () {
      quizState.step = Math.min(quizState.step + 1, QUIZ.length);
      renderQuiz();
    }, 170);
  }

  function quizBack() {
    window.clearTimeout(quizState.timer);
    if (quizState.step === 0) {
      go("home");
      return;
    }
    quizState.step -= 1;
    quizState.answers = quizState.answers.slice(0, quizState.step);
    renderQuiz();
  }

  function quizRanking() {
    var freeOnly = quizAnswered(4) && QUIZ[4].opts[quizState.answers[4]].caffeineFree;
    /* 블렌딩차·곡물차처럼 계열을 콕 집은 답은 그 계열 안에서 고릅니다 */
    var onlyGroups = null;
    QUIZ.forEach(function (q, i) {
      if (!quizAnswered(i)) return;
      var g = q.opts[quizState.answers[i]].groups;
      if (g) onlyGroups = onlyGroups ? onlyGroups.filter(function (x) { return g.indexOf(x) >= 0; }) : g.slice();
    });
    var rows = D.teas.map(function (tea, order) {
      var tags = traitList(tea.id);
      var score = 0;
      var parts = [];
      QUIZ.forEach(function (q, i) {
        if (!quizAnswered(i)) return;
        var map = q.opts[quizState.answers[i]].tags;
        var add = 0;
        for (var k in map) if (tags.indexOf(k) >= 0) add += map[k];
        score += add;
        parts.push({ i: i, add: add });
      });
      return { tea: tea, score: score, parts: parts, order: order };
    });
    function keep(r, useGroups) {
      if (useGroups && onlyGroups && onlyGroups.length && onlyGroups.indexOf(r.tea.group) < 0) return false;
      return !freeOnly || hasTrait(r.tea.id, "c-none");
    }
    var picked = rows.filter(function (r) {
      return keep(r, true);
    });
    /* 계열과 카페인 조건이 서로 맞지 않으면 카페인 조건을 먼저 지킵니다 */
    if (!picked.length) {
      picked = rows.filter(function (r) {
        return keep(r, false);
      });
    }
    if (!picked.length) picked = rows;
    picked.sort(function (a, b) {
      return b.score - a.score || a.order - b.order;
    });
    return picked;
  }

  function quizPick(rows) {
    if (!rows.length) return null;
    var best = rows[0];
    /* 1·2순위는 계열을 달리해 고르되, 점수가 너무 낮은 차는 넣지 않습니다 */
    var floor = best.score * 0.55;
    var near = rows.filter(function (r) {
      return r.score >= floor;
    });
    var used = {};
    used[best.tea.group] = true;
    var alts = [];
    var i;
    for (i = 1; i < near.length && alts.length < 2; i++) {
      if (used[near[i].tea.group]) continue;
      used[near[i].tea.group] = true;
      alts.push(near[i]);
    }
    for (i = 1; i < near.length && alts.length < 2; i++) {
      if (near[i] === best || alts.indexOf(near[i]) >= 0) continue;
      alts.push(near[i]);
    }
    for (i = 1; i < rows.length && alts.length < 2; i++) {
      if (rows[i] === best || alts.indexOf(rows[i]) >= 0) continue;
      alts.push(rows[i]);
    }
    return { best: best, alts: alts };
  }

  /* 가장 크게 기여한 답변 두 개를 골라 추천 이유에 씁니다 */
  function quizReasonChips(best) {
    var sorted = best.parts
      .filter(function (p) {
        return p.add > 0;
      })
      .sort(function (a, b) {
        return b.add - a.add;
      });
    var out = [];
    for (var i = 0; i < sorted.length && out.length < 2; i++) {
      out.push(QUIZ[sorted[i].i].opts[quizState.answers[sorted[i].i]].key);
    }
    return out;
  }

  function shortText(text, max) {
    var s = String(text || "").trim();
    if (s.length <= max) return s;
    var cut = s.slice(0, max);
    var stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("。"), cut.lastIndexOf("다. "));
    if (stop > max * 0.45) return cut.slice(0, stop + 1).trim();
    return cut.replace(/[,、·\s]+$/, "") + "…";
  }

  function quizCardHtml(tea, opt) {
    var native = D.nativeOf(tea, lang);
    var sub = tea.sub && tea.sub.toLowerCase() !== native.toLowerCase() ? tea.sub : "";
    var meta = [tea.groupName, tea.tempRange].filter(Boolean).join(" · ");
    var chips = opt.chips || [];
    var chipHtml = chips.length
      ? '<div class="qr-chips">' +
        chips
          .map(function (k) {
            return '<span class="qr-chip">' + esc(t(k)) + "</span>";
          })
          .join("") +
        "</div>"
      : "";
    var origin = tea.origin || "";
    if (!opt.best) origin = shortText(origin, 90);
    return (
      '<article class="qr-card' +
      (opt.best ? " best" : "") +
      '">' +
      (opt.best ? '<span class="qr-badge">' + esc(t("quiz.best")) + "</span>" : "") +
      '<div class="qr-head">' +
      '<span class="qr-glyph" style="background:' +
      tea.accent +
      "1f;color:" +
      tea.accent +
      ";border-color:" +
      tea.accent +
      '55">' +
      esc(tea.hanja) +
      "</span>" +
      '<span class="qr-id"><b>' +
      esc(tea.name) +
      '</b><span class="qr-native">' +
      esc(native) +
      (sub ? " · " + esc(sub) : "") +
      '</span><span class="qr-group">' +
      esc(meta) +
      "</span></span></div>" +
      chipHtml +
      (opt.reason ? '<p class="qr-reason">' + esc(opt.reason) + "</p>" : "") +
      '<p class="qr-flavor">' +
      esc(tea.flavor || tea.oneLine || "") +
      "</p>" +
      (origin
        ? '<p class="qr-origin"><b>' +
          esc(t("quiz.origin")) +
          "</b> " +
          esc(origin) +
          "</p>"
        : "") +
      '<div class="qr-stats">' +
      '<div class="qr-stat"><b>' +
      esc(tea.temp) +
      "℃</b><span>" +
      esc(tea.tempRange) +
      "</span></div>" +
      '<div class="qr-stat"><b>' +
      esc(tea.leaf) +
      "</b><span>" +
      esc(tea.water) +
      "</span></div>" +
      '<div class="qr-stat"><b>' +
      esc(fmtDur(tea.steeps[0])) +
      "</b><span>" +
      esc(t("quiz.firstSteep")) +
      "</span></div>" +
      "</div>" +
      '<div class="qr-actions">' +
      '<button class="btn btn-primary" type="button" data-brew="' +
      tea.id +
      '">' +
      esc(t("quiz.brew")) +
      "</button>" +
      '<button class="btn btn-outline" type="button" data-guide="' +
      tea.id +
      '">' +
      esc(t("quiz.guide")) +
      "</button>" +
      "</div>" +
      (opt.best ? teaShopBlockHtml(tea.id) + buyBlockHtml(tea) : "") +
      "</article>"
    );
  }

  function bindQuizActions(root) {
    $$("[data-brew]", root).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-brew");
        setTimerTea(id, 1);
        go("timer");
        var tea = D.byId(id);
        toast(t("toast.toTimer", { name: tea.name }));
      });
    });
    $$("[data-guide]", root).forEach(function (btn) {
      btn.addEventListener("click", function () {
        openTeaInGuide(btn.getAttribute("data-guide"));
      });
    });
    var again = $("#quizRestart", root);
    if (again) {
      again.addEventListener("click", function () {
        openQuiz();
      });
    }
  }

  function renderQuizQuestion(body) {
    var total = QUIZ.length;
    var step = quizState.step;
    var q = QUIZ[step];
    var opts = q.opts
      .map(function (o, idx) {
        var on = quizOptionPressed(step, idx);
        return (
          '<button class="quiz-opt' +
          (on ? " pressed" : "") +
          '" type="button" data-opt="' +
          idx +
          '" aria-pressed="' +
          on +
          '"><span class="qo-mark" aria-hidden="true"></span><span>' +
          esc(t(o.key)) +
          "</span></button>"
        );
      })
      .join("");

    body.innerHTML =
      '<div class="quiz-step">' +
      '<p class="eyebrow">' +
      esc(t("quiz.kicker")) +
      "</p>" +
      '<h1 class="quiz-q">' +
      esc(t(q.key)) +
      "</h1>" +
      (step === 0 ? '<p class="quiz-lead">' + esc(t("quiz.lead")) + "</p>" : "") +
      '<div class="quiz-opts" role="group" aria-label="' +
      esc(t(q.key)) +
      '">' +
      opts +
      "</div>" +
      "</div>";

    $$(".quiz-opt", body).forEach(function (btn) {
      btn.addEventListener("click", function () {
        chooseQuizOption(step, Number(btn.getAttribute("data-opt")));
      });
    });
  }

  function renderQuizResult(body) {
    var rows = quizRanking();
    var pick = quizPick(rows);
    if (!pick) {
      body.innerHTML = '<div class="empty">' + esc(t("quiz.resultLead")) + "</div>";
      return;
    }
    quizState.result = pick;
    var best = pick.best.tea;
    var chips = quizReasonChips(pick.best);
    var why = "";
    if (chips.length === 2) why = t("quiz.whyTwo", { a: t(chips[0]), b: t(chips[1]) });
    else if (chips.length === 1) why = t("quiz.whyOne", { a: t(chips[0]) });

    body.innerHTML =
      '<div class="quiz-result">' +
      '<p class="eyebrow">' +
      esc(t("quiz.resultKicker")) +
      "</p>" +
      '<h1 class="quiz-q">' +
      esc(t("quiz.resultTitle")) +
      "</h1>" +
      '<p class="quiz-lead">' +
      esc(t("quiz.resultLead")) +
      "</p>" +
      quizCardHtml(best, { best: true, reason: why, chips: chips }) +
      '<div class="section-head"><h2>' +
      esc(t("quiz.altTitle")) +
      "</h2><span>" +
      esc(t("quiz.altCount")) +
      "</span></div>" +
      pick.alts
        .map(function (row) {
          return quizCardHtml(row.tea, { best: false });
        })
        .join("") +
      '<button class="btn btn-dark btn-block quiz-restart" type="button" id="quizRestart">' +
      esc(t("quiz.restart")) +
      "</button>" +
      "</div>";

    bindQuizActions(body);
    window.scrollTo(0, 0);
  }

  function renderQuiz() {
    var body = $("#quizBody");
    if (!body) return;
    var total = QUIZ.length;
    var step = Math.min(quizState.step, total);
    var bar = $("#quizBar");
    var count = $("#quizCount");
    /* 막대는 지금 보고 있는 문항 번호에 맞춥니다 (3 / 10 → 30%) */
    var pct = step >= total ? 100 : Math.round(((step + 1) / total) * 100);
    if (bar) bar.style.width = pct + "%";
    if (count) count.textContent = t("quiz.progress", { n: Math.min(step + 1, total), total: total });
    if (step >= total) {
      renderQuizResult(body);
      return;
    }
    renderQuizQuestion(body);
  }

  function bindQuiz() {
    var banner = $("#quizBanner");
    if (banner) banner.addEventListener("click", openQuiz);
    var back = $("#quizBack");
    if (back) back.addEventListener("click", quizBack);
  }

  /* ============================================================
     6. 파트너 티룸 · 전자책·커머스 연결
     ============================================================ */
  var SHOPS_KEY = "teafai.shops.v1";
  var AFF_KEY = "teafai.affiliate.v1";
  var PARTNER = { shops: [], affiliate: null };
  var DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  var WEEK_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

  /* 데이터 파일은 4개 언어 문구를 함께 갖습니다 */
  function l10n(obj) {
    if (obj == null) return "";
    if (typeof obj === "string") return obj;
    return obj[lang] || obj.en || obj.ko || "";
  }

  function seedJson() {
    var node = document.getElementById("teafai-seed");
    if (!node) return null;
    try {
      return JSON.parse(node.textContent || "");
    } catch (e) {
      return null;
    }
  }

  function readJson(url, storeKey) {
    return window
      .fetch(url, { credentials: "same-origin" })
      .then(function (res) {
        if (!res.ok) throw new Error("http " + res.status);
        return res.json();
      })
      .then(function (data) {
        storeSet(storeKey, data);
        return data;
      });
  }

  function loadPartnerData() {
    var seed = seedJson() || {};
    var cachedShops = storeGet(SHOPS_KEY, null);
    var cachedAff = storeGet(AFF_KEY, null);
    PARTNER.shops = (cachedShops && cachedShops.shops) || seed.shops || [];
    PARTNER.affiliate = cachedAff || seed.affiliate || null;
    renderPartnerSections();

    /* 단일 파일(file://)에서는 fetch 가 막히므로 내장 사본만 씁니다 */
    if (!("fetch" in window) || location.protocol === "file:") return;
    Promise.all([
      readJson("data/shops.json", SHOPS_KEY).catch(function () {
        return null;
      }),
      readJson("data/affiliate.json", AFF_KEY).catch(function () {
        return null;
      })
    ]).then(function (res) {
      var changed = false;
      if (res[0] && res[0].shops) {
        PARTNER.shops = res[0].shops;
        changed = true;
      }
      if (res[1]) {
        PARTNER.affiliate = res[1];
        changed = true;
      }
      if (changed) renderPartnerSections();
    });
  }

  function renderPartnerSections() {
    renderHomeShops();
    renderTeaList();
    renderDoneExtra();
    if (currentView === "quiz") renderQuiz();
  }

  /* 서울 시간 기준 영업 상태 (해외에서도 매장 시간대로 판단) */
  function seoulClock() {
    var d = new Date();
    try {
      var parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Seoul",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }).formatToParts(d);
      var out = {};
      for (var i = 0; i < parts.length; i++) out[parts[i].type] = parts[i].value;
      var wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(out.weekday);
      var hh = parseInt(out.hour, 10) % 24;
      var mm = parseInt(out.minute, 10);
      if (wd >= 0 && !isNaN(hh) && !isNaN(mm)) return { day: wd, minutes: hh * 60 + mm };
    } catch (e) {
      /* Intl 을 못 쓰면 기기 시간대로 */
    }
    return { day: d.getDay(), minutes: d.getHours() * 60 + d.getMinutes() };
  }

  function shopStatus(shop) {
    var clock = seoulClock();
    var span = (shop.hours || {})[DAY_KEYS[clock.day]];
    if (!span) return { key: "closedToday" };
    var m = /^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/.exec(String(span));
    if (!m) return { key: "" };
    var open = Number(m[1]) * 60 + Number(m[2]);
    var close = Number(m[3]) * 60 + Number(m[4]);
    if (clock.minutes < open) return { key: "before", time: m[1] + ":" + m[2] };
    if (clock.minutes >= close) return { key: "closed" };
    return { key: "open" };
  }

  function won(n) {
    if (n == null || n === "") return "";
    var num = Number(n).toLocaleString("en-US");
    return lang === "ko" ? num + "원" : "₩" + num;
  }

  function koNameOf(id) {
    var list = D.TEAS || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return (list[i].ko && list[i].ko.name) || list[i].sub || "";
    }
    return "";
  }

  /* 취향 태그가 겹치는 수 — 퀴즈 결과가 있으면 그 차, 없으면 오늘의 차 기준 */
  function tasteMatch(shop) {
    var refId = quizState.result ? quizState.result.best.tea.id : moodById(homeState.mood).teaId;
    var mine = traitList(refId);
    var n = 0;
    (shop.tasteTags || []).forEach(function (tag) {
      if (mine.indexOf(tag) >= 0) n += 1;
    });
    return n;
  }

  function mapHref(shop) {
    return (shop.maps && (shop.maps.naver || shop.maps.kakao || shop.maps.google)) || shop.placeUrl || "";
  }

  function shopCardHtml(shop) {
    var st = shopStatus(shop);
    var stateText = st.key ? t("shop." + st.key, st.time ? { time: st.time } : null) : "";
    var stateCls = st.key === "open" ? " is-open" : "";
    var name = l10n(shop.name);
    var menu = (shop.menus || [])
      .filter(function (m) {
        return m.signature;
      })
      .slice(0, 2);
    var match = tasteMatch(shop);
    var phone = shop.phone || null;
    var secondBtn = phone
      ? '<a class="sc-btn" href="tel:' +
        esc(phone.tel) +
        '" aria-label="' +
        esc(l10n(shop.phoneNote) || t("shop.call")) +
        '"><svg width="14" height="14"><use href="#ic-sound"/></svg>' +
        esc(t("shop.call")) +
        "</a>"
      : '<a class="sc-btn" href="' +
        esc(shop.placeUrl || mapHref(shop)) +
        '" target="_blank" rel="noopener"><svg width="14" height="14"><use href="#ic-globe"/></svg>' +
        esc(t("shop.place")) +
        "</a>";

    var hoursRows = WEEK_ORDER.map(function (day) {
      var span = (shop.hours || {})[day];
      var today = DAY_KEYS[seoulClock().day] === day;
      return (
        '<li' +
        (today ? ' class="today"' : "") +
        "><span>" +
        esc(t("weekday." + day)) +
        "</span><b>" +
        esc(span || t("shop.closedToday")) +
        "</b></li>"
      );
    }).join("");

    var menuRows = (shop.menus || [])
      .map(function (m) {
        return (
          '<li><span>' +
          esc(l10n(m.name)) +
          "</span><b>" +
          esc(m.price == null ? t("shop.priceUnknown") : won(m.price)) +
          "</b></li>"
        );
      })
      .join("");

    var maps = shop.maps || {};
    var mapLinks = [
      ["naver", "NAVER"],
      ["kakao", "Kakao"],
      ["google", "Google"]
    ]
      .filter(function (m) {
        return maps[m[0]];
      })
      .map(function (m) {
        return (
          '<a class="sc-maplink" href="' +
          esc(maps[m[0]]) +
          '" target="_blank" rel="noopener">' +
          esc(m[1]) +
          "</a>"
        );
      })
      .join("");

    return (
      '<article class="shop-card" data-slug="' +
      esc(shop.slug) +
      '">' +
      '<div class="sc-top">' +
      (shop.sponsor
        ? '<span class="sc-badge top">' + esc(t("cafe.top")) + "</span>"
        : '<span class="sc-badge">' + esc(t("shop.partner")) + "</span>") +
      (stateText ? '<span class="sc-state' + stateCls + '">' + esc(stateText) + "</span>" : "") +
      "</div>" +
      '<b class="sc-name">' +
      esc(name) +
      "</b>" +
      '<span class="sc-region">' +
      esc(l10n(shop.region)) +
      " · " +
      esc(l10n(shop.near)) +
      "</span>" +
      '<p class="sc-desc">' +
      esc(l10n(shop.desc)) +
      "</p>" +
      '<div class="sc-signature">' +
      menu
        .map(function (m) {
          return (
            '<span class="sc-menu-item"><span>' +
            esc(l10n(m.name)) +
            "</span><b>" +
            esc(m.price == null ? t("shop.priceUnknown") : won(m.price)) +
            "</b></span>"
          );
        })
        .join("") +
      "</div>" +
      (match ? '<span class="sc-match">' + esc(t("shop.match", { n: match })) + "</span>" : "") +
      '<div class="sc-actions">' +
      '<a class="sc-btn primary" href="' +
      esc(mapHref(shop)) +
      '" target="_blank" rel="noopener" aria-label="' +
      esc(t("shop.mapAria", { name: name })) +
      '"><svg width="14" height="14"><use href="#ic-globe"/></svg>' +
      esc(t("shop.map")) +
      "</a>" +
      secondBtn +
      '<button class="sc-btn ghost" type="button" data-shop-more="' +
      esc(shop.slug) +
      '" aria-expanded="false">' +
      esc(t("shop.detail")) +
      "</button>" +
      "</div>" +
      '<div class="sc-more" data-more="' +
      esc(shop.slug) +
      '" hidden>' +
      "<h4>" +
      esc(t("shop.hours")) +
      "</h4><ul class=\"sc-hours\">" +
      hoursRows +
      "</ul>" +
      (shop.hoursNote ? '<p class="sc-note">' + esc(l10n(shop.hoursNote)) + "</p>" : "") +
      "<h4>" +
      esc(t("shop.menu")) +
      "</h4><ul class=\"sc-hours\">" +
      menuRows +
      "</ul>" +
      "<h4>" +
      esc(t("shop.address")) +
      "</h4><p class=\"sc-addr\">" +
      esc(l10n(shop.address)) +
      "<br />" +
      esc(l10n(shop.near)) +
      "</p>" +
      (mapLinks ? '<div class="sc-maps">' + mapLinks + "</div>" : "") +
      (phone ? '<p class="sc-note">' + esc(phone.display) + "</p>" : "") +
      "</div>" +
      "</article>"
    );
  }

  function bindShop(root) {
    $$("[data-shop-more]", root).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var slug = btn.getAttribute("data-shop-more");
        var panel = root.querySelector('[data-more="' + slug + '"]');
        if (!panel) return;
        var wasOpen = !panel.hidden;
        $$("[data-more]", root).forEach(function (p) {
          p.hidden = true;
        });
        $$("[data-shop-more]", root).forEach(function (b) {
          b.textContent = t("shop.detail");
          b.setAttribute("aria-expanded", "false");
        });
        if (!wasOpen) {
          panel.hidden = false;
          btn.textContent = t("shop.collapse");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  function renderHomeShops() {
    var head = $("#shopHead");
    var row = $("#shopHome");
    var sub = $("#shopSub");
    if (!head || !row) return;
    var shops = PARTNER.shops || [];
    if (!shops.length) {
      head.hidden = true;
      row.hidden = true;
      row.innerHTML = "";
      return;
    }
    head.hidden = false;
    row.hidden = false;
    if (sub) sub.textContent = t("shop.sub", { n: shops.length });
    row.innerHTML = shops.map(shopCardHtml).join("");
    bindShop(row);
  }

  /* 이 차를 메뉴에 두는 파트너 티룸 */
  function shopsForTea(teaId) {
    return (PARTNER.shops || []).filter(function (shop) {
      return (shop.menus || []).some(function (m) {
        return m.teaId === teaId;
      });
    });
  }

  function teaShopBlockHtml(teaId) {
    var list = shopsForTea(teaId);
    if (!list.length) return "";
    return (
      '<div class="qr-shops">' +
      '<div class="qrs-head">' +
      esc(t("shop.atTea")) +
      '<span>' +
      esc(t("shop.atTeaSub")) +
      "</span></div>" +
      list
        .map(function (shop) {
          return (
            '<a class="qrs-item" href="' +
            esc(mapHref(shop)) +
            '" target="_blank" rel="noopener"><b>' +
            esc(l10n(shop.name)) +
            "</b><span>" +
            esc(l10n(shop.region)) +
            " · " +
            esc(t("shop.map")) +
            "</span></a>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  /* 제휴 상품 항목은 4개 언어 문구를 갖고 오므로 현재 언어로 풀어 씁니다 */
  function affItem(it) {
    return {
      kind: it.kind,
      url: String(it.url || ""),
      paid: it.paid !== false,
      badge: l10n(it.badge),
      label: l10n(it.label),
      title: l10n(it.title) || l10n(it.name) || "",
      price_krw: it.price_krw || null
    };
  }

  /* 추천 찻잎·다구 — 실제 제휴 링크가 오면 items 로, 그 전에는 둘러보기(검색) 링크 */
  function buyPack(tea) {
    var aff = PARTNER.affiliate;
    if (!aff) return null;
    var leaf = null;
    var teaware = null;
    (aff.items || [])
      .filter(function (it) {
        if (it.active === false || it.is_active === false) return false;
        if (it.tea_id && it.tea_id !== tea.id) return false;
        if (it.group_id && it.group_id !== tea.group) return false;
        if (it.tea_ids && it.tea_ids.indexOf(tea.id) < 0) return false;
        if (it.group_ids && it.group_ids.indexOf(tea.group) < 0) return false;
        return true;
      })
      .sort(function (a, b) {
        return (b.priority || 0) - (a.priority || 0);
      })
      .forEach(function (it) {
        if (it.kind === "leaf" && !leaf) leaf = affItem(it);
        else if (it.kind === "teaware" && !teaware) teaware = affItem(it);
      });

    var koName = koNameOf(tea.id);
    (aff.browse || []).forEach(function (b) {
      if (b.kind !== "leaf" && b.kind !== "teaware") return;
      if (b.kind === "leaf" && leaf) return;
      if (b.kind === "teaware" && teaware) return;
      var query = String(b.query || "").replace("{koName}", koName);
      var entry = {
        kind: b.kind,
        url: String(b.url || "").replace("{q}", encodeURIComponent(query)),
        paid: !!b.paid,
        badge: l10n(b.badge),
        label: l10n(b.label),
        title: b.kind === "leaf" ? tea.name : l10n(b.title) || l10n(b.label),
        price_krw: null
      };
      if (b.kind === "leaf") leaf = entry;
      else teaware = entry;
    });

    var items = [leaf, teaware].filter(Boolean);
    if (!items.length && !aff.books && !aff.video) return null;
    return {
      items: items,
      book: (aff.books || [])[0] || null,
      video: aff.video || null,
      disclosure: aff.disclosure
    };
  }

  function buyBlockHtml(tea) {
    var pack = buyPack(tea);
    if (!pack) return "";
    var paid = pack.items.some(function (it) {
      return it.paid;
    });
    var html =
      '<div class="buy-block">' +
      '<div class="bb-head"><span class="bb-kicker">' +
      esc(t("buy.sub")) +
      "</span><b>" +
      esc(t("buy.title")) +
      "</b></div>";
    if (pack.items.length) {
      html +=
        '<div class="bb-items">' +
        pack.items
          .map(function (it) {
            return (
              '<a class="bb-item" href="' +
              esc(it.url) +
              '" target="_blank" rel="' +
              (it.paid ? "sponsored noopener" : "noopener") +
              '"><span class="bb-badge">' +
              esc(it.badge || "") +
              '</span><span class="bb-name">' +
              esc(it.title || it.label || "") +
              (it.price_krw
                ? '<em>' + esc(t("buy.priceNote")) + " " + esc(won(it.price_krw)) + "</em>"
                : "") +
              '</span><span class="bb-cta">' +
              esc(it.label || "") +
              '</span></a>'
            );
          })
          .join("") +
        "</div>";
      if (paid) {
        html += '<p class="bb-note">' + esc(l10n(pack.disclosure)) + "</p>";
      }
    }
    var links = [];
    if (pack.book) {
      links.push(
        '<a class="bb-link" href="' +
          esc(pack.book.url) +
          '" target="_blank" rel="noopener" title="' +
          esc(l10n(pack.book.title)) +
          '"><svg width="14" height="14"><use href="#ic-book"/></svg>' +
          esc(l10n(pack.book.label)) +
          "</a>"
      );
    }
    if (pack.video) {
      links.push(
        '<a class="bb-link" href="' +
          esc(pack.video.url) +
          '" target="_blank" rel="noopener" title="' +
          esc(l10n(pack.video.title)) +
          '"><svg width="12" height="12"><use href="#ic-youtube"/></svg>' +
          esc(l10n(pack.video.label)) +
          "</a>"
      );
    }
    if (links.length) html += '<div class="bb-links">' + links.join("") + "</div>";
    return html + "</div>";
  }

  /* 타이머가 끝나면 이 차 이야기와 이 차를 내는 찻집으로 이어 줍니다 */
  function renderDoneExtra() {
    var box = $("#doneExtra");
    if (!box) return;
    if (!timer.done) {
      box.hidden = true;
      box.innerHTML = "";
      return;
    }
    var view = timerView();
    if (view.isBag) {
      box.hidden = false;
      box.innerHTML =
        '<button class="de-link" type="button" data-open-bags><svg width="13" height="13"><use href="#ic-bag"/></svg>' +
        esc(t("bag.tabBag")) +
        "</button>" +
        '<button class="de-link" type="button" data-open-guide><svg width="13" height="13"><use href="#ic-book"/></svg>' +
        esc(t("bag.toGuide")) +
        "</button>";
      $$("[data-open-bags]", box).forEach(function (b) {
        b.addEventListener("click", function () {
          openGuideTab("bag");
        });
      });
      $$("[data-open-guide]", box).forEach(function (b) {
        b.addEventListener("click", function () {
          openTeaInGuide(view.group ? D.teasOf(view.group)[0].id : timer.teaId);
        });
      });
      return;
    }
    var tea = timerTea();
    var aff = PARTNER.affiliate;
    var links = [];
    if (aff && aff.video) {
      links.push(
        '<a class="de-link" href="' +
          esc(aff.video.url) +
          '" target="_blank" rel="noopener"><svg width="13" height="13"><use href="#ic-youtube"/></svg>' +
          esc(t("buy.video")) +
          "</a>"
      );
    }
    shopsForTea(tea.id).forEach(function (shop) {
      links.push(
        '<a class="de-link" href="' +
          esc(mapHref(shop)) +
          '" target="_blank" rel="noopener"><svg width="13" height="13"><use href="#ic-globe"/></svg>' +
          esc(l10n(shop.name)) +
          "</a>"
      );
    });
    if (!links.length) {
      box.hidden = true;
      box.innerHTML = "";
      return;
    }
    box.hidden = false;
    box.innerHTML = links.join("");
  }

  /* ============================================================
     5. 티백 검색 — 브랜드·차종·향미로 찾고 그대로 우리기
     ============================================================ */
  var BAGS_KEY = "teafai.bags.v1";
  var CAFES_KEY = "teafai.cafes.v1";
  var PLANS_KEY = "teafai.plans.v1";
  var POSTS_KEY = "teafai.posts.v1";
  var APPS_KEY = "teafai.applications.v1";
  var REACT_KEY = "teafai.reactions.v1";

  var FEATURE = { bags: null, cafes: null, plans: null };
  var bagState = { q: "", brand: "all", type: "all", tag: "all", caffeine: "all", open: null };
  var cafeState = { q: "", region: "all", tag: "all", open: null };
  var commState = { filter: "all", type: "review", rating: 0 };
  var applyState = { plan: null, tags: [], result: null };

  /* 취향 태그 가운데 화면에 보여 줄 8개 (TRAITS 어휘와 같습니다) */
  var TAG_KEYS = ["a-floral", "a-fruit", "a-roast", "a-grass", "a-malt", "a-herb", "k-sweet", "k-crisp"];

  /* 파트너 매장은 shops.json 의 지역 표기가 달라 슬러그로 지역을 맞춥니다 */
  var PARTNER_REGION = {
    "hongkongtea-bulgwang": "eunpyeong",
    "pungsungh-buffet-sindang": "jung"
  };

  function anyText(obj) {
    if (obj == null) return "";
    if (typeof obj === "string") return obj;
    return [obj.ko, obj.en, obj["zh-CN"], obj["zh-TW"]].filter(Boolean).join(" ");
  }

  function cacheOrSeed(key, seedVal) {
    var cached = storeGet(key, null);
    if (!cached) return seedVal || null;
    if (seedVal && String(cached.updated || "") < String(seedVal.updated || "")) return seedVal;
    return cached;
  }

  function loadFeatureData() {
    var seed = seedJson() || {};
    FEATURE.bags = cacheOrSeed(BAGS_KEY, seed.teabags);
    FEATURE.cafes = cacheOrSeed(CAFES_KEY, seed.cafes);
    FEATURE.plans = cacheOrSeed(PLANS_KEY, seed.plans);
    renderFeatureSections();

    if (!("fetch" in window) || location.protocol === "file:") return;
    Promise.all([
      readJson("data/teabags.json", BAGS_KEY).catch(function () {
        return null;
      }),
      readJson("data/cafes.json", CAFES_KEY).catch(function () {
        return null;
      }),
      readJson("data/onboarding_plans.json", PLANS_KEY).catch(function () {
        return null;
      })
    ]).then(function (res) {
      var changed = false;
      if (res[0] && res[0].bags) {
        FEATURE.bags = res[0];
        changed = true;
      }
      if (res[1] && res[1].cafes) {
        FEATURE.cafes = res[1];
        changed = true;
      }
      if (res[2] && res[2].plans) {
        FEATURE.plans = res[2];
        changed = true;
      }
      if (changed) renderFeatureSections();
    });
  }

  function renderFeatureSections() {
    renderBagFilters();
    renderBagList();
    renderRegionChips();
    renderCafeTagChips();
    renderPartnerShops();
    renderCafeList();
    renderApplyMeta();
    renderPostForm();
    renderPostList();
    renderBagMode();
  }

  /* ---------------- 티백 ---------------- */
  function bagBrandLabel(bag) {
    var b = FEATURE.bags && FEATURE.bags.brands ? FEATURE.bags.brands[bag.brand] : null;
    if (!b) return bag.brand || "";
    if (lang === "ko") return b.ko || b.name;
    var local = b[lang];
    return local && local !== b.name ? local + " · " + b.name : b.name;
  }

  function bagBrandName(bag) {
    return bagBrandLabel(bag);
  }

  function groupNameOf(id) {
    for (var i = 0; i < D.groups.length; i++) if (D.groups[i].id === id) return D.groups[i].name;
    return id;
  }

  function bagHaystack(bag) {
    return [
      anyText(bag.name),
      bagBrandLabel(bag),
      anyText(bag.note),
      groupNameOf(bag.type),
      (bag.tags || []).join(" "),
      bag.bag
    ]
      .join(" ")
      .toLowerCase();
  }

  function bagsOfState() {
    var bags = (FEATURE.bags && FEATURE.bags.bags) || [];
    var q = bagState.q.trim().toLowerCase();
    return bags.filter(function (bag) {
      if (bagState.brand !== "all" && bag.brand !== bagState.brand) return false;
      if (bagState.type !== "all" && bag.type !== bagState.type) return false;
      if (bagState.tag !== "all" && (bag.tags || []).indexOf(bagState.tag) < 0) return false;
      if (bagState.caffeine === "yes" && !bag.caffeine) return false;
      if (bagState.caffeine === "no" && bag.caffeine) return false;
      if (q && bagHaystack(bag).indexOf(q) < 0) return false;
      return true;
    });
  }

  function renderBagFilters() {
    var sel = $("#bagBrand");
    var wrap = $("#bagTypeChips");
    if (!sel || !wrap) return;
    var brands = (FEATURE.bags && FEATURE.bags.brands) || {};
    var keys = Object.keys(brands);
    var prev = bagState.brand;
    sel.innerHTML =
      '<option value="all">' +
      esc(t("bag.brandAll")) +
      "</option>" +
      keys
        .map(function (k) {
          var b = brands[k];
          var label = lang === "ko" ? b.ko || b.name : (b[lang] || b.name) + (b.name && b[lang] && b[lang] !== b.name ? " · " + b.name : "");
          return '<option value="' + esc(k) + '">' + esc(label) + "</option>";
        })
        .join("");
    sel.value = keys.indexOf(prev) >= 0 || prev === "all" ? prev : "all";
    bagState.brand = sel.value;

    var types = [];
    ((FEATURE.bags && FEATURE.bags.bags) || []).forEach(function (bag) {
      if (types.indexOf(bag.type) < 0) types.push(bag.type);
    });
    wrap.innerHTML = "";
    [{ id: "all", name: t("bag.typeAll") }]
      .concat(
        types.map(function (id) {
          return { id: id, name: groupNameOf(id) };
        })
      )
      .forEach(function (item) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "chip small";
        btn.setAttribute("aria-pressed", String(bagState.type === item.id));
        btn.textContent = item.name;
        btn.addEventListener("click", function () {
          bagState.type = item.id;
          renderBagFilters();
          renderBagList();
        });
        wrap.appendChild(btn);
      });

    var tagSel = $("#bagTag");
    if (tagSel) {
      var prevTag = bagState.tag;
      tagSel.innerHTML =
        '<option value="all">' +
        esc(t("cafe.tagAll")) +
        "</option>" +
        TAG_KEYS.map(function (tag) {
          return '<option value="' + esc(tag) + '">' + esc(t("tag." + tag)) + "</option>";
        }).join("");
      tagSel.value = prevTag;
      bagState.tag = tagSel.value;
    }

    var caffWrap = $("#bagCaffChips");
    if (caffWrap) {
      caffWrap.innerHTML = "";
      [
        { id: "all", name: t("bag.caffAll") },
        { id: "yes", name: t("bag.caffeine") },
        { id: "no", name: t("bag.noCaffeine") }
      ].forEach(function (item) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "chip small";
        btn.setAttribute("aria-pressed", String(bagState.caffeine === item.id));
        btn.textContent = item.name;
        btn.addEventListener("click", function () {
          bagState.caffeine = item.id;
          renderBagFilters();
          renderBagList();
        });
        caffWrap.appendChild(btn);
      });
    }

    var segBag = $("#segBagCount");
    if (segBag) segBag.textContent = String(((FEATURE.bags && FEATURE.bags.bags) || []).length);
    var segLeaf = $("#segLeafCount");
    if (segLeaf) segLeaf.textContent = String(D.teas.length);
  }

  function bagCardHtml(bag) {
    var open = bagState.open === bag.id;
    var accent = "#B2762B";
    var g = null;
    for (var i = 0; i < D.groups.length; i++) if (D.groups[i].id === bag.type) g = D.groups[i];
    if (g) accent = g.accent;
    var tags = (bag.tags || [])
      .filter(function (tag) {
        return TAG_KEYS.indexOf(tag) >= 0;
      })
      .slice(0, 4)
      .map(function (tag) {
        return '<span class="tag">' + esc(t("tag." + tag)) + "</span>";
      })
      .join("");
    return (
      '<article class="bag-card' +
      (open ? " open" : "") +
      '" data-bag="' +
      esc(bag.id) +
      '">' +
      '<button class="bag-main" type="button" data-bag-toggle="' +
      esc(bag.id) +
      '" aria-expanded="' +
      open +
      '">' +
      '<span class="bag-top"><span class="bag-brand">' +
      esc(bagBrandLabel(bag)) +
      '</span><span class="bag-caff' +
      (bag.caffeine ? " on" : "") +
      '">' +
      esc(bag.caffeine ? t("bag.caffeine") : t("bag.noCaffeine")) +
      "</span></span>" +
      '<span class="bag-line"><b>' +
      esc(l10n(bag.name)) +
      "</b><span>" +
      esc(groupNameOf(bag.type)) +
      " · " +
      esc(bag.bag || "") +
      "</span></span>" +
      '<p class="bag-note">' +
      esc(l10n(bag.note)) +
      "</p>" +
      '<span class="bag-brew"><span>' +
      esc(t("bag.brew", { temp: bag.temp, dur: fmtDur(bag.seconds) })) +
      "</span><span class=\"bag-caret\"><svg width=\"15\" height=\"15\"><use href=\"#ic-caret\"/></svg></span></span>" +
      "</button>" +
      '<div class="bag-more"><div><div class="bag-more-inner">' +
      '<div class="detail"><h4>' +
      esc(t("bag.brewTitle")) +
      "</h4><p>" +
      esc(t("bag.brewLine", { temp: bag.temp, dur: fmtDur(bag.seconds) })) +
      '<em class="bag-src">' +
      esc(bag.brewSource === "brand" ? t("bag.sourceBrand") : t("bag.sourceCategory")) +
      "</em></p></div>" +
      (tags ? '<div class="detail"><h4>' + esc(t("bag.tagsTitle")) + "</h4><div class=\"tags\">" + tags + "</div></div>" : "") +
      '<div class="bag-actions">' +
      '<button class="btn btn-dark btn-block" type="button" data-bag-timer="' +
      esc(bag.id) +
      '"><svg width="15" height="15" style="vertical-align:-2px;margin-right:5px"><use href="#ic-timer"/></svg>' +
      esc(t("bag.toTimer")) +
      "</button>" +
      '<button class="btn btn-ghost btn-block" type="button" data-bag-guide="' +
      esc(bag.type) +
      '">' +
      esc(t("bag.toGuide")) +
      "</button>" +
      "</div></div></div></div>" +
      "</article>"
    );
  }

  function renderBagList() {
    var list = $("#bagList");
    if (!list) return;
    var bags = bagsOfState();
    var count = $("#bagCount");
    if (count) count.textContent = t("bag.count", { n: bags.length });
    if (!bags.length) {
      list.innerHTML = '<div class="empty">' + esc(t("bag.empty")) + "</div>";
      return;
    }
    list.innerHTML = bags.map(bagCardHtml).join("");

    $$("[data-bag-toggle]", list).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-bag-toggle");
        var card = list.querySelector('[data-bag="' + id + '"]');
        var wasOpen = card && card.classList.contains("open");
        bagState.open = wasOpen ? null : id;
        renderBagList();
      });
    });
    $$("[data-bag-timer]", list).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-bag-timer");
        var bag = null;
        ((FEATURE.bags && FEATURE.bags.bags) || []).forEach(function (b) {
          if (b.id === id) bag = b;
        });
        if (bag) setTimerBag(bag);
      });
    });
    $$("[data-bag-guide]", list).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var group = btn.getAttribute("data-bag-guide");
        var list2 = D.teasOf(group);
        if (list2.length) openTeaInGuide(list2[0].id);
      });
    });
  }

  function setTimerBag(bag) {
    var group = null;
    for (var i = 0; i < D.groups.length; i++) if (D.groups[i].id === bag.type) group = D.groups[i];
    timer.custom = {
      name: l10n(bag.name),
      brand: bagBrandName(bag),
      temp: bag.temp,
      seconds: bag.seconds,
      bag: bag.bag || "",
      group: bag.type,
      accent: group ? group.accent : "#B2762B",
      note: l10n(bag.note),
      rounds: t("bag.tabBag")
    };
    timer.steep = 1;
    timer.adjust = 0;
    renderBagMode();
    renderGroupChips();
    renderTeaChips();
    renderSteepRow();
    renderBrewInfo();
    resetTimer();
    go("timer");
    toast(t("toast.bagTimer", { name: timer.custom.name }));
  }

  function renderBagMode() {
    var bar = $("#bagModeBar");
    if (!bar) return;
    bar.hidden = !timer.custom;
    var text = $("#bagModeText");
    if (text && timer.custom) text.textContent = t("bag.timerOn", { name: timer.custom.name });
    var exit = $("#bagModeExit");
    if (exit && !exit.__bound) {
      exit.__bound = true;
      exit.addEventListener("click", function () {
        setTimerTea(timer.teaId || D.teas[0].id, 1);
        toast(t("bag.timerOff"));
      });
    }
  }

  /* ============================================================
     6. 찻집 찾기 — 파트너 우선 + 지역·취향 디렉터리
     ============================================================ */
  function cafeQuery() {
    return cafeState.q.trim().toLowerCase();
  }

  function cafeMatches(cafe) {
    var q = cafeQuery();
    if (cafeState.region !== "all" && cafe.region !== cafeState.region) return false;
    if (cafeState.tag !== "all" && (cafe.tasteTags || []).indexOf(cafeState.tag) < 0) return false;
    if (!q) return true;
    return (
      [anyText(cafe.name), anyText(cafe.regionName || {}), anyText(cafe.near), anyText(cafe.address), anyText(cafe.signature), anyText(cafe.desc)]
        .join(" ")
        .toLowerCase()
        .indexOf(q) >= 0
    );
  }

  function partnerMatches(shop) {
    var q = cafeQuery();
    if (cafeState.tag !== "all" && (shop.tasteTags || []).indexOf(cafeState.tag) < 0) return false;
    if (cafeState.region !== "all") {
      var reg = PARTNER_REGION[shop.slug];
      if (reg && reg !== cafeState.region) return false;
    }
    if (!q) return true;
    var hay = [anyText(shop.name), anyText(shop.region), anyText(shop.near), anyText(shop.address), anyText(shop.desc)]
      .concat(
        (shop.menus || []).map(function (m) {
          return anyText(m.name);
        })
      )
      .join(" ")
      .toLowerCase();
    return hay.indexOf(q) >= 0;
  }

  function renderRegionChips() {
    var wrap = $("#regionChips");
    if (!wrap || !FEATURE.cafes) return;
    wrap.innerHTML = "";
    [{ id: "all", name: t("cafe.regionAll") }]
      .concat(FEATURE.cafes.regions || [])
      .forEach(function (r) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "chip small";
        btn.setAttribute("aria-pressed", String(cafeState.region === r.id));
        btn.textContent = l10n(r.name);
        btn.addEventListener("click", function () {
          cafeState.region = r.id;
          renderRegionChips();
          renderPartnerShops();
          renderCafeList();
        });
        wrap.appendChild(btn);
      });
  }

  function renderCafeTagChips() {
    var wrap = $("#cafeTagChips");
    if (!wrap) return;
    wrap.innerHTML = "";
    [{ id: "all", name: t("cafe.tagAll") }]
      .concat(
        TAG_KEYS.map(function (tag) {
          return { id: tag, name: t("tag." + tag) };
        })
      )
      .forEach(function (item) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "chip small tag-chip";
        btn.setAttribute("aria-pressed", String(cafeState.tag === item.id));
        btn.textContent = item.name;
        btn.addEventListener("click", function () {
          cafeState.tag = item.id;
          renderCafeTagChips();
          renderPartnerShops();
          renderCafeList();
        });
        wrap.appendChild(btn);
      });
  }

  function renderPartnerShops() {
    var row = $("#partnerShops");
    var head = $("#partnerHead");
    var count = $("#partnerCount");
    if (!row) return;
    var shops = (PARTNER.shops || []).filter(partnerMatches).sort(function (a, b) {
      return (b.sponsor ? 1 : 0) - (a.sponsor ? 1 : 0) || (b.tier || 0) - (a.tier || 0);
    });
    if (!shops.length) {
      row.innerHTML = '<div class="empty">' + esc(t("cafe.empty")) + "</div>";
      if (head) head.hidden = false;
      if (count) count.textContent = t("cafe.count", { n: 0 });
      return;
    }
    if (head) head.hidden = false;
    if (count) count.textContent = t("cafe.partnerSub", { n: shops.length });
    row.innerHTML = shops.map(shopCardHtml).join("");
    bindShop(row);
  }

  function cafeCardHtml(cafe) {
    var open = cafeState.open === cafe.slug;
    var st = shopStatus(cafe);
    var stateText = st.key ? t("shop." + st.key, st.time ? { time: st.time } : null) : "";
    var stateCls = st.key === "open" ? " is-open" : "";
    var tags = (cafe.tasteTags || [])
      .filter(function (tag) {
        return TAG_KEYS.indexOf(tag) >= 0;
      })
      .slice(0, 3)
      .map(function (tag) {
        return '<span class="tag">' + esc(t("tag." + tag)) + "</span>";
      })
      .join("");
    var hoursRows = WEEK_ORDER.map(function (day) {
      var span = (cafe.hours || {})[day];
      var today = DAY_KEYS[seoulClock().day] === day;
      return (
        '<li' +
        (today ? ' class="today"' : "") +
        "><span>" +
        esc(t("weekday." + day)) +
        "</span><b>" +
        esc(span || t("shop.closedToday")) +
        "</b></li>"
      );
    }).join("");
    var links = cafe.links || {};
    var mapLinks = [
      ["naver", "NAVER"],
      ["kakao", "Kakao"],
      ["google", "Google"]
    ]
      .filter(function (m) {
        return links[m[0]];
      })
      .map(function (m) {
        return (
          '<a class="sc-maplink" href="' +
          esc(links[m[0]]) +
          '" target="_blank" rel="noopener">' +
          esc(m[1]) +
          "</a>"
        );
      })
      .join("");
    return (
      '<article class="cafe-card' +
      (open ? " open" : "") +
      '" data-cafe="' +
      esc(cafe.slug) +
      '">' +
      '<div class="cf-top"><span class="cf-cat' +
      (cafe.sponsor ? " top" : "") +
      '">' +
      esc(cafe.sponsor ? t("cafe.top") : l10n(cafe.categoryName)) +
      "</span>" +
      (stateText ? '<span class="sc-state' + stateCls + '">' + esc(stateText) + "</span>" : "") +
      "</div>" +
      '<b class="cf-name">' +
      esc(l10n(cafe.name)) +
      "</b>" +
      '<span class="cf-region">' +
      esc(l10n(cafe.regionName)) +
      " · " +
      esc(l10n(cafe.near)) +
      "</span>" +
      '<p class="cf-sign"><span>' +
      esc(t("cafe.signature")) +
      "</span>" +
      esc(l10n(cafe.signature)) +
      "</p>" +
      '<p class="cf-desc">' +
      esc(l10n(cafe.desc)) +
      "</p>" +
      (tags ? '<div class="cf-tags">' + tags + "</div>" : "") +
      '<div class="sc-actions">' +
      '<a class="sc-btn primary" href="' +
      esc(links.naver || links.google || "#") +
      '" target="_blank" rel="noopener"><svg width="14" height="14"><use href="#ic-pin"/></svg>' +
      esc(t("cafe.map")) +
      "</a>" +
      '<button class="sc-btn ghost" type="button" data-cafe-more="' +
      esc(cafe.slug) +
      '" aria-expanded="' +
      open +
      '">' +
      esc(open ? t("cafe.collapse") : t("cafe.detail")) +
      "</button>" +
      "</div>" +
      '<div class="sc-more" data-cafe-panel="' +
      esc(cafe.slug) +
      '"' +
      (open ? "" : " hidden") +
      ">" +
      "<h4>" +
      esc(t("cafe.hours")) +
      "</h4><ul class=\"sc-hours\">" +
      hoursRows +
      "</ul>" +
      (cafe.hoursNote ? '<p class="sc-note">' + esc(l10n(cafe.hoursNote)) + "</p>" : "") +
      "<h4>" +
      esc(t("cafe.address")) +
      "</h4><p class=\"sc-addr\">" +
      esc(l10n(cafe.address)) +
      "</p>" +
      (mapLinks ? '<div class="sc-maps">' + mapLinks + "</div>" : "") +
      (cafe.source ? '<p class="sc-note">' + esc(t("cafe.source")) + " · " + esc(cafe.source) + "</p>" : "") +
      "</div></article>"
    );
  }

  function renderCafeList() {
    var list = $("#cafeList");
    if (!list) return;
    var cafes = FEATURE.cafes
      ? (FEATURE.cafes.cafes || []).filter(cafeMatches).sort(function (a, b) {
          return (b.sponsor ? 1 : 0) - (a.sponsor ? 1 : 0);
        })
      : [];
    var count = $("#cafeCount");
    if (count) count.textContent = t("cafe.count", { n: cafes.length });
    var note = $("#cafeNote");
    if (note) note.textContent = FEATURE.cafes ? t("cafe.note") : "";
    if (!cafes.length) {
      list.innerHTML = '<div class="empty">' + esc(t("cafe.empty")) + "</div>";
      return;
    }
    list.innerHTML = cafes.map(cafeCardHtml).join("");
    $$("[data-cafe-more]", list).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var slug = btn.getAttribute("data-cafe-more");
        cafeState.open = cafeState.open === slug ? null : slug;
        renderCafeList();
      });
    });
  }

  /* ============================================================
     7. 커뮤니티 — 로컬 저장 + Supabase 어댑터
     ============================================================ */
  var SEED_POSTS = [
    {
      id: "seed-1",
      seed: true,
      type: "review",
      rating: 5,
      teaId: "blend-earlgrey",
      teaName: "얼그레이",
      nickname: "베르가못",
      body: "96도에서 3분. 우유를 넣기 전에 한 모금 마셔 보니 베르가못이 확 올라옵니다. 두 번째 우리는 4분이 딱이었어요.",
      likes: 14,
      helpful: 9,
      createdAt: Date.parse("2026-11-20T21:10:00+09:00"),
      lang: "ko"
    },
    {
      id: "seed-2",
      seed: true,
      type: "bag",
      rating: 4,
      bagId: "twinings-earl-grey",
      teaName: "트와이닝스 얼그레이",
      nickname: "주전자",
      body: "회사 탕비실에서 늘 마시는 티백. 95도 정수기 물에 3분 두면 향이 충분합니다. 우유를 넣으면 조금 눅눅해져서 저는 맨잔으로 마십니다.",
      likes: 8,
      helpful: 6,
      createdAt: Date.parse("2026-11-19T09:35:00+09:00"),
      lang: "ko"
    },
    {
      id: "seed-3",
      seed: true,
      type: "question",
      rating: 0,
      teaId: null,
      teaName: "",
      nickname: "첫잔",
      body: "녹차를 70도에서 우리라고 하는데 온도계가 없습니다. 끓인 물을 다른 컵에 한 번 옮기면 대략 몇 도쯤 될까요?",
      likes: 5,
      helpful: 11,
      createdAt: Date.parse("2026-11-18T18:20:00+09:00"),
      lang: "ko"
    },
    {
      id: "seed-4",
      seed: true,
      type: "bag",
      rating: 5,
      bagId: "osulloc-sejak",
      teaName: "오설록 세작 20입",
      nickname: "제주바람",
      body: "70도 1분 30초, 정확히 지켰더니 떫지 않고 견과 같은 단맛이 남습니다. 티백인데도 잎차 같은 결이 있어요.",
      likes: 21,
      helpful: 13,
      createdAt: Date.parse("2026-11-17T14:05:00+09:00"),
      lang: "ko"
    },
    {
      id: "seed-5",
      seed: true,
      type: "review",
      rating: 4,
      teaId: "green-hojicha",
      teaName: "호지차",
      nickname: "저녁차",
      body: "90도에서 1분 30초. 카페인이 낮아 밤에 마셔도 잠이 잘 옵니다. 우유를 조금 넣으면 고소함이 더 살아나요.",
      likes: 6,
      helpful: 4,
      createdAt: Date.parse("2026-11-15T22:40:00+09:00"),
      lang: "ko"
    }
  ];

  function loadPosts() {
    var raw = storeGet(POSTS_KEY, []);
    return Array.isArray(raw) ? raw : [];
  }
  function savePosts(list) {
    storeSet(POSTS_KEY, list);
  }
  function loadReactions() {
    var raw = storeGet(REACT_KEY, {});
    return raw && typeof raw === "object" ? raw : {};
  }
  function saveReactions(map) {
    storeSet(REACT_KEY, map);
  }

  function allPosts() {
    return SEED_POSTS.concat(loadPosts()).sort(function (a, b) {
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }

  function postTypeLabel(type) {
    if (type === "bag") return t("comm.typeBag");
    if (type === "question") return t("comm.typeQ");
    return t("comm.typeReview");
  }

  function postHtml(p) {
    var react = loadReactions()[p.id] || {};
    var likeN = (p.likes || 0) + (react.like ? 1 : 0);
    var helpN = (p.helpful || 0) + (react.help ? 1 : 0);
    var subject = p.teaName || "";
    return (
      '<article class="post" data-post="' +
      esc(p.id) +
      '">' +
      '<div class="post-top"><span class="post-type ' +
      esc(p.type) +
      '">' +
      esc(postTypeLabel(p.type)) +
      "</span>" +
      (p.rating ? '<span class="post-stars">' + esc(starsMark(p.rating)) + "</span>" : "") +
      (p.seed ? '<span class="post-badge">' + esc(t("comm.sample")) + "</span>" : '<span class="post-badge mine">' + esc(t("comm.mine")) + "</span>") +
      "</div>" +
      (subject ? '<b class="post-subject">' + esc(subject) + "</b>" : "") +
      '<p class="post-body">' +
      esc(p.body).replace(/\n/g, "<br />") +
      "</p>" +
      '<div class="post-foot"><span class="post-nick">' +
      esc(p.nickname) +
      "</span><span class=\"post-date\">" +
      esc(p.createdAt ? L.fmtDateTime(lang, p.createdAt) : "") +
      '</span></div><div class="post-actions">' +
      '<button class="re-btn' +
      (react.like ? " on" : "") +
      '" type="button" data-react="like" data-id="' +
      esc(p.id) +
      '" aria-pressed="' +
      (!!react.like) +
      '"><svg width="14" height="14"><use href="#ic-heart"/></svg><span>' +
      esc(t("comm.like")) +
      " " +
      likeN +
      "</span></button>" +
      '<button class="re-btn' +
      (react.help ? " on" : "") +
      '" type="button" data-react="help" data-id="' +
      esc(p.id) +
      '" aria-pressed="' +
      (!!react.help) +
      '"><svg width="14" height="14"><use href="#ic-thumb"/></svg><span>' +
      esc(t("comm.helpful")) +
      " " +
      helpN +
      "</span></button>" +
      (!p.seed
        ? '<button class="re-btn del" type="button" data-post-del="' + esc(p.id) + '">' + esc(t("comm.delete")) + "</button>"
        : "") +
      "</div></article>"
    );
  }

  function renderCommFilters() {
    var wrap = $("#commFilterChips");
    if (!wrap) return;
    var items = [
      { id: "all", name: t("comm.filterAll") },
      { id: "review", name: t("comm.filterReview") },
      { id: "bag", name: t("comm.filterBag") },
      { id: "question", name: t("comm.filterQ") }
    ];
    wrap.innerHTML = "";
    items.forEach(function (item) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip small";
      btn.setAttribute("aria-pressed", String(commState.filter === item.id));
      btn.textContent = item.name;
      btn.addEventListener("click", function () {
        commState.filter = item.id;
        renderCommFilters();
        renderPostList();
      });
      wrap.appendChild(btn);
    });
  }

  function renderPostList() {
    var list = $("#postList");
    if (!list) return;
    var posts = allPosts().filter(function (p) {
      return commState.filter === "all" || p.type === commState.filter;
    });
    var note = $("#commDemoNote");
    if (note) {
      var server = window.TeaFaiSupabase && window.TeaFaiSupabase.isConfigured && window.TeaFaiSupabase.isConfigured();
      note.innerHTML =
        "<b>" +
        esc(t("comm.demoTitle")) +
        "</b><span>" +
        esc(t("comm.demoBody")) +
        "</span><em>" +
        esc(server ? t("comm.server") : t("comm.local")) +
        "</em>";
    }
    if (!posts.length) {
      list.innerHTML = '<div class="empty">' + esc(t("comm.empty")) + "</div>";
      return;
    }
    list.innerHTML = posts.map(postHtml).join("");
  }

  function renderPostForm() {
    var typeWrap = $("#postTypeChips");
    if (!typeWrap) return;
    var items = [
      { id: "review", name: t("comm.typeReview") },
      { id: "bag", name: t("comm.typeBag") },
      { id: "question", name: t("comm.typeQ") }
    ];
    typeWrap.innerHTML = "";
    items.forEach(function (item) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip small";
      btn.setAttribute("aria-pressed", String(commState.type === item.id));
      btn.textContent = item.name;
      btn.addEventListener("click", function () {
        commState.type = item.id;
        renderPostForm();
      });
      typeWrap.appendChild(btn);
    });

    var ratingField = $("#postRatingField");
    if (ratingField) ratingField.hidden = commState.type === "question";

    var row = $("#postStarRow");
    if (row) {
      row.innerHTML = "";
      for (var i = 1; i <= 5; i++) {
        (function (v) {
          var b = document.createElement("button");
          b.type = "button";
          b.className = "star" + (v <= commState.rating ? " on" : "");
          b.textContent = "★";
          b.setAttribute("aria-label", t("a11y.star", { n: v }));
          b.setAttribute("aria-pressed", String(v <= commState.rating));
          b.addEventListener("click", function () {
            commState.rating = v;
            renderPostForm();
          });
          row.appendChild(b);
        })(i);
      }
      var label = document.createElement("span");
      label.className = "stars-num";
      label.textContent = commState.rating ? commState.rating + ".0" : t("notes.starNone");
      row.appendChild(label);
    }

    var sel = $("#postSubject");
    if (sel) {
      var prev = sel.value;
      var html = '<option value="">' + esc(t("comm.subjectNone")) + "</option>";
      D.groups.forEach(function (g) {
        html += '<optgroup label="' + esc(g.name) + '">';
        D.teasOf(g.id).forEach(function (tea) {
          html += '<option value="tea:' + esc(tea.id) + '">' + esc(tea.name) + "</option>";
        });
        html += "</optgroup>";
      });
      html += '<optgroup label="' + esc(t("comm.subjectBag")) + '">';
      ((FEATURE.bags && FEATURE.bags.bags) || []).forEach(function (bag) {
        html += '<option value="bag:' + esc(bag.id) + '">' + esc(bagBrandName(bag) + " · " + l10n(bag.name)) + "</option>";
      });
      html += "</optgroup>";
      sel.innerHTML = html;
      sel.value = prev || "";
    }
  }

  function bindCommunity() {
    var writeBtn = $("#commWriteBtn");
    var form = $("#postForm");
    var cancel = $("#postCancel");
    if (writeBtn && form) {
      writeBtn.addEventListener("click", function () {
        form.hidden = !form.hidden;
        renderPostForm();
        if (!form.hidden) {
          form.scrollIntoView({ behavior: "smooth", block: "nearest" });
          var nick = $("#postNick");
          if (nick) nick.focus();
        }
      });
    }
    if (cancel && form) {
      cancel.addEventListener("click", function () {
        form.hidden = true;
      });
    }
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var nick = ($("#postNick").value || "").trim();
        var body = ($("#postBody").value || "").trim();
        if (!nick || !body) {
          toast(t("comm.required"));
          return;
        }
        var isQ = commState.type === "question";
        if (!isQ && !commState.rating) {
          toast(t("comm.required"));
          return;
        }
        var subj = $("#postSubject").value || "";
        var teaId = null;
        var bagId = null;
        var teaName = "";
        if (subj.indexOf("tea:") === 0) {
          teaId = subj.slice(4);
          teaName = D.byId(teaId).name;
        } else if (subj.indexOf("bag:") === 0) {
          bagId = subj.slice(4);
          ((FEATURE.bags && FEATURE.bags.bags) || []).forEach(function (b) {
            if (b.id === bagId) teaName = bagBrandName(b) + " · " + l10n(b.name);
          });
        }
        if (!isQ && !teaId && !bagId) {
          toast(t("comm.pick"));
          return;
        }
        var post = {
          id: "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          type: commState.type,
          rating: isQ ? 0 : commState.rating,
          teaId: teaId,
          bagId: bagId,
          teaName: teaName,
          nickname: nick.slice(0, 20),
          body: body.slice(0, 300),
          likes: 0,
          helpful: 0,
          createdAt: Date.now(),
          lang: lang
        };
        var list = loadPosts();
        list.push(post);
        savePosts(list);
        if (window.TeaFaiSupabase && window.TeaFaiSupabase.isConfigured && window.TeaFaiSupabase.isConfigured()) {
          window.TeaFaiSupabase.submitPost(post).then(function (res) {
            if (res && res.ok) renderPostList();
          });
        }
        $("#postBody").value = "";
        $("#postSubject").value = "";
        commState.rating = 0;
        form.hidden = true;
        renderPostForm();
        renderPostList();
        toast(t("comm.posted"));
      });
    }

    var list = $("#postList");
    if (list) {
      list.addEventListener("click", function (e) {
        var reactBtn = e.target.closest ? e.target.closest("[data-react]") : null;
        if (reactBtn) {
          var id = reactBtn.getAttribute("data-id");
          var kind = reactBtn.getAttribute("data-react");
          var map = loadReactions();
          if (!map[id]) map[id] = {};
          if (kind === "like") map[id].like = !map[id].like;
          else map[id].help = !map[id].help;
          saveReactions(map);
          renderPostList();
          return;
        }
        var delBtn = e.target.closest ? e.target.closest("[data-post-del]") : null;
        if (delBtn) {
          var pid = delBtn.getAttribute("data-post-del");
          savePosts(
            loadPosts().filter(function (p) {
              return p.id !== pid;
            })
          );
          var map2 = loadReactions();
          delete map2[pid];
          saveReactions(map2);
          renderPostList();
          toast(t("comm.deleted"));
        }
      });
    }
  }

  /* ============================================================
     8. 업체 입점 신청 — 월정액 플랜 + 로컬 저장/메일 전달
     ============================================================ */
  function planById(id) {
    var plans = (FEATURE.plans && FEATURE.plans.plans) || [];
    for (var i = 0; i < plans.length; i++) if (plans[i].id === id) return plans[i];
    return plans[0] || null;
  }

  function wonPlain(n) {
    return Number(n || 0).toLocaleString("en-US");
  }

  function renderApplyMeta() {
    var plans = (FEATURE.plans && FEATURE.plans.plans) || [];
    if (!applyState.plan && plans.length) applyState.plan = plans[0].id;

    var sub = $("#applyBarSub");
    if (sub && plans.length) sub.textContent = t("cafe.applySub", { price: wonPlain(plans[0].price) });

    var box = $("#applyPlans");
    if (box) {
      box.innerHTML = plans
        .map(function (plan) {
          var on = applyState.plan === plan.id;
          return (
            '<label class="plan-card' +
            (on ? " on" : "") +
            '"><input type="radio" name="applyPlan" value="' +
            esc(plan.id) +
            '"' +
            (on ? " checked" : "") +
            " />" +
            '<span class="plan-head"><b>' +
            esc(l10n(plan.name)) +
            "</b><em>" +
            esc(t("apply.planMonthly", { price: wonPlain(plan.price) })) +
            "</em></span>" +
            '<span class="plan-sum">' +
            esc(l10n(plan.summary)) +
            "</span><ul>" +
            (plan.features || [])
              .map(function (f) {
                return "<li>" + esc(l10n(f)) + "</li>";
              })
              .join("") +
            "</ul>" +
            (on ? '<span class="plan-on">' + esc(t("apply.selected")) + "</span>" : "") +
            "</label>"
          );
        })
        .join("");
      $$("input[name=applyPlan]", box).forEach(function (input) {
        input.addEventListener("change", function () {
          applyState.plan = input.value;
          renderApplyMeta();
        });
      });
    }

    var vat = $("#applyVatNote");
    if (vat) vat.textContent = FEATURE.plans ? l10n(FEATURE.plans.vatNote) : "";

    var steps = $("#applySteps");
    if (steps) {
      steps.innerHTML = ((FEATURE.plans && FEATURE.plans.steps) || [])
        .map(function (s) {
          return (
            '<li><span class="step-no">' +
            esc(s.no || "") +
            "</span><div><b>" +
            esc(l10n(s.title)) +
            "</b><p>" +
            esc(l10n(s.desc)) +
            "</p></div></li>"
          );
        })
        .join("");
    }

    var promo = $("#applyPromo");
    if (promo) {
      var p = FEATURE.plans && FEATURE.plans.promotion;
      var on = p && p.active && l10n(p.text);
      promo.hidden = !on;
      promo.textContent = on ? l10n(p.text) : "";
    }

    renderMyApps();

    var tagWrap = $("#applyTags");
    if (tagWrap) {
      tagWrap.innerHTML = "";
      TAG_KEYS.forEach(function (tag) {
        var on = applyState.tags.indexOf(tag) >= 0;
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "chip small";
        btn.setAttribute("aria-pressed", String(on));
        btn.textContent = t("tag." + tag);
        btn.addEventListener("click", function () {
          var at = applyState.tags.indexOf(tag);
          if (at >= 0) applyState.tags.splice(at, 1);
          else applyState.tags.push(tag);
          renderApplyMeta();
        });
        tagWrap.appendChild(btn);
      });
    }
  }

  function renderMyApps() {
    var box = $("#myApps");
    if (!box) return;
    var list = storeGet(APPS_KEY, []);
    if (!Array.isArray(list) || !list.length) {
      box.hidden = true;
      box.innerHTML = "";
      return;
    }
    box.hidden = false;
    box.innerHTML =
      '<b class="my-apps-title">' +
      esc(t("apply.myApps")) +
      "</b>" +
      list
        .slice(-3)
        .reverse()
        .map(function (a) {
          return (
            '<div class="my-app"><span class="ma-name">' +
            esc(a.shopName || "") +
            "</span><span class='ma-plan'>" +
            esc(a.planName || "") +
            "</span><span class='ma-date'>" +
            esc(a.createdAt ? L.fmtDateTime(lang, a.createdAt) : "") +
            "</span></div>"
          );
        })
        .join("");
  }

  function openApply(planId) {
    var modal = $("#applyModal");
    if (!modal) return;
    if (planId && planById(planId)) applyState.plan = planId;
    applyState.result = null;
    var result = $("#applyResult");
    if (result) {
      result.hidden = true;
      result.innerHTML = "";
    }
    renderApplyMeta();
    modal.hidden = false;
    document.body.classList.add("modal-open");
    var body = $("#applyBody");
    if (body) body.scrollTop = 0;
    var sheet = $(".sheet", modal);
    if (sheet) {
      sheet.setAttribute("tabindex", "-1");
      sheet.focus({ preventScroll: true });
    }
  }

  function closeApply() {
    var modal = $("#applyModal");
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove("modal-open");
  }

  function applyFormState() {
    var plan = planById(applyState.plan);
    return {
      planId: plan ? plan.id : "",
      planName: plan ? l10n(plan.name) : "",
      planPrice: plan ? plan.price : "",
      shopName: ($("#applyShopName") || {}).value || "",
      ownerName: ($("#applyOwner") || {}).value || "",
      region: ($("#applyRegion") || {}).value || "",
      address: ($("#applyAddress") || {}).value || "",
      menu: ($("#applyMenu") || {}).value || "",
      tags: applyState.tags.slice(),
      hours: ($("#applyHours") || {}).value || "",
      contact: ($("#applyContact") || {}).value || "",
      links: ($("#applyLinks") || {}).value || "",
      memo: ($("#applyMemo") || {}).value || ""
    };
  }

  function applySummaryText(app) {
    var L1 = [];
    L1.push("[" + t("apply.title") + "]");
    L1.push(
      t("apply.planLabel") +
        ": " +
        app.planName +
        " (" +
        t("apply.planMonthly", { price: wonPlain(app.planPrice) }) +
        ", " +
        l10n(FEATURE.plans && FEATURE.plans.vatNote) +
        ")"
    );
    L1.push(t("apply.shopName") + ": " + app.shopName);
    L1.push(t("apply.owner") + ": " + app.ownerName);
    L1.push(t("apply.region") + ": " + app.region);
    L1.push(t("apply.address") + ": " + app.address);
    L1.push(t("apply.menu") + ": " + app.menu);
    L1.push(t("apply.hours") + ": " + app.hours);
    L1.push(
      t("apply.tags") +
        ": " +
        app.tags
          .map(function (tag) {
            return t("tag." + tag);
          })
          .join(", ")
    );
    L1.push(t("apply.contact") + ": " + app.contact);
    L1.push(t("apply.links") + ": " + app.links);
    L1.push(t("apply.memo") + ": " + app.memo);
    return L1.join("\n");
  }

  function copyText(text) {
    var done = function (ok) {
      toast(ok ? t("apply.copied") : t("apply.error"));
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(function () {
          done(true);
        })
        .catch(function () {
          fallbackCopy(text, done);
        });
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, done) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand("copy");
      document.body.removeChild(ta);
      done(ok);
    } catch (e) {
      done(false);
    }
  }

  function showApplyResult(app, mode) {
    var box = $("#applyResult");
    if (!box) return;
    var text = applySummaryText(app);
    applyState.result = { app: app, mode: mode, text: text };
    var mail = "mailto:" + ((FEATURE.plans && FEATURE.plans.contactEmail) || "rotroka@naver.com");
    mail += "?subject=" + encodeURIComponent("[" + t("apply.title") + "] " + app.shopName);
    mail += "&body=" + encodeURIComponent(text);
    box.hidden = false;
    box.innerHTML =
      '<div class="ar-head"><span class="ar-check"><svg width="16" height="16"><use href="#ic-check"/></svg></span><b>' +
      esc(t("apply.ok")) +
      "</b></div><p>" +
      esc(mode === "server" ? t("apply.serverOk") : t("apply.localOk")) +
      "</p><h4>" +
      esc(t("apply.summary")) +
      '</h4><pre class="ar-summary">' +
      esc(text) +
      '</pre><div class="ar-actions">' +
      '<button class="btn btn-dark" type="button" id="applyCopy">' +
      esc(t("apply.copy")) +
      "</button>" +
      '<a class="btn btn-outline" href="' +
      esc(mail) +
      '">' +
      esc(t("apply.mail")) +
      "</a>" +
      '<button class="btn btn-ghost" type="button" id="applyEdit">' +
      esc(t("apply.again")) +
      "</button></div>";
    var copyBtn = $("#applyCopy");
    if (copyBtn)
      copyBtn.addEventListener("click", function () {
        copyText(text);
      });
    var edit = $("#applyEdit");
    if (edit)
      edit.addEventListener("click", function () {
        box.hidden = true;
      });
    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function bindApply() {
    $$("[data-apply-open]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        openApply();
      });
    });
    $$("[data-apply-close]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        closeApply();
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        var modal = $("#applyModal");
        if (modal && !modal.hidden) closeApply();
      }
    });

    var form = $("#applyForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var app = applyFormState();
      if (
        !app.shopName.trim() ||
        !app.ownerName.trim() ||
        !app.contact.trim() ||
        app.contact.trim().length < 5 ||
        !app.address.trim()
      ) {
        toast(t("apply.error"));
        return;
      }
      app.shopName = app.shopName.trim().slice(0, 80);
      app.ownerName = app.ownerName.trim().slice(0, 40);
      app.address = app.address.trim().slice(0, 200);

      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      var finishLocal = function () {
        var list = storeGet(APPS_KEY, []);
        if (!Array.isArray(list)) list = [];
        app.id = "a" + Date.now().toString(36);
        app.createdAt = Date.now();
        app.status = "pending";
        list.push(app);
        storeSet(APPS_KEY, list);
        renderMyApps();
        showApplyResult(app, "local");
        toast(t("apply.ok"));
        if (submitBtn) submitBtn.disabled = false;
      };

      if (window.TeaFaiSupabase && window.TeaFaiSupabase.isConfigured && window.TeaFaiSupabase.isConfigured()) {
        window.TeaFaiSupabase.submitApplication(app).then(function (res) {
          if (res && res.ok) {
            showApplyResult(app, "server");
            toast(t("apply.ok"));
            if (submitBtn) submitBtn.disabled = false;
          } else {
            finishLocal();
          }
        });
      } else {
        finishLocal();
      }
    });
  }

  function initGuideTabs() {
    $$("[data-guide-tab]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        openGuideTab(btn.getAttribute("data-guide-tab"));
      });
    });
    var bagInput = $("#bagSearchInput");
    if (bagInput) {
      bagInput.addEventListener("input", function () {
        bagState.q = bagInput.value;
        renderBagList();
      });
    }
    var brandSel = $("#bagBrand");
    if (brandSel) {
      brandSel.addEventListener("change", function () {
        bagState.brand = brandSel.value;
        renderBagList();
      });
    }
    var tagSel = $("#bagTag");
    if (tagSel) {
      tagSel.addEventListener("change", function () {
        bagState.tag = tagSel.value;
        renderBagList();
      });
    }
    var cafeInput = $("#cafeSearchInput");
    if (cafeInput) {
      cafeInput.addEventListener("input", function () {
        cafeState.q = cafeInput.value;
        renderPartnerShops();
        renderCafeList();
      });
    }
    openGuideTab(guideState.tab || "leaf", false);
  }

  function openGuideTab(tab, navigate) {
    guideState.tab = tab === "bag" ? "bag" : "leaf";
    var leafPanel = $("#leafPanel");
    var bagPanel = $("#bagPanel");
    if (leafPanel) leafPanel.hidden = guideState.tab !== "leaf";
    if (bagPanel) bagPanel.hidden = guideState.tab !== "bag";
    $$("[data-guide-tab]").forEach(function (btn) {
      var on = btn.getAttribute("data-guide-tab") === guideState.tab;
      btn.classList.toggle("active", on);
      btn.setAttribute("aria-pressed", String(on));
    });
    if (guideState.tab === "bag") renderBagList();
    else renderTeaList();
    if (navigate !== false && currentView !== "guide") go("guide");
  }

  /* ============================================================
     언어 전환 · 시작
     ============================================================ */
  function rerender() {
    renderHomeDate();
    renderMoodChips();
    renderReco();
    renderRecentNote();
    renderGroupChips();
    renderTeaChips();
    renderSteepRow();
    renderBrewInfo();
    renderMute();
    renderTimerText();
    renderFilterChips();
    renderTeaList();
    renderNoteSelect();
    renderStarRow();
    renderNotes();
    renderHomeShops();
    renderDoneExtra();
    renderBagFilters();
    renderBagList();
    renderRegionChips();
    renderCafeTagChips();
    renderPartnerShops();
    renderCafeList();
    renderCommFilters();
    renderPostForm();
    renderPostList();
    renderApplyMeta();
    renderBagMode();
    if (currentView === "quiz") renderQuiz();
    document.title = titleFor(currentView);
  }

  function setLang(next) {
    var picked = L.normalize(next);
    if (!picked || picked === lang) return;
    lang = picked;
    L.save(lang);
    L.applyStatic(lang);
    L.setDocumentLang(lang);
    D.use(lang);
    L.mountSwitcher($("#langSwitch"), lang, setLang);
    rerender();
  }

  function init() {
    L.applyStatic(lang);
    L.setDocumentLang(lang);
    D.use(lang);
    L.mountSwitcher($("#langSwitch"), lang, setLang);

    renderHomeDate();
    homeState.mood = defaultMoodId();
    renderMoodChips();
    renderReco();
    renderRecentNote();

    var lastTea = storeGet(LAST_TEA_KEY, null);
    var startId = lastTea && D.byId(lastTea).id === lastTea ? lastTea : D.teas[0].id;
    timer.teaId = startId;
    timer.groupId = D.byId(startId).group;
    renderGroupChips();
    renderTeaChips();
    renderSteepRow();
    renderBrewInfo();
    renderMute();
    resetTimer();
    bindTimer();

    renderFilterChips();
    var input = $("#searchInput");
    if (input) {
      input.addEventListener("input", function () {
        guideState.q = input.value;
        renderTeaList();
      });
    }
    renderTeaList();

    renderNoteSelect();
    renderStarRow();
    renderNotes();
    renderCommFilters();
    initGuideTabs();
    bindCommunity();
    bindApply();
    bindQuiz();
    $("#noteForm").addEventListener("submit", submitNote);
    loadPartnerData();
    loadFeatureData();

    document.title = titleFor(currentView);

    var hash = (location.hash || "").replace("#", "");
    if (hash === "quiz") openQuiz();
    else if (VIEWS.indexOf(hash) >= 0 && hash !== "home") go(hash);
    window.addEventListener("hashchange", function () {
      var h = (location.hash || "").replace("#", "");
      if (h === "quiz") openQuiz();
      else if (VIEWS.indexOf(h) >= 0) go(h);
    });

    if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("sw.js").catch(function () {});
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
