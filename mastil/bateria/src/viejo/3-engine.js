/* ---------- motor de audio: kit grabado del núcleo (drumHit/sampleVoice), síntesis de respaldo, click, secuenciador y metrónomo ---------- */
let MASTER=null,ROOMB=null,NOISEB=null,KIT=null,KITP=null,UNLOCKED=false;
const AC=()=>ac();
function out(){
  const c=ac();
  if(!MASTER){const comp=c.createDynamicsCompressor();comp.threshold.value=-8;comp.ratio.value=3;comp.attack.value=.004;
    MASTER=c.createGain();MASTER.gain.value=.9;MASTER.connect(comp);comp.connect(c.destination);ROOMB=RokaAudio.reverb(c,MASTER,.5)}
  return MASTER;
}
// carga el kit «Black Pearl» del núcleo; si falla (sin internet la primera vez) queda la síntesis
function kitLoad(){if(!KITP)KITP=loadPack('bateria').then(p=>{KIT=p;emitState();return p}).catch(()=>{KIT=false;return null});return KITP}
function audioUnlock(){
  if(UNLOCKED)return;UNLOCKED=true;
  unlockAudio().catch(()=>{});try{if(navigator.audioSession)navigator.audioSession.type='play-and-record'}catch(e){}
  out();kitLoad();
}
['pointerdown','touchend','keydown'].forEach(ev=>document.addEventListener(ev,audioUnlock,{capture:true,passive:true}));
document.addEventListener('visibilitychange',()=>{const c=RokaAudio.ac();if(!document.hidden&&c.state!=='running')c.resume()});
/* --- síntesis de respaldo (la de Pulso a la Vista) --- */
function noiseBuf(){const c=ac();if(NOISEB)return NOISEB;const b=c.createBuffer(1,c.sampleRate*.6,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return NOISEB=b}
function noise(t,dur,type,freq,v,q){const c=ac(),s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=noiseBuf();f.type=type;f.frequency.value=freq;if(q)f.Q.value=q;
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f);f.connect(g);g.connect(out());s.start(t);s.stop(t+dur+.02)}
function osc(t,type,f0,f1,dur,v,fd){const c=ac(),o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);if(f1)o.frequency.exponentialRampToValueAtTime(f1,t+(fd||dur*.4));
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(out());o.start(t);o.stop(t+dur+.03)}
function metal(t,dur,v,hp){const c=ac(),g=c.createGain(),f=c.createBiquadFilter();f.type='highpass';f.frequency.value=hp;
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  [205.3,304.4,369.6,522.7,540,800].forEach(fr=>{const o=c.createOscillator();o.type='square';o.frequency.value=fr*1.8;o.connect(f);o.start(t);o.stop(t+dur+.05)});f.connect(g);g.connect(out())}
const SYN={
 cr:(t,v)=>{noise(t,1.4,'highpass',5000,.32*v);metal(t,1.2,.08*v,6000)},
 rd:(t,v)=>{metal(t,.7,.11*v,7000);noise(t,.15,'bandpass',9000,.06*v,1)},
 hh:(t,v,ch)=>{if(ch==='o'){noise(t,.32,'highpass',7000,.2*Math.max(v,.75));metal(t,.3,.04,8000)}else{noise(t,.05,'highpass',7500,.2*v);metal(t,.04,.035*v,9000)}},
 cb:(t,v)=>{osc(t,'square',540,0,.25,.12*v);osc(t,'square',800,0,.25,.12*v)},
 t1:(t,v)=>{osc(t,'sine',240,150,.45,.7*v,.3);noise(t,.03,'bandpass',1400,.2*v,1)},
 t2:(t,v)=>{osc(t,'sine',175,110,.45,.7*v,.3);noise(t,.03,'bandpass',1000,.2*v,1)},
 sn:(t,v)=>{noise(t,.18,'bandpass',1900,.5*v,.8);osc(t,'triangle',210,140,.1,.3*v,.08)},
 rim:(t,v)=>{osc(t,'triangle',1750,0,.035,.5*v);noise(t,.02,'highpass',3000,.3*v)},
 ft:(t,v)=>{osc(t,'sine',115,72,.5,.8*v,.3);noise(t,.03,'bandpass',700,.25*v,1)},
 bd:(t,v)=>osc(t,'sine',150,45,.32,.95*v,.12),
 hf:(t,v)=>noise(t,.04,'bandpass',5500,.14*v,1)};
