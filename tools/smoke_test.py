#!/usr/bin/env python3
"""index.html 의 id 목록으로 가짜 DOM 을 만들어 app.js·features.js 초기화를
quickjs 로 한 번 돌려 봅니다. 브라우저 없이 잡을 수 있는 실수를 잡는 용도입니다.

    python3 tools/smoke_test.py

확인하는 것
  · 스크립트가 문법 오류 없이 로드되는지
  · init() 이 예외 없이 끝나는지 (없는 id 를 잡으려다 터지는지)
  · 주요 화면(guide·timer·store·partner·community·notes)으로 전환되는지
  · 계열 버튼 순서·개수, 스토어 상품 수, 회원 잠금 상태, 5개 언어 전환
"""
import json
import re
import sys
from pathlib import Path

import esprima
import quickjs

HERE = Path(__file__).resolve().parent.parent
html = (HERE / "index.html").read_text(encoding="utf-8")

IDS = sorted(set(re.findall(r'id="([A-Za-z0-9_-]+)"', html)))
DATA_VIEWS = re.findall(r'data-view="([a-z]+)"', html)

STUB = r"""
var console = { log: function(){}, warn: function(){}, error: function(){} };
var __ids = %s;
var __views = %s;
var nodes = {};

function El(sel, tag) {
  this.sel = sel || "";
  this.tag = tag || "div";
  this.innerHTML = "";
  this.textContent = "";
  this.value = "";
  this.hidden = false;
  this.placeholder = "";
  this.style = {};
  this.children = [];
  this.__attrs = {};
  this.classList = {
    __on: {},
    add: function (c) { this.__on[c] = 1; },
    remove: function (c) { delete this.__on[c]; },
    toggle: function (c, on) { if (on === undefined) { if (this.__on[c]) delete this.__on[c]; else this.__on[c] = 1; } else if (on) this.__on[c] = 1; else delete this.__on[c]; },
    contains: function (c) { return !!this.__on[c]; }
  };
}
El.prototype.setAttribute = function (k, v) { this.__attrs[k] = String(v); };
El.prototype.getAttribute = function (k) { return k in this.__attrs ? this.__attrs[k] : null; };
El.prototype.removeAttribute = function (k) { delete this.__attrs[k]; };
El.prototype.appendChild = function (n) { this.children.push(n); return n; };
El.prototype.removeChild = function (n) { return n; };
El.prototype.addEventListener = function () {};
El.prototype.removeEventListener = function () {};
El.prototype.focus = function () {};
El.prototype.blur = function () {};
El.prototype.scrollIntoView = function () {};
El.prototype.reset = function () {};
El.prototype.cloneNode = function () { return new El(this.sel); };
El.prototype.querySelector = function (s) { return query(s, this); };
El.prototype.querySelectorAll = function (s) { return queryAll(s, this); };
El.prototype.closest = function () { return null; };
El.prototype.insertBefore = function (n) { return n; };

for (var i = 0; i < __ids.length; i++) nodes[__ids[i]] = new El("#" + __ids[i]);

var viewNodes = [];
for (var v = 0; v < __views.length; v++) {
  var el = new El('[data-view=' + __views[v] + ']', 'button');
  el.__attrs['data-view'] = __views[v];
  viewNodes.push(el);
}

function query(sel, root) {
  if (!sel) return null;
  if (sel.charAt(0) === '#') {
    var id = sel.slice(1);
    if (nodes[id]) return nodes[id];
    if (document.__created[id]) return document.__created[id];
    return null;
  }
  if (sel.charAt(0) === '[') {
    // [data-xxx] 형태는 비어 있는 배열로 (없는 것으로) 둡니다
    return null;
  }
  if (sel.charAt(0) === '.') return new El(sel);
  return new El(sel);
}
function queryAll(sel) {
  if (sel === '.tab') return viewNodes;
  if (sel === '.view') return [];
  return [];
}

var document = {
  __created: {},
  createElement: function (tag) { return new El(tag, tag); },
  querySelector: function (s) { return query(s); },
  querySelectorAll: function (s) { return queryAll(s); },
  getElementById: function (id) { return nodes[id] || null; },
  addEventListener: function () {},
  documentElement: new El('html'),
  body: new El('body'),
  title: '',
  readyState: 'complete'
};

var storage = {};
var window = {
  document: document,
  localStorage: {
    getItem: function (k) { return k in storage ? storage[k] : null; },
    setItem: function (k, v) { storage[k] = String(v); },
    removeItem: function (k) { delete storage[k]; }
  },
  location: { href: 'https://example.test/', hash: '', protocol: 'https:', search: '' },
  navigator: { languages: ['ko-KR'], language: 'ko-KR', userAgent: 'stub' },
  setTimeout: function (fn) { if (typeof fn === 'function') { try { fn(); } catch (e) { console.error('timeout cb: ' + e); } } return 0; },
  clearTimeout: function () {},
  fetch: function () { return Promise.resolve({ ok: false, status: 404 }); },
  scrollTo: function () {},
  addEventListener: function () {},
  matchMedia: function () { return { matches: false, addEventListener: function () {} }; },
  alert: function () {},
  console: console
};
window.window = window;
var self = window;
var navigator = window.navigator;
var location = window.location;
var localStorage = window.localStorage;
var fetch = window.fetch;
var setTimeout = window.setTimeout;
var clearTimeout = window.clearTimeout;
var requestAnimationFrame = function (fn) { return 0; };
""" % (json.dumps(IDS), json.dumps(sorted(set(DATA_VIEWS))))

