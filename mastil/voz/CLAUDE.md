# Roka Couch Vocal — coach de canto de Roberto

App hermana de **Roka Guitar for All** (`../ROKA GUITAR/mastil/`): mismo diseño «Estudio» (negro, azul eléctrico, portadas abstractas, barra de íconos con valores y dock con botón redondo) pero pensada como **coach**: ejercicios primero, poca teoría (solo tips de 1–2 líneas) y una sesión diaria guiada que avanza sola, al estilo Vanido / Yousician Sing. Roberto rechazó la v1 (muchas lecciones largas); la v2 «modo coach» (23 oct 2026, programada con Codex) es la actual. El nombre va escrito así, «Couch», por decisión de Roberto.

Roberto no es programador: entrégale cambios terminados y probados, sin pedirle que edite código. Todo el texto va en español de México, tuteando, y sin asumir el género de quien usa la app («Te damos la bienvenida», no «Bienvenido»).

## Dónde vive y dónde se publica
- Por decisión de Roberto va **junto con Roka Guitar**: carpeta `mastil/voz/` del repo `ROKA GUITAR` (rama `main`).
- URL principal: **https://rokaguitarrall.web.app/voz/** (Firebase Hosting, proyecto `rokaguitarrall`; `firebase.json` sirve `mastil/` y excluye `voz/src`, `voz/tools`, `voz/build.sh` y este archivo). También https://robertomadrigale-cmd.github.io/mastil/voz/ (GitHub Pages).
- Comparte dominio con la guitarra, así que **cada service worker solo toca sus propios cachés**: el de voz borra solo `roka-vocal-*`; el de la guitarra borra solo `mastil-*` e ignora todo lo que esté bajo `/voz/`. No quites esas dos reglas. `localStorage` también es compartido: la clave de esta app es **`roka-couch-vocal:v1`** (la guitarra usa `mastil-a-la-vista:v2`).
- Sin cuenta en la nube todavía (`5-cloud.js` de la guitarra no se copió). Si se agrega, usa el mismo Firebase (`rokaguitarrall`, base `rokaguitarrhero`, authDomain `rokaguitarrall.firebaseapp.com`) con colecciones propias y reglas nuevas en `firestore.rules` sin aflojar las de la guitarra.

## Cómo está armada
- El código fuente vive en `src/`. **No edites `index.html` ni `sw.js` a mano**: se generan.
- `src/0-style.css` + los `src/[1-9]-*.js` (en orden alfabético) se meten en `src/index.tpl.html` → `index.html`. `src/sw.tpl.js` → `sw.js` con versión nueva en cada build (así los teléfonos reciben la actualización).
- Reconstruir (solo necesita python3), desde `mastil/voz/`:
  ```sh
  sh build.sh
  node -e "new Function(require('fs').readFileSync('index.html','utf8').split('<script>')[1].split('</script>')[0])"
  ```
- Sin dependencias ni frameworks: JavaScript puro, audio con Web Audio API (todo sintetizado, sin muestras), fuentes locales en `fonts/`, funciona sin conexión (PWA con `manifest.webmanifest` y `sw.js`).
- Íconos: `python tools/iconos.py` (Pillow) dibuja `icons/*.png` (micrófono blanco sobre degradado azul → rosa).

