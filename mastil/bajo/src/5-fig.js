const FIGST={};let FIGRUN=null;
function figState(x){return FIGST[x.id]||(FIGST[x.id]={mic:false,si:-1})}
const figBpm=x=>DB.bpm[x.id]||x.bpm;
const figWhere=n=>`${nn(n.m)} · cuerda ${n.s}, ${n.f?'traste '+n.f+', dedo '+n.fg:'al aire'} · ${n.d} ${n.d===1?'pulso':'pulsos'}`;
function figHTML(x){const ns=notesOf(x),st=figState(x);return `<div class="fig" data-fig="${x.id}">${fretboard({dots:ns})}<details><summary>Ver tablatura</summary><pre class="tab" tabindex="0">${esc(tablature(ns))}</pre></details><div class="figbar"><button data-fx="listen">Escuchar</button><button data-fx="follow" class="primary">Seguir al pulso</button><button data-stop>Detener</button></div><div class="controls"><label>Tempo (bpm)<input type="number" min="35" max="180" value="${figBpm(x)}" data-tempo="${x.id}"></label><label class="toggle"><input type="checkbox" data-mic="${x.id}" ${st.mic?'checked':''}> Calificar con micrófono</label></div><p class="caption">Con micrófono, usa audífonos: la nota guía se apaga. Sin micrófono, toca «Marcar pulso» para practicar el ritmo.</p><div class="figstep"><button data-fx="prev" aria-label="Nota anterior">Anterior</button><button data-fx="next" aria-label="Nota siguiente">Siguiente</button><span class="where">Paso a paso: empieza con Siguiente.</span></div>${pulseHTML(x.beats)}<button data-fx="tap">Marcar pulso</button><p class="figstatus" role="status">Mejor con micrófono: ${DB.figbest[x.id]??'—'} %</p><div class="notechips">${ns.map((n,i)=>`<span data-note="${i}">${noteName(n.m)}<small>${n.s}/${n.f}</small></span>`).join('')}</div></div>`}
function fmStep(run,time){return run.targets.find(n=>time>=n.at&&time<n.at+n.dur)}
function fmPitch(run,p){if(!p){run.targets.forEach(n=>n.reads=0);return}const t=p.t-run.start,n=fmStep(run,t);if(!n)return;const ok=Math.abs(p.m-n.m)<=.5;if(ok){n.reads++;if(n.reads>=2)n.hit=true}else n.reads=0}
function exerciseTargets(ns,bpm,rounds=2,count=4){const spb=60/bpm,targets=[];let at=count*spb;for(let r=0;r<rounds;r++)for(let i=0;i<ns.length;i++){const n=ns[i];targets.push({...n,at,dur:n.d*spb,round:r,i,hit:false,reads:0});at+=n.d*spb}return {targets,duration:at,spb}}
async function figStart(x,preview=false){
 const st=figState(x),token=await prepareAudio();if(token===null)return;
 const root=$(`[data-fig="${x.id}"]`);if(!root)return;const ns=notesOf(x),bpm=figBpm(x),spec=exerciseTargets(ns,bpm,preview?1:2,preview?0:x.beats);
 const run={...spec,x,root,mic:!preview&&st.mic,start:0,scored:new Set(),last:-1};FIGRUN=run;
 if(run.mic){await micStart(p=>fmPitch(run,p));if(token!==RUN.token)return}
 const events=run.targets.map(n=>({at:n.at,m:preview||!run.mic?n.m:null,d:n.dur*.82}));
 $('.figstatus',root).textContent=preview?'Escucha el ejemplo.':run.mic?'Toca tu bajo después de la cuenta.':'Toca Marcar pulso al empezar cada nota; se califica solo tu ritmo.';
 run.start=playTimeline({events,duration:spec.duration,bpm,beats:x.beats,click:!preview,onFrame:time=>{
   pulsePaint(root,Math.max(0,Math.floor(time/spec.spb))%x.beats);const n=fmStep(run,time);
   if(n){const idx=run.targets.indexOf(n);if(idx!==run.last){run.last=idx;$('.where',root).textContent=`Ronda ${n.round+1} · ${figWhere(n)}`;$$('.dot',root).forEach(e=>e.classList.toggle('playing',+e.dataset.s===n.s&&+e.dataset.f===n.f));$$('[data-note]',root).forEach(e=>{const k=+e.dataset.note;e.classList.toggle('playing',k===n.i);e.classList.toggle('hit',!!run.targets.find(t=>t.round===n.round&&t.i===k)?.hit)})}}
   else if(time>=0&&time<(preview?0:x.beats*spec.spb))$('.where',root).textContent='Cuenta de entrada: '+(Math.floor(time/spec.spb)+1);
   if(!preview)for(let r=0;r<2;r++){const rows=run.targets.filter(n=>n.round===r),end=rows.at(-1).at+rows.at(-1).dur;if(time>=end&&!run.scored.has(r)){run.scored.add(r);const pct=Math.round(rows.filter(n=>n.hit).length/rows.length*100);if(run.mic)recordResult(x.id,pct);$('.figstatus',root).textContent=`Ronda ${r+1}: ${pct} %${run.mic?' · mejor: '+DB.figbest[x.id]+' %':' · ritmo en pantalla'}${pct>=80?' · Meta de precisión alcanzada.':' · Baja el tempo y repite.'}`;const card=root.closest('.exercise');if(card&&DB.done[x.id])$('.exbadge',card).textContent='Completado'}}
 },onEnd:()=>{$$('.playing',root).forEach(e=>e.classList.remove('playing'));FIGRUN=null;if(preview)$('.figstatus',root).textContent='Ahora prueba Seguir al pulso.'}});
}
async function figAction(button){const root=button.closest('[data-fig]'),x=ALLEX.find(x=>x.id===root?.dataset.fig);if(!x)return;
 const action=button.dataset.fx;if(action==='tap'){const run=FIGRUN;if(!run||!RUN.active||run.x.id!==x.id||run.mic)return;const t=ac().currentTime-outLat()-run.start,n=run.targets.find(n=>!n.hit&&Math.abs(t-n.at)<.28);if(n){n.hit=true;$(`[data-note="${n.i}"]`,root)?.classList.add('hit')}return}
 if(action==='listen'||action==='follow'){await figStart(x,action==='listen');return}
 const st=figState(x),ns=notesOf(x);st.si=st.si<0?(action==='prev'?ns.length-1:0):(st.si+(action==='prev'?-1:1)+ns.length)%ns.length;const token=await prepareAudio(['bajo']);if(token===null)return;const n=ns[st.si];bass(n.m,ac().currentTime+.02,.8);$('.where',root).textContent=figWhere(n);$$('.dot',root).forEach(e=>e.classList.toggle('playing',+e.dataset.s===n.s&&+e.dataset.f===n.f));
}
