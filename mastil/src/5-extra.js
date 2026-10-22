/* ---------- logo ---------- */
let LGN=0;
const logo=()=>{const id='lgp'+(++LGN);return`<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb03a"/><stop offset="1" stop-color="#ff3ea5"/></linearGradient></defs><path d="M32 5c13 0 24 5 24 16 0 13-12 29-24 38C20 50 8 34 8 21 8 10 19 5 32 5z" fill="url(#${id})"/><text x="32" y="31" text-anchor="middle" font-family="Impact,'Barlow Condensed',sans-serif" font-weight="800" font-size="17" fill="#fff">MGH</text><path d="M31 37h5l-3 5h4l-8 9 2-6h-4z" fill="#1b0016"/></svg>`};
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
 {id:'crom',n:'Cromático 1-2-3-4',sub:'Calentamiento · un dedo por traste',lvl:1,bpm:72,src:'6,1,.5 6,2,.5 6,3,.5 6,4,.5 5,1,.5 5,2,.5 5,3,.5 5,4,.5 4,1,.5 4,2,.5 4,3,.5 4,4,.5 3,1,.5 3,2,.5 3,3,.5 3,4,.5 2,1,.5 2,2,.5 2,3,.5 2,4,.5 1,1,.5 1,2,.5 1,3,.5 1,4,2'},
 {id:'estrellita',n:'Estrellita',sub:'Tradicional · en Do',lvl:1,bpm:92,src:'2,1,1 2,1,1 1,3,1 1,3,1 1,5,1 1,5,1 1,3,2 1,1,1 1,1,1 1,0,1 1,0,1 2,3,1 2,3,1 2,1,2 1,3,1 1,3,1 1,1,1 1,1,1 1,0,1 1,0,1 2,3,2 1,3,1 1,3,1 1,1,1 1,1,1 1,0,1 1,0,1 2,3,2 2,1,1 2,1,1 1,3,1 1,3,1 1,5,1 1,5,1 1,3,2 1,1,1 1,1,1 1,0,1 1,0,1 2,3,1 2,3,1 2,1,2'},
 {id:'oda',n:'Oda a la alegría',sub:'Beethoven · en Sol',lvl:1,bpm:100,src:'2,0,1 2,0,1 2,1,1 2,3,1 2,3,1 2,1,1 2,0,1 3,2,1 3,0,1 3,0,1 3,2,1 2,0,1 2,0,1.5 3,2,.5 3,2,2 2,0,1 2,0,1 2,1,1 2,3,1 2,3,1 2,1,1 2,0,1 3,2,1 3,0,1 3,0,1 3,2,1 2,0,1 3,2,1.5 3,0,.5 3,0,2'},
 {id:'cucaracha',n:'La cucaracha',sub:'Tradicional mexicana · en Do',lvl:2,bpm:120,src:'3,0,.5 3,0,.5 3,0,.5 2,1,1 1,0,1.5 -,.5 3,0,.5 3,0,.5 3,0,.5 2,1,1 1,0,1.5 -,.5 2,1,.5 2,1,.5 2,0,.5 2,0,.5 3,2,.5 3,2,.5 3,0,2 -,1 3,0,.5 3,0,.5 3,0,.5 2,0,1 2,3,1.5 -,.5 3,0,.5 3,0,.5 3,0,.5 2,0,1 2,3,1.5 -,.5 1,3,.5 1,5,.5 1,3,.5 1,1,.5 1,0,.5 2,3,.5 2,1,2'},
 {id:'penta',n:'Pentatónica de La menor',sub:'La caja 1 · sube y baja',lvl:2,bpm:84,src:'6,5,.5 6,8,.5 5,5,.5 5,7,.5 4,5,.5 4,7,.5 3,5,.5 3,7,.5 2,5,.5 2,8,.5 1,5,.5 1,8,1 1,5,.5 2,8,.5 2,5,.5 3,7,.5 3,5,.5 4,7,.5 4,5,.5 5,7,.5 5,5,.5 6,8,.5 6,5,2'},
 {id:'arpegios',n:'Arpegios Do – Lam – Fa – Sol',sub:'Acordes abiertos nota por nota',lvl:2,bpm:84,src:'5,3,.5 4,2,.5 3,0,.5 2,1,.5 1,0,.5 2,1,.5 3,0,.5 4,2,.5 5,0,.5 4,2,.5 3,2,.5 2,1,.5 1,0,.5 2,1,.5 3,2,.5 4,2,.5 4,3,.5 3,2,.5 2,1,.5 1,1,.5 2,1,.5 3,2,.5 4,3,1 6,3,.5 5,2,.5 4,0,.5 3,0,.5 2,0,.5 1,3,.5 2,0,.5 3,0,.5 5,3,2'},
 {id:'boogie',n:'Boogie en La',sub:'Blues · bajo que camina',lvl:3,bpm:108,src:'5,0,.5 5,4,.5 4,2,.5 4,4,.5 4,5,.5 4,4,.5 4,2,.5 5,4,.5 5,0,.5 5,4,.5 4,2,.5 4,4,.5 4,5,.5 4,4,.5 4,2,.5 5,4,.5 4,0,.5 4,4,.5 3,2,.5 3,4,.5 3,5,.5 3,4,.5 3,2,.5 4,4,.5 5,0,.5 5,4,.5 4,2,.5 4,4,.5 4,5,.5 4,4,.5 4,2,.5 5,4,.5 6,0,.5 6,4,.5 5,2,.5 5,4,.5 4,0,.5 4,4,.5 3,2,.5 3,4,.5 5,0,2'},
 {id:'pesado',n:'Riff pesado en Mi',sub:'Original · cuerdas graves',lvl:3,bpm:100,src:'6,0,.5 6,0,.5 6,3,.5 6,0,.5 6,5,.5 6,0,.5 6,3,.5 6,2,.5 6,0,.5 6,0,.5 6,3,.5 6,0,.5 6,5,.5 6,6,.5 6,5,.5 6,3,.5 5,0,.5 5,0,.5 5,3,.5 5,0,.5 5,5,.5 5,3,.5 5,2,.5 5,0,.5 6,3,.5 6,2,.5 6,0,.5 6,3,.5 6,2,.5 6,0,.5 6,0,2'},
 {id:'solo',n:'Solo de blues en La',sub:'Frases con la caja 1',lvl:3,bpm:96,src:'1,5,.5 1,8,.5 1,5,.5 2,8,.5 2,5,1 -,1 2,8,.5 2,5,.5 3,7,.5 3,5,.5 4,7,1 -,1 3,5,.5 3,7,.5 2,5,.5 2,8,.5 1,5,.5 1,8,.5 1,5,.5 2,8,.5 2,5,.5 3,7,.5 3,5,.5 4,7,.5 4,5,.5 5,7,.5 5,5,2'}];
