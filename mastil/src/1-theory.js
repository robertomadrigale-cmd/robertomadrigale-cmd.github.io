'use strict';
const PRINT=false;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const num=v=>/^-?\d+$/.test(v)?+v:v;
/* ---------- teoría ---------- */
const OPEN_PC={1:4,2:11,3:7,4:2,5:9,6:4};
const OPEN_MIDI={1:64,2:59,3:55,4:50,5:45,6:40};
const NAT=[0,2,4,5,7,9,11],ES=['Do','Re','Mi','Fa','Sol','La','Si'],US=['C','D','E','F','G','A','B'];
const MAJ=[0,2,4,5,7,9,11];
const acc=a=>a===1?'♯':a===-1?'♭':'';
const PCS=[['Do','C'],['Do♯','D♭'],['Re','D'],['Re♯','E♭'],['Mi','E'],['Fa','F'],['Fa♯','G♭'],['Sol','G'],['Sol♯','A♭'],['La','A'],['La♯','B♭'],['Si','B']];
const KEYS=[['C',0,0],['G',4,0],['D',1,0],['A',5,0],['E',2,0],['B',6,0],['F',3,1],['D',1,-1],['A',5,-1],['E',2,-1],['B',6,-1],['F',3,0]].map(([u,l,a])=>({l,a,pc:(NAT[l]+a+12)%12,us:US[l]+acc(a),es:ES[l]+acc(a)}));
const FLATN=['C','D♭','D','E♭','E','F','G♭','G','A♭','A','B♭','B'],SHARPN=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
function pcName(pc,flat){const u=(flat?FLATN:SHARPN)[pc];const l=US.indexOf(u[0]);return{pc,l,a:u[1]==='♯'?1:u[1]==='♭'?-1:0,us:u,es:ES[l]+u.slice(1)}}
function spell(root,semi,step){
  const pc=(root.pc+semi)%12,l=(root.l+step)%7;
  const a=((pc-NAT[l]+18)%12)-6;
  if(a<-1||a>1)return pcName(pc,root.a<0||root.us==='F');
  return{pc,l,a,us:US[l]+acc(a),es:ES[l]+acc(a)};
}
const MODES=[
 {n:'Jónico',alt:'la escala mayor',ch:'Luminoso y estable. Es la escala mayor.'},
 {n:'Dórico',alt:'menor con 6ª mayor',ch:'Menor con sexta mayor: sobrio y cálido (jazz, funk, rock).'},
 {n:'Frigio',alt:'menor con 2ª bemol',ch:'Menor con segunda bemol: oscuro, de aire flamenco.'},
 {n:'Lidio',alt:'mayor con 4ª aumentada',ch:'Mayor con cuarta aumentada: flotante y brillante.'},
 {n:'Mixolidio',alt:'mayor con 7ª menor',ch:'Mayor con séptima menor: sonido de rock y blues.'},
 {n:'Eólico',alt:'menor natural',ch:'El menor clásico: melancólico.'},
 {n:'Locrio',alt:'menor con ♭2 y ♭5',ch:'Inestable; casi nunca funciona como centro tonal.'}];
