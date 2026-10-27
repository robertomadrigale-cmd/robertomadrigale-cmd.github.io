/* Material original de Roka Bajo. Cada tupla = cuerda, traste, duración en pulsos. */
const P=rows=>rows.map(([s,f,d=1])=>({s,f,d}));
const E=o=>({type:'exercise',bpm:60,beats:4,...o,fig:{notes:P(o.notes),...(o.five?{five:P(o.five)}:{})}});
const LESSONS=[
{id:1,title:'Tu primer sonido',sub:'Postura y apagado de cuerdas',hue:220,blocks:[
 {aim:['Sostener el bajo sin cargar la muñeca.','Tocar una cuerda y apagar las demás.']},
 {step:'Paso 1',t:'Acomoda el instrumento',p:'La cuerda es el alambre que vibra; el mástil es la parte larga donde apoyas los dedos. Un traste es cada espacio entre las barras metálicas del mástil. Ajusta la correa para que el bajo no se caiga al soltar las manos. Mantén los hombros sueltos y la muñeca sin doblarla de más. Si algo duele, detente y reajusta.'},
 {step:'Paso 2',t:'Un sonido, luego silencio',p:'Pulsar significa jalar y soltar suavemente una cuerda con la yema. Al aire significa tocar sin pisar ningún traste: se escribe 0. Apagar es detener la vibración con un contacto suave. Ejemplo resuelto: pulsa Mi, la cuerda 4, al aire; apoya luego la yema sobre ella sin empujarla contra el mástil. Escucharás Mi y después silencio. Los números de cuerda se cuentan desde la más delgada: 1 Sol, 2 Re, 3 La, 4 Mi; en cinco cuerdas agregas 5 Si.'},
 {key:'Deja sonar solo la cuerda que elegiste. Apoya el pulgar en una cuerda más grave y los dedos libres sobre las que no tocas.'},
 E({id:'b1-apagar',t:'Mi y silencio',notes:[[4,0],[4,0],[4,0],[4,0]],steps:['Apoya el pulgar sin tensarlo.','Pulsa Mi con índice y medio alternados.','Apaga cada sonido antes del siguiente toque.'],goal:'Cuatro sonidos separados, sin zumbidos de otras cuerdas.'}),
 E({id:'b1-cuerdas',t:'Conoce tus cuerdas',notes:[[4,0],[3,0],[2,0],[1,0]],five:[[5,0],[4,0],[3,0],[2,0],[1,0]],steps:['Escucha el ejemplo.','Toca cada cuerda al aire en el orden mostrado.','Apaga la cuerda anterior al cambiar.'],goal:'Nombras las cuerdas y dejas sonar una a la vez.'}),
 E({id:'b1-turnos',t:'Sonido largo, silencio claro',notes:[[4,0,2],[3,0,2],[2,0,2],[1,0,2]],five:[[5,0,2],[4,0,2],[3,0,2],[2,0,2],[1,0,2]],steps:['Cuenta dos pulsos mientras suena cada cuerda.','Apaga justo antes de cambiar.','Comprueba que no quede otra cuerda vibrando.'],goal:'Sostienes cada nota y haces cuatro cambios limpios.'}),
 {check:[['¿Qué significa el traste 0?','Cuerda al aire: no presionas el mástil.'],['¿Cómo apagas una nota?','Toca la cuerda suavemente para detener su vibración.']]},
 {errors:['Apretar de más: usa solo la presión necesaria.','Levantar todos los dedos al cambiar: deja uno tocando la cuerda que debe callar.']},
 {trick:['Cuerda 1 = la más delgada, Sol.','Pulsa, escucha, apaga.','El micrófono califica altura y momento; revisa tú la postura y el apagado.']}
]},
{id:2,title:'Lee tu primera línea',sub:'Tablatura y dedos',hue:240,blocks:[
 {aim:['Leer cuerda y traste en una tablatura.','Ubicar cada dedo sin estirar de más.']},
 {step:'Paso 1',t:'Las líneas son cuerdas',p:'La tablatura es un dibujo de las cuerdas con números de traste. La línea de arriba es Sol, cuerda 1; la de abajo es Mi en cuatro cuerdas o Si en cinco. Se lee de izquierda a derecha. Un guion indica que no hay un nuevo toque en esa columna; aquí cada columna sigue la duración indicada en el paso a paso.'},
 {step:'Paso 2',t:'Un dedo por traste',p:'Dedo 1 = índice, 2 = medio, 3 = anular y 4 = meñique de la mano que pisa. Una posición es la zona del mástil que cubres sin mover esa mano. Ejemplo resuelto: en la cuerda Mi, posición 1, traste 1 con índice, 2 con medio, 3 con anular y 4 con meñique. El 0 no lleva dedo. Si el alcance es incómodo, mueve la mano; no fuerces la separación.'},
 {key:'El número grande es el traste; la insignia pequeña en el punto es el dedo.'},
 E({id:'b2-dedos',t:'Cuatro dedos',notes:[[4,1],[4,2],[4,3],[4,4]],steps:['Localiza la cuerda Mi.','Pisa junto a la barra metálica, sin quedar encima.','Sigue 1, 2, 3, 4 con la mano relajada.'],goal:'Lees cuatro números y eliges los dedos correspondientes.'}),
 E({id:'b2-tab',t:'Cambia de línea',notes:[[3,0],[3,2],[2,0],[2,2]],steps:['Lee primero la línea y después el número.','Toca La al aire y traste 2.','Pasa a Re al aire y traste 2.'],goal:'Cambias de cuerda sin confundirla con el traste.'}),
 E({id:'b2-escalera',t:'Escalera en dos cuerdas',notes:[[4,1],[4,2],[4,3],[4,4],[3,1],[3,2],[3,3],[3,4]],steps:['Lee los cuatro trastes de la cuerda Mi.','Cambia a La y repite la misma digitación.','Mueve solo lo necesario y conserva la mano relajada.'],goal:'Relacionas línea, traste y dedo en dos cuerdas.'}),
 {check:[['¿Un 3 en la línea La significa cuerda 3?','Significa traste 3 de la cuerda La; la línea identifica la cuerda.'],['¿Qué dedo usa una cuerda al aire?','Ninguno de la mano que pisa.']]},
 {errors:['Leer de abajo hacia arriba como una lista: sigue las columnas de izquierda a derecha.','Confundir dedo 4 con cuerda 4: revisa la leyenda.']},
 {trick:['Línea = cuerda; número = traste.','Los puntos muestran la nota y su dedo.','Usa Anterior y Siguiente para escuchar una nota a la vez.']}
]},
{id:3,title:'La raíz al pulso',sub:'Tu lugar dentro del grupo',hue:260,blocks:[
 {aim:['Mantener una velocidad estable.','Sostener la nota que da nombre al acorde.']},
 {step:'Paso 1',t:'Pulso, tempo y compás',p:'El pulso es el paso regular de la música. El tempo es su velocidad; bpm significa pulsos por minuto: a 60 bpm hay uno por segundo. Un compás agrupa pulsos; en 4/4 contamos 1, 2, 3, 4 y volvemos al 1. Una nota de un pulso se llama negra; de dos, blanca. El silencio es tiempo que cuentas sin tocar.'},
 {step:'Paso 2',t:'Encuentra la raíz',p:'Un acorde es un conjunto de notas que suenan juntas. Su raíz es la nota que le da nombre. El bajo puede sostener esa raíz mientras otros instrumentos completan el acorde. Ejemplo resuelto: para acompañar un acorde de La, toca La, cuerda 3 al aire, en cada número de la cuenta 1, 2, 3, 4.'},
 {key:'Primero cuenta parejo; después toca. Una sola nota a tiempo sostiene a toda la banda.'},
 E({id:'b3-raiz',t:'Cuatro pasos en La',notes:[[3,0],[3,0],[3,0],[3,0]],steps:['Escucha los cuatro pulsos de entrada.','Toca La en cada pulso.','Mantén la cuenta aunque una nota no salga.'],goal:'Aciertas al menos 80 % en una ronda.'}),
 E({id:'b3-largas',t:'Deja espacio',notes:[[3,0,2],[3,0,2],[4,0,2],[4,0,2]],steps:['Cuenta dos pulsos por nota.','La suena dos veces; luego cambia a Mi.','Apaga al llegar la nota siguiente.'],goal:'No aceleras cuando sostienes una nota.'}),
 E({id:'b3-cambios',t:'Raíces en cada pulso',notes:[[3,3],[3,3],[4,3],[4,3],[3,0],[3,0],[4,0],[4,0]],steps:['Cuenta dos Do, dos Sol, dos La y dos Mi.','Cambia de posición sin detener la cuenta.','Vuelve al pulso siguiente si una nota no sale.'],goal:'Mantienes ocho pulsos mientras cambias de raíz.'}),
 {check:[['¿Cuántos segundos dura un pulso a 60 bpm?','Un segundo.'],['¿Cuál es la raíz de un acorde de Mi?','Mi.']]},
 {errors:['Seguir una nota equivocada con prisa: regresa al pulso siguiente.','Tocar cada vez más fuerte: mantén una fuerza cómoda.']},
 {trick:['Cuenta de entrada = preparación antes de tocar.','4/4 = grupos de cuatro pulsos.','Una nota larga también necesita una cuenta estable.']}
]},
{id:4,title:'Raíz y quinta',sub:'Tololoche, ranchera y polka',hue:290,blocks:[
 {aim:['Encontrar una quinta desde una raíz.','Alternar dos notas en compases de tres y cuatro pulsos.']},
 {step:'Paso 1',t:'Mide el salto',p:'Un semitono es la distancia de un traste. Un tono son dos semitonos. Un intervalo es la distancia entre dos notas. La quinta justa está siete semitonos arriba de la raíz. Ejemplo resuelto: Sol, cuerda 4 traste 3, más siete semitonos es Re; lo encuentras en cuerda 3 traste 5. En cuerdas vecinas de este bajo, la quinta queda dos trastes adelante.'},
 {step:'Paso 2',t:'Alterna con intención',p:'El tololoche es un contrabajo acústico usado en música regional; aquí practicas su función con bajo eléctrico, sin imitar su timbre. En una polka puedes alternar raíz en 1 y quinta en 3 de un compás de cuatro pulsos. Una ranchera en vals agrupa tres pulsos: toca una nota en 1 y cuenta 2, 3; cambia de nota en el siguiente 1.'},
 {key:'Raíz y quinta forman una base clara. El compás decide cuándo alternarlas.'},
 E({id:'b4-polka',t:'Sol y Re',bpm:80,notes:[[4,3,2],[3,5,2],[4,3,2],[3,5,2]],steps:['Pon el dedo 1 en Sol, traste 3.','Toca Re con dedo 3, cuerda 3 traste 5.','Alterna cada dos pulsos.'],goal:'Cambias entre raíz y quinta sin perder la cuenta.'}),
 E({id:'b4-vals',t:'Ranchera en tres',beats:3,bpm:90,notes:[[3,0,3],[4,0,3],[3,0,3],[4,0,3]],steps:['Cuenta 1, 2, 3.','Toca La en el primer compás y Mi en el segundo.','Mi es la quinta de La en una altura más grave.'],goal:'Se siente el inicio de cada grupo de tres.'}),
 E({id:'b4-dos-pares',t:'Dos pares de raíz y quinta',bpm:76,notes:[[3,3,2],[2,5,2],[4,3,2],[3,5,2]],steps:['Toca Do y su quinta Sol.','Mueve la mano para tocar Sol grave y su quinta Re.','Da dos pulsos a cada nota.'],goal:'Reconoces la misma relación desde dos raíces.'}),
 {check:[['¿Cuántos semitonos separan raíz y quinta justa?','Siete hacia arriba.'],['Desde Sol en cuerda 4 traste 3, ¿dónde está Re?','Cuerda 3 traste 5.']]},
 {errors:['Tocar una nota en cada número del vals cuando buscas espacio: sostén tres pulsos.','Cambiar de cuerda sin apagar: evita que raíz y quinta se encimen.']},
 {trick:['Raíz = R. Quinta = 5.','En una cuerda: +7 trastes.','En la cuerda más aguda vecina: +2 trastes.']}
]},
{id:5,title:'Octavas y caminos cortos',sub:'Aproximaciones cromáticas',hue:315,blocks:[
 {aim:['Encontrar la misma nota más aguda.','Llegar a una raíz desde un traste vecino.']},
 {step:'Paso 1',t:'La misma nota en otra altura',p:'Una octava es el salto de doce semitonos: el nombre se repite, pero más agudo o más grave. Ejemplo resuelto: Sol en cuerda 4 traste 3 tiene su octava aguda en cuerda 2 traste 5. Los números pequeños de Mi1 o Sol2 indican la octava; no son dedos ni cuerdas.'},
 {step:'Paso 2',t:'Acércate por un semitono',p:'Cromático significa avanzar por semitonos. Una aproximación cromática es una nota vecina que conduce a la siguiente nota importante. Sostenido (♯) sube un semitono y bemol (♭) baja uno. Ejemplo resuelto: para llegar a La en cuerda 4 traste 5, toca Sol♯ en traste 4 justo antes y resuelve en La. Resolver significa llegar a la nota de destino.'},
 {key:'La nota de paso crea movimiento; la raíz de llegada debe escucharse clara.'},
 E({id:'b5-octava',t:'Sol abajo y arriba',notes:[[4,3],[2,5],[4,3],[2,5]],steps:['Localiza Sol grave con dedo 1.','Salta dos cuerdas a Sol agudo con dedo 3.','Apaga las cuerdas que atraviesas.'],goal:'Reconoces el mismo nombre en dos alturas.'}),
 E({id:'b5-croma',t:'Llega a La',notes:[[4,3],[4,4],[4,5,2],[4,4],[4,5,3]],steps:['Toca Sol, Sol♯ y La.','Sostén La dos pulsos.','Repite Sol♯ y termina en La durante tres pulsos.'],goal:'La llegada a La suena estable.'}),
 E({id:'b5-octava-la',t:'La en dos alturas',notes:[[4,5],[2,7],[4,5],[2,7]],steps:['Toca La grave en cuerda 4, traste 5.','Salta a La agudo en cuerda 2, traste 7.','Regresa sin dejar cuerdas abiertas sonando.'],goal:'Encuentras otra octava y conservas el mismo nombre de nota.'}),
 {check:[['¿Cuántos semitonos tiene una octava?','Doce.'],['¿Qué ocurre entre Mi y Fa?','Ya hay un semitono; Mi♯ suena como Fa. También Si♯ = Do, Fa♭ = Mi y Do♭ = Si. Son nombres equivalentes según el contexto.']]},
 {errors:['Quedarte en la nota cromática por accidente: recuerda el destino.','Confundir una octava con una cuerda vecina: salta dos cuerdas y dos trastes.']},
 {trick:['Octava: dos cuerdas más agudas y dos trastes adelante.','Cromático = de traste en traste.','Mi♯ = Fa · Si♯ = Do · Fa♭ = Mi · Do♭ = Si.']}
]},
{id:6,title:'Dibuja el acorde',sub:'Arpegios mayores y menores',hue:340,blocks:[
 {aim:['Tocar las notas de un acorde una por una.','Distinguir una tercera mayor de una menor.']},
 {step:'Paso 1',t:'Tercera y arpegio',p:'La tercera mayor está cuatro semitonos sobre la raíz; la tercera menor está tres. Una tríada es un acorde de tres notas: raíz, tercera y quinta. Mayor y menor describen qué tercera tiene. Un arpegio toca esas notas una tras otra. Ejemplo resuelto: Do mayor = Do, Mi, Sol. Desde Do en cuerda 3 traste 3, Mi está en cuerda 2 traste 2 y Sol en cuerda 2 traste 5.'},
 {step:'Paso 2',t:'Cambia una sola nota',p:'Do menor = Do, Mi♭, Sol: baja la tercera un traste, de Mi a Mi♭, y conserva raíz y quinta. En la posición 1, el dedo 1 toca traste 1 y el 3 toca traste 3. Si una nota queda fuera de los cuatro trastes de tu posición, desplaza la mano completa; el paso a paso muestra el dedo nuevo.'},
 {key:'La tercera decide si esta tríada es mayor o menor. La raíz y la quinta siguen iguales.'},
 E({id:'b6-mayor',t:'Do mayor',notes:[[3,3],[2,2],[2,5],[3,3]],steps:['Di Do, Mi, Sol, Do.','Escucha el arpegio.','Toca cada nota y cambia de posición al llegar a traste 5.'],goal:'Ubicas raíz, tercera mayor y quinta.'}),
 E({id:'b6-menor',t:'Do menor',notes:[[3,3],[2,1],[2,5],[3,3]],steps:['Baja Mi un traste: ahora es Mi♭.','Conserva Do y Sol.','Compara con el ejercicio anterior.'],goal:'Cambias el carácter del acorde moviendo solo la tercera.'}),
 E({id:'b6-terceras',t:'Compara las terceras',notes:[[3,3],[2,2],[3,3],[2,1],[3,3,2]],steps:['Toca Do y Mi para escuchar la tercera mayor.','Vuelve a Do y toca Mi♭ para escuchar la menor.','Termina en Do y sostén dos pulsos.'],goal:'Distingues cuál nota cambia entre mayor y menor.'}),
 {check:[['¿Qué diferencia hay entre acorde y arpegio?','En el acorde pueden sonar juntas sus notas; en el arpegio las tocas una a una.'],['¿Qué tercera tiene Do menor?','Mi♭, a tres semitonos de Do.']]},
 {errors:['Estirar para evitar todo cambio: mueve la mano con calma.','Bajar también la quinta al pasar a menor: solo cambia la tercera.']},
 {trick:['Mayor: 0, 4, 7 semitonos desde la raíz.','Menor: 0, 3, 7.','Toca una nota a la vez y escucha la diferencia.']}
]},
{id:7,title:'Un mapa para moverte',sub:'Escalas y caja pentatónica',hue:190,blocks:[
 {aim:['Construir una escala mayor.','Usar cinco notas dentro de una zona cómoda.']},
 {step:'Paso 1',t:'La receta de la escala',p:'Una escala es una familia de notas ordenadas por altura. La escala mayor usa saltos de 2, 2, 1, 2, 2, 2, 1 semitonos. Un grado es el lugar de una nota dentro de esa familia: primero, segundo, tercero. Ejemplo resuelto: desde Do obtienes Do, Re, Mi, Fa, Sol, La, Si y Do. Una tonalidad es el conjunto de notas organizado alrededor de una nota principal, como Do mayor.'},
 {step:'Paso 2',t:'Cinco notas en una caja',p:'Pentatónica significa escala de cinco notas. La pentatónica menor de La contiene La, Do, Re, Mi y Sol: distancias 0, 3, 5, 7 y 10 semitonos desde La. Una caja es una manera de distribuirlas por cuerdas dentro de pocos trastes. Ejemplo resuelto: La y Do en cuerda 4 trastes 5 y 8; Re y Mi en cuerda 3 trastes 5 y 7; Sol y La en cuerda 2 trastes 5 y 7.'},
 {key:'La caja es un mapa, no una obligación de tocar todas las notas en cada frase.'},
 E({id:'b7-mayor',t:'Escala de Do',notes:[[3,3],[3,5],[2,2],[2,3],[2,5],[1,2],[1,4],[1,5]],steps:['Escucha y di los nombres.','Toca lento; mueve la mano cuando lo indique el dedo.','Vuelve a escuchar si dudas de un salto.'],goal:'Reconoces los dos semitonos: Mi–Fa y Si–Do.'}),
 E({id:'b7-penta',t:'Caja de La menor',notes:[[4,5],[4,8],[3,5],[3,7],[2,5],[2,7]],steps:['Empieza con dedo 1 en traste 5.','Usa dedo 4 en traste 8 y dedo 3 en traste 7.','Al llegar a La agudo, apaga y respira.'],goal:'Tocas la caja sin perder la posición.'}),
 E({id:'b7-mayor-baja',t:'Escala de Do al regresar',notes:[[1,5],[1,4],[1,2],[2,5],[2,3],[2,2],[3,5],[3,3]],steps:['Empieza en Do agudo.','Di Si, La, Sol, Fa, Mi y Re mientras bajas.','Termina en Do grave sin acelerar.'],goal:'Recorres la escala mayor en sentido descendente.'}),
 {check:[['¿Cuántas notas distintas tiene una pentatónica?','Cinco; la octava repite el nombre de la raíz.'],['¿La receta mayor cambia al empezar en Sol?','No. Mantiene los mismos saltos desde la nueva raíz.']]},
 {errors:['Memorizar solo los dedos: di también los nombres.','Correr al subir: usa un tempo que permita notas limpias.']},
 {trick:['Mayor: 2–2–1–2–2–2–1.','Pentatónica menor: raíz, +3, +5, +7, +10.','Un patrón cambia de tono al mover todas sus notas la misma distancia.']}
]},
{id:8,title:'El ritmo de cada género',sub:'Siete formas de acompañar',hue:205,blocks:[
 {aim:['Distinguir dónde empieza cada nota.','Probar siete líneas originales con su intención rítmica.']},
 {step:'Paso 1',t:'Parte el pulso',p:'Una corchea dura medio pulso. Cuenta «1 y 2 y 3 y 4 y»: los números caen en el pulso y las «y» entre pulsos. Una síncopa pone énfasis entre pulsos o sostiene una nota a través del siguiente. Groove es el patrón de notas, silencios y acentos que se repite y da movimiento.'},
 {step:'Paso 2',t:'Escucha antes de copiar',p:'Ejemplo resuelto de cumbia: La dura un pulso y medio, Mi medio, luego Mi un pulso y medio y La agudo medio. Cuenta los ocho medios pulsos para saber dónde cambiar. Son propuestas para practicar: cada región y cada grupo puede usar variantes. En Tocar con la banda puedes cambiar el género y escuchar sus demás instrumentos.'},
 {key:'El género no depende solo de las notas: importa cuánto duran y dónde entran.'},
 E({id:'b8-cumbia',t:'Cumbia: ida y vuelta',bpm:85,notes:[[3,0,1.5],[2,2,.5],[2,2,1.5],[1,2,.5]],steps:['Cuenta números y «y».','Entra en La; cambia a Mi después de «2».','Termina con La agudo justo antes del nuevo 1.'],goal:'Mantienes los cambios de un pulso y medio.'}),
 E({id:'b8-banda',t:'Banda: raíz y quinta',bpm:100,notes:[[4,3,2],[3,5,2],[4,3,2],[3,5,2]],steps:['Piensa en un apoyo firme en 1.','Alterna Sol y Re en 1 y 3.','Deja espacio para los metales.'],goal:'Sostienes el patrón sin añadir notas.'}),
 E({id:'b8-norteno',t:'Norteño: regreso a la raíz',bpm:100,notes:[[4,3,2],[3,5],[4,2],[4,3,4]],steps:['Toca Sol y luego Re.','Usa Fa♯, traste 2, para acercarte a Sol.','Llega a Sol en el inicio del siguiente compás.'],goal:'La aproximación desemboca en la raíz.'}),
 E({id:'b8-rock',t:'Rock: ocho motores',bpm:90,notes:Array.from({length:8},()=>[4,0,.5]),steps:['Alterna índice y medio.','Toca en cada número y cada «y».','Busca la misma fuerza en todos los golpes.'],goal:'Ocho Mi constantes sin acelerarte.'}),
 E({id:'b8-balada',t:'Balada: deja respirar',bpm:68,notes:[[3,3,4],[4,3,4],[3,0,4],[4,1,4]],steps:['Toca Do y cuenta cuatro.','Sigue Sol, La y Fa, cuatro pulsos cada uno.','Apaga antes del siguiente cambio.'],goal:'Cuatro notas largas con entradas claras.'}),
 E({id:'b8-reggaeton',t:'Reggaetón: base firme',bpm:85,notes:[[3,0,2],[3,0],[2,2],[3,0,2],[3,0],[2,2]],steps:['Sostén La durante 1 y 2.','Repite La en 3 y toca Mi en 4.','Deja que la batería de la banda complete el patrón.'],goal:'Distingues una nota larga de dos cortas.'}),
 E({id:'b8-bossa',t:'Bossa: llegada anticipada',bpm:90,notes:[[3,3,1.5],[4,3,.5],[3,3,1.5],[4,3,.5]],steps:['Toca Do en 1 y Sol en «2 y».','Regresa a Do en 3.','Sol entra en «4 y», sin empujar el tempo.'],goal:'Las anticipaciones llegan entre pulsos.'}),
 {check:[['¿Cuánto dura una corchea aquí?','Medio pulso.'],['¿Qué debes cambiar para pasar de balada a rock?','La duración y repetición de las notas, además de la intención y el tempo; no basta cambiar sus nombres.']]},
 {errors:['Tocar la «y» pegada al número: divídelo en dos mitades iguales.','Subir el tempo antes de comprender el patrón: escucha y cuenta primero.']},
 {trick:['Negra = 1 pulso; corchea = 0.5.','Cuenta «1 y 2 y 3 y 4 y».','Prueba la banda sin bajo y luego activa la referencia.']}
]},
{id:9,title:'Camina entre acordes',sub:'Walking bass básico',hue:170,blocks:[
 {aim:['Crear una nota por pulso.','Conectar dos raíces con un camino corto.']},
 {step:'Paso 1',t:'Una caminata regular',p:'Walking bass significa bajo caminante: una línea que avanza normalmente con una nota por pulso y conecta los acordes. Comienza por notas del arpegio; después agrega notas de la escala o aproximaciones. No necesitas llenar cada espacio con un salto grande.'},
 {step:'Paso 2',t:'Decide primero a dónde llegas',p:'Ejemplo resuelto: un compás de Do mayor seguido de Fa mayor. Toca Do, Mi, Sol y Mi en el primer compás. Ese último Mi queda un semitono debajo de Fa y prepara la llegada. En el segundo toca Fa, La, Do y Si; Si prepara el regreso a Do. Es una línea original para practicar, no una regla única.'},
 {key:'La raíz en el primer pulso aclara el acorde; el último pulso puede preparar el siguiente.'},
 E({id:'b9-caminar',t:'De Do a Fa y de regreso',bpm:65,notes:[[3,3],[2,2],[2,5],[2,2],[2,3],[1,2],[1,5],[1,4],[3,3,4]],steps:['Cuenta cuatro notas por compás.','Escucha Mi acercándose a Fa.','Escucha Si acercándose a Do.'],goal:'Llegas a las raíces sin perder el pulso.'}),
 E({id:'b9-corto',t:'Un camino hacia Sol',notes:[[3,3],[2,2],[2,3],[2,4],[2,5,4]],steps:['Toca Do, Mi y Fa.','Agrega Fa♯ como aproximación.','Resuelve en Sol y sostén cuatro pulsos.'],goal:'Distingues el paso cromático de la llegada.'}),
 E({id:'b9-la-re',t:'De La hacia Re',bpm:65,notes:[[3,0],[3,2],[3,4],[2,0,4]],steps:['Empieza en La.','Camina por Si y Do♯, una nota por pulso.','Llega a Re en el siguiente inicio y sostén cuatro pulsos.'],goal:'Preparas una raíz nueva con un camino corto y regular.'}),
 {check:[['¿Por qué funciona Mi antes de Fa?','Está un semitono abajo y conduce a la raíz siguiente.'],['¿Debes tocar siempre notas distintas?','No. Repetir una nota también puede mantener una línea clara.']]},
 {errors:['Elegir notas sin pensar en el siguiente acorde: decide primero la llegada.','Acelerar en el paso cromático: cada nota conserva un pulso.']},
 {trick:['Inicio del compás: raíz clara.','Centro: notas del acorde o escala.','Final: prepara el siguiente inicio.']}
]},
{id:10,title:'Haz tu propia respuesta',sub:'Improvisación con intención',hue:320,blocks:[
 {aim:['Crear una frase breve con pocas notas.','Escuchar y responder sin llenar todo.']},
 {step:'Paso 1',t:'Una idea que se reconoce',p:'Improvisar es elegir notas y ritmos mientras tocas. Una frase es una idea musical con inicio y final. Un motivo es una idea corta que puedes repetir o variar. Ejemplo resuelto en La menor: La, Do, Mi, La. Repite esa idea y después cambia el último La por Sol antes de volver a La.'},
 {step:'Paso 2',t:'Pregunta y respuesta',p:'Toca una frase de cuatro pulsos como pregunta; contesta con otra que termine en la raíz. Un silencio también es una respuesta: apaga las cuerdas y cuenta sin tocar. La práctica calificada de abajo tiene notas fijas para comprobar el mapa. Después abre Tocar con la banda, elige La menor y cumbia, y crea tu propia frase sin calificación automática.'},
 {key:'Una buena respuesta puede usar menos notas. Escucha al resto del grupo y regresa a la raíz.'},
 E({id:'b10-pregunta',t:'Una pregunta en La',notes:[[4,5],[4,8],[3,7],[2,7]],steps:['Toca La, Do, Mi y La agudo.','Escucha el final.','Repite buscando el mismo ritmo.'],goal:'Puedes recordar una frase de cuatro notas.'}),
 E({id:'b10-respuesta',t:'Cambia el final',notes:[[4,5],[4,8],[2,5],[4,5]],steps:['Conserva La y Do del inicio.','Responde con Sol y La grave.','Al terminar, cuenta un compás en silencio antes de repetir.'],goal:'Reconoces la variación y la vuelta a la raíz.'}),
 E({id:'b10-motivo',t:'Repite y cambia una nota',notes:[[4,5],[4,8],[3,7],[4,5],[4,5],[4,8],[2,5],[4,5]],steps:['Toca La, Do, Mi y La como primera frase.','Repite el inicio La, Do.','Cambia Mi por Sol y vuelve a La.'],goal:'Conservas un motivo reconocible y varías una sola nota.'}),
 {check:[['¿Improvisar exige tocar muchas notas?','No. Elige pocas, escucha y deja espacio.'],['¿Por qué empezar con una frase fija?','Te permite conocer el mapa y el pulso antes de elegir variantes.']]},
 {errors:['Cambiar todas las notas a la vez: conserva una parte del motivo.','Tocar encima de todo: deja espacio para quien lleva la melodía.']},
 {trick:['Escucha → repite → cambia una cosa.','Termina en la raíz para una respuesta estable.','El reto mide precisión; la música también necesita intención y escucha.']}
]}
];
const ALLEX=LESSONS.flatMap(l=>l.blocks.filter(b=>b.type==='exercise').map(x=>Object.assign(x,{lesson:l.id})));
const CHALLENGES=[['cumbia','Patio de cumbia','b8-cumbia'],['banda','Paso de banda','b8-banda'],['norteno','Camino norteño','b8-norteno'],['rock','Motor de cuatro cuerdas','b8-rock'],['reggaeton','Pulso de noche','b8-reggaeton'],['bossa','Vuelta suave','b8-bossa']].map(([id,t,ex])=>({id,t,ex:ALLEX.find(x=>x.id===ex)}));
