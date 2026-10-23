/* ---------- ejercicios de calentamiento ----------
   pat: [semitonos desde la nota base, pulsos]; null = silencio. glide: la voz se desliza entre notas (sirena).
   Cada ronda la app toca el patrón («Escucha») y luego lo cantas tú («Ahora tú»); la siguiente ronda sube medio tono. */
const DRILLS=[
 {id:'larga',t:'Nota larga',sub:'Afinación y aire parejo',syl:'«ma»',bpm:66,pat:[[0,4]],hue:218,
  tip:'Canta la nota y sostenla sin que suba ni baje. Piensa en una línea recta: el mismo volumen del principio al final.',
  motif:'<path d="M12 48h76"/><circle cx="12" cy="48" r="5" fill="#fff" stroke="none"/>'},
 {id:'trino',t:'Trino de labios',sub:'Relaja y conecta el aire',syl:'«brrr»',bpm:92,pat:[[0,.5],[2,.5],[4,.5],[5,.5],[7,.5],[5,.5],[4,.5],[2,.5],[0,1.5]],hue:180,
  tip:'Junta los labios sueltos y sopla para que vibren como motor: «brrr». Si no vibran, empuja suave las mejillas con dos dedos.',
  motif:'<path d="M10 70c6-8 8-8 12 0s8 8 12-8 8-14 12-16 8 6 12 14 8 10 12 6 8-10 12-14"/>'},
 {id:'sirena',t:'Sirena',sub:'Une tu voz grave y aguda',syl:'«uuu»',bpm:72,glide:true,pat:[[0,2],[12,2],[0,1]],hue:262,
  tip:'Desliza la voz como sirena de ambulancia, sin saltos. Al subir, no levantes la barbilla ni empujes más fuerte: deja que el sonido se haga más ligero.',
  motif:'<path d="M10 76C30 76 36 22 50 22S70 76 90 76"/>'},
 {id:'arpegio',t:'Arpegio 1-3-5-8',sub:'Saltos afinados',syl:'«ia»',bpm:80,pat:[[0,1],[4,1],[7,1],[12,1],[7,1],[4,1],[0,2]],hue:328,
  tip:'Imagina cada nota antes de cantarla. El salto grande (de la 5 a la 8) se prepara desde abajo: misma boca, mismo aire.',
  motif:'<path d="M14 78h14v-14h14v-12h14v-18h14v18h14"/>'},
 {id:'escala',t:'Escala de cinco notas',sub:'Paso a paso, legato',syl:'«no»',bpm:96,pat:[[0,1],[2,1],[4,1],[5,1],[7,1],[5,1],[4,1],[2,1],[0,2]],hue:26,
  tip:'Une cada nota con la siguiente sin cortar el aire (legato). Que la «o» quede redonda en todas las notas.',
  motif:'<path d="M14 80h12v-9h12v-9h12v-6h12v-9h12"/>'},
 {id:'staccato',t:'Staccato',sub:'Ataque limpio con el apoyo',syl:'«ja ja ja»',bpm:84,pat:[[0,.5],[null,.5],[4,.5],[null,.5],[7,.5],[null,.5],[4,.5],[null,.5],[0,.5],[null,1.5]],hue:44,
  tip:'Notas cortas como risa de Santa Claus. Cada «ja» sale de un empujoncito del abdomen, no de la garganta.',
  motif:'<circle cx="22" cy="64" r="6" fill="#fff" stroke="none"/><circle cx="44" cy="48" r="6" fill="#fff" stroke="none"/><circle cx="66" cy="34" r="6" fill="#fff" stroke="none"/>'}];
const drillById=id=>DRILLS.find(d=>d.id===id);
const drillArt=d=>coverArt(d.hue,d.motif,null,'d'+d.id);
// calentamiento de hoy: respiración, cuerpo de la voz y afinación
const WARMUP=['respira','trino','sirena','escala','arpegio','larga'];
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
/* ---------- lecciones de técnica ----------
   Mismo método que las lecciones de Roka Guitar: objetivos → pasos con ejemplo → idea clave → ejercicios → compruébalo → errores → hoja de trucos.
   Nunca usar un término sin definirlo antes. */
