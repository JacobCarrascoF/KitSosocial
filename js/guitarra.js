/* Kit Sosocial — Guitarra: diagramas por niveles (al aire, cejilla, tríadas, 4 notas) y camino más cómodo */
(function (KS) {
  const t = KS.t;
  // Índice 0 = 6ª cuerda (E grave) … índice 5 = 1ª cuerda (E aguda)
  const OPEN = [40, 45, 50, 55, 59, 64];
  const MAXF = 14;
  const G = () => KS.state.guitarra;
  const X = 'x';

  /* ---------- Nivel 1: acordes al aire (digitaciones clásicas) ---------- */
  const OPEN_LIB = [
    ['C', [X, 3, 2, 0, 1, 0], [0, 3, 2, 0, 1, 0]], ['C7', [X, 3, 2, 3, 1, 0], [0, 3, 2, 4, 1, 0]],
    ['Cmaj7', [X, 3, 2, 0, 0, 0], [0, 3, 2, 0, 0, 0]], ['Cadd9', [X, 3, 2, 0, 3, 0], [0, 2, 1, 0, 3, 0]],
    ['D', [X, X, 0, 2, 3, 2], [0, 0, 0, 1, 3, 2]], ['Dm', [X, X, 0, 2, 3, 1], [0, 0, 0, 2, 3, 1]],
    ['D7', [X, X, 0, 2, 1, 2], [0, 0, 0, 2, 1, 3]], ['Dm7', [X, X, 0, 2, 1, 1], [0, 0, 0, 2, 1, 1]],
    ['Dmaj7', [X, X, 0, 2, 2, 2], [0, 0, 0, 1, 2, 3]], ['Dsus2', [X, X, 0, 2, 3, 0], [0, 0, 0, 1, 3, 0]],
    ['Dsus4', [X, X, 0, 2, 3, 3], [0, 0, 0, 1, 3, 4]],
    ['E', [0, 2, 2, 1, 0, 0], [0, 2, 3, 1, 0, 0]], ['Em', [0, 2, 2, 0, 0, 0], [0, 2, 3, 0, 0, 0]],
    ['E7', [0, 2, 0, 1, 0, 0], [0, 2, 0, 1, 0, 0]], ['Em7', [0, 2, 0, 0, 0, 0], [0, 2, 0, 0, 0, 0]],
    ['Emaj7', [0, 2, 1, 1, 0, 0], [0, 3, 1, 2, 0, 0]], ['Esus4', [0, 2, 2, 2, 0, 0], [0, 2, 3, 4, 0, 0]],
    ['E5', [0, 2, 2, X, X, X], [0, 1, 2, 0, 0, 0]],
    ['F', [X, X, 3, 2, 1, 1], [0, 0, 3, 2, 1, 1]], ['Fmaj7', [X, X, 3, 2, 1, 0], [0, 0, 3, 2, 1, 0]],
    ['G', [3, 2, 0, 0, 0, 3], [2, 1, 0, 0, 0, 3]], ['G7', [3, 2, 0, 0, 0, 1], [3, 2, 0, 0, 0, 1]],
    ['A', [X, 0, 2, 2, 2, 0], [0, 0, 1, 2, 3, 0]], ['Am', [X, 0, 2, 2, 1, 0], [0, 0, 2, 3, 1, 0]],
    ['A7', [X, 0, 2, 0, 2, 0], [0, 0, 2, 0, 3, 0]], ['Am7', [X, 0, 2, 0, 1, 0], [0, 0, 2, 0, 1, 0]],
    ['Amaj7', [X, 0, 2, 1, 2, 0], [0, 0, 2, 1, 3, 0]], ['Asus2', [X, 0, 2, 2, 0, 0], [0, 0, 1, 2, 0, 0]],
    ['Asus4', [X, 0, 2, 2, 3, 0], [0, 0, 1, 2, 3, 0]], ['A5', [X, 0, 2, 2, X, X], [0, 0, 1, 2, 0, 0]],
    ['B7', [X, 2, 1, 2, 0, 2], [0, 2, 1, 3, 0, 4]],
    ['C/E', [0, 3, 2, 0, 1, 0], [0, 3, 2, 0, 1, 0]], ['C/G', [3, 3, 2, 0, 1, 0], [3, 4, 2, 0, 1, 0]],
    ['C/B', [X, 2, 2, 0, 1, 0], [0, 2, 3, 0, 1, 0]], ['G/B', [X, 2, 0, 0, 0, 3], [0, 1, 0, 0, 0, 3]],
    ['D/F#', [2, X, 0, 2, 3, 2], ['P', 0, 0, 1, 3, 2]], ['Am/G', [3, 0, 2, 2, 1, 0], [4, 0, 2, 3, 1, 0]],
    ['F/C', [X, 3, 3, 2, 1, 1], [0, 3, 4, 2, 1, 1]]
  ];
  const keyOf = c => c.root + '|' + c.q + '|' + c.bassPc;
  const openMap = {};
  OPEN_LIB.forEach(([sym, frets, fingers]) => {
    const c = KS.parseChord(sym);
    (openMap[keyOf(c)] = openMap[keyOf(c)] || []).push({ frets, fingers });
  });

  /* ---------- Nivel 2: cejilla (plantillas relativas al traste de la fundamental) ---------- */
  const E_SHAPES = {
    '': [[0, 2, 2, 1, 0, 0], [1, 3, 4, 2, 1, 1]], m: [[0, 2, 2, 0, 0, 0], [1, 3, 4, 1, 1, 1]],
    '7': [[0, 2, 0, 1, 0, 0], [1, 3, 1, 2, 1, 1]], m7: [[0, 2, 0, 0, 0, 0], [1, 3, 1, 1, 1, 1]],
    maj7: [[0, X, 1, 1, 0, X], [2, 0, 4, 3, 1, 0]], sus4: [[0, 2, 2, 2, 0, 0], [1, 2, 3, 4, 1, 1]],
    '7sus4': [[0, 2, 0, 2, 0, 0], [1, 3, 1, 4, 1, 1]], m7b5: [[0, X, 0, 0, -1, X], [2, 0, 3, 4, 1, 0]],
    dim7: [[0, X, -1, 0, -1, X], [2, 0, 1, 3, 1, 0]], '5': [[0, 2, 2, X, X, X], [1, 3, 4, 0, 0, 0]],
    '6': [[0, X, -1, 1, 0, X], [2, 0, 1, 4, 3, 0]], m6: [[0, X, -1, 0, 0, X], [2, 0, 1, 3, 4, 0]],
    aug: [[0, X, 2, 1, 1, X], [1, 0, 4, 2, 3, 0]]
  };
  const A_SHAPES = {
    '': [[X, 0, 2, 2, 2, 0], [0, 1, 2, 3, 4, 1]], m: [[X, 0, 2, 2, 1, 0], [0, 1, 3, 4, 2, 1]],
    '7': [[X, 0, 2, 0, 2, 0], [0, 1, 3, 1, 4, 1]], m7: [[X, 0, 2, 0, 1, 0], [0, 1, 3, 1, 2, 1]],
    maj7: [[X, 0, 2, 1, 2, 0], [0, 1, 3, 2, 4, 1]], sus2: [[X, 0, 2, 2, 0, 0], [0, 1, 3, 4, 1, 1]],
    sus4: [[X, 0, 2, 2, 3, 0], [0, 1, 2, 3, 4, 1]], '7sus4': [[X, 0, 2, 0, 3, 0], [0, 1, 3, 1, 4, 1]],
    m7b5: [[X, 0, 1, 0, 1, X], [0, 1, 3, 2, 4, 0]], dim7: [[X, 0, 1, -1, 1, X], [0, 2, 3, 1, 4, 0]],
    dim: [[X, 0, 1, 2, 1, X], [0, 1, 2, 4, 3, 0]], '6': [[X, 0, 2, 2, 2, 2], [0, 1, 3, 3, 3, 3]],
    '9': [[X, 0, -1, 0, 0, 0], [0, 2, 1, 3, 3, 3]], '5': [[X, 0, 2, 2, X, X], [0, 1, 3, 4, 0, 0]]
  };
  function fromShape(shape, r, type) {
    const [off, fing] = shape;
    const frets = off.map(o => (o === X ? X : r + o));
    if (frets.some(f => f !== X && (f < 1 || f > MAXF))) return null;
    return { frets, fingers: fing.slice(), type };
  }

  /* ---------- Niveles 3 y 4: búsqueda en cuerdas contiguas ---------- */
  const SETS3 = [[3, 4, 5, '1-2-3'], [2, 3, 4, '2-3-4'], [1, 2, 3, '3-4-5'], [0, 1, 2, '4-5-6']];
  const SETS4 = [[2, 3, 4, 5, '1-2-3-4'], [1, 2, 3, 4, '2-3-4-5']];
  function searchOn(set, req, maxSpan) {
    const idx = set.slice(0, -1), label = set[set.length - 1], out = [];
    const rec = (i, fr) => {
      if (i === idx.length) {
        const pcs = fr.map((f, j) => (OPEN[idx[j]] + f) % 12);
        if (new Set(pcs).size !== req.length || !req.every(p => pcs.includes(p))) return;
        const fretted = fr.filter(f => f > 0);
        if (fretted.length && Math.max(...fretted) - Math.min(...fretted) > maxSpan) return;
        if (fr.includes(0) && fretted.length && Math.max(...fretted) > 4) return;
        const frets = [X, X, X, X, X, X];
        idx.forEach((s, j) => { frets[s] = fr[j]; });
        out.push({ frets, label });
        return;
      }
      for (let f = 0; f <= MAXF - 2; f++) { fr.push(f); rec(i + 1, fr); fr.pop(); }
    };
    rec(0, []);
    return out;
  }
  function autoFingers(frets) {
    const out = frets.map(() => 0);
    const notes = frets.map((f, i) => [f, i]).filter(([f]) => f !== X && f > 0).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    if (!notes.length) return out;
    const min = notes[0][0];
    let last = 0, lastF = -1;
    notes.forEach(([f, i]) => {
      let fg = Math.max(f - min + 1, f === lastF ? last + 1 : last + (f > lastF ? 1 : 0));
      if (fg > 4) fg = 4;
      out[i] = fg; last = fg; lastF = f;
    });
    return out;
  }

  /* ---------- Todos los diagramas de un acorde ---------- */
  const notesOf = v => v.frets.map((f, i) => (f === X ? null : OPEN[i] + f)).filter(m => m != null);
  function finish(v, level) {
    v.level = level;
    v.notes = notesOf(v);
    const fr = v.frets.filter(f => f !== X && f > 0);
    v.pos = fr.length ? fr.reduce((a, b) => a + b, 0) / fr.length : 0;
    v.id = v.frets.join(',');
    return v;
  }
  function byLevel(ch, level) {
    const out = [];
    if (level === 1) {
      (openMap[keyOf(ch)] || []).forEach(o => out.push({ frets: o.frets.slice(), fingers: o.fingers.slice(), type: t('type_open') }));
      if (!out.length && ch.slash) (openMap[ch.root + '|' + ch.q + '|' + ch.root] || []).forEach(o => out.push({ frets: o.frets.slice(), fingers: o.fingers.slice(), type: t('type_open') }));
    } else if (level === 2) {
      const e = E_SHAPES[ch.q], a = A_SHAPES[ch.q];
      if (e) { const r = (ch.root - 4 + 12) % 12 || 12; [r, r + 12].forEach(rr => { const v = fromShape(e, rr, t('type_E')); if (v) out.push(v); }); }
      if (a) { const r = (ch.root - 9 + 12) % 12 || 12; [r, r + 12].forEach(rr => { const v = fromShape(a, rr, t('type_A')); if (v) out.push(v); }); }
    } else if (level === 3) {
      if (ch.pcs.length >= 3) {
        const req = ch.pcs.slice(0, 3);
        SETS3.forEach(set => searchOn(set, req, 3).forEach(v => { v.fingers = autoFingers(v.frets); v.type = t('type_tri', { s: v.label }); out.push(v); }));
      }
    } else if (level === 4) {
      if (ch.pcs.length >= 4) {
        const iv = KS.QUALITIES[ch.q][0];
        const req = ch.pcs.length > 4 ? ch.pcs.filter((p, i) => iv[i] !== 7) : ch.pcs;
        if (req.length === 4) SETS4.forEach(set => searchOn(set, req, 3).forEach(v => { v.fingers = autoFingers(v.frets); v.type = t('type_4', { s: v.label }); out.push(v); }));
      }
    }
    return out.map(v => finish(v, level));
  }
  function voicings(ch) {
    const lv = G().levels.slice().sort();
    let list = [], out = false;
    lv.forEach(l => { list = list.concat(byLevel(ch, l)); });
    if (!list.length) {
      for (const l of [1, 2, 3, 4]) { if (!lv.includes(l)) { list = byLevel(ch, l); if (list.length) { out = true; break; } } }
    }
    let bassWarn = false;
    if (ch.slash) {
      const ok = list.filter(v => v.notes[0] % 12 === ch.bassPc);
      if (ok.length) list = ok;
      else {
        let alt = [];
        for (const l of [1, 3, 2, 4]) { alt = byLevel(ch, l).filter(v => v.notes[0] % 12 === ch.bassPc); if (alt.length) break; }
        if (alt.length) { list = alt; out = true; } else bassWarn = true;
      }
    }
    const seen = new Set();
    list = list.filter(v => (seen.has(v.id) ? false : (seen.add(v.id), true)));
    list.sort((a, b) => a.level - b.level || a.pos - b.pos);
    list.forEach(v => { v.out = out; v.bassWarn = bassWarn; });
    return list;
  }

  /* ---------- Movimiento entre diagramas ---------- */
  function held(a, b) { let n = 0; for (let i = 0; i < 6; i++) if (a.frets[i] !== X && a.frets[i] > 0 && a.frets[i] === b.frets[i]) n++; return n; }
  function changed(a, b) { let n = 0; for (let i = 0; i < 6; i++) if (b.frets[i] !== X && b.frets[i] > 0 && a.frets[i] !== b.frets[i]) n++; return n; }
  const shift = (a, b) => (a.pos && b.pos ? Math.abs(a.pos - b.pos) : 0);
  const cost = (a, b) => shift(a, b) + 0.35 * changed(a, b) - 0.4 * held(a, b) + 0.03 * KS.voice.cost(a.notes, b.notes);
  function bestFrom(all, start) {
    let layer = [{ v: start, c: 0, back: null }];
    for (let k = 1; k < all.length; k++) {
      layer = all[k].map(v => {
        let best = null, bc = Infinity;
        layer.forEach(p => { const c = p.c + cost(p.v, v); if (c < bc) { bc = c; best = p; } });
        return { v, c: bc, back: best };
      });
    }
    let end = layer.reduce((a, b) => (b.c < a.c ? b : a));
    const path = []; while (end) { path.unshift(end.v); end = end.back; }
    return path;
  }
  const pathCost = p => p.reduce((s, v, k) => s + (k ? cost(p[k - 1], v) : 0), 0);
  const pathFrets = p => Math.round(p.reduce((s, v, k) => s + (k ? shift(p[k - 1], v) : 0), 0));

  /* ---------- Diagrama ---------- */
  function diagram(v, common) {
    const W = 110, H = 128, L = 26, T = 22, sw = 13, fh = 19, rows = 5;
    const fr = v.frets.filter(f => f !== X && f > 0);
    const maxF = fr.length ? Math.max(...fr) : 0, minF = fr.length ? Math.min(...fr) : 0;
    const base = maxF <= 5 ? 1 : minF;
    const sx = i => L + i * sw, fy = f => T + (f - base + 0.5) * fh;
    let h = `<svg class="gd" viewBox="0 0 ${W} ${H}" aria-hidden="true">`;
    for (let i = 0; i < 6; i++) h += `<line class="g-str" x1="${sx(i)}" y1="${T}" x2="${sx(i)}" y2="${T + rows * fh}" stroke-width="${1.6 - i * 0.15}"/>`;
    for (let j = 0; j <= rows; j++) h += `<line class="g-fret" x1="${sx(0)}" y1="${T + j * fh}" x2="${sx(5)}" y2="${T + j * fh}"/>`;
    if (base === 1) h += `<rect class="g-nut" x="${sx(0) - 1}" y="${T - 4}" width="${sx(5) - sx(0) + 2}" height="4"/>`;
    else h += ` <text class="g-base" x="${L - 10}" y="${T + fh * 0.5 + 4}" text-anchor="end">T${base}</text>`;
    // cejilla
    const ones = v.fingers.map((f, i) => (f === 1 && v.frets[i] === minF ? i : -1)).filter(i => i >= 0);
    if (ones.length >= 2) h += `<rect class="g-barre" x="${sx(ones[0]) - 6}" y="${fy(minF) - 6}" width="${sx(ones[ones.length - 1]) - sx(ones[0]) + 12}" height="12" rx="6"/>`;
    v.frets.forEach((f, i) => {
      const pc = f === X ? null : (OPEN[i] + f) % 12, com = pc != null && common.includes(pc);
      if (f === X) h += `<text class="g-x" x="${sx(i)}" y="${T - 8}" text-anchor="middle">×</text>`;
      else if (f === 0) h += `<circle class="g-open${com ? ' c' : ''}" cx="${sx(i)}" cy="${T - 11}" r="4"/>`;
      else {
        h += `<circle class="g-dot${com ? ' c' : ''}" cx="${sx(i)}" cy="${fy(f)}" r="6"/>`;
        if (v.fingers[i]) h += `<text class="g-fg" x="${sx(i)}" y="${fy(f) + 3.5}" text-anchor="middle">${v.fingers[i]}</text>`;
      }
    });
    ['E', 'A', 'D', 'G', 'B', 'E'].forEach((n, i) => { h += `<text class="g-sn" x="${sx(i)}" y="${H - 3}" text-anchor="middle">${n}</text>`; });
    return h + '</svg>';
  }
  const posTag = v => { const fr = v.frets.filter(f => f !== X && f > 0); return fr.length && Math.max(...fr) > 5 ? ' · T' + Math.min(...fr) : ''; };
  const notesTxt = (v, ch, common) => v.notes.map(m => {
    const n = KS.noteName(m % 12, ch);
    return common.includes(m % 12) ? `<span class="c">${n}</span>` : n;
  }).join(' · ');

  function moveTxt(prev, v) {
    if (!prev) return t('start_point');
    const d = Math.round(shift(prev, v)), hf = held(prev, v), parts = [];
    parts.push(d === 0 ? t('g_same_zone') : d === 1 ? t('hand_move1') : t('hand_move', { n: d }));
    if (hf) parts.push(`<span class="held">${hf === 1 ? t('held_fingers1') : t('held_fingers', { n: hf })}</span>`);
    return parts.join('<br>');
  }

  /* ---------- Tarjetas ---------- */
  let paths = {}, customSel = null, lastKey = '';
  function stepsHTML(chs, path, all, custom) {
    return path.map((v, k) => {
      const ch = chs[k], prev = k ? path[k - 1] : null;
      const common = k ? ch.pcs.filter(p => chs[k - 1].pcs.includes(p)) : [];
      const tags = [v.type];
      if (v.out) tags.push(t('g_outlevel'));
      if (v.bassWarn) tags.push(t('g_bass_should', { n: KS.noteName(ch.bassPc, ch) }));
      const sel = custom
        ? `<select class="gsel" data-gk="${k}" aria-label="${t('g_choose')} ${ch.sym}">` + all[k].map((o, i) => `<option value="${i}" ${o.id === v.id ? 'selected' : ''}>${o.type}${posTag(o)}</option>`).join('') + '</select>'
        : '';
      return `<div class="step gstep"><div class="sh"><b>${ch.sym}</b><span>${tags.join('<br>')}</span></div>
        <button type="button" class="kbbtn gbtn" data-gplay="${k}" aria-label="${t('play')} ${ch.sym}">${diagram(v, common)}</button>
        <div class="notes">${notesTxt(v, ch, common)}</div>${sel}
        <div class="mv">${moveTxt(prev, v)}</div></div>`;
    }).join('');
  }
  function card(id, title, chs, path, all, opts) {
    paths[id] = { chs, path };
    const fr = pathFrets(path), hf = path.reduce((s, v, k) => s + (k ? held(path[k - 1], v) : 0), 0);
    const pct = Math.round(Math.min(fr / Math.max(opts.max, 1), 1) * 100);
    const meta = t('frets_moved', { n: fr }) + (hf ? ' · ' + (hf === 1 ? t('held_fingers1') : t('held_fingers', { n: hf })) : '');
    return `<div class="path${opts.best ? ' best' : ''}" data-path="${id}">
      <div class="phead"><div class="ptitle">${title}${opts.best ? `<span class="badge">${t('best')}</span>` : ''}</div>
      <div class="pmeta"><div class="meter"><div class="bar"><span style="width:${pct}%"></span></div>${meta}${opts.note ? ' · ' + opts.note : ''}</div>
      <button type="button" data-playpath="${id}">${t('play')}</button></div></div>
      <div class="steps gsteps">${stepsHTML(chs, path, all, opts.custom)}</div></div>`;
  }

  function playPath(id) {
    const T = KS.transport;
    if (T.playing && T.owner === 'guitarra:' + id) { T.stop(); return; }
    const p = paths[id]; if (!p) return;
    const mark = k => document.querySelectorAll(`[data-path="${id}"] .step`).forEach((s, i) => s.classList.toggle('playing', i === k));
    T.start({
      mode: 'prog', owner: 'guitarra:' + id,
      steps: p.path.map(v => ({ notes: v.notes, strum: true, every: G().every })),
      onStep: mark, onStop: () => mark(-1)
    });
  }
  function syncButtons() {
    if (document.body.dataset.view !== 'guitarra') return;
    const T = KS.transport;
    document.querySelectorAll('#view [data-playpath]').forEach(b => {
      const on = T.playing && T.owner === 'guitarra:' + b.dataset.playpath;
      b.textContent = on ? t('stop') : t('play');
      b.classList.toggle('on', on);
    });
  }
  KS.on('transport', syncButtons);

  function customCard(chs, all, bestCost, bestFr) {
    const path = customSel.map((i, k) => all[k][i]);
    const fr = pathFrets(path);
    return card('custom', t('your_version'), chs, path, all, {
      custom: true, max: Math.max(fr, bestFr, 1),
      note: fr === bestFr ? t('same_best') : t('best_is', { n: bestFr })
    });
  }

  function render(el) {
    const st = KS.state, lv = G().levels, res = KS.chords();
    paths = {};
    const lvls = [1, 2, 3, 4].map(n => `<button type="button" class="lvl${lv.includes(n) ? ' on' : ''}" data-glevel="${n}" aria-pressed="${lv.includes(n)}"><b>${t('level')} ${n}</b><span>${t('g_l' + n)}</span><small>${t('g_l' + n + 'd')}</small></button>`).join('');
    let h = `<div class="vhead"><h1>${t('tab_guitarra')}</h1><p>${t('g_desc')}</p></div>
      <div class="levels" role="group" aria-label="${t('level')}">${lvls}</div>
      <p class="sub">${t('g_levels_hint')}</p>
      <div class="row">
        <label class="ck">${t('g_strum')} <select id="gEvery"><option value="0">${t('strum_bar')}</option><option value="1">${t('strum_beat')}</option></select></label>
        <label class="ck">${t('bars_per_chord')} <select id="gBars"><option value="1">1</option><option value="2">2</option><option value="4">4</option></select></label>
        <label class="ck"><input type="checkbox" id="gClick" ${st.clickOn ? 'checked' : ''}> ${t('click_on')}</label>
        <label class="ck"><input type="checkbox" id="gLoop" ${st.loop ? 'checked' : ''}> ${t('loop')}</label>
      </div>
      <div class="legend"><span><i class="sw" style="background:var(--guitarra)"></i>${t('legend_note')}</span><span><i class="sw" style="background:var(--amber)"></i>${t('legend_common')}</span></div>
      <p class="sub diaghelp">${t('g_diag_help')}</p>`;

    if (!res.ok) { el.innerHTML = h + `<p class="warn">${t('fix_chords')}</p>`; wire(el); return; }
    const chs = res.list;
    h += `<section><h2>${t('common_title')}</h2><p class="sub">${t('common_desc')}</p><div class="chain">${KS.commonChainHTML(chs)}</div></section>`;

    const all = chs.map(voicings);
    if (all.some(a => !a.length)) {
      const bad = chs.filter((c, k) => !all[k].length).map(c => c.sym).join(', ');
      el.innerHTML = h + `<p class="warn">${bad}: ${t('err_unknown')}</p>`; wire(el); return;
    }
    const opts = all[0].map(v => ({ path: bestFrom(all, v) }));
    const seen = new Set();
    const list = opts.filter(o => { const k = o.path.map(v => v.id).join('|'); if (seen.has(k)) return false; seen.add(k); return true; });
    list.forEach(o => { o.c = pathCost(o.path); });
    list.sort((a, b) => a.c - b.c);
    const show = list.slice(0, 4), max = Math.max(...show.map(o => pathFrets(o.path)), 1);
    h += `<section><h2>${t('options')}</h2><p class="sub">${t('g_options_desc')}</p>` +
      show.map((o, i) => card('o' + i, `${chs[0].sym}: ${o.path[0].type}${posTag(o.path[0])}`, chs, o.path, all, { best: i === 0, max })).join('') + '</section>';

    const key = st.chords.join('|') + lv.join('');
    if (!customSel || key !== lastKey) customSel = list[0].path.map((v, k) => all[k].findIndex(o => o.id === v.id));
    lastKey = key;
    const bestCost = list[0].c, bestFr = pathFrets(list[0].path);
    h += `<section><h2>${t('custom')}</h2><p class="sub">${t('g_custom_desc')}</p><div id="gCustom">${customCard(chs, all, bestCost, bestFr)}</div></section>`;

    h += `<section><h2>${t('g_all')}</h2><p class="sub">${t('g_all_desc')}</p>` + chs.map((c, k) =>
      `<div class="gall"><div class="cn"><b>${c.sym}</b><span>${KS.chordName(c)}</span></div><div class="gallgrid">` +
      all[k].map((v, i) => `<button type="button" class="kbbtn gbtn gcell" data-gall="${k}-${i}" aria-label="${t('play')} ${c.sym}">${diagram(v, [])}<span>${v.type}</span></button>`).join('') +
      '</div></div>').join('') + '</section>';

    el.innerHTML = h;
    el._chs = chs; el._all = all; el._best = [bestCost, bestFr];
    wire(el);
    syncButtons();
  }

  function wire(el) {
    const st = KS.state;
    el.querySelectorAll('[data-glevel]').forEach(b => b.onclick = () => {
      const n = +b.dataset.glevel, lv = G().levels;
      if (lv.includes(n)) { if (lv.length > 1) lv.splice(lv.indexOf(n), 1); } else lv.push(n);
      KS.save(); KS.transport.stop(); render(el);
    });
    const ev = el.querySelector('#gEvery'); ev.value = G().every ? '1' : '0';
    ev.onchange = () => { G().every = ev.value === '1'; KS.save(); KS.transport.stop(); };
    const bars = el.querySelector('#gBars'); bars.value = String(st.barsPerChord);
    bars.onchange = () => { st.barsPerChord = +bars.value; KS.save(); };
    el.querySelector('#gClick').onchange = e => { st.clickOn = e.target.checked; KS.save(); };
    el.querySelector('#gLoop').onchange = e => { st.loop = e.target.checked; KS.save(); };
    el.onchange = (e) => {
      const s = e.target.closest('.gsel');
      if (!s) return;
      customSel[+s.dataset.gk] = +s.value;
      if (KS.transport.owner === 'guitarra:custom') KS.transport.stop();
      el.querySelector('#gCustom').innerHTML = customCard(el._chs, el._all, el._best[0], el._best[1]);
      syncButtons();
    };
    el.onclick = (e) => {
      const pp = e.target.closest('[data-playpath]'); if (pp) { playPath(pp.dataset.playpath); return; }
      const gp = e.target.closest('[data-gplay]');
      if (gp) { const p = paths[gp.closest('[data-path]').dataset.path]; KS.audio.strum(p.path[+gp.dataset.gplay].notes); return; }
      const ga = e.target.closest('[data-gall]');
      if (ga) { const [k, i] = ga.dataset.gall.split('-').map(Number); KS.audio.strum(el._all[k][i].notes); }
    };
  }

  KS.views.guitarra = { render };
})(window.KS);
