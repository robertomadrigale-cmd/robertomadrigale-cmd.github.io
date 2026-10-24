/* ---------- carril de tono: barras de las notas que vienen y la línea de tu voz ----------
   Todo va en «tiempo de audio» (AC.currentTime). Lo que se ve va retrasado outLat() para coincidir con lo que se oye,
   y las lecturas del micrófono se marcan con ese mismo tiempo (MIC en 3-pitch.js), así que se califican contra la barra que ves. */
const cssv=k=>getComputedStyle(document.documentElement).getPropertyValue('--'+k).trim();
function laneColors(){return{fg:cssv('fg'),muted:cssv('muted'),line:cssv('line'),acc:cssv('accent'),acct:cssv('accent-text'),root:cssv('root'),good:cssv('good'),bad:cssv('bad'),bg:cssv('surface')}}
// valor objetivo en el tiempo t (las sirenas se deslizan de una nota a la siguiente)
const tgtAt=(g,t)=>g.m2==null?g.m:g.m+(g.m2-g.m)*Math.max(0,Math.min(1,(t-g.t0)/(g.t1-g.t0)));
const scoreCol=(C,s)=>s>=.7?C.good:s>=.4?'#f5b43c':C.root;
function laneDraw(cv,st,now){
  const C=st.C,dpr=Math.min(2,devicePixelRatio||1),W=cv.clientWidth,H=cv.clientHeight;
  if(!W||!H)return;
  if(cv.width!==Math.round(W*dpr)||cv.height!==Math.round(H*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr)}
  const x=cv.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,W,H);
  const PH=W*.3,SEC=st.sec||4,pps=(W-PH)/SEC,past=PH/pps;
  // la ventana vertical sigue a las notas que se ven, con suavidad
  let lo=99,hi=0;st.targets.forEach(g=>{if(g.t1>now-past&&g.t0<now+SEC){lo=Math.min(lo,g.m,g.m2==null?99:g.m2);hi=Math.max(hi,g.m,g.m2==null?0:g.m2)}});
  if(st.fixed){lo=Math.min(lo,st.fixed[0]);hi=Math.max(hi,st.fixed[1])}
  if(lo>hi){lo=st.vlo||57;hi=st.vhi||69}
  lo-=3;hi+=3;if(hi-lo<12){const c=(lo+hi)/2;lo=c-6;hi=c+6}
  if(st.vlo==null){st.vlo=lo;st.vhi=hi}else{st.vlo+=(lo-st.vlo)*.06;st.vhi+=(hi-st.vhi)*.06}
  const L=st.vlo,Hh=st.vhi,py=(H-16)/(Hh-L),Y=m=>H-8-(m-L)*py,X=t=>PH+(t-now)*pps;
  // renglones de semitono: Do marcado con su nombre, naturales tenues
  x.font='600 10px system-ui,-apple-system,Segoe UI,sans-serif';x.textBaseline='middle';
  for(let m=Math.ceil(L);m<=Hh;m++){const pc=pcOf(m),y=Y(m);if(!NATPC.includes(pc))continue;
    x.globalAlpha=pc===0?.55:.22;x.strokeStyle=C.line;x.lineWidth=pc===0?1.2:1;x.beginPath();x.moveTo(0,y);x.lineTo(W,y);x.stroke();
    if(pc===0||st.labels){x.globalAlpha=pc===0?.85:.5;x.fillStyle=C.muted;x.fillText(nnTxt(m),4,y>16?y-7:y+8)}}
  x.globalAlpha=1;
  // barras
  const bh=Math.max(7,Math.min(22,py*.85));
  st.targets.forEach(g=>{
    if(g.t1<now-past-.2||g.t0>now+SEC+.2)return;
    const x0=X(g.t0)+1,x1=X(g.t1)-1,done=g.t1<now&&g.n>0,sc=done?g.h/g.n:0;
    const col=g.ph==='L'?C.muted:done?scoreCol(C,sc):C.acc;
    if(g.m2!=null){x.lineCap='round';x.lineWidth=bh;x.strokeStyle=col;x.globalAlpha=g.ph==='L'?.28:done?.75:.45;x.beginPath();x.moveTo(x0,Y(g.m));x.lineTo(x1,Y(g.m2));x.stroke();x.globalAlpha=1;return}
    x.globalAlpha=g.ph==='L'?.3:done?.8:(g.t0<=now&&g.t1>now)?.75:.5;x.fillStyle=col;
    const w=Math.max(4,x1-x0),r=Math.min(bh/2,w/2),y0=Y(g.m)-bh/2;
    x.beginPath();x.roundRect?x.roundRect(x0,y0,w,bh,r):x.rect(x0,y0,w,bh);x.fill();x.globalAlpha=1;
    if(g.syl&&w>14){x.fillStyle=C.fg;x.globalAlpha=.9;x.font='600 11px system-ui,-apple-system,Segoe UI,sans-serif';x.fillText(g.syl.slice(0,Math.max(1,Math.floor(w/7))),x0+4,y0-8);x.globalAlpha=1}
  });
  // línea de ahora
  x.strokeStyle=C.fg;x.globalAlpha=.35;x.lineWidth=1.5;x.beginPath();x.moveTo(PH,0);x.lineTo(PH,H);x.stroke();x.globalAlpha=1;
  // tu voz
  const tr=st.trail;x.lineWidth=3;x.lineCap='round';x.lineJoin='round';
  for(let i=1;i<tr.length;i++){const a=tr[i-1],b=tr[i];if(a.m==null||b.m==null||b.t-a.t>.15||b.t<now-past)continue;
    x.strokeStyle=b.hit?C.good:b.off?C.root:C.fg;x.beginPath();x.moveTo(X(a.t),Y(a.m));x.lineTo(X(b.t),Y(b.m));x.stroke()}
  const last=tr[tr.length-1];
  if(last&&last.m!=null&&now-last.t<.2){const yy=Y(last.m);x.fillStyle=last.hit?C.good:C.fg;x.shadowColor=x.fillStyle;x.shadowBlur=12;x.beginPath();x.arc(PH,Math.max(6,Math.min(H-6,yy)),6,0,7);x.fill();x.shadowBlur=0}
}
/* Arma una sesión con barras (targets), sonidos programados (ev) y tramos con letrero (segs). */
function drillSpec(d,o={}){
  const extend=d.id==='extensor'&&DB.range,c=extend?{lo:DB.range.lo,hi:DB.range.hi+2}:comfy();
  const rawSpan=Math.max(0,...d.pat.map(p=>p[0]||0));
  const span=Math.min(rawSpan,Math.max(0,c.hi-c.lo-(extend?2:0)));
  const pattern=d.pat.map(([m,b])=>[m==null?null:rawSpan?Math.round(m*span/rawSpan):0,b]);
  const beat=60/(o.bpm||d.bpm),count=Math.min(d.rounds,o.rounds||d.rounds),roots=[];
  const low=extend?DB.range.hi-span:c.lo,high=c.hi-span;
  let root=low,dir=1;
  for(let i=0;i<count;i++){
    if(d.id==='eco'){
      const choices=Array.from({length:high-low+1},(_,j)=>low+j).filter(n=>n!==roots[roots.length-1]);
      root=choices.length?choices[Math.floor(Math.random()*choices.length)]:low;
    }
    roots.push(root);
    if(d.id==='eco')continue;
    if(o.dir==='ud'&&i>=Math.floor((count-1)/2))dir=-1;
    root=Math.max(low,Math.min(high,root+dir));
  }
  const T0=AC.currentTime+.6,targets=[],ev=[],segs=[];let t=T0;
  const plen=pattern.reduce((a,p)=>a+p[1],0)*beat;
  roots.forEach((R,ri)=>{
    ['L','S'].forEach(ph=>{
      if(ph==='S'&&o.mode==='junto')return;
      const s0=t;segs.push({t0:s0-(ph==='S'?beat:0),t1:s0+plen,ph:o.mode==='junto'?'J':ph,ri,R});
      if(ph==='L'||o.mode==='junto')ev.push({t:s0,fn:tt=>chordPad(R-12,tt,plen,.05)});
      pattern.forEach((p,i)=>{
        const[off,b]=p,dur=b*beat;
        if(off!=null){
          const m=R+off,nx=d.glide&&pattern[i+1]&&pattern[i+1][0]!=null?R+pattern[i+1][0]:null;
          targets.push({t0:t,t1:t+dur,m,m2:nx,beats:b,ph:o.mode==='junto'?'S':ph,ri,n:0,h:0});
          if(ph==='L'||o.mode==='junto'){const tt=t,dd=dur;ev.push({t:tt,fn:z=>d.glide?guideTone(m,z,dd,ph==='L'?.2:.12,nx):o.mode==='junto'?guideTone(m,z,dd*.95,.12):piano(m,z,dd*.95,.24)})}
        }
        t+=dur;
      });
      // un pulso de respiro con click; antes de que cantes suena el acorde de tu nota
      if(ph==='L'){ev.push({t,fn:z=>{tick(z,'acc',null);chordPad(R-12,z,beat*.9,.04)}})}
      t+=beat;
    });
    if(o.rest&&ri<roots.length-1){segs.push({t0:t,t1:t+o.rest,ph:'R',ri,R});t+=o.rest}
  });
  // clicks suaves en cada pulso mientras cantas
  segs.filter(s=>s.ph==='S'||s.ph==='J').forEach(s=>{for(let b=s.t0+beat;b<s.t1-.01;b+=beat)ev.push({t:b,fn:z=>tickSound(z,'sub')})});
  return{targets,ev:ev.sort((a,b)=>a.t-b.t),segs,end:t,rounds:roots.length,beat,tip:d.tip,id:d.id,adapted:span<rawSpan};
}
// transpone la melodía al centro de tu zona cómoda (de semitono en semitono)
function songShift(S){
  const ms=S.lines.flatMap(l=>(l.mel||[]).filter(n=>n.m!=null).map(n=>n.m)),c=comfy();
  if(!ms.length)return 0;
  return Math.round((c.lo+c.hi)/2-(Math.min(...ms)+Math.max(...ms))/2);
}
const CHPC={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
function songSpec(S,o){
  const beat=60/(S.bpm*(o.speed||1)),sh=o.shift||0,T0=AC.currentTime+.5,targets=[],ev=[],segs=[],lines=[];
  for(let b=0;b<S.beats;b++)ev.push({t:T0+b*beat,fn:z=>tick(z,b?'beat':'acc',b?'beat':'bar')});
  let t=T0+S.beats*beat;segs.push({t0:T0,t1:t,ph:'C'});
  S.lines.forEach((L,li)=>{
    if(!L.mel)return;const l0=t;let si=-1;
    L.mel.forEach(n=>{
      const dur=n.d*beat;
      if(n.m!=null){
        if(!n.cont)si++;const syl=L.syl[si],m=n.m+sh;
        targets.push({t0:t,t1:t+dur,m,beats:n.d,ph:'S',li,si,n:0,h:0,syl:n.cont?'':(syl?syl.x:'')});
        if(o.guide){const tt=t;ev.push({t:tt,fn:z=>guideTone(m,z,dur*.94,.13)})}
        if(!n.cont&&syl&&syl.ch&&o.chords){const ch=syl.ch.match(/^([A-G])([#b]?)(m(?!aj))?/);if(ch){let r=CHPC[ch[1]]+(ch[2]==='#'?1:ch[2]==='b'?-1:0)+sh;r=((r%12)+12)%12+48;if(r>55)r-=12;const tt=t;ev.push({t:tt,fn:z=>chordPad(r,z,beat*S.beats*.9,.05,!!ch[3])})}}
      }
      t+=dur;
    });
    lines.push({li,t0:l0,t1:t});segs.push({t0:l0,t1:t,ph:'S',li});
  });
  return{targets,ev:ev.sort((a,b)=>a.t-b.t),segs,end:t,lines,beat,tip:'Escucha la frase e imagina la primera nota antes de cantar.'};
}
let PRACTICE=null; // la sesión en curso (para revisarla desde la consola)
/* Corre la sesión: programa el sonido 0.25 s adelante, dibuja y califica cada lectura del micrófono. */
function practiceRun(cv,spec,o){
  const st={C:laneColors(),targets:spec.targets,trail:[],sec:o.sec||4,labels:o.labels,fixed:o.fixed};
  let ei=0,raf=0,seg=-1,cur=null,alive=true,paused=false,pauseAt=0;
  const master=MASTER,bus=AC.createGain();bus.connect(master);
  const tol=(DB.tol||50)/100;
  const frame=()=>{
    if(!alive||paused)return;
    while(ei<spec.ev.length&&spec.ev[ei].t<AC.currentTime+.25){const e=spec.ev[ei++];if(e.t>AC.currentTime-.02){MASTER=bus;try{e.fn(e.t)}finally{MASTER=master}}}
    const now=AC.currentTime-outLat();
    const si=spec.segs.findIndex(s=>now>=s.t0&&now<s.t1);if(si!==seg){seg=si;o.onSeg&&o.onSeg(spec.segs[si]||null)}
    const g=spec.targets.find(x=>now>=x.t0&&now<x.t1)||null;if(g!==cur){cur=g;o.onNote&&o.onNote(g,now)}
    laneDraw(cv,st,now);
    if(now>spec.end+.4){stop(true);return}
    raf=requestAnimationFrame(frame);
  };
  const onMic=d=>{
    if(!alive||paused)return;const s={t:d.t,m:d.m,hit:false,off:false};
    const g=spec.targets.find(x=>d.t>=x.t0&&d.t<x.t1);
    if(g&&g.ph==='S'){
      const hit=d.m!=null&&Math.abs(d.m-tgtAt(g,d.t))<=tol;
      g.reads=(g.reads||0)+1;
      if(d.m==null)g.silent=(g.silent||0)+1;
      else{const err=d.m-tgtAt(g,d.t);g.voiced=(g.voiced||0)+1;g.sum=(g.sum||0)+err;g.sq=(g.sq||0)+err*err}
      const part=(d.t-g.t0)/(g.t1-g.t0),which=part<.3?'early':part>.7?'late':null;
      if(which){g[which+'N']=(g[which+'N']||0)+1;g[which+'H']=(g[which+'H']||0)+(hit?1:0)}
      const grace=Math.min(.18,(g.t1-g.t0)*.3);
      if(d.t>=g.t0+grace&&d.t<g.t1-.03){g.n++;if(hit){g.h++;s.hit=true}else if(d.m!=null)s.off=true;
        const note=Math.round(tgtAt(g,d.t));g.bins=g.bins||{};const b=g.bins[note]||(g.bins[note]={n:0,h:0});b.n++;if(hit)b.h++;
      }
      else if(d.m!=null&&Math.abs(d.m-tgtAt(g,d.t))<=tol)s.hit=true;
    }
    st.trail.push(s);if(st.trail.length>400)st.trail.splice(0,100);
    o.onPitch&&o.onPitch(d,g);
  };
  const stop=fin=>{if(!alive)return;alive=false;cancelAnimationFrame(raf);bus.gain.value=0;spec.cleanup?.();bus.disconnect();if(paused)AC.resume();if(MIC.on===onMic)MIC.on=null;o.onEnd&&o.onEnd(fin?spec:null)};
  const pause=async()=>{if(!alive||paused)return;paused=true;cancelAnimationFrame(raf);await AC.suspend();pauseAt=AC.currentTime};
  const resume=()=>{if(!alive||!paused)return;const delta=Math.max(0,AC.currentTime-pauseAt);
    if(delta){spec.targets.forEach(g=>{g.t0+=delta;g.t1+=delta});spec.segs.forEach(s=>{s.t0+=delta;s.t1+=delta});(spec.lines||[]).forEach(s=>{s.t0+=delta;s.t1+=delta});spec.ev.slice(ei).forEach(e=>e.t+=delta);spec.end+=delta;st.trail.forEach(p=>p.t+=delta)}
    paused=false;AC.resume();raf=requestAnimationFrame(frame);
  };
  if(MIC.stream)MIC.on=onMic;
  raf=requestAnimationFrame(frame);
  return PRACTICE={stop:()=>stop(false),pause,resume,st,onMic,spec,get paused(){return paused}};
}
// calificación: promedio de las notas que cantaste (cada nota = fracción del tiempo dentro de la tolerancia)
function specScore(spec){const gs=spec.targets.filter(g=>g.ph==='S'&&g.n>0);if(!gs.length)return null;return gs.reduce((a,g)=>a+g.h/g.n,0)/gs.length}
/* Una sola observación, calculada con lecturas reales de la voz. */
function coachTip(spec){
  const gs=spec.targets.filter(g=>g.ph==='S'),reads=gs.reduce((s,g)=>s+(g.reads||0),0);
  if(reads&&gs.reduce((s,g)=>s+(g.silent||0),0)/reads>.4)return 'Casi no te oí: acércate al teléfono y canta con más aire.';
  const notes=gs.map(g=>(g.m+(g.m2==null?g.m:g.m2))/2),lo=Math.min(...notes),hi=Math.max(...notes),third=(hi-lo)/3;
  const average=list=>{const n=list.reduce((s,g)=>s+(g.voiced||0),0);return n?list.reduce((s,g)=>s+(g.sum||0),0)/n:0};
  const high=average(gs.filter((g,i)=>notes[i]>=hi-third)),low=average(gs.filter((g,i)=>notes[i]<=lo+third));
  if(hi>lo&&high<-.3)return 'Te quedaste bajo en las notas agudas: apoya más el aire y piensa la nota arriba antes de cantarla.';
  if(hi>lo&&high>.3)return 'Te pasaste arriba en las agudas: relaja la garganta y canta un poco más suave.';
  if(hi>lo&&low<-.3)return 'En las graves te quedaste abajo: imagina la nota y mantén el aire parejo.';
  if(hi>lo&&low>.3)return 'En las graves te fuiste arriba: suelta la mandíbula y baja con suavidad.';
  if(gs.some(g=>g.m2==null&&g.beats>=2&&g.voiced>2&&Math.sqrt(Math.max(0,g.sq/g.voiced-(g.sum/g.voiced)**2))>.35))return 'Tu nota se movía: sostén el aire parejo, como en la «sss».';
  if(gs.some(g=>g.earlyN>2&&g.lateN>2&&g.earlyH/g.earlyN<.4&&g.lateH/g.lateN>.7))return 'Llegas a la nota tarde: imagínala antes de cantarla.';
  if(specScore(spec)>=.85)return '¡Qué buena afinación! Prueba la tolerancia estricta o el siguiente nivel.';
  return spec.tip||'Escucha la nota completa y repítela con aire parejo.';
}
