/* Un solo dueño de audio/micrófono. Las cargas asíncronas se invalidan al salir. */
const RUN={token:0,timer:0,raf:0,nodes:new Set(),bus:null,active:false};
function stopAll(){RUN.token++;RUN.active=false;clearInterval(RUN.timer);cancelAnimationFrame(RUN.raf);RUN.nodes.forEach(n=>{try{n.stop()}catch(_){}});RUN.nodes.clear();if(RUN.bus){RUN.bus.disconnect();RUN.bus=null}micStop();if(typeof stopNarration==='function')stopNarration();$$('.playing,.hit').forEach(e=>e.classList.remove('playing','hit'));$$('[data-busy]').forEach(e=>{e.disabled=false;e.removeAttribute('data-busy')});const s=$('#status');if(s)s.textContent='Detenido';}
async function prepareAudio(packs=['bajo','bateria']){stopAll();const token=RUN.token;await unlockAudio();await Promise.all(packs.map(loadPack));if(token!==RUN.token)return null;RUN.bus=ac().createGain();RUN.bus.gain.value=.72;RUN.bus.connect(ac().destination);return token}
function bass(m,t,d=.6,v=.7){const n=playSample('bajo',m,t,d,v,{destination:RUN.bus||ac().destination});RUN.nodes.add(n.source);n.source.onended=()=>RUN.nodes.delete(n.source);return n}
function tick(t,strong=false){if(DB.mute)return;const n=drumHit('click',t,strong?.65:.32,{destination:RUN.bus||ac().destination});RUN.nodes.add(n.source);n.source.onended=()=>RUN.nodes.delete(n.source)}
function pulseHTML(n=4){return `<div class="pulse" aria-label="Pulso visual">${Array.from({length:n},(_,i)=>`<span>${i+1}</span>`).join('')}</div>`}
function pulsePaint(root,beat){$$('.pulse span',root).forEach((e,i)=>e.classList.toggle('on',i===beat))}
function playTimeline({events,duration,bpm=60,beats=4,onFrame,onEnd,click=true}){
 const c=ac(),start=c.currentTime+.18,token=RUN.token,spb=60/bpm;let next=0,nextBeat=0;RUN.active=true;
 const schedule=()=>{const now=c.currentTime;while(next<events.length&&start+events[next].at<now+.18){const e=events[next++];if(start+e.at>=now-.03&&e.m!=null)bass(e.m,Math.max(now,start+e.at),e.d,.7)}while(nextBeat*spb<duration&&start+nextBeat*spb<now+.18){const t=start+nextBeat*spb;if(click&&t>=now-.03)tick(Math.max(t,now),nextBeat%beats===0);nextBeat++}};
 schedule();RUN.timer=setInterval(schedule,25);
 const frame=()=>{if(token!==RUN.token)return;const elapsed=c.currentTime-outLat(c)-start;onFrame?.(elapsed,start);if(elapsed>=duration){clearInterval(RUN.timer);RUN.active=false;micStop();onEnd?.();return}RUN.raf=requestAnimationFrame(frame)};RUN.raf=requestAnimationFrame(frame);return start;
}
function bandTracks(render,reference=false){return ['bateria','armonia','metales',...(reference?['bajo']:[])].filter(k=>render[k]).map(k=>({role:k,buffer:render[k]}))}
