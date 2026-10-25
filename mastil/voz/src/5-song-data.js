/* Mis canciones: datos pequeños en localStorage, grabaciones solo en IndexedDB. */
const SONG_AUDIO_LIMIT=80*1024*1024,SONG_MAX_SECONDS=600;
const noteCode=m=>['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'][pcOf(m)]+octOf(m);
const hasMelody=s=>s.lines.some(l=>(l.mel||[]).some(n=>n.m!=null));
const hasOriginalTimings=s=>{const notes=s.recording?.notes?.flat();return !!notes?.length&&notes.filter(n=>n.m!==null).every(n=>Number.isFinite(n.t0)&&Number.isFinite(n.t1))};
function songFit(s){
  const notes=s.lines.flatMap(l=>(l.mel||[]).filter(n=>n.m!=null).map(n=>n.m));
  if(!notes.length)return{extra:Infinity,text:'Cantar libre'};
  const sh=DB['shift:'+s.id]??songShift(s),lo=Math.min(...notes)+sh,hi=Math.max(...notes)+sh;
  if(!DB.range)return{extra:0,text:'Tono sugerido: '+nnTxt(lo)+'–'+nnTxt(hi)};
  const up=Math.max(0,hi-DB.range.hi),down=Math.max(0,DB.range.lo-lo);
  return{extra:up+down,text:up||down?[up?'Pide subir '+up+' semitonos':'',down?'Pide bajar '+down+' semitonos':''].filter(Boolean).join(' · '):'Cabe en tu rango'};
}
/* Reglas básicas, no diccionario: vocales fuertes en hiato, í/ú tónicas,
   u muda en que/qui/gue/gui, grupos inseparables y ataque consonántico. */
