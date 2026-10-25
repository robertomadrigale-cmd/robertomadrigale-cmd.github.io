/* ---------- sesiones y audios en IndexedDB «roka-estudio» (almacenes: sesiones, audios) ----------
   Sesión: {id,nombre,creada,editada,bpm,compas,tono:{pc,minor},pistas:[{id,nombre,rol,vol,pan,mute,solo,eq:[g,g,g],rev,clips:[{id,inicio,dur,offset,fuente}]}],master:{vol}}
   fuente = {beat:{id,parte,compases,prog,rol}} (se vuelve a generar al abrir) | {audio:idAudio} (el archivo se guarda en «audios»). */
let IDB=null;
function idb(){
  if(IDB)return IDB;
  IDB=new Promise((res,rej)=>{const r=indexedDB.open('roka-estudio',1);r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains('sesiones'))d.createObjectStore('sesiones',{keyPath:'id'});if(!d.objectStoreNames.contains('audios'))d.createObjectStore('audios')};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
  return IDB;
}
async function store(name,mode,fn){const d=await idb();return new Promise((res,rej)=>{const tx=d.transaction(name,mode),st=tx.objectStore(name),q=fn(st);tx.oncomplete=()=>res(q&&q.result);tx.onerror=()=>rej(tx.error)})}
const sesGet=id=>store('sesiones','readonly',s=>s.get(id));
const sesAll=()=>store('sesiones','readonly',s=>s.getAll());
const sesPut=x=>store('sesiones','readwrite',s=>s.put(x));
const sesDel=id=>store('sesiones','readwrite',s=>s.delete(id));
const audPut=(id,blob)=>store('audios','readwrite',s=>s.put(blob,id));
const audGet=id=>store('audios','readonly',s=>s.get(id));
const audDel=id=>store('audios','readwrite',s=>s.delete(id));
function newSession(o={}){
  const b=o.genero&&BEATS.find(x=>x.id===o.genero||x.gen.toLowerCase()===String(o.genero).toLowerCase());
  const tono=o.tono||(b?parseKey(b.key):{pc:9,minor:true});
  return{id:uid(),nombre:o.nombre||'Sesión '+new Date().toLocaleDateString('es-MX',{day:'numeric',month:'short'}),creada:Date.now(),editada:Date.now(),
    bpm:o.bpm||(b?b.bpm[2]:96),compas:b?b.beats:4,tono,pistas:[],master:{vol:.9},desde:o.desde||null,genero:b?b.id:null};
}
function trackFor(S,rol,nombre){
  let t=S.pistas.find(p=>p.rol===rol&&(rol!=='voz'&&rol!=='audio'));
  if(!t){t={id:uid(),nombre:nombre||ROLES[rol].n,rol,vol:rol==='bateria'?.8:.85,pan:0,mute:false,solo:false,eq:[0,0,0],rev:rol==='armonia'||rol==='metales'||rol==='voz'?.18:.06,clips:[]};S.pistas.push(t)}
  return t;
}
// respaldo sin audios: archivo .roka.json
const sessionJSON=S=>JSON.stringify({app:'roka-estudio',version:1,sesion:S},null,1);
function sessionFromJSON(txt){const o=JSON.parse(txt);if(!o||o.app!=='roka-estudio'||!o.sesion)throw Error('No es una sesión de Roka Estudio.');const S=o.sesion;S.id=uid();S.nombre+=' (importada)';S.pistas.forEach(p=>p.clips=p.clips.filter(c=>c.fuente.beat));return S}
