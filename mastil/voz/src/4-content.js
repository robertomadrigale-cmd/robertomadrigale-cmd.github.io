/* Patrones: [semitonos, pulsos]; null es silencio. */
const DLINE='<path d="M12 68L30 52 48 32 66 52 88 68"/>';
const DRILLS=[
 {id:'respira',lvl:1,t:'Respiración 4-4-8',syl:'sss',bpm:60,pat:[],rounds:3,hue:180,motif:'<circle cx="50" cy="50" r="28"/>',tip:'Inhala sin subir los hombros. Suelta el aire parejo en «sss».',breath:true},
 {id:'eco',lvl:1,t:'Repite la nota',syl:'ma',bpm:60,pat:[[0,2]],rounds:5,hue:205,tip:'Escucha, imagina la nota y repítela con suavidad.'},
 {id:'larga',lvl:1,t:'Nota larga',syl:'ma',bpm:60,pat:[[0,4]],rounds:5,hue:218,tip:'Mantén el aire y el volumen parejos hasta el final.'},
 {id:'trino',lvl:1,t:'Trino de labios',syl:'brrr',bpm:72,pat:[[0,1],[2,1],[4,1],[5,1],[7,1],[5,1],[4,1],[2,1],[0,2]],rounds:5,hue:180,tip:'Deja los labios sueltos. Si no vibran, ayuda con dos dedos en las mejillas.'},
 {id:'sirena',lvl:1,t:'Sirena',syl:'uuu',bpm:60,glide:true,pat:[[0,3],[12,3],[0,2]],rounds:5,hue:262,tip:'Desliza la voz sin levantar la barbilla. Arriba, deja el sonido ligero.'},
 {id:'tres',lvl:1,t:'Tres notas',syl:'no',bpm:60,pat:[[0,1],[2,1],[4,1],[2,1],[0,2]],rounds:5,hue:240,tip:'Une las tres notas con el mismo aire y una «u» suave.'},
 {id:'escala',lvl:2,t:'Escala de cinco notas',syl:'no',bpm:80,pat:[[0,1],[2,1],[4,1],[5,1],[7,1],[5,1],[4,1],[2,1],[0,2]],rounds:5,hue:26,tip:'Une las notas sin cortar el aire. Conserva la misma vocal.'},
 {id:'arpegio3',lvl:2,t:'Saltos 1-3-5',syl:'ia',bpm:72,pat:[[0,1],[4,1],[7,1],[4,1],[0,2]],rounds:5,hue:310,tip:'Escucha el salto antes de hacerlo. Mantén la mandíbula suelta.'},
 {id:'terceras',lvl:2,t:'Saltos de tercera',syl:'mi',bpm:80,pat:[[0,1],[4,1],[2,1],[5,1],[4,1],[7,1],[5,1],[2,1],[0,2]],rounds:5,hue:285,tip:'Imagina la siguiente nota sin empujar el volumen.'},
 {id:'staccato',lvl:2,t:'Notas cortas',syl:'ja',bpm:72,pat:[[0,.5],[null,.5],[4,.5],[null,.5],[7,.5],[null,.5],[4,.5],[null,.5],[0,.5],[null,1.5]],rounds:5,hue:44,tip:'Haz cada «ja» corto y ligero, sin golpear con la garganta.'},
 {id:'crescendo',lvl:2,t:'Crece el sonido',syl:'aaa',bpm:60,pat:[[0,6]],rounds:5,hue:350,tip:'Empieza suave y crece un poco sin subir de tono ni apretar.'},
 {id:'arpegio',lvl:3,t:'Arpegio 1-3-5-8',syl:'ia',bpm:80,pat:[[0,1],[4,1],[7,1],[12,1],[7,1],[4,1],[0,2]],rounds:5,hue:328,tip:'Prepara el salto agudo desde abajo. Conserva la boca y el aire suaves.'},
 {id:'quintas',lvl:3,t:'Saltos de quinta',syl:'mo',bpm:80,pat:[[0,1],[7,1],[0,1],[7,1],[12,1],[7,1],[0,2]],rounds:5,hue:290,tip:'Escucha la distancia entre las notas. Salta con ligereza, sin gritar.'},
 {id:'nueve',lvl:3,t:'Escala de nueve notas',syl:'li',bpm:120,pat:[0,2,4,5,7,9,11,12,14,12,11,9,7,5,4,2,0].map(n=>[n,.5]),rounds:5,hue:20,tip:'Deja que el aire continúe mientras la lengua cambia de nota.'},
 {id:'agilidad',lvl:3,t:'Agilidad',syl:'na',bpm:140,pat:[0,2,4,5,7,5,4,2,0].map(n=>[n,.5]),rounds:5,hue:195,tip:'Haz movimientos pequeños con la boca. Prioriza claridad antes que volumen.'},
 {id:'extensor',lvl:3,t:'Amplía tu rango',syl:'uuu',bpm:72,pat:[[0,2],[4,2],[7,2],[12,2],[7,2],[0,2]],rounds:3,hue:265,tip:'Prueba la nota nueva con voz ligera. Si cuesta o molesta, salta este paso.'}
].map(d=>{
  const notes=d.pat.filter(p=>p[0]!=null),span=Math.max(1,...notes.map(p=>p[0]));
  const contour=notes.map(([n],i)=>`${i?'L':'M'}${12+i*76/Math.max(1,notes.length-1)} ${76-n/span*52}`).join(' ');
  const motif=d.id==='eco'?'<circle cx="50" cy="48" r="9"/><path d="M28 48H14M72 48h14"/>':d.id==='crescendo'?'<path d="M86 24L14 48 86 72"/>':d.glide?'<path d="M12 76C32 76 38 22 50 22S70 76 88 76"/>':notes.length===1?'<path d="M12 48h76"/>':`<path d="${contour}"/>`;
  return {...d,motif:d.motif||motif,sub:d.tip};
});
const drillById=id=>DRILLS.find(d=>d.id===id);
const drillArt=d=>coverArt(d.hue,d.motif,null,'d'+d.id);
/* ---------- canciones para cantar (dominio público o escritas para la app) ----------
   ChordPro como en Roka Guitar: sílabas con ~, _ une dos palabras en una sílaba, {mel: G4/1 +A4/.5 r/1} da nota y pulsos
   de cada sílaba (+ = la misma sílaba sigue en otra nota, r = silencio). */
