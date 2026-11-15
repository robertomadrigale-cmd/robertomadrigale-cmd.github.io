/* ---------- Asistente IA (opcional) ----------
   El usuario elige la compañía, pega su clave y escribe el modelo. La clave se queda SOLO en este dispositivo
   (localStorage «om-ia:v1», fuera de DB para que nunca suba a la nube ni entre al respaldo).
   Las llamadas salen directo del navegador al proveedor. Se usa para: ordenar letra y secciones, acomodar acordes,
   simplificar acordes, rasgueo por sección y sacar la letra de una grabación (solo Gemini y OpenAI escuchan audio). */
const IA_KEY='om-ia:v1';
const IA_PROV={
 gemini:{n:'Google Gemini',m:'gemini-2.5-flash',audio:1,help:'Clave en aistudio.google.com → Get API key.'},
 openai:{n:'OpenAI (ChatGPT)',m:'gpt-4o-mini',url:'https://api.openai.com/v1',audio:1,help:'Clave en platform.openai.com → API keys.'},
 anthropic:{n:'Anthropic (Claude)',m:'claude-sonnet-5-5',help:'Clave en console.anthropic.com → API keys.'},
 ollama:{n:'Ollama (en tu computadora)',m:'llama3.1',url:'http://localhost:11434',nokey:1,help:'Sin clave. Arranca Ollama con OLLAMA_ORIGINS=* para que el navegador pueda hablarle.'},
 openrouter:{n:'OpenRouter',m:'openai/gpt-4o-mini',url:'https://openrouter.ai/api/v1',help:'Clave en openrouter.ai/keys.'},
 groq:{n:'Groq',m:'llama-3.3-70b-versatile',url:'https://api.groq.com/openai/v1',help:'Clave en console.groq.com/keys.'},
 deepseek:{n:'DeepSeek',m:'deepseek-chat',url:'https://api.deepseek.com/v1',help:'Clave en platform.deepseek.com.'},
 mistral:{n:'Mistral',m:'mistral-small-latest',url:'https://api.mistral.ai/v1',help:'Clave en console.mistral.ai.'},
 otro:{n:'Otro compatible con OpenAI',m:'',url:'',help:'Escribe la dirección base de la API (termina en /v1).'}};
