/* ---------- motor del estudio: búferes, reproducción con ciclo, metrónomo, grabación, importar y exportar ---------- */
const BUF=new Map();            // clipId → AudioBuffer
const PEAKS=new WeakMap();      // AudioBuffer → Float32Array de picos
const beatKey=(S,f)=>[f.id,f.parte,f.compases,f.prog||0,S.bpm,S.tono.pc,S.tono.minor?1:0,f.seed||7].join('|');
const RENDERS=new Map();        // beatKey → Promise(resultado de renderBeat)
function beatRender(S,f){const k=beatKey(S,f);if(!RENDERS.has(k))RENDERS.set(k,renderBeat({id:f.id,parte:f.parte,compases:f.compases,prog:f.prog||0,bpm:S.bpm,tono:S.tono,seed:f.seed||7,entrada:f.entrada}).catch(e=>{RENDERS.delete(k);throw e}));return RENDERS.get(k)}
async function ensureBuffers(S,onEach){
  const jobs=[];
  for(const t of S.pistas)for(const c of t.clips){if(BUF.has(c.id))continue;
    if(c.fuente.beat)jobs.push(beatRender(S,c.fuente.beat).then(r=>{const b=r[c.fuente.beat.rol];if(b){BUF.set(c.id,b);if(!c.dur)c.dur=r.dur}onEach&&onEach(c)}));
    else if(c.fuente.audio)jobs.push(audGet(c.fuente.audio).then(async blob=>{if(!blob)return;const b=await ac().decodeAudioData(await blob.arrayBuffer());BUF.set(c.id,b);onEach&&onEach(c)}).catch(()=>{}));}
  await Promise.all(jobs);
}
function peaks(buf){
  if(PEAKS.has(buf))return PEAKS.get(buf);
  const n=Math.max(64,Math.min(4000,Math.round(buf.duration*120))),out=new Float32Array(n),ch=[...Array(buf.numberOfChannels)].map((_,i)=>buf.getChannelData(i)),step=buf.length/n;
  for(let i=0;i<n;i++){let m=0;const a=Math.floor(i*step),b=Math.floor((i+1)*step);for(let j=a;j<b;j+=4)for(const d of ch){const v=Math.abs(d[j]);if(v>m)m=v}out[i]=m}
  let mx=0;for(const v of out)mx=Math.max(mx,v);if(mx>0)for(let i=0;i<n;i++)out[i]/=mx;PEAKS.set(buf,out);return out;
}
/* ---------- cadena de cada pista y master ---------- */
const E={S:null,playing:false,segs:[],nodes:[],chains:new Map(),master:null,cursor:0,loop:{on:false,a:0,b:8},timer:null,rec:null,ticks:[]};
function buildMaster(c,dest){
  const g=c.createGain(),comp=c.createDynamicsCompressor(),an=c.createAnalyser();comp.threshold.value=-8;comp.ratio.value=4;comp.attack.value=.004;comp.release.value=.15;an.fftSize=1024;
  g.connect(comp);comp.connect(an);an.connect(dest);const rev=RokaAudio.reverb(c,g,1);return{g,comp,an,rev};
}
function buildChain(c,M,t,S){
  const g=c.createGain(),pan=c.createStereoPanner?c.createStereoPanner():c.createGain(),lo=c.createBiquadFilter(),mid=c.createBiquadFilter(),hi=c.createBiquadFilter(),send=c.createGain(),an=c.createAnalyser();
  lo.type='lowshelf';lo.frequency.value=220;mid.type='peaking';mid.frequency.value=1200;mid.Q.value=.9;hi.type='highshelf';hi.frequency.value=4500;an.fftSize=512;
  g.connect(pan);pan.connect(lo);lo.connect(mid);mid.connect(hi);hi.connect(M.g);hi.connect(send);send.connect(M.rev);hi.connect(an);
  const ch={g,pan,lo,mid,hi,send,an};applyChain(ch,t,S||E.S);return ch;
}
const soloOn=S=>S.pistas.some(p=>p.solo);
const audible=(S,t)=>!t.mute&&(!soloOn(S)||t.solo);
function applyChain(ch,t,S){
  const c=ch.g.context,now=c.currentTime||0;ch.g.gain.setTargetAtTime(audible(S,t)?t.vol:0,now,.01);if(ch.pan.pan)ch.pan.pan.setTargetAtTime(t.pan,now,.01);
  ch.lo.gain.value=t.eq[0];ch.mid.gain.value=t.eq[1];ch.hi.gain.value=t.eq[2];ch.send.gain.value=t.rev;
}
function chainsFor(S){
  const c=ac();if(!E.master){E.master=buildMaster(c,c.destination)}E.master.g.gain.value=S.master.vol;
  for(const t of S.pistas){if(!E.chains.has(t.id))E.chains.set(t.id,buildChain(c,E.master,t,S));else applyChain(E.chains.get(t.id),t,S)}
  return E.chains;
}
function refreshMix(){if(!E.S)return;chainsFor(E.S)}
/* ---------- transporte ---------- */
const songEnd=S=>Math.max(0,...S.pistas.flatMap(t=>t.clips.map(c=>c.inicio+c.dur)));
const beatDur=S=>60/S.bpm,barDur=S=>beatDur(S)*S.compas;
function position(){
  if(!E.playing)return E.cursor;const now=ac().currentTime;
  for(let i=E.segs.length-1;i>=0;i--){const s=E.segs[i];if(now>=s.ac0)return Math.min(s.pos1,s.pos0+(now-s.ac0))}
  return E.segs.length?E.segs[0].pos0:E.cursor;
}
function scheduleSegment(S,pos0,ac0,pos1){
  const c=ac(),ch=chainsFor(S);
  for(const t of S.pistas){const tc=ch.get(t.id);for(const cl of t.clips){const b=BUF.get(cl.id);if(!b)continue;
    const a=Math.max(pos0,cl.inicio),z=Math.min(pos1,cl.inicio+cl.dur);if(z<=a+.005)continue;
    const src=c.createBufferSource();src.buffer=b;src.connect(tc.g);src.start(ac0+(a-pos0),cl.offset+(a-cl.inicio),z-a);E.nodes.push(src)}}
  if(DB.metro){const bd=beatDur(S);for(let k=Math.ceil(pos0/bd-1e-6);k*bd<pos1-1e-6;k++)tickAt(ac0+(k*bd-pos0),k%S.compas===0)}
  E.segs.push({ac0,pos0,pos1});
}
function tickAt(t,strong){const c=ac(),o=c.createOscillator(),g=c.createGain();o.frequency.value=strong?1760:1180;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(strong?.35:.22,t+.002);g.gain.exponentialRampToValueAtTime(.0001,t+.05);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+.06);E.nodes.push(o)}
function play(S,from,lead){
  stop(true);E.S=S;const c=ac();c.resume();E.playing=true;E.segs=[];
  const pos=from!=null?from:E.cursor,ac0=c.currentTime+.08+(lead||0),end=E.loop.on?E.loop.b:Math.max(songEnd(S),pos+.1);
  if(E.loop.on&&(pos<E.loop.a||pos>=E.loop.b)){scheduleSegment(S,E.loop.a,ac0,E.loop.b)}else scheduleSegment(S,pos,ac0,end);
  E.timer=setInterval(()=>pump(S),25);document.dispatchEvent(new CustomEvent('transport'));
}
function pump(S){
  if(!E.playing)return;const c=ac(),last=E.segs[E.segs.length-1],lastEndAC=last.ac0+(last.pos1-last.pos0);
  if(E.loop.on&&c.currentTime>lastEndAC-.3&&!last.next){last.next=1;scheduleSegment(S,E.loop.a,lastEndAC,E.loop.b);if(E.segs.length>6)E.segs.splice(0,E.segs.length-4)}
  if(!E.loop.on&&c.currentTime>lastEndAC+.15&&!E.rec){E.cursor=last.pos1>=songEnd(S)-.01?0:last.pos1;stop()}
}
function stop(silent){
  if(E.timer)clearInterval(E.timer);E.timer=null;
  if(E.playing&&!silent)E.cursor=position();
  for(const n of E.nodes){try{n.stop()}catch(e){}}E.nodes=[];E.playing=false;E.segs=[];
  if(!silent)document.dispatchEvent(new CustomEvent('transport'));
}
/* ---------- grabación con micrófono (sin cancelación de eco) ---------- */
async function recStart(S,onDone){
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){toast('Este navegador no permite usar el micrófono aquí.');return false}
  let stream;try{try{navigator.audioSession&&(navigator.audioSession.type='play-and-record')}catch(e){}
    stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}})}catch(e){toast(e&&e.name==='NotAllowedError'?'El micrófono está bloqueado: permítelo en los ajustes del navegador.':'No se pudo abrir el micrófono.');return false}
  const c=ac(),src=c.createMediaStreamSource(stream),sp=c.createScriptProcessor(4096,1,1),mute=c.createGain();mute.gain.value=0;
  const R=E.rec={stream,src,sp,chunks:[],t0:null,onDone,level:0};
  sp.onaudioprocess=e=>{const d=e.inputBuffer.getChannelData(0);if(!E.playing)return;if(R.t0==null)R.t0=e.playbackTime-e.inputBuffer.duration;R.chunks.push(new Float32Array(d));let m=0;for(let i=0;i<d.length;i+=8)m=Math.max(m,Math.abs(d[i]));R.level=m};
  src.connect(sp);sp.connect(mute);mute.connect(c.destination);
  // cuenta de un compás antes de grabar
  const lead=DB.count?barDur(S):0;if(lead){const t=c.currentTime+.08;for(let k=0;k<S.compas;k++)tickAt(t+k*beatDur(S),k===0)}
  E.recFrom=E.cursor;play(S,E.cursor,lead);
  return true;
}
async function recStop(S){
  const R=E.rec;if(!R)return null;E.rec=null;const posAtT0=R.t0==null?E.recFrom:posAt(R.t0);stop();
  R.stream.getTracks().forEach(t=>t.stop());try{R.src.disconnect();R.sp.disconnect()}catch(e){}
  try{navigator.audioSession&&(navigator.audioSession.type='playback')}catch(e){}
  const len=R.chunks.reduce((a,b)=>a+b.length,0);if(len<ac().sampleRate*.3)return null;
  const buf=ac().createBuffer(1,len,ac().sampleRate),d=buf.getChannelData(0);let o=0;for(const ch of R.chunks){d.set(ch,o);o+=ch.length}
  const comp=outLat()+.012+(+DB.recOff||0)/1000,start=Math.max(0,posAtT0-comp);
  return{buf,start};
}
// posición de la canción para un instante del reloj de audio (usa los tramos programados)
function posAt(t){for(let i=E.segs.length-1;i>=0;i--){const s=E.segs[i];if(t>=s.ac0)return s.pos0+(t-s.ac0)}return E.segs.length?E.segs[0].pos0-(E.segs[0].ac0-t):E.cursor}
/* ---------- WAV ---------- */
function wavBlob(buf){
  const ch=buf.numberOfChannels,n=buf.length,sr=buf.sampleRate,data=new DataView(new ArrayBuffer(44+n*ch*2));let p=0;
  const w=s=>{for(const x of s)data.setUint8(p++,x.charCodeAt(0))},u32=v=>{data.setUint32(p,v,true);p+=4},u16=v=>{data.setUint16(p,v,true);p+=2};
  w('RIFF');u32(36+n*ch*2);w('WAVE');w('fmt ');u32(16);u16(1);u16(ch);u32(sr);u32(sr*ch*2);u16(ch*2);u16(16);w('data');u32(n*ch*2);
  const cs=[...Array(ch)].map((_,i)=>buf.getChannelData(i));for(let i=0;i<n;i++)for(let k=0;k<ch;k++){const v=Math.max(-1,Math.min(1,cs[k][i]));data.setInt16(p,v<0?v*32768:v*32767,true);p+=2}
  return new Blob([data],{type:'audio/wav'});
}
async function exportMix(S,soloTrack){
  const end=songEnd(S);if(!end)throw Error('La sesión está vacía.');
  const sr=44100,c=new OfflineAudioContext(2,Math.ceil((end+1.5)*sr),sr),M=buildMaster(c,c.destination);M.g.gain.value=S.master.vol;
  for(const t of S.pistas){if(soloTrack?t.id!==soloTrack:!audible(S,t))continue;const ch=buildChain(c,M,soloTrack?Object.assign({},t,{mute:false,solo:false}):t,S);
    if(soloTrack)ch.g.gain.value=t.vol;
    for(const cl of t.clips){const b=BUF.get(cl.id);if(!b)continue;const s=c.createBufferSource();s.buffer=b;s.connect(ch.g);s.start(cl.inicio,cl.offset,cl.dur)}}
  return wavBlob(await c.startRendering());
}
function download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},2000)}
