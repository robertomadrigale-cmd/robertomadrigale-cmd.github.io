const OLDK='pulso-a-la-vista:v1';
function bestStreak(){const ks=Object.keys(DB.days).filter(k=>DB.days[k]).sort();let b=0,c=0,prev=null;
  ks.forEach(k=>{const d=new Date(k+'T12:00:00');if(prev&&Math.round((d-prev)/864e5)===1)c++;else c=1;prev=d;b=Math.max(b,c)});return b}
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
const sd=a=>{if(a.length<2)return 0;const m=mean(a);return Math.sqrt(a.reduce((s,x)=>s+(x-m)*(x-m),0)/(a.length-1))};
const med=a=>{if(!a.length)return 0;const s=[...a].sort((x,y)=>x-y);return s[Math.floor(s.length/2)]};
const tendTxt=m=>Math.abs(m)<5?'A tiempo':m<0?'Adelantado':'Atrasado';
function oldProgress(){try{const o=JSON.parse(localStorage.getItem(OLDK)||'null');return o&&typeof o==='object'?o:null}catch(e){return null}}
function importOld(){
  const o=oldProgress();if(!o)return false;
  for(const k of ['done','bpm','gbpm'])Object.assign(DB[k],o[k]||{});
  for(const k in o.secs||{})DB.secs[k]=Math.max(DB.secs[k]||0,o.secs[k]);
  for(const k in o.days||{})if(o.days[k])DB.days[k]=true;
  const seen=new Set(DB.ses.map(s=>s.ts));DB.ses=DB.ses.concat((o.ses||[]).filter(s=>!seen.has(s.ts))).sort((a,b)=>a.ts-b.ts).slice(-120);
  const names=new Set(DB.setlist.map(s=>s.n));(o.songs||[]).forEach(s=>{if(!names.has(s.n))DB.setlist.push(s)});
  if(DB.lat==null&&o.lat!=null){DB.lat=o.lat;DB.clickLvl=o.clickLvl||0}
  if(o.sens)DB.sens=o.sens;
  DB.imported=Date.now();save();return true;
}
