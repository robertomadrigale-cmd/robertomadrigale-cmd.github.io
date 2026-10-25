/* ---------- herramientas: metrónomo, medidor de precisión, banda, setlist y vista de cada groove ---------- */
const GAPS=[[0,0,'Siempre'],[4,4,'4 sí · 4 no'],[2,2,'2 sí · 2 no'],[1,3,'1 sí · 3 no'],[1,7,'1 sí · 7 no']];
const MCFG={mode:'all',gap:0,tr:0};
const MMODES={all:'Todos',24:'2 y 4',1:'Solo el 1',off:'Contratiempo'};
function metOpts(){const g=GAPS[MCFG.gap];return{mode:MCFG.mode,gapOn:g[0],gapOff:g[1],tr:MCFG.tr?{step:4,every:4,max:Math.min(240,MET.bpm+60)}:null}}
const tempoBox=(id,v)=>`<div class="tempo"><button class="icon-btn" data-tq="-5" aria-label="Bajar 5">${IC.minus}</button><b id="${id}">${v}</b><button class="icon-btn" data-tq="5" aria-label="Subir 5">${IC.plus}</button></div>`;
function viewMetronome(){
  const beats=()=>{const m=METERS[MET.meter];return Array.from({length:m.b},(_,i)=>`<i class="${m.acc.includes(i)?'acc':''}"></i>`).join('')};
  return{title:'Metrónomo',back:'#/practicar',html:`<div class="kplay tool">${toolHead('metro','Metrónomo','Herramienta')}
    <div class="card center metcard"><div class="beats" id="beats">${beats()}</div><div class="big" id="bpmv">${MET.bpm}</div><div class="cap" id="mstat">BPM</div>
    <input type="range" id="bpmr" min="30" max="240" value="${MET.bpm}" aria-label="Tempo en BPM"><div class="row center"><button class="btn sm" data-m="-1">−1</button><button class="btn sm" data-m="1">+1</button><button class="btn sm" id="tap">Marcar tempo</button></div></div>
    ${toolBar([['mode','Click',TKIC.mode],['gap','Pausas',TKIC.gap],['tr','Acelerar',TKIC.tempo],['meter','Compás',TKIC.meter],['sub','Notas',TKIC.sub]])}
    ${toolPanels([['mode','Dónde suena el click',chipRow('mode','',Object.entries(MMODES).map(([v,l])=>({v,l})),MCFG.mode)],
      ['gap','Click intermitente',chipRow('gap','El click se calla unos compases: tú sigues',GAPS.map((g,i)=>({v:i,l:g[2]})),MCFG.gap)],
      ['tr','Entrenador de velocidad',chipRow('tr','',[{v:0,l:'Apagado'},{v:1,l:'+4 bpm cada 4 compases'}],MCFG.tr)],
      ['meter','Compás',chipRow('meter','',Object.keys(METERS).map(v=>({v,l:v})),MET.meter)],
      ['sub','Subdivisión',chipRow('sub','',[{v:1,l:'Negras'},{v:2,l:'Corcheas'},{v:3,l:'Tresillos'},{v:4,l:'Semicorcheas'}],MET.sub)]])}
    ${toolDock(`<button class="kplayb" id="metgo"></button>`)}</div>`,
  mount(r){
    const go=$('#metgo',r),bv=$('#bpmv',r),rg=$('#bpmr',r),ms=$('#mstat',r);
    const running=()=>SEQ.id==='met'&&OWNER==='tool';
    const paint=()=>{go.innerHTML=playLbl(running(),'Iniciar','Detener');bv.textContent=MET.bpm;rg.value=MET.bpm;if(!running()){$$('#beats i',r).forEach(x=>x.classList.remove('on'));ms.textContent='BPM'}};
    const vals=()=>({mode:MMODES[MCFG.mode],gap:GAPS[MCFG.gap][2],tr:MCFG.tr?'+4':'No',meter:MET.meter,sub:{1:'Negras',2:'Corcheas',3:'Tresillos',4:'Semis'}[MET.sub],meta:MET.bpm+' bpm · '+MET.meter});
    const pv=toolMount(r,vals);
    MET.ui=(b,isBeat,bar,sil)=>{if(isBeat){$$('#beats i',r).forEach((x,i)=>x.classList.toggle('on',i===b&&!sil));beatPulse(r,b===0)}ms.textContent=sil?'Click en silencio · sigue contando':'BPM · compás '+(bar+1);if(bv.textContent!=String(MET.bpm)){bv.textContent=MET.bpm;rg.value=MET.bpm;pv()}};
    const restart=()=>{if(running()){OWNER='tool';metStart(metOpts())}};
    const setBpm=v=>{MET.bpm=Math.max(30,Math.min(240,Math.round(v)));DB.met=MET.bpm;save();paint();pv()};
    go.onclick=()=>{if(running())seqStop();else{OWNER='tool';metStart(metOpts())}paint()};
    rg.oninput=()=>setBpm(+rg.value);
    $$('[data-m]',r).forEach(b=>b.onclick=()=>setBpm(MET.bpm+ +b.dataset.m));
    $('#tap',r).onclick=e=>tapTempo(e.currentTarget,setBpm);
    r.addEventListener('click',e=>{const b=e.target.closest('[data-set]');if(!b)return;const k=b.dataset.set,v=b.dataset.v;
      if(k==='meter'){MET.meter=v;$('#beats',r).innerHTML=beats()}else if(k==='sub')MET.sub=+v;else MCFG[k]=k==='mode'?v:+v;
      $$(`[data-set="${k}"]`,r).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));DB.meter=MET.meter;DB.sub=MET.sub;save();restart();pv()});
    const h=()=>paint();document.addEventListener('playstate',h);paint();
    return()=>{document.removeEventListener('playstate',h);MET.ui=null;if(SEQ.id==='met')seqStop()};
  }};
}
/* ---------- medidor de precisión (con click, intermitente o sin click), con micrófono o toques ---------- */
const TM={mode:'click',bpm:80,grid:1,dur:60};
function sesHTML(S,full){
  const date=new Date(S.ts).toLocaleDateString('es-MX',{day:'numeric',month:'short'});
  const head=`<span class="cl">${{click:'Con click',gap:'Click intermitente',free:'Sin click'}[S.mode]} · ${S.bpm} bpm · ${date}</span>`;
  if(S.mode==='free'){const d=Math.round(S.drift);return`${head}<div class="coach-stats"><div><b>${d>0?'+':''}${d}</b><span>bpm de deriva</span></div><div><b>${Math.round(S.start)}</b><span>empezaste</span></div><div><b>${Math.round(S.endb)}</b><span>terminaste</span></div></div>${full?`<p class="cap">${Math.abs(d)<=2?'Muy estable: tu reloj interno se sostiene sin click.':d>0?'Tiendes a acelerar sin click. Practica la lección 4 (click intermitente).':'Tiendes a frenar sin click. Subdivide por dentro (lección 2).'}</p>`:''}`}
  const m=Math.round(S.mean);
  return`${head}<div class="coach-stats"><div><b>${m>0?'+':''}${m}</b><span>ms · ${tendTxt(S.mean).toLowerCase()}</span></div><div><b>${Math.round(S.sd)}</b><span>ms de variación</span></div><div><b>${Math.round(S.pct)}%</b><span>en el bolsillo</span></div></div>${S.mode==='gap'&&full&&S.meanH!=null?`<p class="cap">Durante el silencio: tendencia ${Math.round(S.meanH)>0?'+':''}${Math.round(S.meanH)} ms, variación ${Math.round(S.sdH)} ms.</p>`:''}${full?`<p class="cap">${S.sd<=12?'Excelente consistencia.':S.sd<=20?'Buena consistencia; sigue con click intermitente.':'Tus golpes varían mucho: baja el tempo y cuenta en voz alta.'} ${Math.abs(S.mean)>10?(S.mean<0?'Vas adelantado: relájate y deja que el click llegue.':'Vas atrasado: anticipa un poco el golpe.'):''}</p>`:''}`;
}
function viewTiming(){
  const GRIDS={1:'Negras',2:'Corcheas',3:'Tresillos',4:'Semicorcheas'};
  return{title:'Medidor de precisión',back:'#/practicar',html:`<div class="kplay tool">${toolHead('prec','Medidor de precisión','Herramienta')}
    ${toolBar([['mode','Prueba',TKIC.mode],['grid','Qué tocas',TKIC.sub],['tempo','Tempo',TKIC.tempo],['dur','Duración',TKIC.dur],['in','Escucho',TKIC.mic]])}
    ${toolPanels([['mode','Prueba',chipRow('mode','',[{v:'click',l:'Con click'},{v:'gap',l:'Click intermitente'},{v:'free',l:'Sin click (tempo)'}],TM.mode)],
      ['grid','Qué vas a tocar',chipRow('grid','',Object.entries(GRIDS).map(([v,l])=>({v,l})),TM.grid)],
      ['tempo','Tempo',tempoBox('tbv',TM.bpm+' bpm')],
      ['dur','Duración',chipRow('dur','',[{v:30,l:'30 s'},{v:60,l:'60 s'},{v:120,l:'2 min'}],TM.dur)],
      ['in','Cómo te escucho',chipRow('in','',[{v:'tap',l:'Toques en pantalla'},{v:'mic',l:'Micrófono'}],DB.input)+`<p class="cap">El micrófono mide cuándo golpeas, no qué pieza. Con toques, usa cualquier botón.</p>`]])}
    <div class="card center" id="tmain"></div><div class="card" id="tres" hidden></div>
    <details class="card coach-settings"><summary>Ajustes del micrófono</summary><p class="cap">La calibración mide el retraso del teléfono escuchando su propio click por la bocina. Hazla una vez en cada dispositivo, en silencio y sin audífonos.</p>
      <div class="row"><button class="btn sm" id="tcal">Calibrar</button><span class="cap" id="tcalst"></span></div>
      ${chipRow('sens','Sensibilidad',[{v:1,l:'Baja (batería fuerte)'},{v:2,l:'Media'},{v:3,l:'Alta (pad)'}],DB.sens||2)}</details>
    <p class="cap">Usa audífonos de cable para el click si puedes: así el micrófono escucha solo tus golpes.</p></div>`,
  mount(r){
    const main=$('#tmain',r),res=$('#tres',r);let run=null,stopT=null,unp=null;
    const pv=toolMount(r,()=>({mode:{click:'Click',gap:'Intermitente',free:'Sin click'}[TM.mode],grid:GRIDS[TM.grid],tempo:TM.bpm,dur:TM.dur+' s',in:DB.input==='mic'?'Micrófono':'Toques',meta:TM.bpm+' bpm · '+GRIDS[TM.grid].toLowerCase()}));
    const calst=()=>{$('#tcalst',r).textContent=DB.lat!=null?`Retraso medido: ${Math.round(DB.lat*1000)} ms`:'Sin calibrar (se usa un estimado)'};
    const useMic=()=>DB.input==='mic';
    const idle=(msg)=>{if(unp){unp();unp=null}
      main.innerHTML=useMic()&&!MIC.ready?`<p class="sub">El micrófono escucha tus golpes y los compara con el pulso.</p><button class="btn pri" id="tmic">${IC.mic}Activar micrófono</button>`:
        `${useMic()?`<div class="meter"><i id="mlv"></i></div><p class="cap">Golpea la tarola: la barra debe moverse.</p>`:`<p class="cap">Toca el botón grande (o la barra espaciadora) junto con el click.</p>`}<button class="kplayb" id="tgo" aria-label="Empezar prueba">${IC.play}<span>Empezar</span></button>`;
      if(msg)main.insertAdjacentHTML('beforeend',`<p class="msg${msg.err?' err':''}">${msg.t}</p>`)};
    const live=()=>{
      if(!run)return;const hs=run.hits,offs=hs.filter(h=>!h.hid).map(h=>h.off),rec=offs.slice(-16),m=mean(rec);const left=fmt(Math.max(0,run.end-ac().currentTime));
      const pad=useMic()?'':`<button class="pad pad-tar big" data-pad="tar"><b>Toca aquí</b><small>o Espacio</small></button>`;
      if(TM.mode==='free'){const b=run.pts.length?run.pts[run.pts.length-1].b:TM.bpm;main.innerHTML=`<span class="cl">Tu tempo ahora</span><div class="big">${Math.round(b)}</div><p class="cap">Objetivo ${TM.bpm} bpm · ${hs.length} golpes · ${left}</p>${driftSVG(run.pts,TM.bpm,TM.dur)}${pad}<button class="btn" id="tstop">${IC.stop}Detener</button>`;return}
      main.innerHTML=`<span class="cl">${run.count?'Cuenta de entrada…':run.hidNow?'Click en silencio · sigue tocando':'Tendencia'}</span><div class="big">${m!=null?(m>0?'+':'')+Math.round(m):'—'}<small> ms</small></div><p class="cap"><b>${m!=null?tendTxt(m):'Esperando golpes'}</b> · ${hs.length} golpes · ${left}</p>${stripSVG(hs)}${pad}<button class="btn" id="tstop">${IC.stop}Detener</button>`;
    };
    const finish=()=>{
      if(!run)return;clearTimeout(stopT);if(SEQ.id==='tim')seqStop();MIC.onHit=null;const R=run;run=null;
      const vis=R.hits.filter(h=>!h.hid).map(h=>h.off),hid=R.hits.filter(h=>h.hid).map(h=>h.off);
      const S={d:today(),ts:Date.now(),mode:TM.mode,bpm:TM.bpm,grid:TM.grid,n:R.hits.length};
      if(TM.mode==='free'){const bs=R.pts.map(p=>p.b);if(bs.length<6)S.n=0;S.start=med(bs.slice(0,6));S.endb=med(bs.slice(-6));S.drift=S.endb-S.start;S.avg=mean(bs)}
      else{S.mean=mean(vis)||0;S.sd=sd(vis);S.pct=vis.length?vis.filter(o=>Math.abs(o)<=30).length/vis.length*100:0;if(TM.mode==='gap'){S.meanH=mean(hid);S.sdH=sd(hid)}}
      if(S.n>=8){DB.ses=(DB.ses||[]).concat([S]).slice(-120);if(S.mode!=='free')DB.hist.push({d:today(),ts:S.ts,id:'medidor',k:'prec',s:S.pct/100,ms:Math.round(S.mean),sd:Math.round(S.sd),bpm:S.bpm});markDay();save()}
      res.hidden=false;res.innerHTML=S.n>=8?sesHTML(S,true):'<p class="msg err">Detecté muy pocos golpes para calcular un resultado. Acerca el teléfono, sube la sensibilidad en «Ajustes del micrófono» y vuelve a intentarlo.</p>';idle();
    };
    const start=()=>{
      res.hidden=true;const step=60/TM.bpm/TM.grid,beat=60/TM.bpm;
      run={hits:[],pts:[],T0:0,end:0,count:true,hidNow:false,win:[],prev:null,est:step};
      seqStart('tim','Medidor · '+TM.bpm+' bpm',()=>beat,(s,t)=>{
        if(s<4){tick(t,s===0?'acc':'beat');if(s===0){run.T0=t+4*beat;run.end=run.T0+TM.dur}return}
        if(TM.mode==='free')return;
        const bar=Math.floor((s-4)/4);if(TM.mode==='gap'&&bar%4>=2)return;
        tick(t,(s-4)%4===0?'acc':'beat');
      },s=>{if(!run)return;run.count=s<4;run.hidNow=TM.mode==='gap'&&s>=4&&Math.floor((s-4)/4)%4>=2;live()});
      const onHit=(tc)=>{
        if(!run)return;if(tc<run.T0-step/2||tc>run.end)return;
        if(TM.mode==='free'){
          if(run.prev!=null){const ioi=tc-run.prev,k=Math.max(1,Math.round(ioi/run.est));if(ioi>.06&&ioi<3&&k<=4){run.win.push(ioi/k);if(run.win.length>8)run.win.shift();run.est=med(run.win);const b=60/(run.est*TM.grid);if(b>20&&b<400)run.pts.push({t:tc-run.T0,b})}}
          run.prev=tc;run.hits.push({t:tc});
        }else{const n=Math.round((tc-run.T0)/step),off=(tc-(run.T0+n*step))*1000,bar=Math.floor(Math.floor(n/TM.grid)/4);run.hits.push({t:tc,off,hid:TM.mode==='gap'&&bar%4>=2})}
        live();
      };
      if(useMic())MIC.onHit=t=>onHit(t-micLat());else unp=padsMount(main,t=>onHit(t));
      stopT=setTimeout(finish,(4*beat+TM.dur+.3)*1000+300);live();
    };
    r.addEventListener('click',async e=>{
      const b=e.target.closest('button');if(!b||b.dataset.pad)return;
      if(b.id==='tmic'){const k=await micStart();if(k!=='ok')idle({err:1,t:MICERR[k]});else idle(DB.lat==null?{t:'Recomendado: abre «Ajustes del micrófono» y calibra una vez.'}:null)}
      else if(b.id==='tgo')start();
      else if(b.id==='tstop')finish();
      else if(b.id==='tcal'){if(!MIC.ready){const k=await micStart();if(k!=='ok'){$('#tcalst',r).textContent=MICERR[k];return}idle()}$('#tcalst',r).textContent='Escuchando el click… no hagas ruido.';calibrate(ok=>{calst();if(!ok)$('#tcalst',r).textContent='No escuché el click. Sube el volumen y quita los audífonos. Por ahora se usa un estimado.'})}
      else if(b.dataset.tq){TM.bpm=Math.max(40,Math.min(220,TM.bpm+ +b.dataset.tq));$('#tbv',r).textContent=TM.bpm+' bpm';pv()}
      else if(b.dataset.set){const k=b.dataset.set;if(k==='sens'){DB.sens=+b.dataset.v;save();micThreshold()}else if(k==='in'){DB.input=b.dataset.v;save();if(!run)idle()}else TM[k]=k==='mode'?b.dataset.v:+b.dataset.v;$$(`[data-set="${k}"]`,r).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));pv()}
    });
    const lv=()=>{const m=$('#mlv',r);if(m)m.style.width=Math.min(100,MIC.lv*250)+'%'};document.addEventListener('miclv',lv);
    calst();idle();
    return()=>{document.removeEventListener('miclv',lv);if(run)finish();if(unp)unp();micStop()};
  }};
}
/* ---------- tocar con la banda: el groove en la rejilla, la banda sin batería y tú encima ---------- */
function studioURL(beatId,bpm,tono){const b=beatById(beatId),k=tono||parseKey(b.key);return`../estudio/#/nueva?tono=${encodeURIComponent(noteName(k.pc)+(k.minor?'m':''))}&bpm=${bpm}&genero=${beatId}&desde=bateria`}
function viewBand(q){
  const BANDG=Object.keys(G).filter(id=>bandOK(G[id])&&G[id].cat!=='Rudimentos');
  let gid=q.get('g')&&G[q.get('g')]&&bandOK(G[q.get('g')])?q.get('g'):DB.bandG&&G[DB.bandG]?DB.bandG:'rock';
  const st={guide:false,click:true,bpm:+q.get('bpm')||bpmFor(gid,'normal'),sty:q.get('st')&&beatById(q.get('st'))?q.get('st'):bandFor(gid)};
  return{title:'Tocar con la banda',back:'#/practicar',html:`<div class="kplay tool">${toolHead('band','Tocar con la banda','Herramienta')}
    ${toolBar([['g','Groove',TKIC.drum],['sty','Estilo',TKIC.style],['tempo','Tempo',TKIC.tempo],['snd','Sonido',TKIC.eye]])}
    ${toolPanels([['g','Groove',`<label class="bandsel">Qué vas a tocar<select id="bg">${BANDG.map(id=>`<option value="${id}" ${id===gid?'selected':''}>${esc(G[id].n)}</option>`).join('')}</select></label>`],
      ['sty','Estilo de la banda','<div id="bsty"></div>'],['tempo','Tempo',tempoBox('bbpm',st.bpm+' bpm')],
      ['snd','Sonido',`<div class="chips"><button class="chip" data-o="click" aria-pressed="true">Click</button><button class="chip" data-o="guide" aria-pressed="false">Batería guía</button></div><p class="cap">La batería guía toca el groove por ti para escucharlo; apágala para tocarlo tú.</p>`]])}
    <div class="card"><div class="gridbox" id="bgrid"></div><p class="cap" id="bch"></p></div>
    <a class="btn studio" id="bstudio" href="#">${IC.studio}Grabar en Om Estudio</a>
    ${toolDock(`<button class="kplayb" id="bgo"></button>`)}</div>`,
  mount(r){
    let res=null,busy=false;
    const g=()=>G[gid],on=()=>SEQ.id==='band';
    const pv=toolMount(r,()=>({g:G[gid].n,sty:beatById(st.sty).n,tempo:st.bpm,snd:st.guide?'Con guía':'Solo banda',meta:`${st.bpm} bpm · ${meterTxt(G[gid])}`}));
    const paint=()=>{$('#bgo',r).innerHTML=playLbl(on(),busy?'Preparando…':'Tocar','Detener');$('#bgrid',r).innerHTML=grooveGrid(g());
      $('#bsty',r).innerHTML=chipRow('sty','',bandBeats(g()).map(b=>({v:b.id,l:b.n})),st.sty);$('#bstudio',r).href=studioURL(st.sty,st.bpm);pv()};
    const stop=()=>{grooveStop();gridNow(r,-1)};
    const start=async()=>{busy=true;paint();const beat=beatById(st.sty);
      try{res=await bandRender(st.sty,st.bpm,parseKey(beat.key))}catch(e){res=null;toast('No se pudo preparar la banda.')}busy=false;
      if(!res)return paint();
      const per=gSteps(g()),bars=res.bars;
      grooveRun({id:'band',g:g(),bpm:st.bpm,click:()=>st.click,drums:()=>st.guide,band:res,label:'Banda · '+beat.n,
        onStep:(i,L)=>{lightStep(r,g(),i);const k=Math.floor((L*per+i)/g().sub/res.beat.beats)%bars;$('#bch',r).textContent='Acorde: '+res.acordes[k]+' · '+beat.n}});
      paint()};
    const restart=()=>{if(on()){stop();start()}else paint()};
    r.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
      if(b.id==='bgo'){if(on())stop();else if(!busy)start();paint()}
      else if(b.dataset.tq){st.bpm=Math.max(50,Math.min(200,st.bpm+ +b.dataset.tq));$('#bbpm',r).textContent=st.bpm+' bpm';restart()}
      else if(b.dataset.set==='sty'){st.sty=b.dataset.v;DB.band=DB.band||{};DB.band[gid]=st.sty;save();restart()}
      else if(b.dataset.o){st[b.dataset.o]=!st[b.dataset.o];b.setAttribute('aria-pressed',String(st[b.dataset.o]));pv()}});
    $('#bg',r).onchange=e=>{gid=e.target.value;DB.bandG=gid;save();st.bpm=bpmFor(gid,'normal');st.sty=bandFor(gid);$('#bbpm',r).textContent=st.bpm+' bpm';restart()};
    const h=()=>paint();document.addEventListener('playstate',h);paint();
    return()=>{document.removeEventListener('playstate',h);stop()};
  }};
}
/* ---------- setlist: el tempo de cada canción de tu banda ---------- */
let SLEDIT=null;
function viewSetlist(){
  return{title:'Setlist',back:'#/practicar',html:`<div class="kplay tool">${toolHead('setlist','Setlist','Herramienta')}<p class="sub">Guarda el tempo de cada canción de tu banda y toca el click antes de empezar.</p><div id="sl"></div><div class="card" id="slf"></div></div>`,
  mount(r){
    const songs=()=>DB.songs||(DB.songs=[]);
    const list=()=>{const S=songs();$('#sl',r).innerHTML=S.length?`<div class="sllist">${S.map((s,i)=>{const on=SEQ.id==='met'&&OWNER==='sl:'+s.id;return`<div class="card slrow"><span class="mn">${i+1}</span><span class="mt"><b>${esc(s.n)}</b><span>${s.bpm} bpm · ${s.m}</span></span><button class="btn sm${on?' on':''}" data-sl="play" data-id="${s.id}">${on?IC.stop+'Detener':IC.play+'Click'}</button><button class="icon-btn" data-sl="up" data-id="${s.id}" aria-label="Subir">${IC.up}</button><button class="icon-btn" data-sl="dn" data-id="${s.id}" aria-label="Bajar">${IC.dn}</button><button class="icon-btn" data-sl="edit" data-id="${s.id}" aria-label="Editar">${IC.edit}</button></div>`}).join('')}</div>`:'<div class="card"><h3>Tu setlist está vacío</h3><p class="cap">Agrega la primera canción con su tempo en el formulario de abajo.</p></div>'};
    const form=()=>{const s=SLEDIT?songs().find(x=>x.id===SLEDIT):null,f={n:s?s.n:'',bpm:s?s.bpm:100,m:s?s.m:'4/4'};
      $('#slf',r).innerHTML=`<h3>${s?'Editar canción':'Agregar canción'}</h3><div class="slform">
      <label class="cl" for="sln">Nombre</label><input id="sln" class="inp" value="${esc(f.n)}" placeholder="Nombre de la canción" maxlength="60">
      <div><span class="cl">Tempo</span><div class="row"><button class="btn sm" data-fb="-5">−5</button><input id="slb" class="inp num" type="number" min="30" max="260" value="${f.bpm}"><button class="btn sm" data-fb="5">+5</button><button class="btn sm" id="sltap">Marcar tempo</button></div></div>
      <div><span class="cl">Compás</span><div class="chips">${Object.keys(METERS).map(v=>`<button class="chip" data-fm="${v}" aria-pressed="${v===f.m}">${v}</button>`).join('')}</div></div>
      <p class="msg err" id="slerr" hidden></p>
      <div class="row"><button class="btn pri" id="slsave">${IC.check}${s?'Guardar':'Agregar'}</button>${s?`<button class="btn" id="slcancel">Cancelar</button><span id="sldelw"><button class="btn danger" id="sldel">${IC.x}Eliminar</button></span>`:''}</div></div>`;
      $('#slf',r).dataset.m=f.m};
    $('#slf',r).addEventListener('click',e=>{
      const b=e.target.closest('button');if(!b)return;const bi=$('#slb',r);
      if(b.dataset.fb)bi.value=Math.max(30,Math.min(260,(+bi.value||100)+ +b.dataset.fb));
      else if(b.id==='sltap')tapTempo(b,v=>{bi.value=Math.round(v)});
      else if(b.dataset.fm){$('#slf',r).dataset.m=b.dataset.fm;$$('[data-fm]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===b)))}
      else if(b.id==='slsave'){const n=$('#sln',r).value.trim(),bpm=Math.round(+bi.value),m=$('#slf',r).dataset.m,er=$('#slerr',r);
        if(!n){er.hidden=false;er.textContent='Escribe el nombre de la canción.';return}if(!(bpm>=30&&bpm<=260)){er.hidden=false;er.textContent='El tempo debe estar entre 30 y 260 bpm.';return}
        if(SLEDIT)Object.assign(songs().find(x=>x.id===SLEDIT),{n,bpm,m});else songs().push({id:Date.now().toString(36),n,bpm,m});
        SLEDIT=null;save();list();form()}
      else if(b.id==='slcancel'){SLEDIT=null;form()}
      else if(b.id==='sldel')$('#sldelw',r).innerHTML='<span class="row"><span class="cap">¿Eliminar?</span><button class="btn sm danger" id="sldelyes">Sí</button><button class="btn sm" id="sldelno">No</button></span>';
      else if(b.id==='sldelyes'){DB.songs=songs().filter(x=>x.id!==SLEDIT);SLEDIT=null;save();list();form()}
      else if(b.id==='sldelno')form();
    });
    $('#sl',r).addEventListener('click',e=>{
      const b=e.target.closest('[data-sl]');if(!b)return;const S=songs(),i=S.findIndex(x=>x.id===b.dataset.id),s=S[i];if(!s)return;const a=b.dataset.sl;
      if(a==='play'){if(SEQ.id==='met'&&OWNER==='sl:'+s.id)seqStop();else{OWNER='sl:'+s.id;MET.bpm=s.bpm;MET.meter=s.m;MET.sub=1;metStart({},null,s.n+' · '+s.bpm+' bpm')}}
      else if(a==='up'&&i>0){S.splice(i-1,0,S.splice(i,1)[0]);save()}
      else if(a==='dn'&&i<S.length-1){S.splice(i+1,0,S.splice(i,1)[0]);save()}
      else if(a==='edit'){SLEDIT=s.id;form();$('#slf',r).scrollIntoView({behavior:'smooth'})}
      list()});
    const h=()=>list();document.addEventListener('playstate',h);list();form();
    return()=>{document.removeEventListener('playstate',h);if(SEQ.id==='met')seqStop()};
  }};
}
/* ---------- un groove: rejilla grande que se ilumina, batería con manos y pies, «Toca tú» y práctica calificada ---------- */
function viewGroove(id){
  const g=G[id];if(!g)return null;const how=howFor(id),lv=lvlOf(id),open=levelOpen(lv);
  const st={muted:[],click:true,spd:spdOf(id)};const rows=ROW_ORDER.filter(r=>g.rows[r]);
  return{title:g.n,back:'#/grooves',html:`<div class="kplay tool"><div class="kamb tamb" style="--th:${CATHUE[g.cat]}" aria-hidden="true"></div>
    <div class="khead"><span class="sart big tcov">${grooveArt(id)}</span><div class="kht"><span class="eyebrow">${g.cat} · Nivel ${lv}</span><h2>${esc(g.n)}</h2><small class="kmeta" id="tmeta"></small></div></div>
    <p class="coach-tip">${how.tip}</p>
    <div class="card"><div class="gridbox" id="ggrid">${grooveGrid(g)}</div>${g.hands?`<p class="cap">Manos: <b class="mono">${g.hands.replace(/(.{4})/g,'$1 ').trim()}</b> · D = derecha, I = izquierda</p>`:''}</div>
    <div class="card kitcard"><div class="kitwrap">${kitSVG(g)}${LIMBS_HTML}</div><ul class="howrows">${how.rows.map(x=>`<li><b>${x.n}</b><span>${x.limbs}: ${x.where}</span></li>`).join('')}</ul></div>
    ${toolBar([['spd','Velocidad',TKIC.tempo],['you','Toca tú',TKIC.drum],['snd','Click',TKIC.mode]])}
    ${toolPanels([['spd','Velocidad',`<div class="chips">${Object.entries(SPEEDS).map(([k,[f,l]])=>`<button class="chip" data-spd="${k}" aria-pressed="${k===st.spd}">${l}<i>${Math.round(baseBpm(id)*f)}</i></button>`).join('')}</div>${tempoBox('gbv',baseBpm(id)+' bpm')}<p class="cap">El tempo de arriba es tu «Normal»; Lento y Rápido salen de él.</p>`],
      ['you','Toca tú: la app se calla en esas piezas',`<div class="chips">${rows.map(r=>`<button class="chip" data-mute="${r}" aria-pressed="false">${ROWS[r].n}</button>`).join('')}</div>`],
      ['snd','Click',`<div class="chips"><button class="chip" data-click="1" aria-pressed="true">Con click</button><button class="chip" data-click="0" aria-pressed="false">Sin click</button></div>`]])}
    <div class="row gacts">${open?`<a class="btn pri" href="#/practicar/ej/${id}">${IC.target}Practicar con calificación</a>`:`<span class="cap">Practicar con calificación se abre con ${Math.max(0,10-levelStars(lv-1))} estrellas más del nivel ${lv-1}.</span>`}${bandOK(g)?`<a class="btn" href="#/practicar/banda?g=${id}">${IC.band}Con la banda</a>`:''}</div>
    <p class="cap">${DB.best[id]!=null?`Tu mejor marca: ${pctTxt(DB.best[id])} · ${'★'.repeat(DB.stars[id]||0)||'sin estrellas'}`:'Aún no lo practicas con calificación.'}</p>
    ${toolDock(`<button class="kplayb" id="gp"></button>`)}</div>`,
  mount(r){
    const on=()=>SEQ.id==='grv';
    const pv=toolMount(r,()=>({spd:SPEEDS[st.spd][1],you:st.muted.length?st.muted.map(x=>ROWS[x].a).join(' '):'Nada',snd:st.click?'Sí':'No',meta:`${bpmFor(id,st.spd)} bpm · ${meterTxt(g)}`}));
    const paint=()=>{$('#gp',r).innerHTML=playLbl(on(),'Tocar','Detener');if(!on())gridNow(r,-1);pv()};
    const start=()=>grooveRun({id:'grv',g,bpm:bpmFor(id,st.spd),click:()=>st.click,drums:true,muted:st.muted,count:false,onStep:i=>lightStep(r,g,i)});
    const restart=()=>{if(on()){grooveStop();start()}paint()};
    r.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
      if(b.id==='gp'){if(on())grooveStop();else start();paint()}
      else if(b.dataset.spd){st.spd=b.dataset.spd;DB.spd[id]=st.spd;save();$$('[data-spd]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));restart()}
      else if(b.dataset.tq){DB.gbpm[id]=Math.max(30,Math.min(240,baseBpm(id)+ +b.dataset.tq));save();$('#gbv',r).textContent=baseBpm(id)+' bpm';$$('[data-spd]',r).forEach(x=>{x.querySelector('i').textContent=Math.round(baseBpm(id)*SPEEDS[x.dataset.spd][0])});restart()}
      else if(b.dataset.mute){const k=st.muted.indexOf(b.dataset.mute);if(k>=0)st.muted.splice(k,1);else st.muted.push(b.dataset.mute);b.setAttribute('aria-pressed',String(k<0));$('#ggrid',r).innerHTML=grooveGrid(g,{muted:st.muted});restart()}
      else if(b.dataset.click){st.click=b.dataset.click==='1';$$('[data-click]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));restart()}});
    const h=()=>paint();document.addEventListener('playstate',h);paint();
    return()=>{document.removeEventListener('playstate',h);grooveStop()};
  }};
}
