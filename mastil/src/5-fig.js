/* ---------- diagramas de ejercicio que suenan y siguen el pulso ---------- */
const FIGST={};
const midiOf=(s,f)=>OPEN_MIDI[s]+f;
function figState(x){
  if(!FIGST[x.id])FIGST[x.id]={updown:true,per:1,guide:true,mic:false,beats:x.fig.beats||4};
  return FIGST[x.id];
}
const figBpm=x=>DB.bpm[x.id]||x.bpm||(x.fig.type==='chords'?70:60);
function seqData(F){
  const seen={},dots=[],seq=[];
  F.arr.forEach(([s,f,t,k])=>{const key=s+'-'+f;if(!seen[key]){seen[key]=1;dots.push({s,f,t:t==null?nm((OPEN_PC[s]+f)%12):t,k:k||'note'})}seq.push([s,f])});
  return{dots,seq};
}
function chordBoard(F,i){
  const [name,frets]=F.list[i],to=Math.max(5,...F.list.map(c=>Math.max(...c[1].filter(v=>v!=null))+1)),d=[],m=[];
  const{fg,barre}=chordFing(frets);
  frets.forEach((f,j)=>{const s=6-j;if(f==null){m.push(s);return}d.push({s,f,t:nm((OPEN_PC[s]+f)%12),k:'note',fg:fg[s]})});
  return fretboard({to,dots:d,muted:m,barre,label:'Acorde '+name});
}
const chordMidiF=frets=>frets.map((f,j)=>f==null?null:OPEN_MIDI[6-j]+f).filter(v=>v!=null);
// cada opción del ejercicio es un interruptor: ícono, valor actual y qué es; al tocarlo cambia al otro valor
const FTOG={updown:[['Ida y vuelta',true],['Solo ida',false],'Recorrido','<path d="M4 8h13l-3-3M20 16H7l3 3"/>'],per:[['1 por pulso',1],['2 por pulso',2],'Notas','<path d="M8 18V6l8-2v12"/><circle cx="6" cy="18" r="2"/><circle cx="14" cy="16" r="2"/>'],
  guide:[['Con guía',true],['Solo click',false],'Guía','<path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2"/>'],mic:[['Sin calificar',false],['Con micrófono',true],'Calificar','<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'],
  beats:[['4 pulsos',4],['2 pulsos',2],'Por acorde','<path d="M4 6h16M4 12h16M4 18h16"/><path d="M9 4v16"/>']};
function figTog(x,k){const st=figState(x),[a,b,lab,ic]=FTOG[k],cur=String(st[k])===String(a[1])?a:b,nxt=cur===a?b:a,on=k==='mic'?st.mic:null;
  return`<button class="ftog${on?' on':''}" data-fx="opt" data-k="${k}" data-v="${nxt[1]}" data-id="${x.id}" aria-label="${lab}: ${cur[0]}. Toca para cambiar a ${nxt[0]}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ic}</svg><b>${k==='guide'&&x.fig.type!=='seq'&&cur[1]?'Con rasgueo':cur[0]}</b><small>${lab}</small></button>`}
