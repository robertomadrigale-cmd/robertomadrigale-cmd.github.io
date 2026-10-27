/* ---------- widgets ---------- */
const keyOpts=KEYS.map((x,i)=>({v:i,l:x.es,s:x.us}));
const INTS=[
 {n:1,sym:'♭2',name:'Segunda menor',ch:'Tensión máxima: dos notas pegadas que piden separarse.'},
 {n:2,sym:'2',name:'Segunda mayor',ch:'Paso natural de una melodía; suena a movimiento.'},
 {n:3,sym:'♭3',name:'Tercera menor',ch:'Sombría e íntima. Define el acorde menor.'},
 {n:4,sym:'3',name:'Tercera mayor',ch:'Luminosa y estable. Define el acorde mayor.'},
 {n:5,sym:'4',name:'Cuarta justa',ch:'Abierta, de apoyo; suele pedir bajar a la tercera.'},
 {n:6,sym:'♭5',name:'Tritono',ch:'Inestable. Es el corazón de la tensión dominante.'},
 {n:7,sym:'5',name:'Quinta justa',ch:'Sólida y vacía; la base del power chord.'},
 {n:8,sym:'♭6',name:'Sexta menor',ch:'Anhelante, dulce y algo triste.'},
 {n:9,sym:'6',name:'Sexta mayor',ch:'Cálida y abierta; muy cantable.'},
 {n:10,sym:'♭7',name:'Séptima menor',ch:'Bluesera: queda en suspenso.'},
 {n:11,sym:'7',name:'Séptima mayor',ch:'Muy tensa; pide resolver a la octava.'},
 {n:12,sym:'8',name:'Octava',ch:'La misma nota, más aguda: el reposo total.'}];
const OCT=INST.id==='bajo'?{5:[3,2],4:[2,2],3:[1,2]}:{6:[4,2],5:[3,2],4:[2,3],3:[1,3]};
const PROGS={
 pop:{n:'I–V–vi–IV',it:[[0,'maj'],[4,'maj'],[5,'min'],[3,'maj']]},
 s50:{n:'I–vi–IV–V',it:[[0,'maj'],[5,'min'],[3,'maj'],[4,'maj']]},
 ii:{n:'ii–V–I',it:[[1,'m7'],[4,'dom7'],[0,'maj7']]},
 b3:{n:'I–IV–V',it:[[0,'maj'],[3,'maj'],[4,'maj'],[0,'maj']]},
 b12:{n:'Blues de 12 compases',it:[0,0,0,0,3,3,0,0,4,3,0,4].map(d=>[d,'dom7'])}};
