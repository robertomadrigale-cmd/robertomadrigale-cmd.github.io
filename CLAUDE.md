# Apps de práctica musical de Roberto

Este repositorio publica en GitHub Pages (rama `main`, se despliega solo al hacer push):

| Carpeta | App | URL |
|---|---|---|
| `mastil/` | **Roka Guitar for All** (antes Mástil a la Vista) — teoría visual para guitarra (PWA) | https://robertomadrigale-cmd.github.io/mastil/ |
| `bateria/` | **Pulso a la Vista** — pulso y tiempo para baterista de banda (PWA) | https://robertomadrigale-cmd.github.io/bateria/ |

Roberto no es programador: entrégale cambios terminados y publicados, sin pedirle que edite código. Todo el texto de las apps va en español de México, tuteando.

## Cómo está armada cada app

- El código fuente vive en `<app>/src/`. **No edites `<app>/index.html` a mano**: se genera.
- `src/0-style.css` + los `src/[1-9]-*.js` se concatenan (en orden) dentro de `src/index.tpl.html` → `index.html` de una sola pieza. `src/sw.tpl.js` → `sw.js` con versión nueva en cada build (eso hace que los teléfonos reciban la actualización).
- Para reconstruir: el `build.sh` espera la estructura `src/` y `dist/`. Lo más simple desde este repo:
  ```sh
  cd mastil && mkdir -p /tmp/b/src /tmp/b/dist && cp src/* /tmp/b/src/ && cp src/build.sh /tmp/b/ && cp -r fonts icons manifest.webmanifest /tmp/b/dist/ && sh /tmp/b/build.sh && cp /tmp/b/dist/index.html /tmp/b/dist/sw.js .
  ```
  (igual para `bateria`).
- Sin dependencias ni frameworks: JavaScript puro, audio con Web Audio API (sonidos sintetizados), fuentes locales en `fonts/`, funciona sin conexión.
- Datos del usuario: solo `localStorage` del dispositivo (claves `mastil-a-la-vista:v2` y `pulso-a-la-vista:v1`).

### Roka Guitar for All (guitarra)
- `1-theory.js` notas, escalas, acordes y el dibujo del mástil `fretboard()` (soporta modo zurdo con `LEFTY`).
- `2-widgets.js` diagramas interactivos (`WID`), `3-engine.js` audio (cuerda Karplus-Strong), secuenciador, metrónomo, pistas, temporizador.
- `4-content.js` las 11 lecciones; cada ejercicio `E({...})` puede tener `fig` (`pts(...)` = notas en orden, `chords(ch(...))` = acordes que cambian al pulso), `bpm`, `track`, `game`.
- `5-fig.js` diagramas que suenan y siguen el pulso. `5-tools.js` metrónomo, afinador, juego, pistas, rutina. `6-app.js` inicio, navegación, tarjetas de ejercicio, progreso.
- `5-extra.js` logo, avisos (`toast`), Canciones (`SONGBOOK`), afinaciones (`TUNINGS`), **modo reto** (`SONGS`: notas que caen en canvas, toques o micrófono), grabadora (IndexedDB `mades-guitar-hero`), logros (`ACH`, se revisan en cada `save()`) y respaldo por código `MGH1:`.
- `5-songbook.js` **cancionero karaoke** (motor): ChordPro (`[Sol]letra`, `{bpm:}` `{time:}` `{bpl:}` `{cpb:}` `{style:}` `{pickup:}` `{c:}`), `normalizePaste()` convierte "acordes arriba, letra abajo" (UG, LaCuerda; Do-Re-Mi en mayúsculas; quita tablaturas). Cada renglón se divide en piezas (palabras o sílabas con `~`); con `{mel: G4/1 +A4/.5 r/1}` la melodía da el tiempo exacto de cada sílaba (voz guía) y si no, los acordes caen en compases. `voicing()` = digitación real (abiertos de `OC` o cejilla), `bandStep()` = banda por estilo (folk, balada, rock, vals, ranchera, cumbia, son). Secuenciador a dieciseisavos (`SEQ.id='kar'`). Panel `#kside`: tono, rasgueo sugerido (`KPAT`, un carácter por corchea, debe coincidir con `bandStep`) que se ilumina en vivo, y acorde actual.
- `5-songlib.js` datos: `TRAD` (dominio público con letra; validar que sílabas = notas en las que tienen `{mel}`) y `TOP100` (solo tono, BPM y progresión: sus letras tienen derechos de autor, no las incluyas; el usuario las pega y se guardan en `DB.songs`).
- `route()` reemplaza `#page` en cada vista para que no se acumulen listeners. La animación de entrada solo mueve (nunca usa opacidad 0) para que el contenido no quede invisible si el navegador la pausa.
- **Diseño (v3, sobrio estilo Apple):** la capa final de `0-style.css` ("acabado sobrio") manda: tipografía del sistema, títulos en minúsculas con peso, bordes `--hair`, íconos de trazo 1.7, medallas con íconos SVG (`ACHIC` en `5-extra.js`), sin emojis ni símbolos. Tema por defecto "Grafito" (claro: "Aluminio"). Ícono de la app: púa ámbar sobre grafito, sin texto (Pillow).
- Temas de color por épocas del rock: lista `THEMES` en `6-app.js` (colores + fondo `--art`). La carpeta `mastil/` y la clave de `localStorage` no cambian, para no romper links ni perder progreso.

### Pulso a la Vista (batería)
- `4-drums.js` sonidos de batería y la cuadrícula de grooves. `5-content.js` 29 grooves (`G`) y 12 lecciones.
- `7-tools.js` metrónomo avanzado (2 y 4, contratiempo, click intermitente, entrenador), **medidor de precisión** con micrófono (AudioWorklet de detección de golpes, calibración de latencia), tocar con la banda, setlist y rutina. `8-app.js` inicio con perfil de tiempo y navegación.

## Antes de publicar
1. Reconstruye y revisa que el JavaScript compile: `node -e "new Function(require('fs').readFileSync('index.html','utf8').split('<script>')[1].split('</script>')[0])"`.
2. Prueba en el navegador: que todos los botones respondan y no haya errores en consola, en ancho de teléfono (400 px) y de escritorio.
3. Commit y push a `main`.

## Ideas pendientes que Roberto vio con buenos ojos
- Canciones de práctica por lección (reutilizar ROKA Studio).
- Grabarse desde la app y escucharse.
- Sincronizar el progreso entre dispositivos con Firebase.
