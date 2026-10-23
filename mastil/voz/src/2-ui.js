/* ---------- íconos (trazo 1.7, como en Roka Guitar) ---------- */
const sv=(p,vb)=>`<svg viewBox="${vb||'0 0 24 24'}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const IC={
 home:sv('<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>'),
 book:sv('<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z"/><path d="M4 19V5"/><path d="M8 7h7"/>'),
 mic:sv('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'),
 note:sv('<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>'),
 back:sv('<path d="M15 5l-7 7 7 7"/>'),
 play:sv('<path d="M7 4l13 8-13 8z" fill="currentColor"/>'),
 stop:sv('<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>'),
 pause:sv('<path d="M8 5v14M16 5v14"/>'),
 check:sv('<path d="M5 12l5 5 9-10"/>'),
 plus:sv('<path d="M12 5v14M5 12h14"/>'),
 minus:sv('<path d="M5 12h14"/>'),
 tuner:sv('<path d="M4 18a8 8 0 1116 0"/><path d="M12 18l4-7"/><circle cx="12" cy="18" r="1.5" fill="currentColor"/>'),
 wave:sv('<path d="M2 12h3l2-6 4 12 3-9 2 3h6"/>'),
 range:sv('<path d="M12 3v18"/><path d="M8 7l4-4 4 4M8 17l4 4 4-4"/>'),
 lungs:sv('<path d="M12 4v8"/><path d="M12 12c-1.5-1-3-1.5-3-4"/><path d="M12 12c1.5-1 3-1.5 3-4"/><path d="M9 8C6 8 4 13 4 17c0 2 1 3 3 3 2.5 0 3-2 3-4v-4"/><path d="M15 8c3 0 5 5 5 9 0 2-1 3-3 3-2.5 0-3-2-3-4v-4"/>'),
 metro:sv('<path d="M6 21l4-18h4l4 18z"/><path d="M12 15l5-9"/><path d="M8 17h8"/>'),
 cal:sv('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
 next:sv('<path d="M5 5l9 7-9 7z" fill="currentColor"/><path d="M19 5v14"/>'),
 x:sv('<path d="M6 6l12 12M18 6L6 18"/>'),
 voice:sv('<path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2"/>'),
 sound:sv('<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12"/>'),
 mute:sv('<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/>'),
 pulseflash:sv('<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/><circle cx="12" cy="12" r="3"/>'),
 down:sv('<path d="M12 4v12M6 11l6 6 6-6M5 20h14"/>'),
 grid:sv('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'),
 redo:sv('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>')};
const TI=d=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const TKIC={tempo:TI('<path d="M8 21h8l-1.5-15h-5z"/><path d="M12 14l5-9"/>'),meter:TI('<path d="M4 6h16M4 12h16M4 18h16"/><path d="M9 4v16"/>'),sub:TI('<path d="M8 18V6l8-2v12"/><circle cx="6" cy="18" r="2"/><circle cx="14" cy="16" r="2"/>'),eye:TI('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>'),
  mic:TI('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'),mode:TI('<path d="M4 12h4l3-7 3 14 3-7h3"/>'),tol:TI('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>'),key:TI('<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>'),
  dir:TI('<path d="M7 17l5-10 5 10"/>'),ref:TI('<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/>'),guide:TI('<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 010 7"/>')};
const chipRow=(k,label,opts,cur)=>`<div><span class="cl">${label}</span><div class="chips">${opts.map(o=>`<button class="chip" data-set="${k}" data-v="${o.v}" aria-pressed="${String(o.v)===String(cur)}">${o.l}${o.s?`<i>${o.s}</i>`:''}</button>`).join('')}</div></div>`;
/* ---------- logo: micrófono sobre ondas, azul a rosa ---------- */
let LGN=0;
const logo=()=>{const id='lgv'+(++LGN);return`<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5b9cff"/><stop offset=".55" stop-color="#2f7bff"/><stop offset="1" stop-color="#ff4fa3"/></linearGradient></defs><rect x="4" y="4" width="56" height="56" rx="16" fill="url(#${id})"/><rect x="25" y="13" width="14" height="25" rx="7" fill="#fff"/><path d="M19 32a13 13 0 0 0 26 0M32 45v7M25 52h14" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/></svg>`};
/* ---------- portadas abstractas (luz difusa + trazo + número), como los discos de Roka Guitar ---------- */
function coverArt(h,motif,label,uid){
  const h2=(h+44)%360,g='ca'+uid;
  return`<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><radialGradient id="${g}a" cx=".22" cy=".18" r=".95"><stop offset="0" stop-color="hsl(${h} 88% 62%)"/><stop offset=".55" stop-color="hsl(${h} 62% 30%)"/><stop offset="1" stop-color="hsl(${h} 55% 12%)"/></radialGradient><radialGradient id="${g}b" cx=".92" cy=".96" r=".75"><stop offset="0" stop-color="hsl(${h2} 92% 62% / .9)"/><stop offset="1" stop-color="hsl(${h2} 92% 50% / 0)"/></radialGradient></defs>
  <rect width="100" height="100" fill="url(#${g}a)"/><rect width="100" height="100" fill="url(#${g}b)"/>
  <g transform="translate(18 -2) scale(.8)" fill="none" stroke="#fff" stroke-width="2" stroke-opacity=".8" stroke-linecap="round" stroke-linejoin="round">${motif||''}</g>
  ${label!=null?`<text x="8" y="93" font-size="30" font-weight="800" fill="#fff" font-family="system-ui,-apple-system,Segoe UI,sans-serif" letter-spacing="-1">${label}</text>`:''}</svg>`;
}
function albCard(href,art,title,sub,pct,done){
  return`<a class="alb${done?' done':''}" href="${href}"><span class="acov">${art}${done?`<span class="aok">${IC.check}</span>`:''}</span><b>${title}</b><small>${sub}</small>${pct!=null?`<span class="pg"><i style="width:${Math.round(pct*100)}%"></i></span>`:''}</a>`;
}
// portadas de las herramientas: [tono, motivo]
const TART={tuner:[218,'<path d="M8 60c10-22 18-30 26-18s14 16 22 2 14-20 34-12"/><circle cx="56" cy="44" r="4" fill="#fff" stroke="none"/>'],
  range:[262,'<path d="M50 14v68"/><path d="M38 26l12-12 12 12M38 70l12 12 12-12"/><path d="M28 48h44" stroke-opacity=".5"/>'],
  breath:[180,'<circle cx="50" cy="48" r="12"/><circle cx="50" cy="48" r="22" stroke-opacity=".6"/><circle cx="50" cy="48" r="32" stroke-opacity=".3"/>'],
  metro:[352,'<path d="M34 84h32l-8-62H42z"/><path d="M50 64l18-34"/><circle cx="68" cy="30" r="4" fill="#fff" stroke="none"/>'],
  rt:[205,'<circle cx="50" cy="48" r="28"/><path d="M50 30v18l12 8"/>'],
  song:[328,'<path d="M30 70V30l40-8v40"/><circle cx="24" cy="70" r="7"/><circle cx="64" cy="62" r="7"/>']};
