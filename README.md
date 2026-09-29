# Kit Sosocial

Herramientas para las clases de música, pensadas para alumnos que no leen pentagrama: todo con cifrado inglés (C, Am, G7…), diagramas y teclados que suenan. En castellano y catalán.

## Qué incluye

| Sección | Estado |
|---|---|
| Piano: posición fundamental, inversiones y acordes completos, con notas comunes y el camino más corto | ✅ Fase 1 |
| Metrónomo: compás, subdivisiones, marcar tempo, cuenta de entrada y entrenador de velocidad | ✅ Fase 1 |
| Bajo: posiciones en formato C3T3 (cuerda 3, traste 3), camino más corto y niveles | Fase 2 |
| Guitarra: diagramas por niveles (al aire, cejilla, tríadas, acordes de 4 notas) | Fase 3 |
| Diccionario interactivo de notas y acordes | Fase 4 |

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

## Actualizar la app

1. Sube los archivos nuevos al repositorio (sustituyendo los antiguos).
2. **Importante:** en `sw.js`, cambia `const VERSION = 'kit-sosocial-v1';` por `v2`, `v3`… cada vez. Si no, los móviles que ya la tienen instalada seguirán viendo la versión anterior.

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
