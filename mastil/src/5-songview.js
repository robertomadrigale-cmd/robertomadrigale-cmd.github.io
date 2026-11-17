/* ---------- reproductor del cancionero: vistas Letras · Acordes · Formas · Pistas ----------
   Letras = karaoke de siempre. Acordes = rejilla compás por compás con la letra debajo. Formas = diagramas grandes
   del acorde anterior, el actual y los que siguen. Pistas = mezclador: con la banda de la app, guitarra/bajo/batería
   por separado; con tu grabación, separación aproximada (voz y centro, graves, guitarras de los lados). */

/* acordes fáciles sin IA: tríada mayor o menor, sin bajo; si se repite el mismo acorde seguido, no se vuelve a escribir */
function simpleChord(p){
  if(!p)return p;const t=chType(p.suf),mi=/^(min|m7|m7b5)$/.test(t)||p.minor;
  const suf=t==='dim'?'dim':mi?'m':'';
  return{pc:p.pc,suf,bass:null,minor:mi&&t!=='dim',simp:p.suf!==suf||p.bass!=null};
}
function simplifyP(P){
  let prev=null;const seen={};P.chords=[];P.all=[];
  // el primer acorde de cada renglón siempre se escribe (como en los cancioneros); solo se ocultan los repetidos dentro del renglón
  P.lines.forEach(L=>{prev=null;if(!L.pieces)return;L.pieces.forEach(pc=>{if(!pc.p)return;pc.p=simpleChord(pc.p);
    const k=pc.p.pc+pc.p.suf;pc.hide=prev===k;prev=k;P.all.push(pc.p);if(!seen[k]){seen[k]=1;P.chords.push(pc.p)}})});
  P.simple=true;return P;
}
// sección de cada renglón (para el rasgueo por sección y la vista de pistas)
function lineSections(P){const out={};let cur='verso',lbl='';
  P.lines.forEach((L,li)=>{if(L.label!=null){cur=iaSec(L.label);lbl=L.label;return}if(L.pieces)out[li]={k:cur,l:lbl}});return out}
// la fuerza natural de cada sección cuando no hay IA: el coro con todo, el verso un poco más suave
const SEC_DYN={intro:.88,verso:.92,precoro:1,coro:1.1,puente:.95,solo:1,final:.95};
/* ---------- vista Acordes: compases con sus pulsos y la letra debajo ---------- */
function kgridHTML(P,TL,bt,nm){
  const pk=P.pickup||0,barOf=b=>Math.floor((b-pk)/bt+1e-6),ch=TL.ev.filter(e=>e.type==='chord').sort((a,b)=>a.b-b.b);
  const chAt=B=>{let c=null;for(const e of ch){if(e.b<=B+1e-3)c=e;else break}return c};
  const seen=new Set();let h='',last=-1;
  TL.lines.forEach((L,g)=>{
    for(let li=last+1;li<L.li;li++){const x=P.lines[li];if(x&&x.label!=null)h+=`<div class="kgsec">${esc(x.label)}</div>`}last=L.li;
    const nx=TL.lines[g+1]?TL.lines[g+1].start:TL.total,b0=barOf(L.start),b1=Math.max(b0,barOf(nx-.01)),pcs=P.lines[L.li].pieces;
    const lits=TL.ev.filter(e=>e.type==='lit'&&e.li===L.li);
    for(let n=b0;n<=b1;n++){
      const s=pk+n*bt;let cells='';
      for(let j=0;j<bt;j++){const B=s+j,es=ch.filter(e=>Math.floor(e.b+1e-3)===B),e=es[es.length-1];let t='',cl='';
        if(e){const pc=P.lines[e.li]&&P.lines[e.li].pieces[e.pi];t=pc&&pc.hide?'':nm(e.p);if(!t&&j===0){t=nm(e.p);cl=' cont'}}
        else if(j===0){const c=chAt(B);if(c){t=nm(c.p);cl=' cont'}}
        cells+=`<span class="kgc${cl}${t?'':' e'}" data-b="${B}">${t?`<b>${esc(t)}</b>`:''}</span>`}
      const txt=lits.filter(e=>barOf(e.b)===n).map(e=>{const pc=pcs[e.pi];return(pc.sp?' ':'')+pc.text}).join('').trim();
      if(seen.has(n)&&!txt)continue;seen.add(n);
      h+=`<div class="kgrow" data-li="${L.li}" data-bar="${n}"><span class="kgn">${n>=0?n+1:''}</span><div class="kgcells" style="--bt:${bt}">${cells}</div></div>${txt?`<div class="kgly" data-li="${L.li}" data-bar="${n}">${esc(txt)}</div>`:''}`}
  });
  return h||'<p class="cap">Esta canción no tiene acordes.</p>';
}
function kgridAt(root,beat){
  const g=$('#kgrid',root);if(!g||g.closest('[hidden]'))return;const B=Math.floor(beat+1e-3);
  const c=$(`.kgc[data-b="${B}"]`,g);if(!c)return;if(c.classList.contains('on'))return;
  $$('.kgc.on',g).forEach(x=>x.classList.remove('on'));c.classList.add('on');
  const row=c.closest('.kgrow');if(row.classList.contains('cur'))return;
  $$('.kgrow.cur,.kgly.cur',g).forEach(x=>x.classList.remove('cur'));row.classList.add('cur');
  const ly=row.nextElementSibling;if(ly&&ly.classList.contains('kgly'))ly.classList.add('cur');
  let p=row.previousElementSibling;$$('.kgrow.past,.kgly.past',g).forEach(x=>x.classList.remove('past'));while(p){if(p.classList.contains('kgrow')||p.classList.contains('kgly'))p.classList.add('past');p=p.previousElementSibling}
  const rc=row.getBoundingClientRect();window.scrollBy({top:rc.top-innerHeight*.36,behavior:'smooth'});
}
function kgridClear(root){const g=$('#kgrid',root);if(g)$$('.on,.cur,.past',g).forEach(x=>x.classList.remove('on','cur','past'))}
/* ---------- vista Formas: diagramas grandes ---------- */
function kformsSeq(P,TL){const ch=TL.ev.filter(e=>e.type==='chord').sort((a,b)=>a.b-b.b),out=[];
  ch.forEach(e=>{const k=e.p.pc+'|'+e.p.suf+'|'+e.p.bass;if(out.length&&out[out.length-1].k===k)return;out.push({k,p:e.p,b:e.b,li:e.li})});return out}
