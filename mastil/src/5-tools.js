/* ---------- íconos ---------- */
const sv=(p,vb)=>`<svg viewBox="${vb||'0 0 24 24'}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const IC={
 home:sv('<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>'),
 book:sv('<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z"/><path d="M4 19V5"/><path d="M8 7h7"/>'),
 play2:sv('<path d="M6 21l4-18h4l4 18z"/><path d="M12 15l5-9"/><path d="M8 17h8"/>'),
 grid:sv('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'),
 back:sv('<path d="M15 5l-7 7 7 7"/>'),
 play:sv('<path d="M7 4l13 8-13 8z" fill="currentColor"/>'),
 stop:sv('<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>'),
 pause:sv('<path d="M8 5v14M16 5v14"/>'),
 timer:sv('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2"/><path d="M9 2h6"/>'),
 check:sv('<path d="M5 12l5 5 9-10"/>'),
 plus:sv('<path d="M12 5v14M5 12h14"/>'),
 minus:sv('<path d="M5 12h14"/>'),
 tuner:sv('<path d="M4 18a8 8 0 1116 0"/><path d="M12 18l4-7"/><circle cx="12" cy="18" r="1.5" fill="currentColor"/>'),
 game:sv('<rect x="3" y="7" width="18" height="10" rx="2"/><path d="M3 10h18M3 14h18M9 7v10M15 7v10"/>'),
 wave:sv('<path d="M2 12h3l2-6 4 12 3-9 2 3h6"/>'),
 cal:sv('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
 next:sv('<path d="M5 5l9 7-9 7z" fill="currentColor"/><path d="M19 5v14"/>'),
 x:sv('<path d="M6 6l12 12M18 6L6 18"/>'),
 voice:sv('<path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2"/>'),
 pulseflash:sv('<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/><circle cx="12" cy="12" r="3"/>'),
 sound:sv('<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12"/>'),
 mute:sv('<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/>'),
 pick:sv('<path d="M12 2.5c4 0 7.5 2 7.5 6 0 5-4 10-7.5 13-3.5-3-7.5-8-7.5-13 0-4 3.5-6 7.5-6z"/>'),
 down:sv('<path d="M12 4v12M6 11l6 6 6-6M5 20h14"/>')};
const fmt=s=>{s=Math.max(0,Math.round(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
const chipRow=(k,label,opts,cur)=>`<div><span class="cl">${label}</span><div class="chips">${opts.map(o=>`<button class="chip" data-set="${k}" data-v="${o.v}" aria-pressed="${String(o.v)===String(cur)}">${o.l}${o.s?`<i>${o.s}</i>`:''}</button>`).join('')}</div></div>`;
let OWNER='';
/* ---------- estructura común de las herramientas (como el reproductor de canciones) ----------
   portada y título; barra de íconos con su valor que abre un panel; lo principal al centro; dock con botón redondo */
const TI=d=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const TKIC={meter:TI('<path d="M4 6h16M4 12h16M4 18h16"/><path d="M9 4v16"/>'),sub:TI('<path d="M8 18V6l8-2v12"/><circle cx="6" cy="18" r="2"/><circle cx="14" cy="16" r="2"/>'),eye:TI('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>'),
  key:TI('<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>'),prog:TI('<path d="M5 19V9M10 19V5M15 19v-7M20 19v-9"/>'),style:TI('<path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2"/>'),tempo:TI('<path d="M8 21h8l-1.5-15h-5z"/><path d="M12 14l5-9"/>'),
  mode:TI('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>'),frets:TI('<path d="M3 8h18M3 12h18M3 16h18M8 5v14M15 5v14"/>'),strs:TI('<path d="M4 6h16M4 10h16M4 14h16M4 18h16"/>'),abc:TI('<path d="M4 19l5-14 5 14M6 14h6"/><path d="M17 5v14h3"/>'),
  mic:TI('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'),speed:TI('<path d="M4 15a8 8 0 1 1 16 0"/><path d="M12 15l4-5"/>'),ab:TI('<path d="M17 2l3 3-3 3"/><path d="M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3"/><path d="M20 13v2a4 4 0 0 1-4 4H4"/>'),
  back5:TI('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'),fwd5:TI('<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>')};
const TART={metro:[352,'<path d="M34 84h32l-8-62H42z"/><path d="M50 64l18-34"/><circle cx="68" cy="30" r="4" fill="#fff" stroke="none"/>'],tuner:[150,'<path d="M16 72a34 34 0 0 1 68 0"/><path d="M50 72l14-28"/><circle cx="50" cy="72" r="4" fill="#fff" stroke="none"/>'],
  trk:[28,'<path d="M8 50c8-18 14-18 20 0s12 18 20 0 14-26 22-8 10 22 22 4"/>'],game:[200,'<path d="M10 30h80M10 46h80M10 62h80M10 78h80M30 24v60M54 24v60M76 24v60"/><circle cx="54" cy="46" r="6" fill="#fff" stroke="none"/>'],
  rt:[205,'<circle cx="50" cy="48" r="28"/><path d="M50 30v18l12 8"/>'],slow:[265,'<path d="M16 66a34 34 0 0 1 68 0"/><path d="M50 66l-16-20"/><circle cx="50" cy="66" r="4" fill="#fff" stroke="none"/>'],rec:[330,'<circle cx="50" cy="48" r="14" fill="#fff" fill-opacity=".9" stroke="none"/><circle cx="50" cy="48" r="28"/>']};
function toolHead(k,title,eyebrow){const[h,m]=TART[k];return`<div class="kamb tamb" style="--th:${h}" aria-hidden="true"></div><div class="khead"><span class="sart big tcov">${coverArt(h,m,null,'t'+k)}</span><div class="kht"><span class="eyebrow">${eyebrow}</span><h2>${title}</h2><small class="kmeta" id="tmeta"></small></div></div>`}
function toolBar(items){const n=items.length;return`<div class="ktools" role="toolbar" style="--nt:${n};--ntm:${n<=3?n:n===4?2:3}">${items.map(([k,l,ic])=>`<button class="ktool" data-panel="${k}" aria-pressed="false">${ic}<b id="tv-${k}"></b><small>${l}</small></button>`).join('')}</div>`}
function toolPanels(ps){return`<div class="kpanels card kctl" hidden>${ps.map(([k,t,h])=>`<div class="kpanel" data-p="${k}" hidden><div class="kph"><b>${t}</b><button class="kic" data-pclose aria-label="Cerrar">${IC.x}</button></div>${h}</div>`).join('')}</div>`}
// latido: el fondo de color y el botón redondo respiran con el pulso (no se mueve si el teléfono pide menos movimiento)
const RMOT=matchMedia('(prefers-reduced-motion: reduce)');
function beatPulse(root,strong){
  if(RMOT.matches||document.hidden)return;const a=root.querySelector('.kamb'),p=root.querySelector('.kplayb');
  if(a&&a.animate)a.animate([{opacity:strong?.9:.72,transform:`scale(${strong?1.07:1.04})`},{opacity:.45,transform:'scale(1)'}],{duration:strong?560:400,easing:'cubic-bezier(.2,.7,.3,1)'});
  if(p&&p.animate)p.animate([{transform:`scale(${strong?1.09:1.05})`},{transform:'scale(1)'}],{duration:strong?300:240,easing:'ease-out'});
}
const toolDock=inner=>`<div class="kbar tdock"><div class="kbrow">${inner}</div></div>`;
const playLbl=(on,l1,l2,i1,i2)=>`${on?(i2||IC.stop):(i1||IC.play)}<span>${on?l2:l1}</span>`;
// abre y cierra paneles y repinta los valores de la barra tras cada toque
function toolMount(r,vals){
  const openP=k=>{const box=$('.kpanels',r);if(!box)return;const cur=box.hidden?null:box.dataset.open;$$('.ktool',r).forEach(b=>b.setAttribute('aria-pressed','false'));
    if(!k||cur===k){box.hidden=true;box.dataset.open='';return}box.hidden=false;box.dataset.open=k;$$('.kpanel',r).forEach(p=>p.hidden=p.dataset.p!==k);$(`.ktool[data-panel="${k}"]`,r).setAttribute('aria-pressed','true')};
  const paint=()=>{const v=vals();for(const k in v){const e=k==='meta'?$('#tmeta',r):$('#tv-'+k,r);if(e)e.textContent=v[k]}};
  r.addEventListener('click',e=>{const pb=e.target.closest('[data-panel]');if(pb){openP(pb.dataset.panel);return}if(e.target.closest('[data-pclose]')){openP(null);return}setTimeout(paint,0)});
  paint();return paint;
}

/* ---------- metrónomo ---------- */
const TAPS=[];
function viewMetronome(){
  const beats=()=>{const m=METERS[MET.meter];return Array.from({length:m.b},(_,i)=>`<i style="--k:${i}" class="${(i===0?acc1():m.acc.includes(i))?'acc':''}"></i>`).join('')};
  const SUBN={1:'Negras',2:'Corcheas',3:'Tresillos',4:'Semicorch.'};
  return{title:'Metrónomo',back:'#/practicar',html:`<div class="kplay tplay">
  ${toolHead('metro','Metrónomo','Pulso')}
  ${toolBar([['meter','Compás',TKIC.meter],['sub','Subdivisión',TKIC.sub],['pulse','Ver el pulso',TKIC.eye]])}
  ${toolPanels([['meter','Compás',chipRow('meter','Compás',Object.keys(METERS).map(v=>({v,l:v})),MET.meter)],['sub','Subdivisión',chipRow('sub','Subdivisión',[{v:1,l:'Negras'},{v:2,l:'Corcheas'},{v:3,l:'Tresillos'},{v:4,l:'Semicorcheas'}],MET.sub)],['pulse','Ver el pulso',pulseOptions()]])}
  <div class="card center metstage">
    <div class="dial"><div class="beats" id="beats" style="--n:${METERS[MET.meter].b}">${beats()}</div>
     <div class="dc"><div class="big" id="bpmv">${MET.bpm}</div><div class="cl" style="margin:0">BPM</div></div></div>
    <div class="row mstep" style="justify-content:center">
      <button class="btn sm" data-m="-5">−5</button><button class="btn sm" data-m="-1">−1</button>
      <button class="btn sm" data-m="1">+1</button><button class="btn sm" data-m="5">+5</button></div>
    <input type="range" id="bpmr" min="30" max="240" value="${MET.bpm}" aria-label="Tempo en BPM">
    <button class="btn" id="tap">Marcar tempo</button>
  </div>
  <p class="cap">Consejo: empieza 20 bpm por debajo de tu velocidad cómoda y sube de 5 en 5 solo cuando salga limpio tres veces seguidas.</p>
  ${toolDock(`<span class="tm" id="tdm"></span><div class="ktrans"><button class="kic" data-m="-1" aria-label="Bajar 1 bpm">${IC.minus}</button><button class="kplayb" id="metgo"></button><button class="kic" data-m="1" aria-label="Subir 1 bpm">${IC.plus}</button></div><span></span>`)}
  </div>`,
  mount(r){
    const go=$('#metgo',r),bv=$('#bpmv',r),rg=$('#bpmr',r);
    const light=(b,isBeat)=>{if(!isBeat)return;$$('#beats i',r).forEach((x,i)=>x.classList.toggle('on',i===b));beatPulse(r,b===0)};
    const running=()=>SEQ.id==='met'&&OWNER==='tool';
    const tv=toolMount(r,()=>({meter:MET.meter,sub:SUBN[MET.sub],pulse:DB.metMute?'Solo vista':DB.flash?'Destello':'Barra',meta:`${MET.bpm} bpm · ${MET.meter} · ${SUBN[MET.sub].toLowerCase()}`}));
    const paint=()=>{go.innerHTML=playLbl(running(),'Iniciar','Detener');bv.textContent=MET.bpm;rg.value=MET.bpm;$('#tdm',r).textContent=running()?`Sonando · ${MET.bpm} bpm`:`${MET.meter} · listo`;tv();if(!running())$$('#beats i',r).forEach(x=>x.classList.remove('on'))};
    const setBpm=v=>{MET.bpm=Math.max(30,Math.min(240,Math.round(v)));DB.met=MET.bpm;save();if(SEQ.id==='met')SEQ.label='Metrónomo '+MET.bpm;paint();emitState()};
    if(SEQ.id==='met'){OWNER='tool';SEQ.ui=s=>light(Math.floor(s/MET.sub)%METERS[MET.meter].b,s%MET.sub===0)}
    go.onclick=()=>{if(running())seqStop();else{OWNER='tool';metStart({},light)}paint()};
    rg.oninput=()=>setBpm(+rg.value);
    $$('[data-m]',r).forEach(b=>b.onclick=()=>setBpm(MET.bpm+ +b.dataset.m));
    $('#tap',r).onclick=()=>{const n=performance.now();if(TAPS.length&&n-TAPS[TAPS.length-1]>2000)TAPS.length=0;TAPS.push(n);if(TAPS.length>5)TAPS.shift();const tb=$('#tap',r);if(ac())tick(AC.currentTime+.01,'beat');if(TAPS.length>=2){const d=(TAPS[TAPS.length-1]-TAPS[0])/(TAPS.length-1);setBpm(60000/d);tb.textContent='Marcar tempo · '+TAPS.length+' toques'}else tb.textContent='Sigue tocando al pulso…';clearTimeout(tb._t);tb._t=setTimeout(()=>{tb.textContent='Marcar tempo'},2200)};
    $$('[data-set]',r).forEach(b=>b.onclick=()=>{const k=b.dataset.set;MET[k]=k==='sub'?+b.dataset.v:b.dataset.v;$$(`[data-set="${k}"]`,r).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('#beats',r).innerHTML=beats();$('#beats',r).style.setProperty('--n',METERS[MET.meter].b);DB.meter=MET.meter;DB.sub=MET.sub;save()});
    const h=()=>paint();document.addEventListener('playstate',h);paint();
    return()=>{document.removeEventListener('playstate',h);if(SEQ.id==='met'&&OWNER==='tool')SEQ.ui=null};
  }};
}
/* ---------- afinador ---------- */
const TUN={stream:null,an:null,src:null,iv:null,buf:null,hist:[]};
function detectPitch(buf,sr){
  if(INST.id==='bajo')return bassPitch(buf,sr);
  let n=buf.length,rms=0;for(let i=0;i<n;i++)rms+=buf[i]*buf[i];rms=Math.sqrt(rms/n);
  if(rms<.01)return -1;
  let r1=0,r2=n-1;const th=.2;
  for(let i=0;i<n/2;i++)if(Math.abs(buf[i])<th){r1=i;break}
  for(let i=1;i<n/2;i++)if(Math.abs(buf[n-i])<th){r2=n-i;break}
  const b=buf.subarray(r1,r2);n=b.length;
  const maxLag=Math.min(n-1,Math.floor(sr/60)),c=new Float32Array(maxLag+2);
  for(let l=0;l<=maxLag+1;l++){let s=0;for(let j=0;j<n-l;j++)s+=b[j]*b[j+l];c[l]=s}
  let d=0;while(d<maxLag&&c[d]>c[d+1])d++;
  let mv=-1,mp=-1;for(let i=d;i<=maxLag;i++)if(c[i]>mv){mv=c[i];mp=i}
  if(mp<1)return -1;
  let T=mp;const x1=c[T-1],x2=c[T],x3=c[T+1],a=(x1+x3-2*x2)/2,bb=(x3-x1)/2;if(a)T=T-bb/(2*a);
  const f=sr/T;return f>60&&f<1200?f:-1;
}
async function tunerStart(onData,onErr){
  if(!window.isSecureContext||!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){onErr('nosupport');return}
  try{
    const s=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
    const c=ac();TUN.stream=s;TUN.src=c.createMediaStreamSource(s);TUN.an=c.createAnalyser();TUN.an.fftSize=INST.fft;
    TUN.src.connect(TUN.an);TUN.buf=new Float32Array(TUN.an.fftSize);TUN.hist=[];
    TUN.iv=setInterval(()=>{
      TUN.an.getFloatTimeDomainData(TUN.buf);const f=detectPitch(TUN.buf,c.sampleRate);
      if(f>0){TUN.hist.push(f);if(TUN.hist.length>5)TUN.hist.shift();const sorted=[...TUN.hist].sort((a,b)=>a-b);onData(sorted[Math.floor(sorted.length/2)])}else{TUN.hist=[];onData(null)}
    },70);
    emitState();
  }catch(e){onErr(e&&e.name==='NotAllowedError'?'denied':e&&e.name==='NotFoundError'?'nomic':'other')}
}
function tunerStop(){
  if(TUN.iv)clearInterval(TUN.iv);TUN.iv=null;
  if(TUN.stream)TUN.stream.getTracks().forEach(t=>t.stop());
  try{TUN.src&&TUN.src.disconnect()}catch(e){}
  TUN.stream=TUN.src=TUN.an=null;emitState();
}
function viewTuner(){
  const ticks=[-50,-25,0,25,50].map(c=>{const a=(c/50)*60*Math.PI/180,x1=150+Math.sin(a)*112,y1=150-Math.cos(a)*112,x2=150+Math.sin(a)*126,y2=150-Math.cos(a)*126;return`<line class="tickm" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/><text class="lab" x="${(150+Math.sin(a)*142).toFixed(1)}" y="${(154-Math.cos(a)*142).toFixed(1)}">${c>0?'+'+c:c}</text>`}).join('');
  return{title:'Afinador',back:'#/practicar',html:`<div class="kplay tplay">
  ${toolHead('tuner','Afinador','Afinación · '+(TUNINGS[DB.tuning||'std']||TUNINGS.std).n)}
  <div class="card center tstage">
    <svg class="gauge" id="gauge" viewBox="0 0 300 170" role="img" aria-label="Desviación en cents"><path d="M ${150-120*Math.sin(Math.PI/3)} ${150-120*Math.cos(Math.PI/3)} A 120 120 0 0 1 ${150+120*Math.sin(Math.PI/3)} ${150-120*Math.cos(Math.PI/3)}" fill="none" stroke="var(--line)" stroke-width="6"/>${ticks}<line class="needle" id="needle" x1="150" y1="150" x2="150" y2="44" style="transform-origin:150px 150px"/><circle cx="150" cy="150" r="7" fill="var(--accent)"/></svg>
    <div class="tnote" id="tn">—</div>
    <div class="cap" id="thz" style="margin:0">Toca una cuerda al aire</div>
    <div id="tmsg"></div>
  </div>
  <div class="card center">
    <span class="cl">Toca una cuerda para escuchar su nota</span>
    <div class="strs" id="tstrs"></div>
    <div class="chips hscroll">${Object.entries(TUNINGS).map(([k,v])=>`<button class="chip" data-tun="${k}" aria-pressed="${(DB.tuning||'std')===k}">${v.n}</button>`).join('')}</div>
  </div>
  <p class="cap">Afina siempre subiendo hacia la nota: si te pasas, baja un poco la cuerda y vuelve a subir. Dentro de ±5 cents la aguja se pone verde.</p>
  ${toolDock(`<span class="tm" id="tdst"></span><div class="ktrans"><button class="kplayb" id="tgo"></button></div><span></span>`)}
  </div>`,
  mount(r){
    const go=$('#tgo',r),tn=$('#tn',r),hz=$('#thz',r),nd=$('#needle',r),g=$('#gauge',r),msg=$('#tmsg',r);
    const paint=()=>{go.innerHTML=playLbl(!!TUN.stream,'Activar micrófono','Detener micrófono',TKIC.mic);$('#tdst',r).textContent=TUN.stream?'Escuchando tu '+INST.instrumento+'…':'Micrófono apagado';const m=$('#tmeta',r);if(m)m.textContent='Afinación '+((TUNINGS[DB.tuning||'std']||TUNINGS.std).n).toLowerCase()};
    const show=f=>{
      if(!f){g.classList.remove('in');return}
      const m=69+12*Math.log2(f/440),n=Math.round(m),c=Math.round((m-n)*100);
      tn.innerHTML=`${PCS[((n%12)+12)%12][0]}<small>${Math.floor(n/12)-1}</small>`;
      hz.textContent=f.toFixed(1)+' Hz · '+(c>0?'+':'')+c+' cents'+(Math.abs(c)<=5?' · afinada':c<0?' · sube':' · baja');
      nd.style.transform=`rotate(${Math.max(-60,Math.min(60,c/50*60))}deg)`;g.classList.toggle('in',Math.abs(c)<=5);
      const TS=tuningStrings(),near=TS.reduce((a,s)=>Math.abs(s.m-m)<Math.abs(a.m-m)?s:a,TS[0]);
      $$('.strs button',r).forEach(b=>b.classList.toggle('on',+b.dataset.ref===near.m&&Math.abs(near.m-m)<1.5));
    };
    const err=k=>{msg.innerHTML=`<p class="msg err">${{denied:'El micrófono está bloqueado. Permite el acceso al micrófono para este sitio en los ajustes del navegador y vuelve a intentarlo.',nomic:'No se encontró un micrófono en este dispositivo.',nosupport:'Este navegador no permite usar el micrófono aquí. Abre la app instalada o el sitio en Chrome o Safari.',other:'No se pudo iniciar el micrófono. Vuelve a intentarlo.'}[k]}</p>`;paint()};
    go.onclick=async()=>{msg.innerHTML='';if(TUN.stream){tunerStop();tn.textContent='—';hz.textContent='Toca una cuerda al aire';g.classList.remove('in');nd.style.transform='rotate(0)'}else{seqStop();await tunerStart(show,err)}paint()};
    const strs=()=>{$('#tstrs',r).innerHTML=tuningStrings().map(s=>`<button data-ref="${s.m}" data-s="${s.s}"><span>${s.n}</span><small>${s.s}ª</small></button>`).join('')};strs();
    r.addEventListener('click',e=>{const b=e.target.closest('[data-ref]');if(b){if(!ac())return;pluck(+b.dataset.ref,AC.currentTime+.02,2.6,.3);return}
      const u=e.target.closest('[data-tun]');if(u){DB.tuning=u.dataset.tun;save();$$('[data-tun]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===u)));strs();paint()}});
    paint();
    return()=>tunerStop();
  }};
}
/* ---------- juego del mástil ---------- */
const GAME={mode:'find',range:5,str:0,nat:1};
const NATPC=[0,2,4,5,7,9,11];
function gameKey(){return[GAME.mode,GAME.range,GAME.str,GAME.nat].join('-')}
function gameComponent(host,opts){
  opts=opts||{};let st=null,iv=null;
  const pcsAllowed=()=>GAME.nat?NATPC:[0,1,2,3,4,5,6,7,8,9,10,11];
  const strings=()=>GAME.str?[GAME.str]:INST.strings;
  const newTarget=()=>{
    const cand=[];strings().forEach(s=>{for(let f=0;f<=GAME.range;f++){const pc=(OPEN_PC[s]+f)%12;if(pcsAllowed().includes(pc))cand.push({s,f,pc})}});
    let t;do{t=cand[Math.floor(Math.random()*cand.length)]}while(st&&st.t&&cand.length>1&&t.pc===st.t.pc&&(GAME.mode==='find'||t.s===st.t.s));
    return t;
  };
  const idle=()=>{
    const best=DB.game[gameKey()]||0;
    host.innerHTML=`<div class="center" style="padding:10px 0"><p class="sub" style="text-align:center">${GAME.mode==='find'?'Aparece el nombre de una nota: tócala en el mástil.':'Aparece un punto en el mástil: elige qué nota es.'} Tienes 60 segundos.</p><p class="cap" style="margin:0">Récord con esta configuración: <b>${best}</b></p><button class="btn pri" data-g="start" style="min-width:180px">${IC.play}Empezar</button></div>`;
  };
  const board=(extra)=>fretboard(Object.assign({to:Math.max(5,GAME.range),tap:GAME.mode==='find'},extra||{}));
  const render=()=>{
    const t=st.t,left=Math.max(0,st.end-Date.now())/1000;
    const q=GAME.mode==='find'?`<div class="gq">${PCS[t.pc][0]}</div><p class="cap" style="text-align:center;margin:0">${GAME.str?'en la cuerda '+GAME.str:'en cualquier cuerda'}</p>`:'';
    const dots=GAME.mode==='name'?[{s:t.s,f:t.f,k:'root',t:'?'}]:[];
    const names=GAME.mode==='name'?`<div class="notes12">${pcsAllowed().map(pc=>`<button data-g="pick" data-pc="${pc}">${PCS[pc][0]}</button>`).join('')}</div>`:'';
    host.innerHTML=`<div class="game-top"><span class="tm" id="gtl">${fmt(left)}</span><span class="tm">Aciertos: <b id="gsc">${st.score}</b></span><button class="btn sm" data-g="quit">Terminar</button></div><div class="bar" style="margin:10px 0"><i id="gbar" style="width:${left/60*100}%"></i></div>${q}<div id="gb">${board({dots})}</div>${names}`;
  };
  const end=()=>{
    clearInterval(iv);iv=null;const k=gameKey(),prev=DB.game[k]||0,rec=st.score>prev;
    if(rec){DB.game[k]=st.score;save()}
    const acc=st.score+st.miss?Math.round(st.score/(st.score+st.miss)*100):0;
    host.innerHTML=`<div class="center" style="padding:10px 0"><div class="big">${st.score}</div><p class="sub">aciertos · ${acc}% de precisión</p><p class="cap" style="margin:0">${rec?'¡Nuevo récord!':'Récord: '+prev}</p><button class="btn pri" data-g="start">${IC.play}Otra vez</button></div>`;
    st.running=false;GAMEON=false;
    if(opts.onEnd)opts.onEnd(st.score);
  };
  const tickG=()=>{if(!st||!st.running)return;const left=Math.max(0,st.end-Date.now())/1000;const a=$('#gtl',host),b=$('#gbar',host);if(a)a.textContent=fmt(left);if(b)b.style.width=(left/60*100)+'%';if(left<=0)end()};
  const answer=(ok,s,f)=>{
    if(ok){st.score++}else st.miss++;
    playNotes([OPEN_MIDI[s]+f],'chord');
    if(ok){st.t=newTarget();render()}
    else{const gb=$('#gb',host);if(GAME.mode==='find'){gb.innerHTML=board({dots:[{s,f,k:'bad',t:PCS[(OPEN_PC[s]+f)%12][0]}]})}}
  };
  host.onclick=e=>{
    const b=e.target.closest('[data-g]');
    if(b){const a=b.dataset.g;
      if(a==='start'){ac();st={score:0,miss:0,end:Date.now()+60000,running:true,t:null};st.t=newTarget();GAMEON=true;render();iv=setInterval(tickG,200);return}
      if(a==='quit'){end();return}
      if(a==='pick'&&st&&st.running){const pc=+b.dataset.pc,ok=pc===st.t.pc;if(!ok){b.classList.add('no');b.disabled=true}answer(ok,st.t.s,st.t.f);return}
    }
    const c=e.target.closest('.cell');
    if(c&&st&&st.running&&GAME.mode==='find'){const s=+c.dataset.s,f=+c.dataset.f,pc=(OPEN_PC[s]+f)%12;answer(pc===st.t.pc&&(!GAME.str||s===GAME.str),s,f)}
  };
  idle();
  return()=>{if(iv)clearInterval(iv);GAMEON=false};
}
let GAMEON=false;
function viewGame(){
  return{title:'Juego del mástil',back:'#/practicar',html:`<div class="kplay tplay">
  ${toolHead('game','Juego del mástil','Contra reloj')}
  ${toolBar([['mode','Modo',TKIC.mode],['range','Trastes',TKIC.frets],['str','Cuerdas',TKIC.strs],['nat','Notas',TKIC.abc]])}
  ${toolPanels([['mode','Modo',chipRow('mode','Modo',[{v:'find',l:'Encuentra la nota'},{v:'name',l:'¿Qué nota es?'}],GAME.mode)],['range','Trastes',chipRow('range','Trastes',[{v:5,l:'0 a 5'},{v:12,l:'0 a 12'}],GAME.range)],
    ['str','Cuerdas',chipRow('str','Cuerdas',[{v:0,l:'Todas'},...INST.desc.map(v=>({v,l:'Cuerda '+v}))],GAME.str)],['nat','Notas',chipRow('nat','Notas',[{v:1,l:'Solo naturales'},{v:0,l:'Las 12'}],GAME.nat)]])}
  <div class="card" id="gamehost"></div></div>`,
  mount(r){
    let stop=gameComponent($('#gamehost',r));
    toolMount(r,()=>({mode:GAME.mode==='find'?'Encontrar':'Nombrar',range:'0 a '+GAME.range,str:GAME.str?'Cuerda '+GAME.str:'Todas',nat:GAME.nat?'Naturales':'Las 12',meta:`Récord: ${DB.game[gameKey()]||0} aciertos en un minuto`}));
    $$('[data-set]',r).forEach(b=>b.onclick=()=>{const k=b.dataset.set;GAME[k]=k==='mode'?b.dataset.v:+b.dataset.v;$$(`[data-set="${k}"]`,r).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));stop();stop=gameComponent($('#gamehost',r))});
    return()=>stop();
  }};
}
/* ---------- pistas ---------- */
function trkFlat(){return[0,7,8,9,10,11].includes(TRK.k)}
trkName=function(i){const c=trkChord(i);return pcName(c.pc,trkFlat()).us+CT[c.t].suf};
function trkScaleBoard(ci){
  const P=PROG2[TRK.p],S=SCALES2[P.sc],kp=KEYS[TRK.k].pc,pcs=S.semis.map(x=>(kp+x)%12);
  const c=ci>=0?trkChord(ci):null,ct=c?CT[c.t].semis.map(x=>(c.pc+x)%12):[];
  const dots=pos(pcs,0,15).map(([s,f])=>{const pc=(OPEN_PC[s]+f)%12;return{s,f,t:pcName(pc,trkFlat()).es,k:c&&pc===c.pc?'root':ct.includes(pc)?'note':'faint'}});
  return fretboard({to:15,dots,label:'Escala sugerida'});
}
function trkChips(cur){return PROG2[TRK.p].it.map((_,i)=>`<div class="pchip ${i===cur?'cur':''}"><b>${trkName(i)}</b><small>${i+1}</small></div>`).join('')}
function viewTracks(){
  return{title:'Pistas para improvisar',back:'#/practicar',html:`<div class="kplay tplay">
  ${toolHead('trk','Pistas para improvisar','Improvisa')}
  ${toolBar([['k','Tono',TKIC.key],['p','Progresión',TKIC.prog],['st','Estilo',TKIC.style],['bpm','Tempo',TKIC.tempo]])}
  ${toolPanels([['k','Tonalidad',chipRow('k','Tonalidad',KEYS.map((x,i)=>({v:i,l:x.es,s:x.us})),TRK.k)],['p','Progresión',chipRow('p','Progresión',Object.keys(PROG2).map(v=>({v,l:PROG2[v].n})),TRK.p)],
    ['st','Estilo',chipRow('st','Estilo',Object.keys(STYLES).map(v=>({v,l:STYLES[v].n})),TRK.st)],['bpm','Tempo',`<div class="row"><button class="btn sm" data-b="-5">−5</button><span class="kkey" id="tbpm" style="min-width:90px;text-align:center">${TRK.bpm} bpm</span><button class="btn sm" data-b="5">+5</button></div>`]])}
  <div class="card"><span class="cl">Acordes · <span id="tstat">detenida</span></span><div class="strip" id="tchips">${trkChips(-1)}</div>
   <p class="cap" style="margin:0 0 10px" id="ttip"></p><div id="tboard">${trkScaleBoard(-1)}</div>
   <p class="cap">Rojo: raíz del acorde que suena. Ámbar: notas del acorde. Tenue: el resto de la escala sugerida.</p></div>
  <div class="row" style="justify-content:center"><button class="btn" id="tbeatgo">Tocar con un beat en Om Estudio</button></div>
  ${toolDock(`<span class="tm" id="tdm"></span><div class="ktrans"><button class="kic" data-b="-5" aria-label="Más lento">${IC.minus}</button><button class="kplayb" id="tgo"></button><button class="kic" data-b="5" aria-label="Más rápido">${IC.plus}</button></div><span></span>`)}
  </div>`,
  mount(r){
    const go=$('#tgo',r);
    const ui=(ci,lab)=>{$('#tchips',r).innerHTML=trkChips(ci);$('#tboard',r).innerHTML=trkScaleBoard(ci);$('#tstat',r).textContent=lab==='cuenta'?'cuenta inicial':ci>=0?'sonando '+trkName(ci):'detenida'};
    const running=()=>SEQ.id==='trk'&&OWNER==='tool';
    const tip=()=>{$('#ttip',r).innerHTML=`<b>Escala sugerida:</b> ${SCALES2[PROG2[TRK.p].sc].n} de ${KEYS[TRK.k].es}. ${PROG2[TRK.p].tip}`};
    const tv=toolMount(r,()=>({k:KEYS[TRK.k].es,p:PROG2[TRK.p].n,st:STYLES[TRK.st].n,bpm:TRK.bpm,meta:`${KEYS[TRK.k].es} · ${PROG2[TRK.p].n} · ${STYLES[TRK.st].n} · ${TRK.bpm} bpm`}));
    const paint=()=>{go.innerHTML=playLbl(running(),'Tocar pista','Detener');$('#tbpm',r).textContent=TRK.bpm+' bpm';$('#tdm',r).textContent=running()?'Sonando':'Lista';tv();if(!running())ui(-1,'')};
    const restart=()=>{if(running()){trkStart(ui)}};
    if(SEQ.id==='trk'){OWNER='tool';SEQ.ui=s=>{const L=STYLES[TRK.st].steps,bar=Math.floor(s/L)-1;if(s%L===0)ui(bar<0?-1:bar%PROG2[TRK.p].it.length,bar<0?'cuenta':'')}}
    go.onclick=()=>{if(running())seqStop();else{OWNER='tool';trkStart(ui)}paint()};
    $$('[data-b]',r).forEach(b=>b.onclick=()=>{TRK.bpm=Math.max(50,Math.min(200,TRK.bpm+ +b.dataset.b));paint()});
    $$('[data-set]',r).forEach(b=>b.onclick=()=>{const k=b.dataset.set;TRK[k]=k==='k'?+b.dataset.v:b.dataset.v;if(k==='st')TRK.bpm=STYLES[TRK.st].bpm;$$(`[data-set="${k}"]`,r).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));tip();restart();paint();if(!running())ui(-1,'')});
    $('#tbeatgo',r).onclick=()=>{location.href=estudioLink(KEYS[TRK.k].pc,['menor','andaluza','dorico'].includes(TRK.p),TRK.bpm,TRK.st==='ranchera'?'ranchera':TRK.st,TRK.st==='ranchera'?3:4)};
    const h=()=>paint();document.addEventListener('playstate',h);tip();paint();
    return()=>{document.removeEventListener('playstate',h);if(SEQ.id==='trk'&&OWNER==='tool')SEQ.ui=null};
  }};
}
/* ---------- rutina diaria ---------- */
const RT={len:15,i:-1,stopGame:null};
function rtBlocks(){
  const ex=nextEx(),sc={10:[2,2,4,2],15:[3,3,6,3],30:[5,5,14,6]}[RT.len];
  return[
   {t:'Calentamiento',d:'Cromático 1-2-3-4: un dedo por traste en cada cuerda, de la 6 a la 1 y de regreso. Mueve la mano un traste y repite.',min:sc[0],met:60},
   {t:'Mástil',d:'Juego: encuentra la nota. Juega rondas de un minuto.',min:sc[1],game:true},
   {t:'Lección',d:ex?`Lección ${ex.lesson} · ${ex.t}`:'Repasa el ejercicio que más te costó.',min:sc[2],ex},
   {t:'Improvisar',d:'Blues en La: pentatónica menor, frases cortas y silencios.',min:sc[3],trk:{k:3,p:'blues',st:'rock',bpm:84}}];
}
function viewRoutine(){
  return{title:'Rutina diaria',back:'#/practicar',html:`<div class="kplay tplay">
  ${toolHead('rt','Rutina diaria','Plan de hoy')}
  <div class="card center rtstage">
    <div class="seg" id="rtlen">${[10,15,30].map(v=>`<button data-len="${v}" aria-pressed="${v===RT.len}">${v} min</button>`).join('')}</div>
    <div class="big" id="rttime">${fmt(RT.len*60)}</div><span class="cl" id="rtlab" style="margin:0">Lista para empezar</span>
  </div>
  <div class="card"><div id="rtsteps"></div></div>
  <div id="rtbody"></div>
  <div class="kbar tdock"><div class="kbrow" id="rtctl"></div></div>
  </div>`,
  mount(r){
    const B=()=>rtBlocks();
    const steps=()=>{$('#rtsteps',r).innerHTML=B().map((b,i)=>`<div class="rt-step ${i===RT.i?'cur':i<RT.i?'past':''}"><span class="n">${i+1}</span><div><b>${b.t} · ${b.min} min</b><span>${esc(b.d)}</span></div></div>`).join('')};
    const ctl=()=>{
      const on=RT.i>=0;
      const b=B()[RT.i];
      $('#rtctl',r).innerHTML=on?`<span class="tm">${b?esc(b.t):''}</span><div class="ktrans"><button class="kic" data-rt="end" aria-label="Terminar">${IC.x}</button><button class="kplayb" data-rt="pause">${playLbl(!TMR.paused,'Reanudar','Pausa',IC.play,IC.pause)}</button><button class="kic" data-rt="next" aria-label="Siguiente bloque">${IC.next}</button></div><span></span>`
        :`<span class="tm">${RT.len} min · 4 bloques</span><div class="ktrans"><button class="kplayb" data-rt="start">${playLbl(false,'Empezar rutina','')}</button></div><span></span>`;
      const m=$('#tmeta',r);if(m)m.textContent=`${RT.len} minutos: ${INST.id==='bateria'?'rudimentos, groove, lección y banda':'calentamiento, mástil, lección e improvisación'}`;
      $('#rtlen',r).style.display=on?'none':'';
    };
    const body=()=>{
      if(RT.stopGame){RT.stopGame();RT.stopGame=null}
      const b=B()[RT.i],el=$('#rtbody',r);
      if(!b){el.innerHTML='';return}
      $('#rtlab',r).textContent=b.t;
      if(b.game){el.innerHTML='<div class="card" id="rtgame"></div>';GAME.mode='find';GAME.range=12;GAME.str=0;RT.stopGame=gameComponent($('#rtgame',el))}
      else if(b.ex){el.innerHTML=exCard(b.ex,true);paintEx(el)}
      else el.innerHTML=`<div class="card"><h3>${b.t}</h3><p class="cap">${esc(b.d)}</p></div>`;
      if(b.met){OWNER='rt';metStart({bpm:b.met,meter:'4/4',sub:1})}
      else if(b.trk){OWNER='rt';Object.assign(TRK,b.trk);trkStart()}
      else if(SEQ.id&&OWNER==='rt')seqStop();
    };
    const go=i=>{RT.i=i;const b=B()[i];if(!b){finish();return}tmrStart('rt',b.min*60);steps();ctl();body()};
    const finish=()=>{tmrStop();if(SEQ.id&&OWNER==='rt')seqStop();if(RT.stopGame){RT.stopGame();RT.stopGame=null}const done=RT.i>=B().length;RT.i=-1;if(done){markDay();bell()}steps();ctl();$('#rtbody',r).innerHTML=done?'<div class="card center"><h2>Rutina completa</h2><p class="sub">Buen trabajo. Tu racha quedó registrada.</p><a class="btn pri" href="#/">Volver al inicio</a></div>':'';$('#rttime',r).textContent=fmt(RT.len*60);$('#rtlab',r).textContent=done?'Completada':'Lista para empezar'};
    r.addEventListener('click',e=>{
      const l=e.target.closest('[data-len]');if(l){RT.len=+l.dataset.len;$$('[data-len]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===l)));$('#rttime',r).textContent=fmt(RT.len*60);steps();return}
      const a=e.target.closest('[data-rt]');if(!a)return;
      const k=a.dataset.rt;
      if(k==='start')go(0);else if(k==='next')go(RT.i+1);else if(k==='end')finish();else if(k==='pause'){tmrPause();if(TMR.paused&&SEQ.id&&OWNER==='rt')seqStop();ctl()}
    });
    const ht=e=>{if(e.detail.id==='rt')$('#rttime',r).textContent=fmt(e.detail.left)};
    const hd=e=>{if(e.detail.id==='rt')go(RT.i+1)};
    document.addEventListener('tmr',ht);document.addEventListener('tmrdone',hd);
    steps();ctl();if(RT.i>=0)body();
    return()=>{document.removeEventListener('tmr',ht);document.removeEventListener('tmrdone',hd);if(RT.stopGame){RT.stopGame();RT.stopGame=null}if(RT.i>=0){tmrStop();if(SEQ.id&&OWNER==='rt')seqStop();RT.i=-1}};
  }};
}