function figHTML(x){
  const F=x.fig,st=figState(x),ownBpm=!x.bpm;
  const bpmCtl=ownBpm?`<span class="minimet"><button class="icon-btn" data-fx="bpm" data-d="-5" data-id="${x.id}" aria-label="Bajar tempo">${IC.minus}</button><span class="v" data-fx="bpmv" data-id="${x.id}">${figBpm(x)} bpm</span><button class="icon-btn" data-fx="bpm" data-d="5" data-id="${x.id}" aria-label="Subir tempo">${IC.plus}</button></span>`:'';
  const opts=(F.type==='seq'?['updown','per','guide','mic']:['beats','guide']).map(k=>figTog(x,k)).join('');
  const board=F.type==='seq'?(()=>{const{dots}=seqData(F);if(!F.nofg)autoFingers(dots);return fretboard(Object.assign({dots,label:'Diagrama del ejercicio'},F.o))})():
    `<div class="chnow"><b data-fx="chname" data-id="${x.id}">${F.list[0][0]}</b><span data-fx="chnext" data-id="${x.id}">${F.list.length>1?'Sigue: '+F.list[1][0]:''}</span></div><div data-fx="chboard" data-id="${x.id}">${chordBoard(F,0)}</div><div class="chlist">${F.list.map((c,i)=>`<span class="pchip sm" data-fx="chip" data-i="${i}" data-id="${x.id}"><b>${c[0]}</b></span>`).join('')}</div>`;
  // transporte: escuchar, botón redondo «seguir al pulso» y tempo; abajo el estado
  return`<div class="fig" data-fig="${x.id}">${board}
   <div class="figbar"><button class="kic" data-fx="preview" data-id="${x.id}"></button><button class="kplayb" data-fx="follow" data-id="${x.id}"></button>${bpmCtl}</div>
   <div class="figstep"><button class="kic" data-fx="stp" data-d="-1" data-id="${x.id}" aria-label="Paso anterior">${FIGPREV}</button><span class="fsl" data-fx="stl" data-id="${x.id}">Paso a paso: toca › para ver ${F.type==='seq'?'cada nota con su dedo':'cada acorde'}</span><button class="kic" data-fx="stp" data-d="1" data-id="${x.id}" aria-label="Paso siguiente">${FIGNEXT}</button></div>
   <span class="figst" data-fx="st" data-id="${x.id}"></span>
   <div class="figopts" style="--n:${F.type==='seq'?4:2}">${opts}</div></div>`;
}
function figLight(id,s,f){
  const el=document.querySelector(`[data-fig="${id}"]`);if(!el)return;
  el.classList.add('playing');
  $$('.dg.on',el).forEach(d=>d.classList.remove('on'));
  if(s!=null)$$(`.dg[data-s="${s}"][data-f="${f}"]`,el).forEach(d=>d.classList.add('on'));
}
function figChord(id,F,i){
  const q=k=>document.querySelector(`[data-fx="${k}"][data-id="${id}"]`);
  const b=q('chboard');if(!b)return;
  b.innerHTML=chordBoard(F,i);q('chname').textContent=F.list[i][0];
  q('chnext').textContent=F.list.length>1?'Sigue: '+F.list[(i+1)%F.list.length][0]:'';
  $$(`[data-fx="chip"][data-id="${id}"]`).forEach(c=>c.classList.toggle('cur',+c.dataset.i===i));
}
function figStatus(id,t){const e=document.querySelector(`[data-fx="st"][data-id="${id}"]`);if(e)e.textContent=t}
function figStop(){if(SEQ.id==='fig')seqStop()}
function figStart(x,preview){
  const F=x.fig,st=figState(x),own='fig:'+x.id+(preview?':p':'');
  OWNER=own;
  if(F.type==='seq'){
    const {seq}=seqData(F);
    const order=preview||!st.updown||seq.length<3?seq:seq.concat(seq.slice(1,-1).reverse());
    const per=preview?1:st.per,count=preview?0:4*per;
    seqStart('fig',(preview?'Escuchando · ':'Siguiendo · ')+x.t,()=>preview?.75:60/figBpm(x)/per,(s,t)=>{
      if(s<count){if(s%per===0)tick(t,s===0?'acc':'beat');return}
      const k=s-count;if(preview&&k>=order.length)return;
      const i=k%order.length;
      if(!preview&&k%per===0)tick(t,(k/per)%4===0?'acc':'beat');
      if(preview||(st.guide&&!st.mic))pluck(midiOf(order[i][0],order[i][1]),t,preview?.6:60/figBpm(x)/per*1.5,.22);
    },s=>{
      if(s<count){figLight(x.id,null);figStatus(x.id,'Cuenta: '+(Math.floor(s/per)+1));return}
      const k=s-count;
      if(preview&&k>=order.length){if(OWNER===own)seqStop();return}
      const i=k%order.length;
      if(!preview&&st.mic)fmStep(x,i,order);
      figLight(x.id,order[i][0],order[i][1]);
      figStatus(x.id,preview?'Nota '+(i+1)+' de '+order.length+' · '+figWhere(F,order[i][0],order[i][1]):'Nota '+(i+1)+' de '+order.length+' · '+figWhere(F,order[i][0],order[i][1])+(st.mic&&FM.total?` · aciertos ${FM.hits} de ${FM.total}`:'')+(st.updown&&order.length>seq.length&&!st.mic?(i<seq.length?' · subiendo':' · bajando'):''));
    });
  }else{
    const L=F.list.length,beats=preview?1:st.beats,count=preview?0:4;
    seqStart('fig',(preview?'Escuchando · ':'Siguiendo · ')+x.t,()=>preview?1.8:60/figBpm(x),(s,t)=>{
      if(s<count){tick(t,s===0?'acc':'beat');return}
      const k=s-count;if(preview&&k>=L)return;
      const ci=Math.floor(k/beats)%L,first=k%beats===0;
      if(!preview)tick(t,first?'acc':'beat');
      if(first&&(preview||st.guide))chordMidiF(F.list[ci][1]).forEach((m,j)=>pluck(m,t+j*.022,preview?1:60/figBpm(x)*beats*.95,.17));
    },s=>{
      if(s<count){figStatus(x.id,'Cuenta: '+(s+1));return}
      const k=s-count;
      if(preview&&k>=L){if(OWNER===own)seqStop();return}
      const ci=Math.floor(k/beats)%L;
      if(k%beats===0){figChord(x.id,F,ci);const sl=document.querySelector(`[data-fx="stl"][data-id="${x.id}"]`);if(sl)sl.textContent=figChordWhere(F,ci)}
      figStatus(x.id,'Acorde '+(ci+1)+' de '+L+(preview?'':' · pulso '+(k%beats+1)));
    });
  }
  paintFig();
}
const FIGPREV='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',FIGNEXT='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>';
// dónde va cada nota: cuerda, traste y dedo (para leerlo sin adivinar)
function figWhere(F,s,f){if(f===0)return`cuerda ${s} al aire`;const{dots}=seqData(F);if(!F.nofg)autoFingers(dots);const d=dots.find(x=>x.s===s&&x.f===f);return`cuerda ${s}, traste ${f}${d&&d.fg?', dedo '+d.fg:''}`}
function figChordWhere(F,i){const[name,frets]=F.list[i],{fg,barre}=chordFing(frets);const parts=frets.map((f,j)=>({f,s:6-j})).filter(x=>x.f!=null&&x.f>0&&!(barre&&x.f===barre.f&&fg[x.s]===1)).map(x=>`dedo ${fg[x.s]} en cuerda ${x.s} traste ${x.f}`);
  return`${name}: ${barre?`cejilla en el traste ${barre.f} (cuerdas ${barre.s2} a ${barre.s1})${parts.length?', ':''}`:''}${parts.join(', ')}`}
