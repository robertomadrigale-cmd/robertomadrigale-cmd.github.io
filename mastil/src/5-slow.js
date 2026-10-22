/* ---------- cámara lenta: tu canción más lenta sin cambiar el tono, con repetición A-B ---------- */
const SL={a:null,b:null,loop:false,raf:null,url:null,name:''};
const fmt1=t=>{t=Math.max(0,t||0);return Math.floor(t/60)+':'+(t%60).toFixed(1).padStart(4,'0')};
function slowIDB(){return new Promise((res,rej)=>{const r=indexedDB.open('roka-lento',1);r.onupgradeneeded=()=>r.result.createObjectStore('f');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function slowSave(file){try{const db=await slowIDB();db.transaction('f','readwrite').objectStore('f').put({blob:file,name:file.name},'ultima')}catch(e){}}
async function slowLoad(){try{const db=await slowIDB();return await new Promise(res=>{const q=db.transaction('f').objectStore('f').get('ultima');q.onsuccess=()=>res(q.result||null);q.onerror=()=>res(null)})}catch(e){return null}}
const slSrc=()=>DB.slowSrc||'canc',slGroup=()=>DB.slowGroup||((DB.songs||[]).length?'mine':'trad');
function viewSlow(){
  const rate=DB.slowRate||.75;
  return{title:'Cámara lenta',back:'#/practicar',html:`
  <div class="lhead"><h1>Cámara lenta</h1><p class="sub">Practica una canción más lenta y repite el pedazo que estás sacando.</p></div>
  <div class="seg" id="slsrc">${[['canc','Del cancionero'],['audio','Archivo de audio']].map(([k,l])=>`<button data-src="${k}" aria-pressed="${slSrc()===k}">${l}</button>`).join('')}</div>
  <div id="slcanc" ${slSrc()==='canc'?'':'hidden'} style="display:flex;flex-direction:column;gap:14px">
    <p class="cap" style="margin:0">Elige una canción: se abre con la banda más lenta (sin cambiar el tono), y puedes repetir los renglones que quieras.</p>
    <input class="inp" id="slq" type="search" placeholder="Buscar canción o artista" autocomplete="off">
    <div class="chips">${[['mine','Mis canciones'],['trad','Con letra'],['top','Las 100']].map(([k,l])=>`<button class="chip" data-slg="${k}" aria-pressed="${slGroup()===k}">${l}</button>`).join('')}</div>
    <div class="list slist" id="slist"></div>
  </div>
  <div id="slaudio" ${slSrc()==='audio'?'':'hidden'} style="display:flex;flex-direction:column;gap:20px">
  <p class="cap" style="margin:0">Para una grabación que tengas en el teléfono (MP3, M4A…): baja la velocidad sin que cambie el tono.</p>
  <div class="card" style="display:flex;flex-direction:column;gap:14px">
    <div class="row" style="justify-content:space-between"><div style="min-width:0"><span class="cl" style="margin:0">Canción</span><b id="slname" class="slname">Ninguna elegida</b></div>
      <label class="btn" for="slfile">${IC.down}Elegir archivo</label><input type="file" id="slfile" accept="audio/*" hidden></div>
    <div class="sltrack" id="sltrack"><div class="slab" id="slab"></div><div class="slpos" id="slpos"></div></div>
    <input type="range" id="slseek" min="0" max="1000" value="0" aria-label="Posición en la canción" disabled>
    <div class="row" style="justify-content:space-between"><span class="tm" id="sltime">0:00 / 0:00</span><span class="tm" id="slrate">${Math.round(rate*100)} %</span></div>
    <div class="row" style="justify-content:center"><button class="btn sm" data-sl="back" disabled>−5 s</button><button class="btn pri" data-sl="play" id="slplay" style="min-width:150px" disabled>${IC.play}Reproducir</button><button class="btn sm" data-sl="fwd" disabled>+5 s</button></div>
  </div>
  <div class="card" style="display:flex;flex-direction:column;gap:14px">
    <div><span class="cl">Velocidad</span><div class="chips">${[.5,.6,.7,.75,.8,.9,1].map(v=>`<button class="chip" data-rate="${v}" aria-pressed="${v===rate}">${Math.round(v*100)} %</button>`).join('')}</div></div>
    <div><span class="cl">Repetir un pedazo</span><div class="chips"><button class="chip" data-sl="a" disabled>Marcar inicio (A)</button><button class="chip" data-sl="b" disabled>Marcar fin (B)</button><button class="chip" data-sl="loop" aria-pressed="false" disabled>Repetir A-B</button><button class="chip" data-sl="clear" disabled>Quitar</button></div>
    <p class="cap" id="slabtxt" style="margin:6px 0 0">Reproduce y toca «Marcar inicio» y «Marcar fin» en el pedazo que quieras repetir.</p></div>
  </div>
  <p class="cap">La canción se queda en este dispositivo; no se sube a ningún lado. Empieza al 60 o 70 % y sube cuando ya te salga.</p></div>`,
  mount(r){
    // canciones del cancionero (propias, con letra y las 100)
    const list=()=>{const g=slGroup(),q=($('#slq',r).value||'').toLowerCase().trim();let L=[];
      if(g==='mine')L=(DB.songs||[]).map(x=>{const P=songParse(x.src);return{id:x.id,t:P.title,a:P.artist||'Tu canción',k:chName(P.key,0,P.key,DB.notation==='es')+(P.key.minor&&!/m/.test(P.key.suf||'')?'m':''),b:P.bpm}});
      else if(g==='trad')L=TRAD.map((src,i)=>{const P=songParse(src);return{id:'pd'+i,t:P.title,a:P.artist,k:chName(P.key,0,P.key,DB.notation==='es')+(P.key.minor&&!/m/.test(P.key.suf||'')?'m':''),b:P.bpm}});
      else L=TOPLIST.map(x=>{const has=(DB.songs||[]).find(s=>s.top===x.id);return{id:has?has.id:x.id,t:x.t,a:x.a+(has?'':' · solo progresión'),k:x.k,b:x.bpm}});
      if(q)L=L.filter(x=>(x.t+' '+x.a).toLowerCase().includes(q));
      $('#slist',r).innerHTML=L.length?L.map(x=>`<a class="card lrow" href="#/cancionero/ver/${x.id}/lento"><span class="mn">${esc(x.k)}</span><span class="mt"><b>${esc(x.t)}</b><span>${esc(x.a)} · ${x.b} bpm</span></span></a>`).join('')
        :`<div class="card"><p class="cap" style="margin:0">${g==='mine'&&!q?'Aún no agregas canciones. En el Cancionero toca «Agregar canción» y pega la letra con acordes.':'No encontré canciones con ese nombre.'}</p></div>`};
    list();$('#slq',r).addEventListener('input',list);
    r.addEventListener('click',e=>{const sc=e.target.closest('[data-src]');if(sc){DB.slowSrc=sc.dataset.src;save();$$('[data-src]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===sc)));$('#slcanc',r).hidden=DB.slowSrc!=='canc';$('#slaudio',r).hidden=DB.slowSrc!=='audio';return}
      const gg=e.target.closest('[data-slg]');if(gg){DB.slowGroup=gg.dataset.slg;save();$$('[data-slg]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===gg)));list()}});
    const au=new Audio();au.preload='auto';au.preservesPitch=true;au.mozPreservesPitch=true;au.webkitPreservesPitch=true;
    const q=id=>$('#'+id,r),en=on=>$$('[data-sl],#slseek',r).forEach(b=>b.disabled=!on);
    const setRate=v=>{DB.slowRate=v;save();au.playbackRate=v;q('slrate').textContent=Math.round(v*100)+' %';$$('[data-rate]',r).forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.rate===v)))};
    const paintAB=()=>{const d=au.duration||0,ab=q('slab');if(SL.a!=null&&d){const b=SL.b!=null?SL.b:d;ab.style.left=(SL.a/d*100)+'%';ab.style.width=(Math.max(0,b-SL.a)/d*100)+'%';ab.hidden=false}else ab.hidden=true;
      q('slabtxt').textContent=SL.a==null?'Reproduce y toca «Marcar inicio» y «Marcar fin» en el pedazo que quieras repetir.':`Pedazo: ${fmt1(SL.a)} a ${SL.b!=null?fmt1(SL.b):'el final'}${SL.loop?' · repitiendo':''}`;
      const lb=$('[data-sl="loop"]',r);lb.setAttribute('aria-pressed',String(SL.loop))};
    const tickUI=()=>{const d=au.duration||0,t=au.currentTime;q('sltime').textContent=fmt(t)+' / '+fmt(d);if(d){q('slpos').style.left=(t/d*100)+'%';if(!q('slseek')._drag)q('slseek').value=Math.round(t/d*1000)}
      if(SL.loop&&SL.a!=null){const b=SL.b!=null?SL.b:d;if(t>=b-.02||t<SL.a-.3){au.currentTime=SL.a}}
      if(!au.paused)SL.raf=requestAnimationFrame(tickUI)};
    const paintPlay=()=>{q('slplay').innerHTML=au.paused?IC.play+'Reproducir':IC.pause+'Pausa'};
    const load=(blob,name)=>{if(SL.url)URL.revokeObjectURL(SL.url);SL.url=URL.createObjectURL(blob);au.src=SL.url;SL.name=name;SL.a=SL.b=null;SL.loop=false;q('slname').textContent=name;au.playbackRate=DB.slowRate||.75;en(true);paintAB()};
    au.addEventListener('loadedmetadata',()=>{au.playbackRate=DB.slowRate||.75;tickUI();paintAB()});
    au.addEventListener('play',()=>{paintPlay();cancelAnimationFrame(SL.raf);tickUI()});au.addEventListener('pause',paintPlay);au.addEventListener('ended',paintPlay);
    q('slfile').addEventListener('change',e=>{const f=e.target.files&&e.target.files[0];if(!f)return;load(f,f.name.replace(/\.[^.]+$/,''));slowSave(f)});
    const sk=q('slseek');sk.addEventListener('input',()=>{sk._drag=true;if(au.duration)au.currentTime=sk.value/1000*au.duration;tickUI()});sk.addEventListener('change',()=>{sk._drag=false});
    r.addEventListener('click',e=>{
      const rt=e.target.closest('[data-rate]');if(rt){setRate(+rt.dataset.rate);return}
      const b=e.target.closest('[data-sl]');if(!b||b.disabled)return;const k=b.dataset.sl;
      if(k==='play'){if(au.paused){seqStop();au.play().catch(()=>toast('No se pudo reproducir este archivo.'))}else au.pause()}
      else if(k==='back')au.currentTime=Math.max(0,au.currentTime-5);
      else if(k==='fwd')au.currentTime=Math.min(au.duration||0,au.currentTime+5);
      else if(k==='a'){SL.a=au.currentTime;if(SL.b!=null&&SL.b<=SL.a)SL.b=null;paintAB()}
      else if(k==='b'){if(SL.a==null)SL.a=0;SL.b=Math.max(SL.a+.5,au.currentTime);SL.loop=true;au.currentTime=SL.a;paintAB();if(au.paused)au.play().catch(()=>{})}
      else if(k==='loop'){if(SL.a==null){toast('Primero marca el inicio (A).');return}SL.loop=!SL.loop;paintAB()}
      else if(k==='clear'){SL.a=SL.b=null;SL.loop=false;paintAB()}
      tickUI();
    });
    slowLoad().then(d=>{if(d&&d.blob&&!SL.name)load(d.blob,d.name.replace(/\.[^.]+$/,''));else if(SL.url&&SL.name){au.src=SL.url;q('slname').textContent=SL.name;en(true)}});
    return()=>{au.pause();cancelAnimationFrame(SL.raf);SL.name='';};
  }};
}
/* ---------- recordatorio diario por calendario (.ics) ---------- */
function reminderCard(){
  const t=DB.remTime||'19:00';
  return`<div class="card" style="display:flex;flex-direction:column;gap:10px"><div><h3>Recordatorio diario</h3><p class="cap" style="margin:4px 0 0">Agrega a tu calendario una alarma diaria para practicar; te avisa aunque la app esté cerrada.</p></div>
   <div class="row"><label class="cl" for="remt" style="margin:0">Hora</label><input type="time" id="remt" class="inp" value="${t}" style="width:auto"><button class="btn" data-rem="ics">${IC.cal}Agregar a mi calendario</button></div></div>`;
}
function downloadICS(time){
  const [h,m]=time.split(':').map(Number),d=new Date();d.setDate(d.getDate()+(d.getHours()*60+d.getMinutes()>=h*60+m?1:0));
  const pad=n=>String(n).padStart(2,'0'),dt=`${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${pad(h)}${pad(m)}00`,now=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
  const url=location.href.split('#')[0]+'#/practicar/rutina';
  const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Roka Guitar for All//ES','CALSCALE:GREGORIAN','BEGIN:VEVENT',`UID:practica-${Date.now()}@roka-guitar`,`DTSTAMP:${now}`,`DTSTART:${dt}`,'DURATION:PT15M','RRULE:FREQ=DAILY','SUMMARY:Practicar guitarra · Roka',`DESCRIPTION:Tu rutina de hoy: ${url}`,`URL:${url}`,'BEGIN:VALARM','TRIGGER:PT0M','ACTION:DISPLAY','DESCRIPTION:Hora de practicar guitarra','END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([ics],{type:'text/calendar'}));a.download='practicar-guitarra.ics';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},2000);
  DB.remTime=time;save();toast('Abre el archivo para agregar el recordatorio a tu calendario.',4500);
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-rem="ics"]');if(!b)return;const inp=document.getElementById('remt');downloadICS(inp&&inp.value?inp.value:'19:00')});
/* ---------- bienvenida: 3 preguntas y un plan ---------- */
const ONB_Q=[
 ['nivel','¿Ya tocas guitarra?',[['cero','Nunca he tocado'],['algo','Sé algunos acordes'],['suelto','Toco con soltura']]],
 ['meta','¿Qué quieres lograr?',[['canciones','Tocar canciones'],['teoria','Entender la teoría'],['solos','Improvisar y hacer solos']]],
 ['tiempo','¿Cuánto tiempo al día?',[['10','10 minutos'],['15','15 minutos'],['30','30 minutos']]]];
function onboardShow(){
  if(document.getElementById('onb'))return;const A=Object.assign({},DB.onb&&!DB.onb.skip?DB.onb:{});
  const d=document.createElement('div');d.id='onb';d.className='onb';d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-label','Bienvenida');
  const paint=()=>{d.innerHTML=`<div class="onbc"><p class="eyebrow">Bienvenido a Roka Guitar for All</p><h2>Armemos tu plan</h2>
   ${ONB_Q.map(([k,q,os])=>`<div><span class="cl">${q}</span><div class="chips">${os.map(([v,l])=>`<button class="chip" data-onb="${k}" data-v="${v}" aria-pressed="${A[k]===v}">${l}</button>`).join('')}</div></div>`).join('')}
   <div class="row" style="justify-content:space-between"><button class="btn sm" data-onb="skip">Ahora no</button><button class="btn pri" data-onb="go" ${ONB_Q.every(([k])=>A[k])?'':'disabled'}>Ver mi plan</button></div></div>`};
  d.addEventListener('click',e=>{const b=e.target.closest('[data-onb]');if(!b)return;const k=b.dataset.onb;
    if(k==='skip'){DB.onb={skip:true};save();d.remove();return}
    if(k==='go'){DB.onb=A;RT.len=+A.tiempo;save();d.remove();if(!location.hash||location.hash==='#/')route();else location.hash='#/';return}
    A[k]=b.dataset.v;paint()});
  paint();document.body.appendChild(d);
}
function planCard(){
  const o=DB.onb;if(!o||o.skip)return'';
  const steps=[];
  if(o.nivel==='cero')steps.push(['#/practicar/afinador','Afina tu guitarra','Con el micrófono, cuerda por cuerda.'],['#/referencia/acordes','Aprende tus primeros acordes','Mi menor, La menor, Do, Sol y Re.'],['#/cancionero','Toca una canción fácil','Elige una tradicional con 2 o 3 acordes.']);
  else if(o.nivel==='algo')steps.push(['#/cancionero','Toca canciones con la banda','Usa los acordes que ya sabes.'],['#/leccion/1','Lección 1: el mástil','Para dejar de tocar de memoria.'],['#/practicar/rutina',`Rutina de ${o.tiempo} minutos`,'Todos los días a la misma hora.']);
  else steps.push(['#/leccion/4','Modos sin misticismo','Cambia el color de tus solos.'],['#/leccion/7','CAGED','Todo el mástil conectado.'],['#/practicar/pistas','Improvisa con pistas','Rock, blues, cumbia y ranchera.']);
  if(o.meta==='solos'&&o.nivel!=='suelto')steps[2]=['#/leccion/10','Improvisar con intención','Pentatónica y notas objetivo.'];
  if(o.meta==='teoria'&&o.nivel==='cero')steps[2]=['#/leccion/1','Lección 1: el mástil','Las 12 notas, sin enredos.'];
  return`<div class="card"><div class="row" style="justify-content:space-between"><p class="eyebrow">Tu plan</p><button class="btn sm" data-onb-open>Cambiar respuestas</button></div>
   <div class="list" style="margin-top:8px">${steps.map((s,i)=>`<a class="lrow plan" href="${s[0]}"><span class="mn">${i+1}</span><span class="mt"><b>${s[1]}</b><span>${s[2]}</span></span></a>`).join('')}</div></div>`;
}
document.addEventListener('click',e=>{if(e.target.closest('[data-onb-open]'))onboardShow()});
