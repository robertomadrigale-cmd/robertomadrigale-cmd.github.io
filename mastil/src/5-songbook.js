/* ---------- cancionero: acordes ---------- */
const LAT={Do:0,Re:2,Mi:4,Fa:5,Sol:7,La:9,Si:11},ANG={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
const CH_RX=/^(Sol|Do|Re|Mi|Fa|La|Si|[A-G])(#|b|♯|♭)?([^/\s]*)(?:\/(Sol|Do|Re|Mi|Fa|La|Si|[A-G])(#|b|♯|♭)?)?$/;
const SUF_OK=/^(m|M|min|maj|dim|aug|sus|add|°|ø|\+|-|\(|\)|[0-9]|b|#|♯|♭)*$/;
const accOf=a=>a==='#'||a==='♯'?1:a==='b'||a==='♭'?-1:0;
function chParse(c){
  const m=CH_RX.exec(String(c).trim());if(!m||!SUF_OK.test(m[3]))return null;
  const r=(m[1] in LAT?LAT[m[1]]:ANG[m[1]])+accOf(m[2]);
  const b=m[4]?((m[4] in LAT?LAT[m[4]]:ANG[m[4]])+accOf(m[5])+12)%12:null;
  return{pc:(r+12)%12,suf:m[3],bass:b,minor:/^(m(?!aj)|min|-)/.test(m[3])};
}
const ES12=['Do','Do♯','Re','Mi♭','Mi','Fa','Fa♯','Sol','La♭','La','Si♭','Si'],US12=['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
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
function chMidi(p,shift){const t=chType(p.suf),rm=48+((p.pc+shift+120)%12);const n=CT[t].semis.map(x=>rm+x);const bass=(p.bass!=null?p.bass+shift:p.pc+shift);return[36+((bass+120)%12)+(((bass+120)%12)<4?12:0),...n]}
function strumChord(p,shift,t,v){const ms=chMidi(p,shift);ms.forEach((m,j)=>pluck(m,t+j*.022,1.6,j?(v||.12):(v||.12)*1.3))}
/* ---------- cancionero: formato ---------- */
// Formato ChordPro: [Sol]letra con [Re7]acordes, {title:…} {artist:…} {key:…} {bpm:…} {time:3/4} {bpl:2} {c: Coro}
// También acepta "acordes arriba, letra abajo" (como en los sitios de acordes) y lo convierte.
function isChordLine(l){const ts=l.trim().split(/\s+/).filter(Boolean);return ts.length>0&&ts.every(t=>chParse(t.replace(/[|()]/g,''))||/^[|x\d()-]+$/.test(t))&&ts.some(t=>chParse(t.replace(/[|()]/g,'')))}
function fromChordsOverLyrics(txt){
  const L=txt.replace(/\r/g,'').split('\n'),out=[];
  for(let i=0;i<L.length;i++){
    const l=L[i];
    if(/[\[{]/.test(l)||!isChordLine(l)){out.push(l);continue}
    const ch=[];l.replace(/\S+/g,(t,pos)=>{const c=t.replace(/[|()]/g,'');if(chParse(c))ch.push([pos,c]);return t});
    const nx=L[i+1];
    if(nx!=null&&nx.trim()&&!isChordLine(nx)&&!/^\s*[\[{]/.test(nx)){
      let s=nx.padEnd(Math.max(nx.length,(ch.length?ch[ch.length-1][0]:0)+1));
      for(let k=ch.length-1;k>=0;k--){const[p,c]=ch[k];s=s.slice(0,p)+'['+c+']'+s.slice(p)}
      out.push(s.replace(/\s+$/,''));i++;
    }else out.push(ch.map(([,c])=>'['+c+']').join(' '));
  }
  return out.join('\n');
}
function songParse(src){
  const S={title:'Sin título',artist:'',key:null,bpm:90,time:'4/4',bpl:2,lines:[],chords:[]};
  const seen={};
  fromChordsOverLyrics(src).split('\n').forEach(raw=>{
    const l=raw.replace(/\s+$/,'');
    if(/^\s*(\{[^}]*\}\s*)+$/.test(l)){l.replace(/\{\s*(\w+)\s*:?\s*([^}]*?)\s*\}/g,(_,k0,v)=>{const k=k0.toLowerCase();
      if(k==='title'||k==='t')S.title=v;else if(k==='artist'||k==='a'||k==='st'||k==='subtitle')S.artist=v;else if(k==='key')S.key=chParse(v);
      else if(k==='bpm'||k==='tempo')S.bpm=Math.max(40,Math.min(220,+v||90));else if(k==='time')S.time=/^[2346]\/[48]$/.test(v)?v:'4/4';
      else if(k==='bpl')S.bpl=Math.max(1,Math.min(8,+v||2));else if(k==='c'||k==='comment'||k==='soc'||k==='sov'||k==='section')S.lines.push({label:v||(k==='soc'?'Coro':'')});
      return''});return}
    if(!l.trim()){if(S.lines.length&&!S.lines[S.lines.length-1].gap)S.lines.push({gap:true});return}
    const sec=/^\s*\[?(coro|estribillo|verso|estrofa|puente|intro|final|outro|solo|pre-?coro|chorus|verse|bridge)[^\]]*\]?:?\s*$/i.exec(l);
    if(sec&&!chParse(sec[1])){S.lines.push({label:l.replace(/[\[\]:]/g,'').trim()});return}
    const segs=[];let rest=l,m;const rx=/\[([^\]]+)\]/g;let last=0,cur=null;
    while((m=rx.exec(l))){const txt=l.slice(last,m.index);if(txt||cur!==null||segs.length)segs.push({c:cur,t:txt});cur=m[1];last=rx.lastIndex}
    segs.push({c:cur,t:l.slice(last)});
    const clean=segs.filter((s,i)=>s.c||s.t||i===segs.length-1).map(s=>({p:s.c?chParse(s.c):null,raw:s.c,t:s.t}));
    clean.forEach(s=>{if(s.p){const k=s.raw;if(!seen[k]){seen[k]=1;S.chords.push(s.p)}}});
    S.lines.push({segs:clean});
  });
  while(S.lines.length&&S.lines[S.lines.length-1].gap)S.lines.pop();
  if(!S.key){const f=S.chords[0];S.key=f?{pc:f.pc,minor:f.minor,suf:f.minor?'m':''}:{pc:0,minor:false,suf:''}}
  S.beats=+S.time[0];
  return S;
}
/* ---------- cancionero: canciones de dominio público ---------- */
const TRAD=[
`{title:Cielito lindo}{artist:Quirino Mendoza y Cortés · 1882}{key:D}{bpm:150}{time:3/4}{bpl:4}
{c:Estrofa}
[D]De la Sierra Morena, cie[A7]lito lindo, vienen ba[D]jando
un par de ojitos [D7]negros, cie[G]lito lindo, de contra[A7]bando.
{c:Coro}
[D]¡Ay, ay, ay, ay! [A7]Canta y no llores,
porque cantando se alegran, cie[D]lito lindo, los corazones.
[D]¡Ay, ay, ay, ay! [A7]Canta y no llores,
porque cantando se alegran, cie[D]lito lindo, los corazones.
{c:Estrofa}
[D]Ese lunar que tienes, cie[A7]lito lindo, junto a la [D]boca,
no se lo des a [D7]nadie, cie[G]lito lindo, que a mí me [A7]toca.
{c:Estrofa}
[D]Una flecha en el aire, cie[A7]lito lindo, lanzó Cu[D]pido;
él la lanzó ju[D7]gando, cie[G]lito lindo, y yo fui el he[A7]rido.
{c:Coro}
[D]¡Ay, ay, ay, ay! [A7]Canta y no llores,
porque cantando se alegran, cie[D]lito lindo, los corazones.`,
`{title:La cucaracha}{artist:Tradicional mexicana}{key:C}{bpm:120}{time:4/4}{bpl:2}
{c:Coro}
La cuca[C]racha, la cucaracha, ya no puede cami[G7]nar,
porque no tiene, porque le falta, las dos patitas de a[C]trás.
La cuca[C]racha, la cucaracha, ya no puede cami[G7]nar,
porque no tiene, porque le falta, las dos patitas de a[C]trás.
{c:Estrofa}
Ya mu[C]rió la cucaracha, ya la llevan a ente[G7]rrar,
entre cuatro zopilotes y un ratón de sacris[C]tán.
{c:Coro}
La cuca[C]racha, la cucaracha, ya no puede cami[G7]nar,
porque no tiene, porque le falta, las dos patitas de a[C]trás.`,
`{title:De colores}{artist:Tradicional}{key:G}{bpm:132}{time:3/4}{bpl:4}
[G]De colores, de colores se visten los campos en la prima[D7]vera,
de colores, de colores son los pajaritos que vienen de a[G]fuera.
[G7]De colores, de colores es el [C]arco iris que vemos lu[G]cir,
y por [D7]eso los grandes amores de muchos co[G]lores me gustan a mí,
y por [D7]eso los grandes amores de muchos co[G]lores me gustan a mí.

[G]Canta el gallo, canta el gallo con el quiri, quiri, quiri, quiri, [D7]quiri;
la gallina, la gallina con el cara, cara, cara, cara, [G]cara;
[G7]los pollitos, los pollitos con el [C]pío, pío, pío, pío, [G]pí,
y por [D7]eso los grandes amores de muchos co[G]lores me gustan a mí,
y por [D7]eso los grandes amores de muchos co[G]lores me gustan a mí.`,
`{title:La bamba}{artist:Son jarocho tradicional}{key:C}{bpm:150}{time:4/4}{bpl:2}
[C]Para bai[F]lar la [G]bamba, [C]para bai[F]lar la [G]bamba
se nece[C]sita una [F]poca de [G]gracia,
una [C]poca de [F]gracia pa' mí, pa' [G]ti,
¡y a[C]rriba y a[F]rriba! [G]
¡y a[C]rriba y a[F]rriba, por [G]ti seré, por [C]ti se[F]ré, por [G]ti seré!
[C]Yo no soy [F]mari[G]nero, [C]yo no soy [F]mari[G]nero,
soy [C]capi[F]tán, soy [G]capitán, soy [C]capi[F]tán. [G]
[C]Bamba, [F]bam[G]ba, [C]bamba, [F]bam[G]ba,
[C]bamba, [F]bam[G]ba, [C]bamba, [F]bam[G]ba.`,
`{title:La llorona}{artist:Tradicional del Istmo de Tehuantepec}{key:Am}{bpm:96}{time:3/4}{bpl:2}
{c:Estrofa}
[Am]Todos me dicen el [E7]negro, llo[Am]rona,
negro pero cari[E7]ñoso.
Yo soy como el chile [Am]verde, llo[Dm]rona,
[E7]picante pero sa[Am]broso.
{c:Coro}
[A7]¡Ay de mí, llo[Dm]rona, llorona,
llo[G7]rona de ayer y [C]hoy!
[E7]Ayer maravilla fui, llo[Am]rona,
[E7]y ahora ni sombra [Am]soy.
{c:Estrofa}
[Am]Salías del templo un [E7]día, llo[Am]rona,
cuando al pasar yo te [E7]vi.
Hermoso huipil lle[Am]vabas, llo[Dm]rona,
[E7]que la Virgen te [Am]creí.
{c:Coro}
[A7]¡Ay de mí, llo[Dm]rona, llorona,
llo[G7]rona de ayer y [C]hoy!
[E7]Ayer maravilla fui, llo[Am]rona,
[E7]y ahora ni sombra [Am]soy.`,
`{title:La Adelita}{artist:Corrido de la Revolución · tradicional}{key:G}{bpm:120}{time:3/4}{bpl:4}
[G]En lo alto de la abrupta serra[D7]nía
acampado se encontraba un regi[G]miento,
y una moza que valiente los se[D7]guía,
locamente enamorada del sar[G]gento.
[G]Popular entre la tropa era A[D7]delita,
la mujer que el sargento idola[G]traba,
que además de ser valiente era bo[D7]nita,
que hasta el mismo coronel la respe[G]taba.
{c:Coro}
[G7]Y se oía que de[C]cía aquel que tanto la que[G]ría:
[G]Y si Adelita se fuera con [D7]otro,
la seguiría por tierra y por [G]mar,
si por mar en un buque de [D7]guerra,
si por tierra en un tren mili[G]tar.`,
`{title:Las mañanitas}{artist:Tradicional mexicana}{key:D}{bpm:100}{time:3/4}{bpl:4}
[D]Estas son las mañanitas que can[A7]taba el rey David,
hoy por ser día de tu santo te las can[D]tamos a ti.
[D]Despierta, mi bien, despierta, mira que [A7]ya amaneció,
ya los pajarillos cantan, la [D]luna ya se metió.`,
`{title:Cumpleaños feliz}{artist:Tradicional}{key:C}{bpm:110}{time:3/4}{bpl:4}
Cumple[C]años feliz, te desea[G7]mos a ti,
cumple[G7]años, querido amigo, cumple[C]años feliz.`,
`{title:Amazing Grace}{artist:John Newton · 1779}{key:G}{bpm:80}{time:3/4}{bpl:4}
A[G]mazing grace! How [G7]sweet the [C]sound
that [G]saved a wretch like [D]me!
I [G]once was lost, but [G7]now am [C]found,
was [G]blind, but [D]now I [G]see.

'Twas [G]grace that taught my [G7]heart to [C]fear,
and [G]grace my fears re[D]lieved;
how [G]precious did that [G7]grace ap[C]pear
the [G]hour I [D]first be[G]lieved.`,
`{title:The House of the Rising Sun}{artist:Folk tradicional estadounidense}{key:Am}{bpm:110}{time:3/4}{bpl:4}
There [Am]is a [C]house in [D]New Or[F]leans
they [Am]call the [C]Rising [E]Sun,
and it's [Am]been the [C]ruin of [D]many a poor [F]boy,
and [Am]God, I [E]know I'm [Am]one. [C] [D] [F] [Am] [E] [Am] [E]

My [Am]mother [C]was a [D]tailor, [F]
she [Am]sewed my [C]new blue [E]jeans;
my [Am]father [C]was a [D]gambling [F]man
[Am]down in [E]New Or[Am]leans.`,
`{title:When the Saints Go Marching In}{artist:Espiritual tradicional}{key:G}{bpm:120}{time:4/4}{bpl:2}
Oh, when the [G]saints go marching in,
oh, when the saints go marching [D7]in,
Lord, how I [G]want to [G7]be in that [C]number,
when the [G]saints go [D7]marching [G]in.

Oh, when the [G]sun refuse to shine,
oh, when the sun refuse to [D7]shine,
Lord, how I [G]want to [G7]be in that [C]number,
when the [G]sun re[D7]fuse to [G]shine.`,
`{title:Oh! Susanna}{artist:Stephen Foster · 1848}{key:C}{bpm:120}{time:4/4}{bpl:2}
I [C]come from Alabama with my banjo on my [G7]knee,
I'm [C]going to Louisiana, my [G7]true love for to [C]see.
{c:Coro}
[F]Oh, Su[F]sanna, [C]oh don't you cry for [G7]me,
for I [C]come from Alabama with my [G7]banjo on my [C]knee.`,
`{title:Scarborough Fair}{artist:Balada inglesa tradicional}{key:Am}{bpm:100}{time:3/4}{bpl:4}
[Am]Are you going to [G]Scarborough [Am]Fair?
[C]Parsley, [Am]sage, rose[D]mary and [Am]thyme.
Re[Am]member me to [C]one who lives [G]there,
[Am]she once was a [G]true love of [Am]mine.

[Am]Tell her to make me a [G]cambric [Am]shirt,
[C]parsley, [Am]sage, rose[D]mary and [Am]thyme,
with[Am]out no seams nor [C]needle[G]work,
[Am]then she'll be a [G]true love of [Am]mine.`];
/* ---------- las 100: tono, tempo y progresión (sin letra: tiene derechos de autor) ---------- */
// título|artista|año|tono|bpm|progresión principal  (aproximado; varía según la versión)
const TOP100={
 'Rock clásico':['Sweet Child O’ Mine|Guns N’ Roses|1987|D|125|D C G D','Hotel California|Eagles|1976|Bm|75|Bm F# A E G D Em F#','Stairway to Heaven|Led Zeppelin|1971|Am|72|Am G#+ C/G D/F# Fmaj7 G Am','Smoke on the Water|Deep Purple|1972|Gm|114|Gm Bb C Gm','Back in Black|AC/DC|1980|E|94|E D A','Hey Jude|The Beatles|1968|F|74|F C C7 F Bb F C F','(I Can’t Get No) Satisfaction|The Rolling Stones|1965|E|136|E A E A','Bohemian Rhapsody|Queen|1975|Bb|72|Bb Gm Cm F','Born to Be Wild|Steppenwolf|1968|E|146|E G A E','Highway to Hell|AC/DC|1979|A|116|A D/F# G D A'],
 'Rock en español':['De música ligera|Soda Stereo|1990|C#m|122|C#m A E B','Lamento boliviano|Enanitos Verdes|1994|Am|90|Am F C G','La célula que explota|Caifanes|1990|Em|98|Em C G D','Oye mi amor|Maná|1992|E|120|E A B','Rayando el sol|Maná|1990|G|128|G Em C D','Flaca|Andrés Calamaro|1997|E|92|E C#m A B','Eres|Café Tacvba|2003|C|80|C Em Am F G','Lobo hombre en París|La Unión|1984|Em|132|Em C D Em','Devuélveme a mi chica|Hombres G|1985|D|152|D G A','Labios rotos|Zoé|2006|Am|96|Am F C G'],
 'Pop internacional':['Billie Jean|Michael Jackson|1982|F#m|117|F#m G#m/F# A/F# G#m/F#','Like a Prayer|Madonna|1989|Dm|111|Dm C Bb F','Someone Like You|Adele|2011|A|68|A C#m F#m D','Shape of You|Ed Sheeran|2017|C#m|96|C#m F#m A B','Perfect|Ed Sheeran|2017|Ab|63|Ab Fm Db Eb','Viva la Vida|Coldplay|2008|Ab|138|Db Eb Ab Fm','Let It Be|The Beatles|1970|C|72|C G Am F','Imagine|John Lennon|1971|C|75|C Cmaj7 F','Wonderwall|Oasis|1995|F#m|87|Em7 G Dsus4 A7sus4','Africa|Toto|1982|A|93|A C#m Bm E'],
 'Baladas en español':['Bésame mucho|Consuelo Velázquez|1940|Dm|80|Dm Gm A7 Dm','Te amo|Franco de Vita|1990|C|72|C Am F G','Amor eterno|Juan Gabriel|1990|D|68|D Bm G A','Querida|Juan Gabriel|1984|G|112|G Em C D','Entra en mi vida|Sin Bandera|2002|D|76|D A Bm G','Tu falta de querer|Mon Laferte|2015|Am|70|Am F C G','Sabor a mí|Álvaro Carrillo|1959|C|72|C Am Dm G7','La incondicional|Luis Miguel|1989|D|70|D Bm G A','Ella|José Alfredo Jiménez|1950|D|90|D A7 D','Contigo en la distancia|César Portillo de la Luz|1946|C|72|Cmaj7 Am7 Dm7 G7'],
 'Regional mexicano':['El Rey|José Alfredo Jiménez|1971|G|100|G D7 C','Volver, volver|Fernando Z. Maldonado|1972|D|100|D A7 G','Si nos dejan|José Alfredo Jiménez|1959|D|96|D A7 G','Hermoso cariño|Vicente Fernández|1981|G|116|G D7 C','El triste|José José|1970|Dm|64|Dm A7 Gm C F','Amor prohibido|Selena|1994|C|123|C F G','Tragos amargos|Ramón Ayala|1972|G|120|G D7 C','Mi Ranchito|Los Tigres del Norte|1988|D|116|D A7 G','La puerta negra|Los Tigres del Norte|1986|G|120|G D7 C','El sinaloense|Banda El Recodo|1944|D|130|D A7'],
 'Cumbia y tropical':['La cumbia sampuesana|José Joaquín Bettín|1965|Am|96|Am E7 Dm','Cumbia sobre el río|Celso Piña|2001|Am|96|Am Dm E7','Cómo te voy a olvidar|Los Ángeles Azules|1996|Am|94|Am Dm G C E7','17 años|Los Ángeles Azules|1996|C|96|C Am F G','La pollera colorá|Wilson Choperena|1960|D|100|D A7','Tiburón|Proyecto Uno|1994|Am|125|Am Dm E7','La negra Tomasa|Guillermo Rodríguez Fiffe|1937|G|110|G D7','Suavemente|Elvis Crespo|1998|Am|128|Am Dm G C','Ojalá que llueva café|Juan Luis Guerra|1989|D|120|D A7 G','La vida es un carnaval|Celia Cruz|1998|C|100|C Am F G'],
 'Blues y soul':['Johnny B. Goode|Chuck Berry|1958|Bb|168|Bb Eb F','Pride and Joy|Stevie Ray Vaughan|1983|E|120|E7 A7 B7','Hound Dog|Elvis Presley|1956|C|87|C F G','The Thrill Is Gone|B.B. King|1969|Bm|87|Bm Em G F# Bm','Stand by Me|Ben E. King|1961|A|118|A F#m D E','Hit the Road Jack|Ray Charles|1961|Am|90|Am G F E7','Sweet Home Chicago|Robert Johnson|1936|E|122|E7 A7 B7','(Sittin’ On) The Dock of the Bay|Otis Redding|1968|G|104|G B C A','Ain’t No Sunshine|Bill Withers|1971|Am|77|Am Em G Am','Respect|Aretha Franklin|1967|C|115|C F'],
 'Folk y acústico':['Blowin’ in the Wind|Bob Dylan|1963|D|89|D G A','Knockin’ on Heaven’s Door|Bob Dylan|1973|G|69|G D Am G D C','Hallelujah|Leonard Cohen|1984|C|56|C Am F G E7','Gracias a la vida|Violeta Parra|1966|Am|90|Am Dm E7','Ojalá|Silvio Rodríguez|1978|E|112|E Gm#7 C#m A','Sound of Silence|Simon & Garfunkel|1964|Am|106|Am G C F','Hotel Yorba|The White Stripes|2001|G|180|G C D','Fast Car|Tracy Chapman|1988|C|104|Cmaj7 G Em D','Volver a los 17|Violeta Parra|1966|D|100|D A7','Alfonsina y el mar|Ariel Ramírez|1969|Am|76|Am Dm E7'],
 'Alternativo y grunge':['Smells Like Teen Spirit|Nirvana|1991|F|117|F Bb Ab Db','Creep|Radiohead|1992|G|92|G B C Cm','Zombie|The Cranberries|1994|Em|84|Em C G D','Come As You Are|Nirvana|1991|Em|120|Em D','Black|Pearl Jam|1991|E|76|E A','Under the Bridge|Red Hot Chili Peppers|1991|E|84|E B C#m G#m A','Mr. Brightside|The Killers|2003|Db|148|Db Gb Ebm','Seven Nation Army|The White Stripes|2003|Em|124|Em C B','Boulevard of Broken Dreams|Green Day|2004|Fm|83|Fm Ab Eb Bb','Numb|Linkin Park|2003|F#m|110|F#m D A E'],
 'Latino actual':['Despacito|Luis Fonsi|2017|Bm|89|Bm G D A','La bicicleta|Carlos Vives y Shakira|2016|F#m|90|F#m D A E','Hips Don’t Lie|Shakira|2006|Bbm|100|Bbm Gb Db Ab','Clandestino|Manu Chao|1998|Am|98|Am Dm E7','Corazón espinado|Santana con Maná|1999|Am|120|Am Dm E7','Oye cómo va|Santana|1970|Am|125|Am7 D9','Bailando|Enrique Iglesias|2014|C#m|90|C#m A B E','Vivir mi vida|Marc Anthony|2013|Am|102|Am Dm G C','Tusa|Karol G|2019|Bbm|101|Bbm Gb Db Ab','Me enamoré|Shakira|2017|C|104|C Am F G']};
const TOPLIST=[];Object.entries(TOP100).forEach(([g,a])=>a.forEach((r,i)=>{const[t,ar,y,k,b,p]=r.split('|');TOPLIST.push({id:'top'+TOPLIST.length,g,t,a:ar,y,k,bpm:+b,prog:p})}));
function topSrc(x){
  const per=x.prog.split(' ').length<=2?2:1;
  const bars=x.prog.split(' ').map(c=>'['+c+']').join(' ');
  return`{title:${x.t}}{artist:${x.a} · ${x.y}}{key:${x.k}}{bpm:${x.bpm}}{bpl:${Math.max(2,x.prog.split(' ').length)}}
{c:Progresión principal · repite}
${bars}
${bars}
${bars}
${bars}`;
}
/* ---------- cancionero: biblioteca ---------- */
function sbAll(){
  const mine=(DB.songs||[]).map(s=>({id:s.id,src:s.src,mine:true}));
  const trad=TRAD.map((src,i)=>({id:'pd'+i,src,trad:true}));
  return{mine,trad};
}
function sbGet(id){
  if(id.startsWith('pd'))return{id,src:TRAD[+id.slice(2)],trad:true};
  if(id.startsWith('top')){const x=TOPLIST[+id.slice(3)];return x?{id,src:topSrc(x),top:x}:null}
  const s=(DB.songs||[]).find(z=>z.id===id);return s?{id,src:s.src,mine:true}:null;
}
let SBTAB='trad',SBGENRE=Object.keys(TOP100)[0];
function viewSongbook(){
  const{mine,trad}=sbAll();
  const row=(s)=>{const P=songParse(s.src),sh=(DB.kt||{})[s.id]||0;return`<a class="card lrow" href="#/cancionero/ver/${s.id}"><span class="mn">${esc(chName(P.key,sh,P.key,DB.notation==='es'))}</span><span class="mt"><b>${esc(P.title)}</b><span>${esc(P.artist||'Tu canción')} · ${P.bpm} bpm</span></span></a>`};
  const tabs=[['trad','Con letra'],['mine','Mis canciones'],['top','Las 100']];
  const body=SBTAB==='trad'?`<p class="cap" style="margin:0">Canciones tradicionales y de dominio público, con letra y acordes completos.</p><div class="list">${trad.map(row).join('')}</div>`
   :SBTAB==='mine'?`<div class="row"><a class="btn pri" href="#/cancionero/editar/nueva">${IC.plus}Agregar canción</a></div>${mine.length?`<div class="list">${mine.map(row).join('')}</div>`:`<div class="card"><h3>Pega tus canciones favoritas</h3><p class="cap">Copia la letra con acordes de cualquier sitio, pégala y la app la convierte en karaoke: cambia el tono, ilumina la letra al ritmo y lleva el metrónomo. Se guarda solo en este dispositivo.</p></div>`}`
   :`<div class="chips">${Object.keys(TOP100).map(g=>`<button class="chip" data-g="${g}" aria-pressed="${g===SBGENRE}">${g}</button>`).join('')}</div>
     <p class="cap" style="margin:0">Tono, tempo y progresión principal para practicar con metrónomo y acompañamiento. La letra tiene derechos de autor: búscala y pégala para tener la canción completa en karaoke.</p>
     <div class="list">${TOPLIST.filter(x=>x.g===SBGENRE).map(x=>`<div class="card lrow top"><a class="mt" href="#/cancionero/ver/${x.id}"><b>${esc(x.t)}</b><span>${esc(x.a)} · ${x.y} · ${esc(x.k)} · ${x.bpm} bpm</span></a><div class="row" style="flex:none"><a class="btn sm" href="#/cancionero/ver/${x.id}">${IC.play}Tocar</a><a class="btn sm" href="#/cancionero/editar/${x.id}">${IC.plus}Letra</a></div></div>`).join('')}</div>`;
  return{title:'Cancionero',html:`<div class="lhead"><span class="eyebrow">Karaoke con acordes</span><h1>Cancionero</h1><p class="sub">La letra se ilumina al ritmo, los acordes cambian de tono a tu voz y el metrónomo lleva el pulso.</p></div>
  <div class="seg" id="sbt">${tabs.map(([k,l])=>`<button data-tab="${k}" aria-pressed="${SBTAB===k}">${l}</button>`).join('')}</div>${body}`,
  mount(r){r.addEventListener('click',e=>{const t=e.target.closest('[data-tab]');if(t){SBTAB=t.dataset.tab;route();return}const g=e.target.closest('[data-g]');if(g){SBGENRE=g.dataset.g;route()}})}};
}
/* ---------- cancionero: editor ---------- */
function viewSongEdit(id){
  const ex=id!=='nueva'?sbGet(id):null,isTop=ex&&ex.top;
  const tpl=isTop?`{title:${ex.top.t}}\n{artist:${ex.top.a}}\n{key:${ex.top.k}}\n{bpm:${ex.top.bpm}}\n\nPega aquí la letra con acordes`:ex&&ex.mine?ex.src:`{title:Nombre de la canción}\n{artist:Artista}\n{bpm:90}\n\n[G]Escribe la letra con los a[D]cordes entre corchetes\no pega acordes arriba y letra abajo, como en los sitios de acordes.`;
  return{title:ex&&ex.mine?'Editar canción':'Nueva canción',back:'#/cancionero',html:`
  <div class="card" style="display:flex;flex-direction:column;gap:12px">
   <textarea id="sbsrc" rows="16" spellcheck="false">${esc(tpl)}</textarea>
   <div class="row"><button class="btn pri" id="sbsave">${IC.check}Guardar</button>${ex&&ex.mine?`<span id="sbdw"><button class="btn" id="sbdel">${IC.x}Borrar</button></span>`:''}${isTop?`<a class="btn" target="_blank" rel="noopener" href="https://www.google.com/search?q=${encodeURIComponent(ex.top.t+' '+ex.top.a+' letra y acordes')}">Buscar letra y acordes</a>`:''}</div>
   <p class="cap" id="sbmsg" style="margin:0"></p></div>
  <div class="box"><p class="blockh">Cómo pegar una canción</p><ul>
   <li><b>Acordes arriba y letra abajo</b> (como en la mayoría de los sitios): pégala tal cual, la app acomoda cada acorde sobre su sílaba.</li>
   <li><b>Acordes entre corchetes</b>: <code>[Sol]Hoy me desperté [Re7]pensando</code>. Funciona con Do Re Mi o con C D E.</li>
   <li>Opcional: <code>{bpm:96}</code> para el tempo, <code>{time:3/4}</code> para vals o ranchera, <code>{bpl:2}</code> compases por renglón, <code>{c:Coro}</code> para marcar partes.</li></ul></div>`,
  mount(r){
    $('#sbsave',r).onclick=()=>{
      const src=$('#sbsrc',r).value;const P=songParse(src);
      if(!P.lines.some(l=>l.segs)){$('#sbmsg',r).textContent='No encontré letra ni acordes. Revisa lo que pegaste.';return}
      DB.songs=DB.songs||[];let sid=ex&&ex.mine?id:'u'+Date.now().toString(36);
      const i=DB.songs.findIndex(s=>s.id===sid);if(i>=0)DB.songs[i].src=src;else DB.songs.unshift({id:sid,src});
      save();toast(logo()+'<span>Canción guardada</span>');location.hash='#/cancionero/ver/'+sid;
    };
    const d=$('#sbdel',r);if(d)d.onclick=()=>{$('#sbdw',r).innerHTML='<button class="btn" id="sbdelok" style="border-color:var(--bad);color:var(--bad)">Sí, borrar</button>';$('#sbdelok',r).onclick=()=>{DB.songs=DB.songs.filter(s=>s.id!==id);save();SBTAB='mine';location.hash='#/cancionero'}};
  }};
}
/* ---------- cancionero: reproductor karaoke ---------- */
const KAR={show:'both',met:true,acc:false,size:1};
function capoHint(key,shift){
  const target=(key.pc+shift+120)%12,easy=key.minor?[9,4,2]:[0,7,2,9,4];
  for(let c=0;c<=7;c++){const shape=(target-c+12)%12;if(easy.includes(shape))return c===0?'Formas abiertas, sin capo':`Capo en el traste ${c} · toca con formas de ${noteName(shape,false,DB.notation==='es')}${key.minor?'m':''}`}
  return'';
}
function viewSongPlay(id){
  const s=sbGet(id);if(!s)return viewSongbook();
  const P=songParse(s.src);DB.kt=DB.kt||{};DB.kbpm=DB.kbpm||{};
  const st={shift:DB.kt[id]||0,bpm:DB.kbpm[id]||P.bpm,bpl:P.bpl};
  Object.assign(KAR,DB.kar||{});
  const es=()=>DB.notation==='es';
  const ocMap={};OC.forEach(c=>ocMap[c[0]]=c);
  const mini=name=>{const c=ocMap[name.replace('♯','#').replace('♭','b')];if(!c)return'';const g=c[2],W=10,H=11;let s=`<svg viewBox="-4 -12 ${5*W+8} ${4*H+16}" class="mch">`;for(let i=0;i<6;i++)s+=`<line x1="${i*W}" y1="0" x2="${i*W}" y2="${4*H}"/>`;for(let f=0;f<=4;f++)s+=`<line x1="0" y1="${f*H}" x2="${5*W}" y2="${f*H}" ${f===0?'stroke-width="2.5"':''}/>`;g.forEach((f,i)=>{const x=i*W;if(f==null)s+=`<text x="${x}" y="-4">×</text>`;else if(f===0)s+=`<circle cx="${x}" cy="-6" r="3" class="o"/>`;else s+=`<circle cx="${x}" cy="${(f-.5)*H}" r="3.8"/>`});return s+'</svg>'};
  const keyLbl=()=>chName(P.key,st.shift,P.key,es());
  const lineHTML=(l,i)=>{
    if(l.gap)return'<div class="kgap"></div>';
    if(l.label!=null)return`<div class="klab">${esc(l.label)}</div>`;
    return`<div class="kl" data-li="${i}">${l.segs.map(sg=>{const nm=sg.p?chName(sg.p,st.shift,P.key,es()):(sg.raw||'');const words=sg.t.split(/(\s+)/).map(w=>/^\s+$/.test(w)?w:w?`<i>${esc(w)}</i>`:'').join('');return`<span class="sg">${nm?`<b class="kc">${esc(nm)}</b>`:'<b class="kc"> </b>'}<span class="kt">${words||'&nbsp;'}</span></span>`}).join('')}</div>`;
  };
  const chips=()=>P.chords.map(p=>{const n=chName(p,st.shift,P.key,false),nm=chName(p,st.shift,P.key,es());return`<button class="kchip" data-kc="${esc(n)}">${mini(n)}<b>${esc(nm)}</b></button>`}).join('');
  return{title:P.title,back:'#/cancionero',html:`
  <div class="khead"><div><span class="eyebrow">${esc(P.artist)}</span><h2>${esc(P.title)}</h2></div>${s.mine?`<a class="btn sm" href="#/cancionero/editar/${id}">Editar</a>`:s.top?`<a class="btn sm" href="#/cancionero/editar/${id}">${IC.plus}Agregar letra</a>`:''}</div>
  <div class="card kctl">
   <div class="row" style="justify-content:space-between"><div><span class="cl">Tono</span><div class="row"><button class="btn sm" data-k="-1" aria-label="Bajar medio tono">${IC.minus}</button><b class="kkey" id="kkey">${esc(keyLbl())}</b><button class="btn sm" data-k="1" aria-label="Subir medio tono">${IC.plus}</button><button class="btn sm" data-k="0">Original</button></div></div>
    <div><span class="cl">Tempo</span><div class="row"><button class="btn sm" data-b="-4">${IC.minus}</button><b class="kkey" id="kbpm">${st.bpm}</b><button class="btn sm" data-b="4">${IC.plus}</button></div></div></div>
   <p class="cap" id="kcapo" style="margin:0">${capoHint(P.key,st.shift)}</p>
   <div class="row"><div class="seg">${[['both','Letra y acordes'],['lyrics','Solo letra'],['chords','Solo acordes']].map(([v,l])=>`<button data-show="${v}" aria-pressed="${KAR.show===v}">${l}</button>`).join('')}</div>
    <div class="seg">${[['us','C D E'],['es','Do Re Mi']].map(([v,l])=>`<button data-not="${v}" aria-pressed="${(DB.notation||'us')===v}">${l}</button>`).join('')}</div></div>
   <div class="row"><button class="btn sm ${KAR.met?'on':''}" data-t="met">${IC.play2}Metrónomo</button><button class="btn sm ${KAR.acc?'on':''}" data-t="acc">${IC.wave}Guitarra de fondo</button><button class="btn sm" data-z="-1">A−</button><button class="btn sm" data-z="1">A+</button>
    <label class="cap" style="margin:0;display:inline-flex;gap:6px;align-items:center">Compases por renglón <select id="kbpl">${[1,2,3,4,6,8].map(v=>`<option ${v===st.bpl?'selected':''}>${v}</option>`).join('')}</select></label></div>
  </div>
  <div class="kchips" id="kchips">${chips()}</div>
  <div class="karaoke show-${KAR.show}" id="kar" style="--kz:${KAR.size}">${P.lines.map(lineHTML).join('')}</div>
  <div class="kbar"><span class="bd" id="kbd"></span><span class="tm" id="kpos">${P.time} · listo</span><button class="btn pri" id="kgo">${IC.play}Empezar</button><button class="btn sm" id="kreset">Desde el inicio</button></div>`,
  mount(r){
    const kar=$('#kar',r);let pos=0,timeline=[];
    const build=()=>{timeline=[];P.lines.forEach((l,i)=>{if(!l.segs)return;const nb=st.bpl*P.beats,len=l.segs.reduce((a,s)=>a+Math.max(1,s.t.length),0);let acc=0;const ev={};l.segs.forEach(sg=>{if(sg.p){const b=Math.min(nb-1,Math.floor(acc/len*nb));if(ev[b]==null)ev[b]=sg.p}acc+=Math.max(1,sg.t.length)});timeline.push({i,nb,ev})})};
    build();
    const words=li=>$$(`.kl[data-li="${li}"] i`,kar);
    const show=(gi,beat)=>{
      $$('.kl.cur',kar).forEach(x=>{x.classList.remove('cur');x.classList.add('past')});
      const T=timeline[gi];if(!T)return;const el=$(`.kl[data-li="${T.i}"]`,kar);if(!el)return;
      el.classList.remove('past');el.classList.add('cur');
      const ws=words(T.i),n=Math.ceil(ws.length*(beat+1)/T.nb);ws.forEach((w,k)=>w.classList.toggle('lit',k<n));
      const sgs=$$('.sg',el);let acc=0;const len=P.lines[T.i].segs.reduce((a,s)=>a+Math.max(1,s.t.length),0);
      sgs.forEach((sg,k)=>{const b=Math.floor(acc/len*T.nb);sg.classList.toggle('now',b<=beat&&(k===sgs.length-1||Math.floor((acc+Math.max(1,P.lines[T.i].segs[k].t.length))/len*T.nb)>beat));acc+=Math.max(1,P.lines[T.i].segs[k].t.length)});
      if(beat===0)el.scrollIntoView({block:'center',behavior:'smooth'});
      $('#kpos',r).textContent=`Renglón ${gi+1} de ${timeline.length} · tiempo ${beat%P.beats+1}`;
    };
    const total=()=>timeline.reduce((a,t)=>a+t.nb,0);
    const locate=s=>{let k=s;for(let g=0;g<timeline.length;g++){if(k<timeline[g].nb)return[g,k];k-=timeline[g].nb}return[-1,0]};
    const startAt=g=>{let s=0;for(let k=0;k<g;k++)s+=timeline[k].nb;return s};
    const running=()=>SEQ.id==='kar';
    const paint=()=>{$('#kgo',r).innerHTML=running()?IC.pause+'Pausa':IC.play+(pos?'Continuar':'Empezar')};
    let lastCh=null;
    const go=()=>{
      if(running()){seqStop();paint();return}
      const off=startAt(pos),count=P.beats;lastCh=null;
      seqStart('kar','Karaoke · '+P.title,()=>60/st.bpm,(s,t)=>{
        const k=s-count;
        if(k<0){tick(t,s===0?'acc':'beat');return}
        const[g,b]=locate(off+k);if(g<0)return;
        if(KAR.met)tick(t,b%P.beats===0?'acc':'sub');
        const p=timeline[g].ev[b];
        if(KAR.acc){const cur=p||(b%P.beats===0?lastCh:null);if(cur)strumChord(cur,st.shift,t,b%P.beats===0?.13:.1)}
        if(p)lastCh=p;
      },s=>{
        const bd=$('#kbd',r);if(bd){bd.classList.add('on');bd.classList.toggle('acc',(s-count)%P.beats===0);setTimeout(()=>bd.classList.remove('on'),100)}
        const k=s-count;if(k<0){$('#kpos',r).textContent='Cuenta: '+(k+count+1);return}
        const[g,b]=locate(off+k);if(g<0){seqStop();pos=0;$$('.kl',kar).forEach(x=>x.classList.remove('cur','past'));$('#kpos',r).textContent='Fin · '+P.title;paint();markDay();return}
        pos=g;show(g,b);
      });
      paint();
    };
    $('#kgo',r).onclick=go;
    $('#kreset',r).onclick=()=>{if(running())seqStop();pos=0;$$('.kl',kar).forEach(x=>x.classList.remove('cur','past'));$$('.kl i',kar).forEach(x=>x.classList.remove('lit'));kar.firstElementChild&&kar.firstElementChild.scrollIntoView({block:'center'});paint()};
    kar.addEventListener('click',e=>{const l=e.target.closest('.kl');if(!l)return;const g=timeline.findIndex(t=>t.i===+l.dataset.li);if(g<0)return;const was=running();if(was)seqStop();pos=g;$$('.kl',kar).forEach(x=>x.classList.remove('cur','past'));show(g,0);if(was)go();paint()});
    const rerender=()=>{kar.innerHTML=P.lines.map(lineHTML).join('');$('#kchips',r).innerHTML=chips();$('#kkey',r).textContent=keyLbl();$('#kcapo',r).textContent=capoHint(P.key,st.shift);if(pos)show(pos,0)};
    r.addEventListener('click',e=>{
      const k=e.target.closest('[data-k]');if(k){const v=+k.dataset.k;st.shift=v?((st.shift+v+18)%12)-6:0;DB.kt[id]=st.shift;save();rerender();return}
      const b=e.target.closest('[data-b]');if(b){st.bpm=Math.max(40,Math.min(220,st.bpm+ +b.dataset.b));DB.kbpm[id]=st.bpm;save();$('#kbpm',r).textContent=st.bpm;return}
      const sh=e.target.closest('[data-show]');if(sh){KAR.show=sh.dataset.show;kar.className='karaoke show-'+KAR.show;$$('[data-show]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===sh)));DB.kar=Object.assign({},KAR);save();return}
      const n=e.target.closest('[data-not]');if(n){DB.notation=n.dataset.not;save();$$('[data-not]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===n)));rerender();return}
      const t=e.target.closest('[data-t]');if(t){KAR[t.dataset.t]=!KAR[t.dataset.t];t.classList.toggle('on',KAR[t.dataset.t]);DB.kar=Object.assign({},KAR);save();return}
      const z=e.target.closest('[data-z]');if(z){KAR.size=Math.max(.8,Math.min(1.8,+(KAR.size+ +z.dataset.z*.15).toFixed(2)));kar.style.setProperty('--kz',KAR.size);DB.kar=Object.assign({},KAR);save();return}
      const c=e.target.closest('[data-kc]');if(c){const p=chParse(c.dataset.kc);if(p&&ac())strumChord(p,0,AC.currentTime+.02,.16)}
    });
    $('#kbpl',r).onchange=e=>{st.bpl=+e.target.value;build();if(pos>=timeline.length)pos=0};
    paint();
    return()=>{if(running())seqStop()};
  }};
}