const FIGHEAR='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/></svg>';
function paintFig(root){
  if(FM.ownMic&&!(SEQ.id==='fig'&&OWNER==='fig:'+FM.id)){FM.ownMic=false;fmFinish();tunerStop()}
  $$('[data-fx="preview"],[data-fx="follow"],[data-fx="bpmv"]',root||document).forEach(b=>{
    const id=b.dataset.id,x=ALLEX.find(z=>z.id===id);if(!x)return;
    const k=b.dataset.fx;
    if(k==='bpmv'){b.textContent=figBpm(x)+' bpm';return}
    const on=SEQ.id==='fig'&&OWNER==='fig:'+id+(k==='preview'?':p':'');
    const lab=on?'Detener':k==='preview'?'Escuchar el ejercicio':'Seguir al pulso';
    b.innerHTML=k==='preview'?(on?IC.stop:FIGHEAR):(on?IC.stop:IC.play)+`<span>${lab}</span>`;b.setAttribute('aria-label',lab);b.title=lab;
    b.classList.toggle('on',on&&k==='preview');
  });
  $$('.fig').forEach(el=>{
    const id=el.dataset.fig,active=SEQ.id==='fig'&&OWNER.startsWith('fig:'+id);
    if(!active&&el.classList.contains('playing')){el.classList.remove('playing');$$('.dg.on',el).forEach(d=>d.classList.remove('on'));if(FM.id===id&&FM.total)figStatus(id,fmSummary());else figStatus(id,'')}
  });
}
document.addEventListener('playstate',()=>paintFig());
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-fx]');if(!b)return;
  const id=b.dataset.id,x=ALLEX.find(z=>z.id===id),k=b.dataset.fx;if(!x)return;
  if(k==='preview'||k==='follow'){const own='fig:'+id+(k==='preview'?':p':'');if(SEQ.id==='fig'&&OWNER===own){figStop()}else if(k==='follow'&&figState(x).mic&&x.fig.type==='seq'){fmStart(x)}else figStart(x,k==='preview');paintFig()}
  else if(k==='stp'){if(SEQ.id==='fig'&&OWNER.startsWith('fig:'+id))figStop();const F=x.fig,st=figState(x),d=+b.dataset.d,sl=document.querySelector(`[data-fx="stl"][data-id="${id}"]`);ac();
    if(F.type==='seq'){const{seq}=seqData(F),n=seq.length;st.si=st.si==null?(d>0?0:n-1):(st.si+d+n)%n;const[ss,ff]=seq[st.si];figLight(id,ss,ff);pluck(midiOf(ss,ff),AC.currentTime+.02,1.2,.24);if(sl)sl.textContent=`Nota ${st.si+1} de ${n}: ${figWhere(F,ss,ff)}`}
    else{const n=F.list.length;st.si=st.si==null?(d>0?0:n-1):(st.si+d+n)%n;figChord(id,F,st.si);chordMidiF(F.list[st.si][1]).forEach((m,j)=>pluck(m,AC.currentTime+.02+j*.03,1.6,.17));if(sl)sl.textContent=`Acorde ${st.si+1} de ${n} · ${figChordWhere(F,st.si)}`}}
  else if(k==='bpm'){DB.bpm[id]=Math.max(30,Math.min(220,figBpm(x)+ +b.dataset.d));save();paintFig()}
  else if(k==='opt'){const st=figState(x),key=b.dataset.k,v=b.dataset.v;st[key]=v==='true'?true:v==='false'?false:+v;b.outerHTML=figTog(x,key);if(SEQ.id==='fig'&&OWNER==='fig:'+id)figStart(x,false)}
  else if(k==='chip'&&x.fig.type==='chords'){const i=+b.dataset.i;if(!(SEQ.id==='fig'&&OWNER.startsWith('fig:'+id))){figChord(id,x.fig,i);if(ac())chordMidiF(x.fig.list[i][1]).forEach((m,j)=>pluck(m,AC.currentTime+.02+j*.022,1.2,.17))}}
});
/* ---------- iluminar notas al escuchar en los diagramas interactivos ---------- */
function lightPcs(box,pcs,ms){
  if(!box)return;box.classList.add('lighting');
  $$('.dg',box).forEach(d=>{const pc=(OPEN_PC[+d.dataset.s]+ +d.dataset.f)%12;if(pcs.includes(pc))d.classList.add('lit')});
  clearTimeout(box._lt);box._lt=setTimeout(()=>{box.classList.remove('lighting');$$('.dg.lit',box).forEach(d=>d.classList.remove('lit'))},ms);
}
function lightSequence(btn,list,mode,step){
  const box=btn.closest('.widget');if(!box||!$('.fb',box))return;
  if(mode==='seq')list.forEach((m,i)=>setTimeout(()=>{$$('.dg.lit',box).forEach(d=>d.classList.remove('lit'));lightPcs(box,[m%12],step*1000+250)},30+i*step*1000));
  else lightPcs(box,[...new Set(list.map(m=>m%12))],1600);
}

