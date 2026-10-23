/* ---------- tiempo de práctica: cuenta mientras el micrófono o el metrónomo están activos ---------- */
setInterval(()=>{
  if(document.hidden)return;
  if(SEQ.id||MIC.stream){const k=today();DB.secs[k]=(DB.secs[k]||0)+1;if(DB.secs[k]>=60)DB.days[k]=true;if(DB.secs[k]%10===0)save()}
},1000);
/* ---------- tarjeta de ejercicio de lección ---------- */
function exCard(x){
  const l=LESSONS.find(z=>z.id===x.lesson),idx=l.blocks.filter(b=>b.ex).findIndex(b=>b.ex.id===x.id)+1,tot=l.blocks.filter(b=>b.ex).length;
  return`<article class="ex ${DB.done[x.id]?'done':''}" id="ex-${x.id}" data-ex="${x.id}">
   <div class="eh"><span class="exn">${DB.done[x.id]?IC.check:idx}</span><div class="eht"><span class="tag">Ejercicio ${idx} de ${tot} · ${x.min} min</span><h3>${x.t}</h3></div></div>
   <ol class="steps">${x.steps.map(s=>`<li>${s}</li>`).join('')}</ol>
   <p class="goal"><span class="gi">${IC.check}</span><span><b>Lo logras cuando:</b> ${x.goal}</span></p>
   <div class="exbar"><a class="btn sm pri" href="${x.go}">${IC.play}${x.goL}</a><button class="btn sm ok" data-x="done" data-id="${x.id}"></button></div>
  </article>`;
}
function paintEx(root){
  $$('[data-x="done"]',root||document).forEach(b=>{const id=b.dataset.id,x=ALLEX.find(z=>z.id===id);if(!x)return;const d=!!DB.done[id];b.innerHTML=IC.check+(d?'Hecho':'Marcar como hecho');b.classList.toggle('on',d);b.setAttribute('aria-pressed',String(d));
    const card=b.closest('.ex');if(card){card.classList.toggle('done',d);const n=$('.exn',card),l=LESSONS.find(z=>z.id===x.lesson);if(n)n.innerHTML=d?IC.check:l.blocks.filter(q=>q.ex).findIndex(q=>q.ex.id===id)+1}});
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-x="done"]');if(!b)return;const id=b.dataset.id;if(DB.done[id])delete DB.done[id];else{DB.done[id]=true;markDay()}save();paintEx();refreshProgress()});
function blockHTML(b){
  if(b.ex)return exCard(b.ex);
  if(b.aim)return`<div class="box aim"><p class="blockh">Al terminar podrás</p><ul>${b.aim.map(t=>`<li>${t}</li>`).join('')}</ul></div>`;
  if(b.step)return`<div class="prose lstep"><p class="stepk"><span>${b.step}</span>${b.t}</p><p>${b.p}</p></div>`;
  if(b.key)return`<div class="keyi"><p class="blockh">La idea clave</p><p>${b.key}</p></div>`;
  if(b.check)return`<div class="box chk"><p class="blockh">Compruébalo</p>${b.check.map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>`;
  if(b.box)return`<div class="box"><p class="blockh">${b.box}</p>${b.ul?`<ul>${b.ul.map(t=>`<li>${t}</li>`).join('')}</ul>`:`<ol>${b.ol.map(t=>`<li>${t}</li>`).join('')}</ol>`}</div>`;
  if(b.trick)return`<div class="box trick"><p class="blockh">Hoja de trucos</p><ul>${b.trick.map(t=>`<li>${t}</li>`).join('')}</ul></div>`;
  if(b.p)return`<p class="prose">${b.p}</p>`;
  return'<div></div>';
}
/* ---------- discos ---------- */
const lessonAlb=i=>{const l=LESSONS.find(x=>x.id===i),[d,t]=doneCount(i);return albCard(`#/leccion/${i}`,lessonArt(i),l.title,`${d} de ${t} · ${l.sub}`,d/t,d===t)};
const drillAlb=d=>{const b=DB.best[d.id];return albCard('#/practicar/ej/'+d.id,drillArt(d),d.t,b!=null?`Récord ${Math.round(b*100)} % · ${d.syl}`:d.sub,null,DB.today[d.id]===today())};
const songAlb=s=>{const b=DB.best['song:'+s.id];return albCard('#/canciones/'+s.id,songArt(s),esc(s.title),b!=null?`Récord ${Math.round(b*100)} %`:esc(s.artist),null,false)};
const TOOLS=[['afinador','Afinador de voz','Ve qué nota cantas y qué tan afinado.',IC.tuner],['rango','Rango vocal','Tu nota más grave, la más aguda y tu tipo de voz.',IC.range],['respiracion','Respiración','Ciclos 4-4-8 y tu «sss» medida.',IC.lungs],['metronomo','Metrónomo','Tempo y compás para practicar frases.',IC.metro]];
const toolCards=()=>TOOLS.map(([k,n,d,ic])=>`<a class="card tool" href="#/practicar/${k}"><span class="ic">${ic}</span><span><b>${n}</b><span>${d}</span></span></a>`).join('');
const warmDone=()=>WARMUP.filter(k=>DB.today[k]===today()).length;
function warmCard(){const n=warmDone();return`<a class="card nowp" href="#/practicar/calentamiento"><span class="acov">${coverArt(205,TART.rt[1],null,'wu')}</span><span class="np"><span class="eyebrow">Calentamiento de hoy</span><b>${n===WARMUP.length?'Completo. Tu voz está lista':n?'Vas en el paso '+(n+1)+' de '+WARMUP.length:'10 minutos, de suave a fuerte'}</b><small>Respiración, trino, sirena, escala, arpegio y nota larga.</small><span class="pg"><i style="width:${Math.round(n/WARMUP.length*100)}%"></i></span></span><span class="playc">${IC.play}</span></a>`}
/* ---------- vistas ---------- */
const greet=()=>{const h=new Date().getHours();return h<12?'Buenos días':h<19?'Buenas tardes':'Buenas noches'};
let DEFERRED=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();DEFERRED=e;if(location.hash===''||location.hash==='#/')route()});
const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
function rangeCard(){
  if(DB.range){const v=voiceGuess(DB.range.lo,DB.range.hi);return`<a class="card tool" href="#/practicar/rango"><span class="ic">${IC.range}</span><span><b>Tu voz: ${v.n.toLowerCase()} · ${nnTxt(DB.range.lo)} a ${nnTxt(DB.range.hi)}</b><span>Los ejercicios y las canciones se ajustan a este rango. Toca para medir de nuevo.</span></span></a>`}
  return`<a class="card cta" href="#/practicar/rango"><span><span class="eyebrow">Primer paso</span><b>Mide tu rango vocal</b><span>Dos minutos con el micrófono: tu nota más grave, la más aguda y tu tipo de voz. Así todo queda a tu medida.</span></span><span class="ic">${IC.range}</span></a>`;
}
function viewHome(){
  const nx=nextEx(),[d,t]=doneCount();
  const inst=standalone()||DB.hideInstall?'':DEFERRED?`<div class="card install"><div><h3>Instala la app</h3><p class="cap" style="margin:4px 0 0">Ábrela desde tu pantalla de inicio y úsala sin internet.</p></div><div class="row"><button class="btn pri" data-h="install">${IC.down}Instalar</button><button class="btn sm" data-h="hideinst">Ahora no</button></div></div>`:isIOS?`<div class="card install"><div><h3>Instala la app en tu iPhone o iPad</h3><p class="cap" style="margin:4px 0 0">En Safari toca el botón Compartir y elige «Agregar a inicio».</p></div><button class="btn sm" data-h="hideinst">Entendido</button></div>`:'';
  return{title:'Roka Couch Vocal',html:`
  <div class="brandhero"><span class="logo">${logo()}</span><div><span class="eyebrow">${greet()}</span><h1 class="glow">Tu voz de hoy</h1></div></div>
  <div class="card" style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
    <div class="stat"><b>${streak()}</b><span>días de racha</span></div>
    <div class="stat"><b>${weekMins()}</b><span>min esta semana</span></div>
    <div class="stat"><b>${d}<small style="font-size:18px;color:var(--muted)">/${t}</small></b><span>ejercicios</span></div>
  </div>
  ${rangeCard()}
  ${warmCard()}
  ${nx?(()=>{const[ld,lt]=doneCount(nx.lesson);return`<a class="card nowp" href="#/leccion/${nx.lesson}/${nx.id}"><span class="acov">${lessonArt(nx.lesson)}</span><span class="np"><span class="eyebrow">Continúa donde te quedaste</span><b>${nx.t}</b><small>Lección ${nx.lesson} · ${LESSONS.find(l=>l.id===nx.lesson).title}</small><span class="pg"><i style="width:${Math.round(ld/lt*100)}%"></i></span></span><span class="playc">${IC.play}</span></a>`})():''}
  <section><div class="sech"><h2>Lecciones</h2><a href="#/lecciones">Ver todas</a></div><div class="shelf">${LESSONS.map(l=>lessonAlb(l.id)).join('')}</div></section>
  <section><div class="sech"><h2>Calentamientos</h2><a href="#/practicar">Practicar</a></div><div class="shelf">${DRILLS.map(drillAlb).join('')}</div></section>
  <section><div class="sech"><h2>Para cantar</h2><a href="#/canciones">Canciones</a></div><div class="shelf">${SONGLIST.map(songAlb).join('')}</div></section>
  ${inst}
  <div><p class="eyebrow" style="margin-bottom:10px">Herramientas</p><div class="grid2">${toolCards()}</div></div>
  <div class="card" style="display:flex;flex-direction:column;gap:12px">
    <div class="row" style="justify-content:space-between"><span class="cl" style="margin:0">Tema</span><div class="seg">${[['auto','Auto'],['estudio','Estudio'],['escenario','Escenario'],['claro','Claro']].map(([v,l])=>`<button data-theme-set="${v}" aria-pressed="${(DB.theme||'auto')===v}">${l}</button>`).join('')}</div></div>
    <div class="row" style="justify-content:space-between"><span class="cl" style="margin:0">Sin medir tu rango, practica con voz</span><div class="seg">${[['grave','Grave'],['aguda','Aguda']].map(([v,l])=>`<button data-vt="${v}" aria-pressed="${(DB.vt||'grave')===v}">${l}</button>`).join('')}</div></div>
    <div class="row" style="justify-content:space-between"><span class="cl" style="margin:0">Progreso guardado en este dispositivo</span><span id="rstw"><button class="btn sm" data-h="reset">Reiniciar progreso</button></span></div>
  </div>
  <p class="foot">Roka Couch Vocal · funciona sin conexión<br>Canta sin dolor: si algo raspa o duele, descansa.</p>`,
  mount(r){
    if(DB.onb==null)setTimeout(()=>{if(DB.onb==null&&(!location.hash||location.hash==='#/'))onboardShow()},400);
    r.addEventListener('click',async e=>{
      const th=e.target.closest('[data-theme-set]');if(th){DB.theme=th.dataset.themeSet;save();applyTheme();$$('[data-theme-set]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===th)));return}
      const vt=e.target.closest('[data-vt]');if(vt){DB.vt=vt.dataset.vt;save();$$('[data-vt]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===vt)));return}
      const b=e.target.closest('[data-h]');if(!b)return;const a=b.dataset.h;
      if(a==='install'&&DEFERRED){DEFERRED.prompt();try{await DEFERRED.userChoice}catch(_){}DEFERRED=null;route()}
      else if(a==='hideinst'){DB.hideInstall=true;save();route()}
      else if(a==='reset'){$('#rstw',r).innerHTML='<span class="row"><span class="cap" style="margin:0">¿Borrar todo?</span><button class="btn sm" data-h="reset-yes" style="border-color:var(--bad);color:var(--bad)">Sí, borrar</button><button class="btn sm" data-h="reset-no">Cancelar</button></span>'}
      else if(a==='reset-yes'){Object.assign(DB,{done:{},secs:{},days:{},best:{},today:{},range:null,breath:0});save();route()}
      else if(a==='reset-no')route();
    });
  }};
}
/* bienvenida: una pregunta para empezar con ejercicios en una zona razonable */
function onboardShow(){
  if($('#onb'))return;
  const d=document.createElement('div');d.id='onb';d.className='onb';
  d.innerHTML=`<div class="card onbc" role="dialog" aria-modal="true" aria-labelledby="onbt"><span class="logo">${logo()}</span><h2 id="onbt">Te damos la bienvenida a Roka Couch Vocal</h2>
   <p class="sub" style="margin:0">Tu coach de canto: afinador de voz, calentamientos que te califican con el micrófono, lecciones de técnica y canciones.</p>
   <p class="cl" style="margin:6px 0 0">¿Tu voz es más bien…?</p>
   <div class="row" style="justify-content:center"><button class="btn" data-onb="grave">Grave</button><button class="btn" data-onb="aguda">Aguda</button></div>
   <p class="cap" style="margin:0">Después mide tu rango para afinar los ejercicios a tu voz exacta. Recomendado: usa audífonos.</p>
   <div class="row" style="justify-content:center"><button class="btn pri" data-onb="rango">${IC.range}Medir mi rango ahora</button><button class="btn sm" data-onb="no">Luego</button></div></div>`;
  document.body.appendChild(d);
  d.addEventListener('click',e=>{const b=e.target.closest('[data-onb]');if(!b)return;const k=b.dataset.onb;
    if(k==='grave'||k==='aguda'){DB.vt=k;save();$$('[data-onb="grave"],[data-onb="aguda"]',d).forEach(x=>x.classList.toggle('pri',x===b));return}
    DB.onb=1;save();d.remove();if(k==='rango')location.hash='#/practicar/rango';else route()});
}
function viewLessons(){
  return{title:'Lecciones',html:`<div class="lhead"><span class="eyebrow">${LESSONS.length} lecciones · ${ALLEX.length} ejercicios</span><h1>Lecciones</h1><p class="sub">Técnica vocal paso a paso: primero el aire, luego el sonido, la afinación, tu rango y el cuidado de tu voz.</p></div>
  <section class="albsec"><div class="albs">${LESSONS.map(l=>lessonAlb(l.id)).join('')}</div></section>`};
}
function refreshProgress(){const el=$('#lprog');if(!el)return;const l=+el.dataset.l,[d,t]=doneCount(l);el.querySelector('i').style.width=(d/t*100)+'%';const c=$('#lcnt');if(c)c.textContent=`${d} de ${t} ejercicios hechos`}
function viewLesson(id,exId){
  const l=LESSONS.find(x=>x.id===id);if(!l)return viewLessons();
  const body=l.blocks.map((b,bi)=>blockHTML(b).replace(/^(\s*<\w+)/,`$1 data-nb="${bi}"`)).join('');
  const prev=LESSONS.find(x=>x.id===id-1),next=LESSONS.find(x=>x.id===id+1),[d,t]=doneCount(id);
  return{title:'Lección '+id,back:'#/lecciones',html:`
  <div class="lhead"><div class="lhero"><span class="acov">${lessonArt(id)}</span><div><span class="eyebrow">Lección ${id} de ${LESSONS.length}</span><h1>${l.title}</h1></div></div><p class="lead">${l.lead}</p>
  ${HAS_TTS?`<div><button class="btn pri" data-narr="start" data-l="${id}">${IC.voice}Escuchar la lección</button></div>`:''}
  <div><div class="bar" id="lprog" data-l="${id}"><i style="width:${d/t*100}%"></i></div><p class="cap" id="lcnt" style="margin-top:6px">${d} de ${t} ejercicios hechos</p></div></div>
  ${body}
  <div class="row" style="justify-content:space-between">${prev?`<a class="btn" href="#/leccion/${prev.id}">${IC.back}Lección ${prev.id}</a>`:'<span></span>'}${next?`<a class="btn pri" href="#/leccion/${next.id}">Lección ${next.id}</a>`:''}</div>`,
  mount(r){
    paintEx(r);paintNarr();
    if(exId){const el=$('#ex-'+exId,r);if(el)setTimeout(()=>el.scrollIntoView({block:'start',behavior:'smooth'}),60)}
    return()=>narrStop(true);
  }};
}
function viewPractice(){
  return{title:'Practicar',html:`<div class="lhead"><span class="eyebrow">Herramientas y calentamientos</span><h1>Practicar</h1></div>
  ${warmCard()}
  <div class="grid2">${toolCards()}</div>
  <section><div class="sech"><h2>Calentamientos</h2></div><p class="cap" style="margin:-4px 0 12px">La app toca el patrón, tú lo repites y el micrófono te califica nota por nota. Cada ronda sube medio tono dentro de tu rango.</p><div class="albs">${DRILLS.map(drillAlb).join('')}</div></section>`};
}
function viewWarmup(){
  const step=(k,i)=>{const done=DB.today[k]===today();if(k==='respira')return`<a class="srow wrow${done?' done':''}" href="#/practicar/respiracion"><span class="sart">${coverArt(180,TART.breath[1],null,'wr')}</span><span class="st"><b>${i+1}. Respiración 4-4-8</b><span>Cinco ciclos para despertar el aire</span></span><span class="wk">${done?IC.check:''}</span></a>`;
    const d=drillById(k);return`<a class="srow wrow${done?' done':''}" href="#/practicar/ej/${k}"><span class="sart">${drillArt(d)}</span><span class="st"><b>${i+1}. ${d.t}</b><span>${d.sub} · ${d.syl}${DB.best[k]!=null?' · récord '+Math.round(DB.best[k]*100)+' %':''}</span></span><span class="wk">${done?IC.check:''}</span></a>`};
  const nx=WARMUP.find(k=>DB.today[k]!==today());
  return{title:'Calentamiento de hoy',back:'#/practicar',html:`<div class="kplay tplay">
  ${toolHead('rt','Calentamiento de hoy','10 minutos · de suave a fuerte')}
  <div class="slist">${WARMUP.map(step).join('')}</div>
  <p class="cap">Descansa 20 segundos entre ejercicios. Cada paso se palomea al terminarlo; mañana empieza de nuevo.</p>
  ${toolDock(`<span class="tm">${warmDone()} de ${WARMUP.length} hechos</span><div class="ktrans"><a class="kplayb" href="${nx?(nx==='respira'?'#/practicar/respiracion':'#/practicar/ej/'+nx):'#/canciones'}" aria-label="${nx?'Siguiente paso':'Cantar una canción'}">${IC.play}<span>${nx?'Siguiente':'Cantar'}</span></a></div><span></span>`)}
  </div>`,mount(r){const m=$('#tmeta',r);if(m)m.textContent=warmDone()===WARMUP.length?'Completo por hoy':'Haz los pasos en orden'}};
}
function viewSongs(){
  return{title:'Canciones',html:`<div class="lhead"><span class="eyebrow">Canta con la línea de tu voz</span><h1>Canciones</h1><p class="sub">Melodías tradicionales y ejercicios cantados. La app las pone en el tono de tu voz; la letra se ilumina sílaba por sílaba.</p></div>
  <div class="slist">${SONGLIST.map(s=>{const b=DB.best['song:'+s.id];return`<a class="srow" href="#/canciones/${s.id}"><span class="sart">${songArt(s)}</span><span class="st"><b>${esc(s.title)}</b><span>${esc(s.artist)}${b!=null?' · récord '+Math.round(b*100)+' %':''}</span></span><span class="sk">${s.bpm} bpm</span></a>`}).join('')}</div>
  <p class="cap">Próximamente: pega la letra de tus canciones favoritas como en el cancionero de Roka Guitar.</p>`};
}
/* ---------- enrutador ---------- */
const NAV=[['#/','Inicio',IC.home,''],['#/lecciones','Lecciones',IC.book,'leccion'],['#/practicar','Practicar',IC.mic,'practicar'],['#/canciones','Canciones',IC.note,'canciones']];
let UNMOUNT=null;
function route(){
  const h=location.hash.replace(/^#\/?/,''),p=h.split('/');
  let v;
  if(UNMOUNT){try{UNMOUNT()}catch(e){}UNMOUNT=null}
  if(!p[0])v=viewHome();
  else if(p[0]==='lecciones')v=viewLessons();
  else if(p[0]==='leccion')v=viewLesson(+p[1],p[2]);
  else if(p[0]==='practicar')v=p[1]==='ej'?viewDrill(p[2]):({afinador:viewTuner,rango:viewRange,respiracion:viewBreath,metronomo:viewMetronome,calentamiento:viewWarmup}[p[1]]||viewPractice)();
  else if(p[0]==='canciones')v=p[1]?viewSing(p[1]):viewSongs();
  else v=viewHome();
  const sec=p[0]===''?'':p[0]==='lecciones'?'leccion':p[0];
  $$('[data-nav]').forEach(a=>{const on=a.dataset.nav===sec;if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
  $('#ttl').textContent=v.title;
  const bk=$('#back');bk.hidden=!v.back;if(v.back)bk.href=v.back;
  // página nueva en cada vista: así no se acumulan los clics de vistas anteriores
  const old=$('#page'),pg=old.cloneNode(false);old.replaceWith(pg);pg.innerHTML=v.html;
  document.title=v.title==='Roka Couch Vocal'?v.title:v.title+' · Roka Couch Vocal';
  if(v.mount)UNMOUNT=v.mount(pg)||null;
  if(!(p[0]==='leccion'&&p[2]))window.scrollTo(0,0);
}
/* ---------- arranque ---------- */
document.body.insertAdjacentHTML('afterbegin',`<div class="shell">
 <nav class="side" aria-label="Secciones"><div class="brand"><span class="logo">${logo()}</span>Roka<br>Couch Vocal</div>${NAV.map(([h,l,ic,k])=>`<a href="${h}" data-nav="${k}">${ic}${l}</a>`).join('')}</nav>
 <main><header class="topbar"><div class="in"><a class="icon-btn" id="back" href="#/" aria-label="Volver" hidden>${IC.back}</a><span class="ttl" id="ttl"></span></div></header><div class="page" id="page"></div></main>
</div>
<nav class="tabs" aria-label="Secciones">${NAV.map(([h,l,ic,k])=>`<a class="tab" href="${h}" data-nav="${k}">${ic}${l}</a>`).join('')}</nav>`);
save();
window.addEventListener('hashchange',route);
route();
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
