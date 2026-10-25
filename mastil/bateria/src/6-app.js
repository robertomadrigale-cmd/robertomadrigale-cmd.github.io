/* ---------- tiempo de práctica: cuenta mientras suena algo o el coach está activo ---------- */
setInterval(()=>{
  if(document.hidden)return;
  if(SEQ.id&&SEQ.id!=='ex'||COACH&&COACH.active){const d=today();DB.secs[d]=(DB.secs[d]||0)+1;if(DB.secs[d]>=60)DB.days[d]=true;if(DB.secs[d]%5===0)save()}
},1000);
window.addEventListener('pagehide',save);
const greet=()=>{const h=new Date().getHours();return h<12?'Buenos días':h<19?'Buenas tardes':'Buenas noches'};
const LOCK=TI('<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/>');
const TOOLS=[['metronomo','Metrónomo',IC.metro,'Click en 2 y 4, intermitente y entrenador'],['precision','Medidor de precisión',IC.target,'Con micrófono o toques, mide cada golpe'],['banda','Tocar con la banda',IC.band,'Bajo y acordes sin batería: tú la pones'],['setlist','Setlist',IC.list,'El tempo de las canciones de tu banda']];
const toolList=()=>`<div class="dtools">${TOOLS.map(([id,t,ic,s])=>`<a class="card dtool" href="#/practicar/${id}"><span class="ic">${ic}</span><span><b>${t}</b><small>${s}</small></span></a>`).join('')}</div>`;
function weekAcc(back){const a=new Date(),b=new Date();a.setDate(a.getDate()-6-7*(back||0));b.setDate(b.getDate()-7*(back||0));return mean(DB.hist.filter(h=>h.d>=today(a)&&h.d<=today(b)).map(h=>h.s))}
function grooveAlb(id){
  const g=G[id],open=levelOpen(lvlOf(id)),best=DB.best[id],sub=`${'★'.repeat(DB.stars[id]||0)||'☆'} · ${best==null?g.bpm+' bpm':pctTxt(best)}`;
  const card=albCard('#/groove/'+id,grooveArt(id),esc(g.n),open?sub:`${LOCK} Nivel ${lvlOf(id)}`,null,(DB.stars[id]||0)>=3);
  return open?card:card.replace('class="alb','class="alb locked');
}
/* ---------- Hoy ---------- */
function viewHome(){
  const s=buildSession(),done=s.i>=s.steps.length,lvl=currentLevel(),label=done?'Resumen':s.i||s.res.some(Boolean)?'Continuar':'Empezar';
  const wa=weekAcc(),old=oldProgress()&&!DB.imported,nx=ALLEX.find(x=>!DB.done[x.id]);
  return{title:'Hoy',html:`<div class="coach-greeting"><a class="guitar-pill" href="../roka/?cambiar">Familia Roka</a><span class="eyebrow">${greet()}</span><span class="coach-pill">${streak()===1?'1 día':streak()+' días'} de racha</span><h1>Tu sesión de hoy</h1><p>Nivel ${lvl} · ${LEVELS[lvl]}</p></div>
    ${old?`<section class="card importc"><div><h2>Traer tu progreso de Pulso a la Vista</h2><p class="cap">Encontramos tu práctica de la app anterior en este teléfono: lecciones hechas, días, pruebas del medidor, setlist y calibración. Se suma sin borrar nada.</p></div><div class="row"><button class="btn pri" data-imp="1">${IC.down}Traer mi progreso</button><button class="btn" data-imp="0">Ahora no</button></div></section>`:''}
    <section class="card session-card"><div class="session-art">${grooveArt(s.steps[1].id)}</div><div class="session-content"><span class="eyebrow">Tu sesión de hoy · unos 10 min</span><h2>${done?'Hoy ya sonaste':'Manos sueltas. Pulso firme.'}</h2><p class="cap">Calienta, toca el groove del día, mide tu precisión y toca con la banda. Avanza sola.</p>
      <ol class="session-steps">${s.steps.map((x,i)=>{const r=s.res[i],ok=r&&!r.skipped;return`<li class="${ok?'done':''}"><span>${ok?IC.check:i+1}</span><b>${KIND[x.k][0]}: ${esc(G[x.id].n)}</b>${r?`<small>${r.skipped?'Saltado':Math.round(r.p*100)+' %'}</small>`:''}</li>`}).join('')}</ol>
      <div class="session-start"><a class="kplayb" href="#/sesion" aria-label="${label} sesión">${done?IC.check:IC.play}<span>${label}</span></a><span>${done?'Buen trabajo por hoy.':'Yo cuento. Tú tocas.'}</span></div></div></section>
    <div class="coach-stats four"><div><b>${streak()}</b><span>días de racha</span></div><div><b>${weekMins()}</b><span>min esta semana</span></div><div><b>${wa==null?'—':Math.round(wa*100)+' %'}</b><span>precisión semanal</span></div><div><b>${levelStars(lvl)}</b><span>estrellas del nivel ${lvl}</span></div></div>
    ${nx?`<a class="card dtool" href="#/leccion/${nx.lesson}"><span class="ic">${IC.book}</span><span><b>Continuar: ${esc(nx.t)}</b><small>Lección ${nx.lesson} · ${esc(LESSONS.find(l=>l.id===nx.lesson).title)}</small></span></a>`:''}
    <section><div class="sech"><h2>Grooves de tu nivel</h2><a class="coach-link" href="#/grooves">Ver todos</a></div><div class="shelf">${LVL[lvl].map(grooveAlb).join('')}</div></section>
    <section><h2>Herramientas</h2>${toolList()}</section>
    <p class="foot">Roka Batería · tu progreso se guarda en este dispositivo · <a href="#/ajustes">Ajustes y créditos</a></p>`,
  mount(r){
    r.addEventListener('click',e=>{const b=e.target.closest('[data-imp]');if(!b)return;if(b.dataset.imp==='1'){importOld();toast('Listo: tu progreso de Pulso a la Vista ya está aquí.')}else{DB.imported=-1;save()}route()});
    const t=setTimeout(()=>{if(DB.onb==null)onboardShow()},400);return()=>{clearTimeout(t);$('#onb')?.remove()};
  }};
}
function onboardShow(){
  if($('#onb'))return;const el=document.createElement('dialog');el.id='onb';el.className='coach-dialog';
  el.innerHTML=`<span class="logo">${logo()}</span><h2>Te damos la bienvenida</h2><p>Cada día te armo una sesión corta: calentamiento, un groove, precisión y tocar con la banda. Califico cada golpe.</p><p>¿Cómo vas a tocar?</p><div class="row"><button class="btn" data-in="mic" aria-pressed="${DB.input==='mic'}">${IC.mic}Con mi batería</button><button class="btn" data-in="tap" aria-pressed="${DB.input!=='mic'}">${IC.hand}En la pantalla</button></div><p class="cap">Con tu batería uso el micrófono del teléfono; si no tienes batería a la mano, tocas los botones. Puedes cambiarlo en cada ejercicio.</p><button class="btn pri" data-welcome>Vamos</button>`;
  document.body.appendChild(el);el.showModal();
  el.addEventListener('click',e=>{const v=e.target.closest('[data-in]');if(v){DB.input=v.dataset.in;$$('[data-in]',el).forEach(b=>b.setAttribute('aria-pressed',String(b===v)));save()}if(e.target.closest('[data-welcome]')){DB.onb=1;save();el.close();el.remove()}});
  el.oncancel=()=>{DB.onb=1;save();el.remove()};
}
/* ---------- Grooves por nivel ---------- */
function viewGrooves(){return{title:'Grooves',html:`<div class="lhead"><span class="eyebrow">29 grooves · 3 niveles</span><h1>Grooves</h1><p class="sub">Escúchalos, míralos iluminarse y practícalos con calificación. Cada nivel se abre con 10 estrellas del anterior.</p></div>
  ${[1,2,3].map(l=>`<section class="level-section"><div class="sech"><h2>${l}. ${LEVELS[l]}</h2><span>${levelOpen(l)?levelStars(l)+' de '+LVL[l].length*3+' estrellas':LOCK+' Te faltan '+Math.max(0,10-levelStars(l-1))+' estrellas'}</span></div><div class="albs">${LVL[l].map(grooveAlb).join('')}</div></section>`).join('')}
  <p class="cap">50 % = ★ · 70 % = ★★ · 85 % = ★★★. Se conserva tu mejor resultado. Los grooves bloqueados se pueden escuchar; la calificación se abre con el nivel.</p>`}}
