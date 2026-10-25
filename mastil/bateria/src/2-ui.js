/* ---------- íconos (trazo 1.7, como en Roka Guitar) ---------- */
const sv=(p,vb)=>`<svg viewBox="${vb||'0 0 24 24'}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const IC={
 home:sv('<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>'),
 book:sv('<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z"/><path d="M4 19V5"/><path d="M8 7h7"/>'),
 mic:sv('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'),
 drum:sv('<path d="M5 4l7 5M19 4l-7 5"/><ellipse cx="12" cy="11" rx="8" ry="3"/><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>'),
 grid:sv('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'),
 back:sv('<path d="M15 5l-7 7 7 7"/>'),
 play:sv('<path d="M7 4l13 8-13 8z" fill="currentColor"/>'),
 stop:sv('<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>'),
 pause:sv('<path d="M8 5v14M16 5v14"/>'),
 check:sv('<path d="M5 12l5 5 9-10"/>'),
 plus:sv('<path d="M12 5v14M5 12h14"/>'),
 minus:sv('<path d="M5 12h14"/>'),
 target:sv('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1" fill="currentColor"/>'),
 metro:sv('<path d="M6 21l4-18h4l4 18z"/><path d="M12 15l5-9"/><path d="M8 17h8"/>'),
 band:sv('<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>'),
 cal:sv('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
 next:sv('<path d="M5 5l9 7-9 7z" fill="currentColor"/><path d="M19 5v14"/>'),
 x:sv('<path d="M6 6l12 12M18 6L6 18"/>'),
 sound:sv('<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12"/>'),
 down:sv('<path d="M12 4v12M6 11l6 6 6-6M5 20h14"/>'),
 up:sv('<path d="M6 15l6-6 6 6"/>'),dn:sv('<path d="M6 9l6 6 6-6"/>'),
 edit:sv('<path d="M4 20h4L19 9l-4-4L4 16z"/>'),
 list:sv('<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/>'),
 cog:sv('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>'),
 hand:sv('<path d="M8 13V5.5a1.5 1.5 0 013 0V12M11 11V4.5a1.5 1.5 0 013 0V12M14 11.5V6a1.5 1.5 0 013 0v8c0 4-2.5 7-6 7-2.5 0-4-1.2-5.5-3.5L3.8 14a1.5 1.5 0 012.5-1.6L8 15"/>'),
 redo:sv('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'),
 studio:sv('<path d="M4 20V10M9 20V4M14 20v-8M19 20V7"/>')};
const TI=d=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const TKIC={tempo:TI('<path d="M8 21h8l-1.5-15h-5z"/><path d="M12 14l5-9"/>'),meter:TI('<path d="M4 6h16M4 12h16M4 18h16"/><path d="M9 4v16"/>'),sub:TI('<path d="M8 18V6l8-2v12"/><circle cx="6" cy="18" r="2"/><circle cx="14" cy="16" r="2"/>'),eye:TI('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>'),
  mic:TI('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'),mode:TI('<path d="M4 12h4l3-7 3 14 3-7h3"/>'),tol:TI('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>'),key:TI('<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>'),
  style:TI('<path d="M4 20V10M9 20V4M14 20v-8M19 20V7"/>'),drum:TI('<ellipse cx="12" cy="9" rx="8" ry="3"/><path d="M4 9v6c0 1.7 3.6 3 8 3s8-1.3 8-3V9"/>'),gap:TI('<path d="M4 12h3M10 12h4M17 12h3"/>'),dur:TI('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>')};
const chipRow=(k,label,opts,cur)=>`<div><span class="cl">${label}</span><div class="chips">${opts.map(o=>`<button class="chip" data-set="${k}" data-v="${o.v}" aria-pressed="${String(o.v)===String(cur)}">${o.l}${o.s?`<i>${o.s}</i>`:''}</button>`).join('')}</div></div>`;
/* ---------- logo Om ---------- */
const logo=()=>omLogo({color:'#ff5a5a'});
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
const TART={metro:[352,'<path d="M34 84h32l-8-62H42z"/><path d="M50 64l18-34"/><circle cx="68" cy="30" r="4" fill="#fff" stroke="none"/>'],
  prec:[160,'<circle cx="50" cy="48" r="30"/><circle cx="50" cy="48" r="17" stroke-opacity=".6"/><circle cx="50" cy="48" r="4" fill="#fff" stroke="none"/><path d="M50 10v14M50 72v14M12 48h14M74 48h14"/>'],
  band:[28,'<path d="M24 74V34l48-10v40"/><circle cx="18" cy="74" r="7"/><circle cx="66" cy="64" r="7"/><path d="M24 46l48-10" stroke-opacity=".5"/>'],
  groove:[218,'<path d="M10 30h80M10 50h80M10 70h80" stroke-opacity=".35"/><circle cx="20" cy="70" r="5" fill="#fff"/><circle cx="50" cy="70" r="5" fill="#fff"/><circle cx="35" cy="50" r="5" fill="#fff"/><circle cx="65" cy="50" r="5" fill="#fff"/><circle cx="20" cy="30" r="3.5"/><circle cx="35" cy="30" r="3.5"/><circle cx="50" cy="30" r="3.5"/><circle cx="65" cy="30" r="3.5"/><circle cx="80" cy="30" r="3.5"/>'],
  rud:[262,'<path d="M18 22l30 46M82 22L52 68"/><ellipse cx="50" cy="74" rx="30" ry="8"/>'],
  setlist:[205,'<path d="M24 26h52M24 46h52M24 66h34"/><circle cx="14" cy="26" r="3" fill="#fff" stroke="none"/><circle cx="14" cy="46" r="3" fill="#fff" stroke="none"/><circle cx="14" cy="66" r="3" fill="#fff" stroke="none"/>']};
function toolHead(k,title,eyebrow,art){const[h,m]=art||TART[k];return`<div class="kamb tamb" style="--th:${h}" aria-hidden="true"></div><div class="khead"><span class="sart big tcov">${coverArt(h,m,null,'t'+k)}</span><div class="kht"><span class="eyebrow">${eyebrow}</span><h2>${title}</h2><small class="kmeta" id="tmeta"></small></div></div>`}
function toolBar(items){const n=items.length;return`<div class="ktools" role="toolbar" style="--nt:${n};--ntm:${n<=3?n:n===4?2:3}">${items.map(([k,l,ic])=>`<button class="ktool" data-panel="${k}" aria-pressed="false">${ic}<b id="tv-${k}"></b><small>${l}</small></button>`).join('')}</div>`}
function toolPanels(ps){return`<div class="kpanels card kctl" hidden>${ps.map(([k,t,h])=>`<div class="kpanel" data-p="${k}" hidden><div class="kph"><b>${t}</b><button class="kic" data-pclose aria-label="Cerrar">${IC.x}</button></div>${h}</div>`).join('')}</div>`}
const RMOT=matchMedia('(prefers-reduced-motion: reduce)');
// latido: el fondo de color y el botón redondo respiran con el pulso
function beatPulse(root,strong){
  if(RMOT.matches||document.hidden||!root)return;const a=root.querySelector('.kamb'),p=root.querySelector('.kplayb');
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
