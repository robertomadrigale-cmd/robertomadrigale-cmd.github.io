/* ---------- widget de groove ---------- */
let GW=0;
function grooveCard(gid,opts){return`<div class="widget gw" data-gw="${gid}"${opts&&opts.compact?' data-compact="1"':''}></div>`}
function mountGroove(host,gid){
  const g=G[gid],uid='g'+(++GW),own='grv:'+uid;
  const st={bpm:DB.gbpm&&DB.gbpm[gid]||g.bpm,click:true,muted:[]};
  const rows=ROW_ORDER.filter(r=>g.rows[r]);
  host.innerHTML=`<div class="gh"><div><span class="cl" style="margin:0">${g.cat}</span><h3>${g.n}</h3></div>
   <div class="row"><span class="minimet"><button class="icon-btn" data-gq="-5" aria-label="Bajar tempo">${IC.minus}</button><span class="v" data-gv>${st.bpm} bpm</span><button class="icon-btn" data-gq="5" aria-label="Subir tempo">${IC.plus}</button></span><button class="btn sm" data-gp></button></div></div>
   <div data-grid>${grooveGrid(g,{muted:st.muted})}</div>
   ${g.hands?`<p class="cap" style="margin-top:6px">Manos: <b class="mono">${g.hands.replace(/(.{4})/g,'$1 ').trim()}</b> · D = derecha, I = izquierda</p>`:''}
   <div class="row" style="margin-top:10px"><span class="cl" style="margin:0">Toca tú:</span>${rows.map(r=>`<button class="chip" data-gm="${r}" aria-pressed="false">${ROWS[r].n}</button>`).join('')}<button class="chip" data-gc aria-pressed="true">Click</button></div>`;
  const play=$('[data-gp]',host),cells=()=>$$('[data-i]',host);
  let last=-1;
  const ui=(i,count)=>{if(last>=0)cells().forEach(c=>{if(+c.dataset.i===last)c.classList.remove('now')});last=i;if(i>=0)cells().forEach(c=>{if(+c.dataset.i===i)c.classList.add('now')})};
  const on=()=>SEQ.id==='grv'&&OWNER===own;
  const paint=()=>{play.innerHTML=on()?IC.stop+'Detener':IC.play+'Tocar';play.classList.toggle('on',on());$('[data-gv]',host).textContent=st.bpm+' bpm';if(!on()&&last>=0)ui(-1)};
  const start=()=>{OWNER=own;grooveStart(own,g,st,ui)};
  host.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b||!host.contains(b))return;
    if(b.hasAttribute('data-gp')){if(on())seqStop();else start();paint()}
    else if(b.dataset.gq){st.bpm=Math.max(30,Math.min(240,st.bpm+ +b.dataset.gq));DB.gbpm=DB.gbpm||{};DB.gbpm[gid]=st.bpm;save();if(on()){GP.bpm=st.bpm;SEQ.label=g.n+' · '+st.bpm+' bpm';emitState()}paint()}
    else if(b.dataset.gm){const r=b.dataset.gm,k=st.muted.indexOf(r);if(k>=0)st.muted.splice(k,1);else st.muted.push(r);b.setAttribute('aria-pressed',String(k<0));if(on())GP.muted=st.muted;$('[data-grid]',host).innerHTML=grooveGrid(g,{muted:st.muted});last=-1}
    else if(b.hasAttribute('data-gc')){st.click=!st.click;b.setAttribute('aria-pressed',String(st.click));if(on())GP.click=st.click}
  });
  const h=()=>paint();document.addEventListener('playstate',h);paint();
  host._cleanup=()=>{document.removeEventListener('playstate',h);if(on())SEQ.ui=null};
}
function mountGrooves(root){$$('[data-gw]',root).forEach(w=>mountGroove(w,w.dataset.gw))}
/* ---------- metrónomo ---------- */
const TAPS=[];
const MCFG={mode:'all',gap:0,tr:0};
const GAPS=[[0,0,'Siempre'],[4,4,'4 sí · 4 no'],[2,2,'2 sí · 2 no'],[1,3,'1 sí · 3 no'],[1,7,'1 sí · 7 no']];
function metOpts(){const g=GAPS[MCFG.gap];return{mode:MCFG.mode,gapOn:g[0],gapOff:g[1],tr:MCFG.tr?{step:4,every:4,max:Math.min(240,MET.bpm+60)}:null}}
function tapTempo(btn,set){const n=performance.now();if(TAPS.length&&n-TAPS[TAPS.length-1]>2000)TAPS.length=0;TAPS.push(n);if(TAPS.length>6)TAPS.shift();if(ac())tick(AC.currentTime+.01,'beat');if(TAPS.length>=2){const d=(TAPS[TAPS.length-1]-TAPS[0])/(TAPS.length-1);set(60000/d);btn.textContent='Marcar tempo · '+TAPS.length+' toques'}else btn.textContent='Sigue tocando al pulso…';clearTimeout(btn._t);btn._t=setTimeout(()=>{btn.textContent='Marcar tempo'},2200)}
function viewMetronome(){
  const beats=()=>{const m=METERS[MET.meter];return Array.from({length:m.b},(_,i)=>`<i class="${m.acc.includes(i)?'acc':''}"></i>`).join('')};
  return{title:'Metrónomo',back:'#/practicar',html:`
  <div class="card center">
    <div class="beats" id="beats">${beats()}</div>
    <div class="big" id="bpmv">${MET.bpm}</div><div class="cl" style="margin:0" id="mstat">BPM</div>
    <div class="row" style="justify-content:center"><button class="btn sm" data-m="-5">−5</button><button class="btn sm" data-m="-1">−1</button><button class="btn sm" data-m="1">+1</button><button class="btn sm" data-m="5">+5</button></div>
    <input type="range" id="bpmr" min="30" max="240" value="${MET.bpm}" aria-label="Tempo en BPM">
    <div class="row" style="justify-content:center"><button class="btn pri" id="metgo" style="min-width:160px"></button><button class="btn" id="tap">Marcar tempo</button></div>
  </div>
  <div class="card" style="display:flex;flex-direction:column;gap:14px">
    ${chipRow('mode','Dónde suena el click',[{v:'all',l:'Todos los tiempos'},{v:'24',l:'Solo 2 y 4'},{v:'1',l:'Solo el 1'},{v:'off',l:'Contratiempo'}],MCFG.mode)}
    ${chipRow('gap','Click intermitente',GAPS.map((g,i)=>({v:i,l:g[2]})),MCFG.gap)}
    ${chipRow('tr','Entrenador de velocidad',[{v:0,l:'Apagado'},{v:1,l:'+4 bpm cada 4 compases'}],MCFG.tr)}
    ${chipRow('meter','Compás',Object.keys(METERS).map(v=>({v,l:v})),MET.meter)}
    ${chipRow('sub','Subdivisión',[{v:1,l:'Negras'},{v:2,l:'Corcheas'},{v:3,l:'Tresillos'},{v:4,l:'Semicorcheas'}],MET.sub)}
  </div>`,
  mount(r){
    const go=$('#metgo',r),bv=$('#bpmv',r),rg=$('#bpmr',r),ms=$('#mstat',r);
    const light=(b,isBeat,bar,sil)=>{if(isBeat)$$('#beats i',r).forEach((x,i)=>x.classList.toggle('on',i===b&&!sil));ms.textContent=sil?'Click en silencio · sigue contando':'BPM · compás '+(bar+1);if(bv.textContent!=String(MET.bpm)){bv.textContent=MET.bpm;rg.value=MET.bpm}};
    const running=()=>SEQ.id==='met'&&OWNER==='tool';
    const paint=()=>{go.innerHTML=running()?IC.stop+'Detener':IC.play+'Iniciar';bv.textContent=MET.bpm;rg.value=MET.bpm;if(!running()){$$('#beats i',r).forEach(x=>x.classList.remove('on'));ms.textContent='BPM'}};
    const restart=()=>{if(running()){OWNER='tool';metStart(metOpts())}};
    const setBpm=v=>{MET.bpm=Math.max(30,Math.min(240,Math.round(v)));DB.met=MET.bpm;save();if(SEQ.id==='met')SEQ.label='Metrónomo '+MET.bpm;paint();emitState()};
    MET.ui=light;
    go.onclick=()=>{if(running())seqStop();else{OWNER='tool';metStart(metOpts())}paint()};
    rg.oninput=()=>setBpm(+rg.value);
    $$('[data-m]',r).forEach(b=>b.onclick=()=>setBpm(MET.bpm+ +b.dataset.m));
    $('#tap',r).onclick=e=>tapTempo(e.currentTarget,setBpm);
    $$('[data-set]',r).forEach(b=>b.onclick=()=>{const k=b.dataset.set,v=b.dataset.v;
      if(k==='meter'){MET.meter=v;$('#beats',r).innerHTML=beats()}else if(k==='sub')MET.sub=+v;else MCFG[k]=k==='mode'?v:+v;
      $$(`[data-set="${k}"]`,r).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));DB.meter=MET.meter;DB.sub=MET.sub;save();restart()});
    const h=()=>paint();document.addEventListener('playstate',h);paint();
    return()=>{document.removeEventListener('playstate',h);MET.ui=null};
  }};
}
/* ---------- medidor de precisión ---------- */
const TM={mode:'click',bpm:80,grid:1,dur:60};
const MIC={stream:null,src:null,node:null,sink:null,ready:false,lv:0,onHit:null,mod:false};
const WORKLET=`class OD extends AudioWorkletProcessor{constructor(){super();this.slow=0;this.last=-1;this.th=.03;this.k=3.5;this.ref=.07;this.lv=0;this.n=0;this.armed=true;this.peak=0;this.port.onmessage=e=>{Object.assign(this,e.data)}}
process(ins){const ch=ins[0]&&ins[0][0];if(!ch)return true;const N=ch.length,H=32;for(let i=0;i<N;i+=H){let e=0;for(let j=i;j<i+H&&j<N;j++)e+=ch[j]*ch[j];e=Math.sqrt(e/H);const t=currentTime+i/sampleRate;
if(!this.armed){if(e>this.peak)this.peak=e;if(e<this.peak*.35&&t-this.last>this.ref)this.armed=true}else if(e>this.th&&e>this.slow*this.k&&t-this.last>this.ref){this.last=t;this.armed=false;this.peak=e;this.port.postMessage({t:t,e:e})}this.slow=this.slow*.993+e*.007;if(e>this.lv)this.lv=e;}
if(++this.n%20===0){this.port.postMessage({lv:this.lv});this.lv=0}return true}}registerProcessor('onset',OD);`;
async function micStart(){
  if(MIC.ready)return'ok';
  if(!window.isSecureContext||!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)return'nosupport';
  const c=ac();if(!c||!c.audioWorklet)return'noworklet';
  try{
    const s=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
    if(!MIC.mod){await c.audioWorklet.addModule(URL.createObjectURL(new Blob([WORKLET],{type:'application/javascript'})));MIC.mod=true}
    MIC.stream=s;MIC.src=c.createMediaStreamSource(s);MIC.node=new AudioWorkletNode(c,'onset');MIC.sink=c.createGain();MIC.sink.gain.value=0;
    MIC.src.connect(MIC.node);MIC.node.connect(MIC.sink);MIC.sink.connect(c.destination);
    MIC.node.port.onmessage=e=>{const d=e.data;if(d.lv!=null){MIC.lv=d.lv;document.dispatchEvent(new CustomEvent('miclv'))}else if(MIC.onHit)MIC.onHit(d.t,d.e)};
    micThreshold();MIC.ready=true;emitState();return'ok';
  }catch(e){return e&&e.name==='NotAllowedError'?'denied':e&&e.name==='NotFoundError'?'nomic':'other'}
}
function micThreshold(){if(!MIC.node)return;const m={1:2.2,2:1,3:.5}[DB.sens||2];MIC.node.port.postMessage({th:Math.max(.03*m,(DB.clickLvl||0)*2.2)})}
function micStop(){try{MIC.src&&MIC.src.disconnect();MIC.node&&MIC.node.disconnect();MIC.sink&&MIC.sink.disconnect()}catch(e){}if(MIC.stream)MIC.stream.getTracks().forEach(t=>t.stop());if(MIC.node)MIC.node.port.onmessage=null;Object.assign(MIC,{stream:null,src:null,node:null,sink:null,ready:false,onHit:null});emitState()}
const estLat=()=>(AC&&(AC.outputLatency||0)+(AC.baseLatency||0))+.012;
function calibrate(done){
  seqStop();if(!MIC.ready)return;const c=AC,t0=c.currentTime+.3,clicks=[];
  const old=DB.clickLvl;DB.clickLvl=0;micThreshold();const det=[];
  for(let i=0;i<8;i++){const t=t0+i*.6;clicks.push(t);tick(t,'acc');tick(t,'acc')}
  MIC.onHit=(t,e)=>{const c0=clicks.find(x=>t>=x&&t<x+.45);if(c0!=null)det.push({d:t-c0,e})};
  setTimeout(()=>{MIC.onHit=null;
    if(det.length>=5){const ds=det.map(x=>x.d).sort((a,b)=>a-b),es=det.map(x=>x.e).sort((a,b)=>a-b);DB.lat=ds[Math.floor(ds.length/2)];DB.clickLvl=es[Math.floor(es.length/2)];save();micThreshold();done(true)}
    else{DB.lat=estLat();DB.clickLvl=0;save();micThreshold();done(false)}
  },t0-c.currentTime+8*.6+.5);
}
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:0;
const sd=a=>{if(a.length<2)return 0;const m=mean(a);return Math.sqrt(a.reduce((s,x)=>s+(x-m)*(x-m),0)/(a.length-1))};
const med=a=>{if(!a.length)return 0;const s=[...a].sort((x,y)=>x-y);return s[Math.floor(s.length/2)]};
const tendTxt=m=>Math.abs(m)<5?'A tiempo':m<0?'Adelantado':'Atrasado';
function stripSVG(hits){
  const W=320,H=74,x=o=>W/2+Math.max(-60,Math.min(60,o))/60*(W/2-10);
  let g=`<rect x="${x(-20)}" y="6" width="${x(20)-x(-20)}" height="${H-26}" rx="6" fill="var(--good)" opacity=".14"/><line x1="${W/2}" x2="${W/2}" y1="4" y2="${H-18}" stroke="var(--muted)" stroke-width="1.5"/>`;
  [-60,-30,0,30,60].forEach(v=>{g+=`<text x="${x(v)}" y="${H-4}" class="slab2">${v>0?'+'+v:v}</text>`});
  hits.slice(-40).forEach((h,i,a)=>{const age=a.length-1-i;g+=`<circle cx="${x(h.off).toFixed(1)}" cy="${(12+(i%5)*9).toFixed(1)}" r="${age===0?6:4.5}" fill="${h.hid?'var(--blue)':Math.abs(h.off)<=20?'var(--good)':'var(--accent)'}" opacity="${Math.max(.25,1-age/40)}"/>`});
  return`<svg viewBox="0 0 ${W} ${H}" class="strip2" role="img" aria-label="Golpes: izquierda adelantado, derecha atrasado">${g}</svg><div class="row" style="justify-content:space-between;font:500 11px var(--font-mono);color:var(--muted)"><span>← adelantado</span><span>ms</span><span>atrasado →</span></div>`;
}
function driftSVG(pts,target){
  const W=320,H=140,T=TM.dur,lo=target-15,hi=target+15,x=t=>20+t/T*(W-30),y=b=>H-20-(Math.max(lo,Math.min(hi,b))-lo)/(hi-lo)*(H-36);
  let g=`<line x1="20" x2="${W-10}" y1="${y(target)}" y2="${y(target)}" stroke="var(--good)" stroke-dasharray="4 4"/>`;
  [lo,target,hi].forEach(v=>{g+=`<text x="16" y="${y(v)+4}" class="slab2" text-anchor="end">${v}</text>`});
  if(pts.length>1)g+=`<polyline fill="none" stroke="var(--accent)" stroke-width="2.5" points="${pts.map(p=>x(p.t).toFixed(1)+','+y(p.b).toFixed(1)).join(' ')}"/>`;
  if(pts.length)g+=`<circle cx="${x(pts[pts.length-1].t)}" cy="${y(pts[pts.length-1].b)}" r="5" fill="var(--accent)"/>`;
  return`<svg viewBox="0 0 ${W} ${H}" class="strip2" role="img" aria-label="Tempo a lo largo del tiempo">${g}</svg>`;
}
function viewTiming(){
  return{title:'Medidor de precisión',back:'#/practicar',html:`
  <div class="card" style="display:flex;flex-direction:column;gap:14px">
    ${chipRow('mode','Prueba',[{v:'click',l:'Con click'},{v:'gap',l:'Click intermitente'},{v:'free',l:'Sin click (tempo)'}],TM.mode)}
    ${chipRow('grid','Qué vas a tocar',[{v:1,l:'Negras'},{v:2,l:'Corcheas'},{v:3,l:'Tresillos'},{v:4,l:'Semicorcheas'}],TM.grid)}
    <div class="row" style="justify-content:space-between"><div><span class="cl">Tempo</span><span class="minimet"><button class="icon-btn" data-tb="-5" aria-label="Bajar">${IC.minus}</button><span class="v" id="tbv">${TM.bpm} bpm</span><button class="icon-btn" data-tb="5" aria-label="Subir">${IC.plus}</button></span></div>
    ${chipRow('dur','Duración',[{v:30,l:'30 s'},{v:60,l:'60 s'},{v:120,l:'2 min'}],TM.dur)}</div>
  </div>
  <div class="card center" id="tmain"></div>
  <div class="card" id="tres" hidden></div>
  <details class="card"><summary class="cl" style="cursor:pointer;margin:0">Ajustes del micrófono</summary><div style="display:flex;flex-direction:column;gap:12px;margin-top:12px">
    <p class="cap" style="margin:0">La calibración mide el retraso del teléfono escuchando su propio click por la bocina. Hazla una vez en cada dispositivo, en silencio y sin audífonos.</p>
    <div class="row"><button class="btn sm" id="tcal">Calibrar</button><span class="cap" style="margin:0" id="tcalst"></span></div>
    ${chipRow('sens','Sensibilidad',[{v:1,l:'Baja (batería fuerte)'},{v:2,l:'Media'},{v:3,l:'Alta (pad)'}],DB.sens||2)}
  </div></details>
  <p class="cap">Con la batería completa el micrófono mide cuándo golpeas, no qué pieza. Para medir con precisión toca lo que eliges en «Qué vas a tocar»; usa audífonos de cable para el click si puedes.</p>`,
  mount(r){
    const main=$('#tmain',r),res=$('#tres',r);let run=null,stopT=null;
    const calst=()=>{$('#tcalst',r).textContent=DB.lat!=null?`Retraso medido: ${Math.round(DB.lat*1000)} ms`:'Sin calibrar (se usa un estimado)'};
    const idle=(msg)=>{main.innerHTML=MIC.ready?`<div class="meter"><i id="mlv"></i></div><p class="cap" style="margin:0">Golpea la tarola: la barra debe moverse.</p><button class="btn pri" id="tgo" style="min-width:200px">${IC.play}Empezar prueba</button>`:`<p class="sub" style="text-align:center">El micrófono escucha tus golpes y los compara con el pulso.</p><button class="btn pri" id="tmic" style="min-width:220px">${IC.target}Activar micrófono</button>`;if(msg)main.insertAdjacentHTML('beforeend',`<p class="msg${msg.err?' err':''}">${msg.t}</p>`)};
    const live=()=>{
      if(!run)return;const hs=run.hits,offs=hs.filter(h=>!h.hid).map(h=>h.off),rec=offs.slice(-16),m=mean(rec);
      if(TM.mode==='free'){const b=run.pts.length?run.pts[run.pts.length-1].b:TM.bpm;main.innerHTML=`<div class="cl" style="margin:0">Tu tempo ahora</div><div class="big">${Math.round(b)}</div><p class="cap" style="margin:0">Objetivo ${TM.bpm} bpm · ${hs.length} golpes · ${fmt(Math.max(0,run.end-AC.currentTime))}</p>${driftSVG(run.pts,TM.bpm)}<button class="btn" id="tstop">${IC.stop}Detener</button>`;return}
      main.innerHTML=`<div class="cl" style="margin:0">${run.count?'Cuenta de entrada…':run.hidNow?'Click en silencio · sigue tocando':'Tendencia'}</div><div class="big" style="font-size:72px">${rec.length?(m>0?'+':'')+Math.round(m):'—'}<small style="font-size:24px;color:var(--muted)"> ms</small></div><p class="cap" style="margin:0"><b>${rec.length?tendTxt(m):'Esperando golpes'}</b> · ${hs.length} golpes · ${fmt(Math.max(0,run.end-AC.currentTime))}</p>${stripSVG(hs)}<button class="btn" id="tstop">${IC.stop}Detener</button>`;
    };
    const finish=()=>{
      if(!run)return;clearTimeout(stopT);if(SEQ.id==='tim')seqStop();MIC.onHit=null;const R=run;run=null;
      const vis=R.hits.filter(h=>!h.hid).map(h=>h.off),hid=R.hits.filter(h=>h.hid).map(h=>h.off);
      const S={d:today(),ts:Date.now(),mode:TM.mode,bpm:TM.bpm,grid:TM.grid,n:R.hits.length};
      if(TM.mode==='free'){const bs=R.pts.map(p=>p.b);if(bs.length<6)S.n=0;S.start=med(bs.slice(0,6));S.endb=med(bs.slice(-6));S.drift=S.endb-S.start;S.avg=mean(bs)}
      else{S.mean=mean(vis);S.sd=sd(vis);S.pct=vis.length?vis.filter(o=>Math.abs(o)<=20).length/vis.length*100:0;if(TM.mode==='gap'){S.meanH=mean(hid);S.sdH=sd(hid)}}
      if(S.n>=8){DB.ses=(DB.ses||[]).concat([S]).slice(-120);markDay();save()}
      res.hidden=false;res.innerHTML=S.n>=8?sesHTML(S,true):'<p class="msg err">Detecté muy pocos golpes para calcular un resultado. Acerca el teléfono, sube la sensibilidad en «Ajustes del micrófono» y vuelve a intentarlo.</p>';idle();
    };
    const start=()=>{
      res.hidden=true;const step=60/TM.bpm/TM.grid,beat=60/TM.bpm,lat=DB.lat!=null?DB.lat:estLat();
      run={hits:[],pts:[],T0:0,end:0,count:true,hidNow:false,win:[],prev:null,est:step};
      OWNER='tim';
      seqStart('tim','Medidor · '+TM.bpm+' bpm',()=>beat,(s,t)=>{
        if(s<4){tick(t,s===0?'acc':'beat');if(s===0){run.T0=t+4*beat;run.end=run.T0+TM.dur}return}
        if(TM.mode==='free')return;
        const bar=Math.floor((s-4)/4);if(TM.mode==='gap'&&bar%4>=2)return;
        tick(t,(s-4)%4===0?'acc':'beat');
      },s=>{if(!run)return;run.count=s<4;run.hidNow=TM.mode==='gap'&&s>=4&&Math.floor((s-4)/4)%4>=2;live()});
      MIC.onHit=(t)=>{
        if(!run)return;const tc=t-lat;if(tc<run.T0-step/2||tc>run.end)return;
        if(TM.mode==='free'){
          if(run.prev!=null){const ioi=t-run.prev,k=Math.max(1,Math.round(ioi/run.est));if(ioi>.06&&ioi<3&&k<=4){run.win.push(ioi/k);if(run.win.length>8)run.win.shift();run.est=med(run.win);const b=60/(run.est*TM.grid);if(b>20&&b<400)run.pts.push({t:tc-run.T0,b})}}
          run.prev=t;run.hits.push({t:tc});
        }else{
          const n=Math.round((tc-run.T0)/step),off=(tc-(run.T0+n*step))*1000,bar=Math.floor(Math.floor(n/TM.grid)/4);
          run.hits.push({t:tc,off,hid:TM.mode==='gap'&&bar%4>=2});
        }
        live();
      };
      stopT=setTimeout(finish,(4*beat+TM.dur+.3)*1000);live();
    };
    r.addEventListener('click',async e=>{
      const b=e.target.closest('button');if(!b)return;
      if(b.id==='tmic'){const k=await micStart();if(k!=='ok')idle({err:1,t:{denied:'El micrófono está bloqueado. Permite el acceso al micrófono para este sitio en los ajustes del navegador.',nomic:'No se encontró un micrófono.',nosupport:'Este navegador no permite usar el micrófono aquí. Abre la app instalada en Chrome o Safari.',noworklet:'Este navegador es muy antiguo para el medidor. Actualízalo.',other:'No se pudo iniciar el micrófono.'}[k]});else idle(DB.lat==null?{t:'Recomendado: abre «Ajustes del micrófono» y calibra una vez.'}:null)}
      else if(b.id==='tgo'){start()}
      else if(b.id==='tstop'){finish()}
      else if(b.id==='tcal'){if(!MIC.ready){const k=await micStart();if(k!=='ok'){$('#tcalst',r).textContent='Activa el micrófono primero.';return}idle()}$('#tcalst',r).textContent='Escuchando el click… no hagas ruido.';calibrate(ok=>{calst();if(!ok)$('#tcalst',r).textContent='No escuché el click. Sube el volumen y quita los audífonos. Por ahora se usa un estimado ('+Math.round(DB.lat*1000)+' ms).'})}
      else if(b.dataset.tb){TM.bpm=Math.max(40,Math.min(220,TM.bpm+ +b.dataset.tb));$('#tbv',r).textContent=TM.bpm+' bpm'}
      else if(b.dataset.set){const k=b.dataset.set;if(k==='sens'){DB.sens=+b.dataset.v;save();micThreshold()}else TM[k]=k==='mode'?b.dataset.v:+b.dataset.v;$$(`[data-set="${k}"]`,r).forEach(x=>x.setAttribute('aria-pressed',String(x===b)))}
    });
    const lv=()=>{const m=$('#mlv',r);if(m)m.style.width=Math.min(100,MIC.lv*250)+'%'};document.addEventListener('miclv',lv);
    calst();idle();
    return()=>{document.removeEventListener('miclv',lv);if(run)finish();micStop()};
  }};
}
function sesHTML(S,full){
  const date=new Date(S.ts).toLocaleDateString('es-MX',{day:'numeric',month:'short'});
  const head=`<span class="cl" style="margin:0">${{click:'Con click',gap:'Click intermitente',free:'Sin click'}[S.mode]} · ${S.bpm} bpm · ${date}</span>`;
  if(S.mode==='free'){const d=Math.round(S.drift);return`${head}<div class="statrow"><div class="stat"><b>${d>0?'+':''}${d}</b><span>bpm de deriva</span></div><div class="stat"><b>${Math.round(S.start)}</b><span>empezaste</span></div><div class="stat"><b>${Math.round(S.endb)}</b><span>terminaste</span></div></div>${full?`<p class="cap">${Math.abs(d)<=2?'Muy estable: tu reloj interno se sostiene sin click.':d>0?'Tiendes a acelerar sin click. Practica la lección 4 (click intermitente).':'Tiendes a frenar sin click. Subdivide por dentro (lección 2).'}</p>`:''}`}
  const m=Math.round(S.mean);
  return`${head}<div class="statrow"><div class="stat"><b>${m>0?'+':''}${m}</b><span>ms · ${tendTxt(S.mean).toLowerCase()}</span></div><div class="stat"><b>${Math.round(S.sd)}</b><span>ms consistencia</span></div><div class="stat"><b>${Math.round(S.pct)}%</b><span>en el bolsillo</span></div></div>${S.mode==='gap'&&full?`<p class="cap">Durante el silencio: tendencia ${Math.round(S.meanH)>0?'+':''}${Math.round(S.meanH)} ms, consistencia ${Math.round(S.sdH)} ms.</p>`:''}${full?`<p class="cap">${S.sd<=12?'Excelente consistencia.':S.sd<=20?'Buena consistencia; sigue con click intermitente.':'Tus golpes varían mucho: baja el tempo y cuenta en voz alta.'} ${Math.abs(S.mean)>10?(S.mean<0?'Vas adelantado: relaja y deja que el click llegue.':'Vas atrasado: anticipa un poco el golpe.'):''}</p>`:''}`;
}
/* ---------- tocar con la banda ---------- */
function trkChips(cur){return PROG2[TRK.p].it.map((_,i)=>`<div class="pchip ${i===cur?'cur':''}"><b>${trkName(i)}</b><small>${i+1}</small></div>`).join('')}
trkName=function(i){const c=trkChord(i);return pcName(c.pc,[0,7,8,9,10,11].includes(TRK.k)).us+CT[c.t].suf};
function viewBand(){
  return{title:'Tocar con la banda',back:'#/practicar',html:`
  <div class="card" style="display:flex;flex-direction:column;gap:14px">
    <p class="cap" style="margin:0">Bajo y acordes, sin batería: tú pones el ritmo.</p>
    ${chipRow('st','Estilo',Object.keys(STYLES).map(v=>({v,l:STYLES[v].n})),TRK.st)}
    ${chipRow('p','Progresión',Object.keys(PROG2).map(v=>({v,l:PROG2[v].n})),TRK.p)}
    ${chipRow('k','Tonalidad',KEYS.map((x,i)=>({v:i,l:x.us})),TRK.k)}
    ${chipRow('click','Click',[{v:1,l:'Con click'},{v:0,l:'Sin click'}],TRK.click?1:0)}
    <div><span class="cl">Tempo</span><div class="row"><button class="btn sm" data-b="-5">−5</button><span class="tm" id="tbpm" style="min-width:70px;text-align:center">${TRK.bpm} bpm</span><button class="btn sm" data-b="5">+5</button></div></div>
    <div class="row"><button class="btn pri" id="tgo" style="min-width:170px"></button></div>
  </div>
  <div class="card"><span class="cl">Acordes · <span id="tstat">detenida</span></span><div class="strip" id="tchips">${trkChips(-1)}</div><p class="cap">La pista empieza con un compás de cuenta. Escucha el bajo y pon el bombo con él.</p></div>`,
  mount(r){
    const go=$('#tgo',r);
    const ui=(ci,lab)=>{$('#tchips',r).innerHTML=trkChips(ci);$('#tstat',r).textContent=lab==='cuenta'?'cuenta inicial':ci>=0?'sonando '+trkName(ci):'detenida'};
    const running=()=>SEQ.id==='trk'&&OWNER==='tool';
    const paint=()=>{go.innerHTML=running()?IC.stop+'Detener':IC.play+'Tocar pista';$('#tbpm',r).textContent=TRK.bpm+' bpm';if(!running())ui(-1,'')};
    go.onclick=()=>{if(running())seqStop();else{OWNER='tool';TRK.nod=true;trkStart(ui)}paint()};
    $$('[data-b]',r).forEach(b=>b.onclick=()=>{TRK.bpm=Math.max(50,Math.min(200,TRK.bpm+ +b.dataset.b));paint()});
    $$('[data-set]',r).forEach(b=>b.onclick=()=>{const k=b.dataset.set;if(k==='click')TRK.click=b.dataset.v==='1';else TRK[k]=k==='k'?+b.dataset.v:b.dataset.v;if(k==='st')TRK.bpm=STYLES[TRK.st].bpm;$$(`[data-set="${k}"]`,r).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));if(running()&&(k==='p'||k==='st')){TRK.nod=true;trkStart(ui)}paint()});
    const h=()=>paint();document.addEventListener('playstate',h);paint();
    return()=>{document.removeEventListener('playstate',h);if(running())SEQ.ui=null};
  }};
}
/* ---------- setlist ---------- */
let SLEDIT=null;
function viewSetlist(){
  return{title:'Setlist',back:'#/practicar',html:`<div class="lhead"><p class="sub">Guarda el tempo de cada canción de la banda y toca el click antes de empezar.</p></div><div id="sl"></div><div class="card" id="slf"></div>`,
  mount(r){
    const songs=()=>DB.songs||(DB.songs=[]);
    const list=()=>{const S=songs();$('#sl',r).innerHTML=S.length?`<div class="list">${S.map((s,i)=>{const on=SEQ.id==='met'&&OWNER==='sl:'+s.id;return`<div class="card lrow" style="padding:10px 12px"><span class="mn">${i+1}</span><span class="mt"><b>${esc(s.n)}</b><span>${s.bpm} bpm · ${s.m}</span></span><button class="btn sm${on?' on':''}" data-sl="play" data-id="${s.id}">${on?IC.stop+'Detener':IC.play+'Click'}</button><button class="icon-btn" data-sl="up" data-id="${s.id}" aria-label="Subir">${IC.up}</button><button class="icon-btn" data-sl="dn" data-id="${s.id}" aria-label="Bajar">${IC.dn}</button><button class="icon-btn" data-sl="edit" data-id="${s.id}" aria-label="Editar">${IC.edit}</button></div>`}).join('')}</div>`:'<div class="card"><h3>Tu setlist está vacío</h3><p class="cap">Agrega la primera canción con su tempo en el formulario de abajo.</p></div>'};
    const form=()=>{const s=SLEDIT?songs().find(x=>x.id===SLEDIT):null,f={n:s?s.n:'',bpm:s?s.bpm:100,m:s?s.m:'4/4'};
      $('#slf',r).innerHTML=`<h3>${s?'Editar canción':'Agregar canción'}</h3><div style="display:flex;flex-direction:column;gap:12px;margin-top:12px">
      <label class="cl" for="sln" style="margin:0">Nombre</label><input id="sln" class="inp" value="${esc(f.n)}" placeholder="Nombre de la canción" maxlength="60">
      <div><span class="cl">Tempo</span><div class="row"><button class="btn sm" data-fb="-5">−5</button><button class="btn sm" data-fb="-1">−1</button><input id="slb" class="inp" type="number" min="30" max="260" value="${f.bpm}" style="width:90px;text-align:center"><button class="btn sm" data-fb="1">+1</button><button class="btn sm" data-fb="5">+5</button><button class="btn sm" id="sltap">Marcar tempo</button></div></div>
      <div><span class="cl">Compás</span><div class="chips">${Object.keys(METERS).map(v=>`<button class="chip" data-fm="${v}" aria-pressed="${v===f.m}">${v}</button>`).join('')}</div></div>
      <p class="msg err" id="slerr" hidden></p>
      <div class="row"><button class="btn pri" id="slsave">${IC.check}${s?'Guardar cambios':'Agregar'}</button>${s?`<button class="btn" id="slcancel">Cancelar</button><span id="sldelw"><button class="btn" id="sldel" style="border-color:var(--bad);color:var(--bad)">${IC.x}Eliminar</button></span>`:''}</div></div>`;
      $('#slf',r).dataset.m=f.m};
    $('#slf',r).addEventListener('click',e=>{
      const b=e.target.closest('button');if(!b)return;const bi=$('#slb',r);
      if(b.dataset.fb){bi.value=Math.max(30,Math.min(260,(+bi.value||100)+ +b.dataset.fb))}
      else if(b.id==='sltap')tapTempo(b,v=>{bi.value=Math.round(v)});
      else if(b.dataset.fm){$('#slf',r).dataset.m=b.dataset.fm;$$('[data-fm]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===b)))}
      else if(b.id==='slsave'){const n=$('#sln',r).value.trim(),bpm=Math.round(+bi.value),m=$('#slf',r).dataset.m,er=$('#slerr',r);
        if(!n){er.hidden=false;er.textContent='Escribe el nombre de la canción.';return}if(!(bpm>=30&&bpm<=260)){er.hidden=false;er.textContent='El tempo debe estar entre 30 y 260 bpm.';return}
        if(SLEDIT){Object.assign(songs().find(x=>x.id===SLEDIT),{n,bpm,m})}else songs().push({id:Date.now().toString(36),n,bpm,m});
        SLEDIT=null;save();list();form()}
      else if(b.id==='slcancel'){SLEDIT=null;form()}
      else if(b.id==='sldel'){$('#sldelw',r).innerHTML='<span class="row"><span class="cap" style="margin:0">¿Eliminar?</span><button class="btn sm" id="sldelyes" style="border-color:var(--bad);color:var(--bad)">Sí</button><button class="btn sm" id="sldelno">No</button></span>'}
      else if(b.id==='sldelyes'){DB.songs=songs().filter(x=>x.id!==SLEDIT);SLEDIT=null;save();list();form()}
      else if(b.id==='sldelno')form();
    });
    $('#sl',r).addEventListener('click',e=>{
      const b=e.target.closest('[data-sl]');if(!b)return;const S=songs(),i=S.findIndex(x=>x.id===b.dataset.id),s=S[i];if(!s)return;
      const a=b.dataset.sl;
      if(a==='play'){if(SEQ.id==='met'&&OWNER==='sl:'+s.id)seqStop();else{OWNER='sl:'+s.id;MET.bpm=s.bpm;MET.meter=s.m;MET.sub=1;metStart({},null,s.n+' · '+s.bpm+' bpm')}}
      else if(a==='up'&&i>0){S.splice(i-1,0,S.splice(i,1)[0]);save()}
      else if(a==='dn'&&i<S.length-1){S.splice(i+1,0,S.splice(i,1)[0]);save()}
      else if(a==='edit'){SLEDIT=s.id;form();$('#slf',r).scrollIntoView({behavior:'smooth'})}
      list();
    });
    const h=()=>list();document.addEventListener('playstate',h);list();form();
    return()=>document.removeEventListener('playstate',h);
  }};
}
/* ---------- rutina diaria ---------- */
const RT={len:15,i:-1};
function rtBlocks(){
  const ex=nextEx(),sc={10:[2,3,3,2],15:[3,4,5,3],30:[5,8,11,6]}[RT.len];
  return[
   {t:'Calentamiento',d:'Golpe sencillo en la tarola a semicorcheas: D I D I, volumen parejo. A la mitad cambia a golpe doble.',min:sc[0],met:{bpm:70,sub:4}},
   {t:'Pulso',d:'Rock básico con click intermitente: 2 compases sí, 2 no. Cuenta en voz alta durante el silencio.',min:sc[1],met:{bpm:84,sub:1,gapOn:2,gapOff:2}},
   {t:'Lección',d:ex?`Lección ${ex.lesson} · ${ex.t}`:'Repite el ejercicio que más te costó.',min:sc[2],ex},
   {t:'Con la banda',d:'Pista de rock sin batería: toca el groove que quieras y encaja con el bajo.',min:sc[3],trk:{k:3,p:'pop',st:'rock',bpm:92,nod:true,click:true}}];
}
function viewRoutine(){
  return{title:'Rutina diaria',back:'#/practicar',html:`
  <div class="card" style="display:flex;flex-direction:column;gap:14px">
    <div class="row" style="justify-content:space-between"><div><span class="cl">Duración</span><div class="seg" id="rtlen">${[10,15,30].map(v=>`<button data-len="${v}" aria-pressed="${v===RT.len}">${v} min</button>`).join('')}</div></div>
    <div class="center" style="gap:0"><div class="big" id="rttime" style="font-size:64px">${fmt(RT.len*60)}</div><span class="cl" id="rtlab" style="margin:0">Lista para empezar</span></div></div>
    <div class="row" id="rtctl"></div>
  </div>
  <div class="card"><div id="rtsteps"></div></div>
  <div id="rtbody"></div>`,
  mount(r){
    const B=()=>rtBlocks();
    const steps=()=>{$('#rtsteps',r).innerHTML=B().map((b,i)=>`<div class="rt-step ${i===RT.i?'cur':i<RT.i?'past':''}"><span class="n">${i+1}</span><div><b>${b.t} · ${b.min} min</b><span>${esc(b.d)}</span></div></div>`).join('')};
    const ctl=()=>{const on=RT.i>=0;$('#rtctl',r).innerHTML=on?`<button class="btn" data-rt="pause">${TMR.paused?IC.play+'Reanudar':IC.pause+'Pausa'}</button><button class="btn" data-rt="next">${IC.next}Siguiente</button><button class="btn" data-rt="end">${IC.x}Terminar</button>`:`<button class="btn pri" data-rt="start" style="min-width:200px">${IC.play}Empezar rutina</button>`;$('#rtlen',r).style.display=on?'none':''};
    const body=()=>{
      const b=B()[RT.i],el=$('#rtbody',r);cleanupIn(el);
      if(!b){el.innerHTML='';return}
      $('#rtlab',r).textContent=b.t;
      if(b.ex){el.innerHTML=exCard(b.ex,true);mountGrooves(el);paintEx(el)}else el.innerHTML=`<div class="card"><h3>${b.t}</h3><p class="cap">${esc(b.d)}</p></div>`;
      if(b.met){OWNER='rt';Object.assign(MET,{bpm:b.met.bpm,sub:b.met.sub||1,meter:'4/4'});metStart(b.met)}
      else if(b.trk){OWNER='rt';Object.assign(TRK,b.trk);trkStart()}
      else if(SEQ.id&&OWNER==='rt')seqStop();
    };
    const go=i=>{RT.i=i;const b=B()[i];if(!b){finish();return}tmrStart('rt',b.min*60);steps();ctl();body()};
    const finish=()=>{tmrStop();if(SEQ.id&&OWNER==='rt')seqStop();cleanupIn($('#rtbody',r));const done=RT.i>=B().length;RT.i=-1;if(done){markDay();bell()}steps();ctl();$('#rtbody',r).innerHTML=done?'<div class="card center"><h2>Rutina completa</h2><p class="sub">Buen trabajo. Tu racha quedó registrada.</p><a class="btn pri" href="#/">Volver al inicio</a></div>':'';$('#rttime',r).textContent=fmt(RT.len*60);$('#rtlab',r).textContent=done?'Completada':'Lista para empezar'};
    r.addEventListener('click',e=>{
      const l=e.target.closest('[data-len]');if(l){RT.len=+l.dataset.len;$$('[data-len]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===l)));$('#rttime',r).textContent=fmt(RT.len*60);steps();return}
      const a=e.target.closest('[data-rt]');if(!a)return;const k=a.dataset.rt;
      if(k==='start')go(0);else if(k==='next')go(RT.i+1);else if(k==='end')finish();else if(k==='pause'){tmrPause();if(TMR.paused&&SEQ.id&&OWNER==='rt')seqStop();ctl()}
    });
    const ht=e=>{if(e.detail.id==='rt')$('#rttime',r).textContent=fmt(e.detail.left)};
    const hd=e=>{if(e.detail.id==='rt')go(RT.i+1)};
    document.addEventListener('tmr',ht);document.addEventListener('tmrdone',hd);steps();ctl();
    return()=>{document.removeEventListener('tmr',ht);document.removeEventListener('tmrdone',hd);if(RT.i>=0){tmrStop();if(SEQ.id&&OWNER==='rt')seqStop();RT.i=-1}};
  }};
}
function cleanupIn(el){if(!el)return;$$('[data-gw]',el).forEach(w=>w._cleanup&&w._cleanup())}