/* ---------- calificar con micrófono: escucha la nota en cada paso ---------- */
const FM={id:null,target:null,prev:null,hits:0,total:0,round:0,last:-1,run:0,ownMic:false,results:[]};
async function fmStart(x){
  if(!TUN.stream){
    toast('Activando el micrófono… toca cerca del teléfono.');
    let err=null;await tunerStart(fmPitch,e=>{err=e});
    if(err||!TUN.stream){toast({denied:'El micrófono está bloqueado. Permite el acceso en los ajustes del navegador.',nomic:'No se encontró un micrófono.',nosupport:'Este navegador no permite usar el micrófono aquí.'}[err]||'No se pudo activar el micrófono.',5000);return}
    FM.ownMic=true;
  }
  Object.assign(FM,{id:x.id,target:null,prev:null,hits:0,total:0,round:0,last:-1,run:0,results:[]});
  const el=document.querySelector(`[data-fig="${x.id}"]`);if(el)$$('.dg',el).forEach(d=>d.classList.remove('hit','miss'));
  figStart(x,false);paintFig();
}
function fmDot(t,cls){const el=document.querySelector(`[data-fig="${FM.id}"]`);if(!el||!t)return;$$(`.dg[data-s="${t.s}"][data-f="${t.f}"]`,el).forEach(d=>{d.classList.remove('hit','miss');d.classList.add(cls)})}
function fmClose(t){if(!t||t.done)return;t.done=true;FM.total++;if(t.hit){FM.hits++;fmDot(t,'hit')}else fmDot(t,'miss')}
function fmStep(x,i,order){
  if(i===0&&FM.total>0&&FM.last!==-1){fmClose(FM.prev&&FM.prev.t);fmClose(FM.target);FM.prev=null;FM.target=null;fmRound(x)}
  if(FM.target){const p=FM.target;FM.prev={t:p,until:performance.now()+280};setTimeout(()=>{if(FM.prev&&FM.prev.t===p){fmClose(p);FM.prev=null}},300)}
  const [s,f]=order[i];FM.target={s,f,m:midiOf(s,f),hit:false,done:false};FM.last=i;
}
function fmRound(x){
  FM.round++;const pct=Math.round(FM.hits/FM.total*100);FM.results.push(pct);
  DB.figbest=DB.figbest||{};if(!DB.figbest[x.id]||pct>DB.figbest[x.id]){DB.figbest[x.id]=pct;save()}
  toast(`Ronda ${FM.round}: ${FM.hits} de ${FM.total} notas (${pct} %)${pct>=90?' · ¡excelente!':pct>=70?' · vas bien':' · baja el tempo y repite'}`,3500);
  FM.hits=0;FM.total=0;
  setTimeout(()=>{const el=document.querySelector(`[data-fig="${x.id}"]`);if(el)$$('.dg',el).forEach(d=>d.classList.remove('hit','miss'))},700);
}
function fmFinish(){if(FM.target&&!FM.target.done&&FM.target.hit)fmClose(FM.target);FM.target=null;FM.prev=null}
function fmSummary(){const best=(DB.figbest||{})[FM.id];const last=FM.results.length?FM.results[FM.results.length-1]:Math.round(FM.hits/Math.max(1,FM.total)*100);return`Última ronda: ${last} %`+(best!=null?` · mejor: ${best} %`:'')}
function fmPitch(fr){
  if(!fr||!FM.id||!(SEQ.id==='fig'&&OWNER==='fig:'+FM.id)){FM.run=0;return}
  const n=Math.round(69+12*Math.log2(fr/440)),pc=((n%12)+12)%12;
  FM.run=(FM.lastPc===pc)?FM.run+1:1;FM.lastPc=pc;if(FM.run<2)return;
  const ok=t=>t&&!t.hit&&!t.done&&((t.m%12)===pc);
  if(ok(FM.target)){FM.target.hit=true;fmDot(FM.target,'hit')}
  else if(FM.prev&&performance.now()<FM.prev.until&&ok(FM.prev.t)){FM.prev.t.hit=true;fmDot(FM.prev.t,'hit')}
}
