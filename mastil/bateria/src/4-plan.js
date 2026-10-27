/* ---------- plan del coach: niveles, manos y pies, descripción de cada groove, banda y velocidad ---------- */
const gSteps=g=>g.meter*g.sub*(g.bars||1);
const COUNT={1:[''],2:['','y'],3:['','ta','ti'],4:['','e','y','a']};
const LEVELS={1:'Base',2:'Groove',3:'Fills y ternarios'};
const DRUM_LEVELS={1:['q','e','tr','s','rudS','rudD','para','hhbd','rock','half'],
  2:['rock2','rock3','rock16','slow','ghost','acc','cumbia','pop','disco','dembow'],
  3:['fill1','fill2','fill4','shuffle','b68','b128','vals','swing','polka']};
const lvlOf=id=>+Object.keys(DRUM_LEVELS).find(l=>DRUM_LEVELS[l].includes(id))||1;
const starsFor=p=>p>=.85?3:p>=.7?2:p>=.5?1:0;
const levelStars=l=>l<1?99:DRUM_LEVELS[l].reduce((s,id)=>s+(DB.stars[id]||0),0);
const levelOpen=l=>l<=1||levelStars(l-1)>=10;
const currentLevel=()=>levelOpen(3)?3:levelOpen(2)?2:1;
const SPEEDS={lento:[.75,'Lento'],normal:[1,'Normal'],rapido:[1.15,'Rápido']};
const spdOf=id=>DB.spd[id]||'normal';
const baseBpm=id=>DB.gbpm[id]||G[id].bpm;
const bpmFor=(id,spd)=>Math.round(baseBpm(id)*SPEEDS[spd||spdOf(id)][0]);
const meterTxt=g=>g.meter===2&&g.sub===3?'6/8':g.meter===4&&g.sub===3&&g.cat==='Ternarios'&&g.id==='b128'?'12/8':g.meter+'/4';
/* Quién toca cada golpe: D/I = mano derecha/izquierda, PD/PI = pie derecho/izquierdo (baterista diestro). */
const LIMB={D:'Mano derecha',I:'Mano izquierda',PD:'Pie derecho',PI:'Pie izquierdo'};
function limbOf(g,row,i){
  if(row==='bd')return'PD';if(row==='hf')return'PI';
  const rows=Object.keys(g.rows),cyms=['hh','rd','cr','cb'];
  if(g.hands&&(row==='sn'||rows.length===1))return g.hands[i]==='I'?'I':'D';
  // un solo instrumento rápido (tresillos, semicorcheas): manos alternadas
  if(rows.length===1&&g.sub>=3)return i%2?'I':'D';
  if(cyms.includes(row))return'D';
  // fills: si en ese golpe no suena ningún platillo, las manos se alternan
  const cymNow=cyms.some(r=>g.rows[r]&&g.rows[r][i]&&g.rows[r][i]!=='-');
  if(['t1','t2','ft'].includes(row)||!cymNow&&g.cat==='Fills')return i%2?'I':'D';
  return'I';
}
const cellName=(g,i)=>{const p=i%g.sub,b=Math.floor(i/g.sub)%g.meter+1;return p===0?String(b):(p===1&&g.sub===2||p===2&&g.sub===4?'y':COUNT[g.sub][p])+(p?' del '+b:'')};
// texto de dónde cae cada instrumento («Tarola · mano izquierda: 2 y 4»)
function rowDesc(g,row){
  const line=g.rows[row],n=line.length,on=[...line].map((c,i)=>c!=='-'?i:-1).filter(i=>i>=0),bars=g.bars||1,per=n/bars;
  const first=on.filter(i=>i<per);
  let where;
  if(on.length===n)where={1:'todos los tiempos',2:'corcheas parejas',3:'tresillos parejos',4:'semicorcheas parejas'}[g.sub];
  else if(first.length>6)where='casi todas las '+({2:'corcheas',3:'notas del tresillo',4:'semicorcheas'}[g.sub]||'notas');
  else{const names=first.map(i=>cellName(g,i));where=names.length?names.length===1?'en el '+names[0]:'en '+names.slice(0,-1).join(', ')+' y '+names[names.length-1]:'';
    if(bars>1&&on.some(i=>i>=per))where+=(where?'; ':'')+'en el compás 2 cambia (míralo en la rejilla)'}
  const limbs=[...new Set(on.map(i=>limbOf(g,row,i)))].map(l=>LIMB[l].toLowerCase()).join(' y ');
  return{row,n:ROWS[row].n,limbs,where};
}
const TIPS={
 q:'Un golpe por pulso. Cuenta en voz alta «1, 2, 3, 4» y deja que el golpe caiga junto con tu voz.',
 e:'Dos golpes por pulso: «1 y 2 y». El golpe del número un poco más fuerte.',
 tr:'Tres golpes por pulso: «1 ta ti». Manos alternadas, sin apurarte al llegar al siguiente número.',
 s:'Cuatro golpes por pulso: «1 e y a». Manos sueltas; si se tensan, baja a Lento.',
 rudS:'Derecha, izquierda, derecha, izquierda. Las dos manos a la misma altura y con el mismo volumen.',
 rudD:'Dos con cada mano: el segundo golpe rebota solo, no lo empujes.',
 para:'«Pa-ra-di-dle»: D I D D · I D I I. El acento va en el primer golpe de cada grupo.',
 acc:'Golpes sencillos con un acento que se mueve. Los golpes suaves, bajitos y cerca del parche.',
 hhbd:'Primero el hi-hat solo. Cuando esté parejo, agrega el bombo en 1 y 3.',
 rock:'Hi-hat en corcheas, bombo en 1 y 3, tarola en 2 y 4. Es la base de miles de canciones.',
 half:'La tarola solo en el 3: el espacio largo se siente lento, pero no lo apures.',
 ghost:'Las notas fantasma casi no se oyen: baqueta a dos dedos del parche.',
 fill1:'Tres compases de groove y el fill al final. El platillo y el bombo caen juntos en el 1.',
 fill2:'El fill empieza en el 3 y baja por los toms. Mantén las semicorcheas parejas.',
 fill4:'Un compás entero de fill; el bombo marca negras debajo como ancla.',
 shuffle:'Piensa en tresillos y toca solo la primera y la tercera nota: «1 _ ti».',
 b68:'Seis corcheas en dos pulsos grandes. La tarola cae en el segundo pulso.',
 vals:'«Pum-pa-pa»: bombo en el 1, tarola y hi-hat en el 2 y el 3.',
 cumbia:'El aro en 2 y 4 y el hi-hat acentuado en el «y». El bombo con el bajo.',
 dembow:'Bombo en los cuatro tiempos; la tarola en el «a» del 1 y el «y» del 2.',
 polka:'Bombo en los tiempos, tarola en los contratiempos. Que la tarola nunca se adelante.',
 disco:'Bombo en los cuatro tiempos y el hi-hat abierto en el «y».'};
