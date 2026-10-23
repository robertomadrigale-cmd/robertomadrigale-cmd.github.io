/* ---------- motor de audio (de Roka Guitar, sin la guitarra) ---------- */
let AC=null,MASTER=null,REV=null,UNLOCKED=false,NOISE=null;
function ac(){
  try{
    if(!AC){
      const C=window.AudioContext||window.webkitAudioContext;
      AC=new C({latencyHint:'interactive'});
      const comp=AC.createDynamicsCompressor();comp.threshold.value=-6;comp.ratio.value=3;comp.knee.value=10;comp.attack.value=.006;comp.release.value=.2;
      MASTER=AC.createGain();MASTER.gain.value=.85;MASTER.connect(comp);comp.connect(AC.destination);
      // sala corta generada (sin archivos): le da aire al piano guía
      try{const sr=AC.sampleRate,n=Math.floor(sr*1.6),ir=AC.createBuffer(2,n,sr);for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,3.4)}
        REV=AC.createConvolver();REV.buffer=ir;const rg=AC.createGain();rg.gain.value=.18;REV.connect(rg);rg.connect(MASTER)}catch(e){REV=null}
    }
    if(AC.state!=='running')AC.resume();
    return AC;
  }catch(e){return null}
}
/* En iPhone el modo silencio apaga el audio web; reproducir un <audio> mudo lo cambia a modo "reproducción". */
function unlockAudio(){
  if(UNLOCKED)return;UNLOCKED=true;
  try{if(navigator.audioSession)navigator.audioSession.type='play-and-record'}catch(e){}
  try{const a=new Audio('data:audio/wav;base64,__SILENT__');a.setAttribute('playsinline','');a.play().catch(()=>{})}catch(e){}
  const c=ac();
  if(c){try{const b=c.createBuffer(1,1,22050),s=c.createBufferSource();s.buffer=b;s.connect(c.destination);s.start(0)}catch(e){}}
}
['pointerdown','touchend','keydown'].forEach(ev=>document.addEventListener(ev,unlockAudio,{capture:true,passive:true}));
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&AC&&AC.state!=='running')AC.resume()});
const out=()=>MASTER;
// retraso del sonido + ajuste manual (audífonos Bluetooth; Safari no informa ese retraso)
const outLat=()=>AC?Math.min(.8,(AC.outputLatency||0)+(AC.baseLatency||0)+(+DB.lat||0)/1000):0;
/* Piano guía: armónicos que se apagan como una cuerda golpeada; suave y claro para cantar encima. */
function piano(m,t,d,v){
  const c=AC,f=m2f(m),g=c.createGain(),lp=c.createBiquadFilter();v=v||.22;
  lp.type='lowpass';lp.frequency.value=Math.min(9000,f*7);lp.Q.value=.3;
  [[1,1,'sine'],[2,.42,'sine'],[3,.18,'triangle'],[4,.08,'sine']].forEach(([h,a,type])=>{const o=c.createOscillator(),og=c.createGain();o.type=type;o.frequency.value=f*h;o.detune.value=h>1?(h-1)*1.5:0;og.gain.value=a;o.connect(og);og.connect(lp);o.start(t);o.stop(t+d+.4)});
  const end=t+d;
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.006);g.gain.exponentialRampToValueAtTime(v*.45,t+.35);
  g.gain.setTargetAtTime(v*.22,t+.35,Math.max(.2,d*.6));g.gain.setTargetAtTime(.0001,end,.08);
  lp.connect(g);g.connect(out());if(REV){const s=c.createGain();s.gain.value=.5;g.connect(s);s.connect(REV)}
}
/* Voz guía sostenida: tono suave con vibrato ligero, como un «uuu». */
function guideTone(m,t,d,v,m2){
  const c=AC,f=m2f(m),o=c.createOscillator(),o2=c.createOscillator(),g=c.createGain(),lfo=c.createOscillator(),lg=c.createGain();v=v||.16;
  o.type="sine";o2.type="triangle";[o,o2].forEach(x=>{x.frequency.setValueAtTime(f,t);if(m2!=null)x.frequency.exponentialRampToValueAtTime(m2f(m2),t+d)});
  lfo.frequency.value=5.2;lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(f*.004,t+Math.min(.6,d*.6));lfo.connect(lg);lg.connect(o.frequency);lg.connect(o2.frequency);
  const g2=c.createGain();g2.gain.value=.35;o2.connect(g2);g2.connect(g);o.connect(g);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.06);g.gain.setValueAtTime(v,Math.max(t+.06,t+d-.08));g.gain.exponentialRampToValueAtTime(.0001,t+d+.04);
  g.connect(out());if(REV){const s=c.createGain();s.gain.value=.35;g.connect(s);s.connect(REV)}
  [o,o2,lfo].forEach(x=>{x.start(t);x.stop(t+d+.1)});
}
// acorde de piano bajito: raíz, tercera y quinta (menor si minor)
function chordPad(root,t,d,v,minor){[0,minor?3:4,7].forEach((s,i)=>piano(root+s,t+i*.012,d,(v||.08)))}
function noiseBuf(){
  if(NOISE)return NOISE;
  const b=AC.createBuffer(1,AC.sampleRate*.6,AC.sampleRate),d=b.getChannelData(0);
  for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  return NOISE=b;
}
function tickSound(t,kind){
  const o=AC.createOscillator(),g=AC.createGain();
  o.type='sine';o.frequency.value=kind==='acc'?1760:kind==='beat'?1180:880;
  const v=kind==='acc'?.5:kind==='beat'?.32:.16;
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.002);g.gain.exponentialRampToValueAtTime(.0001,t+.05);
  o.connect(g);g.connect(out());o.start(t);o.stop(t+.06);
}
function bell(){if(!ac())return;const t=AC.currentTime+.02;[72,79,84].forEach((m,i)=>piano(m,t+i*.16,1.2,.16))}
function playNote(m,d){if(!ac())return;piano(m,AC.currentTime+.02,d||1.2,.24)}
/* ---------- secuenciador (metrónomo) ---------- */
const SEQ={id:null,label:'',timer:null,next:0,step:0,dur:null,on:null,ui:null};
function seqStart(id,label,getDur,onStep,ui){
  seqStop(true);
  const c=ac();if(!c)return false;
  Object.assign(SEQ,{id,label,step:0,next:c.currentTime+.1,dur:getDur,on:onStep,ui});
  seqPump();SEQ.timer=setInterval(seqPump,25);
  wake(true);emitState();return true;
}
function seqPump(){
  if(!SEQ.id)return;
  if(SEQ.next<AC.currentTime-.05)SEQ.next=AC.currentTime+.03; // si el teléfono se atrasó, no amontones golpes
  while(SEQ.next<AC.currentTime+.22){
    const s=SEQ.step,t=SEQ.next;
    SEQ.on(s,t);
    if(SEQ.ui){const d=Math.max(0,(t-AC.currentTime+outLat())*1000);setTimeout(()=>{if(SEQ.id&&SEQ.ui)SEQ.ui(s)},d)}
    SEQ.next+=SEQ.dur();SEQ.step++;
  }
}
function seqStop(silent){
  if(SEQ.timer)clearInterval(SEQ.timer);
  SEQ.timer=null;SEQ.id=null;SEQ.ui=null;
  if(!silent){wake(false);emitState()}
}
const METERS={'2/4':{b:2,acc:[0]},'3/4':{b:3,acc:[0]},'4/4':{b:4,acc:[0]},'6/8':{b:6,acc:[0,3]}};
const MET={bpm:80,meter:'4/4',sub:1};
function metStart(opts,ui){
  Object.assign(MET,opts||{});
  return seqStart('met','Metrónomo '+MET.bpm,()=>60/MET.bpm/MET.sub,(s,t)=>{
    const m=METERS[MET.meter],isBeat=s%MET.sub===0,b=Math.floor(s/MET.sub)%m.b;
    tick(t,isBeat?(m.acc.includes(b)?'acc':'beat'):'sub',isBeat?(b===0?'bar':'beat'):null);
  },s=>{if(ui)ui(Math.floor(s/MET.sub)%METERS[MET.meter].b,s%MET.sub===0)});
}
/* ---------- pantalla encendida ---------- */
let WL=null,WAKE=0;
async function wake(on){
  try{
    const need=on||SEQ.id||WAKE;
    if(need&&!WL&&navigator.wakeLock){WL=await navigator.wakeLock.request('screen');WL.addEventListener('release',()=>{WL=null})}
    else if(!need&&WL){await WL.release();WL=null}
  }catch(e){WL=null}
}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&(SEQ.id||WAKE))wake(true)});
function emitState(){document.dispatchEvent(new CustomEvent('playstate'))}