### Módulos (`src/`)
- `0-style.css`: copia completa del CSS de Roka Guitar (capas v3 y «estudio» v4) + al final la capa **«Roka Couch Vocal (v1)»**: carril de tono `.lane`, resultado `.rescard`/`.rrows`, teclado `.kbd`, tipos de voz `.vbars`, respiración `.brc`, letra en modo concierto `.lyrics`/`.lyl`/`.syl`, calentamiento `.wrow`, bienvenida `.onb`. Cambios de diseño nuevos van en esa última capa.
- `1-base.js`: `$`, `$$`, `esc`; notas (`PCS`, `m2f`, `f2m`, `nnTxt` = «Sol3», `nnHTML`, `parseNote('G4')`); **tipos de voz** `VOICES` (bajo… soprano, rangos de coro) y `voiceGuess(lo,hi)`; `DB` + `save()`; racha (`markDay`, `streak`, `weekMins`); **`comfy()`** = zona cómoda para ejercicios (rango medido menos 2 semitonos por lado, o voz «grave»/«aguda» de referencia `DB.vt`); `toast`; temas `THEMES` (Estudio, Escenario, Aluminio claro; «Automático» elige Estudio u Aluminio).
- `2-ui.js`: íconos `IC`/`TKIC` (trazo 1.7), `logo()`, `coverArt(h,motivo,número,uid)` (portadas abstractas iguales a las de la guitarra), `albCard`, `TART` (portadas de herramientas) y la estructura común de herramientas copiada de la guitarra: `toolHead`, `toolBar`, `toolPanels`, `toolMount`, `toolDock`, `playLbl`, `beatPulse`.
- `3-engine.js`: motor de audio de la guitarra sin guitarra: `ac()`, `unlockAudio` (iPhone en modo silencio; `audioSession='play-and-record'`), `outLat()`, **`piano(m,t,d,v)`** (guía tipo piano, armónicos que decaen), **`guideTone(m,t,d,v,m2)`** (voz guía sostenida con vibrato; con `m2` se desliza = sirena), `chordPad`, `tickSound`, `bell`, secuenciador `SEQ` y metrónomo `MET`, `wake()` (pantalla encendida; `WAKE` cuenta usos del micrófono).
- `3-pitch.js`: **detector de tono YIN** `detectPitch(buf,sr)` → `{f,c,rms}` (65–1100 Hz; probado con voz sintética: error < 0.01 semitono de Mi2 a Do6, < 1 ms por lectura). `micStart(onData,onErr)`/`micStop()`: cada 40 ms llama `MIC.on({m,rms,t})` con la nota MIDI con decimales (mediana de 3 lecturas, claridad > 0.6) y **`t` en tiempo de audio corregido** (`currentTime − outLat − 25 ms`) para calificar contra lo que se ve/oye. `MIC.level` = volumen. `micErrHTML(k)` mensajes de permiso.
- `4-content.js`:
  - `DRILLS`: 6 calentamientos (nota larga, trino de labios, sirena, arpegio 1-3-5-8, escala de cinco notas, staccato). `pat` = `[semitonos desde la base, pulsos]` (`null` = silencio), `glide` = se desliza de una nota a la siguiente. `WARMUP` = orden del «Calentamiento de hoy» (`respira` = herramienta Respiración).
  - `SONGS`: ChordPro igual al cancionero de la guitarra (`~` sílabas, `_` une palabras, `[Acorde]`, `{mel: G4/1 +A4/.5 r/1}`); `songParse()` → `SONGLIST`. Validar que sílabas = notas sin `+`. Solo dominio público o escritas para la app (las letras con derechos no se incluyen).
  - `LESSONS`: 5 lecciones de técnica con el método de la guitarra (objetivos `aim` → pasos `step` con ejemplo resuelto → `key` idea clave → ejercicios `E({...})` con botón `go`/`goL` a la herramienta → `check` → errores → `trick`). Conserva los `id` de ejercicios para no perder el progreso. Nunca uses un término sin definirlo antes.