/* ---------- Lecciones (las 12 de Pulso a la Vista) ---------- */
const doneCount=l=>{const xs=ALLEX.filter(x=>!l||x.lesson===l);return[xs.filter(x=>DB.done[x.id]).length,xs.length]};
const LHUE=[218,262,160,28];
function viewLessons(){return{title:'Lecciones',html:`<div class="lhead"><span class="eyebrow">12 lecciones · ${ALLEX.length} ejercicios</span><h1>Lecciones</h1><p class="sub">Un plan para dejar de correr y arrastrar: medir, contar, sostener el pulso sin click y llevarlo a la banda.</p></div>
  ${PARTS2.map(p=>`<section><div class="sech"><h2>Parte ${p.n} · ${p.t}</h2></div><div class="albs">${p.m.map(i=>{const l=LESSONS.find(x=>x.id===i),[d,t]=doneCount(i);return albCard('#/leccion/'+i,coverArt(LHUE[p.n-1]+i*7,TART[['prec','metro','groove','band'][p.n-1]][1],i,'l'+i),esc(l.title),`${d}/${t} ejercicios`,d/t,d===t)}).join('')}</div></section>`).join('')}
  <a class="card dtool" href="#/glosario"><span class="ic">${IC.book}</span><span><b>Glosario</b><small>Los términos del tiempo y el pulso, en idioma humano.</small></span></a>`}}
