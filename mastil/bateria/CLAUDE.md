# Om Batería — variante de batería de Om Guitarra

Cuarta app de la familia Om (portada `mastil/roka/`): **https://rokaguitarrall.web.app/bateria/** (también GitHub Pages `…/mastil/bateria/`). Desde el 26 oct 2026 **Om Batería sale del mismo código que Om Guitarra** (`mastil/src/`), como Om Bajo, y conserva el coach de batería que tenía: sesión diaria, grooves y rudimentos con rejilla que se ilumina, medidor de precisión con micrófono, metrónomo avanzado, kit grabado y tocar con la banda. Hereda de la guitarra el cancionero karaoke, reto, cámara lenta, logros, nube, temas, grabadora, respaldo `MGH1:`, «Tocar con un beat», narrador y marca Om.

Roberto no es programador: entrégale cambios terminados y probados. Texto en español de México, tuteando, sin asumir género, sin emojis. Uso personal, amigos y escuela. **No modifiques** `bateria/` en la raíz del repo (Pulso a la Vista, la app vieja de GitHub Pages).

## Cómo se arma
- `sh mastil/bateria/build.sh` (desde la raíz; usa `python3` o `python`): CSS = `mastil/src/0-style.css` (`fonts/` → `../fonts/`) + `src/0-bateria.css`. JS = todos los `mastil/src/[1-9]-*.js` en orden de nombre; **un archivo de `src/` con el mismo nombre reemplaza al de la guitarra** y los demás se intercalan por nombre (por eso varios llevan `z`: `5-zroutes.js` va después de `5-tools.js` y puede redefinir funciones como `rtBlocks`). Plantilla `src/index.tpl.html`, service worker `src/sw.tpl.js`. Genera `index.html` y `sw.js` (no se editan a mano). Ya no usa `mastil/comun/`.
- Compila los tres: `node mastil/bateria/tests/compile.cjs`.
- **Si cambias `mastil/src`, reconstruye guitarra, bajo y batería**, y corre la regresión de la guitarra (debe quedar idéntica).

## Capa `INST` y ramas en la guitarra
`src/1-instrumento.js`: `INST={id:'bateria',nombre:'Om Batería',n:0,strings:[],color:'#ff5c8a',db:'roka-bateria:v1',root:'../',pack:'d',sampleCache:'roka-bateria-muestras-v1',cloud:{field:'bateria',stats:'statsBateria'},migrate:drumMigrate}`. En `mastil/src` hay ramas `INST.id==='bateria'` (siempre con el mismo resultado para la guitarra): `3-engine.js` (`outLat` usa `DB.visualLat`, volumen del click `DB.clickVol`, `bell`, `metStart` → `drumMetStart`), `5-cloud.js` (claves `SYNC` de batería, fusión `drumCloudMerge`, bienvenida), `5-extra.js` (reto → `viewDrumReto`/`drumRetoPlay`/`drumRetoFromSong`; respaldo pasa por `drumMigrate`), `5-narrator.js` (sin `mentions` de cuerda/traste), `5-songbook.js` (banda sin percusión con «Yo toco la batería», panel `drumSide`/`drumLight`, la guitarra de la banda con `guitarVoicing`), `5-tools.js` (texto de la rutina), `6-app.js` (tema coral, enrutador `drumRoute`, `drumAdaptView`, acciones de ejercicio `drumExAction`).

## Overrides (`src/`)
- `1-instrumento.js`: `INST`, `drumMigrate` (migra la clave vieja sin perder nada: el setlist viejo `songs` pasa a `setlist`, las canciones con letra se quedan en `songs`; temas viejos → temas de la guitarra; `drumSchema:2`), `drumCloudData`/`drumCloudMerge`.
- `3-guitarra-banda.js`: digitaciones y muestras de guitarra para la banda (igual que en el bajo). `3-kit.js`: `ROWS`, `ROW_ORDER`, `PADS` (Platillos J · Tarola F · Bombo Espacio), `hit(fila,t,símbolo)` con el kit Black Pearl de `mastil/samples/d-*.mp3` (`drumHit` del motor de la guitarra).
- `4-content.js`: 29 grooves `G` y las **12 lecciones en el formato de la guitarra** (objetivos, pasos con ejemplo, idea clave, ejercicios con rejilla que suena y sigue el pulso, compruébalo, errores, trucos), con los mismos ids de ejercicio de antes. `4-plan.js`: niveles, estrellas, velocidades, `limbOf` (manos y pies), estilos de banda. `4-zpedagogia.js`: guías de cada lección.
- `5-fig.js`: ejercicios de lección («Seguir al pulso» con la rejilla, calificación por tiempo con micrófono o toques). `5-grid.js`: `grooveGrid`, `kitSVG`, `grooveRun`. `5-score.js`: `expectedHits`/`scoreHits`, micrófono con AudioWorklet de ataques, calibración de latencia, pads. `5-coach.js`: sesión diaria (`viewCoach`). `5-met.js`: metrónomo avanzado (2 y 4, solo el 1, contratiempo, intermitente, entrenador). `5-ztools.js`: metrónomo, medidor de precisión, tocar con la banda (con «Grabar con este beat en Om Estudio»), setlist, groove.
- `5-band.js`: «Yo toco la batería» (`DB.drumPlayer`, encendido por defecto) y la rejilla del groove de la canción que se ilumina celda por celda en el reproductor. `5-zgrooves.js`: parte de batería para los grooves de la guitarra que no traían percusión.
- `5-reto.js`: reto en 3 carriles (Bombo, Tarola, Platillo) calificado por tiempo con toques (Espacio/F/J) o micrófono; «Jugar como reto» usa el groove de la canción.
- `5-chords.js`: **Diccionario de rudimentos** (`#/acordes`, 16 esenciales con sticking D/I y acentos). `5-lead.js`: **Técnica de batería** (`#/punteo`, 8 lecciones, ids `dp…`).
- `5-zroutes.js`: rutas propias, `drumAdaptView` (textos de batería en las vistas heredadas), Referencia de batería, juego «¿Qué patrón suena?», rutina diaria de batería (`rtBlocks`). `5-zviews.js`: Inicio, grooves por nivel, progreso, ajustes. `5-zui.js`: íconos de batería. `5-bateria.js`: utilidades y «Traer tu progreso» de Pulso a la Vista (`importOld`, solo en GitHub Pages).
- `0-bateria.css`: rejilla, kit, pads, panel del reproductor y ajustes encima del estilo de la guitarra.
- `src/viejo/`: la app anterior (no se construye; `bateria/src/**` no se publica). `tests/viejo/`: sus pruebas.

