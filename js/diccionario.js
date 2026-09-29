/* Kit Sosocial — diccionario: se desarrolla en la fase 4. De momento muestra un aviso. */
(function (KS) {
  const t = KS.t;
  function render(el) {
    el.onclick = null;
    el.innerHTML = `<div class="vhead"><h1>${t('tab_diccionario')}</h1></div>
      <div class="soon"><span class="badge">${t('soon')} · ${t('phase', { n: 4 })}</span><p>${t('soon_dicc')}</p></div>`;
  }
  KS.views.diccionario = { render };
})(window.KS);
