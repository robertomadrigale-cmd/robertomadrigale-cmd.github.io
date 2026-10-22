/* ---------- motor de audio ---------- */
let AC=null,MASTER=null,UNLOCKED=false,NOISE=null;
function ac(){
  try{
    if(!AC){
      const C=window.AudioContext||window.webkitAudioContext;
      AC=new C({latencyHint:'interactive'});
      const comp=AC.createDynamicsCompressor();comp.threshold.value=-12;comp.ratio.value=4;
      MASTER=AC.createGain();MASTER.gain.value=.85;MASTER.connect(comp);comp.connect(AC.destination);
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
  if(c){try{const b=c.createBuffer(1,1,22050),s=c.createBufferSource();s.buffer=b;s.connect(c.destination);s.start(0)}catch(e){}}
}
['pointerdown','touchend','keydown'].forEach(ev=>document.addEventListener(ev,unlockAudio,{capture:true,passive:true}));
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&AC&&AC.state!=='running')AC.resume()});
const out=()=>MASTER;
function pluck(m,t,d,v){
  const c=AC,f=440*Math.pow(2,(m-69)/12),o=c.createOscillator(),o2=c.createOscillator(),g=c.createGain(),lp=c.createBiquadFilter();
  o.type='triangle';o2.type='sine';o.frequency.value=f;o2.frequency.value=f*2;
  lp.type='lowpass';lp.frequency.setValueAtTime(3600,t);lp.frequency.exponentialRampToValueAtTime(650,t+d);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v||.2,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  o.connect(lp);o2.connect(lp);lp.connect(g);g.connect(out());
  o.start(t);o2.start(t);o.stop(t+d+.05);o2.stop(t+d+.05);
}
function bassNote(m,t,d,v){
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
let MUTE_DR=false;
function noise(t,dur,type,freq,v,q){
  if(MUTE_DR)return;
  const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();
  s.buffer=noiseBuf();f.type=type;f.frequency.value=freq;if(q)f.Q.value=q;
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  s.connect(f);f.connect(g);g.connect(out());s.start(t);s.stop(t+dur+.02);
}
function kick(t,v){
  if(MUTE_DR)return;
  const o=AC.createOscillator(),g=AC.createGain();
  o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(45,t+.12);
  g.gain.setValueAtTime(v||.9,t);g.gain.exponentialRampToValueAtTime(.0001,t+.32);
  o.connect(g);g.connect(out());o.start(t);o.stop(t+.35);
}
function snare(t,v){
  if(MUTE_DR)return;
  v=v||.45;noise(t,.18,'bandpass',1900,v,.8);
  const o=AC.createOscillator(),g=AC.createGain();o.type='triangle';o.frequency.setValueAtTime(210,t);o.frequency.exponentialRampToValueAtTime(140,t+.08);
  g.gain.setValueAtTime(v*.6,t);g.gain.exponentialRampToValueAtTime(.0001,t+.1);o.connect(g);g.connect(out());o.start(t);o.stop(t+.12);
}
const hat=(t,v,open)=>noise(t,open?.22:.045,'highpass',7500,v||.16);
const guiro=(t,long)=>{if(long){for(let i=0;i<5;i++)noise(t+i*.022,.02,'bandpass',3600,.11,2)}else noise(t,.03,'bandpass',3600,.13,2)};
function tick(t,kind){
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
  while(SEQ.next<AC.currentTime+.12){
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
const MET={bpm:80,meter:'4/4',sub:1,mode:'all',gapOn:0,gapOff:0,tr:null};
function metSilent(bar){return MET.gapOn>0&&MET.gapOff>0&&(bar%(MET.gapOn+MET.gapOff))>=MET.gapOn}
function metStart(opts,ui,label){
  Object.assign(MET,{mode:'all',gapOn:0,gapOff:0,tr:null},opts||{});
  const cs=MET.mode==='off'&&MET.sub<2?2:MET.sub;
  return seqStart('met',label||('Metrónomo '+MET.bpm),()=>60/MET.bpm/cs,(s,t)=>{
    const m=METERS[MET.meter],per=m.b*cs,bar=Math.floor(s/per),inb=s%per,beat=Math.floor(inb/cs),p=inb%cs;
    if(inb===0&&bar>0&&MET.tr&&bar%MET.tr.every===0&&MET.bpm<MET.tr.max){MET.bpm=Math.min(MET.tr.max,MET.bpm+MET.tr.step);SEQ.label='Metrónomo '+MET.bpm}
    if(metSilent(bar))return;
    let k=null;
    if(MET.mode==='all')k=p===0?(m.acc.includes(beat)?'acc':'beat'):'sub';
    else if(MET.mode==='24')k=p===0&&beat%2===1?'beat':null;
    else if(MET.mode==='1')k=p===0&&beat===0?'acc':null;
    else if(MET.mode==='off')k=p===Math.floor(cs/2)?'beat':null;
    if(k)tick(t,k);
  },s=>{const f=ui||MET.ui;if(f){const m=METERS[MET.meter],per=m.b*cs,bar=Math.floor(s/per),inb=s%per;f(Math.floor(inb/cs),inb%cs===0,bar,metSilent(bar))}});
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
const TRK={k:3,p:'pop',st:'rock',bpm:96,bar:-1,nod:true,click:true};
function trkChord(i){const[off,t]=PROG2[TRK.p].it[i];return{pc:(KEYS[TRK.k].pc+off)%12,t,off}}
function trkName(i){const c=trkChord(i);return pcName(c.pc,[5,10,3,8,1].includes(c.pc)&&KEYS[TRK.k].a<=0).us+CT[c.t].suf}
function trkStart(ui){
  const S=STYLES[TRK.st],P=PROG2[TRK.p],L=S.steps;
  return seqStart('trk','Pista · '+KEYS[TRK.k].us+' '+S.n,()=>(TRK.st==='ranchera'?60/TRK.bpm/2:60/TRK.bpm/2),(s,t)=>{
    const bar=Math.floor(s/L)-1,i=s%L,dur=60/TRK.bpm/2;
    if(bar<0){if(i%2===0)tick(t,i===0?'acc':'beat');return}
    if(TRK.click&&i%2===0)tick(t,i===0?'acc':'beat');
    MUTE_DR=!!TRK.nod;try{
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
    }finally{MUTE_DR=false}
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
