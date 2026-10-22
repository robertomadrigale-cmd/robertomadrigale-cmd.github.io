/* ---------- diagramas de ejercicio que suenan y siguen el pulso ---------- */
const FIGST={};
const midiOf=(s,f)=>OPEN_MIDI[s]+f;
function figState(x){
  if(!FIGST[x.id])FIGST[x.id]={updown:true,per:1,guide:true,beats:x.fig.beats||4};
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
  frets.forEach((f,j)=>{const s=6-j;if(f==null){m.push(s);return}d.push({s,f,t:nm((OPEN_PC[s]+f)%12),k:'note'})});
  return fretboard({to,dots:d,muted:m,label:'Acorde '+name});
}
const chordMidiF=frets=>frets.map((f,j)=>f==null?null:OPEN_MIDI[6-j]+f).filter(v=>v!=null);
function figHTML(x){
  const F=x.fig,st=figState(x),ownBpm=!x.bpm;
  const bpmCtl=ownBpm?`<span class="minimet"><button class="icon-btn" data-fx="bpm" data-d="-5" data-id="${x.id}" aria-label="Bajar tempo">${IC.minus}</button><span class="v" data-fx="bpmv" data-id="${x.id}">${figBpm(x)} bpm</span><button class="icon-btn" data-fx="bpm" data-d="5" data-id="${x.id}" aria-label="Subir tempo">${IC.plus}</button></span>`:'';
  const opt=(k,v,l)=>`<button class="chip" data-fx="opt" data-k="${k}" data-v="${v}" data-id="${x.id}" aria-pressed="${String(st[k])===String(v)}">${l}</button>`;
  const opts=F.type==='seq'
    ?`${opt('updown',true,'Ida y vuelta')}${opt('updown',false,'Solo ida')}<span class="sep"></span>${opt('per',1,'1 nota por pulso')}${opt('per',2,'2 notas por pulso')}<span class="sep"></span>${opt('guide',true,'Con nota guía')}${opt('guide',false,'Solo click')}`
    :`${opt('beats',2,'2 pulsos por acorde')}${opt('beats',4,'4 pulsos por acorde')}<span class="sep"></span>${opt('guide',true,'Con rasgueo guía')}${opt('guide',false,'Solo click')}`;
  const board=F.type==='seq'?(()=>{const{dots}=seqData(F);return fretboard(Object.assign({dots,label:'Diagrama del ejercicio'},F.o))})():
    `<div class="chnow"><b data-fx="chname" data-id="${x.id}">${F.list[0][0]}</b><span data-fx="chnext" data-id="${x.id}">${F.list.length>1?'Sigue: '+F.list[1][0]:''}</span></div><div data-fx="chboard" data-id="${x.id}">${chordBoard(F,0)}</div><div class="chlist">${F.list.map((c,i)=>`<span class="pchip sm" data-fx="chip" data-i="${i}" data-id="${x.id}"><b>${c[0]}</b></span>`).join('')}</div>`;
  return`<div class="fig" data-fig="${x.id}">${board}
   <div class="figbar"><button class="btn sm" data-fx="preview" data-id="${x.id}"></button><button class="btn sm pri" data-fx="follow" data-id="${x.id}"></button>${bpmCtl}<span class="figst" data-fx="st" data-id="${x.id}"></span></div>
   <div class="chips figopts">${opts}</div></div>`;
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
    seqStart('fig',(preview?'Escuchando · ':'Siguiendo · ')+x.t,()=>preview?.34:60/figBpm(x)/per,(s,t)=>{
      if(s<count){if(s%per===0)tick(t,s===0?'acc':'beat');return}
      const k=s-count;if(preview&&k>=order.length)return;
      const i=k%order.length;
      if(!preview&&k%per===0)tick(t,i===0?'acc':'beat');
      if(preview||st.guide)pluck(midiOf(order[i][0],order[i][1]),t,preview?.6:60/figBpm(x)/per*1.5,.22);
    },s=>{
      if(s<count){figLight(x.id,null);figStatus(x.id,'Cuenta: '+(Math.floor(s/per)+1));return}
      const k=s-count;
      if(preview&&k>=order.length){if(OWNER===own)seqStop();return}
      const i=k%order.length;figLight(x.id,order[i][0],order[i][1]);
      figStatus(x.id,preview?'Nota '+(i+1)+' de '+order.length:'Nota '+(i+1)+' de '+order.length+(st.updown&&order.length>seq.length?(i<seq.length?' · subiendo':' · bajando'):''));
    });
  }else{
    const L=F.list.length,beats=preview?1:st.beats,count=preview?0:4;
    seqStart('fig',(preview?'Escuchando · ':'Siguiendo · ')+x.t,()=>preview?1.1:60/figBpm(x),(s,t)=>{
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
      if(k%beats===0)figChord(x.id,F,ci);
      figStatus(x.id,'Acorde '+(ci+1)+' de '+L+(preview?'':' · pulso '+(k%beats+1)));
    });
  }
  paintFig();
}
function paintFig(root){
  $$('[data-fx="preview"],[data-fx="follow"],[data-fx="bpmv"]',root||document).forEach(b=>{
    const id=b.dataset.id,x=ALLEX.find(z=>z.id===id);if(!x)return;
    const k=b.dataset.fx;
    if(k==='bpmv'){b.textContent=figBpm(x)+' bpm';return}
    const on=SEQ.id==='fig'&&OWNER==='fig:'+id+(k==='preview'?':p':'');
    b.innerHTML=on?IC.stop+'Detener':k==='preview'?IC.play+'Escuchar':IC.timer+'Seguir al pulso';
    b.classList.toggle('on',on&&k==='preview');
  });
  $$('.fig').forEach(el=>{
    const id=el.dataset.fig,active=SEQ.id==='fig'&&OWNER.startsWith('fig:'+id);
    if(!active&&el.classList.contains('playing')){el.classList.remove('playing');$$('.dg.on',el).forEach(d=>d.classList.remove('on'));figStatus(id,'')}
  });
}
document.addEventListener('playstate',()=>paintFig());
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-fx]');if(!b)return;
  const id=b.dataset.id,x=ALLEX.find(z=>z.id===id),k=b.dataset.fx;if(!x)return;
  if(k==='preview'||k==='follow'){const own='fig:'+id+(k==='preview'?':p':'');if(SEQ.id==='fig'&&OWNER===own)figStop();else figStart(x,k==='preview');paintFig()}
  else if(k==='bpm'){DB.bpm[id]=Math.max(30,Math.min(220,figBpm(x)+ +b.dataset.d));save();paintFig()}
  else if(k==='opt'){const st=figState(x),key=b.dataset.k,v=b.dataset.v;st[key]=v==='true'?true:v==='false'?false:+v;$$(`[data-fx="opt"][data-k="${key}"][data-id="${id}"]`).forEach(c=>c.setAttribute('aria-pressed',String(c===b)));if(SEQ.id==='fig'&&OWNER==='fig:'+id)figStart(x,false)}
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
