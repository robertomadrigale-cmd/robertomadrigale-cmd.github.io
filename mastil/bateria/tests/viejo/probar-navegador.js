// Prueba Roka Batería en Chromium: rutas a 400 y 1280 px sin errores, banda sin batería con sonido,
// medidor y coach calificando golpes de un WAV sintético por micrófono falso, y que abra sin conexión.
// Uso (servidor en :8765 desde la raíz del repo):  NODE_PATH=$(npm root -g) CHROME=<chrome.exe> node tools/probar-navegador.js
const puppeteer=require('puppeteer'),fs=require('fs'),path=require('path');
const URL='http://localhost:8765/mastil/bateria/',BPM=180;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
// WAV de golpes: ruido que decae en 25 ms, uno cada pulso a 180 bpm, 48 kHz, 60 s
function wav(file){const sr=48000,n=sr*60,b=Buffer.alloc(44+n*2),per=Math.round(sr*60/BPM);let s=7;
  b.write('RIFF',0);b.writeUInt32LE(36+n*2,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(sr,24);b.writeUInt32LE(sr*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(n*2,40);
  for(let i=0;i<n;i++){const k=i%per;s=(s*1103515245+12345)&0x7fffffff;const v=k<sr*.025?(s/0x7fffffff*2-1)*.8*Math.exp(-k/(sr*.006)):0;b.writeInt16LE(Math.round(v*32767),44+i*2)}
  fs.writeFileSync(file,b)}
(async()=>{
  const tmp=path.join(__dirname,'tmp');fs.mkdirSync(tmp,{recursive:true});const W=path.join(tmp,'golpes.wav');wav(W);
  const b=await puppeteer.launch({headless:'new',executablePath:process.env.CHROME||undefined,args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--use-file-for-fake-audio-capture='+W,'--autoplay-policy=no-user-gesture-required']});
  const res=[];const ok=(name,cond,info)=>{res.push([cond,name,info]);console.log(cond?'ok  ':'FALLA',name,info||'')};
  const page=async(w)=>{const p=await b.newPage();await p.setViewport({width:w,height:820});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/favicon/.test(m.text()))errs.push(m.text())});p.errs=errs;return p};
  // 1) rutas a 400 y 1280 px
  const ROUTES=['#/','#/grooves','#/groove/rock','#/groove/fill2','#/groove/para','#/lecciones','#/leccion/1','#/leccion/6','#/leccion/11','#/glosario','#/practicar','#/practicar/metronomo','#/practicar/precision','#/practicar/banda','#/practicar/setlist','#/progreso','#/ajustes','#/sesion','#/practicar/ej/rock','#/practicar/ej/fill4'];
  for(const w of [400,1280]){const p=await page(w);await p.goto(URL);await p.evaluate(()=>localStorage.setItem('roka-bateria:v1','{"onb":1}'));await p.reload();await sleep(400);
    for(const r of ROUTES){await p.evaluate(h=>location.hash=h,r);await sleep(250);
      const sw=await p.evaluate(()=>{const vw=document.documentElement.clientWidth,d=document.documentElement.scrollWidth-vw;return d>1?d+' px · '+[...document.querySelectorAll('body *')].filter(e=>!e.closest('svg,.gridbox,.shelf')&&e.getBoundingClientRect().right>vw+1).slice(0,3).map(e=>e.tagName+'.'+String(e.className).slice(0,40)+' «'+(e.textContent||'').trim().slice(0,30)+'»').join(', '):0});if(sw)p.errs.push(r+': scroll horizontal '+sw)}
    // interacciones: tocar un groove, escuchar el ejemplo del coach, metrónomo
    await p.evaluate(()=>location.hash='#/groove/rock');await sleep(300);await p.click('#gp');await sleep(1200);const lit=await p.evaluate(()=>document.querySelectorAll('.dgrid .now').length);await p.click('#gp');
    ok(w+' px: el groove se ilumina al sonar',lit>0,'columnas encendidas '+lit);
    await p.evaluate(()=>location.hash='#/practicar/ej/rock');await sleep(300);await p.evaluate(()=>{window.__kf=0;const f=kitFlash;kitFlash=(...a)=>{window.__kf++;return f(...a)}});await p.click('#ex');await sleep(4500);const kit=await p.evaluate(()=>window.__kf);
    ok(w+' px: «Cómo se hace» ilumina la batería y las manos',kit>0);
    await p.evaluate(()=>location.hash='#/practicar/metronomo');await sleep(300);await p.click('#metgo');await sleep(900);const on=await p.evaluate(()=>document.querySelectorAll('#beats i.on').length);await p.click('#metgo');
    ok(w+' px: metrónomo late',on>0);
    ok(w+' px: '+ROUTES.length+' rutas sin errores',!p.errs.length,p.errs.slice(0,5).join(' | '));await p.close()}
  const p=await page(400);await p.goto(URL);await p.evaluate(()=>localStorage.setItem('roka-bateria:v1','{"onb":1}'));await p.reload();await sleep(400);
  // 2) banda sin batería: renderBeat con bajo y armonía, no silencio (antes, un toque carga el kit grabado)
  await p.mouse.click(5,300);await sleep(2500);
  ok('el kit grabado Black Pearl carga al primer toque',await p.evaluate(()=>!!(KIT&&KIT.samples&&KIT.samples.snare2)));
  const band=await p.evaluate(async()=>{const r=await bandRender('rock',110,parseKey('Mi'));const r2=await bandRender('vals',120,parseKey('Re'));return{n:r.parts.length,peaks:r.parts.map(bufPeak),loop:r.loop,v:r2.parts.map(bufPeak),kit:!!(KIT&&KIT.samples)}});
  ok('banda de rock sin batería suena',band.n>=2&&Math.max(...band.peaks)>.01,JSON.stringify(band));
  ok('banda de vals (3/4) suena',Math.max(...band.v)>.01);
  // 3) toques: el coach califica golpes simulados exactos
  const tap=await p.evaluate(async()=>{location.hash='#/practicar/ej/q';await new Promise(r=>setTimeout(r,300));DB.input='tap';DB.gbpm.q=200;DB.spd.q='normal';
    document.querySelector('#go').click();await new Promise(r=>setTimeout(r,200));
    // un «baterista» perfecto: toca cada golpe esperado en su momento exacto
    // toca en cuanto llega cada golpe (si el temporizador se atrasa más de 25 ms, ese golpe se lo salta y cuenta como perdido)
    const c=ac();let k=0,skipped=0;const fire=setInterval(()=>{if(!GRUN.T0)return;const n=gSteps(G.q),st=60/200/G.q.sub,T=GRUN.T0+n*st,now=c.currentTime-outLat(),pad=document.querySelector('[data-pad]');
      while(pad&&T+k*st<=now){if(now-(T+k*st)<.025)pad.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));else skipped++;k++}window.__skip=skipped},2);
    for(let i=0;i<120&&!document.querySelector('.coach-score');i++)await new Promise(r=>setTimeout(r,250));clearInterval(fire);
    return document.querySelector('.coach-score')?.textContent+' · saltados por el simulador '+window.__skip+' · '+document.querySelector('.coach-result .coach-stats')?.innerText.replace(/\s+/g,' ')});
  ok('toques en pantalla: golpes a tiempo califican alto',parseInt(tap)>=85,'resultado '+tap);
  // 4) medidor con micrófono falso (WAV de golpes)
  const med=await p.evaluate(async(BPM)=>{DB.input='mic';location.hash='#/practicar/precision';await new Promise(r=>setTimeout(r,300));TM.bpm=BPM;TM.dur=30;TM.grid=1;TM.mode='click';
    document.querySelector('#tmic').click();for(let i=0;i<20&&!document.querySelector('#tgo');i++)await new Promise(r=>setTimeout(r,200));document.querySelector('#tgo').click();
    for(let i=0;i<160&&document.querySelector('#tres').hidden;i++)await new Promise(r=>setTimeout(r,250));return{txt:document.querySelector('#tres').innerText,ses:DB.ses.length&&DB.ses[DB.ses.length-1]}},BPM);
  ok('medidor con micrófono falso detecta y califica golpes',med.ses&&med.ses.n>=8,med.ses?`${med.ses.n} golpes · tendencia ${Math.round(med.ses.mean)} ms · variación ${Math.round(med.ses.sd)} ms`:med.txt);
  // 5) coach con micrófono falso
  const coach=await p.evaluate(async(BPM)=>{location.hash='#/';await new Promise(r=>setTimeout(r,200));location.hash='#/practicar/ej/q';await new Promise(r=>setTimeout(r,300));DB.input='mic';DB.gbpm.q=BPM;
    document.querySelector('#go').click();for(let i=0;i<160&&!document.querySelector('.coach-score');i++)await new Promise(r=>setTimeout(r,250));
    return{score:document.querySelector('.coach-score')?.textContent,stats:document.querySelector('.coach-result .coach-stats')?.innerText}},BPM);
  const hits=coach.stats&&+((coach.stats.match(/(\d+)\/\d+/)||[])[1]);
  ok('coach con micrófono falso califica golpes',hits>0,`resultado ${coach.score} · ${coach.stats&&coach.stats.replace(/\s+/g,' ')}`);
  ok('sin errores en las pruebas de audio',!p.errs.length,p.errs.slice(0,5).join(' | '));
  // 6) sin conexión
  await p.goto(URL);await p.evaluate(()=>navigator.serviceWorker.ready);await p.reload();await sleep(800);await p.setOfflineMode(true);await p.reload();await sleep(800);
  const off=await p.evaluate(()=>document.querySelector('#page')&&document.querySelector('#page').innerText.length);
  ok('abre sin conexión',off>50,'caracteres '+off);await p.setOfflineMode(false);
  await b.close();const bad=res.filter(r=>!r[0]).length;console.log(`\n${res.length-bad}/${res.length} pruebas de navegador pasan`);process.exit(bad?1:0);
})().catch(e=>{console.error(e);process.exit(1)});
