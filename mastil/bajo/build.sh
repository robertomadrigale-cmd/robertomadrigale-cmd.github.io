#!/bin/sh
set -e
cd "$(dirname "$0")"
VER=$(date +%Y%m%d%H%M%S)
python3 - "$VER" <<'PY'
from pathlib import Path
import sys
v=sys.argv[1]; shared=Path('../src'); local=Path('src')
css=(shared/'0-style.css').read_text(encoding='utf8').replace('fonts/', '../fonts/')
css+='\n'+(local/'0-bajo.css').read_text(encoding='utf8')
modules={p.name:p for p in shared.glob('[1-9]-*.js')}
modules.update({p.name:p for p in local.glob('[1-9]-*.js')})
js=''.join(modules[n].read_text(encoding='utf8')+'\n' for n in sorted(modules))
js=js.replace('__SILENT__',(shared/'silent.b64').read_text().strip()).replace('__VER__',v)
template=(local/'index.tpl.html').read_text(encoding='utf8')
Path('index.html').write_text(template.replace('/*CSS*/',css).replace('/*JS*/',js),encoding='utf8',newline='\n')
Path('sw.js').write_text((local/'sw.tpl.js').read_text(encoding='utf8').replace('__VER__',v),encoding='utf8',newline='\n')
print('Om Bajo:',len(modules),'modules,',Path('index.html').stat().st_size,'bytes')
PY
