/* Diccionario calculado en afinación estándar. Sin bases de digitaciones externas. */
const CHORD_GROUPS=[['Básicos',['maj','min','power','dim','aug']],['Séptimas',['dom7','maj7','m7','m7b5','dim7']],['Suspendidos y agregados',['sus2','sus4','sus7','add9','six','m6']],['Extendidos',['dom9','m9','maj9','dom11','dom13']],['Alterados',['b9','sharp9']]];
const CHORD_TYPES=CHORD_GROUPS.flatMap(g=>g[1]);
const chordPC=n=>((n%12)+12)%12;
const chordRoot=r=>typeof r==='object'?r:pcName(chordPC(+r),[1,3,8,10].includes(chordPC(+r)));
const chordLabel=(r,t)=>{const n=chordRoot(r);return `${n.es}${CT[t].suf} (${n.us}${CT[t].suf})`};
function parseChordName(value){
 const m=String(value).trim().replace(/♯/g,'#').replace(/♭/g,'b').match(/^(Do|Re|Mi|Fa|Sol|La|Si|[A-G])([#b]?)[\s]*(.*)$/i);if(!m)return null;
 const names=['do','re','mi','fa','sol','la','si'],i=names.indexOf(m[1].toLowerCase()),pc=chordPC((i<0?{c:0,d:2,e:4,f:5,g:7,a:9,b:11}[m[1].toLowerCase()]:NAT[i])+(m[2]==='#'?1:m[2]==='b'?-1:0));
 const aliases={'':'maj',mayor:'maj',major:'maj',maj:'maj',M:'maj',m:'min',menor:'min',min:'min','7':'dom7','9':'dom9','11':'dom11','13':'dom13','5':'power','6':'six','7sus4':'sus7','7b9':'b9','7#9':'sharp9','m7b5':'m7b5','ø':'m7b5','dim':'dim','°':'dim','+':'aug','aug':'aug','dim7':'dim7','°7':'dim7'};
 const s=m[3],t=aliases[s]||aliases[s.toLowerCase()]||CHORD_TYPES.find(k=>k===s||CT[k].suf.replace(/♭/g,'b').replace(/♯/g,'#')===s);
 return t?{root:pc,type:t}:null;
}
// Formas de referencia: verificadas por intervalos antes de entrar a la búsqueda.
const CHORD_OPEN={
 '0:maj':[null,3,2,0,1,0],'9:maj':[null,0,2,2,2,0],'7:maj':[3,2,0,0,0,3],'4:maj':[0,2,2,1,0,0],'2:maj':[null,null,0,2,3,2],
 '9:min':[null,0,2,2,1,0],'4:min':[0,2,2,0,0,0],'2:min':[null,null,0,2,3,1],
 '4:dom7':[0,2,0,1,0,0],'9:dom7':[null,0,2,0,2,0],'2:dom7':[null,null,0,2,1,2],'7:dom7':[3,2,0,0,0,1],'0:dom7':[null,3,2,3,1,0],'11:dom7':[null,2,1,2,0,2],
 // séptimas mayores/menores y suspendidos abiertos de uso común
 '0:maj7':[null,3,2,0,0,0],'9:maj7':[null,0,2,1,2,0],'2:maj7':[null,null,0,2,2,2],'4:maj7':[0,2,1,1,0,0],'5:maj7':[null,null,3,2,1,0],
 '9:m7':[null,0,2,0,1,0],'4:m7':[0,2,0,0,0,0],'2:m7':[null,null,0,2,1,1],
 '2:sus2':[null,null,0,2,3,0],'9:sus2':[null,0,2,2,0,0],'2:sus4':[null,null,0,2,3,3],'9:sus4':[null,0,2,2,3,0],'4:sus4':[0,2,2,2,0,0]
};
const CHORD_CACHE=new Map();
// La quinta justa es prescindible en dominantes (incluido el Do7 abierto estándar).
function chordRequired(t){return CT[t].semis.filter(s=>!((CT[t].semis.length>=5||t==='dom7')&&s===7)&&!(t==='dom13'&&s===5))}
function chordGrip(frets){
 const pressed=frets.map((f,j)=>({f,s:6-j})).filter(d=>d.f>0);if(!pressed.length)return {fg:{},barre:null,count:0};
 const lo=Math.min(...pressed.map(d=>d.f)),hi=Math.max(...pressed.map(d=>d.f));if(hi-lo>3)return null;
 const at=pressed.filter(d=>d.f===lo),ss=at.map(d=>d.s),a=Math.min(...ss),b=Math.max(...ss);
 const canBar=at.length>=2&&frets.every((f,j)=>6-j<a||6-j>b||f==null||f>=lo);
 const count=canBar?1+pressed.length-at.length:pressed.length;if(count>4)return null;
 const base=chordFing(frets);
 // chordFing handles full barres; also support a partial barre above open strings.
 if(canBar){const fg={};at.forEach(d=>fg[d.s]=1);pressed.filter(d=>d.f!==lo).sort((x,y)=>x.f-y.f||y.s-x.s).forEach((d,i)=>fg[d.s]=i+2);return{fg,barre:{f:lo,s1:a,s2:b},count}}
 return {...base,barre:null,count};
}
function chordValid(frets,r,t){
 if(frets.length!==6||frets.some(f=>f!=null&&(!Number.isInteger(f)||f<0||f>15)))return false;
 const pitches=frets.flatMap((f,j)=>f==null?[]:[chordPC(OPEN_PC[6-j]+f-r)]);
 return pitches.length>=2&&pitches.every(s=>CT[t].semis.includes(s))&&chordRequired(t).every(s=>pitches.includes(s))&&!!chordGrip(frets);
}
// Drop-2/drop-3: bajar una octava la segunda/tercera voz desde arriba de un acorde cerrado.
// Referencia conceptual: https://online.berklee.edu/takenote/voice-leading-for-guitar/
function chordDropName(midi,r,t){
 if(midi.length!==4||CT[t].semis.length!==4||new Set(midi.map(m=>m%12)).size!==4)return '';
 const actual=midi.slice().sort((a,b)=>a-b),signature=actual.map(m=>m-actual[0]).join(',');
 const sem=CT[t].semis.slice().sort((a,b)=>a-b);
 for(let inv=0;inv<4;inv++){
  const closed=sem.map((_,i)=>sem[(i+inv)%4]+(i+inv>=4?12:0));
  for(const drop of [2,3]){const ds=closed.slice();ds[4-drop]-=12;ds.sort((a,b)=>a-b);
   if(chordPC(actual[0]-r)===chordPC(ds[0])&&signature===ds.map(m=>m-ds[0]).join(','))return 'Jazz · drop-'+drop;
  }
 }
 return '';
}
function chordVoicings(root,type){
 const r=chordRoot(root).pc,t=CHORD_TYPES.includes(type)?type:'maj',key=r+':'+t;if(CHORD_CACHE.has(key))return CHORD_CACHE.get(key);
 const found=new Map(),required=chordRequired(t),jazz=CT[t].semis.length>=4;
 function add(frets,shape,rank=5){
  const k=frets.map(f=>f==null?'x':f).join(',');if(found.has(k)||!chordValid(frets,r,t))return;
  const grip=chordGrip(frets),midi=frets.flatMap((f,j)=>f==null?[]:[OPEN_MIDI[6-j]+f]),bass=chordPC(Math.min(...midi)-r),fr=frets.filter(f=>f>0),lo=fr.length?Math.min(...fr):0;
  const omitted=CT[t].semis.filter(s=>!midi.some(m=>chordPC(m-r)===s)).map(s=>CT[t].f[CT[t].semis.indexOf(s)]);
  const gap=frets.slice(frets.findIndex(f=>f!=null),frets.findLastIndex(f=>f!=null)+1).some(f=>f==null);
  if(gap&&!jazz)return;
  // una posición abierta «rara» no debe ganarle a la cejilla de siempre (Fa, Si menor): va después de las formas de Mi y La
  if(!shape&&frets.includes(0))rank=1.5;
  const inv=bass?`Inversión: bajo en ${CT[t].f[CT[t].semis.indexOf(bass)]} (${pcName(chordPC(r+bass),false).es})`:'Bajo en la raíz';
  found.set(k,{frets,grip,midi,lo,bass,omitted,gap,name:shape||(frets.includes(0)?'Posición abierta':chordDropName(midi,r,t)|| (grip.barre?`Cejilla en traste ${grip.barre.f}`:`Posición en traste ${lo}`)),inversion:inv,score:rank*100+(bass?45:0)+lo*2+grip.count*2+(gap?10:0)});
 }
 if(CHORD_OPEN[key])add(CHORD_OPEN[key],'Abierto · forma estándar',0);
 // CAGED se obtiene trasladando las cinco formas abiertas, incluidas sus cuerdas al aire.
 for(const [k,fs] of Object.entries(CHORD_OPEN)){
  const [base,ct]=k.split(':');if(ct!==t)continue;
  for(let shift=chordPC(r-Number(base));shift<=15;shift+=12){
   if(!shift)continue;const form={0:'Do',9:'La',7:'Sol',4:'Mi',2:'Re',11:'Si'}[base];
   add(fs.map(f=>f==null?null:f+shift),`Forma de ${form} (CAGED) · cejilla en traste ${shift}`,['4','9'].includes(base)?1:2);
  }
 }
 // Ventanas de cuatro trastes, con cuerdas al aire fuera de la ventana.
 for(let low=1;low<=15;low++){
  const opts=Array.from({length:6},(_,j)=>{const out=[null];for(let f=0;f<=15;f++)if((f===0||f>=low&&f<=low+3)&&CT[t].semis.includes(chordPC(OPEN_PC[6-j]+f-r)))out.push(f);return out});
  const walk=(j,fs,mask,n)=>{
   if(n+6-j<required.length)return;
   if(j===6){if(required.every(s=>mask&(1<<s)))add(fs);return}
   for(const f of opts[j])walk(j+1,fs.concat(f),f==null?mask:mask|(1<<chordPC(OPEN_PC[6-j]+f-r)),n+(f!=null));
  };walk(0,[],0,0);
 }
 const sorted=[...found.values()].sort((a,b)=>a.score-b.score||a.midi.length-b.midi.length),selected=[];
 const take=v=>{if(v&&!selected.includes(v))selected.push(v)};
 sorted.slice(0,2).forEach(take);
 // Reservar las dos familias de cejilla aunque existan muchas posiciones abiertas.
 for(const form of ['Mi','La'])take(sorted.find(v=>v.name.startsWith('Forma de '+form+' (CAGED)')));
 // Mostrar registros distintos, no ocho variantes casi iguales en el mismo traste.
 for(const [a,b] of [[4,7],[8,11],[12,15]])take(sorted.find(v=>v.lo>=a&&v.lo<=b&&!selected.includes(v)));
 take(sorted.find(v=>v.bass&&!selected.includes(v)));for(const v of sorted){if(selected.length>=8)break;take(v)}
 selected.sort((a,b)=>a.score-b.score);CHORD_CACHE.set(key,selected);return selected;
}
const CHORD_MODES={major:{label:'mayor',steps:[0,2,4,5,7,9,11],types:['maj','min','min','maj','maj','min','dim'],degrees:['I','ii','iii','IV','V','vi','vii°']},minor:{label:'menor',steps:[0,2,3,5,7,8,10],types:['min','dim','maj','min','min','maj','maj'],degrees:['i','ii°','♭III','iv','v','♭VI','♭VII']}};
function chordFunctions(root,t){
 const r=chordRoot(root).pc,out=[];
 for(let k=0;k<12;k++)for(const [mode,m] of Object.entries(CHORD_MODES)){
  const d=m.steps.indexOf(chordPC(r-k)),scale=m.steps.map(s=>chordPC(k+s));
  if(d>=0&&CT[t].semis.every(s=>scale.includes(chordPC(r+s))))out.push({key:k,mode,degree:m.degrees[d],kind:'diatónico',text:`${m.degrees[d]} · ${['reposo','prepara la dominante','enlace','subdominante','dominante','enlace','tensión'][d]}`});
  if(mode==='minor'&&chordPC(r-k)===7&&['maj','dom7','b9'].includes(t))out.push({key:k,mode,degree:'V',kind:'menor armónica',text:'V · dominante de la menor armónica'});
  if(mode==='major'&&((chordPC(r-k)===5&&t==='min')||(chordPC(r-k)===10&&t==='maj')))out.push({key:k,mode,degree:t==='min'?'iv':'♭VII',kind:'préstamo modal',text:`${t==='min'?'iv':'♭VII'} · préstamo de la menor paralela`});
  if(['maj','dom7','dom9','dom13','b9','sharp9'].includes(t))m.steps.forEach((s,i)=>{if(i&&m.types[i]!=='dim'&&r===chordPC(k+s+7))out.push({key:k,mode,degree:'V/'+m.degrees[i],kind:'dominante secundaria',text:`V/${m.degrees[i]} · conduce a ${pcName(chordPC(k+s),false).es}`})});
 }
 if(['dom7','dom9','dom13'].includes(t))out.push({key:chordPC(r-1),mode:'major',degree:'subV/I',kind:'sustituto tritonal',text:'subV/I · comparte tercera y séptima con V7; resuelve un semitono abajo'});
 return out;
}
const CHORD_PATTERNS=[
 ['Pop · I–V–vi–IV',[[0,'maj'],[7,'maj'],[9,'min'],[5,'maj']],'pop'],
 ['Jazz · ii–V–I',[[2,'m7'],[7,'dom7'],[0,'maj7'],[0,'maj7']],'iivi'],
 ['Blues · 12 compases',[[0,'dom7'],[0,'dom7'],[0,'dom7'],[0,'dom7'],[5,'dom7'],[5,'dom7'],[0,'dom7'],[0,'dom7'],[7,'dom7'],[5,'dom7'],[0,'dom7'],[7,'dom7']],'blues'],
 ['Andaluza · i–♭VII–♭VI–V',[[0,'min'],[10,'maj'],[8,'maj'],[7,'maj']],'andaluza'],
 ['Doo-wop · I–vi–IV–V',[[0,'maj'],[9,'min'],[5,'maj'],[7,'maj']]],
 ['Balada · vi–IV–I–V',[[9,'min'],[5,'maj'],[0,'maj'],[7,'maj']]],
 ['Ranchera · I–IV–V–I',[[0,'maj'],[5,'maj'],[7,'maj'],[0,'maj']]],
 ['Círculo · vi–ii–V–I',[[9,'m7'],[2,'m7'],[7,'dom7'],[0,'maj7']]]
];
function chordProgressions(root,t){
 const r=chordRoot(root).pc,sem=CT[t].semis,minor=sem.includes(3)&&!sem.includes(4),out=[];
 for(const [name,pattern,track] of CHORD_PATTERNS){
  let i=pattern.findIndex(c=>c[1]===t),adapted=i<0;
  if(i<0)i=pattern.findIndex(c=>minor?['min','m7'].includes(c[1]):sem.includes(10)?c[1]==='dom7':['maj','maj7'].includes(c[1]));
  if(i<0)i=0;
  const key=chordPC(r-pattern[i][0]),list=pattern.map(([s,ct])=>[chordPC(key+s),ct]);
  list[i]=[r,t];
  // Un acorde alterado/disminuido se presenta como sustitución a escuchar, no como diatónico.
  out.push({name,key,list,adapted,track:!adapted?track:null,note:adapted?'Adaptación: cambia un acorde por el elegido. Escucha su tensión y resuélvela al siguiente.':'Forma habitual transpuesta; incluye exactamente tu acorde.'});
 }
 return out;
}
function chordDiagram(v,r){
 const fr=v.frets.filter(f=>f>0),from=v.frets.includes(0)?0:Math.max(1,Math.min(...fr)),to=Math.max(from+3,...fr,3);
 return fretboard({from,to,w:39,barre:v.grip.barre,muted:v.frets.flatMap((f,j)=>f==null?[6-j]:[]),dots:v.frets.flatMap((f,j)=>f==null?[]:[{s:6-j,f,t:pcName(chordPC(OPEN_PC[6-j]+f),false).es,fg:v.grip.fg[6-j],k:chordPC(OPEN_PC[6-j]+f)===r?'root':'note'}]),label:'Digitación de acorde; cuerdas 6 a 1: '+v.frets.map(f=>f==null?'apagada':f).join(', ')});
}
function chordKeyHTML(k,mode){
 const m=CHORD_MODES[mode],rows=m.steps.map((s,i)=>({r:chordPC(k+s),t:m.types[i],g:m.degrees[i]}));
 const extra=mode==='major'?[{r:chordPC(k+5),t:'min',g:'iv · préstamo'},{r:chordPC(k+10),t:'maj',g:'♭VII · préstamo'}]:[{r:chordPC(k+7),t:'dom7',g:'V7 · menor armónica'},{r:chordPC(k+5),t:'maj',g:'IV · color dórico'}];
 return `<div class="chord-grid">${rows.concat(extra).map(c=>{const v=chordVoicings(c.r,c.t)[0];return `<article class="card chord-mini"><h3>${c.g} · ${chordLabel(c.r,c.t)}</h3>${v?chordDiagram(v,c.r):''}<div class="row"><button class="btn sm" data-keyhear="${c.r}:${c.t}">Escuchar</button><a class="btn sm" href="#/acordes/${c.r}/${c.t}">Posiciones</a></div></article>`}).join('')}</div>`;
}
function viewChordDictionary(rawRoot,rawType){
 if(INST.id==='bajo')return bassArpeggios(rawRoot,rawType);
 try{rawRoot=decodeURIComponent(rawRoot||'');rawType=decodeURIComponent(rawType||'')}catch(e){rawRoot='0';rawType='maj'}
 let r=Number(rawRoot),t=rawType||'maj';if(!Number.isInteger(r)||r<0||r>11){const parsed=rawRoot&&parseChordName(rawRoot);r=parsed?parsed.root:0}if(!CHORD_TYPES.includes(t)){const p=parseChordName('C'+t);t=p?p.type:'maj'}
 const vs=chordVoicings(r,t),ps=chordProgressions(r,t),functions=chordFunctions(r,t),root=chordRoot(r);
 return {title:'Acordes',back:'#/referencia',html:`<div class="lhead"><span class="eyebrow">Diccionario · 276 acordes · trastes 0–15</span><h1>Acordes</h1><p class="sub">Encuentra sus notas, posiciones y maneras de conectarlos.</p></div>
 <form class="card chord-search" id="chord-search"><label for="chord-query">Busca por nombre</label><div class="row"><input id="chord-query" placeholder="Fa#m7, Bb, Sol7" autocomplete="off" maxlength="32"><button class="btn pri" type="submit">Buscar</button></div><span id="chord-error" role="status"></span></form>
 <div class="hscroll chord-roots" aria-label="Raíz">${Array.from({length:12},(_,i)=>`<a class="chip" aria-current="${r===i?'true':'false'}" href="#/acordes/${i}/${t}">${chordRoot(i).es}</a>`).join('')}</div>
 <div class="card chord-types">${CHORD_GROUPS.map(([n,ts])=>`<div><p class="cl">${n}</p><div class="chips">${ts.map(ct=>`<a class="chip" aria-current="${t===ct?'true':'false'}" href="#/acordes/${r}/${ct}">${CT[ct].label}</a>`).join('')}</div></div>`).join('')}</div>
 <section class="card"><h2>${chordLabel(r,t)}</h2><p>${CT[t].ch}</p><p><b>Fórmula:</b> ${CT[t].f.join(' – ')}<br><b>Notas:</b> ${chordNotes(root,t).map(n=>n.es).join(' · ')}</p><p class="cap">La raíz se resalta. Dedos 1–4; × significa cuerda apagada. CAGED nombra las formas movibles de Do, La, Sol, Mi y Re. Cada posición indica su bajo y las notas omitidas.</p></section>
 <section><div class="sech"><h2>${vs.length} posiciones</h2></div><div class="chord-grid">${vs.map((v,i)=>`<article class="card chord-mini"><h3>${v.name}</h3><p class="cap">${v.inversion}${v.gap?' · jazz: apaga las cuerdas intermedias':''}${v.omitted.length?' · omite '+v.omitted.join(', '):''}</p>${chordDiagram(v,r)}<p class="cap">6 → 1: ${v.frets.map(f=>f==null?'×':f).join(' · ')}</p><div class="row"><button class="btn sm" data-voice="${i}" data-mode="chord">Rasguear</button><button class="btn sm" data-voice="${i}" data-mode="seq">Arpegiar</button></div></article>`).join('')}</div></section>
 <section class="card"><h2>Dónde va este acorde</h2><p class="cap">Una función depende del contexto. Los colores extendidos solo aparecen como diatónicos si todas sus notas pertenecen a la escala.</p>${functions.length?`<ul class="chord-functions">${functions.map(f=>`<li><b>${chordRoot(f.key).es} ${CHORD_MODES[f.mode].label}</b>: ${f.text} <small>(${f.kind})</small></li>`).join('')}</ul>`:'<p>Este color necesita contexto cromático; prueba una adaptación y escucha cómo resuelve. No se etiqueta como diatónico.</p>'}</section>
 <section><h2>Progresiones donde lo puedes usar</h2><p class="cap">Esquemas armónicos sin letras ni grabaciones. Las adaptaciones se indican; pueden crear tensión deliberada.</p><div class="chord-grid">${ps.map((p,i)=>`<article class="card"><h3>${p.name}</h3><p class="cap">Centro: ${chordRoot(p.key).es} · ${p.note}</p><p>${p.list.map(([n,ct])=>chordRoot(n).es+CT[ct].suf).join(' → ')}</p><div class="row"><button class="btn sm" data-proghear="${i}">Escuchar</button>${p.track?`<button class="btn sm" data-progtrack="${i}">Tocar con pista</button>`:''}</div></article>`).join('')}</div></section>
 <section class="card"><h2>Explora una tonalidad</h2><div class="row"><label>Tónica <select id="chord-key">${Array.from({length:12},(_,k)=>`<option value="${k}" ${k===r?'selected':''}>${chordRoot(k).es}</option>`).join('')}</select></label><label>Modo <select id="chord-mode"><option value="major">Mayor</option><option value="minor">Menor</option></select></label></div><p class="cap">Siete grados y dos colores habituales. Escucha o abre sus posiciones.</p><div id="chord-key-result">${chordKeyHTML(r,'major')}</div></section>`,
 mount(host){
  $('#chord-search',host).onsubmit=e=>{e.preventDefault();const p=parseChordName($('#chord-query',host).value);if(p){$('#chord-error',host).textContent='';location.hash=`#/acordes/${p.root}/${p.type}`}else $('#chord-error',host).textContent='No reconozco ese nombre. Prueba Do, Fa#m7 o Sib7.'};
  const keyChange=()=>{$('#chord-key-result',host).innerHTML=chordKeyHTML(+$('#chord-key',host).value,$('#chord-mode',host).value)};
  $('#chord-key',host).onchange=keyChange;$('#chord-mode',host).onchange=keyChange;
  host.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
   if(b.dataset.voice!=null)playNotes(vs[+b.dataset.voice].midi,b.dataset.mode,.35);
   if(b.dataset.keyhear){const [k,ct]=b.dataset.keyhear.split(':');playNotes(chordVoicings(+k,ct)[0].midi,'chord')}
   if(b.dataset.proghear!=null)playSeq(ps[+b.dataset.proghear].list.map(([k,ct])=>chordVoicings(k,ct)[0].midi),.85);
   if(b.dataset.progtrack!=null){const p=ps[+b.dataset.progtrack];Object.assign(TRK,{p:p.track,k:KEYS.findIndex(k=>k.pc===p.key),st:'balada',bpm:72});location.hash='#/practicar/pistas'}
  });
 }};
}
