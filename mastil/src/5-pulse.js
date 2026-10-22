/* ---------- pulso visual: barra de tiempos, acento en el 1, destello y modo silencioso ---------- */
const PULSE={n:4,beat:0,count:0,hideT:null,el:null};
const acc1=()=>DB.acc1!==false;
/* Todos los clicks de la app pasan por aquí. v: 'bar' (tiempo 1), 'beat' o null (subdivisión). */
function tick(t,kind,v){
  if(v===undefined)v=kind==='acc'?'bar':kind==='beat'?'beat':null;
  if(!DB.metMute){
    const k=kind==='acc'&&!acc1()?'beat':kind;
    tickSound(t,k);
  }
  if(!v||!AC)return;
  const lat=((AC.outputLatency||0)+(AC.baseLatency||0))*1000;
  setTimeout(()=>pulseBeat(v==='bar'),Math.max(0,(t-AC.currentTime)*1000+lat));
}
function pulseBeat(isBar){
  if(isBar){if(PULSE.count>0&&PULSE.count<=12)PULSE.n=PULSE.count;PULSE.count=1;PULSE.beat=0}
  else{PULSE.count++;PULSE.beat=Math.min(PULSE.beat+1,11);if(PULSE.beat>=PULSE.n)PULSE.n=PULSE.beat+1}
  paintPulse();
  if(DB.flash)flash(isBar&&acc1());
  clearTimeout(PULSE.hideT);PULSE.hideT=setTimeout(hidePulse,1700);
}
function pulseHTML(){
  return`<span class="pnum">${PULSE.beat+1}</span><span class="pdots">${Array.from({length:PULSE.n},(_,i)=>`<i class="${i===PULSE.beat?'on':''}${i===0&&acc1()?' one':''}"></i>`).join('')}</span>
  <span class="ptog"><button data-pulse="acc1" aria-pressed="${acc1()}" title="Resaltar el tiempo 1">1</button><button data-pulse="flash" aria-pressed="${!!DB.flash}" title="Destello en cada pulso">${IC.pulseflash}</button><button data-pulse="mute" aria-pressed="${!!DB.metMute}" title="Solo visual, sin click">${DB.metMute?IC.mute:IC.sound}</button></span>`;
}
function paintPulse(){
  if(/metronomo/.test(location.hash))return hidePulse();
  let el=document.getElementById('pulsebar');
  if(!el){el=document.createElement('div');el.id='pulsebar';el.setAttribute('aria-hidden','true');document.body.appendChild(el)}
  el.innerHTML=pulseHTML();el.classList.add('show');document.documentElement.classList.add('pulse-on');
  el.classList.toggle('isone',PULSE.beat===0&&acc1());
}
function hidePulse(){const el=document.getElementById('pulsebar');if(el)el.classList.remove('show');document.documentElement.classList.remove('pulse-on');PULSE.count=0}
function flash(strong){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  let f=document.getElementById('flash');
  if(!f){f=document.createElement('div');f.id='flash';document.body.appendChild(f)}
  f.classList.remove('go','strong');void f.offsetWidth;f.classList.add('go');if(strong)f.classList.add('strong');
}
document.addEventListener('playstate',()=>{if(!SEQ.id)hidePulse()});
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-pulse]');if(!b)return;
  const k=b.dataset.pulse;
  if(k==='acc1')DB.acc1=!acc1();else if(k==='flash')DB.flash=!DB.flash;else if(k==='mute')DB.metMute=!DB.metMute;
  save();
  $$(`[data-pulse="${k}"]`).forEach(x=>{x.setAttribute('aria-pressed',String(k==='acc1'?acc1():k==='flash'?!!DB.flash:!!DB.metMute));if(k==='mute')x.innerHTML=x.closest('#pulsebar')?(DB.metMute?IC.mute:IC.sound):(DB.metMute?IC.mute+'Solo visual':IC.sound+'Con sonido')});
  if(k==='acc1')$$('#beats i').forEach((x,i)=>x.classList.toggle('acc',i===0&&acc1()));
});
function pulseOptions(){return`<div><span class="cl">Ver el pulso</span><div class="chips">
  <button class="chip" data-pulse="acc1" aria-pressed="${acc1()}">Resaltar el tiempo 1</button>
  <button class="chip" data-pulse="flash" aria-pressed="${!!DB.flash}">Destello en cada pulso</button>
  <button class="chip" data-pulse="mute" aria-pressed="${!!DB.metMute}">${DB.metMute?IC.mute+'Solo visual':IC.sound+'Con sonido'}</button></div>
  <p class="cap" style="margin:6px 0 0">La barra de pulso aparece a la derecha en cualquier ejercicio con metrónomo. «Solo visual» quita el click y deja las luces.</p></div>`}
