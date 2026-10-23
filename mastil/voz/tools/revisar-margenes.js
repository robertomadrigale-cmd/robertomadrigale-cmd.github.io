// Revisa todas las pantallas buscando botones partidos, textos cortados y elementos fuera del margen.
// Uso: sirve la carpeta de la app (python -m http.server 8765 desde la raíz del repo ROKA GUITAR) y corre:
//   NODE_PATH=<carpeta global de npm>/node_modules node tools/revisar-margenes.js <ancho> <escala-de-texto>
// Ejemplos: 390 1.25 · 360 1.15 · 320 1 · 1280 1. Usa puppeteer; CHROME=<ruta a chrome.exe> si no encuentra el navegador.
const puppeteer=require('puppeteer');
(async()=>{const W=+process.argv[2],Z=+process.argv[3];const b=await puppeteer.launch({headless:'new',executablePath:process.env.CHROME||undefined});const p=await b.newPage();await p.setViewport({width:W,height:780});
await p.goto('http://localhost:8765/mastil/voz/');await p.evaluate(()=>localStorage.setItem('roka-couch-vocal:v1','{"onb":1}'));await p.reload();await new Promise(r=>setTimeout(r,500));
const R=new Set(['#/','#/lecciones','#/practicar','#/canciones']);
const issues=[];const visited=new Set();
while(true){const r=[...R].find(x=>!visited.has(x));if(!r)break;visited.add(r);
 await p.evaluate(h=>location.hash=h,r);await new Promise(x=>setTimeout(x,300));
 (await p.evaluate(()=>[...document.querySelectorAll('a[href^="#/"]')].map(a=>a.getAttribute('href')))).forEach(x=>{if(!/\/leccion\/\d+\/./.test(x))R.add(x)});
 // abre cada panel de la barra de íconos para revisarlo también
 await p.evaluate(()=>document.querySelectorAll('.ktool').forEach(b=>{const k=b.dataset.panel;const pn=document.querySelector(`.kpanel[data-p="${k}"]`);if(pn){pn.hidden=false;pn.closest('.kpanels').hidden=false}}));
 const found=await p.evaluate(({W,Z})=>{
  document.querySelectorAll('#page *').forEach(el=>{if(el.closest('svg')||el.dataset.zz)return;el.dataset.zz=1;const fs=parseFloat(getComputedStyle(el).fontSize);el.style.fontSize=(fs*Z)+'px'});
  window.dispatchEvent(new Event('resize'));const out=[];const vw=document.documentElement.clientWidth;
  if(document.documentElement.scrollWidth>vw+1)out.push('scroll horizontal de la página');
  const inScroll=el=>el.closest('.hscroll,.shelf,.rrows,[data-hscroll]');
  document.querySelectorAll('#page *').forEach(el=>{if(el.closest('svg'))return;const cs=getComputedStyle(el);if(cs.display==='none'||cs.visibility==='hidden')return;const rc=el.getBoundingClientRect();if(!rc.width)return;
   if(!inScroll(el)&&!el.closest('.kamb')&&(rc.right>vw+1||rc.left<-1))out.push('se sale del margen: <'+el.tagName.toLowerCase()+' class="'+el.className+'"> '+(el.textContent||'').trim().slice(0,40))});
  document.querySelectorAll('#page button,#page .btn,#page .chip').forEach(el=>{const cs=getComputedStyle(el);if(cs.display==='none')return;const rc=el.getBoundingClientRect();if(!rc.width)return;
   const lh=parseFloat(cs.fontSize)*1.45,pad=parseFloat(cs.paddingTop)+parseFloat(cs.paddingBottom);
   if(el.scrollWidth>el.clientWidth+2)out.push('texto cortado: '+el.textContent.trim().slice(0,40));
   if(rc.height-pad>lh*1.6&&!el.matches('.tool,.card,.ktool,.kplayb,.kic,.icon-btn'))out.push('botón en 2+ renglones o estirado: «'+el.textContent.trim().slice(0,40)+'» ('+Math.round(rc.height)+'px)');
  });
  return [...new Set(out)];},{W,Z});
 found.forEach(f=>issues.push(r+' → '+f));}
console.log('ancho',W,'texto x'+Z,'| pantallas:',visited.size,'| problemas:',issues.length);console.log(issues.slice(0,120).join('\n'));await b.close()})();
