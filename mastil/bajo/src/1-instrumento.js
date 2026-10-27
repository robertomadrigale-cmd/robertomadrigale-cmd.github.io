/* Bass variant: migrate the existing key before constructing theory. */
function bassMigrate(data){
 const d={...data};d.strings=+d.strings===5?5:4;
 for(const k of ['done','figbest','retobest','bpm'])if(!d[k]||typeof d[k]!=='object'||Array.isArray(d[k]))d[k]={};
 d.lefty=!!d.lefty;d.theme=({dark:'estudio',light:'claro'})[d.theme]||d.theme||'estudio';
 d.reto={...(d.reto||{})};for(const [id,v] of Object.entries(d.retobest))if(!d.reto[id])d.reto[id]=typeof v==='object'?{...v}:{score:v,stars:Math.min(5,Math.floor(v/20))};
 if(d.bassPlayer==null)d.bassPlayer=true;return d;
}
const BASS_SAVED=(()=>{try{return bassMigrate(JSON.parse(localStorage.getItem('roka-bajo:v1')||'{}'))}catch(e){return bassMigrate({})}})();
const INST={id:'bajo',nombre:'Om Bajo',corto:'Bajo',instrumento:'bajo',art:'el bajo',n:BASS_SAVED.strings,
 open:{1:43,2:38,3:33,4:28,...(BASS_SAVED.strings===5?{5:23}:{})},labels:'GDAEB',rango:[BASS_SAVED.strings===5?23:28,58],frets:15,
 color:'#34d399',db:'roka-bajo:v1',root:'../',pack:'b',sampleRange:[23,70],sampleCache:'roka-bajo-muestras-v1',
 pitchMin:28,pitchMax:800,fft:8192,cloud:{field:'bajo',stats:'statsBajo'},migrate:bassMigrate};
INST.strings=Array.from({length:INST.n},(_,i)=>i+1);INST.desc=INST.strings.slice().reverse();
const BASS_STANDARD=INST.desc.map(s=>INST.open[s]);
INST.tunings={std:{n:'Estándar '+INST.n,m:BASS_STANDARD},std4:{n:'Estándar 4',m:[28,33,38,43]},std5:{n:'Estándar 5',m:[23,28,33,38,43]},dropd:{n:'Drop D',m:INST.n===5?[23,26,33,38,43]:[26,33,38,43]},half:{n:'Medio tono abajo',m:BASS_STANDARD.map(m=>m-1)},full:{n:'Un tono abajo',m:BASS_STANDARD.map(m=>m-2)}};
