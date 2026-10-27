const LOCK=TI('<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/>');
const DRUM_TOOLS=[['metronomo','Metrónomo',IC.metro,'Click en 2 y 4, intermitente y entrenador'],['precision','Medidor de precisión',IC.target,'Con micrófono o toques, mide cada golpe'],['banda','Tocar con la banda',IC.band,'Bajo y acordes sin batería: tú la pones'],['setlist','Setlist',IC.list,'El tempo de las canciones de tu banda']];
const toolList=()=>`<div class="dtools">${DRUM_TOOLS.map(([id,t,ic,s])=>`<a class="card dtool" href="#/practicar/${id}"><span class="ic">${ic}</span><span><b>${t}</b><small>${s}</small></span></a>`).join('')}</div>`;
function weekAcc(back){const a=new Date(),b=new Date();a.setDate(a.getDate()-6-7*(back||0));b.setDate(b.getDate()-7*(back||0));return mean(DB.hist.filter(h=>h.d>=today(a)&&h.d<=today(b)).map(h=>h.s))}
function grooveAlb(id){
  const g=G[id],open=levelOpen(lvlOf(id)),best=DB.best[id],sub=`${'★'.repeat(DB.stars[id]||0)||'☆'} · ${best==null?g.bpm+' bpm':pctTxt(best)}`;
  const card=albCard('#/groove/'+id,grooveArt(id),esc(g.n),open?sub:`${LOCK} Nivel ${lvlOf(id)}`,null,(DB.stars[id]||0)>=3);
  return open?card:card.replace('class="alb','class="alb locked');
}
/* ---------- Hoy ---------- */
function viewDrumHome(){
  const s=buildSession(),done=s.i>=s.steps.length,lvl=currentLevel(),label=done?'Resumen':s.i||s.res.some(Boolean)?'Continuar':'Empezar';
  const wa=weekAcc(),old=oldProgress()&&!DB.imported,nx=ALLEX.find(x=>!DB.done[x.id]);
  return{title:INST.nombre,html:`<div class="coach-greeting"><a class="guitar-pill" href="../roka/?cambiar">Familia Om</a><span class="eyebrow">${greet()}</span><span class="coach-pill">${streak()===1?'1 día':streak()+' días'} de racha</span><h1>Om Batería</h1><p>Nivel ${lvl} · ${LEVELS[lvl]}</p></div>
    ${old?`<section class="card importc"><div><h2>Traer tu progreso de Pulso a la Vista</h2><p class="cap">Encontramos tu práctica de la app anterior en este teléfono: lecciones hechas, días, pruebas del medidor, setlist y calibración. Se suma sin borrar nada.</p></div><div class="row"><button class="btn pri" data-imp="1">${IC.down}Traer mi progreso</button><button class="btn" data-imp="0">Ahora no</button></div></section>`:''}
    <section class="card session-card"><div class="session-art">${grooveArt(s.steps[1].id)}</div><div class="session-content"><span class="eyebrow">Tu sesión de hoy · unos 10 min</span><h2>${done?'Hoy ya sonaste':'Manos sueltas. Pulso firme.'}</h2><p class="cap">Calienta, toca el groove del día, mide tu precisión y toca con la banda. Avanza sola.</p>
      <ol class="session-steps">${s.steps.map((x,i)=>{const r=s.res[i],ok=r&&!r.skipped;return`<li class="${ok?'done':''}"><span>${ok?IC.check:i+1}</span><b>${KIND[x.k][0]}: ${esc(G[x.id].n)}</b>${r?`<small>${r.skipped?'Saltado':Math.round(r.p*100)+' %'}</small>`:''}</li>`}).join('')}</ol>
      <div class="session-start"><a class="kplayb" href="#/sesion" aria-label="${label} sesión">${done?IC.check:IC.play}<span>${label}</span></a><span>${done?'Buen trabajo por hoy.':'Yo cuento. Tú tocas.'}</span></div></div></section>
    <div class="coach-stats four"><div><b>${streak()}</b><span>días de racha</span></div><div><b>${weekMins()}</b><span>min esta semana</span></div><div><b>${wa==null?'—':Math.round(wa*100)+' %'}</b><span>precisión semanal</span></div><div><b>${levelStars(lvl)}</b><span>estrellas del nivel ${lvl}</span></div></div>
    ${nx?`<a class="card dtool" href="#/leccion/${nx.lesson}"><span class="ic">${IC.book}</span><span><b>Continuar: ${esc(nx.t)}</b><small>Lección ${nx.lesson} · ${esc(LESSONS.find(l=>l.id===nx.lesson).title)}</small></span></a>`:''}
    <section><div class="sech"><h2>Grooves de tu nivel</h2><a class="coach-link" href="#/grooves">Ver todos</a></div><div class="shelf">${DRUM_LEVELS[lvl].map(grooveAlb).join('')}</div></section>
    <section><h2>Herramientas</h2>${toolList()}</section>${drumLinks()}
    <p class="foot">Om Batería · ${automatiaMark()} · kit Black Pearl de AVL Drumkits · Glen MacArthur · CC BY-SA 3.0 · <a href="#/ajustes">Ajustes y créditos</a></p>`,
  mount(r){
    r.addEventListener('click',e=>{const b=e.target.closest('[data-imp]');if(!b)return;if(b.dataset.imp==='1'){importOld();toast('Listo: tu progreso de Pulso a la Vista ya está aquí.')}else{DB.imported=-1;save()}route()});
    const t=setTimeout(()=>{if(DB.onb==null)drumOnboardShow()},400);return()=>{clearTimeout(t);$('#onb')?.remove()};
  }};
}
function drumOnboardShow(){
  if($('#onb'))return;const el=document.createElement('dialog');el.id='onb';el.className='coach-dialog';
  el.innerHTML=`<span class="logo">${logo()}</span><h2>Te damos la bienvenida</h2><p>Cada día te armo una sesión corta: calentamiento, un groove, precisión y tocar con la banda. Califico cada golpe.</p><p>¿Cómo vas a tocar?</p><div class="row"><button class="btn" data-in="mic" aria-pressed="${DB.input==='mic'}">${IC.mic}Con mi batería</button><button class="btn" data-in="tap" aria-pressed="${DB.input!=='mic'}">${IC.hand}En la pantalla</button></div><p class="cap">Con tu batería uso el micrófono del teléfono; si no tienes batería a la mano, tocas los botones. Puedes cambiarlo en cada ejercicio.</p><button class="btn pri" data-welcome>Vamos</button>`;
  document.body.appendChild(el);el.showModal();
  el.addEventListener('click',e=>{const v=e.target.closest('[data-in]');if(v){DB.input=v.dataset.in;$$('[data-in]',el).forEach(b=>b.setAttribute('aria-pressed',String(b===v)));save()}if(e.target.closest('[data-welcome]')){DB.onb=1;save();el.close();el.remove()}});
  el.oncancel=()=>{DB.onb=1;save();el.remove()};
}
/* ---------- Grooves por nivel ---------- */
function viewGrooves(){return{title:'Grooves',html:`<div class="lhead"><span class="eyebrow">29 grooves · 3 niveles</span><h1>Grooves</h1><p class="sub">Escúchalos, míralos iluminarse y practícalos con calificación. Cada nivel se abre con 10 estrellas del anterior.</p></div>
  ${[1,2,3].map(l=>`<section class="level-section"><div class="sech"><h2>${l}. ${LEVELS[l]}</h2><span>${levelOpen(l)?levelStars(l)+' de '+DRUM_LEVELS[l].length*3+' estrellas':LOCK+' Te faltan '+Math.max(0,10-levelStars(l-1))+' estrellas'}</span></div><div class="albs">${DRUM_LEVELS[l].map(grooveAlb).join('')}</div></section>`).join('')}
  <p class="cap">50 % = ★ · 70 % = ★★ · 85 % = ★★★. Se conserva tu mejor resultado. Los grooves bloqueados se pueden escuchar; la calificación se abre con el nivel.</p>`}}
