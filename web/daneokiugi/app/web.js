'use strict';

(function () {
  if (window.Android || window.__inapp) return;
  var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  if (standalone) return;
  var ua = navigator.userAgent || '', ios = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1), and = /Android/i.test(ua);
  if (!ios && !and) return;
  var st = {}; try { st = JSON.parse(localStorage.getItem('wk_a2hs') || '{}') || {}; } catch (e) {}
  var keep = function () { try { localStorage.setItem('wk_a2hs', JSON.stringify(st)); } catch (e) {} };
  var ev = null, box = null;
  var hide = function () { if (box && box.parentNode) box.parentNode.removeChild(box); box = null; };
  var hasData = function () { try { var s = JSON.parse(localStorage.getItem('wk') || 'null'); return !!(s && s.owners && s.owners.length); } catch (e) { return false; } };
  var body = function () {
    var steps = function (a) { return '<ol style="margin:0;padding-left:22px;display:grid;gap:3px;font-size:15px;line-height:1.5">' + a.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ol>'; };
    if (ios) return steps(['화면 아래(또는 위)의 <b>공유 단추</b>를 눌러요', '<b>홈 화면에 추가</b>를 눌러요', '홈 화면에 생긴 <b>단어키우기</b>로 다시 열어요']) + '<div class="hint">홈 화면에서 연 단어키우기는 기록을 따로 저장해요. ' + (hasData() ? '여기서 만든 마을은 설정의 백업으로 옮길 수 있어요' : '마을을 만들기 전에 먼저 추가해 주세요') + '</div>';
    if (ev) return '<button type="button" class="btn" id="a2hs-go">홈 화면에 추가</button>';
    return steps(['브라우저 <b>메뉴</b>(점 세 개 또는 줄 세 개)를 눌러요', '<b>홈 화면에 추가</b> 또는 <b>앱 설치</b>를 눌러요']);
  };
  var draw = function () {
    if (!box) return;
    box.innerHTML = '<div class="card" style="pointer-events:auto;max-width:460px;margin:0 auto;gap:10px;box-shadow:0 -2px 0 rgba(74,65,56,.08),0 6px 0 rgba(74,65,56,.22)"><div class="row" style="gap:12px;align-items:center"><img src="icons/icon-192.png" alt="" width="54" height="54" style="border-radius:15px;border:2.5px solid var(--ink);flex:none"><div class="f1" style="min-width:0"><h2 style="font-size:19px">홈 화면에 추가해 두세요</h2><span class="sub" style="font-size:14px">앱처럼 바로 열리고, 공부 기록도 잃어버리지 않아요</span></div></div>' + body() + '<button type="button" class="btn sec" id="a2hs-later" style="min-height:42px">나중에</button></div>';
    var go = document.getElementById('a2hs-go');
    if (go) go.addEventListener('click', function () { if (!ev) return; var e = ev; ev = null; e.prompt(); (e.userChoice || Promise.resolve({})).then(function (r) { if (r && r.outcome === 'accepted') { st.done = 1; keep(); hide(); } else draw(); }); });
    document.getElementById('a2hs-later').addEventListener('click', function () { st.n = (st.n || 0) + 1; st.t = Date.now(); keep(); hide(); });
  };
  var show = function () {
    if (box || st.done || (st.n || 0) >= 4 || (st.t && Date.now() - st.t < 20 * 3600e3)) return;
    box = document.createElement('div'); box.id = 'a2hs';
    box.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:80;padding:12px 12px calc(12px + env(safe-area-inset-bottom, 0px));pointer-events:none';
    document.body.appendChild(box); draw();
  };
  addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); ev = e; draw(); });
  addEventListener('appinstalled', function () { st.done = 1; keep(); hide(); });
  window.showA2HS = function () { st.t = 0; st.n = 0; hide(); show(); };
  setTimeout(show, 1400);
})();

(function () {
  if (!('serviceWorker' in navigator) || window.Android) return;
  var had = !!navigator.serviceWorker.controller, shown = false;
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (!had) { had = true; return; }
    if (shown) return; shown = true;
    var d = document.createElement('div'); d.id = 'newver';
    d.style.cssText = 'position:fixed;left:12px;right:12px;top:calc(10px + env(safe-area-inset-top, 0px));z-index:95;display:flex;align-items:center;gap:10px;padding:10px 12px 10px 16px;background:#FFE27A;border:2.5px solid #4A4138;border-radius:20px;box-shadow:0 4px 0 rgba(74,65,56,.22);font-size:15px;color:#4A4138';
    d.innerHTML = '<span style="flex:1 1 0;min-width:0">새 버전이 나왔어요</span><button type="button" style="flex:none;height:38px;padding:0 14px 2px;border:2.5px solid #4A4138;border-radius:14px;background:#FFFDF6;font:inherit;color:inherit">지금 바꾸기</button>';
    document.body.appendChild(d); d.querySelector('button').addEventListener('click', function () { location.reload(); });
  });

  var check = function () { navigator.serviceWorker.getRegistration().then(function (r) { if (r) r.update(); }).catch(function () {}); };
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') check(); });
})();
