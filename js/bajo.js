/* Kit Sosocial — bajo: se desarrolla en la fase 2. De momento muestra un aviso. */
(function (KS) {
  const t = KS.t;
  function render(el) {
    el.onclick = null;
    el.innerHTML = `<div class="vhead"><h1>${t('tab_bajo')}</h1></div>
      <div class="soon"><span class="badge">${t('soon')} · ${t('phase', { n: 2 })}</span><p>${t('soon_bajo')}</p></div>`;
  }
  KS.views.bajo = { render };
})(window.KS);
