/* ---------- teclado: muestra un rango de notas (rango vocal, tipos de voz) ---------- */
const KLO=36,KHI=84;
function kbX(m){let w=0;for(let k=KLO;k<m;k++)if(NATPC.includes(pcOf(k)))w++;return w}
function keyboardSVG(lo,hi,clo,chi){
  const nw=kbX(KHI+1),W=nw*10;let wk='',bk='';
  for(let m=KLO;m<=KHI;m++){
    const on=lo!=null&&m>=lo&&m<=hi,cz=clo!=null&&m>=clo&&m<=chi,x=kbX(m)*10;
    if(NATPC.includes(pcOf(m)))wk+=`<rect x="${x+.5}" y="0" width="9" height="46" rx="1.5" class="${on?cz?'kz':'kon':'kw'}"/>${pcOf(m)===0?`<text x="${x+5}" y="58" class="kl">${nnTxt(m)}</text>`:''}`;
    else bk+=`<rect x="${x-3}" y="0" width="6" height="28" rx="1" class="${on?cz?'kbz':'kbon':'kb'}"/>`;
  }
  return`<svg class="kbd" viewBox="-8 0 ${W+16} 62" preserveAspectRatio="none" role="img" aria-label="Teclado del Do2 al Do6">${wk}${bk}</svg>`;
}
function voiceBars(lo,hi){
  const W=kbX(KHI+1)*10,pc=m=>(kbX(m)*10+5)/W*100;
  return`<div class="vbars">${VOICES.map(v=>`<div class="vbar${lo!=null&&voiceGuess(lo,hi)===v?' me':''}"><span class="vn">${v.n}</span><span class="vt"><i style="left:${pc(v.lo).toFixed(1)}%;width:${(pc(v.hi)-pc(v.lo)).toFixed(1)}%"></i></span></div>`).join('')}</div>`;
}
/* ---------- afinador de voz ---------- */
function viewTuner(){
  const ticks=[-50,-25,0,25,50].map(c=>{const a=(c/50)*60*Math.PI/180,x1=150+Math.sin(a)*112,y1=150-Math.cos(a)*112,x2=150+Math.sin(a)*126,y2=150-Math.cos(a)*126;return`<line class="tickm" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/><text class="lab" x="${(150+Math.sin(a)*142).toFixed(1)}" y="${(154-Math.cos(a)*142).toFixed(1)}">${c>0?'+'+c:c}</text>`}).join('');
  if(DB.ref==null)DB.ref=Math.round((comfy().lo+comfy().hi)/2);
  return{title:'Afinador de voz',back:'#/practicar',html:`<div class="kplay tplay">
  ${toolHead('tuner','Afinador de voz','Tu voz en tiempo real')}
  ${toolBar([['ref','Nota guía',TKIC.ref]])}
  ${toolPanels([['ref','Nota guía',`<div class="row" style="justify-content:center"><button class="kic" data-ref="-1" aria-label="Bajar medio tono">${IC.minus}</button><span class="kkey" id="refn" style="min-width:110px;text-align:center"></span><button class="kic" data-ref="1" aria-label="Subir medio tono">${IC.plus}</button></div>
    <div class="chips" style="justify-content:center;margin-top:10px"><button class="chip" data-refon aria-pressed="${DB.refOn!==false}">Mostrar franja de la nota</button></div>
    <p class="cap" style="margin:8px 0 0">La franja azul marca la nota guía en el carril. Toca «Escuchar» abajo para oírla.</p>`]])}
  <div class="card center tstage">
    <svg class="gauge" id="gauge" viewBox="0 0 300 170" role="img" aria-label="Desviación en cents"><path d="M ${150-120*Math.sin(Math.PI/3)} ${150-120*Math.cos(Math.PI/3)} A 120 120 0 0 1 ${150+120*Math.sin(Math.PI/3)} ${150-120*Math.cos(Math.PI/3)}" fill="none" stroke="var(--line)" stroke-width="6"/>${ticks}<line class="needle" id="needle" x1="150" y1="150" x2="150" y2="44" style="transform-origin:150px 150px"/><circle cx="150" cy="150" r="7" fill="var(--accent)"/></svg>
    <div class="tnote" id="tn">—</div>
    <div class="cap" id="thz" style="margin:0">Activa el micrófono y canta una «u» cómoda</div>
    <div id="tmsg"></div>
  </div>
  <div class="card lanecard"><canvas class="lane" id="lane" aria-label="Línea de tu voz"></canvas></div>
  <p class="cap">Dentro de ±10 cents la aguja se pone verde. Si estás alto (derecha), relaja; si estás bajo (izquierda), dale más aire, no más garganta.</p>
  ${toolDock(`<button class="btn sm" id="refplay">${IC.sound}<span>Escuchar</span></button><div class="ktrans"><button class="kplayb" id="tgo"></button></div><span class="tm" id="tdst"></span>`)}
  </div>`,
  mount(r){
    const go=$('#tgo',r),tn=$('#tn',r),hz=$('#thz',r),nd=$('#needle',r),g=$('#gauge',r),msg=$('#tmsg',r),cv=$('#lane',r);
    const st={C:laneColors(),targets:[],trail:[],sec:1.2,labels:true};let raf=0,alive=true;
    const refT=()=>{st.targets=DB.refOn!==false?[{t0:-1e6,t1:1e6,m:DB.ref,ph:'S',n:0,h:0}]:[];st.fixed=[DB.ref-5,DB.ref+5]};refT();
    const tv=toolMount(r,()=>({ref:nnTxt(DB.ref),meta:DB.range?`Tu rango: ${nnTxt(DB.range.lo)} a ${nnTxt(DB.range.hi)}`:'Mide tu rango para ajustar todo a tu voz'}));
    const paint=()=>{go.innerHTML=playLbl(!!MIC.stream,'Activar micrófono','Detener',TKIC.mic);$('#tdst',r).textContent=MIC.stream?'Escuchando…':'Micrófono apagado';$('#refn',r).innerHTML=nnHTML(DB.ref)+` <small>${nnUS(DB.ref)}</small>`;tv()};
    const show=d=>{
      const s={t:d.t,m:d.m,hit:d.m!=null&&Math.abs(d.m-DB.ref)<=.5&&DB.refOn!==false};st.trail.push(s);if(st.trail.length>300)st.trail.splice(0,100);
      if(d.m==null){g.classList.remove('in');return}
      const n=Math.round(d.m),c=Math.round((d.m-n)*100);
      tn.innerHTML=nnHTML(n);
      hz.textContent=m2f(d.m).toFixed(1)+' Hz · '+(c>0?'+':'')+c+' cents'+(Math.abs(c)<=10?' · afinado':c<0?' · sube tantito':' · baja tantito');
      nd.style.transform=`rotate(${Math.max(-60,Math.min(60,c/50*60))}deg)`;g.classList.toggle('in',Math.abs(c)<=10);
    };
    const loop=()=>{if(!alive)return;laneDraw(cv,st,AC?AC.currentTime-outLat():0);raf=requestAnimationFrame(loop)};
    go.onclick=async()=>{msg.innerHTML='';if(MIC.stream){micStop();tn.textContent='—';g.classList.remove('in');nd.style.transform='rotate(0)'}else{seqStop();await micStart(show,k=>{msg.innerHTML=micErrHTML(k)})}paint()};
    $('#refplay',r).onclick=()=>{if(ac())guideTone(DB.ref,AC.currentTime+.03,1.6,.2)};
    r.addEventListener('click',e=>{const b=e.target.closest('[data-ref]');if(b){DB.ref=Math.max(40,Math.min(84,DB.ref+ +b.dataset.ref));save();refT();if(ac())piano(DB.ref,AC.currentTime+.02,.9,.2);paint()}
      const ro=e.target.closest('[data-refon]');if(ro){DB.refOn=DB.refOn===false;save();ro.setAttribute('aria-pressed',String(DB.refOn!==false));refT()}});
    paint();ac();loop();
    return()=>{alive=false;cancelAnimationFrame(raf);micStop()};
  }};
}
/* ---------- rango vocal ---------- */
function viewRange(options={}){
  const R={ph:'idle',lo:null,hi:null,buf:[]};
  return{title:'Rango vocal',back:'#/practicar',html:`<div class="kplay tplay">
  ${toolHead('range','Rango vocal','Encuentra tu voz')}
  <div class="card center rstage">
    <span class="eyebrow" id="rph">Paso 1 de 3</span>
    <h3 id="rtt" style="margin:0">Mide de qué nota a qué nota cantas</h3>
    <p class="sub" id="rtx" style="text-align:center;margin:0">Busca un lugar tranquilo. Canta en «a» con sonido sano: sin gritar ni susurrar. Solo cuentan las notas que sostienes medio segundo.</p>
    <div class="tnote" id="rnote">—</div>
    <div class="rlh"><div><small>Más grave</small><b id="rlo">—</b></div><div><small>Más aguda</small><b id="rhi">—</b></div></div>
    <div id="rmsg"></div>
  </div>
  <div class="card"><span class="cl">Tu rango en el teclado</span><div id="rkbd">${keyboardSVG(DB.range&&DB.range.lo,DB.range&&DB.range.hi,DB.range&&DB.range.lo+2,DB.range&&DB.range.hi-2)}</div>${voiceBars(DB.range&&DB.range.lo,DB.range&&DB.range.hi)}
   <p class="cap" style="margin:8px 0 0" id="rres">${DB.range?rangeText(DB.range.lo,DB.range.hi):'Azul fuerte: tu zona cómoda. Azul claro: los extremos de tu rango.'}</p></div>
  ${toolDock(`<span class="tm" id="rdock"></span><div class="ktrans"><button class="kplayb" id="rgo"></button></div><button class="btn sm" id="rre" hidden>${IC.redo}<span>Repetir</span></button>`)}
  </div>`,
  mount(r){
    const go=$('#rgo',r),msg=$('#rmsg',r);
    const set=()=>{
      const P={idle:['Paso 1 de 3','Mide de qué nota a qué nota cantas','Busca un lugar tranquilo. Canta en «a» con sonido sano: sin gritar ni susurrar. Solo cuentan las notas que sostienes medio segundo.','Empezar'],
        low:['Paso 2 de 3','Baja hasta tu nota más grave','Empieza en una nota cómoda y baja poco a poco: «a… a… a…». Sostén la más grave que salga con buen sonido. Cuando ya no baje más, toca Listo.','Listo, ya bajé'],
        high:['Paso 3 de 3','Sube hasta tu nota más aguda','Ahora sube poco a poco. Arriba puedes usar voz ligera (de cabeza), como imitando a un búho. Sin gritar. Cuando ya no suba más, toca Listo.','Listo, ya subí'],
        done:['Resultado','Este es tu rango vocal','','Guardar']}[R.ph];
      $('#rph',r).textContent=P[0];$('#rtt',r).textContent=P[1];$('#rtx',r).textContent=R.ph==='done'?(R.lo!=null&&R.hi>R.lo?rangeText(R.lo,R.hi):'No alcancé a oír notas sostenidas. Acércate al micrófono y vuelve a intentarlo.'):P[2];
      go.innerHTML=playLbl(false,P[3],'',R.ph==='idle'?TKIC.mic:R.ph==='done'?IC.check:IC.next);
      $('#rlo',r).innerHTML=R.lo!=null?nnHTML(R.lo):'—';$('#rhi',r).innerHTML=R.hi!=null?nnHTML(R.hi):'—';
      $('#rdock',r).textContent=MIC.stream?'Escuchando…':R.ph==='done'?'Listo':'Micrófono apagado';$('#rre',r).hidden=R.ph==='idle';
      const m=$('#tmeta',r);if(m)m.textContent=DB.range?`Guardado: ${nnTxt(DB.range.lo)} a ${nnTxt(DB.range.hi)}`:'Todavía no mides tu rango';
      if(R.lo!=null&&R.hi!=null&&R.hi>R.lo){$('#rkbd',r).innerHTML=keyboardSVG(R.lo,R.hi,R.lo+2,R.hi-2)}
    };
    const onMic=d=>{
      if(d.m==null){R.buf=[];return}
      R.buf.push(d.m);if(R.buf.length>13)R.buf.shift();
      $('#rnote',r).innerHTML=nnHTML(d.m);
      if(R.buf.length<12)return; // ~0.5 s
      const so=[...R.buf].sort((a,b)=>a-b),med=so[6];
      if(so[so.length-2]-so[1]>1)return; // todavía se mueve
      const n=Math.round(med);
      if(R.ph==='low'&&(R.lo==null||n<R.lo)){R.lo=n;if(R.hi==null||R.hi<n)R.hi=n;set()}
      if(R.ph==='high'&&(R.hi==null||n>R.hi)){R.hi=n;set()}
      if(R.ph==='low'&&R.hi!=null&&n>R.hi){R.hi=n;set()}
    };
    go.onclick=async()=>{
      msg.innerHTML='';
      if(R.ph==='idle'){const ok=options.session?(MIC.on=onMic,!!MIC.stream):await micStart(onMic,k=>{msg.innerHTML=micErrHTML(k)});if(!ok){set();return}R.ph='low';R.lo=R.hi=null;R.buf=[]}
      else if(R.ph==='low')R.ph='high';
      else if(R.ph==='high'){R.ph='done';if(!options.session)micStop();else MIC.on=null}
      else if(R.ph==='done'){if(R.lo!=null&&R.hi-R.lo>=5){recordRange(R.lo,R.hi);if(options.onDone){options.onDone();return}$('#rres',r).textContent=rangeText(R.lo,R.hi);r.querySelector('.vbars').outerHTML=voiceBars(R.lo,R.hi);toast(logo()+'<span>Rango guardado. Los ejercicios ya están a tu medida.</span>')}else msg.innerHTML='<p class="msg err">El rango salió muy corto (menos de 5 notas). Repite la medición con más calma.</p>'}
      set();
    };
    $('#rre',r).onclick=()=>{if(!options.session)micStop();else MIC.on=null;R.ph='idle';R.lo=R.hi=null;set()};
    set();
    return()=>{if(!options.session)micStop();else MIC.on=null};
  }};
}
function rangeText(lo,hi){const v=voiceGuess(lo,hi),st=hi-lo,oc=Math.floor(st/12),rest=st%12;
  return`De ${nnTxt(lo)} a ${nnTxt(hi)}: ${oc?oc+(oc>1?' octavas':' octava')+(rest?' y '+rest+(rest>1?' semitonos':' semitono'):''):st+' semitonos'}. Zona de referencia: ${v.n.toLowerCase()}. Es una orientación, no un límite.`}
