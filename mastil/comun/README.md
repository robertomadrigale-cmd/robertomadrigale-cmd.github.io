# Núcleo compartido de la familia Om (`mastil/comun/`)

Código que las apps concatenan ANTES del suyo al construir (hoy: Om Estudio y Om Batería; mañana: bajo y teclado). No se publica por separado (`firebase.json` ignora `comun/**`; queda dentro de cada `index.html`).

| Archivo | Qué da |
|---|---|
| `src/1-audio.js` | `RokaAudio` (`ac`, `unlockAudio` para iPhone, `outLat`, `room`, `reverb`) y los atajos globales `ac`, `unlockAudio`, `outLat`. |
| `src/2-packs.js` | `PACKS` (manifiestos con licencia y crédito), `loadPack(id)` con caché `roka-estudio-muestras-v1`, `sampleVoice`, `playSample(pack,nota,t,dur,vel,{context,destination,pan,reverb,wet,lowpass})`, `drumHit(nombre,…)`. Funciona con `AudioContext` y con `OfflineAudioContext`. |
| `src/3-cc0.js` | Packs CC0 de VSCO 2 CE: `trompeta`, `trombon`, `tuba`, `piano`, `organo` (archivos en `samples/cc0/`, notas reales medidas con YIN en `samples/cc0/manifest.json`). |
| `src/4-theory.js` | `NOTE_ES`, `parseKey('Sib'|'La m'|'C')`, `chordOf(grado,tono,menor)` (I, ii, V7, ♭VII, Imaj7…), `chordTones`, `chordLabel`, `pcIn`. |
| `src/5-beats.js` | `BEATS` (15 estilos con partes A/B/relleno escritas celda por celda), `beatById`, `BEAT_GENRES`, `beatCheck` (valida patrones). |
| `src/6-render.js` | `renderBeat({id,parte,compases,bpm,tono,prog,seed,entrada})` → AudioBuffers separados `bateria`, `bajo`, `armonia`, `metales` + `dur` + `acordes`. Humanización con semilla (±5 ms, ±8 % de fuerza). |
| `src/7-marca.js` | Marca visible compartida: `omLogo({color,size})` y `automatiaMark()`. El nombre interno de carpetas, claves y cachés no cambia. |

## Packs y licencias
Guitarra y bajo: tonejs-instruments (CC BY 3.0). Batería: AVL Drumkits «Black Pearl» (CC BY-SA 3.0). Metales, piano y órgano: VSCO 2 CE (CC0). Todo en `mastil/samples/` con su `LICENCIA.txt`. Para agregar un pack: archivos en `samples/<carpeta>/`, entrada en `PACKS` con `licencia`, `autor`, `url`, `credito` y `notas:{midi:{archivo,cents}}` o `golpes:{nombre:archivo}`. Solo material que permita redistribuir (nada «royalty free» que lo prohíba).

## Adopción pendiente por guitarra y voz
Guitarra (`mastil/src/3-engine.js`) y voz (`mastil/voz/src/3-engine.js`) tienen su propio motor más antiguo (SMP/smpPlay, drumHit). Para migrar: concatenar `comun/src` en su `build.sh`, cambiar sus llamadas a `playSample/drumHit/loadPack` y quitar duplicados, cuidando que su caché de muestras (`roka-muestras-v1` en guitarra) no se pierda. Hacerlo con pruebas de audio offline (balance por instrumento) antes y después.
