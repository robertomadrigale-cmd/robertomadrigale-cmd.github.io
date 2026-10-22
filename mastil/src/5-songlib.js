/* ---------- cancionero: canciones de dominio público (letra y acordes completos) ---------- */
const TRAD=[
`{title:Cielito lindo}{artist:Quirino Mendoza y Cortés · 1882}{key:D}{bpm:150}{time:3/4}{style:ranchera}{bpl:2}
{c:Estrofa}
[D]De la Sierra Morena, cie[A7]lito lindo,
vienen ba[D]jando
un par de ojitos [D7]negros, cie[G]lito lindo,
de contra[A7]bando.
{c:Coro}
[D]¡Ay, ay, ay, ay! [A7]Canta y no llores,
porque cantando se alegran, cie[D]lito lindo, los corazones.
[D]¡Ay, ay, ay, ay! [A7]Canta y no llores,
porque cantando se alegran, cie[D]lito lindo, los corazones.
{c:Estrofa}
[D]Ese lunar que tienes, cie[A7]lito lindo,
junto a la [D]boca,
no se lo des a [D7]nadie, cie[G]lito lindo,
que a mí me [A7]toca.
{c:Coro}
[D]¡Ay, ay, ay, ay! [A7]Canta y no llores,
porque cantando se alegran, cie[D]lito lindo, los corazones.
{c:Estrofa}
[D]Una flecha en el aire, cie[A7]lito lindo,
lanzó Cu[D]pido;
él la lanzó ju[D7]gando, cie[G]lito lindo,
y yo fui el he[A7]rido.
{c:Coro}
[D]¡Ay, ay, ay, ay! [A7]Canta y no llores,
porque cantando se alegran, cie[D]lito lindo, los corazones.`,
`{title:La cucaracha}{artist:Tradicional mexicana}{key:C}{bpm:120}{time:4/4}{style:ranchera}{bpl:2}
{c:Coro}
La cuca[C]racha, la cucaracha,
ya no puede cami[G7]nar,
porque no tiene, porque le falta,
las dos patitas de a[C]trás.
La cuca[C]racha, la cucaracha,
ya no puede cami[G7]nar,
porque no tiene, porque le falta,
las dos patitas de a[C]trás.
{c:Estrofa}
Ya mu[C]rió la cucaracha,
ya la llevan a ente[G7]rrar,
entre cuatro zopilotes
y un ratón de sacris[C]tán.
{c:Coro}
La cuca[C]racha, la cucaracha,
ya no puede cami[G7]nar,
porque no tiene, porque le falta,
las dos patitas de a[C]trás.`,
`{title:De colores}{artist:Tradicional}{key:G}{bpm:132}{time:3/4}{style:vals}{bpl:4}
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
`{title:La bamba}{artist:Son jarocho tradicional}{key:C}{bpm:150}{time:4/4}{style:son}{bpl:1}{cpb:0.5}
[C]Para bai[F]lar la [G]bamba,
[C]para bai[F]lar la [G]bamba
se nece[C]sita una [F]poca de [G]gracia,
una [C]poca de [F]gracia pa' mí, pa' [G]ti,
¡y a[C]rriba y a[F]rriba! [G]
¡y a[C]rriba y a[F]rriba, por [G]ti seré,
por [C]ti se[F]ré, por [G]ti seré!
[C]Yo no soy [F]mari[G]nero,
[C]yo no soy [F]mari[G]nero,
soy [C]capi[F]tán, soy [G]capitán,
soy [C]capi[F]tán. [G]
[C]Bamba, [F]bam[G]ba, [C]bamba, [F]bam[G]ba,
[C]bamba, [F]bam[G]ba, [C]bamba, [F]bam[G]ba.`,
`{title:La llorona}{artist:Tradicional del Istmo de Tehuantepec}{key:Am}{bpm:96}{time:3/4}{style:vals}{bpl:2}
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
`{title:La Adelita}{artist:Corrido de la Revolución · tradicional}{key:G}{bpm:120}{time:3/4}{style:ranchera}{bpl:4}
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
`{title:Las mañanitas}{artist:Tradicional mexicana}{key:D}{bpm:100}{time:3/4}{style:vals}{bpl:4}
[D]Estas son las mañanitas que can[A7]taba el rey David,
hoy por ser día de tu santo te las can[D]tamos a ti.
[D]Despierta, mi bien, despierta, mira que [A7]ya amaneció,
ya los pajarillos cantan, la [D]luna ya se metió.

[D]Qué linda está la mañana en que [A7]vengo a saludarte,
venimos todos con gusto y placer a feli[D]citarte.
[D]El día en que tú naciste na[A7]cieron todas las flores,
y en la pila del bautismo can[D]taron los ruiseñores.

[D]Ya viene amaneciendo, ya la [A7]luz del día nos dio,
levántate de mañana, mira que [D]ya amaneció.`,
`{title:Cumpleaños feliz}{artist:Tradicional}{key:C}{bpm:100}{time:3/4}{style:vals}{pickup:1}
[C]Cum~ple~a~ños fe~[G7]liz,
{mel:G4/.75 G4/.25 A4/1 G4/1 C5/1 B4/2}
te de~[G7]sea~mos a [C]ti,
{mel:G4/.75 G4/.25 A4/1 G4/1 D5/1 C5/2}
cum~ple~[C7]a~ños, a~[F]mi~go,
{mel:G4/.75 G4/.25 G5/1 E5/1 C5/1 B4/1 A4/1}
cum~ple~[C]a~ños [G7]fe~[C]liz.
{mel:F5/.75 F5/.25 E5/1 C5/1 D5/1 C5/3}`,
`{title:Estrellita, ¿dónde estás?}{artist:Tradicional}{key:C}{bpm:96}{time:4/4}{style:folk}
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
`{title:Amazing Grace}{artist:John Newton · 1779}{key:G}{bpm:84}{time:3/4}{style:balada}{pickup:1}
A~[G]ma~zing grace! How [C]sweet the [G]sound
{mel:D4/1 G4/2 B4/.5 +G4/.5 B4/2 A4/1 G4/2 E4/1 D4/2}
that [G]saved a [Em]wretch like [D]me!
{mel:D4/1 G4/2 B4/.5 +G4/.5 B4/2 A4/1 D5/2}
I [G]once was lost, but [C]now am [G]found,
{mel:B4/1 D5/2 B4/.5 +G4/.5 B4/2 A4/1 G4/2 E4/1 D4/2}
was [Em]blind, but [D]now I [G]see.
{mel:D4/1 G4/2 B4/.5 +G4/.5 B4/2 A4/1 G4/3}

'Twas [G]grace that taught my [C]heart to [G]fear,
{mel:D4/1 G4/2 B4/.5 +G4/.5 B4/2 A4/1 G4/2 E4/1 D4/2}
and [G]grace my [Em]fears re~[D]lieved;
{mel:D4/1 G4/2 B4/.5 +G4/.5 B4/2 A4/1 D5/2}
how [G]pre~cious did that [C]grace ap~[G]pear
{mel:B4/1 D5/2 B4/.5 +G4/.5 B4/2 A4/1 G4/2 E4/1 D4/2}
the [Em]hour I [D]first be~[G]lieved.
{mel:D4/1 G4/2 B4/.5 +G4/.5 B4/2 A4/1 G4/3}`,
`{title:Arroz con leche}{artist:Tradicional}{key:C}{bpm:120}{time:3/4}{style:vals}{bpl:2}
[C]Arroz con leche, me quiero ca[G7]sar
con una señorita de San Nico[C]lás,
que sepa co[C7]ser, que sepa bor[F]dar,
que sepa a[G7]brir la puerta para ir a ju[C]gar.
[C]Con ésta sí, con ésta [G7]no,
con esta señorita me [C]caso yo.`,
`{title:Los pollitos dicen}{artist:Tradicional}{key:C}{bpm:100}{time:4/4}{style:folk}{bpl:2}
[C]Los pollitos dicen pío, pío, [G7]pío,
cuando tienen hambre, cuando tienen [C]frío.
[C]La gallina busca el maíz y el [G7]trigo,
les da la comida y les presta a[C]brigo.
[C]Bajo sus dos alas, acurruca[G7]ditos,
hasta el otro día duermen los po[C]llitos.`,
`{title:Naranja dulce}{artist:Tradicional}{key:Am}{bpm:100}{time:4/4}{style:folk}{bpl:2}
[Am]Naranja dulce, limón par[E7]tido,
dame un abrazo que yo te [Am]pido.
[Am]Si fueran falsos mis jura[E7]mentos,
en otros tiempos se olvida[Am]rán.
[A7]Toca la marcha, mi pecho [Dm]llora,
a[E7]diós, señora, yo ya me [Am]voy.`,
`{title:Noche de paz}{artist:Franz Gruber · 1818 · versión en español}{key:C}{bpm:84}{time:3/4}{style:balada}{bpl:2}
[C]Noche de paz, noche de a[C]mor,
[G7]todo duerme en derre[C]dor.
[F]Entre los astros que esparcen su [C]luz,
[F]bella anunciando al niñito Je[C]sús,
[G7]brilla la estrella de [C]paz,
[C]brilla la [G7]estrella de [C]paz.`,
`{title:The House of the Rising Sun}{artist:Folk tradicional estadounidense}{key:Am}{bpm:116}{time:3/4}{style:balada}{bpl:1}
There [Am]is a [C]house in [D]New Or[F]leans
they [Am]call the [C]Rising [E]Sun, [E]
and it's [Am]been the [C]ruin of [D]many a poor [F]boy,
and [Am]God, I [E]know I'm [Am]one. [E]

My [Am]mother [C]was a [D]tailor, [F]
she [Am]sewed my [C]new blue [E]jeans; [E]
my [Am]father [C]was a [D]gambling [F]man
[Am]down in [E]New Or[Am]leans. [E]`,
`{title:When the Saints Go Marching In}{artist:Espiritual tradicional}{key:G}{bpm:120}{time:4/4}{style:folk}{bpl:2}
Oh, when the [G]saints go marching in,
oh, when the saints go marching [D7]in,
Lord, how I [G]want to [G7]be in that [C]number,
when the [G]saints go [D7]marching [G]in.

Oh, when the [G]sun refuse to shine,
oh, when the sun refuse to [D7]shine,
Lord, how I [G]want to [G7]be in that [C]number,
when the [G]sun re[D7]fuse to [G]shine.`,
`{title:Oh! Susanna}{artist:Stephen Foster · 1848}{key:C}{bpm:120}{time:4/4}{style:folk}{bpl:2}
I [C]come from Alabama with my banjo on my [G7]knee,
I'm [C]going to Louisiana, my [G7]true love for to [C]see.
{c:Coro}
[F]Oh, Su[F]sanna, [C]oh don't you cry for [G7]me,
for I [C]come from Alabama with my [G7]banjo on my [C]knee.`,
`{title:Jingle Bells}{artist:James Lord Pierpont · 1857}{key:G}{bpm:120}{time:4/4}{style:folk}{bpl:2}
[G]Dashing through the snow in a one-horse open [C]sleigh,
[Am]o'er the fields we [D7]go, laughing all the [G]way.
[G]Bells on bobtail ring, making spirits [C]bright,
what [Am]fun it is to [D7]ride and sing a sleighing song to[G]night! [D7]
{c:Coro}
Oh, [G]jingle bells, jingle bells, jingle all the way!
[C]Oh, what fun it [G]is to ride in a [A7]one-horse open [D7]sleigh, hey!
[G]Jingle bells, jingle bells, jingle all the way!
[C]Oh, what fun it [G]is to ride in a [D7]one-horse open [G]sleigh!`,
`{title:Auld Lang Syne}{artist:Robert Burns · 1788}{key:G}{bpm:88}{time:4/4}{style:balada}{bpl:2}
Should [G]auld acquaintance be for[D7]got,
and [G]never brought to [C]mind?
Should [G]auld acquaintance be for[D7]got,
and [Em]auld [C]lang [D7]syne? [G]
{c:Coro}
For [G]auld lang syne, my [D7]dear,
for [G]auld lang [C]syne,
we'll [G]take a cup o' kindness [D7]yet,
for [Em]auld [C]lang [D7]syne. [G]`,
`{title:Clementine}{artist:Balada tradicional estadounidense}{key:G}{bpm:120}{time:3/4}{style:vals}{bpl:2}
In a [G]cavern, in a canyon,
excavating for a [D7]mine,
dwelt a [D7]miner, forty-niner,
and his [G]daughter Clemen[D7]tine. [G]
{c:Coro}
Oh my [G]darling, oh my darling,
oh my darling Clemen[D7]tine,
you are [D7]lost and gone forever,
dreadful [G]sorry, Clemen[D7]tine. [G]`,
`{title:Red River Valley}{artist:Folk tradicional}{key:G}{bpm:96}{time:4/4}{style:folk}{bpl:2}
From this [G]valley they say you are going,
we will miss your bright eyes and sweet [D7]smile,
for they [G]say you are taking the [C]sunshine
that has [G]brightened our [D7]pathway a [G]while.
{c:Coro}
Come and [G]sit by my side if you love me,
do not hasten to bid me a[D7]dieu,
but re[G]member the Red River [C]Valley,
and the [G]cowboy who [D7]loved you so [G]true.`,
`{title:Michael, Row the Boat Ashore}{artist:Espiritual tradicional}{key:C}{bpm:100}{time:4/4}{style:folk}{bpl:2}
[C]Michael, row the boat a[F]shore, Halle[C]lujah!
Michael, row the boat a[G7]shore, Halle[C]lujah!
[C]Sister, help to trim the [F]sail, Halle[C]lujah!
Sister, help to trim the [G7]sail, Halle[C]lujah!
[C]The river is deep and the [F]river is wide, Halle[C]lujah!
Milk and honey on the [G7]other side, Halle[C]lujah!`,
`{title:Kumbaya}{artist:Espiritual tradicional}{key:C}{bpm:76}{time:4/4}{style:balada}{bpl:2}
[C]Kumbaya, my Lord, [F]kumba[C]ya,
kumbaya, my Lord, [Dm]kumba[G7]ya,
[C]kumbaya, my Lord, [F]kumba[C]ya,
oh [F]Lord, [C]kumba[G7]ya. [C]
[C]Someone's singing, Lord, [F]kumba[C]ya,
someone's singing, Lord, [Dm]kumba[G7]ya,
[C]someone's singing, Lord, [F]kumba[C]ya,
oh [F]Lord, [C]kumba[G7]ya. [C]`,
`{title:Scarborough Fair}{artist:Balada inglesa tradicional}{key:Am}{bpm:100}{time:3/4}{style:balada}{bpl:2}
[Am]Are you going to [G]Scarborough [Am]Fair?
[C]Parsley, [Am]sage, rose[D]mary and [Am]thyme.
Re[Am]member me to [C]one who lives [G]there,
[Am]she once was a [G]true love of [Am]mine.

[Am]Tell her to make me a [G]cambric [Am]shirt,
[C]parsley, [Am]sage, rose[D]mary and [Am]thyme,
with[Am]out no seams nor [C]needle[G]work,
[Am]then she'll be a [G]true love of [Am]mine.`];
/* ---------- las 100: tono, tempo y progresión principal (sin letra: tiene derechos de autor) ---------- */
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
function topSrc(x){const bars=x.prog.split(' ').map(c=>'['+c+']').join(' ');return`{title:${x.t}}{artist:${x.a} · ${x.y}}{key:${x.k}}{bpm:${x.bpm}}{bpl:1}
{c:Progresión principal}
${bars}
${bars}
${bars}
${bars}`}
