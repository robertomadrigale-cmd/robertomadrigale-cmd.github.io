/* ---------- sonidos de batería ---------- */
function metal(t,dur,v,hp,freqs){
  const g=AC.createGain(),f=AC.createBiquadFilter();f.type='highpass';f.frequency.value=hp;
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  (freqs||[205.3,304.4,369.6,522.7,540,800]).forEach(fr=>{const o=AC.createOscillator();o.type='square';o.frequency.value=fr*1.8;o.connect(f);o.start(t);o.stop(t+dur+.05)});
  f.connect(g);g.connect(out());
}
function tom(t,f0,v){
  const o=AC.createOscillator(),g=AC.createGain();o.type='sine';
  o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f0*.62,t+.3);
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+.45);o.connect(g);g.connect(out());o.start(t);o.stop(t+.5);
  noise(t,.03,'bandpass',f0*6,v*.3,1);
}
function rim(t,v){
  const o=AC.createOscillator(),g=AC.createGain();o.type='triangle';o.frequency.value=1750;
  g.gain.setValueAtTime(v*.7,t);g.gain.exponentialRampToValueAtTime(.0001,t+.035);o.connect(g);g.connect(out());o.start(t);o.stop(t+.05);
  noise(t,.02,'highpass',3000,v*.4);
}
function cowbell(t,v){const g=AC.createGain(),f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=900;g.gain.setValueAtTime(v*.5,t);g.gain.exponentialRampToValueAtTime(.0001,t+.25);[540,800].forEach(fr=>{const o=AC.createOscillator();o.type='square';o.frequency.value=fr;o.connect(f);o.start(t);o.stop(t+.3)});f.connect(g);g.connect(out())}
const ROWS={
 cr:{n:'Platillo',a:'PL',play:(t,v)=>{noise(t,1.4,'highpass',5000,.32*v);metal(t,1.2,.08*v,6000)}},
 rd:{n:'Ride',a:'RI',play:(t,v)=>{metal(t,.7,.11*v,7000);noise(t,.15,'bandpass',9000,.06*v,1)}},
 hh:{n:'Hi-hat',a:'HH',play:(t,v,ch)=>{if(ch==='o'){noise(t,.32,'highpass',7000,.2*Math.max(v,.75));metal(t,.3,.04,8000)}else{noise(t,.05,'highpass',7500,.2*v);metal(t,.04,.035*v,9000)}}},
 cb:{n:'Cencerro',a:'CE',play:(t,v)=>cowbell(t,v)},
 t1:{n:'Tom 1',a:'T1',play:(t,v)=>tom(t,240,.7*v)},
 t2:{n:'Tom 2',a:'T2',play:(t,v)=>tom(t,175,.7*v)},
 sn:{n:'Tarola',a:'TA',play:(t,v)=>snare(t,.5*v)},
 rim:{n:'Aro',a:'AR',play:(t,v)=>rim(t,v)},
 ft:{n:'Tom de piso',a:'TP',play:(t,v)=>tom(t,115,.8*v)},
 bd:{n:'Bombo',a:'BO',play:(t,v)=>kick(t,.95*v)},
 hf:{n:'Pedal HH',a:'PH',play:(t,v)=>noise(t,.04,'bandpass',5500,.14*v,1)}};
const ROW_ORDER=['cr','rd','hh','cb','t1','t2','sn','rim','ft','bd','hf'];
const VEL={X:1,x:.72,o:.8,g:.22};
const COUNT={1:[''],2:['','y'],3:['','ta','ti'],4:['','e','y','a']};
const gSteps=g=>g.meter*g.sub*(g.bars||1);
function grooveGrid(g,opts){
  opts=opts||{};const n=gSteps(g),rows=ROW_ORDER.filter(r=>g.rows[r]);
  const cols=`grid-template-columns:44px repeat(${n},minmax(18px,1fr))`;
  let h=`<div class="gwrap"><div class="ggrid" style="${cols};min-width:${44+n*20}px">`;
  rows.forEach(r=>{
    const muted=opts.muted&&opts.muted.includes(r);
    h+=`<div class="glab${muted?' muted':''}" title="${ROWS[r].n}">${ROWS[r].a}</div>`;
    for(let i=0;i<n;i++){
      const c=g.rows[r][i]||'-',beat=i%g.sub===0,bar=i%(g.sub*g.meter)===0;
      h+=`<div class="gc${beat?' b':''}${bar&&i?' bar':''}" data-i="${i}">${c==='-'?'':`<span class="gn ${c==='X'?'acc':c==='g'?'gh':c==='o'?'op':''}${muted?' you':''}"></span>`}</div>`;
    }
  });
  h+=`<div class="glab"></div>`;
  for(let i=0;i<n;i++){const p=i%g.sub,b=Math.floor(i/g.sub)%g.meter+1;h+=`<div class="gcount${p===0?' b':''}" data-i="${i}">${p===0?b:COUNT[g.sub][p]}</div>`}
  return h+'</div></div>';
}
/* reproductor de grooves */
const GP={id:null,g:null,bpm:80,click:true,muted:[]};
function grooveStart(id,g,opts,ui){
  Object.assign(GP,{id,g,bpm:opts.bpm||g.bpm,click:opts.click!==false,muted:opts.muted||[]});
  const n=gSteps(g);
  return seqStart('grv',g.n+' · '+GP.bpm+' bpm',()=>60/GP.bpm/g.sub,(s,t)=>{
    const count=g.meter*g.sub;
    if(s<count){if(s%g.sub===0)tick(t,s===0?'acc':'beat');return}
    const i=(s-count)%n;
    if(GP.click&&i%g.sub===0)tick(t,i%(g.sub*g.meter)===0?'acc':'beat');
    for(const r in g.rows){const c=g.rows[r][i];if(c&&c!=='-'&&!GP.muted.includes(r))ROWS[r].play(t,VEL[c]||.72,c)}
  },s=>{const count=g.meter*g.sub;if(ui)ui(s<count?-1:(s-count)%n,s<count)});
}
