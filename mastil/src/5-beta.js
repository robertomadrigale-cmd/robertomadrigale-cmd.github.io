/* ---------- información de la beta y reporte sin datos personales ---------- */
const OM_BETA_VERSION='v__VER__';
let OM_LAST_ERROR='';
const OM_PREVIOUS_ONERROR=typeof window!=='undefined'?window.onerror:null;
if(typeof window!=='undefined')window.onerror=function(message,source,line,column,error){
  OM_LAST_ERROR=String(error&&error.message||message||'Error desconocido').slice(0,240);
  if(typeof OM_PREVIOUS_ONERROR==='function')return OM_PREVIOUS_ONERROR.apply(this,arguments);
};
function betaReport(app){
  const text=[`Reporte de ${app}`,`Versión: ${OM_BETA_VERSION}`,`Navegador: ${navigator.userAgent}`,`Ruta: ${location.pathname}${location.hash}`,`Pantalla: ${screen.width}×${screen.height} px`,`Último error: ${OM_LAST_ERROR||'ninguno capturado'}`].join('\n');
  if(navigator.clipboard)navigator.clipboard.writeText(text).catch(()=>{});
  const url='https://wa.me/?text='+encodeURIComponent(text),opened=window.open(url,'_blank','noopener');
  if(!opened)location.href=url;
}
function betaAbout(){return `<section class="card"><span class="eyebrow">Beta · ${OM_BETA_VERSION}</span><h2>Acerca de ${INST.nombre}</h2><p class="cap">Om · Centro de aprendizaje musical · ${automatiaMark()}</p><p class="cap">Sonidos: <a href="https://github.com/nbrosowsky/tonejs-instruments" target="_blank" rel="noopener">tonejs-instruments</a> (CC BY 3.0), <a href="https://www.bandshed.net/avldrumkits/" target="_blank" rel="noopener">AVL Drumkits Black Pearl</a> (CC BY-SA 3.0) y <a href="https://github.com/sgossner/VSCO-2-CE" target="_blank" rel="noopener">VSCO 2 CE</a> (CC0).</p><div class="row"><a class="btn" href="${INST.root}roka/?cambiar">Ver todas las apps Om</a><button class="btn" data-beta-report>Reportar un problema</button></div></section>`}
if(typeof document!=='undefined')document.addEventListener('click',e=>{if(e.target.closest('[data-beta-report]'))betaReport(INST.nombre)});
