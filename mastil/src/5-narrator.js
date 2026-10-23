/* ---------- narrador: lee la lección en voz alta y enciende las notas que menciona ---------- */
const NARR={on:false,paused:false,items:[],i:0,lesson:null,voice:null,tok:0,lit:null,timers:[]};
const HAS_TTS='speechSynthesis' in window&&'SpeechSynthesisUtterance' in window;
function pickVoice(){
  if(!HAS_TTS)return null;const vs=speechSynthesis.getVoices();
  const by=p=>vs.find(v=>v.lang&&v.lang.toLowerCase().replace('_','-').startsWith(p));
  return by('es-mx')||by('es-us')||by('es-419')||by('es-es')||by('es')||null;
}
if(HAS_TTS){speechSynthesis.onvoiceschanged=()=>{NARR.voice=pickVoice()};NARR.voice=pickVoice()}
const ROM={I:'uno',II:'dos',III:'tres',IV:'cuatro',V:'cinco',VI:'seis',VII:'siete'};
const ORD={2:'segunda',3:'tercera',4:'cuarta',5:'quinta',6:'sexta',7:'séptima',8:'octava',9:'novena',11:'oncena',13:'trecena'};
function sayText(html){
  let t=String(html).replace(/<[^>]+>/g,'').replace(/[«»“”]/g,'');
  const RT='(?:VII|VI|IV|V|III|II|I|vii|vi|iv|iii|ii)(?:[°ø]|maj7|7)?';
  const rw=tok=>{const m=tok.match(/^(VII|VI|IV|V|III|II|I|vii|vi|iv|iii|ii)(.*)$/);return ROM[m[1].toUpperCase()]+(m[2]==='°'||m[2]==='ø'?' disminuido':m[2]==='7'?' siete':m[2]==='maj7'?' mayor siete':'')};
  t=t.replace(new RegExp('(?<![\\wÁÉÍÓÚáéíóúñ])'+RT+'(?:(?:\\s*[–\\-]\\s*|\\s+)'+RT+')+(?![\\wÁÉÍÓÚáéíóúñ])','g'),run=>run.split(/\s*[–\-]\s*|\s+/).map(rw).join(', '));
  t=t.replace(new RegExp('(?<![\\wÁÉÍÓÚáéíóúñ])'+RT+'(?=\\s*(?:[,.;:)]|y\\b|e\\b|$|→|\\s+(?:es|cumple|crea|funciona|sustituye|pide|se|a)\\b))','g'),rw);
  t=t.replace(/\((?:[x\d]{6}|[x\d]{2,}(?:[–-][x\d]+){2,}|x{0,2}\d+(?:[–-]\d+){3,})\)/g,'');
  t=t.replace(/\b(Do|Re|Mi|Fa|Sol|La|Si)([♯♭]?)m7♭5\b/g,'$1$2 menor siete bemol cinco').replace(/\b(Do|Re|Mi|Fa|Sol|La|Si)([♯♭]?)m7\b/g,'$1$2 menor siete').replace(/\b(Do|Re|Mi|Fa|Sol|La|Si)([♯♭]?)m\b/g,'$1$2 menor');
  t=t.replace(/maj7/g,' mayor siete').replace(/m7♭5/g,' menor siete bemol cinco');
  t=t.replace(/♭(\d+)ª?/g,(m,n)=>(ORD[n]||n)+' bemol').replace(/♯(\d+)ª?/g,(m,n)=>(ORD[n]||n)+' aumentada');
  t=t.replace(/(\d+)ª/g,(m,n)=>ORD[n]||n);
  t=t.replace(/♭/g,' bemol').replace(/♯/g,' sostenido').replace(/[°ø]/g,' disminuido');

  t=t.replace(/\s*[–·→]\s*/g,', ').replace(/(\d)-(?=\d)/g,'$1, ');
  t=t.replace(/\bbpm\b/gi,'pulsos por minuto').replace(/\s+/g,' ').trim();
  return t;
}
const sentences=html=>{const t=String(html).replace(/<[^>]+>/g,'');return t.split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ¿«0-9])/).map(s=>s.trim()).filter(Boolean)};
const NOTEPC={do:0,re:2,mi:4,fa:5,sol:7,la:9,si:11};
function mentions(text){
  const ev=[];let m;
  const r1=/cuerda (\d)[^.;]{0,40}?traste (\d+)/gi;while((m=r1.exec(text)))ev.push({i:m.index+m[0].length-m[2].length,s:+m[1],f:+m[2]});
  const r2=/cuerda (\d):? trastes? ((?:\d+(?:, | y )?)+)/gi;while((m=r2.exec(text))){const base=m.index+m[0].indexOf(m[2]);let n,r=/\d+/g;while((n=r.exec(m[2])))ev.push({i:base+n.index,s:+m[1],f:+n[0]})}
  const r3=/\b(Do|Re|Mi|Fa|Sol|La|Si)( sostenido| bemol)? \((\d+)\)/g;while((m=r3.exec(text))){let pc=NOTEPC[m[1].toLowerCase()];if(m[2]===' sostenido')pc=(pc+1)%12;if(m[2]===' bemol')pc=(pc+11)%12;ev.push({i:m.index,f:+m[3],pc})}
  const r4=/\((\d)\/(\d+)\)/g;while((m=r4.exec(text)))ev.push({i:m.index,s:+m[1],f:+m[2]});
  const r5=/\btrastes? (\d+)(?:, (\d+))?(?:,? y (\d+))?/gi;while((m=r5.exec(text))){if(ev.some(e=>Math.abs(e.i-m.index)<30))continue;[m[1],m[2],m[3]].forEach((v,k)=>{if(v!=null)ev.push({i:m.index+m[0].indexOf(v),f:+v})})}
  return ev.sort((a,b)=>a.i-b.i);
}
function diagramFor(el){
  if(!el)return null;
  const inside=el.querySelector&&el.querySelector('.fig,.widget');if(inside)return inside;
  const card=el.closest&&el.closest('.ex');if(card){const f=card.querySelector('.fig');if(f)return f}
  let n=el.nextElementSibling;for(let k=0;n&&k<2;k++,n=n.nextElementSibling)if(n.matches('.widget,.ex')&&n.querySelector('.fb'))return n.matches('.ex')?n.querySelector('.fig')||null:n;
  n=el.previousElementSibling;for(let k=0;n&&k<3;k++,n=n.previousElementSibling)if(n.matches('.widget')&&n.querySelector('.fb'))return n;
  return null;
}
function litDot(box,e){
  if(!box)return;box.classList.add('narrating');
  const ds=$$('.dg',box).filter(d=>{const s=+d.dataset.s,f=+d.dataset.f;if(f!==e.f)return false;if(e.s&&s!==e.s)return false;if(e.pc!=null&&(OPEN_PC[s]+f)%12!==e.pc)return false;return true});
  ds.forEach(d=>d.classList.add('lit'));
  if(ds.length&&ac()){const d=ds[0];pluck(OPEN_MIDI[+d.dataset.s]+ +d.dataset.f,AC.currentTime+.01,.9,.1)}
}
function clearLit(){$$('.narrating').forEach(b=>b.classList.remove('narrating'));$$('.dg.lit').forEach(d=>d.classList.remove('lit'))}
function buildNarration(l,root){
  const it=[],blk=i=>root.querySelector(`[data-nb="${i}"]`),head=root.querySelector('.lhead');
  it.push({el:head,text:`Lección ${l.id}. ${l.title}. ${l.lead}`});
  l.blocks.forEach((b,i)=>{
    const el=blk(i);if(!el)return;
    if(b.p&&!b.sec&&!b.step)sentences(b.p).forEach(s=>it.push({el,text:s}));
    else if(b.step){it.push({el,text:b.step+'. '+b.t+'.'});sentences(b.p).forEach(s=>it.push({el,text:s}))}
    else if(b.aim){const lis=$$('li',el);it.push({el,text:'Al terminar podrás:'});b.aim.forEach((t,k)=>it.push({el,li:lis[k],text:t}))}
    else if(b.key){it.push({el,text:'La idea clave.'});sentences(b.key).forEach(s=>it.push({el,text:s}))}
    else if(b.check){it.push({el,text:'Compruébalo. Contesta antes de ver la respuesta.'});b.check.forEach(([q])=>it.push({el,text:q}))}
    else if(b.sec){it.push({el,text:b.sec+'.'});sentences(b.p).forEach(s=>it.push({el,text:s}))}
    else if(b.box||b.trick){const lis=$$('li',el),arr=b.ul||b.ol||b.trick;it.push({el,text:(b.box||'Hoja de trucos')+'.'});arr.forEach((t,k)=>it.push({el,li:lis[k],text:t}))}
    else if(b.w){it.push({el,text:'Mira el diagrama.',demo:'widget'})}
    else if(b.ex){const x=b.ex,lis=$$('ol li',el);it.push({el,text:`Ejercicio: ${x.t}.`});x.steps.forEach((s,k)=>it.push({el,li:lis[k],text:s}));it.push({el,li:el.querySelector('.goal'),text:'Lo logras cuando: '+x.goal});if(x.fig)it.push({el,text:'Escucha la demostración.',demo:'fig',x})}
  });
  it.push({el:null,text:'Fin de la lección. Ahora haz los ejercicios con la guitarra en la mano.'});
  return it;
}
function speak(text,onB){
  return new Promise(res=>{
    if(!HAS_TTS){setTimeout(res,600);return}
    const u=new SpeechSynthesisUtterance(text);u.lang=(NARR.voice&&NARR.voice.lang)||'es-MX';if(NARR.voice)u.voice=NARR.voice;u.rate=DB.narrRate||1;
    let got=false,done=false;const fin=()=>{if(!done){done=true;res()}};
    u.onboundary=e=>{got=true;if(onB)onB(e.charIndex||0)};u.onend=fin;u.onerror=fin;
    try{speechSynthesis.speak(u)}catch(e){fin();return}
    const cps=14*(DB.narrRate||1);
    if(onB)NARR.timers.push(setTimeout(()=>{if(!got&&!done){/* sin eventos de palabra: avanzar por tiempo estimado */const t0=Date.now(),iv=setInterval(()=>{if(done||got){clearInterval(iv);return}onB((Date.now()-t0+400)/1000*cps)},120);NARR.timers.push(iv)}},400));
    NARR.timers.push(setTimeout(fin,Math.max(4000,text.length/cps*1000*2.2+3000)));
  });
}
const wait=ms=>new Promise(r=>NARR.timers.push(setTimeout(r,ms)));
async function demo(item,tok){
  if(item.demo==='fig'&&item.x){
    figStart(item.x,true);await wait(300);let n=0;while(SEQ.id==='fig'&&NARR.tok===tok&&n++<80)await wait(200);
  }else if(item.demo==='widget'){
    const btn=item.el.querySelector('.wout [data-play]');
    if(btn){btn.click();const L=btn.dataset.play.split(',').length,st=+btn.dataset.step||.5;await wait(btn.dataset.mode==='seq'?L*st*1000+500:1900)}
    else{const box=item.el;box.classList.add('narrating');const ds=$$('.dg',box);for(const d of ds.slice(0,24)){if(NARR.tok!==tok)return;d.classList.add('lit');if(ac())pluck(OPEN_MIDI[+d.dataset.s]+ +d.dataset.f,AC.currentTime+.01,.6,.1);await wait(110)}await wait(500)}
  }
}
async function narrRun(){
  const tok=++NARR.tok;
  while(NARR.on&&!NARR.paused&&NARR.tok===tok&&NARR.i<NARR.items.length){
    const item=NARR.items[NARR.i];
    $$('.narr').forEach(e=>e.classList.remove('narr'));clearLit();
    if(item.el){item.el.classList.add('narr');if(item.li)item.li.classList.add('narr');const tgt=item.li||item.el,r=tgt.getBoundingClientRect();if(r.top<80||r.bottom>innerHeight-140)tgt.scrollIntoView({block:'center',behavior:'smooth'})}
    paintNarr();
    const text=sayText(item.text),box=diagramFor(item.el),ev=box?mentions(text):[];let k=0;
    await speak(text,ev.length?ci=>{while(k<ev.length&&ev[k].i<=ci+6){litDot(box,ev[k]);k++}}:null);
    if(NARR.tok!==tok)return;
    while(k<ev.length){litDot(box,ev[k]);k++}
    if(item.demo){await demo(item,tok);if(NARR.tok!==tok)return}
    await wait(ev.length?500:150);
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
function narrCancel(){NARR.tok++;NARR.timers.forEach(t=>{clearTimeout(t);clearInterval(t)});NARR.timers=[];try{HAS_TTS&&speechSynthesis.cancel()}catch(e){}if(SEQ.id==='fig')seqStop()}
function narrStop(silent){
  narrCancel();NARR.on=false;NARR.paused=false;
  $$('.narr').forEach(e=>e.classList.remove('narr'));clearLit();
  const b=$('#narrbar');if(b)b.remove();if(!silent)paintNarr();
}
function narrJump(d){if(!NARR.on)return;narrCancel();NARR.i=Math.max(0,Math.min(NARR.items.length-1,NARR.i+d));NARR.paused=false;narrRun()}
function narrToggle(){if(!NARR.on)return;if(NARR.paused){NARR.paused=false;narrRun()}else{NARR.paused=true;narrCancel();clearLit()}paintNarr()}
function paintNarr(){
  const btn=$('[data-narr="start"]');
  if(btn)btn.innerHTML=NARR.on?IC.x+'Dejar de escuchar':IC.voice+'Escuchar la lección';
  let bar=$('#narrbar');
  if(!NARR.on){if(bar)bar.remove();return}
  if(!bar){bar=document.createElement('div');bar.id='narrbar';bar.className='player narrbar';document.body.appendChild(bar)}
  const item=NARR.items[NARR.i]||{},lab=item.demo?'Demostración':item.li?'Paso':'Leyendo';
  bar.innerHTML=`<button class="icon-btn" data-narr="prev" aria-label="Anterior">${IC.back}</button><button class="icon-btn pri" data-narr="toggle" aria-label="${NARR.paused?'Continuar':'Pausar'}">${NARR.paused?IC.play:IC.pause}</button><button class="icon-btn" data-narr="next" aria-label="Siguiente">${IC.next}</button>
   <span class="pl"><b>${NARR.paused?'En pausa':lab}</b> · ${NARR.i+1} de ${NARR.items.length}</span>
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
