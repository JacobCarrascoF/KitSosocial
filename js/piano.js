/* Kit Sosocial — Piano: posición fundamental, inversiones y acordes completos */
(function (KS) {
  const t = KS.t;
  const LO = 48, HI = 79, CENTER = 64, WHITE = [0, 2, 4, 5, 7, 9, 11];
  const { ctr, cost } = KS.voice;

  const P = () => KS.state.piano;
  const lh = () => P().lh || P().level === 3;

  // Notas que se usan según el nivel: en los niveles 1 y 2 se toca la tríada
  function forLevel(ch) {
    const pcs = P().level < 3 ? ch.pcs.slice(0, Math.min(3, ch.pcs.length)) : ch.pcs;
    return Object.assign({}, ch, { pcs, simplified: pcs.length < ch.pcs.length });
  }
  function offsets(pcs, inv) { const s = pcs[inv]; return pcs.map(p => (p - s + 12) % 12).sort((a, b) => a - b); }
  function cands(ch) {
    const out = [];
    ch.pcs.forEach((p, inv) => {
      const off = offsets(ch.pcs, inv);
      for (let o = 3; o <= 6; o++) {
        const b = p + 12 * o, n = off.map(x => b + x);
        if (n[0] >= LO && n[n.length - 1] <= HI) out.push({ n, inv });
      }
    });
    return out;
  }
  function nearestOfInv(ch, inv, prev) {
    const cs = cands(ch).filter(c => c.inv === inv);
    let best = cs[0], bc = Infinity;
    cs.forEach(c => {
      const v = prev ? cost(prev, c.n) + Math.abs(ctr(c.n) - ctr(prev)) * 0.01 : Math.abs(ctr(c.n) - CENTER);
      if (v < bc) { bc = v; best = c; }
    });
    return best;
  }
  function bestFrom(chs, start) {
    let layer = [{ c: start, cost: 0, back: null }];
    for (let k = 1; k < chs.length; k++) {
      layer = cands(chs[k]).map(c => {
        let best = null, bc = Infinity;
        layer.forEach(p => {
          const v = p.cost + cost(p.c.n, c.n) + Math.abs(ctr(c.n) - CENTER) * 0.05;
          if (v < bc) { bc = v; best = p; }
        });
        return { c, cost: bc, back: best };
      });
    }
    let end = layer.reduce((a, b) => (b.cost < a.cost ? b : a));
    const path = [];
    while (end) { path.unshift(end.c); end = end.back; }
    return path;
  }
  function rootPath(chs) {
    return chs.map(c => cands(c).filter(x => x.inv === 0).reduce((a, b) => (Math.abs(ctr(b.n) - 60) < Math.abs(ctr(a.n) - 60) ? b : a)));
  }
  const total = path => path.reduce((s, c, k) => s + (k ? cost(path[k - 1].n, c.n) : 0), 0);
  const bassMidi = ch => (lh() ? ch.bassPc + 36 : null);

  function keyboard(notes, common, bass) {
    const lo = lh() ? 36 : LO, whites = [];
    for (let m = lo; m <= HI; m++) if (WHITE.includes(m % 12)) whites.push(m);
    const ww = 10, H = 46;
    let s = `<svg class="kb" viewBox="0 0 ${whites.length * ww + 1} ${H + 2}" aria-hidden="true">`;
    whites.forEach((m, i) => {
      let c = 'k-w';
      if (m === bass) c += ' k-bass'; else if (notes.includes(m)) c += common.includes(m % 12) ? ' k-c' : ' k-on';
      s += `<rect class="${c}" x="${i * ww + 0.5}" y="1" width="${ww}" height="${H}" rx="1.5"/>`;
      if (m % 12 === 0) s += `<text class="k-lbl" x="${i * ww + ww / 2 + 0.5}" y="${H - 3}" text-anchor="middle">${m === 60 ? 'C4' : 'C'}</text>`;
    });
    for (let m = lo; m <= HI; m++) {
      if (WHITE.includes(m % 12)) continue;
      const i = whites.findIndex(x => x > m);
      let c = 'k-b';
      if (m === bass) c = 'k-bass'; else if (notes.includes(m)) c = common.includes(m % 12) ? 'k-c' : 'k-on';
      s += `<rect class="${c}" x="${i * ww - 2.7}" y="1" width="6.4" height="${H * 0.6}" rx="1"/>`;
    }
    return s + '</svg>';
  }

  function movesHTML(prev, cur, pch, cch) {
    let pairs;
    if (prev.length === cur.length) pairs = cur.map((m, i) => [prev[i], m]);
    else pairs = cur.map(m => { let b = prev[0]; prev.forEach(p => { if (Math.abs(p - m) < Math.abs(b - m)) b = p; }); return [b, m]; });
    return pairs.reverse().map(([a, b]) => {
      if (a === b) return `<div class="held">${t('held', { n: KS.noteName(b % 12, cch.flat) })}</div>`;
      const d = b - a;
      return `<div>${t(d > 0 ? 'up' : 'down', { a: KS.noteName(a % 12, pch.flat), b: KS.noteName(b % 12, cch.flat) })} <span class="dist">(${Math.abs(d)})</span></div>`;
    }).join('');
  }
  const notesHTML = (n, common, flat) =>
    n.slice().reverse().map(m => (common.includes(m % 12) ? `<span class="c">${KS.noteName(m % 12, flat)}</span>` : KS.noteName(m % 12, flat))).join(' · ');

  function stepsHTML(path, chs, custom) {
    return path.map((c, k) => {
      const ch = chs[k], prev = k ? path[k - 1] : null;
      const common = k ? ch.pcs.filter(p => chs[k - 1].pcs.includes(p)) : [];
      const extra = [t('inv_' + c.inv)];
      if (ch.simplified) extra.push(t('simplified'));
      if (lh()) extra.push(t('bass_lbl', { n: KS.noteName(ch.bassPc, ch.flat) }));
      const inv = custom
        ? '<div class="invbtns">' + ch.pcs.map((_, i) => `<button type="button" data-k="${k}" data-inv="${i}" class="${i === c.inv ? 'on' : ''}" aria-label="${t('inv_' + i)}">${t('invs_' + i)}</button>`).join('') + '</div>'
        : '';
      return `<div class="step"><div class="sh"><b>${ch.sym}</b><span>${extra.join('<br>')}</span></div>
        <button type="button" class="kbbtn" data-play="${k}" aria-label="${t('play')} ${ch.sym}">${keyboard(c.n, common, bassMidi(ch))}</button>
        <div class="notes">${notesHTML(c.n, common, ch.flat)}</div>${inv}
        <div class="mv">${prev ? movesHTML(prev.n, c.n, chs[k - 1], ch) : t('start_point')}</div></div>`;
    }).join('');
  }

  let paths = {}, customInv = null, lastKey = '';

  function pathCard(id, title, path, chs, opts) {
    const tot = total(path);
    const pct = Math.round(Math.min(tot / Math.max(opts.max, 1), 1) * 100);
    paths[id] = { path, chs };
    return `<div class="path${opts.best ? ' best' : ''}" data-path="${id}">
      <div class="phead"><div class="ptitle">${title}${opts.best ? `<span class="badge">${t('best')}</span>` : ''}</div>
      <div class="pmeta"><div class="meter"><div class="bar"><span style="width:${pct}%"></span></div>${t('semitones', { n: tot })}${opts.note ? ' · ' + opts.note : ''}</div>
      <button type="button" data-playpath="${id}">${t('play')}</button></div></div>
      <div class="steps">${stepsHTML(path, chs, opts.custom)}</div></div>`;
  }

  function playPath(id) {
    const T = KS.transport;
    if (T.playing && T.owner === 'piano:' + id) { T.stop(); return; }
    const p = paths[id]; if (!p) return;
    const card = document.querySelector(`[data-path="${id}"]`);
    const mark = k => document.querySelectorAll(`[data-path="${id}"] .step`).forEach((s, i) => s.classList.toggle('playing', i === k));
    T.start({
      mode: 'prog', owner: 'piano:' + id,
      steps: p.path.map((c, k) => ({ notes: c.n, bass: bassMidi(p.chs[k]) })),
      onStep: mark, onStop: () => mark(-1)
    });
    if (card) card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function syncButtons() {
    const T = KS.transport;
    if (document.body.dataset.view !== 'piano') return;
    document.querySelectorAll('#view [data-playpath]').forEach(b => {
      const on = T.playing && T.owner === 'piano:' + b.dataset.playpath;
      b.textContent = on ? t('stop') : t('play');
      b.classList.toggle('on', on);
    });
  }
  KS.on('transport', syncButtons);

  function customHTML(chs, bestTot) {
    const path = [];
    customInv.forEach((inv, k) => path.push(nearestOfInv(chs[k], inv, k ? path[k - 1].n : null)));
    const tot = total(path);
    return pathCard('custom', t('your_version'), path, chs, {
      custom: true, max: Math.max(tot, bestTot, 1),
      note: tot === bestTot ? t('same_best') : t('best_is', { n: bestTot })
    });
  }

  function render(el) {
    const st = KS.state, lvl = P().level, res = KS.chords();
    paths = {};
    const lvls = [1, 2, 3].map(n => `<button type="button" class="lvl${lvl === n ? ' on' : ''}" data-level="${n}"><b>${t('level')} ${n}</b><span>${t('p_l' + n)}</span><small>${t('p_l' + n + 'd')}</small></button>`).join('');
    let h = `<div class="vhead"><h1>${t('tab_piano')}</h1><p>${t('piano_desc')}</p></div>
      <div class="levels" role="group" aria-label="${t('level')}">${lvls}</div>
      <div class="row">
        ${lvl < 3 ? `<label class="ck"><input type="checkbox" id="pLh" ${P().lh ? 'checked' : ''}> ${t('lh')}</label>` : ''}
        <label class="ck">${t('bars_per_chord')} <select id="pBars"><option value="1">1</option><option value="2">2</option><option value="4">4</option></select></label>
        <label class="ck"><input type="checkbox" id="pClick" ${st.clickOn ? 'checked' : ''}> ${t('click_on')}</label>
        <label class="ck"><input type="checkbox" id="pLoop" ${st.loop ? 'checked' : ''}> ${t('loop')}</label>
      </div>
      <div class="legend"><span><i class="sw" style="background:var(--piano)"></i>${t('legend_note')}</span><span><i class="sw" style="background:var(--amber)"></i>${t('legend_common')}</span>${lh() ? `<span><i class="sw" style="background:var(--teal)"></i>${t('legend_bass')}</span>` : ''}</div>`;

    if (!res.ok) {
      el.innerHTML = h + `<p class="warn">${t('fix_chords')}</p>`;
      wire(el); return;
    }
    const chs = res.list.map(forLevel);
    h += `<section><h2>${t('common_title')}</h2><p class="sub">${t('common_desc')}</p><div class="chain">${KS.commonChainHTML(res.list)}</div></section>`;

    if (lvl === 1) {
      const rp = rootPath(chs);
      h += `<section><h2>${t('root_only_title')}</h2><p class="sub">${t('root_only_desc')}</p>${pathCard('root', t('all_root'), rp, chs, { max: total(rp) })}</section>`;
    } else {
      const opts = [];
      chs[0].pcs.forEach((_, i) => {
        const s = nearestOfInv(chs[0], i, null);
        if (s) opts.push({ title: t('starting', { c: chs[0].sym, inv: t('inv_' + i).toLowerCase() }), path: bestFrom(chs, s) });
      });
      opts.push({ title: t('all_root'), path: rootPath(chs) });
      const seen = new Set();
      const list = opts.filter(o => { const k = JSON.stringify(o.path.map(c => c.n)); if (seen.has(k)) return false; seen.add(k); return true; });
      list.forEach(o => { o.t = total(o.path); });
      list.sort((a, b) => a.t - b.t);
      const max = Math.max(...list.map(o => o.t), 1);
      h += `<section><h2>${t('options')}</h2><p class="sub">${t('options_desc')}</p>` +
        list.map((o, i) => pathCard('o' + i, o.title, o.path, chs, { best: i === 0, max })).join('') + '</section>';

      const key = st.chords.join('|') + lvl;
      if (!customInv || key !== lastKey) customInv = list[0].path.map(c => c.inv);
      lastKey = key;
      h += `<section><h2>${t('custom')}</h2><p class="sub">${t('custom_desc')}</p><div id="pCustom">${customHTML(chs, list[0].t)}</div></section>`;

      h += `<section><h2>${t('all_inv')}</h2><p class="sub">${t('all_inv_desc')}</p>` + chs.map((c, k) => {
        const prev = chs[(k - 1 + chs.length) % chs.length];
        const common = chs.length > 1 ? c.pcs.filter(p => prev.pcs.includes(p)) : [];
        return `<div class="inv-grid"><div class="cn"><b>${c.sym}</b><span>${KS.chordName(c)}</span></div>` +
          c.pcs.map((_, i) => {
            const v = nearestOfInv(c, i, null);
            return `<div class="cell"><div class="lbl">${t('inv_' + i)}</div><button type="button" class="kbbtn" data-ai="${k}-${i}" aria-label="${t('play')} ${c.sym} ${t('inv_' + i)}">${keyboard(v.n, common, bassMidi(c))}</button><div class="notes">${notesHTML(v.n, common, c.flat)}</div></div>`;
          }).join('') + '</div>';
      }).join('') + '</section>';
      el._chs = chs; el._bestTot = list[0].t;
    }
    el.innerHTML = h;
    wire(el);
    syncButtons();
  }

  function wire(el) {
    const st = KS.state;
    el.querySelectorAll('[data-level]').forEach(b => b.onclick = () => { P().level = +b.dataset.level; KS.save(); KS.transport.stop(); render(el); });
    const lhEl = el.querySelector('#pLh'); if (lhEl) lhEl.onchange = () => { P().lh = lhEl.checked; KS.save(); render(el); };
    const bars = el.querySelector('#pBars'); bars.value = String(st.barsPerChord); bars.onchange = () => { st.barsPerChord = +bars.value; KS.save(); };
    el.querySelector('#pClick').onchange = e => { st.clickOn = e.target.checked; KS.save(); };
    el.querySelector('#pLoop').onchange = e => { st.loop = e.target.checked; KS.save(); };
    el.onclick = (e) => {
      const pp = e.target.closest('[data-playpath]'); if (pp) { playPath(pp.dataset.playpath); return; }
      const pl = e.target.closest('[data-play]');
      if (pl) { const p = paths[pl.closest('[data-path]').dataset.path], k = +pl.dataset.play; KS.audio.chord(p.path[k].n, bassMidi(p.chs[k])); return; }
      const ai = e.target.closest('[data-ai]');
      if (ai) { const [k, i] = ai.dataset.ai.split('-').map(Number); const c = el._chs[k]; KS.audio.chord(nearestOfInv(c, i, null).n, bassMidi(c)); return; }
      const ib = e.target.closest('.invbtns button');
      if (ib) {
        customInv[+ib.dataset.k] = +ib.dataset.inv;
        if (KS.transport.owner === 'piano:custom') KS.transport.stop();
        el.querySelector('#pCustom').innerHTML = customHTML(el._chs, el._bestTot);
        syncButtons();
      }
    };
  }

  KS.views.piano = { render };
})(window.KS);
