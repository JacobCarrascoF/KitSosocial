/* Kit Sosocial — arranque: pestañas, barra de progresión, mini metrónomo, idioma y compartir */
(function (KS) {
  const t = KS.t, st = KS.state;
  const TABS = ['diccionario', 'piano', 'guitarra', 'bajo', 'metronomo'];
  const view = document.getElementById('view');
  let current = null;

  /* ---------- Pestañas ---------- */
  function route() {
    let name = (location.hash || '').replace('#', '');
    if (!TABS.includes(name)) name = 'piano';
    current = name;
    document.body.dataset.view = name;
    document.querySelectorAll('.tabs a').forEach(a => {
      const on = a.getAttribute('href') === '#' + name;
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    document.getElementById('progBar').hidden = name === 'metronomo' || name === 'diccionario';
    renderView();
  }
  function renderView() {
    view.onclick = null;
    view.onchange = null;
    KS.views[current].render(view);
  }
  window.addEventListener('hashchange', () => { route(); window.scrollTo(0, 0); });

  /* ---------- Barra de progresión ---------- */
  const slots = document.getElementById('slots');
  let deb;
  function buildSlots() {
    slots.innerHTML = '';
    st.chords.forEach((c, i) => {
      const d = document.createElement('div');
      d.className = 'slot';
      d.innerHTML = `<div class="box"><input value="${c.replace(/"/g, '&quot;')}" aria-label="${t('chord_n', { n: i + 1 })}" autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false" maxlength="10">` +
        (st.chords.length > 2 ? `<button type="button" class="x" aria-label="${t('remove_chord')}">×</button>` : '') +
        `</div><div class="nm"></div>`;
      const inp = d.querySelector('input');
      inp.oninput = () => {
        st.chords[i] = inp.value; KS.save(); validate();
        clearTimeout(deb); deb = setTimeout(progChanged, 350);
      };
      const x = d.querySelector('.x');
      if (x) x.onclick = () => { st.chords.splice(i, 1); KS.save(); buildSlots(); progChanged(); };
      slots.appendChild(d);
    });
    if (st.chords.length < 8) {
      const a = document.createElement('button');
      a.type = 'button'; a.className = 'add'; a.textContent = t('add_chord');
      a.onclick = () => {
        st.chords.push(st.chords[st.chords.length - 1] || 'C'); KS.save(); buildSlots(); progChanged();
        const ins = slots.querySelectorAll('input'); ins[ins.length - 1].select();
      };
      slots.appendChild(a);
    }
    validate();
  }
  function validate() {
    st.chords.forEach((c, i) => {
      const p = KS.parseChord(c), el = slots.children[i];
      if (!el) return;
      el.classList.toggle('bad', !!p.err);
      el.querySelector('.nm').textContent = p.err ? t(p.err, { x: p.errVal || '' }) : KS.chordName(p);
    });
  }
  function progChanged() {
    if (KS.transport.mode === 'prog') KS.transport.stop();
    updateUrl();
    KS.emit('prog');
    if (current !== 'metronomo') renderView();
  }

  const presets = document.getElementById('presets');
  function buildPresets() {
    presets.innerHTML = `<option value="">${t('examples')}…</option>` + KS.PRESETS.map((p, i) => `<option value="${i}">${p.join(' ')}</option>`).join('');
  }
  presets.onchange = () => {
    if (presets.value === '') return;
    st.chords = KS.PRESETS[+presets.value].slice(); KS.save();
    presets.value = '';
    buildSlots(); progChanged();
  };

  const nn = document.getElementById('noteNames');
  function buildNoteNames() {
    nn.innerHTML = ['lat', 'en', 'both'].map(v => `<option value="${v}" ${st.noteNames === v ? 'selected' : ''}>${t('nn_' + v)}</option>`).join('');
  }
  nn.onchange = () => { st.noteNames = nn.value; KS.save(); validate(); renderView(); };

  /* ---------- Compartir ---------- */
  function shareUrl() {
    const base = location.href.split('?')[0].split('#')[0];
    return base + '?acordes=' + st.chords.map(encodeURIComponent).join(',') + '&bpm=' + st.bpm + '&lang=' + st.lang + '#' + (current || location.hash.replace('#', '') || 'piano');
  }
  function updateUrl() {
    try { history.replaceState(null, '', shareUrl()); } catch (e) {}
  }
  document.getElementById('share').onclick = async () => {
    const url = shareUrl(), msg = document.getElementById('shareMsg');
    try {
      if (navigator.share && /Android|iPhone|iPad/i.test(navigator.userAgent)) { await navigator.share({ title: 'Kit Sosocial', url }); return; }
      await navigator.clipboard.writeText(url);
      msg.textContent = t('copied');
    } catch (e) {
      window.prompt(t('copy_manual'), url);
    }
    setTimeout(() => { msg.textContent = ''; }, 2500);
  };

  /* ---------- Mini metrónomo ---------- */
  const miniPlay = document.getElementById('miniPlay'), miniBpm = document.getElementById('miniBpm'), miniDot = document.getElementById('miniDot');
  miniPlay.onclick = () => {
    const T = KS.transport;
    if (T.playing) T.stop(); else T.start({ mode: 'metro', owner: 'metro' });
  };
  document.getElementById('miniMinus').onclick = () => KS.setBpm(st.bpm - 1);
  document.getElementById('miniPlus').onclick = () => KS.setBpm(st.bpm + 1);
  const syncMini = () => {
    miniBpm.textContent = st.bpm;
    const on = KS.transport.playing;
    miniPlay.textContent = on ? '■' : '▶';
    miniPlay.classList.toggle('on', on);
    if (!on) miniDot.className = 'mini-dot';
  };
  KS.on('bpm', () => { syncMini(); updateUrl(); });
  KS.on('transport', syncMini);
  KS.on('beat', d => {
    miniDot.className = 'mini-dot ' + (d.counting ? 'count' : d.beat === 0 ? 'accent' : 'beat');
    setTimeout(() => { miniDot.className = 'mini-dot'; }, 110);
  });
  document.addEventListener('keydown', e => {
    if (e.code === 'Space' && !/INPUT|SELECT|TEXTAREA|BUTTON/.test(e.target.tagName)) { e.preventDefault(); miniPlay.click(); }
  });

  /* ---------- Idioma ---------- */
  function setLang(l) {
    st.lang = l; KS.save();
    document.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === l)));
    KS.applyI18n(); buildSlots(); buildPresets(); buildNoteNames(); updateUrl();
    if (current) renderView();
  }
  document.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => setLang(b.dataset.lang));

  /* ---------- Donaciones (se activa en js/nucleo/config.js) ---------- */
  const url = (KS.CONFIG && KS.CONFIG.donar) || '';
  if (url && (!url.includes('TU-USUARIO') || window.KS_PREVIEW)) {
    document.getElementById('supportLink').href = url.includes('TU-USUARIO') ? 'https://ko-fi.com' : url;
    document.getElementById('support').hidden = false;
  }

  /* ---------- Acceso con código (se configura en js/nucleo/config.js) ---------- */
  const ACC = (KS.CONFIG && KS.CONFIG.acceso) || { activo: false, codigos: [] };
  const CODE_KEY = 'kit-sosocial-codigo';
  const today = () => new Date().toISOString().slice(0, 10);
  const findCode = h => (ACC.codigos || []).find(c => c.huella === h);
  const expired = c => !!(c && c.hasta && c.hasta < today());
  KS.access = { packs: [] };
  function loadAccess() {
    if (!ACC.activo) { KS.access.packs = ['*']; return 'ok'; }
    let h = null; try { h = localStorage.getItem(CODE_KEY); } catch (e) {}
    const c = h && findCode(h);
    if (!c) return h ? 'err' : 'none';
    if (expired(c)) return 'expired';
    KS.access.packs = c.packs || ['basico'];
    return 'ok';
  }
  KS.hasPack = p => KS.access.packs.includes('*') || KS.access.packs.includes(p);
  const lock = document.getElementById('lock');
  function showLock(reason) {
    KS.transport.stop();
    document.body.classList.add('locked');
    lock.hidden = false;
    const msg = document.getElementById('lockMsg');
    msg.textContent = reason === 'expired' ? t('lock_expired') : '';
    const sup = document.getElementById('lockSupport');
    if (KS.CONFIG.donar && !KS.CONFIG.donar.includes('TU-USUARIO')) sup.href = KS.CONFIG.donar; else sup.hidden = true;
    setTimeout(() => document.getElementById('lockInput').focus(), 50);
  }
  function unlock() {
    document.body.classList.remove('locked');
    lock.hidden = true;
    route();
  }
  document.getElementById('lockForm').onsubmit = (e) => {
    e.preventDefault();
    const input = document.getElementById('lockInput'), msg = document.getElementById('lockMsg');
    const h = KS.codeHash(input.value), c = findCode(h);
    if (!KS.normCode(input.value) || !c) { msg.textContent = t('lock_err'); input.select(); return; }
    if (expired(c)) { msg.textContent = t('lock_expired'); return; }
    try { localStorage.setItem(CODE_KEY, h); } catch (err) {}
    KS.access.packs = c.packs || ['basico'];
    input.value = ''; msg.textContent = '';
    unlock();
  };
  const logout = document.getElementById('logout');
  if (!ACC.activo) logout.parentNode.removeChild(logout);
  else logout.onclick = () => { try { localStorage.removeItem(CODE_KEY); } catch (e) {} KS.access.packs = []; showLock(); window.scrollTo(0, 0); };

  /* ---------- Arranque ---------- */
  setLang(st.lang);
  syncMini();
  const acc = loadAccess();
  if (acc === 'ok' && KS.hasPack('basico')) route();
  else { current = 'piano'; showLock(acc); }

  if ('serviceWorker' in navigator && location.protocol === 'https:' && !window.KS_PREVIEW) {
    // Si hay una versión nueva, se instala y la página se recarga sola una vez
    const hadController = !!navigator.serviceWorker.controller;
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hadController && !reloaded) { reloaded = true; location.reload(); }
    });
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(reg => {
      reg.update();
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update(); });
    }).catch(() => {});
  }
})(window.KS);
