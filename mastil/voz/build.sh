#!/bin/sh
# Construye index.html y sw.js desde src/ (sin dependencias, solo python3).
# Uso: sh build.sh   (desde cualquier carpeta)
set -e
cd "$(dirname "$0")"
VER=$(date +%Y%m%d%H%M%S)
python3 - "$VER" <<'PY'
import sys,glob
v=sys.argv[1]
css=open('src/0-style.css',encoding='utf8').read()
js=''.join(open(f,encoding='utf8').read()+'\n' for f in sorted(glob.glob('src/[1-9]-*.js')))
js=js.replace('__SILENT__',open('src/silent.b64').read().strip())
t=open('src/index.tpl.html',encoding='utf8').read().replace('/*CSS*/',css).replace('/*JS*/',js)
open('index.html','w',encoding='utf8').write(t)
open('sw.js','w',encoding='utf8').write(open('src/sw.tpl.js',encoding='utf8').read().replace('__VER__',v))
PY
wc -c index.html
