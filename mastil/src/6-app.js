/* ---------- datos locales ---------- */
IC.levels=sv('<path d="M5 20v-6M10 20V9M15 20V5M20 20v-9"/>');
IC.note=sv('<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>');
const DBK='mastil-a-la-vista:v2';
let DB={done:{},secs:{},days:{},game:{},bpm:{},theme:'auto',last:1,met:80,meter:'4/4',sub:1};
try{Object.assign(DB,JSON.parse(localStorage.getItem(DBK)||'{}'))}catch(e){}
function persist(){try{localStorage.setItem(DBK,JSON.stringify(DB))}catch(e){}}
function save(){persist();if(checkAch())persist()}
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
LEFTY=!!DB.lefty;
/* ---------- temas: épocas y estilos del rock ---------- */
// orden de c: bg surface surface2 fg muted line accent accent-ink accent-text root root-ink good bad blue
const THEMES=[
 ['estudio','Estudio','Negro y azul eléctrico · como apps de audio',1,'#000000 #111114 #1b1b20 #f4f4f7 #8b8b95 #26262c #2f7bff #ffffff #5b9cff #ff4fa3 #fff #34d399 #ff453a #2f7bff','radial-gradient(ellipse at 85% -15%,rgba(47,123,255,.14),transparent 55%),radial-gradient(ellipse at 0% 0%,rgba(255,79,163,.06),transparent 45%)'],
 ['clasico','Grafito','El estándar · sobrio y oscuro',1,'#0b0b0c #161618 #1f1f22 #f5f5f7 #98989f #2c2c30 #ff9f0a #1a1000 #ffb340 #ff453a #fff #30d158 #ff453a #0a84ff','radial-gradient(ellipse at 70% -20%,rgba(255,159,10,.07),transparent 60%)'],
 ['claro','Aluminio','Claro y limpio',0,'#f5f5f7 #ffffff #ebebf0 #1d1d1f #6e6e73 #d9d9de #ff9500 #ffffff #b85f00 #d70015 #fff #248a3d #d70015 #0071e3','none'],
 ['rocknroll','Rock and Roll','Años 50 · rocola y cromo',0,'#f6efe0 #fffaf0 #f1e0c8 #1d1a24 #6b6270 #e2cfb3 #d7263d #fff #b0182c #0f8b8d #fff #2b8559 #c0392b #2f7cae','repeating-linear-gradient(45deg,rgba(215,38,61,.045) 0 16px,transparent 16px 32px)'],
 ['psico','Psicodelia','Años 60 · color y fuzz',1,'#1a0b2e #26123f #341a56 #fdeee0 #c3a6d9 #4a2a70 #ff8a1f #200a00 #ffa64d #ff3d9a #fff #9be15d #ff5c7a #5ee0e6','radial-gradient(circle at 12% 8%,rgba(255,61,154,.24),transparent 45%),radial-gradient(circle at 92% 30%,rgba(255,138,31,.2),transparent 42%),radial-gradient(circle at 50% 105%,rgba(94,224,230,.16),transparent 50%)'],
 ['estadio','Rock de estadio','Años 70 · oro y reflectores',1,'#0d0b08 #17140f #221d15 #f5ecd8 #a8987a #3a3122 #d4a537 #1a1205 #e6bb55 #c8452c #fff #7fb069 #d9583b #7aa7c7','radial-gradient(ellipse at 50% -20%,rgba(255,226,150,.2),transparent 50%),linear-gradient(180deg,rgba(212,165,55,.06),transparent 40%)'],
 ['punk','Punk','1977 · fotocopia y alfileres',1,'#0b0b0b #161616 #222222 #fafafa #a0a0a0 #333333 #ff2d95 #120008 #ff5cab #f5e400 #111 #39e07a #ff4040 #29c5f6','repeating-linear-gradient(-45deg,rgba(255,255,255,.03) 0 2px,transparent 2px 10px)'],
 ['metal','Heavy Metal','Años 80 · cromo y fuego',1,'#08090b #121419 #1b1f27 #e8ebf0 #8e96a5 #2b313d #c9ced8 #0b0d12 #dfe4ec #d3122c #fff #4fbf7f #e0263f #5b8fd6','linear-gradient(160deg,rgba(255,255,255,.06),transparent 30%),radial-gradient(ellipse at 50% 115%,rgba(211,18,44,.26),transparent 55%)'],
 ['synth','Synthwave','Años 80 · neón y sintes',1,'#0f0624 #1a0c3a #251450 #f7ecff #b39ad6 #3d2470 #ff3ea5 #1b0016 #ff6fbf #2de2e6 #04121a #6dfcb0 #ff5470 #7b8cff','linear-gradient(180deg,transparent 55%,rgba(255,62,165,.18)),repeating-linear-gradient(0deg,rgba(45,226,230,.06) 0 1px,transparent 1px 36px)'],
 ['rockmx','Rock mexicano','Años 80-90 · rock en tu idioma',1,'#0e0c0c #1a1615 #251f1d #f4ede6 #a89a90 #3a302c #e23b3b #fff #ff6a5f #21a66a #fff #5fd39a #ff5a4f #6aa8d8','linear-gradient(90deg,rgba(33,166,106,.12),transparent 28%,transparent 72%,rgba(226,59,59,.12))'],
 ['grunge','Grunge','Años 90 · franela y distorsión',1,'#16140f #201d16 #2b271d #ece4d2 #a69c85 #3d3729 #d06a3a #170a03 #e08155 #8fae45 #0f1405 #6fae7c #d9483b #6a95a8','repeating-linear-gradient(90deg,rgba(208,106,58,.05) 0 26px,transparent 26px 52px),repeating-linear-gradient(0deg,rgba(208,106,58,.05) 0 26px,transparent 26px 52px)'],
 ['blues','Blues y jazz','Club de medianoche',1,'#0a1424 #11203a #182b4c #eef2f8 #94a6c4 #243a60 #c9a24a #161003 #dcb85e #e05a4f #fff #5fbf8f #e05a4f #6fb2ff','radial-gradient(ellipse at 50% -10%,rgba(201,162,74,.22),transparent 55%)'],
 ['surf','Surf rock','Playa, reverb y sol',0,'#e9f6f4 #f9fffd #d3ece8 #0f2b33 #4d6b72 #b7dad5 #ff6b4a #2a0800 #c7402a #0a8f9c #fff #2b8a57 #c7402a #2875b8','radial-gradient(circle at 100% 0,rgba(255,107,74,.2),transparent 42%),radial-gradient(circle at 0 100%,rgba(10,143,156,.14),transparent 45%)'],
 ['indie','Indie','Años 2000 · cuarto de ensayo',0,'#f3eef7 #fffcff #e7dff0 #2a2433 #6d6479 #d8cde3 #7c5cff #fff #5b3fd6 #ff7a59 #fff #2e9e6a #d6453a #2f86c9','radial-gradient(circle at 85% 5%,rgba(124,92,255,.16),transparent 45%),radial-gradient(circle at 5% 95%,rgba(255,122,89,.12),transparent 45%)'],
];
const TVARS='bg surface surface2 fg muted line accent accent-ink accent-text root root-ink good bad blue'.split(' ');
const themeById=id=>THEMES.find(t=>t[0]===id);
if(DB.theme==='dark')DB.theme='clasico';else if(DB.theme==='light')DB.theme='claro';
document.head.insertAdjacentHTML('beforeend','<style>'+THEMES.map(([id,,,dark,c,art])=>{
  const v=c.split(' ');
  return`:root[data-theme="${id}"]{${TVARS.map((k,i)=>`--${k}:${v[i]}`).join(';')};--art:${art};--artimg:${ARTURL[id]||'none'};--arto:${dark?.62:.75};--glass:color-mix(in srgb,${v[0]} 80%,transparent);color-scheme:${dark?'dark':'light'}}`;
}).join('')+'</style>');
function applyTheme(){
  const id=DB.theme!=='auto'&&themeById(DB.theme)?DB.theme:matchMedia('(prefers-color-scheme: light)').matches?'claro':'estudio';
  document.documentElement.setAttribute('data-theme',id);document.documentElement.classList.toggle('arty',!!ARTURL[id]);
  if(!document.getElementById('artbg'))document.body.insertAdjacentHTML('afterbegin','<div id="artbg" aria-hidden="true"></div>');
  $$('meta[name="theme-color"]').forEach(m=>{m.removeAttribute('media');m.content=themeById(id)[4].split(' ')[0]});
}
matchMedia('(prefers-color-scheme: light)').addEventListener('change',()=>{if(DB.theme==='auto')applyTheme()});
applyTheme();
const ICPAL='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.7-1.6 1.6-1.6H16a5 5 0 0 0 5-5C21 6.6 17 3 12 3z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="10.5" cy="7.2" r="1.2"/><circle cx="15" cy="7.5" r="1.2"/></svg>';
const ICOK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const themeName=()=>DB.theme==='auto'||!themeById(DB.theme)?'Automático':themeById(DB.theme)[1];
// portada de cada tema: su arte (o su luz de fondo) con una tarjetita que muestra cómo se ve la app
function themeCards(ids){
  const cov=(id,n,era,c,art)=>{const v=c.split(' ');return`<button class="thc" data-theme-set="${id}" aria-pressed="${DB.theme===id}">
    <span class="cov" style="--cb:${v[0]};--cs:${v[1]};--cf:${v[3]};--cm:${v[4]};--ca:${v[6]};--cimg:${ARTURL[id]||art.replace(/"/g,"'")}"><span class="mock"><i></i><span><i></i><i></i></span><b></b></span><span class="ck">${ICOK}</span></span>
    <b>${n}</b><small>${era}</small></button>`};
  return ids.map(id=>{if(id==='auto')return cov('auto','Automático','Oscuro o claro según tu teléfono',themeById('estudio')[4],'linear-gradient(115deg,#000 50%,#f5f5f7 50%)');const t=themeById(id);return cov(t[0],t[1],t[2],t[4],t[5])}).join('');
}
function viewLook(){
  const eras=THEMES.map(t=>t[0]).filter(id=>id!=='clasico'&&id!=='claro'&&id!=='estudio');
  return{title:'Apariencia',back:'#/',html:`<div class="lhead"><span class="eyebrow">Tema</span><h1>Apariencia</h1><p class="sub">Los colores y la luz de fondo de toda la app. Se aplica al instante.</p></div>
  <section class="thsec"><p class="blockh">Básicos</p><div class="thcgrid">${themeCards(['auto','estudio','clasico','claro'])}</div></section>
  <section class="thsec"><p class="blockh">Épocas del rock</p><div class="thcgrid">${themeCards(eras)}</div></section>`,
  mount(r){r.addEventListener('click',e=>{const th=e.target.closest('[data-theme-set]');if(!th)return;DB.theme=th.dataset.themeSet;DB.tried=DB.tried||{};DB.tried[DB.theme]=1;save();applyTheme();$$('[data-theme-set]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===th)))})}};
}
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
   ${x.fig?figHTML(x):''}
   <ol>${x.steps.map(s=>`<li>${s}</li>`).join('')}</ol>
   <p class="goal"><b>Lo logras cuando:</b> ${x.goal}</p>
   ${x.track?`<p class="cap" style="margin:0">Pista: <b>${PROG2[x.track.p].n}</b> en ${KEYS[x.track.k].es} · ${STYLES[x.track.st].n} · <span data-x="trkcur" data-id="${x.id}"></span></p>`:''}
   <div class="exbar">
    ${x.bpm?`<span class="minimet"><button class="icon-btn" data-x="bpm" data-d="-5" data-id="${x.id}" aria-label="Bajar tempo">${IC.minus}</button><span class="v" data-x="bpmv" data-id="${x.id}">${bpm} bpm</span><button class="icon-btn" data-x="bpm" data-d="5" data-id="${x.id}" aria-label="Subir tempo">${IC.plus}</button><button class="btn sm" data-x="met" data-id="${x.id}"></button><span class="bd" data-bd="${x.id}" aria-hidden="true"></span></span>`:''}
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
  if(k==='met'){if(SEQ.id==='met'&&OWNER==='ex:'+id)seqStop();else{OWNER='ex:'+id;metStart({bpm:DB.bpm[id]||x.bpm,meter:'4/4',sub:1},(bt,isB)=>{if(!isB)return;const d=document.querySelector(`[data-bd="${id}"]`);if(!d)return;d.classList.toggle('acc',bt===0);d.classList.add('on');setTimeout(()=>d.classList.remove('on'),110)})}paintEx();return true}
  if(k==='bpm'){const v=Math.max(30,Math.min(240,(DB.bpm[id]||x.bpm)+ +b.dataset.d));DB.bpm[id]=v;save();if(SEQ.id==='met'&&OWNER==='ex:'+id){MET.bpm=v;SEQ.label='Metrónomo '+v;emitState()}paintEx();paintFig();return true}
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
  if(!on||(SEQ.id&&OWNER==='rt')||(SEQ.id==='kar'&&/^#\/cancionero\/ver/.test(location.hash))){if(p)p.remove();return}
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
// repisa de canciones: las tuyas primero y luego una famosa de cada género (con su portada)
function songShelf(){
  const mine=(DB.songs||[]).slice(0,8).map(s=>{const P=songParse(s.src);return{h:'#/cancionero/ver/'+s.id,t:P.title,a:P.artist}});
  const seen={},top=TOPLIST.filter(x=>!seen[x.g]&&(seen[x.g]=1)).map(x=>{const has=(DB.songs||[]).find(s=>s.top===x.id);return{h:'#/cancionero/ver/'+(has?has.id:x.id),t:x.t,a:x.a}});
  return[...mine,...top].slice(0,14).map(x=>`<a class="alb" href="${x.h}"><span class="acov">${coverHTML(x.t,x.a)}</span><b>${esc(x.t)}</b><small>${esc(x.a||'Tu canción')}</small></a>`).join('');
}
function viewHome(){
  const nx=nextEx(),[d,t]=doneCount();
  const inst=standalone()||DB.hideInstall?'':DEFERRED?`<div class="card install"><div><h3>Instala la app</h3><p class="cap" style="margin:4px 0 0">Ábrela desde tu pantalla de inicio y úsala sin internet.</p></div><div class="row"><button class="btn pri" data-h="install">${IC.down}Instalar</button><button class="btn sm" data-h="hideinst">Ahora no</button></div></div>`:isIOS?`<div class="card install"><div><h3>Instala la app en tu iPhone o iPad</h3><p class="cap" style="margin:4px 0 0">En Safari toca el botón Compartir y elige «Agregar a inicio».</p></div><button class="btn sm" data-h="hideinst">Entendido</button></div>`:'';
  return{title:'Roka Guitar for All',html:`
  <div class="brandhero"><span class="logo">${logo()}</span><div><span class="eyebrow">${greet()}</span><h1 class="glow">Tu práctica de hoy</h1></div></div>
  <div class="card" style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
    <div class="stat"><b>${streak()}</b><span>días de racha</span></div>
    <div class="stat"><b>${weekMins()}</b><span>min esta semana</span></div>
    <div class="stat"><b>${d}<small style="font-size:18px;color:var(--muted)">/${t}</small></b><span>ejercicios</span></div>
  </div>
  ${planCard()}
  ${nx?(()=>{const[ld,lt]=doneCount(nx.lesson);return`<a class="card nowp" href="#/leccion/${nx.lesson}/${nx.id}"><span class="acov">${lessonArt(nx.lesson)}</span><span class="np"><span class="eyebrow">Continúa donde te quedaste</span><b>${nx.t}</b><small>Lección ${nx.lesson} · ${LESSONS.find(l=>l.id===nx.lesson).title}</small><span class="pg"><i style="width:${Math.round(ld/lt*100)}%"></i></span></span><span class="playc">${IC.play}</span></a>`})():`<div class="card"><h3>Completaste todos los ejercicios</h3><p class="cap">Repite los que más te costaron con un tempo más alto.</p></div>`}
  <section><div class="sech"><h2>Lecciones</h2><a href="#/lecciones">Ver todas</a></div><div class="shelf">${LESSONS.map(l=>lessonAlb(l.id)).join('')}</div></section>
  <section><div class="sech"><h2>Para tocar</h2><a href="#/cancionero">Cancionero</a></div><div class="shelf">${songShelf()}</div></section>
  <a class="card cta" href="#/practicar/reto"><span><span class="eyebrow">Nuevo · modo reto</span><b>Sube al escenario</b><span>Notas que bajan por el mástil, combos y estrellas. Con toques o con tu guitarra real.</span></span><span class="ic">${IC.levels}</span></a>
  <div class="grid2"><a class="card tool" href="#/practicar/rutina"><span class="ic">${IC.cal}</span><span><b>Rutina de 15 minutos</b><span>Calentamiento, mástil, lección e improvisación.</span></span></a>
  <a class="card tool" href="#/logros"><span class="ic">${achIcon('award')}</span><span><b>Logros · ${ACH.filter(a=>(DB.ach||{})[a[0]]).length} de ${ACH.length}</b><span>Rachas, récords y retos superados.</span></span></a></div>
  ${inst}
  ${reminderCard()}
  ${cloudCard()}
  <div><p class="eyebrow" style="margin-bottom:10px">Herramientas</p><div class="grid2">${toolCards()}</div></div>
  <a class="card tool look" href="#/apariencia"><span class="ic">${ICPAL}</span><span><b>Apariencia</b><span>Tema: ${themeName()}</span></span></a>
  <div class="card" style="display:flex;flex-direction:column;gap:12px">
    <div class="row" style="justify-content:space-between"><span class="cl" style="margin:0">Mano</span><div class="seg">${[[0,'Diestro'],[1,'Zurdo']].map(([v,l])=>`<button data-lefty="${v}" aria-pressed="${!!DB.lefty===!!v}">${l}</button>`).join('')}</div></div>
    <div class="row" style="justify-content:space-between"><span class="cl" style="margin:0">Respaldo · llévate tu progreso a otro teléfono</span><span class="row"><button class="btn sm" data-h="bk-copy">${IC.down}Copiar código</button><button class="btn sm" data-h="bk-paste">Pegar código</button></span></div>
    <div id="bkw" hidden><textarea id="bkt" rows="3" placeholder="Pega aquí el código que copiaste en tu otro dispositivo"></textarea><div class="row" style="margin-top:8px"><button class="btn sm pri" data-h="bk-load">Restaurar progreso</button><span class="cap" id="bkm" style="margin:0"></span></div></div>
    <div class="row" style="justify-content:space-between"><span class="cl" style="margin:0">Progreso guardado en este dispositivo</span><span id="rstw"><button class="btn sm" data-h="reset">Reiniciar progreso</button></span></div>
  </div>
  <p class="foot">Roka Guitar for All · funciona sin conexión<br>Guitarra y bajo grabados: tonejs-instruments de Nicholaus Brosowsky (licencia CC BY 3.0)</p>`,
  mount(r){
    coverWatch(r);
    if(DB.onb==null)setTimeout(()=>{if(DB.onb==null&&(!location.hash||location.hash==='#/'))onboardShow()},400);
    r.addEventListener('click',async e=>{
      const lf=e.target.closest('[data-lefty]');if(lf){DB.lefty=lf.dataset.lefty==='1';LEFTY=DB.lefty;save();$$('[data-lefty]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===lf)));return}
      const th=e.target.closest('[data-theme-set]');if(th){DB.theme=th.dataset.themeSet;DB.tried=DB.tried||{};DB.tried[DB.theme]=1;save();applyTheme();$$('[data-theme-set]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===th)));return}
      const b=e.target.closest('[data-h]');if(!b)return;const a=b.dataset.h;
      if(a==='install'&&DEFERRED){DEFERRED.prompt();try{await DEFERRED.userChoice}catch(_){}DEFERRED=null;route()}
      else if(a==='hideinst'){DB.hideInstall=true;save();route()}
      else if(a==='reset'){$('#rstw',r).innerHTML='<span class="row"><span class="cap" style="margin:0">¿Borrar todo?</span><button class="btn sm" data-h="reset-yes" style="border-color:var(--bad);color:var(--bad)">Sí, borrar</button><button class="btn sm" data-h="reset-no">Cancelar</button></span>'}
      else if(a==='reset-yes'){DB.done={};DB.secs={};DB.days={};DB.game={};DB.bpm={};DB.reto={};DB.ach={};save();route()}
      else if(a==='reset-no')route();
      else if(a==='bk-copy'){const c=backupCode();try{await navigator.clipboard.writeText(c);toast(logo()+'<span>Código copiado. Pégalo en tu otro dispositivo.</span>')}catch(_){$('#bkw',r).hidden=false;$('#bkt',r).value=c;$('#bkm',r).textContent='Copia este código a mano.'}}
      else if(a==='bk-paste'){$('#bkw',r).hidden=false;$('#bkt',r).value='';$('#bkt',r).focus()}
      else if(a==='bk-load'){if(restoreCode($('#bkt',r).value)){toast(logo()+'<span>Progreso restaurado</span>');route()}else $('#bkm',r).textContent='Ese código no es válido. Revisa que esté completo.'}
    });
  }};
}
const TOOLS=[['lento','Cámara lenta','Tu canción más lenta, sin cambiar el tono, con repetición A-B.',IC.timer],['reto','Modo reto','Toca canciones con notas que caen.',IC.levels],['grabar','Grabadora','Grábate y escúchate.',IC.wave],['metronomo','Metrónomo','Tempo, compás, subdivisión y marcar tempo.',IC.play2],['afinador','Afinador','Afina con el micrófono o de oído.',IC.tuner],['juego','Juego del mástil','Encuentra notas contra reloj.',IC.game],['pistas','Pistas para improvisar','Rock, balada, cumbia y ranchera en cualquier tono.',IC.wave]];
const toolCards=()=>TOOLS.map(([k,n,d,ic])=>`<a class="card tool" href="#/practicar/${k}"><span class="ic">${ic}</span><span><b>${n}</b><span>${d}</span></span></a>`).join('');
/* ---------- portadas tipo disco para lecciones y herramientas ----------
   Abstractas (luz difusa + un trazo del tema de la lección + el número), sin dibujos ni fotos. */
const PARTHUE={1:218,2:262,3:328,4:26};
const ARTM={
  1:'<path d="M14 30h72M14 40h72M14 50h72M14 60h72M14 70h72M14 80h72"/><path d="M30 26v58M48 26v58M64 26v58M78 26v58" stroke-opacity=".35"/>',
  2:'<circle cx="28" cy="62" r="5" fill="#fff" stroke="none"/><circle cx="74" cy="34" r="5" fill="#fff" stroke="none"/><path d="M28 62C30 30 60 22 74 34"/>',
  3:'<path d="M14 82h12v-9h12v-9h12v-6h12v-9h12v-9h12v-6"/>',
  4:'<circle cx="50" cy="48" r="10"/><circle cx="50" cy="48" r="18"/><circle cx="50" cy="48" r="26" stroke-dasharray="3 5"/><circle cx="50" cy="48" r="34" stroke-opacity=".4"/>',
  5:'<circle cx="50" cy="66" r="10"/><circle cx="50" cy="46" r="10"/><circle cx="50" cy="26" r="10"/>',
  6:'<circle cx="50" cy="72" r="8"/><circle cx="50" cy="55" r="8"/><circle cx="50" cy="38" r="8"/><circle cx="50" cy="21" r="8" fill="#fff" fill-opacity=".35"/>',
  7:'<rect x="12" y="30" width="26" height="40" rx="6"/><rect x="28" y="26" width="26" height="40" rx="6"/><rect x="44" y="30" width="26" height="40" rx="6"/><rect x="60" y="26" width="26" height="40" rx="6" stroke-opacity=".5"/>',
  8:'<path d="M22 76V44M40 76V30M58 76V52M76 76V36" stroke-width="6" stroke-linecap="round"/>',
  9:[...Array(12)].map((_,k)=>{const a=k/12*2*Math.PI-Math.PI/2;return`<circle cx="${(50+30*Math.cos(a)).toFixed(1)}" cy="${(46+30*Math.sin(a)).toFixed(1)}" r="${k?3:5}" fill="#fff" fill-opacity="${k?.6:1}" stroke="none"/>`}).join('')+'<circle cx="50" cy="46" r="30" stroke-opacity=".3"/>',
  10:'<path d="M8 52c8-18 14-18 20 0s12 18 20 0 14-26 22-8 10 22 22 4"/>',
  11:'<path d="M50 30v32"/><path d="M38 38c-6 6-6 18 0 24M62 38c6 6 6 18 0 24M28 30c-12 12-12 36 0 48M72 30c12 12 12 36 0 48" stroke-opacity=".6"/>'
};
function coverArt(h,motif,label,uid){
  const h2=(h+44)%360,g='ca'+uid;
  return`<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><radialGradient id="${g}a" cx=".22" cy=".18" r=".95"><stop offset="0" stop-color="hsl(${h} 88% 62%)"/><stop offset=".55" stop-color="hsl(${h} 62% 30%)"/><stop offset="1" stop-color="hsl(${h} 55% 12%)"/></radialGradient><radialGradient id="${g}b" cx=".92" cy=".96" r=".75"><stop offset="0" stop-color="hsl(${h2} 92% 62% / .9)"/><stop offset="1" stop-color="hsl(${h2} 92% 50% / 0)"/></radialGradient></defs>
  <rect width="100" height="100" fill="url(#${g}a)"/><rect width="100" height="100" fill="url(#${g}b)"/>
  <g transform="translate(18 -2) scale(.8)" fill="none" stroke="#fff" stroke-width="2" stroke-opacity=".8" stroke-linecap="round" stroke-linejoin="round">${motif||''}</g>
  ${label!=null?`<text x="8" y="93" font-size="30" font-weight="800" fill="#fff" font-family="system-ui,-apple-system,Segoe UI,sans-serif" letter-spacing="-1">${label}</text>`:''}</svg>`;
}
const lessonArt=i=>{const l=LESSONS.find(x=>x.id===i);return coverArt(PARTHUE[l.part]||218,ARTM[i],i,'l'+i)};
// tarjeta de disco: portada, título en dos renglones, subtítulo y avance
function albCard(href,art,title,sub,pct,done){
  return`<a class="alb${done?' done':''}" href="${href}"><span class="acov">${art}${done?`<span class="aok">${IC.check}</span>`:''}</span><b>${title}</b><small>${sub}</small>${pct!=null?`<span class="pg"><i style="width:${Math.round(pct*100)}%"></i></span>`:''}</a>`;
}
const lessonAlb=i=>{const l=LESSONS.find(x=>x.id===i),[d,t]=doneCount(i);return albCard(`#/leccion/${i}`,lessonArt(i),l.title,`${d} de ${t} · ${l.sub}`,d/t,d===t)};
function viewLessons(){
  return{title:'Lecciones',html:`<div class="lhead"><span class="eyebrow">11 lecciones · ${ALLEX.length} ejercicios</span><h1>Lecciones</h1><p class="sub">Cada lección se apoya en la anterior. Lee la idea, mira el mástil y haz los ejercicios con la guitarra en la mano.</p></div>
  ${PARTS2.map(p=>`<section class="albsec"><div class="sech"><h2>Parte ${p.n} · ${p.t}</h2></div><div class="albs">${p.m.map(lessonAlb).join('')}</div></section>`).join('')}`};
}
function refreshProgress(){const el=$('#lprog');if(!el)return;const l=+el.dataset.l,[d,t]=doneCount(l);el.querySelector('i').style.width=(d/t*100)+'%';const c=$('#lcnt');if(c)c.textContent=`${d} de ${t} ejercicios hechos`}
function viewLesson(id,exId){
  const l=LESSONS.find(x=>x.id===id);if(!l)return viewLessons();
  DB.last=id;save();
  const ws=[];
  const body=l.blocks.map((b,bi)=>blockHTML(b,ws).replace(/^(\s*<\w+)/,`$1 data-nb="${bi}"`)).join('');
  const prev=LESSONS.find(x=>x.id===id-1),next=LESSONS.find(x=>x.id===id+1),[d,t]=doneCount(id);
  return{title:'Lección '+id,back:'#/lecciones',html:`
  <div class="lhead"><div class="lhero"><span class="acov">${lessonArt(id)}</span><div><span class="eyebrow">Lección ${id} · Parte ${l.part}</span><h1>${l.title}</h1></div></div><p class="lead">${l.lead}</p>
  ${HAS_TTS?`<div><button class="btn pri" data-narr="start" data-l="${id}">${IC.voice}Escuchar la lección</button></div>`:''}
  <div><div class="bar" id="lprog" data-l="${id}"><i style="width:${d/t*100}%"></i></div><p class="cap" id="lcnt" style="margin-top:6px">${d} de ${t} ejercicios hechos</p></div></div>
  ${body}
  <div class="row" style="justify-content:space-between">${prev?`<a class="btn" href="#/leccion/${prev.id}">${IC.back}Lección ${prev.id}</a>`:'<span></span>'}${next?`<a class="btn pri" href="#/leccion/${next.id}">Lección ${next.id}</a>`:''}</div>`,
  mount(r){
    $$('.widget[data-wi]',r).forEach(w=>mountWidget(w,ws[+w.dataset.wi]));
    paintEx(r);paintFig(r);paintNarr();
    if(exId){const el=$('#ex-'+exId,r);if(el)setTimeout(()=>el.scrollIntoView({block:'start',behavior:'smooth'}),60)}
    return()=>narrStop(true);
  }};
}
function blockHTML(b,ws){
  if(b.w){ws.push(b);return`<div class="widget" data-wi="${ws.length-1}"></div>`}
  if(b.ex)return exCard(b.ex);
  if(b.sec)return`<div class="prose"><p class="blockh">${b.sec}</p><p>${b.p}</p></div>`;
  if(b.box)return`<div class="box"><p class="blockh">${b.box}</p>${b.ul?`<ul>${b.ul.map(t=>`<li>${t}</li>`).join('')}</ul>`:`<ol>${b.ol.map(t=>`<li>${t}</li>`).join('')}</ol>`}</div>`;
  if(b.trick)return`<div class="box trick"><p class="blockh">Hoja de trucos</p><ul>${b.trick.map(t=>`<li>${t}</li>`).join('')}</ul></div>`;
  if(b.p)return`<p class="prose">${b.p}</p>`;
  return'<div></div>';
}
function viewPractice(){
  return{title:'Practicar',html:`<div class="lhead"><span class="eyebrow">Herramientas</span><h1>Practicar</h1></div>
  <a class="card nowp" href="#/practicar/rutina"><span class="acov">${coverArt(205,'<circle cx="50" cy="46" r="26"/><path d="M50 30v16l11 7"/>',null,'rt')}</span><span class="np"><span class="eyebrow">Rutina diaria</span><b>10, 15 o 30 minutos</b><small>Calentamiento, mástil, lección e improvisación con temporizador.</small></span><span class="playc">${IC.play}</span></a>
  <div class="grid2">${toolCards()}</div>
  <a class="card tool" href="#/logros"><span class="ic">${achIcon('award')}</span><span><b>Logros</b><span>${ACH.filter(a=>(DB.ach||{})[a[0]]).length} de ${ACH.length} desbloqueados.</span></span></a>`};
}
function viewReference(){
  const R=[['canciones','Canciones','Progresiones famosas para tocar con pista.',IC.wave],['notas','Mapa de notas','Todas las notas del mástil, del traste 0 al 12.',IC.grid],['acordes','Acordes abiertos','26 acordes con digitación y sonido.',IC.book],['explorar','Explorador','Escalas, modos, acordes, CAGED y más en las 12 tonalidades.',IC.play2],['glosario','Glosario','Los términos de la teoría en idioma humano.',IC.book]];
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
const NAV=[['#/','Inicio',IC.home,''],['#/lecciones','Lecciones',IC.book,'leccion'],['#/practicar','Practicar',IC.play2,'practicar'],['#/cancionero','Canciones',IC.note,'cancionero'],['#/referencia','Referencia',IC.grid,'referencia']];
let UNMOUNT=null;
function route(){
  const h=location.hash.replace(/^#\/?/,''),p=h.split('/');
  let v;
  if(!p[0])v=viewHome();
  else if(p[0]==='lecciones')v=viewLessons();
  else if(p[0]==='leccion')v=viewLesson(+p[1],p[2]);
  else if(p[0]==='cuenta')v=viewAccount();
  else if(p[0]==='apariencia')v=viewLook();
  else if(p[0]==='practicar')v=({metronomo:viewMetronome,afinador:viewTuner,juego:viewGame,pistas:viewTracks,rutina:viewRoutine,reto:viewReto,grabar:viewRecorder,lento:viewSlow}[p[1]]||viewPractice)();
  else if(p[0]==='logros')v=viewAch();
  else if(p[0]==='cancionero')v=p[1]==='ver'?viewSongPlay(p[2]||'',p[3]==='lento'):p[1]==='editar'?viewSongEdit(p[2]||'nueva'):viewSongbook();
  else if(p[0]==='referencia')v=({canciones:viewSongs,notas:viewNotes,acordes:viewChords,explorar:viewExplore,glosario:viewGlossary}[p[1]]||viewReference)();
  else v=viewHome();
  if(UNMOUNT){try{UNMOUNT()}catch(e){}UNMOUNT=null}
  if(SEQ.id==='fig')seqStop();
  const sec=p[0]===''?'':p[0]==='lecciones'?'leccion':p[0]==='logros'?'practicar':p[0];
  $$('[data-nav]').forEach(a=>{const on=a.dataset.nav===sec;if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
  $('#ttl').textContent=v.title;
  const bk=$('#back');bk.hidden=!v.back;if(v.back)bk.href=v.back;
  // página nueva en cada vista: así no se acumulan los clics de vistas anteriores
  const old=$('#page'),pg=old.cloneNode(false);old.replaceWith(pg);pg.innerHTML=v.html;
  document.title=v.title==='Roka Guitar for All'?v.title:v.title+' · Roka Guitar for All';
  if(v.mount)UNMOUNT=v.mount(pg)||null;
  if(!(p[0]==='leccion'&&p[2]))window.scrollTo(0,0);
  paintPlayer();
}
/* ---------- clics globales ---------- */
document.addEventListener('click',e=>{
  const x=e.target.closest('[data-x]');if(x&&exAction(x))return;
  const dg=e.target.closest('.dg');
  if(dg&&dg.dataset.s&&!e.target.closest('#gamehost,#rtgame')){playNotes([OPEN_MIDI[+dg.dataset.s]+ +dg.dataset.f],'chord');return}
  const pl=e.target.closest('[data-play]');if(pl){const L=pl.dataset.play.split(',').map(Number),st=+pl.dataset.step||.5;playNotes(L,pl.dataset.mode,st);lightSequence(pl,L,pl.dataset.mode,st);return}
  const sq=e.target.closest('[data-seq]');if(sq){playSeq(sq.dataset.seq.split('|').map(c=>c.split('.').map(Number)),+sq.dataset.beat||1)}
});
/* ---------- arranque ---------- */
document.body.insertAdjacentHTML('afterbegin',`<div class="shell">
 <nav class="side" aria-label="Secciones"><div class="brand"><span class="logo">${logo()}</span>Roka<br>Guitar for All</div>${NAV.map(([h,l,ic,k])=>`<a href="${h}" data-nav="${k}">${ic}${l}</a>`).join('')}</nav>
 <main><header class="topbar"><div class="in"><a class="icon-btn" id="back" href="#/" aria-label="Volver" hidden>${IC.back}</a><span class="ttl" id="ttl"></span></div></header><div class="page" id="page"></div></main>
</div>
<nav class="tabs" aria-label="Secciones">${NAV.map(([h,l,ic,k])=>`<a class="tab" href="${h}" data-nav="${k}">${ic}${l}</a>`).join('')}</nav>`);
checkAch(true);persist();
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
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!hadCtl){hadCtl=true;return}if(!SEQ.id&&!TMR.id)location.reload();else showUpdate()});
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(reg=>{
      const chk=()=>reg.update().catch(()=>{});
      document.addEventListener('visibilitychange',()=>{if(!document.hidden)chk()});
      setInterval(chk,30*60*1000);chk();
    }).catch(()=>{});
  });
}
