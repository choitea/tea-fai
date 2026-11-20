/* ============================================================
   티키피디아(Teakipedia) — Supabase 연결 어댑터
   · 지금은 설정이 비어 있어 모든 요청이 "로컬 모드"로 떨어집니다.
     앱은 localStorage 로 그대로 동작하고, 아래 값을 채우면
     같은 화면이 서버 저장으로 바뀝니다.
   · 테이블 정의는 tea_fai_platform/schema.sql 과 맞춰 두었습니다.
       커뮤니티 글  → public.community_posts   (§15)
       입점 신청    → public.shop_applications (§6)
   · anon 키는 공개되어도 되는 키지만, 쓰기 권한은 RLS 정책으로만
     열립니다. 서버를 붙일 때는 schema.sql 의 정책을 먼저 적용하세요.
   ============================================================ */
window.SUPABASE_CONFIG = {
  url: "https://zbjvwvaluywjxzvnohcv.supabase.co",
  anonKey: "sb_publishable_HtZSSUA4WzFwY3SrskQeEw_rBjlhuUn",  // 공개용 publishable 키 (RLS 로만 쓰기 허용)
  enabled: true,      // true 이고 url·anonKey 가 있으면 서버 모드
  tables: {
    posts: "community_posts",
    applications: "shop_applications"
  },
  timeoutMs: 8000
};

