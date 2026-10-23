/* Patrones: [semitonos, pulsos]; null es silencio. */
const DLINE='<path d="M12 68L30 52 48 32 66 52 88 68"/>';
const DRILLS=[
 {id:'respira',lvl:1,t:'Respiración 4-4-8',syl:'sss',bpm:60,pat:[],rounds:3,hue:180,motif:'<circle cx="50" cy="50" r="28"/>',tip:'Inhala sin subir los hombros. Suelta el aire parejo en «sss».',breath:true},
 {id:'eco',lvl:1,t:'Repite la nota',syl:'ma',bpm:60,pat:[[0,2]],rounds:5,hue:205,tip:'Escucha, imagina la nota y repítela con suavidad.'},
 {id:'larga',lvl:1,t:'Nota larga',syl:'ma',bpm:60,pat:[[0,4]],rounds:5,hue:218,tip:'Mantén el aire y el volumen parejos hasta el final.'},
 {id:'trino',lvl:1,t:'Trino de labios',syl:'brrr',bpm:72,pat:[[0,1],[2,1],[4,1],[5,1],[7,1],[5,1],[4,1],[2,1],[0,2]],rounds:5,hue:180,tip:'Deja los labios sueltos. Si no vibran, ayuda con dos dedos en las mejillas.'},
 {id:'sirena',lvl:1,t:'Sirena',syl:'uuu',bpm:60,glide:true,pat:[[0,3],[12,3],[0,2]],rounds:5,hue:262,tip:'Desliza la voz sin levantar la barbilla. Arriba, deja el sonido ligero.'},
 {id:'tres',lvl:1,t:'Tres notas',syl:'nu',bpm:60,pat:[[0,1],[2,1],[4,1],[2,1],[0,2]],rounds:5,hue:240,tip:'Une las tres notas con el mismo aire y una «u» suave.'},
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
const SONGLIST=SONGS.map(songParse);
const songById=id=>SONGLIST.find(s=>s.id===id);
const songArt=s=>coverArt(SONGHUE[s.id]||218,SONGM[s.id],null,'s'+s.id);
