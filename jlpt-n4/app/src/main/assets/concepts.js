/* ================= 개념 · 나(캐릭터·설정) ================= */
'use strict';
const STRAT = {
  yomi: ['한자 읽기 (漢字読み) 공략', ['밑줄 친 한자를 히라가나로 읽는 문제예요. 오답은 대부분 <b>장음(おう/おお), 촉음(っ), 탁음(゛), 요음(ゃゅょ)</b>을 살짝 바꾼 것!', '단어를 외울 때 소리를 꼭 같이 들으세요. 눈으로만 외우면 「しゅっぱつ / しゅうぱつ」 같은 함정에 걸려요.', '음독(한자어)은 장음이 많아요: 学校(がっこう)·先生(せんせい)·東京(とうきょう).', '같은 한자도 단어마다 읽기가 달라요: 一日(ついたち/いちにち)·今日(きょう).']],
  hyouki: ['표기 (表記) 공략', ['히라가나로 쓰인 말을 한자로 고르는 문제예요. 오답은 <b>모양이 비슷한 한자</b>(待/持/特, 間/問/聞)로 만들어져요.', '한자의 왼쪽 부분(부수)으로 뜻을 떠올리면 쉬워요: 氵(물)=洗·泳·海, 言(말)=話·語·読, 扌(손)=持·押·払.', '헷갈린 한자 쌍은 개념 탭 ‘비슷한 한자’에서 모아 볼 수 있어요.']],
  bunmyaku: ['문맥 규정 (文脈規定) 공략', ['빈칸 앞뒤의 <b>조사</b>가 최고의 힌트예요: 「〜に乗る」「〜を渡る」「〜が込む」「〜に間に合う」.', '선택지는 모두 같은 활용형으로 나와요. 형태가 아니라 <b>뜻</b>으로 골라야 해요.', '예문째로 외우면 강해져요. 단어 카드의 예문을 소리 내어 읽어 보세요.']],
  para: ['바꿔 말하기 (言い換え類義) 공략', ['밑줄 친 표현과 <b>거의 같은 뜻</b>의 문장을 골라요. 반대말·부분만 맞는 문장이 함정!', '자주 나오는 바꿔 말하기: 「留守だ=家にいない」「さっき=少し前に」「片付ける=きれいにする」「〜てもらう=〜てくれる(주어 바뀜)」.', '수수 표현은 주어가 바뀌는 것에 주의: 「AにBをもらった = AがBをくれた」.']],
  usage: ['용법 (用法) 공략', ['단어가 <b>문장 안에서 자연스럽게</b> 쓰인 것을 골라요. 뜻은 비슷해 보여도 함께 쓰는 말이 달라요.', '예: 「届く」는 물건이 ‘도착’할 때, 사람에게는 「着く」. 「込む」는 사람이 ‘붐빌’ 때.', '틀린 선택지를 보면 다른 단어(着く, 入れる 등)를 쓰면 맞는 문장이에요. 그 단어가 뭘지 떠올려 보는 연습이 좋아요.']],
  gram: ['문법 형식 (文の文法1) 공략', ['빈칸 앞의 <b>접속 형태</b>(사전형·て형·ない형·명사+の)를 먼저 보세요. 접속만으로 2개는 지울 수 있어요.', '문장 끝(〜です/〜ました/〜ください)과 시제가 맞는지 확인해요.', '헷갈린 문법은 개념 카드의 ⚠️ 함정 설명을 꼭 읽으세요.']],
  star: ['문장 배열 ★ (文の文法2) 공략', ['네 조각을 <b>먼저 전부 배열</b>하고 ★ 자리를 찾으세요. 바로 ★만 찾으려 하면 틀려요.', '조사는 반드시 명사 뒤, 「〜て」 뒤에는 「いる/ください/から」 등이 와요.', '수식어는 꾸미는 명사 바로 앞! 「母が作った ＋ ケーキ」.']],
  bunshou: ['글의 문법 (文章の文法) 공략', ['빈칸 앞뒤 문장의 <b>관계</b>(역접·이유·추가)를 보고 접속사를 골라요: でも·だから·それに.', '글쓴이의 입장(나 → 남: あげる / 남 → 나: くれる)을 놓치지 마세요.', '시제와 문체(です·ます체인지 보통체인지)를 글 전체와 맞춰요.']],
  short: ['단문 독해 공략', ['<b>질문을 먼저</b> 읽고 본문에서 답을 찾아요.', '메모·안내문은 ‘누가, 언제까지, 무엇을’이 핵심. 「〜なくてもいい」「〜てください」 같은 지시 표현에 밑줄!', '「でも」「しかし」 뒤에 글쓴이의 진짜 생각이 나와요.']],
  mid: ['중문 독해 공략', ['문단마다 핵심 한 줄을 찾으며 읽어요. 질문은 대체로 문단 순서대로 나와요.', '「どうして」 질문 → 「〜から/〜ので/〜ため」 부분을 찾으세요.', '마지막 문단에 글쓴이의 감정·결론이 있어요.']],
  info: ['정보 검색 공략', ['표·안내문은 처음부터 다 읽지 말고, <b>질문의 조건</b>(요일·시간·나이·금액)에 맞는 줄만 찾아요.', '※ 표시나 작은 글씨에 함정(추가 요금, 예외)이 자주 있어요.', '금액 문제는 직접 계산해 보세요: 인원 × 요금 + 추가 요금.']],
  kadai: ['과제 이해 (課題理解) 공략', ['처음 질문 「〜はこれから何をしますか」를 꼭 기억하세요. <b>앞으로 할 일</b>을 묻는 거예요.', '대화 중간에 계획이 바뀌어요! 「やっぱり」「じゃあ」「でも」 뒤가 최종 답.', '이미 한 일(〜ておきました)이나 다른 사람이 할 일은 오답.']],
  point: ['포인트 이해 (ポイント理解) 공략', ['질문(どうして·何が·いつ)을 먼저 듣고 그 <b>한 가지</b>에만 집중해요.', '이유 질문은 「〜んです」「〜から」 부분에 답이 있어요.', '처음에 나온 정보는 부정되는 경우가 많아요: 「〜と思ったんだけど…」.']],
  hatsuwa: ['발화 표현 (発話表現) 공략', ['그림 속 ➡️ 인물이 <b>할 말</b>을 골라요. 인사·부탁·허락·제안 표현이 나와요.', '부탁: 〜てください/〜てもらえませんか, 허락 구하기: 〜てもいいですか, 제안: 〜ましょうか.', '먼저 퇴근할 때 「お先に失礼します」, 남는 사람은 「お疲れさまでした」.']],
  sokuji: ['즉시 응답 (即時応答) 공략', ['짧은 말에 대한 <b>자연스러운 대답</b>을 고르는 문제. 질문의 단어를 그대로 따라 한 선택지는 함정인 경우가 많아요.', '「〜ましょうか」(해 드릴까요?) → 「お願いします」, 「〜ませんか」(같이 할래요?) → 「いいですね」.', '시간(何時)·기간(どのくらい)·가격(いくら)을 구별해서 들어요.']],
};
const KANA_RULES = `
<h4 id="r-long">🔸 장음 (ー, おう, えい)</h4><div>모음을 한 박자 더 길게! 길이가 다르면 다른 단어예요.</div>
<div class="box j">おばさん(아주머니) ↔ おばあさん(할머니)<br>え → えい: せんせい(先生) / お → おう: がっこう(学校)·とうきょう(東京)<br>가타카나는 ー: コーヒー·ケーキ</div>
<h4 id="r-soku">🔸 촉음 (っ)</h4><div>작은 っ는 한 박자 쉬는 소리(받침처럼). か·さ·た·ぱ행 앞에 와요.</div>
<div class="box j">きって(切手) ↔ きて(来て)<br>がっこう·ざっし·いっぱい·きっぷ</div>
<h4 id="r-daku">🔸 탁음 ゛· 반탁음 ゜</h4><div>점 두 개(゛)는 탁한 소리, 동그라미(゜)는 ぱ행.</div>
<div class="box j">か→が, さ→ざ, た→だ, は→ば→ぱ<br>はし(다리)·ばし / てんき(天気)·でんき(電気)<br>숫자+조수사에서 바뀌어요: 三本(さんぼん)·一杯(いっぱい)</div>
<h4 id="r-yoon">🔸 요음 (ゃ ゅ ょ)</h4><div>작은 ゃゅょ는 앞 글자와 합쳐 한 박자.</div>
<div class="box j">びょういん(病院, 병원) ↔ びよういん(美容院, 미용실)<br>きょう(今日)·しゅくだい·りょこう</div>
<h4 id="r-n">🔸 발음 (ん)</h4><div>ん도 한 박자예요. 빠뜨리기 쉬워요.</div>
<div class="box j">きんえん(禁煙)·せんせい·しんぶん·ほんや</div>
<h4>🔸 조사 읽기</h4><div class="box j">は → 'わ' (私は) · へ → 'え' (学校へ) · を → 'お' (パンを)</div>`;
function openConcept(id) {
  if (id.startsWith('cat:')) { go('vocabList', { cat: id.slice(4) }); return; }
  if (id.startsWith('kana:')) id = 'kana';
  if (id.startsWith('conj:')) id = 'conj';
  if (id === 'type:star' || id.startsWith('type:')) id = 'strat:' + id.slice(5);
  go('concept', { id });
}
function conceptTabHTML() {
  const weak = weakTags(10);
  const q = (VIEW && VIEW.search) || CSEARCH || '';
  const tags = {};
  GRAM.forEach(g => (tags[g.tag] = tags[g.tag] || []).push(g));
  let res = '';
  if (q) {
    const ql = q.toLowerCase();
    const gs = GRAM.filter(g => (g.p + g.m + g.tag).toLowerCase().includes(ql)).slice(0, 20);
    const vs = VOC.filter(v => v.w.includes(q) || k2h(v.r).includes(k2h(q)) || v.m.includes(q)).slice(0, 30);
    const ks = KAN.filter(k => k.k === q || k.ko.includes(q)).slice(0, 10);
    res = `<div class="card"><div class="h3">🔎 "${esc(q)}" 검색 결과</div><div class="clist" style="margin-top:8px">
      ${gs.map(g => gItem(g)).join('')}${vs.map(v => vItem(v)).join('')}${ks.map(k => `<button class="citem" onclick="kanjiModal('${k.k}')"><span class="p" style="font-size:22px">${esc(k.k)}</span><span class="m">${esc(k.ko)} · ${esc(k.on)} / ${esc(k.kun)}</span></button>`).join('')}
      ${!gs.length && !vs.length && !ks.length ? '<div class="small">결과가 없어요</div>' : ''}</div></div>`;
  }
  return `<div class="top"><div class="h2">📘 개념</div></div><div class="stack">
  <input class="srch" id="csrch" placeholder="문법·단어·한자 검색 (예: ように, 食べる, 약속)" value="${esc(q)}" onkeydown="if(event.key==='Enter'){CSEARCH=this.value.trim();render()}" onchange="CSEARCH=this.value.trim();render()">
  ${res}
  <div class="card"><div class="h3">🧠 자주 틀리는 개념 TOP</div>${weak.length ? `<div class="weak">${weak.map((w, i) => `<button onclick="openConcept('${esc(w.t)}')"><span class="num" style="width:20px">${i + 1}</span><span class="n">${esc(w.name)}</span><span class="c">✕${w.w}</span><span>›</span></button>`).join('')}</div>` : '<div class="sub">문제를 풀면 내가 자주 틀리는 개념이 여기에 모여요.</div>'}</div>
  <div class="card"><div class="h3">🔤 기초 개념</div><div class="tiles" style="margin-top:10px">
    ${[['kana', '가나 표·발음 규칙', 'かな'], ['conj', '동사 활용 규칙', '活用'], ['cnt', '조수사·날짜·시간', '助数詞'], ['keigo', '경어 정리', '敬語'], ['jita', '자동사·타동사', '自動詞・他動詞'], ['jyuju', '주고받기 표현', 'あげる・くれる・もらう'], ['hyouki', '비슷한 한자', '漢字の形'], ['kanji', `한자 ${KAN.length}자`, '漢字リスト']].map(([id, ko, jp]) => `<button class="tile" onclick="openConcept('${id}')"><span class="nm">${ko}</span><span class="jn">${jp}</span></button>`).join('')}</div></div>
  <div class="card"><div class="h3">🧩 문법 ${GRAM.length}개</div><div class="sub">✅ 익힘 · 🟡 공부 중 · ⚪ 아직</div>
  ${Object.entries(tags).map(([t, gs]) => `<div class="grp"><div class="gt" style="font-size:15px">${esc(t)} <span class="small">${mastered(gs)}/${gs.length}</span></div><div class="clist">${gs.map(g => gItem(g)).join('')}</div></div>`).join('')}</div>
  <div class="card"><div class="h3">🎯 문제 유형 공략</div><div class="clist" style="margin-top:8px">${Object.entries(STRAT).map(([t, s]) => `<button class="citem" onclick="openConcept('strat:${t}')"><span class="p" style="font-size:14px">${esc(TYPE[t].jp)}</span><span class="m">${esc(TYPE[t].ko)}</span><span>›</span></button>`).join('')}</div></div>
  <div class="card"><div class="h3">📚 단어장</div><div class="tiles" style="margin-top:10px">${DATA.cats.map(c => { const vs = VOC.filter(v => v.c === c.id); const m = mastered(vs); return `<button class="tile" onclick="go('vocabList',{cat:'${c.id}'})"><span class="nm">${c.icon} ${esc(c.name)}</span><span class="st">${m}/${vs.length} 외움</span><div class="bar m"><i style="width:${Math.round(m / vs.length * 100)}%"></i></div></button>`; }).join('')}</div></div>
  </div>`;
}
let CSEARCH = '';
const stIcon = k => { const l = lvOf(k); return l >= MASTER ? '✅' : l >= 0 ? '🟡' : '⚪'; };
function gItem(g) { return `<button class="citem" onclick="openConcept('g:${g.id}')"><span class="p">${esc(g.p)}</span><span class="m">${esc(g.m)}</span><span class="lvb">N${g.lv}</span><span class="st">${stIcon(g.key)}</span></button>`; }
function vItem(v) { return `<button class="citem" onclick="wordModal('${esc(v.key)}')"><span class="p">${rubyHTML(v.disp, 'all')}</span><span class="m">${esc(v.m)}</span><span class="lvb">N${v.lv}</span><span class="st">${stIcon(v.key)}</span></button>`; }
function wordModal(key) {
  const v = VBY[key];
  modal(`<div class="flash" style="padding:4px"><div class="w" style="font-size:36px">${rubyHTML(v.disp, 'all')}</div><div class="r">${esc(v.r)}</div><div class="m">${esc(v.m)}</div><div class="small">${esc(POS_KO[v.p] || '')} · N${v.lv}</div>
  <div class="ex">${sentHTML(v.ex, 'all', 'u')}<div class="tr">${esc(v.tr)}</div></div></div>
  <div class="acts"><button class="btn w" onclick="TTS.say('${esc(k2h(v.r))}')">🔊 단어</button><button class="btn w" onclick="TTS.say(speech(VBY['${esc(key)}'].ex))">🔊 예문</button></div>`);
  TTS.say(k2h(v.r));
}
function kanjiModal(c) {
  const k = KAN.find(x => x.k === c); if (!k) return;
  const ws = VOC.filter(v => v.w.includes(c)).slice(0, 8);
  modal(`<div style="font-size:72px;font-family:var(--fj)">${esc(k.k)}</div><div class="mt">${esc(k.ko)}</div><div class="md">음독 <b class="jp">${esc(k.on)}</b> · 훈독 <b class="jp">${esc(k.kun)}</b></div>
  <div class="passage" style="margin-top:10px;text-align:left">${rubyHTML(k.ex, 'all')}</div>
  ${ws.length ? `<div class="clist" style="margin-top:10px;text-align:left">${ws.map(v => `<div class="citem"><span class="p">${rubyHTML(v.disp, 'all')}</span><span class="m">${esc(v.m)}</span></div>`).join('')}</div>` : ''}`);
}
function conceptPageHTML(id) {
  const head = t => `<div class="top"><button class="back" onclick="back()">◀</button><div class="h2" style="flex:1;min-width:0">${t}</div></div>`;
  if (id.startsWith('g:')) {
    const g = GBY[id.slice(2)]; if (!g) return head('?');
    const st = S.tg['g:' + g.id];
    const rel = GRAM.filter(x => x.tag === g.tag && x !== g).slice(0, 6);
    return head('📘 문법') + `<div class="stack">${gcardHTML(g)}
    ${st ? `<div class="small" style="text-align:center">이 문법: 맞힘 ${st.c} · 틀림 ${st.w}</div>` : ''}
    <div class="acts"><button class="btn full" onclick="startSession(gramDrill('${g.id}'),{exam:true,noRequeue:true})">이 문법 문제 풀기 (${g.q.length + g.s.length}) ▶</button></div>
    ${rel.length ? `<div class="card"><div class="h3">같은 분류: ${esc(g.tag)}</div><div class="clist" style="margin-top:8px">${rel.map(gItem).join('')}</div></div>` : ''}</div>`;
  }
  if (id.startsWith('strat:')) {
    const t = id.slice(6), s = STRAT[t]; if (!s) return head('?');
    return head('🎯 ' + esc(TYPE[t].ko)) + `<div class="card"><div class="h3">${s[0]}</div><div class="prose" style="margin-top:8px"><ul>${s[1].map(x => `<li style="margin-bottom:8px">${x}</li>`).join('')}</ul></div>
    <div class="small">내 정답률: ${practiceStats(t)}</div></div><div class="acts"><button class="btn full" onclick="startPractice('${t}')">이 유형 연습하기 ▶</button></div>`;
  }
  switch (id) {
    case 'kana': return head('🔤 가나') + kanaPage();
    case 'conj': return head('🔁 동사 활용') + conjPage();
    case 'cnt': return head('🔢 조수사·날짜') + counterPage();
    case 'keigo': return head('🙇 경어') + keigoPage();
    case 'jita': return head('🔀 자동사·타동사') + jitaPage();
    case 'jyuju': { const g = GBY.jyuju; return head('🎁 주고받기') + `<div class="stack">${gcardHTML(g)}${gcardHTML(GBY.te_jyuju)}<div class="acts"><button class="btn full" onclick="startSession(gramDrill('jyuju').concat(gramDrill('te_jyuju')),{exam:true,noRequeue:true})">문제 풀기 ▶</button></div></div>`; }
    case 'hyouki': return head('👀 비슷한 한자') + hyoukiPage();
    case 'kanji': return head(`🈶 한자 ${KAN.length}자`) + kanjiPage();
  }
  return head('?');
}
function gramDrill(id) {
  const g = GBY[id];
  return shuffle(g.q.map((_, i) => ({ kind: 'q', q: qGram(g, i) })).concat(g.s.map((_, i) => ({ kind: 'q', q: qStar(g, i) }))));
}
let KANA_VIEW = 'h';
function kanaPage() {
  const kt = KANA_VIEW === 'k';
  const cell = x => x[0] ? `<button class="${(S.kana['kana:' + (kt ? 'k' : 'h') + x[0]] || 0) >= 2 ? 'm' : ''}" onclick="TTS.say('${x[0]}')"><b>${kt ? h2k(x[0]) : x[0]}</b><span>${x[1]}</span></button>` : '<button class="e"></button>';
  return `<div class="stack"><div class="chips"><button class="chip ${!kt ? 'on' : ''}" onclick="KANA_VIEW='h';render(true)">히라가나</button><button class="chip ${kt ? 'on' : ''}" onclick="KANA_VIEW='k';render(true)">가타카나</button><span class="sp"></span><span class="small">초록 = 익힘 · 눌러서 듣기</span></div>
  <div class="card"><div class="h3">기본 (清音)</div><div class="kgrid" style="margin-top:8px">${KANA_BASIC.map(cell).join('')}</div></div>
  <div class="card"><div class="h3">탁음·반탁음 (濁音·半濁音)</div><div class="kgrid" style="margin-top:8px">${KANA_DAKU.map(cell).join('')}</div></div>
  <div class="card"><div class="h3">요음 (拗音)</div><div class="kgrid y" style="margin-top:8px">${KANA_YOON.map(cell).join('')}</div></div>
  <div class="card prose">${KANA_RULES}</div>
  <div class="acts"><button class="btn" onclick="startPractice('kana_h')">히라가나 연습</button><button class="btn k" onclick="startPractice('kana_k')">가타카나 연습</button></div></div>`;
}
function conjPage() {
  const ex = [['書く', 'かく', 'v5'], ['飲む', 'のむ', 'v5'], ['待つ', 'まつ', 'v5'], ['話す', 'はなす', 'v5'], ['泳ぐ', 'およぐ', 'v5'], ['買う', 'かう', 'v5'], ['食べる', 'たべる', 'v1'], ['見る', 'みる', 'v1'], ['する', 'する', 'vsi'], ['来る', 'くる', 'vk']];
  const keys = ['masu', 'te', 'ta', 'nai', 'pot', 'vol', 'ba', 'imp', 'pass', 'caus'];
  const rows = ex.map(([w, r, p]) => { const F = vforms(r, r, p); return `<tr><td class="l">${rubyHTML(align(w, r), 'all')}</td>${keys.map(k => `<td>${esc(drillForm(F, k))}</td>`).join('')}</tr>`; }).join('');
  return `<div class="stack"><div class="card prose"><h4>1️⃣ 동사 그룹 구별</h4>
  <div class="box"><b>3그룹(불규칙)</b>: する, 来る(くる) 두 개뿐!<br><b>2그룹(1단)</b>: る로 끝나고 る 앞이 <b>い단·え단</b> — 食べる·見る·起きる·寝る<br><b>1그룹(5단)</b>: 나머지 전부 — 書く·飲む·買う·帰る</div>
  <div>⚠️ 예외 (모양은 2그룹인데 1그룹): <span class="j">帰る·入る·走る·知る·切る·要る</span> → 帰ります·入って</div>
  <h4>2️⃣ て형 노래 (1그룹)</h4><div class="box j">う·つ·る → って (買って·待って·帰って)<br>む·ぶ·ぬ → んで (飲んで·遊んで·死んで)<br>く → いて (書いて) / ぐ → いで (泳いで)<br>す → して (話して)<br>⭐ 예외: 行く → 行って</div>
  <h4>3️⃣ 활용표</h4></div>
  <div class="card" style="overflow-x:auto;padding:10px"><table class="tbl" style="min-width:720px"><tr><th>사전형</th>${keys.map(k => `<th>${DRILL_FORMS[k].ko}</th>`).join('')}</tr>${rows}</table></div>
  <div class="card"><div class="h3">🏋️ 형태별 드릴</div><div class="chips" style="margin-top:8px">${keys.map(k => `<button class="chip" onclick="conjDrill('${k}')">${DRILL_FORMS[k].ko}</button>`).join('')}<button class="chip on" onclick="startPractice('conj')">전부 섞기</button></div></div></div>`;
}
function conjDrill(k) { const st = []; for (let i = 0; i < 15; i++) st.push({ kind: 'make', make: () => qConj(k) }); startSession(st, { exam: true }); }
function counterPage() {
  const ks = Object.keys(COUNTERS);
  return `<div class="stack"><div class="card" style="overflow-x:auto;padding:10px"><table class="tbl" style="min-width:640px"><tr><th></th>${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `<th>${n}</th>`).join('')}</tr>
  ${ks.map(k => `<tr><td class="l">${k === 'つ' ? '〜つ' : k}<br><span class="small">${esc(COUNTERS[k].ko)}</span></td>${COUNTERS[k].r.slice(1).map(r => `<td style="font-size:12.5px">${esc(r)}</td>`).join('')}</tr>`).join('')}</table></div>
  <div class="card prose"><h4>💡 소리가 바뀌는 규칙</h4><div class="box">1·6·8·10 + か/さ/た/は행 → 작은 っ: <span class="j">いっぽん·ろっぴき·はっぱい·じゅっぷん</span><br>3 + は행 → ば/ぱ: <span class="j">さんぼん·さんばい·さんぷん</span><br>何 + は행 → なんぼん·なんばい·なんぷん</div>
  <h4>📅 꼭 외울 날짜</h4><div class="box j">1日 ついたち · 2日 ふつか · 3日 みっか · 4日 よっか · 5日 いつか · 6日 むいか · 7日 なのか · 8日 ようか · 9日 ここのか · 10日 とおか · 14日 じゅうよっか · 20日 はつか · 24日 にじゅうよっか</div>
  <h4>⏰ 시간</h4><div class="box j">4時 よじ · 7時 しちじ · 9時 くじ / 4月 しがつ · 7月 しちがつ · 9月 くがつ<br>1分 いっぷん · 3分 さんぷん · 4分 よんぷん · 6分 ろっぷん · 8分 はっぷん · 10分 じゅっぷん</div></div>
  <div class="acts"><button class="btn full" onclick="startPractice('counter')">조수사 드릴 ▶</button></div></div>`;
}
function keigoPage() {
  const T = [['いる', 'いらっしゃる', 'おる'], ['行く', 'いらっしゃる', '参る'], ['来る', 'いらっしゃる', '参る'], ['言う', 'おっしゃる', '申す'], ['する', 'なさる', 'いたす'], ['食べる・飲む', '召し上がる', 'いただく'], ['見る', 'ご覧になる', '拝見する'], ['知っている', 'ご存じだ', '存じている'], ['くれる', 'くださる', '—'], ['もらう', '—', 'いただく'], ['あげる', '—', 'さしあげる'], ['聞く・訪ねる', '—', '伺う'], ['ある', '—', 'ござる(ございます)']];
  return `<div class="stack"><div class="card prose"><div><b>존경어</b> = 상대(윗사람)의 행동을 높임 / <b>겸양어</b> = 내 행동을 낮춤</div>
  <div class="box">존경 기본형: <span class="j">お + ます형 + になる</span> (お待ちになる)<br>겸양 기본형: <span class="j">お + ます형 + する</span> (お持ちする) · <span class="j">ご + 한자어 + する</span> (ご案内する)</div></div>
  <div class="card" style="padding:10px"><table class="tbl"><tr><th>보통</th><th>존경어 (상대)</th><th>겸양어 (나)</th></tr>${T.map(r => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join('')}</table></div>
  <div class="clist">${['sonkei', 'kenjou', 'teinei', 'irai_polite'].map(i => gItem(GBY[i])).join('')}</div></div>`;
}
function jitaPage() {
  const ps = VOC.filter(v => v.s === 'pair');
  const pairs = []; for (let i = 0; i + 1 < ps.length; i += 2) pairs.push([ps[i], ps[i + 1]]);
  const base = [['開く', 'あく', '開ける', 'あける'], ['閉まる', 'しまる', '閉める', 'しめる'], ['つく', 'つく', 'つける', 'つける'], ['消える', 'きえる', '消す', 'けす'], ['始まる', 'はじまる', '始める', 'はじめる'], ['止まる', 'とまる', '止める', 'とめる'], ['入る', 'はいる', '入れる', 'いれる'], ['出る', 'でる', '出す', 'だす'], ['壊れる', 'こわれる', '壊す', 'こわす'], ['直る', 'なおる', '直す', 'なおす'], ['並ぶ', 'ならぶ', '並べる', 'ならべる'], ['集まる', 'あつまる', '集める', 'あつめる'], ['決まる', 'きまる', '決める', 'きめる'], ['届く', 'とどく', '届ける', 'とどける'], ['続く', 'つづく', '続ける', 'つづける'], ['沸く', 'わく', '沸かす', 'わかす']];
  return `<div class="stack"><div class="card prose"><div><b>자동사</b>: 저절로 그렇게 됨 「<span class="j">が</span> + 자동사」 / <b>타동사</b>: 누군가 함 「<span class="j">を</span> + 타동사」</div>
  <div class="box j">ドアが開く (문이 열리다) / ドアを開ける (문을 열다)<br>窓が開いている (열려 있다) / 窓が開けてある (누가 열어 두었다)</div></div>
  <div class="card" style="padding:10px"><table class="tbl"><tr><th>자동사 (が)</th><th>타동사 (を)</th></tr>
  ${base.map(r => `<tr><td>${rubyHTML(align(r[0], r[1]), 'all')}</td><td>${rubyHTML(align(r[2], r[3]), 'all')}</td></tr>`).join('')}
  ${pairs.map(([a, b]) => `<tr><td>${rubyHTML(a.disp, 'all')}<br><span class="small">${esc(a.m)}</span></td><td>${rubyHTML(b.disp, 'all')}<br><span class="small">${esc(b.m)}</span></td></tr>`).join('')}</table></div>
  <div class="acts"><button class="btn full" onclick="startSession(gramDrill('jitadoushi'),{exam:true,noRequeue:true})">자·타동사 문제 풀기 ▶</button></div></div>`;
}
function hyoukiPage() {
  return `<div class="stack"><div class="card prose"><div>모양이 비슷해서 표기 문제의 함정으로 자주 나오는 한자 묶음이에요. 눌러서 뜻을 확인해요.</div></div>
  <div class="card"><div class="clist">${DATA.conf.map(g => `<div class="citem" style="flex-wrap:wrap">${[...g].map(c => { const k = KAN.find(x => x.k === c); return `<button onclick="kanjiModal('${c}')" style="font-family:var(--fj);font-size:22px;border:2px solid var(--ink);border-radius:10px;background:${k ? '#fff' : '#F1E7CF'};width:46px;height:46px">${c}</button>`; }).join('')}</div>`).join('')}</div></div></div>`;
}
let KAN_LV = 0;
function kanjiPage() {
  const groups = {};
  KAN.filter(k => !KAN_LV || k.lv === KAN_LV).forEach(k => (groups[k.grp] = groups[k.grp] || []).push(k));
  return `<div class="stack"><div class="chips"><button class="chip ${!KAN_LV ? 'on' : ''}" onclick="KAN_LV=0;render(true)">전체</button><button class="chip ${KAN_LV === 5 ? 'on' : ''}" onclick="KAN_LV=5;render(true)">N5</button><button class="chip ${KAN_LV === 4 ? 'on' : ''}" onclick="KAN_LV=4;render(true)">N4</button><span class="sp"></span><button class="chip" onclick="startPractice('kanji')">한자 퀴즈 ▶</button></div>
  ${Object.entries(groups).map(([g, ks]) => `<div class="card"><div class="h3">${esc(g)}</div><div class="kgrid" style="margin-top:8px">${ks.map(k => `<button class="${lvOf(k.key) >= MASTER ? 'm' : ''}" onclick="kanjiModal('${k.k}')"><b>${esc(k.k)}</b><span style="font-family:var(--fd)">${esc(k.ko.split(' ').pop())}</span></button>`).join('')}</div></div>`).join('')}</div>`;
}
let VL_FILTER = 'all';
function vocabListHTML(cat) {
  const c = CATS[cat]; if (!c) return '';
  let vs = VOC.filter(v => v.c === cat);
  const cnt = { all: vs.length, new: vs.filter(v => lvOf(v.key) < 0).length, learn: vs.filter(v => lvOf(v.key) >= 0 && lvOf(v.key) < MASTER).length, done: mastered(vs) };
  if (VL_FILTER === 'new') vs = vs.filter(v => lvOf(v.key) < 0);
  if (VL_FILTER === 'learn') vs = vs.filter(v => lvOf(v.key) >= 0 && lvOf(v.key) < MASTER);
  if (VL_FILTER === 'done') vs = vs.filter(v => lvOf(v.key) >= MASTER);
  return `<div class="top"><button class="back" onclick="back()">◀</button><div class="h2">${c.icon} ${esc(c.name)}</div></div>
  <div class="chips">${[['all', '전체'], ['new', '⚪ 안 배움'], ['learn', '🟡 공부 중'], ['done', '✅ 외움']].map(([k, n]) => `<button class="chip ${VL_FILTER === k ? 'on' : ''}" onclick="VL_FILTER='${k}';render(true)">${n} ${cnt[k]}</button>`).join('')}</div>
  <div class="acts"><button class="btn sm" onclick="startSession(shuffle(VOC.filter(v=>v.c==='${cat}')).slice(0,15).map(v=>({kind:'q',q:qVocabAuto(v,false)})),{exam:false})">이 주제 퀴즈 ▶</button><button class="btn sm w" onclick="startSession(VOC.filter(v=>v.c==='${cat}'&&lvOf(v.key)<0).slice(0,10).map(v=>({kind:'flash',v})),{})">새 단어 카드</button></div>
  <div class="clist" style="margin-top:12px">${vs.map(vItem).join('')}</div>`;
}

