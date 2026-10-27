/* v2 keeps the v1 key and every legacy field. Setlist is not the karaoke library. */
function drumMigrate(data){
 const d={...data};
 for(const k of ['done','secs','days','game','bpm','gbpm','stars','best','seen','spd','band','figbest','reto'])d[k]={...(d[k]||{})};
 for(const k of ['hist','ses'])d[k]=Array.isArray(d[k])?d[k].slice():[];
 if(d.drumSchema!==2){
  const legacy=Array.isArray(d.songs)?d.songs:[];
  d.setlist=[...(Array.isArray(d.setlist)?d.setlist:[]),...legacy.filter(s=>!s.src)];
  d.songs=legacy.filter(s=>s.src);
  d.legacyTheme=d.theme;d.theme=({dark:'estudio',light:'claro',escenario:'punk'})[d.theme]||d.theme||'estudio';
  d.drumSchema=2;
 }
 d.setlist=Array.isArray(d.setlist)?d.setlist:[];d.songs=Array.isArray(d.songs)?d.songs:[];
 if(d.drumPlayer==null)d.drumPlayer=true;
 if(d.input==null)d.input='tap';if(d.sens==null)d.sens=2;if(d.lat==null)d.lat=null;
 if(d.tapLat==null)d.tapLat=0;if(d.clickLvl==null)d.clickLvl=0;if(d.clickVol==null)d.clickVol=1;
 return d;
}
function drumCloudData(data){return data&&Object.keys(data).length?drumMigrate(data):{}}
function drumCloudMerge(key,a,b){
 if(b==null)return a;if(a==null)return b;
 if(['hist','ses','setlist','songs'].includes(key)&&Array.isArray(a)&&Array.isArray(b)){
  const entries=new Map();for(const item of [...b,...a]){const id=['setlist','songs'].includes(key)&&item.id?'id:'+item.id:JSON.stringify(item);entries.set(id,{...(entries.get(id)||{}),...item})}return [...entries.values()];
 }
 return mergeVal(a,b);
}
const INST={id:'bateria',nombre:'Om Batería',corto:'Batería',instrumento:'batería',art:'la batería',n:0,strings:[],desc:[],open:{},labels:'',rango:[0,127],frets:0,
 color:'#ff5c8a',db:'roka-bateria:v1',root:'../',pack:'d',sampleRange:[0,0],sampleCache:'roka-bateria-muestras-v1',
 pitchMin:30,pitchMax:2000,fft:4096,tunings:{std:{n:'Kit',m:[]}},cloud:{field:'bateria',stats:'statsBateria'},migrate:drumMigrate};