- `5-lane.js`: **carril de tono** `laneDraw(canvas,st,now)`: barras de las notas (gris = «Escucha», azul = «Ahora tú», verde/ámbar/rosa = calificación), sirenas como trazo inclinado, la línea de tu voz (verde si está dentro de la tolerancia) y la raya de «ahora» al 30 %. `drillSpec(d,o)` arma rondas «Escucha y repite» (la app toca, tú repites, cada ronda sube medio tono dentro de `comfy()`, `o.dir='ud'` sube y baja) o «Canta junto» (`DB.mode='junto'`). `songSpec(S,o)` = cuenta de un compás + melodía con voz guía y acordes; `songShift(S)` transpone al centro de tu zona. `practiceRun(cv,spec,o)` programa el sonido 0.25 s adelante, dibuja, recibe el micrófono y califica: cada nota = fracción de lecturas dentro de ±`DB.tol` cents (25/50/75), con gracia al inicio; `specScore(spec)` = promedio. La sesión en curso queda en `PRACTICE` (útil para pruebas).
- `5-narrator.js`: botón «Escuchar la lección» (Web Speech en español), versión del narrador de la guitarra sin mástil.
- `5-pulse.js`: copia sin cambios del pulso visual de la guitarra (`tick()`, barra de pulso, destello, solo visual).
- `5-tools.js`: vistas de herramientas: **afinador de voz** (`viewTuner`: aguja ±50 cents, verde ±10, nota y Hz, carril con tu voz y franja de la nota guía `DB.ref`), **rango vocal** (`viewRange`: 3 pasos, cuenta solo notas sostenidas ~0.5 s; guarda `DB.range={lo,hi,at}`; teclado `keyboardSVG` y barras de tipos de voz `voiceBars`), **respiración** (`viewBreath`: guiada 4-4-8 con disco que respira, y «Sss medida» con el micrófono: calibra el ruido 0.7 s y cuenta mientras suene; récord `DB.breath`), **metrónomo** (copia del de la guitarra), **ejercicio** (`viewDrill`: barra de íconos Modo/Tempo/Rondas/Tolerancia, carril grande, resultado por ronda, récord `DB.best[id]`, «Siguiente ejercicio» del calentamiento) y **canción** (`viewSing`: Tono/Voz guía/Velocidad/Tolerancia, carril + letra en modo concierto que se llena sílaba por sílaba con `--sd` y se pinta verde/rosa según cómo la cantaste; récord `DB.best['song:'+id]`).
- `6-app.js`: tiempo de práctica (cuenta con micrófono o metrónomo), tarjeta de ejercicio de lección `exCard`, `blockHTML`, discos de lecciones/ejercicios/canciones, Inicio (racha, tarjeta de rango, «Calentamiento de hoy», continuar lección, repisas, herramientas, tema, voz grave/aguda), bienvenida `onboardShow` (`DB.onb`), Lecciones, Practicar, Calentamiento de hoy (`DB.today[id]` = fecha), Canciones, enrutador `route()` (reemplaza `#page` en cada vista y desmonta la anterior: apaga el micrófono) y service worker con aviso de actualización.

### v2 «modo coach» (lo que manda sobre la descripción de arriba)
- **Ya no hay lecciones largas** (`LESSONS`, `viewLesson`, `exCard`, narrador de lecciones se quitaron; `#/lecciones` y `#/leccion/N` redirigen a `#/`). La teoría vive en el `tip` de cada ejercicio.
- `4-content.js`: `DRILLS` = 16 ejercicios con `lvl` 1–3 («Base», «Control», «Agilidad y rango»), `rounds`, `tip`; ids: respira, eco, larga, trino, sirena, tres · escala, arpegio3, terceras, staccato, crescendo · arpegio, quintas, nueve, agilidad, extensor.
- `5-coach.js` (nuevo): migración aditiva de `DB` (`stars`, `hist` ≤ 400, `rangeHist`, `sung`, `sess`), estrellas (`starsFor`: 50/70/85 %), niveles (`levelOpen`: 10 estrellas del nivel anterior), `growRange()` (el rango crece si aciertas ≥ 60 % notas fuera de él), `recordResult()`, `buildSession()` (sesión diaria de ~12 min: rango si falta → respira → trino → sirena → 3 del nivel, rotando por fecha → canción corta; guardada en `DB.sess` para continuar) y `viewCoach()` = reproductor a pantalla completa (`#/sesion` y cada ejercicio suelto `#/practicar/ej/<id>`): entrada con cuenta 3-2-1 → carril de tono con HUD (fase, ronda, nota en vivo) → resultado con %, estrellas, mejor marca y `coachTip` → avanza solo a los 6 s → resumen de la sesión. Micrófono abierto toda la sesión; sin micrófono sigue sin calificación.
- `5-lane.js`: `practiceRun` guarda por nota desviación con signo, silencios, estabilidad e inicio/final; `coachTip(spec)` elige el consejo (sin voz, bajo/alto en agudas o graves, nota inestable, entrada tarde, afinadísimo). Admite pausa (`run.pause/resume`) y descansos entre rondas (fase `R`).
- `6-app.js`: Inicio «Tu sesión de hoy», Ejercicios por nivel (candados con «Te faltan N estrellas»), Canciones, **Progreso** (racha y mejor racha, minutos por día, afinación por semana, rango que crece, estrellas por nivel). `html.fs` = pantalla completa. Se guarda en `pagehide`.
- Pruebas de lógica: `node src/coach.test.cjs` (13 pruebas; no entra al build).

