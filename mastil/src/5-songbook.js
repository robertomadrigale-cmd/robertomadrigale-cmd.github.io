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
  if(bass!=null){const low=frets.findIndex(f=>f!=null);for(let i=0;i<3;i++){const s=6-i,f=(bass-OPEN_PC[s]+12)%12;if(f<=Math.max(...frets.filter(x=>x!=null))+1){for(let j=0;j<i;j++)frets[j]=null;frets[i]=f;break}}}
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
function gNote(m,s,t,len,vol){
  const pv=GSTR[s];if(pv&&pv.end>t){try{pv.g.gain.cancelScheduledValues(t);pv.g.gain.setTargetAtTime(0,t,.018)}catch(e){}}
  const n=pluck(m,t,len,vol);if(n)GSTR[s]=n;
}
function gtrStrum(v,t,dir,vol,len){
  const up=dir==='u',idx=v.midi.map((_,j)=>j),L=up?idx.slice(-4).reverse():idx,gap=up?.011:.015;
  L.forEach((j,n)=>gNote(v.midi[j],v.strs[j],t+n*gap*(.85+Math.random()*.3),len,(up?.62:1)*vol*(.9+Math.random()*.2)*(up?1:n<2?.9:1)));
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
const BSTYLES={folk:'Folk acústico',pop:'Pop',balada:'Balada',rock:'Rock',vals:'Vals',ranchera:'Ranchera',cumbia:'Cumbia',son:'Son jarocho',urbano:'Urbano'};
/* Rasgueo de la guitarra: un carácter por corchea. Es lo que se muestra Y lo que suena (misma fuente).
   D/d abajo (mayúscula = acento), U/u arriba, x apagado con la palma, B bajo con el pulgar, 1-6 cuerda del arpegio, - dejar sonar. */
const KPAT={
 folk:{4:'D-DU-UDU',3:'D-DUDU',ring:1.5,tip:'El de fogata: abajo, abajo-arriba, arriba-abajo-arriba. La mano sigue moviéndose aunque no toque.'},
 pop:{4:'D-DU-UDU',3:'D-DUDU',ring:1.2,tip:'El mismo de fogata pero parejo y con batería: acentúa el 2 y el 4 junto con la tarola.'},
 balada:{4:'B4321234',3:'B43234',ring:2.6,tip:'Arpegio: pulgar en el bajo y luego una cuerda a la vez, dejando que todo suene.'},
 rock:{4:'D--UD--U',3:'D--U--',ring:1.9,tip:'Golpes firmes hacia abajo en el 1 y el 3; uno suave hacia arriba antes. Prueba apagar con la palma.'},
 vals:{4:'B-d-d-d-',3:'B-d-d-',ring:.6,tip:'Bum-chi-chi: bajo en el 1 y golpes cortos hacia abajo en los otros tiempos.'},
 ranchera:{4:'B-x-B-xu',3:'B-x-x-',ring:.45,tip:'Bajo alternado (raíz y quinta) y golpes cortos apagados con la palma: sabor de mariachi.'},
 cumbia:{4:'Bd-dBd-d',3:'Bd-d-d',ring:.35,tip:'Bajo en el 1 y el 3, y un golpe corto en el «y» de cada tiempo, como el güiro.'},
 son:{4:'DudUdUdu',3:'DudUdU',ring:.5,tip:'Rasgueo continuo abajo-arriba, acentuando los golpes marcados.'},
 urbano:{4:'D--D--D-',3:'D--D--',ring:1.1,tip:'Tres golpes en 3-3-2 (el «tresillo»): caen junto con el bombo y la tarola del dembow.'}};
// bajo de la banda: [dieciseisavo] → 'r' raíz, 'f' quinta, 'o' octava; con duración en pulsos
const KBASS={
 folk:{4:{0:['r',1.8],8:['f',1.8]},3:{0:['r',1.8],8:['f',.9]}},
 pop:{4:{0:['r',.9],4:['r',.9],8:['r',.9],12:['f',.9]},3:{0:['r',.9],4:['r',.9],8:['f',.9]}},
 balada:{4:{0:['r',1.9],8:['f',1.9]},3:{0:['r',2.9]}},
 rock:{4:{0:['r',.45],2:['r',.45],4:['r',.45],6:['r',.45],8:['r',.45],10:['r',.45],12:['r',.45],14:['r',.45]},3:{0:['r',.45],2:['r',.45],4:['r',.45],6:['r',.45],8:['r',.45],10:['r',.45]}},
 vals:{4:{0:['r',.95],8:['f',.95]},3:{0:['a',.95]}},
 ranchera:{4:{0:['r',.9],8:['f',.9]},3:{0:['a',.9]}},
 cumbia:{4:{0:['r',.9],8:['f',.9]},3:{0:['r',.9]}},
 son:{4:{0:['r',.5],6:['f',.5],8:['r',.5]},3:{0:['r',.5],6:['f',.5]}},
 urbano:{4:{0:['r',1.4],6:['r',.4],8:['r',1.4],14:['f',.4]},3:{0:['r',1.4],6:['r',.4]}}};
// i = dieciseisavo dentro del compás, L = dieciseisavos por compás
function bandStep(st,i,L,p,sh,t,spb,bar){
  const K=KPAT[st]?st:'folk',three=L===12,v=voicing(p,sh),root=v.root,fifth=root+7>52?root-5:root+7,q=spb;
  // batería y percusión
  if(K==='rock'){if(i%2===0)hat(t,i%4?.05:.09);if(i===0||(!three&&(i===8||i===10)))kick(t,.75);if(i===4||(!three&&i===12)||(three&&i===8))snare(t,.34)}
  else if(K==='pop'){if(i%2===0)hat(t,i%4?.035:.06);if(i===0||(!three&&(i===8||i===10)))kick(t,.6);if(i===4||(!three&&i===12)||(three&&i===8))snare(t,.26)}
  else if(K==='urbano'){if(i%4===0)kick(t,.7);if(three?(i===3||i===6||i===10):(i===3||i===6||i===11||i===14))snare(t,.24);if(i%2===0)hat(t,.03)}
  else if(K==='balada'){if(i===0)kick(t,.5);if(!three&&i===8)kick(t,.35);if(!three&&(i===4||i===12))noise(t,.05,'bandpass',2600,.07,2);if(i%4===2)hat(t,.03)}
  else if(K==='vals'){if(i%4===0&&i)hat(t,.04)}
  else if(K==='cumbia'){if(i%2===0)guiro(t,i%4===0);if(i===0||i===8)kick(t,.5)}
  else if(K==='son'){if(i%4===0)noise(t,.02,'highpass',6000,.04)}
  else if(K==='folk'){if(i%4===2)noise(t,.03,'highpass',6500,.025)}
  // bajo
  const bs=KBASS[K][three?3:4][i];let bassM=null;
  if(bs){const w=bs[0]==='a'?(bar%2?'f':'r'):bs[0];bassM=w==='f'?fifth:w==='o'&&root+12<=55?root+12:root;bassNote(bassM,t,q*bs[1],K==='rock'?.3:.36)}
  // guitarra: exactamente el patrón que se ve
  if(i%2)return;const P=KPAT[K][three?3:4],c=P[i/2];if(!c||c==='-')return;
  const ring=KPAT[K].ring*q,lc=c.toLowerCase(),acc=c!==lc;
  if(c==='B'){const want=bassM!=null?bassM%12:root%12,j=v.midi.findIndex(m=>m%12===want);gNote(v.midi[j<0?0:j],v.strs[j<0?0:j],t,Math.max(ring,q*.9),.1);return}
  if(/\d/.test(c)){gtrPick(v,+c,t,q*2.4,.15);return}
  if(lc==='x'){gtrStrum(v,t,'d',.06,q*.22);noise(t,.03,'highpass',5000,.05);return}
  gtrStrum(v,t,lc,acc?.072:.05,lc==='u'?Math.min(ring,q*1.2):ring);
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
      else if(k==='bpl')S.bpl=Math.max(1,Math.min(8,+v||2));else if(k==='cpb')S.cpb=Math.max(.5,Math.min(4,+v||1));else if(k==='style'&&BSTYLES[v])S.style=v;else if(k==='pickup')S.pickup=Math.max(0,+v||0);else if(k==='bps')S.bps=Math.max(.4,Math.min(4,+v||1));
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
      let nb=bars0>0?bars0:Math.ceil((W*bps+(hasTxt?1:0))/bt-.15);
      if(!(bars0>0)&&hasTxt&&nb>2&&nb%2)nb++;
      nb=Math.max(nb,1,S.bpl||1,Math.ceil(n*(S.cpb||.5)));
      if(first&&lead){start=b=Math.ceil(lead*bps/bt)*bt}
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
  const P=(KPAT[style]||KPAT.folk)[beats===3?3:4],cnt=[];for(let b=1;b<=P.length/2;b++)cnt.push(String(b),'y');
  return`<div class="kpat" style="--n:${P.length}">${[...P].map((c,i)=>{const lc=c.toLowerCase(),strong=c!==lc;
    const g=c==='-'?'<span class="rest">·</span>':c==='B'?'<span class="bass">B</span>':/\d/.test(c)?`<span class="str">${c}</span>`:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strong?2.4:1.6}" stroke-linecap="round" stroke-linejoin="round">${KARR[lc]}</svg>`;
    return`<span class="sl${strong&&/[du]/i.test(c)?' acc':''}" data-sl="${i}">${g}<small>${cnt[i]}</small></span>`}).join('')}</div>`;
}
function viewSongPlay(id){
  const s=sbGet(id);if(!s)return viewSongbook();
  const P=songParse(s.src);DB.kt=DB.kt||{};DB.kbpm=DB.kbpm||{};DB.kst=DB.kst||{};
  DB.kbeats=DB.kbeats||{};const st={shift:DB.kt[id]||0,bpm:DB.kbpm[id]||P.bpm,bars:0,style:KPAT[DB.kst[id]]?DB.kst[id]:P.style,beats:DB.kbeats[id]||P.beats};
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
  return{title:P.title,back:'#/cancionero',html:`
  <div class="khead"><div><span class="eyebrow">${esc(P.artist)}</span><h2>${esc(P.title)}</h2></div>${s.mine?`<a class="btn sm" href="#/cancionero/editar/${id}">Editar</a>`:s.top?`<a class="btn sm pri" href="#/cancionero/editar/${id}">${IC.plus}Agregar letra</a>`:''}</div>
  ${s.top?`<div class="card note">Esta es solo la <b>progresión principal</b> para practicar con la banda. Para tener la canción completa con letra, toca <b>Agregar letra</b>.</div>`:''}
  <div class="card kctl">
   <div class="krow"><div><span class="cl">Tono</span><div class="row"><button class="btn sm" data-k="-1" aria-label="Bajar medio tono">${IC.minus}</button><b class="kkey" id="kkey">${esc(keyLbl())}</b><button class="btn sm" data-k="1" aria-label="Subir medio tono">${IC.plus}</button><button class="btn sm" data-k="0">Original</button></div></div>
    <div><span class="cl">Tempo</span><div class="row"><button class="btn sm" data-b="-4" aria-label="Más lento">${IC.minus}</button><b class="kkey" id="kbpm">${st.bpm}</b><button class="btn sm" data-b="4" aria-label="Más rápido">${IC.plus}</button><button class="btn sm" id="ktap" title="Toca 4 veces al ritmo de la canción">Marcar</button></div></div></div>
   <p class="cap" id="kcapo" style="margin:0">${capoHint(P.key,st.shift)}</p>
   <details class="kmore"><summary>Ritmo, compás, vista y sonido<small>${BSTYLES[st.style]} · ${st.beats}/4</small></summary><div class="kmin">
   <div><span class="cl">Ver</span><div class="row"><div class="seg">${[['both','Letra y acordes'],['lyrics','Letra'],['chords','Acordes']].map(([v,l])=>`<button data-show="${v}" aria-pressed="${KAR.show===v}">${l}</button>`).join('')}</div>
    <div class="seg">${[['us','C D E'],['es','Do Re Mi']].map(([v,l])=>`<button data-not="${v}" aria-pressed="${(DB.notation||'us')===v}">${l}</button>`).join('')}</div><button class="btn sm" data-z="-1" aria-label="Letra más chica">A−</button><button class="btn sm" data-z="1" aria-label="Letra más grande">A+</button></div></div>
   <div><span class="cl">Sonido</span><div class="row"><button class="btn sm ${KAR.band?'on':''}" data-t="band">${IC.wave}Banda</button>${P.hasMel?`<button class="btn sm ${KAR.voice?'on':''}" data-t="voice">${IC.note}Voz guía</button>`:''}<button class="btn sm ${KAR.met?'on':''}" data-t="met">${IC.play2}Metrónomo</button></div></div>
   <div><span class="cl">Ritmo de la banda</span><div class="chips">${Object.entries(BSTYLES).map(([k,l])=>`<button class="chip" data-sty="${k}" aria-pressed="${st.style===k}">${l}</button>`).join('')}</div></div>
   <div class="krow"><div><span class="cl">Compás</span><div class="seg">${[[4,'4/4'],[3,'3/4 vals']].map(([v,l])=>`<button data-beats="${v}" aria-pressed="${st.beats===v}">${l}</button>`).join('')}</div></div>
    ${P.lines.some(l=>l.pieces&&!l.mel)?`<div><span class="cl">Compases por renglón</span><select class="inp" id="kbpl" style="width:auto">${[0,1,2,3,4,6,8].map(v=>`<option value="${v}" ${v===st.bars?'selected':''}>${v||'Automático'}</option>`).join('')}</select></div>`:''}</div>
   </div></details>
  </div>
  <div class="kchips" id="kchips">${chips()}</div>
  <div class="kwrap"><div class="karaoke show-${KAR.show}" id="kar" style="--kz:${KAR.size}">${P.lines.map(lineHTML).join('')}</div>
  <aside class="kside" id="kside"></aside></div>
  <div class="kbar"><span class="bd" id="kbd"></span><span class="tm" id="kpos">${st.beats}/4 · ${BSTYLES[st.style]} · listo</span><button class="btn sm" id="kreset" aria-label="Desde el inicio">${IC.back}</button><button class="btn pri" id="kgo">${IC.play}Empezar</button></div>`,
  mount(r){
    const sumK=()=>{const m=$('.kmore summary small',r);if(m)m.textContent=`${BSTYLES[st.style]} · ${st.beats}/4`};
    const kar=$('#kar',r);let pos=0,TL=null,BK=null,curCh=P.chords[0]||null;
    requestAnimationFrame(()=>fitKar(kar));const onRs=()=>fitKar(kar);window.addEventListener('resize',onRs);setTimeout(()=>{if(!document.body.contains(kar))window.removeEventListener('resize',onRs)},0);
    // panel lateral: tono, rasgueo sugerido y acorde que suena
    const side=()=>{const s=$('#kside',r);if(!s)return;
      s.innerHTML=`<div class="ks-row"><div><span class="cl">Tono</span><b class="ks-key">${esc(keyLbl())}</b></div><div><span class="cl">Tempo</span><b class="ks-num">${st.bpm}</b><small>bpm · ${st.beats}/4</small></div></div>
       <p class="ks-capo">${esc(capoHint(P.key,st.shift))}</p>
       <div><span class="cl">Rasgueo sugerido · ${BSTYLES[st.style]}</span>${patHTML(st.style,st.beats)}<p class="ks-tip">${(KPAT[st.style]||KPAT.folk).tip}</p></div>
       <div class="ks-ch"><span class="cl">Acorde</span><div id="ksch">${chNow()}</div></div>`};
    const chNow=()=>curCh?`<div class="ks-chord">${chordSVG(voicing(curCh,st.shift))}<b>${esc(chName(curCh,st.shift,P.key,es()))}</b></div>`:'<p class="ks-tip">—</p>';
    const build=()=>{
      TL=songTimeline(P,st.bars,st.beats);BK={};
      TL.ev.forEach(e=>{const k=Math.round(e.b*4);(BK[k]=BK[k]||[]).push(e)});
      // acorde vigente en cada dieciseisavo
      const ch=TL.ev.filter(e=>e.type==='chord').sort((a,b)=>a.b-b.b);TL.chAt=[];let j=-1;const N=Math.ceil(TL.total*4);
      for(let k=0;k<N;k++){while(j+1<ch.length&&Math.round(ch[j+1].b*4)<=k)j++;TL.chAt[k]=j>=0?ch[j].p:null}
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
      if(!ac())return;
      const bt=st.beats,startB0=TL.lines[pos]?TL.lines[pos].start:0,startB=P.pickup?startB0:Math.floor(startB0/bt+1e-6)*bt,startK=Math.round(startB*4);
      // cuenta: un compás completo y, si la canción entra con anacrusa, los pulsos que faltan para que caiga en su lugar
      const pk=P.pickup%bt,countK=(bt+(pos===0&&pk?bt-pk:0))*4,N=Math.ceil(TL.total*4);
      clearHL();for(let g=0;g<pos;g++){const e=$(`.kl[data-li="${TL.lines[g].li}"]`,kar);if(e)e.classList.add('past')}
      seqStart('kar','Karaoke · '+P.title,()=>60/st.bpm/4,(s,t)=>{
        const k=s-countK;
        if(k<0){if(s%4===0)tick(t,s===0?'acc':'beat');return}
        const a=startK+k;if(a>=N)return;
        const spb=60/st.bpm,rel=a-Math.round(P.pickup*4),L=bt*4,i=((rel%L)+L)%L,bar=Math.floor(rel/L);
        if(KAR.met&&i%4===0)tick(t,i===0?'acc':'sub',i===0?'bar':'beat');
        if(KAR.band&&TL.chAt[a])bandStep(st.style,i,L,TL.chAt[a],st.shift,t,spb,bar);
        if(KAR.voice&&BK[a])BK[a].forEach(e=>{if(e.type==='note')leadNote(e.m+st.shift,t,e.d*spb,.2)});
      },s=>{
        const k=s-countK;
        if(k<0){if(s%4===0){$('#kpos',r).textContent='Cuenta: '+(s/4+1);const bd=$('#kbd',r);if(bd){bd.classList.add('on');setTimeout(()=>bd.classList.remove('on'),100)}}return}
        const a=startK+k;
        if(a>=N){seqStop();pos=0;$('#kpos',r).textContent='Fin · '+P.title;paint();markDay();return}
        if(a%2===0){const rel2=a-Math.round(P.pickup*4),L2=bt*4,sl=((rel2%L2)+L2)%L2/2;$$('.kpat .sl.on',r).forEach(x=>x.classList.remove('on'));const q=$(`.kpat [data-sl="${sl}"]`,r);if(q)q.classList.add('on')}
        if(a%4===0){const bd=$('#kbd',r);if(bd){const rel=a-Math.round(P.pickup*4);bd.classList.add('on');bd.classList.toggle('acc',((rel%(bt*4))+bt*4)%(bt*4)===0);setTimeout(()=>bd.classList.remove('on'),100)}}
        (BK[a]||[]).forEach(e=>{
          if(e.type==='line'){setLine(e.li);pos=Math.max(0,lineIdx(e.li));$('#kpos',r).textContent=`Renglón ${pos+1} de ${TL.lines.length}`}
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
      const bb=e.target.closest('[data-beats]');if(bb){const was=running();if(was)seqStop();st.beats=+bb.dataset.beats;DB.kbeats[id]=st.beats;sumK();save();$$('[data-beats]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===bb)));build();if(pos>=TL.lines.length)pos=0;side();paint();$('#kpos',r).textContent=`${st.beats}/4 · ${BSTYLES[st.style]} · listo`;return}
      const y=e.target.closest('[data-sty]');if(y){st.style=y.dataset.sty;sumK();DB.kst[id]=st.style;save();$$('[data-sty]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===y)));side();return}
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
    side();paint();
    return()=>{document.removeEventListener('playstate',onState);if(running())seqStop()};
  }};
}