function howFor(id){
  const g=G[id],rows=ROW_ORDER.filter(r=>g.rows[r]).map(r=>rowDesc(g,r));
  const count={1:'«1, 2, 3, 4»',2:'«1 y 2 y 3 y 4 y»',3:'«1 ta ti, 2 ta ti…»',4:'«1 e y a, 2 e y a…»'}[g.sub];
  return{tip:TIPS[id]||'Escúchalo primero. Luego tócalo junto con la rejilla que se ilumina.',rows,count,
    steps:[`Escucha el ejemplo y mira qué mano o pie se ilumina en la batería.`,`Cuenta ${count} en voz alta antes de empezar.`,`Toca junto con el click; la rejilla se ilumina en cada golpe.`]};
}
/* Portada de cada groove: el patrón mismo, dibujado como puntos (bombo abajo, tarola en medio, platillos arriba). */
const CATHUE={'Subdivisión':200,'Rudimentos':262,'Básicos':218,'Fills':320,'Ternarios':28,'Estilos':160};
function grooveArt(id,label){
  const g=G[id],n=Math.min(16,g.meter*g.sub),lanes=[['hh','rd','cr','cb','hf'],['sn','rim','t1','t2','ft'],['bd']];let m='';
  lanes.forEach((rs,li)=>{const y=22+li*26;for(let i=0;i<n;i++){const on=rs.some(r=>g.rows[r]&&g.rows[r][i]&&g.rows[r][i]!=='-'),x=6+i*(88/Math.max(1,n-1));
    m+=on?`<circle cx="${x.toFixed(1)}" cy="${y}" r="${li===2?5:li===1?4.2:3.2}" fill="#fff" stroke="none" opacity="${li===0?.75:1}"/>`:`<circle cx="${x.toFixed(1)}" cy="${y}" r="1.2" fill="#fff" stroke="none" opacity=".3"/>`}});
  return coverArt(CATHUE[g.cat]||218,m,label,'g'+id+(label||''));
}
/* Banda para tocar encima: estilos de BEATS (núcleo) que encajan con el compás del groove. Ternarios: sin banda. */
const BANDFOR={rock:'rock',rock2:'rock',rock3:'rock',rock16:'rock',hhbd:'rock',fill1:'rock',fill2:'rock',fill4:'rock',half:'balada',slow:'balada',pop:'balada',
  ghost:'pop',disco:'pop',cumbia:'cumbia',dembow:'urbano',vals:'vals',polka:'ranchera'};
const bandOK=g=>[2,3,4].includes(g.meter);
const bandBeats=g=>!bandOK(g)?[]:drumBandStyles(g);
const bandFor=id=>{const g=G[id],list=bandBeats(g);if(!list.length)return null;const want=DB.band&&DB.band[id]||BANDFOR[id]||(g.meter===3?'vals':'pop');return(list.find(b=>b.id===want)||list[0]).id};
// lecciones con «pista sin batería»: qué groove tocar encima y con qué estilo
const TRACKG={'6c':'rock','6d':'half','10d':'vals','11a':'cumbia','11d':'pop'};
const TRACKST={rock:'rock',balada:'balada',cumbia:'cumbia',ranchera:'vals'};