function progressBars(values,labels,unit,max){
  const ceiling=max||Math.max(1,...values.map(v=>v||0));
  return`<div class="progress-chart" role="img" aria-label="${esc(labels.map((l,i)=>l+': '+(values[i]==null?'sin datos':Math.round(values[i])+unit)).join(', '))}">${values.map((v,i)=>`<div class="chart-column"><b>${v==null?'—':Math.round(v)+unit}</b><div class="chart-track"><i style="height:${!v?0:Math.max(2,v/ceiling*100)}%"></i></div><small>${esc(labels[i])}</small></div>`).join('')}</div>`;
}
function viewProgress(){
  const days=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);return d}),minutes=days.map(d=>(DB.secs[today(d)]||0)/60);
  const monday=new Date();monday.setHours(12,0,0,0);monday.setDate(monday.getDate()-(monday.getDay()+6)%7);
  const weeks=Array.from({length:6},(_,i)=>{const s=new Date(monday);s.setDate(s.getDate()-(5-i)*7);const e=new Date(s);e.setDate(e.getDate()+7);const hs=DB.hist.filter(h=>h.d>=today(s)&&h.d<today(e));
    const v=mean(hs.map(h=>h.s)),ms=mean(hs.filter(h=>h.ms!=null).map(h=>Math.abs(h.ms)));return{date:s,v:v==null?null:v*100,ms}});
  const dl=d=>d.toLocaleDateString('es-MX',{day:'numeric',month:'short'}),last=(DB.ses||[]).slice(-3).reverse();
  return{title:'Progreso',html:`<div class="lhead"><span class="eyebrow">Cada golpe cuenta</span><h1>Tu progreso</h1></div>
    <div class="coach-stats"><div><b>${streak()}</b><span>racha actual</span></div><div><b>${bestStreak()}</b><span>mejor racha</span></div><div><b>${DB.played||0}</b><span>prácticas calificadas</span></div></div>
    <section class="card"><h2>Minutos por día</h2><p class="cap">Últimos 7 días</p>${progressBars(minutes,days.map(d=>d.toLocaleDateString('es-MX',{weekday:'short'})),' min')}</section>
    <section class="card"><h2>Tu precisión por semana</h2><p class="cap">Promedio de prácticas calificadas · últimas 6 semanas</p>${progressBars(weeks.map(w=>w.v),weeks.map(w=>dl(w.date)),' %',100)}
      <p class="cap">${weeks.some(w=>w.ms!=null)?'Distancia promedio al pulso: '+weeks.filter(w=>w.ms!=null).map(w=>dl(w.date)+' '+Math.round(w.ms)+' ms').join(' · ')+'. Menos es mejor.':'Tu primera práctica calificada aparecerá aquí.'}</p></section>
    <section class="card"><h2>Niveles</h2>${[1,2,3].map(l=>{const s=levelStars(l),mx=DRUM_LEVELS[l].length*3;return`<div class="level-progress"><div><b>${l}. ${LEVELS[l]}</b><span>${levelOpen(l)?s+' de '+mx+' estrellas':LOCK+' faltan '+Math.max(0,10-levelStars(l-1))+' ★'}</span></div><progress max="${mx}" value="${s}"></progress></div>`}).join('')}</section>
    <section class="card"><h2>Medidor de precisión</h2>${last.length?last.map(s=>`<div class="sesrow">${sesHTML(s,false)}</div>`).join(''):'<p class="cap">Aún no hay pruebas. Ábrelo en Practicar.</p>'}<a class="btn" href="#/practicar/precision">${IC.target}Medir ahora</a></section>`};
}
/* ---------- Ajustes ---------- */
function viewSettings(){
  const k={nombre:'Black Pearl',autor:'Glen MacArthur',licencia:'CC BY-SA 3.0',url:'https://www.bandshed.net/avldrumkits/',credito:'AVL Drumkits.'};
  return{title:'Ajustes',back:'#/',html:`<div class="lhead"><h1>Ajustes</h1></div>
    <section class="card coach-settings"><h2>Apariencia y sonido</h2><label>Tema<select data-pref="theme">${[['estudio','Estudio'],['punk','Escenario'],['claro','Aluminio (claro)'],['auto','Automático']].map(([v,n])=>`<option value="${v}" ${DB.theme===v?'selected':''}>${n}</option>`).join('')}</select></label>
      <label>Volumen del click<select data-pref="clickVol">${[[.5,'Bajo'],[1,'Normal'],[1.6,'Fuerte']].map(([v,n])=>`<option value="${v}" ${(DB.clickVol||1)==v?'selected':''}>${n}</option>`).join('')}</select></label>
      <label>Cómo te escucho<select data-pref="input"><option value="tap" ${DB.input!=='mic'?'selected':''}>Toques en pantalla</option><option value="mic" ${DB.input==='mic'?'selected':''}>Micrófono</option></select></label>
      <p class="cap">Sonido de batería: ${KIT?'kit grabado listo':KIT===false?'sintetizado (no se pudo cargar el kit grabado)':'kit grabado (se carga al primer toque)'}.</p></section>
    <section class="card coach-settings"><h2>Sincronizar toques</h2><p class="cap">Si tus toques salen siempre adelantados o atrasados, tócalos junto con 8 clicks y la app ajusta la diferencia de tu pantalla.</p>
      <div class="row"><button class="btn" id="tcal">${IC.hand}Sincronizar</button><span class="cap" id="tst">Ajuste actual: ${Math.round((DB.tapLat||0)*1000)} ms</span></div><button class="pad pad-tar big" data-pad="tar" id="tpad" hidden><b>Toca con cada click</b><small>o Espacio</small></button></section>
    <section class="card coach-settings"><h2>Micrófono</h2><p class="cap">${DB.lat!=null?'Retraso medido: '+Math.round(DB.lat*1000)+' ms.':'Sin calibrar.'} Calibra en el medidor (Ajustes del micrófono).</p><a class="btn" href="#/practicar/precision">${IC.target}Ir al medidor</a></section>
    ${oldProgress()?`<section class="card coach-settings"><h2>Pulso a la Vista</h2><p class="cap">${DB.imported>0?'Ya trajiste tu progreso de la app anterior.':'Hay progreso de la app anterior en este dispositivo.'}</p><button class="btn" data-imp>${IC.down}Traer mi progreso</button></section>`:''}
    <section class="card coach-settings"><h2>Créditos</h2><p class="cap">Batería grabada: «${esc(k.nombre)}» de ${esc(k.autor)}, licencia ${k.licencia} (<a href="${k.url}" target="_blank" rel="noopener">${k.url}</a>). ${esc(k.credito)} Bajo y guitarra de la banda: tonejs-instruments (CC BY 3.0).</p>
      <p class="cap">Grooves y lecciones vienen de Pulso a la Vista. Om Batería es parte de la familia Om (guitarra, voz, bajo y estudio).</p></section><a class="btn" href="#/apariencia">Todos los temas</a>${betaAbout()}`,
  mount(r){
    r.addEventListener('change',e=>{const k=e.target.dataset.pref;if(!k)return;DB[k]=k==='clickVol'?+e.target.value:e.target.value;save();if(k==='theme')applyTheme()});
    let un=null;
    r.addEventListener('click',e=>{
      if(e.target.closest('[data-imp]')){importOld();toast('Listo: tu progreso ya está aquí.');route();return}
      if(e.target.closest('#tcal')){const c=ac(),t0=c.currentTime+.6,ticks=Array.from({length:8},(_,i)=>t0+i*.6),offs=[],pad=$('#tpad',r);pad.hidden=false;
        const mm=DB.metMute;DB.metMute=false;ticks.forEach(t=>tick(t,'acc'));DB.metMute=mm;$('#tst',r).textContent='Toca junto con cada click…';
        un=padsMount(pad,t=>{const raw=t+(DB.tapLat||0),near=ticks.reduce((a,b)=>Math.abs(b-raw)<Math.abs(a-raw)?b:a);if(Math.abs(near-raw)<.3)offs.push(raw-near)});
        setTimeout(()=>{if(un){un();un=null}pad.hidden=true;if(offs.length>=5){DB.tapLat=Math.max(-.1,Math.min(.25,med(offs)));save();$('#tst',r).textContent='Listo. Ajuste: '+Math.round(DB.tapLat*1000)+' ms'}else $('#tst',r).textContent='Muy pocos toques; inténtalo de nuevo.'},(t0-c.currentTime+8*.6+.4)*1000)}});
    return()=>{if(un)un()};
  }};
}
function viewLocked(id){const l=lvlOf(id);return{title:'Nivel '+l,back:'#/grooves',html:`<div class="card coach-center"><span class="coach-lock">${LOCK}</span><h1>Nivel ${l} · ${LEVELS[l]}</h1><p>Te faltan ${Math.max(0,10-levelStars(l-1))} estrellas del nivel ${l-1} para practicar «${esc(G[id].n)}» con calificación.</p><p class="cap">Gana una estrella con 50 %, dos con 70 % y tres con 85 %.</p><div class="row how-actions"><a class="btn" href="#/groove/${id}">Escucharlo</a><a class="btn pri" href="#/grooves">Ver grooves</a></div></div>`}}