const SONGS=[
`{id:escala-do}{title:La escala con su nombre}{artist:Ejercicio · Roka Couch Vocal}{bpm:80}{time:4/4}
Do Re Mi Fa Sol La Si Do,
{mel:C4/1 D4/1 E4/1 F4/1 G4/1 A4/1 B4/1 C5/1}
Do Si La Sol Fa Mi Re Do.
{mel:C5/1 B4/1 A4/1 G4/1 F4/1 E4/1 D4/1 C4/2}`,
`{id:vocales}{title:Las cinco vocales}{artist:Ejercicio · Roka Couch Vocal}{bpm:72}{time:4/4}
A E I O U,
{mel:C4/1 E4/1 G4/1 E4/1 C4/2}
U O I E A.
{mel:G4/1 E4/1 C4/1 E4/1 G4/2}
Ma me mi mo mu,
{mel:C4/1 D4/1 E4/1 F4/1 G4/2}
mu mo mi me ma.
{mel:G4/1 F4/1 E4/1 D4/1 C4/2}`,
`{id:cumple}{title:Cumpleaños feliz}{artist:Tradicional}{bpm:100}{time:3/4}
[C]Cum~ple~a~ños fe~[G7]liz,
{mel:G4/.75 G4/.25 A4/1 G4/1 C5/1 B4/2}
te de~[G7]sea~mos a [C]ti,
{mel:G4/.75 G4/.25 A4/1 G4/1 D5/1 C5/2}
cum~ple~[C7]a~ños, a~[F]mi~go,
{mel:G4/.75 G4/.25 G5/1 E5/1 C5/1 B4/1 A4/1}
cum~ple~[C]a~ños [G7]fe~[C]liz.
{mel:F5/.75 F5/.25 E5/1 C5/1 D5/1 C5/3}`,
`{id:estrellita}{title:Estrellita, ¿dónde estás?}{artist:Tradicional}{bpm:96}{time:4/4}
[C]Es~tre~lli~ta, [F]¿dón~de_es~[C]tás?
{mel:C4/1 C4/1 G4/1 G4/1 A4/1 A4/1 G4/2}
[F]Me pre~[C]gun~to [G7]qué se~[C]rás.
{mel:F4/1 F4/1 E4/1 E4/1 D4/1 D4/1 C4/2}
[C]En el [F]cie~lo [C]y_en el [G7]mar,
{mel:G4/1 G4/1 F4/1 F4/1 E4/1 E4/1 D4/2}
[C]un dia~[F]man~te [C]de ver~[G7]dad.
{mel:G4/1 G4/1 F4/1 F4/1 E4/1 E4/1 D4/2}
[C]Es~tre~lli~ta, [F]¿dón~de_es~[C]tás?
{mel:C4/1 C4/1 G4/1 G4/1 A4/1 A4/1 G4/2}
[F]Me pre~[C]gun~to [G7]qué se~[C]rás.
{mel:F4/1 F4/1 E4/1 E4/1 D4/1 D4/1 C4/2}`,
`{id:grace}{title:Amazing Grace}{artist:John Newton · 1779}{bpm:84}{time:3/4}
A~[G]ma~zing grace! How [C]sweet the [G]sound
{mel:D4/1 G4/2 B4/.5 +G4/.5 B4/2 A4/1 G4/2 E4/1 D4/2}
that [G]saved a [Em]wretch like [D]me!
{mel:D4/1 G4/2 B4/.5 +G4/.5 B4/2 A4/1 D5/2}
I [G]once was lost, but [C]now am [G]found,
{mel:B4/1 D5/2 B4/.5 +G4/.5 B4/2 A4/1 G4/2 E4/1 D4/2}
was [Em]blind, but [D]now I [G]see.
{mel:D4/1 G4/2 B4/.5 +G4/.5 B4/2 A4/1 G4/3}`];
const SONGHUE={'escala-do':205,vocales:180,cumple:328,estrellita:262,grace:26};
const SONGM={'escala-do':'<path d="M14 80h12v-9h12v-9h12v-6h12v-9h12v-9h12"/>',vocales:'<circle cx="50" cy="48" r="20"/><path d="M42 48h16" stroke-opacity=".6"/>',cumple:'<path d="M30 80V50h40v30"/><path d="M40 50V36M50 50V32M60 50V36"/>',estrellita:'<path d="M50 20l8 18 20 2-15 13 5 20-18-11-18 11 5-20-15-13 20-2z"/>',grace:'<path d="M14 70c14-30 58-30 72 0"/><circle cx="50" cy="34" r="6" fill="#fff" stroke="none"/>'};
function songParse(src){
  const S={meta:{},lines:[]};
  src.split('\n').forEach(raw=>{
    const ln=raw.trim();if(!ln)return;
    const tags=[...ln.matchAll(/\{(\w+):([^}]*)\}/g)];
    if(tags.length&&ln.replace(/\{[^}]*\}/g,'').trim()===''){
      tags.forEach(([,k,v])=>{if(k==='mel'){const L=S.lines[S.lines.length-1];if(L)L.mel=v.trim().split(/\s+/).map(tok=>{const[n,d]=tok.split('/');const cont=n[0]==='+',nm=cont?n.slice(1):n;return{m:nm==='r'?null:parseNote(nm),d:+d||1,cont}})}else S.meta[k]=v.trim()});
      return;
    }
    // sílabas: espacios separan palabras, ~ separa sílabas; [Acorde] cae en la sílaba que sigue
    const syl=[];let chord=null;
    ln.split(/(\[[^\]]+\])/).forEach(part=>{
      if(/^\[[^\]]+\]$/.test(part)){chord=part.slice(1,-1);return}
      part.split(/(\s+)/).forEach(w=>{
        if(!w)return;if(/^\s+$/.test(w)){if(syl.length)syl[syl.length-1].sp=true;return}
        w.split('~').forEach(p=>{if(p==='')return;syl.push({x:p.replace(/_/g,' '),ch:chord,sp:false});chord=null});
      });
      if(chord&&!part.trim()){} // acorde al final del renglón: se ignora
    });
    S.lines.push({syl,mel:null});
  });
  S.id=S.meta.id;S.title=S.meta.title||'Canción';S.artist=S.meta.artist||'';S.bpm=+S.meta.bpm||90;S.beats=+(S.meta.time||'4/4').split('/')[0]||4;
  return S;
}
/* Fragmentos de melodías históricas. «la» evita atribuir traducciones modernas
   a la tradición. Las vocalizaciones al final son composiciones de esta app. */
