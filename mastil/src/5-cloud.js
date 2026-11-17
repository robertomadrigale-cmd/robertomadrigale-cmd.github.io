/* ---------- cuenta en la nube (Firebase) y modo maestro ----------
   Se activa solo cuando 1-firebase-config.js trae una configuración. Sin configuración, nada de esto aparece. */
const CLOUD={app:null,auth:null,db:null,M:null,user:null,ready:false,err:'',pushT:null,group:null,groups:null,busy:false};
const FBV='10.12.2',FBU=n=>`https://www.gstatic.com/firebasejs/${FBV}/firebase-${n}.js`;
const cloudOn=()=>typeof FIREBASE_CONFIG!=='undefined'&&!!(FIREBASE_CONFIG&&FIREBASE_CONFIG.apiKey);
// el correo y contraseña se muestran solo cuando se active ese método en Firebase (Authentication → Método de acceso)
const CLOUD_EMAIL=false;
/* ajustes de cada canción (versión de la IA, rasgueo, sincronización con tu grabación, tono, tempo, ritmo, mezcla):
   viajan con su canción en users/{uid}/songs/{id} (ver «sincronización» abajo); gana el cambio más nuevo */
const SONGK=['kaudio','kai','ksync','ksyncOff','kbpm','kt','kst','kbeats','kuse','kmix'];
const SYNC=[...SONGK,...(INST.id==='bateria'?['stars','best','hist','ses','setlist','spd','gbpm','sess','band','input','lat','visualLat','clickLvl','sens','tapLat','clickVol','theme','imported','seen','played','drumPlayer','drumSchema']:[]),'done','secs','days','bpm','figbest','reto','ach','game','tried',...(INST.id!=='guitarra'?['songs','onb','retobest']:[])];
async function cloudInit(){
  if(!cloudOn()||CLOUD.app)return;
  try{
    const [A,U,F]=await Promise.all([import(FBU('app')),import(FBU('auth')),import(FBU('firestore'))]);
    CLOUD.M={...A,...U,...F};const M=CLOUD.M;
    // el inicio de sesión va por rokaguitarrall.firebaseapp.com: es la dirección que Google tiene registrada (otra da «redirect_uri_mismatch»)
    CLOUD.app=M.initializeApp(FIREBASE_CONFIG);CLOUD.auth=M.getAuth(CLOUD.app);CLOUD.db=FIRESTORE_DB?M.getFirestore(CLOUD.app,FIRESTORE_DB):M.getFirestore(CLOUD.app);
    if(window.__FB_EMU){M.connectAuthEmulator(CLOUD.auth,window.__FB_EMU.auth,{disableWarnings:true});M.connectFirestoreEmulator(CLOUD.db,window.__FB_EMU.host,window.__FB_EMU.port)}
    try{await M.getRedirectResult(CLOUD.auth)}catch(e){}
    M.onAuthStateChanged(CLOUD.auth,async u=>{CLOUD.user=u;CLOUD.ready=true;CLOUD.groups=null;if(u){welcomeClose(true);try{await cloudPull()}catch(e){CLOUD.err=cloudMsg(e);CLOUD.serr=CLOUD.err;console.warn('nube',e)}cloudListen()}else{cloudUnlisten();CLOUD.group=null;welcomeShow()}cloudRefresh()});
  }catch(e){CLOUD.err='No se pudo conectar con la nube. Revisa tu internet.';CLOUD.ready=true;cloudRefresh()}
}
function cloudRefresh(){const h=location.hash;if(h===''||h==='#/'||h.startsWith('#/cuenta'))route()}
function cloudMsg(e){const c=(e&&e.code)||'';return{'auth/invalid-email':'Ese correo no es válido.','auth/missing-password':'Escribe una contraseña.','auth/weak-password':'La contraseña debe tener al menos 6 caracteres.','auth/email-already-in-use':'Ese correo ya tiene cuenta: usa «Entrar».','auth/invalid-credential':'Correo o contraseña incorrectos.','auth/wrong-password':'Correo o contraseña incorrectos.','auth/user-not-found':'No hay una cuenta con ese correo: usa «Crear cuenta».','auth/too-many-requests':'Demasiados intentos. Espera unos minutos.','auth/network-request-failed':'Sin conexión. Intenta cuando tengas internet.','auth/popup-closed-by-user':'Se cerró la ventana antes de terminar.','permission-denied':'No tienes permiso para esa acción.','unavailable':'Sin conexión con la nube. Intenta de nuevo.'}[c]||'Algo salió mal. Intenta de nuevo.'}
function mergeVal(a,b){
  if(a==null)return b;if(b==null)return a;
  if(typeof a==='number'&&typeof b==='number')return Math.max(a,b);
  if(typeof a==='boolean'||typeof b==='boolean')return!!(a||b);
  if(Array.isArray(a)||Array.isArray(b))return(Array.isArray(a)&&a.length>=(Array.isArray(b)?b.length:0))?a:b;
  if(typeof a==='object'&&typeof b==='object'){const o=Object.assign({},a);for(const k in b)o[k]=mergeVal(a[k],b[k]);return o}
  return a;
}
const uref=()=>CLOUD.M.doc(CLOUD.db,'users',CLOUD.user.uid);
/* ---------- sincronización ----------
   - Progreso (lecciones, minutos, retos…): en users/{uid}, campo INST.cloud.field; se juntan (máximos y uniones).
   - Canciones y sus ajustes: un documento por canción en users/{uid}/songs (bajo: songs_bajo, batería: songs_bateria),
     así nunca se pasa el límite de 1 MiB por documento. Cada canción y cada ajuste lleva la hora en que se cambió
     (DB.syncT, se marca al guardar comparando con la última foto SNAP) y gana el más nuevo; borrar deja una lápida.
   - Se escucha en vivo (onSnapshot): lo que cambias en la compu llega al teléfono con la app abierta, y al revés.
   - Antes (hasta nov 2026) las canciones iban en el campo `songs` del documento y sus ajustes dentro del progreso:
     se leen una vez para no perder nada y luego se borra ese campo viejo. */
