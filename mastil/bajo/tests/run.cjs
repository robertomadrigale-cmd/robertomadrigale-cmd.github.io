/* Alternativa explícita porque Node 24 no expande una ruta de directorio
   pasada a --test. Ejecuta todos los archivos *.test.cjs en orden estable. */
const fs=require('node:fs'),path=require('node:path');
for(const file of fs.readdirSync(__dirname).filter(file=>file.endsWith('.test.cjs')).sort())require(path.join(__dirname,file));
