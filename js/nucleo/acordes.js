/* Kit Sosocial — nombres de notas, lector de acordes y utilidades de movimiento */
(function (KS) {
  const EN_S = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const EN_F = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  const LA_S = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];
  const LA_F = ['Do', 'Reb', 'Re', 'Mib', 'Mi', 'Fa', 'Solb', 'Sol', 'Lab', 'La', 'Sib', 'Si'];
  const LETTER = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const LA_LETTER = { C: 'Do', D: 'Re', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Si' };

  KS.NOTES = { EN_S, EN_F, LA_S, LA_F };

  // Nombre de una nota (0-11) según la preferencia: 'lat' (Do), 'en' (C) o 'both'
  KS.noteName = (pc, flat, mode) => {
    mode = mode || KS.state.noteNames;
    const en = (flat ? EN_F : EN_S)[pc], la = (flat ? LA_F : LA_S)[pc];
    return mode === 'en' ? en : mode === 'both' ? la + ' (' + en + ')' : la;
  };
  KS.latRoot = r => LA_LETTER[r[0]] + r.slice(1);

  // Intervalos desde la fundamental, en orden: fundamental, 3ª, 5ª, 7ª, 9ª
  const Q = {
    '': [[0, 4, 7], 'mayor', 'major'],
    m: [[0, 3, 7], 'menor', 'menor'],
    '7': [[0, 4, 7, 10], 'séptima', 'setena'],
    maj7: [[0, 4, 7, 11], 'séptima mayor', 'setena major'],
    m7: [[0, 3, 7, 10], 'menor séptima', 'menor setena'],
    mmaj7: [[0, 3, 7, 11], 'menor séptima mayor', 'menor setena major'],
    dim: [[0, 3, 6], 'disminuido', 'disminuït'],
    dim7: [[0, 3, 6, 9], 'disminuido séptima', 'disminuït setena'],
    m7b5: [[0, 3, 6, 10], 'semidisminuido', 'semidisminuït'],
    aug: [[0, 4, 8], 'aumentado', 'augmentat'],
    sus2: [[0, 2, 7], 'sus2', 'sus2'],
    sus4: [[0, 5, 7], 'sus4', 'sus4'],
    '7sus4': [[0, 5, 7, 10], 'séptima sus4', 'setena sus4'],
    '6': [[0, 4, 7, 9], 'sexta', 'sisena'],
    m6: [[0, 3, 7, 9], 'menor sexta', 'menor sisena'],
    add9: [[0, 4, 7, 2], 'añadida novena', 'amb novena afegida'],
    madd9: [[0, 3, 7, 2], 'menor añadida novena', 'menor amb novena afegida'],
    '5': [[0, 7], 'quinta (power chord)', 'cinquena (power chord)'],
    '9': [[0, 4, 7, 10, 2], 'novena', 'novena'],
    m9: [[0, 3, 7, 10, 2], 'menor novena', 'menor novena'],
    maj9: [[0, 4, 7, 11, 2], 'novena mayor', 'novena major']
  };
  const ALIAS = {
    maj: '', M: '', min: 'm', mi: 'm', '-': 'm', M7: 'maj7', Maj7: 'maj7', ma7: 'maj7', 'Δ': 'maj7', 'Δ7': 'maj7',
    min7: 'm7', mi7: 'm7', '-7': 'm7', '°': 'dim', o: 'dim', '°7': 'dim7', o7: 'dim7', 'ø': 'm7b5', 'ø7': 'm7b5',
    '-7b5': 'm7b5', min7b5: 'm7b5', '+': 'aug', sus: 'sus4', '7sus': '7sus4', mM7: 'mmaj7', mMaj7: 'mmaj7',
    add2: 'add9', min6: 'm6', min9: 'm9', M9: 'maj9', madd2: 'madd9'
  };
  KS.QUALITIES = Q;

  KS.parseChord = (sym) => {
    const s = (sym || '').trim().replace(/♭/g, 'b').replace(/♯/g, '#');
    if (!s) return { sym: s, err: 'err_empty' };
    const m = s.match(/^([A-Ga-g])([#b]?)([^/]*)(?:\/([A-Ga-g])([#b]?))?$/);
    if (!m) return { sym: s, err: 'err_unknown' };
    const L = m[1].toUpperCase(), acc = m[2];
    let q = m[3];
    if (q in ALIAS) q = ALIAS[q];
    if (!(q in Q)) return { sym: s, err: 'err_type', errVal: m[3] };
    const root = (LETTER[L] + (acc === '#' ? 1 : acc === 'b' ? -1 : 0) + 12) % 12;
    const pcs = [...new Set(Q[q][0].map(i => (root + i) % 12))];
    const minorish = /^m(?!aj)|dim|m7b5/.test(q);
    const flat = acc === 'b' || (L === 'F' && acc !== '#') || (minorish && ['D', 'G', 'C', 'F'].includes(L) && !acc);
    let bassPc = root, slash = '';
    if (m[4]) {
      const BL = m[4].toUpperCase(), ba = m[5];
      bassPc = (LETTER[BL] + (ba === '#' ? 1 : ba === 'b' ? -1 : 0) + 12) % 12;
      slash = BL + ba;
    }
    return { sym: s, root, pcs, flat, bassPc, q, rootName: L + acc, slash };
  };

  KS.chordName = (ch) => {
    const q = Q[ch.q];
    let n = KS.latRoot(ch.rootName) + ' ' + (KS.state.lang === 'ca' ? q[2] : q[1]);
    if (ch.slash) n += KS.t('con_bajo', { n: KS.latRoot(ch.slash) });
    return n;
  };

  KS.chords = () => {
    const list = KS.state.chords.map(KS.parseChord);
    return { ok: list.every(c => !c.err), list };
  };

  KS.PRESETS = [
    ['C', 'F', 'G', 'C'], ['C', 'G', 'Am', 'F'], ['Am', 'F', 'C', 'G'], ['C', 'Am', 'F', 'G'],
    ['Em', 'C', 'G', 'D'], ['Dm7', 'G7', 'Cmaj7', 'Cmaj7'], ['C', 'C/B', 'Am', 'F']
  ];

  // Movimiento entre dos grupos de notas (en semitonos)
  const ctr = n => n.reduce((a, b) => a + b, 0) / n.length;
  const cost = (a, b) => {
    if (a.length === b.length) return a.reduce((s, x, i) => s + Math.abs(x - b[i]), 0);
    const near = (x, arr) => Math.min(...arr.map(y => Math.abs(x - y)));
    return Math.round((b.reduce((s, x) => s + near(x, a), 0) + a.reduce((s, x) => s + near(x, b), 0)) / 2);
  };
  KS.voice = { ctr, cost };

  // Cadena de notas comunes entre acordes consecutivos (compartida por todos los instrumentos)
  KS.commonChainHTML = (list) => {
    let h = '';
    list.forEach((c, k) => {
      h += `<span class="ch">${c.sym}</span>`;
      const n = list[(k + 1) % list.length];
      const com = c.pcs.filter(p => n.pcs.includes(p));
      const lk = com.length
        ? '<span class="cm">' + com.map(p => `<b>${KS.noteName(p, n.flat)}</b>`).join('') + '</span>'
        : `<i>${KS.t('none')}</i>`;
      h += `<span class="link">${lk}<span class="arrow" aria-hidden="true">${k === list.length - 1 ? '↩' : '→'}</span></span>`;
    });
    return h;
  };
})(window.KS);