### Rutas
`#/` (Hoy) · `#/sesion` · `#/ejercicios` · `#/progreso` · `#/practicar/ej/<id>` · `#/practicar/afinador|rango|respiracion|metronomo` · `#/canciones` · `#/canciones/<id>`.

## Antes de entregar
1. `sh build.sh` y revisa que el JavaScript compile (comando de arriba).
2. Prueba en el navegador en ancho de teléfono (400 px) y escritorio, sin errores en consola. Servidor local: la configuración `apps` de `.claude/launch.json` (raíz del repo, puerto 8765) → http://localhost:8765/mastil/voz/. Revisa también que la guitarra (http://localhost:8765/mastil/) siga igual.
3. Márgenes con letra grande: `NODE_PATH=<npm global>/node_modules CHROME=<chrome.exe> node tools/revisar-margenes.js 390 1.25` (también `360 1.15`, `320 1`, `1280 1`). Usa puppeteer (global en esta computadora) y el Chromium de `%LOCALAPPDATA%/ms-playwright/chromium-*/chrome-win64/chrome.exe`.
4. Para probar el micrófono sin cantar: Chromium con `--use-fake-ui-for-media-stream --use-fake-device-for-media-stream --use-file-for-fake-audio-capture=voz.wav` (un WAV de voz sintética a 48 kHz), y para calificar un ejercicio completo reemplaza `MIC.on` por un «cantante simulado» que toma la nota de `PRACTICE.st.targets` (así se verificó: fallar 1 de 8 rondas da 88 %).
5. Publicar (igual que la guitarra, desde la raíz del repo): commit y push a `main`, y `npx -y firebase-tools@13.29.1 deploy --only hosting --project rokaguitarrall`.

## Investigación (qué hacen otras apps)
Funciones comunes en Yousician Sing, Vanido, Singing Carrots, SingSharp, Smule y similares: prueba de rango vocal y tipo de voz; monitor de tono en tiempo real (línea de tu voz contra barras de notas); calentamientos diarios guiados que suben de medio en medio tono y se adaptan a tu rango (Vanido); calificación por nota con colores; ejercicios de respiración (SingSharp mide la exhalación); canciones con letra y línea de melodía (Yousician, Smule); rachas, récords y progreso. En la v1 entraron: rango, afinador con línea de tono, calentamientos «escucha y repite» calificados, respiración medida, canciones con letra y lecciones de técnica. Repos abiertos útiles: `peterkhayes/pitchfinder` (YIN/AMDF/MacLeod en JS, referencia del algoritmo que se reimplementó aquí sin dependencias).

## Ideas para siguientes versiones
- Pegar letras propias (como el cancionero de Roka Guitar) y detectar la melodía de una grabación.
- Entrenamiento de oído: intervalos y «¿cuál nota es más aguda?».
- Grabarse y escucharse (reutilizar la grabadora de Roka Guitar, `5-extra.js`).
- Cuenta en la nube y modo maestro (`5-cloud.js` de Roka Guitar) si Roberto decide compartir Firebase.
- Vibrato: medir su velocidad y amplitud en notas largas.
