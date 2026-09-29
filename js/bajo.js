/* Kit Sosocial — Bajo: posiciones C3T3, camino más corto, patrones por niveles y tablatura */
(function (KS) {
  const t = KS.t;
  // Cuerda 1 = la más fina (G). Notas MIDI al aire de un bajo de 4 cuerdas.
  const STR = [{ n: 1, open: 43, nm: 'G' }, { n: 2, open: 38, nm: 'D' }, { n: 3, open: 33, nm: 'A' }, { n: 4, open: 28, nm: 'E' }];
  const MAXF = 12;
  const PATTERNS = { 1: ['1', '1', '1', '1'], 2: ['1', '5', '8', '5'], 3: ['1', '3', '5', '8'], 4: ['1', '3', '5', '8'] };

  const B = () => KS.state.bajo;
  const lab = p => 'C' + p.s + 'T' + p.f;
  const posOfMidi = m => STR.filter(s => m - s.open >= 0 && m - s.open <= MAXF).map(s => ({ s: s.n, f: m - s.open, m }));
  const posOfPc = pc => { const out = []; for (let m = 28; m <= 43 + MAXF; m++) if (m % 12 === pc) out.push(...posOfMidi(m)); return out.sort((a, b) => a.f - b.f || b.s - a.s); };
  const moveCost = (hand, p) => (p.f === 0 || hand == null ? 0 : Math.abs(p.f - hand));
  const nextHand = (hand, p) => (p.f === 0 ? hand : p.f);

  function intervals(ch) {
    const iv = KS.QUALITIES[ch.q][0].map(x => x % 12);
    const third = [4, 3, 2, 5].find(x => iv.includes(x));
    const fifth = [7, 6, 8].find(x => iv.includes(x));
    return { third: third == null ? 7 : third, fifth: fifth == null ? 7 : fifth };
  }

  /* ---------- Camino de la mano (la nota del bajo de cada acorde) ---------- */
  function bestPath(chs, start) {
    let layer = [{ p: start, hand: start.f || null, cost: 0, back: null }];
    for (let k = 1; k < chs.length; k++) {
      const map = new Map();
      layer.forEach(prev => posOfPc(chs[k].bassPc).forEach(p => {
        const c = prev.cost + moveCost(prev.hand, p) + 0.05 * Math.abs(p.m - prev.p.m) + (p.s !== prev.p.s ? 0.1 : 0) + 0.02 * p.f;
        const hand = nextHand(prev.hand, p), key = lab(p) + '|' + hand;
        if (!map.has(key) || map.get(key).cost > c) map.set(key, { p, hand, cost: c, back: prev });
      }));
      layer = [...map.values()];
    }
    let end = layer.reduce((a, b) => (b.cost < a.cost ? b : a));
    const out = [];
    while (end) { out.unshift({ p: end.p, hand: end.hand }); end = end.back; }
    return out;
  }
  function pathFromPositions(list) {
    let hand = null;
    return list.map(p => { hand = nextHand(hand, p); return { p, hand }; });
  }
  const totalMove = path => path.reduce((s, a, k) => s + (k ? moveCost(path[k - 1].hand, a.p) : 0), 0);

  /* ---------- Notas de cada acorde según el nivel ---------- */
  function windowDist(f, h) {
    if (h == null) return f <= 4 ? 0 : f - 4;
    if (f >= h - 1 && f <= h + 3) return 0;
    return f < h - 1 ? h - 1 - f : f - (h + 3);
  }
  function pickNear(hand, alts) {
    let best = null, bc = Infinity;
    alts.forEach(([mm, pen]) => posOfMidi(mm).forEach(p => {
      const c = (p.f === 0 ? 0.4 : windowDist(p.f, hand)) + pen;
      if (c < bc) { bc = c; best = p; }
    }));
    return best;
  }
  function seqFor(ch, a, next, level, n) {
    const hand = a.hand;
    const { third, fifth } = intervals(ch);
    const rootMidi = a.p.m - ((ch.bassPc - ch.root + 12) % 12);
    const alts = m => [[m, 0], [m - 12, 1], [m + 12, 1.5]];
    const tones = {
      '1': a.p,
      '3': pickNear(hand, alts(rootMidi + third)) || a.p,
      '5': pickNear(hand, alts(rootMidi + fifth)) || a.p,
      '8': pickNear(hand, [[a.p.m + 12, 0]]) || pickNear(hand, alts(rootMidi + fifth)) || a.p
    };
    let app = null;
    if (next) app = next.p.f >= 1 ? { s: next.p.s, f: next.p.f - 1, m: next.p.m - 1, below: true } : { s: next.p.s, f: 1, m: next.p.m + 1, below: false };
    const pat = PATTERNS[level], seq = [];
    for (let i = 0; i < n; i++) {
      if (level === 4 && i === n - 1 && app) seq.push({ tag: '→', p: app });
      else { const tag = pat[i % pat.length]; seq.push({ tag, p: tones[tag] }); }
    }
    return seq;
  }
  function buildSeqs(chs, path) {
    const st = KS.state, n = st.beats * st.barsPerChord, level = B().level;
    return path.map((a, k) => seqFor(chs[k], a, path[(k + 1) % path.length], level, n));
  }

  /* ---------- Dibujo ---------- */
  function fretboard(marks, alts) {
    const cw = 22, rh = 15, L = 16, T = 5, W = L + cw * (MAXF + 1) + 4, H = T + rh * 4 + 13;
    const X = f => L + cw * f + cw / 2, Y = s => T + rh * (s - 1) + rh / 2;
    let h = `<svg class="fb" viewBox="0 0 ${W} ${H}" aria-hidden="true">`;
    STR.forEach(s => {
      h += `<line class="fb-str" x1="${L}" y1="${Y(s.n)}" x2="${L + cw * (MAXF + 1)}" y2="${Y(s.n)}" stroke-width="${0.8 + s.n * 0.35}"/>`;
      h += `<text class="fb-lbl" x="${L - 5}" y="${Y(s.n) + 3}" text-anchor="end">${s.nm}</text>`;
    });
    h += `<rect class="fb-nut" x="${L + cw - 1.5}" y="${Y(1) - 4}" width="3" height="${Y(4) - Y(1) + 8}"/>`;
    for (let f = 2; f <= MAXF + 1; f++) h += `<line class="fb-fret" x1="${L + cw * f}" y1="${Y(1) - 4}" x2="${L + cw * f}" y2="${Y(4) + 4}"/>`;
    [0, 3, 5, 7, 9, 12].forEach(f => { h += `<text class="fb-num" x="${X(f)}" y="${H - 2}" text-anchor="middle">${f}</text>`; });
    (alts || []).forEach(p => { h += `<circle class="fb-alt" data-m="${p.m}" cx="${X(p.f)}" cy="${Y(p.s)}" r="5.5"/>`; });
    const seen = new Set();
    marks.forEach(mk => {
      if (seen.has(lab(mk.p))) return;
      seen.add(lab(mk.p));
      const cls = mk.tag === '1' ? 'fb-root' : mk.tag === '→' ? 'fb-app' : 'fb-tone';
      h += `<g class="${cls}" data-m="${mk.p.m}"><circle cx="${X(mk.p.f)}" cy="${Y(mk.p.s)}" r="6.8"/><text x="${X(mk.p.f)}" y="${Y(mk.p.s) + 3}" text-anchor="middle">${mk.tag}</text></g>`;
    });
    return h + '</svg>';
  }
  const noteLbl = (p, flat) => `${KS.noteName(p.m % 12, flat)} <span class="pos">${lab(p)}</span>`;

  function handText(prev, a) {
    if (!prev) return t('start_point');
    if (a.p.f === 0) return t('hand_open');
    const d = moveCost(prev.hand, a.p);
    if (d === 0) return t('hand_same', { f: a.p.f });
    return d === 1 ? t('hand_move1') : t('hand_move', { n: d });
  }

  function stepsHTML(chs, path, seqs, opts) {
    return path.map((a, k) => {
      const ch = chs[k], seq = seqs[k];
      const chips = [], seen = new Set();
      seq.forEach(x => {
        const key = x.tag + lab(x.p);
        if (seen.has(key)) return;
        seen.add(key);
        const flat = x.tag === '→' ? !x.p.below : ch.flat;
        chips.push(`<span class="chip t${x.tag === '→' ? 'a' : x.tag}"><b>${x.tag}</b> ${noteLbl(x.p, flat)}</span>`);
      });
      const alts = opts.alts ? posOfPc(ch.bassPc).filter(p => lab(p) !== lab(a.p)) : null;
      const sel = opts.custom
        ? '<div class="invbtns">' + posOfPc(ch.bassPc).map((p, i) => `<button type="button" data-bk="${k}" data-bi="${i}" class="${lab(p) === lab(a.p) ? 'on' : ''}">${lab(p)}</button>`).join('') + '</div>'
        : '';
      const extra = ch.slash ? `<span>${t('slash_note', { n: KS.noteName(ch.bassPc, ch.flat) })}</span>` : '';
      return `<div class="step bstep"><div class="sh"><b>${ch.sym}</b>${extra}</div>
        <button type="button" class="kbbtn" data-bplay="${k}" aria-label="${t('play')} ${ch.sym}">${fretboard(seq, alts)}</button>
        <div class="chips">${chips.join('')}</div>${sel}
        <div class="mv">${handText(k ? path[k - 1] : null, a)}</div></div>`;
    }).join('');
  }

  function tabHTML(chs, seqs) {
    return '<div class="tab">' + seqs.map((seq, k) => {
      const n = seq.length;
      let h = `<div class="tb"><div class="tbh">${chs[k].sym}</div>`;
      STR.forEach(s => {
        h += `<div class="tr">${k === 0 ? `<span class="sn">${s.nm}</span>|` : ''}` +
          seq.map((x, j) => `<span class="tc" data-col="${k * n + j}">-${x.p.s === s.n ? String(x.p.f).padEnd(2, '-') : '--'}</span>`).join('') + '-|</div>';
      });
      return h + '</div>';
    }).join('') + '</div>';
  }

  /* ---------- Tarjetas de opción ---------- */
  let paths = {}, customIdx = null, lastKey = '';

  function card(id, title, chs, path, opts) {
    const seqs = buildSeqs(chs, path), tot = totalMove(path);
    paths[id] = { chs, path, seqs };
    const pct = Math.round(Math.min(tot / Math.max(opts.max, 1), 1) * 100);
    return `<div class="path${opts.best ? ' best' : ''}" data-path="${id}">
      <div class="phead"><div class="ptitle">${title}${opts.best ? `<span class="badge">${t('best')}</span>` : ''}</div>
      <div class="pmeta"><div class="meter"><div class="bar"><span style="width:${pct}%"></span></div>${t('frets_moved', { n: tot })}${opts.note ? ' · ' + opts.note : ''}</div>
      <button type="button" data-playpath="${id}">${t('play')}</button></div></div>
      <div class="steps bsteps">${stepsHTML(chs, path, seqs, opts)}</div>
      ${opts.tab ? `<h3 class="tabh">${t('tab')}</h3><p class="sub">${t('tab_desc')}</p>${tabHTML(chs, seqs)}` : ''}</div>`;
  }

  const upMidi = m => m + (B().up8 ? 12 : 0);
  function playPath(id) {
    const T = KS.transport;
    if (T.playing && T.owner === 'bajo:' + id) { T.stop(); return; }
    const p = paths[id]; if (!p) return;
    const n = p.seqs[0].length;
    const q = s => document.querySelectorAll(`[data-path="${id}"] ${s}`);
    const markStep = k => q('.step').forEach((s, i) => s.classList.toggle('playing', i === k));
    const markCol = c => q('.tc').forEach(x => x.classList.toggle('now', +x.dataset.col === c));
    T.start({
      mode: 'prog', owner: 'bajo:' + id,
      steps: p.seqs.map(seq => ({ seq: seq.map(x => upMidi(x.p.m)) })),
      onStep: markStep, onBeat: (k, j) => markCol(k * n + j),
      onStop: () => { markStep(-1); markCol(-1); }
    });
  }
  function syncButtons() {
    if (document.body.dataset.view !== 'bajo') return;
    const T = KS.transport;
    document.querySelectorAll('#view [data-playpath]').forEach(b => {
      const on = T.playing && T.owner === 'bajo:' + b.dataset.playpath;
      b.textContent = on ? t('stop') : t('play');
      b.classList.toggle('on', on);
    });
  }
  KS.on('transport', syncButtons);

  function customCard(chs, bestTot) {
    const list = customIdx.map((i, k) => posOfPc(chs[k].bassPc)[i]);
    const path = pathFromPositions(list), tot = totalMove(path);
    return card('custom', t('your_version'), chs, path, {
      custom: true, tab: true, max: Math.max(tot, bestTot, 1),
      note: tot === bestTot ? t('same_best') : t('best_is', { n: bestTot })
    });
  }

  function render(el) {
    const st = KS.state, lvl = B().level, res = KS.chords();
    paths = {};
    const lvls = [1, 2, 3, 4].map(n => `<button type="button" class="lvl${lvl === n ? ' on' : ''}" data-blevel="${n}"><b>${t('level')} ${n}</b><span>${t('b_l' + n)}</span><small>${t('b_l' + n + 'd')}</small></button>`).join('');
    let h = `<div class="vhead"><h1>${t('tab_bajo')}</h1><p>${t('bajo_desc')}</p><p class="poslegend"><span class="pos">C3T3</span> ${t('pos_legend')}</p></div>
      <div class="levels" role="group" aria-label="${t('level')}">${lvls}</div>
      <div class="row">
        <label class="ck">${t('bars_per_chord')} <select id="bBars"><option value="1">1</option><option value="2">2</option><option value="4">4</option></select></label>
        <label class="ck"><input type="checkbox" id="bClick" ${st.clickOn ? 'checked' : ''}> ${t('click_on')}</label>
        <label class="ck"><input type="checkbox" id="bLoop" ${st.loop ? 'checked' : ''}> ${t('loop')}</label>
        <label class="ck"><input type="checkbox" id="bUp" ${B().up8 ? 'checked' : ''}> ${t('b_up8')}</label>
      </div>
      <div class="legend"><span><i class="sw" style="background:var(--bajo)"></i>${t('legend_root')}</span>` +
      (lvl > 1 ? `<span><i class="sw sw-tone"></i>${t('legend_tones')}</span>` : '') +
      (lvl === 4 ? `<span><i class="sw sw-app"></i>${t('legend_app')}</span>` : '') +
      (lvl === 1 ? `<span><i class="sw sw-alt"></i>${t('legend_alt')}</span>` : '') + '</div>';

    if (!res.ok) { el.innerHTML = h + `<p class="warn">${t('fix_chords')}</p>`; wire(el); return; }
    const chs = res.list;

    const opts = posOfPc(chs[0].bassPc).map(start => ({ title: t('b_start', { p: lab(start) }), path: bestPath(chs, start) }));
    const seen = new Set();
    const list = opts.filter(o => { const k = o.path.map(a => lab(a.p)).join(); if (seen.has(k)) return false; seen.add(k); return true; });
    list.forEach(o => { o.t = totalMove(o.path) + 0.001 * o.path.reduce((s, a) => s + a.p.f, 0); });
    list.sort((a, b) => a.t - b.t);
    const show = list.slice(0, 4), max = Math.max(...show.map(o => totalMove(o.path)), 1);
    const bestTot = totalMove(list[0].path);

    h += `<section><h2>${t('options')}</h2><p class="sub">${t('b_options_desc')}</p>` +
      show.map((o, i) => card('o' + i, o.title, chs, o.path, { best: i === 0, tab: i === 0, alts: lvl === 1, max })).join('') + '</section>';

    const key = st.chords.join('|');
    if (!customIdx || key !== lastKey) customIdx = list[0].path.map((a, k) => posOfPc(chs[k].bassPc).findIndex(p => lab(p) === lab(a.p)));
    lastKey = key;
    h += `<section><h2>${t('custom')}</h2><p class="sub">${t('b_custom_desc')}</p><div id="bCustom">${customCard(chs, bestTot)}</div></section>`;

    h += `<section><h2>${t('b_where')}</h2><p class="sub">${t('b_where_desc')}</p><div class="where">` + chs.map(ch => {
      const ps = posOfPc(ch.bassPc);
      return `<div class="wcell"><div class="sh"><b>${ch.sym}</b><span>${KS.noteName(ch.bassPc, ch.flat)}</span></div>
        <div class="fbwrap">${fretboard(ps.map(p => ({ tag: '1', p })), null)}</div>
        <div class="chips">${ps.map(p => `<button type="button" class="chip t1" data-m="${p.m}">${lab(p)}</button>`).join('')}</div></div>`;
    }).join('') + '</div></section>';

    el.innerHTML = h;
    el._chs = chs; el._bestTot = bestTot;
    wire(el);
    syncButtons();
  }

  function wire(el) {
    const st = KS.state;
    el.querySelectorAll('[data-blevel]').forEach(b => b.onclick = () => { B().level = +b.dataset.blevel; KS.save(); KS.transport.stop(); render(el); });
    const bars = el.querySelector('#bBars'); bars.value = String(st.barsPerChord);
    bars.onchange = () => { st.barsPerChord = +bars.value; KS.save(); KS.transport.stop(); render(el); };
    el.querySelector('#bClick').onchange = e => { st.clickOn = e.target.checked; KS.save(); };
    el.querySelector('#bLoop').onchange = e => { st.loop = e.target.checked; KS.save(); };
    el.querySelector('#bUp').onchange = e => { B().up8 = e.target.checked; KS.save(); };
    el.onclick = (e) => {
      const pp = e.target.closest('[data-playpath]'); if (pp) { playPath(pp.dataset.playpath); return; }
      const sp = e.target.closest('[data-bplay]');
      if (sp) {
        const p = paths[sp.closest('[data-path]').dataset.path], seq = p.seqs[+sp.dataset.bplay];
        const now = KS.audio.ctx().currentTime;
        seq.forEach((x, i) => KS.audio.bass(upMidi(x.p.m), now + i * 0.3, 0.32));
        return;
      }
      const bi = e.target.closest('[data-bi]');
      if (bi) {
        customIdx[+bi.dataset.bk] = +bi.dataset.bi;
        if (KS.transport.owner === 'bajo:custom') KS.transport.stop();
        el.querySelector('#bCustom').innerHTML = customCard(el._chs, el._bestTot);
        syncButtons(); return;
      }
      const m = e.target.closest('[data-m]');
      if (m) KS.audio.bass(upMidi(+m.dataset.m), null, 0.8);
    };
  }

  KS.views.bajo = { render };
})(window.KS);
