/* ---------- cuenta en la nube (Firebase) y modo maestro ----------
   Se activa solo cuando 1-firebase-config.js trae una configuración. Sin configuración, nada de esto aparece. */
const CLOUD={app:null,auth:null,db:null,M:null,user:null,ready:false,err:'',pushT:null,group:null,groups:null,busy:false};
const FBV='10.12.2',FBU=n=>`https://www.gstatic.com/firebasejs/${FBV}/firebase-${n}.js`;
const cloudOn=()=>typeof FIREBASE_CONFIG!=='undefined'&&!!(FIREBASE_CONFIG&&FIREBASE_CONFIG.apiKey);
// el correo y contraseña se muestran solo cuando se active ese método en Firebase (Authentication → Método de acceso)
const CLOUD_EMAIL=false;
const SYNC=['done','secs','days','bpm','figbest','reto','ach','game','tried'];
async function cloudInit(){
  if(!cloudOn()||CLOUD.app)return;
  try{
    const [A,U,F]=await Promise.all([import(FBU('app')),import(FBU('auth')),import(FBU('firestore'))]);
    CLOUD.M={...A,...U,...F};const M=CLOUD.M;
    const host=location.hostname,ownHost=/\.(web\.app|firebaseapp\.com)$/.test(host);
    CLOUD.app=M.initializeApp(ownHost?Object.assign({},FIREBASE_CONFIG,{authDomain:host}):FIREBASE_CONFIG);CLOUD.auth=M.getAuth(CLOUD.app);CLOUD.db=M.getFirestore(CLOUD.app);
    if(window.__FB_EMU){M.connectAuthEmulator(CLOUD.auth,window.__FB_EMU.auth,{disableWarnings:true});M.connectFirestoreEmulator(CLOUD.db,window.__FB_EMU.host,window.__FB_EMU.port)}
    try{await M.getRedirectResult(CLOUD.auth)}catch(e){}
    M.onAuthStateChanged(CLOUD.auth,async u=>{CLOUD.user=u;CLOUD.ready=true;CLOUD.groups=null;if(u){welcomeClose(true);try{await cloudPull()}catch(e){CLOUD.err=cloudMsg(e)}}else{CLOUD.group=null;welcomeShow()}cloudRefresh()});
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
async function cloudPull(){
  const M=CLOUD.M,snap=await M.getDoc(uref()),d=snap.exists()?snap.data():{};
  const p=d.progress||{};SYNC.forEach(k=>{DB[k]=mergeVal(DB[k],p[k])});
  if((!DB.songs||!DB.songs.length)&&Array.isArray(d.songs))DB.songs=d.songs;
  if(DB.onb==null&&d.onb)DB.onb=d.onb;
  CLOUD.group=d.group||null;persist();await cloudPush(true);
}
function memberStats(){const[d,t]=doneCount();const fb=Object.values(DB.figbest||{});return{done:d,total:t,mins7:weekMins(),streak:streak(),last:DB.last||1,mic:fb.length?Math.round(fb.reduce((a,b)=>a+b,0)/fb.length):null}}
async function cloudPush(now){
  if(!CLOUD.user)return;
  if(!now){clearTimeout(CLOUD.pushT);CLOUD.pushT=setTimeout(()=>cloudPush(true).catch(()=>{}),2500);return}
  const M=CLOUD.M,u=CLOUD.user,progress={};SYNC.forEach(k=>{if(DB[k]!=null)progress[k]=DB[k]});
  await M.setDoc(uref(),{name:u.displayName||u.email||'Sin nombre',email:u.email||'',photo:u.photoURL||'',updated:M.serverTimestamp(),progress,songs:DB.songs||[],onb:DB.onb||null,group:CLOUD.group||null},{mergeFields:['name','email','photo','updated','progress','songs','onb','group']});
  if(CLOUD.group)await M.setDoc(M.doc(CLOUD.db,'groups',CLOUD.group,'members',u.uid),{name:u.displayName||u.email||'Alumno',photo:u.photoURL||'',lastSeen:M.serverTimestamp(),stats:memberStats()},{merge:true});
}
const _localSave=save;save=function(){_localSave.apply(this,arguments);if(CLOUD.user)cloudPush()};
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
  for(let i=0;i<24;i++){const l=i%11+1;tiles.push(i%3===1?coverArt(H[i%12],ARTM[(i*5)%11+1],null,'w'+i):lessonArt(l))}
  document.body.insertAdjacentHTML('beforeend',`<div id="welcome" role="dialog" aria-modal="true" aria-labelledby="wtitle">
   <div class="wmos" aria-hidden="true">${tiles.map(t=>`<span class="acov">${t}</span>`).join('')}</div><div class="wfade" aria-hidden="true"></div>
   <div class="wbox"><span class="wlogo">${logo()}</span><h1 id="wtitle">Roka Guitar<br>for All</h1>
    <p class="wsub">Aprende guitarra viendo el mástil: lecciones, canciones con karaoke y una banda que te acompaña.</p>
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
   <div class="card"><h3>Progreso en la nube</h3><p class="cap" style="margin:4px 0 0">Se guarda solo cada vez que avanzas. Entra con la misma cuenta en otro dispositivo y verás el mismo progreso.</p><div class="row" style="margin-top:10px"><button class="btn sm" data-cl="out">Cerrar sesión</button></div></div>
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
   ${g.members.length?`<div class="cltable"><div class="clr h"><span>Alumno</span><span>Hechos</span><span>Min/sem</span><span>Racha</span></div>${g.members.sort((a,b)=>((b.stats||{}).mins7||0)-((a.stats||{}).mins7||0)).map(m=>{const s=m.stats||{};return`<div class="clr"><span class="clname">${esc(m.name||'Alumno')}<small>Lección ${s.last||1} · ${ago(m.lastSeen)}${s.mic!=null?' · mic '+s.mic+' %':''}</small></span><span>${s.done||0}/${s.total||ALLEX.length}</span><span>${s.mins7||0}</span><span>${s.streak||0} d</span></div>`}).join('')}</div>`:'<p class="cap">Comparte el código para que tus alumnos se unan.</p>'}</div>`).join('');
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
    else if(k==='out')busy(async()=>{await CLOUD.M.signOut(CLOUD.auth)});
    else if(k==='join')busy(async()=>{const n=await cloudJoin($('#clcode',r).value);toast(`Te uniste a la clase «${esc(n)}».`);cloudRefresh()});
    else if(k==='leave')busy(()=>cloudLeave());
    else if(k==='create')busy(async()=>{const n=$('#clgnew',r).value.trim();if(!n)throw{msg:'Ponle nombre a la clase.'};const c=await cloudCreateGroup(n);toast(`Clase creada. Código: ${c}`,5000);cloudRefresh()});
    else if(k==='copy'){const c=b.dataset.code,t=`Únete a mi clase en Roka Guitar for All: abre ${location.href.split('#')[0]}#/cuenta y escribe el código ${c}`;navigator.clipboard&&navigator.clipboard.writeText(t).then(()=>toast('Invitación copiada. Pégala en WhatsApp.'),()=>toast('Código: '+c,5000))}
  });
}
cloudInit();