function silabas(word){
  const chars=[...word],s=word.toLowerCase(),vowels=[];
  for(let i=0;i<s.length;i++)if(/[aeiouáéíóúü]/.test(s[i])&&!(s[i]==='u'&&i&&/[qg]/.test(s[i-1])&&/[eiéí]/.test(s[i+1]||'')))vowels.push(i);
  if(vowels.length<2)return[word];
  const weak=c=>/[iuü]/.test(c),cuts=[];let previous=vowels[0];
  for(let k=1;k<vowels.length;k++){
    const next=vowels[k],gap=s.slice(previous+1,next);
    if(!gap||gap==='h'){
      const a=s[previous],b=s[next],join=(weak(a)||weak(b))&&!/[íú]/.test(a+b)&&a!==b;
      if(!join)cuts.push(gap==='h'?next-1:next);
    }else{
      const end=gap.slice(-2),cluster=/^(ch|ll|rr|[bcdfgpt]r|[bcfgpt]l)$/.test(end);
      cuts.push(next-(cluster?2:1));
    }
    previous=next;
  }
  return[0,...cuts,chars.length].slice(0,-1).map((start,i)=>chars.slice(start,[...cuts,chars.length][i]).join(''));
}
// los acordes arriba de la letra se vuelven [Acorde] y no se parten en sílabas
function syllabify(text){return mergeChordLines(text).split('\n').map(line=>line.trim().split(/\s+/).map(w=>{if(w.includes('~'))return w;const m=w.match(/^((?:\[[^\]]+\])*)(.*)$/);return m[1]+(m[2]?silabas(m[2]).join('~'):'')}).join(' ')).filter(Boolean).join('\n')}
function cleanMeta(s){return String(s||'').replace(/[{}\r\n]/g,' ').trim().slice(0,150)}
function melodyText(notes){return notes.map(n=>(n.cont?'+':'')+(n.m==null?'r':noteCode(n.m))+'/'+n.d).join(' ')}
function strictMelody(text){
  const raw=text.trim().replace(/^\{mel:\s*/,'').replace(/\}$/,'').trim();if(!raw)return[];
  return raw.split(/\s+/).map(token=>{
    const hit=token.match(/^(\+?)([A-G][#b♯♭]?-?\d|r)\/(\d+(?:\.\d+)?|\.\d+)$/);
    if(!hit)throw Error('Revisa las notas. Ejemplo: C4/1 D4/.5 +E4/.5');
    const m=hit[2]==='r'?null:parseNote(hit[2]),d=+hit[3];
    if(d<=0||d>64||m!==null&&(m<24||m>96)||hit[1]&&m===null)throw Error('Usa notas entre Do1 y Do7 y duraciones de 0 a 64 pulsos.');
    return{m,d,cont:!!hit[1]};
  });
}
function validateSongRow(row){
  if(!row||!/^mine-[a-zA-Z0-9-]+$/.test(row.id)||typeof row.src!=='string'||row.src.length>150000)throw Error('El código contiene una canción inválida.');
  const s=songParse(row.src);if(s.id!==row.id||s.lines.length>160||s.bpm<40||s.bpm>200||s.meta.lvl&&!['1','2','3'].includes(s.meta.lvl))throw Error('Revisa el identificador, el tempo o los renglones.');
  for(const line of s.lines){
    if(line.syl.length>250)throw Error('Divide las frases largas en más renglones.');
    if(line.mel&&line.mel.length){
      if(line.mel.some(n=>!Number.isFinite(n.d)||n.d<=0||n.d>64||n.m!==null&&(!Number.isFinite(n.m)||n.m<24||n.m>96)))throw Error('Hay notas o duraciones inválidas.');
      if(line.mel.filter(n=>n.m!==null&&!n.cont).length!==line.syl.length||line.mel.find(n=>n.m!==null)?.cont)throw Error('Cada sílaba necesita una nota; usa + para prolongarla.');
    }
  }
  for(const [,mel] of row.src.matchAll(/\{mel:([^}]*)\}/g))strictMelody(mel);
  const clean={id:row.id,src:row.src,created:Number.isFinite(row.created)?row.created:Date.now()};
  if(Array.isArray(row.notes)){
    if(row.notes.length!==s.lines.length)throw Error('Los tiempos no corresponden a los renglones.');
    let previous=0;
    clean.notes=row.notes.map((list,li)=>{
      if(!Array.isArray(list)||list.length>1000)throw Error('Hay demasiadas notas.');
      const mel=s.lines[li].mel||[];if(list.length!==mel.length)throw Error('La melodía y sus tiempos no coinciden.');
      return list.map((n,i)=>{
        if(n.m!==mel[i].m||n.d!==mel[i].d||!!n.cont!==!!mel[i].cont)throw Error('La melodía y sus tiempos no coinciden.');
        const out={m:n.m,d:n.d,cont:!!n.cont};
        if(n.t0!=null||n.t1!=null){
          if(!Number.isFinite(n.t0)||!Number.isFinite(n.t1)||n.t0<previous-.001||n.t1<=n.t0||n.t1>SONG_MAX_SECONDS+.1)throw Error('Revisa los inicios y finales: las notas no deben cruzarse.');
          out.t0=n.t0;out.t1=n.t1;previous=n.t1;
        }
        return out;
      });
    });
  }
  if(Number.isFinite(row.duration)&&row.duration>0&&row.duration<=SONG_MAX_SECONDS)clean.duration=row.duration;
  if(Number.isFinite(row.confidence))clean.confidence=Math.max(0,Math.min(1,row.confidence));
  clean.audioStored=!!row.audioStored;return clean;
}
function persistMySongs(songs){
  const old=DB.songs;DB.songs=songs;
  try{localStorage.setItem(DBK,JSON.stringify(DB))}catch(e){DB.songs=old;throw Error('No hay espacio para guardar. Copia un respaldo y libera espacio en este dispositivo.')}
}
function songBackup(){return 'RCV1:'+btoa(Array.from(new TextEncoder().encode(JSON.stringify(DB.songs)),n=>String.fromCharCode(n)).join(''))}
function parseSongBackup(code){
  if(!code.startsWith('RCV1:')||code.length>3000000)throw Error('Pega un código RCV1 válido.');
  let rows;try{rows=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(code.slice(5)),c=>c.charCodeAt(0))))}catch(e){throw Error('El código está incompleto o dañado.')}
  if(!Array.isArray(rows)||rows.length>200)throw Error('El respaldo debe contener hasta 200 canciones.');
  const seen=new Set();return rows.map(r=>{const row=validateSongRow(r);if(seen.has(row.id))throw Error('El respaldo repite identificadores.');seen.add(row.id);row.audioStored=false;return row});
}
function audioStore(action,id,blob){
  return new Promise((resolve,reject)=>{
    if(!globalThis.indexedDB){reject(Error('Este navegador no permite guardar audio.'));return}
    const request=indexedDB.open('roka-vocal',1);let settled=false;
    const timeout=setTimeout(()=>fail(Error('El almacenamiento de audio no responde.')),8000);
    function fail(e){if(settled)return;settled=true;clearTimeout(timeout);reject(e)}
    request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains('audio'))db.createObjectStore('audio')};
    request.onerror=()=>fail(request.error);request.onblocked=()=>fail(Error('Cierra otras pestañas de la app e intenta guardar el audio de nuevo.'));
    request.onsuccess=()=>{
      const db=request.result;if(settled){db.close();return}db.onversionchange=()=>db.close();
      const tx=db.transaction('audio',action==='get'?'readonly':'readwrite'),store=tx.objectStore('audio');let op;
      try{op=action==='put'?store.put(blob,'orig:'+id):action==='delete'?store.delete('orig:'+id):store.get('orig:'+id)}catch(e){db.close();fail(e);return}
      tx.oncomplete=()=>{db.close();if(settled)return;settled=true;clearTimeout(timeout);resolve(op.result)};
      tx.onerror=tx.onabort=()=>{db.close();fail(tx.error||Error('No se pudo guardar el audio.'))};
    };
  });
}
const median=values=>{const a=[...values].sort((a,b)=>a-b);return a[a.length>>1]};
function smoothPitch(readings){
  const raw=readings.map(d=>({...d}));
  // Borra excursiones de octava que regresan antes de 120 ms.
  for(let i=1;i<raw.length-1;i++){
    if(raw[i].m==null||raw[i-1].m==null||Math.abs(Math.abs(raw[i].m-raw[i-1].m)-12)>.7)continue;
    for(let j=i+1;j<raw.length&&raw[j].t-raw[i].t<.12;j++)if(raw[j].m!=null&&Math.abs(raw[j].m-raw[i-1].m)<.5){for(let k=i;k<j;k++){raw[k].m=null;raw[k].octave=true}break}
  }
  return raw.map((d,i)=>{
    if(d.m==null)return d;
    const window=raw.slice(Math.max(0,i-2),i+3).filter(v=>v.m!=null).map(v=>v.m);
    return{...d,m:median(window)};
  });
}
function segmentPitch(readings,bpm=90,hop=.03){
  const data=smoothPitch(readings),notes=[];let current=null;
  const close=()=>{if(current&&current.last-current.t0+hop>=.12-1e-6){const m=Math.round(median(current.values)),t1=current.last+hop;notes.push({m,t0:Math.max(0,current.t0),t1,d:Math.max(.5,Math.round((t1-current.t0)*bpm/60*2)/2),cont:false})}current=null};
  for(const d of data){
    if(d.octave){if(current)current.last=d.t;continue}
    if(d.m==null){if(current&&d.t-current.last>.065)close();continue}
    if(current&&(d.t-current.last>.075||Math.abs(d.m-median(current.values))>.5))close();
    if(!current)current={t0:d.t,last:d.t,values:[]};current.last=d.t;current.values.push(d.m);
  }
  close();return notes;
}
/* RBJ biquads, idénticos al pasaaltas/pasabajas de Web Audio. También se usan
   en Node para probar el canal central sin depender de un navegador. */
