/* ---------- logo ---------- */
let LGN=0;
// marca: púa en degradado metálico con una sola línea de cuerda
const logo=()=>{const id='lgp'+(++LGN);return`<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd08a"/><stop offset=".55" stop-color="#ff9f0a"/><stop offset="1" stop-color="#e2541f"/></linearGradient></defs><path d="M32 6c12.5 0 23 4.6 23 14.8C55 33 43.4 48.6 32 58 20.6 48.6 9 33 9 20.8 9 10.6 19.5 6 32 6z" fill="url(#${id})"/><path d="M32 6c12.5 0 23 4.6 23 14.8C55 33 43.4 48.6 32 58" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.2"/><path d="M20 23h24" stroke="#1a1000" stroke-opacity=".55" stroke-width="2.4" stroke-linecap="round"/></svg>`};
/* ---------- avisos ---------- */
function toast(html,ms){
  let t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';t.setAttribute('role','status');document.body.appendChild(t)}
  t.innerHTML=html;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),ms||3200);
}
/* ---------- más progresiones para pistas y canciones ---------- */
Object.assign(SCALES2,{mix:{semis:[0,2,4,5,7,9,10],n:'Mixolidia'}});
Object.assign(PROG2,{
 cincuentas:{n:'I – vi – IV – V (años 50)',it:[[0,'maj'],[9,'min'],[5,'maj'],[7,'maj']],sc:'pM',tip:'Pentatónica mayor; las notas largas sobre la raíz de cada acorde.'},
 bamba:{n:'I – IV – V',it:[[0,'maj'],[5,'maj'],[7,'maj'],[5,'maj']],sc:'pM',tip:'Pentatónica mayor de la tónica; frases cortas que respondan al ritmo.'},
 mixo:{n:'I – ♭VII – IV (rock clásico)',it:[[0,'maj'],[10,'maj'],[5,'maj'],[0,'maj']],sc:'mix',tip:'Mixolidia: la escala mayor con la 7ª bajada. También funciona la pentatónica menor.'}});
const SONGBOOK=[
 {p:'pop',n:'I – V – vi – IV',mood:'La progresión más usada del pop y el rock moderno.',songs:['Let It Be · The Beatles','With or Without You · U2','Someone Like You · Adele'],k:0,st:'balada'},
 {p:'cincuentas',n:'I – vi – IV – V',mood:'El sonido de los años 50 y las baladas de siempre.',songs:['Stand by Me · Ben E. King','Every Breath You Take · The Police','Perfect · Ed Sheeran'],k:1,st:'balada'},
 {p:'bamba',n:'I – IV – V',mood:'Tres acordes y a la fiesta: rock and roll puro.',songs:['La Bamba · Ritchie Valens','Twist and Shout · The Beatles','Wild Thing · The Troggs'],k:0,st:'rock'},
 {p:'blues',n:'Blues de 12 compases',mood:'La raíz del rock. Aprende esta y entiendes medio repertorio.',songs:['Johnny B. Goode · Chuck Berry','Pride and Joy · Stevie Ray Vaughan','Hound Dog · Elvis Presley'],k:3,st:'rock'},
 {p:'mixo',n:'I – ♭VII – IV',mood:'El acorde prestado que suena a guitarra de estadio.',songs:['Sweet Child O’ Mine · Guns N’ Roses','Sympathy for the Devil · The Rolling Stones','Hey Jude (final) · The Beatles'],k:2,st:'rock'},
 {p:'menor',n:'i – VI – III – VII',mood:'Menor y épico: del rock alternativo al reguetón.',songs:['Zombie · The Cranberries','Despacito · Luis Fonsi','Numb · Linkin Park'],k:4,st:'rock'},
 {p:'andaluza',n:'Cadencia andaluza',mood:'Dramática y con sabor flamenco.',songs:['Hit the Road Jack · Ray Charles','Malagueña · tradicional','Runaway · Del Shannon'],k:3,st:'rock'},
 {p:'dorico',n:'Vamp dórico i – IV',mood:'Dos acordes para improvisar latino y funk.',songs:['Oye cómo va · Santana','Evil Ways · Santana','Moondance (verso) · Van Morrison'],k:3,st:'cumbia'},
 {p:'iivi',n:'ii – V – I',mood:'El corazón del jazz y del bolero.',songs:['Autumn Leaves · estándar de jazz','Fly Me to the Moon · Frank Sinatra','Bésame mucho · Consuelo Velázquez'],k:6,st:'balada'},
 {p:'ranchera',n:'I – V7 (ranchera)',mood:'Tónica y dominante: el ida y vuelta del mariachi.',songs:['Cielito lindo · tradicional','El Rey · José Alfredo Jiménez','Volver, volver · Fernando Z. Maldonado'],k:0,st:'ranchera'}];
