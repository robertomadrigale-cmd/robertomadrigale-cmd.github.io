/* ---------- motor de audio ---------- */
let AC=null,MASTER=null,REV=null,UNLOCKED=false,NOISE=null;
function ac(){
  try{
    if(!AC){
      const C=window.AudioContext||window.webkitAudioContext;
      AC=new C({latencyHint:'interactive'});
      const comp=AC.createDynamicsCompressor();comp.threshold.value=-12;comp.ratio.value=4;
      MASTER=AC.createGain();MASTER.gain.value=.85;MASTER.connect(comp);comp.connect(AC.destination);
      // sala corta: le da cuerpo a la guitarra y al bajo grabados (impulso generado, sin archivos)
      try{const sr=AC.sampleRate,n=Math.floor(sr*1.4),ir=AC.createBuffer(2,n,sr);for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,3.2)}
        REV=AC.createConvolver();REV.buffer=ir;const rg=AC.createGain();rg.gain.value=.16;REV.connect(rg);rg.connect(MASTER)}catch(e){REV=null}
    }
    if(AC.state!=='running')AC.resume();
    return AC;
  }catch(e){return null}
}
/* En iPhone el modo silencio apaga el audio web; reproducir un <audio> mudo lo cambia a modo "reproducción". */
function unlockAudio(){
  if(UNLOCKED)return;UNLOCKED=true;
  try{if(navigator.audioSession)navigator.audioSession.type='playback'}catch(e){}
  try{const a=new Audio('data:audio/wav;base64,__SILENT__');a.setAttribute('playsinline','');a.play().catch(()=>{})}catch(e){}
  const c=ac();
  if(c)setTimeout(loadSamples,300);
  if(c){try{const b=c.createBuffer(1,1,22050),s=c.createBufferSource();s.buffer=b;s.connect(c.destination);s.start(0)}catch(e){}}
}
['pointerdown','touchend','keydown'].forEach(ev=>document.addEventListener(ev,unlockAudio,{capture:true,passive:true}));
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&AC&&AC.state!=='running')AC.resume()});
const out=()=>MASTER;
/* Cuerda pulsada (Karplus-Strong): un ruido corto que circula por un retardo filtrado suena como cuerda. */
const KS={};
function ksBuffer(m){
  if(KS[m])return KS[m];
  const sr=AC.sampleRate,f=440*Math.pow(2,(m-69)/12),N=Math.max(2,Math.round(sr/f)),len=Math.floor(sr*2.4);
  const b=AC.createBuffer(1,len,sr),d=b.getChannelData(0),ring=new Float32Array(N);
  for(let i=0;i<N;i++)ring[i]=Math.random()*2-1;
  for(let p=0;p<2;p++)for(let i=1;i<N;i++)ring[i]=(ring[i]+ring[i-1])*.5;
  const damp=m<52?.9993:m<64?.9988:.998;let idx=0,peak=0;
  for(let i=0;i<len;i++){const a=ring[idx],nx=ring[(idx+1)%N];ring[idx]=(a+nx)*.5*damp;d[i]=a;if(Math.abs(a)>peak)peak=Math.abs(a);idx=(idx+1)%N}
  const k=.6/(peak||1);for(let i=0;i<len;i++)d[i]*=k;
  return KS[m]={b,rate:(sr/N)/f};
}
function pluck(m,t,d,v,o){
  if(SMP.ready&&m>=37&&m<=79)return smpPlay('g',m,t,d,(v||.2)*1.15,o);
  const c=AC,K=ksBuffer(Math.round(m)),src=c.createBufferSource(),g=c.createGain(),lp=c.createBiquadFilter();
  src.buffer=K.b;src.playbackRate.value=K.rate;
  lp.type='lowpass';lp.frequency.value=m<55?3200:5200;lp.Q.value=.4;
  const vol=Math.min(1,(v||.2)*3.2),end=t+Math.min(d,2.3);
  g.gain.setValueAtTime(vol,t);g.gain.setValueAtTime(vol,Math.max(t,end-.12));g.gain.linearRampToValueAtTime(.0001,end);
  src.connect(lp);lp.connect(g);g.connect(out());src.start(t);src.stop(end+.02);
  return{g,end};
}
/* ---------- muestras reales: guitarra acústica y bajo eléctrico ----------
   Grabaciones de tonejs-instruments (Nicholaus Brosowsky, CC BY 3.0), recortadas. Una muestra cada tono entero
   (guitarra) o cada tercera menor (bajo); las notas intermedias se afinan con la velocidad de reproducción,
   corrigiendo los centésimos medidos de cada grabación. Si no cargan, la app usa la cuerda sintetizada. */
