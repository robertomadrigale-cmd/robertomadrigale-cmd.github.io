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
  const F=v.frets,ns=F.filter(f=>f!=null&&f>0),lo=ns.length?Math.min(...ns):1,base=Math.max(...F.filter(f=>f!=null))>4?lo:1,W=10,H=11;
  let s=`<svg viewBox="-6 -12 ${5*W+14} ${4*H+16}" class="mch">`;
  for(let i=0;i<6;i++)s+=`<line x1="${i*W}" y1="0" x2="${i*W}" y2="${4*H}"/>`;
  for(let f=0;f<=4;f++)s+=`<line x1="0" y1="${f*H}" x2="${5*W}" y2="${f*H}" ${f===0&&base===1?'stroke-width="2.5"':''}/>`;
  if(base>1)s+=`<text x="${5*W+8}" y="${H*.8}" class="fr">${base}</text>`;
  F.forEach((f,i)=>{const x=i*W;if(f==null)s+=`<text x="${x}" y="-4">×</text>`;else if(f===0)s+=`<circle cx="${x}" cy="-6" r="3" class="o"/>`;else s+=`<circle cx="${x}" cy="${(f-base+.5)*H}" r="3.8"/>`});
  return s+'</svg>';
}
/* ---------- cancionero: instrumentos ---------- */
// cada cuerda suena una sola vez: al volver a tocarla se apaga la nota anterior (como en una guitarra real)
const GSTR={};
function gNote(m,s,t,len,vol,o){
  const pv=GSTR[s];if(pv&&pv.end>t){try{const G=pv.g.gain;if(G.cancelAndHoldAtTime)G.cancelAndHoldAtTime(t);else G.cancelScheduledValues(t);G.setTargetAtTime(0,t,.015)}catch(e){}}
  // cada cuerda un poco a su lado del estéreo, como si la guitarra estuviera enfrente
  const n=pluck(m,t,len,vol,Object.assign({pan:(3.5-s)*.06},o||{}));if(n)GSTR[s]=n;
}
/* Rasgueo: abajo = de la 6ª a la 1ª, arriba = de la 1ª hacia las graves pero solo 3-4 cuerdas.
   La púa tarda ~10 ms entre cuerdas (menos si el golpe es suave), con variaciones mínimas para que no suene a máquina. */
