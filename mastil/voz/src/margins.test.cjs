/* Ejecuta sin modificar tools/revisar-margenes.js. Puppeteer actual usa
   headless:true; el script histórico pasa 'new'. Solo adapta el arranque. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),puppeteer=require('puppeteer');
(async()=>{
  const logs=[],script=fs.readFileSync(path.join(__dirname,'../tools/revisar-margenes.js'),'utf8');
  for(const [width,scale] of [[390,1.25],[360,1.15],[320,1],[1280,1]]){
    await vm.runInNewContext(script,{
      require:name=>name==='puppeteer'?{...puppeteer,launch:options=>puppeteer.launch({...options,headless:true,args:['--no-sandbox']})}:require(name),
      process:{argv:['node','tools/revisar-margenes.js',String(width),String(scale)],env:process.env},setTimeout,
      console:{log:(...args)=>{const text=args.join(' ');logs.push(text);console.log(text)}}
    });
  }
  fs.writeFileSync(path.join(__dirname,'test-evidence/margins.txt'),logs.join('\n')+'\n');
  if(logs.some(s=>s.includes('problemas:')&&!s.endsWith('problemas: 0')))throw Error('Hay problemas de márgenes.');
})().catch(e=>{console.error(e);process.exitCode=1});
