/* Pruebas sin dependencias. node src/coach.test.cjs [ruta a chrome.exe] */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const dir=__dirname;
function unitTests(){
  const context={console,localStorage:{getItem:()=>JSON.stringify({range:{lo:45,hi:69,at:'2026-10-01'},best:{larga:.88},days:{'2026-10-01':true},secs:{'2026-10-01':120}}),setItem(){}},document:{},matchMedia:()=>({}),AC:{currentTime:0},TART:{range:[0,'']},performance:{now:()=>0}};
  vm.createContext(context);
  let source=fs.readFileSync(path.join(dir,'1-base.js'),'utf8').split('/* ---------- temas')[0];
  for(const f of ['4-content.js','5-lane.js','5-coach.js'])source+='\n'+fs.readFileSync(path.join(dir,f),'utf8');
  source+='\nthis.api={DB,DRILLS,drillSpec,comfy,starsFor,levelStars,levelOpen,currentLevel,buildSession,coachTip,recordResult,recordRange,growRange,specScore,SONGLIST,shortSong,bestStreak};';
  vm.runInContext(source,context);const a=context.api;let count=0;
  const test=(name,fn)=>{fn();count++;console.log('PASS',name)};
  test('Migración conserva rango, marcas, días y tiempo',()=>{assert.equal(a.DB.range.lo,45);assert.equal(a.DB.best.larga,.88);assert.equal(a.DB.stars.larga,3);assert.equal(a.DB.secs['2026-10-01'],120);assert.equal(a.DB.rangeHist[0].d,'2026-10-01')});
  test('16 ejercicios y seis IDs originales',()=>{assert.equal(a.DRILLS.length,16);for(const id of ['larga','trino','sirena','arpegio','escala','staccato'])assert(a.DRILLS.find(d=>d.id===id));for(const d of a.DRILLS)assert(d.rounds>=3&&d.rounds<=5&&d.tip&&d.motif)});
  test('Umbrales exactos de estrellas',()=>assert.deepEqual([.49,.5,.69,.7,.84,.85].map(a.starsFor),[0,1,1,2,2,3]));
  test('Bloqueo secuencial con diez estrellas',()=>{a.DB.stars={};assert(!a.levelOpen(2));['eco','larga','trino'].forEach(id=>a.DB.stars[id]=3);a.DB.stars.tres=1;assert(a.levelOpen(2));assert(!a.levelOpen(3));['escala','arpegio3','terceras'].forEach(id=>a.DB.stars[id]=3);a.DB.stars.staccato=1;assert(a.levelOpen(3));a.DB.stars={}});
  test('Rondas limitadas y notas dentro de la zona cómoda, incluso rangos estrechos',()=>{for(const range of [{lo:45,hi:69},{lo:60,hi:65}]){a.DB.range=range;for(const d of a.DRILLS.filter(d=>!d.breath&&d.id!=='extensor')){const sp=a.drillSpec(d,{dir:'ud'}),c=a.comfy();assert.equal(sp.rounds,d.rounds);assert(sp.targets.every(g=>g.m>=c.lo&&g.m<=c.hi&&(g.m2==null||g.m2>=c.lo&&g.m2<=c.hi)))}}a.DB.range={lo:45,hi:69}});
  test('Eco elige notas distintas entre rondas',()=>{const sp=a.drillSpec(a.DRILLS.find(d=>d.id==='eco'),{}),roots=sp.segs.filter(s=>s.ph==='L').map(s=>s.R);assert(roots.every((r,i)=>!i||r!==roots[i-1]))});
  test('Extensor llega a +2 semitonos en pasos de medio tono',()=>{const sp=a.drillSpec(a.DRILLS.find(d=>d.id==='extensor'),{});assert.equal(Math.max(...sp.targets.map(g=>g.m)),71);assert.deepEqual(Array.from(sp.segs.filter(s=>s.ph==='L').map(s=>s.R)),[57,58,59])});
  test('Rango solo crece por nota con al menos 60 % de acierto',()=>{assert(!a.growRange({targets:[{ph:'S',bins:{70:{n:10,h:5}}}]}));assert(a.growRange({targets:[{ph:'S',bins:{70:{n:10,h:6},44:{n:10,h:7}}}]}));assert.equal(a.DB.range.hi,70);assert.equal(a.DB.range.lo,44)});
  test('Sirena no acredita extremos que no se cantaron',()=>{a.DB.range={lo:45,hi:69};a.growRange({targets:[{ph:'S',m:65,m2:72,bins:{66:{n:20,h:20}}}]});assert.equal(a.DB.range.hi,69)});
  test('Sesión estable, diaria, con duración de 10 a 15 minutos en todos los niveles',()=>{for(let l=1;l<=3;l++){a.DB.stars={};a.DRILLS.filter(d=>d.lvl<l).forEach(d=>a.DB.stars[d.id]=3);for(let day=10;day<17;day++){a.DB.sess=null;const s=a.buildSession('2026-10-'+day);assert(s.steps.length>=6&&s.steps.length<=8);assert(s.minutes>=10&&s.minutes<=15);assert.equal(s.steps[0],'respira');assert(s.steps.at(-1).startsWith('song:'));assert.equal(a.buildSession(s.d),s)}}a.DB.range=null;a.DB.sess=null;assert.equal(a.buildSession().steps[0],'rango')});
  test('Consejos: silencio, agudas, graves, inestabilidad, ataque y buena afinación',()=>{
    const g=(m,err=0)=>({ph:'S',m,beats:2,reads:20,voiced:20,sum:err*20,sq:err*err*20,n:20,h:10});
    assert.match(a.coachTip({targets:[{...g(60),silent:12}]}),/Casi no/);
    assert.match(a.coachTip({targets:[g(60),g(72,-.5)]}),/agudas/);
    assert.match(a.coachTip({targets:[g(60),g(72,.5)]}),/arriba en las agudas/);
    assert.match(a.coachTip({targets:[g(60,-.5),g(72)]}),/graves/);
    assert.match(a.coachTip({targets:[g(60,.5),g(72)]}),/graves/);
    assert.match(a.coachTip({targets:[{...g(60),sq:10}]}),/se movía/);
    assert.match(a.coachTip({targets:[{...g(60),earlyN:10,earlyH:1,lateN:10,lateH:9}]}),/tarde/);
    assert.match(a.coachTip({targets:[{...g(60),h:19}]}),/buena afinación/);
  });
  test('Repetir conserva la mejor marca y no duplica estrellas; historial máximo 400',()=>{a.DB.best={};a.DB.stars={};a.DB.hist=[];const spec=s=>({targets:[{ph:'S',n:100,h:s*100}],tip:'Sigue.'});assert.equal(a.recordResult('larga',spec(.9)).gained,3);assert.equal(a.recordResult('larga',spec(.8)).gained,0);assert.equal(a.DB.best.larga,.9);for(let i=0;i<402;i++)a.recordResult('eco',spec(.6));assert.equal(a.DB.hist.length,400);const before=a.DB.hist.length;assert.equal(a.recordResult('larga',null).s,null);assert.equal(a.DB.hist.length,before)});
  test('Mejor racha usa fechas locales consecutivas',()=>{a.DB.days={'2026-10-01':true,'2026-10-02':true,'2026-10-03':true,'2026-10-05':true};assert.equal(a.bestStreak(),3)});
  console.log(`${count} pruebas de lógica aprobadas.`);
}
async function browserTests(chrome){
  const {spawn}=require('node:child_process');
  const profile=path.join(dir,'.coach-test-browser');
  const proc=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--remote-debugging-port=0','--user-data-dir='+profile,'--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--autoplay-policy=no-user-gesture-required','about:blank'],{windowsHide:true,stdio:['ignore','ignore','pipe']});
  let socket,id=0;const pending=new Map(),errors=[];
  const endpoint=await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(new Error('Chrome no inició')),15000);proc.on('error',reject);proc.stderr.on('data',data=>{const m=String(data).match(/DevTools listening on (ws:\/\/[^\s]+)/);if(m){clearTimeout(t);resolve(m[1])}})});
  try{
    socket=new WebSocket(endpoint);await new Promise((r,j)=>{socket.onopen=r;socket.onerror=j});
    socket.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(new Error(m.error.message)):p.resolve(m.result)}}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text)};
    const send=(method,params={},sessionId)=>new Promise((resolve,reject)=>{const n=++id,timer=setTimeout(()=>{pending.delete(n);reject(new Error('CDP timeout: '+method))},15000);pending.set(n,{resolve:r=>{clearTimeout(timer);resolve(r)},reject:e=>{clearTimeout(timer);reject(e)}});socket.send(JSON.stringify({id:n,method,params,...(sessionId?{sessionId}:{})}))});
    const {targetId}=await send('Target.createTarget',{url:'about:blank'}),{sessionId}=await send('Target.attachToTarget',{targetId,flatten:true});
    const cdp=(method,params={})=>send(method,params,sessionId);
    await cdp('Runtime.enable');await cdp('Page.enable');await cdp('Network.enable');await cdp('Network.setBypassServiceWorker',{bypass:true});
    const evaluate=async expression=>{const r=await cdp('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true,userGesture:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value};
    const wait=ms=>new Promise(r=>setTimeout(r,ms));
    const until=async(expression,timeout=5000)=>{const start=Date.now();while(Date.now()-start<timeout){if(await evaluate(expression))return;await wait(80)}throw new Error('Espera agotada: '+expression)};
    const go=async hash=>{await evaluate(`location.hash=${JSON.stringify(hash)}`);await wait(150)};
    const click=async selector=>{await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);await wait(100)};
    const capture=async name=>{const {data}=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(dir,'coach-test-'+name+'.png'),Buffer.from(data,'base64'))};
    await cdp('Page.navigate',{url:'http://localhost:8765/mastil/voz/'});await until('typeof DB !== "undefined"');
    await evaluate(`Object.assign(DB,{onb:1,range:{lo:45,hi:69,at:'2026-10-01'},best:{larga:.88},days:{'2026-10-01':true},secs:{'2026-10-01':120},sess:null});save()`);
    await cdp('Page.reload',{ignoreCache:true});await until('typeof DB !== "undefined" && DB.onb===1');
    if(process.argv.includes('--quick')){
      for(const width of [400,1280]){await cdp('Emulation.setDeviceMetricsOverride',{width,height:850,deviceScaleFactor:1,mobile:false});await go('#/');await capture(width+'-hoy-final')}
      await evaluate(`DB.range=null;DB.sess=null;DB.today={};route();window.__micRequests=0;navigator.mediaDevices.getUserMedia=async()=>{window.__micRequests++;throw new DOMException('blocked','NotAllowedError')}`);
      await click('[data-start-session]');await until('document.querySelector("#count")');await click('[data-coach="now"]');await until('document.querySelector(".coach-result")');assert.equal(await evaluate('DB.sess.res[0].skipped'),true);assert.equal(await evaluate('DB.today.rango'),undefined);assert(await evaluate('document.body.innerText.includes("pendiente de medir")'));
      await click('[data-coach="next"]');await click('[data-coach="now"]');await click('[data-coach="skip"]');await click('[data-coach="now"]');await until('document.querySelector("#coach-lane")');await evaluate('PRACTICE.spec.end=AC.currentTime-1');await until('document.querySelector(".coach-result")');assert.equal(await evaluate('DB.hist.length'),0);assert.equal(await evaluate('window.__micRequests'),1);console.log('PASS sesión sin micrófono omite medición, continúa y no inventa historial');
      await go('#/canciones/estrellita');await evaluate('DB.songSpeed=.75;route()');assert.equal(await evaluate('document.querySelector("[data-setting=songSpeed]").value'),'0.75');await click('[data-coach="begin"]');await until('document.querySelector("#count")');await click('[data-coach="now"]');await until('document.querySelector("#coach-lane")');assert(Math.abs(await evaluate('PRACTICE.spec.beat')-60/72)<.001);console.log('PASS velocidad guardada coincide con selector y reproducción');
      assert.deepEqual(errors,[]);console.log('PASS build final sin excepciones');return;
    }
    for(const width of [400,1280,320]){
      await cdp('Emulation.setDeviceMetricsOverride',{width,height:850,deviceScaleFactor:1,mobile:false});
      for(const hash of ['#/','#/ejercicios','#/canciones','#/progreso','#/practicar/afinador','#/practicar/rango','#/practicar/respiracion','#/practicar/metronomo','#/practicar/ej/larga','#/canciones/estrellita']){
        await go(hash);const overflow=await evaluate('document.documentElement.scrollWidth>innerWidth+1');assert(!overflow,`${width} ${hash}: desborde horizontal`);
        if(width!==320&&['#/','#/ejercicios','#/progreso'].includes(hash))await capture(width+'-'+(hash.slice(2)||'hoy'));
      }
    }
    await go('#/leccion/1');await until('location.hash==="#/"');await go('#/lecciones');await until('location.hash==="#/"');console.log('PASS rutas antiguas, 30 vistas y anchos 320/400/1280');
    for(const [width,scale] of [[390,1.25],[360,1.15]]){
      await cdp('Emulation.setDeviceMetricsOverride',{width,height:850,deviceScaleFactor:1,mobile:false});
      for(const hash of ['#/','#/ejercicios','#/progreso','#/canciones/estrellita']){await go(hash);await evaluate(`document.querySelectorAll('#page *').forEach(el=>{if(!el.closest('svg'))el.style.fontSize=(parseFloat(getComputedStyle(el).fontSize)*${scale})+'px'})`);assert(!await evaluate('document.documentElement.scrollWidth>innerWidth+1'),hash+' texto grande');assert.deepEqual(await evaluate(`[...document.querySelectorAll('#page button,#page .btn')].filter(el=>el.getBoundingClientRect().width&&el.scrollWidth>el.clientWidth+2).map(el=>el.textContent)`),[])}
    }
    console.log('PASS texto grande a 390 × 1.25 y 360 × 1.15');
    await go('#/practicar/ej/arpegio');assert(await evaluate('document.body.innerText.includes("Te faltan")'));console.log('PASS bloqueo de acceso directo');
    await cdp('Emulation.setDeviceMetricsOverride',{width:400,height:850,deviceScaleFactor:1,mobile:false});
    await go('#/practicar/ej/larga');await click('[data-coach="begin"]');await until('document.querySelector("#count")');await click('[data-coach="now"]');await until('PRACTICE && document.querySelector("#coach-lane")');
    await evaluate(`Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))`);await until('PRACTICE.paused && AC.state==="suspended"');await evaluate(`Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'))`);await wait(150);assert.equal(await evaluate('AC.state'),'suspended');await click('[data-coach="resume"]');await until('!PRACTICE.paused && AC.state==="running"');await evaluate('delete document.hidden');console.log('PASS volver de segundo plano conserva la pausa y el silencio');
    await capture('400-player');await click('[data-coach="pause"]');await until('PRACTICE.paused');const time=await evaluate('AC.currentTime');await wait(300);assert(Math.abs(await evaluate('AC.currentTime')-time)<.05);await click('[data-coach="pause"]');await until('!PRACTICE.paused');
    await click('[data-coach="exit"]');await until('document.querySelector("dialog[open]")');await click('[data-stay]');await until('!PRACTICE.paused');
    await evaluate(`MIC.on=null;for(const g of PRACTICE.spec.targets.filter(g=>g.ph==='S')){for(let t=g.t0+.2;t<g.t1-.05;t+=.04)PRACTICE.onMic({m:tgtAt(g,t),t,rms:.1})}PRACTICE.spec.end=AC.currentTime-1;`);
    await until('document.querySelector(".coach-result")');assert.equal(await evaluate('DB.best.larga'),1);assert.equal(await evaluate('DB.stars.larga'),3);await capture('400-result');console.log('PASS micrófono simulado, pausa, salir/cancelar, afinación 100 % y estrellas');
    // Continuar después de salir mantiene el resultado y el mismo plan.
    await go('#/');await evaluate(`window.__originalMic=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);window.__micRequests=0;navigator.mediaDevices.getUserMedia=(...args)=>{window.__micRequests++;return window.__originalMic(...args)}`);await click('[data-start-session]');await until('document.querySelector("#count")');await click('[data-coach="now"]');await until('document.querySelector("#breath-count")');await click('[data-coach="pause"]');await wait(500);const breath=await evaluate('document.querySelector("#breath-count").textContent');await wait(500);assert.equal(await evaluate('document.querySelector("#breath-count").textContent'),breath);await click('[data-coach="pause"]');await capture('400-breath');
    await until('document.querySelector(".coach-result")',35000);assert.equal(await evaluate('DB.sess.res[0].id'),'respira');assert.equal(await evaluate('DB.sess.res[0].s'),null);
    await click('[data-coach="exit"]');await click('[data-leave]');await until('location.hash==="#/"');const plan=await evaluate('JSON.stringify(DB.sess.steps)');
    await click('[data-start-session]');await until('document.querySelector(".coach-result")');assert.equal(await evaluate('JSON.stringify(DB.sess.steps)'),plan);await click('[data-coach="next"]');await until('document.querySelector("#count")');
    // Completa las notas con lecturas sintéticas; el temporizador de resultados debe avanzar solo.
    for(let step=1;step<7;step++){
      await click('[data-coach="now"]');await until('document.querySelector("#coach-lane")');
      await evaluate(`MIC.on=null;for(const g of PRACTICE.spec.targets.filter(g=>g.ph==='S')){for(let t=g.t0+.05;t<g.t1-.03;t+=.04)PRACTICE.onMic({m:tgtAt(g,t),t,rms:.1})}PRACTICE.spec.end=AC.currentTime-1;`);
      await until('document.querySelector(".coach-result")');
      if(step===1){await until('document.querySelector("#count")',8000)}else await click('[data-coach="next"]');
    }
    await until('document.body.innerText.includes("Hoy le diste voz")');assert.equal(await evaluate('DB.sess.i'),7);assert.equal(await evaluate('!!MIC.stream'),false);assert(await evaluate('DB.sess.finished'));assert.equal(await evaluate('window.__micRequests'),2);assert(await evaluate('currentLevel()>=2'));await capture('400-summary');console.log('PASS sesión completa, respiración 32 s, continuación, autoavance, desbloqueo y un micrófono por entrada');
    await go('#/');await evaluate('DB.range=null;DB.sess=null;DB.rangeHist=[];route()');await click('[data-start-session]');await until('document.querySelector("#count")');await click('[data-coach="now"]');await until('document.querySelector("#rph")?.textContent==="Paso 2 de 3"');
    const requests=await evaluate('window.__micRequests');await evaluate(`clearInterval(MIC.iv);for(let i=0;i<14;i++)MIC.on({m:43,t:AC.currentTime,rms:.1})`);await click('[data-coach="pause"]');assert.equal(await evaluate('MIC.on'),null);await click('[data-coach="resume"]');assert.equal(await evaluate('typeof MIC.on'),'function');await click('#rgo');await evaluate(`for(let i=0;i<14;i++)MIC.on({m:70,t:AC.currentTime,rms:.1})`);await click('#rgo');await click('#rgo');await until('document.querySelector(".coach-result")');assert.equal(await evaluate('DB.range.lo'),43);assert.equal(await evaluate('DB.range.hi'),70);assert.equal(await evaluate('DB.rangeHist.length'),1);assert.equal(await evaluate('window.__micRequests'),requests);assert.equal(await evaluate('!!MIC.stream'),true);await capture('400-range-result');
    await click('[data-coach="next"]');await click('[data-coach="now"]');await click('[data-coach="skip"]');await click('[data-coach="now"]');await until('document.querySelector("#coach-lane")');const hlen=await evaluate('DB.hist.length');await click('[data-coach="repeat"]');await until('document.querySelector("#count")');assert.equal(await evaluate('DB.hist.length'),hlen);await go('#/progreso');assert.equal(await evaluate('!!MIC.stream'),false);console.log('PASS rango inicial, pausa/reanudación, historial de rango, saltar y repetir sin resultado ficticio');
    // Permiso denegado: una sola solicitud, sin puntajes inventados.
    await go('#/practicar/ej/eco');await evaluate(`window.__micRequests=0;navigator.mediaDevices.getUserMedia=async()=>{window.__micRequests++;throw new DOMException('blocked','NotAllowedError')}`);const before=await evaluate('DB.hist.length');await click('[data-coach="begin"]');await until('document.querySelector("#count")');await click('[data-coach="now"]');await until('document.querySelector("#coach-lane")');await evaluate('PRACTICE.spec.end=AC.currentTime-1');await until('document.querySelector(".coach-result")');assert.equal(await evaluate('DB.hist.length'),before);assert.equal(await evaluate('window.__micRequests'),1);assert(await evaluate('document.body.innerText.includes("Sin calificación")'));console.log('PASS sin micrófono no hay puntajes ni estrellas ficticias');
    assert.deepEqual(errors,[]);console.log('PASS sin excepciones JavaScript en navegador');
  }finally{
    if(socket)socket.close();proc.kill();await new Promise(r=>setTimeout(r,1000));
    const resolved=path.resolve(profile);if(resolved.startsWith(path.resolve(dir)+path.sep))fs.rmSync(resolved,{recursive:true,force:true,maxRetries:5,retryDelay:300});
  }
}
(async()=>{unitTests();if(process.argv[2])await browserTests(process.argv[2])})().catch(e=>{console.error(e);process.exitCode=1});
