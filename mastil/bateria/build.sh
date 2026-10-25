#!/bin/sh
# Construye index.html y sw.js de Roka Batería: primero el núcleo compartido (../comun/src) y luego src/ de esta app.
set -e
cd "$(dirname "$0")"
VER=$(date +%Y%m%d%H%M%S)
PY=$(command -v python3 || command -v python)
"$PY" - "$VER" <<'PY'
import sys,glob
v=sys.argv[1]
css=open('src/0-style.css',encoding='utf8').read()
js=''.join(open(f,encoding='utf8').read()+'\n' for f in sorted(glob.glob('../comun/src/[1-9]-*.js'))+sorted(glob.glob('src/[1-9]-*.js')))
t=open('src/index.tpl.html',encoding='utf8').read().replace('/*CSS*/',css).replace('/*JS*/',js)
open('index.html','w',encoding='utf8').write(t)
open('sw.js','w',encoding='utf8').write(open('src/sw.tpl.js',encoding='utf8').read().replace('__VER__',v))
PY
wc -c index.html