function viewSongs(){
  return{title:'Canciones',back:'#/referencia',html:`<div class="lhead"><span class="eyebrow">${SONGBOOK.length} progresiones · ${SONGBOOK.length*3} canciones</span><h1>Canciones</h1><p class="sub">Las mismas progresiones viven en cientos de canciones. Aprende una y tócala con la pista en cualquier tono.</p></div>
  <div class="list">${SONGBOOK.map((s,i)=>`<div class="card song"><div class="song-h"><div><b>${s.n}</b><span>${s.mood}</span></div><button class="btn sm pri" data-song="${i}">${IC.wave}Tocar pista</button></div><div class="chips">${PROG2[s.p].it.slice(0,8).map(([o,t])=>`<span class="pchip sm"><b>${pcName((KEYS[s.k].pc+o)%12,[6,7,8,9,10,11].includes(s.k)).us+CT[t].suf}</b></span>`).join('')}</div><ul class="songs">${s.songs.map(x=>{const[a,b]=x.split(' · ');return`<li><b>${a}</b> <span>${b}</span></li>`}).join('')}</ul></div>`).join('')}</div>
  <p class="cap">Algunas canciones usan la progresión solo en una parte (verso o coro). Los tonos originales pueden variar.</p>`,
  mount(r){r.addEventListener('click',e=>{const b=e.target.closest('[data-song]');if(!b)return;const s=SONGBOOK[+b.dataset.song];Object.assign(TRK,{p:s.p,k:s.k,st:s.st,bpm:STYLES[s.st].bpm});location.hash='#/practicar/pistas'})}};
}
/* ---------- afinaciones ---------- */
const TUNINGS={std:{n:'Estándar',m:[40,45,50,55,59,64]},half:{n:'Medio tono abajo',m:[39,44,49,54,58,63]},dropd:{n:'Drop D',m:[38,45,50,55,59,64]},full:{n:'Un tono abajo',m:[38,43,48,53,57,62]},openg:{n:'Open G',m:[38,43,50,55,59,62]},opend:{n:'Open D',m:[38,45,50,54,57,62]},dadgad:{n:'DADGAD',m:[38,45,50,55,57,62]}};
const tuningStrings=()=>(TUNINGS[DB.tuning]||TUNINGS.std).m.map((m,i)=>({m,n:PCS[m%12][0],s:6-i}));
/* ---------- modo reto: notas que caen ---------- */
// cada canción: "cuerda,traste,tiempos" separados por espacios; "-,tiempos" es silencio
const SONGS=[
 {id:'crom',sty:'rock',n:'Cromático 1-2-3-4',sub:'Calentamiento · un dedo por traste',lvl:1,bpm:72,src:'6,1,.5 6,2,.5 6,3,.5 6,4,.5 5,1,.5 5,2,.5 5,3,.5 5,4,.5 4,1,.5 4,2,.5 4,3,.5 4,4,.5 3,1,.5 3,2,.5 3,3,.5 3,4,.5 2,1,.5 2,2,.5 2,3,.5 2,4,.5 1,1,.5 1,2,.5 1,3,.5 1,4,2'},
 {id:'estrellita',sty:'folk',chb:'0:C 4:F 6:C 8:F 10:C 12:G 14:C 16:C 18:F 20:C 22:G 24:C 26:F 28:C 30:G 32:C 36:F 38:C 40:F 42:C 44:G 46:C',n:'Estrellita',sub:'Tradicional · en Do',lvl:1,bpm:92,src:'2,1,1 2,1,1 1,3,1 1,3,1 1,5,1 1,5,1 1,3,2 1,1,1 1,1,1 1,0,1 1,0,1 2,3,1 2,3,1 2,1,2 1,3,1 1,3,1 1,1,1 1,1,1 1,0,1 1,0,1 2,3,2 1,3,1 1,3,1 1,1,1 1,1,1 1,0,1 1,0,1 2,3,2 2,1,1 2,1,1 1,3,1 1,3,1 1,5,1 1,5,1 1,3,2 1,1,1 1,1,1 1,0,1 1,0,1 2,3,1 2,3,1 2,1,2'},
 {id:'oda',sty:'balada',chb:'0:G 4:D 8:G 12:D 16:G 20:D 24:G 28:D 30:G',n:'Oda a la alegría',sub:'Beethoven · en Sol',lvl:1,bpm:100,src:'2,0,1 2,0,1 2,1,1 2,3,1 2,3,1 2,1,1 2,0,1 3,2,1 3,0,1 3,0,1 3,2,1 2,0,1 2,0,1.5 3,2,.5 3,2,2 2,0,1 2,0,1 2,1,1 2,3,1 2,3,1 2,1,1 2,0,1 3,2,1 3,0,1 3,0,1 3,2,1 2,0,1 3,2,1.5 3,0,.5 3,0,2'},
 {id:'cucaracha',sty:'ranchera',chn:'0:C 12:G7 29:C',n:'La cucaracha',sub:'Tradicional mexicana · en Do',lvl:2,bpm:120,src:'3,0,.5 3,0,.5 3,0,.5 2,1,1 1,0,1.5 -,.5 3,0,.5 3,0,.5 3,0,.5 2,1,1 1,0,1.5 -,.5 2,1,.5 2,1,.5 2,0,.5 2,0,.5 3,2,.5 3,2,.5 3,0,2 -,1 3,0,.5 3,0,.5 3,0,.5 2,0,1 2,3,1.5 -,.5 3,0,.5 3,0,.5 3,0,.5 2,0,1 2,3,1.5 -,.5 1,3,.5 1,5,.5 1,3,.5 1,1,.5 1,0,.5 2,3,.5 2,1,2'},
 {id:'penta',sty:'pop',chb:'0:Am',n:'Pentatónica de La menor',sub:'La caja 1 · sube y baja',lvl:2,bpm:84,src:'6,5,.5 6,8,.5 5,5,.5 5,7,.5 4,5,.5 4,7,.5 3,5,.5 3,7,.5 2,5,.5 2,8,.5 1,5,.5 1,8,1 1,5,.5 2,8,.5 2,5,.5 3,7,.5 3,5,.5 4,7,.5 4,5,.5 5,7,.5 5,5,.5 6,8,.5 6,5,2'},
 {id:'arpegios',sty:'balada',chn:'0:C 8:Am 16:F 23:G 31:C',n:'Arpegios Do – Lam – Fa – Sol',sub:'Acordes abiertos nota por nota',lvl:2,bpm:84,src:'5,3,.5 4,2,.5 3,0,.5 2,1,.5 1,0,.5 2,1,.5 3,0,.5 4,2,.5 5,0,.5 4,2,.5 3,2,.5 2,1,.5 1,0,.5 2,1,.5 3,2,.5 4,2,.5 4,3,.5 3,2,.5 2,1,.5 1,1,.5 2,1,.5 3,2,.5 4,3,1 6,3,.5 5,2,.5 4,0,.5 3,0,.5 2,0,.5 1,3,.5 2,0,.5 3,0,.5 5,3,2'},
 {id:'boogie',sty:'shuffle',chn:'0:A 16:D 24:A 32:E 36:D 40:A',n:'Boogie en La',sub:'Blues · bajo que camina',lvl:3,bpm:108,src:'5,0,.5 5,4,.5 4,2,.5 4,4,.5 4,5,.5 4,4,.5 4,2,.5 5,4,.5 5,0,.5 5,4,.5 4,2,.5 4,4,.5 4,5,.5 4,4,.5 4,2,.5 5,4,.5 4,0,.5 4,4,.5 3,2,.5 3,4,.5 3,5,.5 3,4,.5 3,2,.5 4,4,.5 5,0,.5 5,4,.5 4,2,.5 4,4,.5 4,5,.5 4,4,.5 4,2,.5 5,4,.5 6,0,.5 6,4,.5 5,2,.5 5,4,.5 4,0,.5 4,4,.5 3,2,.5 3,4,.5 5,0,2'},
 {id:'pesado',sty:'rock',chn:'0:Em 16:A 24:Em',n:'Riff pesado en Mi',sub:'Original · cuerdas graves',lvl:3,bpm:100,src:'6,0,.5 6,0,.5 6,3,.5 6,0,.5 6,5,.5 6,0,.5 6,3,.5 6,2,.5 6,0,.5 6,0,.5 6,3,.5 6,0,.5 6,5,.5 6,6,.5 6,5,.5 6,3,.5 5,0,.5 5,0,.5 5,3,.5 5,0,.5 5,5,.5 5,3,.5 5,2,.5 5,0,.5 6,3,.5 6,2,.5 6,0,.5 6,3,.5 6,2,.5 6,0,.5 6,0,2'},
 {id:'solo',sty:'shuffle',chb:'0:A7',n:'Solo de blues en La',sub:'Frases con la caja 1',lvl:3,bpm:96,src:'1,5,.5 1,8,.5 1,5,.5 2,8,.5 2,5,1 -,1 2,8,.5 2,5,.5 3,7,.5 3,5,.5 4,7,1 -,1 3,5,.5 3,7,.5 2,5,.5 2,8,.5 1,5,.5 1,8,.5 1,5,.5 2,8,.5 2,5,.5 3,7,.5 3,5,.5 4,7,.5 4,5,.5 5,7,.5 5,5,2'}];
