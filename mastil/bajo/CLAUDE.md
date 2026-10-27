# Om Bajo — variante de bajo de Om Guitarra

(Antes «Roka Bajo»; la carpeta `mastil/bajo/` y la clave `roka-bajo:v1` no cambian.) Desde el 25 oct 2026 **Om Bajo sale del mismo código que Om Guitarra** (`mastil/src/`) y hereda todas sus secciones: lecciones con diagramas que suenan, siguen el pulso y califican con micrófono, cancionero karaoke con banda y sincronización con tu grabación, reto, cámara lenta, metrónomo, afinador, juego del mástil, pistas, rutina, grabadora, logros, respaldo `MGH1:`, temas, nube Firebase, «Tocar con un beat» (Om Estudio), narrador y marca Om. Bajo de 4 cuerdas (Mi La Re Sol) o 5 (+ Si grave). Español de México, tuteo, sin emojis.

## Cómo se arma

- `sh mastil/bajo/build.sh` (desde la raíz): CSS = `mastil/src/0-style.css` (rutas `fonts/` → `../fonts/`) + `src/0-bajo.css`. JS = todos los `mastil/src/[1-9]-*.js` en orden de nombre; **un archivo de `mastil/bajo/src/` con el mismo nombre reemplaza al de la guitarra**, y los que no existen en la guitarra se intercalan por nombre. Plantilla `src/index.tpl.html`, service worker `src/sw.tpl.js`. Genera `index.html` y `sw.js` (no se editan a mano).
- Compila: `node -e "new Function(require('fs').readFileSync('mastil/bajo/index.html','utf8').split('<script>')[1].split('</script>')[0])"`.
- **Si cambias algo en `mastil/src`, reconstruye también el bajo** (y viceversa, la guitarra debe quedar igual: `tests/guitar-regression.cjs`).

## Capa de instrumento `INST`

`mastil/src/1-instrumento.js` define `INST` con los valores de la guitarra (cuerdas, `open`, afinaciones, rango, muestras `g-*`, color, clave, `root`, detector de tono, campo de nube). Todo el código compartido usa `INST` (y `OPEN_MIDI`/`OPEN_PC`, que salen de él) en vez de valores fijos; las diferencias propias del bajo están en ramas `INST.id==='bajo'` que llaman funciones de `5-bajo.js`.

## Overrides del bajo (`src/`)

- `1-instrumento.js`: `INST` de bajo (4/5 cuerdas según `strings` guardado; al cambiarlo en Ajustes se guarda y recarga), afinaciones Estándar 4, Estándar 5, Drop D, medio tono y un tono abajo; muestras `b-*.mp3`; verde `#34d399`; `root:'../'`; `bassMigrate()` convierte los datos viejos de `roka-bajo:v1` (`done`, `figbest`, `retobest`→`reto`, `bpm`, `lefty`, `strings`, `theme`).
- `3-guitarra-banda.js`: la banda sigue acompañando con guitarra de 6 cuerdas (sus propias digitaciones y muestras), independiente del `INST` del bajo.
- `3-pitch.js`: `bassPitch()` YIN con reducción a ~12 kHz y ventana grande; detecta hasta Si0 (31 Hz). Lo usan afinador y calificación.
- `4-content.js`: las 10 lecciones del bajo en el formato de la guitarra (objetivos, pasos con ejemplo, idea clave, ejercicios `E({...})` con figura que suena, compruébalo, errores, trucos). Conserva los 34 ids viejos (`b1-apagar` … `b10-motivo`); las variantes `five` se usan con 5 cuerdas.
- `5-lead.js`: en lugar del curso de Punteo, **Técnica de bajo** (8 lecciones, 32 ejercicios `bp…`): dedos alternados, apagado, tablatura, quintas y octavas, notas fantasma, slides y ligados, walking, slap básico.
- `5-bajo.js`: posiciones en el mástil (`bassPosition`), diagramas de acordes del bajo (raíz/quinta/octava, `bassVoicing`, `bassChordSVG`), **Arpegios** en lugar del diccionario de acordes (`bassArpeggios`), interruptor **«Yo toco el bajo»** (`bassPlayer`, `DB.bassPlayer`, encendido por defecto: la banda toca sin bajo), la **línea de bajo del groove** (`GROOVES[x].b`) convertida a notas reales e iluminada pulso a pulso en el panel del reproductor (`bassSide`, `bassLight`), reto con la melodía o la línea de bajo de la canción (`bassSongNotes`, `bassChallenges`), ajustes de cuerdas/zurdo (`bassSettings`) y textos de las vistas (`bassAdaptView`).
- `0-bajo.css`: solo ajustes encima del estilo de la guitarra.
- `viejo/`: la app anterior (no se construye; `bajo/src/**` no se publica). `tests/viejo/`: sus pruebas.

## Datos y cachés

- `localStorage` **`roka-bajo:v1`** con el mismo formato que la guitarra (`done`, `figbest`, `reto`, `bpm`, `theme`, `songs`…) más `strings`, `lefty` y `bassPlayer`.
- Nube: mismo proyecto y base `rokaguitarrhero`; el progreso va en el campo **`bajo`** de `users/{uid}` (la guitarra usa `progress`) y el resumen de clase en `statsBajo` (guitarra `stats`). No hizo falta cambiar `firestore.rules`.
- Cachés `roka-bajo-<versión>` (shell) y `roka-bajo-muestras-v1`; el service worker solo borra `roka-bajo-*` viejos.

## Pruebas (desde la raíz, servidor estático en :8765)

```sh
node --test mastil/bajo/tests/theory.test.cjs
node mastil/bajo/tests/browser.cjs
node mastil/bajo/tests/guitar-regression.cjs
node tools/revisar-margenes.js 390 1.25 http://localhost:8765/mastil/bajo/
```

- `theory.test.cjs` (19): afinación 4/5 cuerdas, `fretboard`, migración de la clave vieja.
- `browser.cjs`: 44 rutas × 4/5 cuerdas × 400/1280 px sin errores ni desborde; ajustes que recargan sin perder progreso; muestras de bajo y guitarra; ejercicio `b1-apagar` calificado con **micrófono falso** (WAV real por el dispositivo falso de Chromium, sin reemplazar el detector): 100 % en dos rondas; banda sin bajo con guitarra; «Yo toco el bajo» guardado y línea de bajo iluminada; reto con línea de bajo en 4 carriles. Evidencias en `tests/evidence/`.
- `guitar-regression.cjs`: el HTML de las vistas de la guitarra no cambia.

## Verificado el 25 oct 2026

- Guitarra idéntica: 31 vistas × 400/1280 px, `outerHTML` de `#page` y capturas iguales byte a byte a las de antes del cambio (solo cambia el sello de versión del build).
- Bajo: compila; 19/19 teoría; `browser.cjs` pasa con 0 errores; márgenes a 390×1.25 sin problemas y, en 360/320/1280, exactamente los mismos avisos que la guitarra (la herramienta marca como «2 renglones» los botones con ícono y valor, que son así a propósito).

## Pendientes

- Probar con bajo y micrófono reales (Si0 con micrófono de teléfono), en iPhone/Safari y con audífonos Bluetooth.
- Las lecciones del bajo son 10 (34 ejercicios) contra 11 de la guitarra; se pueden ampliar con el mismo formato.
- `cancionero/ver/…` con «Mi grabación»: la sincronización es la de la guitarra (acordes); no se probó con grabaciones reales de bajo.
