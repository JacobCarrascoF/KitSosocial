/* Kit Sosocial — guitarra: se desarrolla en la fase 3. De momento muestra un aviso. */
(function (KS) {
  const t = KS.t;
  function render(el) {
    el.onclick = null;
    el.innerHTML = `<div class="vhead"><h1>${t('tab_guitarra')}</h1></div>
      <div class="soon"><span class="badge">${t('soon')} · ${t('phase', { n: 3 })}</span><p>${t('soon_guit')}</p></div>`;
  }
  KS.views.guitarra = { render };
})(window.KS);