SONGS.forEach(S=>{let b=0;S.notes=[];S.src.trim().split(/\s+/).forEach(tok=>{const p=tok.split(',');if(p[0]==='-'){b+=+p[1];return}const s=+p[0],f=+p[1],d=+p[2];S.notes.push({s,f,d,b,m:OPEN_MIDI[s]+f});b+=d});S.beats=b});
const RETO={speed:1,input:'tap'};
const LVL=['','Fácil','Medio','Difícil'];
function stars(n){return'<span class="stars">'+[1,2,3,4,5].map(i=>`<i class="${i<=n?'on':''}">★</i>`).join('')+'</span>'}
function viewReto(){
  DB.reto=DB.reto||{};
  const list=()=>SONGS.map(S=>{const r=DB.reto[S.id];return`<button class="card song-pick" data-rs="${S.id}"><span class="lv l${S.lvl}">${LVL[S.lvl]}</span><b>${S.n}</b><span class="cap" style="margin:0">${S.sub} · ${S.bpm} bpm</span><span class="row" style="justify-content:space-between;width:100%">${stars(r?r.stars:0)}<span class="tm">${r?r.score.toLocaleString('es-MX'):'—'}</span></span></button>`}).join('');
  return{title:'Modo reto',back:'#/practicar',html:`<div id="retohost"><div class="hero-reto"><span class="eyebrow">Modo reto</span><h1 class="glow">Sube al escenario</h1><p class="sub">Las notas bajan por las seis cuerdas con su número de traste. Tócalas justo cuando lleguen a la línea: combos, multiplicador y estrellas.</p></div>
  <div class="card" style="display:flex;flex-direction:column;gap:14px">
   ${chipRow('input','Cómo tocas',[{v:'tap',l:'Toques en pantalla'},{v:'mic',l:'Guitarra real (micrófono)'}],RETO.input)}
   ${chipRow('speed','Velocidad',[{v:.7,l:'Práctica 70%'},{v:1,l:'Normal'},{v:1.2,l:'Leyenda 120%'}],RETO.speed)}
   <p class="cap" style="margin:0" id="rtip"></p>
  </div>
  <div class="songgrid">${list()}</div></div>`,
  mount(r){
    let stop=null;
    const tip=()=>{$('#rtip',r).innerHTML=RETO.input==='mic'?'Pon el teléfono cerca de la guitarra, en un lugar callado. La app escucha cada nota y la compara con la que baja. Funciona mejor con guitarra acústica o con el ampli bajito.':'Toca el carril de la cuerda cuando la nota cruce la línea. En computadora también puedes usar las teclas 1 a 6 (cuerda 6 a la 1).'};
    tip();
    r.addEventListener('click',e=>{
      const c=e.target.closest('[data-set]');if(c&&!stop){const k=c.dataset.set;RETO[k]=k==='speed'?+c.dataset.v:c.dataset.v;$$(`[data-set="${k}"]`,r).forEach(x=>x.setAttribute('aria-pressed',String(x===c)));tip();return}
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
  const begin=()=>{
    G.t0=c.currentTime+.4+4*spb;N.forEach(n=>n.t=G.t0+n.b*spb);G.end=G.t0+S.beats*spb+1.2;G.nextTick=G.t0-4*spb;
    $('#hmsg',host).textContent=mic?'Escuchando tu guitarra':'Toca el carril cuando la nota llegue a la línea';
    G.raf=requestAnimationFrame(frame);
  };
  const judge=(txt,cls)=>{const j=$('#hj',host);j.textContent=txt;j.className='judge show '+cls;clearTimeout(j._t);j._t=setTimeout(()=>j.className='judge',380)};
  const hud=()=>{const mul=Math.min(4,1+Math.floor(G.combo/8));$('#hsc',host).textContent=G.score.toLocaleString('es-MX');$('#hco',host).textContent=G.combo;$('#hmul',host).textContent='x'+mul;st.classList.toggle('fire',mul===4)};
  const award=(n,perfect)=>{
    n.hit=1;G.combo++;G.max=Math.max(G.max,G.combo);const mul=Math.min(4,1+Math.floor(G.combo/8));
    G.score+=(perfect?300:150)*mul;perfect?G.perf++:G.good++;
    G.flash[laneOf(n.s)]=performance.now();G.bursts.push({l:laneOf(n.s),t:performance.now()});
    judge(perfect?'¡Perfecto!':'Bien',perfect?'p':'g');if(!mic)pluck(n.m,c.currentTime+.005,1.2,.22);hud();
  };
  const missN=n=>{n.miss=1;G.miss++;if(G.combo>=8)judge('Combo roto','m');G.combo=0;hud()};
  const tapLane=l=>{
    if(mic||!G.run)return;const now=c.currentTime;G.flash[l]=performance.now();
    let best=null;N.forEach(n=>{if(n.hit||n.miss||laneOf(n.s)!==l)return;const d=Math.abs(now-n.t);if(d<.2&&(!best||d<Math.abs(now-best.t)))best=n});
    if(best)award(best,Math.abs(now-best.t)<.075);else{noise(now,.06,'lowpass',300,.18);if(G.combo){G.combo=0;hud()}}
  };
  cv.addEventListener('pointerdown',e=>{e.preventDefault();const r=cv.getBoundingClientRect();tapLane(Math.max(0,Math.min(5,Math.floor((e.clientX-r.left)/(r.width/6)))))});
  const kd=e=>{const i='123456'.indexOf(e.key);if(i>=0){e.preventDefault();tapLane(laneOf(6-i))}};
  document.addEventListener('keydown',kd);
  /* micrófono: ataque (subida de volumen) + altura que coincide con la nota esperada */
  const micLoop=()=>{
    const an=G.an,buf=G.buf;an.getFloatTimeDomainData(buf);
    let rms=0;for(let i=0;i<buf.length;i++)rms+=buf[i]*buf[i];rms=Math.sqrt(rms/buf.length);
    const now=c.currentTime;if(rms>.012&&rms>G.lvl*1.45)G.onset=now;G.lvl=G.lvl*.8+rms*.2;
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
    const now=c.currentTime;
    while(G.nextTick<now+.12&&G.nextTick<G.end-1){tick(G.nextTick,G.tickN%4===0?'acc':mic?'sub':'beat');G.nextTick+=spb;G.tickN++}
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
    G.run=false;cancelAnimationFrame(G.raf);if(G.iv)clearInterval(G.iv);
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
async function takePut(t){const d=await idb();return new Promise(ok=>{const tx=d.transaction('takes','readwrite');tx.objectStore('takes').add(t);tx.oncomplete=ok;tx.onerror=ok})}
async function takeDel(id){const d=await idb();return new Promise(ok=>{const tx=d.transaction('takes','readwrite');tx.objectStore('takes').delete(id);tx.oncomplete=ok;tx.onerror=ok})}
function viewRecorder(){
  return{title:'Grabadora',back:'#/practicar',html:`<div class="lhead"><span class="eyebrow">Escúchate</span><h1>Grabadora</h1><p class="sub">Grábate tocando y escúchate después. Lo que suena mal se oye mucho más claro afuera de la guitarra.</p></div>
  <div class="card center"><div class="recdot" id="rdot"></div><div class="big" id="rtime" style="font-size:72px">0:00</div>
   <div><span class="cl">Acompañamiento mientras grabas</span><div class="seg" id="racc">${[['none','Ninguno'],['met','Metrónomo'],['trk','Pista']].map(([v,l])=>`<button data-acc="${v}" aria-pressed="${(DB.recAcc||'none')===v}">${l}</button>`).join('')}</div></div>
   <button class="btn pri" id="rgo" style="min-width:200px"></button><div id="rmsg"></div></div>
  <div class="card"><span class="cl">Tus tomas · se guardan en este dispositivo</span><div id="rlist" class="takes"></div></div>`,
  mount(r){
    const go=$('#rgo',r);
    const paint=()=>{go.innerHTML=REC.mr?IC.stop+'Detener y guardar':'<span class="rec-i"></span>Grabar';$('#rdot',r).classList.toggle('on',!!REC.mr)};
    const list=async()=>{REC.urls.forEach(u=>URL.revokeObjectURL(u));REC.urls=[];const ts=await takesAll();const el=$('#rlist',r);if(!el)return;
      el.innerHTML=ts.length?ts.map(t=>{const u=URL.createObjectURL(t.blob);REC.urls.push(u);const d=new Date(t.date);return`<div class="take"><div class="row" style="justify-content:space-between"><b>Toma del ${d.toLocaleDateString('es-MX',{day:'numeric',month:'short'})} · ${d.toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'})}</b><span class="tm">${fmt(t.dur)}</span></div><audio controls preload="metadata" src="${u}"></audio><div class="row"><a class="btn sm" href="${u}" download="mades-toma-${t.id}.${t.type.includes('mp4')?'m4a':'webm'}">${IC.down}Descargar</a><span data-dw="${t.id}"><button class="btn sm" data-del="${t.id}">${IC.x}Borrar</button></span></div></div>`}).join(''):'<p class="cap">Todavía no tienes tomas. Graba la primera.</p>'};
    const stopRec=()=>{if(REC.mr&&REC.mr.state!=='inactive')REC.mr.stop();clearInterval(REC.iv);if(SEQ.id&&OWNER==='rec')seqStop()};
    go.onclick=async()=>{
      $('#rmsg',r).innerHTML='';
      if(REC.mr){stopRec();return}
      if(!window.MediaRecorder||!navigator.mediaDevices){$('#rmsg',r).innerHTML='<p class="msg err">Este navegador no puede grabar audio. Prueba con Chrome o Safari actualizados.</p>';return}
      try{REC.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:true}})}catch(e){$('#rmsg',r).innerHTML='<p class="msg err">No se pudo usar el micrófono. Permítelo en los ajustes del navegador.</p>';return}
      const type=['audio/mp4','audio/webm;codecs=opus','audio/webm'].find(t=>MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(t))||'';
      REC.mr=new MediaRecorder(REC.stream,type?{mimeType:type}:{});REC.chunks=[];REC.t0=Date.now();
      REC.mr.ondataavailable=e=>{if(e.data&&e.data.size)REC.chunks.push(e.data)};
      REC.mr.onstop=async()=>{const blob=new Blob(REC.chunks,{type:REC.mr.mimeType||type||'audio/webm'}),dur=(Date.now()-REC.t0)/1000;REC.stream.getTracks().forEach(t=>t.stop());REC.mr=null;REC.stream=null;paint();
        if(dur>.8){await takePut({date:Date.now(),dur,blob,type:blob.type});DB.recs=(DB.recs||0)+1;save();toast(logo()+'<span>Toma guardada</span>')}list()};
      REC.mr.start(500);
      const acc=DB.recAcc||'none';if(acc==='met'){OWNER='rec';metStart({})}else if(acc==='trk'){OWNER='rec';trkStart()}
      REC.iv=setInterval(()=>{const t=$('#rtime',r);if(t)t.textContent=fmt((Date.now()-REC.t0)/1000)},250);paint();
    };
    r.addEventListener('click',async e=>{
      const a=e.target.closest('[data-acc]');if(a){DB.recAcc=a.dataset.acc;save();$$('[data-acc]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===a)));return}
      const d=e.target.closest('[data-del]');if(d){d.parentNode.innerHTML=`<button class="btn sm" data-delok="${d.dataset.del}" style="border-color:var(--bad);color:var(--bad)">Sí, borrar</button>`;return}
      const k=e.target.closest('[data-delok]');if(k){await takeDel(+k.dataset.delok);list()}
    });
    paint();list();
    return()=>{stopRec();REC.urls.forEach(u=>URL.revokeObjectURL(u));REC.urls=[]};
  }};
}
/* ---------- logros ---------- */
const ACH=[
 ['primer','Primera nota','Marca tu primer ejercicio como hecho.','♪',D=>Object.keys(D.done).length>=1],
 ['diez','Diez de diez','Completa 10 ejercicios.','10',D=>Object.keys(D.done).length>=10],
 ['leccion','Lección superada','Termina todos los ejercicios de una lección.','✓',()=>LESSONS.some(l=>{const[d,t]=doneCount(l.id);return t&&d===t})],
 ['graduado','Graduado','Completa todos los ejercicios del curso.','🎓',()=>{const[d,t]=doneCount();return t&&d===t}],
 ['racha3','En racha','Practica 3 días seguidos.','3',()=>streak()>=3],
 ['racha7','Semana de fuego','Practica 7 días seguidos.','7',()=>streak()>=7],
 ['racha30','Disciplina de leyenda','Practica 30 días seguidos.','30',()=>streak()>=30],
 ['hora','Primera hora','Junta 1 hora de práctica con la app.','1h',D=>Object.values(D.secs).reduce((a,b)=>a+b,0)>=3600],
 ['diezh','Diez horas','Junta 10 horas de práctica.','10h',D=>Object.values(D.secs).reduce((a,b)=>a+b,0)>=36000],
 ['ojo','Ojo de halcón','Logra 10 aciertos en el juego del mástil.','◎',D=>Object.values(D.game).some(v=>v>=10)],
 ['mapa','Mástil en la mente','Logra 25 aciertos en el juego del mástil.','◉',D=>Object.values(D.game).some(v=>v>=25)],
 ['escenario','Primer escenario','Gana al menos una estrella en el modo reto.','★',D=>Object.values(D.reto||{}).some(r=>r.stars>=1)],
 ['cinco','Cinco estrellas','Saca 5 estrellas en el modo reto.','✦',D=>Object.values(D.reto||{}).some(r=>r.stars>=5)],
 ['gira','Gira completa','Gana estrellas en todas las canciones del reto.','⚡',D=>SONGS.every(s=>((D.reto||{})[s.id]||{}).stars>=1)],
 ['estudio','En el estudio','Graba tu primera toma.','●',D=>(D.recs||0)>=1],
 ['camaleon','Camaleón','Prueba 5 temas de color distintos.','◐',D=>Object.keys(D.tried||{}).length>=5]];
function checkAch(quiet){
  DB.ach=DB.ach||{};let any=false;
  ACH.forEach(([id,n,,ic,test])=>{if(DB.ach[id])return;let ok=false;try{ok=test(DB)}catch(e){}if(ok){DB.ach[id]=today();any=true;if(!quiet)toast(`<span class="medal on sm">${ic}</span><span><small>Logro desbloqueado</small><b>${n}</b></span>`,4200)}});
  return any;
}
function viewAch(){
  DB.ach=DB.ach||{};const got=ACH.filter(a=>DB.ach[a[0]]).length;
  return{title:'Logros',back:'#/practicar',html:`<div class="lhead"><span class="eyebrow">${got} de ${ACH.length} desbloqueados</span><h1>Logros</h1><div class="bar"><i style="width:${got/ACH.length*100}%"></i></div></div>
  <div class="achgrid">${ACH.map(([id,n,d,ic])=>{const on=DB.ach[id];return`<div class="ach ${on?'on':''}"><span class="medal ${on?'on':''}">${ic}</span><b>${n}</b><span>${d}</span>${on?`<small>${on.split('-').reverse().join('/')}</small>`:''}</div>`}).join('')}</div>`};
}
/* ---------- respaldo del progreso ---------- */
function backupCode(){return'MGH1:'+btoa(unescape(encodeURIComponent(JSON.stringify(DB))))}
function restoreCode(txt){
  txt=String(txt||'').trim();let o=null;
  try{o=txt.startsWith('MGH1:')?JSON.parse(decodeURIComponent(escape(atob(txt.slice(5))))):JSON.parse(txt)}catch(e){return false}
  if(!o||typeof o!=='object'||typeof o.done!=='object')return false;
  Object.keys(DB).forEach(k=>delete DB[k]);Object.assign(DB,{done:{},secs:{},days:{},game:{},bpm:{},theme:'auto'},o);save();applyTheme();return true;
}
