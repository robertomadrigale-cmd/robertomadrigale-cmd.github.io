# Om Bajo — aprendizaje y práctica de bajo

(Antes «Roka Bajo»; la carpeta `mastil/bajo/` y la clave `roka-bajo:v1` no cambian.) App de la familia **Om · Centro de aprendizaje musical · by AutomaTIA** para aprender bajo eléctrico de cuatro o cinco cuerdas desde cero. Incluye diez lecciones, ejercicios calificados, afinador, metrónomo, acompañamientos sin bajo, retos rítmicos, lectura en voz alta y funcionamiento sin conexión después de preparar los recursos. La interfaz usa español de México, tuteo, lenguaje sin género asumido y no usa emojis.

## Marca

- Nombre visible «Om Bajo» (título, manifest `name`/`short_name`, Inicio, pie). Color del bajo verde `#34d399`; firma «by AutomaTIA» con «IA» en turquesa `#2ec4b6`.
- `omBrand()` y `byMark()` (`1-base.js`) usan `omLogo({color,size})` y `automatiaMark()` de `../comun/src/7-marca.js` si existe; si no, muestran texto.
- Íconos: `python mastil/bajo/tools/iconos.py` (fondo verde, «om» blanco; la «o» es un anillo con ondas).

## Alcance y reglas de edición

- El código propio vive en `mastil/bajo/`.
- El núcleo reutilizado vive en `mastil/comun/src/` y se concatena antes de los módulos locales. No se deben copiar ni editar sus módulos para resolver algo exclusivo de Bajo.
- `index.html` y `sw.js` son artefactos generados: se reconstruyen con `build.sh`; no se editan a mano.
- No cambiar los identificadores existentes de lecciones, ejercicios o retos porque forman parte del avance guardado.
- Mantener botones en una sola línea (`white-space: nowrap`) y comprobar 320, 360, 390 y 1280 px con letra a 1.25.
- Bajo remapea localmente el caché de muestras del núcleo. No debe escribir `roka-estudio-muestras-v1` ni borrar cachés de otras apps.

## Construir

Desde la raíz del repositorio:

```sh
sh mastil/bajo/build.sh
node -e "new Function(require('fs').readFileSync('mastil/bajo/index.html','utf8').split('<script>')[1].split('</script>')[0])"
```

`build.sh` concatena, en este orden, `mastil/comun/src/[1-9]-*.js` y `mastil/bajo/src/[1-9]-*.js`; incrusta CSS y JavaScript en `index.html`, y reemplaza `__VER__` en `src/sw.tpl.js` para generar un caché nuevo en `sw.js`.

## Datos y cachés

- `localStorage` **`roka-bajo:v1`**: `{strings,lefty,theme,done,figbest,retobest,bpm,last,met,meter,mute}`.
  - `strings`: cuatro o cinco cuerdas.
  - `lefty`: presentación zurda del mástil y carriles.
  - `theme`: `estudio` o `claro`.
  - `done`: ejercicios completados con 80 % o más mediante micrófono.
  - `figbest` y `retobest`: mejores marcas de ejercicios y retos.
  - `bpm`: tempo elegido por ejercicio; `last`, `met`, `meter` y `mute`: última lección y preferencias del metrónomo.
- Caché de aplicación **`roka-bajo-<marca de construcción>`**: shell de la PWA.
- Caché de muestras **`roka-bajo-muestras-v1`**: archivos de `mastil/samples/` que ya se abrieron con conexión.
- No usa IndexedDB ni envía grabaciones. El micrófono se analiza en memoria y se detiene al cambiar de pantalla, ocultar la página o detener la práctica.
- Al activarse, el service worker solo elimina nombres que empiezan con `roka-bajo-`, excepto el caché actual y `roka-bajo-muestras-v1`.

## Módulos (`src/`)

- `0-style.css`: sistema visual oscuro/claro, portadas, cuadrículas, mástil desplazable, controles, juego y navegación fija; adaptaciones móviles. En el reto móvil, el control de transporte queda en el flujo normal para no cubrir carriles.
- `1-base.js`: estado y utilidades comunes de la app. `save`, `toast`, `recordResult`, `coverArt`, `toolHead`, `toolDock` y `control`; adapta `caches.open('roka-estudio-muestras-v1')` a `roka-bajo-muestras-v1`.
- `2-theory.js`: afinación y presentación del instrumento. `openStrings`, `midiOf`, `autoFingers`, `notesOf`, `tablature`, `fretboard` y `chordDots`. Cuerda 1 = Sol; la quinta cuerda agrega Si0 sin renumerar las otras.
- `3-pitch.js`: `detectPitch` implementa YIN con reducción aproximada a 12 kHz y cubre Si0; `micStart` abre el micrófono sin cancelación de eco, reducción de ruido ni ganancia automática; `micStop` libera intervalos, nodos y pistas.
- `3-transport.js`: dueño único de audio y cancelación. `RUN`, `stopAll`, `prepareAudio`, `bass`, `tick`, `pulseHTML`, `pulsePaint`, `playTimeline` y `bandTracks`. Los tokens invalidan cargas asíncronas al salir o reiniciar.
- `4-content.js`: material original. `P` normaliza notas; `E` crea ejercicios; `LESSONS` contiene diez lecciones; `ALLEX` reúne 34 ejercicios calificados; `CHALLENGES` define seis retos. Las prácticas usan cuerdas 1–4, agregan una variante específica para cinco cuerdas cuando aplica, trastes 0–15 y duraciones de 0.5–4 pulsos. La lección 8 conserva siete ejercicios, uno por género; las demás tienen tres.
- `5-fig.js`: interfaz y calificación de cada ejercicio. `figState`, `figHTML`, `fmStep`, `fmPitch`, `exerciseTargets`, `figStart` y `figAction`. El micrófono exige dos lecturas consecutivas de la nota en la octava correcta; sin micrófono, los toques califican ritmo.
- `5-narrator.js`: `stopNarration`, `sayText`, `buildNarration` y `narrate`; usa Web Speech y prefiere una voz `es-MX`, con alternativa a otra voz en español.
- `5-tools.js`: afinador (`viewTuner`, `mountTuner`), metrónomo (`viewMetronome`, `mountMetronome`) y banda (`viewBand`, `mountBand`, `studioURL`). `bandTracks` excluye bajo o tuba hasta activar “Bajo de referencia”.
- `5-challenge.js`: reto de notas. `viewChallenge`, `laneStrings`, `gameDraw`, `gameTap` y `mountChallenge`; permite toques en pantalla o micrófono, velocidad variable y cuatro o cinco carriles.
- `6-app.js`: vistas, rutas y ciclo de vida. `safe`, `lessonProgress`, `lessonCard`, `viewHome`, `exCard`, `blockHTML`, `viewLesson`, `viewSettings`, `viewLicenses` y `route`; enlaza eventos, persiste ajustes, cancela audio al navegar y registra el service worker.
- `index.tpl.html`: plantilla HTML, metadatos PWA y puntos de inserción de CSS/JavaScript.
- `sw.tpl.js`: precaché del shell, caché de muestras y navegación con actualización en línea y alternativa sin conexión.

