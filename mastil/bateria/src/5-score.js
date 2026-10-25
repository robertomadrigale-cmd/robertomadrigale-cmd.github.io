/* ---------- calificación de golpes, micrófono (AudioWorklet) y toques en pantalla ---------- */
// Golpes esperados de un groove: con micrófono uno por golpe (cualquier pieza, sin notas fantasma); con toques uno por pad.
function expectedHits(g,T0,step,loops,mode){
  const n=gSteps(g),out=[];
  for(let L=0;L<loops;L++)for(let i=0;i<n;i++){
    const pads=new Set();for(const r in g.rows){const c=g.rows[r][i];if(c&&c!=='-'&&!(mode==='mic'&&c==='g'))pads.add(ROWS[r].pad)}
    if(!pads.size)continue;const t=T0+(L*n+i)*step;
    if(mode==='mic')out.push({t,i,L});else pads.forEach(p=>out.push({t,i,L,pad:p}));
  }
  return out;
}
// Verde ≤ 30 ms, ámbar ≤ 70 ms, rosa ≤ 120 ms; más lejos = golpe perdido. Los golpes de más restan la mitad.
const GRADE=[[30,1,'ok'],[70,.6,'mid'],[120,.25,'bad']];
const gradeOf=off=>{if(off==null)return['miss',0];const a=Math.abs(off);for(const[ms,cr,cl]of GRADE)if(a<=ms)return[cl,cr];return['miss',0]};
function scoreHits(exp,hits,opt){
  opt=opt||{};const win=opt.win||.12,used=new Array(hits.length).fill(false),pads=opt.pads!==false;
  const H=hits.map((h,k)=>({...h,k})).sort((a,b)=>a.t-b.t),items=[];let credit=0;
  [...exp].sort((a,b)=>a.t-b.t).forEach(e=>{
    let best=null,bd=win;
    for(const h of H){if(used[h.k])continue;if(h.t<e.t-win)continue;if(h.t>e.t+win)break;if(pads&&e.pad&&h.pad&&h.pad!==e.pad&&!opt.anyPad)continue;const d=Math.abs(h.t-e.t);if(d<=bd){bd=d;best=h}}
    let off=null;if(best){used[best.k]=true;off=(best.t-e.t)*1000}
    const[cls,cr]=gradeOf(off);credit+=cr;items.push({...e,off,cls});
  });
  const offs=items.filter(x=>x.off!=null).map(x=>x.off),extra=used.filter(u=>!u).length,n=items.length;
  return{n,items,hit:offs.length,miss:n-offs.length,extra,pct:n?Math.min(1,credit/(n+extra*.5)):0,
    mean:mean(offs),sd:sd(offs),pocket:offs.length?offs.filter(o=>Math.abs(o)<=30).length/offs.length:0};
}
// Consejo del coach según cómo tocaste
function scoreTip(S){
  if(!S||!S.n)return'Toca junto con el click: la app escucha cada golpe.';
  if(S.hit<S.n*.3)return'Casi no escuché golpes. Revisa el micrófono o usa los toques en pantalla, y empieza en Lento.';
  if(S.miss>S.n*.3)return'Se te escaparon golpes. Cuenta en voz alta y prueba en Lento.';
  if(S.extra>S.n*.25)return'Hubo golpes de más. Toca solo lo que se ilumina en la rejilla.';
  if(S.mean<-15)return'Vas adelantado: relájate y deja que el click llegue.';
  if(S.mean>15)return'Vas atrasado: anticipa un poquito el golpe.';
  if(S.sd>25)return'Tus golpes varían mucho entre sí. Baja a Lento y cuenta en voz alta.';
  if(S.pct>=.85)return'¡En el bolsillo! Prueba la velocidad Rápido.';
  return'Bien. Repite para afinar la consistencia: que todos caigan en verde.';
}
/* ---------- micrófono: detección de golpes en un AudioWorklet (de Pulso a la Vista) ---------- */
const MIC={stream:null,src:null,node:null,sink:null,ready:false,lv:0,onHit:null,mod:false};
const WORKLET=`class OD extends AudioWorkletProcessor{constructor(){super();this.slow=0;this.last=-1;this.th=.03;this.k=3.5;this.ref=.07;this.lv=0;this.n=0;this.armed=true;this.peak=0;this.port.onmessage=e=>{Object.assign(this,e.data)}}
process(ins){const ch=ins[0]&&ins[0][0];if(!ch)return true;const N=ch.length,H=32;for(let i=0;i<N;i+=H){let e=0;for(let j=i;j<i+H&&j<N;j++)e+=ch[j]*ch[j];e=Math.sqrt(e/H);const t=currentTime+i/sampleRate;
if(!this.armed){if(e>this.peak)this.peak=e;if(e<this.peak*.35&&t-this.last>this.ref)this.armed=true}else if(e>this.th&&e>this.slow*this.k&&t-this.last>this.ref){this.last=t;this.armed=false;this.peak=e;this.port.postMessage({t:t,e:e})}this.slow=this.slow*.993+e*.007;if(e>this.lv)this.lv=e;}
if(++this.n%20===0){this.port.postMessage({lv:this.lv});this.lv=0}return true}}registerProcessor('onset',OD);`;
async function micStart(){
  if(MIC.ready)return'ok';
  if(!window.isSecureContext||!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)return'nosupport';
  const c=ac();if(!c.audioWorklet)return'noworklet';
  try{
    const s=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
    if(c.state!=='running')await c.resume();
    if(!MIC.mod){await c.audioWorklet.addModule(URL.createObjectURL(new Blob([WORKLET],{type:'application/javascript'})));MIC.mod=true}
    MIC.stream=s;MIC.src=c.createMediaStreamSource(s);MIC.node=new AudioWorkletNode(c,'onset');MIC.sink=c.createGain();MIC.sink.gain.value=0;
    MIC.src.connect(MIC.node);MIC.node.connect(MIC.sink);MIC.sink.connect(c.destination);
    MIC.node.port.onmessage=e=>{const d=e.data;if(d.lv!=null){MIC.lv=d.lv;document.dispatchEvent(new CustomEvent('miclv'))}else if(MIC.onHit)MIC.onHit(d.t,d.e)};
    micThreshold();MIC.ready=true;emitState();return'ok';
  }catch(e){return e&&e.name==='NotAllowedError'?'denied':e&&e.name==='NotFoundError'?'nomic':'other'}
}
const MICERR={denied:'El micrófono está bloqueado. Permite el acceso al micrófono para este sitio en los ajustes del navegador.',nomic:'No se encontró un micrófono.',nosupport:'Este navegador no permite usar el micrófono aquí. Abre la app instalada en Chrome o Safari.',noworklet:'Este navegador es muy antiguo para escuchar golpes. Actualízalo.',other:'No se pudo iniciar el micrófono.'};
function micThreshold(){if(!MIC.node)return;const m={1:2.2,2:1,3:.5}[DB.sens||2];MIC.node.port.postMessage({th:Math.max(.03*m,(DB.clickLvl||0)*2.2)})}
function micStop(){try{MIC.src&&MIC.src.disconnect();MIC.node&&MIC.node.disconnect();MIC.sink&&MIC.sink.disconnect()}catch(e){}if(MIC.stream)MIC.stream.getTracks().forEach(t=>t.stop());if(MIC.node)MIC.node.port.onmessage=null;Object.assign(MIC,{stream:null,src:null,node:null,sink:null,ready:false,onHit:null});emitState()}
const estLat=()=>outLat()+.012;
const micLat=()=>DB.lat!=null?DB.lat:estLat();
// mide el retraso del teléfono escuchando su propio click por la bocina (8 clicks)
function calibrate(done){
  grooveStop();if(!MIC.ready)return done(false);const c=ac(),t0=c.currentTime+.3,clicks=[],det=[];
  DB.clickLvl=0;micThreshold();const mm=DB.metMute;DB.metMute=false;
  for(let i=0;i<8;i++){const t=t0+i*.6;clicks.push(t);tick(t,'acc');tick(t,'acc')}
  MIC.onHit=(t,e)=>{const c0=clicks.find(x=>t>=x&&t<x+.45);if(c0!=null)det.push({d:t-c0,e})};
  setTimeout(()=>{MIC.onHit=null;DB.metMute=mm;
    if(det.length>=5){const ds=det.map(x=>x.d).sort((a,b)=>a-b),es=det.map(x=>x.e).sort((a,b)=>a-b);DB.lat=ds[Math.floor(ds.length/2)];DB.clickLvl=es[Math.floor(es.length/2)];save();micThreshold();done(true)}
    else{DB.lat=null;DB.clickLvl=0;save();micThreshold();done(false)}
  },(t0-c.currentTime+8*.6+.5)*1000);
}
/* ---------- toques en pantalla: el momento del dedo pasado al reloj de audio y corregido por lo que tarda en oírse ---------- */
function tapTime(e){const c=ac(),age=e&&e.timeStamp?Math.max(0,Math.min(.25,(performance.now()-e.timeStamp)/1000)):0;return c.currentTime-age-outLat()-(DB.tapLat||0)}
const padsHTML=g=>{const need=new Set(Object.keys(g.rows).map(r=>ROWS[r].pad));return`<div class="pads">${['plat','tar','bom'].filter(p=>need.has(p)).map(p=>`<button class="pad pad-${p}" data-pad="${p}"><b>${PADS[p].n}</b><small>${PADS[p].key}</small></button>`).join('')}</div>`};
const KEYPAD={KeyJ:'plat',KeyK:'plat',KeyF:'tar',KeyD:'tar',Space:'bom'};
// conecta pads y teclado; cb(tiempoCorregido, pad)
function padsMount(root,cb){
  const down=e=>{const b=e.target.closest('[data-pad]');if(!b)return;e.preventDefault();padFlash(b);cb(tapTime(e),b.dataset.pad)};
  const key=e=>{const p=KEYPAD[e.code];if(!p||e.repeat||e.target.closest('input,textarea,select'))return;e.preventDefault();const b=$(`[data-pad="${p}"]`,root);if(b)padFlash(b);cb(tapTime(e),p)};
  root.addEventListener('pointerdown',down);document.addEventListener('keydown',key);
  return()=>{root.removeEventListener('pointerdown',down);document.removeEventListener('keydown',key)};
}
function padFlash(b,cls){b.classList.remove('on','ok','mid','bad','miss');void b.offsetWidth;b.classList.add('on');if(cls)b.classList.add(cls);clearTimeout(b._t);b._t=setTimeout(()=>b.classList.remove('on','ok','mid','bad','miss'),220)}
/* ---------- tira de golpes y deriva del tempo ---------- */
function stripSVG(hits){
  const W=320,H=74,x=o=>W/2+Math.max(-80,Math.min(80,o))/80*(W/2-10);
  let g=`<rect x="${x(-30)}" y="6" width="${x(30)-x(-30)}" height="${H-26}" rx="6" fill="var(--good)" opacity=".14"/><line x1="${W/2}" x2="${W/2}" y1="4" y2="${H-18}" stroke="var(--muted)" stroke-width="1.5"/>`;
  [-80,-40,0,40,80].forEach(v=>{g+=`<text x="${x(v)}" y="${H-4}" class="slab2">${v>0?'+'+v:v}</text>`});
  hits.slice(-40).forEach((h,i,a)=>{const age=a.length-1-i,cl=gradeOf(h.off)[0];g+=`<circle cx="${x(h.off).toFixed(1)}" cy="${(12+(i%5)*9).toFixed(1)}" r="${age===0?6:4.5}" fill="${h.hid?'var(--blue)':cl==='ok'?'var(--good)':cl==='mid'?'#f5b43c':'var(--root)'}" opacity="${Math.max(.25,1-age/40)}"/>`});
  return`<svg viewBox="0 0 ${W} ${H}" class="strip2" role="img" aria-label="Golpes: izquierda adelantado, derecha atrasado">${g}</svg><div class="striplab"><span>← adelantado</span><span>ms</span><span>atrasado →</span></div>`;
}
function driftSVG(pts,target,T){
  const W=320,H=140,lo=target-15,hi=target+15,x=t=>20+t/T*(W-30),y=b=>H-20-(Math.max(lo,Math.min(hi,b))-lo)/(hi-lo)*(H-36);
  let g=`<line x1="20" x2="${W-10}" y1="${y(target)}" y2="${y(target)}" stroke="var(--good)" stroke-dasharray="4 4"/>`;
  [lo,target,hi].forEach(v=>{g+=`<text x="16" y="${y(v)+4}" class="slab2" text-anchor="end">${v}</text>`});
  if(pts.length>1)g+=`<polyline fill="none" stroke="var(--accent)" stroke-width="2.5" points="${pts.map(p=>x(p.t).toFixed(1)+','+y(p.b).toFixed(1)).join(' ')}"/>`;
  if(pts.length)g+=`<circle cx="${x(pts[pts.length-1].t)}" cy="${y(pts[pts.length-1].b)}" r="5" fill="var(--accent)"/>`;
  return`<svg viewBox="0 0 ${W} ${H}" class="strip2" role="img" aria-label="Tempo a lo largo del tiempo">${g}</svg>`;
}
const offTxt=o=>o==null?'Se escapó':Math.abs(o)<=8?'¡Justo!':(o<0?'Adelantado ':'Atrasado ')+Math.round(Math.abs(o))+' ms';
