/* Manifiestos ampliables; no se copian muestras ni se cambia su licencia. */
const PACKS = {
  guitarra:{id:'guitarra',nombre:'Guitarra acústica',autor:'Nicholaus Brosowsky',licencia:'CC BY 3.0',url:'https://github.com/nbrosowsky/tonejs-instruments',credito:'tonejs-instruments. Recortes a 3 s, mono, MP3 64 kbps; afinación corregida al reproducir.',tipo:'instrumento',base:'../samples/',notas:Object.fromEntries([
    ['D2',38,2],['E2',40,-3],['Fs2',42,1],['Gs2',44,-5],['As2',46,2],['C3',48,-4],['D3',50,2],['E3',52,-3],['Fs3',54,3],['Gs3',56,-13],['As3',58,11],['C4',60,6],['D4',62,2],['E4',64,-3],['Fs4',66,17],['Gs4',68,3],['As4',70,11],['C5',72,6],['D5',74,-21]
  ].map(([n,m,cents])=>[m,{archivo:'g-'+n+'.mp3',cents}]))},
  bajo:{id:'bajo',nombre:'Bajo eléctrico',autor:'Nicholaus Brosowsky',licencia:'CC BY 3.0',url:'https://github.com/nbrosowsky/tonejs-instruments',credito:'tonejs-instruments. Recortes a 2.4 s, mono, MP3 56 kbps; afinación corregida al reproducir.',tipo:'instrumento',base:'../samples/',notas:Object.fromEntries([
    ['E1',28,7],['G1',31,-4],['As1',34,2],['Cs2',37,1],['E2',40,-3],['G2',43,0],['As2',46,2],['Cs3',49,1],['E3',52,-3],['G3',55,8]
  ].map(([n,m,cents])=>[m,{archivo:'b-'+n+'.mp3',cents}]))},
  bateria:{id:'bateria',nombre:'Black Pearl · AVL Drumkits',autor:'Glen MacArthur',licencia:'CC BY-SA 3.0',url:'https://www.bandshed.net/avldrumkits/',credito:'19 golpes. Capas de fuerza seleccionadas, recortes de 0.2–2.2 s con desvanecido, normalización, mono, MP3 64 kbps. Las muestras modificadas conservan CC BY-SA 3.0.',tipo:'bateria',base:'../samples/',golpes:Object.fromEntries('kick1 kick2 snare1 snare2 rim hat1 hat2 hatp hato ride bell crash tom ftom clap tamb cow mara click'.split(' ').map(n=>[n,'d-'+n+'.mp3']))}
};
const SAMPLE_CACHE='roka-estudio-muestras-v1';
const loadedPacks=new Map(), pendingPacks=new Map();
async function loadPack(id) {
  if(loadedPacks.has(id)) return loadedPacks.get(id);
  if(pendingPacks.has(id)) return pendingPacks.get(id);
  const manifest=PACKS[id]; if(!manifest) throw Error('Pack desconocido: '+id);
  const job=(async()=>{
    const ctx=ac(), samples={}; let cache;
    try { if(globalThis.caches) cache=await caches.open(SAMPLE_CACHE); } catch(_) {}
    const entries=Object.entries(manifest.notas||manifest.golpes);
    // Cuatro decodificaciones simultáneas como máximo en teléfonos.
    let cursor=0;
    await Promise.all(Array.from({length:4},async()=>{
      while(cursor<entries.length) {
        const [key,value]=entries[cursor++], meta=typeof value==='string'?{archivo:value,cents:0}:value;
        const url=new URL(manifest.base+meta.archivo,document.baseURI).href;
        let response=cache && await cache.match(url);
        if(!response) { response=await fetch(url); if(!response.ok) throw Error('No se pudo cargar '+meta.archivo); if(cache) await cache.put(url,response.clone()); }
        const buf=await ctx.decodeAudioData(await response.arrayBuffer());
        const d=buf.getChannelData(0), limit=Math.min(d.length,buf.sampleRate*.35|0);
        let peak=0; for(let i=0;i<limit;i++) peak=Math.max(peak,Math.abs(d[i]));
        if(peak<.00001) throw Error('Muestra vacía: '+meta.archivo);
        let onset=0; while(onset<limit && Math.abs(d[onset])<peak*.06) onset++;
        samples[key]={buf,off:Math.max(0,onset-24)/buf.sampleRate,norm:.5/peak,cents:meta.cents||0};
      }
    }));
    const pack={manifest,samples}; loadedPacks.set(id,pack); return pack;
  })();
  pendingPacks.set(id,job);
  try { return await job; } finally { pendingPacks.delete(id); }
}
function sampleVoice(sample,midiDelta,t,dur,vel,options={}) {
  const c=options.context||ac(), destination=options.destination||c.destination;
  t=Math.max(t,c.currentTime||0); // la humanización nunca debe mandar una nota antes de tiempo cero
  const src=c.createBufferSource(), gain=c.createGain(), filter=c.createBiquadFilter();
  src.buffer=sample.buf; src.playbackRate.value=2**((midiDelta-sample.cents/100)/12);
  const length=Math.max(.01,Math.min(dur,(sample.buf.duration-sample.off)/src.playbackRate.value));
  const end=t+length, release=Math.min(.07,length*.25);
  gain.gain.setValueAtTime(0,t); gain.gain.linearRampToValueAtTime(Math.max(0,vel)*sample.norm,t+.001);
  gain.gain.setValueAtTime(Math.max(0,vel)*sample.norm,Math.max(t+.001,end-release)); gain.gain.linearRampToValueAtTime(0,end);
  filter.type='lowpass'; filter.frequency.value=options.lowpass||10000;
  src.connect(filter); filter.connect(gain);
  let output=gain;
  if(c.createStereoPanner) { const p=c.createStereoPanner(); p.pan.value=options.pan||0; gain.connect(p); output=p; }
  output.connect(destination);
  if(options.wet>0 && options.reverb) { const send=c.createGain(); send.gain.value=options.wet; output.connect(send); send.connect(options.reverb); }
  src.start(t,sample.off); src.stop(end+.002); return {source:src,gain,end};
}
function playSample(pack,nota,t,dur,vel,options={}) {
  const p=typeof pack==='string'?loadedPacks.get(pack):pack;
  if(!p) throw Error('Carga el pack antes de tocarlo.');
  const keys=Object.keys(p.samples).map(Number), nearest=keys.reduce((a,b)=>Math.abs(b-nota)<Math.abs(a-nota)?b:a);
  return sampleVoice(p.samples[nearest],nota-nearest,t,dur,vel,options);
}
function drumHit(nombre,t,vel=.7,options={}) {
  const p=loadedPacks.get(options.pack||'bateria'), s=p && p.samples[nombre];
  if(!s) throw Error('Golpe no disponible: '+nombre);
  return sampleVoice(s,0,t,s.buf.duration,vel,options);
}