/* --- filas de la rejilla → golpes grabados [fuerte, suave, volumen, paneo, sala, semitonos] --- */
const ROWS={
 cr:{n:'Platillo',a:'PL',k:['crash','crash',.5,-.25,.22,0],pad:'plat'},
 rd:{n:'Ride',a:'RI',k:['ride','ride',.45,.3,.14,0],pad:'plat'},
 hh:{n:'Hi-hat',a:'HH',k:['hat2','hat1',.42,-.3,.06,0],pad:'plat'},
 cb:{n:'Cencerro',a:'CE',k:['cow','cow',.42,.15,.1,0],pad:'plat'},
 t1:{n:'Tom 1',a:'T1',k:['tom','tom',.6,-.1,.18,4],pad:'tar'},
 t2:{n:'Tom 2',a:'T2',k:['tom','tom',.62,.1,.18,0],pad:'tar'},
 sn:{n:'Tarola',a:'TA',k:['snare2','snare1',.72,.04,.2,0],pad:'tar'},
 rim:{n:'Aro',a:'AR',k:['rim','rim',.6,.08,.12,0],pad:'tar'},
 ft:{n:'Tom de piso',a:'TP',k:['ftom','ftom',.68,.3,.18,0],pad:'tar'},
 bd:{n:'Bombo',a:'BO',k:['kick2','kick1',.95,0,.04,0],pad:'bom'},
 hf:{n:'Pedal HH',a:'PH',k:['hatp','hatp',.38,-.3,.05,0],pad:'bom'}};
