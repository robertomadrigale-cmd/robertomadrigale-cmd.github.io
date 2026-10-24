/* NODE_PATH=<puppeteer> CHROME=<chrome.exe> node src/songs.browser.test.cjs
   Sirve la raíz en localhost:8765. Archivos de prueba solo dentro de src/. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),puppeteer=require('puppeteer'),{signal,wav}=require('./song-test-utils.cjs');
const dir=path.join(__dirname,'test-evidence');fs.mkdirSync(dir,{recursive:true});
const voice=path.join(dir,'voice.wav'),stereo=path.join(dir,'stereo.wav');
const notes=[60,64,67,65,62,69,67,60].map((m,i)=>({m,t0:.3+i*.75,t1:.3+(i+1)*.75}));fs.writeFileSync(voice,wav(signal(notes)));fs.writeFileSync(stereo,wav(signal(notes,{stereo:true})));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const browser=await puppeteer.launch({headless:true,executablePath:process.env.CHROME,args:['--no-sandbox','--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--use-file-for-fake-audio-capture='+voice,'--autoplay-policy=no-user-gesture-required']});
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(15000);
  const go=async hash=>{await page.evaluate(h=>location.hash=h,hash);await sleep(160)};
  const click=selector=>page.$eval(selector,b=>b.click());
  const fill=(selector,value)=>page.$eval(selector,(el,value)=>{el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))},value);
  const shot=name=>page.screenshot({path:path.join(dir,name+'.png'),fullPage:false});
  try{
    await page.goto('http://localhost:8765/mastil/voz/');await page.evaluate(()=>{DB.onb=1;DB.songs=[];save()});await page.reload();
    await page.waitForFunction('typeof allSongs==="function"');assert.equal(await page.evaluate(()=>allSongs().length),40);
    for(const width of [400,1280]){
      await page.setViewport({width,height:850});for(const hash of ['#/','#/canciones','#/canciones/nueva','#/canciones/estrellita']){await go(hash);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,hash+' '+width);await shot(width+'-'+(hash.slice(2).replaceAll('/','-')||'hoy'))}
    }
    await go('#/');assert.equal(await page.$eval('.guitar-pill',el=>el.getAttribute('href')),'../roka/');assert(await page.$eval('.guitar-pill',el=>Math.abs(el.getBoundingClientRect().right-el.parentElement.getBoundingClientRect().right)<2));
    await go('#/canciones');await fill('#song-search','grace');assert.equal(await page.$$eval('.vocal-srow',els=>els.length),1);await fill('#song-search','');await page.select('#song-collection','Navidad');assert.equal(await page.$$eval('.vocal-srow',els=>els.length),6);
    console.log('PASS catálogo, filtros, enlace relativo y pantallas 400/1280 sin desborde');
    await go('#/canciones/nueva');await fill('#mine-title','Mi práctica ñ');await fill('#mine-lyrics','Canta con calma\nMi voz suena');await click('[data-editor=syllables]');await click('[data-editor=sing]');await page.waitForSelector('#free-start');
    const id=await page.evaluate(()=>DB.songs[0].id);await click('#free-start');await page.waitForFunction('!!MIC.stream');await sleep(1200);await click('#free-stop');assert(await page.$eval('#free-result',el=>el.textContent.includes('dentro de la escala')));assert.equal(await page.evaluate(()=>!!MIC.stream),false);
    await page.reload();await page.waitForSelector('#free-start');assert.equal(await page.evaluate(()=>DB.songs.length),1);
    console.log('PASS crear sin melodía, cantar libre con micrófono WAV y persistir tras recargar');
    await go('#/canciones/editar/'+id);const file=await page.$('#mine-file');await file.uploadFile(stereo);await page.waitForFunction('document.querySelector("#extract-status").textContent.startsWith("Confianza:")');
    assert((await page.$$('[data-ni]')).length>=8);await click('[data-editor=preview]');assert(await page.$eval('#mine-tone',el=>el.textContent.includes('Tono sugerido')));
    await page.setViewport({width:400,height:850});await shot('400-editor-audio');await click('[data-editor=save]');await page.waitForFunction('DB.songs[0].audioStored===true');
    assert(await page.evaluate(async()=>!!(await audioStore('get',DB.songs[0].id))));assert(await page.evaluate(()=>DB.songs[0].notes.flat().every(n=>Number.isFinite(n.t0))));
    await click('[data-editor=save]');await sleep(200);assert.equal(await page.evaluate(()=>DB.songs[0].audioStored),true);
    const first=await page.$eval('[data-li="0"][data-ni="0"] [data-note=m]',el=>el.value);await click('[data-li="0"][data-ni="0"] [data-adjust=up]');assert.notEqual(await page.$eval('[data-li="0"][data-ni="0"] [data-note=m]',el=>el.value),first);await click('[data-li="0"][data-ni="0"] [data-adjust=down]');await click('[data-editor=sing]');await page.waitForSelector('[data-coach=begin]');
    console.log('PASS subir estéreo, extracción, editor, vista previa, guardar y re-guardar audio en IndexedDB');
    await click('.coach-settings summary');await click('[data-setting="original:'+id+'"]');assert(await page.$eval('.coach-settings',el=>el.textContent.includes('La voz guía está apagada')));await click('[data-coach=begin]');await page.waitForSelector('#count');await click('[data-coach=now]');await page.waitForSelector('#coach-lane');
    assert.equal(await page.evaluate(()=>PRACTICE.spec.ev.length),1);assert(await page.evaluate(()=>PRACTICE.spec.targets.every((n,i)=>Math.abs((n.t0-PRACTICE.spec.segs[0].t0)-DB.songs[0].notes.flat()[i].t0)<1e-5)));
    await click('[data-coach=pause]');await page.waitForFunction('PRACTICE.paused && AC.state==="suspended"');const paused=await page.evaluate(()=>AC.currentTime);await sleep(250);assert.equal(await page.evaluate(()=>AC.currentTime),paused);await click('[data-coach=resume]');await page.waitForFunction('!PRACTICE.paused');
    await fill('[data-original-volume]','.2');assert.equal(await page.evaluate(()=>DB.originalVolume),.2);
    await page.evaluate(()=>{MIC.on=null;for(const g of PRACTICE.spec.targets)for(let t=g.t0+.1;t<g.t1-.04;t+=.04)PRACTICE.onMic({m:g.m,t,rms:.1});PRACTICE.spec.end=AC.currentTime-1});await page.waitForSelector('.coach-result');assert.equal(await page.evaluate(()=>DB.best['song:'+DB.songs[0].id]),1);await shot('400-original-result');
    console.log('PASS tiempos originales, guía apagada, volumen, pausa y calificación simulada contra objetivos');
    await go('#/canciones');await click('.song-backup summary');await click('[data-backup=copy]');const code=await page.$eval('#song-code',el=>el.value);assert(code.startsWith('RCV1:'));await click('[data-backup=import]');assert.equal(await page.evaluate(()=>DB.songs.length),1);
    await page.evaluate(()=>{DB.songs=[];save();route()});await click('.song-backup summary');await fill('#song-code',code);await click('[data-backup=import]');assert.equal(await page.evaluate(()=>DB.songs[0].audioStored),false);assert.equal(await page.evaluate(()=>DB.songs[0].notes[0][0].t0),JSON.parse(Buffer.from(code.slice(5),'base64').toString())[0].notes[0][0].t0);
    console.log('PASS respaldo UTF-8 con tiempos, importación y duplicados sin pérdida');
    await go('#/canciones/nueva');await fill('#mine-title','Tarareo');await fill('#mine-lyrics','la la la la');await click('[data-editor=syllables]');await click('[data-action=record]');await page.waitForFunction('!!MIC.stream');await sleep(3200);await click('[data-action=record]');assert((await page.$$('[data-ni]')).length>=4);assert.equal(await page.evaluate(()=>!!MIC.stream),false);await click('[data-editor=sing]');await page.waitForSelector('[data-coach=begin]');assert.equal(await page.evaluate(()=>DB.songs.length),2);
    console.log('PASS crear melodía tarareando con WAV mediante micStart/MIC');
    await go('#/canciones/nueva');await fill('#mine-title','Sin almacenamiento de audio');await fill('#mine-lyrics','la la la la');await click('[data-editor=syllables]');await(await page.$('#mine-file')).uploadFile(stereo);await page.waitForFunction('document.querySelector("#extract-status").textContent.startsWith("Confianza:")');
    await page.evaluate(()=>{window.__audioStore=audioStore;audioStore=async()=>{throw Error('cuota de prueba')}});await click('[data-editor=save]');await page.waitForFunction('DB.songs.length===3');assert.equal(await page.evaluate(()=>DB.songs[2].audioStored),false);assert(await page.$eval('#extract-status',el=>el.textContent.includes('pero no el audio')));await page.evaluate(()=>audioStore=window.__audioStore);
    console.log('PASS fallo de IndexedDB conserva melodía y avisa');
    const codec=await page.evaluate(async()=>{
      ac();await AC.resume();const destination=AC.createMediaStreamDestination(),osc=AC.createOscillator(),gain=AC.createGain();osc.connect(gain).connect(destination);gain.gain.value=.3;osc.frequency.value=m2f(60);osc.frequency.setValueAtTime(m2f(64),AC.currentTime+.8);
      const recorder=new MediaRecorder(destination.stream,{mimeType:'audio/mp4'}),chunks=[];recorder.ondataavailable=e=>chunks.push(e.data);const stopped=new Promise(r=>recorder.onstop=r);recorder.start();osc.start();await new Promise(r=>setTimeout(r,1600));recorder.stop();osc.stop();await stopped;osc.disconnect();gain.disconnect();destination.stream.getTracks().forEach(t=>t.stop());
      const file=new File(chunks,'prueba.mp4',{type:'video/mp4'}),native=await decodeSongFile(file);
      const original=AC.decodeAudioData.bind(AC);let fallback;
      try{AC.decodeAudioData=async()=>{throw Error('Fuerza ruta de video')};fallback=await decodeSongFile(file)}finally{AC.decodeAudioData=original}
      const result=await extractMelody(await prepareAudio(fallback),fallback.sampleRate,90);
      const cancelled=new AbortController();cancelled.abort();let aborted=false;try{await decodeVideoAudio(file,cancelled.signal)}catch(e){aborted=e.name==='AbortError'}
      return{native:native.duration,fallback:fallback.duration,notes:result.notes.map(n=>n.m),aborted,videos:document.querySelectorAll('video').length};
    });
    assert(codec.native>1.4);assert(codec.fallback>1.2);assert(codec.notes.includes(60)&&codec.notes.includes(64));assert(codec.aborted);assert.equal(codec.videos,0);
    console.log('PASS MP4 generado: decodeAudioData, fallback de video y cancelación sin elementos residuales',JSON.stringify(codec));
    const side=await page.evaluate(()=>{
      const buffer=AC.createBuffer(2,4800,48000);buffer.getChannelData(0).fill(.8);buffer.getChannelData(1).fill(.2);let captured;
      const original=AC.createBufferSource.bind(AC);AC.createBufferSource=()=>{const source=original();const start=source.start.bind(source);source.start=(...args)=>{captured=source.buffer;start(...args)};return source};
      const song=songById(DB.songs[0].id);let spec;try{spec=timedSongSpec(song,buffer,{side:true});spec.ev[0].fn(AC.currentTime+.02);return captured.getChannelData(0)[0]}finally{spec?.cleanup();AC.createBufferSource=original}
    });assert(Math.abs(side-.3)<1e-6);console.log('PASS Quitar la voz usa (L−R)/2');
    await go('#/canciones');await click('[data-delete]');await click('[data-confirm]');await page.waitForFunction('DB.songs.length===2');
    await page.evaluate(async()=>{await navigator.serviceWorker.ready});await page.reload();await page.waitForFunction('!!navigator.serviceWorker.controller');await page.setOfflineMode(true);await page.reload();await page.waitForSelector('#song-list');assert.equal(await page.evaluate(()=>allSongs().length),42);await go('#/canciones/nueva');await page.waitForSelector('#mine-title');await page.setOfflineMode(false);
    console.log('PASS borrar canción y abrir catálogo/editor sin conexión');
    assert.deepEqual(errors,[]);console.log('PASS sin excepciones JavaScript');
    fs.writeFileSync(path.join(dir,'browser-results.json'),JSON.stringify({passed:true,viewports:[400,1280],errors,microphone:'WAV sintético; no voz real',codec,checks:['catálogo','filtros','enlace guitarra arriba a la derecha','canto libre','persistencia','audio estéreo','editor','original sincronizado','pausa','volumen','respaldo','tarareo WAV','fallo IndexedDB','MP4 nativo','MP4 fallback video','cancelar video','canal lateral','borrar','offline']},null,2));
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
