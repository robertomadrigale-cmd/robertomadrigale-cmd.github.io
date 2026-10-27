/* ---------- rejilla que se ilumina, batería vista desde arriba y reproductor de grooves ---------- */
// Rejilla: un bloque por compás; filas = instrumentos, columnas = golpes; abajo la cuenta y quién toca (D/I/pies)
function grooveGrid(g,o){
  o=o||{};const n=gSteps(g),bars=g.bars||1,per=n/bars,rows=ROW_ORDER.filter(r=>g.rows[r]);
  let h=`<div class="dgrid" style="--n:${per}">`;
  for(let b=0;b<bars;b++){
    h+=`<div class="dbar">${bars>1?`<span class="dbn">Compás ${b+1}</span>`:''}`;
    rows.forEach(r=>{const muted=o.muted&&o.muted.includes(r);
      h+=`<div class="drow${muted?' you':''}" data-row="${r}"><span class="dlab" title="${ROWS[r].n}">${ROWS[r].a}</span>`;
      for(let j=0;j<per;j++){const i=b*per+j,c=g.rows[r][i]||'-',beat=j%g.sub===0;
        h+=`<span class="dc${beat?' b':''}" data-i="${i}">${c==='-'?'':`<i class="dn ${c==='X'?'acc':c==='g'?'gh':c==='o'?'op':''}"></i>`}</span>`}
      h+='</div>'});
    h+=`<div class="drow dcount"><span class="dlab"></span>`;
    for(let j=0;j<per;j++){const p=j%g.sub,bt=Math.floor(j/g.sub)%g.meter+1;h+=`<span class="dk${p===0?' b':''}" data-i="${b*per+j}">${p===0?bt:COUNT[g.sub][p]}</span>`}
    h+='</div>';
    if(o.limbs!==false){h+=`<div class="drow dlimb"><span class="dlab" title="Manos">${IC.hand}</span>`;
      for(let j=0;j<per;j++){const i=b*per+j,ls=[...new Set(rows.filter(r=>g.rows[r][i]&&g.rows[r][i]!=='-'&&!['bd','hf'].includes(r)).map(r=>limbOf(g,r,i)))];
        h+=`<span class="dk" data-i="${i}">${ls.join('')}</span>`}
      h+='</div>'}
    h+='</div>';
  }
  return h+'</div>';
}
// ilumina la columna i (−1 apaga) y hace destellar las notas que suenan
function gridNow(root,i){
  if(!root)return;$$('.dgrid .now',root).forEach(x=>x.classList.remove('now'));
  if(i<0)return;$$(`.dgrid [data-i="${i}"]`,root).forEach(x=>{x.classList.add('now');const d=x.firstElementChild;if(d&&d.animate&&!RMOT.matches)d.animate([{transform:'scale(1.45)'},{transform:'scale(1)'}],{duration:180,easing:'ease-out'})});
}
// marca una nota de la rejilla con el color de su calificación
function gridMark(root,i,cls){const c=root&&$$(`.dgrid .drow:not(.dcount):not(.dlimb) [data-i="${i}"]`,root);(c||[]).forEach(x=>{x.classList.remove('ok','mid','bad','miss');if(cls)x.classList.add(cls)})}
/* Batería vista desde arriba: cada pieza se ilumina al sonar, con la mano o el pie que la toca. */
const KITPOS={cr:[62,38,27],hh:[44,118,24],t1:[128,62,23],t2:[188,60,23],rd:[272,52,33],cb:[226,104,11],sn:[110,148,29],ft:[250,150,33],bd:[176,180,0],hf:[40,176,0]};
function kitSVG(g,extra){
  const used=new Set(Object.keys(g?g.rows:{}));if(used.has('rim'))used.add('sn');
  let s=`<svg class="kit ${extra||''}" viewBox="0 0 320 215" role="img" aria-label="Batería vista desde arriba: se ilumina lo que suena y quién lo toca">`;
  s+=`<rect class="kbo" data-r="bd" x="132" y="166" width="88" height="34" rx="12"/><text class="kpl" x="176" y="188">Bombo</text>`;
  s+=`<rect class="kbo kped" data-r="hf" x="18" y="164" width="46" height="26" rx="8"/><text class="kpl" x="41" y="181">Pedal</text>`;
  ['cr','rd','hh','cb'].forEach(r=>{const[x,y,rr]=KITPOS[r];s+=`<circle class="kcy${used.has(r)?' use':''}" data-r="${r}" cx="${x}" cy="${y}" r="${rr}"/>`});
  ['t1','t2','sn','ft'].forEach(r=>{const[x,y,rr]=KITPOS[r];s+=`<circle class="kdr${used.has(r)||r==='sn'&&used.has('rim')?' use':''}" data-r="${r}" cx="${x}" cy="${y}" r="${rr}"/>`});
  [['cr','Platillo'],['hh','Hi-hat'],['t1','Tom 1'],['t2','Tom 2'],['rd','Ride'],['sn','Tarola'],['ft','Tom de piso']].forEach(([r,n])=>{const[x,y,rr]=KITPOS[r];s+=`<text class="kpl" x="${x}" y="${y+rr+12}">${n}</text>`});
  Object.keys(KITPOS).forEach(r=>{const[x,y]=KITPOS[r];s+=`<text class="klimb" data-l="${r}" x="${x}" y="${(r==='bd'||r==='hf'?y-21:y+5)}"></text>`});
  return s+'</svg>';
}
const LIMBS_HTML=`<div class="limbs">${Object.entries(LIMB).map(([k,n])=>`<span data-limb="${k}">${n}</span>`).join('')}</div>`;
function kitFlash(root,row,limb){
  if(!root)return;const r=row==='rim'?'sn':row,el=$(`.kit [data-r="${r}"]`,root),lb=$(`.kit [data-l="${r}"]`,root);
  if(el){el.classList.remove('on');void el.getBBox;el.classList.add('on');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),150)}
  if(lb&&limb){lb.textContent=limb;clearTimeout(lb._t);lb._t=setTimeout(()=>{lb.textContent=''},260)}
  const L=limb&&$(`.limbs [data-limb="${limb}"]`,root);if(L){L.classList.add('on');clearTimeout(L._t);L._t=setTimeout(()=>L.classList.remove('on'),160)}
}
/* ---------- reproductor: cuenta de entrada, click, batería (toda, nada o sin las filas que tocas tú), banda y fin ---------- */
const GRUN={};
function grooveRun(o){
  const g=o.g,n=gSteps(g),step=60/o.bpm/g.sub,bar=g.meter*g.sub,cnt=o.count===false?0:bar*(g.meter===2?2:1);
  const st={T0:0,step,n,cnt,end:null,o};Object.assign(GRUN,st);
  let ended=false;
  seqStart(o.id||'grv',o.label||g.n,()=>step,(s,t)=>{
    if(s===0){st.T0=GRUN.T0=t+cnt*step;if(o.loops)st.end=GRUN.end=st.T0+o.loops*n*step;if(o.band)bandPlay(o.band,st.T0,o.bandVol);if(o.onStart)o.onStart(st)}
    if(s<cnt){if(s%g.sub===0)tick(t,s%bar===0?'acc':'beat');return}
    const k=s-cnt,i=k%n,loop=Math.floor(k/n);
    if(o.loops&&loop>=o.loops){if(!ended){ended=true;const c=ac();setTimeout(()=>{if(SEQ.id!==(o.id||'grv'))return;grooveStop();if(o.onEnd)o.onEnd(st)},Math.max(0,(t-c.currentTime+.45+outLat())*1000))}return}
    const click=typeof o.click==='function'?o.click(loop):o.click;
    if(click&&i%g.sub===0)tick(t,i%bar===0?'acc':'beat');
    const drums=typeof o.drums==='function'?o.drums(loop):o.drums;
    if(drums)for(const r in g.rows){const c=g.rows[r][i];if(c&&c!=='-'&&!(o.muted||[]).includes(r))hit(r,t,c)}
  },(s)=>{
    if(s<cnt){if(o.onCount&&s%g.sub===0)o.onCount(Math.floor(s/g.sub)%g.meter+1,s===0);return}
    const k=s-cnt,i=k%n,loop=Math.floor(k/n);if(o.loops&&loop>=o.loops)return;
    if(o.onStep)o.onStep(i,loop);
  });
  return st;
}
function grooveStop(){if(SEQ.id)seqStop();bandStop()}
// ilumina la rejilla y la batería al compás de lo que suena (para ejemplos y el reproductor)
function lightStep(root,g,i,muted){
  gridNow(root,i);
  for(const r in g.rows){const c=g.rows[r][i];if(c&&c!=='-')kitFlash(root,r,limbOf(g,r,i))}
  if(i%g.sub===0)beatPulse(root,i%(g.meter*g.sub)===0);
}