const ROW_ORDER=['cr','rd','hh','cb','t1','t2','sn','rim','ft','bd','hf'];
const VEL={X:1,x:.72,o:.8,g:.25};
const PADS={plat:{n:'Platillos',key:'J'},tar:{n:'Tarola',key:'F'},bom:{n:'Bombo',key:'Espacio'}};
// toca una fila en el tiempo t (reloj de audio); ch = símbolo de la rejilla
function hit(row,t,ch){
  const v=VEL[ch]||.72,R=ROWS[row];if(!R)return;
  const s=KIT&&KIT.samples;
  if(s){const[strong,soft,lvl,pan,wet,semi]=R.k,name=row==='hh'&&ch==='o'?'hato':(ch==='X'?strong:soft),smp=s[name];
    if(smp){try{sampleVoice(smp,semi,t,smp.buf.duration,v*lvl*(.94+Math.random()*.1),{context:ac(),destination:out(),pan,reverb:ROOMB,wet,lowpass:ch==='g'?3500:12000});return}catch(e){}}}
  SYN[row](t,v,ch);
}
function tick(t,kind){
  if(DB.metMute)return;const c=ac(),o=c.createOscillator(),g=c.createGain();
  o.type='sine';o.frequency.value=kind==='acc'?1760:kind==='beat'?1180:880;
  const v=(kind==='acc'?.5:kind==='beat'?.34:.16)*(DB.clickVol==null?1:DB.clickVol);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,v),t+.002);g.gain.exponentialRampToValueAtTime(.0001,t+.05);
  o.connect(g);g.connect(out());o.start(t);o.stop(t+.06);
}
function bell(){const c=ac(),t=c.currentTime+.02;[1568,1976,2349].forEach((f,i)=>osc(t+i*.12,'sine',f,0,.8,.12))}
/* ---------- secuenciador con el reloj de audio: programa 0.2 s adelante; si el teléfono se atrasa, salta sin amontonar golpes ---------- */
const SEQ={id:null,label:'',timer:null,next:0,step:0,dur:null,on:null,ui:null};
let OWNER=null;
function seqStart(id,label,getDur,onStep,ui){
  seqStop(true);
  const c=ac();if(c.state!=='running')c.resume();
  Object.assign(SEQ,{id,label,step:0,next:c.currentTime+.15,dur:getDur,on:onStep,ui,t0:c.currentTime+.15});
  seqPump();SEQ.timer=setInterval(seqPump,25);
  wake(true);emitState();return SEQ.t0;
}
function seqPump(){
  if(!SEQ.id)return;const c=ac();
  while(SEQ.next<c.currentTime-.03){SEQ.next+=SEQ.dur();SEQ.step++}
  while(SEQ.id&&SEQ.next<c.currentTime+.2){
    const s=SEQ.step,t=SEQ.next;
    SEQ.on(s,t);
    if(SEQ.ui){const f=SEQ.ui,id=SEQ.id,d=Math.max(0,(t-c.currentTime+outLat())*1000);setTimeout(()=>{if(SEQ.id===id&&SEQ.ui===f)f(s,t)},d)}
    SEQ.next+=SEQ.dur();SEQ.step++;
  }
}
function seqStop(silent){
  if(SEQ.timer)clearInterval(SEQ.timer);
  SEQ.timer=null;SEQ.id=null;SEQ.ui=null;
  if(!silent){wake(false);emitState()}
}
/* ---------- metrónomo avanzado ---------- */
const METERS={'2/4':{b:2,acc:[0]},'3/4':{b:3,acc:[0]},'4/4':{b:4,acc:[0]},'6/8':{b:6,acc:[0,3]}};
const MET={bpm:DB.met||80,meter:DB.meter||'4/4',sub:DB.sub||1,mode:'all',gapOn:0,gapOff:0,tr:null,ui:null};
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
const TAPS=[];
function tapTempo(btn,set){const n=performance.now();if(TAPS.length&&n-TAPS[TAPS.length-1]>2000)TAPS.length=0;TAPS.push(n);if(TAPS.length>6)TAPS.shift();tick(ac().currentTime+.01,'beat');if(TAPS.length>=2){const d=(TAPS[TAPS.length-1]-TAPS[0])/(TAPS.length-1);set(60000/d);btn.textContent='Marcar · '+TAPS.length+' toques'}else btn.textContent='Sigue tocando…';clearTimeout(btn._t);btn._t=setTimeout(()=>{btn.textContent='Marcar tempo'},2200)}
/* ---------- banda sin batería: renderBeat del núcleo, solo bajo/armonía/metales, en bucle exacto ---------- */
const BANDC=new Map();
async function bandRender(beatId,bpm,tono){
  const b=beatById(beatId),comp=b.prog[0].length,k=beatId+'|'+bpm+'|'+(tono?tono.pc+(tono.minor?'m':''):'');
  if(BANDC.has(k))return BANDC.get(k);
  const r=await renderBeat({id:beatId,parte:'A',compases:comp,bpm,tono:tono||undefined,prog:0,seed:11});
  const parts=['bajo','armonia','metales'].map(p=>r[p]).filter(Boolean);
  const res={parts,loop:r.dur,bars:comp,acordes:r.acordes,beat:b};BANDC.set(k,res);if(BANDC.size>6)BANDC.delete(BANDC.keys().next().value);return res;
}
const BAND={nodes:[]};
function bandPlay(res,t0,vol){
  bandStop();const c=ac(),g=c.createGain();g.gain.value=vol==null?.9:vol;g.connect(out());
  res.parts.forEach(buf=>{const s=c.createBufferSource();s.buffer=buf;s.loop=true;s.loopStart=0;s.loopEnd=res.loop;s.connect(g);s.start(t0);BAND.nodes.push(s)});BAND.gain=g;
}
function bandStop(){BAND.nodes.forEach(s=>{try{s.stop()}catch(e){}});BAND.nodes=[];if(BAND.gain){try{BAND.gain.disconnect()}catch(e){}BAND.gain=null}}
const bufPeak=b=>{if(!b)return 0;let p=0;for(let ch=0;ch<b.numberOfChannels;ch++){const d=b.getChannelData(ch);for(let i=0;i<d.length;i+=7)p=Math.max(p,Math.abs(d[i]))}return p};
/* ---------- pantalla encendida ---------- */
let WL=null;
async function wake(on){
  try{const need=on||SEQ.id;
    if(need&&!WL&&navigator.wakeLock){WL=await navigator.wakeLock.request('screen');WL.addEventListener('release',()=>{WL=null})}
    else if(!need&&WL){await WL.release();WL=null}
  }catch(e){WL=null}
}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&SEQ.id)wake(true)});
function emitState(){document.dispatchEvent(new CustomEvent('playstate'))}