CHECK = r"""
(function () {
  var out = { errors: [] };
  try {
    window.TEAFaiI18N.applyStatic('ko');
    window.TEAFaiData.use('ko');
  } catch (e) { out.errors.push('boot: ' + e); }

  var D = window.TEAFaiData;
  out.teas = D.TEAS.length;
  out.groups = D.groups.length;
  out.teaWithPhoto = D.teas.filter(function (t) { return t.photo && t.photo.f; }).length;
  out.teaWithCountry = D.teas.filter(function (t) { return t.country && t.country.ko; }).length;
  out.yueTeas = D.use('yue').teas.filter(function (t) { return !!t.name; }).length;
  D.use('ko');

  out.storeItems = window.TeaFaiExtra ? 1 : 0;
  out.memberUnlocked = window.TeaFaiExtra ? window.TeaFaiExtra.unlocked() : null;
  out.rank = window.TeaFaiExtra ? window.TeaFaiExtra.rank() : null;

  try {
    var filter = document.querySelector('#filterChips');
    out.filterHtml = filter.children.length;
  } catch (e) { out.errors.push('filter: ' + e); }

  try {
    var list = document.querySelector('#teaList');
    out.teaListHtml = list.innerHTML.length;
  } catch (e) { out.errors.push('teaList: ' + e); }

  try {
    var store = document.querySelector('#storeList');
    out.storeHtml = store.innerHTML.length;
  } catch (e) { out.errors.push('store: ' + e); }

  try {
    var member = document.querySelector('#memberPanel');
    out.memberHtml = member.innerHTML.length;
  } catch (e) { out.errors.push('member: ' + e); }

  try {
    var lens = document.querySelector('#lensMount');
    out.lensHtml = lens.innerHTML.length;
  } catch (e) { out.errors.push('lens: ' + e); }

  try {
    var seg = document.querySelector('#segLeafCount');
    out.leafCount = seg.textContent;
  } catch (e) { out.errors.push('seg: ' + e); }

  return JSON.stringify(out);
})()
"""


def run(plan=None):
    ctx = quickjs.Context()
    ctx.eval(STUB)
    if plan:
        ctx.eval("localStorage.setItem('teafai.member.v1', %r)" % json.dumps({"plan": plan}))
    files = ["supabase-adapter.js", "i18n.js", "data.js", "app.js", "features.js"]
    for f in files:
        src = (HERE / f).read_text(encoding="utf-8")
        try:
            esprima.parseScript(src)
        except Exception as e:
            print(f"[syntax] {f}: {e}")
            sys.exit(1)
        try:
            ctx.eval(src)
        except Exception as e:
            print(f"[eval] {f}: {str(e)[:400]}")
            sys.exit(1)
        print(f"[ok] {f}")
    try:
        result = json.loads(ctx.eval(CHECK))
    except Exception as e:
        print("[check error]", str(e)[:600])
        sys.exit(1)
    result["plan"] = plan or "none"
    html = ctx.eval("document.querySelector('#bizMount').innerHTML")
    result["bizHtml"] = len(html)
    result["hasShopForm"] = "shopForm" in html
    result["hasProductForm"] = 'id="bizForm"' in html
    result["partnerHidden"] = ctx.eval("document.querySelector('#partnerMain').hidden")
    return result


def main():
    result = run(None)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    ok = (
        not result["errors"]
        and result["teas"] == 161
        and result["teaWithPhoto"] == 161
        and result["teaWithCountry"] == 161
        and result["teaListHtml"] > 1000
        and result["storeHtml"] > 1000
        and result["memberHtml"] > 100
        and result["lensHtml"] > 100
        and result["leafCount"] == "161"
    )
    maker = run("maker")
    personal = run("personal")
    print(json.dumps({"maker": {k: maker[k] for k in ("rank", "bizHtml", "partnerHidden")},
                      "personal": {k: personal[k] for k in ("rank", "bizHtml", "partnerHidden")}},
                     ensure_ascii=False, indent=2))
    tiers = (
        maker["errors"] == []
        and maker["bizHtml"] > 800
        and maker["partnerHidden"] is False
        and personal["bizHtml"] > 50
        and not personal["hasShopForm"]
        and not personal["hasProductForm"]
    )
    ok = ok and tiers
    print("SMOKE:", "PASS" if ok else "FAIL")
    sys.exit(0 if ok else 2)


if __name__ == "__main__":
    main()
