/* Kit Sosocial — Diccionario interactivo: notas, acordes, ritmo, instrumentos y vocabulario (castellano / catalán) */
(function (KS) {
  const L = (es, ca) => (KS.state.lang === 'ca' ? ca : es);
  const EN_S = KS.NOTES.EN_S, EN_F = KS.NOTES.EN_F, LA_S = KS.NOTES.LA_S, LA_F = KS.NOTES.LA_F;
  const NAT = [0, 2, 4, 5, 7, 9, 11];
  const isNat = pc => NAT.includes(pc);
  let rootPc = 0, selQ = '', drumTimers = [];

  /* ---------- Datos ---------- */
  const CHORD_ROWS = [
    ['', 'Alegre, estable', 'Alegre, estable'], ['m', 'Triste, serio', 'Trist, seriós'],
    ['7', 'Tenso, quiere resolver (blues, rock)', 'Tens, vol resoldre (blues, rock)'],
    ['maj7', 'Suave, soñador', 'Suau, somiador'], ['m7', 'Menor relajado (funk, soul)', 'Menor relaxat (funk, soul)'],
    ['sus2', 'Abierto, en suspenso', 'Obert, en suspens'], ['sus4', 'En suspenso, quiere volver a mayor', 'En suspens, vol tornar a major'],
    ['add9', 'Mayor con brillo extra', 'Major amb brillantor extra'], ['6', 'Mayor "vintage"', 'Major "vintage"'],
    ['m6', 'Menor con color jazz', 'Menor amb color jazz'], ['9', 'Séptima con más color (funk)', 'Setena amb més color (funk)'],
    ['dim', 'Inquietante', 'Inquietant'], ['dim7', 'Muy tenso, de película', 'Molt tens, de pel·lícula'],
    ['m7b5', 'Oscuro, prepara un menor', 'Fosc, prepara un menor'], ['aug', 'Misterioso', 'Misteriós'],
    ['5', 'Ni mayor ni menor: rock y metal', 'Ni major ni menor: rock i metal']
  ];
  const SUFFIX = { '': '', m: 'm', '7': '7', maj7: 'maj7', m7: 'm7', sus2: 'sus2', sus4: 'sus4', add9: 'add9', '6': '6', m6: 'm6', '9': '9', dim: 'dim', dim7: 'dim7', m7b5: 'm7b5', aug: 'aug', '5': '5' };
  const FIGURES = [
    ['whole note', 'semibreve', 'redonda', 'rodona', 4, 1], ['half note', 'minim', 'blanca', 'blanca', 2, 2],
    ['quarter note', 'crotchet', 'negra', 'negra', 1, 4], ['eighth note', 'quaver', 'corchea', 'corxera', 0.5, 8],
    ['sixteenth note', 'semiquaver', 'semicorchea', 'semicorxera', 0.25, 16]
  ];
  const VOCAB = [
    ['General', 'General', [
      ['key', 'tonalidad', 'tonalitat'], ['scale', 'escala', 'escala'], ['root', 'fundamental (nota que da nombre al acorde)', "fonamental (nota que dona nom a l'acord)"],
      ['chord progression', 'progresión de acordes', "progressió d'acords"], ['beat', 'pulso', 'pols'], ['bar / measure', 'compás', 'compàs'],
      ['tempo / BPM', 'velocidad / pulsos por minuto', 'velocitat / pulsacions per minut'], ['riff', 'riff (frase corta que se repite)', 'riff (frase curta que es repeteix)'],
      ['intro / outro', 'introducción / final', 'introducció / final'], ['verse', 'estrofa', 'estrofa'], ['pre-chorus', 'pre-estribillo', 'pretornada'],
      ['chorus', 'estribillo', 'tornada'], ['bridge', 'puente', 'pont'], ['solo', 'solo', 'solo'],
      ['loud / soft', 'fuerte / suave', 'fort / suau'], ['count in', 'marcar la entrada ("un, dos, tres, cuatro")', "marcar l'entrada (\"un, dos, tres, quatre\")"],
      ['sharp / flat / natural', 'sostenido / bemol / becuadro', 'sostingut / bemoll / becaire'], ['rest', 'silencio', 'silenci']
    ]],
    ['Guitarra', 'Guitarra', [
      ['fret / fretboard', 'traste / mástil (diapasón)', 'trast / mànec (diapasó)'], ['open string', 'cuerda al aire', "corda a l'aire"],
      ['capo', 'cejilla (la pinza)', 'capo (la pinça)'], ['barre chord', 'acorde con cejilla', 'acord amb barré'],
      ['strumming', 'rasgueo', 'rasgueig'], ['downstroke / upstroke', 'golpe hacia abajo / hacia arriba (↓ ↑)', 'cop avall / amunt (↓ ↑)'],
      ['pick', 'púa', 'pua'], ['fingerpicking', 'punteo con dedos / arpegio', 'punteig amb els dits / arpegi'],
      ['palm mute', 'apagado con la palma', 'apagat amb el palmell'], ['tuning', 'afinación', 'afinació']
    ]],
    ['Bajo', 'Baix', [
      ['root note', 'fundamental', 'fonamental'], ['bass line', 'línea de bajo', 'línia de baix'],
      ['walking bass', 'bajo caminante (una nota por pulso que va "andando")', 'baix caminant (una nota per pols que va "caminant")'],
      ['slap', 'slap (golpe con el pulgar)', 'slap (cop amb el polze)'], ['octave', 'octava', 'octava'], ['approach note', 'nota de paso', 'nota de pas']
    ]],
    ['Piano', 'Piano', [
      ['key / keyboard', 'tecla / teclado', 'tecla / teclat'], ['white keys / black keys', 'teclas blancas / teclas negras', 'tecles blanques / tecles negres'],
      ['right hand (RH) / left hand (LH)', 'mano derecha (MD) / mano izquierda (MI)', 'mà dreta (MD) / mà esquerra (ME)'],
      ['middle C', 'Do central', 'Do central'], ['sustain pedal', 'pedal de resonancia', 'pedal de ressonància'],
      ['inversion', 'inversión (las mismas notas en otro orden)', 'inversió (les mateixes notes en un altre ordre)']
    ]],
    ['Batería', 'Bateria', [
      ['sticks', 'baquetas', 'baquetes'], ['groove / beat', 'ritmo base', 'ritme base'], ['fill', 'redoble / fill (paso entre partes)', 'redoble / fill (pas entre parts)'],
      ['open / closed hi-hat', 'charles abierto / cerrado', 'charles obert / tancat'], ['rimshot', 'golpe de aro', "cop d'aro"],
      ['single stroke / double stroke', 'golpe simple (D I D I) / golpe doble (D D I I)', 'cop simple (D E D E) / cop doble (D D E E)'],
      ['R / L', 'D / I (derecha / izquierda)', 'D / E (dreta / esquerra)'], ['click / metronome', 'claqueta / metrónomo', 'claqueta / metrònom']
    ]]
  ];
  const KIT = [
    ['kick', 'BD / K', 'bass drum / kick', 'bombo', 'bombo'], ['snare', 'SD / S', 'snare drum', 'caja', 'caixa'],
    ['hh', 'HH', 'hi-hat', 'charles (hi-hat)', 'charles (hi-hat)'], ['tom1', 'T1 / T2', 'rack toms', 'toms aéreos', 'toms aeris'],
    ['ft', 'FT', 'floor tom', 'tom base (goliat)', 'tom de terra'], ['crash', 'CR', 'crash cymbal', 'plato crash', 'plat crash'],
    ['ride', 'RD', 'ride cymbal', 'plato ride', 'plat ride']
  ];

  /* ---------- Piezas de dibujo ---------- */
  function fretboard(strings, color, kind) {
    const cw = 58, rh = 36, left = 70, top = 10, frets = 12;
    const W = left + cw * (frets + 1) + 8, H = top + rh * strings.length + 30;
    let s = `<svg class="dfb" viewBox="0 0 ${W} ${H}" style="--c:${color}" role="img" aria-label="${L('Mástil con los nombres de las notas', 'Mànec amb els noms de les notes')}">`;
    const y0 = top + rh / 2, y1 = top + rh * (strings.length - 0.5);
    s += `<rect class="d-nut" x="${left + cw - 3}" y="${y0 - 8}" width="6" height="${y1 - y0 + 16}"/>`;
    for (let f = 2; f <= frets + 1; f++) s += `<line class="d-fret" x1="${left + cw * f}" y1="${y0 - 8}" x2="${left + cw * f}" y2="${y1 + 8}"/>`;
    strings.forEach((st, k) => {
      const y = top + rh * k + rh / 2;
      s += `<line class="d-str" x1="${left}" y1="${y}" x2="${left + cw * (frets + 1)}" y2="${y}" stroke-width="${1 + k * 0.4}"/>`;
      s += `<text class="d-sl" x="4" y="${y + 4}">${st.n}ª ${EN_S[st.o % 12]} ${LA_S[st.o % 12]}</text>`;
      for (let f = 0; f <= frets; f++) {
        const m = st.o + f, pc = m % 12, cx = left + cw * f + cw / 2;
        if (isNat(pc)) {
          s += `<g class="d-nat" data-${kind}="${m}"><rect x="${cx - 24}" y="${y - 15}" width="48" height="30" rx="15"/><text class="en" x="${cx}" y="${y - 1}" text-anchor="middle">${EN_S[pc]}</text><text class="la" x="${cx}" y="${y + 11}" text-anchor="middle">${LA_S[pc]}</text></g>`;
        } else {
          s += `<g class="d-acc" data-${kind}="${m}"><rect x="${cx - 21}" y="${y - 12}" width="42" height="24" rx="6"/><text x="${cx}" y="${y - 1}" text-anchor="middle">${EN_S[pc]}</text><text x="${cx}" y="${y + 9}" text-anchor="middle">${LA_S[pc]}</text></g>`;
        }
      }
    });
    for (let f = 0; f <= frets; f++) {
      const cx = left + cw * f + cw / 2;
      s += `<text class="d-fn" x="${cx}" y="${H - 14}" text-anchor="middle">${f === 0 ? L('aire', 'aire') : f}</text>`;
      if ([3, 5, 7, 9, 12].includes(f)) s += `<text class="d-mk" x="${cx}" y="${H - 2}" text-anchor="middle">${f === 12 ? '●●' : '●'}</text>`;
    }
    return s + '</svg>';
  }
  function keyboard(lo, octs, hl, big) {
    const ww = big ? 48 : 16, wh = big ? 170 : 64, bw = ww * 0.6, bh = wh * 0.62, whites = [0, 2, 4, 5, 7, 9, 11], after = { 0: 1, 1: 3, 3: 6, 4: 8, 5: 10 };
    const W = ww * 7 * octs + 2;
    let s = `<svg class="dkb${big ? ' big' : ''}" viewBox="0 0 ${W} ${wh + 2}" role="img" aria-label="${L('Teclado', 'Teclat')}">`;
    for (let o = 0; o < octs; o++) whites.forEach((n, k) => {
      const m = lo + o * 12 + n, x = 1 + ww * (o * 7 + k), on = hl && hl.includes(m);
      s += `<g data-pn="${m}"><rect class="k-w${on ? ' k-on' : ''}" x="${x}" y="1" width="${ww}" height="${wh}" rx="3"/>`;
      if (big) {
        s += `<text class="dk-en" x="${x + ww / 2}" y="${wh - 22}" text-anchor="middle">${EN_S[n]}</text><text class="dk-la" x="${x + ww / 2}" y="${wh - 7}" text-anchor="middle">${LA_S[n]}</text>`;
        if (m === 60) s += `<text class="dk-c" x="${x + ww / 2}" y="${wh - 40}" text-anchor="middle">C4 · Do3</text>`;
      }
      s += '</g>';
    });
    for (let o = 0; o < octs; o++) Object.entries(after).forEach(([k, n]) => {
      const m = lo + o * 12 + n, x = 1 + ww * (o * 7 + +k + 1) - bw / 2, on = hl && hl.includes(m);
      s += `<g data-pn="${m}"><rect class="${on ? 'k-on' : 'k-b'}" x="${x}" y="1" width="${bw}" height="${bh}" rx="2"/>`;
      if (big) s += `<text class="dk-b" x="${x + bw / 2}" y="${bh - 22}" text-anchor="middle">${EN_S[n]}</text><text class="dk-b" x="${x + bw / 2}" y="${bh - 10}" text-anchor="middle">${EN_F[n]}</text>`;
      s += '</g>';
    });
    return s + '</svg>';
  }
  function kitSVG() {
    const pc = (id, x, y, r, cls, a, b) => `<g class="kitp ${cls}" data-drum="${id}" role="button" aria-label="${b}"><circle cx="${x}" cy="${y}" r="${r}"/><text x="${x}" y="${y - 2}" text-anchor="middle" class="kt">${a}</text><text x="${x}" y="${y + 12}" text-anchor="middle" class="ks">${b}</text></g>`;
    let s = `<svg class="kit" viewBox="0 0 340 260" role="img" aria-label="${L('Batería vista desde arriba', 'Bateria vista des de dalt')}">`;
    s += pc('crash', 60, 70, 42, 'cym', 'CR', 'crash') + pc('ride', 280, 70, 48, 'cym', 'RD', 'ride') + pc('hh', 50, 175, 36, 'cym', 'HH', 'charles');
    s += pc('tom1', 135, 85, 30, 'drm', 'T1', 'tom 1') + pc('tom2', 205, 85, 32, 'drm', 'T2', 'tom 2') + pc('ft', 287, 185, 40, 'drm', 'FT', L('tom base', 'tom de terra'));
    s += pc('snare', 120, 175, 36, 'drm', 'SD', L('caja', 'caixa'));
    s += `<g class="kitp drm bd" data-drum="kick" role="button" aria-label="${L('bombo', 'bombo')}"><rect x="160" y="130" width="76" height="92" rx="10"/><text x="198" y="172" text-anchor="middle" class="kt">BD</text><text x="198" y="186" text-anchor="middle" class="ks">bombo</text></g>`;
    s += `<text x="170" y="252" text-anchor="middle" class="ks">${L('(el batería se sienta aquí)', '(el bateria seu aquí)')}</text></svg>`;
    return s;
  }
  function chordMidis(ch) {
    let prev = -1;
    return KS.QUALITIES[ch.q][0].map(i => { let x = i; while (x <= prev) x += 12; prev = x; return 48 + ch.root + x; });
  }
  const table = (head, rows) => `<div class="dscroll"><table class="dt"><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map((c, i) => `<td${i === 0 ? ' class="en"' : ''}>${c}</td>`).join('')}</tr>`).join('')}</table></div>`;
  const tip = h => `<div class="dtip">${h}</div>`;

  /* ---------- Secciones ---------- */
  function secNotas() {
    const lang = L('Castellano', 'Català');
    let h = `<div class="dhero">${NAT.map(pc => `<button type="button" data-pn="${60 + pc}"><b>${EN_S[pc]}</b><span>${LA_S[pc]}</span></button>`).join('')}</div>`;
    h += tip(L('<b>Truco para memorizarlo:</b> el abecedario empieza en La. <b>A B C D E F G</b> = La Si Do Re Mi Fa Sol.', "<b>Truc per memoritzar-ho:</b> l'abecedari comença per La. <b>A B C D E F G</b> = La Si Do Re Mi Fa Sol."));
    h += `<h3>${L('Alteraciones', 'Alteracions')}</h3>` + table([L('Símbolo', 'Símbol'), 'English', lang, L('Qué hace', 'Què fa')], [
      ['#', 'sharp', L('sostenido', 'sostingut'), L('Sube medio tono (1 traste / la tecla siguiente)', 'Puja mig to (1 trast / la tecla següent)')],
      ['♭ (b)', 'flat', L('bemol', 'bemoll'), L('Baja medio tono (1 traste / la tecla anterior)', 'Baixa mig to (1 trast / la tecla anterior)')],
      ['♮', 'natural', L('becuadro', 'becaire'), L('Anula la alteración', "Anul·la l'alteració")]
    ]);
    h += `<h3>${L('Las 12 notas', 'Les 12 notes')}</h3><p class="sub">${L('Una nota con # y la siguiente con ♭ suenan igual: son el mismo traste o la misma tecla negra. Pulsa para escucharlas.', 'Una nota amb # i la següent amb ♭ sonen igual: són el mateix trast o la mateixa tecla negra. Prem per escoltar-les.')}</p>`;
    h += '<div class="dscroll"><table class="dt chrom"><tr><th>English</th>' + EN_S.map((n, pc) => `<td class="en"><button type="button" data-pn="${60 + pc}">${isNat(pc) ? n : n + ' / ' + EN_F[pc]}</button></td>`).join('') + `</tr><tr><th>${lang}</th>` + LA_S.map((n, pc) => `<td>${isNat(pc) ? n : n + ' / ' + LA_F[pc]}</td>`).join('') + '</tr></table></div>';
    h += tip(L('Entre <b>E–F</b> (Mi–Fa) y <b>B–C</b> (Si–Do) no hay ninguna nota en medio: por eso en el piano ahí no hay tecla negra.', 'Entre <b>E–F</b> (Mi–Fa) i <b>B–C</b> (Si–Do) no hi ha cap nota al mig: per això al piano no hi ha tecla negra.'));
    h += `<h3>${L('Octavas: el Do central', 'Octaves: el Do central')}</h3><p>${L('El Do del centro del piano se llama <b>C4</b> en el sistema inglés y <b>Do3</b> en muchos conservatorios de aquí. Es la misma nota: solo cambia la numeración.', "El Do del centre del piano s'anomena <b>C4</b> en el sistema anglès i <b>Do3</b> a molts conservatoris d'aquí. És la mateixa nota: només canvia la numeració.")}</p>`;
    return h;
  }
  function secAcordes() {
    const rootName = ([1, 3, 8, 10].includes(rootPc) ? EN_F : EN_S)[rootPc];
    let h = `<p class="sub">${L('Elige la nota y mira cómo se escribe y cómo suena cada tipo de acorde.', 'Tria la nota i mira com s\'escriu i com sona cada tipus d\'acord.')}</p>`;
    h += '<div class="droots" role="group">' + EN_S.map((n, pc) => `<button type="button" data-root="${pc}" class="${pc === rootPc ? 'on' : ''}">${isNat(pc) ? n : EN_S[pc] + '/' + EN_F[pc]}</button>`).join('') + '</div>';
    const rows = CHORD_ROWS.map(([q, es, ca]) => {
      const sym = rootName + SUFFIX[q], ch = KS.parseChord(sym);
      const notes = ch.pcs.map(p => KS.noteName(p, ch, 'lat') + ' (' + KS.noteName(p, ch, 'en') + ')').join(' · ');
      return `<tr class="${q === selQ ? 'sel' : ''}"><td class="en"><button type="button" data-cq="${q}">▶ ${sym}</button></td><td>${KS.chordName(ch)}</td><td>${notes}</td><td>${L(es, ca)}</td></tr>`;
    }).join('');
    const selCh = KS.parseChord(rootName + SUFFIX[selQ]);
    h += `<div class="dchordsel"><div class="dcs-name"><b>${selCh.sym}</b><span>${KS.chordName(selCh)}</span></div>${keyboard(48, 3, chordMidis(selCh), false)}</div>`;
    h += `<div class="dscroll"><table class="dt"><tr><th>${L('Cifrado', 'Xifrat')}</th><th>${L('Se dice', 'Es diu')}</th><th>${L('Notas', 'Notes')}</th><th>${L('Carácter', 'Caràcter')}</th></tr>${rows}</table></div>`;
    h += tip(L('Si solo aparece la letra (G, F, A…) siempre es <b>mayor</b>. La <b>m</b> minúscula es menor; <b>maj</b> se refiere a la séptima mayor.', 'Si només hi ha la lletra (G, F, A…) sempre és <b>major</b>. La <b>m</b> minúscula és menor; <b>maj</b> es refereix a la setena major.'));
    h += tip(L('<b>Acordes con barra:</b> <b>C/E</b> se lee "Do con bajo en Mi". Se toca el acorde de Do, pero la nota más grave es Mi.', '<b>Acords amb barra:</b> <b>C/E</b> es llegeix "Do amb baix en Mi". Es toca l\'acord de Do, però la nota més greu és Mi.'));
    return h;
  }
  function secRitmo() {
    const rows = FIGURES.map(([us, uk, es, ca, dur, n]) => [`<button type="button" data-fig="${n}">▶ ${us}</button>`, uk, L(es, ca), `${dur === 0.5 ? '½' : dur === 0.25 ? '¼' : dur} ${L(dur > 1 ? 'pulsos' : 'pulso', dur > 1 ? 'polsos' : 'pols')}`]);
    return `<p class="sub">${L('Pulsa una figura para escuchar un compás de 4/4 con esa figura a la velocidad del metrónomo.', 'Prem una figura per escoltar un compàs de 4/4 amb aquesta figura a la velocitat del metrònom.')}</p>` +
      table(['English (US)', 'English (UK)', L('Castellano', 'Català'), L('Duración en 4/4', 'Durada en 4/4')], rows) +
      `<p>${L('Un <b>silencio</b> (rest) dura lo mismo que su figura, pero no suena.', 'Un <b>silenci</b> (rest) dura el mateix que la seva figura, però no sona.')}</p>`;
  }
  function secGuitarra() {
    const T = [[1, 64], [2, 59], [3, 55], [4, 50], [5, 45], [6, 40]].map(([n, o]) => ({ n, o }));
    let h = table([L('Cuerda', 'Corda'), 'English', L('Castellano', 'Català'), ''], [
      ['6ª', 'E', 'Mi', L('La más gruesa y grave', 'La més gruixuda i greu')], ['5ª', 'A', 'La', ''], ['4ª', 'D', 'Re', ''],
      ['3ª', 'G', 'Sol', ''], ['2ª', 'B', 'Si', ''], ['1ª', 'E', 'Mi', L('La más fina y aguda', 'La més fina i aguda')]]);
    h += tip(L('De grave a aguda: <b>Mi La Re Sol Si Mi</b>, en inglés <b>E A D G B E</b> ("Eddie Ate Dynamite, Good Bye Eddie").', 'De greu a aguda: <b>Mi La Re Sol Si Mi</b>, en anglès <b>E A D G B E</b> ("Eddie Ate Dynamite, Good Bye Eddie").'));
    h += `<h3>${L('Notas en el mástil (trastes 0–12)', 'Notes al mànec (trastos 0–12)')}</h3><p class="sub">${L('Arriba está la 1ª cuerda, igual que en la tablatura. Pulsa una nota para escucharla.', 'A dalt hi ha la 1a corda, igual que a la tabulatura. Prem una nota per escoltar-la.')}</p><div class="dscroll">${fretboard(T, 'var(--guitarra)', 'gn')}</div>`;
    h += `<h3>${L('Cómo leer una tablatura', 'Com llegir una tabulatura')}</h3><p>${L('Seis líneas = seis cuerdas, con la 1ª arriba. El número es el traste que hay que pisar (0 = al aire). Los números en la misma columna suenan a la vez.', 'Sis línies = sis cordes, amb la 1a a dalt. El número és el trast que cal trepitjar (0 = a l\'aire). Els números a la mateixa columna sonen alhora.')}</p>`;
    h += '<pre class="dtab">e |-----------------|-----------------|\nB |-----------------|-----------------|\nG |-----------------|-----------------|\nD |-----------------|-----------------|\nA |-----------------|-----------0-1-3-|\nE |-0-1-3-----------|-0-1-3-----------|</pre>';
    h += `<p class="sub">${KS.t('g_diag_help')}</p>`;
    return h;
  }
  function secBajo() {
    const T = [[1, 43], [2, 38], [3, 33], [4, 28]].map(([n, o]) => ({ n, o }));
    let h = table([L('Cuerda', 'Corda'), 'English', L('Castellano', 'Català')], [
      [L('4ª (la gruesa)', '4a (la gruixuda)'), 'E', 'Mi'], ['3ª', 'A', 'La'], ['2ª', 'D', 'Re'], [L('1ª (la fina)', '1a (la fina)'), 'G', 'Sol']]);
    h += `<h3>${L('Notas en el mástil (trastes 0–12)', 'Notes al mànec (trastos 0–12)')}</h3><div class="dscroll">${fretboard(T, 'var(--bajo)', 'bn')}</div>`;
    h += tip(L('<b>Posiciones:</b> <span class="pos">C3T3</span> = cuerda 3, traste 3 (Do). <span class="pos">C4T3</span> = cuerda 4, traste 3 (Sol).', '<b>Posicions:</b> <span class="pos">C3T3</span> = corda 3, trast 3 (Do). <span class="pos">C4T3</span> = corda 4, trast 3 (Sol).'));
    h += tip(L('<b>Regla de oro:</b> si en la hoja pone <b>Am</b>, el bajo toca <b>A</b> (La). En <b>C/E</b> el bajo toca lo que va detrás de la barra: <b>E</b> (Mi).', "<b>Regla d'or:</b> si al full posa <b>Am</b>, el baix toca <b>A</b> (La). A <b>C/E</b> el baix toca el que va darrere de la barra: <b>E</b> (Mi)."));
    return h;
  }
  function secPiano() {
    let h = `<p class="sub">${L('Las teclas negras van en grupos de dos y de tres. Pulsa una tecla para escucharla.', 'Les tecles negres van en grups de dues i de tres. Prem una tecla per escoltar-la.')}</p><div class="dscroll">${keyboard(48, 2, null, true)}</div>`;
    h += tip(L('<b>Para encontrar Do (C):</b> busca un grupo de <b>dos</b> teclas negras; la blanca justo a su izquierda es Do. La blanca a la izquierda del grupo de <b>tres</b> es Fa (F).', '<b>Per trobar Do (C):</b> busca un grup de <b>dues</b> tecles negres; la blanca just a la seva esquerra és Do. La blanca a l\'esquerra del grup de <b>tres</b> és Fa (F).'));
    h += `<h3>${L('Numeración de los dedos', 'Numeració dels dits')}</h3><p>${L('En las dos manos: <b>1</b> pulgar, <b>2</b> índice, <b>3</b> medio, <b>4</b> anular, <b>5</b> meñique. Ojo: en guitarra el 1 es el índice.', 'A les dues mans: <b>1</b> polze, <b>2</b> índex, <b>3</b> del mig, <b>4</b> anular, <b>5</b> petit. Compte: a la guitarra l\'1 és l\'índex.')}</p>`;
    return h;
  }
  function secBateria() {
    let h = `<p class="sub">${L('La batería no usa nombres de notas: lo importante es saber qué pieza es cada una. Pulsa las piezas para escucharlas.', 'La bateria no fa servir noms de notes: l\'important és saber quina peça és cadascuna. Prem les peces per escoltar-les.')}</p>`;
    h += `<div class="dkit">${kitSVG()}${table([L('Abrev.', 'Abrev.'), 'English', L('Castellano', 'Català')], KIT.map(k => [k[1], k[2], L(k[3], k[4])]))}</div>`;
    h += `<h3>${L('El ritmo básico de rock', 'El ritme bàsic de rock')}</h3><p class="sub">${L('Cada fila es una pieza y cada columna un momento del compás. Se cuenta "1 y 2 y 3 y 4 y". Donde hay una x, se toca.', 'Cada fila és una peça i cada columna un moment del compàs. Es compta "1 i 2 i 3 i 4 i". On hi ha una x, es toca.')}</p>`;
    const y = L('y', 'i'), cols = ['1', y, '2', y, '3', y, '4', y];
    const row = (lbl, hits) => `<tr><td>${lbl}</td>${cols.map((_, i) => `<td class="${hits.includes(i) ? 'x' : ''}" data-dcol="${i}">${hits.includes(i) ? 'x' : ''}</td>`).join('')}</tr>`;
    h += `<div class="dscroll"><table class="dt grid"><tr><th>${L('Contar', 'Comptar')}</th>${cols.map((c, i) => `<th data-dcol="${i}">${c}</th>`).join('')}</tr>${row('HH charles', [0, 1, 2, 3, 4, 5, 6, 7])}${row('SD ' + L('caja', 'caixa'), [2, 6])}${row('BD bombo', [0, 4])}</table></div>`;
    h += `<div class="row"><button type="button" id="dRock">${KS.t('play')}</button><span class="sub">${L('Se toca a la velocidad del metrónomo', 'Es toca a la velocitat del metrònom')} (${KS.state.bpm} BPM)</span></div>`;
    return h;
  }
  function secVocab() {
    let h = `<label class="dsearch"><span>${L('Buscar', 'Cercar')}</span><input type="search" id="dSearch" placeholder="${L('chorus, cejilla, pulso…', 'chorus, tornada, pols…')}"></label>`;
    VOCAB.forEach(([gEs, gCa, rows]) => {
      h += `<h3 class="vg">${L(gEs, gCa)}</h3>` + `<div class="dscroll"><table class="dt vocab"><tr><th>English</th><th>${L('Castellano', 'Català')}</th></tr>` +
        rows.map(r => `<tr data-s="${(r[0] + ' ' + r[1] + ' ' + r[2]).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()}"><td class="en">${r[0]}</td><td>${L(r[1], r[2])}</td></tr>`).join('') + '</table></div>';
    });
    h += `<p class="sub" id="dNone" hidden>${L('No hay resultados. Prueba con otra palabra.', 'No hi ha resultats. Prova amb una altra paraula.')}</p>`;
    return h;
  }

  const SECTIONS = [
    ['notas', 'Notas', 'Notes', secNotas], ['acordes', 'Acordes', 'Acords', secAcordes], ['ritmo', 'Ritmo', 'Ritme', secRitmo],
    ['guitarra', 'Guitarra', 'Guitarra', secGuitarra], ['bajo', 'Bajo', 'Baix', secBajo], ['piano', 'Piano', 'Piano', secPiano],
    ['bateria', 'Batería', 'Bateria', secBateria], ['vocabulario', 'Vocabulario', 'Vocabulari', secVocab]
  ];

  function render(el) {
    let h = `<div class="vhead"><h1>${KS.t('tab_diccionario')}</h1><p>${L('Correspondencia entre el cifrado inglés y el castellano, con los instrumentos para tocar y escuchar.', "Correspondència entre el xifrat anglès i el català, amb els instruments per tocar i escoltar.")}</p></div>`;
    h += '<div class="dnav" role="navigation">' + SECTIONS.map(([id, es, ca]) => `<button type="button" data-go="${id}">${L(es, ca)}</button>`).join('') + `<button type="button" class="dprint" id="dPrint">${L('Imprimir o guardar en PDF', 'Imprimir o desar en PDF')}</button></div>`;
    SECTIONS.forEach(([id, es, ca, fn]) => { h += `<section class="dsec" id="d-${id}"><h2>${L(es, ca)}</h2>${fn()}</section>`; });
    el.innerHTML = h;
    wire(el);
  }

  function playFigure(n) {
    const ac = KS.audio.ctx(), beat = 60 / KS.state.bpm, t0 = ac.currentTime + 0.1;
    for (let b = 0; b < 4; b++) KS.audio.click(t0 + b * beat, b === 0 ? 2 : 1);
    const step = 4 * beat / n;
    for (let i = 0; i < n; i++) KS.audio.chord([72], null, t0 + i * step, Math.min(step * 0.9, 1.6));
  }
  function playRock(el) {
    KS.audio.hush(); drumTimers.forEach(clearTimeout); drumTimers = [];
    const ac = KS.audio.ctx(), e = 30 / KS.state.bpm, t0 = ac.currentTime + 0.1;
    for (let bar = 0; bar < 4; bar++) for (let i = 0; i < 8; i++) {
      const t = t0 + (bar * 8 + i) * e;
      KS.audio.drum(bar === 0 && i === 0 ? 'crash' : 'hh', t);
      if (i === 2 || i === 6) KS.audio.drum('snare', t);
      if (i === 0 || i === 4) KS.audio.drum('kick', t);
      drumTimers.push(setTimeout(() => el.querySelectorAll('[data-dcol]').forEach(c => c.classList.toggle('now', +c.dataset.dcol === i)), (t - ac.currentTime) * 1000));
    }
    drumTimers.push(setTimeout(() => el.querySelectorAll('[data-dcol]').forEach(c => c.classList.remove('now')), (t0 + 32 * e - ac.currentTime) * 1000));
  }

  function wire(el) {
    el.onchange = null;
    el.onclick = (e) => {
      const go = e.target.closest('[data-go]'); if (go) { el.querySelector('#d-' + go.dataset.go).scrollIntoView({ behavior: 'smooth' }); return; }
      if (e.target.closest('#dPrint')) { window.print(); return; }
      const pn = e.target.closest('[data-pn]'); if (pn) { KS.audio.chord([+pn.dataset.pn], null, null, 1.4); return; }
      const gn = e.target.closest('[data-gn]'); if (gn) { KS.audio.strum([+gn.dataset.gn], null, 1.6); return; }
      const bn = e.target.closest('[data-bn]'); if (bn) { KS.audio.bass(+bn.dataset.bn + (KS.state.bajo.up8 ? 12 : 0), null, 0.9); return; }
      const dr = e.target.closest('[data-drum]'); if (dr) { KS.audio.drum(dr.dataset.drum); return; }
      const fig = e.target.closest('[data-fig]'); if (fig) { playFigure(+fig.dataset.fig); return; }
      if (e.target.closest('#dRock')) { playRock(el); return; }
      const rt = e.target.closest('[data-root]');
      const cq = e.target.closest('[data-cq]');
      if (rt || cq) {
        if (rt) rootPc = +rt.dataset.root;
        if (cq) selQ = cq.dataset.cq;
        const sec = el.querySelector('#d-acordes');
        sec.innerHTML = `<h2>${L('Acordes', 'Acords')}</h2>` + secAcordes();
        if (cq) {
          KS.audio.chord(chordMidis(KS.parseChord(sec.querySelector('.dcs-name b').textContent)));
        }
      }
    };
    const s = el.querySelector('#dSearch');
    if (s) s.oninput = () => {
      const q = s.value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
      let any = false;
      el.querySelectorAll('.vocab tr[data-s]').forEach(r => { const on = !q || r.dataset.s.includes(q); r.hidden = !on; any = any || on; });
      el.querySelectorAll('.vocab').forEach(tb => { const vis = [...tb.querySelectorAll('tr[data-s]')].some(r => !r.hidden); tb.closest('.dscroll').hidden = !vis; tb.closest('.dscroll').previousElementSibling.hidden = !vis; });
      el.querySelector('#dNone').hidden = any;
    };
  }

  KS.views.diccionario = { render };
})(window.KS);
