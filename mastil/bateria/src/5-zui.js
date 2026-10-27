Object.assign(IC,{
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
 studio:sv('<path d="M4 20V10M9 20V4M14 20v-8M19 20V7"/>')});
Object.assign(TART,{metro:[352,'<path d="M34 84h32l-8-62H42z"/><path d="M50 64l18-34"/><circle cx="68" cy="30" r="4" fill="#fff" stroke="none"/>'],
  prec:[160,'<circle cx="50" cy="48" r="30"/><circle cx="50" cy="48" r="17" stroke-opacity=".6"/><circle cx="50" cy="48" r="4" fill="#fff" stroke="none"/><path d="M50 10v14M50 72v14M12 48h14M74 48h14"/>'],
  band:[28,'<path d="M24 74V34l48-10v40"/><circle cx="18" cy="74" r="7"/><circle cx="66" cy="64" r="7"/><path d="M24 46l48-10" stroke-opacity=".5"/>'],
  groove:[218,'<path d="M10 30h80M10 50h80M10 70h80" stroke-opacity=".35"/><circle cx="20" cy="70" r="5" fill="#fff"/><circle cx="50" cy="70" r="5" fill="#fff"/><circle cx="35" cy="50" r="5" fill="#fff"/><circle cx="65" cy="50" r="5" fill="#fff"/><circle cx="20" cy="30" r="3.5"/><circle cx="35" cy="30" r="3.5"/><circle cx="50" cy="30" r="3.5"/><circle cx="65" cy="30" r="3.5"/><circle cx="80" cy="30" r="3.5"/>'],
  rud:[262,'<path d="M18 22l30 46M82 22L52 68"/><ellipse cx="50" cy="74" rx="30" ry="8"/>'],
  setlist:[205,'<path d="M24 26h52M24 46h52M24 66h34"/><circle cx="14" cy="26" r="3" fill="#fff" stroke="none"/><circle cx="14" cy="46" r="3" fill="#fff" stroke="none"/><circle cx="14" cy="66" r="3" fill="#fff" stroke="none"/>']});
Object.assign(TKIC,{gap:IC.pause,dur:IC.timer,drum:IC.drum});
for(const a of ACH){
 if(a[0]==='ojo')a[2]='Logra 10 aciertos al leer la rejilla.';
 if(a[0]==='mapa'){a[1]='La rejilla en la mente';a[2]='Logra 25 aciertos al leer la rejilla.'}
 if(a[0]==='graduado')a[1]='Curso completo';
}