const modeSemis=i=>MAJ.map((_,k)=>(MAJ[(i+k)%7]-MAJ[i]+12)%12);
const CT={
 maj:{label:'Mayor',semis:[0,4,7],steps:[0,2,4],f:['1','3','5'],suf:'',ch:'Estable y brillante: el sonido de casa.'},
 min:{label:'Menor',semis:[0,3,7],steps:[0,2,4],f:['1','♭3','5'],suf:'m',ch:'Más sombrío e íntimo.'},
 dim:{label:'Disminuido',semis:[0,3,6],steps:[0,2,4],f:['1','♭3','♭5'],suf:'°',ch:'Tenso y compacto; pide moverse.'},
 aug:{label:'Aumentado',semis:[0,4,8],steps:[0,2,4],f:['1','3','♯5'],suf:'+',ch:'Suspendido y ambiguo, de ensueño.'},
 maj7:{label:'maj7',semis:[0,4,7,11],steps:[0,2,4,6],f:['1','3','5','7'],suf:'maj7',ch:'Suave, elegante y algo nostálgico.'},
 dom7:{label:'7 (dominante)',semis:[0,4,7,10],steps:[0,2,4,6],f:['1','3','5','♭7'],suf:'7',ch:'Mayor con séptima menor: tensión que pide resolver.'},
 m7:{label:'m7',semis:[0,3,7,10],steps:[0,2,4,6],f:['1','♭3','5','♭7'],suf:'m7',ch:'Cálido y relajado; base del jazz y del soul.'},
 m7b5:{label:'m7♭5',semis:[0,3,6,10],steps:[0,2,4,6],f:['1','♭3','♭5','♭7'],suf:'m7♭5',ch:'Inestable y dramático; vive en el grado vii.'},
 sus2:{label:'sus2',semis:[0,2,7],steps:[0,1,4],f:['1','2','5'],suf:'sus2',ch:'Abierto, sin tercera: ni mayor ni menor.'},
 sus4:{label:'sus4',semis:[0,5,7],steps:[0,3,4],f:['1','4','5'],suf:'sus4',ch:'Suspendido: pide bajar a la tercera.'},
 add9:{label:'add9',semis:[0,4,7,2],steps:[0,2,4,1],f:['1','3','5','9'],suf:'add9',ch:'Mayor con brillo añadido, sin séptima.'},
 dom9:{label:'9',semis:[0,4,7,10,2],steps:[0,2,4,6,1],f:['1','3','5','♭7','9'],suf:'9',ch:'Dominante con color: más rico y bluesero.'}};
// Tipos adicionales del diccionario; las definiciones anteriores se conservan.
Object.assign(CT,{
 dim7:{label:'dim7',semis:[0,3,6,9],steps:[0,2,4,6],f:['1','♭3','♭5','♭♭7'],suf:'dim7',ch:'Séptima disminuida: tensión simétrica que resuelve por semitono.'},
 sus7:{label:'7sus4',semis:[0,5,7,10],steps:[0,3,4,6],f:['1','4','5','♭7'],suf:'7sus4',ch:'Dominante suspendido: la cuarta sustituye a la tercera.'},
 six:{label:'6',semis:[0,4,7,9],steps:[0,2,4,5],f:['1','3','5','6'],suf:'6',ch:'Mayor con sexta: reposo cálido, sin séptima.'},
 m6:{label:'m6',semis:[0,3,7,9],steps:[0,2,4,5],f:['1','♭3','5','6'],suf:'m6',ch:'Menor con sexta mayor: color de jazz y cierre en menor.'},
 m9:{label:'m9',semis:[0,3,7,10,2],steps:[0,2,4,6,1],f:['1','♭3','5','♭7','9'],suf:'m9',ch:'Menor con séptima y novena: un color amplio.'},
 maj9:{label:'maj9',semis:[0,4,7,11,2],steps:[0,2,4,6,1],f:['1','3','5','7','9'],suf:'maj9',ch:'Mayor con séptima mayor y novena: reposo luminoso.'},
 dom11:{label:'11',semis:[0,4,7,10,2,5],steps:[0,2,4,6,1,3],f:['1','3','5','♭7','9','11'],suf:'11',ch:'Dominante con oncena: la tercera y la oncena crean un roce intencional.'},
 dom13:{label:'13',semis:[0,4,7,10,2,5,9],steps:[0,2,4,6,1,3,5],f:['1','3','5','♭7','9','11','13'],suf:'13',ch:'Dominante con trecena. En guitarra se pueden omitir quinta y oncena.'},
 power:{label:'5 (quinta)',semis:[0,7],steps:[0,4],f:['1','5'],suf:'5',ch:'Raíz y quinta: no tiene tercera, así que no es mayor ni menor.'},
 b9:{label:'7♭9',semis:[0,4,7,10,1],steps:[0,2,4,6,1],f:['1','3','5','♭7','♭9'],suf:'7♭9',ch:'Dominante con novena menor: tensión intensa, común hacia un acorde menor.'},
 sharp9:{label:'7♯9',semis:[0,4,7,10,3],steps:[0,2,4,6,1],f:['1','3','5','♭7','♯9'],suf:'7♯9',ch:'Dominante con novena aumentada: conserva la tercera mayor y añade tensión.'}
});
const chordNotes=(root,t)=>CT[t].semis.map((s,i)=>spell(root,s,CT[t].steps[i]));
const scaleNotes=(root,semis)=>semis.map((s,i)=>spell(root,s,i));
const pos=(pcs,from,to)=>{const r=[];for(let s=1;s<=6;s++)for(let f=from;f<=to;f++)if(pcs.includes((OPEN_PC[s]+f)%12))r.push([s,f]);return r};
const ACC_N=[0,1,2,3,4,5,6,-5,-4,-3,-2,-1];
const SHARPS=['Fa♯','Do♯','Sol♯','Re♯','La♯','Mi♯'],FLATS=['Si♭','Mi♭','La♭','Re♭','Sol♭','Do♭'];
/* ---------- mástil (SVG) ---------- */
let LEFTY=false;
/* dedos: un dedo por traste dentro de la posición (índice en el traste más bajo). Si el patrón abarca más de 5 trastes
   hay que mover la mano y no se ponen números. Las cuerdas al aire no llevan dedo. */
