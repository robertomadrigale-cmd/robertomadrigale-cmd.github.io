const DRUM_LANES=['bom','tar','plat'],DRUM_LANE_NAMES=['Bombo','Tarola','Platillo'];
function drumPatternNotes(g,total=g.meter*(g.bars||1)*4){const notes=[],N=Math.ceil(total*g.sub);for(let k=0;k<N;k++){
 const i=k%gSteps(g),pads=new Set();for(const row in g.rows)if(g.rows[row][i]&&g.rows[row][i]!=='-')pads.add(ROWS[row].pad);
 for(const pad of pads)notes.push({pad,lane:DRUM_LANES.indexOf(pad),b:k/g.sub,d:1/g.sub});
 }return notes;
}
SONGS.push(...['q','e','rock','rock2','cumbia','ghost','fill1','shuffle'].map(id=>({id:'drum:'+id,n:G[id].n,sub:'Patrón de batería',kind:'drum',g:id,bpm:G[id].bpm,bt:G[id].meter,beats:G[id].meter*(G[id].bars||1)*4,notes:drumPatternNotes(G[id]),lvl:lvlOf(id),chords:[]})));
function drumRetoFromSong(id,shift){const src=sbGet(id);if(!src)return null;const P=songParse(src.src),bt=DB.kbeats?.[id]||P.beats,sty=DB.kst?.[id]||P.style,TL=songTimeline(P,0,bt),g=drumSongGroove(sty,bt);return{id:'song:'+id+':drum',songId:id,kind:'drum',n:P.title,sub:'Groove del cancionero',bpm:DB.kbpm?.[id]||P.bpm,bt,sty,beats:TL.total,notes:drumPatternNotes(g,TL.total),chords:[],shift:shift||0}}
function viewDrumReto(){
 const own=[...(DB.songs||[]).map(s=>drumRetoFromSong(s.id)),drumRetoFromSong('pd0')].filter(Boolean),all=[...SONGS,...own];
 return{title:'Reto de batería',back:'#/practicar',html:`<div id="retohost"><div class="lhead"><h1>Reto de batería</h1><p class="sub">Toca Bombo, Tarola y Platillo cuando los golpes crucen la línea. Teclas Espacio, F y J. Con micrófono se califica el tiempo de cada ataque, sin identificar piezas.</p></div><div class="card">${chipRow('input','Cómo tocas',[{v:'tap',l:'Toques'},{v:'mic',l:'Micrófono'}],RETO.input)}${chipRow('speed','Velocidad',[.5,.75,1,1.2].map(v=>({v,l:Math.round(v*100)+' %'})),RETO.speed)}<p class="cap">Con micrófono usa audífonos para escuchar el click.</p></div><div class="songgrid">${all.map(s=>`<button class="card song-pick" data-dr="${esc(s.id)}"><b>${esc(s.n)}</b><span>${s.bpm} bpm · ${s.notes.length} golpes</span>${stars(DB.reto?.[s.id]?.stars||0)}</button>`).join('')}</div></div>`,mount(root){let stop=null;const start=s=>{stop?.();stop=drumRetoPlay($('#retohost',root),s,()=>{stop=null;route()})};root.addEventListener('click',e=>{const c=e.target.closest('[data-set]');if(c){RETO[c.dataset.set]=c.dataset.set==='speed'?+c.dataset.v:c.dataset.v;retoSave();$$(`[data-set="${c.dataset.set}"]`,root).forEach(b=>b.setAttribute('aria-pressed',String(b===c)))}const b=e.target.closest('[data-dr]');if(b)start(all.find(s=>s.id===b.dataset.dr))});if(RETO_PICK){const pick=RETO_PICK;RETO_PICK=null;start(pick)}return()=>stop?.()}};
}
let DRUM_RETO=null;
function drumRetoPlay(host,S,onExit){
 let destroyed=false,raf=0,unpads=null;const run={S,exp:[],hits:[],t0:0,end:0,score:null,ready:false};DRUM_RETO=run;
 const bpm=S.bpm*RETO.speed,spb=60/bpm,mode=RETO.input==='mic'?'mic':'tap';
 host.innerHTML=`<div class="lhead"><h1>${esc(S.n)}</h1><p>${Math.round(bpm)} bpm · ${mode==='mic'?'Micrófono: tiempo':'Espacio / F / J'}</p></div><canvas id="hw" class="drum-lanes" aria-label="Tres carriles: Bombo, Tarola y Platillo"></canvas><div id="drstatus" role="status">Preparando…</div><div class="pads">${DRUM_LANES.map((pad,i)=>`<button class="pad pad-${pad}" data-pad="${pad}"><b>${DRUM_LANE_NAMES[i]}</b><small>${PADS[pad].key}</small></button>`).join('')}</div><button class="btn" id="drexit">Salir</button>`;
 const cv=$('#hw',host),ctx=cv.getContext('2d'),status=$('#drstatus',host);
 const cleanup=()=>{destroyed=true;cancelAnimationFrame(raf);unpads?.();micStop();if(SEQ.id==='drumreto')seqStop();GAMEON=false;run.ready=false};
 $('#drexit',host).onclick=()=>{cleanup();onExit?.()};
 const receive=(t,pad)=>{if(!run.ready||t<run.t0-.12||t>run.end+.12)return;run.hits.push({t,pad});if(mode==='tap')hit({bom:'bd',tar:'sn',plat:'hh'}[pad],AC.currentTime+.003,'x');const near=run.exp.filter(e=>!e.pad||e.pad===pad).reduce((a,b)=>!a||Math.abs(b.t-t)<Math.abs(a.t-t)?b:a,null);if(near)status.textContent=offTxt((t-near.t)*1000)};
 const finish=()=>{const score=scoreHits(run.exp,run.hits,{pads:mode==='tap'});run.score=score;const pct=Math.round(score.pct*100),old=DB.reto?.[S.id];DB.reto=DB.reto||{};DB.reto[S.id]={score:Math.max(old?.score||0,pct),stars:Math.max(old?.stars||0,Math.floor(pct/20))};markDay();save();cleanup();status.textContent=`${pct} % · ${score.hit}/${score.n} golpes · ${scoreTip(score)}`;cv.dataset.result=String(pct)};
 function paint(){if(destroyed)return;const width=cv.clientWidth,height=cv.clientHeight,dpr=devicePixelRatio||1;cv.width=Math.round(width*dpr);cv.height=Math.round(height*dpr);ctx.scale(dpr,dpr);const now=AC.currentTime-outLat(),yHit=height-65,lw=width/3;
  ctx.font='14px system-ui';ctx.textAlign='center';for(let lane=0;lane<3;lane++){ctx.strokeStyle='#7776';ctx.beginPath();ctx.moveTo(lane*lw,0);ctx.lineTo(lane*lw,height);ctx.stroke();ctx.fillStyle=['#ff5c8a','#58d9b1','#edc86a'][lane];ctx.fillText(DRUM_LANE_NAMES[lane],lw*(lane+.5),height-18)}
  ctx.strokeStyle='#ffffff';ctx.beginPath();ctx.moveTo(0,yHit);ctx.lineTo(width,yHit);ctx.stroke();for(const note of S.notes){const t=run.t0+note.b*spb,y=yHit-(t-now)*110;if(y<0||y>height-35)continue;ctx.fillStyle=['#ff5c8a','#58d9b1','#edc86a'][note.lane];ctx.beginPath();ctx.arc(lw*(note.lane+.5),y,12,0,Math.PI*2);ctx.fill()}
  if(run.ready&&now>run.end+.2){finish();return}raf=requestAnimationFrame(paint);
 }
 (async()=>{ac();await kitLoad();if(destroyed)return;if(mode==='mic'){const err=await micStart();if(destroyed){micStop();return}if(err!=='ok'){status.textContent=MICERR[err];return}}
  GAMEON=true;run.ready=true;unpads=mode==='tap'?padsMount(host,receive):null;if(mode==='mic')MIC.onHit=t=>receive(t-micLat());
  seqStart('drumreto',S.n,()=>spb,(i,t)=>{if(i===0){run.t0=t+4*spb;run.end=run.t0+S.beats*spb;run.exp=S.notes.map(n=>({t:run.t0+n.b*spb,...(mode==='tap'?{pad:n.pad}:{})}));if(mode==='mic')run.exp=run.exp.filter((n,j,a)=>!j||Math.abs(n.t-a[j-1].t)>.001)}if(t<run.end&&(i<4||RETO.met))tick(t,i%4===0?'acc':'beat')},i=>{if(i<4)status.textContent='Cuenta: '+(i+1);else if(i===4)status.textContent='Ahora tú'});paint();
 })().catch(err=>{cleanup();status.textContent='No se pudo iniciar: '+err.message});return cleanup;
}