function kformsHTML(seq,i,nm,shape,lines){
  const card=(j,cl)=>{const x=seq[j];if(!x)return`<div class="kfc ghost ${cl}"></div>`;const s=shape(x.p);
    return`<div class="kfc ${cl}"><b class="kfn">${esc(nm(x.p))}</b>${s?`<div class="kfd">${s}</div>`:''}</div>`};
  const tl=seq.slice(Math.max(0,i),i+8).map((x,k)=>`<span class="kftl${k===0?' on':''}"><i></i><small>${esc(nm(x.p))}</small></span>`).join('');
  return`<div class="kfrow">${card(i-1,'prev')}${card(i,'cur')}${card(i+1,'nx')}${card(i+2,'nx2')}${card(i+3,'nx3')}</div>
   <div class="kftls">${tl}</div>
   <div class="kfly"><p class="kfl1">${esc(lines[0]||'')}</p><p class="kfl2">${esc(lines[1]||'')}</p></div>`;
}
/* ---------- Pistas ----------
   Grabación: la señal pasa por Web Audio y se divide en tres sin modelo de IA:
   graves (centro bajo 150 Hz: bajo y bombo), centro (voz y lo que va en medio) y lados (L−R: guitarras abiertas, coros).
   Con todo al 100 % la suma es la grabación original. En grabaciones mono no hay lados. */