## Núcleo compartido utilizado

- `RokaAudio`, `ac`, `unlockAudio`, `outLat` y sala/reverberación.
- `PACKS`, `loadPack`, `playSample` y `drumHit`.
- Teoría de tonos y acordes: `NOTE_ES`, `parseKey`, `chordLabel` y funciones relacionadas.
- `BEATS`, `beatById`, `beatChords` y `renderBeat` para acompañamientos multipista.

## Pruebas

Desde la raíz del repositorio:

```sh
node --test mastil/bajo/tests/*.test.cjs
node --test mastil/bajo/tests/run.cjs
node mastil/bajo/tests/browser.cjs
```

Node 24 no expande `node --test mastil/bajo/tests/` como directorio y lo intenta abrir como módulo. `tests/run.cjs` es el ejecutor alternativo solicitado: carga en orden todos los `*.test.cjs`.

Pruebas por archivo:

- `theory.test.cjs`: afinación de cuatro/cinco cuerdas, trastes, tablatura, digitación y modo zurdo.
- `content.test.cjs`: estructura de las diez lecciones, 34 ejercicios, identificadores únicos, seis retos, límites de cuerdas/trastes/duración/altura y reglas de calificación.
- `pitch.test.cjs`: YIN a 31, 41.2 y 98 Hz con 44.1, 48 y 96 kHz; silencio y armónicos de Si0.
- `band.test.cjs`: exclusión/inclusión del bajo, enlace a Estudio y aislamiento del caché de muestras.
- `service-worker.test.cjs`: limpieza limitada a cachés propios.
- `browser.cjs`: servidor local y Chromium, 72 combinaciones de ruta/anchura, temas y ajustes, audio offline, los 15 acompañamientos sin bajo, referencia apagada/encendida, apertura/cierre de micrófono, metrónomo, ejercicio calificado, reto y recarga sin red.

La prueba de navegador tiene un límite global de 180 segundos, tiempos máximos explícitos en cada `waitForFunction`, cierre de Chromium/servidor al terminar y código 1 al agotar el tiempo. Busca Puppeteer en `PUPPETEER_MODULE` o `%TEMP%/roka-bajo-qa-node/node_modules/puppeteer-core`, y Chromium en `CHROME` o `%LOCALAPPDATA%/ms-playwright/chromium-1243/chrome-win64/chrome.exe`.

## Verificado el 25 oct 2026

- Construcción: `sh mastil/bajo/build.sh`, correcta; `index.html` generado con 102857 bytes.
- Compilación del JavaScript incrustado: correcta.
- Node: 23 de 23 pruebas correctas tanto con el comodín como con `tests/run.cjs`.
- Chromium sin interfaz: correcto en 72 vistas a 320, 360, 390 y 1280 px, todas con letra a 1.25; sin desbordes horizontales ni botones cortados.
- Audio automatizado: muestras MIDI 23, 28 y 43 con señal y tono detectables; 15 beats renderizados con señal en sus pistas disponibles; la mezcla sin referencia no incluyó bajo.
- Flujos: cuatro/cinco cuerdas, zurdo, tema claro, banda sin/con referencia, micrófono simulado, metrónomo, dos rondas calificadas al 100 %, persistencia tras recarga, reto a 120 % y recarga sin conexión con recursos previamente guardados.
- Inspección visual: inicio móvil/escritorio, lección móvil clara y reto móvil; el transporte del reto ya no cubre carriles ni botones.

## Limitaciones pendientes

- Chromium y las mediciones offline prueban generación de señal, no la calidad audible ni el balance subjetivo en bocinas o audífonos reales.
- El ejercicio calificado usa lecturas de micrófono simuladas. Falta probar altura, ruido, permisos y estabilidad con un bajo y micrófono físicos.
- Falta probar teléfonos reales, en especial iPhone/Safari, latencia Bluetooth, bloqueo de pantalla y voces `es-MX` instaladas.
- El modo sin conexión requiere una primera visita y haber abierto previamente las muestras o beats necesarios; no precarga toda la biblioteca de audio.
- No se hizo despliegue, commit ni cambio de rama.