const SMP={ready:false,loading:null,g:{},b:{}};
const SMPLIST={g:[['D2',38,2],['E2',40,-3],['Fs2',42,1],['Gs2',44,-5],['As2',46,2],['C3',48,-4],['D3',50,2],['E3',52,-3],['Fs3',54,3],['Gs3',56,-13],['As3',58,11],['C4',60,6],['D4',62,2],['E4',64,-3],['Fs4',66,17],['Gs4',68,3],['As4',70,11],['C5',72,6],['D5',74,-21]],
  b:[['E1',28,7],['G1',31,-4],['As1',34,2],['Cs2',37,1],['E2',40,-3],['G2',43,0],['As2',46,2],['Cs3',49,1],['E3',52,-3],['G3',55,8]]};
function loadSamples(){
  if(SMP.loading)return SMP.loading;const c=ac();if(!c)return Promise.resolve(false);
  const dec=b=>new Promise((res,rej)=>{try{const p=c.decodeAudioData(b,res,rej);if(p&&p.catch)p.catch(rej)}catch(e){rej(e)}});
  const one=(k,[n,m,ct])=>fetch('samples/'+k+'-'+n+'.mp3').then(r=>{if(!r.ok)throw new Error(r.status);return r.arrayBuffer()}).then(dec).then(buf=>{
    const d=buf.getChannelData(0),sr=buf.sampleRate;let pk=0;for(let i=0,L=Math.min(d.length,sr*.35|0);i<L;i++){const a=Math.abs(d[i]);if(a>pk)pk=a}
    let on=0;const th=pk*.06;while(on<d.length&&Math.abs(d[on])<th)on++;
    SMP[k][m]={buf,off:Math.max(0,on-24)/sr,norm:.5/(pk||1),ct}});
  SMP.loading=Promise.all(['g','b'].flatMap(k=>SMPLIST[k].map(x=>one(k,x)))).then(()=>{SMP.ready=true;return true}).catch(()=>{SMP.loading=null;return false});
  return SMP.loading;
}
function smpPlay(k,m,t,d,v,o){
  o=o||{};const c=AC,tab=SMP[k];let best=null,bd=99;for(const key in tab){const dd=Math.abs(m-key);if(dd<bd){bd=dd;best=+key}}
  const S=tab[best],src=c.createBufferSource(),g=c.createGain(),lp=c.createBiquadFilter();
  src.buffer=S.buf;src.playbackRate.value=Math.pow(2,(m-best-S.ct/100)/12);
  // golpe suave = más opaco; golpe fuerte = más brillante
  lp.type='lowpass';lp.Q.value=.5;lp.frequency.value=o.lp||(k==='b'?2400:2200+Math.min(1,v*4)*7000);
  const vol=Math.min(1.4,v*S.norm*(k==='b'?2.0:3.4)),rel=o.rel||(k==='b'?.07:.12),end=t+Math.max(.04,Math.min(d,(S.buf.duration-S.off)/src.playbackRate.value-.05));
  g.gain.setValueAtTime(vol,t);g.gain.setValueAtTime(vol,Math.max(t,end-rel));g.gain.linearRampToValueAtTime(.0001,end);
  src.connect(lp);lp.connect(g);
  let node=g;if(o.pan&&c.createStereoPanner){const pn=c.createStereoPanner();pn.pan.value=o.pan;g.connect(pn);node=pn}
  node.connect(out());if(REV&&k==='g'){const sg=c.createGain();sg.gain.value=o.wet!=null?o.wet:.5;node.connect(sg);sg.connect(REV)}
  src.start(t,S.off);src.stop(end+.02);
  return{g,end};
}
// raw = la nota ya viene en el registro del bajo (E1–D♯3); si no, se baja de octava
function bassNote(m,t,d,v,raw){
  if(SMP.ready){let n=m;if(!raw)while(n>39)n-=12;smpPlay('b',n,t,Math.max(.12,d),(v||.4)*.9);return}
  if(raw)m+=12;
  const c=AC,f=440*Math.pow(2,(m-69)/12),o=c.createOscillator(),o2=c.createOscillator(),g=c.createGain(),lp=c.createBiquadFilter();
  o.type='sine';o2.type='triangle';o.frequency.value=f;o2.frequency.value=f;
  lp.type='lowpass';lp.frequency.value=900;
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v||.4,t+.012);g.gain.setValueAtTime(v||.4,t+d*.6);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  o.connect(g);o2.connect(lp);lp.connect(g);g.connect(out());o.start(t);o2.start(t);o.stop(t+d+.05);o2.stop(t+d+.05);
}
function noiseBuf(){
  if(NOISE)return NOISE;
  const b=AC.createBuffer(1,AC.sampleRate*.6,AC.sampleRate),d=b.getChannelData(0);
  for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  return NOISE=b;
}
function noise(t,dur,type,freq,v,q){
  const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();
  s.buffer=noiseBuf();f.type=type;f.frequency.value=freq;if(q)f.Q.value=q;
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  s.connect(f);f.connect(g);g.connect(out());s.start(t);s.stop(t+dur+.02);
}
function kick(t,v){
  const o=AC.createOscillator(),g=AC.createGain();
  o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(45,t+.12);
  g.gain.setValueAtTime(v||.9,t);g.gain.exponentialRampToValueAtTime(.0001,t+.32);
  o.connect(g);g.connect(out());o.start(t);o.stop(t+.35);
}
function snare(t,v){
  v=v||.45;noise(t,.18,'bandpass',1900,v,.8);
  const o=AC.createOscillator(),g=AC.createGain();o.type='triangle';o.frequency.setValueAtTime(210,t);o.frequency.exponentialRampToValueAtTime(140,t+.08);
  g.gain.setValueAtTime(v*.6,t);g.gain.exponentialRampToValueAtTime(.0001,t+.1);o.connect(g);g.connect(out());o.start(t);o.stop(t+.12);
}
const hat=(t,v,open)=>noise(t,open?.22:.045,'highpass',7500,v||.16);
const guiro=(t,long)=>{if(long){for(let i=0;i<5;i++)noise(t+i*.022,.02,'bandpass',3600,.11,2)}else noise(t,.03,'bandpass',3600,.13,2)};
function tickSound(t,kind){
  const o=AC.createOscillator(),g=AC.createGain();
  o.type='sine';o.frequency.value=kind==='acc'?1760:kind==='beat'?1180:880;
  const v=kind==='acc'?.55:kind==='beat'?.38:.18;
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.002);g.gain.exponentialRampToValueAtTime(.0001,t+.05);
  o.connect(g);g.connect(out());o.start(t);o.stop(t+.06);
}
function bell(){if(!ac())return;const t=AC.currentTime+.02;[76,83,88].forEach((m,i)=>pluck(m,t+i*.16,1.4,.22))}
function playNotes(list,mode,step){
  if(!ac())return;const t0=AC.currentTime+.03;
  list.forEach((m,i)=>pluck(m,t0+(mode==='chord'?i*.035:mode==='seq'?i*(step||.5):0),mode==='seq'?1.1:1.8,.2));
}
function playSeq(chords,beat){
  if(!ac())return;const t0=AC.currentTime+.05;
  chords.forEach((ch,i)=>ch.forEach((m,j)=>pluck(m,t0+i*beat+j*.04,beat*1.15,.17)));
}
function chordMidi(root,t){const rm=40+((root.pc-4+12)%12);return[...CT[t].semis.map(s=>rm+s),rm+12]}
/* ---------- secuenciador (metrónomo y pistas) ---------- */
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
    if(SEQ.ui){const d=Math.max(0,(t-AC.currentTime)*1000);setTimeout(()=>{if(SEQ.id&&SEQ.ui)SEQ.ui(s)},d)}
    SEQ.next+=SEQ.dur();SEQ.step++;
  }
}
function seqStop(silent){
  if(SEQ.timer)clearInterval(SEQ.timer);
  SEQ.timer=null;SEQ.id=null;SEQ.ui=null;
  if(!silent){wake(false);emitState()}
}
/* ---------- metrónomo ---------- */
const METERS={'2/4':{b:2,acc:[0]},'3/4':{b:3,acc:[0]},'4/4':{b:4,acc:[0]},'6/8':{b:6,acc:[0,3]}};
const MET={bpm:80,meter:'4/4',sub:1};
function metStart(opts,ui){
  Object.assign(MET,opts||{});
  return seqStart('met','Metrónomo '+MET.bpm,()=>60/MET.bpm/MET.sub,(s,t)=>{
    const m=METERS[MET.meter],isBeat=s%MET.sub===0,b=Math.floor(s/MET.sub)%m.b;
    tick(t,isBeat?(m.acc.includes(b)?'acc':'beat'):'sub',isBeat?(b===0?'bar':'beat'):null);
  },s=>{if(ui)ui(Math.floor(s/MET.sub)%METERS[MET.meter].b,s%MET.sub===0)});
}
/* ---------- pistas para improvisar ---------- */
const PROG2={
 blues:{n:'Blues de 12 compases',it:[[0,'dom7'],[0,'dom7'],[0,'dom7'],[0,'dom7'],[5,'dom7'],[5,'dom7'],[0,'dom7'],[0,'dom7'],[7,'dom7'],[5,'dom7'],[0,'dom7'],[7,'dom7']],sc:'bl',tip:'Pentatónica menor o blues de la tónica, aunque los acordes sean mayores.'},
 pop:{n:'I – V – vi – IV',it:[[0,'maj'],[7,'maj'],[9,'min'],[5,'maj']],sc:'pM',tip:'Pentatónica mayor de la tónica. Apunta a la raíz de cada acorde.'},
 menor:{n:'i – VI – III – VII (menor)',it:[[0,'min'],[8,'maj'],[3,'maj'],[10,'maj']],sc:'pm',tip:'Pentatónica menor de la tónica; añade la 2ª y la ♭6 para sonar eólico.'},
 andaluza:{n:'i – VII – VI – V (andaluza)',it:[[0,'min'],[10,'maj'],[8,'maj'],[7,'maj']],sc:'pm',tip:'Pentatónica menor; sobre el V toca su tercera mayor (un semitono bajo la tónica).'},
 ranchera:{n:'I – V7 – I – IV – V7 (ranchera)',it:[[0,'maj'],[7,'dom7'],[7,'dom7'],[0,'maj'],[0,'maj'],[5,'maj'],[7,'dom7'],[0,'maj']],sc:'M',tip:'Escala mayor. Las terceras y sextas en pares suenan a requinto.'},
 iivi:{n:'ii – V – I',it:[[2,'m7'],[7,'dom7'],[0,'maj7'],[0,'maj7']],sc:'M',tip:'Escala mayor de la tónica. Resuelve la 7ª de cada acorde un semitono abajo.'},
 dorico:{n:'Vamp dórico i – IV',it:[[0,'m7'],[5,'dom7']],sc:'dor',tip:'Dórico: pentatónica menor más la 2ª y la 6ª mayor.'}};
