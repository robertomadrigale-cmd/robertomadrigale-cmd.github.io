/* ---------- coach: sesión de hoy que avanza sola, «Cómo se hace», práctica calificada y resultado ---------- */
const KIND={rud:['Calentamiento','Rudimento para soltar las manos'],groove:['Groove del día','Tócalo junto con el click'],prec:['Precisión','Mide qué tan a tiempo tocas'],band:['Con la banda','Tú pones la batería']};
const dayNum=()=>Math.floor(new Date(today()+'T12:00:00')/864e5);
function buildSession(){
  if(DB.sess&&DB.sess.d===today()&&DB.sess.steps&&DB.sess.steps.length)return DB.sess;
  const lvl=currentLevel(),dn=dayNum(),pool=[...LVL[1],...(lvl>1?LVL[2]:[]),...(lvl>2?LVL[3]:[])].filter(id=>!['Subdivisión','Rudimentos'].includes(G[id].cat));
  const fresh=pool.filter(id=>(DB.stars[id]||0)<3),from=(lvl>1?fresh.filter(id=>lvlOf(id)===lvl):[]).concat(fresh.length?fresh:pool);
  const rud=(lvl>1?['rudS','rudD','para','acc']:['rudS','rudD','para'])[dn%(lvl>1?4:3)],gr=from[dn%from.length],pr=lvl===1?['q','e'][dn%2]:lvl===2?['e','tr'][dn%2]:['s','tr'][dn%2];
  const bandG=bandOK(G[gr])?gr:'rock';
  DB.sess={d:today(),steps:[{k:'rud',id:rud},{k:'groove',id:gr},{k:'prec',id:pr},{k:'band',id:bandG}],i:0,res:[]};save();return DB.sess;
}
const BARS={rud:4,groove:8,prec:8,band:8};
const loopsFor=(k,g)=>Math.max(1,Math.round(BARS[k]/((g.bars||1)*(g.meter===2?.5:1))));
function recordResult(id,k,S,bpm){
  DB.played=(DB.played||0)+1;DB.seen[id]=1;
  if(S&&S.n){
    const p=S.pct;DB.hist.push({d:today(),ts:Date.now(),id,k,s:p,ms:S.mean==null?null:Math.round(S.mean),sd:Math.round(S.sd||0),bpm});if(DB.hist.length>400)DB.hist=DB.hist.slice(-400);
    const prev=DB.best[id];if(prev==null||p>prev)DB.best[id]=p;DB.stars[id]=Math.max(DB.stars[id]||0,starsFor(p));
    if(k==='prec'&&S.hit>=8)DB.ses=(DB.ses||[]).concat([{d:today(),ts:Date.now(),mode:'click',bpm,grid:G[id].sub,n:S.hit,mean:S.mean,sd:S.sd,pct:S.pocket*100}]).slice(-120);
  }
  markDay();save();
}
const starHTML=n=>`<div class="coach-stars" aria-label="${n} de 3 estrellas">${[0,1,2].map(i=>`<span class="${i<n?'earned':''}" style="--i:${i}">★</span>`).join('')}</div>`;
const pctTxt=p=>p==null?'—':Math.round(p*100)+' %';
let COACH=null;
// #/sesion = sesión de hoy · #/practicar/ej/<id>?k=groove|prec|band = un ejercicio suelto
function viewCoach(id,kind){
  const single=!!id;
  return{title:single?G[id].n:'Tu sesión',fs:true,html:`<div class="coach" id="coach"></div>`,mount(r){
    const root=$('#coach',r),S=single?{steps:[{k:kind||'groove',id}],i:0,res:[]}:buildSession();
    let timers=[],unpads=null,run=null,live=null,band=null,destroyed=false;
    const T=(f,ms)=>{const t=setTimeout(f,ms);timers.push(t);return t},clearT=()=>{timers.forEach(clearTimeout);timers=[]};
    COACH={get active(){return!!run}};
    const stopAll=()=>{clearT();grooveStop();if(unpads){unpads();unpads=null}MIC.onHit=null;run=null};
    const step=()=>S.steps[S.i],g=()=>G[step().id];
    const head=(txt)=>`<div class="coach-head"><a class="icon-btn" href="${single?'#/groove/'+id:'#/'}" aria-label="Salir">${IC.x}</a><span>${txt}</span><span class="coach-mic">${DB.input==='mic'?(MIC.ready?'Micrófono listo':'Micrófono'):'Toques en pantalla'}</span></div>`;
    const stepTxt=()=>single?KIND[step().k][0]:`Paso ${S.i+1} de ${S.steps.length} · ${KIND[step().k][0]}`;
    /* --- «Cómo se hace» --- */
    function intro(){
      stopAll();const st=step(),gg=g(),how=howFor(st.id),spd=spdOf(st.id),bpm=bpmFor(st.id),auto=!single&&DB.seen[st.id];
      const bands=st.k==='band'?bandBeats(gg):[];
      root.innerHTML=head(stepTxt())+`<div class="coach-center coach-how">
        <div class="how-top"><span class="coach-cover dcover">${grooveArt(st.id)}</span><div class="how-ttl"><span class="eyebrow">${KIND[st.k][0]} · ${KIND[st.k][1]}</span><h1>${esc(gg.n)}</h1><p class="cap">${bpm} bpm · ${meterTxt(gg)} · Nivel ${lvlOf(st.id)} · ${(gg.bars||1)>1?'2 compases':'1 compás'}</p></div></div>
        <p class="coach-tip">${how.tip}</p>
        <div class="kitwrap">${kitSVG(gg)}${LIMBS_HTML}</div>
        <ul class="howrows">${how.rows.map(x=>`<li><b>${x.n}</b><span>${x.limbs}: ${x.where}</span></li>`).join('')}</ul>
        <div class="gridbox">${grooveGrid(gg)}</div>
        <ol class="how-steps">${how.steps.map(s=>`<li>${s}</li>`).join('')}</ol>
        <div class="row spd" role="group" aria-label="Velocidad">${Object.entries(SPEEDS).map(([k,[f,l]])=>`<button class="chip" data-spd="${k}" aria-pressed="${k===spd}">${l}<i>${Math.round(baseBpm(st.id)*f)}</i></button>`).join('')}</div>
        <div class="row spd" role="group" aria-label="Cómo te escucho"><button class="chip" data-in="tap" aria-pressed="${DB.input!=='mic'}">${IC.hand}Toques</button><button class="chip" data-in="mic" aria-pressed="${DB.input==='mic'}">${IC.mic}Micrófono</button></div>
        ${st.k==='band'?`<label class="bandsel">Estilo de la banda<select id="bsty">${bands.map(b=>`<option value="${b.id}" ${b.id===bandFor(st.id)?'selected':''}>${esc(b.n)}</option>`).join('')}</select></label><p class="cap" id="bst">Preparando la banda…</p>`:''}
        <div class="row how-actions"><button class="btn" id="ex">${IC.sound}Escuchar ejemplo</button>${!single?`<button class="btn" id="skip">Saltar</button>`:''}</div>
        <button class="kplayb how-go" id="go" aria-label="Empezar">${IC.play}<span>Empezar</span></button>
        ${auto?`<p class="cap" id="autot">Empieza solo en <b id="autos">5</b> s</p>`:''}
      </div>`;
      const prepBand=async()=>{if(st.k!=='band')return;const b=$('#bst',root),go=$('#go',root);go.disabled=true;band=null;
        try{const sid=$('#bsty',root).value,beat=beatById(sid);band=await bandRender(sid,bpmFor(st.id),parseKey(beat.key));if(destroyed)return;b.textContent=`Banda lista: ${beat.n} en ${band.acordes.slice(0,4).join(' · ')}`}catch(e){band=null;b.textContent='No se pudo preparar la banda; tocarás solo con el click.'}
        go.disabled=false};
      prepBand();
      if(auto){let n=5;const tk=()=>{if(!$('#autos',root))return;n--;if(n<=0){exercise();return}$('#autos',root).textContent=n;T(tk,1000)};T(tk,1000)}
      root.onclick=async e=>{const b=e.target.closest('button');if(!b)return;
        if(b.dataset.spd||b.dataset.in||b.id==='ex')clearT(),$('#autot',root)?.remove();
        if(b.dataset.spd){DB.spd[st.id]=b.dataset.spd;save();intro();return}
        if(b.dataset.in){DB.input=b.dataset.in;save();$$('[data-in]',root).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));if(DB.input==='mic'){const k=await micStart();if(k!=='ok'){DB.input='tap';save();toast(MICERR[k]);intro()}}return}
        if(b.id==='ex'){if(SEQ.id){grooveStop();b.innerHTML=IC.sound+'Escuchar ejemplo';return}b.innerHTML=IC.stop+'Detener';
          grooveRun({id:'ex',g:gg,bpm:bpmFor(st.id),loops:2,click:true,drums:true,band:st.k==='band'?band:null,onStep:i=>lightStep(root,gg,i),onEnd:()=>{gridNow(root,-1);const x=$('#ex',root);if(x)x.innerHTML=IC.sound+'Escuchar ejemplo'}});return}
        if(b.id==='skip'){S.res[S.i]={skipped:true};next();return}
        if(b.id==='go')exercise();
      };
      const sel=$('#bsty',root);if(sel)sel.onchange=()=>{DB.band=DB.band||{};DB.band[st.id]=sel.value;save();prepBand()};
    }
    /* --- práctica calificada --- */
    async function exercise(){
      stopAll();const st=step(),gg=g(),bpm=bpmFor(st.id),n=gSteps(gg),listen=st.k==='groove'||st.k==='rud'?1:0,loops=loopsFor(st.k,gg);
      if(DB.input==='mic'&&!MIC.ready){const k=await micStart();if(k!=='ok'){DB.input='tap';save();toast(MICERR[k]+' Sigue con toques en pantalla.',5000)}}
      const mode=DB.input==='mic'&&MIC.ready?'mic':'tap';
      root.innerHTML=head(stepTxt())+`<div class="coach-hud"><div class="hud-l"><span class="eyebrow">${esc(gg.n)} · ${bpm} bpm</span><h1 id="phase">Prepárate</h1><span id="round"></span><div class="rbar"><i id="rbar"></i></div></div><div class="vnote" id="fb"><small>Tu golpe</small><b id="fbv">—</b><span id="fbt">${mode==='mic'?'Toca tu batería':'Toca los botones'}</span></div></div>
        <div class="runbox"><div class="gridbox">${grooveGrid(gg)}</div><div class="kitwrap small">${kitSVG(gg)}</div></div>
        ${mode==='tap'?padsHTML(gg):`<div class="micbar"><span>${IC.mic}</span><div class="meter"><i id="mlv"></i></div></div>`}
        <div class="coach-controls"><button class="btn" id="stop">${IC.stop}Detener</button><button class="btn" id="again">${IC.redo}Reiniciar</button></div>`;
      const ph=$('#phase',root),rd=$('#round',root),fbv=$('#fbv',root),fbt=$('#fbt',root),fb=$('#fb',root),bar=$('#rbar',root);
      const hits=[];let exp=[],matched=new Set();
      const onHit=(t,pad)=>{if(!run||!exp.length)return;if(t<exp[0].t-.3||t>run.end+.2)return;hits.push({t,pad});
        let best=null,bd=.12;for(const e of exp){if(matched.has(e))continue;if(mode==='tap'&&e.pad!==pad)continue;const d=Math.abs(t-e.t);if(d<bd){bd=d;best=e}}
        const off=best?(t-best.t)*1000:null,cl=best?gradeOf(off)[0]:'miss';if(best){matched.add(best);gridMark(root,best.i,cl)}
        fbv.textContent=best?(off>0?'+':'')+Math.round(off)+' ms':'—';fbt.textContent=best?offTxt(off):'Golpe de más';fb.className='vnote '+({ok:'hit',mid:'low',bad:'high',miss:'quiet'}[cl]);
        if(mode==='tap'){const b=$(`[data-pad="${pad}"]`,root);if(b)padFlash(b,cl)}};
      if(mode==='tap')unpads=padsMount(root,onHit);else{MIC.onHit=(t)=>onHit(t-micLat(),null);live=()=>{const m=$('#mlv',root);if(m)m.style.width=Math.min(100,MIC.lv*250)+'%'};document.addEventListener('miclv',live)}
      run={end:Infinity};
      grooveRun({id:'coach',g:gg,bpm,loops:listen+loops,click:true,drums:L=>L<listen,band:st.k==='band'?band:null,
        onStart:s=>{exp=expectedHits(gg,s.T0+listen*n*s.step,s.step,loops,mode);run.end=s.end;run.T0=s.T0},
        onCount:(b,first)=>{ph.textContent='Cuenta: '+b;ph.classList.remove('sing');rd.textContent=listen?'Primero escucha una vuelta':'Entra en el 1'},
        onStep:(i,L)=>{lightStep(root,gg,i);
          if(i===0)$$('.dgrid .ok,.dgrid .mid,.dgrid .bad,.dgrid .miss',root).forEach(x=>x.classList.remove('ok','mid','bad','miss'));
          if(L<listen){ph.textContent='Escucha';ph.classList.remove('sing');rd.textContent='Así suena · tú entras en la siguiente vuelta'}
          else{ph.textContent='Ahora tú';ph.classList.add('sing');rd.textContent=`Vuelta ${L-listen+1} de ${loops}`}
          bar.style.width=((L*n+i+1)/((listen+loops)*n)*100)+'%';
          // marca en rosa lo que ya pasó sin golpe
          const now=ac().currentTime-outLat()-.13;exp.forEach(e=>{if(!matched.has(e)&&!e.gone&&e.t<now){e.gone=1;if(e.L===L-listen||e.L===L-listen-1)gridMark(root,e.i,'miss')}})},
        onEnd:()=>{const res=scoreHits(exp,hits,{pads:mode==='tap'});stopAll();result(res,bpm,mode)}});
      root.onclick=e=>{const b=e.target.closest('button');if(!b||b.dataset.pad)return;if(b.id==='stop'){stopAll();intro()}if(b.id==='again')exercise()};
    }
    /* --- resultado --- */
    function result(R,bpm,mode){
      if(live){document.removeEventListener('miclv',live);live=null}
      const st=step(),prev=DB.best[st.id],stars=starsFor(R.pct);recordResult(st.id,st.k,R,bpm);S.res[S.i]={p:R.pct,stars};if(!single)save();
      if(R.pct<.4&&spdOf(st.id)!=='lento'){DB.spd[st.id]='lento';save()}
      const offs=R.items.filter(x=>x.off!=null);
      root.innerHTML=head(stepTxt())+`<div class="coach-center coach-result">
        <span class="eyebrow">${esc(G[st.id].n)} · ${bpm} bpm · ${mode==='mic'?'micrófono':'toques'}</span>
        <div class="coach-score">${Math.round(R.pct*100)}<small> %</small></div>${starHTML(stars)}
        <div class="coach-stats"><div><b>${R.mean==null?'—':(R.mean>0?'+':'')+Math.round(R.mean)}</b><span>ms · ${R.mean==null?'sin golpes':tendTxt(R.mean).toLowerCase()}</span></div><div><b>${Math.round(R.sd||0)}</b><span>ms de variación</span></div><div><b>${R.hit}/${R.n}</b><span>golpes a tiempo o cerca</span></div></div>
        ${offs.length?stripSVG(offs):''}
        <p class="coach-tip">${scoreTip(R)}${R.pct<.4&&spdOf(st.id)==='lento'?' La próxima vez empieza en Lento.':''}</p>
        <p class="cap">${prev!=null&&R.pct>prev?'¡Nueva mejor marca!':'Tu mejor marca: '+pctTxt(Math.max(prev||0,R.pct))}</p>
        <div class="row how-actions"><button class="btn" id="again">${IC.redo}Repetir</button>${single?`<a class="btn" href="#/groove/${st.id}">Ver el groove</a>`:''}</div>
        ${!single||S.i<S.steps.length-1?`<button class="kplayb how-go" id="next" aria-label="Siguiente">${IC.next}<span>${single?'Listo':'Siguiente'}</span></button><p class="cap">${single?'':`Sigue solo en <span class="next-ring" id="ring">6</span>`}</p>`:`<a class="kplayb how-go" href="#/grooves" aria-label="Más grooves">${IC.grid}<span>Más</span></a>`}
      </div>`;
      if(!single){let n=6;const ring=$('#ring',root);const tk=()=>{n--;if(!ring.isConnected)return;ring.textContent=n;ring.style.setProperty('--progress',((6-n)/6*360)+'deg');if(n<=0)next();else T(tk,1000)};T(tk,1000)}
      root.onclick=e=>{const b=e.target.closest('button');if(!b)return;clearT();if(b.id==='again')exercise();if(b.id==='next'){if(single)location.hash='#/groove/'+st.id;else next()}};
    }
    function next(){
      stopAll();S.i++;if(!single){DB.sess=S;save()}
      if(S.i>=S.steps.length){summary();return}intro();
    }
    function summary(){
      const done=S.res.filter(x=>x&&!x.skipped),avg=mean(done.map(x=>x.p));
      root.innerHTML=head('Sesión terminada')+`<div class="coach-center"><span class="coach-cover dcover">${coverArt(218,TART.groove[1],null,'fin')}</span><h1>¡Sesión completa!</h1>
        <p>${done.length} de ${S.steps.length} partes · precisión promedio ${avg==null?'—':Math.round(avg*100)+' %'}</p>
        <ol class="session-steps sumlist">${S.steps.map((s,i)=>{const x=S.res[i];return`<li class="${x&&!x.skipped?'done':''}"><span>${x&&!x.skipped?IC.check:i+1}</span><b>${KIND[s.k][0]}: ${esc(G[s.id].n)}</b><small>${x?x.skipped?'Saltado':Math.round(x.p*100)+' % · '+'★'.repeat(x.stars):''}</small></li>`}).join('')}</ol>
        <p class="cap">Racha: ${streak()} ${streak()===1?'día':'días'}. Mañana la sesión trae otro groove.</p>
        <div class="row how-actions"><a class="btn pri" href="#/">Volver a Hoy</a><a class="btn" href="#/progreso">Ver progreso</a></div></div>`;
      root.onclick=null;
    }
    if(!single&&S.i>=S.steps.length)summary();else intro();
    return()=>{destroyed=true;stopAll();if(live)document.removeEventListener('miclv',live);micStop();COACH=null};
  }};
}
