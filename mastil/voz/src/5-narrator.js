/* ---------- narrador: lee la lección en voz alta (voz del dispositivo, español) ----------
   Versión del narrador de Roka Guitar sin el mástil: lee cada bloque y lo resalta. */
const NARR={on:false,paused:false,items:[],i:0,lesson:null,voice:null,tok:0,timers:[]};
const HAS_TTS='speechSynthesis' in window&&'SpeechSynthesisUtterance' in window;
function pickVoice(){
  if(!HAS_TTS)return null;const vs=speechSynthesis.getVoices();
  const by=p=>vs.find(v=>v.lang&&v.lang.toLowerCase().replace('_','-').startsWith(p));
  return by('es-mx')||by('es-us')||by('es-419')||by('es-es')||by('es')||null;
}
if(HAS_TTS){speechSynthesis.onvoiceschanged=()=>{NARR.voice=pickVoice()};NARR.voice=pickVoice()}
function sayText(html){
  let t=String(html).replace(/<[^>]+>/g,'').replace(/[«»“”]/g,'');
  // «Do3» → «Do 3»; ♯/♭ y abreviaturas se leen completas
  t=t.replace(/\b(Do|Re|Mi|Fa|Sol|La|Si)([♯♭]?)(\d)\b/g,'$1$2 $3');
  t=t.replace(/♭/g,' bemol').replace(/♯/g,' sostenido').replace(/±/g,'más o menos ');
  t=t.replace(/(\d)-(\d)-(\d)-(\d)/g,'$1, $2, $3, $4').replace(/(\d)-(\d)-(\d)/g,'$1, $2, $3');
  t=t.replace(/\s*[–·→]\s*/g,', ').replace(/\bbpm\b/gi,'pulsos por minuto').replace(/%/g,' por ciento').replace(/\s+/g,' ').trim();
  return t;
}
const sentences=html=>{const t=String(html).replace(/<[^>]+>/g,'');return t.split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ¿«0-9])/).map(s=>s.trim()).filter(Boolean)};
function buildNarration(l,root){
  const it=[],blk=i=>root.querySelector(`[data-nb="${i}"]`),head=root.querySelector('.lhead');
  it.push({el:head,text:`Lección ${l.id}. ${l.title}. ${l.lead}`});
  l.blocks.forEach((b,i)=>{
    const el=blk(i);if(!el)return;
    if(b.step){it.push({el,text:b.step+'. '+b.t+'.'});sentences(b.p).forEach(s=>it.push({el,text:s}))}
    else if(b.aim){const lis=$$('li',el);it.push({el,text:'Al terminar podrás:'});b.aim.forEach((t,k)=>it.push({el,li:lis[k],text:t}))}
    else if(b.key){it.push({el,text:'La idea clave.'});sentences(b.key).forEach(s=>it.push({el,text:s}))}
    else if(b.check){it.push({el,text:'Compruébalo. Contesta antes de ver la respuesta.'});b.check.forEach(([q])=>it.push({el,text:q}))}
    else if(b.box||b.trick){const lis=$$('li',el),arr=b.ul||b.ol||b.trick;it.push({el,text:(b.box||'Hoja de trucos')+'.'});arr.forEach((t,k)=>it.push({el,li:lis[k],text:t}))}
    else if(b.ex){const x=b.ex,lis=$$('ol li',el);it.push({el,text:`Ejercicio: ${x.t}.`});x.steps.forEach((s,k)=>it.push({el,li:lis[k],text:s}));it.push({el,li:el.querySelector('.goal'),text:'Lo logras cuando: '+x.goal})}
    else if(b.p)sentences(b.p).forEach(s=>it.push({el,text:s}));
  });
  it.push({el:null,text:'Fin de la lección. Ahora haz los ejercicios con la app.'});
  return it;
}
function speak(text){
  return new Promise(res=>{
    if(!HAS_TTS){setTimeout(res,600);return}
    const u=new SpeechSynthesisUtterance(text);u.lang=(NARR.voice&&NARR.voice.lang)||'es-MX';if(NARR.voice)u.voice=NARR.voice;u.rate=DB.narrRate||1;
    let done=false;const fin=()=>{if(!done){done=true;res()}};
    u.onend=fin;u.onerror=fin;
    try{speechSynthesis.speak(u)}catch(e){fin();return}
    NARR.timers.push(setTimeout(fin,Math.max(4000,text.length/(14*(DB.narrRate||1))*1000*2.2+3000)));
  });
}
const wait=ms=>new Promise(r=>NARR.timers.push(setTimeout(r,ms)));
async function narrRun(){
  const tok=++NARR.tok;
  while(NARR.on&&!NARR.paused&&NARR.tok===tok&&NARR.i<NARR.items.length){
    const item=NARR.items[NARR.i];
    $$('.narr').forEach(e=>e.classList.remove('narr'));
    if(item.el){item.el.classList.add('narr');if(item.li)item.li.classList.add('narr');const tgt=item.li||item.el,r=tgt.getBoundingClientRect();if(r.top<80||r.bottom>innerHeight-140)tgt.scrollIntoView({block:'center',behavior:'smooth'})}
    paintNarr();
    await speak(sayText(item.text));
    if(NARR.tok!==tok)return;
    await wait(150);
    if(NARR.tok!==tok)return;
    NARR.i++;
  }
  if(NARR.tok===tok&&NARR.i>=NARR.items.length)narrStop();
}
function narrStart(l,root){
  if(!HAS_TTS){toast('Este navegador no tiene voz para leer en voz alta.');return}
  narrStop(true);seqStop();
  NARR.on=true;NARR.paused=false;NARR.lesson=l.id;NARR.items=buildNarration(l,root);NARR.i=0;
  try{speechSynthesis.cancel()}catch(e){}
  paintNarr();narrRun();
}
function narrCancel(){NARR.tok++;NARR.timers.forEach(t=>clearTimeout(t));NARR.timers=[];try{HAS_TTS&&speechSynthesis.cancel()}catch(e){}}
function narrStop(silent){
  narrCancel();NARR.on=false;NARR.paused=false;
  $$('.narr').forEach(e=>e.classList.remove('narr'));
  const b=$('#narrbar');if(b)b.remove();if(!silent)paintNarr();
}
function narrJump(d){if(!NARR.on)return;narrCancel();NARR.i=Math.max(0,Math.min(NARR.items.length-1,NARR.i+d));NARR.paused=false;narrRun()}
function narrToggle(){if(!NARR.on)return;if(NARR.paused){NARR.paused=false;narrRun()}else{NARR.paused=true;narrCancel()}paintNarr()}
function paintNarr(){
  const btn=$('[data-narr="start"]');
  if(btn)btn.innerHTML=NARR.on?IC.x+'Dejar de escuchar':IC.voice+'Escuchar la lección';
  let bar=$('#narrbar');
  if(!NARR.on){if(bar)bar.remove();return}
  if(!bar){bar=document.createElement('div');bar.id='narrbar';bar.className='player narrbar';document.body.appendChild(bar)}
  const item=NARR.items[NARR.i]||{};
  bar.innerHTML=`<button class="icon-btn" data-narr="prev" aria-label="Anterior">${IC.back}</button><button class="icon-btn pri" data-narr="toggle" aria-label="${NARR.paused?'Continuar':'Pausar'}">${NARR.paused?IC.play:IC.pause}</button><button class="icon-btn" data-narr="next" aria-label="Siguiente">${IC.next}</button>
   <span class="pl"><b>${NARR.paused?'En pausa':item.li?'Paso':'Leyendo'}</b> · ${NARR.i+1} de ${NARR.items.length}</span>
   <span class="seg">${[.85,1,1.2].map(v=>`<button data-narr="rate" data-v="${v}" aria-pressed="${(DB.narrRate||1)===v}">${v===1?'1×':v+'×'}</button>`).join('')}</span>
   <button class="icon-btn" data-narr="stop" aria-label="Cerrar">${IC.x}</button>`;
}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-narr]');if(!b)return;const a=b.dataset.narr;
  if(a==='start'){if(NARR.on){narrStop();return}const l=LESSONS.find(x=>x.id===+b.dataset.l);if(l)narrStart(l,$('#page'))}
  else if(a==='toggle')narrToggle();
  else if(a==='prev')narrJump(-1);
  else if(a==='next')narrJump(1);
  else if(a==='stop')narrStop();
  else if(a==='rate'){DB.narrRate=+b.dataset.v;save();paintNarr();if(NARR.on&&!NARR.paused){narrCancel();narrRun()}}
});
