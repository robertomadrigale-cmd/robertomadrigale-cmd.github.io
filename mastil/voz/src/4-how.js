/* ---------- «Cómo se hace»: qué hacer en cada ejercicio, explicado como lo haría un coach ----------
   mouth = animación de la boca (mouthSVG), steps = 2–3 pasos cortos, listen = qué vas a oír en el ejemplo. */
const HOW={
 respira:{mouth:'ss',steps:['Inhala por la nariz 4 tiempos: se infla la panza, no los hombros.','Sostén el aire 4 tiempos sin apretar la garganta.','Suéltalo 8 tiempos con una «sss» suave y pareja.'],listen:'Sigue el círculo: crece al inhalar y se encoge al soltar.'},
 eco:{mouth:'ma',steps:['Escucha la nota completa sin cantar.','Imagínala en tu cabeza un segundo.','Cántala con «ma», suave, hasta que la línea verde entre en la barra.'],listen:'Una sola nota de piano. Cada ronda es una nota distinta.'},
 larga:{mouth:'ma',steps:['Escucha la nota y toma aire por la nariz.','Canta «maaa» y sostenla toda la barra.','Que no suba ni baje: mantén el mismo aire hasta el final.'],listen:'Una nota larga de 4 tiempos.'},
 trino:{mouth:'lips',steps:['Junta los labios sueltos, sin apretarlos.','Sopla para que vibren como motor: «brrr».','Sin dejar de vibrar, sube y baja las 5 notas como en el ejemplo.'],listen:'Cinco notas que suben y bajan, con el sonido «brrr».',fix:'Si los labios no vibran, empuja suave tus mejillas con dos dedos.'},
 sirena:{mouth:'u',steps:['Haz una «u» como si fueras a soplar una vela.','Desliza la voz de grave a agudo, sin saltos, como sirena.','Arriba, deja que el sonido se haga ligero y regresa despacio.'],listen:'Una «uuu» que sube una octava y baja.'},
 tres:{mouth:'u',steps:['Escucha las 3 notas: suben y regresan.','Cántalas con «no», unidas, sin cortar el aire.','Mantén la boca redonda en las tres.'],listen:'Do, re, mi, re, do.'},
 escala:{mouth:'u',steps:['Escucha las 5 notas que suben y bajan.','Cántalas con «no», pegaditas una a otra.','Toma aire antes de empezar, no a la mitad.'],listen:'Cinco notas: suben y regresan.'},
 arpegio3:{mouth:'i',steps:['Escucha los saltos: la nota de abajo, la del medio y la de arriba.','Canta «ia» saltando a cada nota, sin resbalar.','Piensa cada nota antes de cantarla.'],listen:'Tres notas con saltos: 1, 3, 5 y regresa.'},
 terceras:{mouth:'i',steps:['Escucha el patrón: salta y baja un poquito.','Canta «mi» con la sonrisa suelta.','Sigue las barras una por una, sin prisa.'],listen:'Saltos cortos de tercera que suben.'},
 staccato:{mouth:'ja',steps:['Pon una mano en tu panza.','Canta cada «ja» corto, como risa: cada uno es un empujoncito de la panza.','Entre notas, silencio: la garganta queda quieta.'],listen:'Notas cortas y separadas: ja, ja, ja.'},
 crescendo:{mouth:'a',steps:['Escucha la nota y toma buen aire.','Empieza la «aaa» suave y crece poco a poco.','Crece en volumen, no en tono: la línea debe seguir en la barra.'],listen:'Una nota larga de 6 tiempos.'},
 arpegio:{mouth:'i',steps:['Escucha el salto grande hasta la nota de arriba.','Canta «ia» y prepara el salto desde abajo.','Arriba no estires el cuello: piensa la nota antes.'],listen:'1, 3, 5, 8 y regresa: un salto de octava.'},
 quintas:{mouth:'a',steps:['Escucha los saltos de quinta.','Canta «mo» brincando entre las dos notas.','Que el salto sea limpio, sin resbalar en medio.'],listen:'Saltos grandes que van y vuelven.'},
 nueve:{mouth:'i',steps:['Escucha la escala completa: es rápida.','Canta «li» con movimientos chiquitos de la boca.','Si se te dificulta, baja a velocidad Lento.'],listen:'Nueve notas rápidas que suben y bajan.'},
 agilidad:{mouth:'a',steps:['Escucha: son notas rápidas y pegadas.','Canta «na» ligero, sin empujar.','Prioriza que estén afinadas antes que la velocidad.'],listen:'Cinco notas rápidas que suben y bajan.'},
 extensor:{mouth:'u',steps:['Calienta primero con la sirena.','Canta «uuu» con voz ligera, sin gritar.','Cada ronda sube medio tono: si raspa o duele, para.'],listen:'Una escalera que llega un poco más arriba de tu rango.'},
 rango:{mouth:'a',steps:['Canta «aaa» y baja poco a poco hasta tu nota más grave.','Luego sube hasta tu nota más aguda, con voz ligera.','Solo cuentan las notas que sostienes medio segundo.'],listen:'No hay ejemplo: aquí la app solo te escucha.'},
 song:{mouth:'a',steps:['Escucha la cuenta de 4 tiempos.','Canta la letra cuando se ilumine; la barra azul te dice la nota.','La línea verde es tu voz: llévala dentro de las barras.'],listen:'La melodía con la voz guía.'}};