const TRI=['maj','min','min','maj','maj','min','dim'],SEV=['maj7','m7','m7','maj7','dom7','m7','m7b5'],FUN=['T','S','T','S','D','T','D'];
const FUNN={T:'Tónica',S:'Subdom.',D:'Dominante'};
const rnum=(d,t)=>{const b=['I','II','III','IV','V','VI','VII'][d];return['min','m7','m7b5','dim'].includes(t)?b.toLowerCase()+(t==='dim'?'°':t==='m7b5'?'ø':t==='m7'?'7':''):b+(t==='dom7'?'7':t==='maj7'?'maj7':'')};
const SHAPES={C:{f:[null,3,2,0,1,0],r:0,rs:5},A:{f:[null,0,2,2,2,0],r:9,rs:5},G:{f:[3,2,0,0,0,3],r:7,rs:6},E:{f:[0,2,2,1,0,0],r:4,rs:6},D:{f:[null,null,0,2,3,2],r:2,rs:4}};
const PWIN=[[0,3],[2,5],[4,8],[7,10],[9,12]];
function pentaData(s){
  const R=KEYS[s.k],maj=s.sc==='maj',mp=maj?(R.pc+9)%12:R.pc,semis=maj?[0,2,4,7,9]:[0,3,5,7,10],steps=maj?[0,1,2,4,5]:[0,2,3,4,6];
  const nt=semis.map((x,i)=>spell(R,x,steps[i])),pcs=nt.map(n=>n.pc),nm={};nt.forEach(n=>nm[n.pc]=n.es);
  const blue=maj?spell(R,3,2):spell(R,6,4);
  let wins=[];
  if(s.p>0){const r=(mp-4+12)%12;let[a,b]=PWIN[s.p-1].map(x=>x+r);if(b>17){a-=12;b-=12}wins=[[a,b]];if(a-12>=0)wins.push([a-12,b-12]);if(b+12<=17)wins.push([a+12,b+12])}
  const inW=f=>!wins.length||wins.some(w=>f>=w[0]&&f<=w[1]);
  const dots=[];
  pos(pcs,0,17).forEach(([st,f])=>{const pc=(OPEN_PC[st]+f)%12;const on=inW(f);dots.push({s:st,f,t:nm[pc],k:pc===R.pc?(on?'root':'faint'):(on?'note':'faint')})});
  if(s.b)pos([blue.pc],0,17).forEach(([st,f])=>{if(inW(f))dots.push({s:st,f,t:blue.es,k:'blue'})});
  return{dots,zones:wins,nt,blue};
}
function cagedData(s){
  if(INST.id==='bajo')return bassCaged(s);
  const K=KEYS[s.k],sh=SHAPES[s.s],shift=(K.pc-sh.r+12)%12,dots=[],muted=[];
  sh.f.forEach((f,i)=>{const st=6-i;if(f==null){muted.push(st);return}const fr=f+shift,pc=(OPEN_PC[st]+fr)%12,d=(pc-K.pc+12)%12;dots.push({s:st,f:fr,k:d===0?'root':'note',t:d===0?'1':d===4?'3':'5'})});
  const fr=sh.f.filter(x=>x!=null).map(x=>x+shift);
  return{dots,muted,shift,min:Math.min(...fr),max:Math.max(...fr)};
}
function circleSVG(ki){
  let g='';const cx=150,cy=150;
  KEYS.forEach((K,i)=>{
    const a=(-90+30*i)*Math.PI/180,cls=i===ki?'sel':(i===(ki+1)%12||i===(ki+11)%12)?'nb':'';
    g+=`<g class="cc ${cls}" data-k="k" data-v="${i}"><circle cx="${(cx+112*Math.cos(a)).toFixed(1)}" cy="${(cy+112*Math.sin(a)).toFixed(1)}" r="21"/><text x="${(cx+112*Math.cos(a)).toFixed(1)}" y="${(cy+112*Math.sin(a)).toFixed(1)}">${K.us}</text></g>`;
    const rel=spell(K,9,5);
    g+=`<g class="cc m ${i===ki?'sel':''}" data-k="k" data-v="${i}"><circle cx="${(cx+68*Math.cos(a)).toFixed(1)}" cy="${(cy+68*Math.sin(a)).toFixed(1)}" r="17"/><text x="${(cx+68*Math.cos(a)).toFixed(1)}" y="${(cy+68*Math.sin(a)).toFixed(1)}">${rel.us}m</text></g>`;
  });
  const n=ACC_N[ki];
  g+=`<text class="cctr" x="150" y="146">${n===0?'sin alteraciones':Math.abs(n)+(n>0?' ♯':' ♭')}</text><text class="cctr" x="150" y="162">${KEYS[ki].us} mayor</text>`;
  return`<svg viewBox="0 0 300 300" style="width:100%;max-width:340px;display:block;margin:0 auto" role="img" aria-label="Círculo de quintas">${g}</svg>`;
}
const diaT=ki=>{const sc=scaleNotes(KEYS[ki],MAJ);return TRI.map((t,d)=>({pc:sc[d].pc,t,sym:sc[d].us+CT[t].suf,rn:rnum(d,t)}))};
const playBtn=(m,mode,label,step)=>`<button class="pbtn" data-play="${m.join(',')}" data-mode="${mode}"${step?` data-step="${step}"`:''}>${label}</button>`;
const WID={
noteFinder:{
  init:{n:9},controls:[{k:'n',label:'Elige una nota',opts:PCS.map((p,i)=>({v:i,l:p[0],s:p[1]}))}],
  view:s=>{const d=pos([s.n],0,12).map(([a,b])=>({s:a,f:b,t:PCS[s.n][0],k:'note'}));
    return fretboard({dots:d,label:'Posiciones de '+PCS[s.n][0]})+`<p class="cap"><b>${PCS[s.n][0]}</b> aparece en ${d.length} posiciones entre el traste 0 y el 12.${PRINT?'':' Toca cualquier punto para escucharlo.'}</p>`},
  snaps:[{n:0},{n:7},{n:9}]},
octave:{
  init:{s:INST.n,f:5},
  controls:[{k:'s',label:'Cuerda de partida',opts:INST.desc.filter(s=>s>=3).map(v=>({v,l:'Cuerda '+v+' → '+(v-2)}))},{k:'f',label:'Traste',opts:[0,1,2,3,4,5,6,7,8].map(v=>({v,l:String(v)}))}],
  view:s=>{const[ts,df]=OCT[s.s],f2=s.f+df,m1=(OPEN_PC[s.s]+s.f)%12;
    const d=[{s:s.s,f:s.f,k:'root',t:PCS[m1][0]},{s:ts,f:f2,k:'note',t:PCS[m1][0]}];
    return fretboard({dots:d,label:'Forma de octava'})+`<p class="cap">Desde la cuerda ${s.s}, sube <b>${s.s-ts} cuerdas</b> y <b>${df} trastes</b> más: es la misma nota, una octava arriba.</p><div class="row-act">${playBtn([OPEN_MIDI[s.s]+s.f,OPEN_MIDI[ts]+f2],'seq','Escuchar la octava')}</div>`},
  snaps:[{s:6,f:5},{s:5,f:3},{s:4,f:0},{s:3,f:5}]},
intervals:{
  init:{i:3},controls:[{k:'i',label:'Intervalo desde Do (cuerda '+(INST.id==='bajo'?3:5)+', traste 3)',opts:INTS.map((x,i)=>({v:i,l:x.sym,s:String(x.n)}))}],
  view:s=>{const iv=INTS[s.i],rs=INST.id==='bajo'?3:5,rf=3,rm=OPEN_MIDI[rs]+rf,tm=rm+iv.n;const c=[];
    for(let st=1;st<=INST.n;st++){const f=tm-OPEN_MIDI[st];if(f>=0&&f<=12&&!(st===rs&&f===rf))c.push({s:st,f,t:iv.sym})}
    c.sort((a,b)=>Math.abs(a.s-rs)-Math.abs(b.s-rs)||Math.abs(a.f-rf)-Math.abs(b.f-rf));
    const d=[{s:rs,f:rf,k:'root',t:'Do'},...c.map((x,i)=>({...x,k:i===0?'note':'faint'}))];
    return fretboard({dots:d,label:iv.name})+`<p class="cap"><b>${iv.name}</b> · ${iv.n} semitonos. ${iv.ch}</p><div class="row-act">${playBtn([rm,tm],'seq','Una tras otra')}${playBtn([rm,tm],'chord','Juntas')}</div>`},
  snaps:[{i:2},{i:3},{i:4},{i:6},{i:11}]},
scale:{
  init:{k:0,lab:'es'},controls:[{k:'k',label:'Tonalidad',opts:keyOpts},{k:'lab',label:'Etiquetas',opts:[{v:'es',l:'Nombres'},{v:'deg',l:'Grados'}]}],
  view:s=>{const R=KEYS[s.k],nt=scaleNotes(R,MAJ),idx={};nt.forEach((n,i)=>idx[n.pc]=i);
    const d=pos(nt.map(n=>n.pc),0,12).map(([st,f])=>{const i=idx[(OPEN_PC[st]+f)%12];return{s:st,f,k:i===0?'root':'note',t:s.lab==='deg'?i+1:nt[i].es}});
    const ts=[2,2,1,2,2,2,1];
    const strip=nt.map((n,i)=>`<div class="nt ${i===0?'r':''}"><b>${n.es}</b><small>${n.us} · ${i+1}</small></div>${i<6?`<span class="ts ${ts[i]===2?'t':'s'}">${ts[i]===2?'T':'S'}</span>`:''}`).join('');
    const rm=48+R.pc;
    return`<div class="strip">${strip}</div>`+fretboard({dots:d,label:'Escala de '+R.es+' mayor'})+`<p class="cap"><b>${R.es} mayor (${R.us})</b>. T = tono (2 trastes), S = semitono (1 traste).</p><div class="row-act">${playBtn([...MAJ.map(x=>rm+x),rm+12],'seq','Escuchar la escala',.3)}</div>`},
  snaps:[{k:0,lab:'es'},{k:1,lab:'deg'},{k:11,lab:'es'}]},
mode:{
  init:{k:0,m:1,lab:'deg'},
  controls:[{k:'k',label:'Nota de partida (centro del modo)',opts:keyOpts},{k:'m',label:'Modo',opts:MODES.map((x,i)=>({v:i,l:x.n}))},{k:'lab',label:'Etiquetas',opts:[{v:'deg',l:'Grados'},{v:'es',l:'Nombres'}]}],
  view:s=>{const R=KEYS[s.k],M=MODES[s.m],sm=modeSemis(s.m),nt=scaleNotes(R,sm),idx={};nt.forEach((n,i)=>idx[n.pc]=i);
    const par=KEYS.find(x=>x.pc===(R.pc-MAJ[s.m]+12)%12),deg=sm.map((x,i)=>{const dd=x-MAJ[i];return(dd<0?'♭':dd>0?'♯':'')+(i+1)});
    const d=pos(nt.map(n=>n.pc),0,12).map(([st,f])=>{const i=idx[(OPEN_PC[st]+f)%12];return{s:st,f,k:i===0?'root':'note',t:s.lab==='deg'?deg[i]:nt[i].es}});
    const rm=48+R.pc;
    return`<div class="strip">${nt.map((n,i)=>`<div class="nt ${i===0?'r':''}"><b>${n.es}</b><small>${deg[i]}</small></div>`).join('')}</div>`+fretboard({dots:d,label:R.es+' '+M.n})+`<p class="cap"><b>${R.es} ${M.n.toLowerCase()}</b> usa las notas de <b>${par.es} mayor</b>, pero ${R.es} es el centro. ${M.ch}</p><div class="row-act">${playBtn([...sm.map(x=>rm+x),rm+12],'seq','Escuchar el modo',.3)}</div>`},
  snaps:[{k:0,m:0},{k:2,m:1},{k:4,m:2},{k:0,m:3},{k:1,m:4},{k:3,m:5},{k:5,m:6}]},
chord:{
  init:sp=>({k:3,t:sp.types[1]||sp.types[0],lab:'fn'}),
  controls:sp=>[{k:'k',label:'Raíz',opts:keyOpts},{k:'t',label:'Tipo de acorde',opts:sp.types.map(t=>({v:t,l:CT[t].label}))},{k:'lab',label:'Etiquetas',opts:[{v:'fn',l:'Funciones'},{v:'es',l:'Notas'}]}],
  view:s=>{const R=KEYS[s.k],T=CT[s.t],nt=chordNotes(R,s.t),pcs=nt.map(n=>n.pc);
    const d=pos(pcs,0,12).map(([st,f])=>{const i=pcs.indexOf((OPEN_PC[st]+f)%12);return{s:st,f,k:i===0?'root':'note',t:s.lab==='fn'?T.f[i]:nt[i].es}});
    return fretboard({dots:d,label:R.us+T.suf})+`<p class="cap"><b>${R.us+T.suf}</b> = ${T.f.join(' – ')} → ${nt.map(n=>n.es).join(' – ')}. ${T.ch}</p><div class="row-act">${playBtn(chordMidi(R,s.t),'chord','Escuchar el acorde')}</div>`},
  snaps:sp=>sp.types.map((t,i)=>({k:i%2?3:0,t}))},
harm:{
  init:{k:0,sev:0},controls:[{k:'k',label:'Tonalidad',opts:keyOpts},{k:'sev',label:'Acordes',opts:[{v:0,l:'Tríadas'},{v:1,l:'Con séptima'}]}],
  view:s=>{const sc=scaleNotes(KEYS[s.k],MAJ),L=s.sev?SEV:TRI;
    return`<div>${L.map((t,d)=>{const nt=chordNotes(sc[d],t);return`<div class="hrow"><span class="rn">${rnum(d,t)}</span><div><div class="sy">${sc[d].us+CT[t].suf}</div><div class="no">${nt.map(n=>n.es).join(' · ')}</div></div><span class="fn ${FUN[d]}">${FUNN[FUN[d]]}</span>${playBtn(chordMidi(sc[d],t),'chord','')}</div>`}).join('')}</div><p class="cap">Los acordes de <b>${KEYS[s.k].es} mayor</b>, uno por cada grado de la escala.</p>`},
  snaps:[{k:0,sev:0},{k:1,sev:0}]},
caged:{
  init:{k:0,s:'C'},controls:[{k:'k',label:'Tonalidad',opts:keyOpts},{k:'s',label:'Forma',opts:Object.keys(SHAPES).map(v=>({v,l:v}))}],
  view:s=>{const K=KEYS[s.k],c=cagedData(s),all=Object.keys(SHAPES).map(x=>({x,...cagedData({k:s.k,s:x})})).sort((a,b)=>a.min-b.min);
    const rm=c.dots.slice().sort((a,b)=>b.s-a.s).map(d=>OPEN_MIDI[d.s]+d.f);
    return fretboard({to:15,dots:c.dots,muted:c.muted,zones:[[c.min,c.max]],label:'Forma '+s.s+' en '+K.es})+`<p class="cap">Forma de <b>${s.s}</b> para <b>${K.us}</b>: ${c.shift?'cejilla en el traste '+c.shift:'posición abierta'}. Raíz en rojo.</p><ol class="order">${all.map(a=>`<li class="${a.x===s.s?'on':''}"><b>${a.x}</b>${a.min===0?'abierta':'trastes '+a.min+'–'+a.max}</li>`).join('')}</ol><div class="row-act">${playBtn(rm,'chord','Escuchar')}</div>`},
  snaps:['C','A','G','E','D'].map(x=>({k:0,s:x}))},
prog:{
  init:{k:1,p:'pop'},controls:[{k:'k',label:'Tonalidad',opts:keyOpts},{k:'p',label:'Progresión',opts:Object.keys(PROGS).map(v=>({v,l:PROGS[v].n}))}],
  view:s=>{const sc=scaleNotes(KEYS[s.k],MAJ),P=PROGS[s.p],ch=P.it.map(([d,t])=>({r:sc[d],t,d}));
    const seq=ch.map(c=>chordMidi(c.r,c.t).join('.')).join('|');
    return`<div class="strip">${ch.map(c=>`<div class="pchip ${FUN[c.d]}"><b>${c.r.us+CT[c.t].suf}</b><small>${rnum(c.d,c.t)}</small></div>`).join('')}</div><p class="cap">Progresión <b>${P.n}</b> en <b>${KEYS[s.k].es} mayor</b>. Verde = tónica, ámbar = subdominante, rojo = dominante.</p><div class="row-act"><button class="pbtn" data-seq="${seq}" data-beat="${ch.length>6?.8:1.1}">Escuchar la progresión</button></div>`},
  snaps:[{k:1,p:'pop'},{k:0,p:'ii'},{k:3,p:'b12'}]},
circle:{
  init:{k:0,h:'V'},controls:[{k:'h',label:'Modular hacia',opts:[{v:'V',l:'La dominante (V)'},{v:'IV',l:'La subdominante (IV)'}]}],
  view:s=>{const ki=s.k,n=ACC_N[ki],tk=s.h==='V'?(ki+1)%12:(ki+11)%12,A=diaT(ki),B=diaT(tk);
    const com=A.map((a,i)=>({a,i,j:B.findIndex(b=>b.pc===a.pc&&b.t===a.t)})).filter(x=>x.j>=0);
    const rel=spell(KEYS[ki],9,5);
    return circleSVG(ki)+`<p class="cap"><b>${KEYS[ki].es} mayor</b>: ${n===0?'sin sostenidos ni bemoles':n>0?n+' sostenido'+(n>1?'s':'')+' ('+SHARPS.slice(0,n).join(', ')+')':(-n)+' bemol'+(n<-1?'es':'')+' ('+FLATS.slice(0,-n).join(', ')+')'}. Su relativa menor es <b>${rel.us}m</b>. Toca otra tonalidad en el círculo.</p>`+`<p class="blockh" style="margin-top:14px">Acordes pivote de ${KEYS[ki].us} a ${KEYS[tk].us}</p><div class="strip">${com.map(x=>`<div class="pchip"><b>${x.a.sym}</b><small>${x.a.rn} → ${B[x.j].rn}</small></div>`).join('')}</div><p class="cap">Estos acordes existen en las dos tonalidades: sirven de puente al modular.</p>`},
  snaps:[{k:0,h:'V'},{k:2,h:'IV'}]},
penta:{
  init:{k:3,sc:'min',p:0,b:0},
  controls:[{k:'k',label:'Tonalidad',opts:keyOpts},{k:'sc',label:'Pentatónica',opts:[{v:'min',l:'Menor'},{v:'maj',l:'Mayor'}]},{k:'p',label:'Caja',opts:[{v:0,l:'Todas'},...[1,2,3,4,5].map(v=>({v,l:'Caja '+v}))]},{k:'b',label:'Blue note',opts:[{v:0,l:'No'},{v:1,l:'Sí'}]}],
  view:s=>{const D=pentaData(s),R=KEYS[s.k];
    return fretboard({to:17,dots:D.dots,zones:D.zones,label:'Pentatónica'})+`<p class="cap">Pentatónica <b>${s.sc==='min'?'menor':'mayor'}</b> de <b>${R.es}</b>: ${D.nt.map(n=>n.es).join(' · ')}.${s.b?` Blue note: <b>${D.blue.es}</b> (azul).`:''} ${s.sc==='maj'?'Las cajas se numeran como las de su relativa menor.':''}</p>`},
  snaps:[{k:3,sc:'min',p:0,b:0},{k:3,sc:'min',p:1,b:1},{k:3,sc:'min',p:3,b:0},{k:0,sc:'maj',p:0,b:0}]},
sketch:{
  init:{k:1,p:'pop',steps:[1,3,5,3,6,5,3,2]},
  controls:[{k:'k',label:'Tonalidad',opts:keyOpts},{k:'p',label:'Progresión',opts:['pop','s50'].map(v=>({v,l:PROGS[v].n}))}],
  view:s=>{const sc=scaleNotes(KEYS[s.k],MAJ),P=PROGS[s.p];
    const opt=v=>`<option value="${v}">${v?v+' · '+sc[v-1].es:'silencio'}</option>`;
    const sel=s.steps.map((v,i)=>`<label>Paso ${i+1}<select data-i="${i}">${[0,1,2,3,4,5,6,7].map(x=>opt(x).replace(`value="${x}"`,`value="${x}"${x===v?' selected':''}`)).join('')}</select></label>`).join('');
    const stat=s.steps.map((v,i)=>`${i+1}: ${v?sc[v-1].es:'—'}`).join('  ·  ');
    return`<p class="cap" style="margin:0 0 8px">Acordes (2 pasos cada uno): <b>${P.it.map(([d,t])=>sc[d].us+CT[t].suf).join(' – ')}</b></p>${PRINT?`<p>${stat}</p>`:`<div class="steps">${sel}</div><div class="row-act"><button class="pbtn" data-act="play">Escuchar</button><button class="pbtn" data-act="rand">Melodía al azar</button></div>`}`},
  act:(s,a,paint)=>{
    if(a==='rand'){s.steps=s.steps.map((_,i)=>i===7?[1,2,5][Math.floor(Math.random()*3)]:Math.random()<.15?0:[1,2,3,4,5,6][Math.floor(Math.random()*6)]);paint();return}
    if(!ac())return;const K=KEYS[s.k],P=PROGS[s.p],sc=scaleNotes(K,MAJ),st=.42,t0=AC.currentTime+.05,tm=60+((K.pc+5)%12)-5;
    P.it.forEach(([d,t],i)=>chordMidi(sc[d],t).forEach((m,j)=>pluck(m,t0+i*2*st+j*.04,2*st*1.1,.14)));
    s.steps.forEach((v,i)=>{if(v)pluck(tm+MAJ[v-1],t0+i*st,st*1.3,.24)});
  },
  snaps:[{k:1,p:'pop'}]}
};
