// QA de marca: portada y cuatro apps a 320, 400 y 1280 px, sin errores ni desborde.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),os=require('os');
const base=process.env.OM_BASE||'http://127.0.0.1:8765';
const stamp=new Date().toISOString().replace(/[:.]/g,'-');
const out=process.env.OM_SHOTS||path.join(os.tmpdir(),'om-marca-'+stamp);
const apps=[
  {id:'portada',url:'/mastil/roka/?cambiar',key:'roka-portada:v1',cover:true},
  {id:'guitarra',url:'/mastil/',key:'mastil-a-la-vista:v2'},
  {id:'voz',url:'/mastil/voz/',key:'roka-couch-vocal:v1'},
  {id:'bateria',url:'/mastil/bateria/',key:'roka-bateria:v1'},
  {id:'estudio',url:'/mastil/estudio/'}
];
(async()=>{
  fs.mkdirSync(out,{recursive:true});
  const browser=await chromium.launch({executablePath:process.env.CHROME,headless:true});
  const results=[];
  for(const w of [320,400,1280])for(const app of apps){
    const context=await browser.newContext({viewport:{width:w,height:900},deviceScaleFactor:1});
    const page=await context.newPage(),errors=[];
    page.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text())});
    page.on('pageerror',e=>errors.push('pageerror: '+e.message));
    await page.addInitScript(({key,cover})=>{if(key){if(cover)localStorage.removeItem(key);else localStorage.setItem(key,JSON.stringify({onb:1}))}},{key:app.key,cover:app.cover});
    await page.goto(base+app.url,{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForTimeout(1200);
    const state=await page.evaluate(({cover})=>{
      const root=document.documentElement,body=document.body;
      const old=[...body.childNodes].some(n=>n.nodeType===Node.TEXT_NODE&&/Roka|Couch Vocal|Guitar for All/i.test(n.textContent||''));
      const text=body.innerText;
      return{title:document.title,overflow:root.scrollWidth-root.clientWidth,old:old||/Roka|Couch Vocal|Guitar for All/i.test(text),logo:!!document.querySelector(cover?'.om-lockup':'.om-logo'),signature:text.includes('by AutomaTIA')};
    },{cover:app.cover});
    if(!/Om/.test(state.title))errors.push('título sin Om: '+state.title);
    if(state.overflow>1)errors.push('desborde horizontal: '+state.overflow+' px');
    if(state.old)errors.push('nombre anterior visible');
    if(!state.logo)errors.push('logo Om ausente');
    if(!state.signature)errors.push('firma by AutomaTIA ausente');
    const file=path.join(out,`${app.id}-${w}.png`);
    await page.screenshot({path:file,fullPage:true});
    results.push({app:app.id,width:w,title:state.title,overflow:state.overflow,errors,file});
    await context.close();
  }
  await browser.close();
  console.log(JSON.stringify({out,results},null,2));
  if(results.some(r=>r.errors.length))process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