const PROGK=SYNC.filter(k=>!SONGK.includes(k)&&k!=='songs');
const SCOL=INST.id==='guitarra'?'songs':'songs_'+INST.cloud.field;
const scol=()=>CLOUD.M.collection(CLOUD.db,'users',CLOUD.user.uid,SCOL);
// JSON con llaves ordenadas: para comparar lo de aquí con lo de la nube sin falsos cambios
function cj(v){if(v===undefined)return'null';if(v===null||typeof v!=='object')return JSON.stringify(v);if(Array.isArray(v))return'['+v.map(cj).join(',')+']';if(v.toDate)return JSON.stringify(+v.toDate());return'{'+Object.keys(v).filter(k=>v[k]!==undefined&&typeof v[k]!=='function').sort().map(k=>JSON.stringify(k)+':'+cj(v[k])).join(',')+'}'}
// Firestore no acepta undefined, NaN ni arreglos dentro de arreglos: se limpian (y los anidados viajan como texto)
function fsEnc(v){if(v===undefined||typeof v==='function')return undefined;if(typeof v==='number')return isFinite(v)?v:null;
  if(Array.isArray(v)){if(v.some(x=>Array.isArray(x)))return{$j:JSON.stringify(v)};return v.map(x=>{const y=fsEnc(x);return y===undefined?null:y})}
  if(v&&typeof v==='object'){if(v.toDate)return v;const o={};for(const k in v){if(k===''||/^__.*__$/.test(k))continue;const y=fsEnc(v[k]);if(y!==undefined)o[k]=y}return o}return v}
function fsDec(v){if(Array.isArray(v))return v.map(fsDec);if(v&&typeof v==='object'){if(v.toDate)return v;const ks=Object.keys(v);if(ks.length===1&&ks[0]==='$j'&&typeof v.$j==='string'){try{return JSON.parse(v.$j)}catch(e){return null}}const o={};for(const k of ks)o[k]=fsDec(v[k]);return o}return v}
const baseOf=(k,e)=>k==='kmix'?'_mix':String(e).split('~')[0];
let SNAP=null;
function snapNow(){const m={};(DB.songs||[]).forEach(x=>{if(x&&x.id)m['s|'+x.id]=JSON.stringify(x)});SONGK.forEach(k=>{const o=DB[k];if(o&&typeof o==='object')for(const e in o)if(o[e]!==undefined)m['k|'+k+'|'+e]=JSON.stringify(o[e])});return m}
// marca la hora de lo que cambió desde la última foto (y de lo que se borró)
function syncStamp(){const now=snapNow();if(!SNAP){SNAP=now;return false}const T=DB.syncT=DB.syncT||{},t=Date.now();let ch=false;
  for(const x in now)if(now[x]!==SNAP[x]){T[x]=t;ch=true}
  for(const x in SNAP)if(!(x in now)){T[x]=t;ch=true}
  SNAP=now;return ch}
setTimeout(()=>{if(!SNAP)SNAP=snapNow()},0);
// un documento por canción con todo lo de este dispositivo (canción, ajustes, sus horas y las lápidas)
function songDocs(){const D={},T=DB.syncT||{},S=DB.songs||[],g=b=>D[b]||(D[b]={id:b,t:0,del:false,s:null,k:{},kt:{}});
  S.forEach(x=>{if(x&&x.id){const d=g(x.id);d.s=x;d.t=T['s|'+x.id]||0}});
  SONGK.forEach(k=>{const o=DB[k];if(o&&typeof o==='object')for(const e in o){if(o[e]===undefined)continue;const d=g(baseOf(k,e));(d.k[k]=d.k[k]||{})[e]=o[e];d.kt[k+'|'+e]=T['k|'+k+'|'+e]||0}});
  for(const x in T){const q=x.split('|');
    if(q[0]==='s'){const id=q.slice(1).join('|');if(!S.some(y=>y&&y.id===id)){const d=g(id);d.del=true;d.t=T[x]}}
    else if(q[0]==='k'&&SONGK.includes(q[1])){const k=q[1],e=q.slice(2).join('|');if(!(DB[k]&&DB[k][e]!==undefined)){const d=g(baseOf(k,e));(d.k[k]=d.k[k]||{})[e]=null;d.kt[k+'|'+e]=T[x]}}}
  return D}