SONGS.forEach(S=>{let b=0;S.notes=[];S.src.trim().split(/\s+/).forEach(tok=>{const p=tok.split(',');if(p[0]==='-'){b+=+p[1];return}const s=+p[0],f=+p[1],d=+p[2];S.notes.push({s,f,d,b,m:OPEN_MIDI[s]+f});b+=d});S.beats=b});
// acordes del acompañamiento en pulsos: chb = por pulso, chn = por número de nota
SONGS.forEach(S=>{S.chords=[];if(S.chb)S.chb.split(' ').forEach(x=>{const[a,c]=x.split(':');S.chords.push([+a,c])});
  if(S.chn)S.chn.split(' ').forEach(x=>{const[a,c]=x.split(':');const n=S.notes[+a];if(n)S.chords.push([n.b,c])});S.chords.sort((a,b)=>a[0]-b[0])});
const RETO=Object.assign({speed:1,input:'tap',music:true,met:true,guide:false},(()=>{try{return JSON.parse(localStorage.getItem('roka-reto-opt')||'{}')}catch(e){return{}}})());
const retoSave=()=>{try{localStorage.setItem('roka-reto-opt',JSON.stringify(RETO))}catch(e){}};
const LVL=['','Fácil','Medio','Difícil'];
function stars(n){return'<span class="stars">'+[1,2,3,4,5].map(i=>`<i class="${i<=n?'on':''}"><svg viewBox="0 0 24 24"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/></svg></i>`).join('')+'</span>'}
function viewReto(){
  DB.reto=DB.reto||{};
  const list=()=>SONGS.map(S=>{const r=DB.reto[S.id];return`<button class="card song-pick" data-rs="${S.id}"><span class="lv l${S.lvl}">${LVL[S.lvl]}</span><b>${S.n}</b><span class="cap" style="margin:0">${S.sub} · ${S.bpm} bpm</span><span class="row" style="justify-content:space-between;width:100%">${stars(r?r.stars:0)}<span class="tm">${r?r.score.toLocaleString('es-MX'):'—'}</span></span></button>`}).join('');
  return{title:'Modo reto',back:'#/practicar',html:`<div id="retohost"><div class="hero-reto"><span class="eyebrow">Modo reto</span><h1 class="glow">Sube al escenario</h1><p class="sub">Las notas bajan por las seis cuerdas con su número de traste. Tócalas justo cuando lleguen a la línea: combos, multiplicador y estrellas.</p></div>
  <div class="card" style="display:flex;flex-direction:column;gap:14px">
   ${chipRow('input','Cómo tocas',[{v:'tap',l:'Toques en pantalla'},{v:'mic',l:'Guitarra real (micrófono)'}],RETO.input)}
   ${chipRow('speed','Velocidad',[.5,.6,.7,.8,.9,1,1.2].map(v=>({v,l:Math.round(v*100)+' %'})),RETO.speed)}
   <div><span class="cl">Para darle seguimiento</span><div class="chips">${[['music','Música de fondo'],['met','Metrónomo'],['guide','Nota guía']].map(([k,l])=>`<button class="chip" data-rt="${k}" aria-pressed="${!!RETO[k]}">${l}</button>`).join('')}</div></div>
   <p class="cap" style="margin:0" id="rtip"></p>
  </div>
  <div class="songgrid">${list()}</div></div>`,
  mount(r){
    let stop=null;
    const tip=()=>{$('#rtip',r).innerHTML=RETO.input==='mic'?'Pon el teléfono cerca de la guitarra, en un lugar callado. La app escucha cada nota y la compara con la que baja. Funciona mejor con guitarra acústica o con el ampli bajito.'+(RETO.music?' Con música de fondo usa audífonos, para que el micrófono solo oiga tu guitarra.':'')+(RETO.guide?' La nota guía se apaga con micrófono (si no, la app se oiría a sí misma).':''):'Toca el carril de la cuerda cuando la nota cruce la línea. En computadora también puedes usar las teclas 1 a 6 (cuerda 6 a la 1).'};
    tip();
    r.addEventListener('click',e=>{
      const rt=e.target.closest('[data-rt]');if(rt&&!stop){const k=rt.dataset.rt;RETO[k]=!RETO[k];rt.setAttribute('aria-pressed',String(RETO[k]));retoSave();tip();return}
      const c=e.target.closest('[data-set]');if(c&&!stop){const k=c.dataset.set;RETO[k]=k==='speed'?+c.dataset.v:c.dataset.v;retoSave();$$(`[data-set="${k}"]`,r).forEach(x=>x.setAttribute('aria-pressed',String(x===c)));tip();return}
      const s=e.target.closest('[data-rs]');if(s&&!stop){const S=SONGS.find(x=>x.id===s.dataset.rs);stop=retoPlay($('#retohost',r),S,()=>{stop=null;route()})}
    });
    return()=>{if(stop)stop()};
  }};
}
function retoPlay(host,S,onExit){
  const c=ac();if(!c){onExit();return null}
  seqStop();tmrStop();GAMEON=true;
  const spb=60/(S.bpm*RETO.speed),mic=RETO.input==='mic';
  host.innerHTML=`<div class="stage" id="stage"><canvas id="hw"></canvas>
   <div class="hud"><div><small>Puntos</small><b id="hsc">0</b></div><div class="mid"><small>${esc(S.n)}</small><b id="hmul">x1</b></div><div style="text-align:right"><small>Combo</small><b id="hco">0</b></div></div>
   <div class="prog"><i id="hpr"></i></div><div class="judge" id="hj"></div>
</div>
   <div class="row" style="justify-content:space-between;margin-top:10px"><p class="cap" id="hmsg" style="margin:0;flex:1">${mic?'Activando micrófono…':'Prepárate: cuenta de 4'}</p><button class="btn sm" id="hq">${IC.x}Salir</button></div>`;
  const cv=$('#hw',host),ctx=cv.getContext('2d'),st=$('#stage',host);
  const css=k=>getComputedStyle(document.documentElement).getPropertyValue(k).trim();
  const col={lane:['#ff4d6d','#ffd23f','#3ddc97','#4cc9f0','#b388ff','#ff9f1c'],fg:css('--fg'),muted:css('--muted'),line:css('--line'),bg:css('--bg'),ink:'#111'};
  const N=S.notes.map(n=>Object.assign({},n,{t:0,hit:0,miss:0}));
  const G={score:0,combo:0,max:0,perf:0,good:0,miss:0,run:true,t0:0,end:0,nextTick:0,tickN:0,flash:[0,0,0,0,0,0],bursts:[],raf:0,stream:null,iv:null,onset:-9,lvl:0};
  let W=0,H=0,dpr=1;
  const size=()=>{dpr=Math.min(2,window.devicePixelRatio||1);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)};
  size();window.addEventListener('resize',size);
  const laneOf=s=>LEFTY?s-1:6-s; // carril 0 = cuerda 6 a la izquierda
  const hitY=()=>H-74,pps=()=>H*.5;
  // lo que se ve va con lo que se OYE: el sonido tarda outLat() en salir por la bocina
  const vt=()=>c.currentTime-outLat();
  // música de fondo: la banda del cancionero con los acordes de la canción, grabada completa antes de empezar
  const music=async()=>{
    if(!RETO.music||!S.chords||(!S.chords.length&&S.sty!=='rock'))return null;
    try{if(!SMP.ready){$('#hmsg',host).textContent='Cargando sonidos…';await loadSamples()}
      const sty=S.sty||'folk',Q=GROOVES[sty].sub,cd=spb/Q,L=4*Q,nc=Math.ceil(S.beats*Q)+L,steps=[];let ci=0,cs=0;
      for(let k=0;k<nc;k++){const b=k/Q;while(ci+1<S.chords.length&&S.chords[ci+1][0]<=b+1e-6){ci++;cs=k}
        const ch=S.chords[ci];steps.push(ch?{G:sty,bt:4,i:k%L,bar:Math.floor(k/L),p:chParse(ch[1]),ci:k-cs,sh:0,spb}:null)}
      if(!S.chords.length){// sin acordes (calentamiento): solo batería y bajo en Mi
        steps.forEach((x,k)=>steps[k]={G:'rock',bt:4,i:k%L,bar:Math.floor(k/L),p:chParse('E'),ci:k,sh:0,spb})}
      // por tramos de 2 compases: el primero antes de arrancar, los demás mientras suena
      const CH=2*L,parts=[];for(let k=0;k<steps.length;k+=CH)parts.push(steps.slice(k,k+CH));
      $('#hmsg',host).textContent='Preparando la música…';
      const first=await bandRender(parts[0],cd);if(!bufHasSound(first))return null;
      return{first,more:async t0=>{for(let n=1;n<parts.length;n++){if(!G.run)return;try{const b=await bandRender(parts[n],cd);if(G.run)bandPlay(b,t0+n*CH*cd,.7)}catch(e){return}}}}}catch(e){return null}};
  const begin=async()=>{
    const M=await music();if(!G.run)return;
    G.t0=c.currentTime+.4+4*spb;if(M){G.mus=true;bandPlay(M.first,G.t0,.7);M.more(G.t0)}N.forEach(n=>n.t=G.t0+n.b*spb);G.end=G.t0+S.beats*spb+1.2;G.nextTick=G.t0-4*spb;
    $('#hmsg',host).textContent=mic?'Escuchando tu guitarra':'Toca el carril cuando la nota llegue a la línea';
    G.raf=requestAnimationFrame(frame);
  };
  const judge=(txt,cls)=>{const j=$('#hj',host);j.textContent=txt;j.className='judge show '+cls;clearTimeout(j._t);j._t=setTimeout(()=>j.className='judge',380)};
  const hud=()=>{const mul=Math.min(4,1+Math.floor(G.combo/8));$('#hsc',host).textContent=G.score.toLocaleString('es-MX');$('#hco',host).textContent=G.combo;$('#hmul',host).textContent='x'+mul;st.classList.toggle('fire',mul===4)};
  const award=(n,perfect)=>{
    n.hit=1;G.combo++;G.max=Math.max(G.max,G.combo);const mul=Math.min(4,1+Math.floor(G.combo/8));
    G.score+=(perfect?300:150)*mul;perfect?G.perf++:G.good++;
    G.flash[laneOf(n.s)]=performance.now();G.bursts.push({l:laneOf(n.s),t:performance.now()});
    judge(perfect?'¡Perfecto!':'Bien',perfect?'p':'g');if(!mic&&!RETO.guide)pluck(n.m,c.currentTime+.005,1.2,.22);hud();
  };
  const missN=n=>{n.miss=1;G.miss++;if(G.combo>=8)judge('Combo roto','m');G.combo=0;hud()};
  const tapLane=l=>{
    if(mic||!G.run)return;const now=vt();G.flash[l]=performance.now();
    let best=null;N.forEach(n=>{if(n.hit||n.miss||laneOf(n.s)!==l)return;const d=Math.abs(now-n.t);if(d<.2&&(!best||d<Math.abs(now-best.t)))best=n});
    if(best)award(best,Math.abs(now-best.t)<.075);else{noise(c.currentTime,.06,'lowpass',300,.18);if(G.combo){G.combo=0;hud()}}
  };
  cv.addEventListener('pointerdown',e=>{e.preventDefault();const r=cv.getBoundingClientRect();tapLane(Math.max(0,Math.min(5,Math.floor((e.clientX-r.left)/(r.width/6)))))});
  const kd=e=>{const i='123456'.indexOf(e.key);if(i>=0){e.preventDefault();tapLane(laneOf(6-i))}};
  document.addEventListener('keydown',kd);
  /* micrófono: ataque (subida de volumen) + altura que coincide con la nota esperada */
  const micLoop=()=>{
    const an=G.an,buf=G.buf;an.getFloatTimeDomainData(buf);
    let rms=0;for(let i=0;i<buf.length;i++)rms+=buf[i]*buf[i];rms=Math.sqrt(rms/buf.length);
    const now=vt()-.015;if(rms>.012&&rms>G.lvl*1.45)G.onset=now;G.lvl=G.lvl*.8+rms*.2;
    const f=detectPitch(buf,c.sampleRate);if(f<0)return;
    const m=69+12*Math.log2(f/440);
    let best=null;N.forEach(n=>{if(n.hit||n.miss)return;const dt=now-n.t;if(dt<-.2||dt>.45||G.onset<n.t-.25)return;const d=[0,12,-12].some(o=>Math.abs(m-n.m-o)<.55);if(d&&(!best||n.t<best.t))best=n});
    if(best)award(best,Math.abs(G.onset-best.t-.06)<.12);
  };
  const startMic=async()=>{
    if(!window.isSecureContext||!navigator.mediaDevices){$('#hmsg',host).textContent='Este navegador no permite el micrófono aquí. Usa los toques en pantalla.';return false}
    try{
      G.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
      const src=c.createMediaStreamSource(G.stream);G.an=c.createAnalyser();G.an.fftSize=2048;src.connect(G.an);G.buf=new Float32Array(2048);G.src=src;
      G.iv=setInterval(micLoop,30);return true;
    }catch(e){$('#hmsg',host).textContent='No se pudo usar el micrófono. Permítelo en los ajustes del navegador o usa los toques en pantalla.';return false}
  };
  function frame(){
    if(!G.run)return;
    const au=c.currentTime,now=vt();
    // cuenta de 4 siempre; después el metrónomo solo si está encendido (la barra de pulso sigue)
    while(G.nextTick<au+.2&&G.nextTick<G.end-1){const cnt=G.nextTick<G.t0-.01,v=G.tickN%4===0?'bar':'beat';
      if(cnt||RETO.met)tick(G.nextTick,G.tickN%4===0?'acc':mic?'sub':'beat',v);else{const d=Math.max(0,(G.nextTick-au+outLat())*1000);setTimeout(()=>{if(G.run)pulseBeat(v==='bar')},d)}
      G.nextTick+=spb;G.tickN++}
    // nota guía: suena cada nota justo cuando la burbuja cruza la línea
    if(RETO.guide&&!mic)N.forEach(n=>{if(!n.gs&&n.t<au+.2){n.gs=1;if(n.t>au-.05)pluck(n.m,Math.max(au+.005,n.t),Math.min(2,n.d*spb*1.1),.16)}});
    N.forEach(n=>{if(!n.hit&&!n.miss&&now-n.t>(mic?.5:.22))missN(n)});
    draw(now);
    $('#hpr',host).style.width=Math.max(0,Math.min(100,(now-G.t0)/(G.end-G.t0)*100))+'%';
    if(now>G.end){finish();return}
    G.raf=requestAnimationFrame(frame);
  }
  function draw(now){
    ctx.clearRect(0,0,W,H);
    const lw=W/6,hy=hitY(),p=pps();
    const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(0,0,0,.55)');g.addColorStop(1,'rgba(0,0,0,.15)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    for(let l=0;l<6;l++){
      const x=l*lw+lw/2,s=LEFTY?l+1:6-l,fl=Math.max(0,1-(performance.now()-G.flash[l])/220);
      if(fl>0){ctx.fillStyle=col.lane[s-1];ctx.globalAlpha=.18*fl;ctx.fillRect(l*lw,0,lw,H);ctx.globalAlpha=1}
      ctx.strokeStyle=col.muted;ctx.globalAlpha=.55;ctx.lineWidth=.8+(s-1)*.5;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();ctx.globalAlpha=1;
    }
    // compases
    ctx.strokeStyle=col.line;ctx.lineWidth=1;
    for(let k=Math.ceil((now-G.t0)/spb/4);;k++){const t=G.t0+k*4*spb,y=hy-(t-now)*p;if(y<0)break;if(y>H)continue;ctx.globalAlpha=.6;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();ctx.globalAlpha=1}
    // línea de golpe
    ctx.fillStyle=col.fg;ctx.globalAlpha=.85;ctx.fillRect(0,hy-2,W,4);ctx.globalAlpha=1;
    const R=Math.min(lw*.36,24);
    for(let l=0;l<6;l++){const s=LEFTY?l+1:6-l,x=l*lw+lw/2;ctx.lineWidth=3;ctx.strokeStyle=col.lane[s-1];ctx.beginPath();ctx.arc(x,hy,R+3,0,7);ctx.stroke();
      ctx.fillStyle=col.muted;ctx.font=`600 11px ${'IBM Plex Mono'},monospace`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(s),x,hy+R+18)}
    N.forEach(n=>{
      if(n.hit)return;const y=hy-(n.t-now)*p;const tail=n.d*spb*p;
      if(y-tail>H||y<-R-tail)return;
      const l=laneOf(n.s),x=l*lw+lw/2,cl=col.lane[n.s-1];
      if(n.d>=1){ctx.fillStyle=cl;ctx.globalAlpha=n.miss?.15:.35;ctx.fillRect(x-R*.28,y-tail+R,R*.56,tail-R);ctx.globalAlpha=1}
      ctx.globalAlpha=n.miss?.25:1;ctx.fillStyle=cl;ctx.shadowColor=cl;ctx.shadowBlur=n.miss?0:14;ctx.beginPath();ctx.arc(x,y,R,0,7);ctx.fill();ctx.shadowBlur=0;
      ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.arc(x-R*.3,y-R*.35,R*.35,0,7);ctx.fill();
      ctx.fillStyle=col.ink;ctx.font=`800 ${Math.round(R*1.05)}px 'Barlow Condensed',sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(n.f),x,y+1);ctx.globalAlpha=1;
    });
    const pn=performance.now();G.bursts=G.bursts.filter(b=>pn-b.t<380);
    G.bursts.forEach(b=>{const k=(pn-b.t)/380,x=b.l*lw+lw/2,s=LEFTY?b.l+1:6-b.l;ctx.strokeStyle=col.lane[s-1];ctx.globalAlpha=1-k;ctx.lineWidth=4*(1-k)+1;ctx.beginPath();ctx.arc(x,hy,R+6+k*30,0,7);ctx.stroke();ctx.globalAlpha=1});
    if(now<G.t0){const n=Math.ceil((G.t0-now)/spb);if(n<=4){ctx.fillStyle=col.fg;ctx.font=`800 ${Math.round(H*.18)}px 'Barlow Condensed',sans-serif`;ctx.textAlign='center';ctx.fillText(String(n),W/2,H*.38)}}
  }
  function cleanup(){
    G.run=false;cancelAnimationFrame(G.raf);if(G.iv)clearInterval(G.iv);if(G.mus)bandStop();
    if(G.stream)G.stream.getTracks().forEach(t=>t.stop());try{G.src&&G.src.disconnect()}catch(e){}
    window.removeEventListener('resize',size);document.removeEventListener('keydown',kd);GAMEON=false;
  }
  function finish(){
    cleanup();
    const tot=N.length,acc=Math.round((G.perf+G.good*.6)/tot*100),sc=acc>=95?5:acc>=85?4:acc>=70?3:acc>=50?2:acc>0?1:0;
    DB.reto=DB.reto||{};const prev=DB.reto[S.id]||{score:0,stars:0},rec=G.score>prev.score;
    DB.reto[S.id]={score:Math.max(prev.score,G.score),stars:Math.max(prev.stars,sc),acc:Math.max(prev.acc||0,acc),n:(prev.n||0)+1};
    markDay();save();if(sc>=3)bell();
    host.innerHTML=`<div class="card center result"><span class="eyebrow">${esc(S.n)}</span><div class="big">${G.score.toLocaleString('es-MX')}</div>${stars(sc)}
     <p class="sub" style="text-align:center">${acc}% de precisión · combo máximo ${G.max}</p>
     <div class="grid3"><div class="stat"><b>${G.perf}</b><span>perfectas</span></div><div class="stat"><b>${G.good}</b><span>bien</span></div><div class="stat"><b>${G.miss}</b><span>falladas</span></div></div>
     <p class="cap" style="margin:0">${rec?'¡Nuevo récord personal!':'Récord: '+prev.score.toLocaleString('es-MX')}</p>
     <p class="cap" style="margin:0">${acc<70?'Baja a velocidad de práctica y vuelve a intentarlo.':acc<95?'Ya casi: busca las cinco estrellas.':'Nivel leyenda. Prueba la siguiente canción.'}</p>
     <div class="row" style="justify-content:center"><button class="btn pri" id="ragain">${IC.play}Otra vez</button><button class="btn" id="rback">Elegir canción</button></div></div>`;
    $('#ragain',host).onclick=()=>{host._stop=retoPlay(host,S,onExit)};$('#rback',host).onclick=onExit;
  }
  $('#hq',host).onclick=()=>{cleanup();onExit()};
  if(mic)startMic().then(ok=>{if(ok)begin();else setTimeout(()=>{if(G.run){cleanup();onExit()}},3500)});else begin();
  return()=>{cleanup();if(host._stop)host._stop()};
}
/* ---------- grabadora ---------- */
const REC={stream:null,mr:null,chunks:[],t0:0,iv:null,urls:[]};
function idb(){return new Promise((ok,ko)=>{try{const q=indexedDB.open('mades-guitar-hero',1);q.onupgradeneeded=()=>q.result.createObjectStore('takes',{keyPath:'id',autoIncrement:true});q.onsuccess=()=>ok(q.result);q.onerror=()=>ko(q.error)}catch(e){ko(e)}})}
async function takesAll(){try{const d=await idb();return await new Promise(ok=>{const r=d.transaction('takes').objectStore('takes').getAll();r.onsuccess=()=>ok(r.result.reverse());r.onerror=()=>ok([])})}catch(e){return[]}}
async function takePut(t){const d=await idb();return new Promise((ok,ko)=>{const tx=d.transaction('takes','readwrite');tx.objectStore('takes').add(t);tx.oncomplete=ok;tx.onerror=()=>ko(tx.error);tx.onabort=()=>ko(tx.error)})}
async function takeDel(id){const d=await idb();return new Promise(ok=>{const tx=d.transaction('takes','readwrite');tx.objectStore('takes').delete(id);tx.oncomplete=ok;tx.onerror=ok})}
function viewRecorder(){
  return{title:'Grabadora',back:'#/practicar',html:`<div class="kplay tplay">${toolHead('rec','Grabadora','Escúchate')}
  <div class="card center"><div class="recdot" id="rdot"></div><div class="big" id="rtime" style="font-size:72px">0:00</div>
   <div><span class="cl">Acompañamiento mientras grabas</span><div class="seg" id="racc">${[['none','Ninguno'],['met','Metrónomo'],['trk','Pista']].map(([v,l])=>`<button data-acc="${v}" aria-pressed="${(DB.recAcc||'none')===v}">${l}</button>`).join('')}</div></div>
   <div id="raccopt" class="raccopt"></div><div id="rmsg"></div></div>
  <div class="card"><span class="cl">Tus tomas · se guardan en este dispositivo</span><div id="rlist" class="takes"></div></div>
  ${toolDock(`<span class="tm" id="rdm"></span><div class="ktrans"><button class="kplayb rec" id="rgo"></button></div><span></span>`)}</div>`,
  mount(r){
    const go=$('#rgo',r);
    const paint=()=>{go.innerHTML=playLbl(!!REC.mr,'Grabar','Detener y guardar','<i class="rec-i"></i>');go.setAttribute('aria-label',REC.mr?'Detener y guardar':'Grabar');$('#rdot',r).classList.toggle('on',!!REC.mr);$('#rdm',r).textContent=REC.mr?'Grabando…':'Lista para grabar';const m=$('#tmeta',r);if(m)m.textContent='Grábate y escúchate después'};
    const list=async()=>{REC.urls.forEach(u=>URL.revokeObjectURL(u));REC.urls=[];const ts=await takesAll();const el=$('#rlist',r);if(!el)return;
      el.innerHTML=ts.length?ts.map(t=>{const u=URL.createObjectURL(t.blob);REC.urls.push(u);const d=new Date(t.date);return`<div class="take"><div class="row" style="justify-content:space-between"><b>Toma del ${d.toLocaleDateString('es-MX',{day:'numeric',month:'short'})} · ${d.toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'})}</b><span class="tm">${fmt(t.dur)}</span></div><audio controls preload="metadata" src="${u}"></audio><div class="row"><a class="btn sm" href="${u}" download="mades-toma-${t.id}.${t.type.includes('mp4')?'m4a':'webm'}">${IC.down}Descargar</a><span data-dw="${t.id}"><button class="btn sm" data-del="${t.id}">${IC.x}Borrar</button></span></div></div>`}).join(''):'<p class="cap">Todavía no tienes tomas. Graba la primera.</p>'};
    const accOn=()=>SEQ.id&&(OWNER==='rec'||OWNER==='recprev');
    const accStart=own=>{const a=DB.recAcc||'none';OWNER=own;if(a==='met')metStart({bpm:MET.bpm,meter:MET.meter,sub:1});else if(a==='trk')trkStart()};
    // opciones del acompañamiento: tempo y compás del metrónomo, o tono, progresión, estilo y tempo de la pista
    const opts=()=>{
      const a=DB.recAcc||'none',el=$('#raccopt',r);
      if(a==='none'){el.innerHTML='';return}
      const bpm=a==='met'?MET.bpm:TRK.bpm;
      el.innerHTML=`<div class="row" style="justify-content:center"><button class="btn sm" data-rb="-5" aria-label="Bajar 5">−5</button><button class="btn sm" data-rb="-1" aria-label="Bajar 1">−1</button><b class="kkey" id="rbpm">${bpm}</b><span class="cl" style="margin:0">bpm</span><button class="btn sm" data-rb="1" aria-label="Subir 1">+1</button><button class="btn sm" data-rb="5" aria-label="Subir 5">+5</button></div>
       <input type="range" id="rbr" min="${a==='met'?30:50}" max="${a==='met'?240:200}" value="${bpm}" aria-label="Tempo">
       ${a==='met'?chipRow('meter','Compás',Object.keys(METERS).map(v=>({v,l:v})),MET.meter)
        :chipRow('k','Tonalidad',KEYS.map((x,i)=>({v:i,l:x.es,s:x.us})),TRK.k)+chipRow('p','Progresión',Object.keys(PROG2).map(v=>({v,l:PROG2[v].n})),TRK.p)+chipRow('st','Estilo',Object.keys(STYLES).map(v=>({v,l:STYLES[v].n})),TRK.st)}
       <div class="row" style="justify-content:center"><button class="btn sm" id="rprev">${accOn()&&OWNER==='recprev'?IC.stop+'Detener':IC.play+'Escuchar antes de grabar'}</button></div>`;
    };
    const setBpm=v=>{const a=DB.recAcc;if(a==='met'){MET.bpm=Math.max(30,Math.min(240,Math.round(v)));DB.met=MET.bpm;if(SEQ.id==='met')SEQ.label='Metrónomo '+MET.bpm}else{TRK.bpm=Math.max(50,Math.min(200,Math.round(v)))}save();const b=$('#rbpm',r);if(b)b.textContent=a==='met'?MET.bpm:TRK.bpm;const g=$('#rbr',r);if(g)g.value=a==='met'?MET.bpm:TRK.bpm};
    const restartAcc=()=>{if(accOn()){const own=OWNER;seqStop();accStart(own)}};
    const stopRec=()=>{if(REC.mr&&REC.mr.state!=='inactive')REC.mr.stop();clearInterval(REC.iv);if(SEQ.id&&(OWNER==='rec'||OWNER==='recprev'))seqStop()};
    go.onclick=async()=>{
      $('#rmsg',r).innerHTML='';
      if(REC.mr){stopRec();return}
      if(!window.MediaRecorder||!navigator.mediaDevices){$('#rmsg',r).innerHTML='<p class="msg err">Este navegador no puede grabar audio. Prueba con Chrome o Safari actualizados.</p>';return}
      try{REC.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:true}})}catch(e){$('#rmsg',r).innerHTML='<p class="msg err">No se pudo usar el micrófono. Permítelo en los ajustes del navegador.</p>';return}
      const type=['audio/mp4','audio/webm;codecs=opus','audio/webm'].find(t=>MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(t))||'';
      REC.mr=new MediaRecorder(REC.stream,type?{mimeType:type}:{});REC.chunks=[];REC.t0=Date.now();
      REC.mr.ondataavailable=e=>{if(e.data&&e.data.size)REC.chunks.push(e.data)};
      REC.mr.onstop=async()=>{const blob=new Blob(REC.chunks,{type:REC.mr.mimeType||type||'audio/webm'}),dur=(Date.now()-REC.t0)/1000;REC.stream.getTracks().forEach(t=>t.stop());REC.mr=null;REC.stream=null;paint();
        if(dur>.8){try{await takePut({date:Date.now(),dur,blob,type:blob.type});DB.recs=(DB.recs||0)+1;save();toast(logo()+'<span>Toma guardada</span>')}catch(e){const m=$('#rmsg',r);if(m)m.innerHTML='<p class="msg err">No se pudo guardar la toma en este dispositivo. Revisa que el navegador no esté en modo privado y que tenga espacio.</p>'}}
        else{const m=$('#rmsg',r);if(m)m.innerHTML='<p class="msg">La toma fue muy corta y no se guardó.</p>'}
        if(!blob.size){const m=$('#rmsg',r);if(m)m.innerHTML='<p class="msg err">El micrófono no entregó sonido. Revisa que no lo esté usando otra app.</p>'}
        list();opts()};
      REC.mr.start(500);
      if(SEQ.id)seqStop();accStart('rec');opts();
      REC.iv=setInterval(()=>{const t=$('#rtime',r);if(t)t.textContent=fmt((Date.now()-REC.t0)/1000)},250);paint();
    };
    r.addEventListener('click',async e=>{
      const a=e.target.closest('[data-acc]');if(a){const was=accOn()?OWNER:null;if(was)seqStop();DB.recAcc=a.dataset.acc;save();$$('[data-acc]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===a)));if(was==='rec')accStart('rec');opts();return}
      const rb=e.target.closest('[data-rb]');if(rb){setBpm((DB.recAcc==='met'?MET.bpm:TRK.bpm)+ +rb.dataset.rb);if(DB.recAcc==='trk')restartAcc();return}
      const cs=e.target.closest('[data-set]');if(cs){const k=cs.dataset.set;if(k==='meter'){MET.meter=cs.dataset.v;DB.meter=MET.meter}else{TRK[k]=k==='k'?+cs.dataset.v:cs.dataset.v;if(k==='st')TRK.bpm=STYLES[TRK.st].bpm}save();restartAcc();opts();return}
      if(e.target.closest('#rprev')){if(accOn()&&OWNER==='recprev')seqStop();else if(!REC.mr){if(SEQ.id)seqStop();accStart('recprev')}opts();return}
      const d=e.target.closest('[data-del]');if(d){d.parentNode.innerHTML=`<button class="btn sm" data-delok="${d.dataset.del}" style="border-color:var(--bad);color:var(--bad)">Sí, borrar</button>`;return}
      const k=e.target.closest('[data-delok]');if(k){await takeDel(+k.dataset.delok);list()}
    });
    r.addEventListener('input',e=>{if(e.target.id==='rbr'){setBpm(+e.target.value)}});
    r.addEventListener('change',e=>{if(e.target.id==='rbr'&&DB.recAcc==='trk')restartAcc()});
    paint();list();opts();
    return()=>{stopRec();REC.urls.forEach(u=>URL.revokeObjectURL(u));REC.urls=[]};
  }};
}
/* ---------- logros ---------- */
const ACH=[
 ['primer','Primera nota','Marca tu primer ejercicio como hecho.','note',D=>Object.keys(D.done).length>=1],
 ['diez','Diez de diez','Completa 10 ejercicios.','list',D=>Object.keys(D.done).length>=10],
 ['leccion','Lección superada','Termina todos los ejercicios de una lección.','book',()=>LESSONS.some(l=>{const[d,t]=doneCount(l.id);return t&&d===t})],
 ['graduado','Graduado','Completa todos los ejercicios del curso.','cap',()=>{const[d,t]=doneCount();return t&&d===t}],
 ['racha3','En racha','Practica 3 días seguidos.','flame',()=>streak()>=3],
 ['racha7','Semana de fuego','Practica 7 días seguidos.','flame',()=>streak()>=7],
 ['racha30','Disciplina de leyenda','Practica 30 días seguidos.','flame',()=>streak()>=30],
 ['hora','Primera hora','Junta 1 hora de práctica con la app.','clock',D=>Object.values(D.secs).reduce((a,b)=>a+b,0)>=3600],
 ['diezh','Diez horas','Junta 10 horas de práctica.','clock',D=>Object.values(D.secs).reduce((a,b)=>a+b,0)>=36000],
 ['ojo','Ojo de halcón','Logra 10 aciertos en el juego del mástil.','target',D=>Object.values(D.game).some(v=>v>=10)],
 ['mapa','Mástil en la mente','Logra 25 aciertos en el juego del mástil.','target',D=>Object.values(D.game).some(v=>v>=25)],
 ['escenario','Primer escenario','Gana al menos una estrella en el modo reto.','star',D=>Object.values(D.reto||{}).some(r=>r.stars>=1)],
 ['cinco','Cinco estrellas','Saca 5 estrellas en el modo reto.','award',D=>Object.values(D.reto||{}).some(r=>r.stars>=5)],
 ['gira','Gira completa','Gana estrellas en todas las canciones del reto.','route',D=>SONGS.every(s=>((D.reto||{})[s.id]||{}).stars>=1)],
 ['estudio','En el estudio','Graba tu primera toma.','mic',D=>(D.recs||0)>=1],
 ['camaleon','Camaleón','Prueba 5 temas de color distintos.','palette',D=>Object.keys(D.tried||{}).length>=5]];
