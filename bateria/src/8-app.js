/* ---------- datos locales ---------- */
const DBK='pulso-a-la-vista:v1';
let DB={done:{},secs:{},days:{},bpm:{},gbpm:{},ses:[],songs:[],theme:'auto',met:80,meter:'4/4',sub:1,sens:2};
try{Object.assign(DB,JSON.parse(localStorage.getItem(DBK)||'{}'))}catch(e){}
function save(){try{localStorage.setItem(DBK,JSON.stringify(DB))}catch(e){}}
MET.bpm=DB.met||80;MET.meter=DB.meter||'4/4';MET.sub=DB.sub||1;
const today=(d)=>{d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
function markDay(){DB.days[today()]=true;save()}
function streak(){let n=0;const d=new Date();if(!DB.days[today(d)])d.setDate(d.getDate()-1);while(DB.days[today(d)]){n++;d.setDate(d.getDate()-1)}return n}
function weekMins(){let s=0;const d=new Date();for(let i=0;i<7;i++){s+=DB.secs[today(d)]||0;d.setDate(d.getDate()-1)}return Math.round(s/60)}
const nextEx=()=>ALLEX.find(x=>!DB.done[x.id]);
const doneCount=l=>{const xs=ALLEX.filter(x=>!l||x.lesson===l);return[xs.filter(x=>DB.done[x.id]).length,xs.length]};
setInterval(()=>{
  if(document.hidden)return;
  if(SEQ.id||(TMR.id&&!TMR.paused)){const k=today();DB.secs[k]=(DB.secs[k]||0)+1;if(DB.secs[k]>=60)DB.days[k]=true;if(DB.secs[k]%10===0)save()}
},1000);
function applyTheme(){if(DB.theme==='auto')document.documentElement.removeAttribute('data-theme');else document.documentElement.setAttribute('data-theme',DB.theme)}
applyTheme();
/* ---------- tarjeta de ejercicio ---------- */
const metDesc=m=>{const p=[m.bpm+' bpm'];if(m.mode==='24')p.push('click en 2 y 4');if(m.mode==='1')p.push('click solo en el 1');if(m.mode==='off')p.push('click en contratiempo');if(m.gapOn)p.push(m.gapOn+' sí · '+m.gapOff+' no');if(m.sub>1)p.push({2:'corcheas',3:'tresillos',4:'semicorcheas'}[m.sub]);if(m.tr)p.push('+'+m.tr.step+' cada '+m.tr.every+' compases');return p.join(' · ')};
function exCard(x,inRoutine){
  const l=LESSONS.find(z=>z.id===x.lesson),list=l.blocks.filter(b=>b.ex),idx=list.findIndex(b=>b.ex.id===x.id)+1;
  return`<article class="ex ${DB.done[x.id]?'done':''}" id="ex-${x.id}" data-ex="${x.id}">
   <div class="eh"><div><span class="tag">${inRoutine?'Lección '+x.lesson+' · ':''}Haz esto ahora · ${idx} de ${list.length}</span><h3>${x.t}</h3></div><span class="meta">${x.min} min</span></div>
   <ol>${x.steps.map(s=>`<li>${s}</li>`).join('')}</ol>
   ${x.groove?grooveCard(x.groove):''}
   <p class="goal"><b>Lo logras cuando:</b> ${x.goal}</p>
   ${x.met?`<p class="cap" style="margin:0">Metrónomo: <b>${metDesc(x.met)}</b></p>`:''}
   ${x.track?`<p class="cap" style="margin:0">Pista sin batería: <b>${STYLES[x.track.st].n}</b> · ${x.track.bpm} bpm · <span data-x="trkcur" data-id="${x.id}">detenida</span></p>`:''}
   <div class="exbar">
    ${x.met?`<span class="minimet"><button class="icon-btn" data-x="bpm" data-d="-5" data-id="${x.id}" aria-label="Bajar tempo">${IC.minus}</button><span class="v" data-x="bpmv" data-id="${x.id}"></span><button class="icon-btn" data-x="bpm" data-d="5" data-id="${x.id}" aria-label="Subir tempo">${IC.plus}</button><button class="btn sm" data-x="met" data-id="${x.id}"></button></span>`:''}
    ${x.track?`<button class="btn sm" data-x="trk" data-id="${x.id}"></button>`:''}
    ${x.timing?`<button class="btn sm" data-x="timing" data-id="${x.id}">${IC.target}Medir con el micrófono</button>`:''}
    <button class="btn sm" data-x="tmr" data-id="${x.id}"></button>
    <button class="btn sm ok" data-x="done" data-id="${x.id}"></button>
   </div>
   <p class="cap" data-x="msg" data-id="${x.id}" hidden></p>
  </article>`;
}
function paintEx(root){
  $$('[data-x]',root||document).forEach(b=>{
    const id=b.dataset.id,x=ALLEX.find(z=>z.id===id),k=b.dataset.x;if(!x)return;
    if(k==='met'){const on=SEQ.id==='met'&&OWNER==='ex:'+id;b.innerHTML=on?IC.stop+'Detener':IC.play+'Metrónomo';b.classList.toggle('on',on)}
    else if(k==='trk'){const on=SEQ.id==='trk'&&OWNER==='ex:'+id;b.innerHTML=on?IC.stop+'Detener pista':IC.band+'Tocar con la banda';b.classList.toggle('on',on)}
    else if(k==='trkcur'){if(!(SEQ.id==='trk'&&OWNER==='ex:'+id))b.textContent='detenida'}
    else if(k==='bpmv')b.textContent=(DB.bpm[id]||x.met.bpm)+' bpm';
    else if(k==='tmr'){const on=TMR.id==='ex:'+id;b.innerHTML=IC.timer+`<span class="tm">${on?fmt(TMR.paused?TMR.paused/1000:(TMR.end-Date.now())/1000)+(TMR.paused?' · en pausa':''):fmt(x.min*60)}</span>`;b.classList.toggle('on',on)}
    else if(k==='done'){const d=!!DB.done[id];b.innerHTML=IC.check+(d?'Hecho':'Marcar como hecho');b.classList.toggle('on',d);b.setAttribute('aria-pressed',String(d));const card=b.closest('.ex');if(card)card.classList.toggle('done',d)}
  });
}
document.addEventListener('playstate',()=>{paintEx();paintPlayer()});
document.addEventListener('tmr',e=>{if(e.detail.id.startsWith('ex:')){const b=document.querySelector(`[data-x="tmr"][data-id="${e.detail.id.slice(3)}"]`);if(b)b.querySelector('.tm').textContent=fmt(e.detail.left)+(TMR.paused?' · en pausa':'')}paintPlayer()});
document.addEventListener('tmrdone',e=>{
  if(!e.detail.id.startsWith('ex:'))return;const id=e.detail.id.slice(3);
  if(SEQ.id&&OWNER==='ex:'+id)seqStop();
  const m=document.querySelector(`[data-x="msg"][data-id="${id}"]`);
  if(m){m.hidden=false;m.innerHTML='<b>Tiempo cumplido.</b> Si alcanzaste el objetivo, márcalo como hecho; si no, repítelo mañana.'}
  paintEx();
});
function exAction(b){
  const id=b.dataset.id,x=ALLEX.find(z=>z.id===id),k=b.dataset.x;if(!x)return false;
  if(k==='done'){if(DB.done[id])delete DB.done[id];else{DB.done[id]=true;markDay()}save();paintEx();refreshProgress();return true}
  if(k==='met'){if(SEQ.id==='met'&&OWNER==='ex:'+id)seqStop();else{OWNER='ex:'+id;Object.assign(MET,{bpm:DB.bpm[id]||x.met.bpm,sub:x.met.sub||1,meter:x.met.meter||'4/4'});metStart((({bpm,...o})=>o)(x.met))}paintEx();return true}
  if(k==='bpm'){const v=Math.max(30,Math.min(240,(DB.bpm[id]||x.met.bpm)+ +b.dataset.d));DB.bpm[id]=v;save();if(SEQ.id==='met'&&OWNER==='ex:'+id){MET.bpm=v;SEQ.label='Metrónomo '+v;emitState()}paintEx();return true}
  if(k==='trk'){
    if(SEQ.id==='trk'&&OWNER==='ex:'+id)seqStop();
    else{OWNER='ex:'+id;Object.assign(TRK,x.track,{nod:true,click:true});const cur=document.querySelector(`[data-x="trkcur"][data-id="${id}"]`);trkStart((ci,lab)=>{if(cur)cur.textContent=lab==='cuenta'?'cuenta inicial':'sonando '+trkName(ci)})}
    paintEx();return true}
  if(k==='tmr'){if(TMR.id==='ex:'+id)tmrPause();else tmrStart('ex:'+id,x.min*60);paintEx();return true}
  if(k==='timing'){Object.assign(TM,x.timing);location.hash='#/practicar/medidor';return true}
  return false;
}
/* ---------- mini reproductor ---------- */
function paintPlayer(){
  let p=$('#player');
  const on=(SEQ.id&&SEQ.id!=='tim'&&OWNER!=='rt')||(TMR.id&&TMR.id!=='rt');
  if(!on){if(p)p.remove();return}
  if(!p){p=document.createElement('div');p.id='player';p.className='player';document.body.appendChild(p)}
  const lab=SEQ.id&&SEQ.id!=='tim'?SEQ.label:'Temporizador';
  const t=TMR.id&&TMR.id!=='rt'?' · '+fmt(TMR.paused?TMR.paused/1000:(TMR.end-Date.now())/1000):'';
  const href=SEQ.id==='met'&&OWNER==='tool'?'#/practicar/metronomo':SEQ.id==='trk'&&OWNER==='tool'?'#/practicar/banda':'';
  p.innerHTML=`<span class="dotlive"></span><span class="pl">${esc(lab+t)}</span>${href?`<a class="btn sm" href="${href}">Abrir</a>`:''}<button class="btn sm" data-pl="stop">${IC.stop}Detener</button>`;
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-pl="stop"]');if(b){seqStop();tmrStop();paintPlayer();paintEx()}});
/* ---------- vistas ---------- */
const greet=()=>{const h=new Date().getHours();return h<12?'Buenos días':h<19?'Buenas tardes':'Buenas noches'};
let DEFERRED=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();DEFERRED=e;if(location.hash===''||location.hash==='#/')route()});
const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
function profileCard(){
  const S=(DB.ses||[]).filter(s=>s.mode!=='free'),F=(DB.ses||[]).filter(s=>s.mode==='free');
  if(!S.length&&!F.length)return`<a class="card tool" href="#/leccion/1"><span class="ic">${IC.target}</span><span><b>Haz la prueba de diagnóstico</b><span>Tres pruebas de un minuto con el micrófono para conocer tu punto de partida.</span></span></a>`;
  const last=S[S.length-1],first=S[0];
  const spark=S.slice(-14).map(s=>s.sd),mx=Math.max(30,...spark);
  const sp=spark.length>1?`<svg viewBox="0 0 140 36" class="spark" aria-label="Consistencia por sesión"><polyline fill="none" stroke="var(--accent)" stroke-width="2.5" points="${spark.map((v,i)=>(i/(spark.length-1)*136+2).toFixed(1)+','+(34-v/mx*30).toFixed(1)).join(' ')}"/></svg>`:'';
  return`<div class="card"><div class="row" style="justify-content:space-between"><p class="eyebrow">Tu perfil de tiempo</p><a class="btn sm" href="#/practicar/medidor">${IC.target}Medir</a></div>
  ${last?`<div class="statrow" style="margin-top:10px"><div class="stat"><b>${Math.round(last.mean)>0?'+':''}${Math.round(last.mean)}</b><span>ms · ${tendTxt(last.mean).toLowerCase()}</span></div><div class="stat"><b>${Math.round(last.sd)}</b><span>ms consistencia</span></div><div class="stat"><b>${Math.round(last.pct)}%</b><span>en el bolsillo</span></div></div>`:''}
  ${F.length?`<p class="cap">Sin click: ${Math.round(F[F.length-1].drift)>0?'+':''}${Math.round(F[F.length-1].drift)} bpm de deriva en la última prueba.</p>`:''}
  ${S.length>1?`<div class="row" style="justify-content:space-between;margin-top:6px"><span class="cap" style="margin:0">Consistencia: empezaste en ${Math.round(first.sd)} ms; ahora ${Math.round(last.sd)} ms. Menos es mejor.</span>${sp}</div>`:''}</div>`;
}
function viewHome(){
  const nx=nextEx(),[d,t]=doneCount();
  const inst=standalone()||DB.hideInstall?'':DEFERRED?`<div class="card install"><div><h3>Instala la app</h3><p class="cap" style="margin:4px 0 0">Ábrela desde tu pantalla de inicio y úsala sin internet.</p></div><div class="row"><button class="btn pri" data-h="install">${IC.down}Instalar</button><button class="btn sm" data-h="hideinst">Ahora no</button></div></div>`:isIOS?`<div class="card install"><div><h3>Instala la app en tu iPhone o iPad</h3><p class="cap" style="margin:4px 0 0">En Safari toca el botón Compartir y elige «Agregar a inicio».</p></div><button class="btn sm" data-h="hideinst">Entendido</button></div>`:'';
  return{title:'Pulso a la Vista',html:`
  <div class="lhead"><span class="eyebrow">${greet()}</span><h1>Tu práctica de hoy</h1></div>
  <div class="card statrow"><div class="stat"><b>${streak()}</b><span>días de racha</span></div><div class="stat"><b>${weekMins()}</b><span>min esta semana</span></div><div class="stat"><b>${d}<small style="font-size:18px;color:var(--muted)">/${t}</small></b><span>ejercicios</span></div></div>
  ${profileCard()}
  ${nx?`<a class="card tool" href="#/leccion/${nx.lesson}/${nx.id}"><span class="ic">${IC.play}</span><span style="flex:1;min-width:0"><b>Continuar: ${nx.t}</b><span>Lección ${nx.lesson} · ${LESSONS.find(l=>l.id===nx.lesson).title}</span></span></a>`:`<div class="card"><h3>Completaste todos los ejercicios</h3><p class="cap">Repite las pruebas del medidor cada semana para ver tu avance.</p></div>`}
  <a class="card tool" href="#/practicar/rutina"><span class="ic">${IC.cal}</span><span><b>Rutina de 15 minutos</b><span>Calentamiento, pulso, lección y banda con temporizador.</span></span></a>
  ${inst}
  <div><p class="eyebrow" style="margin-bottom:10px">Herramientas</p><div class="grid2">${toolCards()}</div></div>
  <div class="card" style="display:flex;flex-direction:column;gap:12px">
    <div class="row" style="justify-content:space-between"><span class="cl" style="margin:0">Tema</span><div class="seg">${[['auto','Automático'],['dark','Oscuro'],['light','Claro']].map(([v,l])=>`<button data-theme-set="${v}" aria-pressed="${DB.theme===v}">${l}</button>`).join('')}</div></div>
    <div class="row" style="justify-content:space-between"><span class="cl" style="margin:0">Progreso guardado en este dispositivo</span><span id="rstw"><button class="btn sm" data-h="reset">Reiniciar progreso</button></span></div>
  </div>
  <p class="foot">Pulso a la Vista · funciona sin conexión</p>`,
  mount(r){
    r.addEventListener('click',async e=>{
      const th=e.target.closest('[data-theme-set]');if(th){DB.theme=th.dataset.themeSet;save();applyTheme();$$('[data-theme-set]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===th)));return}
      const b=e.target.closest('[data-h]');if(!b)return;const a=b.dataset.h;
      if(a==='install'&&DEFERRED){DEFERRED.prompt();try{await DEFERRED.userChoice}catch(_){}DEFERRED=null;route()}
      else if(a==='hideinst'){DB.hideInstall=true;save();route()}
      else if(a==='reset'){$('#rstw',r).innerHTML='<span class="row"><span class="cap" style="margin:0">¿Borrar ejercicios, racha y mediciones? El setlist se conserva.</span><button class="btn sm" data-h="reset-yes" style="border-color:var(--bad);color:var(--bad)">Sí, borrar</button><button class="btn sm" data-h="reset-no">Cancelar</button></span>'}
      else if(a==='reset-yes'){DB.done={};DB.secs={};DB.days={};DB.bpm={};DB.ses=[];save();route()}
      else if(a==='reset-no')route();
    });
  }};
}
const TOOLS=[['medidor','Medidor de precisión','El micrófono mide si vas adelantado o atrasado.',IC.target],['metronomo','Metrónomo','Click intermitente, 2 y 4, contratiempo y entrenador de velocidad.',IC.play2],['banda','Tocar con la banda','Bajo y acordes sin batería: rock, balada, cumbia, ranchera.',IC.band],['setlist','Setlist','El tempo de cada canción, listo para el ensayo.',IC.list]];
const toolCards=()=>TOOLS.map(([k,n,d,ic])=>`<a class="card tool" href="#/practicar/${k}"><span class="ic">${ic}</span><span><b>${n}</b><span>${d}</span></span></a>`).join('');
function viewLessons(){
  return{title:'Lecciones',html:`<div class="lhead"><span class="eyebrow">12 lecciones · ${ALLEX.length} ejercicios</span><h1>Lecciones</h1><p class="sub">Un plan para dejar de correr y arrastrar: medir, contar, sostener el pulso sin click y llevarlo a la banda.</p></div>
  ${PARTS2.map(p=>`<div class="list"><p class="eyebrow parth">Parte ${p.n} · ${p.t}</p>${p.m.map(i=>{const l=LESSONS.find(x=>x.id===i),[d,t]=doneCount(i);return`<a class="card lrow" href="#/leccion/${i}"><span class="mn ${d===t?'done':''}">${i}</span><span class="mt"><b>${l.title}</b><span>${l.sub}</span></span><span class="cnt">${d}/${t}</span></a>`}).join('')}</div>`).join('')}
  <a class="card tool" href="#/glosario"><span class="ic">${IC.book}</span><span><b>Glosario</b><span>Los términos del tiempo y el pulso, en idioma humano.</span></span></a>`};
}
function refreshProgress(){const el=$('#lprog');if(!el)return;const l=+el.dataset.l,[d,t]=doneCount(l);el.querySelector('i').style.width=(d/t*100)+'%';const c=$('#lcnt');if(c)c.textContent=`${d} de ${t} ejercicios hechos`}
function viewLesson(id,exId){
  const l=LESSONS.find(x=>x.id===id);if(!l)return viewLessons();
  const body=l.blocks.map(b=>{
    if(b.groove)return grooveCard(b.groove);
    if(b.ex)return exCard(b.ex);
    if(b.box)return`<div class="box"><p class="blockh">${b.box}</p><ul>${b.ul.map(t=>`<li>${t}</li>`).join('')}</ul></div>`;
    if(b.trick)return`<div class="box trick"><p class="blockh">Hoja de trucos</p><ul>${b.trick.map(t=>`<li>${t}</li>`).join('')}</ul></div>`;
    if(b.p)return`<p class="prose">${b.p}</p>`;
    return'';
  }).join('');
  const prev=LESSONS.find(x=>x.id===id-1),next=LESSONS.find(x=>x.id===id+1),[d,t]=doneCount(id);
  return{title:'Lección '+id,back:'#/lecciones',html:`
  <div class="lhead"><span class="eyebrow">Lección ${id} · Parte ${l.part}</span><h1>${l.title}</h1><p class="lead">${l.lead}</p>
  <div><div class="bar" id="lprog" data-l="${id}"><i style="width:${d/t*100}%"></i></div><p class="cap" id="lcnt" style="margin-top:6px">${d} de ${t} ejercicios hechos</p></div></div>
  ${body}
  <div class="row" style="justify-content:space-between">${prev?`<a class="btn" href="#/leccion/${prev.id}">${IC.back}Lección ${prev.id}</a>`:'<span></span>'}${next?`<a class="btn pri" href="#/leccion/${next.id}">Lección ${next.id}</a>`:''}</div>`,
  mount(r){
    mountGrooves(r);paintEx(r);
    if(exId){const el=$('#ex-'+exId,r);if(el)setTimeout(()=>el.scrollIntoView({block:'start',behavior:'smooth'}),60)}
  }};
}
function viewPractice(){
  return{title:'Practicar',html:`<div class="lhead"><span class="eyebrow">Herramientas</span><h1>Practicar</h1></div>
  <a class="card tool" href="#/practicar/rutina"><span class="ic">${IC.cal}</span><span><b>Rutina diaria</b><span>10, 15 o 30 minutos guiados con temporizador.</span></span></a>
  <div class="grid2">${toolCards()}</div>`};
}
let GSEL='Básicos',GID='rock';
function viewGrooves(){
  return{title:'Grooves',html:`<div class="lhead"><span class="eyebrow">${Object.keys(G).length} grooves</span><h1>Grooves</h1><p class="sub">Escucha, baja el tempo y silencia una pieza para tocarla tú.</p></div>
  <div class="chips" id="gcat">${GCATS.map(c=>`<button class="chip" data-c="${c}" aria-pressed="${c===GSEL}">${c}</button>`).join('')}</div>
  <div class="chips" id="glist"></div><div id="gone"></div>`,
  mount(r){
    const one=()=>{const h=$('#gone',r);cleanupIn(h);h.innerHTML=grooveCard(GID);mountGrooves(h)};
    const list=()=>{const ids=Object.keys(G).filter(k=>G[k].cat===GSEL);if(!ids.includes(GID))GID=ids[0];$('#glist',r).innerHTML=ids.map(k=>`<button class="chip" data-g="${k}" aria-pressed="${k===GID}">${G[k].n}</button>`).join('');one()};
    r.addEventListener('click',e=>{const c=e.target.closest('[data-c]');if(c){GSEL=c.dataset.c;$$('[data-c]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===c)));if(SEQ.id==='grv')seqStop();list();return}
      const g=e.target.closest('[data-g]');if(g){GID=g.dataset.g;$$('[data-g]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===g)));if(SEQ.id==='grv')seqStop();one()}});
    list();
  }};
}
function viewGlossary(){return{title:'Glosario',back:'#/lecciones',html:`<div class="gl">${GLOS.map(g=>`<div><b>${g[0]}</b><span>${g[1]}</span></div>`).join('')}</div>`}}
/* ---------- enrutador ---------- */
const NAV=[['#/','Inicio',IC.home,''],['#/lecciones','Lecciones',IC.book,'leccion'],['#/practicar','Practicar',IC.target,'practicar'],['#/grooves','Grooves',IC.drum,'grooves']];
let UNMOUNT=null;
function route(){
  const h=location.hash.replace(/^#\/?/,''),p=h.split('/');
  let v;
  if(!p[0])v=viewHome();
  else if(p[0]==='lecciones')v=viewLessons();
  else if(p[0]==='leccion')v=viewLesson(+p[1],p[2]);
  else if(p[0]==='glosario')v=viewGlossary();
  else if(p[0]==='grooves')v=viewGrooves();
  else if(p[0]==='practicar')v=({metronomo:viewMetronome,medidor:viewTiming,banda:viewBand,setlist:viewSetlist,rutina:viewRoutine}[p[1]]||viewPractice)();
  else v=viewHome();
  if(UNMOUNT){try{UNMOUNT()}catch(e){}UNMOUNT=null}
  const pg=$('#page');cleanupIn(pg);
  if(SEQ.id==='grv')seqStop();
  const sec=p[0]===''?'':p[0]==='lecciones'||p[0]==='glosario'?'leccion':p[0];
  $$('[data-nav]').forEach(a=>{const on=a.dataset.nav===sec;if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
  $('#ttl').textContent=v.title;
  const bk=$('#back');bk.hidden=!v.back;if(v.back)bk.href=v.back;
  pg.innerHTML=v.html;
  document.title=v.title==='Pulso a la Vista'?v.title:v.title+' · Pulso a la Vista';
  if(v.mount)UNMOUNT=v.mount(pg)||null;
  if(!(p[0]==='leccion'&&p[2]))window.scrollTo(0,0);
  paintPlayer();
}
document.addEventListener('click',e=>{const x=e.target.closest('[data-x]');if(x)exAction(x)});
/* ---------- arranque ---------- */
document.body.insertAdjacentHTML('afterbegin',`<div class="shell">
 <nav class="side" aria-label="Secciones"><div class="brand">${IC.drum}Pulso a la Vista</div>${NAV.map(([h,l,ic,k])=>`<a href="${h}" data-nav="${k}">${ic}${l}</a>`).join('')}</nav>
 <main><header class="topbar"><div class="in"><a class="icon-btn" id="back" href="#/" aria-label="Volver" hidden>${IC.back}</a><span class="ttl" id="ttl"></span></div></header><div class="page" id="page"></div></main>
</div>
<nav class="tabs" aria-label="Secciones">${NAV.map(([h,l,ic,k])=>`<a class="tab" href="${h}" data-nav="${k}">${ic}${l}</a>`).join('')}</nav>`);
window.addEventListener('hashchange',route);
route();
if('serviceWorker' in navigator&&location.protocol!=='file:'){window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{})})}