/* ---------- respiración ---------- */
const BR={mode:'448',cycles:5};
function viewBreath(){
  return{title:'Respiración',back:'#/practicar',html:`<div class="kplay tplay">
  ${toolHead('breath','Respiración','El aire es el motor')}
  <div class="seg" id="brm" style="align-self:center">${[['448','Guiada 4-4-8'],['sss','Sss medida']].map(([v,l])=>`<button data-brm="${v}" aria-pressed="${BR.mode===v}">${l}</button>`).join('')}</div>
  <div class="card center brstage">
    <div class="brc" id="brc"><div class="brdisc" id="brd"></div><div class="brin"><b id="brn">4</b><span id="brl">Listo</span></div></div>
    <p class="sub" id="brtx" style="text-align:center;margin:0"></p>
    <div id="brmsg"></div>
  </div>
  <p class="cap" id="brcap"></p>
  ${toolDock(`<span class="tm" id="brdock"></span><div class="ktrans"><button class="kplayb" id="brgo"></button></div><span class="tm" id="brbest"></span>`)}
  </div>`,
  mount(r){
    let iv=null,run=false,t0=0,noise=0,on=0,last=0,cur=0,peak=0;
    const disc=$('#brd',r),n=$('#brn',r),l=$('#brl',r),go=$('#brgo',r);
    const scale=s=>{disc.style.transform=`scale(${s.toFixed(3)})`};
    const paint=()=>{
      go.innerHTML=playLbl(run,BR.mode==='sss'?'Medir':'Empezar','Detener',BR.mode==='sss'?TKIC.mic:IC.play);
      $('#brtx',r).textContent=BR.mode==='448'?'Inhala 4 tiempos por la nariz, sostén 4 y suelta 8 con una «sss» pareja. Cinco ciclos.':'Inhala abajo y di «sss» parejo cerca del teléfono. La app cuenta mientras suene.';
      $('#brcap',r).textContent=BR.mode==='448'?'Mano en el ombligo: al inhalar la panza sale, los hombros no suben. Al sostener, no cierres la garganta: es como si siguieras inhalando.':'Meta: 15 segundos hoy, 25 en un mes. Lo que cuenta es que el sonido sea igual del principio al final.';
      $('#brbest',r).textContent=DB.breath?'Récord '+DB.breath.toFixed(1)+' s':'';
      $('#brdock',r).textContent=run?(BR.mode==='sss'?'Escuchando…':'Respirando'):'Listo';
      const m=$('#tmeta',r);if(m)m.textContent=BR.mode==='448'?'Guiada · 5 ciclos de 16 segundos':'Mide tu «sss» con el micrófono';
    };
    const stop=()=>{clearInterval(iv);iv=null;run=false;micStop();scale(.55);n.textContent=BR.mode==='448'?'4':'0';l.textContent='Listo';WAKE=Math.max(0,WAKE-(BR._w||0));BR._w=0;wake(false);paint()};
    const guided=()=>{
      ac();t0=performance.now();run=true;WAKE++;BR._w=1;wake(true);let lastSec=-1;
      iv=setInterval(()=>{
        const e=(performance.now()-t0)/1000,cyc=Math.floor(e/16),p=e%16;
        if(cyc>=BR.cycles){stop();bell();markDay();toast(logo()+'<span>Cinco ciclos completos. Buen aire.</span>');DB.today.respira=today();save();return}
        let ph,k,s;if(p<4){ph='Inhala';k=4-Math.floor(p);s=.55+.45*(p/4)}else if(p<8){ph='Sostén';k=8-Math.floor(p);s=1}else{ph='Suelta «sss»';k=16-Math.floor(p);s=1-.45*((p-8)/8)}
        scale(s);n.textContent=k;l.textContent=ph+' · ciclo '+(cyc+1)+' de '+BR.cycles;
        const sec=Math.floor(e);if(sec!==lastSec){lastSec=sec;if(AC)tickSound(AC.currentTime+.01,p<.5||Math.abs(p-4)<.5||Math.abs(p-8)<.5?'beat':'sub')}
      },80);
    };
    const measure=async()=>{
      $('#brmsg',r).innerHTML='';
      const ok=await micStart(()=>{},k=>{$('#brmsg',r).innerHTML=micErrHTML(k)});if(!ok)return;
      run=true;noise=0;on=0;cur=0;peak=0;const tStart=performance.now();l.textContent='Silencio… midiendo el ruido';
      iv=setInterval(()=>{
        const now=performance.now(),lv=MIC.level;
        if(now-tStart<700){noise=Math.max(noise,lv);return}
        const th=Math.max(.012,noise*2.5);
        if(lv>th){if(!on){on=now;l.textContent='Sigue… parejo'}last=now;cur=(now-on)/1000;n.textContent=cur.toFixed(1);scale(Math.max(.55,1-cur/40))}
        else if(on&&now-last>450){
          const sec=(last-on)/1000;on=0;
          if(sec>=2){peak=Math.max(peak,sec);const rec=sec>(DB.breath||0);if(rec)DB.breath=+sec.toFixed(1);DB.today.respira=today();markDay();save();l.textContent=rec?'¡Nuevo récord!':'Inhala y vuelve a intentar';n.textContent=sec.toFixed(1);if(rec)bell();paint()}
          else{l.textContent='Di «sss» parejo';}
        }else if(!on)l.textContent='Inhala abajo… y «sss»';
      },50);
      paint();
    };
    go.onclick=()=>{if(run){stop();return}if(BR.mode==='448')guided();else measure();paint()};
    r.addEventListener('click',e=>{const b=e.target.closest('[data-brm]');if(!b)return;if(run)stop();BR.mode=b.dataset.brm;$$('[data-brm]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));n.textContent=BR.mode==='448'?'4':'0';paint()});
    scale(.55);paint();
    return()=>{if(run)stop()};
  }};
}
/* ---------- metrónomo (igual al de Roka Guitar) ---------- */
const TAPS=[];
function viewMetronome(){
  MET.bpm=DB.met||MET.bpm;MET.meter=DB.meter||MET.meter;
  const beats=()=>{const m=METERS[MET.meter];return Array.from({length:m.b},(_,i)=>`<i style="--k:${i}" class="${(i===0?acc1():m.acc.includes(i))?'acc':''}"></i>`).join('')};
  return{title:'Metrónomo',back:'#/practicar',html:`<div class="kplay tplay">
  ${toolHead('metro','Metrónomo','Pulso')}
  ${toolBar([['meter','Compás',TKIC.meter],['pulse','Ver el pulso',TKIC.eye]])}
  ${toolPanels([['meter','Compás',chipRow('meter','Compás',Object.keys(METERS).map(v=>({v,l:v})),MET.meter)],['pulse','Ver el pulso',pulseOptions()]])}
  <div class="card center metstage">
    <div class="dial"><div class="beats" id="beats" style="--n:${METERS[MET.meter].b}">${beats()}</div>
     <div class="dc"><div class="big" id="bpmv">${MET.bpm}</div><div class="cl" style="margin:0">BPM</div></div></div>
    <div class="row mstep" style="justify-content:center">
      <button class="btn sm" data-m="-5">−5</button><button class="btn sm" data-m="-1">−1</button>
      <button class="btn sm" data-m="1">+1</button><button class="btn sm" data-m="5">+5</button></div>
    <input type="range" id="bpmr" min="30" max="240" value="${MET.bpm}" aria-label="Tempo en BPM">
    <button class="btn" id="tap">Marcar tempo</button>
  </div>
  <p class="cap">Para cantar: practica las frases difíciles a un tempo más lento y súbelo de 5 en 5 cuando te salgan afinadas tres veces seguidas.</p>
  ${toolDock(`<span class="tm" id="tdm"></span><div class="ktrans"><button class="kic" data-m="-1" aria-label="Bajar 1 bpm">${IC.minus}</button><button class="kplayb" id="metgo"></button><button class="kic" data-m="1" aria-label="Subir 1 bpm">${IC.plus}</button></div><span></span>`)}
  </div>`,
  mount(r){
    const go=$('#metgo',r),bv=$('#bpmv',r),rg=$('#bpmr',r);
    const light=(b,isBeat)=>{if(!isBeat)return;$$('#beats i',r).forEach((x,i)=>x.classList.toggle('on',i===b));beatPulse(r,b===0)};
    const running=()=>SEQ.id==='met';
    const tv=toolMount(r,()=>({meter:MET.meter,pulse:DB.metMute?'Solo vista':DB.flash?'Destello':'Barra',meta:`${MET.bpm} bpm · ${MET.meter}`}));
    const paint=()=>{go.innerHTML=playLbl(running(),'Iniciar','Detener');bv.textContent=MET.bpm;rg.value=MET.bpm;$('#tdm',r).textContent=running()?`Sonando · ${MET.bpm} bpm`:`${MET.meter} · listo`;tv();if(!running())$$('#beats i',r).forEach(x=>x.classList.remove('on'))};
    const setBpm=v=>{MET.bpm=Math.max(30,Math.min(240,Math.round(v)));DB.met=MET.bpm;save();paint()};
    if(SEQ.id==='met')SEQ.ui=s=>light(Math.floor(s/MET.sub)%METERS[MET.meter].b,s%MET.sub===0);
    go.onclick=()=>{if(running())seqStop();else metStart({sub:1},light);paint()};
    rg.oninput=()=>setBpm(+rg.value);
    $$('[data-m]',r).forEach(b=>b.onclick=()=>setBpm(MET.bpm+ +b.dataset.m));
    $('#tap',r).onclick=()=>{const n=performance.now();if(TAPS.length&&n-TAPS[TAPS.length-1]>2000)TAPS.length=0;TAPS.push(n);if(TAPS.length>5)TAPS.shift();const tb=$('#tap',r);if(ac())tickSound(AC.currentTime+.01,'beat');if(TAPS.length>=2){const d=(TAPS[TAPS.length-1]-TAPS[0])/(TAPS.length-1);setBpm(60000/d);tb.textContent='Marcar tempo · '+TAPS.length+' toques'}else tb.textContent='Sigue tocando al pulso…';clearTimeout(tb._t);tb._t=setTimeout(()=>{tb.textContent='Marcar tempo'},2200)};
    $$('[data-set]',r).forEach(b=>b.onclick=()=>{MET.meter=b.dataset.v;$$('[data-set="meter"]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('#beats',r).innerHTML=beats();$('#beats',r).style.setProperty('--n',METERS[MET.meter].b);DB.meter=MET.meter;save()});
    const h=()=>paint();document.addEventListener('playstate',h);paint();
    return()=>{document.removeEventListener('playstate',h);seqStop()};
  }};
}
/* ---------- ejercicio de calentamiento con calificación ---------- */
function lyricHTML(S){return S.lines.map((L,li)=>`<p class="lyl" data-li="${li}">${L.syl.map((s,si)=>`<span class="syl" data-si="${si}">${esc(s.x)}</span>${s.sp?' ':''}`).join('')}</p>`).join('')}
function viewDrill(id){const d=drillById(id);return d?levelOpen(d.lvl)?viewCoach({id}):viewLocked(d.lvl):viewExercises()}
function viewSing(id){return songById(id)?viewCoach({id:'song:'+id}):viewSongs()}
