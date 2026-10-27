/* Estado exclusivo de Bajo. El adaptador léxico evita escribir en el caché de Estudio. */
const caches=globalThis.caches?{open:name=>globalThis.caches.open(name==='roka-estudio-muestras-v1'?'roka-bajo-muestras-v1':name)}:null;
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const DBK='roka-bajo:v1';
const DB={strings:4,lefty:false,theme:'estudio',done:{},figbest:{},retobest:{},bpm:{},last:1,met:80,meter:4,mute:false};
try{const d=JSON.parse(localStorage.getItem(DBK)||'{}');if(d&&typeof d==='object')Object.assign(DB,d)}catch(_){}
DB.strings=DB.strings===5?5:4;
for(const k of ['done','figbest','retobest','bpm'])if(!DB[k]||typeof DB[k]!=='object'||Array.isArray(DB[k]))DB[k]={};
function save(){try{localStorage.setItem(DBK,JSON.stringify(DB))}catch(_){toast('No se pudo guardar tu avance en este navegador.')}}
function toast(t){const el=$('#notice');if(el){el.textContent=t;clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.textContent='',6500)}}
const m2f=m=>440*2**((m-69)/12),f2m=f=>69+12*Math.log2(f/440);
const nn=m=>noteName(m)+String(Math.floor(m/12)-1);
function recordResult(id,pct,kind='figbest'){DB[kind][id]=Math.max(DB[kind][id]||0,pct);if(kind==='figbest'&&pct>=80)DB.done[id]=true;save()}
let artID=0;
function coverArt(hue=220,motif=0){const id='art'+(++artID);return `<svg viewBox="0 0 240 240" aria-hidden="true"><defs><radialGradient id="${id}"><stop stop-color="hsl(${hue} 90% 60%)"/><stop offset="1" stop-color="#10121e"/></radialGradient></defs><rect width="240" height="240" fill="url(#${id})"/><circle cx="120" cy="120" r="83" fill="#000" opacity=".35"/>${[75,57,39,21].map(r=>`<circle cx="120" cy="120" r="${r}" fill="none" stroke="#fff" stroke-opacity=".22"/>`).join('')}<g transform="rotate(${motif*17-25} 120 120)" stroke-linecap="round">${[0,1,2,3].map(i=>`<path d="M${72+i*32} 28V212" stroke="${i===motif%4?'#ff66af':'#c9ddff'}" stroke-width="${8-i}"/>`).join('')}</g><circle cx="120" cy="120" r="7" fill="#0a0c15"/></svg>`}
function toolHead(title,sub,hue=220){return `<header class="toolhead"><div class="toolart">${coverArt(hue,2)}</div><div><p class="eyebrow">OM BAJO / PRÁCTICA</p><h1>${title}</h1><p>${sub}</p></div></header>`}
function toolDock(label='Empezar'){return `<div class="dock"><button class="primary" id="go">${label}</button><button data-stop>Detener</button><span id="status" role="status"></span></div>`}
function control(label,id,options,value){return `<label>${label}<select id="${id}">${options.map(([v,t])=>`<option value="${esc(v)}"${String(v)===String(value)?' selected':''}>${esc(t)}</option>`).join('')}</select></label>`}
// Marca Om (usa omLogo/automatiaMark de ../comun/src/7-marca.js si existe; si no, texto)
const OM_GREEN='#34d399';
function omBrand(size=26){return typeof omLogo==='function'?omLogo({color:OM_GREEN,size}):'<b class="omword">om</b>'}
function byMark(){return typeof automatiaMark==='function'?automatiaMark():'<span class="amark">by Automat<span class="ia">IA</span></span>'}