/* ---------- 나 · 캐릭터 · 설정 ---------- */
const ACC_RULES = [
  ['bow', '리본', '처음부터', () => true],
  ['leaf', '새싹', '3일 연속 공부', () => S.streak >= 3],
  ['flower', '꽃핀', '합격 달성도 40%', () => readiness().pct >= 40],
  ['beanie', '털모자', '7일 연속 공부', () => S.streak >= 7],
  ['glasses', '안경', '모의고사 3회', () => S.mocks.length >= 3],
  ['phones', '헤드폰', '청해 100문제', () => AREAS && (S.ty.kadai || { t: 0 }).t + (S.ty.point || { t: 0 }).t + (S.ty.hatsuwa || { t: 0 }).t + (S.ty.sokuji || { t: 0 }).t >= 100],
  ['party', '파티 모자', '합격 달성도 75%', () => readiness().pct >= 75],
  ['crown', '왕관', '목표 점수 달성', () => readiness().pct >= 100],
];
const SP_RULES = { sleepy: ['7일 연속 공부', () => S.streak >= 7], king: ['모의고사 합격 점수', () => S.mocks.some(m => m.pass)], gold: ['단어 1,000개 외우기', () => mastered(VOC) >= 1000], uni: ['30일 연속 공부', () => S.streak >= 30], angel: ['모의고사에서 목표 점수', () => S.mocks.some(m => m.total >= S.target)], devil: ['밤 11시 이후 공부', () => new Date().getHours() >= 23 && (S.days[dstr()] || {}).n > 0], alien: ['10문제 이상 만점', () => S.perfect >= 1], rainjelly: ['만점 10번', () => S.perfect >= 10] };
function spUnlocked(sp, i) { if (SPECIES[sp]) return i < 8 || mastered(VOC) >= (i - 7) * 60 || (S.ach.sp || {})[sp]; return (S.ach.sp || {})[sp]; }
function spRule(sp, i) { if (SPECIES[sp]) return `단어 ${(i - 7) * 60}개 외우기`; return SP_RULES[sp] ? SP_RULES[sp][0] : ''; }
function accUnlocked(a) { return (S.ach.acc || {})[a]; }
function checkUnlocks() {
  S.ach.acc = S.ach.acc || {}; S.ach.sp = S.ach.sp || {};
  const got = [];
  ACC_RULES.forEach(([k, n, how, f]) => { if (!S.ach.acc[k]) { try { if (f()) { S.ach.acc[k] = 1; got.push(n); } } catch (e) { } } });
  Object.entries(SP_RULES).forEach(([k, [how, f]]) => { if (!S.ach.sp[k]) { try { if (f()) { S.ach.sp[k] = 1; got.push(HIDDEN[k].ko); } } catch (e) { } } });
  if (got.length) setTimeout(() => toast('🎁 새로 열렸어요: ' + got.join(', ')), 600);
}
function avatarEditor() {
  const A = S.avatar;
  const sps = Object.keys(SPECIES).concat(Object.keys(HIDDEN));
  return `<div class="card"><div class="h3">캐릭터</div><div class="presets" style="margin-top:8px">${sps.map((sp, i) => { const ok = spUnlocked(sp, i); return `<button class="opt ${A.sp === sp ? 'on' : ''} ${ok ? '' : 'lock'}" onclick="${ok ? `setAv('sp','${sp}')` : `toast('🔒 ${esc(spRule(sp, i))}하면 열려요')`}">${creature({ sp, col: ALL_SP[sp].col })}<small>${ok ? esc(ALL_SP[sp].ko) : '🔒'}</small></button>`; }).join('')}</div>
  <div class="h3" style="margin-top:14px">색</div><div class="swatches" style="margin-top:6px">${COLORS.map(c => `<button class="sw ${A.col === c ? 'on' : ''}" style="background:${c}" onclick="setAv('col','${c}')"></button>`).join('')}</div>
  <div class="h3" style="margin-top:14px">표정</div><div class="mini" style="margin-top:6px">${FACES.map(([e, m]) => `<button class="opt ${A.eyes === e && A.mouth === m ? 'on' : ''}" onclick="S.avatar.eyes='${e}';S.avatar.mouth='${m}';save();render(true)">${creature(Object.assign({}, A, { eyes: e, mouth: m }))}</button>`).join('')}</div>
  <div class="h3" style="margin-top:14px">볼터치</div><div class="chips" style="margin-top:6px">${[['pink', '분홍'], ['peach', '복숭아'], ['none', '없음']].map(([k, n]) => `<button class="chip ${A.cheek === k ? 'on' : ''}" onclick="setAv('cheek','${k}')">${n}</button>`).join('')}</div>
  <div class="h3" style="margin-top:14px">꾸미기 <span class="small">합격에 가까워질수록 열려요</span></div><div class="mini" style="margin-top:6px"><button class="opt ${!A.acc ? 'on' : ''}" onclick="setAv('acc','')">${creature(Object.assign({}, A, { acc: '' }))}<small>없음</small></button>${ACC_RULES.map(([k, n, how]) => { const ok = accUnlocked(k) || k === 'bow'; return `<button class="opt ${A.acc === k ? 'on' : ''}" onclick="${ok ? `setAv('acc','${k}')` : `toast('🔒 ${esc(how)}')`}">${creature(Object.assign({}, A, { acc: k }))}${ok ? '' : '<span class="lk">🔒</span>'}<small>${esc(n)}</small></button>`; }).join('')}</div></div>`;
}
function setAv(k, v) { S.avatar[k] = v; if (k === 'sp') S.avatar.col = ALL_SP[v].col; save(); render(true); }
function avatarPageHTML() { return `<div class="top"><button class="back" onclick="back()">◀</button><div class="h2">캐릭터 꾸미기</div></div><div class="hero"><div class="big mon">${creature(S.avatar)}</div></div>${avatarEditor()}`; }
function meTabHTML() {
  checkUnlocks();
  const tot = Object.values(S.days).reduce((s, d) => s + (d.n || 0), 0), cor = Object.values(S.days).reduce((s, d) => s + (d.c || 0), 0);
  const nd = Object.values(S.days).filter(d => d.n).length;
  const mins = Object.values(S.days).reduce((s, d) => s + (d.min || 0), 0);
  const last14 = []; for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); last14.push([dstr(d), (S.days[dstr(d)] || {}).n || 0]); }
  const mx = Math.max(10, ...last14.map(x => x[1]));
  return `<div class="top"><div class="h2">🐣 나</div><span class="sp"></span><button class="iconbtn" onclick="go('settings')">⚙️</button></div><div class="stack">
  <div class="card" style="text-align:center"><div class="mon" style="display:inline-block">${creature(S.avatar, {})}</div><div class="h2">${esc(S.name)}</div><div class="small">🔥 연속 ${S.streak}일 · 공부한 날 ${nd}일</div><div class="acts"><button class="btn sm w" onclick="go('avatar')">🎨 캐릭터 꾸미기</button></div></div>
  <div class="stat2"><div class="mini2"><b>${tot.toLocaleString()}</b><div>푼 문제</div></div><div class="mini2"><b>${tot ? Math.round(cor / tot * 100) : 0}<small>%</small></b><div>전체 정답률</div></div><div class="mini2"><b>${mastered(VOC)}<small>/${VOC.length}</small></b><div>외운 단어</div></div><div class="mini2"><b>${mastered(GRAM)}<small>/${GRAM.length}</small></b><div>익힌 문법</div></div><div class="mini2"><b>${mastered(KAN)}<small>/${KAN.length}</small></b><div>익힌 한자</div></div><div class="mini2"><b>${Math.round(mins / 6) / 10}<small>시간</small></b><div>공부 시간</div></div></div>
  <div class="card"><div class="h3">최근 2주</div><div style="display:flex;align-items:flex-end;gap:3px;height:110px;margin-top:10px">${last14.map(([d, n]) => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;gap:3px"><i style="display:block;width:100%;max-width:18px;height:${Math.max(4, n / mx * 90)}px;background:${n ? 'var(--yolk)' : '#F1E7CF'};border:2px solid ${n ? 'var(--ink)' : '#E3D6B8'};border-radius:6px 6px 2px 2px"></i><span style="font-size:9px;color:var(--ink2)">${d.slice(8)}</span></div>`).join('')}</div></div>
  <div class="card"><div class="h3">유형별 정답률</div>${Object.keys(TYPE).filter(t => S.ty[t] && S.ty[t].t).map(t => `<div class="trow"><span>${esc(TYPE[t].ko)}</span><div class="bar"><i style="width:${Math.round(S.ty[t].c / S.ty[t].t * 100)}%"></i></div><b>${Math.round(S.ty[t].c / S.ty[t].t * 100)}%</b></div>`).join('') || '<div class="sub">아직 기록이 없어요</div>'}</div>
  <div class="card"><div class="h3">🎁 열린 아이템</div><div class="clist" style="margin-top:8px">${ACC_RULES.map(([k, n, how]) => `<div class="citem"><span class="st">${accUnlocked(k) || k === 'bow' ? '✅' : '🔒'}</span><span class="p" style="font-family:var(--fd);font-size:15px">${esc(n)}</span><span class="m">${esc(how)}</span></div>`).join('')}
  ${Object.entries(SP_RULES).map(([k, [how]]) => `<div class="citem"><span class="st">${(S.ach.sp || {})[k] ? '✅' : '🔒'}</span><span class="p" style="font-family:var(--fd);font-size:15px">${(S.ach.sp || {})[k] ? esc(HIDDEN[k].ko) : '히든 캐릭터'}</span><span class="m">${esc(how)}</span></div>`).join('')}</div></div>
  </div>`;
}
function settingsHTML() {
  const tg = (k, v) => `<button class="tgl ${v ? 'on' : ''}" onclick="S.set.${k}=!S.set.${k};save();render(true)"></button>`;
  const tg2 = k => `<button class="tgl ${S.set[k] ? 'on' : ''}" onclick="S.set.${k}=!S.set.${k};save();syncReminders();if(S.set.${k})askNotify();render(true)"></button>`;
  return `<div class="top"><button class="back" onclick="back()">◀</button><div class="h2">⚙️ 설정</div></div><div class="stack">
  <div class="card"><div class="prow"><div class="pl"><div class="pt">이름</div></div><input class="ntxt" style="width:150px" value="${esc(S.name)}" onchange="S.name=this.value.trim()||S.name;save()"></div>
  <div class="prow"><div class="pl"><div class="pt">시험 날짜</div><div class="pd">D-day와 하루 추천량 계산에 써요</div></div><input class="ntxt" style="width:170px" type="date" value="${esc(S.exam)}" onchange="S.exam=this.value||S.exam;save();render(true)"></div>
  <div class="prow"><div class="pl"><div class="pt">목표 점수</div><div class="pd">합격선 90 · 안정권 110~120</div></div><button class="chip on" onclick="targetEdit()">${S.target}점 ✎</button></div></div>
  <div class="card"><div class="h3">📅 하루 학습량</div>
  <div class="prow"><div class="pl"><div class="pt">새 단어</div><div class="pd">${planHint()}</div></div>${stepper('plan.v', 5, 80, 5)}</div>
  <div class="prow"><div class="pl"><div class="pt">새 문법</div></div>${stepper('plan.g', 0, 8, 1)}</div>
  <div class="prow"><div class="pl"><div class="pt">복습 최대</div></div>${stepper('plan.rev', 20, 300, 20)}</div>
  <div class="prow"><div class="pl"><div class="pt">독해</div></div>${stepper('plan.r', 0, 5, 1)}</div>
  <div class="prow"><div class="pl"><div class="pt">청해</div></div>${stepper('plan.l', 0, 10, 1)}</div>
  <div class="prow"><div class="pl"><div class="pt">가나 연습</div><div class="pd">가나를 다 익히면 자동으로 빠져요</div></div>${stepper('plan.kana', 0, 40, 5)}</div></div>
  <div class="card"><div class="h3">🔔 알림</div>${notifyOK() ? '' : `<div class="sub" style="background:#FBEFCB;border-radius:12px;padding:8px;margin:6px 0">알림이 꺼져 있어요. <button class="chip on" onclick="askNotify()">알림 허용하기</button></div>`}
  <div class="prow"><div class="pl"><div class="pt">매일 공부 알림</div><div class="pd">그날 공부를 아직 안 했을 때만 와요</div></div>${tg2('notiDaily')}</div>
  ${S.set.notiDaily ? `<div class="prow"><div class="pl"><div class="pd">알림 시각</div></div>${timeSel('dailyTime')}</div>` : ''}
  <div class="prow"><div class="pl"><div class="pt">정기 모의고사 알림</div><div class="pd">${S.mocks.length ? `매주 ${WEEK_KO[mockDayOf()]}요일` : '진단 모의고사 후 요일이 정해져요'}</div></div>${tg2('notiMock')}</div>
  ${S.set.notiMock ? `<div class="prow"><div class="pl"><div class="pd">알림 시각</div></div>${timeSel('mockTime')}</div>` : ''}
  ${S.mocks.length ? mockScheduleHTML() : ''}</div>
  <div class="card"><div class="h3">👀 보기</div>
  <div class="prow"><div class="pl"><div class="pt">후리가나</div><div class="pd">실제 시험엔 후리가나가 거의 없어요. 익숙해지면 줄여 보세요</div></div><div class="chips">${[['all', '모두'], ['n5', 'N5 한자 숨김'], ['none', '숨김']].map(([k, n]) => `<button class="chip ${S.set.furi === k ? 'on' : ''}" onclick="S.set.furi='${k}';save();render(true)">${n}</button>`).join('')}</div></div>
  <div class="prow"><div class="pl"><div class="pt">진동</div></div>${tg('vib', S.set.vib)}</div></div>
  <div class="card"><div class="h3">🔊 소리</div>
  <div class="prow"><div class="pl"><div class="pt">말하기 속도</div><div class="pd">실제 N4 청해는 보통 속도예요. 처음엔 느리게!</div></div><div class="chips">${[[.7, '느리게'], [.85, '조금 느리게'], [1, '보통']].map(([k, n]) => `<button class="chip ${Math.abs(S.set.rate - k) < .01 ? 'on' : ''}" onclick="S.set.rate=${k};save();render(true);TTS.say('はじめまして。どうぞよろしく。')">${n}</button>`).join('')}</div></div>
  <div class="prow"><div class="pl"><div class="pt">항상 대본으로 청해</div><div class="pd">이어폰 없이 공부할 때 켜 두세요</div></div>${tg('mute', S.set.mute)}</div>
  <div class="prow"><div class="pl"><div class="pt">일본어 음성</div><div class="pd">${hasJa() ? '✅ 사용 가능' : '❌ 설치가 필요해요'}</div></div><button class="btn sm w" onclick="voiceGuide()">설치 방법</button></div></div>
  <div class="card"><div class="h3">💾 백업</div><div class="sub">폰을 바꾸거나 앱을 다시 깔 때 기록을 옮길 수 있어요.</div>
  <div class="acts"><button class="btn sm" onclick="exportBackup()">백업 저장</button><button class="btn sm w" onclick="$('#backupInput').click()">백업 불러오기</button></div>
  <div class="acts"><button class="btn sm w" style="color:var(--no)" onclick="resetAsk()">처음부터 다시</button></div></div>
  <div class="small" style="text-align:center">공!부!해! N4 · 단어 ${VOC.length} · 문법 ${GRAM.length} · 한자 ${KAN.length} · 독해 ${READ.length + BUN.length} · 청해 ${LIS.length}</div></div>`;
}
function timeSel(k) {
  const ops = []; for (let h = 6; h <= 23; h++) for (const m of ['00', '30']) ops.push(pad(h) + ':' + m);
  const lab = t => { const [h, m] = t.split(':').map(Number); return (h < 12 ? '오전 ' : '오후 ') + (h % 12 || 12) + '시' + (m ? ' 30분' : ''); };
  return `<select class="ntxt" style="width:140px" onchange="S.set.${k}=this.value;save();syncReminders();render(true)">${ops.map(t => `<option value="${t}" ${S.set[k] === t ? 'selected' : ''}>${lab(t)}</option>`).join('')}</select>`;
}
function planHint() {
  const left = Math.max(1, daysLeft() - 7);
  const remain = VOC.filter(v => !S.it[v.key]).length;
  return `남은 단어 ${remain}개 ÷ ${left}일 → 하루 ${Math.ceil(remain / left)}개면 시험 1주 전 완료`;
}
function exportBackup() {
  const j = JSON.stringify(S), name = 'gongbuhae-n4-' + dstr() + '.json';
  if (HAS && Android.exportBackup) { toast(Android.exportBackup(name, j)); return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([j], { type: 'application/json' })); a.download = name; a.click();
}
function resetAsk() {
  modal(`<div class="mt">정말 처음부터 할까요?</div><div class="md">모든 기록과 모의고사 점수가 지워져요. 먼저 백업을 추천해요.</div><div class="acts"><button class="btn w" onclick="closeModal()">취소</button><button class="btn p" onclick="S=defState();save(true);mockDiscard();M=null;closeModal();SETUP={step:0};TAB='home';VIEW=null;render()">지우기</button></div>`);
}
document.addEventListener('change', e => {
  if (e.target && e.target.id === 'backupInput' && e.target.files[0]) {
    const fr = new FileReader();
    fr.onload = () => {
      try { const s = JSON.parse(fr.result); if (!s || !s.it) throw 0; localStorage.setItem('n4', fr.result); try { if (HAS) Android.saveData(fr.result); } catch (x) { } S = loadState(); toast('불러왔어요!'); render(); }
      catch (x) { toast('백업 파일이 아니에요'); }
    };
    fr.readAsText(e.target.files[0]);
    e.target.value = '';
  }
});