function biquad(samples,sr,f,type){
  const w=2*Math.PI*f/sr,c=Math.cos(w),a=Math.sin(w)/(2*Math.SQRT1_2),a0=1+a;
  const b0=(type==='high'?(1+c):(1-c))/2/a0,b1=(type==='high'?-(1+c):1-c)/a0,b2=b0,a1=-2*c/a0,a2=(1-a)/a0;
  const out=new Float32Array(samples.length);let x1=0,x2=0,y1=0,y2=0;
  for(let i=0;i<samples.length;i++){const x=samples[i],y=b0*x+b1*x1+b2*x2-a1*y1-a2*y2;out[i]=y;x2=x1;x1=x;y2=y1;y1=y}return out;
}
function centerSamples(channels){const left=channels[0],right=channels[1]||left,out=new Float32Array(left.length);for(let i=0;i<out.length;i++)out[i]=(left[i]+right[i])/2;return out}
function prepareSamples(channels,sr){return biquad(biquad(centerSamples(channels),sr,150,'high'),sr,1100,'low')}
async function prepareAudio(buffer){
  const C=window.OfflineAudioContext||window.webkitOfflineAudioContext;
  if(!C)return prepareSamples(Array.from({length:Math.min(2,buffer.numberOfChannels)},(_,i)=>buffer.getChannelData(i)),buffer.sampleRate);
  const c=new C(1,buffer.length,buffer.sampleRate),mono=c.createBuffer(1,buffer.length,buffer.sampleRate);
  mono.copyToChannel(centerSamples(Array.from({length:Math.min(2,buffer.numberOfChannels)},(_,i)=>buffer.getChannelData(i))),0);
  const source=c.createBufferSource(),high=c.createBiquadFilter(),low=c.createBiquadFilter();source.buffer=mono;high.type='highpass';high.frequency.value=150;high.Q.value=Math.SQRT1_2;low.type='lowpass';low.frequency.value=1100;low.Q.value=Math.SQRT1_2;source.connect(high).connect(low).connect(c.destination);source.start();return(await c.startRendering()).getChannelData(0);
}
async function extractMelody(samples,sr,bpm,{signal,onProgress}={}){
  const readings=[],hop=Math.round(sr*.03),window=2048;let clear=0;
  for(let offset=0;offset+window<=samples.length;offset+=hop){
    if(signal?.aborted)throw new DOMException('Cancelado','AbortError');
    const p=detectPitch(samples.subarray(offset,offset+window),sr),ok=p&&p.c>.75;
    readings.push({t:offset/sr,m:ok?f2m(p.f):null,rms:p?.rms||0});if(ok)clear++;
    if(readings.length%80===0){onProgress?.(offset/samples.length);await new Promise(r=>setTimeout(r,0))}
  }
  onProgress?.(1);return{notes:segmentPitch(readings,bpm,hop/sr),confidence:readings.length?clear/readings.length:0,duration:samples.length/sr,readings};
}
/* Si faltan notas, se divide la última entre las sílabas restantes; los tiempos
   siempre permanecen dentro de la nota original, sin objetivos superpuestos. */