// gana el más nuevo; si empatan (datos de antes, sin hora) se agrega lo que falta y, si difieren, todos eligen igual
const rWins=(rt,lt,rv,lv)=>rt>lt||(rt===lt&&(lv===undefined||lv===null?rv!=null:rv!=null&&cj(rv)>cj(lv)));
function applySong(R){
  if(!R||!R.id)return false;const id=String(R.id),T=DB.syncT=DB.syncT||{};let ch=false;
  const S=DB.songs=DB.songs||[],li=S.findIndex(x=>x&&x.id===id),L=li>=0?S[li]:undefined,lt=T['s|'+id]||0,rt=+R.t||0;
  if(R.del){if(rt>lt){if(li>=0){S.splice(li,1);ch=true}T['s|'+id]=rt;if(SNAP)delete SNAP['s|'+id]}}
  else if(R.s&&typeof R.s==='object'&&rWins(rt,lt,R.s,L)&&cj(R.s)!==cj(L)){const v=Object.assign({},R.s,{id});if(li>=0)S[li]=v;else S.unshift(v);T['s|'+id]=rt;if(SNAP)SNAP['s|'+id]=JSON.stringify(v);ch=true}
  const RK=R.k||{},RT=R.kt||{};
  for(const k in RK){if(!SONGK.includes(k)||!RK[k]||typeof RK[k]!=='object')continue;
    for(const e in RK[k]){const rv=RK[k][e],rt2=+RT[k+'|'+e]||0,lv=DB[k]?DB[k][e]:undefined,lt2=T['k|'+k+'|'+e]||0;
      if(rv===null){if(rt2>lt2){if(lv!==undefined){delete DB[k][e];ch=true}T['k|'+k+'|'+e]=rt2;if(SNAP)delete SNAP['k|'+k+'|'+e]}continue}
      if(rWins(rt2,lt2,rv,lv)&&cj(rv)!==cj(lv)){(DB[k]=DB[k]||{})[e]=rv;T['k|'+k+'|'+e]=rt2;if(SNAP)SNAP['k|'+k+'|'+e]=JSON.stringify(rv);ch=true}}}
  return ch}
// progreso del documento principal (y lo viejo: canciones y ajustes que antes iban ahí)
function applyMain(d){
  const p=INST.id==='bateria'?drumCloudData(fsDec(d[INST.cloud.field])):fsDec(d[INST.cloud.field]||{}),before=cj(PROGK.map(k=>DB[k]));let ch=false;
  PROGK.forEach(k=>{if(k==='onb')return;DB[k]=INST.id==='bateria'?drumCloudMerge(k,DB[k],p[k]):mergeVal(DB[k],p[k])});
  const onb=INST.id!=='guitarra'?p.onb:d.onb;if(DB.onb==null&&onb!=null)DB.onb=onb;
  if(cj(PROGK.map(k=>DB[k]))!==before)ch=true;
  const T=DB.syncT||{},old=INST.id!=='guitarra'?p.songs:d.songs;
  if(Array.isArray(old)){if(INST.id==='guitarra')CLOUD.legacy=true;const have=new Set((DB.songs||[]).map(x=>x&&x.id));
    old.forEach(x=>{if(x&&x.id&&!have.has(x.id)&&!T['s|'+x.id]){(DB.songs=DB.songs||[]).push(x);have.add(x.id);if(SNAP)SNAP['s|'+x.id]=JSON.stringify(x);ch=true}})}
  SONGK.forEach(k=>{const o=p[k];if(!o||typeof o!=='object')return;for(const e in o){if(o[e]==null||(DB[k]&&DB[k][e]!==undefined)||T['k|'+k+'|'+e])continue;(DB[k]=DB[k]||{})[e]=o[e];if(SNAP)SNAP['k|'+k+'|'+e]=JSON.stringify(o[e]);ch=true}});
  CLOUD.group=d.group||null;return ch}