function toolHead(k,title,eyebrow,art){const[h,m]=art||TART[k];return`<div class="kamb tamb" style="--th:${h}" aria-hidden="true"></div><div class="khead"><span class="sart big tcov">${coverArt(h,m,null,'t'+k)}</span><div class="kht"><span class="eyebrow">${eyebrow}</span><h2>${title}</h2><small class="kmeta" id="tmeta"></small></div></div>`}
function toolBar(items){const n=items.length;return`<div class="ktools" role="toolbar" style="--nt:${n};--ntm:${n<=3?n:n===4?2:3}">${items.map(([k,l,ic])=>`<button class="ktool" data-panel="${k}" aria-pressed="false">${ic}<b id="tv-${k}"></b><small>${l}</small></button>`).join('')}</div>`}
function toolPanels(ps){return`<div class="kpanels card kctl" hidden>${ps.map(([k,t,h])=>`<div class="kpanel" data-p="${k}" hidden><div class="kph"><b>${t}</b><button class="kic" data-pclose aria-label="Cerrar">${IC.x}</button></div>${h}</div>`).join('')}</div>`}
const RMOT=matchMedia('(prefers-reduced-motion: reduce)');
// latido: el fondo de color y el botón redondo respiran con el pulso
function beatPulse(root,strong){
  if(RMOT.matches||document.hidden)return;const a=root.querySelector('.kamb'),p=root.querySelector('.kplayb');
  if(a&&a.animate)a.animate([{opacity:strong?.9:.72,transform:`scale(${strong?1.07:1.04})`},{opacity:.45,transform:'scale(1)'}],{duration:strong?560:400,easing:'cubic-bezier(.2,.7,.3,1)'});
  if(p&&p.animate)p.animate([{transform:`scale(${strong?1.09:1.05})`},{transform:'scale(1)'}],{duration:strong?300:240,easing:'ease-out'});
}
const toolDock=inner=>`<div class="kbar tdock"><div class="kbrow">${inner}</div></div>`;
const playLbl=(on,l1,l2,i1,i2)=>`${on?(i2||IC.stop):(i1||IC.play)}<span>${on?l2:l1}</span>`;
function toolMount(r,vals){
  const openP=k=>{const box=$('.kpanels',r);if(!box)return;const cur=box.hidden?null:box.dataset.open;$$('.ktool',r).forEach(b=>b.setAttribute('aria-pressed','false'));
    if(!k||cur===k){box.hidden=true;box.dataset.open='';return}box.hidden=false;box.dataset.open=k;$$('.kpanel',r).forEach(p=>p.hidden=p.dataset.p!==k);$(`.ktool[data-panel="${k}"]`,r).setAttribute('aria-pressed','true')};
  const paint=()=>{const v=vals();for(const k in v){const e=k==='meta'?$('#tmeta',r):$('#tv-'+k,r);if(e)e.textContent=v[k]}};
  r.addEventListener('click',e=>{const pb=e.target.closest('[data-panel]');if(pb){openP(pb.dataset.panel);return}if(e.target.closest('[data-pclose]')){openP(null);return}setTimeout(paint,0)});
  paint();return paint;
}
