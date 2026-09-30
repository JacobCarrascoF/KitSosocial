# Kit Sosocial

Herramientas para las clases de música, pensadas para alumnos que no leen pentagrama: todo con cifrado inglés (C, Am, G7…), diagramas y teclados que suenan. En castellano y catalán.

## Qué incluye

| Sección | Estado |
|---|---|
| Piano: posición fundamental, inversiones y acordes completos, con notas comunes y el camino más corto | ✅ Fase 1 |
| Metrónomo: compás, subdivisiones, marcar tempo, cuenta de entrada y entrenador de velocidad | ✅ Fase 1 |
| Batería: rudimentos para pad en 3 niveles (golpes simples y dobles, acentos, paradiddles, flams) que suenan con el metrónomo | ✅ |
| Bajo: posiciones en formato C3T3 (cuerda 3, traste 3), camino más corto, 4 niveles (fundamental; 1-5-8; arpegio; notas de paso) y tablatura | ✅ Fase 2 |
| Guitarra: diagramas por niveles combinables (al aire, cejilla, tríadas, acordes de 4 notas), notas comunes, dedos que se quedan y camino más cómodo | ✅ Fase 3 |
| Diccionario interactivo: notas, acordes (con sonido), figuras rítmicas, mástiles de guitarra y bajo, teclado, batería que suena y vocabulario con buscador | ✅ Fase 4 |

La progresión de acordes se escribe una sola vez arriba y la usan todos los instrumentos.

## Compartir una canción con los alumnos

El botón **Compartir** copia un enlace con los acordes, la velocidad y el idioma, por ejemplo:

```
https://TU-USUARIO.github.io/kit-sosocial/?acordes=C,G,Am,F&bpm=90&lang=es#piano
```

Al abrirlo, la app aparece directamente con esa progresión.

## Publicar en GitHub Pages (una sola vez)

1. Entra en [github.com](https://github.com) y crea una cuenta si no tienes.
2. Pulsa **New repository**, ponle de nombre `kit-sosocial`, márcalo como **Public** y pulsa **Create repository**.
3. En el repositorio vacío, pulsa **uploading an existing file** y arrastra **todo el contenido** de esta carpeta (no la carpeta en sí: `index.html` tiene que quedar en la raíz). Pulsa **Commit changes**.
4. Ve a **Settings → Pages**. En *Branch* elige `main` y la carpeta `/ (root)`, y pulsa **Save**.
5. Espera uno o dos minutos. La app quedará en `https://TU-USUARIO.github.io/kit-sosocial/`.

## Instalarla en el móvil o la tablet

- **Android (Chrome):** abre el enlace y pulsa **Instalar app** (o menú ⋮ → *Añadir a pantalla de inicio*).
- **iPhone / iPad (Safari):** abre el enlace, pulsa el botón de compartir y elige **Añadir a pantalla de inicio**.

Una vez instalada funciona sin internet.

## Códigos de acceso

La app pide un código la primera vez que se abre en cada móvil u ordenador. Después lo recuerda.

**Crear un código nuevo** (por ejemplo, uno por grupo o por curso):
1. Abre `https://TU-DOMINIO/herramientas/generar-codigo.html` (o haz doble clic en `herramientas/generar-codigo.html` en tu ordenador).
2. Escribe el código, para quién es, qué pack incluye y, si quieres, cuándo caduca. Pulsa **Generar**.
3. Copia la línea que aparece y pégala dentro de `codigos: [ … ]` en `js/nucleo/config.js`.
4. Sube el número de versión en `sw.js` y guarda los cambios en GitHub.

**Quitar un código:** borra su línea de `config.js`. Quien lo usaba tendrá que introducir uno nuevo.

**Abrir la app a todo el mundo:** en `config.js`, cambia `activo: true` por `activo: false`.

En `config.js` nunca aparece el código en claro, solo su «huella». Aun así, es una protección pensada para uso en clase: alguien con conocimientos técnicos podría saltársela. Para contenido de pago más adelante habrá que usar un sistema con cuentas de usuario.

## Activar las donaciones (Ko-fi)

El enlace está en `js/nucleo/config.js` (`donar: 'https://ko-fi.com/sosocial'`). El botón aparece al pie de todas las secciones y en la pantalla del código.

## Actualizar la app

1. Sube los archivos nuevos al repositorio (sustituyendo los antiguos).
2. **Importante:** en `sw.js`, sube el número de `const VERSION = 'kit-sosocial-vN';` (v2, v3, v4…) cada vez. Si no, los móviles que ya la tienen instalada seguirán viendo la versión anterior.

## Probarla en el ordenador sin subirla

Haz doble clic en `index.html`. Funciona todo excepto el modo sin conexión, que solo se activa cuando está publicada.

## Estructura

```
kit-sosocial/
├── index.html              página principal
├── manifest.webmanifest    datos para instalarla como app
├── sw.js                   modo sin conexión
├── css/estilos.css
├── js/
│   ├── nucleo/
│   │   ├── estado.js       progresión, ajustes y guardado
│   │   ├── idioma.js       textos en castellano y catalán
│   │   ├── acordes.js      lector de acordes y nombres de notas
│   │   └── audio.js        sonido y reloj compartido
│   ├── piano.js
│   ├── metronomo.js
│   ├── guitarra.js
│   ├── bajo.js
│   ├── diccionario.js
│   └── app.js              pestañas, barra de progresión y arranque
└── iconos/
```

Para cambiar o añadir un texto, edita `js/nucleo/idioma.js`: cada frase está en `es` y en `ca` con la misma clave.

## Acordes que reconoce

Mayores y menores (C, Cm), 7, maj7, m7, mmaj7, 6, m6, sus2, sus4, 7sus4, add9, madd9, 9, m9, maj9, dim, dim7, m7b5 (ø), aug (+), 5 (power chord) y acordes con barra (C/E). Con sostenidos y bemoles: F#m, Bb7, Ebmaj7…
