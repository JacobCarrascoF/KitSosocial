/* Kit Sosocial — Metrónomo */
(function (KS) {
  const t = KS.t;
  const tempoName = b => (b < 60 ? 'Largo' : b < 76 ? 'Adagio' : b < 108 ? 'Andante' : b < 120 ? 'Moderato' : b < 168 ? 'Allegro' : 'Presto');
  let taps = [];

  KS.setBpm = (v) => {
    KS.state.bpm = Math.max(30, Math.min(240, Math.round(v)));
    KS.save();
    KS.emit('bpm');
  };

  function dots(n) {
    let h = '';
    for (let i = 0; i < n; i++) h += `<span class="dot${i === 0 ? ' first' : ''}" data-dot="${i}"></span>`;
    return h;
  }

  function render(el) {
    const st = KS.state, tr = st.trainer;
    const subs = [1, 2, 3, 4].map(n => `<button type="button" data-sub="${n}" class="${st.subdiv === n ? 'on' : ''}">${t('sub_' + n)}</button>`).join('');
    const sigs = Object.keys(KS.SIGS).map(s => `<option ${s === st.sig ? 'selected' : ''}>${s}</option>`).join('');
    el.innerHTML = `
      <div class="vhead"><h1>${t('tab_metronomo')}</h1></div>
      <div class="metro">
        <div class="mdisplay" id="mDisplay" aria-live="off">
          <div class="mbeat" id="mBeat">1</div>
          <div class="mdots" id="mDots">${dots(st.beats)}</div>
          <div class="mstatus" id="mStatus"></div>
        </div>
        <div class="mbpm">
          <button type="button" data-d="-5" aria-label="-5">−5</button>
          <button type="button" data-d="-1" aria-label="-1">−1</button>
          <div class="mval"><b id="mBpm">${st.bpm}</b><span>BPM</span><em id="mTempo">${tempoName(st.bpm)}</em></div>
          <button type="button" data-d="1" aria-label="+1">+1</button>
          <button type="button" data-d="5" aria-label="+5">+5</button>
        </div>
        <input type="range" id="mRange" min="30" max="240" step="1" value="${st.bpm}" aria-label="BPM">
        <div class="mmain">
          <button type="button" class="primary big" id="mPlay">${t('m_start')}</button>
          <button type="button" class="big" id="mTap">${t('m_tap')}</button>
        </div>
        <div class="mopts">
          <label class="field">${t('m_sig')}<select id="mSig">${sigs}</select></label>
          <div class="field">${t('m_sub')}<div class="seg">${subs}</div></div>
          <label class="ck"><input type="checkbox" id="mAccent" ${st.accent ? 'checked' : ''}> ${t('m_accent')}</label>
          <label class="ck"><input type="checkbox" id="mCount" ${st.countIn ? 'checked' : ''}> ${t('m_countin')}</label>
        </div>
        <p class="sub" id="m68" ${st.beats >= 6 ? '' : 'hidden'}>${t('m_68')}</p>
        <fieldset class="trainer">
          <legend><label class="ck"><input type="checkbox" id="trOn" ${tr.on ? 'checked' : ''}> ${t('m_trainer')}</label></legend>
          <p class="sub">${t('m_trainer_desc')}</p>
          <div class="trrow">
            <label>${t('m_to')} <input type="number" id="trTo" min="31" max="240" value="${tr.to}"> BPM</label>
            <label>${t('m_step')} <input type="number" id="trStep" min="1" max="20" value="${tr.step}"></label>
            <label>${t('m_every')} <input type="number" id="trEvery" min="1" max="16" value="${tr.every}"> ${t('m_bars')}</label>
          </div>
        </fieldset>
      </div>`;
    wire(el);
    sync();
  }

  function wire(el) {
    const st = KS.state;
    el.onclick = null;
    el.querySelectorAll('[data-d]').forEach(b => b.onclick = () => KS.setBpm(st.bpm + +b.dataset.d));
    el.querySelector('#mRange').oninput = e => KS.setBpm(+e.target.value);
    el.querySelector('#mPlay').onclick = () => {
      const T = KS.transport;
      if (T.playing && T.mode === 'metro') T.stop(); else T.start({ mode: 'metro', owner: 'metro' });
    };
    el.querySelector('#mTap').onclick = () => {
      const now = performance.now();
      if (taps.length && now - taps[taps.length - 1] > 2000) taps = [];
      taps.push(now); taps = taps.slice(-5);
      if (taps.length >= 2) {
        const iv = (taps[taps.length - 1] - taps[0]) / (taps.length - 1);
        KS.setBpm(60000 / iv);
      } else {
        el.querySelector('#mStatus').textContent = t('m_tap_hint');
      }
    };
    el.querySelector('#mSig').onchange = e => {
      st.sig = e.target.value; st.beats = KS.SIGS[st.sig]; KS.save();
      el.querySelector('#mDots').innerHTML = dots(st.beats);
      el.querySelector('#m68').hidden = st.beats < 6;
    };
    el.querySelectorAll('[data-sub]').forEach(b => b.onclick = () => {
      st.subdiv = +b.dataset.sub; KS.save();
      el.querySelectorAll('[data-sub]').forEach(x => x.classList.toggle('on', x === b));
    });
    el.querySelector('#mAccent').onchange = e => { st.accent = e.target.checked; KS.save(); };
    el.querySelector('#mCount').onchange = e => { st.countIn = e.target.checked; KS.save(); };
    const tr = st.trainer;
    el.querySelector('#trOn').onchange = e => { tr.on = e.target.checked; KS.save(); sync(); };
    const num = (id, key, lo, hi) => { el.querySelector(id).onchange = e => { const v = Math.max(lo, Math.min(hi, parseInt(e.target.value, 10) || lo)); e.target.value = v; tr[key] = v; KS.save(); sync(); }; };
    num('#trTo', 'to', 31, 240); num('#trStep', 'step', 1, 20); num('#trEvery', 'every', 1, 16);
  }

  function sync() {
    const st = KS.state, T = KS.transport;
    const b = document.getElementById('mBpm'); if (!b) return;
    b.textContent = st.bpm;
    document.getElementById('mTempo').textContent = tempoName(st.bpm);
    document.getElementById('mRange').value = st.bpm;
    const on = T.playing && T.mode === 'metro';
    const play = document.getElementById('mPlay');
    play.textContent = on ? t('m_stop') : t('m_start');
    play.classList.toggle('on', on);
    document.getElementById('mStatus').textContent = st.trainer.on ? t('trainer_status', { a: st.bpm, b: st.trainer.to }) : '';
    if (!T.playing) {
      document.getElementById('mBeat').textContent = '1';
      document.querySelectorAll('#mDots .dot').forEach(d => d.classList.remove('now'));
      document.getElementById('mDisplay').classList.remove('accent', 'count');
    }
  }

  KS.on('bpm', sync);
  KS.on('transport', sync);
  KS.on('beat', (d) => {
    const beatEl = document.getElementById('mBeat'); if (!beatEl) return;
    beatEl.textContent = String(d.beat + 1);
    document.querySelectorAll('#mDots .dot').forEach((x, i) => x.classList.toggle('now', i === d.beat));
    const disp = document.getElementById('mDisplay');
    disp.classList.toggle('accent', d.beat === 0 && !d.counting);
    disp.classList.toggle('count', d.counting);
    if (d.counting) document.getElementById('mStatus').textContent = t('count_in');
    else if (d.beat === 0) document.getElementById('mStatus').textContent = KS.state.trainer.on ? t('trainer_status', { a: KS.state.bpm, b: KS.state.trainer.to }) : '';
  });

  KS.views.metronomo = { render };
})(window.KS);