const ALLEX=[];
function E(x){ALLEX.push(x);return{ex:x}}
const LESSONS=[
{id:1,title:'Postura y respiración',sub:'El aire es el motor',hue:180,lead:'Antes de afinar hay que tener con qué sonar. Cantar es soplar aire a través de las cuerdas vocales; si el aire llega parejo, la voz sale pareja. En esta lección aprendes a pararte y a respirar como cantante.',
 motif:'<circle cx="50" cy="48" r="12"/><circle cx="50" cy="48" r="22" stroke-opacity=".6"/><circle cx="50" cy="48" r="32" stroke-opacity=".3"/>',
 blocks:[
  {aim:['Pararte en una postura que deje pasar el aire sin tensión.','Respirar «abajo» (con el abdomen) en lugar de subir los hombros.','Soltar el aire despacio y parejo con una «sss» de al menos 15 segundos.']},
  {step:'Paso 1',t:'La postura de cantante',p:'Pies separados al ancho de tus hombros, rodillas sueltas (no trabadas), hombros abajo y hacia atrás sin forzar, y la cabeza como si un hilo la jalara hacia el techo. La barbilla queda paralela al piso: ni levantada ni pegada al pecho. <b>Ejemplo resuelto:</b> párate frente a un espejo, sube los hombros hasta las orejas, suéltalos de golpe y deja que caigan solos: esa es su altura correcta.'},
  {step:'Paso 2',t:'Qué es el diafragma',p:'El <b>diafragma</b> es un músculo en forma de cúpula que está debajo de tus pulmones, separando el pecho de la panza. Cuando inhalas, baja y empuja tus órganos hacia afuera: por eso la panza y los costados se inflan. No lo puedes ver, pero sí sentir: pon una mano en tu ombligo y otra en tus costillas de abajo.'},
  {step:'Paso 3',t:'Inhalar abajo',p:'Inhala por la nariz, despacio, en 4 tiempos. La mano del ombligo y las costillas de los costados se mueven hacia afuera; el pecho y los hombros casi no se mueven. <b>Ejemplo:</b> acostado boca arriba con un libro sobre la panza, al inhalar el libro sube y al exhalar baja. Si el libro no se mueve y tus hombros sí, estás respirando arriba.'},
  {step:'Paso 4',t:'Soltar con control: la «sss»',p:'Exhala diciendo una «sss» suave y pareja, como llanta que se desinfla poco a poco. Lo importante no es la fuerza sino que el sonido sea igual del principio al final. Mientras sale el aire, intenta que tus costillas no se cierren de golpe: ciérralas despacio. A esa resistencia suave se le llama <b>apoyo</b>, y la verás en la lección 2.'},
  {key:'Respira como si llenaras un globo en tu cintura, no en tu pecho. Los hombros no participan: si suben, el aire se queda arriba y la garganta se tensa.'},
  E({id:'l1-resp',lesson:1,t:'Respiración 4-4-8',min:3,go:'#/practicar/respiracion',goL:'Abrir respiración',steps:['Abre la herramienta Respiración en modo «4-4-8».','Inhala 4 tiempos por la nariz con la mano en el ombligo.','Sostén 4 tiempos sin cerrar la garganta (como si siguieras inhalando).','Suelta 8 tiempos con una «sss» pareja. Haz 5 ciclos.'],goal:'haces 5 ciclos seguidos sin subir los hombros y sin quedarte sin aire antes del 8.'}),
  E({id:'l1-sss',lesson:1,t:'La «sss» más larga',min:3,go:'#/practicar/respiracion',goL:'Medir mi «sss»',steps:['En Respiración, elige «Sss medida» y activa el micrófono.','Inhala abajo en 4 tiempos.','Di «sss» parejo cerca del teléfono; la app cuenta los segundos mientras suene.','Descansa 30 segundos y repite 3 veces.'],goal:'sostienes la «sss» 15 segundos o más con el mismo volumen. Con práctica llegarás a 25–30.'}),
  {check:[['¿Qué se mueve cuando inhalas bien?','La panza y los costados, hacia afuera. El pecho y los hombros casi no se mueven.'],['¿Qué es el diafragma?','Un músculo en forma de cúpula debajo de los pulmones. Al inhalar baja y hace espacio para el aire.'],['¿Qué importa más en la «sss»: la fuerza o lo parejo?','Lo parejo. Una «sss» suave y constante vale más que una fuerte que se acaba en 5 segundos.']]},
  {box:'Errores comunes',ul:['Subir los hombros al inhalar: el aire se queda arriba y aprieta la garganta.','Meter la panza al inhalar (lo contrario de lo que se busca).','Inhalar con ruido por la boca: hazlo por la nariz y sin prisa.','Soltar todo el aire al principio de la «sss».']},
  {trick:['Pies al ancho de hombros, rodillas sueltas, barbilla paralela al piso.','Inhala en 4 por la nariz, panza y costados hacia afuera.','Suelta en «sss» pareja; cierra las costillas despacio.','Meta: 15 segundos de «sss» hoy, 25 en un mes.']}]},
{id:2,title:'Apoyo y emisión',sub:'Sonar sin lastimarte',hue:205,lead:'Ya sabes respirar abajo. Ahora conviertes ese aire en sonido sin apretar la garganta: el apoyo controla el aire y la resonancia hace que la voz suene más sin gritar.',
 motif:'<path d="M14 66c12-16 24-16 36 0s24 16 36 0"/><path d="M14 46c12-16 24-16 36 0s24 16 36 0" stroke-opacity=".5"/>',
 blocks:[
  {aim:['Sostener el sonido con el abdomen (apoyo) y no con la garganta.','Encontrar la resonancia en la cara con el «ng».','Usar el trino de labios para calentar sin esfuerzo.']},
  {step:'Paso 1',t:'Qué es el apoyo',p:'El <b>apoyo</b> es frenar la salida del aire con los músculos del abdomen y las costillas, para que salga despacio y parejo. Es lo que hiciste con la «sss» de la lección 1, pero ahora con voz. <b>Ejemplo resuelto:</b> tose suave una vez con la mano en el ombligo: ese empujoncito que sientes es el músculo del apoyo. Cantar con apoyo es usar ese músculo de forma lenta y constante, no de golpe.'},
  {step:'Paso 2',t:'Garganta abierta',p:'La garganta debe sentirse como al inicio de un bostezo: la parte de atrás de la boca se levanta y la lengua queda relajada, tocando por dentro los dientes de abajo. Si al cantar sientes que «raspa» o se cierra, estás empujando con la garganta en lugar de con el apoyo.'},
  {step:'Paso 3',t:'Resonancia con «ng»',p:'La <b>resonancia</b> es cómo los huecos de tu cara y tu pecho amplifican el sonido, como la caja de una guitarra. Di «ng» (el final de «tengo» sostenido, con la boca cerrada atrás): debes sentir un cosquilleo en la nariz y los labios. <b>Ejemplo:</b> canta «nnnggg» en una nota cómoda y luego abre a «aaa» sin cambiar ese cosquilleo: la «a» sale más brillante sin más fuerza.'},
  {step:'Paso 4',t:'El trino de labios',p:'El <b>trino de labios</b> es soplar con los labios sueltos para que vibren («brrr») mientras haces una nota. Obliga a que el aire salga parejo (si empujas, los labios se detienen; si aflojas, también), y por eso es el calentamiento favorito de los maestros de canto.'},
  {key:'La fuerza sale del abdomen, el brillo sale de la cara. La garganta solo deja pasar: si aprieta, algo está mal.'},
  E({id:'l2-trino',lesson:2,t:'Trino de labios en escala',min:4,go:'#/practicar/ej/trino',goL:'Abrir trino',steps:['Abre el ejercicio «Trino de labios».','Escucha el patrón de cinco notas y repítelo con «brrr».','Si los labios se traban, presiona suave tus mejillas con dos dedos.','Haz todas las rondas: cada una sube medio tono.'],goal:'los labios vibran sin cortarse en todo el patrón y la app marca la mayoría de las notas en verde.'}),
  E({id:'l2-stac',lesson:2,t:'Staccato con apoyo',min:3,go:'#/practicar/ej/staccato',goL:'Abrir staccato',steps:['Abre el ejercicio «Staccato».','Pon una mano en el ombligo.','Canta cada «ja» corto, sintiendo un empujoncito del abdomen en cada uno.','La garganta queda quieta: el movimiento es de la panza.'],goal:'sientes el abdomen en cada «ja» y las notas salen cortas y limpias, sin golpe de garganta.'}),
  {check:[['¿Qué es el apoyo?','Frenar la salida del aire con el abdomen y las costillas para que salga lento y parejo.'],['¿Dónde debes sentir el «ng»?','En la nariz y los labios, como cosquilleo. Es la resonancia en la cara.'],['¿Por qué sirve el trino de labios?','Porque solo funciona con aire parejo: si empujas o aflojas, los labios dejan de vibrar.']]},
  {box:'Errores comunes',ul:['Empujar con la garganta para que suene más fuerte: cansa y lastima.','Apretar la quijada; déjala colgar suelta.','Cantar con la lengua hacia atrás: queda un sonido opaco y «de papa en la boca».']},
  {trick:['Tos suave = el músculo del apoyo.','Garganta como inicio de bostezo.','«ng» antes de abrir la vocal para encontrar la resonancia.','Trino de labios para calentar todos los días.']}]},
{id:3,title:'Afinación: escucha y repite',sub:'Cantar justo en la nota',hue:218,lead:'Afinar es cantar exactamente la nota que suena. No es un don: es oído más práctica. Aquí aprendes a escuchar, imitar y corregir viendo tu voz en la pantalla.',
 motif:'<path d="M12 48h76"/><path d="M12 60c14-20 24 6 38-12s24 6 38-4" stroke-opacity=".6"/>',
 blocks:[
  {aim:['Saber qué significa estar afinado, alto o bajo.','Leer tu voz en la línea de tono del afinador.','Igualar una nota que suena y sostenerla sin que se mueva.']},
  {step:'Paso 1',t:'Notas y semitonos',p:'Cada nota tiene una altura: más grave o más aguda. Entre Do y Do hay 12 notas, y la distancia entre una y la siguiente es un <b>semitono</b>. Cada semitono se divide en 100 <b>cents</b> (centésimas). <b>Ejemplo:</b> si cantas un La y el afinador dice «−20 cents», estás un poquito abajo del La, todavía lejos de llegar al Sol♯.'},
  {step:'Paso 2',t:'Cómo leer el afinador',p:'El afinador de voz muestra la nota más cercana a lo que cantas, una aguja (al centro = afinado) y una línea que dibuja tu voz en el tiempo. Si la aguja se va a la derecha estás <b>alto</b> (más agudo): relaja y baja tantito. Si se va a la izquierda estás <b>bajo</b>: sube con más aire, no con más garganta. Dentro de ±10 cents se pone verde.'},
  {step:'Paso 3',t:'Escucha, imagina, canta',p:'Para igualar una nota: 1) escúchala completa, 2) imagínala en tu cabeza sin cantar, 3) cántala suave en «u» o «ma». <b>Ejemplo resuelto:</b> suena un Sol. Lo cantas y la línea queda abajo de la barra. Subes poco a poco (como sirena corta) hasta que la línea entra en la barra y la sostienes ahí 3 segundos.'},
  {step:'Paso 4',t:'Si la nota está muy alta o muy baja',p:'Si la nota que suena es demasiado grave o aguda para ti, puedes cantarla una <b>octava</b> arriba o abajo: es la misma nota con otra altura (12 semitonos). La app pone los ejercicios en tu zona cómoda cuando mides tu rango vocal.'},
  {key:'Afinar es escuchar primero y cantar después. Cuando la línea se sale de la barra, no la persigas a jalones: desliza la voz despacio hasta entrar.'},
  E({id:'l3-afin',lesson:3,t:'Sostén la nota en el afinador',min:3,go:'#/practicar/afinador',goL:'Abrir afinador',steps:['Abre el afinador de voz y activa el micrófono.','Toca «Escuchar» en la nota de referencia y cántala en «u».','Mira la línea: llévala dentro de la franja de la nota.','Sostenla 5 segundos sin que se mueva.'],goal:'la aguja se queda en verde 5 segundos seguidos en tres notas distintas.'}),
  E({id:'l3-larga',lesson:3,t:'Nota larga, ronda por ronda',min:4,go:'#/practicar/ej/larga',goL:'Abrir nota larga',steps:['Abre el ejercicio «Nota larga».','En cada ronda escucha la nota y luego cántala con «ma».','Sostenla los 4 pulsos con el mismo volumen.','Revisa tu calificación al final.'],goal:'logras 70 % o más en el resultado final.'}),
  {check:[['¿Cuántos cents tiene un semitono?','100 cents.'],['La aguja se va a la derecha. ¿Estás alto o bajo?','Alto (más agudo). Relaja y baja tantito.'],['¿Qué haces antes de cantar una nota nueva?','La escuchas completa y la imaginas en tu cabeza.']]},
  {box:'Errores comunes',ul:['Empezar a cantar mientras la nota todavía suena, sin escucharla.','Corregir a jalones: la voz sube y baja de más.','Cantar fuerte para «llegar»: más volumen suele subir el tono de más.','Probar sin audífonos con la guía al mismo tiempo: el micrófono también oye a la app.']},
  {trick:['Escucha → imagina → canta.','Derecha = alto, izquierda = bajo.','Verde = ±10 cents.','Si no alcanzas, prueba una octava arriba o abajo.']}]},
{id:4,title:'Tu rango y tus registros',sub:'Voz de pecho y de cabeza',hue:262,lead:'Tu rango vocal es de la nota más grave a la más aguda que cantas con buen sonido. Conocerlo te dice qué canciones te quedan y en qué tono cantarlas.',
 motif:'<path d="M50 14v68"/><path d="M38 26l12-12 12 12M38 70l12 12 12-12"/>',
 blocks:[
  {aim:['Medir tu rango vocal con la app.','Distinguir la voz de pecho y la voz de cabeza.','Pasar de una a otra sin «quiebre» con la sirena.']},
  {step:'Paso 1',t:'Qué es el rango vocal',p:'El <b>rango vocal</b> va de tu nota más grave a tu nota más aguda <i>con sonido sano</i> (sin gritar ni susurrar). La zona del medio, donde cantas cómodo mucho rato, se llama <b>tesitura</b>. <b>Ejemplo:</b> si tu rango es de La2 a Mi4, tu tesitura será más o menos de Do3 a Do4.'},
  {step:'Paso 2',t:'Los tipos de voz',p:'Según dónde cae tu rango, tu voz se parece a un tipo: <b>bajo, barítono o tenor</b> (de grave a agudo, normalmente voces de hombre) y <b>contralto, mezzosoprano o soprano</b> (normalmente voces de mujer). Es una guía, no una etiqueta: el rango crece con práctica.'},
  {step:'Paso 3',t:'Registros: pecho y cabeza',p:'Un <b>registro</b> es una zona de la voz con el mismo «color». La <b>voz de pecho</b> es la de hablar: se siente vibrar en el pecho y suena llena. La <b>voz de cabeza</b> es más ligera y aguda: vibra en la cabeza, como imitar a un búho («uuu»). El punto donde cambias de una a otra se llama <b>pasaje</b>; ahí la voz a veces se quiebra.'},
  {step:'Paso 4',t:'Unir los registros con la sirena',p:'La <b>sirena</b> desliza la voz de grave a agudo sin saltos. Al pasar por el pasaje, no empujes: deja que la voz se haga más ligera. <b>Ejemplo resuelto:</b> en «uuu» subes desde una nota grave; cerca de tu pasaje sientes que algo «cambia de marcha». En vez de forzar, bajas el volumen un poco y sigues: así el quiebre se vuelve una curva suave.'},
  {key:'Tu rango no es fijo: se mide hoy para elegir ejercicios y canciones a tu medida, y crece si calientas y practicas sin forzar.'},
  E({id:'l4-rango',lesson:4,t:'Mide tu rango vocal',min:4,go:'#/practicar/rango',goL:'Medir mi rango',steps:['Abre «Rango vocal» y activa el micrófono.','Canta de cómodo hacia lo grave en «a» y sostén la nota más grave con buen sonido 1 segundo.','Haz lo mismo hacia lo agudo (puedes usar voz de cabeza).','Guarda el resultado.'],goal:'la app muestra tu rango y tu tipo de voz aproximado.'}),
  E({id:'l4-sirena',lesson:4,t:'Sirenas por tu pasaje',min:4,go:'#/practicar/ej/sirena',goL:'Abrir sirena',steps:['Abre el ejercicio «Sirena».','Desliza en «u» siguiendo la curva de la pantalla.','Al pasar por el pasaje, baja un poco el volumen en lugar de empujar.','Haz todas las rondas.'],goal:'la línea de tu voz sigue la curva sin cortes en la mayoría de las rondas.'}),
  {check:[['¿Qué es la tesitura?','La zona cómoda del medio de tu rango, donde puedes cantar mucho rato.'],['¿Cómo se siente la voz de pecho?','Como la de hablar: llena y vibrando en el pecho.'],['¿Qué haces al llegar al pasaje?','No empujar: aligerar la voz y bajar un poco el volumen.']]},
  {box:'Errores comunes',ul:['Medir el rango con notas gritadas o susurradas: solo cuentan las de buen sonido.','Querer llevar la voz de pecho lo más alto posible a fuerza.','Compararte con otros: cada voz es distinta.']},
  {trick:['Rango = grave a agudo con buen sonido.','Tesitura = tu zona cómoda.','Pecho = hablar; cabeza = búho.','En el pasaje, más ligero, no más fuerte.']}]},
{id:5,title:'Calentar y cuidar tu voz',sub:'Una rutina diaria',hue:26,lead:'La voz es un músculo pequeño y delicado. Calentarla antes de cantar y cuidarla el resto del día evita ronqueras y te deja avanzar más rápido.',
 motif:'<circle cx="50" cy="48" r="28"/><path d="M50 30v18l12 8"/>',
 blocks:[
  {aim:['Hacer un calentamiento completo en 10 minutos.','Saber qué ayuda y qué lastima a tu voz.','Reconocer cuándo parar.']},
  {step:'Paso 1',t:'El orden de un calentamiento',p:'De lo más suave a lo más exigente: 1) respiración, 2) trino de labios, 3) sirena, 4) escalas, 5) arpegios, 6) notas largas. Así primero despiertas el aire, luego la voz en todo su rango y al final la afinación fina. La pantalla «Calentamiento de hoy» de la app sigue este orden.'},
  {step:'Paso 2',t:'Hidratación',p:'Las cuerdas vocales vibran cientos de veces por segundo y necesitan estar húmedas. Toma agua a lo largo del día (no solo al cantar); el agua tarda horas en llegar a ellas. El café y el alcohol resecan. <b>Ejemplo:</b> si vas a cantar a las 7 de la noche, toma agua desde la mañana.'},
  {step:'Paso 3',t:'Qué evitar',p:'Gritar, carraspear (aclarar la garganta con fuerza), susurrar mucho rato y cantar enfermo o ronco. En vez de carraspear, traga saliva o toma agua. Si te duele al cantar, para: el dolor no es normal.'},
  {step:'Paso 4',t:'Descanso',p:'Igual que en el gimnasio, la voz mejora al descansar. Mejor 15 minutos diarios que 2 horas un solo día. Después de cantar mucho, haz unas sirenas suaves hacia abajo para «enfriar».'},
  {key:'Calienta siempre de suave a fuerte y de cómodo a extremo. Si algo duele o raspa, detente: cantar no debe doler.'},
  E({id:'l5-calent',lesson:5,t:'Calentamiento de hoy completo',min:10,go:'#/practicar/calentamiento',goL:'Abrir calentamiento',steps:['Abre «Calentamiento de hoy».','Haz los ejercicios en orden; cada uno se palomea al terminarlo.','Descansa 20 segundos entre ejercicios.','Al final, canta una canción a tu gusto.'],goal:'terminas los 6 pasos del calentamiento sin sentir la garganta cansada.'}),
  {check:[['¿Qué va primero en un calentamiento?','La respiración, y después el trino de labios.'],['¿Por qué tomar agua desde la mañana?','Porque el agua tarda horas en hidratar las cuerdas vocales.'],['¿Qué haces en vez de carraspear?','Tragar saliva o tomar agua.']]},
  {box:'Errores comunes',ul:['Empezar directo con las notas más agudas.','Cantar a todo volumen para calentar.','Seguir cantando con dolor o ronquera.']},
  {trick:['Respiración → trino → sirena → escala → arpegio → nota larga.','Agua todo el día.','Nada de gritar ni carraspear.','15 minutos diarios valen más que 2 horas un día.']}]}];
const lessonArt=i=>{const l=LESSONS.find(x=>x.id===i);return coverArt(l.hue,l.motif,i,'l'+i)};
const doneCount=l=>{const xs=ALLEX.filter(x=>!l||x.lesson===l);return[xs.filter(x=>DB.done[x.id]).length,xs.length]};
const nextEx=()=>ALLEX.find(x=>!DB.done[x.id]);
