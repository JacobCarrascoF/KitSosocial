/* Kit Sosocial — sonido (piano sintetizado y clic) y reloj compartido (transporte) */
(function (KS) {
  let ac = null, out = null, master = null;

  function newMaster() {
    master = ac.createGain();
    master.gain.value = 0.8;
    master.connect(out);
  }
  function ctx() {
    if (!ac) {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      out = ac.createDynamicsCompressor();
      out.connect(ac.destination);
      newMaster();
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  function tone(m, t, d, vol) {
    const f = 440 * Math.pow(2, (m - 69) / 12);
    const g = ac.createGain(), lp = ac.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 2600;
    [['triangle', 1, 1], ['sine', 2, 0.35], ['sine', 3, 0.1]].forEach(([type, mul, v]) => {
      const o = ac.createOscillator(), og = ac.createGain();
      o.type = type; o.frequency.value = f * mul; og.gain.value = v;
      o.connect(og); og.connect(g); o.start(t); o.stop(t + d + 0.05);
    });
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0008, t + d);
    g.connect(lp); lp.connect(master);
  }
  function chord(notes, bass, t, d) {
    ctx();
    const when = t == null ? ac.currentTime : t, dur = d || 1.6;
    notes.forEach(m => tone(m, when, dur, 0.09));
    if (bass != null) tone(bass, when, dur, 0.14);
  }
  // nivel: 2 = primer tiempo, 1.5 = acento secundario, 1 = pulso, 0 = subdivisión
  function click(t, level) {
    const o = ac.createOscillator(), g = ac.createGain();
    const f = level >= 2 ? 1760 : level >= 1.5 ? 1320 : level >= 1 ? 1000 : 760;
    const v = level >= 2 ? 0.55 : level >= 1 ? 0.33 : 0.16;
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.06);
  }
  function hush() {
    if (!ac) return;
    const old = master, now = ac.currentTime;
    old.gain.cancelScheduledValues(now);
    old.gain.setValueAtTime(old.gain.value, now);
    old.gain.linearRampToValueAtTime(0, now + 0.03);
    setTimeout(() => { try { old.disconnect(); } catch (e) {} }, 200);
    newMaster();
  }
  KS.audio = { ctx, chord, click, hush };

  /* ---------- Transporte: un único reloj para el metrónomo y para escuchar progresiones ---------- */
  const T = { playing: false, mode: null, owner: null };
  let timer = null, next = 0, sub = 0, beat = 0, bar = 0, opts = null, ending = false, uiTimers = [];

  const SIGS = { '2/4': 2, '3/4': 3, '4/4': 4, '5/4': 5, '6/8': 6, '12/8': 12 };
  KS.SIGS = SIGS;
  const secondary = b => {
    const s = KS.state.sig;
    return (s === '6/8' && b === 3) || (s === '12/8' && b % 3 === 0 && b > 0);
  };
  const ui = (t, fn) => { uiTimers.push(setTimeout(fn, Math.max(0, (t - ac.currentTime) * 1000))); };

  function scheduleSub(t) {
    const st = KS.state;
    const counting = bar < T.countInBars;
    if (sub === 0) {
      const lvl = (beat === 0 && st.accent) ? 2 : secondary(beat) ? 1.5 : 1;
      if (T.mode === 'metro' || st.clickOn || counting) click(t, lvl);
      const b = beat, br = bar;
      ui(t, () => KS.emit('beat', { beat: b, bar: br, counting, beats: st.beats }));
      if (T.mode === 'prog' && beat === 0 && !counting) {
        const pb = bar - T.countInBars;
        if (pb % st.barsPerChord === 0) {
          const k = pb / st.barsPerChord;
          const s = opts.steps[k];
          if (s) {
            const dur = st.barsPerChord * st.beats * 60 / st.bpm;
            chord(s.notes, s.bass, t, dur * 0.97);
            ui(t, () => { if (opts && opts.onStep) opts.onStep(k); });
          }
        }
      }
    } else if (T.mode === 'metro') {
      click(t, 0);
    }
  }
  function advance() {
    const st = KS.state;
    const spb = T.mode === 'metro' ? st.subdiv : 1;
    next += 60 / st.bpm / spb;
    sub++;
    if (sub < spb) return;
    sub = 0; beat++;
    if (beat < st.beats) return;
    beat = 0; bar++;
    if (T.mode === 'prog') {
      const total = T.countInBars + opts.steps.length * st.barsPerChord;
      if (bar >= total) {
        if (st.loop) bar = T.countInBars;
        else { ending = true; ui(next, () => T.stop()); }
      }
    } else if (st.trainer.on && bar > T.countInBars) {
      const played = bar - T.countInBars;
      if (played % Math.max(1, st.trainer.every) === 0 && st.bpm < st.trainer.to) {
        st.bpm = Math.min(st.trainer.to, st.bpm + Math.max(1, st.trainer.step));
        KS.save();
        ui(next, () => KS.emit('bpm'));
      }
    }
  }
  function tick() {
    while (!ending && next < ac.currentTime + 0.12) { scheduleSub(next); advance(); }
  }

  T.start = (o) => {
    T.stop(true);
    ctx();
    opts = o || { mode: 'metro' };
    T.mode = opts.mode; T.owner = opts.owner || opts.mode; T.playing = true;
    ending = false; next = ac.currentTime + 0.08; sub = 0; beat = 0; bar = 0;
    T.countInBars = KS.state.countIn ? 1 : 0;
    timer = setInterval(tick, 25);
    tick();
    KS.emit('transport', { playing: true, mode: T.mode, owner: T.owner });
  };
  T.stop = (silent) => {
    if (timer) clearInterval(timer);
    timer = null;
    uiTimers.forEach(clearTimeout); uiTimers = [];
    const wasPlaying = T.playing;
    const o = opts;
    T.playing = false; T.mode = null; T.owner = null; opts = null;
    hush();
    if (o && o.onStop) o.onStop();
    if (!silent || wasPlaying) KS.emit('transport', { playing: false });
  };
  KS.transport = T;
})(window.KS);