## Rutas
Las de la guitarra (Inicio, lecciones, `#/acordes` = rudimentos, `#/punteo` = técnica, practicar/*, cancionero, referencia, cuenta, apariencia, logros) más las de antes: `#/sesion` · `#/grooves` · `#/groove/<id>` · `#/practicar/ej/<id>?k=rud|groove|prec|band` · `#/practicar/precision` (también `afinador`) · `#/practicar/banda` (también `pistas`) · `#/practicar/setlist` · `#/practicar/juego` · `#/progreso` · `#/ajustes` · `#/glosario`.

## Datos y cachés
- `localStorage` **`roka-bateria:v1`**: lo de la guitarra (`done`, `secs`, `days`, `reto`, `ach`, `songs` = cancionero, `theme`…) más `stars`, `best`, `hist`, `ses`, `setlist`, `spd`, `gbpm`, `sess`, `band`, `input`, `lat`, `visualLat`, `clickLvl`, `sens`, `tapLat`, `clickVol`, `drumPlayer`, `drumSchema`.
- Nube: mismo proyecto y base `rokaguitarrhero`; progreso en el campo **`bateria`** de `users/{uid}` y resumen de clase en `statsBateria`. No hizo falta cambiar `firestore.rules`.
- Service worker: `roka-bateria-<versión>` y `roka-bateria-muestras-v1`; solo borra `roka-bateria-*` viejos.

## Pruebas (desde la raíz; servidor estático en :8765 o el que levanta `mastil/bajo/tests/helpers.cjs`)
```sh
node mastil/bateria/tests/compile.cjs
node --test mastil/bateria/tests/logic.test.cjs
node mastil/bateria/tests/browser.cjs
OM_GUITAR_BASELINE=<copia de mastil/src antes del cambio> node mastil/bajo/tests/guitar-regression.cjs
node tools/revisar-margenes.js 390 1.25 http://localhost:8765/mastil/bateria/
```
- `logic.test.cjs` (28): grooves, niveles, `limbOf`, calificación, migración, rudimentos, técnica.
- `browser.cjs`: todas las rutas (heredadas y viejas) a 400 y 1280 px sin errores ni desborde; datos viejos migrados visibles; lección y coach calificados con **micrófono falso** (WAV de golpes por el dispositivo falso de Chromium); metrónomo avanzado; render offline de la banda sin percusión (guitarra y bajo siguen); «Yo toco la batería» guardado y rejilla iluminada; reto de 3 carriles; respaldo y campos de nube. Evidencias en `tests/evidence/`.

## Verificado el 26 oct 2026
Guitarra idéntica (90/90 vistas). Bajo: 19/19 teoría y su `browser.cjs` sin errores. Batería: compila, 28/28 lógica, 388 revisiones de rutas sin errores, lección con micrófono 94 %, coach 98 %, banda sin batería: energía > 5 kHz al 19 % y < 120 Hz al 30 % de la banda completa. Márgenes 390×1.25, 320×1 y 1280×1 sin problemas (solo los avisos de botones con ícono y valor, que son así a propósito, como en la guitarra). Programado con Codex (gpt-6-astra) y terminado por Claude.

## Pendientes
- Probar con micrófono físico y batería acústica real (sensibilidad, eco del click por la bocina: recomendar audífonos de cable) y la latencia de toques en Android/iPhone.
- Con micrófono solo se califica el tiempo; separar bombo, tarola y platillos por frecuencia sería el siguiente paso.
- Modo zurdo (invertir manos y pies en `limbOf` y `kitSVG`).
- Grabación original en el cancionero: la sincronización es la de la guitarra (acordes); no se probó con grabaciones reales.
