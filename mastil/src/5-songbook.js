/* ---------- cancionero: acordes ---------- */
const LAT={Do:0,Re:2,Mi:4,Fa:5,Sol:7,La:9,Si:11},ANG={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
const CH_RX=/^(Sol|Do|Re|Mi|Fa|La|Si|[A-G])(#|b|♯|♭)?([^/\s]*)(?:\/(Sol|Do|Re|Mi|Fa|La|Si|[A-G])(#|b|♯|♭)?)?$/;
const SUF_OK=/^(m|M|min|maj|dim|aug|sus|add|°|ø|\+|-|\(|\)|[0-9]|b|#|♯|♭)*$/;
const accOf=a=>a==='#'||a==='♯'?1:a==='b'||a==='♭'?-1:0;
// "SOL", "LAm", "rem" → "Sol", "Lam", "Rem"
const latCase=c=>String(c).trim().replace(/^(sol|do|re|mi|fa|la|si)(?=[^a-z]|m|$)/i,w=>w[0].toUpperCase()+w.slice(1).toLowerCase()).replace(/\/(sol|do|re|mi|fa|la|si)/i,(_,w)=>'/'+w[0].toUpperCase()+w.slice(1).toLowerCase());
function fitKar(kar){if(!kar||!kar.isConnected)return;let z=KAR.size;kar.style.setProperty('--kz',z);const over=()=>kar.scrollWidth>kar.clientWidth+1||[...kar.querySelectorAll('.kl')].some(l=>l.scrollWidth>l.clientWidth+1);let n=0;while(over()&&z>.6&&n++<24){z=+(z-.05).toFixed(2);kar.style.setProperty('--kz',z)}}
function chParse(c){
  const m=CH_RX.exec(latCase(c));if(!m||!SUF_OK.test(m[3]))return null;
  const r=(m[1] in LAT?LAT[m[1]]:ANG[m[1]])+accOf(m[2]);
  const b=m[4]?((m[4] in LAT?LAT[m[4]]:ANG[m[4]])+accOf(m[5])+12)%12:null;
  return{pc:(r+12)%12,suf:m[3],bass:b,minor:/^(m(?!aj)|min|-)/.test(m[3])};
}
const ES12S=['Do','Do♯','Re','Re♯','Mi','Fa','Fa♯','Sol','Sol♯','La','La♯','Si'],US12S=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
const ES12F=['Do','Re♭','Re','Mi♭','Mi','Fa','Sol♭','Sol','La♭','La','Si♭','Si'],US12F=['C','D♭','D','E♭','E','F','G♭','G','A♭','A','B♭','B'];
// tonalidades que se escriben con bemoles (mayor / menor)
const FLATK={maj:[5,10,3,8,1,6],min:[2,7,0,5,10,3]};
function noteName(pc,flat,es){return(es?(flat?ES12F:ES12S):(flat?US12F:US12S))[(pc+120)%12]}
function chName(p,shift,key,es){
  if(!p)return'';const flat=FLATK[key.minor?'min':'maj'].includes((key.pc+shift+120)%12);
  const suf=p.suf.replace(/#/g,'♯').replace(/b(?=\d)/g,'♭');
  return noteName(p.pc+shift,flat,es)+suf+(p.bass!=null?'/'+noteName(p.bass+shift,flat,es):'');
}
function chType(suf){
  const s=suf.replace(/[()]/g,'');
  if(/^m7b5|^m7♭5|^ø/.test(s))return'm7b5';if(/^maj7|^M7|^Δ/.test(s))return'maj7';if(/^(m|min|-)7/.test(s))return'm7';
  if(/^(m|min|-)(?!aj)/.test(s))return'min';if(/^(dim|°)/.test(s))return'dim';if(/^(aug|\+)/.test(s))return'aug';
  if(/^sus2/.test(s))return'sus2';if(/^sus/.test(s))return'sus4';if(/^add9/.test(s))return'add9';if(/^9/.test(s))return'dom9';if(/^7/.test(s))return'dom7';return'maj';
}
/* ---------- cancionero: digitación de guitarra ---------- */
// acordes abiertos de la referencia y, si no hay, cejilla con forma de Mi (6ª) o de La (5ª)
const TSUF={maj:'',min:'m',dom7:'7',m7:'m7',maj7:'maj7',sus4:'sus4',sus2:'sus2',add9:'add9',dom9:'7',dim:'dim',aug:'aug',m7b5:'m7b5'};
const ESHAPE={maj:[0,2,2,1,0,0],min:[0,2,2,0,0,0],dom7:[0,2,0,1,0,0],m7:[0,2,0,0,0,0],maj7:[0,null,1,1,0,null],sus4:[0,2,2,2,0,0]};
const ASHAPE={maj:[null,0,2,2,2,0],min:[null,0,2,2,1,0],dom7:[null,0,2,0,2,0],m7:[null,0,2,0,1,0],maj7:[null,0,2,1,2,0],sus2:[null,0,2,2,0,0],sus4:[null,0,2,2,3,0],add9:[null,0,2,2,0,0],dim:[null,0,1,2,1,null],m7b5:[null,0,1,0,1,null],aug:[null,0,3,2,2,null]};
const VCACHE={};
function voicing(p,shift){
  if(INST.id==='bateria')return guitarVoicing(p,shift);
  if(INST.id==='bajo')return bassVoicing(p,shift);
  const pc=(p.pc+shift+120)%12,t=chType(p.suf),bass=p.bass==null?null:(p.bass+shift+120)%12,key=pc+'|'+t+'|'+bass;
  if(VCACHE[key])return VCACHE[key];
  let frets=null;
  const nm=US12S[pc].replace('♯','#')+TSUF[t],oc=OC.find(c=>c[0]===nm);
  if(oc)frets=oc[2].slice();
  else{
    const e=(pc-4+12)%12,a=(pc-9+12)%12,eS=ESHAPE[t],aS=ASHAPE[t]||ASHAPE.maj;
    const useE=eS&&(e<=a||!aS)&&e>0,base=useE?e:a,sh=useE?eS:aS;
    frets=sh.map(f=>f==null?null:f+base);
  }
  // acorde con bajo (G/B, E/G♯): el bajo va en la cuerda más grave que lo alcance sin estirar la mano; si no cabe, lo toca el bajista
  if(bass!=null){const fr=frets.filter(x=>x!=null&&x>0),lo=fr.length?Math.min(...fr):0,hi=fr.length?Math.max(...fr):0;
    for(let i=0;i<3;i++){const s=6-i;let f=(bass-OPEN_PC[s]+12)%12;if(f>0&&f<lo-1&&f+12<=hi+2)f+=12;const ok=f===0||(Math.max(hi,f)-Math.min(lo||f,f)<=3);
      if(ok){for(let j=0;j<i;j++)frets[j]=null;frets[i]=f;break}}}
  const midi=frets.map((f,i)=>f==null?null:OPEN_MIDI[6-i]+f).filter(x=>x!=null),strs=frets.map((f,i)=>f==null?null:6-i).filter(x=>x!=null);
  return VCACHE[key]={frets,midi,strs,root:36+((bass!=null?bass:pc)<4?(bass!=null?bass:pc)+12:(bass!=null?bass:pc))};
}
function chordSVG(v){
  if(INST.id==='bateria')return '';
  if(INST.id==='bajo')return bassChordSVG(v);
  const F=v.frets,ns=F.filter(f=>f!=null&&f>0),lo=ns.length?Math.min(...ns):1,base=Math.max(...F.filter(f=>f!=null))>4?lo:1,W=10,H=11;
  let s=`<svg viewBox="-6 -12 ${5*W+14} ${4*H+16}" class="mch">`;
  for(let i=0;i<6;i++)s+=`<line x1="${i*W}" y1="0" x2="${i*W}" y2="${4*H}"/>`;
  for(let f=0;f<=4;f++)s+=`<line x1="0" y1="${f*H}" x2="${5*W}" y2="${f*H}" ${f===0&&base===1?'stroke-width="2.5"':''}/>`;
  if(base>1)s+=`<text x="${5*W+8}" y="${H*.8}" class="fr">${base}</text>`;
  // cejilla: barra de la cuerda grave a la aguda que pisa el dedo 1
  const cb=chordFing(F).barre;if(cb)s+=`<rect class="bar" x="${(6-cb.s2)*W-4}" y="${(cb.f-base+.5)*H-3.8}" width="${(cb.s2-cb.s1)*W+8}" height="7.6" rx="3.8"/>`;
  F.forEach((f,i)=>{const x=i*W;if(f==null)s+=`<text x="${x}" y="-4">×</text>`;else if(f===0)s+=`<circle cx="${x}" cy="-6" r="3" class="o"/>`;else s+=`<circle cx="${x}" cy="${(f-base+.5)*H}" r="3.8"/>`});
  return s+'</svg>';
}
/* ---------- cancionero: instrumentos ---------- */
// cada cuerda suena una sola vez: al volver a tocarla se apaga la nota anterior (como en una guitarra real)
const GSTR={};
function gNote(m,s,t,len,vol,o){
  const pv=GSTR[s];if(pv&&pv.end>t){try{const G=pv.g.gain;if(G.cancelAndHoldAtTime)G.cancelAndHoldAtTime(t);else G.cancelScheduledValues(t);G.setTargetAtTime(0,t,.015)}catch(e){}}
  // cada cuerda un poco a su lado del estéreo, como si la guitarra estuviera enfrente
  const n=(INST.id!=='guitarra'?guitarPluck:pluck)(m,t,len,vol,Object.assign({pan:(3.5-s)*.06},o||{}));if(n)GSTR[s]=n;
}
/* Rasgueo: abajo = de la 6ª a la 1ª, arriba = de la 1ª hacia las graves pero solo 3-4 cuerdas.
   La púa tarda ~10 ms entre cuerdas (menos si el golpe es suave), con variaciones mínimas para que no suene a máquina. */
/* Rasgueo con intención. vel (0–1) decide todo, como la mano de un guitarrista:
   · cuántas cuerdas: golpe fuerte abajo = todas desde el bajo; medio = sin la más grave; suave = solo las 4 agudas.
     Arriba: 4 agudas si es fuerte, 3 si es normal, 2 si es un roce.
   · velocidad de la púa: fuerte = barrido rápido y junto; suave = más lento y abierto.
   · brillo: fuerte = brillante; suave = opaco (filtro).
   · volumen con mucho más rango (≈ 18 dB entre un roce y un acento) y el chasquido de la púa sobre las cuerdas. */
function strum(v,t,dir,vel,len,o){
  vel=Math.max(.08,Math.min(1.15,vel));const up=dir==='u',n=v.midi.length,idx=v.midi.map((_,j)=>j);
  let L;if(up)L=idx.slice(-Math.min(n,vel>.75?4:vel>.4?3:2)).reverse();else{const skip=vel>.82?0:vel>.5?1:Math.max(0,n-4);L=idx.slice(Math.min(skip,n-2))}
  const gap=(up?.007:.010)*(1.35-vel*.6),amp=.16*Math.pow(vel,1.35),bright=1300+Math.pow(Math.min(1,vel),1.6)*8500;let tt=t;
  L.forEach((j,k)=>{// en el barrido las primeras cuerdas suenan un poco menos que donde «cae» la mano
    const shape=up?(k===0?1:.86-k*.06):(vel>.82&&k<2?1:k===0?.8:1);
    gNote(v.midi[j],v.strs[j],tt,len,amp*shape*(.92+Math.random()*.16),Object.assign({lp:bright},o||{}));tt+=gap*(.75+Math.random()*.5)});
  noise(t,Math.max(.02,tt-t+.012),'bandpass',up?3800:3000,.022*vel,.9); // la púa rozando las cuerdas
}
function gtrStrum(v,t,dir,vol,len,o){strum(v,t,dir,vol/.11,len,o)} // compatibilidad: volumen viejo → fuerza
// arpegio por número de cuerda (6 = la más grave); si esa cuerda no suena en el acorde, usa la vecina más aguda
function gtrPick(v,s,t,len,vol){
  if(s==='B'){gNote(v.midi[0],v.strs[0],t,len,vol*1.1);return}
  let j=v.strs.indexOf(s);for(let k=s-1;j<0&&k>=1;k--)j=v.strs.indexOf(k);if(j<0)j=v.midi.length-1;if(j===0&&v.midi.length>3)j=1;
  gNote(v.midi[j],v.strs[j],t,len,vol);
}
function leadNote(m,t,d,v){
  const c=AC,f=440*Math.pow(2,(m-69)/12),o=c.createOscillator(),o2=c.createOscillator(),lfo=c.createOscillator(),lg=c.createGain(),g=c.createGain(),g2=c.createGain(),lp=c.createBiquadFilter();
  o.type='triangle';o2.type='sine';o.frequency.value=f;o2.frequency.value=f*2;lfo.frequency.value=5.3;lg.gain.value=f*.007;
  lfo.connect(lg);lg.connect(o.frequency);lg.connect(o2.frequency);g2.gain.value=.22;o2.connect(g2);g2.connect(lp);o.connect(lp);
  lp.type='lowpass';lp.frequency.value=2400;lp.connect(g);g.connect(out());
  const dd=Math.max(.14,d*.94);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.035);g.gain.setValueAtTime(v,Math.max(t+.04,t+dd-.07));g.gain.exponentialRampToValueAtTime(.0001,t+dd);
  [o,o2,lfo].forEach(x=>{x.start(t);x.stop(t+dd+.05)});
}
/* ---------- cancionero: grooves de la banda ----------
   Cada ritmo trae su propia guitarra, bajo y percusión, escritos celda por celda para UN compás.
   sub = celdas por pulso: 4 = dieciseisavos (rectos), 3 = tresillos (shuffle, swing).
   Guitarra: D/d abajo (fuerte/suave), U/u arriba, x apagado con la palma, B pulgar en el bajo, b pulgar en el bajo alterno,
             c pellizco (3 agudas juntas), C pulgar + pellizco, 1-6 cuerda del arpegio, - nada.
   Bajo: R raíz, F quinta, O octava, 3 tercera, 6 sexta, 7 séptima menor, A raíz o quinta según el compás, . silencio, - sigue sonando.
   Batería: k bombo, s tarola, r aro, h contratiempo, p maraca/shaker, g güiro o guacharaca, c clave; X fuerte, x normal, o suave.
   Lo que se ve en «Rasgueo sugerido» es exactamente la línea g que suena. */
const GROOVES={
 folk:{feel:0.06,n:'Fogata',sub:4,ring:1.5,tip:'El de fogata: abajo, abajo-arriba, arriba-abajo-arriba. La mano sigue moviéndose aunque no toque.',
  4:{g:'D---d-U---u-D-u-',b:'R-------F-------',p:'--o---o---o---o-'},3:{g:'D---d-u-d-u-',b:'R-------F---',p:'--o---o---o-'}},
 pop:{feel:0.03,n:'Pop',sub:4,ring:1,tip:'Corcheas parejas abajo-arriba con acento en el 2 y el 4, junto con la tarola.',
  4:{g:'d-u-D-u-d-u-D-u-',b:'R--R--R-R--R--R-',k:'X-----x-X-------',s:'----X-------X---',h:'x-x-x-x-x-x-x-x-'},3:{g:'D-u-d-u-d-u-',b:'R-------F---',k:'X-----------',s:'----x---x---',h:'x-x-x-x-x-x-'}},
 balada:{feel:0.04,n:'Balada',sub:4,ring:2.4,tip:'Lento y con espacio: abajo, arriba-arriba, abajo. Deja que cada golpe suene completo.',
  4:{g:'D-----u---U-d---',b:'R-------F-------',k:'x-------o-------',r:'----x-------x---'},3:{g:'D-----u-U-d-',b:'R-----------',k:'x-----------',r:'--------x---'}},
 arpegio:{feel:0.03,n:'Arpegio',sub:4,ring:2.6,tip:'Pulgar en el bajo y luego una cuerda a la vez (p-i-m-a), dejando que todo suene.',
  4:{g:'B-3-2-3-1-3-2-3-',b:'R---------------'},3:{g:'B-3-2-1-2-3-',b:'R-----------'}},
 travis:{feel:0.05,n:'Travis',sub:4,ring:1.8,tip:'El pulgar alterna dos bajos en cada tiempo y los dedos tocan las agudas entre ellos.',
  4:{g:'B-2-b-1-B-2-b-1-',b:'R-------F-------'}},
 rock:{n:'Rock',sub:4,ring:.5,tip:'Corcheas hacia abajo, apagando un poco con la palma; más fuerte en cada tiempo.',
  4:{g:'D-d-d-d-D-d-d-d-',b:'R-R-R-R-R-R-R-R-',k:'X-----x-X-------',s:'----X-------X---',h:'x-x-x-x-x-x-x-x-'},3:{g:'D-d-d-D-d-d-',b:'R-R-R-R-R-R-',k:'X-------x---',s:'----X-------',h:'x-x-x-x-x-x-'}},
 rocknroll:{n:'Rock and roll',sub:4,walk:1,ring:.8,tip:'Abajo-arriba sin parar, golpe fuerte en el 2 y el 4. El bajo camina: raíz, tercera, quinta, sexta, séptima.',
  4:{g:'d-u-D-u-d-u-D-u-',b:'R-3-F-6-7-6-F-3-',k:'x-------x-------',s:'----X-------X---',h:'x-x-x-x-x-x-x-x-'}},
 shuffle:{n:'Blues shuffle',sub:3,walk:1,ring:.5,tip:'Swing: «lar-go cor-to». Golpe abajo en el tiempo y arriba en la última parte del tresillo.',
  4:{g:'D-uD-uD-uD-u',b:'R-R3-3F-F6-6',k:'x-----x-----',s:'---X-----X--',h:'x-xx-xx-xx-x'}},
 country:{feel:0.07,n:'Country',sub:4,ring:.9,tip:'«Bum-chi-ca»: pulgar en el bajo y rasgueo abajo-arriba; el bajo alterna raíz y quinta.',
  4:{g:'B---D-u-b---D-u-',b:'R-------F-------',k:'x-------x-------',s:'----o-------o---'}},
 ranchera:{n:'Ranchera',sub:4,ring:.45,tip:'4/4: polka norteña, «bum-chac» con bajo en cada tiempo. 3/4: vals ranchero de mariachi con abanico.',
  4:{g:'B-x-b-x-B-x-b-x-',b:'R---F---R---F---',k:'x---x---x---x---',s:'--o---o---o---o-'},3:{g:'B---D-u-D-u-',b:'A-----------'}},
 vals:{n:'Vals',sub:4,ring:.6,tip:'Bum-chi-chi: bajo en el 1 y golpes cortos hacia abajo en el 2 y el 3.',
  3:{g:'B---d---d---',b:'A-----------',h:'----o---o---'}},
 bolero:{feel:0.03,n:'Bolero',sub:4,ring:1.2,tip:'Pulgar en el 1 y el 3; acorde en el 2, su «y», y el 4. Suave, con maracas.',
  4:{g:'B---d-d-b---d---',b:'R-------F-------',p:'o-x-o-x-o-x-o-x-'}},
 cumbia:{n:'Cumbia',sub:4,ring:.35,tip:'Golpe corto y apagado en el «y» de cada tiempo, junto con la guacharaca; el bajo en el 1 y el 3.',
  4:{g:'--x---x---x---x-',b:'R-----F-F-------',k:'x-------x-------',g2:'X-xxX-xxX-xxX-xx'}},
 son:{n:'Son y salsa',sub:4,ring:.5,tip:'Rasgueo continuo con acentos 3-3-2; el bajo «tumbao» se adelanta: entra en el «y» del 2 y en el 4.',
  4:{g:'D-u-d-U-d-u-D-u-',b:'------F-----R---',c:'X-----X-----X---',p:'o-o-o-o-o-o-o-o-'}},
 merengue:{n:'Merengue',sub:4,ring:.3,tip:'Golpes cortos en cada corchea; la güira raspa sin parar y el bombo marca los cuatro tiempos.',
  4:{g:'x-x-X-x-x-x-X-x-',b:'R---R-R-F---F-F-',k:'x---x---x---x---',g2:'X-xxX-xxX-xxX-xx'}},
 reggae:{n:'Reggae',sub:4,ring:.25,tip:'Solo en el 2 y el 4, golpe corto y seco («skank»). El bombo cae en el 3 (one drop).',
  4:{g:'----x-------x---',b:'R-----R-.-F-R---',k:'--------X-------',r:'--------x-------',h:'o-x-o-x-o-x-o-x-'}},
 bossa:{n:'Bossa nova',sub:4,ring:1.1,tip:'Pulgar en el 1 y el 3; los dedos pellizcan las agudas a contratiempo, muy suave.',
  4:{g:'C--c--c-b-c-c---',b:'R-------F-------',r:'X--x--x---x--x--',h:'o-o-o-o-o-o-o-o-'}},
 urbano:{n:'Urbano',sub:4,ring:1.1,tip:'Tres golpes en 3-3-2 (el «tresillo»): caen junto con el bombo y la tarola del dembow.',
  4:{g:'D-----D-----D---',b:'R-----R-----F---',k:'X---X---X---X---',s:'---x--x----x--x-',h:'o-o-o-o-o-o-o-o-'},3:{g:'D-----D-----',b:'R-----R-----',k:'X---X---X---',s:'---x--x-----'}}};
const BSTYLES=Object.fromEntries(Object.entries(GROOVES).map(([k,g])=>[k,g.n]));
const KPAT=GROOVES; // compatibilidad con canciones y ajustes guardados
const grooveFor=(id,beats)=>{const b=beats===3?3:4,g=GROOVES[id];if(g&&g[b])return id;return b===3?'vals':'folk'};
function clave(t,v){const o=AC.createOscillator(),g=AC.createGain();o.frequency.value=2500;o.type='sine';g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+.06);o.connect(g);g.connect(out());o.start(t);o.stop(t+.07)}
/* mezcla de la banda por instrumento (vista Pistas): g guitarra, b bajo, d batería. BDYN = fuerza de la sección */
let BMIX={g:1,b:1,d:1},BDYN=1;
function onBus(k,f){const m=BMIX[k]??1;if(m<=0)return;if(m===1)return f();const M=MASTER;M._b=M._b||{};let n=M._b[k];if(!n){n=AC.createGain();n.connect(M);M._b[k]=n}n.gain.value=m;MASTER=n;try{f()}finally{MASTER=M}}
// i = celda dentro del compás (beats·sub celdas)
function bandStep(id,beats,i,p,sh,t,spb,bar,ci){
  id=grooveFor(id,beats);const G=GROOVES[id],V=G[beats===3?3:4],sub=G.sub,cd=spb/sub,L=beats*sub;
  const v=INST.id!=='guitarra'?guitarVoicing(p,sh):voicing(p,sh),pc=(p.bass!=null?p.bass+sh:p.pc+sh+120)%12,rootLo=28+((pc-4+12)%12),minor=p.minor||/^(m(?!aj)|min|-)/.test(p.suf);
  const lev=(c,X,x,o)=>c==='X'?X:c==='x'?x:c==='o'?o:0;
  // Humanización: cada músico se mueve como máximo 6 ms. El bombo del primer tiempo
  // queda clavado; el 1 respira un poco más fuerte y el resto varía hasta 5 %.
  const ht=lock=>Math.max(0,t+(lock?0:(Math.random()*2-1)*.006)),dyn=()=>((i===0)?1.08:1)*(.95+Math.random()*.1)*BDYN;
  // Las tomas son más dinámicas que la síntesis. Se compensan por arreglo para mantener
  // la batería cerca de 3 dB debajo de la guitarra sin tapar la guacharaca de la cumbia.
  const kit=SMP.d&&SMP.d.kick1?(id==='balada'?4.4:id==='cumbia'?1:2.2):1;
  // percusión
  const dr=(k,f)=>{if(INST.id==='bateria'&&drumPlayer())return;const c=V[k]&&V[k][i];if(c&&c!=='-')onBus('d',()=>f(c))};
  dr('k',c=>kick(ht(i===0),lev(c,.62,.46,.28)*dyn(),kit));
  dr('s',c=>{const q=lev(c,.68,.5,.25)*dyn(),tt=ht();if(id==='urbano'){if(!percHit('clap',tt,q,{level:.62*kit,pan:.06,wet:.2}))snare(tt,q,kit)}else snare(tt,q,kit)});
  dr('r',c=>{const q=lev(c,.62,.46,.25)*dyn(),tt=ht();if(!percHit('rim',tt,q,{level:.62*kit,pan:.06,wet:.16}))noise(tt,.04,'bandpass',1800,q*.25,3)});
  dr('h',c=>hat(ht(),lev(c,.64,.48,.28)*dyn(),false,kit));
  dr('p',c=>{const q=lev(c,.58,.43,.26)*dyn(),tt=ht();if(!percHit('mara',tt,q,{level:.42*kit,pan:.24,wet:.06}))noise(tt,.05,'highpass',6500,q*.1)});
  dr('g2',c=>{const q=lev(c,.58,.43,.27)*dyn(),tt=ht();if(!percHit(id==='merengue'?'tamb':'mara',tt,q,{level:.46*kit,pan:.2,wet:.08}))guiro(tt,c==='X')});
  dr('c',c=>{const q=lev(c,.62,.46,.26)*dyn(),tt=ht();if(!percHit(id==='son'?'cow':'click',tt,q,{level:.42*kit,pan:-.18,wet:.1}))clave(tt,q*.25)});
  // Apertura del arreglo y cada ocho compases: solo en estilos donde un crash es natural.
  if(!(INST.id==='bateria'&&drumPlayer())&&i===0&&bar>=0&&bar%8===0&&['rock','pop','country'].includes(id))percHit('crash',ht(),.64*dyn(),{level:.48*kit,pan:-.12,wet:.3});
  // bajo: dura hasta su siguiente nota o un «.»
  // las líneas que caminan (rock and roll, shuffle) empiezan de nuevo cuando cambia el acorde
  const bi=G.walk&&ci!=null?ci%L:i;
  const B=V.b;if(!(INST.id==='bajo'&&bassPlayer())&&B&&B[bi]&&B[bi]!=='-'&&B[bi]!=='.'){let n=1;while(bi+n<L&&B[bi+n]==='-')n++;
    const c=B[bi],w=c==='A'?(bar%2?'F':'R'):c,iv={R:0,F:7,O:12,'3':minor?3:4,'6':9,'7':10}[w]||0;let m=rootLo+iv;if(w==='F'&&m>40)m-=12;
    onBus('b',()=>bassNote(m,ht(),n*cd*.92,(id==='rock'?.3:.36)*(bi===0?1.08:bi%sub===0?.95:.78)*dyn(),true))}
  // guitarra: exactamente la línea que se ve
  const c=V.g&&V.g[i];if(!c||c==='-')return;
  onBus('g',()=>gtrCell(c,G,V,sub,i,t,spb,v,pc,ht,id));
}
function gtrCell(c,G,V,sub,i,t,spb,v,pc,ht,id){
  const ring=G.ring*spb,lc=c.toLowerCase(),acc=c!==lc,sb=G.ring<.7?1.15:1;
  // acento natural del compás: el 1 manda, luego los demás tiempos, luego los «y», y los dieciseisavos son roces
  const pos=i%sub,met=i===0?1:pos===0?.86:(sub===4&&pos===2)||(sub===3&&pos===2)?.68:.5;
  // pequeño swing en los «y» (le da caminado al folk, pop, country, balada)
  t=ht();if(G.feel&&pos){t+=G.feel*spb*(sub===4&&pos===2?1:.5)}
  const vel=met*(acc?1.18:.9)*sb*(.95+Math.random()*.1)*BDYN;
  const bassStr=w=>{const want=(w==='b'?pc+7:pc)%12;let j=v.midi.findIndex((m,k)=>k<3&&m%12===want);if(j<0)j=w==='b'?Math.min(1,v.midi.length-1):0;return j};
  if(c==='B'||c==='b'||c==='C'){const j=bassStr(c==='C'?'B':c);gNote(v.midi[j],v.strs[j],t,Math.max(ring,spb*.9),.17)}
  if(c==='c'||c==='C'){v.midi.slice(-3).forEach((m,k)=>gNote(m,v.strs[v.midi.length-3+k],t+k*.004,ring,.13));return}
  if(c==='B'||c==='b')return;
  if(/\d/.test(c)){gtrPick(v,+c,t,spb*2.4,.24*(.75+met*.3));return}
  // apagado: la mano cae sobre las cuerdas (golpe seco, oscuro, con el «chak» de la palma)
  if(lc==='x'){strum(v,t,'d',Math.max(.55,vel),.06,{rel:.035,lp:1400,wet:.12});noise(t,.03,'bandpass',1900,.05*vel,1.1);return}
  // los golpes de acento dejan sonar; los roces se cortan antes
  strum(v,t,lc,vel,lc==='u'?Math.min(ring,spb*1.1)*(vel>.7?1:.7):ring*(vel>.75?1:.8));
}
/* ---------- cancionero: formato ---------- */
// ChordPro: [Sol]letra con [Re7]acordes, {title:} {artist:} {key:} {bpm:} {time:3/4} {bpl:2} {cpb:1} {style:} {pickup:1} {c:Coro}
// En canciones con melodía: sílabas separadas con ~ (y _ une palabras en una sílaba) y {mel: G4/1 A4/.5 +B4/.5 r/1 …} después del renglón.
const TAB_RX=/^\s*[eBGDAEbgda]\s*\|[-\d|hpbrx\/\\~*.() ]{4,}$/;
const SEC_RX=/^\s*[\[(]?\s*(coro|estribillo|verso|estrofa|puente|intro|introducci[oó]n|final|outro|solo|interludio|instrumental|pre-?coro|chorus|verse|bridge|interlude|pre-?chorus|riff)\b[^\]\n]*?[\])]?\s*:?\s*$/i;
const LABEL_PFX=/^\s*\[?(intro|introducci[oó]n|final|outro|solo|interludio|instrumental|riff|coro|chorus)\]?\s*[:\-]\s*/i;
// datos de la página de donde se copió (afinación, capo, dificultad…): no son letra
const META_RX=/^\s*(tuning|afinaci[oó]n|capo|cejilla|key|tonalidad|difficulty|dificultad|strumming|rasgueo|author|autor|bpm|tempo)\s*:/i;
function isChordTok(t){const c=t.replace(/[|()[\]]/g,'');return!!c&&!!chParse(c)}
function isChordLine(l){const ts=l.trim().split(/\s+/).filter(Boolean);return ts.length>0&&ts.every(t=>isChordTok(t)||/^[|x\d()\-.:/]+$/i.test(t)||/^\(?x\d+\)?$/i.test(t))&&ts.some(isChordTok)}
function normalizePaste(txt){
  const L=txt.replace(/\r/g,'').replace(/\t/g,'    ').replace(/\u00a0/g,' ').split('\n'),out=[];
  for(let i=0;i<L.length;i++){
    let l=L[i];
    if(TAB_RX.test(l)||META_RX.test(l))continue;
    if(/^\s*\{/.test(l)||/\[[^\]]+\]/.test(l)&&!SEC_RX.test(l)){out.push(l);continue}
    const pf=LABEL_PFX.exec(l);
    if(pf&&isChordLine(l.slice(pf[0].length))){out.push('{c:'+pf[1][0].toUpperCase()+pf[1].slice(1).toLowerCase()+'}');l=' '.repeat(pf[0].length)+l.slice(pf[0].length)}
    if(!isChordLine(l)){out.push(l);continue}
    const ch=[];l.replace(/\S+/g,(t,pos)=>{if(isChordTok(t)){const lead=t.match(/^[|(]*/)[0].length;ch.push([pos+lead,t.replace(/[|()[\]]/g,'')])}return t});
    const nx=L[i+1];
    if(nx!=null&&nx.trim()&&!isChordLine(nx)&&!SEC_RX.test(nx)&&!/^\s*[\[{]/.test(nx)&&!TAB_RX.test(nx)){
      let s=nx.padEnd((ch.length?ch[ch.length-1][0]:0)+1);
      for(let k=ch.length-1;k>=0;k--){const[p,c]=ch[k];s=s.slice(0,p)+'['+c+']'+s.slice(p)}
      out.push(s.replace(/\s+$/,''));i++;
    }else out.push(ch.map(([,c])=>'['+c+']').join(' '));
  }
  return out.join('\n');
}
function parseMel(v){return v.trim().split(/\s+/).map(tok=>{const m=/^(\+)?([A-G][#b]?-?\d|r)\/([\d.]+)$/.exec(tok);if(!m)return null;let midi=null;if(m[2]!=='r'){const n=/^([A-G])([#b]?)(-?\d)$/.exec(m[2]);midi=12*(+n[3]+1)+ANG[n[1]]+accOf(n[2])}return{m:midi,d:+m[3],cont:!!m[1],rest:m[2]==='r'}}).filter(Boolean)}
// renglón → piezas (sílabas o palabras) con su acorde
function linePieces(l){
  const pcs=[];let ch=null,raw=null,buf='',sp=false,first=true;
  const push=()=>{if(buf||ch){pcs.push({p:ch,raw,text:buf.replace(/_/g,' '),sp:first?false:sp});first=false}buf='';ch=null;raw=null;sp=false};
  for(let i=0;i<l.length;i++){
    const c=l[i];
    if(c==='['){const j=l.indexOf(']',i);if(j>i){if(buf||ch)push();const r=l.slice(i+1,j);ch=chParse(r);raw=r;if(!ch){buf+=l.slice(i,j+1)}i=j;continue}}
    if(c===' '){if(buf)push();else if(ch&&/\S/.test(l.slice(i+1))&&l[i+1]!=='['){}else if(ch)push();sp=true;continue}
    if(c==='~'){push();sp=false;continue}
    buf+=c;
  }
  push();
  return pcs;
}
/* Tonalidad a partir de TODOS los acordes (no solo el primero): cada una de las 24 tonalidades suma puntos por
   acorde que le pertenece (más si es el I, el IV o el V) y gana extra si la canción empieza o termina en su tónica. */
/* «Tocar con un beat»: abre Roka Estudio (mastil/estudio/) con el tono, el tempo y un estilo parecido al ritmo de la banda */
const BEAT_FROM_GROOVE={folk:'pop',pop:'pop',balada:'balada',arpegio:'balada',travis:'pop',rock:'rock',rocknroll:'rock',shuffle:'rock',country:'norteno',ranchera:'polka',vals:'vals',bolero:'bolero',cumbia:'cumbia',son:'cumbia',merengue:'cumbia',reggae:'reggaeton',bossa:'bossa',urbano:'reggaeton'};
const US_NAMES=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
function estudioLink(pc,minor,bpm,groove,beats){
  let g=BEAT_FROM_GROOVE[groove]||'';if(beats===3)g=g==='bolero'?'bolero':'vals';
  return INST.root+'estudio/#/nueva?'+new URLSearchParams({tono:US_NAMES[((pc%12)+12)%12]+(minor?'m':''),bpm:String(Math.round(bpm)),genero:g,desde:INST.id}).toString();
}
function detectKey(all){
  if(!all.length)return{pc:0,minor:false,suf:''};
  const MAJ={0:'M',2:'m',4:'m',5:'M',7:'M',9:'m',11:'d'},MIN={0:'m',2:'d',3:'M',5:'m',7:'X',8:'M',10:'M'};
  const R=[];
  for(let k=0;k<12;k++)for(const mn of[false,true]){
    let sc=0;const D=mn?MIN:MAJ;
    all.forEach(p=>{const d=(p.pc-k+12)%12,t=chType(p.suf),q=t==='dim'||t==='m7b5'?'d':p.minor||t==='m7'?'m':'M',e=D[d];
      if(e===q||(e==='X'&&q!=='d'))sc+=d===0?2.2:d===7||d===5?1.3:1;
      else if(q==='M'&&(t==='dom7'||t==='dom9'))sc+=.3; // dominante secundaria
      else if(!mn&&d===10&&q==='M')sc+=.5;            // VII♭ del rock
      else if(mn&&d===5&&q==='M')sc+=.4;              // IV mayor (dórico)
      else sc-=1;});
    const f=all[0],l=all[all.length-1];
    if(f.pc===k&&f.minor===mn)sc+=2;if(l.pc===k&&l.minor===mn)sc+=2.5;
    R.push({sc,pc:k,minor:mn});
  }
  // entre las que encajan casi igual (relativas, modos), manda el acorde con que empieza o termina
  R.sort((a,b)=>b.sc-a.sc);const tol=1+.12*all.length,near=R.filter(x=>x.sc>=R[0].sc-tol),is=c=>x=>x.pc===c.pc&&x.minor===!!c.minor;
  const best=near.find(is(all[0]))||near.find(is(all[all.length-1]))||R[0];
  return{pc:best.pc,minor:best.minor,suf:best.minor?'m':''};
}
// sílabas aproximadas (grupos de vocales); en inglés la «e» final suele ser muda
const EN_RX=/\b(the|and|you|my|is|of|in|to|me|your|when|what|oh|i'm|it's|down|love)\b/gi;
function isEnglish(S){let en=0,w=0;S.lines.forEach(L=>{if(L.pieces){const t=L.pieces.map(p=>(p.sp?' ':'')+p.text).join('');w+=(t.match(/\S+/g)||[]).length;en+=(t.match(EN_RX)||[]).length}});return w>0&&en/w>.08}
function sylCount(txt,en){
  let n=0;String(txt).toLowerCase().replace(/[^a-záéíóúüñ']/g,' ').split(/\s+/).forEach(w=>{if(!w)return;let c=(w.match(/[aeiouáéíóúüy]+/g)||[]).length;if(en&&c>1&&/[^aeiouyl]e$/.test(w))c--;n+=c});
  return n;
}
function songParse(src){
  const S={title:'Sin título',artist:'',key:null,bpm:90,time:'4/4',bpl:1,cpb:.5,bps:null,style:null,pickup:0,lines:[],chords:[],all:[],hasMel:false,set:{}};
  const seen={};
  normalizePaste(src).split('\n').forEach(raw=>{
    const l=raw.replace(/\s+$/,'');
    if(/^\s*(\{[^}]*\}\s*)+$/.test(l)){l.replace(/\{\s*(\w+)\s*:?\s*([^}]*?)\s*\}/g,(_,k0,v)=>{const k=k0.toLowerCase();
      S.set[k]=1;if(k==='title'||k==='t')S.title=v;else if(k==='artist'||k==='a'||k==='st'||k==='subtitle')S.artist=v;else if(k==='key')S.key=chParse(v);
      else if(k==='bpm'||k==='tempo')S.bpm=Math.max(40,Math.min(220,+v||90));else if(k==='time')S.time=/^[234]\/4$/.test(v)?v:/^6\/8$/.test(v)?'3/4':'4/4';
      else if(k==='bpl')S.bpl=Math.max(1,Math.min(8,+v||2));else if(k==='cpb')S.cpb=Math.max(.5,Math.min(4,+v||1));else if(k==='style'&&BSTYLES[v])S.style=v;else if(k==='pickup')S.pickup=Math.max(0,+v||0);else if(k==='bps')S.bps=Math.max(.4,Math.min(4,+v||1));else if(k==='chordbeats'||k==='cb'){const a=v.split(/[\s,]+/).map(Number).filter(x=>x>0);if(a.length)S.cb=a}
      else if(k==='mel'){const L=S.lines[S.lines.length-1];if(L&&L.pieces){L.mel=parseMel(v);S.hasMel=true}}
      else if(k==='c'||k==='comment'||k==='soc'||k==='sov'||k==='section')S.lines.push({label:v||(k==='soc'?'Coro':'')});
      return''});return}
    if(!l.trim()){if(S.lines.length&&!S.lines[S.lines.length-1].gap)S.lines.push({gap:true});return}
    if(SEC_RX.test(l)&&!isChordLine(l)){S.lines.push({label:l.replace(/[\[\]():]/g,'').trim()});return}
    const pieces=linePieces(l);if(!pieces.length)return;
    pieces.forEach(pc=>{if(pc.p){S.all.push(pc.p);const k=pc.raw;if(!seen[k]){seen[k]=1;S.chords.push(pc.p)}}});
    S.lines.push({pieces});
  });
  while(S.lines.length&&S.lines[S.lines.length-1].gap)S.lines.pop();
  S.keyAuto=!S.key;if(!S.key)S.key=detectKey(S.all);
  S.beats=+S.time[0];
  S.en=isEnglish(S);
  if(!S.style)S.style=S.beats===3?(S.bpm>=130?'ranchera':S.bpm<=88?'balada':'vals'):S.bpm<=76?'balada':'folk';
  return S;
}
// pulsos por sílaba cuando no hay melodía: se canta ~0.75 s por sílaba (más rápido si la canción lo pide con {bps:})
const songBps=S=>S.bps||Math.max(.6,Math.min(2.2,.75*S.bpm/60));
/* Tiempos (en pulsos) de cada renglón, sílaba, acorde y nota de melodía.
   Sin melodía: la duración del renglón sale de cuántas sílabas tiene; cada acorde cae en el 1 de un compás
   (o medio compás si hay muchos) y la letra se reparte entre acordes; las sílabas antes del primer acorde
   son anacrusa y se cantan al final del compás anterior. bars>0 fija los compases por renglón. */
function songTimeline(S,bars0,beats){
  const bt=beats||S.beats,bps=songBps(S),ev=[],lines=[];
  let b=0,lastSyl=-1e9,first=true;
  S.lines.forEach((L,li)=>{
    if(!L.pieces)return;
    const pcs=L.pieces;let start=b,dur;
    if(L.mel&&L.mel.length){
      let t=start;const notes=L.mel.map(n=>{const o=Object.assign({t},n);t+=n.d;return o});dur=t-start;
      let k=0;
      pcs.forEach(pc=>{
        if(pc.text.trim()){while(k<notes.length&&(notes[k].rest||notes[k].cont))k++;pc.t=k<notes.length?notes[k].t:t;k++}
        else pc.t=k<notes.length?notes[k].t:t;
      });
      notes.forEach(n=>{if(!n.rest)ev.push({b:n.t,type:'note',m:n.m,d:n.d})});
    }else{
      const w=pcs.map(pc=>sylCount(pc.text,S.en)),chIdx=pcs.map((pc,i)=>pc.p?i:-1).filter(i=>i>=0),n=chIdx.length;
      const c0=n?chIdx[0]:pcs.length,lead0=w.slice(0,c0).reduce((a,x)=>a+x,0);
      // si lo que va antes del primer acorde cabe en un compás es anacrusa; si no, se canta sobre el acorde anterior
      const pick=n>0&&lead0>0&&lead0*bps<=bt+.01,f0=pick?c0:0,lead=pick?lead0:0;
      // peso de cada pieza (desde el primer acorde si hay anacrusa); un acorde sin letra vale un compás
      const bw=pcs.map((pc,i)=>i<f0?0:w[i]||(pc.p&&!pc.text.trim()?bt/bps:0)),W=bw.reduce((a,x)=>a+x,0);
      const hasTxt=pcs.some(pc=>pc.text.trim());
      const pos0=i=>{let a=0;for(let k=0;k<i;k++)a+=bw[k];return W?a/W:0};
      let nb=bars0>0?bars0:Math.ceil((W*bps+(hasTxt?1:0))/bt-.15);
      if(!(bars0>0)&&hasTxt&&nb>2&&nb%2)nb++;
      nb=Math.max(nb,1,S.bpl||1,Math.ceil(n*(S.cpb||.5)));
      if(first&&lead){start=b=Math.ceil(lead*bps/bt)*bt}
      // {chordbeats: 2 2 4}: cuántos pulsos dura cada acorde del renglón (se repite si hay más acordes)
      if(S.cb&&n&&!(bars0>0)){let tt=start;const anc=[];chIdx.forEach((ci,j)=>{pcs[ci].t=tt;anc.push({p:pos0(ci),t:tt});tt+=S.cb[j%S.cb.length]});
        dur=Math.max(bt,Math.ceil((tt-start)/bt-1e-6)*bt);anc.push({p:1,t:Math.min(tt,start+dur)});
        pcs.forEach((pc,i)=>{if(pc.p||i<f0)return;const q=pos0(i);let lo=anc[0],hi=anc[anc.length-1];for(const x of anc){if(x.p<=q)lo=x;else{hi=x;break}}pc.t=hi.p>lo.p?lo.t+(q-lo.p)/(hi.p-lo.p)*(hi.t-lo.t):lo.t});
        if(f0>0){const room=Math.max(.5,Math.min(lead*bps,start-lastSyl-.5)),step=lead?room/lead:0;let a2=0;for(let i=0;i<f0;i++){pcs[i].t=start-room+a2*step;a2+=w[i]}}
      }else{
      dur=nb*bt;
      let sp=1;if(n>nb)sp=bt===4?2:bt;if(n>nb*sp)sp=bt;const slots=nb*sp,slotB=bt/sp;
      let acc=0;const pos=bw.map(x=>{const p=W?acc/W:0;acc+=x;return p});
      const anc=pick||!n||chIdx[0]===0?[]:[{p:0,t:start}];let prev=-1;
      chIdx.forEach((i,j)=>{let s=j===0&&anc.length===0?0:Math.round(pos[i]*slots);s=Math.max(s,prev+1);s=Math.min(s,slots-(n-j));s=Math.max(s,0);prev=s;pcs[i].t=start+s*slotB;anc.push({p:pos[i],t:pcs[i].t})});
      // fin del canto: a ritmo de sílabas desde el último acorde, sin pasarse del renglón
      if(!anc.length)anc.push({p:0,t:start});const la=anc[anc.length-1],endT=Math.min(start+dur-.5,la.t+(1-la.p)*W*bps);
      anc.push({p:1,t:Math.max(la.t,endT)});
      pcs.forEach((pc,i)=>{if(pc.p||i<f0)return;let lo=anc[0],hi=anc[anc.length-1];
        for(const x of anc){if(x.p<=pos[i])lo=x;else{hi=x;break}}
        pc.t=hi.p>lo.p?lo.t+(pos[i]-lo.p)/(hi.p-lo.p)*(hi.t-lo.t):lo.t});
      // anacrusa: antes del 1, sin encimarse con lo que se cantó antes
      if(f0>0){const room=Math.max(.5,Math.min(lead*bps,start-lastSyl-.5)),step=lead?room/lead:0;let a2=0;
        for(let i=0;i<f0;i++){pcs[i].t=start-room+a2*step;a2+=w[i]}}
      }
    }
    first=false;
    pcs.forEach((pc,pi)=>{if(pc.text.trim()){ev.push({b:pc.t,type:'lit',li,pi});lastSyl=Math.max(lastSyl,pc.t)}if(pc.p)ev.push({b:pc.t,type:'chord',p:pc.p,li,pi})});
    const ls=Math.min(start,...pcs.map(pc=>pc.t));
    ev.push({b:ls,type:'line',li});
    lines.push({li,start:ls,dur});
    b=start+dur;
  });
  return{ev,lines,total:b};
}
/* ---------- cancionero: biblioteca ---------- */
function sbGet(id){
  if(id.startsWith('pd')){const s=TRAD[+id.slice(2)];return s?{id,src:s,trad:true}:null}
  if(id.startsWith('top')){const x=TOPLIST[+id.slice(3)];return x?{id,src:topSrc(x),top:x}:null}
  const s=(DB.songs||[]).find(z=>z.id===id);return s?{id,src:s.src,mine:true}:null;
}
/* ---------- portadas: se buscan en el catálogo de iTunes (título + artista) y se guardan en DB.art ----------
   Solo para canciones reales (Mis canciones y Las 100); las tradicionales llevan una portada abstracta.
   Se piden de una en una y solo las que se ven, para no pasar el límite del catálogo; sin conexión queda la abstracta. */
const normTxt=x=>String(x||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\(.*?\)|\[.*?\]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const artKey=(t,a)=>normTxt(a)+'|'+normTxt(t);
const COVR={q:[],busy:false,io:null,saveT:0};
function coverHTML(t,a,big){
  const k=artKey(t,a),u=(DB.art||{})[k];let h=0;for(const c of k)h=(h*31+c.charCodeAt(0))%360;
  const ini=normTxt(t).split(' ').filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join('')||'·';
  const real=a&&!/tradicional|popular|dominio|an[oó]nimo|·/i.test(a);
  return`<span class="sart${big?' big':''}" style="--h:${h}" ${real?`data-ak="${esc(k)}" data-t="${esc(t)}" data-a="${esc(a)}"`:''}>${u?`<img src="${esc(u)}" alt="" loading="lazy">`:`<b>${esc(ini)}</b>`}</span>`;
}
function coverWatch(root){
  const want=el=>{const k=el.dataset.ak;if((DB.art||{})[k]===undefined&&!COVR.q.some(x=>x.k===k))COVR.q.push({k,t:el.dataset.t,a:el.dataset.a});coverPump()};
  if(COVR.io)COVR.io.disconnect();COVR.io='IntersectionObserver'in window?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){COVR.io.unobserve(e.target);want(e.target)}}),{rootMargin:'200px'}):null;
  // las que ya se ven se piden de inmediato; las demás cuando aparezcan al bajar
  setTimeout(()=>$$('.sart[data-ak]',root).forEach(el=>{if(el.querySelector('img')||el.closest('[hidden]'))return;const y=el.getBoundingClientRect().top;if(y<Math.max(innerHeight,700)+200||!COVR.io)want(el);else COVR.io.observe(el)}));
}
async function coverPump(){
  if(COVR.busy||!COVR.q.length||!navigator.onLine)return;COVR.busy=true;const{k,t,a}=COVR.q.shift();
  try{const r=await fetch('https://itunes.apple.com/search?media=music&entity=song&limit=8&country=MX&term='+encodeURIComponent(a+' '+t));
    if(r.ok){const res=(await r.json()).results||[],nt=normTxt(t),na=normTxt(a);
      // la que mejor coincide en título y artista; si ninguna, ninguna (mejor la abstracta que una portada equivocada)
      const sc=x=>{const xt=normTxt(x.trackName),xa=normTxt(x.artistName);return(xt===nt?3:xt.includes(nt)||nt.includes(xt)?2:0)+(xa===na?3:xa.includes(na)||na.includes(xa)?2:0)};
      const best=res.map(x=>[sc(x),x]).sort((p,q)=>q[0]-p[0])[0],u=best&&best[0]>=4?String(best[1].artworkUrl100||'').replace('100x100bb','300x300bb'):'';
      DB.art=DB.art||{};DB.art[k]=u;clearTimeout(COVR.saveT);COVR.saveT=setTimeout(save,800);
      if(u)$$(`.sart[data-ak="${CSS.escape(k)}"]`).forEach(el=>{el.innerHTML=`<img src="${esc(u)}" alt="">`})}}catch(e){}
  setTimeout(()=>{COVR.busy=false;coverPump()},350);
}
let SBTAB='trad',SBGENRE=null,SBQ='';
function viewSongbook(){
  SBGENRE=SBGENRE||Object.keys(TOP100)[0];
  const es=DB.notation==='es',mine=(DB.songs||[]).map(s=>({id:s.id,src:s.src,mine:1})),trad=TRAD.map((src,i)=>({id:'pd'+i,src}));
  const keyTxt=(P,sh)=>chName(P.key,sh,P.key,es)+(P.key.minor&&!/m/.test(P.key.suf||'')?'m':'');
  const row=s=>{const P=songParse(s.src),sh=(DB.kt||{})[s.id]||0,k=keyTxt(P,sh),b=(DB.kbpm||{})[s.id]||P.bpm;
    return`<a class="srow" href="#/cancionero/ver/${s.id}" data-q="${esc(normTxt(P.title+' '+P.artist))}">${coverHTML(P.title,s.mine?P.artist:'')}<span class="st"><b>${esc(P.title)}</b><span>${esc(P.artist||'Tu canción')}${P.hasMel?' · con melodía':''}</span></span><span class="sc">${esc(k)}</span><span class="sc">${b}</span><span class="sx">${esc(k)} · ${b}</span></a>`};
  const topRow=x=>{const has=(DB.songs||[]).find(s=>s.top===x.id);
    return`<div class="srow" data-q="${esc(normTxt(x.t+' '+x.a))}">${coverHTML(x.t,x.a)}<a class="st" href="#/cancionero/ver/${has?has.id:x.id}"><b>${esc(x.t)}</b><span>${esc(x.a)} · ${x.y} · ${esc(x.k)} · ${x.bpm}</span></a><span class="sc">${esc(x.k)}</span><span class="sc">${x.bpm}</span>${has?`<a class="btn sm" href="#/cancionero/ver/${has.id}">${IC.play}Abrir</a>`:`<a class="btn sm" href="#/cancionero/editar/${x.id}">${IC.plus}Letra</a>`}</div>`};
  const head=`<div class="shead"><span>Título</span><span>Tono</span><span>BPM</span>${SBTAB==='top'?'<span></span>':''}</div>`;
  const tabs=[['trad','Con letra'],['mine','Mis canciones'],['top','Las 100']];
  const body=SBTAB==='trad'?`<p class="cap" style="margin:0">Canciones tradicionales y de dominio público con letra y acordes completos. Las marcadas «con melodía» traen voz guía.</p><div class="slist">${head}${trad.map(row).join('')}</div>`
   :SBTAB==='mine'?(mine.length?`<div class="slist">${head}${mine.map(row).join('')}</div>`:`<div class="card"><h3>Agrega cualquier canción completa</h3><p class="cap">Copia la letra con acordes de cualquier sitio (como viene: acordes arriba y letra abajo) y pégala. La app la convierte en karaoke con tu tono, banda de acompañamiento y metrónomo. Se guarda solo en este dispositivo.</p></div>`)
   :`<div class="card note"><b>Estas 100 no traen la letra.</b> Sus letras tienen derechos de autor. Toca <b>Letra</b>, busca la canción, copia la letra con acordes y pégala: queda completa en karaoke con tono, banda y metrónomo.</div>
     <div class="chips" id="sbg">${Object.keys(TOP100).map(g=>`<button class="chip" data-g="${g}" aria-pressed="${g===SBGENRE}">${g}</button>`).join('')}</div>
     <div class="slist top">${head}${TOPLIST.filter(x=>SBQ||x.g===SBGENRE).map(topRow).join('')}</div>`;
  const n=SBTAB==='trad'?trad.length:SBTAB==='mine'?mine.length:TOPLIST.length;
  return{title:'Cancionero',html:`<div class="sbtop"><div class="sbtt"><h1>Cancionero</h1><span class="sbn">${n} canciones</span></div>
   <label class="sbsearch"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/></svg><input id="sbq" type="search" placeholder="Buscar canción o artista" value="${esc(SBQ)}" autocomplete="off"></label>
   <a class="btn sbadd" href="#/cancionero/editar/nueva">${IC.plus}Agregar</a></div>
  <div class="seg" id="sbt">${tabs.map(([k,l])=>`<button data-tab="${k}" aria-pressed="${SBTAB===k}">${l}</button>`).join('')}</div>${body}<p class="cap sbnone" hidden>No encontré esa canción aquí. Prueba en otra pestaña o agrégala.</p>`,
  mount(r){
    const filt=()=>{const q=normTxt(SBQ);let any=0;$$('.srow',r).forEach(x=>{const ok=!q||x.dataset.q.includes(q);x.hidden=!ok;if(ok)any++});const g=$('#sbg',r);if(g)g.hidden=!!q;const no=$('.sbnone',r);if(no)no.hidden=!!any||!q;coverWatch(r)};
    // en Las 100, al buscar se muestran todos los géneros
    $('#sbq',r).oninput=e=>{const was=!!SBQ;SBQ=e.target.value;if(SBTAB==='top'&&was!==!!SBQ){route();setTimeout(()=>{const i=$('#sbq');if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length)}});return}filt()};
    filt();
    r.addEventListener('click',e=>{const t=e.target.closest('[data-tab]');if(t){SBTAB=t.dataset.tab;route();return}const g=e.target.closest('[data-g]');if(g){SBGENRE=g.dataset.g;route()}})}};
}
/* ---------- cancionero: editor ---------- */
function viewSongEdit(id){
  const ex=id!=='nueva'?sbGet(id):null,isTop=ex&&ex.top;
  const head=isTop?topHead(ex.top).replace(/\}\{/g,'}\n{')+'\n\n':'';
  const tpl=ex&&ex.mine?ex.src:isTop?head:`{title:Nombre de la canción}\n{artist:Artista}\n{bpm:90}\n\n`;
  return{title:ex&&ex.mine?'Editar canción':isTop?ex.top.t:'Nueva canción',back:'#/cancionero',html:`
  ${isTop?`<div class="card note"><b>Paso 1.</b> Busca la letra con acordes. <b>Paso 2.</b> Copia toda la canción. <b>Paso 3.</b> Regresa y toca «Pegar del portapapeles».<div class="row" style="margin-top:10px"><a class="btn sm pri" target="_blank" rel="noopener" href="https://www.google.com/search?q=${encodeURIComponent(ex.top.t+' '+ex.top.a+' letra y acordes')}">Buscar letra y acordes</a></div></div>`:''}
  <div class="card" style="display:flex;flex-direction:column;gap:12px">
   <div class="row"><label class="btn sm pri" for="sbaud">${IC.wave}Crear desde audio</label><input type="file" id="sbaud" accept="audio/*,video/*" hidden><span id="sbrecw"></span><label class="btn sm" for="sbfile">${IC.down}Subir PDF o archivo</label><input type="file" id="sbfile" accept=".pdf,.txt,.pro,.cho,.chopro,.crd,application/pdf,text/plain" hidden><button class="btn sm" id="sbpaste">Pegar del portapapeles</button>${iaReady()?`<button class="btn sm" id="sbia">Ordenar con IA</button>`:`<a class="btn sm" href="#/ia">Conectar IA</a>`}<span class="cap" style="margin:0">o pega con el teclado dentro del cuadro</span></div>
   <textarea id="sbsrc" rows="16" spellcheck="false" placeholder="Pega aquí la canción: acordes arriba y letra abajo, o [Sol]letra con [Re]acordes">${esc(tpl)}</textarea>
   <div id="sbprev" class="cap" style="margin:0"></div>
   <div class="sbopts" id="sbopts"><div><span class="cl">Ritmo de la banda</span><select class="inp" id="sbsty"></select></div>
    <div><span class="cl">Compás</span><div class="seg">${[[4,'4/4'],[3,'3/4 vals']].map(([v,l])=>`<button data-eb="${v}">${l}</button>`).join('')}</div></div>
    <div><span class="cl">Tempo (bpm)</span><div class="row"><input class="inp" id="sbbpm" type="number" inputmode="numeric" min="40" max="220" style="width:96px"><button class="btn sm" id="sbtap">Marcar</button></div></div></div>
   <div class="row"><button class="btn pri" id="sbsave">${IC.check}Guardar y abrir</button>${ex&&ex.mine?`<span id="sbdw"><button class="btn" id="sbdel">${IC.x}Borrar</button></span>`:''}</div>
   <p class="cap" id="sbmsg" style="margin:0"></p></div>
  <div class="box"><p class="blockh">Formatos que entiende</p><ul>
   <li><b>Acordes arriba y letra abajo</b>, como en LaCuerda, Cifra Club o Ultimate Guitar. Pégala tal cual.</li>
   <li><b>Acordes entre corchetes</b>: <code>[Sol]Hoy me desperté [Re7]pensando</code>.</li>
   <li>Acordes en <b>Do Re Mi</b> o en <b>C D E</b>, con séptimas, menores, sus, add9 y bajos (<code>G/B</code>).</li>
   <li>Títulos como <code>[Coro]</code>, <code>Verso 1</code> o <code>Intro: G D Em C</code> se marcan solos; las tablaturas se ignoran.</li>
   <li>Opcional: <code>{bpm:96}</code> tempo, <code>{time:3/4}</code> vals o ranchera, <code>{style:balada}</code> (folk, pop, balada, rock, vals, ranchera, cumbia, son, urbano), <code>{key:Am}</code> tono. Si no los pones, la app calcula el tono con los acordes y sugiere ritmo; en el reproductor puedes cambiar ritmo, compás y marcar el tempo tocando.</li></ul></div>`,
  mount(r){
    const ta=$('#sbsrc',r);
    // cómo suena: ritmo, compás y tempo; si la canción está entre las 100, se toman de ahí
    const E={style:null,beats:4,bpm:90,touched:{}};const nrm=x=>String(x||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
    const guess=P=>{const tp=isTop?ex.top:TOPLIST.find(x=>nrm(x.t)===nrm(P.title)&&nrm(P.title).length>2);
      if(!E.touched.beats)E.beats=P.set.time?P.beats:tp&&/\|3$/.test(TOPSONG[tp.t]||'')?3:P.beats;
      if(!E.touched.bpm)E.bpm=P.set.bpm||P.set.tempo?P.bpm:tp?tp.bpm:P.bpm;
      if(!E.touched.style)E.style=P.set.style?P.style:tp?topStyle(tp):P.style;E.style=grooveFor(E.style,E.beats)};
    const paintOpts=()=>{$('#sbsty',r).innerHTML=Object.entries(GROOVES).filter(([k,g])=>g[E.beats]).map(([k,g])=>`<option value="${k}" ${k===E.style?'selected':''}>${g.n}</option>`).join('');
      $$('[data-eb]',r).forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.eb===E.beats)));const bi=$('#sbbpm',r);if(document.activeElement!==bi)bi.value=E.bpm};
    $('#sbsty',r).onchange=e=>{E.style=e.target.value;E.touched.style=1};
    $$('[data-eb]',r).forEach(b=>b.onclick=()=>{E.beats=+b.dataset.eb;E.touched.beats=1;E.style=grooveFor(E.style,E.beats);paintOpts()});
    $('#sbbpm',r).oninput=e=>{const v=+e.target.value;if(v>=40&&v<=220){E.bpm=v;E.touched.bpm=1}};
    let taps=[];$('#sbtap',r).onclick=()=>{const now=performance.now();taps=taps.filter(x=>now-x<2500);taps.push(now);if(taps.length>=4){const b=Math.round(60000/((taps[taps.length-1]-taps[0])/(taps.length-1)));if(b>=40&&b<=220){E.bpm=b;E.touched.bpm=1;paintOpts()}}$('#sbtap',r).textContent=taps.length<4?'Toca '+(4-taps.length):'Marcar'};
    const prev=()=>{const P=songParse(ta.value),n=P.lines.filter(l=>l.pieces).length,w=P.lines.filter(l=>l.pieces&&l.pieces.some(p=>p.text.trim())).length;guess(P);paintOpts();$('#sbopts',r).hidden=!n;$('#sbprev',r).innerHTML=n?`Detecté <b>${n}</b> renglones (${w} con letra) y <b>${P.chords.length}</b> acordes distintos · tono <b>${esc(chName(P.key,0,P.key,DB.notation==='es'))}${P.key.minor&&!/m/.test(P.key.suf||'')?'m':''}</b>${P.keyAuto?' (calculado con los acordes)':''}. Abajo elige cómo suena; se puede cambiar después.`:''};
    ta.addEventListener('input',prev);prev();
    $('#sbpaste',r).onclick=async()=>{try{const t=await navigator.clipboard.readText();if(!t){$('#sbmsg',r).textContent='El portapapeles está vacío. Copia la canción primero.';return}ta.value=(isTop?head:'')+t;prev();$('#sbmsg',r).textContent=''}catch(e){$('#sbmsg',r).textContent='Tu navegador no dejó leer el portapapeles. Mantén presionado el cuadro y elige «Pegar».';ta.focus()}};
    $('#sbsave',r).onclick=()=>{
      const src=`{bpm:${E.bpm}}{time:${E.beats}/4}{style:${E.style}}\n`+ta.value.replace(/\{\s*(style|time|bpm|tempo)\s*:[^}]*\}[ \t]*\n?/gi,'');const P=songParse(src);
      if(!P.lines.some(l=>l.pieces&&l.pieces.some(p=>p.text.trim()||p.p))){$('#sbmsg',r).textContent='No encontré letra ni acordes. Revisa lo que pegaste.';return}
      DB.songs=DB.songs||[];const sid=ex&&ex.mine?id:'u'+Date.now().toString(36);
      const i=DB.songs.findIndex(s=>s.id===sid);if(i>=0)DB.songs[i].src=src;else DB.songs.unshift(Object.assign({id:sid,src},isTop?{top:id}:{}));
      if(E.strum){DB.kai=DB.kai||{};DB.kai[sid]=Object.assign({},DB.kai[sid],{pat:{sub:4,beats:E.beatsPdf||4,tip:'Rasgueo de la hoja de la canción.',secs:{verso:{g:E.strum,b:null,f:1}}},useP:true})}
      const open=()=>{SBTAB='mine';location.hash='#/cancionero/ver/'+sid};
      if(E.audio){DB.kuse=DB.kuse||{};DB.kuse[sid]=true;const rec={blob:E.audio,name:E.audio.name||'grabacion.mp3',type:E.audio.type||'audio/mpeg'};
        /* creada desde el audio: ya se sabe en qué segundo empieza cada renglón y cada acorde (no se vuelve a adivinar).
           Si cambiaste renglones en el editor y ya no cuadran, la app la sincroniza sola al abrirla. */
        const PL=P.lines.map((L,li)=>[L,li]).filter(([L])=>L.pieces),S=E.sync;
        if(S&&S.mode==='chart'&&S.times.length===PL.length){DB.ksync=DB.ksync||{};DB.ksync[sid]={};const lend={};PL.forEach(([L,li],k)=>{if(S.times[k]!=null)DB.ksync[sid][li]=S.times[k];if(S.ends[k]!=null)lend[li]=S.ends[k]});
          DB.kbpm=DB.kbpm||{};DB.kbpm[sid]=S.bpm;Object.assign(rec,{grid:S.grid,dur:S.dur,lend,ancs:{[sid]:S.anc}})}
        else if(S&&S.TM&&S.TM.length===PL.length){DB.ksync=DB.ksync||{};DB.ksync[sid]={};const pch={};PL.forEach(([L,li],k)=>{DB.ksync[sid][li]=+S.TM[k].t.toFixed(3);pch[li]=S.TM[k].ch.map(t=>+t.toFixed(3))});
          DB.kbpm=DB.kbpm||{};DB.kbpm[sid]=S.bpm;Object.assign(rec,{grid:S.grid,dur:S.dur,pch})}
        else DB.kautosync=sid;
        save();toast(logo()+'<span>Canción guardada con tu audio</span>');
        slowIDB().then(db=>new Promise(res=>{const tx=db.transaction('f','readwrite');tx.objectStore('f').put(rec,'orig:'+sid);tx.oncomplete=res;tx.onerror=res})).catch(()=>{}).then(open);return}
      save();toast(logo()+'<span>Canción guardada</span>');open();
    };
    /* como Moises: de un audio salen el pulso y los acordes (la app sola) y la letra con sus tiempos (la IA);
       al guardar, la canción queda con ese audio y se sincroniza al abrirla */
    const fromAudio=async f=>{const msg=t=>{const m=$('#sbmsg',r);if(m)m.textContent=t};
      try{msg('Escuchando el audio: pulso y acordes…');const{x,xs,sr}=await syncDecode(f);
        const A=await syncAnalyze(x,sr,0,p=>msg(`Escuchando el audio: pulso y acordes… ${Math.round(p*100)} %`),xs);if(!A||A.beats.length<8)throw new Error('No encontré el pulso de este audio.');
        const meta=isTop?{title:ex.top.t,artist:ex.top.a}:{title:(f.name||'Mi canción').replace(/\.[^.]+$/,'')};let lyr=null,why='',allowed=null;
        // primero la IA: letra con tiempos y los acordes que usa la canción; luego el audio elige entre esos acordes
        if(iaHears()){const t0=Date.now(),tk=setInterval(()=>msg(`La IA está sacando la letra y los acordes… ${Math.round((Date.now()-t0)/1000)} s`),1000);msg('La IA está sacando la letra y los acordes…');
          try{const L=await iaLyricsTimed(f);lyr=L.lines;allowed=L.chords;if(!isTop){if(L.title)meta.title=L.title;if(L.artist)meta.artist=L.artist}}catch(err){why=err.message}clearInterval(tk)}
        if(!allowed&&isTop)allowed=ex.top.prog.split(' ');
        // la lista de acordes de la IA solo se usa si suena tan bien como la detección libre (si la IA se equivocó, se ignora)
        let R=chordsFromAudio(A,allowed);if(allowed&&allowed.length){const Rf=chordsFromAudio(A,null);if(Rf&&(!R||R.fit<Rf.fit-.03))R=Rf}if(!R)throw new Error('No encontré el pulso de este audio.');
        const SF=songFromAudio(R,lyr&&lyr.filter(x=>x.text),meta);let src=SF.src,how='acordes detectados del audio';
        E.sync={grid:R.grid.map(t=>+t.toFixed(3)),TM:SF.TM,bpm:Math.round(R.bpm),dur:x.length/sr};
        /* la hoja de la IA (acordes como en los cancioneros) contra el audio: se usa si cuadra al menos igual que la detectada;
           si la grabación está en otro tono, se transporta. Los tiempos salen de alinear la hoja con la grabación. */
        const chart=lyr&&lyr.filter(x=>/\[[^\]]+\]/.test(x.cp)).length>=Math.max(2,lyr.length*.5)?chartFromLines(lyr,meta,R.bpm):null;
        if(chart){msg('Comparando los acordes de la IA con tu audio…');await syncIdle();
          const Fc=chartFit(A,chart),Fd=chartFit(A,SF.src);
          if(Fc&&(!Fd||Fc.R.cost<=Fd.R.cost+.04)){let cs=chart,F=Fc;if(Fc.R.k&&Fc.R.sure){cs=transposeSrc(chart,Fc.R.k);F=chartFit(A,cs)||Fc}
            src=cs;how=Fc.R.k&&Fc.R.sure?'acordes de cancionero, pasados al tono de tu grabación':'acordes de cancionero comprobados con tu audio';
            // inicio de cada renglón: el del alineado (exacto al pulso) salvo que la IA lo oiga claramente en otro lado
            const PL=F.TL.lines,byLi={};lyr.forEach(x=>{});const T=F.R.T,times=[],ends=[];let k=0;
            F.P.lines.forEach((L,li)=>{if(!L.pieces)return;const ent=chartLineRef[k]||null;k++;let t=T[li];if(ent&&ent.t!=null&&(t==null||Math.abs(t-ent.t)>1.5))t=gridT(F.R.grid,Math.round(gridIdx(F.R.grid,ent.t)));times.push(t==null?null:+(+t).toFixed(3));ends.push(ent&&ent.e!=null?+ent.e.toFixed(2):null)});
            E.sync={mode:'chart',times,ends,grid:F.R.grid,bpm:Math.round(A.bpm),dur:x.length/sr,anc:{a:F.R.anc||[],sig:F.sig}}}}
        ta.value=src;E.touched={};E.audio=f;prev();
        const n=new Set((src.match(/\[[^\]]+\]/g)||[]).filter(c=>chParse(c.slice(1,-1)))).size;
        msg(`Listo (${how}): ${Math.round(R.bpm)} bpm y ${n} acordes${lyr&&lyr.length?` con ${lyr.filter(x=>x.text).length} renglones de letra`:''}.${!lyr?(iaHears()?' No salió la letra: '+why:' Para sacar también la letra conecta Gemini u OpenAI en Asistente IA.'):''} Revisa y toca «Guardar y abrir»: la canción queda con tu audio y sincronizada.`)}
      catch(err){msg(err.message||'No pude escuchar ese audio.')}};
    $('#sbaud',r).onchange=e=>{const f=e.target.files&&e.target.files[0];e.target.value='';if(f)fromAudio(f)};
    // si ya subiste la grabación de esta canción en el reproductor, se puede usar esa
    if(ex)slowIDB().then(db=>new Promise(res=>{const q=db.transaction('f').objectStore('f').get('orig:'+id);q.onsuccess=()=>res(q.result);q.onerror=()=>res(null)})).then(rec=>{const w=$('#sbrecw',r);if(!rec||!rec.blob||!w)return;
      w.innerHTML=`<button class="btn sm" id="sbrec">Usar mi grabación</button>`;$('#sbrec',r).onclick=()=>fromAudio(new File([rec.blob],rec.name||'grabacion.mp3',{type:rec.type||rec.blob.type||'audio/mpeg'}))}).catch(()=>{});
    // PDF de Ultimate Guitar (o TXT / ChordPro): título, artista, tono, tempo, secciones y acordes sin copiar y pegar
    $('#sbfile',r).onchange=async e=>{const f=e.target.files&&e.target.files[0];e.target.value='';if(!f)return;$('#sbmsg',r).textContent='Leyendo '+f.name+'…';
      const tk=setInterval(()=>{const m=$('#sbmsg',r);if(m&&/^Leyendo/.test(m.textContent))m.textContent=m.textContent.replace(/( · \d+ s)?$/,' · '+Math.round((Date.now()-t0)/1000)+' s')},1000),t0=Date.now();
      try{const R=await importSongFile(f);clearInterval(tk);ta.value=(isTop?head:'')+R.src;E.touched={};E.strum=R.strum||null;E.beatsPdf=R.meta.beats||4;prev();
        $('#sbmsg',r).textContent=`Listo: leí «${R.meta.title||f.name}»${R.meta.artist?' de '+R.meta.artist:''}${R.meta.key?' · tono '+R.meta.key:''}${R.meta.bpm?' · '+R.meta.bpm+' bpm':''}${R.ia?' (con IA)':''}${R.strum?' · con su rasgueo':''}. Revisa y toca «Guardar y abrir».`}
      catch(err){clearInterval(tk);$('#sbmsg',r).textContent=err.message||'No pude leer ese archivo.'}};
    const ib=$('#sbia',r);if(ib)ib.onclick=async()=>{if(!ta.value.trim()){$('#sbmsg',r).textContent='Primero pega la canción.';return}ib.disabled=true;$('#sbmsg',r).textContent='La IA está ordenando la letra y los acordes…';
      try{const keep=(ta.value.match(/^\s*\{(title|t|artist|a|key|bpm|tempo|time|style)\s*:[^}]*\}\s*$/gim)||[]).join('\n');const t=await iaArrange(ta.value,'');ta.value=(keep&&!/\{\s*title/i.test(t)?keep+'\n\n':'')+t;prev();$('#sbmsg',r).textContent='Listo. Revisa y toca «Guardar y abrir».'}catch(e){$('#sbmsg',r).textContent=e.message}ib.disabled=false};
    const d=$('#sbdel',r);if(d)d.onclick=()=>{$('#sbdw',r).innerHTML='<button class="btn" id="sbdelok" style="border-color:var(--bad);color:var(--bad)">Sí, borrar</button>';$('#sbdelok',r).onclick=()=>{DB.songs=DB.songs.filter(s=>s.id!==id);save();SBTAB='mine';location.hash='#/cancionero'}};
  }};
}
/* ---------- cancionero: reproductor karaoke ---------- */
const KAR={show:'both',met:false,band:true,voice:true,size:1};
function capoHint(key,shift){
  if(INST.id==='bateria')return 'Sigue la rejilla: cada columna indica cuándo tocar.';
  if(INST.id==='bajo')return 'Raíz = R · quinta = 5 · octava = 8. Toca una nota a la vez.';
  const target=(key.pc+shift+120)%12,easy=key.minor?[9,4,2]:[0,7,2,9,4];
  for(let c=0;c<=7;c++){const shape=(target-c+12)%12;if(easy.includes(shape))return c===0?'Se toca con acordes abiertos, sin capo.':`Truco: capo en el traste ${c} y toca con las formas de ${noteName(shape,false,DB.notation==='es')}${key.minor?'m':''}.`}
  return'';
}
const KARR={d:'<path d="M12 4v15M6.5 13.5L12 19l5.5-5.5"/>',u:'<path d="M12 20V5M6.5 10.5L12 5l5.5 5.5"/>',x:'<path d="M12 4v15M6.5 13.5L12 19l5.5-5.5"/><path d="M8 6l8 6M16 6l-8 6" stroke-width="1.4"/>'};
function patHTML(style,beats){
  const id=grooveFor(style,beats),G=GROOVES[id],P=G[beats===3?3:4].g,sub=G.sub;
  // si todo cae en corcheas, se muestra por corcheas (más claro); si no, cada celda
  const half=sub===4&&[...P].every((c,i)=>i%2===0||c==='-'),step=half?2:1,cells=[];
  for(let i=0;i<P.length;i+=step)cells.push([P[i],i]);
  const lbl=i=>{const b=Math.floor(i/sub)+1,r=i%sub;return r===0?String(b):sub===3?(r===1?'·':'a'):half?'y':(r===2?'y':'·')};
  return`<div class="kpat" style="--n:${cells.length}" data-step="${step}">${cells.map(([c,i],k)=>{const lc=c.toLowerCase(),strong=c!==lc;
    const g=c==='-'?'<span class="rest">·</span>':c==='B'||c==='b'?`<span class="bass">${c==='B'?'B':'b'}</span>`:c==='c'||c==='C'?`<span class="bass">${c==='C'?'B+':'•'}</span>`:/\d/.test(c)?`<span class="str">${c}</span>`:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strong?2.4:1.6}" stroke-linecap="round" stroke-linejoin="round">${KARR[lc]}</svg>`;
    return`<span class="sl${strong&&/[dux]/i.test(c)?' acc':''}" data-sl="${k}">${g}<small>${lbl(i)}</small></span>`}).join('')}</div>`;
}
/* ---------- banda pre-grabada por tramos ----------
   En vez de crear cientos de notas en vivo (el teléfono puede atrasarse y el ritmo tropieza), cada tramo de 4 compases
   se graba en una OfflineAudioContext con el mismo motor (bandStep) y se reproduce como un solo audio, en su lugar exacto. */
const BR={gen:0,src:[],ir:null,live:false};
function bufHasSound(b){if(!b)return false;const d=b.getChannelData(0);for(let i=0;i<d.length;i+=64)if(Math.abs(d[i])>1e-4)return true;return false}
function bandRender(steps,cd){
  const OAC=window.OfflineAudioContext||window.webkitOfflineAudioContext,live=[AC,MASTER,REV],sr=AC.sampleRate,off=new OAC(2,Math.ceil((steps.length*cd+2.8)*sr),sr);
  if(!BR.ir){const n=Math.floor(sr*1.4),ir=off.createBuffer(2,n,sr);for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,3.2)}BR.ir=ir}
  const keep=Object.assign({},GSTR);for(const k in GSTR)delete GSTR[k];
  try{AC=off;MASTER=off.createGain();MASTER.connect(off.destination);REV=off.createConvolver();REV.buffer=BR.ir;const rg=off.createGain();rg.gain.value=.16;REV.connect(rg);rg.connect(MASTER);
    steps.forEach((x,j)=>{if(x){BDYN=x.dy||1;bandStep(x.G,x.bt,x.i,x.p,x.sh,j*cd,x.spb,x.bar,x.ci)}});BDYN=1}
  finally{[AC,MASTER,REV]=live;for(const k in GSTR)delete GSTR[k];Object.assign(GSTR,keep)}
  // Safari viejo entrega el resultado por evento y no por promesa
  return new Promise((res,rej)=>{off.oncomplete=e=>res(e.renderedBuffer);try{const p=off.startRendering();if(p&&p.then)p.then(res,rej)}catch(e){rej(e)}});
}
function bandPlay(buf,when,gain){
  const src=AC.createBufferSource();src.buffer=buf;if(gain!=null){const g=AC.createGain();g.gain.value=gain;src.connect(g);g.connect(out())}else src.connect(out());const now=AC.currentTime;
  if(when>=now+.005)src.start(when);else{const late=now+.02-when;if(late<buf.duration)src.start(now+.02,late);else return}
  BR.src.push(src);src.onended=()=>{BR.src=BR.src.filter(x=>x!==src)};
}
function bandStop(){BR.gen++;BR.src.forEach(x=>{try{x.stop()}catch(e){}});BR.src=[]}
function viewSongPlay(id,slow){
  const s=sbGet(id);if(!s)return viewSongbook();
  Object.assign(KAR,DB.kar||{});DB.kai=DB.kai||{};
  // canciones con solo la progresión (Las 100): con tu grabación, la progresión se repite toda la canción
  const REC={dur:0,on:false},CHONLY=!songParse(s.src).lines.some(l=>l.pieces&&l.pieces.some(p=>p.text.trim()));
  const AIo=()=>DB.kai[id]||{},usingAI=()=>!!(AIo().src&&AIo().on!==false),srcNow=()=>usingAI()?AIo().src:CHONLY&&REC.on&&REC.dur?expandProg(s.src,REC.dur):s.src,SK=()=>id+(usingAI()?'~ia':'');
  // la versión de la IA puede no traer tempo, compás o ritmo: se toman de la original
  const fixP=Q=>{if(usingAI()){const O0=songParse(s.src);if(Q.title==='Sin título')Q.title=O0.title;if(!Q.artist)Q.artist=O0.artist;if(!Q.set.bpm&&!Q.set.tempo)Q.bpm=O0.bpm;if(!Q.set.time){Q.time=O0.time;Q.beats=O0.beats}if(!Q.set.style)Q.style=O0.style;if(!Q.set.pickup)Q.pickup=O0.pickup}return Q};
  /* acordes: 0 originales · 1 sencillos (mismo tono: tríadas, sin 7, sus ni bajos; se toca igual con la grabación, sin capo)
     · 2 fáciles (además el tono con acordes abiertos; el capo solo se sugiere si quieres sonar igual que la original) */
  if(KAR.easy==null)KAR.easy=KAR.simple?2:0;const EZ=()=>INST.id==='bateria'?0:INST.id!=='guitarra'?Math.min(1,KAR.easy):KAR.easy;
  const mkP=()=>{const Q=fixP(songParse(srcNow()));if(EZ()>=1)simplifyP(Q);return Q};
  let P0=fixP(songParse(srcNow())),P=mkP(),secs=lineSections(P);DB.kt=DB.kt||{};DB.kbpm=DB.kbpm||{};DB.kst=DB.kst||{};
  DB.kbeats=DB.kbeats||{};DB.ksp=DB.ksp||{};const st={sp:slow?(DB.ksp[id]&&DB.ksp[id]<1?DB.ksp[id]:.75):1,loop:0,shift:DB.kt[id]||0,bpm:DB.kbpm[id]||P.bpm,bars:0,style:GROOVES[DB.kst[id]]?DB.kst[id]:P.style,beats:DB.kbeats[id]||P.beats};
  const EASYT=()=>EZ()===2;if(EASYT())st.shift=easyShift(P);
  const gid=()=>grooveFor(st.style,st.beats),RES=()=>GROOVES[gid()].sub;
  const styChips=()=>Object.entries(GROOVES).filter(([k,g])=>g[st.beats===3?3:4]).map(([k,g])=>`<button class="chip" data-sty="${k}" aria-pressed="${gid()===k}">${g.n}</button>`).join('');
  Object.assign(KAR,DB.kar||{});
  if(INST.id==='bajo')KAR.bassPlayer=DB.bassPlayer!==false;
  if(INST.id==='bateria')KAR.drumPlayer=DB.drumPlayer!==false;
  const es=()=>DB.notation==='es';
  const keyLbl=()=>chName(P.key,st.shift,P.key,es())+(P.key.minor&&!/m/.test(P.key.suf||'')?'m':'');
  const lineHTML=(l,i)=>{
    if(l.gap)return'<div class="kgap"></div>';
    if(l.label!=null)return`<div class="klab">${esc(l.label)}</div>`;
    const words=[];l.pieces.forEach((pc,pi)=>{if(pc.sp||!words.length)words.push([]);words[words.length-1].push([pc,pi])});
    const onlyCh=!l.pieces.some(p=>p.text.trim());
    return`<div class="kl${onlyCh?' inst':''}" data-li="${i}">${words.map(w=>`<span class="wd">${w.map(([pc,pi],wi)=>{const nm=pc.p&&!pc.hide?chName(pc.p,st.shift,P.key,es()):'';return`<span class="pc${pc.p?' hc':''}${wi<w.length-1&&pc.text?' mid':''}" data-pi="${pi}"><b class="kc">${nm?esc(nm):''}</b><i>${esc(pc.text)||''}</i></span>`}).join('')}</span>`).join(' ')}</div>`;
  };
  const chips=()=>P.chords.map(p=>{const v=voicing(p,st.shift),n=chName(p,st.shift,P.key,es());return`<button class="kchip" data-kc="${esc(chName(p,st.shift,P.key,false))}">${chordSVG(v)}<b>${esc(n)}</b></button>`}).join('');
  // íconos del reproductor
  const KI=(d,f)=>`<svg viewBox="0 0 24 24" fill="${f?'currentColor':'none'}" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const KIC={tono:KI('<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>'),tempo:KI('<path d="M8 21h8l-1.5-15h-5z"/><path d="M12 14l5-9"/>'),son:KI('<path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2"/>'),
    grab:KI('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5"/>'),rep:KI('<path d="M17 2l3 3-3 3"/><path d="M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3"/><path d="M20 13v2a4 4 0 0 1-4 4H4"/>'),mas:KI('<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>'),
    ia:KI('<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>'),
    letras:KI('<path d="M4 6h16M4 12h11M4 18h14"/>'),acordes:KI('<rect x="3" y="4" width="8" height="7" rx="1.5"/><rect x="13" y="4" width="8" height="7" rx="1.5"/><rect x="3" y="13" width="8" height="7" rx="1.5"/><rect x="13" y="13" width="8" height="7" rx="1.5"/>'),
    formas:KI('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M5 7h14M9.7 7v14M14.3 7v14M5 11.7h14M5 16.3h14"/>'),pistas:KI('<path d="M4 8h3M4 16h6M13 8h7M16 16h4"/><circle cx="10" cy="8" r="2"/><circle cx="13" cy="16" r="2"/>'),
    full:KI('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'),
    prev:KI('<path d="M6 5v14"/><path d="M18 6l-9 6 9 6z" fill="currentColor"/>'),next:KI('<path d="M18 5v14"/><path d="M6 6l9 6-9 6z" fill="currentColor"/>'),restart:KI('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'),edit:KI('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>')};
  const tool=(k,l)=>`<button class="ktool" data-panel="${k}" aria-pressed="false">${KIC[k]}<b id="kt-${k}"></b><small>${l}</small></button>`;
  const panel=(k,t,h)=>`<div class="kpanel" data-p="${k}" hidden><div class="kph"><b>${t}</b><button class="kic" data-pclose aria-label="Cerrar">${IC.x||'×'}</button></div>${h}</div>`;
  return{title:P.title,back:slow?'#/practicar/lento':'#/cancionero',html:`<div class="kplay">
  <div class="kamb" aria-hidden="true">${coverHTML(P.title,s.mine||s.top?P.artist:'')}</div>
  <div class="khead">${coverHTML(P.title,s.mine||s.top?P.artist:'',1)}<div class="kht"><span class="eyebrow">${esc(P.artist||'Tu canción')}</span><h2>${esc(P.title)}</h2><small class="kmeta" id="kmeta"></small></div>${s.mine?`<a class="kic" href="#/cancionero/editar/${id}" aria-label="Editar canción">${KIC.edit}</a>`:s.top?`<a class="btn sm pri" href="#/cancionero/editar/${id}">${IC.plus}Letra</a>`:''}</div>
  <div class="kextra">${s.mine||s.trad&&P.hasMel?`<button class="btn sm" id="kretoplay">Jugar como reto</button>`:''}<button class="btn sm" id="kbeatgo">Tocar con un beat</button><button class="btn sm kiabtn" data-panel="ia">${KIC.ia}Asistente IA</button></div>
  ${s.top?`<div class="card note">Esta es solo la <b>progresión principal</b> para practicar con la banda. Para tener la canción completa con letra, toca <b>Letra</b>.</div>`:''}
  <div class="ktools" role="toolbar" aria-label="Ajustes de la canción">${tool('tono','Tono')}${tool('tempo','Tempo')}${tool('son','Sonido')}${tool('grab','Grabación')}${tool('rep','Repetir')}${tool('mas','Ritmo')}</div>
  <div class="kpanels card kctl" hidden>
   ${panel('tono','Tono',`<div class="row"><button class="btn sm" data-k="-1" aria-label="Bajar medio tono">${IC.minus}</button><b class="kkey" id="kkey">${esc(keyLbl())}</b><button class="btn sm" data-k="1" aria-label="Subir medio tono">${IC.plus}</button><button class="btn sm" data-k="0">Original</button></div>
    <p class="cap" id="kcapo" style="margin:0">${capoHint(P.key,st.shift)}</p>`)}
   ${panel('tempo','Tempo y velocidad',`<div class="row"><button class="btn sm" data-b="-4" aria-label="Más lento">${IC.minus}</button><b class="kkey" id="kbpm">${st.bpm}</b><button class="btn sm" data-b="4" aria-label="Más rápido">${IC.plus}</button><button class="btn sm" id="ktap" title="Toca 4 veces al ritmo de la canción">Marcar</button></div>
    <div class="kslow${slow?' hl':''}"><div><span class="cl">Velocidad${slow?' · cámara lenta':''}</span><div class="chips">${[.5,.6,.75,.9,1].map(v=>`<button class="chip" data-sp="${v}" aria-pressed="${st.sp===v}">${Math.round(v*100)} %</button>`).join('')}</div></div><p class="cap" id="kspd" style="margin:0"></p></div>`)}
   ${panel('son','Sonido',`<div class="krow ksnd"><button class="btn ${KAR.band?'on':''}" data-t="band">${IC.wave}<span>${KAR.band?'Con música':'Sin música'}</span></button><button class="btn ${KAR.met?'on':''}" data-t="met">${IC.play2}Metrónomo</button>${P.hasMel?`<button class="btn ${KAR.voice?'on':''}" data-t="voice">${IC.note}Voz guía</button>`:''}</div>
    <div><span class="cl">Sincronizar luces con el sonido</span><div class="seg">${[[0,'Normal'],[150,'+150 ms'],[300,'+300 ms'],[450,'+450 ms']].map(([v,l])=>`<button data-lat="${v}" aria-pressed="${(+(INST.id==='bateria'?DB.visualLat:DB.lat)||0)===v}">${l}</button>`).join('')}</div><p class="cap" style="margin:6px 0 0">Si la letra se ilumina antes de que suene (pasa con audífonos Bluetooth), sube el ajuste.</p></div>`)}
   ${panel('grab','Tu grabación',`<div class="korig" id="korig"></div>`)}
   ${panel('ia','Asistente IA',`<div id="kia"></div>`)}
   ${panel('rep','Repetir',`<div><span class="cl">Desde el renglón elegido</span><div class="seg">${[[0,'No'],[1,'1 renglón'],[2,'2'],[4,'4']].map(([v,l])=>`<button data-lp="${v}" aria-pressed="${st.loop===v}">${l}</button>`).join('')}</div></div><p class="cap" style="margin:0">Toca un renglón de la letra para empezar ahí.</p>`)}
   ${panel('mas','Ritmo, compás y vista',`<div><span class="cl">Ritmo de la banda</span><div class="chips" id="kstys">${styChips()}</div></div>
    <div class="krow"><div><span class="cl">Compás</span><div class="seg">${[[4,'4/4'],[3,'3/4 vals']].map(([v,l])=>`<button data-beats="${v}" aria-pressed="${st.beats===v}">${l}</button>`).join('')}</div></div>
    ${P.lines.some(l=>l.pieces&&!l.mel)?`<div><span class="cl">Compases por renglón</span><select class="inp" id="kbpl" style="width:auto">${[0,1,2,3,4,6,8].map(v=>`<option value="${v}" ${v===st.bars?'selected':''}>${v||'Automático'}</option>`).join('')}</select></div>`:''}</div>
    <div><span class="cl">Ver</span><div class="row"><div class="seg">${[['both','Letra y acordes'],['lyrics','Letra'],['chords','Acordes']].map(([v,l])=>`<button data-show="${v}" aria-pressed="${KAR.show===v}">${l}</button>`).join('')}</div>
    <div class="seg">${[['us','C D E'],['es','Do Re Mi']].map(([v,l])=>`<button data-not="${v}" aria-pressed="${(DB.notation||'us')===v}">${l}</button>`).join('')}</div><button class="btn sm" data-z="-1" aria-label="Letra más chica">A−</button><button class="btn sm" data-z="1" aria-label="Letra más grande">A+</button></div></div>`)}
  </div>
  <div class="kfab" role="toolbar" aria-label="Cómo se ven los acordes">
   <button class="kfb" data-nott title="Cifrado: C D E o Do Re Mi"><b id="kfnot"></b></button>
   ${INST.id!=='bateria'?`<button class="kfb" data-easy="${EZ()?0:INST.id==='guitarra'?2:1}" aria-pressed="${EZ()>0}" title="Acordes fáciles"><b>Fácil</b></button>`:''}
   <button class="kfb" data-stauto aria-pressed="${KAR.stage!==false}" title="Al tocar, abrir la letra en pantalla completa"><b>Escenario</b></button><button class="kfb" data-z="-1" aria-label="Letra más chica"><b>A−</b></button><button class="kfb" data-z="1" aria-label="Letra más grande"><b>A+</b></button></div>
  <div class="kchead">${INST.id!=='bateria'?`<div class="kcg"><span class="cl">Acordes</span><div class="seg" id="kez">${[[0,'Originales'],[1,'Sencillos'],...(INST.id==='guitarra'?[[2,'Fáciles']]:[])].map(([v,l])=>`<button data-easy="${v}" aria-pressed="false">${l}</button>`).join('')}</div></div>`:''}
   <div class="kcg"><span class="cl">Escuchar</span><div class="kmutes" id="kmutes"></div></div></div>
  <p class="keasy" id="keasy" hidden></p>
  <div class="kchips" id="kchips">${chips()}</div>
  <div class="kwrap"><div class="kmain">
   <div class="kview" data-v="letras"><div class="karaoke show-${KAR.show}" id="kar" style="--kz:${KAR.size}">${P.lines.map(lineHTML).join('')}</div></div>
   <div class="kview" data-v="acordes" hidden><div class="kgrid" id="kgrid" style="--kz:${KAR.size}"></div></div>
   <div class="kview" data-v="formas" hidden><div class="kforms" id="kforms"></div></div>
   <div class="kview" data-v="pistas" hidden><div class="kstems" id="kstems"></div></div></div>
  ${INST.id==='bajo'?`<button class="btn ${DB.bassPlayer!==false?'on':''}" data-t="bassPlayer" aria-pressed="${DB.bassPlayer!==false}">Yo toco el bajo</button>`:''}${INST.id==='bateria'?`<div class="drum-sidebar"><button class="btn ${drumPlayer()?'on':''}" data-t="drumPlayer" aria-pressed="${drumPlayer()}">Yo toco la batería</button>`:''}<aside class="kside" id="kside"></aside>${INST.id==='bateria'?'</div>':''}</div>
  <div class="ksync" id="ksync" hidden></div>
  <div class="kstage" id="kstage" hidden aria-label="Modo escenario">
   <div class="ksg-top"><span class="ksg-t"><b>${esc(P.title)}</b>${P.artist?' · '+esc(P.artist):''}</span><span class="ksg-ch" id="ksgch"></span><button class="kic" data-stx aria-label="Salir del modo escenario">${IC.x||'×'}</button></div>
   <div class="ksg-lines" id="ksgl"></div>
   <div class="ksg-bot"><div class="kprog"><i id="ksgp"></i></div><div class="ksg-ctl"><button class="kic" data-step="-1" aria-label="Renglón anterior">${KIC.prev}</button><button class="kplayb" data-stgo aria-label="Tocar o pausar">${IC.play}</button><button class="kic" data-step="1" aria-label="Renglón siguiente">${KIC.next}</button></div></div>
  </div>
  <div class="kdock"><div class="kviews" role="tablist" aria-label="Vista">${[['letras','Letras'],['acordes','Acordes'],['formas','Formas'],['pistas','Pistas']].filter(([v])=>v!=='formas'||INST.id!=='bateria').map(([v,l])=>`<button role="tab" data-view="${v}" aria-selected="false">${KIC[v]}<span>${l}</span></button>`).join('')}</div>
  <div class="kbar"><div class="kprog"><i id="kprogi"></i></div><div class="kbrow"><span class="bd" id="kbd"></span><span class="tm" id="kpos">${st.beats}/4 · ${BSTYLES[gid()]} · listo</span>
   <div class="ktrans"><button class="kic" data-step="-1" aria-label="Renglón anterior">${KIC.prev}</button><button class="kplayb" id="kgo" aria-label="Empezar">${IC.play}</button><button class="kic" data-step="1" aria-label="Renglón siguiente">${KIC.next}</button></div>
   <div class="kbr"><button class="kpill" data-panel="tempo" aria-label="Tempo y tono"><b id="kpbpm"></b><small> bpm · </small><b id="kpkey"></b></button><button class="kic kmet ${KAR.met?'on':''}" data-t="met" aria-label="Metrónomo">${KIC.tempo}</button><button class="kic" data-stopen aria-label="Modo escenario, pantalla completa">${KIC.full}</button><button class="kic" id="kreset" aria-label="Desde el inicio">${KIC.restart}</button></div></div></div></div>
  </div>`,
  mount(r){
    const kr=$('#kretoplay',r);if(kr)kr.onclick=()=>{RETO_PICK='song:'+id+':'+st.shift;location.hash='#/practicar/reto'};
    const kb=$('#kbeatgo',r);if(kb)kb.onclick=()=>{location.href=estudioLink(P.key.pc+st.shift,!!P.key.minor,st.bpm,gid(),st.beats)};
    coverWatch(r);
    const toolVals=()=>{const set=(k,v)=>{const e=$('#kt-'+k,r);if(e)e.textContent=v};
      set('tono',keyLbl());set('tempo',Math.round(st.bpm*(st.sp||1)));set('son',KAR.band?'Música':'Silencio');set('grab',O.use&&O.blob?'Tuya':'Banda');set('rep',st.loop?st.loop+(st.loop>1?' renglones':' renglón'):'No');set('mas',aiPat()?'IA':BSTYLES[gid()]);set('ia',usingAI()?'Versión IA':iaReady()?'Lista':'Conectar');
      const pb=$('#kpbpm',r);if(pb)pb.textContent=Math.round(st.bpm*(st.sp||1));const pk=$('#kpkey',r);if(pk)pk.textContent=keyLbl();const fn=$('#kfnot',r);if(fn)fn.textContent=es()?'Do':'C';$$('.kmet',r).forEach(x=>x.classList.toggle('on',!!KAR.met));
      const en=$('#keasy',r);if(en){const on=EASYT()&&st.shift;en.hidden=!on;if(on)en.innerHTML=`<b>Versión fácil en ${esc(keyLbl())}</b> · ${esc(easyCapoTxt(st.shift,chName(P.key,0,P.key,es())+(P.key.minor&&!/m/.test(P.key.suf||'')?'m':''),es()))}`}
      const m=$('#kmeta',r);if(m)m.textContent=`Tono ${keyLbl()} · ${Math.round(st.bpm*(st.sp||1))} bpm · ${BSTYLES[gid()]} · ${st.beats}/4`;
      const t=$('.ktool[data-panel="son"]',r);if(t)t.classList.toggle('on',!!KAR.met)};
    const sumK=toolVals;
    const O={blob:null,name:'',fname:'',type:'',el:null,url:null,use:false,playing:false,syncing:false,busy:false,prog:0,grid:null,voc:null,recK:0,raf:0,last:-1,lastBeat:null};
    let LP=null;
    const spdTxt=()=>{const m=$('#kspd',r);if(m)m.textContent=st.sp<1?`La banda va a ${Math.round(st.bpm*st.sp)} bpm (de ${st.bpm}). El tono no cambia.`:'';const kb=$('#kbpm',r);if(kb)kb.textContent=st.sp<1?Math.round(st.bpm*st.sp):st.bpm};
    const kar=$('#kar',r);let pos=0,TL=null,BK=null,curCh=P.chords[0]||null;
    requestAnimationFrame(()=>fitKar(kar));const onRs=()=>fitKar(kar);window.addEventListener('resize',onRs);setTimeout(()=>{if(!document.body.contains(kar))window.removeEventListener('resize',onRs)},0);
    // panel lateral: tono, rasgueo sugerido y acorde que suena
    const side=()=>{const s=$('#kside',r);if(!s)return;
      if(INST.id==='bajo'){s.innerHTML=bassSide(curCh,st);return;}
      if(INST.id==='bateria'){s.innerHTML=drumSide(st);return;}
      s.innerHTML=`<div class="ks-row"><div><span class="cl">Tono</span><b class="ks-key">${esc(keyLbl())}</b></div><div><span class="cl">Tempo</span><b class="ks-num">${st.bpm}</b><small>bpm · ${st.beats}/4</small></div></div>
       <p class="ks-capo">${esc(capoHint(P.key,st.shift))}</p>
       <div><span class="cl">Rasgueo ${aiPat()?'de la IA · '+esc(GROOVES[curG].n.replace(/^IA · /,'')):'sugerido · '+BSTYLES[gid()]}</span>${patHTML(curG,st.beats)}<p class="ks-tip">${esc(aiPat()&&aiPat().tip||GROOVES[curG].tip)}</p></div>
       <div class="ks-ch"><span class="cl">Acorde</span><div id="ksch">${chNow()}</div></div>`};
    /* rasgueo por sección: el de la IA si hay, si no el del ritmo elegido; el coro suena más fuerte que el verso */
    const aiPat=()=>{const a=AIo().pat;return a&&AIo().useP!==false&&a.beats===st.beats&&a.sub===RES()?a:null};
    const hasSecs=()=>P.lines.some(l=>l.label!=null);
    const regAI=sk=>{const a=aiPat(),x=a.secs[sk],key='ia~'+sk,base=GROOVES[gid()],bt=st.beats,B=base[bt]||{},L=bt*a.sub;
      GROOVES[key]=Object.assign({},base,{n:'IA · '+({intro:'Intro',verso:'Verso',precoro:'Pre-coro',coro:'Coro',puente:'Puente',solo:'Solo',final:'Final'}[sk]||sk),tip:a.tip||base.tip,walk:x.b?0:base.walk,[bt]:Object.assign({},B,{g:x.g,b:x.b||B.b||('R'+'-'.repeat(L-1))})});return key};
    const gFor=li=>{const a=aiPat();if(!a)return gid();const k=(secs[li]||{}).k||'verso',ks=Object.keys(a.secs);return regAI(a.secs[k]?k:a.secs.verso?'verso':ks[0])};
    const dyFor=li=>{const a=aiPat(),k=(secs[li]||{}).k||'verso';if(a){const ks=a.secs[k]?k:a.secs.verso?'verso':Object.keys(a.secs)[0];return a.secs[ks].f||1}return hasSecs()?SEC_DYN[k]||1:1};
    let curG=gid(),curLi=-1;
    const secLine=li=>{if(li===curLi)return;curLi=li;const g=gFor(li);if(g!==curG){curG=g;side()}};
    const chNow=()=>curCh?`<div class="ks-chord">${chordSVG(voicing(curCh,st.shift))}<b>${esc(chName(curCh,st.shift,P.key,es()))}</b></div>`:'<p class="ks-tip">—</p>';
    const FS={seq:[],i:0,li:-1};let views=null;
    const build=()=>{
      // con la grabación sincronizada, la canción se mide al tempo real que se detectó
      TL=songTimeline(O.use&&O.grid&&DB.kbpm[id]?Object.assign({},P,{bpm:DB.kbpm[id]}):P,st.bars,st.beats);BK={};const Q=TL.res=RES();
      TL.ev.forEach(e=>{const k=Math.round(e.b*Q);(BK[k]=BK[k]||[]).push(e)});
      const byL={};TL.ev.forEach(e=>{if(e.type==='lit')(byL[e.li]=byL[e.li]||[]).push(e)});
      Object.values(byL).forEach(a=>{a.sort((x,y)=>x.b-y.b);a.forEach((e,i)=>{e.sd=i+1<a.length?Math.max(.15,a[i+1].b-e.b):1})});
      // acorde vigente en cada celda (dieciseisavo o tresillo, según el ritmo)
      const ch=TL.ev.filter(e=>e.type==='chord').sort((a,b)=>a.b-b.b);TL.chAt=[];let j=-1;const N=Math.ceil(TL.total*Q);
      TL.chS=[];for(let k=0;k<N;k++){while(j+1<ch.length&&Math.round(ch[j+1].b*Q)<=k)j++;TL.chAt[k]=j>=0?ch[j].p:null;TL.chS[k]=j>=0?Math.round(ch[j].b*Q):0}
      TL.liAt=[];let g=0;for(let k=0;k<N;k++){while(g+1<TL.lines.length&&Math.round(TL.lines[g+1].start*Q)<=k)g++;TL.liAt[k]=TL.lines[g]?TL.lines[g].li:-1}
      FS.seq=kformsSeq(P,TL);FS.i=0;if(views)views(true);
    };
    build();
    /* ---------- vistas: Letras · Acordes · Formas · Pistas ---------- */
    const VIEW=()=>{const v=KAR.view||'letras';return v==='formas'&&INST.id==='bateria'?'letras':v};
    const nmP=p=>chName(p,st.shift,P.key,es()),shapeP=p=>INST.id==='bateria'?'':chordSVG(voicing(p,st.shift));
    const lineTxt=li=>{const L=P.lines[li];return L&&L.pieces?L.pieces.map(p=>(p.sp?' ':'')+p.text).join('').replace(/\s+/g,' ').trim():''};
    const formsPaint=()=>{const f=$('#kforms',r);if(!f)return;const g=Math.max(0,FS.li>=0?lineIdx(FS.li):pos),L=TL.lines[g],N=TL.lines[g+1];
      f.innerHTML=FS.seq.length?kformsHTML(FS.seq,FS.i,nmP,shapeP,[L?lineTxt(L.li):'',N?lineTxt(N.li):'']):'<p class="cap">Esta canción no tiene acordes.</p>'};
    const formsChord=e=>{let i=0;for(let k=0;k<FS.seq.length;k++){if(FS.seq[k].b<=e.b+1e-3)i=k;else break}if(i!==FS.i){FS.i=i;if(VIEW()==='formas')formsPaint()}};
    const formsLine=li=>{if(FS.li===li)return;FS.li=li;if(VIEW()==='formas')formsPaint()};
    let gridDirty=true,stemDirty=true;
    views=force=>{if(force){gridDirty=stemDirty=true}const v=VIEW();
      $$('.kview',r).forEach(x=>x.hidden=x.dataset.v!==v);$$('[data-view]',r).forEach(b=>b.setAttribute('aria-selected',String(b.dataset.view===v)));
      const kp=$('.kplay',r);if(kp){kp.classList.toggle('vpistas',v==='pistas');kp.classList.toggle('vformas',v==='formas')}const kc=$('#kchips',r);if(kc)kc.hidden=v!=='letras';
      if(v==='acordes'&&gridDirty){$('#kgrid',r).innerHTML=kgridHTML(P,TL,st.beats,nmP);gridDirty=false}
      if(v==='formas')formsPaint();
      if(v==='pistas'&&stemDirty){stemDirty=false;stemsPaint()}};
    const viewBeat=(b,t)=>{const v=VIEW();if(v==='acordes')kgridAt(r,b);else if(v==='pistas')stemHead(b,t)};
    /* Pistas: con la banda, guitarra / bajo / batería por separado; con tu grabación, separación aproximada */
    DB.kmix=DB.kmix||{};
    const recMode=()=>!!(O.use&&O.blob),MK=()=>recMode()?'rec':'band';
    const TRK=()=>recMode()?[['v','Voz y centro','#5b8cff'],['b','Bajo y bombo','#2ec4b6'],['s','Guitarras (lados)','#ff9f43']]:[['g','Guitarra','#5b8cff'],['b','Bajo','#2ec4b6'],['d','Batería','#ff5c8a']];
    const mixOf=()=>DB.kmix[MK()]=DB.kmix[MK()]||{};
    const applyMix=re=>{const M=mixOf(),keys=TRK().map(x=>x[0]),G=mixGains(M,keys);
      if(recMode()){const sg=O.el&&O.el._stem||(Object.values(G).some(v=>v!==1)?stemGraph(mediaEl()):null);if(sg)keys.forEach(k=>sg[k].gain.value=G[k])}
      else{BMIX={g:G.g,b:G.b,d:G.d};if(re)restart()}};
    const durRec=()=>O.wv?O.wv.dur:(O.el&&isFinite(O.el.duration)?O.el.duration:0);
    const stemHead=(b,t)=>{const k=$('.kst',r);if(!k)return;let x=0;if(recMode()){const d=durRec();if(t!=null&&d)x=t/d}else if(b!=null&&TL.total)x=b/TL.total;k.style.setProperty('--ph',Math.max(0,Math.min(1,x)).toFixed(4))};
    const stemsPaint=()=>{const box=$('#kstems',r);if(!box)return;const rec=recMode(),M=mixOf(),T=TRK(),bt=st.beats;
      const dur=rec?durRec():TL.total,ok=rec?!!(dur&&OEV.length):true,X=v=>dur?Math.max(0,Math.min(100,v/dur*100)):0;
      // acordes, secciones y renglones en el mismo eje (segundos de la grabación o pulsos de la canción)
      const chs=rec?OEV.filter(o=>o.e.type==='chord').map(o=>[o.t,o.e]):TL.ev.filter(e=>e.type==='chord').sort((a,b)=>a.b-b.b).map(e=>[e.b,e]);
      const lt=g=>rec?OLT[g]:TL.lines[g].start;
      const seg=(a0,a1,txt,cl)=>`<span class="${cl}" style="left:${X(a0).toFixed(3)}%;width:${Math.max(.15,X(a1)-X(a0)).toFixed(3)}%">${txt?`<b>${esc(txt)}</b>`:''}</span>`;
      let chH='';chs.forEach(([a0,e],i)=>{const pc=P.lines[e.li]&&P.lines[e.li].pieces[e.pi];if(pc&&pc.hide)return;let j=i+1;while(j<chs.length){const q=P.lines[chs[j][1].li].pieces[chs[j][1].pi];if(!q||!q.hide)break;j++}chH+=seg(a0,j<chs.length?chs[j][0]:dur,nmP(e.p),'kst-c')});
      let seH='',lyH='',grp=null;TL.lines.forEach((L,g)=>{const t=lt(g);if(t==null)return;const sc=secs[L.li]||{},lab=sc.l||'';lyH+=`<i class="kst-tk" style="left:${X(t).toFixed(3)}%" title="${esc(lineTxt(L.li))}"></i>`;
        if(!grp||grp.l!==lab){if(grp)seH+=seg(grp.t,t,grp.l,'kst-s');grp={l:lab,t}}});if(grp)seH+=seg(grp.t,dur,grp.l,'kst-s');
      const row=(k,l,c,ctl)=>`<div class="kst-row trk" style="--c:${c}"><div class="kst-n"><b>${l}</b>${ctl}</div><div class="kst-t"><canvas data-wv="${k}"></canvas></div></div>`;
      const ctl=k=>{const m=M[k]||{};return`<div class="kst-ctl"><input type="range" min="0" max="1.5" step="0.05" value="${m.v??1}" data-mixv="${k}" aria-label="Volumen"><button class="kms${m.m?' on':''}" data-mixm="${k}" aria-label="Silenciar">M</button><button class="kms s${m.s?' on':''}" data-mixs="${k}" aria-label="Solo">S</button></div>`};
      box.innerHTML=`<div class="kst-head"><b>${rec?'Tu grabación por pistas':'Pistas de la banda'}</b><p class="cap">${rec?'Separación aproximada, sin IA: la voz y lo que va en medio, los graves y lo que suena a los lados. Se nota más con audífonos.'+(O.wv&&!O.wv.s?' Esta grabación es mono: no tiene lados.':''):'Sube o baja cada instrumento. M lo silencia y S deja solo ese.'+(INST.id==='bajo'&&KAR.bassPlayer?' El bajo lo tocas tú.':'')+(INST.id==='bateria'&&drumPlayer()?' La batería la tocas tú.':'')}</p></div>
       <div class="kst" style="--ph:0">
        <div class="kst-row lane"><span class="kst-n">Acordes</span><div class="kst-t kst-ch">${ok?chH:''}</div></div>
        <div class="kst-row lane"><span class="kst-n">Secciones</span><div class="kst-t kst-se">${ok?seH:''}</div></div>
        <div class="kst-row lane"><span class="kst-n">Letra</span><div class="kst-t kst-ly">${ok?lyH:''}</div></div>
        ${T.map(([k,l,c])=>row(k,l,c,ctl(k))).join('')}
        ${rec?'':row('met','Metrónomo','#9aa3b2',`<div class="kst-ctl"><button class="kms wide${KAR.met?' on':''}" data-t="met">${KAR.met?'Encendido':'Apagado'}</button></div>`)}
        <i class="kst-ph" aria-hidden="true"></i></div>
       ${rec&&!ok?'<p class="cap">Sincroniza tu grabación (Grabación → Sincronizar) para ver los acordes y la letra sobre las pistas.</p>':''}`;
      const draw=()=>{if(rec){T.forEach(([k,,c])=>drawWave($(`canvas[data-wv="${k}"]`,box),O.wv&&O.wv[k],c))}
        else{const ch=TL.ev.filter(e=>e.type==='chord').sort((a,b)=>a.b-b.b),sp=ch.map((e,i)=>[e.b,i+1<ch.length?ch[i+1].b:TL.total]),G=GROOVES[gid()][bt===3?3:4]||{},perc=['k','s','r','h','p','g2','c'].some(x=>G[x]);
          drawBlocks($('canvas[data-wv="g"]',box),sp.map(x=>[x[0],x[1],.62]),TL.total,'#5b8cff');drawBlocks($('canvas[data-wv="b"]',box),sp.map(x=>[x[0],x[1],.42]),TL.total,'#2ec4b6');
          drawBlocks($('canvas[data-wv="d"]',box),perc?[[0,TL.total,.7]]:[],TL.total,'#ff5c8a');const nb=Math.ceil(TL.total/bt);drawBlocks($('canvas[data-wv="met"]',box),KAR.met?Array.from({length:nb},(_,i)=>[i*bt,i*bt+.35,.5]):[],TL.total,'#9aa3b2')}};
      requestAnimationFrame(draw);
      if(rec&&!O.wv&&!O.wvBusy){O.wvBusy=true;syncDecode(O.blob).then(({x,xs,sr})=>{O.wv=stemWaves(x,xs,sr,1800);O.wvBusy=false;if(document.body.contains(box)&&VIEW()==='pistas')stemsPaint()}).catch(()=>{O.wvBusy=false})}};
    const seekFrac=f=>{f=Math.max(0,Math.min(1,f));
      if(recMode()){const d=durRec();if(!d)return;const t=f*d,g=Math.max(0,curLine(t));pos=g;loopFrom.g=g;if(O.playing){O.el.currentTime=t+outLat();O.last=-99}else stemHead(0,t);return}
      const b=f*TL.total;let g=0;TL.lines.forEach((L,i)=>{if(L.start<=b+1e-3)g=i});const was=running();if(was){seqStop();bandStop()}pos=g;clearHL();setLine(TL.lines[g].li);if(was)go();else stemHead(TL.lines[g].start,null);paint()};
    const onRz=()=>{if(VIEW()==='pistas')stemsPaint()};window.addEventListener('resize',onRz);
    const running=()=>SEQ.id==='kar'||O.playing;
    const paint=()=>{const sg=$('[data-stgo]',r);if(sg)sg.innerHTML=running()?IC.pause:IC.play;const g=$('#kgo',r),t=running()?'Pausa':pos?'Continuar':'Empezar';g.innerHTML=(running()?IC.pause:IC.play)+`<span>${t}</span>`;kar.classList.toggle('live',running());g.setAttribute('aria-label',t);toolVals()};
    const prog=g=>{const i=$('#kprogi',r);if(i)i.style.width=(TL&&TL.lines.length?Math.max(0,Math.min(1,g/TL.lines.length))*100:0)+'%'};
    const clearHL=()=>{$$('.kl',kar).forEach(x=>x.classList.remove('cur','past','nxt'));$$('.pc',kar).forEach(x=>x.classList.remove('lit','now'));prog(0);kgridClear(r);FS.i=0;FS.li=-1;if(VIEW()==='formas')formsPaint();stemHead(0,0)};
    /* ---------- modo escenario: pantalla completa al tocar; lo cantado se pinta en dorado ---------- */
    const stg=$('#kstage',r),stgL=$('#ksgl',r);let stgOn=false,stgFs=false;
    const stgRender=li=>{if(!stgOn)return;const g=Math.max(0,lineIdx(li)),rows=[];
      for(let k=g-1;k<=g+2;k++){const L=TL.lines[k];if(!L){rows.push('<div class="ksg-row ghost"></div>');continue}const sc=secs[L.li],pv=k>0&&secs[TL.lines[k-1].li];
        const lab=k===g&&sc&&sc.l&&(!pv||pv.l!==sc.l)?`<div class="ksg-sec">${esc(sc.l)}</div>`:'';rows.push(`<div class="ksg-row ${k<g?'pv':k===g?'cur':k===g+1?'nx':'nx2'}">${lab}${lineHTML(P.lines[L.li],L.li)}</div>`)}
      stgL.innerHTML=rows.join('');
      // lo que ya se encendió en la letra de la página (por ejemplo la primera sílaba, que cae junto con el renglón)
      for(let k=g-1;k<=g;k++){const L=TL.lines[k];if(!L)continue;$$(`.kl[data-li="${L.li}"] .pc.lit`,kar).forEach(x=>{const q=$(`.kl[data-li="${L.li}"] .pc[data-pi="${x.dataset.pi}"]`,stgL);if(q){q.style.setProperty('--sd','0s');q.classList.add('lit')}});
        const nw=$(`.kl[data-li="${L.li}"] .pc.now`,kar);if(nw){const q=$(`.kl[data-li="${L.li}"] .pc[data-pi="${nw.dataset.pi}"]`,stgL);if(q)q.classList.add('now')}}
      const pi=$('#ksgp',r);if(pi)pi.style.width=((g+1)/Math.max(1,TL.lines.length)*100)+'%';const c=$('#ksgch',r);if(c)c.innerHTML=chNow()};
    const stgMark=(type,e,sd)=>{if(!stgOn)return;const p=$(`.kl[data-li="${e.li}"] .pc[data-pi="${e.pi}"]`,stgL);
      if(type==='lit'){if(p){p.style.setProperty('--sd',sd||'0s');p.classList.add('lit')}}else{$$('.pc.now',stgL).forEach(x=>x.classList.remove('now'));if(p)p.classList.add('now');const c=$('#ksgch',r);if(c)c.innerHTML=chNow()}};
    const stgOpen=()=>{if(stgOn)return;stgOn=true;stg.hidden=false;document.documentElement.classList.add('kstage-on');const g=Math.max(0,Math.min(pos,TL.lines.length-1));if(TL.lines[g])stgRender(TL.lines[g].li);
      try{const fe=stg.requestFullscreen||stg.webkitRequestFullscreen;if(fe&&!document.fullscreenElement){const q=fe.call(stg);if(q&&q.catch)q.catch(()=>{})}}catch(e){}};
    const stgClose=()=>{if(!stgOn)return;stgOn=false;stg.hidden=true;document.documentElement.classList.remove('kstage-on');try{if(document.fullscreenElement)(document.exitFullscreen||document.webkitExitFullscreen).call(document)}catch(e){}};
    const onFs=()=>{if(document.fullscreenElement===stg)stgFs=true;else if(stgFs){stgFs=false;stgClose()}};document.addEventListener('fullscreenchange',onFs);
    const setLine=li=>{
      stgRender(li);prog(lineIdx(li)+1);
      $$('.kl.cur',kar).forEach(x=>{x.classList.remove('cur');x.classList.add('past')});
      const el=$(`.kl[data-li="${li}"]`,kar);if(!el)return;el.classList.remove('past');el.classList.add('cur');
      $$('.kl.nxt',kar).forEach(x=>x.classList.remove('nxt'));const g=lineIdx(li),nx=TL.lines[g+1]&&$(`.kl[data-li="${TL.lines[g+1].li}"]`,kar);if(nx)nx.classList.add('nxt');
      if(VIEW()!=='letras')return;const rc=el.getBoundingClientRect();
      if(running())window.scrollBy({top:rc.top+rc.height/2-innerHeight*.42,behavior:'smooth'});
      else if(rc.top<90||rc.top>innerHeight*.55)el.scrollIntoView({block:'center',behavior:'smooth'});
    };
    const lineIdx=li=>TL.lines.findIndex(x=>x.li===li);
    const go=async()=>{
      if(O.playing){origStop();paint();return}
      if(running()){seqStop();bandStop();paint();return}
      if(O.use&&O.blob){origGo();return}
      if(!ac())return;
      // primero las grabaciones de guitarra y bajo, para que la canción no cambie de sonido a medias
      if(!SMP.ready){const gb=$('#kgo',r);gb.disabled=true;gb.innerHTML='<i class="kspin"></i><span>Cargando sonidos</span>';await loadSamples();gb.disabled=false;if(!document.body.contains(gb))return}
      if(TL.res!==RES())build();
      const Q=TL.res,G=gid(),stp=+(($('.kpat',r)||{}).dataset||{}).step||1,bt=st.beats,startB0=TL.lines[pos]?TL.lines[pos].start:0,startB=P.pickup?startB0:Math.floor(startB0/bt+1e-6)*bt,startK=Math.round(startB*Q);
      // cuenta: un compás completo y, si la canción entra con anacrusa, los pulsos que faltan para que caiga en su lugar
      const pk=P.pickup%bt,countK=(bt+(pos===0&&pk?bt-pk:0))*Q,N=Math.ceil(TL.total*Q);
      LP=null;if(st.loop&&TL.lines[pos]){const g1=Math.min(TL.lines.length,pos+st.loop),e0=g1<TL.lines.length?TL.lines[g1].start:TL.total,e=Math.ceil(e0/bt-1e-6)*bt*Q;if(e>startK)LP={s:startK,e,g0:pos,g1}}
      const absA=k=>{const a=startK+k;return LP?LP.s+((a-LP.s)%(LP.e-LP.s)):a};
            clearHL();for(let g=0;g<pos;g++){const e=$(`.kl[data-li="${TL.lines[g].li}"]`,kar);if(e)e.classList.add('past')}
      // la banda se pre-graba por tramos de 4 compases (sin tropiezos aunque el teléfono esté ocupado)
      const cd=60/(st.bpm*st.sp)/Q,spbB=60/(st.bpm*st.sp),CH=bt*Q*4,gen=++BR.gen,done={};let T0=0;
      const cell=k=>{const a=absA(k);if(a>=N||!TL.chAt[a])return null;const rel=a-Math.round(P.pickup*Q),L=bt*Q;const li=TL.liAt[a];return{G:gFor(li),dy:dyFor(li),bt,i:((rel%L)+L)%L,bar:Math.floor(rel/L),p:TL.chAt[a],ci:a-TL.chS[a],sh:st.shift,spb:spbB}};
      const stepsOf=n=>{const a=[];for(let k=n*CH;k<(n+1)*CH;k++)a.push(cell(k));return a};
      const want=n=>{if(live||!KAR.band||done[n]||(!LP&&startK+n*CH>=N))return;done[n]=1;
        bandRender(stepsOf(n),cd).then(buf=>{if(gen!==BR.gen||!running())return;bandPlay(buf,T0+(countK+n*CH)*cd)}).catch(()=>{})};
      // el primer tramo se graba ANTES de arrancar, para que el primer golpe caiga exacto
      // si este navegador no logra pre-grabar (o sale en silencio), la banda toca en vivo como antes
      let first=null,live=BR.live;if(KAR.band&&!live){const gb=$('#kgo',r);gb.disabled=true;gb.innerHTML='<i class="kspin"></i><span>Preparando</span>';
        try{first=await bandRender(stepsOf(0),cd);if(!bufHasSound(first))throw new Error('silencio')}catch(e){first=null;live=BR.live=true}
        gb.disabled=false;done[0]=1;if(gen!==BR.gen||!document.body.contains(gb))return}
      seqStart('kar','Karaoke · '+P.title,()=>60/(st.bpm*st.sp)/Q,(s,t)=>{
        const k=s-countK;
        if(k<0){if(s%Q===0)tick(t,s===0?'acc':'beat');return}
        const a=absA(k);if(a>=N)return;
        const spb=60/(st.bpm*st.sp),rel=a-Math.round(P.pickup*Q),L=bt*Q,i=((rel%L)+L)%L,bar=Math.floor(rel/L);
        if(KAR.met&&i%Q===0)tick(t,i===0?'acc':'sub',i===0?'bar':'beat');
        if(live){if(KAR.band){const x=cell(k);if(x){BDYN=x.dy||1;bandStep(x.G,x.bt,x.i,x.p,x.sh,t,x.spb,x.bar,x.ci);BDYN=1}}}else if(k%CH===0)want(Math.floor(k/CH)+2);
        if(KAR.voice&&BK[a])BK[a].forEach(e=>{if(e.type==='note')leadNote(e.m+st.shift,t,e.d*spb,.2)});
      },s=>{
        const k=s-countK;
        if(k<0){if(s%Q===0){$('#kpos',r).textContent=(LP?'Repitiendo · ':'')+'Cuenta: '+(s/Q+1);const bd=$('#kbd',r);if(bd){bd.classList.add('on');setTimeout(()=>bd.classList.remove('on'),100)}}return}
        const a=absA(k);
        if(LP&&k>0&&a===LP.s){for(let g=LP.g0;g<LP.g1;g++){const e=$(`.kl[data-li="${TL.lines[g].li}"]`,kar);if(e){e.classList.remove('cur','past');$$('.pc',e).forEach(x=>x.classList.remove('lit','now'))}}}
        if(a>=N){seqStop();stgClose();pos=0;$('#kpos',r).textContent='Fin · '+P.title;paint();markDay();return}
        if(INST.id==='bajo')bassLight(r,cell(k));
        if(INST.id==='bateria')drumLight(r,cell(k));
        if(a%stp===0){const rel2=a-Math.round(P.pickup*Q),L2=bt*Q,sl=((rel2%L2)+L2)%L2/stp;$$('.kpat .sl.on',r).forEach(x=>x.classList.remove('on'));const q=$(`.kpat [data-sl="${sl}"]`,r);if(q)q.classList.add('on')}
        if(a%Q===0){viewBeat(a/Q,null);const rl=a-Math.round(P.pickup*Q);beatPulse(r,((rl%(bt*Q))+bt*Q)%(bt*Q)===0);const bd=$('#kbd',r);if(bd){const rel=a-Math.round(P.pickup*Q);bd.classList.add('on');bd.classList.toggle('acc',((rel%(bt*Q))+bt*Q)%(bt*Q)===0);setTimeout(()=>bd.classList.remove('on'),100)}}
        (BK[a]||[]).forEach(e=>{
          if(e.type==='line'){setLine(e.li);pos=Math.max(0,lineIdx(e.li));$('#kpos',r).textContent=(LP?'Repitiendo · ':'')+`Renglón ${pos+1} de ${TL.lines.length}`;formsLine(e.li);secLine(e.li)}
          else if(e.type==='lit'){const p=$(`.kl[data-li="${e.li}"] .pc[data-pi="${e.pi}"]`,kar);if(p){p.style.setProperty('--sd',Math.min(1.4,(e.sd||1)*60/(st.bpm*st.sp)*.92).toFixed(3)+'s');p.classList.add('lit')}stgMark('lit',e,p&&p.style.getPropertyValue('--sd'))}
          else if(e.type==='chord'){if(e.p!==curCh){curCh=e.p;const k=$('#ksch',r);if(k)k.innerHTML=chNow()}$$('.pc.now',kar).forEach(x=>x.classList.remove('now'));const p=$(`.kl[data-li="${e.li}"] .pc[data-pi="${e.pi}"]`,kar);if(p)p.classList.add('now');formsChord(e);stgMark('chord',e)}
        });
      });
      T0=SEQ.next-SEQ.step*cd;if(first)bandPlay(first,T0+countK*cd);want(1);
      paint();
    };
    // al dar play se abre el modo escenario (si está activado); con grabación, solo si ya está sincronizada
    $('#kgo',r).onclick=()=>{if(!running()&&KAR.stage!==false&&(!(O.use&&O.blob)||synced()))stgOpen();go()};
    $('#kreset',r).onclick=()=>{if(running())seqStop();bandStop();pos=0;clearHL();window.scrollTo({top:0,behavior:'smooth'});paint()};
    [kar,$('#kgrid',r)].forEach(box=>box.addEventListener('click',e=>{const l=e.target.closest('.kl,.kgrow,.kgly');if(!l)return;const g=lineIdx(+l.dataset.li);if(g<0)return;if(O.playing){const t=lineT(g);if(t!=null){O.el.currentTime=Math.max(0,t-.8);loopFrom.g=g;pos=g}return}const was=running();if(was){seqStop();bandStop()}pos=g;clearHL();setLine(+l.dataset.li);if(was)go();paint()}));
    const rerender=()=>{kar.innerHTML=P.lines.map(lineHTML).join('');requestAnimationFrame(()=>fitKar(kar));$('#kchips',r).innerHTML=chips();$('#kkey',r).textContent=keyLbl();$('#kcapo',r).textContent=capoHint(P.key,st.shift);side();views(true)};
    // cambia la versión (original / IA) o los acordes fáciles: se vuelve a leer la canción
    const reloadSong=()=>{const was=running();if(was){seqStop();bandStop()}if(O.playing)origStop();P0=fixP(songParse(srcNow()));P=mkP();secs=lineSections(P);curCh=P.chords[0]||null;curLi=-1;curG=gid();pos=0;build();rerender();clearHL();if(O.blob)buildO();origUI();paint();iaUI()};
    r.addEventListener('click',e=>{
      if(e.target.closest('[data-stopen]')){stgOpen();return}
      if(e.target.closest('[data-stx]')){stgClose();return}
      if(e.target.closest('[data-stgo]')){go();return}
      const sa=e.target.closest('[data-stauto]');if(sa){KAR.stage=KAR.stage===false;DB.kar=Object.assign({},KAR);save();sa.setAttribute('aria-pressed',String(KAR.stage!==false));toast(logo()+`<span>${KAR.stage!==false?'Al tocar se abre la letra en pantalla completa':'La letra se queda en la página al tocar'}</span>`);return}
      const vw=e.target.closest('[data-view]');if(vw){KAR.view=vw.dataset.view;DB.kar=Object.assign({},KAR);save();views();if(VIEW()==='acordes'&&pos)kgridAt(r,TL.lines[pos]?TL.lines[pos].start:0);return}
      const nt=e.target.closest('[data-nott]');if(nt){DB.notation=es()?'us':'es';save();$$('[data-not]',r).forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.not===DB.notation)));rerender();toolVals();return}
      const sm=e.target.closest('[data-easy]');if(sm){KAR.easy=+sm.dataset.easy;KAR.simple=KAR.easy>0;DB.kar=Object.assign({},KAR);save();reloadSong();
        if(INST.id==='guitarra'){st.shift=EASYT()?easyShift(P):(DB.kt[id]||0);rerender();restart()}easyUI();toolVals();
        toast(logo()+`<span>${EZ()===2?'Acordes fáciles'+(st.shift?' en '+esc(keyLbl()):'')+': acordes abiertos':EZ()===1?'Acordes sencillos: mismo tono, sin séptimas, sus ni bajos':'Acordes originales'}</span>`,3000);return}
      const mu=e.target.closest('[data-mute]');if(mu){const k=mu.dataset.mute,M=mixOf();M[k]=M[k]||{};M[k].m=!M[k].m;save();applyMix(true);muteUI();if(VIEW()==='pistas')stemsPaint();return}
      const mx=e.target.closest('[data-mixm],[data-mixs]');if(mx){const k=mx.dataset.mixm||mx.dataset.mixs,f=mx.dataset.mixm?'m':'s',M=mixOf();M[k]=M[k]||{};M[k][f]=!M[k][f];mx.classList.toggle('on',M[k][f]);save();applyMix(true);return}
      const kt=e.target.closest('.kst-t');if(kt&&!e.target.closest('input,button')){const rc=kt.getBoundingClientRect();seekFrac((e.clientX-rc.left)/rc.width);return}
      const io=e.target.closest('[data-iaon]');if(io){DB.kai[id]=Object.assign({},AIo(),{on:io.dataset.iaon==='1'});save();reloadSong();return}
      const ip=e.target.closest('[data-iap]');if(ip){DB.kai[id]=Object.assign({},AIo(),{useP:ip.dataset.iap==='1'});save();curLi=-1;curG=gid();side();restart();iaUI();toolVals();return}
      const ib=e.target.closest('[data-ia]');if(ib){iaRun(ib.dataset.ia);return}
      const k=e.target.closest('[data-k]');if(k){const v=+k.dataset.k;st.shift=v?((st.shift+v+18)%12)-6:0;DB.kt[id]=st.shift;save();rerender();restart();return}
      const b=e.target.closest('[data-b]');if(b){st.bpm=Math.max(40,Math.min(220,st.bpm+ +b.dataset.b));DB.kbpm[id]=st.bpm;save();$('#kbpm',r).textContent=st.bpm;side();spdTxt();restart();return}
      const sh=e.target.closest('[data-show]');if(sh){KAR.show=sh.dataset.show;kar.className='karaoke show-'+KAR.show;$$('[data-show]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===sh)));DB.kar=Object.assign({},KAR);save();return}
      const n=e.target.closest('[data-not]');if(n){DB.notation=n.dataset.not;save();$$('[data-not]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===n)));rerender();return}
      const t=e.target.closest('[data-t]');if(t){const k=t.dataset.t;KAR[k]=!KAR[k];if(k==='drumPlayer'&&INST.id==='bateria'){DB.drumPlayer=KAR.drumPlayer;$$('[data-t="drumPlayer"]',r).forEach(x=>x.setAttribute('aria-pressed',String(KAR.drumPlayer)));restart()}if(k==='bassPlayer'){DB.bassPlayer=KAR.bassPlayer;$$('[data-t="bassPlayer"]',r).forEach(x=>x.setAttribute('aria-pressed',String(KAR.bassPlayer)));restart()}if(k==='band'){restart();if(O.el)O.el.muted=!KAR.band&&!O.syncing;$$('[data-t="band"] span',r).forEach(x=>x.textContent=KAR.band?'Con música':'Sin música')}$$(`[data-t="${k}"]`,r).forEach(x=>x.classList.toggle('on',KAR[k]));if(k==='met'&&KAR.met)toast(logo()+'<span>Metrónomo encendido</span>');if(k==='met'&&VIEW()==='pistas')stemsPaint();if(k==='voice')muteUI();DB.kar=Object.assign({},KAR);save();return}
      const lt=e.target.closest('[data-lat]');if(lt){DB[INST.id==='bateria'?'visualLat':'lat']=+lt.dataset.lat;save();$$('[data-lat]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===lt)));return}
      const sp=e.target.closest('[data-sp]');if(sp){st.sp=+sp.dataset.sp;if(O.el)O.el.playbackRate=st.sp;if(slow){DB.ksp[id]=st.sp;save()}$$('[data-sp]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===sp)));spdTxt();restart();return}
      const lp=e.target.closest('[data-lp]');if(lp){const was=running();if(was)seqStop();st.loop=+lp.dataset.lp;$$('[data-lp]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===lp)));if(was)go();paint();return}
      const bb=e.target.closest('[data-beats]');if(bb){const was=running();if(was)seqStop();st.beats=+bb.dataset.beats;DB.kbeats[id]=st.beats;sumK();save();$$('[data-beats]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===bb)));build();if(pos>=TL.lines.length)pos=0;$('#kstys',r).innerHTML=styChips();sumK();side();paint();$('#kpos',r).textContent=`${st.beats}/4 · ${BSTYLES[gid()]} · listo`;return}
      const y=e.target.closest('[data-sty]');if(y){const was=running();if(was)seqStop();st.style=y.dataset.sty;sumK();DB.kst[id]=st.style;save();$$('[data-sty]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===y)));side();build();if(was)go();paint();return}
      const z=e.target.closest('[data-z]');if(z){KAR.size=Math.max(.8,Math.min(1.8,+(KAR.size+ +z.dataset.z*.15).toFixed(2)));kar.style.setProperty('--kz',KAR.size);$('#kgrid',r).style.setProperty('--kz',KAR.size);fitKar(kar);DB.kar=Object.assign({},KAR);save();return}
      const c=e.target.closest('[data-kc]');if(c){const p=chParse(c.dataset.kc);if(p&&ac())gtrStrum(voicing(p,0),AC.currentTime+.02,'d',.09,2)}
    });
    r.addEventListener('input',e=>{const v=e.target.closest('[data-mixv]');if(!v)return;const M=mixOf(),k=v.dataset.mixv;M[k]=M[k]||{};M[k].v=+v.value;applyMix(false)});
    r.addEventListener('change',e=>{if(e.target.closest('[data-mixv]')){save();if(!recMode())applyMix(true)}});
    const sel=$('#kbpl',r);if(sel)sel.onchange=e=>{const was=running();if(was)seqStop();st.bars=+e.target.value;build();if(pos>=TL.lines.length)pos=0;paint()};
    // marcar el tempo con toques
    let taps=[];$('#ktap',r).onclick=()=>{const now=performance.now();taps=taps.filter(x=>now-x<2500);taps.push(now);
      if(taps.length>=4){const iv=(taps[taps.length-1]-taps[0])/(taps.length-1),b=Math.round(60000/iv);if(b>=40&&b<=220){st.bpm=b;DB.kbpm[id]=b;save();$('#kbpm',r).textContent=b;side()}}
      $('#ktap',r).textContent=taps.length<4?'Toca '+(4-taps.length):'Marcar'};
    const restart=()=>{if(SEQ.id==='kar'){seqStop();bandStop();go()}};
    const onState=()=>{paint();if(!running()){bandStop();$$('.kpat .sl.on',r).forEach(x=>x.classList.remove('on'))}};
    document.addEventListener('playstate',onState);
    /* ---------- tocar sobre la grabación original (MP3 o video del usuario) ----------
       Al subirla, la app la escucha (5-songsync.js): pulso real + acordes alineados → inicio de cada renglón
       (DB.ksync[SK()] = {li: segundos}) y la rejilla de pulsos (O.grid, guardada en IndexedDB con el archivo).
       «A mano» corrige tocando cuando empieza un renglón. */
    DB.ksync=DB.ksync||{};DB.kuse=DB.kuse||{};
    const synced=()=>{const T=DB.ksync[SK()],n=T?Object.keys(T).length:0;return n>0&&n>=Math.min(O.grid?1:2,TL.lines.length)};
    const mediaEl=()=>{if(O.el)return O.el;const v=!!O.forceVideo;const el=document.createElement(v?'video':'audio');el.preload='auto';el.playsInline=true;el.setAttribute('playsinline','');
      if(v){el.style.cssText='position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;bottom:0;left:0';document.body.appendChild(el)}
      el.preservesPitch=true;el.mozPreservesPitch=true;el.webkitPreservesPitch=true;O.url=URL.createObjectURL(O.blob);el.src=O.url;el.addEventListener('error',()=>{if(!v&&/^video/.test(O.type)&&!O.forceVideo){O.forceVideo=true;O.el=null;toast('Probando el video de otra forma; toca Empezar otra vez.')}});el.addEventListener('ended',()=>{if(O.syncing)syncEnd(true);else{origStop();stgClose();pos=0;$('#kpos',r).textContent='Fin · '+P.title}});return O.el=el};
    const recIDB=()=>{recCloud();return slowIDB().then(db=>db.transaction('f','readwrite').objectStore('f').put({blob:O.blob,name:O.fname,type:O.type,grid:O.grid,voc:O.voc,k:O.recK,ancs:O.ancs||null,dur:O.dur||0,lend:O.lend||null},'orig:'+id)).catch(()=>{})};
    /* la grabación también va a tu cuenta, para tenerla en tus otros dispositivos (con su sincronización) */
    const recExtra=()=>({rec:JSON.stringify({grid:O.grid,voc:O.voc,k:O.recK,ancs:O.ancs||null,dur:O.dur||0,lend:O.lend||null})});
    const recCloud=()=>cloudWhenReady(()=>{if(!O.blob||O.upl)return;if((DB.kaudio||{})[id]===O.blob.size){cloudAudioMeta(id,recExtra());return}
      O.upl=0.01;origUI();cloudAudioPut(id,O.blob,recExtra(),p=>{O.upl=Math.max(.01,p);const s=$('.kocloud',r);if(s)s.textContent=` · subiendo a tu cuenta ${Math.round(p*100)} %`})
        .then(ok=>{O.upl=0;origUI();if(ok)toast(logo()+'<span>Tu grabación quedó en tu cuenta: ya está en tus otros dispositivos</span>',3500)})
        .catch(e=>{O.upl=0;origUI();toast('No se pudo subir la grabación a tu cuenta'+(/permission|insufficient/i.test(e&&e.message||'')?': falta publicar la regla nueva de la base de datos.':'. Se intentará de nuevo.'),5000)})});
    const recDown=()=>cloudWhenReady(async()=>{if(O.blob||O.dl)return;O.dl=0.01;origUI();
      try{const R=await cloudAudioGet(id,p=>{O.dl=Math.max(.01,p);origUI()});if(!document.body.contains(r))return;
        if(!R){if(DB.kaudio){delete DB.kaudio[id];save()}O.dl=0;origUI();return}
        const x=(()=>{try{return JSON.parse(R.meta.rec||'{}')}catch(e){return{}}})();
        O.blob=R.blob;O.fname=R.meta.name||'grabacion';O.name=O.fname.replace(/\.[^.]+$/,'');O.type=R.meta.type||'audio/mpeg';O.use=DB.kuse[id]!==false;O.grid=x.grid||null;O.voc=x.voc||null;O.recK=x.k||0;O.ancs=x.ancs||null;O.dur=x.dur||0;O.lend=x.lend||null;
        slowIDB().then(db=>db.transaction('f','readwrite').objectStore('f').put({blob:O.blob,name:O.fname,type:O.type,grid:O.grid,voc:O.voc,k:O.recK,ancs:O.ancs,dur:O.dur},'orig:'+id)).catch(()=>{});
        if(CHONLY&&O.dur){REC.dur=O.dur;REC.on=O.use;reloadSong()}build();O.dl=0;origUI();paint();views(true);toast(logo()+'<span>Tu grabación llegó de tu cuenta</span>',3000)}
      catch(e){O.dl=0;origUI();toast('No se pudo bajar la grabación de tu cuenta. Revisa tu internet.',4000)}});
    const semis=k=>Math.abs(k)===1?'medio tono':Math.abs(k)%2?Math.abs(k)+' semitonos':Math.abs(k)/2+(Math.abs(k)===2?' tono':' tonos');
    const easyUI=()=>{$$('[data-easy]',r).forEach(b=>{if(b.closest('#kez'))b.setAttribute('aria-pressed',String(+b.dataset.easy===EZ()));else{b.setAttribute('aria-pressed',String(EZ()>0));b.dataset.easy=EZ()?0:INST.id==='guitarra'?2:1}})};
    // silenciar al vuelo: con la banda, cada instrumento; con tu grabación, la separación aproximada
    const muteUI=()=>{const k=$('#kmutes',r);if(!k)return;const M=mixOf(),L=recMode()?[['v','Voz'],['s','Guitarras'],['b','Bajo']]:[['g','Guitarra'],['b','Bajo'],['d','Batería']];
      k.innerHTML=L.map(([x,l])=>`<button class="kmu${M[x]&&M[x].m?' off':''}" data-mute="${x}" aria-pressed="${!(M[x]&&M[x].m)}">${l}</button>`).join('')+(recMode()||!P.hasMel?'':`<button class="kmu${KAR.voice?'':' off'}" data-t="voice">Voz guía</button>`)};
    const iaUI=()=>{const k=$('#kia',r);if(!k)return;
      if(!iaReady()){k.innerHTML=`<p class="cap" style="margin:0">Conecta tu IA (Gemini, ChatGPT, Claude, Ollama…) para ordenar la letra, acomodar y simplificar acordes, proponer el rasgueo de cada sección y sacar la letra de tu grabación.</p><div class="row"><a class="btn pri" href="#/ia">${KIC.ia}Conectar una IA</a></div>`;return}
      const A=AIo();
      k.innerHTML=`${A.src?`<div><span class="cl">Versión de la canción</span><div class="seg">${[[0,'Original'],[1,'De la IA']].map(([v,l])=>`<button data-iaon="${v}" aria-pressed="${usingAI()===!!v}">${l}</button>`).join('')}</div></div>`:''}
       ${A.pat?`<div><span class="cl">Rasgueo</span><div class="seg">${[[0,'Del ritmo'],[1,'De la IA']].map(([v,l])=>`<button data-iap="${v}" aria-pressed="${(A.useP!==false)===!!v}">${l}</button>`).join('')}</div></div>`:''}
       <div class="kiab"><button class="btn" data-ia="arr">${KIC.letras}<span>Ordenar letra y acordes</span></button>
        ${INST.id!=='bateria'?`<button class="btn" data-ia="simp">${KIC.formas}<span>Versión fácil (IA)</span></button>`:''}
        <button class="btn" data-ia="strum">${KIC.son}<span>Rasgueo real por sección</span></button>
        ${O.blob?`<button class="btn" data-ia="lyr" ${iaHears()?'':'disabled'}>${KIC.grab}<span>Letra de mi grabación</span></button>`:''}</div>
       <p class="cap" id="kiamsg" role="status" style="margin:0">${O.blob&&!iaHears()?'Para sacar la letra del audio conecta Gemini u OpenAI. ':''}Conectada: ${esc(iaName())}.${A.src?' Tu versión original no se borra.':''}</p>
       ${A.src||A.pat?`<div class="row"><button class="btn sm" data-ia="del">Quitar lo que hizo la IA</button></div>`:''}`};
    const iaRun=async kind=>{
      if(kind==='del'){delete DB.kai[id];save();reloadSong();toast('Listo: la canción quedó como era.');return}
      const msg=$('#kiamsg',r);$$('[data-ia]',r).forEach(b=>b.disabled=true);if(msg)msg.textContent='La IA está trabajando… puede tardar unos segundos.';
      try{
        if(kind==='arr'||kind==='simp'){const t=await(kind==='arr'?iaArrange(s.src,P.title):iaSimplify(srcNow(),P.title));if(!songParse(t).lines.some(l=>l.pieces))throw new Error('La IA no devolvió una canción. Intenta otra vez.');
          DB.kai[id]=Object.assign({},AIo(),{src:t,on:true});save();reloadSong();toast(logo()+'<span>Listo: versión de la IA. Puedes volver a la original.</span>',3500)}
        else if(kind==='strum'){const pat=await iaStrum({title:P.title,artist:P.artist,style:BSTYLES[gid()],beats:st.beats,bpm:st.bpm,sub:RES(),sections:[...new Set(Object.values(secs).map(x=>x.k))]});
          DB.kai[id]=Object.assign({},AIo(),{pat,useP:true});save();curLi=-1;curG=gid();side();restart();toast(logo()+'<span>Listo: la banda toca el rasgueo de la IA</span>',3000)}
        else if(kind==='lyr'){const ly=await iaTranscribe(O.blob);if(msg)msg.textContent='Ya tengo la letra; ahora acomodo los acordes…';const t=await iaMerge(ly,srcNow(),P.title);
          DB.kai[id]=Object.assign({},AIo(),{src:t,on:true});save();reloadSong();toast(logo()+'<span>Listo: letra sacada de tu grabación. Ahora sincronízala.</span>',4000)}
      }catch(e){if(msg)msg.textContent=e.message;$$('[data-ia]',r).forEach(b=>b.disabled=false);return}
      iaUI();toolVals()};
    const origUI=()=>{iaUI();muteUI();easyUI();const k=$('#korig',r);if(!k)return;
      if(!O.blob&&O.dl){k.innerHTML=`<p class="cap" style="margin:0">Bajando tu grabación de tu cuenta… ${Math.round(O.dl*100)} %</p>`;return}
      if(!O.blob){k.innerHTML=`${(DB.kaudio||{})[id]?`<div class="row korow"><span class="cap" style="margin:0">Tu grabación de esta canción está en tu cuenta.</span><button class="btn sm pri" data-o="down">Bajarla</button></div>`:''}<div class="row"><label class="btn" for="kofile">${IC.down}Usar mi grabación</label><input type="file" id="kofile" accept="audio/*,video/*" hidden><span class="cap" style="margin:0">MP3, M4A o video. La app la escucha y la letra sigue a la canción real.</span></div>`;
        $('#kofile',r).onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;O.blob=f;O.fname=f.name;O.name=f.name.replace(/\.[^.]+$/,'');O.type=f.type||'audio/mpeg';O.use=true;O.grid=null;O.voc=null;O.recK=0;O.ancs=null;O.wv=null;DB.kuse[id]=true;delete DB.ksync[SK()];save();
          recIDB();if(O.el){O.el.remove&&O.el.remove();O.el=null}build();origUI();autoSync()};return}
      const T=synced(),B=O.busy;
      k.innerHTML=`<div class="seg">${[[0,'Banda de la app'],[1,'Mi grabación']].map(([v,l])=>`<button data-ou="${v}" aria-pressed="${O.use===!!v}">${l}</button>`).join('')}</div>
        ${O.use?`<div class="row korow"><span class="cap koname" style="margin:0">${B?(O.bmsg||`Escuchando la canción… ${Math.round(O.prog*100)} %`):esc(O.name)+(T?' · sincronizada':' · falta sincronizar')}<span class="kocloud">${O.upl?` · subiendo a tu cuenta ${Math.round(O.upl*100)} %`:(DB.kaudio||{})[id]===(O.blob&&O.blob.size)?' · en tu cuenta':''}</span></span><button class="btn sm ${T||B?'':'pri'}" data-o="auto" ${B?'disabled':''}>${T?'Repetir':'Sincronizar'}</button><button class="btn sm" data-o="sync" ${B?'disabled':''}>A mano</button>${T&&iaHears()?`<button class="btn sm" data-o="ia" ${B?'disabled':''}>${KIC.ia}Revisar con IA</button>`:''}<button class="btn sm" data-o="del" ${B?'disabled':''}>Quitar</button></div>
        ${T&&!B?`<div class="row korow"><span class="cap" style="margin:0">Ajuste fino de la letra</span><button class="btn sm" data-o="-">−0.1 s</button><button class="btn sm" data-o="+">+0.1 s</button></div>`:''}
        ${T&&!B&&O.recK&&O.recK!==st.shift?`<div class="row korow"><span class="cap koname" style="margin:0;white-space:normal">Tu grabación suena ${semis(O.recK)} más ${O.recK<0?'abajo':'arriba'} que estos acordes.</span><button class="btn sm" data-o="tk">Ver como suena</button></div>`:''}
        ${CHONLY&&!usingAI()?`<div class="row korow"><span class="cap koname" style="margin:0;white-space:normal">Esta canción solo trae la progresión. Saca la letra y los acordes de tu grabación:</span><a class="btn sm pri" href="#/cancionero/editar/${id}">Crear canción completa</a></div>`:''}
        <p class="cap" style="margin:0">${T?'Si un renglón no cae, tócalo y usa «A mano» desde ahí.':'La app escucha tu archivo y encuentra el pulso y los cambios de acorde.'} La grabación suena en su tono original.</p>`:''}`};
    /* tiempos reales: cada renglón tiene su inicio (sincronizado solo o a mano) y dentro del renglón todo avanza
       pulso a pulso sobre la rejilla de la grabación. Los renglones sin marcar se calculan desde el marcado más cercano. */
    let OEV=[],OLT=[];const off=()=>+(DB.ksyncOff||{})[SK()]||0;
    const beatT=(t0,db)=>O.grid?gridT(O.grid,gridIdx(O.grid,t0)+db):t0+db*60/(DB.kbpm[id]||P.bpm);
    const lineRaw=g=>{const T=DB.ksync[SK()]||{},L=TL.lines[g];if(!L)return null;if(T[L.li]!=null)return T[L.li];
      let h=-1;for(let i=g-1;i>=0;i--)if(T[TL.lines[i].li]!=null){h=i;break}
      if(h<0)for(let i=g+1;i<TL.lines.length;i++)if(T[TL.lines[i].li]!=null){h=i;break}
      return h<0?null:beatT(T[TL.lines[h].li],L.start-TL.lines[h].start)};
    const lineT=g=>{const t=lineRaw(g);return t==null?null:t+off()};
    // sílabas: se reparten en lo que de verdad se canta del renglón (hasta donde se apaga la voz, sin pasarse del
    // siguiente renglón), para que se iluminen todas una por una aunque el renglón dure distinto de lo estimado
    const sylSpan=g=>{const L=TL.lines[g],t0=lineRaw(g);if(t0==null)return null;const b=TL.ev.filter(e=>e.type==='lit'&&e.li===L.li).map(e=>e.b);if(!b.length)return null;
      const s0=Math.min(...b),s1=Math.max(...b)+1,a=beatT(t0,s0-L.start)+off(),nat=beatT(t0,s1-L.start)+off(),nx=OLT[g+1]!=null?OLT[g+1]-.25:1e9;let z=Math.min(nat,nx);
      // fin del canto que oyó la IA al crear la canción
      if(O.lend&&O.lend[L.li]!=null){const ve=O.lend[L.li]+off();if(ve>a+.5)return{s0,s1,a,z:Math.min(ve,nx)}}
      if(O.voc&&O.grid){const j0=Math.max(0,Math.ceil(gridIdx(O.grid,a-off()))),j1=Math.min(O.voc.length-1,Math.floor(gridIdx(O.grid,Math.min(nx,a+60)-off())));let last=-1;
        for(let j=j0;j<=j1;j++)if(O.voc[j]>=.5)last=j;if(last>=j0){const ve=gridT(O.grid,last+1)+off();if(ve>a+.6)z=Math.min(ve,nx)}}
      return z>a+.3?{s0,s1,a,z}:null};
    /* anclas: el inicio de cada renglón y, dentro del renglón, cada cambio de acorde tal como suena en la grabación
       (5-songsync.js). Entre anclas todo avanza sobre los pulsos reales; así el acorde y la sílaba caen donde suenan
       aunque el renglón dure distinto de lo que la app estimó. */
    let LA=[];const sigTL=()=>TL.lines.length+'|'+Math.round(TL.total*4)+'|'+st.beats;
    const ancNow=()=>{const x=(O.ancs||{})[SK()];return x&&x.sig===sigTL()?x.a:null};
    const mapB=(b,g)=>{const A=LA[g];if(!A)return null;let i=0;for(let k=1;k<A.length;k++)if(A[k][0]<=b+1e-6)i=k;const[b0,t0]=A[i];let t;
      if(i+1<A.length){const[b1,t1]=A[i+1],f=(b-b0)/((b1-b0)||1);if(O.grid){const g0=gridIdx(O.grid,t0),g1=gridIdx(O.grid,t1);t=gridT(O.grid,g0+f*(g1-g0))}else t=t0+f*(t1-t0)}else t=beatT(t0,b-b0);
      const n=lineRaw(g+1);if(n!=null&&t>n-.05)t=n-.05;return t};
    const songBeatO=now=>{const g=curLine(now),A=g>=0?LA[g]:null;if(!A)return null;const m=now-off();let i=0;for(let k=1;k<A.length;k++)if(A[k][1]<=m)i=k;const[b0,t0]=A[i];
      if(i+1<A.length){const[b1,t1]=A[i+1];if(O.grid){const g0=gridIdx(O.grid,t0),g1=gridIdx(O.grid,t1);return b0+(gridIdx(O.grid,m)-g0)/((g1-g0)||1)*(b1-b0)}return b0+(m-t0)/((t1-t0)||1)*(b1-b0)}
      return b0+(O.grid?gridIdx(O.grid,m)-gridIdx(O.grid,t0):(m-t0)*(DB.kbpm[id]||P.bpm)/60)};
    const buildO=()=>{OEV=[];OLT=TL.lines.map((_,g)=>lineT(g));const SP=TL.lines.map((_,g)=>sylSpan(g)),AN=ancNow()||[];
      LA=TL.lines.map((L,g)=>{const t0=lineRaw(g);if(t0==null)return null;const t1=lineRaw(g+1)??1e9,nb=TL.lines[g+1]?TL.lines[g+1].start:TL.total,A=[[L.start,t0]];
        AN.forEach(([b,t])=>{if(b>L.start+.01&&b<nb-.01&&t>A[A.length-1][1]+.05&&t<t1-.05)A.push([b,t])});return A});
      TL.ev.forEach(e=>{if(e.type==='note')return;const g=lineIdx(e.li);if(g<0||!LA[g])return;let t=mapB(e.b,g);if(t==null)return;
        const sp=SP[g];if(e.type==='lit'&&sp){const za=sp.a-off(),zz=sp.z-off();t=LA[g].length>1?Math.min(t,zz-.08):za+(e.b-sp.s0)/(sp.s1-sp.s0)*(zz-za)}
        t+=off();const n=OLT[g+1];if(n!=null&&e.type!=='line')t=Math.min(t,n-.05);OEV.push({t,e})});OEV.sort((a,b)=>a.t-b.t);
      const lastL={};for(let i=OEV.length-1;i>=0;i--){const o=OEV[i];if(o.e.type!=='lit')continue;const n=lastL[o.e.li];o.sd=n!=null?Math.max(.12,n-o.t):.6;lastL[o.e.li]=o.t}};
    const curLine=now=>{let g=-1;for(let i=0;i<OLT.length;i++){const t=OLT[i];if(t!=null&&t<=now+.02)g=i}return g};
    const applyUntil=(from,now)=>{OEV.forEach(({t,e,sd})=>{if(t<=from||t>now)return;
      if(e.type==='line'){setLine(e.li);pos=Math.max(0,lineIdx(e.li));$('#kpos',r).textContent=(st.loop?'Repitiendo · ':'')+`Renglón ${pos+1} de ${TL.lines.length}`;formsLine(e.li);secLine(e.li)}
      else if(e.type==='lit'){const p=$(`.kl[data-li="${e.li}"] .pc[data-pi="${e.pi}"]`,kar);if(p){p.style.setProperty('--sd',(now-t>.3?0:Math.min(1.4,(sd||.4)/(st.sp||1)*.92)).toFixed(3)+'s');p.classList.add('lit')}stgMark('lit',e,p&&p.style.getPropertyValue('--sd'))}
      else if(e.type==='chord'){if(e.p!==curCh){curCh=e.p;const k=$('#ksch',r);if(k)k.innerHTML=chNow()}$$('.pc.now',kar).forEach(x=>x.classList.remove('now'));const p=$(`.kl[data-li="${e.li}"] .pc[data-pi="${e.pi}"]`,kar);if(p)p.classList.add('now');formsChord(e);stgMark('chord',e)}})};
    const repaintTo=now=>{clearHL();const g=curLine(now);for(let i=0;i<g;i++){const e=$(`.kl[data-li="${TL.lines[i].li}"]`,kar);if(e)e.classList.add('past')}applyUntil(-1e9,now)};
    const loopFrom={g:0};
    // reloj suave: currentTime avanza a saltos en varios navegadores; entre saltos se estima con el reloj del sistema
    const frame=()=>{if(!O.playing)return;const el=O.el,mt=el.currentTime,pn=performance.now();if(mt!==O.mt){O.mt=mt;O.pt=pn}let est=O.mt+(pn-O.pt)/1000*(el.playbackRate||1);if(Math.abs(est-mt)>.25)est=mt;const now=est-outLat();
      if(Math.abs(now-O.last)>.6){repaintTo(now)}else applyUntil(O.last,now);O.last=now;
      // pulso, metrónomo y rasgueo iluminado: siguen los pulsos reales de la grabación
      const g=curLine(now);if(g<0)stemHead(null,now);if(g>=0){const lb=songBeatO(now)??TL.lines[g].start,bt=st.beats,bi=Math.floor(lb+1e-3);viewBeat(lb,now);
        if(O.lastBeat!==null&&bi!==O.lastBeat&&bi>O.lastBeat){const isBar=((bi%bt)+bt)%bt===0;beatPulse(r,isBar);if(KAR.met)tick(AC.currentTime+.005,isBar?'acc':'beat',isBar?'bar':'beat');else pulseBeat(isBar)}
        O.lastBeat=bi;const G=GROOVES[gid()],stp=+(($('.kpat',r)||{}).dataset||{}).step||1,cell=Math.floor((((lb%bt)+bt)%bt)*G.sub/stp+1e-3);
        if(INST.id==='bateria')drumLight(r,{G:gid(),bt,i:cell,bar:Math.floor(lb/bt)});
        if(INST.id==='bajo'){const k=Math.max(0,Math.floor(lb*G.sub)),L=bt*G.sub; bassLight(r,{G:gid(),bt,i:cell,bar:Math.floor(lb/bt),p:TL.chAt[k]||curCh,sh:st.shift,ci:k-(TL.chS[k]||0)})}
        const q=$(`.kpat [data-sl="${cell}"]`,r);if(q&&!q.classList.contains('on')){$$('.kpat .sl.on',r).forEach(x=>x.classList.remove('on'));q.classList.add('on')}
        // repetir renglones
        if(st.loop){const end=lineT(loopFrom.g+st.loop)??(el.duration||1e9);if(now>=end-.05){el.currentTime=Math.max(0,lineT(loopFrom.g)-.4);O.last=-99}}}
      O.raf=requestAnimationFrame(frame)};
    const origGo=()=>{if(!ac())return;seqStop();bandStop();
      if(!synced()){autoSync();return}
      build();buildO();const el=mediaEl();applyMix(false);el.playbackRate=st.sp;el.muted=!KAR.band;loopFrom.g=pos;const t0=lineT(pos);el.currentTime=pos>0&&t0!=null?Math.max(0,t0-1.2):0;
      O.last=-99;O.lastBeat=null;clearHL();el.play().then(()=>{O.playing=true;paint();document.dispatchEvent(new Event('playstate'));frame()}).catch(()=>toast('No se pudo reproducir este archivo en tu navegador.'))};
    const origStop=()=>{O.playing=false;cancelAnimationFrame(O.raf);if(O.el)O.el.pause();$$('.kpat .sl.on',r).forEach(x=>x.classList.remove('on'))};
    // sincronizar sola: la app escucha el archivo, encuentra el pulso y alinea los acordes de la canción
    const autoSync=async()=>{if(!O.blob)return;if(O.busy){toast('Sigo escuchando la canción…');return}
      if(O.playing)origStop();if(O.syncing){O.syncing=false;if(O.el)O.el.pause();syncPaint()}
      O.busy=true;O.prog=0;origUI();paint();
      const show=p=>{O.prog=p;const s=$('.koname',r);if(s)s.textContent=`Escuchando la canción… ${Math.round(p*100)} %`};
      try{const{x,xs,sr}=await syncDecode(O.blob);if(!document.body.contains(r))return;O.dur=x.length/sr;if(CHONLY){REC.dur=O.dur;REC.on=true;reloadSong();O.busy=true;origUI()}
        const A=await syncAnalyze(x,sr,DB.kbpm[id]||(P.set.bpm?P.bpm:0),show,xs);if(!document.body.contains(r))return;
        const bpm=Math.max(40,Math.min(220,Math.round(A.bpm)));O.grid=A.beats;st.bpm=bpm;DB.kbpm[id]=bpm;build();
        const T0=songTimeline(Object.assign({},P0,{bpm}),st.bars,st.beats),Q=RES();T0.res=Q;{const ch=T0.ev.filter(e=>e.type==='chord').sort((a,b)=>a.b-b.b);T0.chAt=[];let j=-1;for(let k=0;k<Math.ceil(T0.total*Q);k++){while(j+1<ch.length&&Math.round(ch[j+1].b*Q)<=k)j++;T0.chAt[k]=j>=0?ch[j].p:null}}
        const R=syncAlign(A,T0,st.beats);if(!R)throw new Error('sin acordes');build();
        O.grid=R.grid;O.voc=R.voc;O.recK=R.k;O.ancs=Object.assign({},O.ancs,{[SK()]:{a:R.anc||[],sig:sigTL()}});DB.ksync[SK()]=R.T;if(DB.ksyncOff)delete DB.ksyncOff[SK()];save();recIDB();
        $('#kbpm',r).textContent=bpm;side();spdTxt();pos=0;clearHL();buildO();
        toast(logo()+`<span>Listo: la letra sigue a tu grabación (${bpm} bpm).${iaHears()?' Ahora la IA la revisa…':' Toca Empezar.'}</span>`,4000)}
      catch(e){toast('No pude escuchar este archivo. Usa «A mano».',4000)}
      O.busy=false;origUI();paint();if(synced()&&iaHears()&&!(CHONLY&&!usingAI()))iaFixSync(true)};
    /* la IA escucha la grabación y corrige los renglones que quedaron lejos (más de 1.2 s): los pone en el pulso real
       más cercano a donde empieza a cantarse. Lo demás se queda como lo dejó el análisis de acordes. */
    const iaFixSync=async auto=>{if(!O.blob||O.busy)return;if(O.playing)origStop();O.busy=true;O.prog=0;O.bmsg='La IA está escuchando tu grabación…';origUI();
      try{const sung=TL.lines.map((L,g)=>({g,t:P.lines[L.li].pieces.map(p=>(p.sp?' ':'')+p.text).join('').replace(/\s+/g,' ').trim()})).filter(x=>x.t);
        if(!sung.length)throw new Error('Esta canción no tiene letra para revisar.');
        const times=await iaLineTimes(O.blob,sung.map(x=>x.t)),T=Object.assign({},DB.ksync[SK()]||{}),snap=t=>O.grid?gridT(O.grid,Math.round(gridIdx(O.grid,t))):t;let n=0,heard=0;
        sung.forEach((x,i)=>{const ta=times[i];if(ta==null||ta<0)return;heard++;const L=TL.lines[x.g],cur=T[L.li]??lineRaw(x.g);
          if(cur==null||Math.abs(cur-ta)>1.2){const nt=+snap(ta).toFixed(3),pv=TL.lines.slice(0,x.g).map(q=>T[q.li]).filter(v=>v!=null).pop(),nx=TL.lines.slice(x.g+1).map(q=>T[q.li]).find(v=>v!=null);
            if((pv==null||nt>pv+.3)&&(nx==null||nt<nx-.3||Math.abs((nx??0)-ta)>1.2)){T[L.li]=nt;n++}}});
        // en orden: si algo quedó al revés, se quita el renglón que no cuadra (se recalcula con el pulso)
        let last=-1;TL.lines.forEach(L=>{const v=T[L.li];if(v==null)return;if(v<=last+.2)delete T[L.li];else last=v});
        if(!heard)throw new Error('La IA no reconoció la letra en la grabación.');
        DB.ksync[SK()]=T;save();buildO();clearHL();pos=0;
        toast(logo()+`<span>${n?`La IA corrigió ${n} renglón${n>1?'es':''}`:'La IA revisó la sincronización: todo cuadra'}. Toca Empezar.</span>`,4000)}
      catch(e){toast((auto?'La IA no pudo revisar: ':'')+e.message,5000)}
      O.busy=false;O.bmsg='';origUI();paint()};
    // a mano: escuchar y tocar cuando empieza cada renglón; los que no se tocan se acomodan solos con el pulso
    let SY={i:0,T:{}};
    const syncPaint=()=>{const box=$('#ksync',r);if(!O.syncing){box.hidden=true;return}box.hidden=false;const L=TL.lines[SY.i];
      const words=L?P.lines[L.li].pieces.map(p=>(p.sp?' ':'')+p.text).join('').trim().slice(0,46):'';
      box.innerHTML=`<p class="cap" style="margin:0">Renglón ${SY.i+1} de ${TL.lines.length} · toca justo cuando empiece. Lo que no toques se queda como está.</p><b class="kswords">«${esc(words)||'(acordes)'}»</b>
        <div class="row"><button class="btn pri" id="kstap">Ya empezó</button><button class="btn sm" id="ksback">Atrás</button><button class="btn sm" id="ksx">Listo</button></div>`;
      $('#kstap',r).onclick=()=>{const L=TL.lines[SY.i];if(!L)return;let t=Math.max(0,O.el.currentTime-.06);
        // cae en el pulso más cercano de la grabación
        if(O.grid){const gt=gridT(O.grid,Math.round(gridIdx(O.grid,t)));if(Math.abs(gt-t)<.18)t=gt}
        SY.T[L.li]=+t.toFixed(3);setLine(L.li);SY.i++;if(SY.i>=TL.lines.length)syncEnd();else syncPaint()};
      $('#ksback',r).onclick=()=>{if(SY.i>0){SY.i--;const P0=TL.lines[SY.i-1];O.el.currentTime=Math.max(0,P0&&SY.T[P0.li]!=null?SY.T[P0.li]:SY.T[TL.lines[SY.i].li]-3||0);syncPaint()}};
      $('#ksx',r).onclick=()=>syncEnd()};
    const syncStart=()=>{if(!O.blob)return;const was=synced(),el=mediaEl();el.playbackRate=1;el.muted=false;
      SY={i:was?Math.max(0,Math.min(pos,TL.lines.length-1)):0,T:was?Object.assign({},DB.ksync[SK()]):{}};
      // corregir desde el renglón elegido: los ya sincronizados se conservan
      if(was)TL.lines.forEach((M,g)=>{if(SY.T[M.li]==null){const t=lineRaw(g);if(t!=null)SY.T[M.li]=+t.toFixed(3)}});
      const L=TL.lines[SY.i];el.currentTime=was&&L&&SY.T[L.li]!=null?Math.max(0,SY.T[L.li]-4):0;O.syncing=true;clearHL();
      el.play().then(()=>{syncPaint();$('#ksync',r).scrollIntoView({block:'nearest',behavior:'smooth'})}).catch(()=>{O.syncing=false;toast('No se pudo reproducir este archivo en tu navegador.')})};
    const syncEnd=()=>{O.syncing=false;if(O.el)O.el.pause();if(Object.keys(SY.T).length>=(O.grid?1:2)){DB.ksync[SK()]=SY.T;save();toast(logo()+'<span>Listo: canción sincronizada</span>');pos=0;clearHL();buildO()}syncPaint();origUI();paint()};
    r.addEventListener('click',e=>{
      const ou=e.target.closest('[data-ou]');if(ou){if(O.playing)origStop();if(running()){seqStop();bandStop()}O.use=ou.dataset.ou==='1';DB.kuse[id]=O.use;save();if(CHONLY&&REC.dur){REC.on=O.use;reloadSong()}build();if(!O.use)applyMix(false);origUI();paint();views(true);return}
      const o=e.target.closest('[data-o]');if(!o)return;const k=o.dataset.o;
      if(k==='auto')autoSync();
      else if(k==='sync'){if(O.playing)origStop();syncStart()}
      else if(k==='ia')iaFixSync(false);
      else if(k==='tk'){st.shift=((O.recK+18)%12)-6;DB.kt[id]=st.shift;save();rerender();origUI()}
      else if(k==='down')recDown();
      else if(k==='del'){if(O.playing)origStop();cloudAudioDel(id);slowIDB().then(db=>db.transaction('f','readwrite').objectStore('f').delete('orig:'+id)).catch(()=>{});if(O.el){O.el.pause();O.el.remove&&O.el.remove()}if(O.url)URL.revokeObjectURL(O.url);
        O.blob=null;O.el=null;O.use=false;O.grid=null;O.voc=null;O.recK=0;O.ancs=null;O.wv=null;delete DB.ksync[SK()];DB.kuse[id]=false;save();build();origUI();paint()}
      else{DB.ksyncOff=DB.ksyncOff||{};DB.ksyncOff[SK()]=+(((+DB.ksyncOff[SK()]||0)+(k==='+'?.1:-.1)).toFixed(2));save();buildO();toast(`Ajuste: ${DB.ksyncOff[SK()]>0?'+':''}${DB.ksyncOff[SK()]} s`,1400)}});
    slowIDB().then(db=>new Promise(res=>{const q=db.transaction('f').objectStore('f').get('orig:'+id);q.onsuccess=()=>res(q.result);q.onerror=()=>res(null)})).then(rec=>{if(rec&&rec.blob){O.blob=rec.blob;O.fname=rec.name||'';O.name=O.fname.replace(/\.[^.]+$/,'');O.type=rec.type||rec.blob.type||'audio/mpeg';O.use=DB.kuse[id]!==false;O.grid=rec.grid||null;O.voc=rec.voc||null;O.recK=rec.k||0;O.ancs=rec.ancs||null;O.dur=rec.dur||0;O.pch=rec.pch||null;O.lend=rec.lend||null;if(CHONLY&&O.dur){REC.dur=O.dur;REC.on=O.use;reloadSong()}build();
        if(O.pch&&!ancNow()){const a=[];Object.entries(O.pch).forEach(([li,ts])=>{const ev=TL.ev.filter(e=>e.type==='chord'&&e.li===+li).sort((x,y)=>x.b-y.b);if(ev.length===ts.length)ev.forEach((e,k)=>a.push([+e.b.toFixed(3),ts[k]]))});
          a.sort((x,y)=>x[0]-y[0]);O.ancs=Object.assign({},O.ancs,{[SK()]:{a,sig:sigTL()}});O.pch=null;recIDB()}
        if((DB.kaudio||{})[id]!==O.blob.size)recCloud()}else if((DB.kaudio||{})[id])recDown();origUI();paint();views(true);
      if(DB.kautosync===id&&O.blob){delete DB.kautosync;save();autoSync()}}).catch(()=>origUI());
    origUI();
    const openP=k=>{const box=$('.kpanels',r),cur=box.hidden?null:box.dataset.open;$$('.ktool',r).forEach(b=>b.setAttribute('aria-pressed','false'));
      if(!k||cur===k){box.hidden=true;box.dataset.open='';return}box.hidden=false;box.dataset.open=k;$$('.kpanel',r).forEach(p=>p.hidden=p.dataset.p!==k);const tb=$(`.ktool[data-panel="${k}"]`,r);if(tb)tb.setAttribute('aria-pressed','true');box.scrollIntoView({block:'nearest',behavior:'smooth'})};
    r.addEventListener('click',e=>{
      const pb=e.target.closest('[data-panel]');if(pb){openP(pb.dataset.panel);return}
      if(e.target.closest('[data-pclose]')){openP(null);return}
      const sb=e.target.closest('[data-step]');if(sb){if(!TL.lines.length)return;const n=Math.max(0,Math.min(TL.lines.length-1,pos+ +sb.dataset.step));
        if(O.playing){const t=lineT(n);if(t!=null){O.el.currentTime=Math.max(0,t-.3);pos=n;loopFrom.g=n}return}
        const was=running();if(was){seqStop();bandStop()}pos=n;clearHL();for(let g=0;g<n;g++){const x=$(`.kl[data-li="${TL.lines[g].li}"]`,kar);if(x)x.classList.add('past')}setLine(TL.lines[n].li);$('#kpos',r).textContent=`Renglón ${n+1} de ${TL.lines.length}`;if(was)go();paint();return}
      setTimeout(toolVals,0)});
    if(slow)openP('tempo');
    side();paint();spdTxt();if(!recMode())applyMix(false);views();
    return()=>{document.removeEventListener('playstate',onState);window.removeEventListener('resize',onRz);document.removeEventListener('fullscreenchange',onFs);stgClose();BMIX={g:1,b:1,d:1};BDYN=1;if(SEQ.id==='kar')seqStop();bandStop();origStop();O.syncing=false;if(O.el){O.el.pause();O.el.remove&&O.el.remove()}if(O.url)URL.revokeObjectURL(O.url)};
  }};
}