async function cloudPull(){
  const M=CLOUD.M;syncStamp();CLOUD.rs={};CLOUD.rm=null;
  const snap=await M.getDoc(uref());if(snap.exists())applyMain(snap.data());
  const q=await M.getDocs(scol());q.forEach(x=>{const r=fsDec(x.data());applySong(r);CLOUD.rs[x.id]=cj(x.data())});
  persist();await cloudPush(true);
}
function memberStats(){const[d,t]=doneCount();const fb=Object.values(DB.figbest||{});return{done:d,total:t,mins7:weekMins(),streak:streak(),last:DB.last||1,mic:fb.length?Math.round(fb.reduce((a,b)=>a+b,0)/fb.length):null}}
async function pushSongs(){
  const M=CLOUD.M,D=songDocs(),w=[];CLOUD.rs=CLOUD.rs||{};
  for(const b in D){const enc=fsEnc(D[b]),k=audKey(b),j=cj(enc);if(CLOUD.rs[k]===j)continue;w.push([k,enc,j])}
  let bad=0;
  for(let i=0;i<w.length;){let n=0,sz=0;const B=M.writeBatch(CLOUD.db),part=[];
    while(i<w.length&&n<100&&(sz+w[i][2].length<3e6||!n)){B.set(M.doc(scol(),w[i][0]),w[i][1]);part.push(w[i]);sz+=w[i][2].length;n++;i++}
    try{await B.commit();part.forEach(([k,,j])=>CLOUD.rs[k]=j)}
    catch(e){if(e&&(e.code==='unavailable'||e.code==='permission-denied'||e.code==='unauthenticated'))throw e;
      // si un pedazo falla, una por una: así una canción con problema no detiene a las demás
      for(const[k,enc,j] of part){try{await M.setDoc(M.doc(scol(),k),enc);CLOUD.rs[k]=j}catch(e2){bad++;console.warn('nube: canción',k,e2)}}}}
  if(bad)throw{code:'x',msg:bad===1?'Una canción no se pudo subir a la nube.':bad+' canciones no se pudieron subir a la nube.'};
}
async function pushMain(){
  const M=CLOUD.M,u=CLOUD.user,progress={};PROGK.forEach(k=>{if(DB[k]!=null)progress[k]=DB[k]});
  const F=INST.cloud.field,data={name:u.displayName||u.email||'Sin nombre',email:u.email||'',photo:u.photoURL||'',updated:M.serverTimestamp(),[F]:fsEnc(progress),group:CLOUD.group||null},mf=['name','email','photo','updated',F,'group'];
  if(INST.id==='guitarra'){data.onb=fsEnc(DB.onb)??null;mf.push('onb');if(CLOUD.legacy){data.songs=M.deleteField();mf.push('songs')}}
  const j=cj([data[F],data.onb,data.group,!!CLOUD.legacy]);if(j===CLOUD.rm)return;
  await M.setDoc(uref(),data,{mergeFields:mf});CLOUD.rm=j;CLOUD.legacy=false;
  if(CLOUD.group)await M.setDoc(M.doc(CLOUD.db,'groups',CLOUD.group,'members',u.uid),{name:u.displayName||u.email||'Alumno',photo:u.photoURL||'',lastSeen:M.serverTimestamp(),[INST.cloud.stats]:memberStats()},{merge:true});
}
async function cloudPush(now){
  if(!CLOUD.user)return;
  if(!now){clearTimeout(CLOUD.pushT);CLOUD.pushT=setTimeout(()=>cloudPush(true).catch(()=>{}),1500);return}
  clearTimeout(CLOUD.pushT);if(CLOUD.pushing){CLOUD.again=true;return CLOUD.pushing}
  CLOUD.pushing=(async()=>{try{await pushSongs();await pushMain();CLOUD.last=Date.now();CLOUD.serr='';syncInfo()}
    catch(e){CLOUD.serr=e&&e.msg?e.msg:cloudMsg(e);console.warn('nube',e);syncInfo();throw e}
    finally{CLOUD.pushing=null;if(CLOUD.again){CLOUD.again=false;cloudPush()}}})();
  return CLOUD.pushing;
}
// en vivo: lo que cambia en otro dispositivo llega aquí sin recargar
function cloudUnlisten(){(CLOUD.un||[]).forEach(f=>{try{f()}catch(e){}});CLOUD.un=[];CLOUD.rs={};CLOUD.rm=null}
function cloudListen(){
  if(!CLOUD.user)return;cloudUnlisten();const M=CLOUD.M,uid=CLOUD.user.uid,fail=e=>{CLOUD.serr=cloudMsg(e);console.warn('nube',e);syncInfo()};
  CLOUD.un=[
    M.onSnapshot(uref(),x=>{if(!CLOUD.user||CLOUD.user.uid!==uid||x.metadata.hasPendingWrites||!x.exists())return;syncStamp();if(applyMain(x.data()))syncRemote(false)},fail),
    M.onSnapshot(scol(),q=>{if(!CLOUD.user||CLOUD.user.uid!==uid)return;let ch=false;syncStamp();
      q.docChanges().forEach(c=>{if(c.type==='removed'||c.doc.metadata.hasPendingWrites)return;const raw=c.doc.data();if(applySong(fsDec(raw)))ch=true;CLOUD.rs[c.doc.id]=cj(raw)});
      if(ch)syncRemote(true)},fail)];
}
// llegó algo de otro dispositivo: guardar aquí, subir lo que este tenga más nuevo y refrescar la pantalla si no estás tocando
function syncRemote(songs){
  persist();CLOUD.last=Date.now();CLOUD.serr='';cloudPush();syncInfo();
  clearTimeout(CLOUD.refT);CLOUD.refT=setTimeout(()=>{const h=location.hash;
    if(typeof SEQ!=='undefined'&&SEQ.id)return;
    if(h.startsWith('#/cuenta')||(songs&&(h===''||h==='#/'||h==='#/cancionero')))route()},400);
}
// pasar a segundo plano o cerrar: subir ya lo pendiente (el teléfono puede cerrar la app en cualquier momento)
function syncFlush(){clearTimeout(CLOUD.stT);if(syncStamp())persist();if(CLOUD.user)cloudPush(true).catch(()=>{})}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')syncFlush()});
addEventListener('pagehide',syncFlush);
async function cloudSyncNow(){if(!CLOUD.user)return;syncStamp();await cloudPull();cloudListen()}
function syncInfo(){const e=document.getElementById('clsync');if(e)e.innerHTML=syncTxt()}
function syncTxt(){if(CLOUD.serr)return`<span class="msg err" style="margin:0">${esc(CLOUD.serr)}</span>`;if(!CLOUD.last)return'Sincronizando…';const s=Math.round((Date.now()-CLOUD.last)/1000);return'Sincronizado '+(s<60?'hace un momento':s<3600?`hace ${Math.round(s/60)} min`:`hace ${Math.round(s/3600)} h`)}
const _localSave=save;save=function(){_localSave.apply(this,arguments);clearTimeout(CLOUD.stT);CLOUD.stT=setTimeout(syncFlush,600)};
async function cloudGoogle(){
  const M=CLOUD.M,pr=new M.GoogleAuthProvider();pr.setCustomParameters({prompt:'select_account'});
  try{await M.signInWithPopup(CLOUD.auth,pr)}catch(e){if(e&&(e.code==='auth/popup-blocked'||e.code==='auth/operation-not-supported-in-this-environment'))await M.signInWithRedirect(CLOUD.auth,pr);else throw e}
}
async function cloudEmail(email,pass,create){const M=CLOUD.M;if(create){const c=await M.createUserWithEmailAndPassword(CLOUD.auth,email,pass);const n=email.split('@')[0];await M.updateProfile(c.user,{displayName:n})}else await M.signInWithEmailAndPassword(CLOUD.auth,email,pass)}
const genCode=()=>Array.from({length:6},()=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random()*32)]).join('');
async function cloudCreateGroup(name){
  const M=CLOUD.M;let code=genCode();for(let i=0;i<4;i++){const s=await M.getDoc(M.doc(CLOUD.db,'groups',code));if(!s.exists())break;code=genCode()}
  await M.setDoc(M.doc(CLOUD.db,'groups',code),{owner:CLOUD.user.uid,name,created:M.serverTimestamp()});CLOUD.groups=null;return code;
}
async function cloudJoin(code){
  const M=CLOUD.M;code=code.trim().toUpperCase().replace(/[^A-Z0-9]/g,'');
  if(code.length!==6)throw{code:'x',msg:'El código tiene 6 letras y números.'};
  const s=await M.getDoc(M.doc(CLOUD.db,'groups',code));if(!s.exists())throw{code:'x',msg:'Ese código no existe. Revísalo con tu maestro.'};
  if(CLOUD.group&&CLOUD.group!==code)await cloudLeave(true);
  CLOUD.group=code;await cloudPush(true);return s.data().name;
}
async function cloudLeave(silent){const M=CLOUD.M;if(!CLOUD.group)return;try{await M.deleteDoc(M.doc(CLOUD.db,'groups',CLOUD.group,'members',CLOUD.user.uid))}catch(e){}CLOUD.group=null;await cloudPush(true);if(!silent)cloudRefresh()}
async function cloudMyGroups(){
  const M=CLOUD.M,q=M.query(M.collection(CLOUD.db,'groups'),M.where('owner','==',CLOUD.user.uid)),gs=await M.getDocs(q),out=[];
  for(const g of gs.docs){const ms=await M.getDocs(M.collection(CLOUD.db,'groups',g.id,'members'));out.push({code:g.id,name:g.data().name,members:ms.docs.map(m=>Object.assign({uid:m.id},m.data()))})}
  return out.sort((a,b)=>a.name.localeCompare(b.name));
}
async function cloudGroupName(code){try{const s=await CLOUD.M.getDoc(CLOUD.M.doc(CLOUD.db,'groups',code));return s.exists()?s.data().name:''}catch(e){return''}}
/* ---------- portada de bienvenida ----------
   La primera vez (sin sesión): mosaico de portadas inclinado, logo, frase y «Continuar con Google» o «Seguir sin cuenta». */