function gtrStrum(v,t,dir,vol,len,o){
  const up=dir==='u',n=v.midi.length,idx=v.midi.map((_,j)=>j),L=up?idx.slice(-Math.min(4,n)).reverse():idx;
  const gap=(up?.008:.011)*(vol<.06?.8:1);let tt=t;
  L.forEach((j,k)=>{const acc=up?(k===0?1:.8-k*.08):(k<2?.85:1)-(k>3?.05:0);
    gNote(v.midi[j],v.strs[j],tt,len,vol*acc*(.93+Math.random()*.14),o);tt+=gap*(.8+Math.random()*.4)});
}
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
 folk:{n:'Fogata',sub:4,ring:1.5,tip:'El de fogata: abajo, abajo-arriba, arriba-abajo-arriba. La mano sigue moviéndose aunque no toque.',
  4:{g:'D---D-U---U-D-U-',b:'R-------F-------',p:'--o---o---o---o-'},3:{g:'D---D-U-D-U-',b:'R-------F---',p:'--o---o---o-'}},
 pop:{n:'Pop',sub:4,ring:1,tip:'Corcheas parejas abajo-arriba con acento en el 2 y el 4, junto con la tarola.',
  4:{g:'d-u-D-u-d-u-D-u-',b:'R--R--R-R--R--R-',k:'X-----x-X-------',s:'----X-------X---',h:'x-x-x-x-x-x-x-x-'},3:{g:'D-u-d-u-d-u-',b:'R-------F---',k:'X-----------',s:'----x---x---',h:'x-x-x-x-x-x-'}},
 balada:{n:'Balada',sub:4,ring:2.4,tip:'Lento y con espacio: abajo, arriba-arriba, abajo. Deja que cada golpe suene completo.',
  4:{g:'D-----U---U-D---',b:'R-------F-------',k:'x-------o-------',r:'----x-------x---'},3:{g:'D-----U-U-D-',b:'R-----------',k:'x-----------',r:'--------x---'}},
 arpegio:{n:'Arpegio',sub:4,ring:2.6,tip:'Pulgar en el bajo y luego una cuerda a la vez (p-i-m-a), dejando que todo suene.',
  4:{g:'B-3-2-3-1-3-2-3-',b:'R---------------'},3:{g:'B-3-2-1-2-3-',b:'R-----------'}},
 travis:{n:'Travis',sub:4,ring:1.8,tip:'El pulgar alterna dos bajos en cada tiempo y los dedos tocan las agudas entre ellos.',
  4:{g:'B-2-b-1-B-2-b-1-',b:'R-------F-------'}},
 rock:{n:'Rock',sub:4,ring:.5,tip:'Corcheas hacia abajo, apagando un poco con la palma; más fuerte en cada tiempo.',
  4:{g:'D-d-D-d-D-d-D-d-',b:'R-R-R-R-R-R-R-R-',k:'X-----x-X-------',s:'----X-------X---',h:'x-x-x-x-x-x-x-x-'},3:{g:'D-d-d-D-d-d-',b:'R-R-R-R-R-R-',k:'X-------x---',s:'----X-------',h:'x-x-x-x-x-x-'}},
 rocknroll:{n:'Rock and roll',sub:4,walk:1,ring:.8,tip:'Abajo-arriba sin parar, golpe fuerte en el 2 y el 4. El bajo camina: raíz, tercera, quinta, sexta, séptima.',
  4:{g:'d-u-D-u-d-u-D-u-',b:'R-3-F-6-7-6-F-3-',k:'x-------x-------',s:'----X-------X---',h:'x-x-x-x-x-x-x-x-'}},
 shuffle:{n:'Blues shuffle',sub:3,walk:1,ring:.5,tip:'Swing: «lar-go cor-to». Golpe abajo en el tiempo y arriba en la última parte del tresillo.',
  4:{g:'D-uD-uD-uD-u',b:'R-R3-3F-F6-6',k:'x-----x-----',s:'---X-----X--',h:'x-xx-xx-xx-x'}},
 country:{n:'Country',sub:4,ring:.9,tip:'«Bum-chi-ca»: pulgar en el bajo y rasgueo abajo-arriba; el bajo alterna raíz y quinta.',
  4:{g:'B---D-U-b---D-U-',b:'R-------F-------',k:'x-------x-------',s:'----o-------o---'}},
 ranchera:{n:'Ranchera',sub:4,ring:.45,tip:'4/4: polka norteña, «bum-chac» con bajo en cada tiempo. 3/4: vals ranchero de mariachi con abanico.',
  4:{g:'B-x-b-x-B-x-b-x-',b:'R---F---R---F---',k:'x---x---x---x---',s:'--o---o---o---o-'},3:{g:'B---D-u-D-u-',b:'A-----------'}},
 vals:{n:'Vals',sub:4,ring:.6,tip:'Bum-chi-chi: bajo en el 1 y golpes cortos hacia abajo en el 2 y el 3.',
  3:{g:'B---d---d---',b:'A-----------',h:'----o---o---'}},
 bolero:{n:'Bolero',sub:4,ring:1.2,tip:'Pulgar en el 1 y el 3; acorde en el 2, su «y», y el 4. Suave, con maracas.',
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
// i = celda dentro del compás (beats·sub celdas)
function bandStep(id,beats,i,p,sh,t,spb,bar,ci){
  id=grooveFor(id,beats);const G=GROOVES[id],V=G[beats===3?3:4],sub=G.sub,cd=spb/sub,L=beats*sub;
  const v=voicing(p,sh),pc=(p.bass!=null?p.bass+sh:p.pc+sh+120)%12,rootLo=28+((pc-4+12)%12),minor=p.minor||/^(m(?!aj)|min|-)/.test(p.suf);
  const lev=(c,X,x,o)=>c==='X'?X:c==='x'?x:c==='o'?o:0;
  // percusión
  const dr=(k,f)=>{const c=V[k]&&V[k][i];if(c&&c!=='-')f(c)};
  dr('k',c=>kick(t,lev(c,.55,.42,.25)));dr('s',c=>snare(t,lev(c,.26,.2,.07)));
  dr('r',c=>noise(t,.04,'bandpass',1800,lev(c,.16,.11,.06),3));dr('h',c=>hat(t,lev(c,.07,.045,.025)));
  dr('p',c=>noise(t,.05,'highpass',6500,lev(c,.06,.04,.022)));dr('g2',c=>guiro(t,c==='X'));dr('c',c=>clave(t,lev(c,.16,.11,.06)));
  // bajo: dura hasta su siguiente nota o un «.»
  // las líneas que caminan (rock and roll, shuffle) empiezan de nuevo cuando cambia el acorde
  const bi=G.walk&&ci!=null?ci%L:i;
  const B=V.b;if(B&&B[bi]&&B[bi]!=='-'&&B[bi]!=='.'){let n=1;while(bi+n<L&&B[bi+n]==='-')n++;
    const c=B[bi],w=c==='A'?(bar%2?'F':'R'):c,iv={R:0,F:7,O:12,'3':minor?3:4,'6':9,'7':10}[w]||0;let m=rootLo+iv;if(w==='F'&&m>40)m-=12;
    bassNote(m,t,n*cd*.92,id==='rock'?.3:.36,true)}
  // guitarra: exactamente la línea que se ve
  const c=V.g&&V.g[i];if(!c||c==='-')return;
  const ring=G.ring*spb,lc=c.toLowerCase(),acc=c!==lc,sb=G.ring<.7?1.3:1;
  const bassStr=w=>{const want=(w==='b'?pc+7:pc)%12;let j=v.midi.findIndex((m,k)=>k<3&&m%12===want);if(j<0)j=w==='b'?Math.min(1,v.midi.length-1):0;return j};
  if(c==='B'||c==='b'||c==='C'){const j=bassStr(c==='C'?'B':c);gNote(v.midi[j],v.strs[j],t,Math.max(ring,spb*.9),.17)}
  if(c==='c'||c==='C'){v.midi.slice(-3).forEach((m,k)=>gNote(m,v.strs[v.midi.length-3+k],t+k*.004,ring,.13));return}
  if(c==='B'||c==='b')return;
  if(/\d/.test(c)){gtrPick(v,+c,t,spb*2.4,.24);return}
  if(lc==='x'){gtrStrum(v,t,'d',(acc?.13:.11),.07,{rel:.04,lp:1600,wet:.15});noise(t,.025,'bandpass',2500,.035,1.2);return}
  gtrStrum(v,t,lc,(acc?.125:.085)*sb,lc==='u'?Math.min(ring,spb*1.2):ring);
}
/* ---------- cancionero: formato ---------- */
// ChordPro: [Sol]letra con [Re7]acordes, {title:} {artist:} {key:} {bpm:} {time:3/4} {bpl:2} {cpb:1} {style:} {pickup:1} {c:Coro}
// En canciones con melodía: sílabas separadas con ~ (y _ une palabras en una sílaba) y {mel: G4/1 A4/.5 +B4/.5 r/1 …} después del renglón.
const TAB_RX=/^\s*[eBGDAEbgda]\s*\|[-\d|hpbrx\/\\~*.() ]{4,}$/;
const SEC_RX=/^\s*[\[(]?\s*(coro|estribillo|verso|estrofa|puente|intro|introducci[oó]n|final|outro|solo|interludio|instrumental|pre-?coro|chorus|verse|bridge|interlude|pre-?chorus|riff)\b[^\]\n]*?[\])]?\s*:?\s*$/i;
const LABEL_PFX=/^\s*\[?(intro|introducci[oó]n|final|outro|solo|interludio|instrumental|riff|coro|chorus)\]?\s*[:\-]\s*/i;
function isChordTok(t){const c=t.replace(/[|()[\]]/g,'');return!!c&&!!chParse(c)}
function isChordLine(l){const ts=l.trim().split(/\s+/).filter(Boolean);return ts.length>0&&ts.every(t=>isChordTok(t)||/^[|x\d()\-.:/]+$/i.test(t)||/^\(?x\d+\)?$/i.test(t))&&ts.some(isChordTok)}
function normalizePaste(txt){
  const L=txt.replace(/\r/g,'').replace(/\t/g,'    ').replace(/\u00a0/g,' ').split('\n'),out=[];
  for(let i=0;i<L.length;i++){
    let l=L[i];
    if(TAB_RX.test(l))continue;
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
    if(c===' '){if(buf||ch){push()}sp=true;continue}
    if(c==='~'){push();sp=false;continue}
    buf+=c;
  }
  push();
  return pcs;
}
/* Tonalidad a partir de TODOS los acordes (no solo el primero): cada una de las 24 tonalidades suma puntos por
   acorde que le pertenece (más si es el I, el IV o el V) y gana extra si la canción empieza o termina en su tónica. */
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
let SBTAB='trad',SBGENRE=null;
function viewSongbook(){
  SBGENRE=SBGENRE||Object.keys(TOP100)[0];
  const mine=(DB.songs||[]).map(s=>({id:s.id,src:s.src})),trad=TRAD.map((src,i)=>({id:'pd'+i,src}));
  const row=s=>{const P=songParse(s.src),sh=(DB.kt||{})[s.id]||0;return`<a class="card lrow" href="#/cancionero/ver/${s.id}"><span class="mn">${esc(chName(P.key,sh,P.key,DB.notation==='es')+(P.key.minor&&!/m/.test(P.key.suf||'')?'m':''))}</span><span class="mt"><b>${esc(P.title)}</b><span>${esc(P.artist||'Tu canción')} · ${P.bpm} bpm${P.hasMel?' · con melodía':''}</span></span></a>`};
  const tabs=[['trad','Con letra'],['mine','Mis canciones'],['top','Las 100']];
  const body=SBTAB==='trad'?`<p class="cap" style="margin:0">${TRAD.length} canciones tradicionales y de dominio público con letra y acordes completos. Las marcadas «con melodía» traen voz guía.</p><div class="list">${trad.map(row).join('')}</div>`
   :SBTAB==='mine'?`<div class="row"><a class="btn pri" href="#/cancionero/editar/nueva">${IC.plus}Agregar canción</a></div>${mine.length?`<div class="list">${mine.map(row).join('')}</div>`:`<div class="card"><h3>Agrega cualquier canción completa</h3><p class="cap">Copia la letra con acordes de cualquier sitio (como viene: acordes arriba y letra abajo) y pégala. La app la convierte en karaoke con tu tono, banda de acompañamiento y metrónomo. Se guarda solo en este dispositivo.</p></div>`}`
   :`<div class="card note"><b>Estas 100 no traen la letra.</b> Las letras de estas canciones tienen derechos de autor y la app no puede publicarlas. Toca <b>Agregar letra</b>, busca la canción, copia la letra con acordes y pégala: queda completa en karaoke con tono, banda y metrónomo.</div>
     <div class="chips">${Object.keys(TOP100).map(g=>`<button class="chip" data-g="${g}" aria-pressed="${g===SBGENRE}">${g}</button>`).join('')}</div>
     <div class="list">${TOPLIST.filter(x=>x.g===SBGENRE).map(x=>{const has=(DB.songs||[]).find(s=>s.top===x.id);return`<div class="card lrow top"><span class="mt"><b>${esc(x.t)}</b><span>${esc(x.a)} · ${x.y} · tono ${esc(x.k)} · ${x.bpm} bpm</span></span><div class="row" style="flex:none">${has?`<a class="btn sm pri" href="#/cancionero/ver/${has.id}">${IC.play}Abrir</a>`:`<a class="btn sm pri" href="#/cancionero/editar/${x.id}">${IC.plus}Agregar letra</a><a class="btn sm" href="#/cancionero/ver/${x.id}">Progresión</a>`}</div></div>`}).join('')}</div>`;
  return{title:'Cancionero',html:`<div class="lhead"><span class="eyebrow">Karaoke con acordes</span><h1>Cancionero</h1><p class="sub">La letra se ilumina al ritmo, los acordes cambian al tono de tu voz y una banda te acompaña.</p></div>
  <div class="seg" id="sbt">${tabs.map(([k,l])=>`<button data-tab="${k}" aria-pressed="${SBTAB===k}">${l}</button>`).join('')}</div>${body}`,
  mount(r){r.addEventListener('click',e=>{const t=e.target.closest('[data-tab]');if(t){SBTAB=t.dataset.tab;route();return}const g=e.target.closest('[data-g]');if(g){SBGENRE=g.dataset.g;route()}})}};
}
/* ---------- cancionero: editor ---------- */
function viewSongEdit(id){
  const ex=id!=='nueva'?sbGet(id):null,isTop=ex&&ex.top;
  const head=isTop?topHead(ex.top).replace(/\}\{/g,'}\n{')+'\n\n':'';
  const tpl=ex&&ex.mine?ex.src:isTop?head:`{title:Nombre de la canción}\n{artist:Artista}\n{bpm:90}\n\n`;
  return{title:ex&&ex.mine?'Editar canción':isTop?ex.top.t:'Nueva canción',back:'#/cancionero',html:`
  ${isTop?`<div class="card note"><b>Paso 1.</b> Busca la letra con acordes. <b>Paso 2.</b> Copia toda la canción. <b>Paso 3.</b> Regresa y toca «Pegar del portapapeles».<div class="row" style="margin-top:10px"><a class="btn sm pri" target="_blank" rel="noopener" href="https://www.google.com/search?q=${encodeURIComponent(ex.top.t+' '+ex.top.a+' letra y acordes')}">Buscar letra y acordes</a></div></div>`:''}
  <div class="card" style="display:flex;flex-direction:column;gap:12px">
   <div class="row"><button class="btn sm" id="sbpaste">Pegar del portapapeles</button><span class="cap" style="margin:0">o pega con el teclado dentro del cuadro</span></div>
   <textarea id="sbsrc" rows="16" spellcheck="false" placeholder="Pega aquí la canción: acordes arriba y letra abajo, o [Sol]letra con [Re]acordes">${esc(tpl)}</textarea>
   <div id="sbprev" class="cap" style="margin:0"></div>
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
    const prev=()=>{const P=songParse(ta.value),n=P.lines.filter(l=>l.pieces).length,w=P.lines.filter(l=>l.pieces&&l.pieces.some(p=>p.text.trim())).length;$('#sbprev',r).innerHTML=n?`Detecté <b>${n}</b> renglones (${w} con letra) y <b>${P.chords.length}</b> acordes distintos · tono <b>${esc(chName(P.key,0,P.key,DB.notation==='es'))}${P.key.minor&&!/m/.test(P.key.suf||'')?'m':''}</b>${P.keyAuto?' (por los acordes)':''} · ${P.beats}/4 · ${P.bpm} bpm · ${BSTYLES[P.style]}${P.set.style?'':' (sugerido)'}. Todo se puede cambiar al tocarla.`:''};
    ta.addEventListener('input',prev);prev();
    $('#sbpaste',r).onclick=async()=>{try{const t=await navigator.clipboard.readText();if(!t){$('#sbmsg',r).textContent='El portapapeles está vacío. Copia la canción primero.';return}ta.value=(isTop?head:'')+t;prev();$('#sbmsg',r).textContent=''}catch(e){$('#sbmsg',r).textContent='Tu navegador no dejó leer el portapapeles. Mantén presionado el cuadro y elige «Pegar».';ta.focus()}};
    $('#sbsave',r).onclick=()=>{
      const src=ta.value;const P=songParse(src);
      if(!P.lines.some(l=>l.pieces&&l.pieces.some(p=>p.text.trim()||p.p))){$('#sbmsg',r).textContent='No encontré letra ni acordes. Revisa lo que pegaste.';return}
      DB.songs=DB.songs||[];const sid=ex&&ex.mine?id:'u'+Date.now().toString(36);
      const i=DB.songs.findIndex(s=>s.id===sid);if(i>=0)DB.songs[i].src=src;else DB.songs.unshift(Object.assign({id:sid,src},isTop?{top:id}:{}));
      save();toast(logo()+'<span>Canción guardada</span>');SBTAB='mine';location.hash='#/cancionero/ver/'+sid;
    };
    const d=$('#sbdel',r);if(d)d.onclick=()=>{$('#sbdw',r).innerHTML='<button class="btn" id="sbdelok" style="border-color:var(--bad);color:var(--bad)">Sí, borrar</button>';$('#sbdelok',r).onclick=()=>{DB.songs=DB.songs.filter(s=>s.id!==id);save();SBTAB='mine';location.hash='#/cancionero'}};
  }};
}
/* ---------- cancionero: reproductor karaoke ---------- */
const KAR={show:'both',met:false,band:true,voice:true,size:1};
function capoHint(key,shift){
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
function viewSongPlay(id,slow){
  const s=sbGet(id);if(!s)return viewSongbook();
  const P=songParse(s.src);DB.kt=DB.kt||{};DB.kbpm=DB.kbpm||{};DB.kst=DB.kst||{};
  DB.kbeats=DB.kbeats||{};DB.ksp=DB.ksp||{};const st={sp:slow?(DB.ksp[id]&&DB.ksp[id]<1?DB.ksp[id]:.75):(DB.ksp[id]||1),loop:0,shift:DB.kt[id]||0,bpm:DB.kbpm[id]||P.bpm,bars:0,style:GROOVES[DB.kst[id]]?DB.kst[id]:P.style,beats:DB.kbeats[id]||P.beats};
  const gid=()=>grooveFor(st.style,st.beats),RES=()=>GROOVES[gid()].sub;
  const styChips=()=>Object.entries(GROOVES).filter(([k,g])=>g[st.beats===3?3:4]).map(([k,g])=>`<button class="chip" data-sty="${k}" aria-pressed="${gid()===k}">${g.n}</button>`).join('');
  Object.assign(KAR,DB.kar||{});
  const es=()=>DB.notation==='es';
  const keyLbl=()=>chName(P.key,st.shift,P.key,es())+(P.key.minor&&!/m/.test(P.key.suf||'')?'m':'');
  const lineHTML=(l,i)=>{
    if(l.gap)return'<div class="kgap"></div>';
    if(l.label!=null)return`<div class="klab">${esc(l.label)}</div>`;
    const words=[];l.pieces.forEach((pc,pi)=>{if(pc.sp||!words.length)words.push([]);words[words.length-1].push([pc,pi])});
    const onlyCh=!l.pieces.some(p=>p.text.trim());
    return`<div class="kl${onlyCh?' inst':''}" data-li="${i}">${words.map(w=>`<span class="wd">${w.map(([pc,pi],wi)=>{const nm=pc.p?chName(pc.p,st.shift,P.key,es()):'';return`<span class="pc${pc.p?' hc':''}${wi<w.length-1&&pc.text?' mid':''}" data-pi="${pi}"><b class="kc">${nm?esc(nm):''}</b><i>${esc(pc.text)||''}</i></span>`}).join('')}</span>`).join(' ')}</div>`;
  };
  const chips=()=>P.chords.map(p=>{const v=voicing(p,st.shift),n=chName(p,st.shift,P.key,es());return`<button class="kchip" data-kc="${esc(chName(p,st.shift,P.key,false))}">${chordSVG(v)}<b>${esc(n)}</b></button>`}).join('');
  return{title:P.title,back:slow?'#/practicar/lento':'#/cancionero',html:`
  <div class="khead"><div><span class="eyebrow">${esc(P.artist)}</span><h2>${esc(P.title)}</h2></div>${s.mine?`<a class="btn sm" href="#/cancionero/editar/${id}">Editar</a>`:s.top?`<a class="btn sm pri" href="#/cancionero/editar/${id}">${IC.plus}Agregar letra</a>`:''}</div>
  ${s.top?`<div class="card note">Esta es solo la <b>progresión principal</b> para practicar con la banda. Para tener la canción completa con letra, toca <b>Agregar letra</b>.</div>`:''}
  <div class="card kctl">
   <div class="krow"><div><span class="cl">Tono</span><div class="row"><button class="btn sm" data-k="-1" aria-label="Bajar medio tono">${IC.minus}</button><b class="kkey" id="kkey">${esc(keyLbl())}</b><button class="btn sm" data-k="1" aria-label="Subir medio tono">${IC.plus}</button><button class="btn sm" data-k="0">Original</button></div></div>
    <div><span class="cl">Tempo</span><div class="row"><button class="btn sm" data-b="-4" aria-label="Más lento">${IC.minus}</button><b class="kkey" id="kbpm">${st.bpm}</b><button class="btn sm" data-b="4" aria-label="Más rápido">${IC.plus}</button><button class="btn sm" id="ktap" title="Toca 4 veces al ritmo de la canción">Marcar</button></div></div></div>
   <p class="cap" id="kcapo" style="margin:0">${capoHint(P.key,st.shift)}</p>
   <div class="kslow${slow?' hl':''}"><div><span class="cl">Velocidad${slow?' · cámara lenta':''}</span><div class="chips">${[.5,.6,.75,.9,1].map(v=>`<button class="chip" data-sp="${v}" aria-pressed="${st.sp===v}">${Math.round(v*100)} %</button>`).join('')}</div></div>
    <div><span class="cl">Repetir desde el renglón elegido</span><div class="seg">${[[0,'No'],[1,'1 renglón'],[2,'2'],[4,'4']].map(([v,l])=>`<button data-lp="${v}" aria-pressed="${st.loop===v}">${l}</button>`).join('')}</div></div>
    <p class="cap" id="kspd" style="margin:0"></p></div>
   <details class="kmore"><summary>Ritmo, compás, vista y sonido<small>${BSTYLES[gid()]} · ${st.beats}/4</small></summary><div class="kmin">
   <div><span class="cl">Ver</span><div class="row"><div class="seg">${[['both','Letra y acordes'],['lyrics','Letra'],['chords','Acordes']].map(([v,l])=>`<button data-show="${v}" aria-pressed="${KAR.show===v}">${l}</button>`).join('')}</div>
    <div class="seg">${[['us','C D E'],['es','Do Re Mi']].map(([v,l])=>`<button data-not="${v}" aria-pressed="${(DB.notation||'us')===v}">${l}</button>`).join('')}</div><button class="btn sm" data-z="-1" aria-label="Letra más chica">A−</button><button class="btn sm" data-z="1" aria-label="Letra más grande">A+</button></div></div>
   <div><span class="cl">Sonido</span><div class="row"><button class="btn sm ${KAR.band?'on':''}" data-t="band">${IC.wave}Banda</button>${P.hasMel?`<button class="btn sm ${KAR.voice?'on':''}" data-t="voice">${IC.note}Voz guía</button>`:''}<button class="btn sm ${KAR.met?'on':''}" data-t="met">${IC.play2}Metrónomo</button></div></div>
   <div><span class="cl">Ritmo de la banda</span><div class="chips" id="kstys">${styChips()}</div></div>
   <div class="krow"><div><span class="cl">Compás</span><div class="seg">${[[4,'4/4'],[3,'3/4 vals']].map(([v,l])=>`<button data-beats="${v}" aria-pressed="${st.beats===v}">${l}</button>`).join('')}</div></div>
    ${P.lines.some(l=>l.pieces&&!l.mel)?`<div><span class="cl">Compases por renglón</span><select class="inp" id="kbpl" style="width:auto">${[0,1,2,3,4,6,8].map(v=>`<option value="${v}" ${v===st.bars?'selected':''}>${v||'Automático'}</option>`).join('')}</select></div>`:''}</div>
   </div></details>
  </div>
  <div class="kchips" id="kchips">${chips()}</div>
  <div class="kwrap"><div class="karaoke show-${KAR.show}" id="kar" style="--kz:${KAR.size}">${P.lines.map(lineHTML).join('')}</div>
  <aside class="kside" id="kside"></aside></div>
  <div class="kbar"><span class="bd" id="kbd"></span><span class="tm" id="kpos">${st.beats}/4 · ${BSTYLES[gid()]} · listo</span><button class="btn sm" id="kreset" aria-label="Desde el inicio">${IC.back}</button><button class="btn pri" id="kgo">${IC.play}Empezar</button></div>`,
  mount(r){
    const sumK=()=>{const m=$('.kmore summary small',r);if(m)m.textContent=`${BSTYLES[gid()]} · ${st.beats}/4`};
    let LP=null;
    const spdTxt=()=>{const m=$('#kspd',r);if(m)m.textContent=st.sp<1?`La banda va a ${Math.round(st.bpm*st.sp)} bpm (de ${st.bpm}). El tono no cambia.`:''};
    const kar=$('#kar',r);let pos=0,TL=null,BK=null,curCh=P.chords[0]||null;
    requestAnimationFrame(()=>fitKar(kar));const onRs=()=>fitKar(kar);window.addEventListener('resize',onRs);setTimeout(()=>{if(!document.body.contains(kar))window.removeEventListener('resize',onRs)},0);
    // panel lateral: tono, rasgueo sugerido y acorde que suena
    const side=()=>{const s=$('#kside',r);if(!s)return;
      s.innerHTML=`<div class="ks-row"><div><span class="cl">Tono</span><b class="ks-key">${esc(keyLbl())}</b></div><div><span class="cl">Tempo</span><b class="ks-num">${st.bpm}</b><small>bpm · ${st.beats}/4</small></div></div>
       <p class="ks-capo">${esc(capoHint(P.key,st.shift))}</p>
       <div><span class="cl">Rasgueo sugerido · ${BSTYLES[gid()]}</span>${patHTML(st.style,st.beats)}<p class="ks-tip">${GROOVES[gid()].tip}</p></div>
       <div class="ks-ch"><span class="cl">Acorde</span><div id="ksch">${chNow()}</div></div>`};
    const chNow=()=>curCh?`<div class="ks-chord">${chordSVG(voicing(curCh,st.shift))}<b>${esc(chName(curCh,st.shift,P.key,es()))}</b></div>`:'<p class="ks-tip">—</p>';
    const build=()=>{
      TL=songTimeline(P,st.bars,st.beats);BK={};const Q=TL.res=RES();
      TL.ev.forEach(e=>{const k=Math.round(e.b*Q);(BK[k]=BK[k]||[]).push(e)});
      // acorde vigente en cada celda (dieciseisavo o tresillo, según el ritmo)
      const ch=TL.ev.filter(e=>e.type==='chord').sort((a,b)=>a.b-b.b);TL.chAt=[];let j=-1;const N=Math.ceil(TL.total*Q);
      TL.chS=[];for(let k=0;k<N;k++){while(j+1<ch.length&&Math.round(ch[j+1].b*Q)<=k)j++;TL.chAt[k]=j>=0?ch[j].p:null;TL.chS[k]=j>=0?Math.round(ch[j].b*Q):0}
    };
    build();
    const running=()=>SEQ.id==='kar';
    const paint=()=>{$('#kgo',r).innerHTML=running()?IC.pause+'Pausa':IC.play+(pos?'Continuar':'Empezar')};
    const clearHL=()=>{$$('.kl',kar).forEach(x=>x.classList.remove('cur','past'));$$('.pc',kar).forEach(x=>x.classList.remove('lit','now'))};
    const setLine=li=>{
      $$('.kl.cur',kar).forEach(x=>{x.classList.remove('cur');x.classList.add('past')});
      const el=$(`.kl[data-li="${li}"]`,kar);if(!el)return;el.classList.remove('past');el.classList.add('cur');
      const top=el.getBoundingClientRect().top;if(top<90||top>innerHeight*.55)el.scrollIntoView({block:'center',behavior:'smooth'});
    };
    const lineIdx=li=>TL.lines.findIndex(x=>x.li===li);
    const go=()=>{
      if(running()){seqStop();paint();return}
      if(!ac())return;loadSamples();if(TL.res!==RES())build();
      const Q=TL.res,G=gid(),stp=+(($('.kpat',r)||{}).dataset||{}).step||1,bt=st.beats,startB0=TL.lines[pos]?TL.lines[pos].start:0,startB=P.pickup?startB0:Math.floor(startB0/bt+1e-6)*bt,startK=Math.round(startB*Q);
      // cuenta: un compás completo y, si la canción entra con anacrusa, los pulsos que faltan para que caiga en su lugar
      const pk=P.pickup%bt,countK=(bt+(pos===0&&pk?bt-pk:0))*Q,N=Math.ceil(TL.total*Q);
      LP=null;if(st.loop&&TL.lines[pos]){const g1=Math.min(TL.lines.length,pos+st.loop),e0=g1<TL.lines.length?TL.lines[g1].start:TL.total,e=Math.ceil(e0/bt-1e-6)*bt*Q;if(e>startK)LP={s:startK,e,g0:pos,g1}}
      const absA=k=>{const a=startK+k;return LP?LP.s+((a-LP.s)%(LP.e-LP.s)):a};
            clearHL();for(let g=0;g<pos;g++){const e=$(`.kl[data-li="${TL.lines[g].li}"]`,kar);if(e)e.classList.add('past')}
      seqStart('kar','Karaoke · '+P.title,()=>60/(st.bpm*st.sp)/Q,(s,t)=>{
        const k=s-countK;
        if(k<0){if(s%Q===0)tick(t,s===0?'acc':'beat');return}
        const a=absA(k);if(a>=N)return;
        const spb=60/(st.bpm*st.sp),rel=a-Math.round(P.pickup*Q),L=bt*Q,i=((rel%L)+L)%L,bar=Math.floor(rel/L);
        if(KAR.met&&i%Q===0)tick(t,i===0?'acc':'sub',i===0?'bar':'beat');
        if(KAR.band&&TL.chAt[a])bandStep(G,bt,i,TL.chAt[a],st.shift,t,spb,bar,a-TL.chS[a]);
        if(KAR.voice&&BK[a])BK[a].forEach(e=>{if(e.type==='note')leadNote(e.m+st.shift,t,e.d*spb,.2)});
      },s=>{
        const k=s-countK;
        if(k<0){if(s%Q===0){$('#kpos',r).textContent=(LP?'Repitiendo · ':'')+'Cuenta: '+(s/Q+1);const bd=$('#kbd',r);if(bd){bd.classList.add('on');setTimeout(()=>bd.classList.remove('on'),100)}}return}
        const a=absA(k);
        if(LP&&k>0&&a===LP.s){for(let g=LP.g0;g<LP.g1;g++){const e=$(`.kl[data-li="${TL.lines[g].li}"]`,kar);if(e){e.classList.remove('cur','past');$$('.pc',e).forEach(x=>x.classList.remove('lit','now'))}}}
        if(a>=N){seqStop();pos=0;$('#kpos',r).textContent='Fin · '+P.title;paint();markDay();return}
        if(a%stp===0){const rel2=a-Math.round(P.pickup*Q),L2=bt*Q,sl=((rel2%L2)+L2)%L2/stp;$$('.kpat .sl.on',r).forEach(x=>x.classList.remove('on'));const q=$(`.kpat [data-sl="${sl}"]`,r);if(q)q.classList.add('on')}
        if(a%Q===0){const bd=$('#kbd',r);if(bd){const rel=a-Math.round(P.pickup*Q);bd.classList.add('on');bd.classList.toggle('acc',((rel%(bt*Q))+bt*Q)%(bt*Q)===0);setTimeout(()=>bd.classList.remove('on'),100)}}
        (BK[a]||[]).forEach(e=>{
          if(e.type==='line'){setLine(e.li);pos=Math.max(0,lineIdx(e.li));$('#kpos',r).textContent=(LP?'Repitiendo · ':'')+`Renglón ${pos+1} de ${TL.lines.length}`}
          else if(e.type==='lit'){const p=$(`.kl[data-li="${e.li}"] .pc[data-pi="${e.pi}"]`,kar);if(p)p.classList.add('lit')}
          else if(e.type==='chord'){if(e.p!==curCh){curCh=e.p;const k=$('#ksch',r);if(k)k.innerHTML=chNow()}$$('.pc.now',kar).forEach(x=>x.classList.remove('now'));const p=$(`.kl[data-li="${e.li}"] .pc[data-pi="${e.pi}"]`,kar);if(p)p.classList.add('now')}
        });
      });
      paint();
    };
    $('#kgo',r).onclick=go;
    $('#kreset',r).onclick=()=>{if(running())seqStop();pos=0;clearHL();window.scrollTo({top:0,behavior:'smooth'});paint()};
    kar.addEventListener('click',e=>{const l=e.target.closest('.kl');if(!l)return;const g=lineIdx(+l.dataset.li);if(g<0)return;const was=running();if(was)seqStop();pos=g;clearHL();setLine(+l.dataset.li);if(was)go();paint()});
    const rerender=()=>{kar.innerHTML=P.lines.map(lineHTML).join('');requestAnimationFrame(()=>fitKar(kar));$('#kchips',r).innerHTML=chips();$('#kkey',r).textContent=keyLbl();$('#kcapo',r).textContent=capoHint(P.key,st.shift);side()};
    r.addEventListener('click',e=>{
      const k=e.target.closest('[data-k]');if(k){const v=+k.dataset.k;st.shift=v?((st.shift+v+18)%12)-6:0;DB.kt[id]=st.shift;save();rerender();return}
      const b=e.target.closest('[data-b]');if(b){st.bpm=Math.max(40,Math.min(220,st.bpm+ +b.dataset.b));DB.kbpm[id]=st.bpm;save();$('#kbpm',r).textContent=st.bpm;side();return}
      const sh=e.target.closest('[data-show]');if(sh){KAR.show=sh.dataset.show;kar.className='karaoke show-'+KAR.show;$$('[data-show]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===sh)));DB.kar=Object.assign({},KAR);save();return}
      const n=e.target.closest('[data-not]');if(n){DB.notation=n.dataset.not;save();$$('[data-not]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===n)));rerender();return}
      const t=e.target.closest('[data-t]');if(t){KAR[t.dataset.t]=!KAR[t.dataset.t];t.classList.toggle('on',KAR[t.dataset.t]);DB.kar=Object.assign({},KAR);save();return}
      const sp=e.target.closest('[data-sp]');if(sp){st.sp=+sp.dataset.sp;DB.ksp[id]=st.sp;save();$$('[data-sp]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===sp)));spdTxt();return}
      const lp=e.target.closest('[data-lp]');if(lp){const was=running();if(was)seqStop();st.loop=+lp.dataset.lp;$$('[data-lp]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===lp)));if(was)go();paint();return}
      const bb=e.target.closest('[data-beats]');if(bb){const was=running();if(was)seqStop();st.beats=+bb.dataset.beats;DB.kbeats[id]=st.beats;sumK();save();$$('[data-beats]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===bb)));build();if(pos>=TL.lines.length)pos=0;$('#kstys',r).innerHTML=styChips();sumK();side();paint();$('#kpos',r).textContent=`${st.beats}/4 · ${BSTYLES[gid()]} · listo`;return}
      const y=e.target.closest('[data-sty]');if(y){const was=running();if(was)seqStop();st.style=y.dataset.sty;sumK();DB.kst[id]=st.style;save();$$('[data-sty]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===y)));side();build();if(was)go();paint();return}
      const z=e.target.closest('[data-z]');if(z){KAR.size=Math.max(.8,Math.min(1.8,+(KAR.size+ +z.dataset.z*.15).toFixed(2)));kar.style.setProperty('--kz',KAR.size);fitKar(kar);DB.kar=Object.assign({},KAR);save();return}
      const c=e.target.closest('[data-kc]');if(c){const p=chParse(c.dataset.kc);if(p&&ac())gtrStrum(voicing(p,0),AC.currentTime+.02,'d',.09,2)}
    });
    const sel=$('#kbpl',r);if(sel)sel.onchange=e=>{const was=running();if(was)seqStop();st.bars=+e.target.value;build();if(pos>=TL.lines.length)pos=0;paint()};
    // marcar el tempo con toques
    let taps=[];$('#ktap',r).onclick=()=>{const now=performance.now();taps=taps.filter(x=>now-x<2500);taps.push(now);
      if(taps.length>=4){const iv=(taps[taps.length-1]-taps[0])/(taps.length-1),b=Math.round(60000/iv);if(b>=40&&b<=220){st.bpm=b;DB.kbpm[id]=b;save();$('#kbpm',r).textContent=b;side()}}
      $('#ktap',r).textContent=taps.length<4?'Toca '+(4-taps.length):'Marcar'};
    const onState=()=>{paint();if(!running())$$('.kpat .sl.on',r).forEach(x=>x.classList.remove('on'))};
    document.addEventListener('playstate',onState);
    side();paint();spdTxt();
    return()=>{document.removeEventListener('playstate',onState);if(running())seqStop()};
  }};
}