const howFor=x=>HOW[x.song?'song':x.id]||HOW.eco;
/* Boca animada en SVG: labios que vibran, «u», «a», «i», «ma», «ja» y «sss». Sin dibujos de personas: solo la boca. */
function mouthSVG(type){
  const lips={
    lips:'<path class="m-up" d="M30 46c8-5 32-5 40 0"/><path class="m-lo" d="M30 54c8 5 32 5 40 0"/><path class="m-air" d="M76 44l8-3M77 50h9M76 56l8 3"/>',
    u:'<ellipse class="m-u" cx="50" cy="50" rx="9" ry="11"/>',
    a:'<ellipse class="m-a" cx="50" cy="50" rx="15" ry="13"/>',
    i:'<path class="m-i" d="M30 47c10 9 30 9 40 0c-6 9-34 9-40 0z"/>',
    ma:'<ellipse class="m-ma" cx="50" cy="50" rx="14" ry="11"/>',
    ja:'<ellipse class="m-ja" cx="50" cy="50" rx="13" ry="11"/>',
    ss:'<path class="m-ss" d="M32 48h36M32 53h36"/><path class="m-air" d="M74 46l9-2M75 51h10M74 56l9 2"/>'}[type]||'';
  return`<svg class="mouth mouth-${type}" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="44" class="m-face"/>${lips}</svg>`;
}
/* Ejemplo: toca una ronda del patrón como la vas a cantar, con la textura del sonido (brrr, ja, sss). */
function playExample(x,speed){
  if(!ac())return 0;const t0=AC.currentTime+.08;
  if(x.breath){[[0,4,.04],[8,8,.05]].forEach(([s,d,v])=>{const src=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();src.buffer=noiseBuf();src.loop=true;f.type=s?'highpass':'lowpass';f.frequency.value=s?5200:900;g.gain.setValueAtTime(.0001,t0+s);g.gain.linearRampToValueAtTime(v,t0+s+.4);g.gain.setValueAtTime(v,t0+s+d-.5);g.gain.linearRampToValueAtTime(.0001,t0+s+d);src.connect(f);f.connect(g);g.connect(out());src.start(t0+s);src.stop(t0+s+d+.05)});return 16}
  if(!x.pat||!x.pat.length)return 0;
  const beat=60/((x.bpm||72)*(speed||1)),c=comfy(),R=Math.max(c.lo,Math.min(c.hi-Math.max(0,...x.pat.map(p=>p[0]||0)),Math.round(c.lo+2)));
  const tex=x.syl==='brrr'?'buzz':x.syl==='ja'?'ja':null;let t=t0;
  x.pat.forEach((p,i)=>{const[off,b]=p,d=b*beat;if(off!=null){const m=R+off,nx=x.glide&&x.pat[i+1]&&x.pat[i+1][0]!=null?R+x.pat[i+1][0]:null;
    if(x.glide)guideTone(m,t,d,.2,nx);else guideTone(m,t,d*(tex==='ja'?.55:.95),.18);
    if(tex){const src=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain(),lfo=AC.createOscillator(),lg=AC.createGain();src.buffer=noiseBuf();src.loop=true;f.type='bandpass';f.frequency.value=tex==='buzz'?420:1800;f.Q.value=1.4;
      const v=tex==='buzz'?.05:.04,dd=tex==='ja'?Math.min(.12,d*.4):d*.95;g.gain.setValueAtTime(v,t);g.gain.setValueAtTime(v,t+dd-.03);g.gain.linearRampToValueAtTime(.0001,t+dd);
      if(tex==='buzz'){lfo.frequency.value=28;lg.gain.value=v*.9;lfo.connect(lg);lg.connect(g.gain);lfo.start(t);lfo.stop(t+dd+.05)}
      src.connect(f);f.connect(g);g.connect(out());src.start(t);src.stop(t+dd+.05)}}
    t+=d});
  return t-t0;
}
/* Explícamelo: la voz del teléfono lee los pasos (Web Speech, español). */
const HAS_TTS='speechSynthesis' in window&&'SpeechSynthesisUtterance' in window;
function esVoice(){if(!HAS_TTS)return null;const vs=speechSynthesis.getVoices(),by=p=>vs.find(v=>v.lang&&v.lang.toLowerCase().replace('_','-').startsWith(p));return by('es-mx')||by('es-us')||by('es-419')||by('es')||null}
function speakText(text){
  if(!HAS_TTS){toast('Este navegador no tiene voz para leer en voz alta.');return}
  try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text.replace(/[«»]/g,'').replace(/brrr/g,'brrrr'));const v=esVoice();u.lang=v?v.lang:'es-MX';if(v)u.voice=v;u.rate=.95;speechSynthesis.speak(u)}catch(e){}
}
const SPEEDS=[[.75,'Lento'],[1,'Normal'],[1.15,'Rápido']];
const spdOf=id=>{const v=+DB['spd:'+id];return SPEEDS.some(s=>s[0]===v)?v:1};