const metDesc=m=>{const p=[m.bpm+' bpm'];if(m.mode==='24')p.push('click en 2 y 4');if(m.mode==='1')p.push('click solo en el 1');if(m.mode==='off')p.push('click en contratiempo');if(m.gapOn)p.push(m.gapOn+' sí · '+m.gapOff+' no');if(m.sub>1)p.push({2:'corcheas',3:'tresillos',4:'semicorcheas'}[m.sub]);if(m.tr)p.push('+'+m.tr.step+' cada '+m.tr.every+' compases');return p.join(' · ')};
const gMini=id=>`<div class="gmini" data-gm="${id}"><div class="gmh"><b>${esc(G[id].n)}</b><span class="row"><button class="btn sm" data-gplay="${id}">${IC.play}Escuchar</button><a class="btn sm" href="#/groove/${id}">Abrir</a></span></div><div class="gridbox">${grooveGrid(G[id],{limbs:false})}</div></div>`;
function exCard(x){
  const l=LESSONS.find(z=>z.id===x.lesson),list=l.blocks.filter(b=>b.ex),idx=list.findIndex(b=>b.ex.id===x.id)+1,tg=x.track&&TRACKG[x.id];
  return`<article class="card ex ${DB.done[x.id]?'done':''}" id="ex-${x.id}"><div class="eh"><span class="exn">${DB.done[x.id]?IC.check:idx}</span><div><span class="tag">Haz esto ahora · ${idx} de ${list.length} · ${x.min} min</span><h3>${x.t}</h3></div></div>
   <ol class="steps">${x.steps.map(s=>`<li>${s}</li>`).join('')}</ol>
   ${x.groove?gMini(x.groove):''}
   <p class="goal"><b>Lo logras cuando:</b> ${x.goal}</p>
   ${x.met?`<p class="cap">Metrónomo: <b>${metDesc(x.met)}</b></p>`:''}
   <div class="exbar">
    ${x.groove?`<a class="btn sm pri" href="#/practicar/ej/${x.groove}">${IC.target}Practicar con calificación</a>`:''}
    ${x.met?`<button class="btn sm" data-x="met" data-id="${x.id}"></button>`:''}
    ${tg?`<a class="btn sm" href="#/practicar/banda?g=${tg}&st=${TRACKST[x.track.st]}&bpm=${x.track.bpm}">${IC.band}Tocar con la banda</a>`:''}
    ${x.timing?`<button class="btn sm" data-x="timing" data-id="${x.id}">${IC.target}Medir</button>`:''}
    <button class="btn sm ok" data-x="done" data-id="${x.id}"></button></div></article>`;
}
function viewLesson(id){
  const l=LESSONS.find(x=>x.id===id);if(!l)return viewLessons();
  const body=l.blocks.map(b=>b.groove?gMini(b.groove):b.ex?exCard(b.ex):b.box?`<div class="box"><p class="blockh">${b.box}</p><ul>${b.ul.map(t=>`<li>${t}</li>`).join('')}</ul></div>`:b.trick?`<div class="box trick"><p class="blockh">Hoja de trucos</p><ul>${b.trick.map(t=>`<li>${t}</li>`).join('')}</ul></div>`:b.p?`<p class="prose">${b.p}</p>`:'').join('');
  const prev=LESSONS.find(x=>x.id===id-1),next=LESSONS.find(x=>x.id===id+1),[d,t]=doneCount(id),part=PARTS2.find(p=>p.m.includes(id));
  return{title:'Lección '+id,back:'#/lecciones',html:`<div class="lhero"><span class="acov">${coverArt(LHUE[part.n-1]+id*7,TART[['prec','metro','groove','band'][part.n-1]][1],id,'lh'+id)}</span><div><span class="eyebrow">Lección ${id} · Parte ${part.n} · ${part.t}</span><h1>${l.title}</h1><p class="lead">${l.lead}</p><p class="cap" id="lcnt">${d} de ${t} ejercicios hechos</p></div></div>
    <div class="lbody">${body}</div>
    <div class="row lnav">${prev?`<a class="btn" href="#/leccion/${prev.id}">${IC.back}Lección ${prev.id}</a>`:''}${next?`<a class="btn pri" href="#/leccion/${next.id}">Lección ${next.id}</a>`:''}</div>`,
  mount(r){
    const paint=()=>{$$('[data-x]',r).forEach(b=>{const x=ALLEX.find(z=>z.id===b.dataset.id),k=b.dataset.x;if(!x)return;
      if(k==='met'){const on=SEQ.id==='met'&&OWNER==='ex:'+x.id;b.innerHTML=on?IC.stop+'Detener':IC.metro+'Metrónomo '+x.met.bpm;b.classList.toggle('on',on)}
      if(k==='done'){const dn=!!DB.done[x.id];b.innerHTML=IC.check+(dn?'Hecho':'Marcar como hecho');b.setAttribute('aria-pressed',String(dn));const c=b.closest('.ex');c.classList.toggle('done',dn);$('.exn',c).innerHTML=dn?IC.check:(c.querySelector('.tag').textContent.match(/(\d+) de/)||[])[1]}
      if(k==='timing')b.innerHTML=IC.target+'Medir';});
      $$('[data-gplay]',r).forEach(b=>{const on=SEQ.id==='lg'&&OWNER===b;b.innerHTML=on?IC.stop+'Detener':IC.play+'Escuchar'});
      const[d,t]=doneCount(id);$('#lcnt',r).textContent=`${d} de ${t} ejercicios hechos`};
    r.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
      if(b.dataset.gplay){if(SEQ.id==='lg'&&OWNER===b){grooveStop();gridNow(r,-1)}else{const box=b.closest('.gmini'),g=G[b.dataset.gplay];grooveStop();gridNow(r,-1);OWNER=b;grooveRun({id:'lg',g,bpm:baseBpm(b.dataset.gplay),click:true,drums:true,count:false,onStep:i=>gridNow(box,i)})}paint();return}
      const x=ALLEX.find(z=>z.id===b.dataset.id),k=b.dataset.x;if(!x)return;
      if(k==='done'){if(DB.done[x.id])delete DB.done[x.id];else{DB.done[x.id]=true;markDay()}save()}
      if(k==='met'){if(SEQ.id==='met'&&OWNER==='ex:'+x.id)seqStop();else{OWNER='ex:'+x.id;Object.assign(MET,{bpm:x.met.bpm,sub:x.met.sub||1,meter:x.met.meter||'4/4'});metStart((({bpm,...o})=>o)(x.met))}}
      if(k==='timing'){Object.assign(TM,x.timing);location.hash='#/practicar/precision';return}
      paint()});
    const h=()=>paint();document.addEventListener('playstate',h);paint();
    return()=>{document.removeEventListener('playstate',h);grooveStop()};
  }};
}
function viewGlossary(){return{title:'Glosario',back:'#/lecciones',html:`<div class="lhead"><h1>Glosario</h1></div><dl class="card glos">${GLOS.map(([t,d])=>`<dt>${t}</dt><dd>${d}</dd>`).join('')}</dl>`}}
/* ---------- Practicar ---------- */
function viewPractice(){return{title:'Practicar',html:`<div class="lhead"><span class="eyebrow">A tu ritmo</span><h1>Practicar</h1><p class="sub">Herramientas sueltas. La sesión de hoy usa las mismas.</p></div>${toolList()}
  <section><h2>Rudimentos</h2><div class="shelf">${['rudS','rudD','para','acc'].map(grooveAlb).join('')}</div></section>
  <section><h2>Subdivisiones</h2><div class="shelf">${['q','e','tr','s'].map(grooveAlb).join('')}</div></section>`}}
