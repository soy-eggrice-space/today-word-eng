(function () {
  const SND = { ctx: null, bufs: {}, loading: null, cur: '', want: '', src: null, gain: null, fxGain: null, last: {}, MUSIC: 0.42, FX: 0.85, VOL: { vil: 0.04, chal: 0.42 } };
  const on = k => !(S && S[k === 'm' ? 'noBgm' : 'noSfx']);
  SND.on = on;
  function ctx() {
    if (SND.ctx) return SND.ctx; const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    try { SND.ctx = new AC(); } catch (e) { return null; }
    SND.fxGain = SND.ctx.createGain(); SND.fxGain.gain.value = SND.FX; SND.fxGain.connect(SND.ctx.destination); return SND.ctx;
  }

  function load() {
    if (SND.loading) return SND.loading;
    SND.loading = new Promise(res => {
      const go = () => {
        const D = window.SND_DATA, c = ctx(); if (!D || !c) return res(false);
        const dec = k => new Promise(ok => { try { const s = atob(D[k]), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); c.decodeAudioData(u.buffer, b => { SND.bufs[k] = b; ok(); }, () => ok()); } catch (e) { ok(); } });
        dec('fx').then(() => Promise.all([dec('vil'), dec('chal')])).then(() => res(true));
      };
      if (window.SND_DATA) return go();
      const s = document.createElement('script'); s.src = 'snd_data.js'; s.onload = go; s.onerror = () => res(false); document.head.appendChild(s);
    });
    return SND.loading;
  }
  function stopMusic(fade) {
    const c = SND.ctx, g = SND.gain, s = SND.src; SND.src = null; SND.gain = null; if (!c || !g) return;
    try { g.gain.cancelScheduledValues(c.currentTime); g.gain.setTargetAtTime(0.0001, c.currentTime, fade || 0.35); s.stop(c.currentTime + (fade || 0.35) * 5); } catch (e) {}
  }
  function startMusic(name) {
    const c = ctx(), b = SND.bufs[name], D = window.SND_DATA; if (!c || !b || !D) return;
    const s = c.createBufferSource(), g = c.createGain(), lp = D[name + 'Loop'];
    s.buffer = b; s.loop = true; s.loopStart = lp[0]; s.loopEnd = lp[1];
    g.gain.setValueAtTime(0.0001, c.currentTime); g.gain.setTargetAtTime(SND.VOL[name] || SND.MUSIC, c.currentTime, 0.8);
    s.connect(g); g.connect(c.destination); s.start(c.currentTime + 0.05, lp[0]); SND.src = s; SND.gain = g; SND.cur = name;
  }

  SND.scene = name => {
    const want = !on('m') ? '' : (name === 'card' || name === 'quiz' || name === 'chalWin') ? '' : name === 'chalGame' ? 'chal' : 'vil';
    SND.want = want;
    if (want === SND.cur && (want === '' || SND.src)) return;
    if (!SND.unlocked) return;
    SND.cur = want; stopMusic(want === 'chal' ? 0.15 : 0.4);
    if (!want) return;
    load().then(() => setTimeout(() => { if (SND.want === want && !SND.src && SND.cur === want && !document.hidden) startMusic(want); }, want === 'chal' ? 1100 : 0));
  };
  SND.fx = name => {
    if (!on('s')) return; const c = ctx(), D = window.SND_DATA; if (!c) return;
    const now = Date.now(); if (SND.last[name] && now - SND.last[name] < 140) return; SND.last[name] = now;
    if (!SND.bufs.fx) { load().then(() => { if (Date.now() - now < 600) play(); }); return; }
    play();
    function play() { const b = SND.bufs.fx, m = window.SND_DATA && SND_DATA.fxMap[name]; if (!b || !m) return; if (c.state === 'suspended') c.resume(); const s = c.createBufferSource(); s.buffer = b; s.connect(SND.fxGain); s.start(c.currentTime + 0.01, m[0], m[1]); }
  };

  const unlock = () => {
    if (SND.unlocked) return; const c = ctx(); if (!c) return; SND.unlocked = true;
    try { c.resume(); const s = c.createBufferSource(); s.buffer = c.createBuffer(1, 1, 22050); s.connect(c.destination); s.start(0); } catch (e) {}
    load(); SND.cur = '__'; SND.scene(R.name);
  };
  ['pointerdown', 'touchstart', 'keydown'].forEach(ev => document.addEventListener(ev, unlock, { capture: true, passive: true }));

  SND.pause = () => { const c = SND.ctx; if (c && c.state === 'running') c.suspend(); };
  SND.resume = () => { const c = SND.ctx; if (c && c.state === 'suspended' && !document.hidden) c.resume(); if (SND.unlocked && SND.want && !SND.src) { SND.cur = '__'; SND.scene(R.name); } };
  document.addEventListener('visibilitychange', () => { if (document.hidden) SND.pause(); else SND.resume(); });

  SND.duck = sec => { const c = SND.ctx, g = SND.gain; if (!c || !g) return; const v = SND.VOL[SND.cur] || SND.MUSIC; g.gain.setTargetAtTime(v * 0.25, c.currentTime, 0.05); g.gain.setTargetAtTime(v, c.currentTime + (sec || 1.6), 0.4); };
  SND.reset = () => { SND.cur = '__'; SND.scene(R.name); };
  window.SND = SND;
})();
