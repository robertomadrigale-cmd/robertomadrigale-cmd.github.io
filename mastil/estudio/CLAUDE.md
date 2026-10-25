# Roka Estudio — beats por género y estudio multipistas

Tercera app de la familia Roka (portada `mastil/roka/`): **https://rokaguitarrall.web.app/estudio/** (también GitHub Pages `…/mastil/estudio/`). Inspirada en corridoz.app/studio: biblioteca de beats a la izquierda, línea de tiempo con pistas y clips con forma de onda, transporte, mezcla. Roberto (no programador; uso personal, amigos y quizá una escuela; **no se vende**) quiere que la familia crezca con apps de **bajo, batería y teclado**: todo lo reutilizable va en el **núcleo compartido `mastil/comun/`**. Español de México, tuteando, sin asumir género, sin emojis.

## Construir y probar
```sh
cd mastil/estudio && sh build.sh      # concatena ../comun/src/[1-9]-*.js y luego src/[1-9]-*.js en index.html; sw.js con versión nueva
node -e "new Function(require('fs').readFileSync('index.html','utf8').split('<script>')[1].split('</script>')[0])"
```
Servidor local: raíz del repo en :8765 → http://localhost:8765/mastil/estudio/. Puppeteer global (`NODE_PATH`) y Chromium de `%LOCALAPPDATA%/ms-playwright/chromium-*/chrome-win64/chrome.exe`; micrófono falso con `--use-fake-device-for-media-stream --use-file-for-fake-audio-capture=<wav>`.
Íconos: `python tools/iconos.py` (Pillow; barras blancas sobre ámbar → rosa).

## Datos
- `localStorage` **`roka-estudio:v1`** (preferencias: última sesión, ajuste de sincronía de grabación `recOff`, metrónomo, cuenta previa).
- IndexedDB **`roka-estudio`**: `sesiones` (JSON de cada sesión) y `audios` (archivos importados y grabaciones como Blob). Las pistas de beat NO guardan audio: se vuelven a generar al abrir.
- Sesión: `{id,nombre,bpm,compas,tono:{pc,minor},pistas:[{id,nombre,rol,vol,pan,mute,solo,eq:[graves,medios,agudos],rev,clips:[{id,inicio,dur,offset,nombre,fuente:{beat:{id,parte,compases,prog,rol,entrada}}|{audio:id}}]}],master:{vol}}`. Respaldo `.roka.json` (sin audios).
- Service worker: caché `roka-estudio-<versión>` y `roka-estudio-muestras-v1` (las muestras de `../samples/`); al activarse solo borra `roka-estudio-*`. El de la guitarra ignora `/estudio/`.

## Módulos (`src/`)
- `0-style.css`: diseño propio compacto (no copia el CSS de la guitarra); colores por pista `--c-bateria/bajo/armonia/metales/voz/audio`; en ≤ 860 px la biblioteca y la mezcla van en pestañas (`.studio[data-tab]`).
- `1-base.js`: `$`, `esc`, `uid`, íconos `IC`, `logo()`, `coverArt()`, `beatArt()` (portada con el patrón de bombo/tarola del beat), `DB`/`save`, `toast`, `ROLES`.
- `2-store.js`: IndexedDB (`sesGet/sesAll/sesPut/sesDel`, `audPut/audGet/audDel`), `newSession()`, `trackFor()`, respaldo JSON.
- `3-engine.js`: `BUF` (clip → AudioBuffer), `beatRender` (caché de renders por beat+tono+bpm), `ensureBuffers`, `peaks`; cadena por pista (gain → pan → EQ de 3 bandas → master + envío a sala) y master con compresor y analizador; transporte con **ciclo sin cortes** (`scheduleSegment` programa el siguiente tramo 0.3 s antes), metrónomo, **grabación** con ScriptProcessor (sin cancelación de eco; inicio = posición del primer bloque − `outLat()` − 12 ms − `DB.recOff`), `wavBlob`, `exportMix` (mezcla o una sola pista en OfflineAudioContext), `download`.
- `4-views.js`: `viewHome` (sesiones, continuar), `viewLicenses` (desde `PACKS`), `viewStudio` (biblioteca con filtros por género/compás, escuchar, agregar parte A/B/relleno con 2/4/8 compases y progresión; pistas; clips que se mueven y recortan con ajuste a medio tiempo; duplicar, dividir en el cursor, ciclo con un clip, borrar; Mayús + arrastrar en la regla = región de ciclo; cambiar BPM o tono regenera los beats y escala sus posiciones; importar audio; mezcla por pista; ajustes: nombre, sincronía, cuenta previa, exportar WAV/pistas, respaldo, borrar). Atajos: espacio, R, Supr.
- `5-app.js`: rutas `#/`, `#/s/<id>`, `#/licencias`, y **`#/nueva?tono=La&bpm=92&genero=cumbia&desde=guitarra`** para que guitarra/voz abran el estudio con su tono y tempo (pendiente agregar ese botón en esas apps).

## Probado (24 oct 2026)
Los 15 estilos generan sonido en todas sus pistas (0.3–1 s por render de 2 compases); agregar beat A y B, reproducir, cambiar tono, grabar con micrófono falso, exportar WAV (3.8 MB para 20 s), recargar con «Sesión recuperada»; sin errores de consola y sin desbordes a 320/360/400 px (letra ×1.15) ni a 1280 px. **Falta**: probar en teléfonos reales la latencia de grabación (Bluetooth) y el sonido en iPhone.

## Siguientes pasos sugeridos
- Botón «Tocar con un beat» en guitarra (cancionero/pistas) y voz que abra `#/nueva?...`.
- Más estilos y variaciones; acordeón/requinto para norteño cuando haya muestras libres; swing por estilo.
- Que guitarra y voz adopten `mastil/comun/` (ver `mastil/comun/README.md`).