/* ---------- Progreso ---------- */
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
    <section class="card"><h2>Niveles</h2>${[1,2,3].map(l=>{const s=levelStars(l),mx=LVL[l].length*3;return`<div class="level-progress"><div><b>${l}. ${LEVELS[l]}</b><span>${levelOpen(l)?s+' de '+mx+' estrellas':LOCK+' faltan '+Math.max(0,10-levelStars(l-1))+' ★'}</span></div><progress max="${mx}" value="${s}"></progress></div>`}).join('')}</section>
    <section class="card"><h2>Medidor de precisión</h2>${last.length?last.map(s=>`<div class="sesrow">${sesHTML(s,false)}</div>`).join(''):'<p class="cap">Aún no hay pruebas. Ábrelo en Practicar.</p>'}<a class="btn" href="#/practicar/precision">${IC.target}Medir ahora</a></section>`};
}
/* ---------- Ajustes ---------- */
function viewSettings(){
  const k=PACKS.bateria;
  return{title:'Ajustes',back:'#/',html:`<div class="lhead"><h1>Ajustes</h1></div>
    <section class="card coach-settings"><h2>Apariencia y sonido</h2><label>Tema<select data-pref="theme">${[['estudio','Estudio'],['escenario','Escenario'],['claro','Aluminio (claro)'],['auto','Automático']].map(([v,n])=>`<option value="${v}" ${DB.theme===v?'selected':''}>${n}</option>`).join('')}</select></label>
      <label>Volumen del click<select data-pref="clickVol">${[[.5,'Bajo'],[1,'Normal'],[1.6,'Fuerte']].map(([v,n])=>`<option value="${v}" ${(DB.clickVol||1)==v?'selected':''}>${n}</option>`).join('')}</select></label>
      <label>Cómo te escucho<select data-pref="input"><option value="tap" ${DB.input!=='mic'?'selected':''}>Toques en pantalla</option><option value="mic" ${DB.input==='mic'?'selected':''}>Micrófono</option></select></label>
      <p class="cap">Sonido de batería: ${KIT?'kit grabado listo':KIT===false?'sintetizado (no se pudo cargar el kit grabado)':'kit grabado (se carga al primer toque)'}.</p></section>
    <section class="card coach-settings"><h2>Sincronizar toques</h2><p class="cap">Si tus toques salen siempre adelantados o atrasados, tócalos junto con 8 clicks y la app ajusta la diferencia de tu pantalla.</p>
      <div class="row"><button class="btn" id="tcal">${IC.hand}Sincronizar</button><span class="cap" id="tst">Ajuste actual: ${Math.round((DB.tapLat||0)*1000)} ms</span></div><button class="pad pad-tar big" data-pad="tar" id="tpad" hidden><b>Toca con cada click</b><small>o Espacio</small></button></section>
    <section class="card coach-settings"><h2>Micrófono</h2><p class="cap">${DB.lat!=null?'Retraso medido: '+Math.round(DB.lat*1000)+' ms.':'Sin calibrar.'} Calibra en el medidor (Ajustes del micrófono).</p><a class="btn" href="#/practicar/precision">${IC.target}Ir al medidor</a></section>
    ${oldProgress()?`<section class="card coach-settings"><h2>Pulso a la Vista</h2><p class="cap">${DB.imported>0?'Ya trajiste tu progreso de la app anterior.':'Hay progreso de la app anterior en este dispositivo.'}</p><button class="btn" data-imp>${IC.down}Traer mi progreso</button></section>`:''}
    <section class="card coach-settings"><h2>Créditos</h2><p class="cap">Batería grabada: «${esc(k.nombre)}» de ${esc(k.autor)}, licencia ${k.licencia} (<a href="${k.url}" target="_blank" rel="noopener">${k.url}</a>). ${esc(k.credito)} Bajo y guitarra de la banda: tonejs-instruments (CC BY 3.0); metales, piano y órgano: VSCO 2 CE (CC0).</p>
      <p class="cap">Grooves y lecciones vienen de Pulso a la Vista. Roka Batería es parte de la familia Roka (guitarra, voz, estudio).</p></section>`,
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
/* ---------- enrutador ---------- */
const NAV=[['#/','Hoy',IC.home,''],['#/grooves','Grooves',IC.grid,'grooves'],['#/lecciones','Lecciones',IC.book,'lecciones'],['#/practicar','Practicar',IC.drum,'practicar'],['#/progreso','Progreso',IC.cal,'progreso']];
let UNMOUNT=null;
function route(){
  const raw=location.hash.replace(/^#\/?/,''),[path,qs]=raw.split('?'),p=path.split('/'),q=new URLSearchParams(qs||'');
  if(UNMOUNT){try{UNMOUNT()}catch(e){}UNMOUNT=null}
  grooveStop();
  let v=null;
  if(!p[0])v=viewHome();
  else if(p[0]==='sesion')v=viewCoach();
  else if(p[0]==='grooves')v=viewGrooves();
  else if(p[0]==='groove')v=viewGroove(p[1]);
  else if(p[0]==='lecciones')v=viewLessons();
  else if(p[0]==='leccion')v=viewLesson(+p[1]);
  else if(p[0]==='glosario')v=viewGlossary();
  else if(p[0]==='progreso')v=viewProgress();
  else if(p[0]==='ajustes')v=viewSettings();
  else if(p[0]==='practicar'){
    if(p[1]==='ej'&&G[p[2]])v=levelOpen(lvlOf(p[2]))||q.get('k')==='band'?viewCoach(p[2],q.get('k')||(['rudS','rudD','para','acc'].includes(p[2])?'rud':'groove')):viewLocked(p[2]);
    else v=({metronomo:viewMetronome,precision:viewTiming,medidor:viewTiming,banda:()=>viewBand(q),setlist:viewSetlist}[p[1]]||viewPractice)();
  }
  if(!v)v=viewHome();
  document.documentElement.classList.toggle('fs',!!v.fs);
  const section=p[0]==='groove'?'grooves':p[0]==='leccion'||p[0]==='glosario'?'lecciones':p[0]==='sesion'?'':p[0];
  $$('[data-nav]').forEach(a=>{if(a.dataset.nav===section)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
  $('#ttl').textContent=v.title;const back=$('#back');back.hidden=!v.back;if(v.back)back.href=v.back;
  const old=$('#page'),pg=old.cloneNode(false);old.replaceWith(pg);pg.innerHTML=v.html;document.title=v.title+' · Roka Batería';
  if(v.mount)UNMOUNT=v.mount(pg)||null;window.scrollTo(0,0);
}
document.body.insertAdjacentHTML('afterbegin',`<div class="shell"><nav class="side" aria-label="Secciones"><div class="brand"><span class="logo">${logo()}</span>Roka<br>Batería</div>${NAV.map(([h,l,ic,k])=>`<a href="${h}" data-nav="${k}">${ic}${l}</a>`).join('')}</nav><main><header class="topbar"><div class="in"><a class="icon-btn" id="back" href="#/" aria-label="Volver" hidden>${IC.back}</a><span class="ttl" id="ttl"></span><a class="icon-btn" href="#/ajustes" aria-label="Ajustes">${IC.cog}</a></div></header><div class="page" id="page"></div></main></div><nav class="tabs" aria-label="Secciones">${NAV.map(([h,l,ic,k])=>`<a class="tab" href="${h}" data-nav="${k}">${ic}${l}</a>`).join('')}</nav>`);
save();window.addEventListener('hashchange',route);route();
/* Actualizaciones: busca versión nueva al abrir y al volver a la app; avisa cuando está lista. */
function showUpdate(){
  if(document.getElementById('upd'))return;
  const d=document.createElement('div');d.id='upd';d.className='player upd';
  d.innerHTML='<span class="dotlive"></span><span class="pl">Hay una versión nueva de la app</span><button class="btn sm pri" id="updgo">Actualizar</button>';
  document.body.appendChild(d);d.querySelector('#updgo').onclick=()=>location.reload();
}
if('serviceWorker' in navigator&&location.protocol!=='file:'){
  let hadCtl=!!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!hadCtl){hadCtl=true;return}if(!SEQ.id&&!MIC.stream)location.reload();else showUpdate()});
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(reg=>{
      const chk=()=>reg.update().catch(()=>{});
      document.addEventListener('visibilitychange',()=>{if(!document.hidden)chk()});
      setInterval(chk,30*60*1000);chk();
    }).catch(()=>{});
  });
}
