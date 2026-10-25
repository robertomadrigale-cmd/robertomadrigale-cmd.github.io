/* Tiempo activo, también al practicar sin micrófono. Pausas y resultados no suman. */
setInterval(()=>{
  if(document.hidden)return;
  const active=COACH?COACH.active:!!(SEQ.id||MIC.stream||BR._w);
  if(active){const d=today();DB.secs[d]=(DB.secs[d]||0)+1;if(COACH)COACH.addTime(1);if(DB.secs[d]>=60)DB.days[d]=true;if(DB.secs[d]%5===0)save()}
},1000);
window.addEventListener('pagehide',save);
const greet=()=>{const h=new Date().getHours();return h<12?'Buenos días':h<19?'Buenas tardes':'Buenas noches'};
const LOCK=TI('<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/>');
const TOOLS=[['afinador','Afinador',IC.tuner],['rango','Rango',IC.range],['respiracion','Respiración',IC.lungs],['metronomo','Metrónomo',IC.metro]];
const quickTools=()=>`<div class="coach-quick">${TOOLS.map(([id,t,ic])=>`<a class="btn" href="#/practicar/${id}">${ic}${t}</a>`).join('')}</div>`;
function weekAccuracy(){const date=new Date();date.setDate(date.getDate()-6);const from=today(date);return mean(DB.hist.filter(h=>h.d>=from&&h.d<=today()).map(h=>h.s))}
function drillAlb(d){
  const open=levelOpen(d.lvl),best=DB.best[d.id],missing=Math.max(0,10-levelStars(d.lvl-1));
  const sub=d.breath?'2 ciclos · sin calificación':`${starText(DB.stars[d.id]||0)} · ${best==null?'Por descubrir':scoreText(best)}`;
  const card=albCard('#/practicar/ej/'+d.id,drillArt(d),esc(d.t),open?sub:`${LOCK} Te faltan ${missing} estrellas`,null,DB.today[d.id]===today());
  return open?card:card.replace('class="alb','aria-label="'+esc(d.t)+': bloqueado" class="alb locked');
}
function viewHome(){
  const s=buildSession(),done=s.i>=s.steps.length,lvl=currentLevel(),label=done?'Ver resumen':s.i||s.res.some(Boolean)?'Continuar':'Empezar';
  return{title:'Hoy',html:`<div class="coach-greeting"><a class="guitar-pill" href="../roka/">Om Guitarra</a><span class="eyebrow">${greet()}</span><span class="coach-pill">${streak()===1?"1 día":streak()+" días"} de racha</span><h1>Tu sesión de hoy</h1><p>Nivel ${lvl} · ${LEVELS[lvl]}</p></div>
    <section class="card session-card"><div class="session-art">${coverArt(218,DLINE,null,'session')}</div><div class="session-content"><span class="eyebrow">Tu sesión de hoy · ${s.minutes} min</span><h2>${done?'Ya le diste tiempo a tu voz':'Un poco de aire. Mucha voz.'}</h2><p class="cap">Calienta, afina y canta. Incluye descansos entre rondas.</p><ol class="session-steps">${s.steps.map((id,i)=>{const r=s.res[i],complete=r&&!r.skipped||DB.today[id]===today();return`<li class="${complete?'done':''}"><span>${complete?IC.check:i+1}</span><b>${esc(stepInfo(id).t)}</b>${r&&r.skipped?'<small>Saltado</small>':''}${id==='rango'?'<a href="#/practicar/rango" aria-label="Medir mi rango">'+IC.range+'</a>':''}</li>`}).join('')}</ol><div class="session-start"><a class="kplayb" data-start-session href="#/sesion" aria-label="${label} sesión">${done?IC.check:IC.play}<span>${label}</span></a><span>${done?'Buen trabajo por hoy.':'Yo marco el paso. Tú pon la voz.'}</span></div></div></section>
    <div class="coach-stats four"><div><b>${streak()}</b><span>días de racha</span></div><div><b>${weekMins()}</b><span>min esta semana</span></div><div><b>${weekAccuracy()==null?'—':scoreText(weekAccuracy())}</b><span>afinación semanal</span></div><div><b class="range-stat">${DB.range?nnTxt(DB.range.lo)+'–'+nnTxt(DB.range.hi):'Por medir'}</b><span>rango actual</span></div></div>
    <section><h2>A tu ritmo</h2><div class="coach-quick"><a class="btn" href="#/practicar/afinador">${IC.tuner}Afinador</a><a class="btn" href="#/practicar/rango">${IC.range}Rango</a><a class="btn" href="#/canciones">${IC.note}Canciones</a></div></section>
    <details class="card coach-settings"><summary>Tu voz y apariencia</summary><label>Voz de referencia<select data-pref="vt"><option value="grave" ${DB.vt!=='aguda'?'selected':''}>Grave</option><option value="aguda" ${DB.vt==='aguda'?'selected':''}>Aguda</option></select></label><label>Tema<select data-pref="theme">${[['estudio','Estudio'],['escenario','Escenario'],['claro','Claro'],['auto','Automático']].map(([k,n])=>`<option value="${k}" ${DB.theme===k?'selected':''}>${n}</option>`).join('')}</select></label></details><p class="foot">Om Voz · ${automatiaMark()} · tu progreso se guarda en este dispositivo.</p>`,mount(r){
      const t=setTimeout(()=>{if(DB.onb==null)onboardShow()},400);
      r.addEventListener('change',e=>{const k=e.target.dataset.pref;if(k){DB[k]=e.target.value;save();if(k==='theme')applyTheme()}});
      return()=>{clearTimeout(t);$('#onb')?.remove()};
    }};
}
function onboardShow(){
  if($('#onb'))return;const el=document.createElement('dialog');el.id='onb';el.className='coach-dialog';
  el.innerHTML=`<span class="logo">${logo()}</span><h2>Te damos la bienvenida</h2><p>Vamos a calentar tu voz. Primero dime… ¿tu voz es más grave o más aguda?</p><div class="row"><button class="btn" data-voice="grave">Grave</button><button class="btn" data-voice="aguda">Aguda</button></div><p class="cap">Después medimos tu rango para ajustar cada ejercicio.</p><button class="btn pri" data-welcome>Vamos</button>`;
  document.body.appendChild(el);el.showModal();
  el.addEventListener('click',e=>{const v=e.target.closest('[data-voice]');if(v){DB.vt=v.dataset.voice;$$('[data-voice]',el).forEach(b=>b.setAttribute('aria-pressed',String(b===v)));save()}if(e.target.closest('[data-welcome]')){DB.onb=1;save();el.close();el.remove()}});
  el.oncancel=()=>{DB.onb=1;save();el.remove()};
}
function viewLocked(lvl){return{title:'Nivel '+lvl,back:'#/ejercicios',html:`<div class="card coach-center"><span class="coach-lock">${LOCK}</span><h1>Nivel ${lvl} · ${LEVELS[lvl]}</h1><p>Te faltan ${Math.max(0,10-levelStars(lvl-1))} estrellas del nivel ${lvl-1}.</p><p class="cap">Gana una estrella con 50 %, dos con 70 % y tres con 85 %.</p><a class="btn pri" href="#/ejercicios">Ver ejercicios</a></div>`}}
function viewExercises(){return{title:'Ejercicios',html:`<div class="lhead"><span class="eyebrow">Tu estudio de voz</span><h1>Ejercicios</h1><p class="sub">Prácticas cortas. Un paso a la vez.</p></div>${quickTools()}${[1,2,3].map(l=>`<section class="level-section"><div class="sech"><h2>${l}. ${LEVELS[l]}</h2><span>${levelOpen(l)?levelStars(l)+' estrellas':LOCK+' Bloqueado'}</span></div>${!levelOpen(l)?`<p class="cap">Te faltan ${Math.max(0,10-levelStars(l-1))} estrellas del nivel ${l-1}.</p>`:''}<div class="albs">${DRILLS.filter(d=>d.lvl===l).map(drillAlb).join('')}</div></section>`).join('')}<p class="cap">50 % = ★ · 70 % = ★★ · 85 % = ★★★. Se conserva tu mejor resultado.</p>`}}
function progressBars(values,labels,unit,max){
  const ceiling=max||Math.max(1,...values.map(v=>v||0));
  return `<div class="progress-chart" role="img" aria-label="${esc(labels.map((l,i)=>l+': '+(values[i]==null?'sin datos':Math.round(values[i])+unit)).join(', '))}">${values.map((v,i)=>`<div class="chart-column"><b>${v==null?'—':Math.round(v)+unit}</b><div class="chart-track"><i style="height:${v==null?0:v===0?0:Math.max(2,v/ceiling*100)}%"></i></div><small>${esc(labels[i])}</small></div>`).join('')}</div>`;
}
function viewProgress(){
  const days=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);return d}),minutes=days.map(d=>(DB.secs[today(d)]||0)/60);
  const monday=new Date();monday.setHours(12,0,0,0);monday.setDate(monday.getDate()-(monday.getDay()+6)%7);
  const weeks=Array.from({length:6},(_,i)=>{const start=new Date(monday);start.setDate(start.getDate()-(5-i)*7);const end=new Date(start);end.setDate(end.getDate()+7);const v=mean(DB.hist.filter(h=>h.d>=today(start)&&h.d<today(end)).map(h=>h.s));return{date:start,v:v==null?null:v*100}});
  const first=DB.rangeHist[0],r=DB.range,growth=first&&r?(r.hi-r.lo)-(first.hi-first.lo):0;
  const dateLabel=d=>d.toLocaleDateString('es-MX',{day:'numeric',month:'short'});
  return{title:'Progreso',html:`<div class="lhead"><span class="eyebrow">Cada práctica cuenta</span><h1>Tu progreso</h1></div><div class="coach-stats"><div><b>${streak()}</b><span>racha actual</span></div><div><b>${bestStreak()}</b><span>mejor racha</span></div><div><b>${DB.sung}</b><span>ejercicios cantados</span></div></div><section class="card"><h2>Minutos por día</h2><p class="cap">Últimos 7 días</p>${progressBars(minutes,days.map(d=>d.toLocaleDateString('es-MX',{weekday:'short'})),' min')}</section><section class="card"><h2>Tu afinación por semana</h2><p class="cap">Promedio de prácticas calificadas · últimas 6 semanas</p>${progressBars(weeks.map(w=>w.v),weeks.map(w=>dateLabel(w.date)),' %',100)}${!DB.hist.length?'<p class="cap">Tu primera práctica con micrófono aparecerá aquí.</p>':''}</section><section class="card"><h2>Tu rango crece contigo</h2>${r?`<p class="coach-range-title">${nnTxt(r.lo)} — ${nnTxt(r.hi)}</p>${keyboardSVG(r.lo,r.hi,comfy().lo,comfy().hi)}<p class="cap">Zona de referencia: ${voiceGuess(r.lo,r.hi).n}. Tu voz puede cambiar con la práctica.</p>${first?`<p>${growth>=0?'+':''}${growth} semitonos desde el ${dateLabel(new Date(first.d+'T12:00:00'))}</p><p class="cap">Primera medición: ${nnTxt(first.lo)} — ${nnTxt(first.hi)}</p>${keyboardSVG(first.lo,first.hi)}`:''}`:'<p>Mide tu rango para ver cómo cambia con la práctica.</p>'}<a class="btn" href="#/practicar/rango">Medir rango</a></section><section class="card"><h2>Estrellas por nivel</h2>${[1,2,3].map(l=>{const stars=levelStars(l),max=DRILLS.filter(d=>d.lvl===l&&!d.breath).length*3;return`<div class="level-progress"><div><b>${l}. ${LEVELS[l]}</b><span>${stars} / ${max} ★</span></div><progress max="${l<3?10:max}" value="${Math.min(stars,l<3?10:max)}" aria-label="Estrellas del nivel ${l}"></progress><p class="cap">${l===3?'Sigue mejorando tus marcas.':stars>=10?'Siguiente nivel desbloqueado.':`Faltan ${10-stars} para abrir el nivel ${l+1}.`}</p></div>`}).join('')}</section>`};
}
const NAV=[['#/','Hoy',IC.home,''],['#/ejercicios','Ejercicios',IC.mic,'ejercicios'],['#/canciones','Canciones',IC.note,'canciones'],['#/progreso','Progreso',IC.cal,'progreso']];
let UNMOUNT=null;
function route(){
  const p=location.hash.replace(/^#\/?/,'').split('/');
  if(['leccion','lecciones'].includes(p[0])){location.replace('#/');return}
  if(UNMOUNT){UNMOUNT();UNMOUNT=null}
  let v;if(!p[0])v=viewHome();else if(p[0]==='sesion')v=viewCoach();else if(p[0]==='ejercicios')v=viewExercises();else if(p[0]==='progreso')v=viewProgress();else if(p[0]==='practicar')v=p[1]==='ej'?viewDrill(p[2]):p[1]==='calentamiento'?viewCoach():({afinador:viewTuner,rango:viewRange,respiracion:viewBreath,metronomo:viewMetronome}[p[1]]||viewExercises)();else if(p[0]==='canciones')v=p[1]==='nueva'?viewSongEditor():p[1]==='editar'?viewSongEditor(p[2]):p[1]==='libre'&&songById(p[2])?viewFreeSong(songById(p[2])):p[1]?viewSing(p[1]):viewSongs();else v=viewHome();
  document.documentElement.classList.toggle('fs',!!v.fs);
  const section=p[0]==='practicar'?'ejercicios':p[0]==='sesion'?'':p[0];
  $$('[data-nav]').forEach(a=>{if(a.dataset.nav===section)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
  $('#ttl').textContent=v.title;const back=$('#back');back.hidden=!v.back;if(v.back)back.href=v.back;
  const old=$('#page'),pg=old.cloneNode(false);old.replaceWith(pg);pg.innerHTML=v.html;document.title=v.title+' · Om Voz';
  if(v.mount)UNMOUNT=v.mount(pg)||null;window.scrollTo(0,0);
}
document.body.insertAdjacentHTML('afterbegin',`<div class="shell"><nav class="side" aria-label="Secciones"><div class="brand"><span class="logo">${logo()}</span>Om<br>Voz</div>${NAV.map(([h,l,ic,k])=>`<a href="${h}" data-nav="${k}">${ic}${l}</a>`).join('')}</nav><main><header class="topbar"><div class="in"><a class="icon-btn" id="back" href="#/" aria-label="Volver" hidden>${IC.back}</a><span class="ttl" id="ttl"></span></div></header><div class="page" id="page"></div></main></div><nav class="tabs" aria-label="Secciones">${NAV.map(([h,l,ic,k])=>`<a class="tab" href="${h}" data-nav="${k}">${ic}${l}</a>`).join('')}</nav>`);
document.addEventListener('click',e=>{if(e.target.closest('[data-start-session]'))COACH_AUTOSTART=true});
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
