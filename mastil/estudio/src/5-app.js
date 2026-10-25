/* ---------- rutas: #/ sesiones · #/s/<id> estudio · #/licencias · #/nueva?tono=La&bpm=92&genero=cumbia&desde=guitarra ---------- */
let UNMOUNT=null;
async function route(){
  const raw=location.hash.replace(/^#\/?/,''),[path,qs]=raw.split('?'),p=path.split('/'),q=new URLSearchParams(qs||'');
  if(p[0]==='nueva'){const k=parseKey(q.get('tono')),S=newSession({tono:k,bpm:+q.get('bpm')||null,genero:q.get('genero'),desde:q.get('desde')});await sesPut(S);location.replace('#/s/'+S.id+'?beats=1'+(S.genero?'&genero='+S.genero:''));return}
  const v=p[0]==='s'&&p[1]?viewStudio(p[1],q):p[0]==='licencias'?viewLicenses():viewHome();
  if(UNMOUNT){try{UNMOUNT()}catch(e){}UNMOUNT=null}
  const old=$('#app'),pg=old.cloneNode(false);old.replaceWith(pg);pg.innerHTML=v.html;
  document.title=p[0]==='s'?'Estudio · Roka Estudio':'Roka Estudio';
  if(v.mount)UNMOUNT=(await v.mount(pg))||null;
  if(q.get('genero')){const b=$(`[data-gen="${(beatById(q.get('genero'))||{}).gen}"]`,pg);if(b)b.click()}
}
document.body.insertAdjacentHTML('afterbegin','<div id="app"></div>');
window.addEventListener('hashchange',route);route();
if('serviceWorker' in navigator&&location.protocol!=='file:')addEventListener('load',()=>{navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(reg=>{const chk=()=>reg.update().catch(()=>{});document.addEventListener('visibilitychange',()=>{if(!document.hidden)chk()})}).catch(()=>{})});