const ACHIC={note:'<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',list:'<path d="M4 6h10M4 12h10M4 18h6"/><path d="M15 17l2.5 2.5L22 15"/>',book:'<path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5z"/><path d="M9 10l2 2 4-4"/>',cap:'<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3.5 2.5 8.5 2.5 12 0v-5"/>',flame:'<path d="M12 3c.5 3.5 5 5.5 5 10.5a5 5 0 01-10 0c0-2.5 1.5-3.5 2-5.5 1.5 1 2.5 2.5 2.5 4"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',star:'<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',award:'<circle cx="12" cy="9" r="5.5"/><path d="M8.6 13.4L7.5 21l4.5-2.6 4.5 2.6-1.1-7.6"/>',route:'<path d="M3 6.5l6-3 6 3 6-3v14l-6 3-6-3-6 3z"/><path d="M9 3.5v14M15 6.5v14"/>',mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21"/>',palette:'<path d="M12 3a9 9 0 100 18c1.4 0 2-1 2-2 0-1.5-1.3-1.8-1.3-3S14 14 15.5 14H18a3 3 0 003-3c0-4.4-4-8-9-8z"/><circle cx="7.5" cy="11" r="1.2" fill="currentColor"/><circle cx="10.5" cy="7" r="1.2" fill="currentColor"/><circle cx="15" cy="7.5" r="1.2" fill="currentColor"/>'};
const achIcon=k=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ACHIC[k]||ACHIC.star}</svg>`;
function checkAch(quiet){
  DB.ach=DB.ach||{};let any=false;
  ACH.forEach(([id,n,,ic,test])=>{if(DB.ach[id])return;let ok=false;try{ok=test(DB)}catch(e){}if(ok){DB.ach[id]=today();any=true;if(!quiet)toast(`<span class="medal on sm">${achIcon(ic)}</span><span><small>Logro desbloqueado</small><b>${n}</b></span>`,4200)}});
  return any;
}
function viewAch(){
  DB.ach=DB.ach||{};const got=ACH.filter(a=>DB.ach[a[0]]).length;
  return{title:'Logros',back:'#/practicar',html:`<div class="lhead"><span class="eyebrow">${got} de ${ACH.length} desbloqueados</span><h1>Logros</h1><div class="bar"><i style="width:${got/ACH.length*100}%"></i></div></div>
  <div class="achgrid">${ACH.map(([id,n,d,ic])=>{const on=DB.ach[id];return`<div class="ach ${on?'on':''}"><span class="medal ${on?'on':''}">${achIcon(ic)}</span><b>${n}</b><span>${d}</span>${on?`<small>${on.split('-').reverse().join('/')}</small>`:''}</div>`}).join('')}</div>`};
}
/* ---------- respaldo del progreso ---------- */
function backupCode(){return'MGH1:'+btoa(unescape(encodeURIComponent(JSON.stringify(DB))))}
function restoreCode(txt){
  txt=String(txt||'').trim();let o=null;
  try{o=txt.startsWith('MGH1:')?JSON.parse(decodeURIComponent(escape(atob(txt.slice(5))))):JSON.parse(txt)}catch(e){return false}
  if(!o||typeof o!=='object'||typeof o.done!=='object')return false;
  Object.keys(DB).forEach(k=>delete DB[k]);Object.assign(DB,{done:{},secs:{},days:{},game:{},bpm:{},theme:'auto'},o);save();applyTheme();return true;
}
