/* Estado v2: migración aditiva sobre la misma clave de la v1. */
for(const k of ['stars','best','today','secs','days'])if(!DB[k]||typeof DB[k]!=='object')DB[k]={};
for(const k of ['hist','rangeHist'])if(!Array.isArray(DB[k]))DB[k]=[];
DB.hist=DB.hist.slice(-400);
const starsFor=s=>s>=.85?3:s>=.7?2:s>=.5?1:0;
Object.entries(DB.best).forEach(([id,s])=>{if(Number.isFinite(s))DB.stars[id]=Math.max(DB.stars[id]||0,starsFor(s))});
if(DB.range&&!DB.rangeHist.length)DB.rangeHist.push({d:DB.range.at||today(),lo:DB.range.lo,hi:DB.range.hi});
DB.sung=Number.isFinite(DB.sung)?DB.sung:DB.hist.length;
const LEVELS=['','Base','Control','Agilidad y rango'];
const levelStars=l=>DRILLS.filter(d=>d.lvl===l&&!d.breath).reduce((n,d)=>n+(DB.stars[d.id]||0),0);
const levelOpen=l=>l===1||(levelOpen(l-1)&&levelStars(l-1)>=10);
const currentLevel=()=>levelOpen(3)?3:levelOpen(2)?2:1;
const starText=n=>'★'.repeat(n)+'☆'.repeat(3-n);
const scoreText=s=>s==null?'Sin calificación':Math.round(s*100)+' %';
const mean=a=>a.length?a.reduce((s,n)=>s+n,0)/a.length:null;
function recordRange(lo,hi){
  if(!Number.isFinite(lo)||!Number.isFinite(hi)||hi<lo)return;
  if(DB.range&&!DB.rangeHist.length)DB.rangeHist.push({d:DB.range.at||today(),lo:DB.range.lo,hi:DB.range.hi});
  const last=DB.rangeHist[DB.rangeHist.length-1];
  DB.range={...(DB.range||{}),lo,hi,at:today()};
  if(!last||last.lo!==lo||last.hi!==hi)DB.rangeHist.push({d:today(),lo,hi});
  save();
}
function growRange(spec){
  if(!DB.range||!spec)return false;
  let {lo,hi}=DB.range;
  // En sirenas se evalúa cada altura por separado; no se atribuye el acierto al extremo.
  spec.targets.filter(g=>g.ph==='S').forEach(g=>Object.entries(g.bins||{}).forEach(([m,b])=>{
    if(b.n>=3&&b.h/b.n>=.6){lo=Math.min(lo,+m);hi=Math.max(hi,+m)}
  }));
  if(lo===DB.range.lo&&hi===DB.range.hi)return false;
  recordRange(lo,hi);return true;
}
function recordResult(id,spec){
  const s=spec?specScore(spec):null,prev=DB.best[id],before=DB.stars[id]||0;
  DB.today[id]=today();
  if(id!=='respira'&&id!=='rango')DB.sung++;
  if(s!=null){DB.best[id]=Math.max(prev||0,s);DB.stars[id]=Math.max(before,starsFor(s));DB.hist.push({d:today(),id,s});DB.hist=DB.hist.slice(-400)}
  const grew=growRange(spec);markDay();
  return{id,s,stars:s==null?0:starsFor(s),gained:(DB.stars[id]||0)-before,record:s!=null&&(prev==null||s>prev),grew,tip:spec?coachTip(spec):id==='respira'?'Buen aire. Mantén esa suavidad al cantar.':'Tu voz marca el ritmo; sigue sin forzar.'};
}
function shortSong(S){
  const duration=S.lines.reduce((n,l)=>n+(l.mel||[]).reduce((s,m)=>s+m.d,0),0)*60/S.bpm;
  return duration<=50?S:{...S,lines:S.lines.slice(0,Math.ceil(S.lines.length/2))};
}
function stepInfo(id){
  if(id==='rango')return{id,t:'Mide tu rango',tip:'Canta suave de grave a agudo. Quédate donde tu voz se sienta cómoda.',syl:'aaa',hue:262,motif:TART.range[1]};
  if(id.startsWith('song:')){const s=songById(id.slice(5));return{id,t:s.title,syl:'la letra',tip:'Escucha la guía y canta con suavidad. Usa audífonos para medir mejor.',hue:COLLECTION_HUE[s.mine?'Mis canciones':s.meta.gen]||SONGHUE[s.id]||218,motif:SONGM[s.id]||DLINE,song:s}}
  return drillById(id);
}
function buildSession(d=today()){
  if(DB.sess&&DB.sess.d===d&&Array.isArray(DB.sess.steps)&&DB.sess.steps.every(id=>id==='rango'||drillById(id)||id.startsWith('song:')&&songById(id.slice(5))))return DB.sess;
  const lvl=currentLevel(),seed=Number(d.replaceAll('-','')),pool=DRILLS.filter(x=>x.lvl===lvl&&!x.breath);
  const middle=lvl===1?['eco','larga','tres']:Array.from({length:3},(_,i)=>pool[(seed+i)%pool.length].id);
  const steps=[...(!DB.range?['rango']:[]),'respira','trino','sirena',...middle,'song:'+SONGLIST[seed%SONGLIST.length].id];
  let seconds=32+(steps.length*9),gaps=0;
  steps.forEach(id=>{const x=stepInfo(id);if(id==='rango')seconds+=120;else if(x.song){const s=shortSong(x.song);seconds+=(s.beats+s.lines.reduce((n,l)=>n+(l.mel||[]).reduce((n,m)=>n+m.d,0),0))*60/s.bpm}else if(!x.breath){seconds+=x.rounds*(2*x.pat.reduce((n,p)=>n+p[1],0)+2)*60/x.bpm;gaps+=x.rounds-1}});
  const rest=Math.max(4,Math.min(30,Math.ceil((660-seconds)/Math.max(1,gaps))));
  DB.sess={d,i:0,res:[],steps,rest,minutes:Math.ceil((seconds+gaps*rest)/60),secs:0,lvl,startRange:DB.range?{...DB.range}:null,startStreak:streak(),hadDay:!!DB.days[d],gained:0};save();return DB.sess;
}
function bestStreak(){let best=0,n=0,prev=null;Object.keys(DB.days).filter(d=>DB.days[d]).sort().forEach(d=>{const t=new Date(d+'T12:00:00');if(prev){const next=new Date(prev);next.setDate(next.getDate()+1);n=today(next)===d?n+1:1}else n=1;prev=t;best=Math.max(best,n)});return best}
// «Tocar con un beat»: abre Roka Estudio con el tono de la canción ya ajustado a tu voz y su tempo
function estudioHref(S){
  const L=S.lines.find(l=>l.syl&&l.syl.some(x=>x.ch)),ch=L&&L.syl.find(x=>x.ch).ch,m=ch&&ch.match(/^([A-G])([#b]?)(m(?!aj))?/);
  const US=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'],sh=DB['shift:'+S.id]??songShift(S);
  const pc=m?CHPC[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0):0;
  return '../estudio/#/nueva?'+new URLSearchParams({tono:US[(((pc+sh)%12)+12)%12]+(m&&m[3]?'m':''),bpm:String(S.bpm),genero:S.beats===3?'vals':'balada',desde:'voz'}).toString();
}
let COACH=null,COACH_AUTOSTART=false;
/* Un controlador por vista: el micrófono pertenece a toda la sesión. */
function viewCoach(options={}){
  const daily=!options.id,sess=daily?buildSession():null,steps=daily?sess.steps:[options.id];
  return{title:daily?'Tu sesión de hoy':stepInfo(options.id).t,fs:true,html:'<section class="coach" aria-label="Coach de voz"></section>',mount(page){
    const root=$('.coach',page);let alive=true,started=false,micOK=false,run=null,rangeCleanup=null,index=daily?sess.i:0,stage='ready',paused=false,clock=null,previous=performance.now(),pauseBusy=false;
    let rangeElapsed=0,rangePhase=0,spec=null,result=null,rangeMic=null,originalBuffer=null,curPh=null;
    const audioAbort=new AbortController();
    const state={get active(){return started&&!paused&&['exercise','breath','range'].includes(stage)},addTime(s){if(daily)sess.secs+=s}};COACH=state;
    const header=()=>`<header class="coach-head"><button class="icon-btn" data-coach="exit" aria-label="Salir">${IC.x}</button><span>${daily?'Tu sesión de hoy':'Práctica'} · ${Math.min(index+1,steps.length)} de ${steps.length}</span><span class="coach-mic">${started?(micOK?'Micrófono activo':'Sin calificación'):''}</span></header>`;
    const shell=html=>{root.innerHTML=header()+html};
    const controls=()=>`<footer class="coach-controls"><button class="btn" data-coach="pause">${IC.pause}<span>Pausa</span></button><button class="btn" data-coach="repeat">${IC.redo}<span>Repetir</span></button><button class="btn" data-coach="skip">${IC.next}<span>Saltar</span></button></footer>`;
    const clearStep=()=>{clock=null;paused=false;root.classList.remove('is-song');try{HAS_TTS&&speechSynthesis.cancel()}catch(e){}root.classList.remove('is-paused');$('.coach-pause',root)?.remove();if(run){const old=run;run=null;old.stop()}if(rangeCleanup){rangeCleanup();rangeCleanup=null}MIC.on=null;rangeMic=null};
    function timer(seconds,paint,done){clock={left:seconds,paint,done};paint(seconds)}
    function ready(){
      const x=stepInfo(steps[Math.min(index,steps.length-1)]);
      shell(`<div class="coach-center"><span class="acov coach-cover">${coverArt(x.hue,x.motif,null,'coach')}</span><span class="eyebrow">${daily?sess.minutes+' min · a tu ritmo':'Práctica guiada'}</span><h1>${daily?'Tu sesión de hoy':esc(x.t)}</h1><p>${daily?'Calienta, afina y termina cantando.':esc(x.tip)}</p><p class="cap">Usa audífonos para que la guía no se confunda con tu voz.</p><button class="kplayb" data-coach="begin">${IC.play}<span>${index?'Continuar':'Empezar'}</span></button>${settings(x)}</div>`);
    }
    function settings(x){
      const song=x.song,original=song&&song.recording?.audioStored&&hasOriginalTimings(song)&&!!DB['original:'+song.id];
      return `<details class="coach-settings"><summary>Ajustes de práctica</summary><label>Tolerancia<select data-setting="tol">${[[25,'Estricta'],[50,'Normal'],[75,'Relajada']].map(([v,t])=>`<option value="${v}" ${DB.tol===v?'selected':''}>${t}</option>`).join('')}</select></label>${!daily&&!song&&!x.breath?`<label>Rondas<select data-setting="dir"><option value="up">Subir</option><option value="ud" ${DB.dir==='ud'?'selected':''}>Subir y bajar</option></select></label><label>Modo<select data-setting="mode"><option value="eco">Escucha y repite</option><option value="junto" ${DB.mode==='junto'?'selected':''}>Canta junto</option></select></label><label>Tempo<input type="number" data-setting="bpm:${x.id}" min="40" max="160" value="${DB['bpm:'+x.id]||x.bpm}"></label>`:''}${song&&!daily?`
      ${song.mine?`<a class="btn" href="#/canciones/editar/${song.id}">Editar canción</a><a class="btn" href="#/canciones/libre/${song.id}">Cantar libre</a>`:''}
      ${song.recording?.audioStored&&hasOriginalTimings(song)?`<label>Cantar sobre mi grabación<input type="checkbox" data-setting="original:${song.id}" ${original?'checked':''}></label>`:''}
      ${original?`<p class="cap">Tono y velocidad originales. La voz guía está apagada. La calificación usa los tiempos de tu audio.</p><label>Volumen de tu grabación<input type="range" min="0" max="1" step=".05" data-setting="originalVolume" value="${DB.originalVolume??.65}"></label><label>Quitar la voz<input type="checkbox" data-setting="originalSide" ${DB.originalSide?'checked':''}></label><p class="cap">Reduce el canal central solo en estéreo; también puede quitar instrumentos. En mono no cambia el sonido.</p>`:`<label>Velocidad<select data-setting="songSpeed"><option value="1" ${(DB.songSpeed||1)===1?'selected':''}>Normal</option><option value="0.9" ${DB.songSpeed===.9?'selected':''}>90 %</option><option value="0.75" ${DB.songSpeed===.75?'selected':''}>75 %</option></select></label><label>Tono (semitonos)<input type="number" data-setting="shift:${song.id}" min="-36" max="36" value="${DB['shift:'+song.id]??songShift(song)}"></label><label>Voz guía<input type="checkbox" data-setting="sguide" ${DB.sguide!==false?'checked':''}></label><label>Acordes<input type="checkbox" data-setting="schords" ${DB.schords!==false?'checked':''}></label>`}`:''}</details>`;
    }
    async function begin(){
      if(started)return;
      if(daily&&index>=steps.length){summary();return}
      started=true;stage='loading';shell('<div class="coach-center"><h1>Prepara tu voz</h1><p>Activa el micrófono para ver tu afinación.</p></div>');
      if(!ac()){started=false;stage='ready';ready();toast('No se pudo iniciar el audio. Vuelve a intentar.');return}
      const selected=stepInfo(steps[index]).song;originalBuffer=null;
      if(!daily&&selected&&selected.recording?.audioStored&&hasOriginalTimings(selected)&&DB['original:'+selected.id]){
        try{const file=await audioStore('get',selected.id);if(!file)throw Error('El audio no está en este dispositivo. Vuelve a subirlo desde Editar canción.');originalBuffer=await decodeSongFile(file,{signal:audioAbort.signal})}
        catch(e){if(!alive)return;started=false;stage='ready';ready();toast(esc(e.message),6500);return}
      }
      await AC.resume();micOK=await micStart(null,()=>{});
      if(!alive){micStop();return}
      if(!micOK)toast('Seguimos sin micrófono y sin calificación. Puedes practicar con la guía.',6500);
      if(daily&&sess.res[index]){result=sess.res[index];showResult();return}
      intro();
    }
    // velocidad visible en «Cómo se hace» y durante el ejercicio; se guarda por ejercicio
    const speedHTML=id=>`<div class="spd chips" role="group" aria-label="Velocidad">${SPEEDS.map(([v,l])=>`<button class="chip" data-spd="${v}" aria-pressed="${spdOf(id)===v}">${l}</button>`).join('')}</div>`;
    function intro(){
      clearStep();paused=false;const id=steps[index],x=stepInfo(id),h=howFor(x);stage='intro';
      const auto=daily&&DB.seen&&DB.seen[id],speed=!x.breath&&x.id!=='rango'&&!originalBuffer;
      shell(`<div class="coach-center coach-how"><span class="eyebrow">Paso ${index+1} de ${steps.length} · Cómo se hace</span><h1>${esc(x.t)}</h1>
        <div class="how-top">${mouthSVG(h.mouth)}<p class="coach-syllable">${x.song?'Canta la letra':x.breath?'Con «sss»':'Canta «'+esc(x.syl)+'»'}</p></div>
        <ol class="how-steps">${h.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol>${h.fix?`<p class="cap">${esc(h.fix)}</p>`:''}
        <div class="row how-actions">${x.id!=='rango'?`<button class="btn" data-coach="example">${IC.sound}<span>Escuchar ejemplo</span></button>`:''}${HAS_TTS?`<button class="btn" data-coach="explain">${IC.voice}<span>Explícamelo</span></button>`:''}${x.song?`<a class="btn" href="${estudioHref(x.song)}">${IC.note}<span>Tocar con un beat</span></a>`:''}</div>
        ${speed?speedHTML(id):''}
        <button class="kplayb how-go" data-coach="now">${IC.play}<span>Empezar</span></button>${auto?'<p class="cap" id="count" aria-live="polite">Empieza solo en 5 s</p>':''}</div>`);
      if(auto)timer(5,n=>{const c=$('#count',root);if(c)c.textContent='Empieza solo en '+Math.ceil(n)+' s'},()=>exercise());
    }
    // el ejemplo de una canción: su primer renglón con la voz guía, en tu tono
    function example(){
      clock=null;$('#count',root)?.remove();const id=steps[index],x=stepInfo(id);
      if(!x.song){playExample(x,spdOf(id));return}
      if(!ac())return;const S=x.song,sh=songShift(S),L=S.lines.find(l=>l.mel),beat=60/(S.bpm*spdOf(id));if(!L)return;let t=AC.currentTime+.1;
      L.mel.forEach(n=>{const d=n.d*beat;if(n.m!=null)guideTone(n.m+sh,t,d*.94,.16);t+=d});
    }
    function exercise(opt={}){
      const carry=opt.carry||[];clearStep();const id=steps[index],x=stepInfo(id);paused=false;
      if(x.id==='rango'){rangeStep();return}
      if(x.breath){breathStep();return}
      stage='exercise';DB.seen=DB.seen||{};DB.seen[id]=1;save();
      const song=x.song?(daily?shortSong(x.song):x.song):null,syl=song?'':x.syl;
      root.classList.toggle('is-song',!!song);
      shell(`<div class="coach-hud"><div class="hud-l"><span class="eyebrow">${esc(x.t)}${song?'':' · «'+esc(syl)+'»'}</span><h1 id="phase">${song?'Prepárate':'Escucha'}</h1><span id="round"></span><div class="rbar" aria-hidden="true"><i id="rbar"></i></div></div>
        <div class="vnote" id="vnote" aria-live="polite"><small>Tu nota</small><b id="live-note">—</b><span id="live-dir">${song?'Espera la cuenta':'Escucha primero'}</span></div></div>
        <div class="hud-tools">${originalBuffer?'':speedHTML(id)}${song&&!originalBuffer?`<button class="chip" data-coach="guide" aria-pressed="${DB.sguide!==false}">Voz guía</button>`:''}</div>
        <div class="lane-wrap"><canvas class="lane coach-lane" id="coach-lane" aria-label="Notas objetivo y línea de tu voz"></canvas><div class="lane-rest" id="lane-rest" hidden><span class="brdisc"></span><b>Respira</b><span id="rest-n"></span></div></div>
        ${song?`<div class="lyrics concert" id="lyr">${lyricHTML(song)}</div>`:'<p id="rest-label" class="coach-hint">Las barras claras las canta la app. Las azules te tocan a ti.</p>'}${controls()}`);
      const speed=spdOf(id);
      spec=song?(originalBuffer?timedSongSpec(song,originalBuffer,{volume:DB.originalVolume??.65,side:!!DB.originalSide}):songSpec(song,{shift:daily?songShift(song):(DB['shift:'+song.id]??songShift(song)),speed,guide:DB.sguide!==false,chords:DB.schords!==false})):drillSpec(x,{rounds:x.rounds,bpm:(daily?x.bpm:DB['bpm:'+x.id]||x.bpm)*speed,dir:daily?'up':DB.dir,mode:daily?'eco':DB.mode,rest:daily?sess.rest:2,from:opt.from||0});
      if(carry.length)spec.targets=carry.concat(spec.targets);
      if(originalBuffer)root.insertAdjacentHTML('beforeend','<label class="song-volume">Volumen de tu grabación<input aria-label="Volumen de tu grabación" data-original-volume type="range" min="0" max="1" step=".05" value="'+(DB.originalVolume??.65)+'"></label>');
      if(spec.adapted)$('#rest-label',root).textContent='Patrón ajustado a tu zona cómoda.';
      let last=null,prevSeg=null,good=0,slowed=!!opt.slowed,suggested=false;curPh=null;
      const roundScore=ri=>{const gs=spec.targets.filter(g=>g.ri===ri&&g.ph==='S'&&g.n>0);return gs.length?gs.reduce((a,g)=>a+g.h/g.n,0)/gs.length:null};
      run=practiceRun($('#coach-lane',root),spec,{sec:5,onSeg(s){
        // al terminar tu turno: si te costó, bajamos la velocidad; si vas muy bien, te sugerimos subirla
        if(!song&&micOK&&prevSeg&&(prevSeg.ph==='S'||prevSeg.ph==='J')&&prevSeg.ri<spec.rounds-1){const sc=roundScore(prevSeg.ri);
          if(sc!=null&&sc<.4&&spdOf(id)>.75&&!slowed){DB['spd:'+id]=.75;save();toast('Bajamos la velocidad para que te salga.');const from=prevSeg.ri+1,keep=spec.targets.filter(g=>g.ri<from);setTimeout(()=>{if(alive&&stage==='exercise')exercise({from,carry:keep,slowed:true})},0);prevSeg=s;return}
          if(sc!=null&&sc>.9){good++;if(good>=2&&spdOf(id)<1.15&&!suggested){suggested=true;const h=$('#rest-label',root);if(h)h.textContent='¡Vas muy bien! Puedes subir a Rápido.'}}else good=0}
        prevSeg=s;curPh=s?s.ph:null;
        const ph=$('#phase',root),r=$('#round',root),dir=$('#live-dir',root);
        if(!s){ph.textContent='Respira';return}
        ph.className=s.ph==='S'||s.ph==='J'?'sing':'';
        if(song){ph.textContent=s.ph==='C'?'Prepárate':'Canta';r.textContent=s.ph==='C'?'Empieza en la cuenta de 4':'Sigue la letra';if(dir&&s.ph==='C')dir.textContent='Espera la cuenta';return}
        ph.textContent={L:'Escucha: la app canta',S:'Ahora tú: «'+syl+'»',J:'Canta junto: «'+syl+'»',R:'Respira'}[s.ph]||'';
        r.textContent=s.ri!=null?`Ronda ${s.ri+1} de ${spec.rounds}`+(s.ph==='S'||s.ph==='J'?` · ${spec.notes} ${spec.notes===1?'nota':'notas'}${spec.up?' ↑':''}`:''):'';
        if(dir&&s.ph==='L')dir.textContent='Escucha primero';
      },onPitch(d,g){
        const n=$('#live-note',root),dir=$('#live-dir',root),card=$('#vnote',root);if(!n)return;
        const sing=g&&g.ph==='S'&&curPh!=='L';
        if(d.m==null){n.textContent='—';if(sing){dir.textContent='No te oigo';card.className='vnote quiet'}return}
        n.textContent=nnTxt(d.m);
        if(!sing){card.className='vnote';return}
        const diff=d.m-tgtAt(g,d.t),tol=(DB.tol||50)/100;
        if(Math.abs(diff)<=tol){dir.textContent='¡Ahí!';card.className='vnote hit'}else if(diff<0){dir.textContent='Sube ↑';card.className='vnote low'}else{dir.textContent='Baja ↓';card.className='vnote high'}
      },onNote(g){
        if(!song)return;const ly=$('#lyr',root);
        if(last&&last.n){const el=$(`[data-li="${last.li}"] [data-si="${last.si}"]`,ly);if(el)el.classList.add(last.h/last.n>=.6?'hit':'miss')}
        last=g;if(!g)return;ly.classList.add('live');
        $$('.lyl',ly).forEach(l=>{const k=+l.dataset.li;l.classList.toggle('cur',k===g.li);l.classList.toggle('nxt',k===g.li+1);l.classList.toggle('past',k<g.li)});
        const cur=$(`.lyl[data-li="${g.li}"]`,ly);if(cur&&ly._li!==g.li){ly._li=g.li;ly.scrollTo({top:cur.offsetTop-ly.clientHeight/2+cur.clientHeight/2,behavior:RMOT.matches?'auto':'smooth'})}
        const el=$(`[data-li="${g.li}"] [data-si="${g.si}"]`,ly);if(el&&g.syl!==''){const end=Math.max(...spec.targets.filter(t=>t.li===g.li&&t.si===g.si).map(t=>t.t1));el.style.setProperty('--sd',(end-g.t0)+'s');el.classList.add('go')}
      },onEnd(sp){run=null;if(sp&&alive)finish(sp)}});
    }
    function breathStep(){
      stage='breath';shell(`<div class="coach-center"><h1>Respiración 4-4-8</h1><div class="brc"><div class="brdisc" id="breath-disc"></div><div class="brin"><b id="breath-count">4</b><span id="breath-phase">Inhala</span></div></div><p id="breath-cycle">Ciclo 1 de 2</p><p class="coach-tip">Suelta el aire parejo, sin subir los hombros.</p></div>${controls()}`);
      timer(32,left=>{const elapsed=32-left,p=elapsed%16,phase=p<4?'Inhala':p<8?'Sostén':'Suelta «sss»',n=p<4?4-p:p<8?8-p:16-p,s=p<4?.55+.45*p/4:p<8?1:1-.45*(p-8)/8;
        $('#breath-disc',root).style.transform=`scale(${s})`;$('#breath-count',root).textContent=Math.ceil(n);$('#breath-phase',root).textContent=phase;$('#breath-cycle',root).textContent=`Ciclo ${Math.min(2,Math.floor(elapsed/16)+1)} de 2`;
      },()=>finish(null));
    }
    function rangeStep(){
      if(!micOK){
        result={id:'rango',s:null,skipped:true,gained:0,tip:'Seguimos con una zona de referencia. Puedes medir tu rango después.'};
        if(daily){sess.res[index]=result;save()}showResult();return;
      }
      stage='range';rangeElapsed=0;rangePhase=0;
      const v=viewRange({session:true,onDone:()=>finish(null)});shell('<div id="coach-range">'+v.html+'</div>'+controls());
      rangeCleanup=v.mount($('#coach-range',root));$('#rgo',root).click();
      // La prueba conserva sus botones y avanza sola a los 45 y 90 segundos.
      timer(100,left=>{rangeElapsed=100-left;if(rangeElapsed>=45&&rangePhase===0){rangePhase=1;if($('#rph',root).textContent==='Paso 2 de 3')$('#rgo',root).click()}if(rangeElapsed>=90&&rangePhase===1){rangePhase=2;if($('#rph',root).textContent==='Paso 3 de 3')$('#rgo',root).click()}},()=>{$('#rgo',root).click();if(stage==='range')toast('No se registró un rango suficiente. Puedes repetir o saltar este paso.')});
    }
    function finish(sp){
      clearStep();result=recordResult(steps[index],sp);
      if(daily){sess.res[index]=result;sess.gained+=result.gained;save()}
      showResult();
    }
    function showResult(){
      clearStep();stage='result';paused=false;const x=stepInfo(steps[index]);
      const noScore=result.s==null,stars=noScore?'':`<div class="coach-stars" aria-label="${result.stars} de 3 estrellas">${[0,1,2].map(i=>`<span style="--i:${i}" class="${i<result.stars?'earned':''}">${i<result.stars?'★':'☆'}</span>`).join('')}</div>`;
      shell(`<div class="coach-center coach-result"><span class="eyebrow">${esc(x.t)} · terminado</span><h1 class="coach-score">${noScore?(x.breath?'Buen aire':x.id==='rango'&&DB.range?'A tu medida':'Hecho'):Math.round(result.s*100)+'<small>%</small>'}</h1>${stars}<p>${noScore?(x.breath?'Dos ciclos completos':x.id==='rango'&&DB.range?nnTxt(DB.range.lo)+' a '+nnTxt(DB.range.hi):'Sin calificación'):(result.record?'Nueva mejor marca':'Mejor marca')+' · '+scoreText(DB.best[x.id])}</p><p class="coach-tip">${esc(noScore&&!x.breath&&!DB.range?'Sigue la guía a tu ritmo. Mide tu rango cuando puedas activar el micrófono.':result.tip)}</p>${result.grew?'<p class="coach-good">Tu rango creció.</p>':''}<div class="row"><button class="btn" data-coach="repeat">${IC.redo}Repetir</button><button class="btn pri" data-coach="next">${daily?'Siguiente':'Volver'}${daily?'<span class="next-ring" id="next-ring">6</span>':''}</button></div></div>`);
      if(result.skipped){$('.coach-score',root).textContent='Seguimos';$('.coach-result>.eyebrow',root).textContent='Rango · pendiente de medir';$('.coach-tip',root).textContent=result.tip}
      if(daily)timer(6,n=>{const el=$('#next-ring',root);el.textContent=Math.ceil(n);el.style.setProperty('--progress',((6-n)/6*360)+'deg')},next);
    }
    function next(){
      clearStep();if(!daily){location.hash=steps[0].startsWith('song:')?'#/canciones':'#/ejercicios';return}
      index++;sess.i=index;save();if(index>=steps.length)summary();else intro();
    }
    function skip(){
      if(daily){sess.res[index]={id:steps[index],s:null,skipped:true,gained:0};save()}
      next();
    }
    function summary(){
      clearStep();stage='summary';micStop();started=false;
      const completed=sess.res.filter(r=>r&&!r.skipped),scores=completed.map(r=>r.s).filter(s=>s!=null),avg=mean(scores),old=sess.startRange,now=DB.range;
      sess.finished=true;save();
      const growth=old&&now?(now.hi-now.lo)-(old.hi-old.lo):0;
      shell(`<div class="coach-center coach-result"><span class="eyebrow">${completed.length===steps.length?'Sesión completa':'Sesión terminada'} · ${completed.length} de ${steps.length} pasos</span><h1>Hoy le diste voz a tu día</h1><div class="coach-score">${avg==null?'—':Math.round(avg*100)+'<small>%</small>'}</div><p>${avg==null?'Sin calificaciones guardadas':'Afinación promedio'}</p><div class="coach-stats"><div><b>+${sess.gained}</b><span>estrellas nuevas</span></div><div><b>${Math.round(sess.secs/60)}</b><span>min de práctica</span></div><div><b>${streak()}</b><span>días de racha${!sess.hadDay&&completed.length?' · +1 hoy':''}</span></div></div>${growth>0?`<p class="coach-good">Tu rango creció ${growth} semitonos.</p>`:!old&&now?'<p class="coach-good">Ya tienes tu primer rango medido.</p>':''}${currentLevel()>sess.lvl?`<p class="coach-good">Desbloqueaste el nivel ${currentLevel()} · ${LEVELS[currentLevel()]}.</p>`:''}<a class="btn pri" href="#/">Listo</a><a class="coach-link" href="#/progreso">Ver mi progreso</a></div>`);
    }
    async function setPaused(value){
      if(paused===value||pauseBusy)return;pauseBusy=true;paused=value;
      if(run){if(value)await run.pause();else run.resume()}
      if(!alive){pauseBusy=false;return}
      if(stage==='range'){$('#coach-range',root).inert=value;if(value){rangeMic=MIC.on;MIC.on=null}else MIC.on=rangeMic}
      root.classList.toggle('is-paused',value);
      $('.coach-pause',root)?.remove();if(value)root.insertAdjacentHTML('beforeend','<div class="coach-pause"><span>En pausa</span><button class="btn pri" data-coach="resume">Seguir</button></div>');
      const b=$('[data-coach="pause"]',root);if(b)b.innerHTML=(value?IC.play:IC.pause)+'<span>'+(value?'Seguir':'Pausa')+'</span>';
      pauseBusy=false;
    }
    async function exit(){
      if($('dialog[open]',root))return;
      const was=paused;await setPaused(true);if(!alive)return;
      const dialog=document.createElement('dialog');dialog.className='coach-dialog';dialog.innerHTML='<h2>¿Salir de la sesión?</h2><p>Tu avance queda guardado. Puedes continuar después.</p><div class="row"><button class="btn" data-stay>Seguir</button><button class="btn pri" data-leave>Salir</button></div>';root.appendChild(dialog);dialog.showModal();
      const stay=()=>{dialog.close();dialog.remove();if(!was)setPaused(false)};
      $('[data-stay]',dialog).onclick=stay;$('[data-leave]',dialog).onclick=()=>{dialog.close();location.hash=daily?'#/':steps[0].startsWith('song:')?'#/canciones':'#/ejercicios'};dialog.oncancel=e=>{e.preventDefault();stay()};
    }
    root.addEventListener('change',e=>{const k=e.target.dataset.setting;if(!k)return;DB[k]=e.target.type==='checkbox'?e.target.checked:['mode','dir'].includes(k)?e.target.value:Number(e.target.value);if(k.startsWith('bpm:'))DB[k]=Math.max(40,Math.min(160,DB[k]||60));if(k.startsWith('shift:'))DB[k]=Math.max(-36,Math.min(36,DB[k]||0));save();if(k.startsWith('original:')){ready();$('.coach-settings',root).open=true}});
    root.addEventListener('input',e=>{if(e.target.matches('[data-original-volume]')){DB.originalVolume=Number(e.target.value);spec?.setVolume?.(DB.originalVolume)}});
    root.addEventListener('click',e=>{
      const sp=e.target.closest('[data-spd]');
      if(sp){const id=steps[index];DB['spd:'+id]=+sp.dataset.spd;save();$$('[data-spd]',root).forEach(x=>x.setAttribute('aria-pressed',String(x===sp)));
        if(stage==='exercise'){toast('Velocidad: '+sp.textContent);exercise()}else{clock=null;$('#count',root)?.remove()}return}
      const b=e.target.closest('[data-coach]');if(!b)return;const action=b.dataset.coach;
      if(pauseBusy)return;
      if(action==='example'){example();return}
      if(action==='explain'){clock=null;$('#count',root)?.remove();const x=stepInfo(steps[index]),h=howFor(x);speakText(`${x.t}. ${h.steps.join(' ')} ${h.fix||''}`);return}
      if(action==='guide'){DB.sguide=DB.sguide===false;save();exercise();return}
      if(action==='begin')begin();else if(action==='exit')exit();else if(action==='pause')setPaused(!paused);else if(action==='resume')setPaused(false);else if(action==='repeat'){if(daily){sess.res[index]=null;save()}intro()}else if(action==='skip')skip();else if(action==='now'&&stage==='intro')exercise();else if(action==='next')next();
    });
    const iv=setInterval(()=>{const now=performance.now(),dt=Math.min(.25,(now-previous)/1000);previous=now;if(!alive||paused||document.hidden)return;
      if(clock){const c=clock;c.left-=dt;if(c.left<=0){clock=null;c.done()}else c.paint(c.left)}
      if(stage==='exercise'&&run){const t=AC.currentTime-outLat(),seg=spec.segs.find(s=>t>=s.t0&&t<s.t1),bar=$('#rbar',root),rest=$('#lane-rest',root);
        if(bar)bar.style.width=seg?Math.min(100,Math.max(0,(t-seg.t0)/(seg.t1-seg.t0)*100))+'%':'0%';
        // descanso: el carril nunca se queda vacío sin explicación
        if(rest){const on=!!seg&&seg.ph==='R';rest.hidden=!on;if(on)$('#rest-n',root).textContent=`Suelta los hombros · sigue en ${Math.ceil(seg.t1-t)} s`}}
    },80);
    const visibility=()=>{if(document.hidden&&started&&!paused)setPaused(true);else if(!document.hidden&&paused&&run&&AC)AC.suspend()};document.addEventListener('visibilitychange',visibility);
    ready();if(COACH_AUTOSTART){COACH_AUTOSTART=false;begin()}
    return()=>{alive=false;audioAbort.abort();clearStep();clearInterval(iv);document.removeEventListener('visibilitychange',visibility);if(COACH===state)COACH=null;micStop();if(AC&&AC.state==='suspended')AC.resume();save()};
  }};
}
