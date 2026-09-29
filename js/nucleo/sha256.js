/* Kit Sosocial — SHA-256 (para comprobar los códigos de acceso sin guardarlos en claro) */
window.KS = window.KS || {};
window.KS.sha256 = function (ascii) {
  function rr(v, a) { return (v >>> a) | (v << (32 - a)); }
  const maxWord = Math.pow(2, 32);
  let result = '', words = [], i, j;
  const bitLen = ascii.length * 8;
  const hash = [], k = [];
  let primeCounter = 0;
  const isComposite = {};
  for (let c = 2; primeCounter < 64; c++) {
    if (!isComposite[c]) {
      for (i = 0; i < 313; i += c) isComposite[i] = c;
      hash[primeCounter] = (Math.pow(c, 0.5) * maxWord) | 0;
      k[primeCounter++] = (Math.pow(c, 1 / 3) * maxWord) | 0;
    }
  }
  const h = hash.slice(0, 8);
  ascii = unescape(encodeURIComponent(ascii)) + '\x80';
  while (ascii.length % 64 - 56) ascii += '\x00';
  for (i = 0; i < ascii.length; i++) {
    j = ascii.charCodeAt(i);
    words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }
  words[words.length] = (bitLen / maxWord) | 0;
  words[words.length] = bitLen;
  for (j = 0; j < words.length;) {
    const w = words.slice(j, j += 16), old = h.slice(0);
    let hh = h.slice(0);
    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];
      const a = hh[0], e = hh[4];
      const t1 = hh[7] + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & hh[5]) ^ (~e & hh[6])) + k[i] +
        (w[i] = (i < 16) ? w[i] : (w[i - 16] + (rr(w15, 7) ^ rr(w15, 18) ^ (w15 >>> 3)) + w[i - 7] + (rr(w2, 17) ^ rr(w2, 19) ^ (w2 >>> 10))) | 0);
      const t2 = (rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & hh[1]) ^ (a & hh[2]) ^ (hh[1] & hh[2]));
      hh = [(t1 + t2) | 0].concat(hh);
      hh[4] = (hh[4] + t1) | 0;
      hh.length = 8;
    }
    for (i = 0; i < 8; i++) h[i] = (hh[i] + old[i]) | 0;
  }
  for (i = 0; i < 8; i++) for (j = 3; j + 1; j--) { const b = (h[i] >> (j * 8)) & 255; result += ((b < 16) ? 0 : '') + b.toString(16); }
  return result;
};
// El código se normaliza (solo letras y números, en mayúsculas y sin acentos) y se mezcla con un prefijo fijo
window.KS.normCode = code => String(code || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '');
window.KS.codeHash = code => window.KS.sha256('kit-sosocial:' + window.KS.normCode(code));
