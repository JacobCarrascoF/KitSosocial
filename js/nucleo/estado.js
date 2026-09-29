/* Kit Sosocial — estado compartido, guardado local y eventos */
window.KS = window.KS || {};
(function (KS) {
  const KEY = 'kit-sosocial-v1';
  const DEF = {
    chords: ['C', 'F', 'G', 'C'],
    lang: 'es',
    noteNames: 'lat',
    bpm: 80,
    sig: '4/4',
    beats: 4,
    subdiv: 1,
    accent: true,
    countIn: true,
    clickOn: true,
    loop: true,
    barsPerChord: 1,
    trainer: { on: false, to: 120, step: 5, every: 4 },
    piano: { level: 2, lh: false },
    bajo: { level: 1, up8: false }
  };
  const clone = o => JSON.parse(JSON.stringify(o));
  const st = clone(DEF);

  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved) {
      for (const k in saved) {
        if (!(k in DEF)) continue;
        const d = DEF[k];
        st[k] = (d && typeof d === 'object' && !Array.isArray(d)) ? Object.assign(clone(d), saved[k]) : saved[k];
      }
    }
  } catch (e) {}

  // Un enlace compartido (?acordes=C,G,Am,F&bpm=90) tiene prioridad sobre lo guardado
  try {
    const q = new URLSearchParams(location.search);
    const a = q.get('acordes');
    if (a) {
      const list = a.split(',').map(s => s.trim()).filter(Boolean).slice(0, 8);
      if (list.length) st.chords = list;
    }
    const b = parseInt(q.get('bpm'), 10);
    if (b >= 30 && b <= 240) st.bpm = b;
    const l = q.get('lang');
    if (l === 'es' || l === 'ca') st.lang = l;
  } catch (e) {}

  if (!Array.isArray(st.chords) || !st.chords.length) st.chords = clone(DEF.chords);

  KS.state = st;
  KS.save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };

  const listeners = {};
  KS.on = (ev, fn) => { (listeners[ev] = listeners[ev] || []).push(fn); };
  KS.emit = (ev, data) => {
    (listeners[ev] || []).forEach(fn => { try { fn(data); } catch (e) { console.error(e); } });
  };

  KS.views = {};
})(window.KS);