const STYLES={
 rock:{n:'Rock',steps:8,meter:4,bpm:96},
 balada:{n:'Balada',steps:8,meter:4,bpm:72},
 cumbia:{n:'Cumbia',steps:8,meter:4,bpm:92},
 ranchera:{n:'Ranchera 3/4',steps:6,meter:3,bpm:120}};
const SCALES2={bl:{semis:[0,3,5,6,7,10],n:'Blues'},pm:{semis:[0,3,5,7,10],n:'Pentatónica menor'},pM:{semis:[0,2,4,7,9],n:'Pentatónica mayor'},M:{semis:[0,2,4,5,7,9,11],n:'Mayor'},dor:{semis:[0,2,3,5,7,9,10],n:'Dórico'}};
const TRK={k:3,p:'blues',st:'rock',bpm:96,bar:-1};
function trkChord(i){const[off,t]=PROG2[TRK.p].it[i];return{pc:(KEYS[TRK.k].pc+off)%12,t,off}}
function trkName(i){const c=trkChord(i);return pcName(c.pc,[5,10,3,8,1].includes(c.pc)&&KEYS[TRK.k].a<=0).us+CT[c.t].suf}
function trkStart(ui){
  const S=STYLES[TRK.st],P=PROG2[TRK.p],L=S.steps;
  return seqStart('trk','Pista · '+KEYS[TRK.k].us+' '+S.n,()=>(TRK.st==='ranchera'?60/TRK.bpm/2:60/TRK.bpm/2),(s,t)=>{
    const bar=Math.floor(s/L)-1,i=s%L,dur=60/TRK.bpm/2;
    if(bar<0){if(i%2===0)tick(t,i===0?'acc':'beat');return}
    const ci=bar%P.it.length,c=trkChord(ci),root=36+((c.pc-0+12)%12),semis=CT[c.t].semis;
    const low=root<40?root+12:root,ch=semis.slice(0,4).map(x=>low+12+x);
    const strum=(v,len,sh)=>ch.forEach((m,j)=>pluck(m,t+j*(sh||.018),len,v));
    if(TRK.st==='rock'){
      if(i===0||i===4||i===5)kick(t,.85);if(i===2||i===6)snare(t,.42);hat(t,i%2?.09:.15);
      bassNote(low+(i===7?7:0),t,dur*.9,.36);
      if(i===0||i===4)strum(.13,dur*3.6);if(i===3||i===7)strum(.07,dur*.8,.01);
    }else if(TRK.st==='balada'){
      if(i===0||i===5)kick(t,.7);if(i===4)snare(t,.32);hat(t,.07);
      if(i===0||i===4)bassNote(low,t,dur*3.8,.34);
      const arp=[0,2,1,3,2,1,3,2].map(k=>ch[Math.min(k,ch.length-1)]);pluck(arp[i],t,dur*2.5,.15);
    }else if(TRK.st==='cumbia'){
      guiro(t,i%2===0);if(i===0||i===4)kick(t,.6);if(i===3||i===7)noise(t,.08,'bandpass',900,.25,1.5);
      if(i===0)bassNote(low,t,dur*1.6,.42);if(i===3)bassNote(low+7,t,dur*.9,.34);if(i===4)bassNote(low+7,t,dur*1.6,.38);if(i===6)bassNote(low+12,t,dur*.9,.3);
      if(i%2===1)strum(.1,dur*.7,.008);
    }else{
      if(i===0){kick(t,.7);bassNote(low+(bar%2?7:0),t,dur*1.8,.44)}
      if(i===2||i===4){strum(.12,dur*.8,.006);hat(t,.1)}
    }
  },s=>{const bar=Math.floor(s/L)-1;if(s%L===0){TRK.bar=bar;if(ui)ui(bar<0?-1:bar%P.it.length,bar<0?'cuenta':'')}});
}
/* ---------- temporizador de ejercicios ---------- */
const TMR={id:null,end:0,total:0,iv:null,paused:0};
function tmrStart(id,secs){
  tmrStop(true);
  Object.assign(TMR,{id,total:secs,end:Date.now()+secs*1000,paused:0});
  TMR.iv=setInterval(tmrTick,250);wake(true);emitState();tmrTick();
}
function tmrLeft(){return TMR.id?Math.max(0,Math.ceil(((TMR.paused||TMR.end)-(TMR.paused?0:Date.now()))/1000)):0}
function tmrTick(){
  if(!TMR.id)return;
  const left=TMR.paused?TMR.paused/1000:Math.max(0,(TMR.end-Date.now())/1000);
  document.dispatchEvent(new CustomEvent('tmr',{detail:{id:TMR.id,left:Math.ceil(left),total:TMR.total}}));
  if(left<=0&&!TMR.paused){const id=TMR.id;tmrStop();bell();try{navigator.vibrate&&navigator.vibrate([200,100,200])}catch(e){}document.dispatchEvent(new CustomEvent('tmrdone',{detail:{id}}))}
}
function tmrPause(){if(!TMR.id)return;if(TMR.paused){TMR.end=Date.now()+TMR.paused;TMR.paused=0}else TMR.paused=Math.max(0,TMR.end-Date.now());emitState();tmrTick()}
function tmrStop(silent){if(TMR.iv)clearInterval(TMR.iv);TMR.iv=null;TMR.id=null;TMR.paused=0;if(!silent){wake(false);emitState()}}
/* ---------- pantalla encendida ---------- */
let WL=null;
async function wake(on){
  try{
    const need=on||SEQ.id||TMR.id;
    if(need&&!WL&&navigator.wakeLock){WL=await navigator.wakeLock.request('screen');WL.addEventListener('release',()=>{WL=null})}
    else if(!need&&WL){await WL.release();WL=null}
  }catch(e){WL=null}
}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&(SEQ.id||TMR.id))wake(true)});
function emitState(){document.dispatchEvent(new CustomEvent('playstate'))}
