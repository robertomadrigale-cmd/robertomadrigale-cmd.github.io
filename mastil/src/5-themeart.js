/* ---------- arte por época: portadas abstractas (luz, color y un motivo geométrico), sin dibujos ---------- */
const W8=800,H14=1400;
const svgWrap=(body,defs)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W8} ${H14}" preserveAspectRatio="xMidYMid slice"><defs>${defs||''}<filter id="gr"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .05 0"/></filter></defs>${body}<rect width="${W8}" height="${H14}" filter="url(#gr)"/></svg>`;
// mancha de luz difusa: [x, y, radio, color, opacidad]
let BLOBN=0;
function blobs(list){let d='',b='';list.forEach(([x,y,r,c,o])=>{const id='b'+(BLOBN++);d+=`<radialGradient id="${id}"><stop offset="0" stop-color="${c}" stop-opacity="${o}"/><stop offset=".55" stop-color="${c}" stop-opacity="${o*.35}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;b+=`<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id})"/>`});return{d,b}}
function cover(bg,bl,motif,defs){const B=blobs(bl);return svgWrap(`<rect width="${W8}" height="${H14}" fill="${bg}"/>${B.b}${motif||''}`,B.d+(defs||''))}
const rings=(cx,cy,n,step,col,o)=>{let s='';for(let i=1;i<=n;i++)s+=`<circle cx="${cx}" cy="${cy}" r="${i*step}" fill="none" stroke="${col}" stroke-opacity="${o}" stroke-width="1.2"/>`;return s};
const waves=(y0,n,amp,col,o)=>{let s='';for(let k=0;k<n;k++){let d=`M-20 ${y0+k*26}`;for(let x=0;x<=840;x+=40)d+=` Q${x+20} ${y0+k*26+(x/40%2?amp:-amp)} ${x+40} ${y0+k*26}`;s+=`<path d="${d}" fill="none" stroke="${col}" stroke-opacity="${o}" stroke-width="1.4"/>`}return s};
const ART={
 rocknroll:()=>cover('#f6efe0',[[620,180,520,'#d7263d',.32],[120,520,480,'#0f8b8d',.26],[700,760,380,'#f2b134',.18]],rings(610,210,14,26,'#1d1a24',.08)),
 psico:()=>cover('#1a0b2e',[[160,120,560,'#ff3d9a',.42],[680,320,520,'#ff8a1f',.34],[380,720,520,'#7c3cff',.32],[720,40,300,'#9be15d',.16]],waves(120,10,22,'#fdeee0',.07)),
 estadio:()=>cover('#0d0b08',[[400,-60,700,'#ffd37a',.30],[120,420,380,'#d4a537',.16],[700,500,380,'#c8452c',.12]],
   [[200,-.38],[400,0],[600,.38]].map(([x,a])=>`<path d="M${x} -40 L${x+a*900-170} 1100 L${x+a*900+170} 1100 Z" fill="url(#bm)"/>`).join(''),
   `<linearGradient id="bm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe7a8" stop-opacity=".22"/><stop offset="1" stop-color="#ffe7a8" stop-opacity="0"/></linearGradient>`),
 punk:()=>cover('#0b0b0b',[[650,140,520,'#ff2d95',.38],[120,600,420,'#f5e400',.18]],`<rect width="800" height="900" fill="url(#ht)" opacity=".5"/>`,
   `<pattern id="ht" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="9" cy="9" r="2.2" fill="#ffffff" fill-opacity=".14"/></pattern>`),
 metal:()=>cover('#08090b',[[560,120,520,'#c9ced8',.20],[160,620,420,'#d3122c',.18]],`<path d="M-100 380 L900 -60 L900 60 L-100 500 Z" fill="url(#cr)"/><path d="M-100 560 L900 120 L900 150 L-100 590 Z" fill="#fff" fill-opacity=".04"/>`,
   `<linearGradient id="cr" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".10"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`),
 synth:()=>{let cut='';for(let i=0;i<6;i++){const y=330+i*26;cut+=`<rect x="200" y="${y}" width="400" height="${3+i*2.2}" fill="#0f0624"/>`}
   let g='';for(let i=-10;i<=10;i++)g+=`<line x1="${400+i*26}" y1="560" x2="${400+i*120}" y2="1000" stroke="#ff3ea5" stroke-opacity=".16"/>`;for(let j=0;j<8;j++){const y=560+j*j*7;g+=`<line x1="0" y1="${y}" x2="800" y2="${y}" stroke="#ff3ea5" stroke-opacity=".14"/>`}
   return cover('#0f0624',[[400,300,520,'#ff3ea5',.34],[100,80,360,'#2de2e6',.18],[700,620,380,'#7b3cff',.24]],`<circle cx="400" cy="330" r="190" fill="url(#sun)" opacity=".55"/>${cut}${g}`,
   `<linearGradient id="sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd36e"/><stop offset="1" stop-color="#ff3ea5"/></linearGradient>`)},
 rockmx:()=>cover('#0e0c0c',[[60,200,520,'#21a66a',.30],[760,220,520,'#e23b3b',.30],[400,40,320,'#f4ede6',.08]],rings(400,-40,9,60,'#f4ede6',.05)),
 grunge:()=>{let pl='';for(let x=0;x<800;x+=64)pl+=`<rect x="${x}" y="0" width="22" height="1400" fill="#d06a3a" fill-opacity=".04"/>`;for(let y=0;y<1400;y+=64)pl+=`<rect x="0" y="${y}" width="800" height="22" fill="#8fae45" fill-opacity=".035"/>`;
   return cover('#16140f',[[620,160,480,'#d06a3a',.26],[140,480,440,'#8fae45',.18]],pl)},
 blues:()=>cover('#0a1424',[[400,-40,600,'#c9a24a',.30],[120,520,460,'#3b6fd1',.20],[720,700,380,'#6fb2ff',.12]],waves(260,6,30,'#eef2f8',.05)),
 surf:()=>cover('#e9f6f4',[[660,120,420,'#ff6b4a',.30],[120,460,520,'#0a8f9c',.22]],waves(520,8,18,'#0a8f9c',.12)+`<circle cx="660" cy="150" r="110" fill="#ff6b4a" fill-opacity=".22"/>`),
 indie:()=>cover('#f3eef7',[[640,140,500,'#7c5cff',.26],[140,480,460,'#ff7a59',.20],[500,760,360,'#2f86c9',.12]],rings(140,160,8,34,'#2a2433',.06))
};
const ARTURL={};
Object.keys(ART).forEach(k=>{try{ARTURL[k]="url('data:image/svg+xml,"+encodeURIComponent(ART[k]()).replace(/'/g,'%27')+"')"}catch(e){}});
