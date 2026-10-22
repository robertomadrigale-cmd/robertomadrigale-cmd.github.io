/* ---------- íconos ---------- */
const sv=(p,vb)=>`<svg viewBox="${vb||'0 0 24 24'}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const IC={
 home:sv('<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>'),
 book:sv('<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z"/><path d="M4 19V5"/><path d="M8 7h7"/>'),
 play2:sv('<path d="M6 21l4-18h4l4 18z"/><path d="M12 15l5-9"/><path d="M8 17h8"/>'),
 grid:sv('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'),
 back:sv('<path d="M15 5l-7 7 7 7"/>'),
 play:sv('<path d="M7 4l13 8-13 8z" fill="currentColor"/>'),
 stop:sv('<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>'),
 pause:sv('<path d="M8 5v14M16 5v14"/>'),
 timer:sv('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2"/><path d="M9 2h6"/>'),
 check:sv('<path d="M5 12l5 5 9-10"/>'),
 plus:sv('<path d="M12 5v14M5 12h14"/>'),
 minus:sv('<path d="M5 12h14"/>'),
 tuner:sv('<path d="M4 18a8 8 0 1116 0"/><path d="M12 18l4-7"/><circle cx="12" cy="18" r="1.5" fill="currentColor"/>'),
 game:sv('<rect x="3" y="7" width="18" height="10" rx="2"/><path d="M3 10h18M3 14h18M9 7v10M15 7v10"/>'),
 wave:sv('<path d="M2 12h3l2-6 4 12 3-9 2 3h6"/>'),
 cal:sv('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
 next:sv('<path d="M5 5l9 7-9 7z" fill="currentColor"/><path d="M19 5v14"/>'),
 x:sv('<path d="M6 6l12 12M18 6L6 18"/>'),
 pick:sv('<path d="M12 2.5c4 0 7.5 2 7.5 6 0 5-4 10-7.5 13-3.5-3-7.5-8-7.5-13 0-4 3.5-6 7.5-6z"/>'),
 down:sv('<path d="M12 4v12M6 11l6 6 6-6M5 20h14"/>'),
 drum:sv('<ellipse cx="12" cy="9" rx="8" ry="3"/><path d="M4 9v6c0 1.7 3.6 3 8 3s8-1.3 8-3V9"/><path d="M6 3l4 5M18 3l-4 5"/>'),
 target:sv('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>'),
 list:sv('<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/>'),
 band:sv('<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>'),
 up:sv('<path d="M6 15l6-6 6 6"/>'),
 dn:sv('<path d="M6 9l6 6 6-6"/>'),
 edit:sv('<path d="M4 20h4L19 9l-4-4L4 16z"/>')};
const fmt=s=>{s=Math.max(0,Math.round(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
const chipRow=(k,label,opts,cur)=>`<div><span class="cl">${label}</span><div class="chips">${opts.map(o=>`<button class="chip" data-set="${k}" data-v="${o.v}" aria-pressed="${String(o.v)===String(cur)}">${o.l}${o.s?`<i>${o.s}</i>`:''}</button>`).join('')}</div></div>`;
let OWNER='';
