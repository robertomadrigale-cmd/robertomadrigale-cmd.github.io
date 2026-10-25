/* ---------- utilidades, íconos, portadas y datos locales de Roka Estudio ---------- */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const sv=p=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const IC={play:sv('<path d="M7 4l13 8-13 8z" fill="currentColor"/>'),stop:sv('<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>'),rec:sv('<circle cx="12" cy="12" r="6" fill="currentColor"/>'),
 loop:sv('<path d="M17 2l3 3-3 3"/><path d="M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3"/><path d="M20 13v2a4 4 0 0 1-4 4H4"/>'),metro:sv('<path d="M6 21l4-18h4l4 18z"/><path d="M12 15l5-9"/><path d="M8 17h8"/>'),
 back:sv('<path d="M15 5l-7 7 7 7"/>'),plus:sv('<path d="M12 5v14M5 12h14"/>'),down:sv('<path d="M12 4v12M6 11l6 6 6-6M5 20h14"/>'),up:sv('<path d="M12 20V8M6 13l6-6 6 6M5 4h14"/>'),
 x:sv('<path d="M6 6l12 12M18 6L6 18"/>'),copy:sv('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16V6a2 2 0 0 1 2-2h10"/>'),cut:sv('<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.5 8.5L20 20M8.5 15.5L20 4"/>'),
 trash:sv('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),mic:sv('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'),file:sv('<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4"/>'),
 zin:sv('<circle cx="11" cy="11" r="7"/><path d="M11 8v6M8 11h6M21 21l-5-5"/>'),zout:sv('<circle cx="11" cy="11" r="7"/><path d="M8 11h6M21 21l-5-5"/>'),info:sv('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>'),
 save:sv('<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>'),music:sv('<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>')};
const logo=()=>omLogo({color:'#f5b43c'});
function coverArt(h,motif,uidk){const h2=(h+44)%360,g='ce'+uidk;
  return`<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><radialGradient id="${g}a" cx=".22" cy=".18" r=".95"><stop offset="0" stop-color="hsl(${h} 88% 62%)"/><stop offset=".55" stop-color="hsl(${h} 62% 30%)"/><stop offset="1" stop-color="hsl(${h} 55% 12%)"/></radialGradient><radialGradient id="${g}b" cx=".92" cy=".96" r=".75"><stop offset="0" stop-color="hsl(${h2} 92% 62% / .9)"/><stop offset="1" stop-color="hsl(${h2} 92% 50% / 0)"/></radialGradient></defs><rect width="100" height="100" fill="url(#${g}a)"/><rect width="100" height="100" fill="url(#${g}b)"/><g transform="translate(18 -2) scale(.8)" fill="none" stroke="#fff" stroke-width="2.4" stroke-opacity=".85" stroke-linecap="round">${motif}</g></svg>`}
const GEN_HUE={Regional:28,Tropical:150,'Romántico':330,Pop:218,Urbano:270,Rock:0,Jazz:190};
// motivo de cada beat: su línea de bombo y tarola dibujada
function beatMotif(b){const p=b.parts.A,L=b.beats*4;let s='';['k','s','h','m','r'].forEach((k,row)=>{const line=p[k];if(!line)return;for(let i=0;i<line.length;i++)if(line[i]!=='-')s+=`<circle cx="${8+i*84/L}" cy="${28+row*12}" r="${line[i]==='X'?3.2:2}" fill="#fff" stroke="none"/>`});return s||'<path d="M10 50h80"/>'}
const beatArt=b=>coverArt(GEN_HUE[b.gen]||218,beatMotif(b),'b'+b.id);
const fmtT=s=>{s=Math.max(0,s);const m=Math.floor(s/60),r=s-m*60;return String(m).padStart(2,'0')+':'+r.toFixed(3).padStart(6,'0')};
/* ---------- datos locales (preferencias) ---------- */
const DBK='roka-estudio:v1';
let DB={last:null,recOff:0,metro:false,count:true};
try{Object.assign(DB,JSON.parse(localStorage.getItem(DBK)||'{}'))}catch(e){}
function save(){try{localStorage.setItem(DBK,JSON.stringify(DB))}catch(e){}}
function toast(html,ms){let t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';t.setAttribute('role','status');document.body.appendChild(t)}t.innerHTML=html;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),ms||3200)}
const ROLES={bateria:{n:'Batería',c:'var(--c-bateria)'},bajo:{n:'Bajo',c:'var(--c-bajo)'},armonia:{n:'Armonía',c:'var(--c-armonia)'},metales:{n:'Metales',c:'var(--c-metales)'},voz:{n:'Grabación',c:'var(--c-voz)'},audio:{n:'Audio',c:'var(--c-audio)'}};
['pointerdown','keydown','touchend'].forEach(ev=>document.addEventListener(ev,()=>{try{unlockAudio()}catch(e){}},{capture:true,passive:true,once:false}));
