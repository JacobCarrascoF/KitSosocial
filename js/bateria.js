/* Kit Sosocial — Batería: rudimentos para practicar con pad y metrónomo, en 3 niveles */
(function (KS) {
  const t = KS.t;
  const L = (es, ca) => (KS.state.lang === 'ca' ? ca : es);
  const B = () => KS.state.bateria;

  // Notación: R / L = mano, ">" delante = acento, "f" delante = flam, "-" = silencio.
  // "per" = notas por pulso (1 negras, 2 corcheas, 4 semicorcheas, 6 seisillos). El patrón se repite hasta llenar el compás.
  const EX = {
    1: [
      { name: ['Golpe simple en negras', 'Cop simple en negres', 'Single strokes'], pat: 'R L R L', per: 1, bpm: 60,
        tip: ['Alterna las manos, una nota por pulso. Busca que las dos suenen igual de fuerte.', 'Alterna les mans, una nota per pols. Busca que les dues sonin igual de fort.'] },
      { name: ['Golpe simple en corcheas', 'Cop simple en corxeres', 'Single strokes'], pat: 'R L R L', per: 2, bpm: 60,
        tip: ['Dos notas por pulso. Cuenta en voz alta: "1 y 2 y 3 y 4 y".', 'Dues notes per pols. Compta en veu alta: "1 i 2 i 3 i 4 i".'] },
      { name: ['Golpe doble en corcheas', 'Cop doble en corxeres', 'Double strokes'], pat: 'R R L L', per: 2, bpm: 60,
        tip: ['Cada mano da dos golpes seguidos. El segundo golpe tiene que sonar tan fuerte como el primero.', 'Cada mà fa dos cops seguits. El segon ha de sonar tan fort com el primer.'] },
      { name: ['Acento en el pulso', 'Accent a la pulsació', 'Accents on the beat'], pat: '>R L >R L', per: 2, bpm: 60,
        tip: ['El golpe con > es fuerte y el otro, suave. Levanta más la baqueta en el acento, sin apretar.', 'El cop amb > és fort i l\'altre, suau. Aixeca més la baqueta a l\'accent, sense prémer.'] }
    ],
    2: [
      { name: ['Golpe simple en semicorcheas', 'Cop simple en semicorxeres', 'Single strokes (16ths)'], pat: 'R L R L', per: 4, bpm: 60,
        tip: ['Cuatro notas por pulso: "1 e y a". Mantén el mismo volumen en todas.', 'Quatre notes per pols: "1 e i a". Mantén el mateix volum a totes.'] },
      { name: ['Paradiddle', 'Paradiddle', 'Single paradiddle'], pat: 'R L R R L R L L', per: 4, bpm: 60,
        tip: ['Es un golpe simple (R L) seguido de uno doble (R R). Fíjate: cada grupo empieza con la mano contraria.', 'És un cop simple (R L) seguit d\'un de doble (R R). Fixa-t\'hi: cada grup comença amb la mà contrària.'] },
      { name: ['Paradiddle con acentos', 'Paradiddle amb accents', 'Accented paradiddle'], pat: '>R L R R >L R L L', per: 4, bpm: 60,
        tip: ['Acentúa la primera nota de cada grupo. El resto, suave y cerca del pad.', 'Accentua la primera nota de cada grup. La resta, suau i a prop del pad.'] },
      { name: ['Golpe doble en semicorcheas', 'Cop doble en semicorxeres', 'Double strokes (16ths)'], pat: 'R R L L', per: 4, bpm: 60,
        tip: ['Deja que la baqueta rebote en el segundo golpe. Si se amontonan, baja la velocidad.', 'Deixa que la baqueta reboti al segon cop. Si s\'amunteguen, baixa la velocitat.'] }
    ],
    3: [
      { name: ['Doble paradiddle', 'Doble paradiddle', 'Double paradiddle'], pat: '>R L R L R R >L R L R L L', per: 6, bpm: 50,
        tip: ['Seis notas por pulso: cuatro simples y un doble. Acentúa el inicio de cada grupo.', 'Sis notes per pols: quatre simples i un doble. Accentua l\'inici de cada grup.'] },
      { name: ['Paradiddle-diddle', 'Paradiddle-diddle', 'Paradiddle-diddle'], pat: '>R L R R L L', per: 6, bpm: 50,
        tip: ['Un simple y dos dobles: R L · R R · L L. Siempre empieza con la misma mano.', 'Un simple i dos dobles: R L · R R · L L. Sempre comença amb la mateixa mà.'] },
      { name: ['Paradiddle invertido', 'Paradiddle invertit', 'Inverted paradiddle'], pat: 'R R L R L L R L', per: 4, bpm: 55,
        tip: ['Es el paradiddle empezando por el doble: R R L R · L L R L.', 'És el paradiddle començant pel doble: R R L R · L L R L.'] },
      { name: ['Flam', 'Flam', 'Flam'], pat: 'fR fL', per: 1, bpm: 60,
        tip: ['Dos golpes casi a la vez: uno muy suave (la nota pequeña) justo antes del fuerte. Tiene que sonar como "flam", no como dos golpes.', 'Dos cops gairebé alhora: un de molt suau (la nota petita) just abans del fort. Ha de sonar com "flam", no com dos cops.'] },
      { name: ['Flam tap', 'Flam tap', 'Flam tap'], pat: 'fR R fL L', per: 4, bpm: 50,
        tip: ['Flam y un golpe suave con la misma mano. La mano del golpe suave prepara el siguiente flam.', 'Flam i un cop suau amb la mateixa mà. La mà del cop suau prepara el flam següent.'] }
    ]
  };

  function parse(ex) {
    const swap = B().left;
    const toks = ex.pat.split(/\s+/).map(tok => {
      if (tok === '-') return { h: null };
      let acc = false, flam = false, h = tok;
      if (h[0] === '>') { acc = true; h = h.slice(1); }
      if (h[0] === 'f') { flam = true; acc = true; h = h.slice(1); }
      if (swap) h = h === 'R' ? 'L' : 'R';
      return { h, acc, flam };
    });
    const barLen = KS.state.beats * ex.per;
    const out = [];
    while (out.length < barLen) out.push(...toks);
    return out.slice(0, Math.max(barLen, toks.length));
  }
  function counts(per, beats) {
    const y = L('y', 'i'), out = [];
    for (let b = 1; b <= beats; b++) {
      const lab = per === 2 ? [b, y] : per === 4 ? [b, 'e', y, 'a'] : [b].concat(Array(per - 1).fill('·'));
      out.push(...lab.slice(0, per));
    }
    return out;
  }
  const handLocal = h => (h === 'R' ? 'D' : t('hand_L'));

  function patternHTML(ex) {
    const notes = parse(ex), per = ex.per, cnt = counts(per, KS.state.beats);
    let h = `<div class="pgrid" style="--per:${per}">`;
    notes.forEach((n, i) => {
      const beatStart = i % per === 0;
      h += `<div class="pn${beatStart ? ' bs' : ''}${n.acc ? ' acc' : ''}" data-ni="${i}">
        <span class="pc">${cnt[i % cnt.length] || ''}</span>
        <span class="pa">${n.acc ? '&gt;' : ''}</span>
        <span class="ph ${n.h || 'r'}">${n.flam ? `<small>${n.h === 'R' ? 'L' : 'R'}</small>` : ''}${n.h || '·'}</span>
        <span class="pl">${n.h ? handLocal(n.h) : ''}</span></div>`;
    });
    return h + '</div>';
  }

  function render(el) {
    const st = KS.state, lvl = B().level, list = EX[lvl];
    if (B().ex >= list.length) B().ex = 0;
    const ex = list[B().ex];
    const lvls = [1, 2, 3].map(n => `<button type="button" class="lvl${lvl === n ? ' on' : ''}" data-dlevel="${n}"><b>${t('level')} ${n}</b><span>${t('bt_l' + n)}</span><small>${t('bt_l' + n + 'd')}</small></button>`).join('');
    const exs = list.map((e, i) => `<button type="button" class="exb${i === B().ex ? ' on' : ''}" data-ex="${i}">${L(e.name[0], e.name[1])}</button>`).join('');
    const playing = KS.transport.playing && KS.transport.mode === 'pad';
    el.innerHTML = `
      <div class="vhead"><h1>${t('tab_bateria')}</h1><p>${t('bt_desc')}</p></div>
      <div class="levels" role="group" aria-label="${t('level')}">${lvls}</div>
      <div class="exlist" role="group">${exs}</div>
      <section class="excard">
        <div class="exhead"><div><h2>${L(ex.name[0], ex.name[1])}</h2><span class="sub">${ex.name[2]}</span></div>
          <button type="button" class="primary big" id="dPlay">${playing ? t('m_stop') : t('m_start')}</button></div>
        <p>${L(ex.tip[0], ex.tip[1])}</p>
        <div class="dscroll">${patternHTML(ex)}</div>
        <p class="sub">${t('bt_legend')}</p>
        <div class="dctl">
          <div class="mbpm small">
            <button type="button" data-bd="-5" aria-label="-5">−5</button><button type="button" data-bd="-1" aria-label="-1">−1</button>
            <div class="mval"><b id="dBpm">${st.bpm}</b><span>BPM</span></div>
            <button type="button" data-bd="1" aria-label="+1">+1</button><button type="button" data-bd="5" aria-label="+5">+5</button>
          </div>
          <div class="dsug"><span class="sub">${t('bt_suggest', { n: ex.bpm })}</span> <button type="button" id="dUse">${t('bt_use', { n: ex.bpm })}</button></div>
        </div>
        <div class="row">
          <label class="ck"><input type="checkbox" id="dLeft" ${B().left ? 'checked' : ''}> ${t('bt_left')}</label>
          <label class="ck"><input type="checkbox" id="dClick" ${st.clickOn ? 'checked' : ''}> ${t('click_on')}</label>
          <label class="ck"><input type="checkbox" id="dCount" ${st.countIn ? 'checked' : ''}> ${t('m_countin')}</label>
        </div>
        <div class="row">
          <label class="ck"><input type="checkbox" id="dTr" ${st.trainer.on ? 'checked' : ''}> ${t('bt_trainer')}</label>
          <input type="number" id="dTo" min="31" max="240" value="${st.trainer.to}" aria-label="BPM"> BPM
          <span class="sub">${t('bt_every', { s: st.trainer.step, e: st.trainer.every })}</span>
        </div>
      </section>
      <section><h2>${t('bt_tips')}</h2><ul class="tips">${[1, 2, 3, 4, 5].map(i => `<li>${t('bt_tip' + i)}</li>`).join('')}</ul></section>`;
    wire(el, ex);
  }

  function play(el, ex) {
    const T = KS.transport;
    if (T.playing && T.mode === 'pad') { T.stop(); return; }
    const notes = parse(ex);
    const mark = i => el.querySelectorAll('.pn').forEach((c, j) => c.classList.toggle('now', j === i));
    T.start({ mode: 'pad', owner: 'bateria', perBeat: ex.per, pattern: notes, onNote: mark, onStop: () => mark(-1) });
  }

  function wire(el, ex) {
    const st = KS.state;
    el.onchange = null;
    el.onclick = (e) => {
      const lv = e.target.closest('[data-dlevel]');
      if (lv) { KS.transport.stop(); B().level = +lv.dataset.dlevel; B().ex = 0; KS.save(); render(el); return; }
      const xb = e.target.closest('[data-ex]');
      if (xb) { KS.transport.stop(); B().ex = +xb.dataset.ex; KS.save(); render(el); return; }
      if (e.target.closest('#dPlay')) { play(el, ex); return; }
      const bd = e.target.closest('[data-bd]'); if (bd) { KS.setBpm(st.bpm + +bd.dataset.bd); return; }
      if (e.target.closest('#dUse')) { KS.setBpm(ex.bpm); return; }
      const pn = e.target.closest('.pn');
      if (pn) { const n = parse(ex)[+pn.dataset.ni]; if (n.h) { if (n.flam) KS.audio.pad(KS.audio.ctx().currentTime, false, n.h === 'R' ? 'L' : 'R', true); KS.audio.pad(KS.audio.ctx().currentTime + (n.flam ? 0.028 : 0), n.acc, n.h); } }
    };
    el.querySelector('#dLeft').onchange = e => { KS.transport.stop(); B().left = e.target.checked; KS.save(); render(el); };
    el.querySelector('#dClick').onchange = e => { st.clickOn = e.target.checked; KS.save(); };
    el.querySelector('#dCount').onchange = e => { st.countIn = e.target.checked; KS.save(); };
    el.querySelector('#dTr').onchange = e => { st.trainer.on = e.target.checked; KS.save(); };
    el.querySelector('#dTo').onchange = e => { const v = Math.max(31, Math.min(240, parseInt(e.target.value, 10) || 120)); e.target.value = v; st.trainer.to = v; KS.save(); };
  }

  function sync() {
    if (document.body.dataset.view !== 'bateria') return;
    const b = document.getElementById('dBpm'); if (b) b.textContent = KS.state.bpm;
    const p = document.getElementById('dPlay');
    if (p) { const on = KS.transport.playing && KS.transport.mode === 'pad'; p.textContent = on ? t('m_stop') : t('m_start'); p.classList.toggle('on', on); }
  }
  KS.on('bpm', sync);
  KS.on('transport', sync);

  KS.views.bateria = { render };
})(window.KS);