function iaCfg(){try{return JSON.parse(localStorage.getItem(IA_KEY))||{}}catch(e){return{}}}
function iaSave(c){try{localStorage.setItem(IA_KEY,JSON.stringify(c))}catch(e){}}
function iaReady(){const c=iaCfg(),P=IA_PROV[c.prov];return!!(P&&(c.key||P.nokey)&&(c.model||P.m)&&(c.prov!=='otro'||c.url))}
const iaName=()=>{const c=iaCfg();return IA_PROV[c.prov]?IA_PROV[c.prov].n:''};
const iaReadsPdf=()=>{const c=iaCfg();return iaReady()&&['gemini','anthropic','openai'].includes(c.prov)};
const iaHears=()=>{const c=iaCfg();return iaReady()&&!!(IA_PROV[c.prov]||{}).audio};
// lo que devuelve el modelo: el primer bloque JSON (aunque venga entre ```json … ```)
function iaJSON(t){const s=String(t||'').replace(/```(?:json)?/gi,'');const a=s.indexOf('{'),b=s.lastIndexOf('}');if(a<0||b<a)throw new Error('La IA no devolvió datos válidos.');return JSON.parse(s.slice(a,b+1))}
const iaB64=blob=>new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(String(fr.result).split(',')[1]);fr.onerror=rej;fr.readAsDataURL(blob)});
// con tiempo máximo: si la IA no contesta, se avisa en vez de quedarse esperando para siempre
let IA_MS=90000;
async function iaFetch(url,opt){let r;const ac=typeof AbortController!=='undefined'?new AbortController():null,ms=IA_MS,tm=ac?setTimeout(()=>ac.abort(),ms):0;
  try{r=await fetch(url,Object.assign({},opt,ac?{signal:ac.signal}:{}))}catch(e){clearTimeout(tm);
    if(ac&&ac.signal.aborted)throw new Error(`La IA no respondió en ${Math.round(ms/1000)} segundos. Revisa que el nombre del modelo exista (por ejemplo ${(IA_PROV[iaCfg().prov]||{}).m||'el sugerido'}) e intenta de nuevo.`);
    throw new Error('No hubo conexión con la IA. Revisa tu internet'+(iaCfg().prov==='ollama'?' y que Ollama esté abierto con OLLAMA_ORIGINS=*.':'.'))}
  clearTimeout(tm);
  if(!r.ok){let m='';try{const j=await r.json();m=(j.error&&(j.error.message||j.error))||j.message||''}catch(e){}
    throw new Error(r.status===401||r.status===403?'La clave no es válida o no tiene permiso.':r.status===404?'No encontré ese modelo. Revisa el nombre.':r.status===429?'Se acabó el saldo o el límite de tu cuenta de IA.':('La IA respondió con error '+r.status+(m?': '+String(m).slice(0,140):'')))}
  return r.json()}
/* system = instrucciones, user = texto; opt.audio = {blob} (solo Gemini) */
async function iaChat(system,user,opt){
  opt=opt||{};const c=iaCfg(),P=IA_PROV[c.prov];if(!iaReady())throw new Error('Primero conecta una IA en Ajustes → Asistente IA.');
  const model=(c.model||P.m).trim(),key=(c.key||'').trim();
  if(c.prov==='gemini'){const parts=[{text:user}];if(opt.audio)parts.push({inline_data:{mime_type:opt.audio.type||'audio/mpeg',data:await iaB64(opt.audio)}});
    const j=await iaFetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},
      body:JSON.stringify({systemInstruction:{parts:[{text:system}]},contents:[{role:'user',parts}],generationConfig:{temperature:.2}})});
    const cand=(j.candidates||[])[0],txt=(cand?.content?.parts||[]).filter(p=>!p.thought).map(p=>p.text||'').join('');
    if(!txt){const why=cand?.finishReason||j.promptFeedback?.blockReason||'';throw new Error('Gemini respondió vacío'+(why?' ('+why+')':'')+'. Intenta de nuevo o prueba otro modelo.')}
    return txt}
  if(c.prov==='anthropic'){const content=opt.audio&&/pdf/.test(opt.audio.type)?[{type:'document',source:{type:'base64',media_type:'application/pdf',data:await iaB64(opt.audio)}},{type:'text',text:user}]:user;
    const j=await iaFetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
      body:JSON.stringify({model,max_tokens:8000,system,messages:[{role:'user',content}]})});
    return(j.content||[]).map(p=>p.text||'').join('')}
  if(c.prov==='ollama'){const base=(c.url||P.url).replace(/\/+$/,'');const j=await iaFetch(base+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model,stream:false,options:{temperature:.2},messages:[{role:'system',content:system},{role:'user',content:user}]})});
    return(j.message&&j.message.content)||''}
  const base=(c.url||P.url).replace(/\/+$/,''),uc=opt.audio&&/pdf/.test(opt.audio.type)?[{type:'file',file:{filename:'cancion.pdf',file_data:'data:application/pdf;base64,'+await iaB64(opt.audio)}},{type:'text',text:user}]:user;
  const j=await iaFetch(base+'/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+key},
    body:JSON.stringify({model,temperature:.2,messages:[{role:'system',content:system},{role:'user',content:uc}]})});
  return((j.choices||[])[0]?.message?.content)||'';
}
// letra de una grabación: Gemini la escucha directo; OpenAI con su transcriptor (whisper-1)
async function iaTranscribe(blob){
  const c=iaCfg();if(!iaHears())throw new Error('Para sacar la letra del audio conecta Gemini u OpenAI.');
  if(blob.size>19.5e6)throw new Error('El archivo es muy grande para la IA (máximo ~19 MB). Usa un MP3.');
  const sys='Eres un transcriptor de canciones en español e inglés. Devuelve SOLO la letra cantada, un verso por renglón, con una línea en blanco entre estrofas y la etiqueta de sección entre corchetes antes de cada parte: [Intro], [Verso 1], [Pre-coro], [Coro], [Puente], [Solo], [Final]. Sin comentarios.';
  if(c.prov==='gemini')return iaChat(sys,'Transcribe la letra de esta canción.',{audio:blob});
  const fd=new FormData();fd.append('file',blob,'cancion.'+((blob.type||'').split('/')[1]||'mp3'));fd.append('model','whisper-1');
  const j=await iaFetch('https://api.openai.com/v1/audio/transcriptions',{method:'POST',headers:{Authorization:'Bearer '+c.key.trim()},body:fd});
  return iaChat(sys,'Ordena esta transcripción en versos y secciones, sin cambiar las palabras:\n\n'+(j.text||''));
}
/* ---------- tareas musicales ---------- */
const IA_CP='Formato ChordPro: cada acorde va entre corchetes JUSTO antes de la sílaba donde cambia, dentro de la letra: «[G]Todas las ma[G/B]ñanas que vi[Am]ví». Secciones con {c:Intro}, {c:Verso 1}, {c:Pre-coro}, {c:Coro}, {c:Puente}, {c:Solo}, {c:Final} en su propio renglón. Partes sin letra: solo acordes «[G] [C] [D]». Usa cifrado americano (C D E F G A B, m, 7, maj7, sus4, /bajo).';
// ordena y acomoda: secciones, acordes sobre la sílaba correcta, sin tablaturas ni basura
async function iaArrange(src,title){
  const t=await iaChat('Eres un músico que prepara cancioneros para guitarra. '+IA_CP+' Conserva TODAS las palabras de la letra tal cual y los mismos acordes; solo corrige dónde cae cada acorde (sobre la sílaba donde suena), separa en renglones cantables de 4 a 9 palabras y marca las secciones. Quita tablaturas, créditos y anuncios. Responde SOLO la canción en ChordPro, sin explicación.',
    `Canción: ${title||''}\n\n${src}`);
  return t.replace(/```[a-z]*\n?/gi,'').trim();
}
// acordes más fáciles para principiante, misma letra
async function iaSimplify(src,title){
  const t=await iaChat('Eres maestro de guitarra para principiantes. '+IA_CP+' Haz la versión fácil, como «Simplify» de Ultimate Guitar: pásala al tono donde casi todo sea acordes abiertos (G C D Em Am, o C F G Am Dm, o D G A Bm Em, o E A B), SIN usar capo; usa solo mayores y menores (quita 7, 9, sus, add, maj7 y bajos con /) y quita acordes de paso muy cortos que no cambian el sentido. Al inicio agrega {key:NUEVO_TONO} y {comment:Original en X. Con capo en el traste N suena igual} (solo si el tono bajó). Conserva la letra y las secciones exactamente. Responde SOLO la canción en ChordPro.',
    `Canción: ${title||''}\n\n${src}`);
  return t.replace(/```[a-z]*\n?/gi,'').trim();
}
// coloca los acordes de la canción sobre una letra (por ejemplo, la que salió de la grabación)
async function iaMerge(lyrics,chordsSrc,title){
  const t=await iaChat('Eres músico y preparas cancioneros. '+IA_CP+' Te doy la letra real y la progresión o canción con acordes. Coloca los acordes sobre la letra donde musicalmente cambian, respetando las secciones. Responde SOLO ChordPro.',
    `Canción: ${title||''}\n\nLETRA:\n${lyrics}\n\nACORDES / PROGRESIÓN:\n${chordsSrc}`);
  return t.replace(/```[a-z]*\n?/gi,'').trim();
}
/* rasgueo real por sección, en la notación de los grooves de la app (exactamente la línea que suena) */
const IA_SECS=['intro','verso','precoro','coro','puente','solo','final'];
async function iaStrum(info){
  const{title,artist,style,beats,bpm,sub,sections}=info,L=beats*sub;
  const t=await iaChat(`Eres guitarrista de sesión. Describe cómo se rasguea de verdad esta canción, por sección, en una notación de ${L} celdas por compás (${beats} pulsos × ${sub} celdas por pulso; ${sub===3?'tresillos':'dieciseisavos'}).
Guitarra «g», un carácter por celda: D abajo fuerte, d abajo suave, U arriba fuerte, u arriba suave, x golpe apagado con la palma, B pulgar en el bajo, b pulgar en el bajo alterno, c pellizco de agudas, C pulgar + pellizco, 1-6 cuerda de arpegio, - nada.
Bajo «b» (opcional): R raíz, F quinta, O octava, 3 tercera, 6 sexta, 7 séptima, . silencio, - sigue sonando.
«f»: fuerza de la sección de 0.7 (muy suave) a 1.2 (con todo).
Responde SOLO JSON: {"tip":"cómo tocarla en una frase","secs":{"verso":{"g":"…","b":"…","f":0.9},"coro":{…}}} con claves de: ${IA_SECS.join(', ')}. Cada «g» y «b» debe medir exactamente ${L} caracteres.`,
    `Canción: «${title}»${artist?' de '+artist:''}. Ritmo actual de la app: ${style}. Compás ${beats}/4, ${bpm} bpm. Secciones que tiene: ${sections.join(', ')||'verso, coro'}.`);
  const J=iaJSON(t),okG=/^[DdUuxXBbcC1-6-]+$/,okB=/^[RFO367A.-]+$/,secs={};
  Object.entries(J.secs||{}).forEach(([k,v])=>{const key=iaSec(k);if(!v||typeof v.g!=='string')return;const g=v.g.replace(/\s+/g,'').replace(/X/g,'x');
    if(g.length!==L||!okG.test(g))return;const b=typeof v.b==='string'?v.b.replace(/\s+/g,''):'';
    secs[key]={g,b:b.length===L&&okB.test(b)?b:null,f:Math.max(.7,Math.min(1.2,+v.f||1))}});
  if(!Object.keys(secs).length)throw new Error('La IA no devolvió un rasgueo que la app pueda tocar. Intenta otra vez u otro modelo.');
  return{tip:String(J.tip||'').slice(0,220),secs,sub,beats};
}
// nombre de sección → clave estándar
function iaSec(s){const x=String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  return /pre-?\s?(coro|chorus)/.test(x)?'precoro':/coro|estribillo|chorus/.test(x)?'coro':/puente|bridge/.test(x)?'puente':/intro/.test(x)?'intro':/solo|interludio|instrumental|riff/.test(x)?'solo':/final|outro|coda/.test(x)?'final':'verso'}
/* ---------- pantalla de ajustes ---------- */
function viewIA(){
  const c=iaCfg();
  return{title:'Asistente IA',back:'#/',html:`<div class="lhead"><h1>asistente ia</h1><p class="sub">Conecta tu propia IA para que la app ordene letras, acomode y simplifique acordes, proponga el rasgueo real de cada sección y saque la letra de tus grabaciones.</p></div>
  <div class="card iacfg">
   <div><span class="cl">Compañía</span><select class="inp" id="iaprov"><option value="">Sin IA</option>${Object.entries(IA_PROV).map(([k,p])=>`<option value="${k}" ${c.prov===k?'selected':''}>${p.n}</option>`).join('')}</select></div>
   <div id="iakw"><span class="cl">Clave de la API</span><input class="inp" id="iakey" type="password" autocomplete="off" spellcheck="false" placeholder="Pega tu clave" value="${esc(c.key||'')}"></div>
   <div><span class="cl">Modelo</span><input class="inp" id="iamodel" autocomplete="off" spellcheck="false" value="${esc(c.model||'')}"></div>
   <div id="iauw"><span class="cl">Dirección de la API</span><input class="inp" id="iaurl" autocomplete="off" spellcheck="false" value="${esc(c.url||'')}"></div>
   <p class="cap" id="iahelp" style="margin:0"></p>
   <div class="row"><button class="btn pri" id="iasave">${IC.check}Guardar</button><button class="btn" id="iatest">Probar conexión</button><button class="btn" id="iadel">Quitar</button></div>
   <p class="cap" id="iamsg" role="status" style="margin:0"></p></div>
  <div class="box"><p class="blockh">Qué hace la IA en la app</p><ul>
   <li><b>Ordenar letra:</b> separa en renglones y secciones (Intro, Verso, Coro…) y pone cada acorde sobre la sílaba donde cambia.</li>
   <li><b>Versión fácil:</b> como «Simplify» de Ultimate Guitar: tono con acordes abiertos y sin acordes raros. También hay un botón «Fácil» que no necesita IA.</li>
   <li><b>Rasgueo real:</b> propone cómo se rasguea cada sección (verso más suave, coro con todo) y la banda lo toca.</li>
   <li><b>Letra desde tu grabación:</b> con Gemini u OpenAI, escucha tu MP3 y escribe la letra con sus acordes.</li></ul>
   <p class="cap">Tu clave se guarda solo en este dispositivo y no se sube a tu cuenta. Cada consulta la cobra tu proveedor de IA según su tarifa. Separar pistas no usa IA: la app lo hace sola.</p></div>`,
  mount(r){
    const paint=()=>{const k=$('#iaprov',r).value,P=IA_PROV[k];$('#iakw',r).hidden=!P||!!P.nokey;$('#iauw',r).hidden=!P||!P.url&&k!=='otro';
      $('#iamodel',r).placeholder=P&&P.m?'Ej. '+P.m:'Nombre del modelo';$('#iaurl',r).placeholder=P&&P.url||'https://…/v1';$('#iahelp',r).textContent=P?P.help+(P.audio?' Esta IA también puede escuchar audio.':''):''};
    $('#iaprov',r).onchange=paint;paint();
    const read=()=>({prov:$('#iaprov',r).value,key:$('#iakey',r).value.trim(),model:$('#iamodel',r).value.trim(),url:$('#iaurl',r).value.trim()});
    const msg=t=>$('#iamsg',r).textContent=t;
    $('#iasave',r).onclick=()=>{iaSave(read());msg(iaReady()?'Guardado. Ya puedes usar la IA en el cancionero.':'Guardado, pero falta la clave o el modelo.')};
    $('#iadel',r).onclick=()=>{iaSave({});$('#iaprov',r).value='';$('#iakey',r).value='';$('#iamodel',r).value='';$('#iaurl',r).value='';paint();msg('Listo: la app ya no usa IA.')};
    $('#iatest',r).onclick=async()=>{iaSave(read());if(!iaReady()){msg('Falta elegir la compañía, la clave o el modelo.');return}
      const b=$('#iatest',r),t0=Date.now(),tk=setInterval(()=>msg(`Probando… ${Math.round((Date.now()-t0)/1000)} s`),1000);b.disabled=true;msg('Probando…');const old=IA_MS;IA_MS=30000;
      try{const t=await iaChat('Responde solo con la palabra: listo','¿Me escuchas?');msg('Conectado con '+iaName()+' en '+((Date.now()-t0)/1000).toFixed(1)+' s. Respondió: «'+String(t).trim().slice(0,40)+'».')}catch(e){msg('No se conectó: '+e.message)}
      IA_MS=old;clearInterval(tk);b.disabled=false};
  }};
}