const GLOGO='<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
function welcomeShow(){
  if(!cloudOn()||CLOUD.user||DB.welcomed||document.getElementById('welcome'))return;
  const H=[218,262,328,26,150,352,200,28,265,330,205,180],tiles=[];
  for(let i=0;i<24;i++){const l=i%LESSONS.length+1;tiles.push(i%3===1?coverArt(H[i%12],ARTM[(i*5)%11+1],null,'w'+i):lessonArt(l))}
  document.body.insertAdjacentHTML('beforeend',`<div id="welcome" role="dialog" aria-modal="true" aria-labelledby="wtitle">
   <div class="wmos" aria-hidden="true">${tiles.map(t=>`<span class="acov">${t}</span>`).join('')}</div><div class="wfade" aria-hidden="true"></div>
    <div class="wbox"><span class="wlogo">${logo()}</span><h1 id="wtitle">${INST.nombre}</h1>
    <p class="wsub">${INST.id==='bateria'?'Aprende batería con una sesión diaria: grooves, rudimentos, canciones con karaoke y una banda que te acompaña.':INST.id==='bajo'?'Aprende bajo viendo el mástil: lecciones, canciones con karaoke y una banda que te acompaña.':'Aprende guitarra viendo el mástil: lecciones, canciones con karaoke y una banda que te acompaña.'}</p>
    <button class="wgoogle" data-w="google">${GLOGO}Continuar con Google</button>
    <button class="wskip" data-w="skip">Seguir sin cuenta</button>
    <p class="msg err" id="werr" hidden></p>
    <p class="wsmall">Con tu cuenta, tu progreso se guarda en la nube y lo ves en tu celular, tablet y computadora.</p></div></div>`);
  const w=document.getElementById('welcome');document.documentElement.classList.add('welcome-on');
  w.addEventListener('click',async e=>{const b=e.target.closest('[data-w]');if(!b)return;
    if(b.dataset.w==='skip'){welcomeClose(true);return}
    const er=$('#werr',w);er.hidden=true;b.disabled=true;
    try{await cloudGoogle()}catch(x){er.textContent=cloudMsg(x);er.hidden=false}finally{b.disabled=false}});
}
function welcomeClose(remember){const w=document.getElementById('welcome');if(remember&&!DB.welcomed){DB.welcomed=1;persist()}if(!w)return;w.classList.add('out');document.documentElement.classList.remove('welcome-on');setTimeout(()=>w.remove(),320)}
/* ---------- interfaz ---------- */
function cloudCard(){
  if(!cloudOn())return'';
  if(!CLOUD.ready)return`<div class="card"><h3>Tu cuenta</h3><p class="cap" style="margin:4px 0 0">Conectando…</p></div>`;
  const u=CLOUD.user;
  return u?`<a class="card tool" href="#/cuenta"><span class="ic">${IC.check}</span><span style="flex:1;min-width:0"><b>Progreso guardado en la nube</b><span>${esc(u.displayName||u.email||'')} · ${CLOUD.group?'en un grupo de clase':'abre para unirte a una clase o ser maestro'}</span></span></a>`
   :`<a class="card tool" href="#/cuenta"><span class="ic">${IC.down}</span><span style="flex:1;min-width:0"><b>Guarda tu progreso en la nube</b><span>Úsalo en tu celular, tablet y PC, y únete a la clase de tu maestro.</span></span></a>`;
}
const ago=ts=>{if(!ts||!ts.toDate)return'—';const m=Math.round((Date.now()-ts.toDate().getTime())/60000);return m<60?`hace ${Math.max(1,m)} min`:m<1440?`hace ${Math.round(m/60)} h`:`hace ${Math.round(m/1440)} d`};
function viewAccount(){
  if(!cloudOn())return{title:'Cuenta',back:'#/',html:`<div class="card"><h3>La cuenta en la nube aún no está activada</h3><p class="cap">Pronto podrás guardar tu progreso en la nube.</p></div>`};
  const u=CLOUD.user;
  if(!CLOUD.ready)return{title:'Cuenta',back:'#/',html:'<div class="card"><p class="cap">Conectando con la nube…</p></div>'};
  if(!u)return{title:'Cuenta',back:'#/',html:`
   <div class="lhead"><h1>Tu cuenta</h1><p class="sub">Guarda tu progreso en la nube para usarlo en todos tus dispositivos y unirte a la clase de tu maestro.</p></div>
   <div class="card" style="display:flex;flex-direction:column;gap:14px">
    <button class="wgoogle" data-cl="google">${GLOGO}Continuar con Google</button>
    ${CLOUD_EMAIL?`<p class="cap" style="margin:0;text-align:center">o con tu correo</p>
    <label class="cl" for="clmail" style="margin:0">Correo</label><input id="clmail" class="inp" type="email" autocomplete="email" placeholder="tu@correo.com">
    <label class="cl" for="clpass" style="margin:0">Contraseña</label><input id="clpass" class="inp" type="password" autocomplete="current-password" placeholder="Mínimo 6 caracteres">
    <div class="row"><button class="btn" data-cl="in">Entrar</button><button class="btn" data-cl="new">Crear cuenta</button></div>`:''}
    <p class="msg err" id="clerr" ${CLOUD.err?'':'hidden'}>${esc(CLOUD.err)}</p>
   </div>`,mount:cloudMount};
  return{title:'Cuenta',back:'#/',html:`
   <div class="lhead"><h1>Tu cuenta</h1><p class="sub">${esc(u.displayName||'')} ${u.email?'· '+esc(u.email):''}</p></div>
   <div class="card"><h3>Progreso en la nube</h3><p class="cap" style="margin:4px 0 0">Se guarda solo cada vez que avanzas. Entra con la misma cuenta en otro dispositivo y verás el mismo progreso.</p><p class="cap" id="clsync" style="margin:8px 0 0">${syncTxt()}</p><div class="row" style="margin-top:10px"><button class="btn sm" data-cl="sync">Sincronizar ahora</button><button class="btn sm" data-cl="out">Cerrar sesión</button></div></div>
   <div class="card" style="display:flex;flex-direction:column;gap:10px"><h3>Soy alumno</h3>
    ${CLOUD.group?`<p class="cap" style="margin:0">Estás en la clase <b id="clgname">${CLOUD.group}</b>. Tu maestro ve tus ejercicios, minutos y racha.</p><div class="row"><button class="btn sm" data-cl="leave">Salir de la clase</button></div>`
     :`<p class="cap" style="margin:0">Escribe el código de 6 letras que te dio tu maestro.</p><div class="row"><input id="clcode" class="inp" maxlength="8" placeholder="Código" style="width:150px;text-transform:uppercase"><button class="btn" data-cl="join">Unirme</button></div>`}
   </div>
   <div class="card" style="display:flex;flex-direction:column;gap:10px"><h3>Soy maestro</h3>
    <p class="cap" style="margin:0">Crea una clase y comparte el código con tus alumnos. Verás quién practica, cuántos minutos y en qué lección va.</p>
    <div class="row"><input id="clgnew" class="inp" maxlength="40" placeholder="Nombre de la clase" style="flex:1;min-width:160px"><button class="btn" data-cl="create">Crear clase</button></div>
    <div id="clgroups"><p class="cap">Cargando tus clases…</p></div>
   </div>
   <p class="msg err" id="clerr" hidden></p>`,mount:cloudMount};
}
function groupsHTML(gs){
  if(!gs.length)return'<p class="cap">Todavía no tienes clases.</p>';
  return gs.map(g=>`<div class="clg"><div class="row" style="justify-content:space-between"><div style="min-width:0"><b>${esc(g.name)}</b><span class="cap" style="display:block;margin:0">${g.members.length} ${g.members.length===1?'alumno':'alumnos'}</span></div><button class="btn sm" data-cl="copy" data-code="${g.code}">Código: <b class="mono">${g.code}</b></button></div>
   ${g.members.length?`<div class="cltable"><div class="clr h"><span>Alumno</span><span>Hechos</span><span>Min/sem</span><span>Racha</span></div>${g.members.sort((a,b)=>((b[INST.cloud.stats]||{}).mins7||0)-((a[INST.cloud.stats]||{}).mins7||0)).map(m=>{const s=m[INST.cloud.stats]||{};return`<div class="clr"><span class="clname">${esc(m.name||'Alumno')}<small>Lección ${s.last||1} · ${ago(m.lastSeen)}${s.mic!=null?' · mic '+s.mic+' %':''}</small></span><span>${s.done||0}/${s.total||ALLEX.length}</span><span>${s.mins7||0}</span><span>${s.streak||0} d</span></div>`}).join('')}</div>`:'<p class="cap">Comparte el código para que tus alumnos se unan.</p>'}</div>`).join('');
}
function cloudMount(r){
  const err=t=>{const e=$('#clerr',r);if(e){e.hidden=!t;e.textContent=t||''}};
  const busy=async(fn)=>{if(CLOUD.busy)return;CLOUD.busy=true;err('');try{await fn()}catch(e){err(e&&e.msg?e.msg:cloudMsg(e))}finally{CLOUD.busy=false}};
  if(CLOUD.user){
    if(CLOUD.group)cloudGroupName(CLOUD.group).then(n=>{const e=$('#clgname',r);if(e&&n)e.textContent=n+' ('+CLOUD.group+')'});
    (CLOUD.groups?Promise.resolve(CLOUD.groups):cloudMyGroups()).then(gs=>{CLOUD.groups=gs;const e=$('#clgroups',r);if(e)e.innerHTML=groupsHTML(gs)}).catch(e=>{const el=$('#clgroups',r);if(el)el.innerHTML=`<p class="msg err">${cloudMsg(e)}</p>`});
  }
  r.addEventListener('click',e=>{
    const b=e.target.closest('[data-cl]');if(!b)return;const k=b.dataset.cl;
    if(k==='google')busy(cloudGoogle);
    else if(k==='in'||k==='new')busy(()=>cloudEmail($('#clmail',r).value.trim(),$('#clpass',r).value,k==='new'));
    else if(k==='out')busy(async()=>{syncFlush();await CLOUD.M.signOut(CLOUD.auth)});
    else if(k==='sync')busy(async()=>{const e=$('#clsync',r);if(e)e.textContent='Sincronizando…';await cloudSyncNow();syncInfo();toast('Listo: todo está sincronizado.')});
    else if(k==='join')busy(async()=>{const n=await cloudJoin($('#clcode',r).value);toast(`Te uniste a la clase «${esc(n)}».`);cloudRefresh()});
    else if(k==='leave')busy(()=>cloudLeave());
    else if(k==='create')busy(async()=>{const n=$('#clgnew',r).value.trim();if(!n)throw{msg:'Ponle nombre a la clase.'};const c=await cloudCreateGroup(n);toast(`Clase creada. Código: ${c}`,5000);cloudRefresh()});
    else if(k==='copy'){const c=b.dataset.code,t=`Únete a mi clase en ${INST.nombre}: abre ${location.href.split('#')[0]}#/cuenta y escribe el código ${c}`;navigator.clipboard&&navigator.clipboard.writeText(t).then(()=>toast('Invitación copiada. Pégala en WhatsApp.'),()=>toast('Código: '+c,5000))}
  });
}
cloudInit();
/* ---------- grabaciones en la nube ----------
   El audio de cada canción va en la misma base de datos, en tu cuenta: users/{uid}/audio/{canción} (nombre, tipo,
   tamaño, y la sincronización: pulsos, voz, anclas) + parts/{n} con pedazos de 700 KB. Así la grabación y su
   sincronización llegan a tus otros dispositivos. DB.kaudio[id] = tamaño (sube a la nube con las canciones). */