function assignNotes(notes,count){
  if(!notes.length||!count)return[];const out=notes.map(n=>({...n,cont:false}));
  if(out.length<count){const last=out.pop(),n=count-out.length,hasTime=Number.isFinite(last.t0)&&Number.isFinite(last.t1);for(let j=0;j<n;j++)out.push({...last,d:Math.max(.5,Math.round(last.d/n*2)/2),...(hasTime?{t0:last.t0+(last.t1-last.t0)*j/n,t1:last.t0+(last.t1-last.t0)*(j+1)/n}:{}),cont:false})}
  return out.map((n,i)=>({...n,cont:i>0&&Math.floor(i*count/out.length)===Math.floor((i-1)*count/out.length)}));
}
function distributeNotes(notes,counts){
  const all=assignNotes(notes,counts.reduce((a,b)=>a+b,0)),out=counts.map(()=>[]);let li=0,si=-1;
  for(const n of all){if(!n.cont)si++;while(li<counts.length-1&&si>=counts[li]){si-=counts[li];li++}out[li].push(n)}return out;
}
function timedSongSpec(song,buffer,{volume=.65,side=false}={}){
  const T0=AC.currentTime+.5,targets=[],lines=[],segs=[];let source=null,gain=null;
  (song.recording.notes||[]).forEach((notes,li)=>{let si=-1;notes.forEach(n=>{if(n.m==null)return;if(!n.cont)si++;if(!Number.isFinite(n.t0)||!Number.isFinite(n.t1))return;targets.push({...n,t0:T0+n.t0,t1:T0+n.t1,beats:n.d,li,si,n:0,h:0,ph:'S',syl:n.cont?'':song.lines[li]?.syl[si]?.x||''})});if(notes.length)lines.push({li,t0:T0+notes[0].t0,t1:T0+notes.at(-1).t1})});
  if(!targets.length)throw Error('Esta canción no tiene tiempos de grabación. Extrae la melodía de nuevo.');
  // las notas que el detector mandó una octava arriba o abajo se acomodan alrededor de la mediana
  const med=targets.map(g=>g.m).sort((a,b)=>a-b)[targets.length>>1];targets.forEach(g=>{while(g.m-med>7)g.m-=12;while(med-g.m>7)g.m+=12});
  let audio=buffer;
  if(side&&buffer.numberOfChannels>=2){audio=AC.createBuffer(2,buffer.length,buffer.sampleRate);const L=buffer.getChannelData(0),R=buffer.getChannelData(1);for(let c=0;c<2;c++){const dst=audio.getChannelData(c);for(let i=0;i<dst.length;i++)dst[i]=(L[i]-R[i])*.5}}
  segs.push({t0:T0,t1:T0+buffer.duration,ph:'S'});
  return{octaveFree:true,targets,lines,segs,end:T0+buffer.duration,beat:60/song.bpm,tip:'Revisa las notas extraídas si la guía no coincide con la voz.',
    ev:[{t:T0,fn:t=>{source=AC.createBufferSource();source.buffer=audio;gain=AC.createGain();gain.gain.value=volume;source.connect(gain).connect(MASTER);source.start(t)}}],
    setVolume:v=>{volume=v;if(gain)gain.gain.value=v},cleanup:()=>{if(source){try{source.stop()}catch(e){}source.disconnect()}gain?.disconnect()}};
}
async function decodeSongFile(file,{signal,onStatus}={}){
  if(file.size>SONG_AUDIO_LIMIT)throw Error('Usa un archivo de hasta 80 MB. Puedes conservar la canción sin audio.');
  const ctx=ac();if(!ctx)throw Error('No se pudo iniciar el audio.');await ctx.resume();let buffer;
  try{buffer=await ctx.decodeAudioData(await file.arrayBuffer())}catch(error){
    if(signal?.aborted)throw new DOMException('Cancelado','AbortError');
    if(!/mp4|m4a|video/i.test(file.type+' '+file.name))throw Error('No se pudo leer este formato. Prueba con WAV o MP3.');
    onStatus?.('Leyendo el audio del video en tiempo real…');buffer=await decodeVideoAudio(file,signal);
  }
  if(signal?.aborted)throw new DOMException('Cancelado','AbortError');
  if(buffer.duration>SONG_MAX_SECONDS)throw Error('Usa una grabación de hasta 10 minutos.');return buffer;
}
function decodeVideoAudio(file,signal){
  return new Promise((resolve,reject)=>{
    const video=document.createElement('video'),url=URL.createObjectURL(file);video.hidden=true;video.playsInline=true;video.preload='auto';document.body.appendChild(video);
    let source,processor,gain,timer,done=false,chunks=[],samples=0;
    const cleanup=()=>{clearTimeout(timer);video.pause();video.removeAttribute('src');video.load();video.remove();URL.revokeObjectURL(url);source?.disconnect();processor?.disconnect();gain?.disconnect();signal?.removeEventListener('abort',abort)};
    const finish=(error)=>{if(done)return;done=true;cleanup();if(error){reject(error);return}const buffer=AC.createBuffer(2,Math.max(1,samples),AC.sampleRate);let offset=0;for(const pair of chunks){pair.forEach((x,c)=>buffer.copyToChannel(x,c,offset));offset+=pair[0].length}resolve(buffer)};
    const abort=()=>finish(new DOMException('Cancelado','AbortError'));signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted){abort();return}
    video.onerror=()=>finish(Error('Este navegador no puede leer el audio del video. Prueba con WAV o MP3.'));
    video.onloadedmetadata=async()=>{
      if(!Number.isFinite(video.duration)||video.duration>SONG_MAX_SECONDS){finish(Error('Usa un video de hasta 10 minutos.'));return}
      try{source=AC.createMediaElementSource(video);processor=AC.createScriptProcessor(4096,2,2);gain=AC.createGain();gain.gain.value=0;source.connect(processor).connect(gain).connect(AC.destination);
        processor.onaudioprocess=e=>{if(video.paused||done)return;const b=e.inputBuffer,pair=[new Float32Array(b.getChannelData(0)),new Float32Array(b.getChannelData(Math.min(1,b.numberOfChannels-1)))];chunks.push(pair);samples+=pair[0].length};
        await video.play();
      }catch(e){finish(Error('No se pudo leer el video. Prueba con WAV o MP3.'))}
    };
    video.onended=()=>finish();timer=setTimeout(()=>finish(Error('Se agotó el tiempo de lectura del video.')),Math.min(SONG_MAX_SECONDS*1000+15000,615000));video.src=url;
  });
}