window.TeaFaiSupabase = (function () {
  "use strict";

  function cfg() {
    return window.SUPABASE_CONFIG;
  }

  function isConfigured() {
    var c = cfg();
    return !!(c && c.enabled && c.url && c.anonKey);
  }

  function endpoint(table, query) {
    return String(cfg().url).replace(/\/+$/, "") + "/rest/v1/" + table + (query || "");
  }

  function headers(extra) {
    var h = {
      apikey: cfg().anonKey,
      Authorization: "Bearer " + cfg().anonKey,
      "Content-Type": "application/json",
      Accept: "application/json"
    };
    for (var k in extra || {}) h[k] = extra[k];
    return h;
  }

  /* 서버가 느리거나 막혀도 화면이 멈추지 않도록 시간 제한을 둡니다 */
  function request(method, table, body, query, prefer) {
    if (!isConfigured()) {
      return Promise.resolve({ ok: false, mode: "local", reason: "not_configured" });
    }
    if (typeof fetch !== "function") {
      return Promise.resolve({ ok: false, mode: "local", reason: "no_fetch" });
    }
    var ctrl = null;
    var timer = null;
    try {
      ctrl = new AbortController();
      timer = window.setTimeout(function () {
        if (ctrl) ctrl.abort();
      }, cfg().timeoutMs || 6000);
    } catch (e) {
      ctrl = null;
    }
    return fetch(endpoint(table, query), {
      method: method,
      headers: headers({ Prefer: prefer || "return=representation" }),
      body: body == null ? undefined : JSON.stringify(body),
      signal: ctrl ? ctrl.signal : undefined
    })
      .then(function (res) {
        if (timer) window.clearTimeout(timer);
        if (!res.ok) {
          return res.text().then(function (text) {
            return {
              ok: false,
              mode: "server_error",
              status: res.status,
              reason: text ? text.slice(0, 300) : "http_" + res.status
            };
          });
        }
        return res.text().then(function (text) {
          var data = null;
          try {
            data = text ? JSON.parse(text) : null;
          } catch (e) {
            data = null;
          }
          return { ok: true, mode: "server", data: data };
        });
      })
      .catch(function (err) {
        if (timer) window.clearTimeout(timer);
        return {
          ok: false,
          mode: "network_error",
          reason: (err && err.name === "AbortError" ? "timeout" : String(err && err.message ? err.message : err))
        };
      });
  }

  /* ---------- 커뮤니티 글 ---------- */
  /* 앱의 글 한 건을 community_posts 행으로 옮깁니다. */
  function postRow(post) {
    var p = post || {};
    var rating = Number(p.rating);
    return {
      client_id: String(p.id || ""),
      post_type: p.type === "bag" ? "bag" : p.type === "question" ? "question" : "review",
      rating: p.type === "question" || !rating ? null : Math.max(1, Math.min(5, rating)),
      tea_id: p.teaId || null,
      teabag_id: p.bagId || null,
      tea_name: String(p.teaName || "").slice(0, 120) || null,
      nickname: String(p.nickname || "").slice(0, 20),
      body: String(p.body || "").slice(0, 1000),
      lang: p.lang || "ko",
      status: "published"
    };
  }

  /* teas 카탈로그(93종)가 시드되어 있는지 한 번만 확인해 둡니다.
     비어 있는 동안에는 tea_id 를 보내지 않아 외래키 오류 없이 저장됩니다. */
  var teaCatalog = null;
  function hasTeaCatalog() {
    if (!teaCatalog) {
      teaCatalog = request("GET", "teas", null, "?select=id&limit=1").then(function (res) {
        if (res && res.ok) return !!(res.data && res.data.length);
        return null; // 판단할 수 없으면 서버에 맡기고 폴백을 씁니다
      });
    }
    return teaCatalog;
  }

  function submitPost(post) {
    var row = postRow(post);
    var ready = row.tea_id ? hasTeaCatalog() : Promise.resolve(null);
    return ready
      .then(function (hasTeas) {
        if (hasTeas === false) delete row.tea_id;
        return request("POST", cfg().tables.posts, row);
      })
      .then(function (res) {
        /* 카탈로그 상태를 알 수 없을 때를 대비한 안전망:
           외래키(23503) 에 걸리면 차 이름만 남기고 다시 저장합니다. */
        if (res && !res.ok && row.tea_id && (res.status === 409 || res.status === 400) &&
            /23503|foreign key/i.test(String(res.reason || ""))) {
          var retry = {};
          for (var k in row) if (k !== "tea_id") retry[k] = row[k];
          return request("POST", cfg().tables.posts, retry);
        }
        return res;
      });
  }

  /* 공개 글 읽기 — 최신순. 실패하면 로컬 글만 보여 줍니다. */
  function fetchPosts(limit) {
    var q =
      "?select=client_id,post_type,rating,tea_id,teabag_id,tea_name,nickname,body,likes,helpful,created_at" +
      "&status=eq.published&order=created_at.desc&limit=" +
      (limit || 100);
    return request("GET", cfg().tables.posts, null, q);
  }

  /* ---------- 입점 신청 ---------- */
  /* 신청서 한 건을 shop_applications 행으로 옮깁니다.
     플랜·영업시간·태그·링크는 아직 전용 컬럼이 없어 message 에 함께 적습니다. */
  function applicationRow(app) {
    var a = app || {};
    var lines = [];
    if (a.planName) lines.push("[플랜] " + a.planName + (a.planPrice ? " / 월 " + a.planPrice + "원" : ""));
    if (a.hours) lines.push("[영업시간] " + a.hours);
    if (a.menu) lines.push("[대표 차] " + a.menu);
    if (a.tags && a.tags.length) lines.push("[취향 태그] " + a.tags.join(", "));
    if (a.links) lines.push("[SNS·지도] " + a.links);
    if (a.memo) lines.push("[메모] " + a.memo);
    return {
      shop_name: String(a.shopName || "").slice(0, 80),
      owner_name: String(a.ownerName || "").slice(0, 40),
      phone: String(a.contact || "").slice(0, 20),
      email: a.email ? String(a.email).slice(0, 120) : null,
      region: a.region ? String(a.region).slice(0, 60) : null,
      address: String(a.address || "").slice(0, 200),
      business_no: a.businessNo ? String(a.businessNo).slice(0, 40) : null,
      message: lines.join("\n").slice(0, 1000),
      status: "pending"
    };
  }

  /* 신청서에는 이름·연락처가 들어 있어 anon 에게 SELECT 권한을 열지 않았습니다.
     그래서 RETURNING 없이 보냅니다(return=minimal). */
  function submitApplication(app) {
    return request("POST", cfg().tables.applications, applicationRow(app), null, "return=minimal");
  }

  /* 화면에 현재 저장 위치를 알려 줄 문구용 */
  function mode() {
    return isConfigured() ? "server" : "local";
  }

  return {
    isConfigured: isConfigured,
    mode: mode,
    submitPost: submitPost,
    fetchPosts: fetchPosts,
    submitApplication: submitApplication,
    postRow: postRow,
    applicationRow: applicationRow
  };
})();
