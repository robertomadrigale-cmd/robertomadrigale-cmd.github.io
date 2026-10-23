'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* ---------- notas ---------- */
const PCS=[['Do','C'],['Do♯','C♯'],['Re','D'],['Re♯','D♯'],['Mi','E'],['Fa','F'],['Fa♯','F♯'],['Sol','G'],['Sol♯','G♯'],['La','A'],['La♯','A♯'],['Si','B']];
const NATPC=[0,2,4,5,7,9,11];
const m2f=m=>440*Math.pow(2,(m-69)/12);
const f2m=f=>69+12*Math.log2(f/440);
const pcOf=m=>((Math.round(m)%12)+12)%12;
const octOf=m=>Math.floor(Math.round(m)/12)-1;
// «Sol3» con la octava chiquita; latin = «G3»
const nn=m=>PCS[pcOf(m)][0];
const nnHTML=m=>`${PCS[pcOf(m)][0]}<small>${octOf(m)}</small>`;
const nnTxt=m=>PCS[pcOf(m)][0]+octOf(m);
const nnUS=m=>PCS[pcOf(m)][1]+octOf(m);
const NOTEIDX={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
// «G4», «F#3», «Bb2» → número MIDI
function parseNote(s){const m=String(s).match(/^([A-G])([#b♯♭]?)(-?\d)$/);if(!m)return null;return NOTEIDX[m[1]]+(m[2]==='#'||m[2]==='♯'?1:m[2]==='b'||m[2]==='♭'?-1:0)+(+m[3]+1)*12}
/* ---------- tipos de voz (rangos típicos de coro; cada persona es distinta) ---------- */
const VOICES=[
 {k:'bajo',n:'Bajo',lo:40,hi:64,d:'La voz más grave. Mi2 a Mi4.'},
 {k:'bar',n:'Barítono',lo:45,hi:69,d:'La voz masculina más común. La2 a La4.'},
 {k:'ten',n:'Tenor',lo:48,hi:72,d:'Voz masculina aguda. Do3 a Do5.'},
 {k:'con',n:'Contralto',lo:53,hi:77,d:'La voz femenina más grave. Fa3 a Fa5.'},
 {k:'mez',n:'Mezzosoprano',lo:57,hi:81,d:'Voz femenina media. La3 a La5.'},
 {k:'sop',n:'Soprano',lo:60,hi:84,d:'Voz femenina aguda. Do4 a Do6.'}];
function voiceGuess(lo,hi){
  let best=null,bs=-1;
  VOICES.forEach(v=>{const ov=Math.max(0,Math.min(hi,v.hi)-Math.max(lo,v.lo)),cover=ov/(v.hi-v.lo),miss=Math.abs((lo+hi)/2-(v.lo+v.hi)/2)/24,s=cover-miss;if(s>bs){bs=s;best=v}});
  return best;
}
/* ---------- datos locales ---------- */
const DBK='roka-couch-vocal:v1';
let DB={done:{},secs:{},days:{},best:{},last:{},today:{},range:null,vt:null,breath:0,tol:50,mode:'eco',theme:'auto'};
try{Object.assign(DB,JSON.parse(localStorage.getItem(DBK)||'{}'))}catch(e){}
function save(){try{localStorage.setItem(DBK,JSON.stringify(DB))}catch(e){}}
const today=(d)=>{d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
function markDay(){DB.days[today()]=true;save()}
function streak(){let n=0;const d=new Date();if(!DB.days[today(d)])d.setDate(d.getDate()-1);while(DB.days[today(d)]){n++;d.setDate(d.getDate()-1)}return n}
function weekMins(){let s=0;const d=new Date();for(let i=0;i<7;i++){s+=DB.secs[today(d)]||0;d.setDate(d.getDate()-1)}return Math.round(s/60)}
// zona cómoda para los ejercicios: tu rango medido (sin los extremos) o una voz grave/aguda de referencia
function comfy(){
  if(DB.range)return{lo:DB.range.lo+2,hi:DB.range.hi-2,measured:true};
  return DB.vt==='aguda'?{lo:57,hi:74,measured:false}:{lo:45,hi:62,measured:false};
}
const fmt=s=>{s=Math.max(0,Math.round(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
function toast(html,ms){
  let t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';t.setAttribute('role','status');document.body.appendChild(t)}
  t.innerHTML=html;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),ms||3200);
}
/* ---------- temas ---------- */
// orden de c: bg surface surface2 fg muted line accent accent-ink accent-text root root-ink good bad blue
const THEMES=[
 ['estudio','Estudio','Negro y azul eléctrico',1,'#000000 #111114 #1b1b20 #f4f4f7 #8b8b95 #26262c #2f7bff #ffffff #5b9cff #ff4fa3 #fff #34d399 #ff453a #2f7bff','radial-gradient(ellipse at 85% -15%,rgba(47,123,255,.14),transparent 55%),radial-gradient(ellipse at 0% 0%,rgba(255,79,163,.07),transparent 45%)'],
 ['escenario','Escenario','Negro con luz rosa',1,'#060407 #141016 #1e1820 #f7f2f6 #9a8f99 #2c242c #ff4fa3 #1a0010 #ff7dbd #2f7bff #fff #34d399 #ff453a #5b9cff','radial-gradient(ellipse at 15% -15%,rgba(255,79,163,.16),transparent 55%),radial-gradient(ellipse at 100% 0%,rgba(47,123,255,.08),transparent 45%)'],
 ['claro','Aluminio','Claro y limpio',0,'#f5f5f7 #ffffff #ebebf0 #1d1d1f #6e6e73 #d9d9de #2f6bff #ffffff #1f55d6 #d6247a #fff #248a3d #d70015 #0071e3','none']];
const TVARS='bg surface surface2 fg muted line accent accent-ink accent-text root root-ink good bad blue'.split(' ');
const themeById=id=>THEMES.find(t=>t[0]===id);
document.head.insertAdjacentHTML('beforeend','<style>'+THEMES.map(([id,,,dark,c,art])=>{const v=c.split(' ');
  return`:root[data-theme="${id}"]{${TVARS.map((k,i)=>`--${k}:${v[i]}`).join(';')};--art:${art};--artimg:none;--arto:0;--glass:color-mix(in srgb,${v[0]} 80%,transparent);color-scheme:${dark?'dark':'light'}}`}).join('')+'</style>');
function applyTheme(){
  const id=DB.theme!=='auto'&&themeById(DB.theme)?DB.theme:matchMedia('(prefers-color-scheme: light)').matches?'claro':'estudio';
  document.documentElement.setAttribute('data-theme',id);
  $$('meta[name="theme-color"]').forEach(m=>{m.removeAttribute('media');m.content=themeById(id)[4].split(' ')[0]});
}
matchMedia('(prefers-color-scheme: light)').addEventListener('change',()=>{if(DB.theme==='auto')applyTheme()});
applyTheme();