function stemGraph(el){
  if(el._stem)return el._stem;const c=ac();if(!c)return null;
  let src;try{src=c.createMediaElementSource(el)}catch(e){return null}
  const up=c.createGain();up.channelCount=2;up.channelCountMode='explicit';up.channelInterpretation='speakers';src.connect(up);
  const sp=c.createChannelSplitter(2);up.connect(sp);
  const G=v=>{const g=c.createGain();g.gain.value=v;return g},F=(t,f)=>{const b=c.createBiquadFilter();b.type=t;b.frequency.value=f;b.Q.value=.7071;return b};
  const mid=G(1),side=G(1),l1=G(.5),r1=G(.5),l2=G(.5),r2=G(-.5);
  sp.connect(l1,0);sp.connect(r1,1);l1.connect(mid);r1.connect(mid);sp.connect(l2,0);sp.connect(r2,1);l2.connect(side);r2.connect(side);
  const lp1=F('lowpass',150),lp2=F('lowpass',150),hp1=F('highpass',150),hp2=F('highpass',150);mid.connect(lp1);lp1.connect(lp2);mid.connect(hp1);hp1.connect(hp2);
  const gB=G(1),gV=G(1),gS=G(1),inv=G(-1),mg=c.createChannelMerger(2),master=G(1);
  lp2.connect(gB);hp2.connect(gV);side.connect(gS);
  [gB,gV].forEach(g=>{g.connect(mg,0,0);g.connect(mg,0,1)});gS.connect(mg,0,0);gS.connect(inv);inv.connect(mg,0,1);
  mg.connect(master);master.connect(c.destination);
  return el._stem={v:gV,b:gB,s:gS,master};
}
// volumen real de cada pista según volumen, silencio (M) y solo (S)
function mixGains(M,keys){const solo=keys.some(k=>M[k]&&M[k].s);const o={};keys.forEach(k=>{const m=M[k]||{};o[k]=(solo?!!m.s:!m.m)?(m.v??1):0});return o}
// formas de onda de la grabación por pista (centro, graves, lados), a partir del audio decodificado a 11 kHz
function stemWaves(x,xs,sr,cols){
  const n=x.length,a=1-Math.exp(-2*Math.PI*150/sr),V=new Float32Array(cols),B=new Float32Array(cols),S=new Float32Array(cols);let l1=0,l2=0;
  for(let i=0;i<n;i++){l1+=a*(x[i]-l1);l2+=a*(l1-l2);const c=Math.min(cols-1,Math.floor(i/n*cols)),v=Math.abs(x[i]-l2),b=Math.abs(l2),s=xs?Math.abs(xs[i]):0;
    if(v>V[c])V[c]=v;if(b>B[c])B[c]=b;if(s>S[c])S[c]=s}
  const nz=A=>{let m=0;for(const v of A)m=Math.max(m,v);if(m>0)for(let i=0;i<A.length;i++)A[i]/=m;return A};
  return{v:nz(V),b:nz(B),s:xs?nz(S):null,dur:n/sr};
}
function drawWave(cv,arr,color){
  if(!cv)return;const r=cv.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1),W=Math.max(1,Math.round(r.width*dpr)),H=Math.max(1,Math.round(r.height*dpr));cv.width=W;cv.height=H;
  const x=cv.getContext('2d');x.clearRect(0,0,W,H);if(!arr)return;x.fillStyle=color;const n=arr.length;
  for(let px=0;px<W;px++){const i0=Math.floor(px/W*n),i1=Math.max(i0+1,Math.floor((px+1)/W*n));let m=0;for(let i=i0;i<i1;i++)m=Math.max(m,arr[i]||0);const h=Math.max(1,Math.sqrt(m)*H*.9);x.fillRect(px,(H-h)/2,1,h)}
}
// sin grabación: bloques por compás donde toca cada instrumento de la banda
function drawBlocks(cv,segs,total,color){
  if(!cv)return;const r=cv.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1),W=Math.max(1,Math.round(r.width*dpr)),H=Math.max(1,Math.round(r.height*dpr));cv.width=W;cv.height=H;
  const x=cv.getContext('2d');x.clearRect(0,0,W,H);x.fillStyle=color;
  segs.forEach(([a,b,h])=>{const x0=a/total*W,x1=b/total*W;const hh=H*(h||.6);x.globalAlpha=.85;x.fillRect(x0+1,(H-hh)/2,Math.max(1,x1-x0-2),hh)});x.globalAlpha=1;
}
/* tono fácil (como «Simplify» de Ultimate Guitar): con los acordes ya simplificados, busca el tono donde casi todo
   son acordes abiertos (C D E G A Am Dm Em; F y Bm cuestan un poco; las cejillas, más). Cambiar de tono es preferible
   a usar capo; para sonar igual que la grabación se indica el capo. */
const EASYCH={'0|':0,'2|':0,'4|':0,'7|':0,'9|':0,'9|m':0,'2|m':0,'4|m':0,'5|':2,'11|m':2,'2|dim':3};
function chordCost(p,sh){const pc=(p.pc+sh+120)%12,q=p.suf==='m'?'m':p.suf==='dim'?'dim':'';return EASYCH[pc+'|'+q]??3}
function easyShift(P){if(!P.all.length)return 0;let best=0,bs=1e9;
  for(let sh=-7;sh<=4;sh++){let c=0;P.all.forEach(p=>c+=chordCost(p,sh));c=c/P.all.length+Math.abs(sh)*.02+(sh>0?.3:0);if(c<bs-1e-9){bs=c;best=sh}}
  return best}
// qué capo deja la versión fácil sonando como la original (si se bajó el tono)
function easyCapoTxt(sh,orig,es){if(!sh)return'';if(sh<0)return`Con capo en el traste ${-sh} suena igual que la original (${orig}).`;return`Suena ${sh===1?'medio tono':sh/2+(sh===2?' tono':' tonos')} más agudo que la original (${orig}).`}
// repite los renglones de acordes hasta cubrir la duración de la grabación (canciones de solo progresión)
function expandProg(src,dur){const body=src.split('\n').filter(l=>l.includes('[')&&!/^\s*\{/.test(l));if(!body.length)return src;
  const P=songParse(src),cyc=Math.max(4,songTimeline(P,0,P.beats).total),need=dur*Math.max(150,P.bpm*1.35)/60,reps=Math.min(80,Math.ceil(need/cyc));
  let out=src;for(let i=1;i<reps;i++)out+='\n'+body.join('\n');return out}
