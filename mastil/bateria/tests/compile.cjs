const fs=require('node:fs');
for(const path of ['mastil/index.html','mastil/bajo/index.html','mastil/bateria/index.html']){new Function(fs.readFileSync(path,'utf8').split('<script>')[1].split('</script>')[0]);console.log('Compiled:',path)}