/* PDF de canción → ChordPro + datos (título, artista, tono, bpm, capo) + rasgueo leído de las flechas */
async function iaReadSongPdf(f){
  if(f.size>19e6)throw new Error('El PDF es muy grande (máximo ~19 MB).');
  const t=await iaChat(`Eres músico y transcribes hojas de canciones (como las de Ultimate Guitar). Lee TODO el PDF (todas las páginas y ambas columnas, en orden: primero la columna izquierda completa y luego la derecha).
Responde SOLO JSON: {"title":"","artist":"","key":"tono como C o Am","bpm":número o null,"capo":número o 0,"time":"4/4" o "3/4","strum":"rasgueo o null","chordpro":"…"}.
«chordpro»: la canción completa en ChordPro: cada acorde entre corchetes JUSTO antes de la sílaba donde está escrito encima, con la letra exacta; secciones en su propio renglón como [Intro], [Verso 1], [Pre-coro], [Coro], [Puente], [Solo], [Final] (traduce Verse=Verso, Chorus=Coro, Bridge=Puente, Outro=Final); partes sin letra como renglones de solo acordes «[C] [G] [C] [G]». No incluyas los diagramas de acordes ni la afinación.
«strum»: si hay STRUMMING PATTERN con flechas, escríbelo en ${'16'} caracteres para 4/4 (12 para 3/4), uno por dieciseisavo: posiciones 0,2,4,6,8,10,12,14 = «1 & 2 & 3 & 4 &». Flecha abajo = D (o d si es suave), arriba = U (o u), sin flecha = -. Ejemplo «D---D-U---U-D-U-». Si no hay, null.`,'Transcribe esta canción.',{audio:f});
  const J=iaJSON(t),src=String(J.chordpro||'').replace(/```[a-z]*\n?/gi,'').trim();if(!src)throw new Error('La IA no pudo leer la canción del PDF.');
  const beats=J.time==='3/4'?3:4,g=typeof J.strum==='string'?J.strum.replace(/\s+/g,''):'';
  const meta={title:J.title||'',artist:J.artist||'',key:/^[A-G][#b]?m?$/.test(J.key||'')?J.key:'',bpm:+J.bpm>=40&&+J.bpm<=220?Math.round(+J.bpm):0,capo:+J.capo||0,beats};
  const strum=g.length===beats*4&&/^[DdUux-]+$/.test(g)&&/[DdUu]/.test(g)?g:null;
  const hd=(meta.title?`{title:${meta.title}}\n`:'')+(meta.artist?`{artist:${meta.artist}}\n`:'')+(meta.key?`{key:${meta.key}}\n`:'')+(meta.bpm?`{bpm:${meta.bpm}}\n`:'')+(beats===3?'{time:3/4}\n':'')+(meta.capo?`{comment:Capo en el traste ${meta.capo}}\n`:'');
  return{src:hd+'\n'+src.replace(/^\s*\{(title|t|artist|a|key|bpm|time)\s*:[^}]*\}\s*$/gim,'').trim()+'\n',meta,strum,ia:true};
}
/* ---------- la IA revisa la sincronización con la grabación ----------
   Gemini escucha el audio y dice en qué segundo empieza a cantarse cada renglón; con OpenAI, el transcriptor da los
   tiempos de cada frase y se emparejan con la letra en orden. La app solo usa esos tiempos para corregir renglones
   que quedaron lejos (y los acomoda en el pulso real); el ajuste fino sigue siendo el análisis de acordes. */
const iaNorm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9ñ ]+/g,' ').replace(/\s+/g,' ').trim();
async function iaLineTimes(blob,lines){
  const c=iaCfg();if(!iaHears())throw new Error('Para revisar con el audio conecta Gemini u OpenAI.');
  if(blob.size>19.5e6)throw new Error('La grabación es muy grande para la IA (máximo ~19 MB).');
  if(c.prov==='gemini'){
    const t=await iaChat('Eres un ingeniero de audio que sincroniza letras (como un archivo LRC). Escuchas la canción completa y marcas el segundo exacto en que empieza a cantarse cada renglón.',
      `Estos son los ${lines.length} renglones de la letra, en orden (los coros repetidos aparecen cada vez que se cantan):\n${lines.map((l,i)=>(i+1)+'. '+l).join('\n')}\n\nResponde SOLO JSON {"t":[...]} con exactamente ${lines.length} números: el segundo (con un decimal) en que empieza a cantarse cada renglón en esta grabación, o null si no se canta. Los tiempos van en aumento.`,{audio:blob});
    const J=iaJSON(t);return(J.t||[]).slice(0,lines.length).map(v=>v==null||!isFinite(+v)?null:+v);
  }
  // OpenAI: frases con tiempo del transcriptor, emparejadas en orden con los renglones por palabras en común
  const fd=new FormData();fd.append('file',blob,'cancion.'+((blob.type||'').split('/')[1]||'mp3'));fd.append('model','whisper-1');fd.append('response_format','verbose_json');fd.append('timestamp_granularities[]','segment');
  const j=await iaFetch('https://api.openai.com/v1/audio/transcriptions',{method:'POST',headers:{Authorization:'Bearer '+c.key.trim()},body:fd});
  const seg=(j.segments||[]).map(s=>({t:s.start,w:new Set(iaNorm(s.text).split(' ').filter(x=>x.length>2))}));let k=0;
  return lines.map(l=>{const w=iaNorm(l).split(' ').filter(x=>x.length>2);if(!w.length)return null;let best=-1,bs=0;
    for(let i=k;i<Math.min(seg.length,k+8);i++){const s=w.filter(x=>seg[i].w.has(x)).length/w.length;if(s>bs+.05){bs=s;best=i}}
    if(best<0||bs<.34)return null;k=best+1;return seg[best].t});
}
/* letra con el segundo en que empieza cada renglón y su sección (para crear la canción desde el audio) */
async function iaLyricsTimed(blob){
  const c=iaCfg();if(!iaHears())throw new Error('Para sacar la letra del audio conecta Gemini u OpenAI.');
  if(blob.size>19.5e6)throw new Error('La grabación es muy grande para la IA (máximo ~19 MB). Usa un MP3.');
  if(c.prov==='gemini'){
    const t=await iaChat('Eres un transcriptor profesional de canciones en español e inglés que hace archivos LRC (letra sincronizada).',
      'Escucha toda la canción y transcribe SOLO lo que se canta, un verso por renglón (frases cortas de 4 a 10 palabras), con el segundo exacto (un decimal) en que empieza cada renglón y su sección. Responde SOLO JSON {"title":"si lo reconoces","artist":"si lo reconoces","key":"tono como A o F#m","chords":["los acordes que usa la canción en el tono de ESTA grabación, cifrado americano, solo mayores y menores, p. ej. A","F#m","D","E"],"lines":[{"t":12.3,"sec":"Verso 1","text":"…"}]}. Si conoces la canción, usa sus acordes reales; si no, escucha con cuidado. Secciones en español: Intro, Verso 1, Verso 2, Pre-coro, Coro, Puente, Solo, Final.',{audio:blob});
    const J=iaJSON(t);return{title:J.title||'',artist:J.artist||'',key:J.key||'',chords:Array.isArray(J.chords)?J.chords.map(String).slice(0,14):[],lines:(J.lines||[]).map(x=>({t:+x.t,text:String(x.text||'').trim(),sec:x.sec?String(x.sec):null})).filter(x=>x.text&&isFinite(x.t))};
  }
  const fd=new FormData();fd.append('file',blob,'cancion.'+((blob.type||'').split('/')[1]||'mp3'));fd.append('model','whisper-1');fd.append('response_format','verbose_json');fd.append('timestamp_granularities[]','segment');
  const j=await iaFetch('https://api.openai.com/v1/audio/transcriptions',{method:'POST',headers:{Authorization:'Bearer '+c.key.trim()},body:fd});
  return{title:'',artist:'',lines:(j.segments||[]).map(s=>({t:+s.start,text:String(s.text||'').trim(),sec:null})).filter(x=>x.text)};
}
