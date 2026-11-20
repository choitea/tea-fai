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
  var VIEWS = ["home", "timer", "guide", "notes"];

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
      var on = tab.getAttribute("data-view") === view;
      tab.classList.toggle("active", on);
      if (on) tab.setAttribute("aria-current", "page");
      else tab.removeAttribute("aria-current");
    });
    document.title = titleFor(view);
    window.scrollTo(0, 0);
    if (view === "home") renderRecentNote();
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
    audio: null
  };

  function timerTea() {
    return D.byId(timer.teaId || "green-longjing");
  }
  function maxSteep() {
    return Math.min(3, timerTea().maxSteep || 3);
  }
  function baseSeconds() {
    var tea = timerTea();
    return tea.steeps[clamp(timer.steep, 1, tea.steeps.length) - 1];
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
    var tea = timerTea();
    wrap.innerHTML = "";
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
          esc(fmtDur(tea.steeps[idx - 1])) +
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
    var tea = timerTea();
    $("#ringTime").textContent = fmtClock(timer.remaining);
    $("#ringTea").textContent = t("timer.ring", { name: tea.name, n: timer.steep });
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
    circle.style.stroke = timer.done ? "#B97A3D" : tea.accent;

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

    var note = tea.steepBasis || "";
    if (timer.steep > maxSteep() && tea.steepBasis) {
      note = t("timer.thirdNote", { basis: tea.steepBasis });
    }
    $("#steepNote").textContent = note;
  }

  function renderBrewInfo() {
    var tea = timerTea();
    $("#panelTemp").textContent = tea.tempRange;
    var rows = [
      [t("info.temp"), t("info.tempValue", { range: tea.tempRange, temp: tea.temp })],
      [t("info.leaf"), t("info.leafValue", { leaf: tea.leaf, water: tea.water, ratio: tea.ratioNote || "" })],
      [t("info.rounds"), tea.rounds || ""],
      [t("info.this"), t("info.thisValue", { dur: fmtDur(baseSeconds()), base: fmtDur(tea.steeps[0]) })],
      [t("info.tip"), tea.brewTip || ""]
    ];
    if (tea.group === "dark") rows.splice(3, 0, [t("info.rinse"), t("rinse.dark")]);
    if (tea.group === "oolong") rows.splice(3, 0, [t("info.rinse"), t("rinse.oolong")]);
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
  }

  function setTimerTea(id, steep) {
    var tea = D.byId(id);
    timer.teaId = tea.id;
    timer.groupId = tea.group;
    timer.steep = steep || 1;
    timer.adjust = 0;
    storeSet(LAST_TEA_KEY, tea.id);
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
    toast(t("toast.done", { name: timerTea().name, n: timer.steep }));
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
    if (item.sub && item.sub !== native) nativeLine.push(esc(item.sub));

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
    $("#noteForm").addEventListener("submit", submitNote);

    document.title = titleFor(currentView);

    var hash = (location.hash || "").replace("#", "");
    if (VIEWS.indexOf(hash) >= 0 && hash !== "home") go(hash);
    window.addEventListener("hashchange", function () {
      var h = (location.hash || "").replace("#", "");
      if (VIEWS.indexOf(h) >= 0) go(h);
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
