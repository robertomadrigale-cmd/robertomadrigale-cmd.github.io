/* ---------- Roka Batería: utilidades, datos del usuario, racha y temas ---------- */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const DBK='roka-bateria:v1',OLDK='pulso-a-la-vista:v1';
// done = ejercicios de lección hechos · stars/best = calificaciones por groove · hist = prácticas calificadas · ses = pruebas del medidor
let DB={done:{},secs:{},days:{},bpm:{},gbpm:{},stars:{},best:{},hist:[],ses:[],songs:[],seen:{},spd:{},sess:null,played:0,
  theme:'estudio',met:80,meter:'4/4',sub:1,sens:2,lat:null,clickLvl:0,tapLat:0,input:'tap',click:true};
try{Object.assign(DB,JSON.parse(localStorage.getItem(DBK)||'{}'))}catch(e){}
function save(){try{localStorage.setItem(DBK,JSON.stringify(DB))}catch(e){}}
const today=(d)=>{d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
function markDay(){DB.days[today()]=true;save()}
function streak(){let n=0;const d=new Date();if(!DB.days[today(d)])d.setDate(d.getDate()-1);while(DB.days[today(d)]){n++;d.setDate(d.getDate()-1)}return n}
function bestStreak(){const ks=Object.keys(DB.days).filter(k=>DB.days[k]).sort();let b=0,c=0,prev=null;
  ks.forEach(k=>{const d=new Date(k+'T12:00:00');if(prev&&Math.round((d-prev)/864e5)===1)c++;else c=1;prev=d;b=Math.max(b,c)});return b}
function weekMins(){let s=0;const d=new Date();for(let i=0;i<7;i++){s+=DB.secs[today(d)]||0;d.setDate(d.getDate()-1)}return Math.round(s/60)}
const fmt=s=>{s=Math.max(0,Math.round(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
const sd=a=>{if(a.length<2)return 0;const m=mean(a);return Math.sqrt(a.reduce((s,x)=>s+(x-m)*(x-m),0)/(a.length-1))};
const med=a=>{if(!a.length)return 0;const s=[...a].sort((x,y)=>x-y);return s[Math.floor(s.length/2)]};
const tendTxt=m=>Math.abs(m)<5?'A tiempo':m<0?'Adelantado':'Atrasado';
function toast(html,ms){
  let t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';t.setAttribute('role','status');document.body.appendChild(t)}
  t.innerHTML=html;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),ms||3200);
}
/* Progreso de «Pulso a la Vista» (la app vieja) en este mismo dispositivo: se suma sin borrar nada. */
function oldProgress(){try{const o=JSON.parse(localStorage.getItem(OLDK)||'null');return o&&typeof o==='object'?o:null}catch(e){return null}}
function importOld(){
  const o=oldProgress();if(!o)return false;
  for(const k of ['done','bpm','gbpm'])Object.assign(DB[k],o[k]||{});
  for(const k in o.secs||{})DB.secs[k]=Math.max(DB.secs[k]||0,o.secs[k]);
  for(const k in o.days||{})if(o.days[k])DB.days[k]=true;
  const seen=new Set(DB.ses.map(s=>s.ts));DB.ses=DB.ses.concat((o.ses||[]).filter(s=>!seen.has(s.ts))).sort((a,b)=>a.ts-b.ts).slice(-120);
  const names=new Set(DB.songs.map(s=>s.n));(o.songs||[]).forEach(s=>{if(!names.has(s.n))DB.songs.push(s)});
  if(DB.lat==null&&o.lat!=null){DB.lat=o.lat;DB.clickLvl=o.clickLvl||0}
  if(o.sens)DB.sens=o.sens;
  DB.imported=Date.now();save();return true;
}
/* ---------- temas (los mismos de la familia Roka) ---------- */
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