const CATALOG_ADDITIONS=[
 ['hermano-juan','Hermano Juan','Tradicional francesa','Infantiles',1,96,4,
  ['C4 D4 E4 C4','C4 D4 E4 C4','E4 F4 G4/2','E4 F4 G4/2','G4/.5 A4/.5 G4/.5 F4/.5 E4 C4','G4/.5 A4/.5 G4/.5 F4/.5 E4 C4','C4 G3 C4/2','C4 G3 C4/2'],
  ['Her~ma~no Juan','Her~ma~no Juan','duer~mes tú','duer~mes tú','To~ca la cam~pa~na','to~ca la cam~pa~na','din don dan','din don dan']],
 ['row-row','Row, Row, Row Your Boat','Tradicional · siglo XIX','Folk',1,100,3,
  ['C4/1.5 C4/.5 C4 D4/.5 E4/1.5','E4/1.5 D4/.5 E4 F4/.5 G4/1.5','C5/.5 C5/.5 C5/.5 G4/.5 G4/.5 G4/.5 E4/.5 E4/.5 E4/.5 C4/.5 C4/.5 C4/.5','G4/1.5 F4/.5 E4 D4/.5 C4/1.5']],
 ['mary-lamb','Mary Had a Little Lamb','Sarah J. Hale · melodía tradicional','Infantiles',1,96,4,
  ['E4 D4 C4 D4 E4 E4 E4/2','D4 D4 D4/2 E4 G4 G4/2','E4 D4 C4 D4 E4 E4 E4 E4','D4 D4 E4 D4 C4/4']],
 ['london-bridge','London Bridge','Tradicional inglesa','Infantiles',1,100,4,
  ['G4/1.5 A4/.5 G4 F4 E4 F4 G4/2','D4 E4 F4/2 E4 F4 G4/2','G4/1.5 A4/.5 G4 F4 E4 F4 G4/2','D4/2 G4/2 E4 C4/3']],
 ['hot-cross-buns','Hot Cross Buns','Tradicional inglesa','Infantiles',1,90,4,
  ['E4/2 D4/2 C4/4','E4/2 D4/2 C4/4','C4 C4 C4 C4 D4 D4 D4 D4','E4/2 D4/2 C4/4']],
 ['au-clair','Au clair de la lune','Tradicional francesa · siglo XVIII','Infantiles',1,90,4,
  ['C4 C4 C4 D4 E4/2 D4/2','C4 E4 D4 D4 C4/4','C4 C4 C4 D4 E4/2 D4/2','C4 E4 D4 D4 C4/4']],
 ['sur-le-pont','Sur le pont d’Avignon','Tradicional francesa','Infantiles',1,108,4,
  ['C4 C4 C4 D4 E4 C4/3','E4 D4 D4 E4 F4 D4/3','C4 C4 C4 D4 E4 C4/3','D4/2 G4/2 E4 C4/3']],
 ['bingo','Bingo','Tradicional · siglo XVIII','Infantiles',2,105,4,
  ['G3 C4 C4 C4 G3 A3 A3 G3','G3 C4 C4 D4 E4/2 C4/2','E4 E4 F4 F4 G4/2 G4/2','A4 A4 A4 F4 G4/2 G4/2','F4 F4 F4 D4 E4/2 E4/2','D4 C4 D4 E4 C4/4']],
 ['old-macdonald','Old MacDonald','Tradicional · siglo XIX','Infantiles',1,105,4,
  ['C4 C4 C4 G3 A3 A3 G3/2','E4 E4 D4 D4 C4/4','G3 C4 C4 C4 G3 A3 A3 G3','E4 E4 D4 D4 C4/4']],
 ['hickory','Hickory Dickory Dock','Tradicional inglesa','Infantiles',2,108,3,
  ['G3/.5 C4/.5 C4/.5 D4/.5 E4 G4/2 E4','E4 F4/.5 G4/.5 A4/2 A4','A4 G4/.5 F4/.5 G4/2 E4','E4 D4/.5 C4/.5 D4/2 C4']],
 ['cucaracha','La cucaracha · estribillo','Tradicional mexicana','Tradicionales',2,104,4,
  ['C4/.5 C4/.5 C4/.5 F4/1.5 A4','C4/.5 C4/.5 C4/.5 F4/1.5 A4','F4/.5 F4/.5 E4/.5 E4/.5 D4/.5 D4/.5 C4/2','C4/.5 C4/.5 C4/.5 E4/1.5 G4','C4/.5 C4/.5 C4/.5 E4/1.5 G4','C5/.5 D5/.5 C5/.5 Bb4/.5 A4/.5 G4/.5 F4/2']],
 ['noche-paz','Noche de paz','Franz Xaver Gruber · 1818','Navidad',2,84,3,
  ['G4/1.5 A4/.5 G4 E4/3','G4/1.5 A4/.5 G4 E4/3','D5/2 D5 B4/3','C5/2 C5 G4/3','A4/2 A4 C5/1.5 B4/.5 A4','G4/1.5 A4/.5 G4 E4/3']],
 ['jingle-bells','Jingle Bells · estribillo','James L. Pierpont · 1857','Navidad',1,112,4,
  ['E4 E4 E4/2 E4 E4 E4/2','E4 G4 C4/1.5 D4/.5 E4/4','F4 F4 F4/1.5 F4/.5 F4 E4 E4/.5 E4/.5 E4','E4 D4 D4 E4 D4/2 G4/2']],
 ['adeste','Adeste fideles','Himno · siglo XVIII','Navidad',2,92,4,
  ['G4/2 G4 D4 G4/2 A4/2','D4/4 B4 A4 B4 C5','B4/2 A4/2 G4/2 G4 F#4 E4','F#4 G4 A4 B4 F#4/2 E4 D4']],
 ['deck-halls','Deck the Halls','Tradicional galesa','Navidad',2,108,4,
  ['G4/1.5 F4/.5 E4 D4 C4 D4 E4 C4','D4/.5 E4/.5 F4/.5 D4/.5 E4/1.5 D4/.5 C4 B3 C4/2','G4/1.5 F4/.5 E4 D4 C4 D4 E4 C4','D4/.5 E4/.5 F4/.5 D4/.5 E4/1.5 D4/.5 C4 B3 C4/2']],
 ['we-wish','We Wish You a Merry Christmas','Tradicional inglesa','Navidad',2,108,3,
  ['G3 C4 C4/.5 D4/.5 C4 B3 A3','A3 D4 D4/.5 E4/.5 D4 C4 B3','G3 E4 E4/.5 F4/.5 E4 D4 C4','A3 G3 G3 A3 D4 B3 C4/2']],
 ['first-noel','The First Noel','Tradicional inglesa','Navidad',2,96,3,
  ['E4/.5 D4/.5 C4/1.5 D4/.5 E4/.5 F4/.5 G4/2 A4/.5 B4/.5','C5/2 B4 A4/2 G4','A4/2 B4 C5/2 B4','A4 G4 F4 E4/2 D4 C4/3']],
 ['auld-lang-syne','Auld Lang Syne','Tradicional escocesa · siglo XVIII','Folk',2,96,4,
  ['G3 C4/1.5 C4/.5 C4 E4 D4/1.5 C4/.5 D4 E4','C4/1.5 C4/.5 E4 G4 A4/3 A4','G4/1.5 E4/.5 E4 C4 D4/1.5 C4/.5 D4 E4','C4/1.5 A3/.5 A3 G3 C4/3']],
 ['oh-susanna','Oh! Susanna','Stephen Foster · 1848','Folk',2,108,4,
  ['C4/.5 D4/.5 E4 G4 G4/1.5 A4/.5 G4 E4 C4 D4','E4 E4 D4 C4 D4/4','C4/.5 D4/.5 E4 G4 G4/1.5 A4/.5 G4 E4 C4 D4','E4 E4 D4 D4 C4/4']],
 ['saints','When the Saints Go Marching In','Himno tradicional','Folk',1,100,4,
  ['C4 E4 F4 G4/5','C4 E4 F4 G4/5','C4 E4 F4 G4/2 E4/2 C4/2 E4/2 D4/4','E4 E4 D4 C4/3 C4 E4 G4 G4 F4/4','F4 E4 F4 G4 E4/2 D4/2 C4/4']],
 ['scarborough','Scarborough Fair','Tradicional inglesa','Folk',2,92,3,
  ['D4/2 D4 A4/2 A4 E4 F4 E4 D4/3','A4/2 C5 D5/2 C5 A4 B4 G4 A4/3','D5/2 D5 D5 C5 A4 A4 G4 F4 E4 C4/3','D4/2 A4 G4 F4 E4 D4 C4 D4/3']],
 ['greensleeves','Greensleeves','Tradicional inglesa · siglo XVI','Folk',3,100,3,
  ['A3 C4/2 D4 E4/1.5 F4/.5 E4 D4/2 B3 G3/1.5 A3/.5 B3','C4/2 A3 A3/1.5 G#3/.5 A3 B3/2 G#3 E3/3']],
 ['sakura','Sakura Sakura','Tradicional japonesa','Folk',2,80,4,
  ['A4 A4 B4/2 A4 A4 B4/2','A4 B4 C5 B4 A4 B4/.5 A4/.5 F4/2','E4 C4 E4 F4 E4 E4/.5 C4/.5 B3/2','A4 A4 B4/2 A4 A4 B4/2']],
 ['shady-grove','Shady Grove','Tradicional de los Apalaches','Folk',2,100,4,
  ['D4 D4 F4 G4 A4/2 G4 F4','D4 D4 F4 D4 C4/4','D4 D4 F4 G4 A4/2 C5/2','A4 G4 F4 E4 D4/4']],
 ['shoes','Shoo Fly','Tradicional · siglo XIX','Folk',1,108,4,
  ['G4 E4/2 C4 G4 E4/2 C4','G4 E4 C4 D4 E4 D4 C4/2','G4 E4/2 C4 G4 E4/2 C4','G4 E4 C4 D4 E4 D4 C4/2']],
 ['alegria','Oda a la alegría','L. van Beethoven · 1824','Clásicas',1,100,4,
  ['E4 E4 F4 G4 G4 F4 E4 D4','C4 C4 D4 E4 E4/1.5 D4/.5 D4/2','E4 E4 F4 G4 G4 F4 E4 D4','C4 C4 D4 E4 D4/1.5 C4/.5 C4/2']],
 ['brahms-cuna','Canción de cuna','Johannes Brahms · 1868','Clásicas',2,84,3,
  ['E4/.5 E4/.5 G4/2 E4/.5 E4/.5 G4/2','E4 G4 C5 B4/2 A4 A4/2 G4','D4 E4 F4 D4 D4 E4 F4/2','D4 F4 B4 A4 G4 B4 C5/3']],
 ['largo-dvorak','Largo · Nuevo Mundo','Antonín Dvořák · 1893','Clásicas',2,76,4,
  ['E4/2 G4/2 G4/4 E4 D4 C4 D4 E4/4','G4 A4 C5 A4 G4/4 E4 D4 C4 D4 C4/4']],
 ['canon-tallis','Canon de Tallis','Thomas Tallis · siglo XVI','Clásicas',1,90,4,
  ['G4 F4 E4 D4 C4 D4 E4 C4','G4 G4 A4 B4 C5 B4 A4 G4','A4 G4 F4 E4 F4 E4 D4 G4','G4 F4 E4 D4 C4/4']],
 ['escala-menor','La escalera menor','Original · Roka Couch Vocal','Vocalizaciones',2,80,4,
  ['A3 B3 C4 D4 E4 F4 G4 A4','A4 G4 F4 E4 D4 C4 B3 A3']],
 ['saltos-tercera','Los saltos de tercera','Original · Roka Couch Vocal','Vocalizaciones',2,90,4,
  ['C4 E4 D4 F4 E4 G4 F4 A4','G4 E4 F4 D4 E4 C4 D4 C4']],
 ['saltos-quinta','Los saltos de quinta','Original · Roka Couch Vocal','Vocalizaciones',3,80,4,
  ['C4 G4 D4 A4 E4 B4 F4 C5','C5 F4 B4 E4 A4 D4 G4 C4']],
 ['pentatonica','Cinco peldaños','Original · Roka Couch Vocal','Vocalizaciones',1,90,4,
  ['C4 D4 E4 G4 A4 G4 E4 D4','C4/2 E4/2 G4/2 C4/2']],
 ['olas-suaves','Olas suaves','Original · Roka Couch Vocal','Vocalizaciones',1,72,4,
  ['C4/2 D4/2 E4/2 D4/2','C4/2 E4/2 G4/2 E4/2','D4/2 F4/2 E4/2 C4/2']],
 ['eco-menor','Eco en menor','Original · Roka Couch Vocal','Vocalizaciones',2,96,4,
  ['A3 C4 E4 C4 A3/2 E4/2','B3 D4 F4 D4 B3/2 F4/2','C4 E4 A4 E4 C4 B3 A3/2']]
];
// Textos tradicionales originales, sin traducciones ni arreglos modernos.
const CATALOG_LYRICS={
 'row-row':['Row row row your boat','Gent~ly down the stream','Mer~ri~ly mer~ri~ly mer~ri~ly mer~ri~ly','Life is but a dream'],
 'mary-lamb':['Ma~ry had a lit~tle lamb','lit~tle lamb lit~tle lamb','Ma~ry had a lit~tle lamb its','fleece was white as snow'],
 'london-bridge':['Lon~don Bridge is fal~ling down','fal~ling down fal~ling down','Lon~don Bridge is fal~ling down','My fair la~dy'],
 'hot-cross-buns':['Hot cross buns','Hot cross buns','One a pen~ny two a pen~ny','Hot cross buns'],
 'au-clair':['Au clair de la lu~ne','Mon a~mi Pier~rot','Prê~te moi ta plu~me','Pour é~crire un mot'],
 'old-macdonald':['Old Mac~Do~nald had a farm','E I E I O','And on that farm he had a cow','E I E I O'],
 'jingle-bells':['Jin~gle bells jin~gle bells','jin~gle all the way','Oh what fun it is to ride in a','one horse o~pen sleigh hey']
};
for(const [id,title,artist,gen,lvl,bpm,beats,phrases,providedWords] of CATALOG_ADDITIONS){
  const words=providedWords||CATALOG_LYRICS[id];
  SONGS.push(`{id:${id}}{title:${title}}{artist:${artist}}{gen:${gen}}{lvl:${lvl}}{bpm:${bpm}}{time:${beats}/4}{version:${words?'Letra tradicional':'Fragmento para vocalizar con la'}}\n`+phrases.map((p,i)=>{
    const tokens=p.split(' ').map(n=>n.includes('/')?n:n+'/1');
    return (words?words[i]:tokens.filter(n=>!n.startsWith('r')).map(()=>'la').join(' '))+'\n{mel:'+tokens.join(' ')+'}';
  }).join('\n'));
}
// Completa el último compás con silencio; conserva anacrusas y ligaduras internas.
for(let i=0;i<SONGS.length;i++){
  let src=SONGS[i];if(i<5)src=`{lvl:${i===2||i===4?2:1}}{gen:${i<2?'Vocalizaciones':i===4?'Folk':'Infantiles'}}\n`+src;
  const s=songParse(src),total=s.lines.flatMap(l=>l.mel||[]).reduce((n,x)=>n+x.d,0),rest=(s.beats-total%s.beats)%s.beats;
  if(rest)src=src.replace(/(\{mel:[^}]*)(\})\s*$/,'$1 r/'+rest+'$2');SONGS[i]=src;
}
const SONGLIST=SONGS.map(songParse);
if(!Array.isArray(DB.songs))DB.songs=[];
function allSongs(){return [...SONGLIST,...DB.songs.filter(s=>s&&typeof s.src==='string').map(row=>({...songParse(row.src),id:row.id,mine:true,recording:row}))]}
const songById=id=>allSongs().find(s=>s.id===id);
const COLLECTION_HUE={Infantiles:262,Tradicionales:328,Navidad:160,Folk:26,Clásicas:215,Vocalizaciones:185,'Mis canciones':300};
const songArt=s=>coverArt(COLLECTION_HUE[s.mine?'Mis canciones':s.meta.gen]||SONGHUE[s.id]||218,SONGM[s.id]||DLINE,null,'s'+s.id);