const AUD_CH=700*1024,audKey=id=>String(id).replace(/[\/.#$\[\]]/g,'_');
const cloudAudioOn=()=>!!(typeof CLOUD!=='undefined'&&CLOUD.user&&CLOUD.M);
async function cloudAudioPut(id,blob,extra,prog){
  if(!cloudAudioOn())return false;const M=CLOUD.M,base=['users',CLOUD.user.uid,'audio',audKey(id)],buf=new Uint8Array(await blob.arrayBuffer()),n=Math.max(1,Math.ceil(buf.length/AUD_CH));
  for(let i=0;i<n;i++){await M.setDoc(M.doc(CLOUD.db,...base,'parts',String(i)),{b:M.Bytes.fromUint8Array(buf.subarray(i*AUD_CH,(i+1)*AUD_CH))});if(prog)prog((i+1)/n)}
  await M.setDoc(M.doc(CLOUD.db,...base),Object.assign({name:blob.name||'grabacion',type:blob.type||'audio/mpeg',size:buf.length,n,updated:M.serverTimestamp()},extra||{}));
  DB.kaudio=DB.kaudio||{};DB.kaudio[id]=buf.length;save();return true;
}
async function cloudAudioMeta(id,extra){if(!cloudAudioOn()||!(DB.kaudio||{})[id])return;const M=CLOUD.M;try{await M.setDoc(M.doc(CLOUD.db,'users',CLOUD.user.uid,'audio',audKey(id)),extra,{merge:true})}catch(e){}}
async function cloudAudioGet(id,prog){
  if(!cloudAudioOn())return null;const M=CLOUD.M,base=['users',CLOUD.user.uid,'audio',audKey(id)],s=await M.getDoc(M.doc(CLOUD.db,...base));if(!s.exists())return null;
  const d=s.data(),parts=[];for(let i=0;i<d.n;i++){const p=await M.getDoc(M.doc(CLOUD.db,...base,'parts',String(i)));if(!p.exists())throw new Error('Falta un pedazo de la grabación en la nube.');parts.push(p.data().b.toUint8Array());if(prog)prog((i+1)/d.n)}
  return{blob:new Blob(parts,{type:d.type||'audio/mpeg'}),meta:d};
}
async function cloudAudioDel(id){
  if(DB.kaudio){delete DB.kaudio[id];save()}if(!cloudAudioOn())return;const M=CLOUD.M,base=['users',CLOUD.user.uid,'audio',audKey(id)];
  try{const s=await M.getDoc(M.doc(CLOUD.db,...base));const n=s.exists()?s.data().n||0:0;for(let i=0;i<n;i++)await M.deleteDoc(M.doc(CLOUD.db,...base,'parts',String(i)));await M.deleteDoc(M.doc(CLOUD.db,...base))}catch(e){}
}
// espera a que la cuenta esté lista (al abrir la app tarda un momento)
function cloudWhenReady(cb,tries){tries=tries??20;if(cloudAudioOn())return cb();if(typeof CLOUD==='undefined'||!cloudOn()||(CLOUD.ready&&!CLOUD.user)||tries<=0)return;setTimeout(()=>cloudWhenReady(cb,tries-1),700)}
