/* ---------- datos locales ---------- */
const DBK='mastil-a-la-vista:v2';
let DB={done:{},secs:{},days:{},game:{},bpm:{},theme:'auto',last:1,met:80,meter:'4/4',sub:1};
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
  if(SEQ.id||(TMR.id&&!TMR.paused)||TUN.stream||GAMEON){const k=today();DB.secs[k]=(DB.secs[k]||0)+1;if(DB.secs[k]>=60)DB.days[k]=true;if(DB.secs[k]%10===0)save()}
},1000);
function applyTheme(){if(DB.theme==='auto')document.documentElement.removeAttribute('data-theme');else document.documentElement.setAttribute('data-theme',DB.theme)}
applyTheme();
/* ---------- widgets interactivos ---------- */
function ctrlHTML(c){return`<div><span class="cl">${c.label}</span><div class="chips">${c.opts.map(o=>`<button class="chip" data-k="${c.k}" data-v="${o.v}" aria-pressed="false">${o.l}${o.s?`<i>${o.s}</i>`:''}</button>`).join('')}</div></div>`}
function mountWidget(host,spec){
  const def=WID[spec.w];
  let st=typeof def.init==='function'?def.init(spec):def.init;
  st=Object.assign({},st,spec.init||{});if(st.steps)st.steps=st.steps.slice();
  const ctrls=typeof def.controls==='function'?def.controls(spec):def.controls;
  host.innerHTML=`<div class="controls">${ctrls.map(ctrlHTML).join('')}</div><div class="wout"></div>`;
  const o=$('.wout',host);
  const paint=()=>{o.innerHTML=def.view(st,spec);$$('.chip',host).forEach(b=>b.setAttribute('aria-pressed',String(String(st[b.dataset.k])===b.dataset.v)))};
  host.addEventListener('click',e=>{
    const a=e.target.closest('[data-act]');if(a&&def.act&&host.contains(a)){def.act(st,a.dataset.act,paint);return}
    const t=e.target.closest('[data-k]');if(t&&host.contains(t)){st[t.dataset.k]=num(t.dataset.v);paint()}
  });
  host.addEventListener('change',e=>{const s=e.target.closest('select[data-i]');if(s)st.steps[+s.dataset.i]=+s.value});
  paint();
}
/* ---------- tarjeta de ejercicio ---------- */
function exCard(x,inRoutine){
  const l=LESSONS.find(z=>z.id===x.lesson),idx=l.blocks.filter(b=>b.ex).findIndex(b=>b.ex.id===x.id)+1,tot=l.blocks.filter(b=>b.ex).length;
  const bpm=DB.bpm[x.id]||x.bpm;
  const tr=x.track?`<button class="btn sm" data-x="trk" data-id="${x.id}"></button>`:'';
  return`<article class="ex ${DB.done[x.id]?'done':''}" id="ex-${x.id}" data-ex="${x.id}">
   <div class="eh"><div><span class="tag">${inRoutine?'Lección '+x.lesson+' · ':''}Haz esto ahora · ${idx} de ${tot}</span><h3>${x.t}</h3></div><span class="meta">${x.min} min</span></div>
   ${x.fig?`<div>${x.fig()}</div>`:''}
   <ol>${x.steps.map(s=>`<li>${s}</li>`).join('')}</ol>
   <p class="goal"><b>Lo logras cuando:</b> ${x.goal}</p>
   ${x.track?`<p class="cap" style="margin:0">Pista: <b>${PROG2[x.track.p].n}</b> en ${KEYS[x.track.k].es} · ${STYLES[x.track.st].n} · <span data-x="trkcur" data-id="${x.id}"></span></p>`:''}
   <div class="exbar">
    ${x.bpm?`<span class="minimet"><button class="icon-btn" data-x="bpm" data-d="-5" data-id="${x.id}" aria-label="Bajar tempo">${IC.minus}</button><span class="v" data-x="bpmv" data-id="${x.id}">${bpm} bpm</span><button class="icon-btn" data-x="bpm" data-d="5" data-id="${x.id}" aria-label="Subir tempo">${IC.plus}</button><button class="btn sm" data-x="met" data-id="${x.id}"></button></span>`:''}
    ${tr}
    ${x.game?`<button class="btn sm" data-x="game" data-id="${x.id}">${IC.game}Abrir juego</button>`:''}
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
    else if(k==='trk'){const on=SEQ.id==='trk'&&OWNER==='ex:'+id;b.innerHTML=on?IC.stop+'Detener pista':IC.wave+'Tocar con pista';b.classList.toggle('on',on)}
    else if(k==='trkcur'){if(!(SEQ.id==='trk'&&OWNER==='ex:'+id))b.textContent='detenida'}
    else if(k==='bpmv')b.textContent=(DB.bpm[id]||x.bpm)+' bpm';
    else if(k==='tmr'){const on=TMR.id==='ex:'+id;b.innerHTML=IC.timer+`<span class="tm">${on?fmt(TMR.paused?TMR.paused/1000:(TMR.end-Date.now())/1000)+(TMR.paused?' · en pausa':''):fmt(x.min*60)}</span>`;b.classList.toggle('on',on)}
    else if(k==='done'){const d=!!DB.done[id];b.innerHTML=IC.check+(d?'Hecho':'Marcar como hecho');b.classList.toggle('on',d);b.setAttribute('aria-pressed',String(d));const card=b.closest('.ex');if(card)card.classList.toggle('done',d)}
  });
}
document.addEventListener('playstate',()=>{paintEx();paintPlayer()});
document.addEventListener('tmr',e=>{const b=document.querySelector(`[data-x="tmr"][data-id="${e.detail.id.slice(3)}"]`);if(b&&e.detail.id.startsWith('ex:'))b.querySelector('.tm').textContent=fmt(e.detail.left)+(TMR.paused?' · en pausa':'');paintPlayer()});
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
  if(k==='met'){if(SEQ.id==='met'&&OWNER==='ex:'+id)seqStop();else{OWNER='ex:'+id;metStart({bpm:DB.bpm[id]||x.bpm,meter:'4/4',sub:1})}paintEx();return true}
  if(k==='bpm'){const v=Math.max(30,Math.min(240,(DB.bpm[id]||x.bpm)+ +b.dataset.d));DB.bpm[id]=v;save();if(SEQ.id==='met'&&OWNER==='ex:'+id){MET.bpm=v;SEQ.label='Metrónomo '+v;emitState()}paintEx();return true}
  if(k==='trk'){
    if(SEQ.id==='trk'&&OWNER==='ex:'+id)seqStop();
    else{OWNER='ex:'+id;Object.assign(TRK,x.track);const cur=document.querySelector(`[data-x="trkcur"][data-id="${id}"]`);trkStart((ci,lab)=>{if(cur)cur.textContent=lab==='cuenta'?'cuenta inicial':'sonando '+trkName(ci)})}
    paintEx();return true}
  if(k==='tmr'){if(TMR.id==='ex:'+id)tmrPause();else tmrStart('ex:'+id,x.min*60);paintEx();return true}
  if(k==='game'){Object.assign(GAME,x.game);location.hash='#/practicar/juego';return true}
  return false;
}
/* ---------- mini reproductor ---------- */
function paintPlayer(){
  let p=$('#player');
  const on=SEQ.id||(TMR.id&&TMR.id!=='rt');
  if(!on||(SEQ.id&&OWNER==='rt')){if(p)p.remove();return}
  if(!p){p=document.createElement('div');p.id='player';p.className='player';document.body.appendChild(p)}
  const lab=SEQ.id?SEQ.label:'Temporizador';
  const t=TMR.id&&TMR.id!=='rt'?' · '+fmt(TMR.paused?TMR.paused/1000:(TMR.end-Date.now())/1000):'';
  const href=SEQ.id==='met'?(OWNER==='tool'?'#/practicar/metronomo':''):SEQ.id==='trk'?(OWNER==='tool'?'#/practicar/pistas':''):'';
  p.innerHTML=`<span class="dotlive"></span><span class="pl">${esc(lab+t)}</span>${href?`<a class="btn sm" href="${href}">Abrir</a>`:''}<button class="btn sm" data-pl="stop">${IC.stop}Detener</button>`;
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-pl="stop"]');if(b){seqStop();tmrStop();paintPlayer();paintEx()}});
/* ---------- vistas ---------- */
const greet=()=>{const h=new Date().getHours();return h<12?'Buenos días':h<19?'Buenas tardes':'Buenas noches'};
let DEFERRED=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();DEFERRED=e;if(location.hash===''||location.hash==='#/')route()});
const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
function viewHome(){
  const nx=nextEx(),[d,t]=doneCount();
  const inst=standalone()||DB.hideInstall?'':DEFERRED?`<div class="card install"><div><h3>Instala la app</h3><p class="cap" style="margin:4px 0 0">Ábrela desde tu pantalla de inicio y úsala sin internet.</p></div><div class="row"><button class="btn pri" data-h="install">${IC.down}Instalar</button><button class="btn sm" data-h="hideinst">Ahora no</button></div></div>`:isIOS?`<div class="card install"><div><h3>Instala la app en tu iPhone o iPad</h3><p class="cap" style="margin:4px 0 0">En Safari toca el botón Compartir y elige «Agregar a inicio».</p></div><button class="btn sm" data-h="hideinst">Entendido</button></div>`:'';
  return{title:'Mástil a la Vista',html:`
  <div class="lhead"><span class="eyebrow">${greet()}</span><h1>Tu práctica de hoy</h1></div>
  <div class="card" style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
    <div class="stat"><b>${streak()}</b><span>días de racha</span></div>
    <div class="stat"><b>${weekMins()}</b><span>min esta semana</span></div>
    <div class="stat"><b>${d}<small style="font-size:18px;color:var(--muted)">/${t}</small></b><span>ejercicios</span></div>
  </div>
  ${nx?`<a class="card tool" href="#/leccion/${nx.lesson}/${nx.id}"><span class="ic">${IC.play}</span><span style="flex:1;min-width:0"><b>Continuar: ${nx.t}</b><span>Lección ${nx.lesson} · ${LESSONS.find(l=>l.id===nx.lesson).title}</span></span></a>`:`<div class="card"><h3>Completaste todos los ejercicios</h3><p class="cap">Repite los que más te costaron con un tempo más alto.</p></div>`}
  <a class="card tool" href="#/practicar/rutina"><span class="ic">${IC.cal}</span><span><b>Rutina de 15 minutos</b><span>Calentamiento, mástil, lección e improvisación con temporizador.</span></span></a>
  ${inst}
  <div><p class="eyebrow" style="margin-bottom:10px">Herramientas</p><div class="grid2">${toolCards()}</div></div>
  <div class="card" style="display:flex;flex-direction:column;gap:12px">
    <div class="row" style="justify-content:space-between"><span class="cl" style="margin:0">Tema</span><div class="seg">${[['auto','Automático'],['dark','Oscuro'],['light','Claro']].map(([v,l])=>`<button data-theme-set="${v}" aria-pressed="${DB.theme===v}">${l}</button>`).join('')}</div></div>
    <div class="row" style="justify-content:space-between"><span class="cl" style="margin:0">Progreso guardado en este dispositivo</span><span id="rstw"><button class="btn sm" data-h="reset">Reiniciar progreso</button></span></div>
  </div>
  <p class="foot">Mástil a la Vista · funciona sin conexión</p>`,
  mount(r){
    r.addEventListener('click',async e=>{
      const th=e.target.closest('[data-theme-set]');if(th){DB.theme=th.dataset.themeSet;save();applyTheme();$$('[data-theme-set]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===th)));return}
      const b=e.target.closest('[data-h]');if(!b)return;const a=b.dataset.h;
      if(a==='install'&&DEFERRED){DEFERRED.prompt();try{await DEFERRED.userChoice}catch(_){}DEFERRED=null;route()}
      else if(a==='hideinst'){DB.hideInstall=true;save();route()}
      else if(a==='reset'){$('#rstw',r).innerHTML='<span class="row"><span class="cap" style="margin:0">¿Borrar todo?</span><button class="btn sm" data-h="reset-yes" style="border-color:var(--bad);color:var(--bad)">Sí, borrar</button><button class="btn sm" data-h="reset-no">Cancelar</button></span>'}
      else if(a==='reset-yes'){DB.done={};DB.secs={};DB.days={};DB.game={};DB.bpm={};save();route()}
      else if(a==='reset-no')route();
    });
  }};
}
const TOOLS=[['metronomo','Metrónomo','Tempo, compás, subdivisión y marcar tempo.',IC.play2],['afinador','Afinador','Afina con el micrófono o de oído.',IC.tuner],['juego','Juego del mástil','Encuentra notas contra reloj.',IC.game],['pistas','Pistas para improvisar','Rock, balada, cumbia y ranchera en cualquier tono.',IC.wave]];
const toolCards=()=>TOOLS.map(([k,n,d,ic])=>`<a class="card tool" href="#/practicar/${k}"><span class="ic">${ic}</span><span><b>${n}</b><span>${d}</span></span></a>`).join('');
function viewLessons(){
  return{title:'Lecciones',html:`<div class="lhead"><span class="eyebrow">11 lecciones · ${ALLEX.length} ejercicios</span><h1>Lecciones</h1><p class="sub">Cada lección se apoya en la anterior. Lee la idea, mira el mástil y haz los ejercicios con la guitarra en la mano.</p></div>
  ${PARTS2.map(p=>`<div class="list"><p class="eyebrow parth">Parte ${p.n} · ${p.t}</p>${p.m.map(i=>{const l=LESSONS.find(x=>x.id===i),[d,t]=doneCount(i);return`<a class="card lrow" href="#/leccion/${i}"><span class="mn ${d===t?'done':''}">${i}</span><span class="mt"><b>${l.title}</b><span>${l.sub}</span></span><span class="cnt">${d}/${t}</span></a>`}).join('')}</div>`).join('')}`};
}
function refreshProgress(){const el=$('#lprog');if(!el)return;const l=+el.dataset.l,[d,t]=doneCount(l);el.querySelector('i').style.width=(d/t*100)+'%';const c=$('#lcnt');if(c)c.textContent=`${d} de ${t} ejercicios hechos`}
function viewLesson(id,exId){
  const l=LESSONS.find(x=>x.id===id);if(!l)return viewLessons();
  DB.last=id;save();
  const ws=[];
  const body=l.blocks.map(b=>{
    if(b.w){ws.push(b);return`<div class="widget" data-wi="${ws.length-1}"></div>`}
    if(b.ex)return exCard(b.ex);
    if(b.sec)return`<div class="prose"><p class="blockh">${b.sec}</p><p>${b.p}</p></div>`;
    if(b.box)return`<div class="box"><p class="blockh">${b.box}</p>${b.ul?`<ul>${b.ul.map(t=>`<li>${t}</li>`).join('')}</ul>`:`<ol>${b.ol.map(t=>`<li>${t}</li>`).join('')}</ol>`}</div>`;
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
    $$('.widget[data-wi]',r).forEach(w=>mountWidget(w,ws[+w.dataset.wi]));
    paintEx(r);
    if(exId){const el=$('#ex-'+exId,r);if(el)setTimeout(()=>el.scrollIntoView({block:'start',behavior:'smooth'}),60)}
  }};
}
function viewPractice(){
  return{title:'Practicar',html:`<div class="lhead"><span class="eyebrow">Herramientas</span><h1>Practicar</h1></div>
  <a class="card tool" href="#/practicar/rutina"><span class="ic">${IC.cal}</span><span><b>Rutina diaria</b><span>10, 15 o 30 minutos guiados con temporizador.</span></span></a>
  <div class="grid2">${toolCards()}</div>`};
}
function viewReference(){
  const R=[['notas','Mapa de notas','Todas las notas del mástil, del traste 0 al 12.',IC.grid],['acordes','Acordes abiertos','26 acordes con digitación y sonido.',IC.book],['explorar','Explorador','Escalas, modos, acordes, CAGED y más en las 12 tonalidades.',IC.play2],['glosario','Glosario','Los términos de la teoría en idioma humano.',IC.book]];
  return{title:'Referencia',html:`<div class="lhead"><span class="eyebrow">Consulta rápida</span><h1>Referencia</h1></div><div class="grid2">${R.map(([k,n,d,ic])=>`<a class="card tool" href="#/referencia/${k}"><span class="ic">${ic}</span><span><b>${n}</b><span>${d}</span></span></a>`).join('')}</div>`};
}
let NOTENAT=0;
function viewNotes(){
  const board=()=>{const all=[];for(let s=1;s<=6;s++)for(let f=0;f<=12;f++){const pc=(OPEN_PC[s]+f)%12,nat=NATPC.includes(pc);if(NOTENAT&&!nat)continue;all.push({s,f,t:PCS[pc][0],k:nat?'note':'dim'})}return fretboard({dots:all,label:'Mapa de notas'})};
  return{title:'Mapa de notas',back:'#/referencia',html:`<div class="card"><div class="row" style="margin-bottom:12px"><div class="seg"><button data-n="0" aria-pressed="${!NOTENAT}">Las 12</button><button data-n="1" aria-pressed="${!!NOTENAT}">Solo naturales</button></div></div><div id="nb">${board()}</div><p class="cap">Toca cualquier nota para escucharla. Naturales en color; sostenidos en contorno.</p></div>`,
  mount(r){$$('[data-n]',r).forEach(b=>b.onclick=()=>{NOTENAT=+b.dataset.n;$$('[data-n]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('#nb',r).innerHTML=board()})}};
}
function viewChords(){return{title:'Acordes abiertos',back:'#/referencia',html:`<div class="widget" id="ocw"></div>`,mount(r){mountWidget($('#ocw',r),{w:'openchords'})}}}
const EXPL=[['scale','Escala mayor'],['mode','Modos'],['chord','Acordes'],['harm','Armonía'],['penta','Pentatónicas'],['caged','CAGED'],['intervals','Intervalos'],['circle','Círculo'],['prog','Progresiones']];
let EXSEL='scale';
function viewExplore(){
  return{title:'Explorador',back:'#/referencia',html:`<div class="chips" id="exs">${EXPL.map(([k,l])=>`<button class="chip" data-e="${k}" aria-pressed="${k===EXSEL}">${l}</button>`).join('')}</div><div class="widget" id="exw"></div>`,
  mount(r){
    const m=()=>{const spec=EXSEL==='chord'?{w:'chord',types:Object.keys(CT),init:{k:0,t:'maj'}}:{w:EXSEL};const h=$('#exw',r),n=h.cloneNode(false);h.replaceWith(n);mountWidget(n,spec)};
    $$('[data-e]',r).forEach(b=>b.onclick=()=>{EXSEL=b.dataset.e;$$('[data-e]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));m()});m();
  }};
}
function viewGlossary(){return{title:'Glosario',back:'#/referencia',html:`<div class="gl">${GLOS.map(g=>`<div><b>${g[0]}</b><span>${g[1]}</span></div>`).join('')}</div>`}}
/* ---------- enrutador ---------- */
const NAV=[['#/','Inicio',IC.home,''],['#/lecciones','Lecciones',IC.book,'leccion'],['#/practicar','Practicar',IC.play2,'practicar'],['#/referencia','Referencia',IC.grid,'referencia']];
let UNMOUNT=null;
function route(){
  const h=location.hash.replace(/^#\/?/,''),p=h.split('/');
  let v;
  if(!p[0])v=viewHome();
  else if(p[0]==='lecciones')v=viewLessons();
  else if(p[0]==='leccion')v=viewLesson(+p[1],p[2]);
  else if(p[0]==='practicar')v=({metronomo:viewMetronome,afinador:viewTuner,juego:viewGame,pistas:viewTracks,rutina:viewRoutine}[p[1]]||viewPractice)();
  else if(p[0]==='referencia')v=({notas:viewNotes,acordes:viewChords,explorar:viewExplore,glosario:viewGlossary}[p[1]]||viewReference)();
  else v=viewHome();
  if(UNMOUNT){try{UNMOUNT()}catch(e){}UNMOUNT=null}
  const sec=p[0]===''?'':p[0]==='lecciones'?'leccion':p[0];
  $$('[data-nav]').forEach(a=>{const on=a.dataset.nav===sec;if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
  $('#ttl').textContent=v.title;
  const bk=$('#back');bk.hidden=!v.back;if(v.back)bk.href=v.back;
  const pg=$('#page');pg.innerHTML=v.html;
  document.title=v.title==='Mástil a la Vista'?v.title:v.title+' · Mástil a la Vista';
  if(v.mount)UNMOUNT=v.mount(pg)||null;
  if(!(p[0]==='leccion'&&p[2]))window.scrollTo(0,0);
  paintPlayer();
}
/* ---------- clics globales ---------- */
document.addEventListener('click',e=>{
  const x=e.target.closest('[data-x]');if(x&&exAction(x))return;
  const dg=e.target.closest('.dg');
  if(dg&&dg.dataset.s&&!e.target.closest('#gamehost,#rtgame')){playNotes([OPEN_MIDI[+dg.dataset.s]+ +dg.dataset.f],'chord');return}
  const pl=e.target.closest('[data-play]');if(pl){playNotes(pl.dataset.play.split(',').map(Number),pl.dataset.mode,+pl.dataset.step||.5);return}
  const sq=e.target.closest('[data-seq]');if(sq){playSeq(sq.dataset.seq.split('|').map(c=>c.split('.').map(Number)),+sq.dataset.beat||1)}
});
/* ---------- arranque ---------- */
document.body.insertAdjacentHTML('afterbegin',`<div class="shell">
 <nav class="side" aria-label="Secciones"><div class="brand">${IC.pick}Mástil a la Vista</div>${NAV.map(([h,l,ic,k])=>`<a href="${h}" data-nav="${k}">${ic}${l}</a>`).join('')}</nav>
 <main><header class="topbar"><div class="in"><a class="icon-btn" id="back" href="#/" aria-label="Volver" hidden>${IC.back}</a><span class="ttl" id="ttl"></span></div></header><div class="page" id="page"></div></main>
</div>
<nav class="tabs" aria-label="Secciones">${NAV.map(([h,l,ic,k])=>`<a class="tab" href="${h}" data-nav="${k}">${ic}${l}</a>`).join('')}</nav>`);
window.addEventListener('hashchange',route);
route();
if('serviceWorker' in navigator&&location.protocol!=='file:'){window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{})})}
