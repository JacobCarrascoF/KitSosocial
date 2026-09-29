/* Kit Sosocial — configuración */
window.KS = window.KS || {};
window.KS.CONFIG = {
  // Enlace del botón de donaciones
  donar: 'https://ko-fi.com/sosocial',

  // Acceso con código.
  // activo: false  → la app queda abierta para todo el mundo.
  // Para crear un código nuevo, abre herramientas/generar-codigo.html, escribe el código y copia aquí la línea que te da.
  // Cada código tiene:
  //   nombre: para quién es (solo lo ves tú)
  //   huella: el código cifrado (nunca pongas aquí el código en claro)
  //   packs:  qué incluye: 'basico' = todo lo actual; más adelante, 'premium'
  //   hasta:  fecha de caducidad opcional, en formato 'AAAA-MM-DD'; '' = no caduca
  // Si borras un código de esta lista, quien lo usaba deja de tener acceso en la siguiente actualización.
  acceso: {
    activo: true,
    codigos: [
      { nombre: 'Alumnado', huella: '86da8a26eb0466514ef19ab5614972c301129425bbe947f82a9b50a3170b8105', packs: ['basico'], hasta: '' },
      { nombre: 'Pack básico', huella: '8cf7d04e7eb16903946baa144285cffd05a424f1843186c9cc0b4c5ab63d51ec', packs: ['basico'], hasta: '' },
      { nombre: 'Pack premium (incluye el básico)', huella: '70043a9b15bd44ac3ffd8d287efc17f5913cacfbc33802a2cea1e88fa9478cfe', packs: ['basico', 'premium'], hasta: '' }
    ]
  }
};
