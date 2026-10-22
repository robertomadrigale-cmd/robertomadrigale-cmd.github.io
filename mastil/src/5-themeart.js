/* ---------- arte de fondo por época: ilustraciones originales en SVG, semitransparentes ---------- */
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const W8=800,H14=1400;
const svgWrap=(body,defs)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W8} ${H14}" preserveAspectRatio="xMidYMid slice"><defs>${defs||''}</defs>${body}</svg>`;
const GRAIN=(o)=>`<filter id="gr"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 ${o} 0"/></filter>`;
const grainRect='<rect width="800" height="1400" filter="url(#gr)"/>';
function halftone(x,y,w,h,step,col,maxr,dir){let s='';for(let j=0;j<h;j+=step)for(let i=0;i<w;i+=step){const k=dir==='v'?j/h:(i/w+j/h)/2,r=Math.max(0,maxr*(1-k));if(r>.4)s+=`<circle cx="${x+i}" cy="${y+j}" r="${r.toFixed(1)}"/>`}return`<g fill="${col}">${s}</g>`}
const ART={
 punk(){
  const R=rng(77),letters='HAZLO TÚ MISMO'.split(''),pal=['#ff2d95','#f5e400','#fafafa','#29c5f6'];let col='';let x=60,y=210;
  letters.forEach((ch,i)=>{if(ch===' '){x+=26;if(i===5){x=110;y+=150}return}const w=78+R()*26,h=96+R()*24,rot=(R()-.5)*18,bg=pal[Math.floor(R()*pal.length)],fg=bg==='#fafafa'||bg==='#f5e400'?'#111':'#fafafa',fs=['Impact,Arial Black,sans-serif','Georgia,serif','Courier New,monospace','Arial Black,sans-serif'][Math.floor(R()*4)];
   col+=`<g transform="translate(${x} ${y}) rotate(${rot.toFixed(1)})" opacity=".6"><rect x="-6" y="-${h*.8}" width="${w}" height="${h}" fill="${bg}"/><text x="${w/2-6}" y="${h*.08}" font-family="${fs}" font-size="${h*.78}" font-weight="900" text-anchor="middle" fill="${fg}">${ch}</text></g>`;x+=w+8});
  const pin=(px,py,r)=>`<g transform="translate(${px} ${py}) rotate(${r})" fill="none" stroke="#d8d8d8" stroke-width="7" stroke-linecap="round" opacity=".75"><path d="M0 0 L190 0 Q222 0 222 22 Q222 44 190 44 L30 44"/><path d="M0 0 Q-24 22 0 44" /><rect x="-30" y="-14" width="46" height="72" rx="10" fill="#b8b8b8" stroke="none"/></g>`;
  const tape=(tx,ty,r,c)=>`<rect x="${tx}" y="${ty}" width="210" height="46" fill="${c}" opacity=".35" transform="rotate(${r} ${tx} ${ty})"/>`;
  let spl='';for(let i=0;i<70;i++){const a=R()*6.28,d=R()*170;spl+=`<circle cx="${(620+Math.cos(a)*d).toFixed(0)}" cy="${(1080+Math.sin(a)*d).toFixed(0)}" r="${(R()*9+1).toFixed(1)}"/>`}
  return svgWrap(`${halftone(0,0,800,700,22,'#ff2d95',8,'v')}<g opacity=".5">${halftone(380,850,420,550,18,'#fafafa',6)}</g>
   <path d="M0 640 L120 610 L210 660 L330 600 L470 655 L600 615 L800 650 L800 760 L0 760Z" fill="#f5e400" opacity=".22"/>
   ${col}${pin(470,90,-24)}${pin(90,1190,14)}${tape(560,560,18,'#f5e400')}${tape(40,820,-12,'#ff2d95')}${tape(420,1300,-6,'#fafafa')}
   <g fill="#ff2d95" opacity=".55">${spl}</g>
   <path d="M120 980 l40 -60 l18 52 l36 -80 l14 70 l30 -50 l-8 120 l-140 -10z" fill="#fafafa" opacity=".18"/>
   ${grainRect}`,GRAIN(.18));
 },
 rocknroll(){
  const R=rng(5);let disc='';
  [[640,230,150],[150,560,110],[690,880,95]].forEach(([x,y,r])=>{let g='';for(let k=r*.42;k<r;k+=6)g+=`<circle cx="${x}" cy="${y}" r="${k}" fill="none" stroke="#1d1a24" stroke-opacity=".18" stroke-width="1.2"/>`;disc+=`<circle cx="${x}" cy="${y}" r="${r}" fill="#1d1a24" opacity=".12"/>${g}<circle cx="${x}" cy="${y}" r="${r*.34}" fill="#d7263d" opacity=".4"/><circle cx="${x}" cy="${y}" r="5" fill="#f6efe0"/>`});
  let tiles='';for(let j=0;j<8;j++)for(let i=-4;i<12;i++){if((i+j)%2)continue;const y0=1000+j*j*7+j*14,y1=1000+(j+1)*(j+1)*7+(j+1)*14,sp=(y)=>.6+(y-1000)/400;const x0=400+(i*80-400)*sp(y0),x1=400+((i+1)*80-400)*sp(y0),x2=400+((i+1)*80-400)*sp(y1),x3=400+(i*80-400)*sp(y1);tiles+=`<path d="M${x0} ${y0}L${x1} ${y0}L${x2} ${y1}L${x3} ${y1}Z"/>`}
  let stars='';for(let i=0;i<9;i++){const x=R()*760+20,y=R()*900+40,s=12+R()*22;stars+=`<path transform="translate(${x.toFixed(0)} ${y.toFixed(0)})" d="M0 -${s}L${s*.18} -${s*.18}L${s} 0L${s*.18} ${s*.18}L0 ${s}L-${s*.18} ${s*.18}L-${s} 0L-${s*.18} -${s*.18}Z"/>`}
  return svgWrap(`<path d="M120 1000 L120 420 A280 280 0 0 1 680 420 L680 1000" fill="none" stroke="#d7263d" stroke-opacity=".22" stroke-width="36"/><path d="M175 1000 L175 430 A225 225 0 0 1 625 430 L625 1000" fill="none" stroke="#0f8b8d" stroke-opacity=".18" stroke-width="14"/>
   ${disc}<g fill="#1d1a24" opacity=".1">${tiles}</g><g fill="#0f8b8d" opacity=".3">${stars}</g>`);
 },
 psico(){
  let rings='';const cols=['#ff3d9a','#ff8a1f','#9be15d','#5ee0e6','#ffd84d'];
  for(let k=0;k<14;k++){const r=90+k*58;let d='';for(let a=0;a<=360;a+=6){const rr=r+Math.sin(a*Math.PI/180*7+k)*18,x=120+Math.cos(a*Math.PI/180)*rr,y=1250+Math.sin(a*Math.PI/180)*rr;d+=(a?'L':'M')+x.toFixed(1)+' '+y.toFixed(1)}rings+=`<path d="${d}Z" fill="none" stroke="${cols[k%5]}" stroke-width="22" stroke-opacity=".28"/>`}
  const flower=(x,y,s,c)=>{let p='';for(let i=0;i<8;i++)p+=`<ellipse cx="0" cy="-${s}" rx="${s*.42}" ry="${s*.8}" transform="rotate(${i*45})"/>`;return`<g transform="translate(${x} ${y})" fill="${c}" opacity=".42">${p}<circle r="${s*.45}" fill="#ffd84d"/></g>`};
  return svgWrap(`${rings}${flower(640,220,70,'#ff3d9a')}${flower(560,520,38,'#5ee0e6')}${flower(160,330,48,'#ff8a1f')}${flower(700,760,30,'#9be15d')}
   <circle cx="660" cy="220" r="320" fill="url(#pg)"/>`,`<radialGradient id="pg"><stop offset="0" stop-color="#ff3d9a" stop-opacity=".25"/><stop offset="1" stop-color="#ff3d9a" stop-opacity="0"/></radialGradient>`);
 },
 estadio(){
  const R=rng(11);let beams='';[[120,-.35],[300,-.12],[500,.12],[680,.33]].forEach(([x,a])=>{beams+=`<path d="M${x} 0 L${x-160+a*500} 1000 L${x+160+a*500} 1000Z" fill="url(#bm)"/>`});
  let crowd='';for(let x=-20;x<820;x+=34){const h=60+R()*50,arm=R()>.55;crowd+=`<ellipse cx="${x}" cy="${1290-h}" rx="17" ry="20"/><rect x="${x-22}" y="${1300-h}" width="44" height="${h+110}" rx="18"/>${arm?`<path d="M${x+12} ${1290-h} l${18+R()*14} -${90+R()*50}" stroke="#000" stroke-width="13" stroke-linecap="round"/>`:''}`}
  let bok='';for(let i=0;i<26;i++)bok+=`<circle cx="${(R()*800).toFixed(0)}" cy="${(R()*700).toFixed(0)}" r="${(R()*18+4).toFixed(0)}" fill="#ffe296" opacity="${(R()*.25+.05).toFixed(2)}"/>`;
  return svgWrap(`${beams}${bok}<rect x="0" y="34" width="800" height="18" fill="#d4a537" opacity=".25"/><g fill="#d4a537" opacity=".5">${[60,190,330,470,610,740].map(x=>`<circle cx="${x}" cy="44" r="16"/>`).join('')}</g><g fill="#000" opacity=".55">${crowd}</g>`,
   `<linearGradient id="bm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe296" stop-opacity=".32"/><stop offset="1" stop-color="#ffe296" stop-opacity="0"/></linearGradient>`);
 },
 metal(){
  const R=rng(23);let fl='';for(let k=0;k<3;k++){let d='M0 1400 ';for(let x=0;x<=800;x+=40){const h=180+R()*260-k*60;d+=`Q${x+20} ${1400-h-60} ${x+40} ${1400-h*(.4+R()*.3)} `}d+='L800 1400Z';fl+=`<path d="${d}" fill="${['#7a0010','#d3122c','#ff7a1a'][k]}" opacity="${[.45,.35,.25][k]}"/>`}
  const bolt=(x,y,s,r)=>`<path transform="translate(${x} ${y}) rotate(${r}) scale(${s})" d="M40 0 L0 110 L36 110 L10 220 L90 80 L52 80 L80 0Z" fill="url(#ch)" stroke="#fff" stroke-opacity=".25"/>`;
  let shards='';for(let i=0;i<14;i++){const x=R()*800,y=R()*900;shards+=`<path d="M${x.toFixed(0)} ${y.toFixed(0)} l${(R()*60-30).toFixed(0)} ${(R()*140+40).toFixed(0)} l${(R()*30+10).toFixed(0)} -${(R()*40).toFixed(0)}z" fill="#c9ced8" opacity="${(R()*.12+.04).toFixed(2)}"/>`}
  return svgWrap(`${shards}${bolt(560,120,1.6,12)}${bolt(110,520,.9,-14)}<path d="M0 0 L800 0 L800 40 ${Array.from({length:20},(_,i)=>`L${800-i*40-20} ${70+(i%2)*40} L${800-i*40-40} 40`).join(' ')} L0 40Z" fill="#c9ced8" opacity=".12"/>${fl}`,
   `<linearGradient id="ch" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".55"/><stop offset=".5" stop-color="#8e96a5" stop-opacity=".35"/><stop offset="1" stop-color="#ffffff" stop-opacity=".5"/></linearGradient>`);
 },
 synth(){
  let grid='';for(let i=-16;i<=16;i++)grid+=`<line x1="${400+i*30}" y1="900" x2="${400+i*190}" y2="1400"/>`;for(let j=0;j<14;j++){const y=900+Math.pow(j/13,2.2)*500;grid+=`<line x1="0" y1="${y.toFixed(1)}" x2="800" y2="${y.toFixed(1)}"/>`}
  let cut='';for(let i=0;i<7;i++){const y=700+i*30;cut+=`<rect x="160" y="${y}" width="480" height="${4+i*2.4}" fill="#0f0624"/>`}
  const palm=(x,s,f)=>`<g transform="translate(${x} 900) scale(${f*s} ${s})" fill="#0f0624" opacity=".9"><path d="M-6 0 Q-14 -160 4 -300 L12 -300 Q0 -160 8 0Z"/>${[-70,-35,0,35,70,110].map(a=>`<path transform="translate(8 -300) rotate(${a})" d="M0 0 Q60 -40 150 10 Q70 -10 0 6Z"/>`).join('')}</g>`;
  return svgWrap(`<circle cx="400" cy="680" r="250" fill="url(#sun)"/>${cut}<path d="M0 900 L120 760 L210 840 L330 700 L420 830 L540 720 L660 840 L800 740 L800 900Z" fill="#251450" opacity=".85"/><g stroke="#2de2e6" stroke-opacity=".35" stroke-width="1.5">${grid}</g>${palm(90,1,1)}${palm(720,.8,-1)}<rect width="800" height="900" fill="url(#sky)"/>`,
   `<linearGradient id="sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd84d" stop-opacity=".75"/><stop offset=".6" stop-color="#ff3ea5" stop-opacity=".6"/><stop offset="1" stop-color="#ff3ea5" stop-opacity=".2"/></linearGradient><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2de2e6" stop-opacity=".08"/><stop offset="1" stop-color="#ff3ea5" stop-opacity=".06"/></linearGradient>`);
 },
 rockmx(){
  const R=rng(31),cols=['#e23b3b','#f4ede6','#21a66a','#f2b134','#c04bd6'];let pp='';
  for(let row=0;row<2;row++){const y0=60+row*230;pp+=`<path d="M0 ${y0} Q400 ${y0+40} 800 ${y0}" stroke="#f4ede6" stroke-opacity=".3" fill="none" stroke-width="2"/>`;for(let i=0;i<6;i++){const x=10+i*134,c=cols[(i+row*2)%5];let holes='';for(let k=0;k<5;k++)holes+=`<path transform="translate(${x+20+(k%3)*30} ${y0+40+Math.floor(k/3)*50})" d="M10 0 L20 10 L10 20 L0 10Z" fill="#0e0c0c"/>`;pp+=`<g opacity=".42"><path d="M${x} ${y0+6} L${x+124} ${y0+6} L${x+124} ${y0+150} ${Array.from({length:8},(_,k)=>`L${x+124-k*15.5-7.7} ${y0+150+(k%2?0:18)}`).join(' ')} L${x} ${y0+150}Z" fill="${c}"/>${holes}<circle cx="${x+62}" cy="${y0+125}" r="9" fill="#0e0c0c"/></g>`}}
  const guitar=`<g transform="translate(560 760) rotate(-28)" fill="#f4ede6" opacity=".14"><rect x="-14" y="-430" width="28" height="360" rx="6"/><rect x="-24" y="-500" width="48" height="80" rx="10"/><path d="M0 -80 C120 -90 130 30 70 60 C140 120 110 260 0 260 C-110 260 -140 120 -70 60 C-130 30 -120 -90 0 -80Z"/><circle cy="40" r="34" fill="#0e0c0c"/></g>`;
  let amp='';for(let j=0;j<10;j++)for(let i=0;i<12;i++)amp+=`<circle cx="${60+i*24}" cy="${1020+j*24}" r="7"/>`;
  return svgWrap(`${pp}${guitar}<rect x="36" y="990" width="320" height="290" rx="18" fill="none" stroke="#f4ede6" stroke-opacity=".18" stroke-width="10"/><g fill="#e23b3b" opacity=".2">${amp}</g>`);
 },
 grunge(){
  const R=rng(41);let plaid='';for(let i=0;i<800;i+=64)plaid+=`<rect x="${i}" y="0" width="22" height="1400" fill="#d06a3a" opacity=".07"/><rect x="${i+30}" y="0" width="6" height="1400" fill="#8fae45" opacity=".07"/>`;for(let j=0;j<1400;j+=64)plaid+=`<rect x="0" y="${j}" width="800" height="22" fill="#d06a3a" opacity=".07"/><rect x="0" y="${j+30}" width="800" height="6" fill="#8fae45" opacity=".06"/>`;
  const stain=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#6b4a2a" stroke-opacity=".35" stroke-width="${r*.08}"/><circle cx="${x+6}" cy="${y-4}" r="${r*.93}" fill="none" stroke="#6b4a2a" stroke-opacity=".15" stroke-width="3"/>`;
  let scr='';for(let k=0;k<5;k++){let d=`M${(R()*700).toFixed(0)} ${(R()*1300).toFixed(0)}`;for(let i=0;i<14;i++)d+=` q${(R()*80-40).toFixed(0)} ${(R()*80-40).toFixed(0)} ${(R()*90-45).toFixed(0)} ${(R()*60-30).toFixed(0)}`;scr+=`<path d="${d}" fill="none" stroke="#ece4d2" stroke-opacity=".16" stroke-width="3"/>`}
  const cas=`<g transform="translate(470 980) rotate(-8)" fill="none" stroke="#ece4d2" stroke-opacity=".22" stroke-width="6"><rect width="280" height="175" rx="14"/><rect x="40" y="30" width="200" height="70" rx="8"/><circle cx="90" cy="65" r="22"/><circle cx="190" cy="65" r="22"/><path d="M60 175 L80 130 L200 130 L220 175"/></g>`;
  return svgWrap(`${plaid}${stain(200,300,120)}${stain(640,650,80)}${scr}${cas}${grainRect}`,GRAIN(.22));
 },
 blues(){
  const R=rng(51);let bricks='';for(let j=0;j<40;j++)for(let i=-1;i<9;i++)bricks+=`<rect x="${i*100+(j%2)*50}" y="${j*36}" width="96" height="32" rx="2"/>`;
  let bok='';for(let i=0;i<30;i++)bok+=`<circle cx="${(R()*800).toFixed(0)}" cy="${(R()*800+500).toFixed(0)}" r="${(R()*26+6).toFixed(0)}" fill="${R()>.5?'#c9a24a':'#6fb2ff'}" opacity="${(R()*.2+.05).toFixed(2)}"/>`;
  return svgWrap(`<g fill="#243a60" opacity=".35">${bricks}</g><rect width="800" height="1400" fill="url(#fade)"/>${bok}
   <g filter="url(#glow)"><rect x="170" y="230" width="460" height="190" rx="95" fill="none" stroke="#6fb2ff" stroke-width="10" opacity=".7"/><text x="400" y="365" text-anchor="middle" font-family="Brush Script MT,Segoe Script,cursive" font-size="130" fill="none" stroke="#e05a4f" stroke-width="6" opacity=".85">Blues</text></g>
   <g opacity=".5" filter="url(#sm)"><ellipse cx="200" cy="700" rx="260" ry="90" fill="#94a6c4" opacity=".18"/><ellipse cx="620" cy="560" rx="220" ry="70" fill="#94a6c4" opacity=".14"/></g>`,
   `<filter id="glow"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="sm"><feGaussianBlur stdDeviation="30"/></filter><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1424" stop-opacity="0"/><stop offset="1" stop-color="#0a1424" stop-opacity=".85"/></linearGradient>`);
 },
 surf(){
  let rays='';for(let i=0;i<14;i++){const a=i/14*Math.PI*2;rays+=`<path d="M640 220 L${(640+Math.cos(a)*420).toFixed(0)} ${(220+Math.sin(a)*420).toFixed(0)} L${(640+Math.cos(a+.12)*420).toFixed(0)} ${(220+Math.sin(a+.12)*420).toFixed(0)}Z"/>`}
  let waves='';for(let k=0;k<5;k++){const y=980+k*70;waves+=`<path d="M0 ${y} C140 ${y-70} 260 ${y+40} 400 ${y-20} S660 ${y-60} 800 ${y}" fill="none" stroke="#0a8f9c" stroke-opacity="${.32-k*.04}" stroke-width="16"/>`}
  const curl=`<path d="M-40 1400 L-40 900 C80 760 330 720 420 860 C470 940 400 1010 330 980 C390 940 360 860 290 870 C200 880 160 1000 220 1100 C300 1230 520 1240 800 1150 L800 1400Z" fill="#0a8f9c" opacity=".22"/>`;
  const board=`<g transform="translate(120 330) rotate(-20)" opacity=".35"><ellipse rx="60" ry="250" fill="#ff6b4a"/><rect x="-6" y="-250" width="12" height="500" fill="#e9f6f4"/></g>`;
  return svgWrap(`<g fill="#ff6b4a" opacity=".1">${rays}</g><circle cx="640" cy="220" r="120" fill="#ff6b4a" opacity=".3"/>${board}${waves}${curl}`);
 },
 indie(){
  const R=rng(61);const pol=(x,y,r,c)=>`<g transform="translate(${x} ${y}) rotate(${r})" opacity=".55"><rect x="-110" y="-120" width="220" height="250" fill="#fffcff" stroke="#d8cde3" stroke-width="3"/><rect x="-92" y="-102" width="184" height="170" fill="${c}" opacity=".45"/><rect x="-40" y="-138" width="80" height="30" fill="#ff7a59" opacity=".45" transform="rotate(-6)"/></g>`;
  let doo='';for(let i=0;i<18;i++){const x=R()*760+20,y=R()*1360+20,t=Math.floor(R()*3);doo+=t===0?`<path transform="translate(${x.toFixed(0)} ${y.toFixed(0)})" d="M0 -14 L4 -4 L14 -4 L6 3 L9 14 L0 7 L-9 14 L-6 3 L-14 -4 L-4 -4Z" fill="none" stroke="#7c5cff" stroke-width="2.5" opacity=".45"/>`:t===1?`<path transform="translate(${x.toFixed(0)} ${y.toFixed(0)})" d="M0 0 q10 -14 20 0 t20 0 t20 0" fill="none" stroke="#ff7a59" stroke-width="3" opacity=".45"/>`:`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="9" fill="none" stroke="#2f86c9" stroke-width="2.5" opacity=".4"/>`}
  return svgWrap(`${pol(600,240,8,'#7c5cff')}${pol(170,640,-10,'#ff7a59')}${pol(640,1080,5,'#2f86c9')}${doo}`);
 }
};
const ARTURL={};
Object.keys(ART).forEach(k=>{try{ARTURL[k]="url('data:image/svg+xml,"+encodeURIComponent(ART[k]()).replace(/'/g,'%27')+"')"}catch(e){}});
