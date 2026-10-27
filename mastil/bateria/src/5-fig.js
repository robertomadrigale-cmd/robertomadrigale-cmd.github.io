/* Drum figures share the guitar exercise controls, but grade onset time, never pitch. */
const FIGST={},FM={results:[]};let DRUM_FIG=null;
const midiOf=(s,f)=>OPEN_MIDI[s]+f;
const figBpm=x=>DB.bpm[x.id]||x.bpm||60;
function figState(x){return FIGST[x.id]||(FIGST[x.id]={mic:DB.input==='mic',guide:false})}
function drumExercise(id){return ALLEX.find(x=>x.id===id)||(G[id]?{id,t:G[id].n,bpm:G[id].bpm,fig:{type:'drum',groove:id}}:null)}
function figHTML(x){const g=G[x.fig.groove],s=figState(x);return`<div class="fig drum-fig" data-fig="${x.id}"><div class="gridbox">${grooveGrid(g)}</div><div class="kitwrap">${kitSVG(g)}</div><div class="figbar"><button class="btn sm" data-fx="preview" data-id="${x.id}">Escuchar</button><button class="btn pri" data-fx="follow" data-id="${x.id}">Seguir al pulso</button><span class="minimet"><button class="icon-btn" data-fx="bpm" data-d="-5" data-id="${x.id}" aria-label="Bajar tempo">${IC.minus}</button><span data-fx="bpmv">${figBpm(x)} bpm</span><button class="icon-btn" data-fx="bpm" data-d="5" data-id="${x.id}" aria-label="Subir tempo">${IC.plus}</button></span></div><div class="chips"><button class="chip" data-fx="input" data-v="tap" data-id="${x.id}" aria-pressed="${!s.mic}">Toques</button><button class="chip" data-fx="input" data-v="mic" data-id="${x.id}" aria-pressed="${s.mic}">Micrófono</button></div><p class="cap">${g.grace?'Los adornos suenan en la guía; se califican los golpes principales.':'Con micrófono se califica el tiempo; con toques también el pad.'}</p>${padsHTML(g)}<p class="figst" role="status" data-fx="st">${DB.figbest?.[x.id]!=null?'Mejor marca: '+DB.figbest[x.id]+' %':'Escucha y después toca dos vueltas.'}</p></div>`}
function paintFig(root){$$('[data-fig]',root||document).forEach(el=>{const x=drumExercise(el.dataset.fig);if(!x)return;const active=DRUM_FIG?.x.id===x.id;const b=$('[data-fx="follow"]',el);if(b)b.textContent=active&&!DRUM_FIG.preview?'Detener':'Seguir al pulso';const p=$('[data-fx="preview"]',el);if(p)p.textContent=active&&DRUM_FIG.preview?'Detener':'Escuchar';const bpm=$('[data-fx="bpmv"]',el);if(bpm)bpm.textContent=figBpm(x)+' bpm'})}
function drumFigStop(){if(!DRUM_FIG)return;const old=DRUM_FIG;DRUM_FIG=null;old.unpads?.();micStop();if(SEQ.id==='fig')grooveStop();paintFig()}
async function figStart(x,preview){
 drumFigStop();ac();await kitLoad();const root=$(`[data-fig="${x.id}"]`);if(!root)return;const state=figState(x),g=G[x.fig.groove];
 if(!preview&&state.mic){const err=await micStart();if(err!=='ok'){toast(MICERR[err]);return}if(!root.isConnected){micStop();return}}
 const mode=!preview&&state.mic?'mic':'tap',status=$('[data-fx="st"]',root),run={x,preview,hits:[],exp:[],unpads:null};DRUM_FIG=run;FM.results=[];
 const receive=(t,pad)=>{if(DRUM_FIG!==run||!run.exp.length||t<run.exp[0].t-.12||t>run.end+.12)return;run.hits.push({t,pad});const near=run.exp.filter(e=>!e.pad||e.pad===pad).reduce((a,b)=>!a||Math.abs(b.t-t)<Math.abs(a.t-t)?b:a,null);if(near&&Math.abs(near.t-t)<=.12){gridMark(root,near.i,gradeOf((t-near.t)*1000)[0]);status.textContent=offTxt((t-near.t)*1000)}};
 if(!preview){if(mode==='mic')MIC.onHit=t=>receive(t-micLat());else run.unpads=padsMount(root,(t,pad)=>{hit({plat:'hh',tar:'sn',bom:'bd'}[pad],AC.currentTime+.005,'x');receive(t,pad)})}
 grooveRun({id:'fig',g,bpm:figBpm(x),loops:preview?1:2,count:!preview,drums:!!preview,click:!preview,
  onStart:s=>{run.exp=expectedHits(g,s.T0,s.step,2,mode);run.end=s.end},onCount:b=>{status.textContent='Cuenta: '+b},
  onStep:(i,L)=>{lightStep(root,g,i);if(i===0)status.textContent=preview?'Escucha':'Ahora tú · vuelta '+(L+1)},
  onEnd:()=>{if(DRUM_FIG!==run)return;if(!preview){const score=scoreHits(run.exp,run.hits,{pads:mode==='tap'}),pct=Math.round(score.pct*100);FM.results.push(pct);DB.figbest=DB.figbest||{};DB.figbest[x.id]=Math.max(DB.figbest[x.id]||0,pct);if(pct>=80&&ALLEX.some(a=>a.id===x.id))DB.done[x.id]=true;recordResult(g.id,'groove',score,figBpm(x));status.textContent=pct+' % · '+scoreTip(score);paintEx();refreshProgress()}else status.textContent='Ahora prueba Seguir al pulso.';drumFigStop()}});
 paintFig();
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-fx]');if(!b||!b.dataset.id)return;const x=drumExercise(b.dataset.id);if(!x)return;const s=figState(x),k=b.dataset.fx;
 if(k==='preview'||k==='follow'){if(DRUM_FIG?.x.id===x.id)drumFigStop();else figStart(x,k==='preview')}
 if(k==='input'){drumFigStop();s.mic=b.dataset.v==='mic';DB.input=s.mic?'mic':'tap';save();const root=b.closest('[data-fig]');$$('[data-fx="input"]',root).forEach(el=>el.setAttribute('aria-pressed',String(el===b)))}
 if(k==='bpm'){drumFigStop();DB.bpm[x.id]=Math.max(30,Math.min(240,figBpm(x)+ +b.dataset.d));save();paintFig()}
});