function autoFingers(dots){
  const fr=dots.filter(x=>x.f>0).map(x=>x.f);if(!fr.length)return dots;const lo=Math.min(...fr),hi=Math.max(...fr);if(hi-lo>4)return dots;
  dots.forEach(x=>{if(x.fg==null&&x.f>0)x.fg=Math.min(4,x.f-lo+1)});return dots;
}
/* acorde: frets[0] = cuerda 6 … frets[5] = cuerda 1 (null = no suena).
   Cejilla cuando ninguna cuerda que suena va al aire, hay 4+ notas pisadas y el traste más bajo se repite: el dedo 1 las pisa todas.
   Los demás dedos van por traste (del más bajo al más alto) y, en el mismo traste, de la cuerda grave a la aguda. */
function chordFing(frets){
  const fr=frets.map((f,j)=>({f,s:6-j})).filter(x=>x.f!=null&&x.f>0),fg={};if(!fr.length)return{fg,barre:null};
  const lo=Math.min(...fr.map(x=>x.f)),atLo=fr.filter(x=>x.f===lo),open=frets.some(f=>f===0);let barre=null;
  if(!open&&fr.length>=4&&atLo.length>=2){const ss=atLo.map(x=>x.s);barre={f:lo,s1:Math.min(...ss),s2:Math.max(...ss)};atLo.forEach(x=>fg[x.s]=1)}
  // un dedo por traste a partir del más bajo; si dos notas caen en el mismo traste, la siguiente toma el dedo de al lado
  const rest=fr.filter(x=>fg[x.s]==null).sort((a,b)=>a.f-b.f||b.s-a.s);let last=barre?1:0,over=false;
  rest.forEach(x=>{const v=Math.max(last+1,x.f-lo+1);if(v>4)over=true;fg[x.s]=v;last=v});
  // si no alcanzan los cuatro dedos con «uno por traste», se asignan en orden (formas altas como la de Re o la de Sol)
  if(over){let n=barre?2:1;rest.forEach(x=>{fg[x.s]=Math.min(4,n++)})}
  return{fg,barre};
}
function fretboard(o){
  const from=o.from||0,to=o.to==null?12:o.to,W=o.w||42,H=25,top=20,left=32,lane=from===0?24:0;
  const start=from===0?1:from,cols=to-start+1,x0=left+lane,wood=cols*W,totalW=x0+wood+10,bottom=top+5*H,totalH=bottom+36;
  const X=x=>LEFTY?totalW-x:x,R=(x,w)=>LEFTY?totalW-x-w:x;
  const y=s=>top+(s-1)*H,cx=f=>X(f===0?x0-lane/2-1:x0+(f-start+.5)*W);
  let g=`<rect class="wood" x="${R(x0,wood)}" y="${top-10}" width="${wood}" height="${5*H+20}" rx="4"/>`;
  (o.zones||[]).forEach(z=>{const a=Math.max(z[0],start),b=Math.min(z[1],to);if(b>=a)g+=`<rect class="zone" x="${R(x0+(a-start)*W,(b-a+1)*W)}" y="${top-10}" width="${(b-a+1)*W}" height="${5*H+20}"/>`});
  for(let f=start;f<=to;f++){
    const m=f%12;
    if([3,5,7,9].includes(m))g+=`<circle class="inlay" cx="${cx(f)}" cy="${top+2.5*H}" r="5"/>`;
    if(m===0)g+=`<circle class="inlay" cx="${cx(f)}" cy="${top+1.5*H}" r="5"/><circle class="inlay" cx="${cx(f)}" cy="${top+3.5*H}" r="5"/>`;
  }
  for(let i=0;i<=cols;i++){const x=X(x0+i*W);g+=`<line class="${i===0&&from===0?'nut':'fret'}" x1="${x}" y1="${top-10}" x2="${x}" y2="${bottom+10}"/>`}
  for(let s=1;s<=6;s++){g+=`<line class="str" x1="${X(x0)}" x2="${X(x0+wood)}" y1="${y(s)}" y2="${y(s)}" stroke-width="${(.8+(s-1)*.45).toFixed(2)}"/><text class="slab" x="${X(14)}" y="${y(s)}">${'eBGDAE'[s-1]}</text>`}
  for(let f=start;f<=to;f++)g+=`<text class="num" x="${cx(f)}" y="${bottom+30}">${f}</text>`;
  if(from===0)(o.muted||[]).forEach(s=>{g+=`<text class="mute" x="${cx(0)}" y="${y(s)}">×</text>`});
  // cejilla: una barra sobre las cuerdas que pisa el dedo 1, con su nombre arriba
  (o.barre?[].concat(o.barre):[]).forEach(b=>{if(!b||b.f<start||b.f>to)return;const x=cx(b.f),y1=y(Math.min(b.s1,b.s2)),y2=y(Math.max(b.s1,b.s2));
    g+=`<rect class="barre" x="${x-11}" y="${y1-12}" width="22" height="${y2-y1+24}" rx="11"/><text class="barret" x="${x}" y="${top-13}">cejilla</text>`});
  (o.dots||[]).forEach(d=>{
    if(d.f<from||(d.f===0&&from>0)||d.f>to)return;
    const t=d.t==null?'':String(d.t),k=d.k||'note';
    // el número de dedo va en una insignia en la esquina del punto
    const fgb=d.fg&&d.f>0?`<circle class="fgb" cx="${cx(d.f)+10}" cy="${y(d.s)-9}" r="7"/><text class="fgt" x="${cx(d.f)+10}" y="${y(d.s)-9}">${d.fg}</text>`:'';
    g+=`<g class="dg" data-s="${d.s}" data-f="${d.f}"><circle class="dot ${k}" cx="${cx(d.f)}" cy="${y(d.s)}" r="10"/>${t?`<text class="dtxt${t.length>2?' sm':''}${k==='root'?' r':''}${k==='dim'?' dm':''}" x="${cx(d.f)}" y="${y(d.s)}">${esc(t)}</text>`:''}${fgb}</g>`;
  });
  if(o.tap)for(let s=1;s<=6;s++)for(let f=from;f<=to;f++){
    if(f===0&&from>0)continue;
    const x=f===0?left:x0+(f-start)*W,w=f===0?lane:W;
    g+=`<rect class="cell" data-s="${s}" data-f="${f}" x="${R(x,w)}" y="${y(s)-H/2}" width="${w}" height="${H}"/>`;
  }
  const fgLegend=(o.dots||[]).some(x=>x.fg&&x.f>0)?`<p class="fglegend">Dedos: <b>1</b> índice · <b>2</b> medio · <b>3</b> anular · <b>4</b> meñique${o.barre?' · la barra es <b>cejilla</b> con el dedo 1':''}</p>`:'';
  const hint=totalW*.78>360?`<p class="hint">Desliza para ver todo el mástil ${LEFTY?'←':'→'}</p>`:'';
  return`${hint}<div class="fbwrap"${LEFTY?' dir="rtl"':''}><svg class="fb" viewBox="0 0 ${totalW} ${totalH}" style="min-width:${Math.round(totalW*.78)}px;max-width:${Math.round(totalW*1.7)}px" role="img" aria-label="${esc(o.label||'Diagrama del mástil de guitarra')}">${g}</svg></div>${fgLegend}`;
}
