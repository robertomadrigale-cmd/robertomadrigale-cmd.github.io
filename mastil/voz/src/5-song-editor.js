function viewSongEditor(id){
  const stored=id&&DB.songs.find(s=>s.id===id);if(id&&!stored)return viewSongs();
  const initial=stored?songParse(stored.src):null;
  return{title:stored?'Editar mi canción':'Agregar mi canción',back:'#/canciones',html:`<div class="song-editor"><div class="lhead"><span class="eyebrow">Mis canciones</span><h1>${stored?'Edita tu canción':'Tu voz, tu canción'}</h1><p>Guarda la letra y crea una guía para practicar.</p></div>
    <section class="card"><h2>1. Letra</h2><div class="song-fields"><label>Título<input id="mine-title" maxlength="150" value="${esc(initial?.title||'')}"></label><label>Artista<input id="mine-artist" maxlength="150" value="${esc(initial?.artist||'')}"></label><label>Tempo · pulsos por minuto<input id="mine-bpm" type="number" min="40" max="200" value="${initial?.bpm||90}"></label></div><label>Letra · una frase por renglón<textarea id="mine-lyrics" rows="5" maxlength="30000" placeholder="Pega aquí tu letra"></textarea></label><p class="cap">Usa canciones que puedas usar libremente o para tu práctica personal. La app no transcribe letras.</p><button class="btn" data-editor="syllables">Separar en sílabas</button><details><summary>Corregir sílabas a mano</summary><p class="cap">Usa ~ entre sílabas y _ para unir palabras en una sílaba.</p><label>Sílabas<textarea id="mine-syllables" rows="5" maxlength="40000"></textarea></label><button class="btn" data-editor="apply">Aplicar sílabas</button></details></section>
    <section class="card"><h2>2. Melodía</h2><p>Graba cada frase, sube un audio o escribe las notas.</p><label>Subir canción completa o voz sola<input id="mine-file" type="file" accept="audio/*,video/mp4"></label><p class="cap">MP3, M4A, WAV o MP4 · hasta 10 min y 80 MB. En video usamos solo el audio.</p><p class="song-experimental">Experimental: funciona mejor cuando la voz se oye clara. Revisa y corrige las notas.</p><p class="cap">Funciona mejor con una grabación de solo voz; con música de fondo la melodía sale mal.</p><div id="extract-status" role="status" aria-live="polite"></div><progress id="extract-progress" max="1" value="0" hidden aria-label="Progreso de extracción"></progress><button class="btn" data-editor="cancel" hidden>Cancelar extracción</button><div id="mine-lines"></div></section>
    <section class="card"><h2>3. Probar y guardar</h2><p id="mine-tone" class="cap">Sin melodía puedes practicar con Cantar libre.</p><canvas id="mine-preview" class="lane" aria-label="Vista previa de la melodía"></canvas><div class="song-actions"><button class="btn" data-editor="preview">Vista previa</button><button class="btn pri" data-editor="save">Guardar canción</button><button class="btn" data-editor="sing">Cantar ahora</button></div><p class="cap">El audio se guarda solo en este dispositivo. El respaldo contiene la letra, las notas y sus tiempos; no incluye el audio.</p><p id="mine-error" class="msg err" role="alert" hidden></p></section></div>`,mount(root){
    let alive=true,busy=false,saving=false,abort=null,recording=-1,reads=[],recordTimer=null,recordOrigin=0,previewRun=null,previewBus=null,pendingAudio=null,extracted=[],duration=stored?.duration,confidence=stored?.confidence,audioStored=!!stored?.audioStored;
    let songId=stored?.id||'mine-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),created=stored?.created||Date.now();
    let lyrics=initial?initial.lines.map(l=>l.syl.map(s=>s.x.replaceAll(' ','_')+(s.sp?' ':'~')).join('').replace(/~$/,'')).join('\n'):'';
    let lines=initial?initial.lines.map((l,i)=>({text:lyrics.split('\n')[i],notes:structuredClone(stored.notes?.[i]||l.mel||[])})):[];
    $('#mine-syllables',root).value=lyrics;$('#mine-lyrics',root).value=lyrics.replaceAll('~','').replaceAll('_',' ');
    let appliedPlain=$('#mine-lyrics',root).value;
    const error=e=>{const el=$('#mine-error',root);el.hidden=!e;el.textContent=e?.message||e||''};
    const status=text=>{$('#extract-status',root).textContent=text};
    const bpm=()=>Math.max(40,Math.min(200,Number($('#mine-bpm',root).value)||90));
    const count=line=>songParse(line.text).lines[0]?.syl.length||0;
    function setBusy(value){busy=value;$$('[data-editor],#mine-bpm,#mine-syllables,#mine-lyrics,#mine-title,#mine-artist,#mine-file',root).forEach(el=>el.disabled=value&&el.dataset.editor!=='cancel');$('[data-editor="cancel"]',root).hidden=!value;$('#extract-progress',root).hidden=!value;renderLines()}
    function stopListen(){if(previewRun){const run=previewRun;previewRun=null;run.stop()}if(previewBus){previewBus.gain.value=0;previewBus.disconnect();previewBus=null}}
    function renderLines(){
      $('#mine-lines',root).innerHTML=lines.length?lines.map((line,li)=>{
        const syl=songParse(line.text).lines[0]?.syl||[];let si=-1;
        return`<article class="song-line"><h3>${li+1}. ${esc(line.text.replaceAll('~','').replaceAll('_',' '))}</h3><p class="cap">${syl.length} sílabas${recording===li?' · Grabando… canta esta frase':''}</p><div class="song-actions"><button class="btn" data-line="${li}" data-action="record" ${busy||recording>=0&&recording!==li?'disabled':''}>${recording===li?'Listo':'Grabar renglón'}</button><button class="btn" data-line="${li}" data-action="listen" ${busy||recording>=0||!line.notes.length?'disabled':''}>Escuchar</button></div><div class="note-list">${line.notes.map((note,ni)=>{if(note.m!==null&&!note.cont)si++;return`<div class="note-edit" data-li="${li}" data-ni="${ni}"><b>${note.m===null?'Silencio':esc((note.cont?'↳ ':'')+(syl[si]?.x||'la'))}</b><label>Nota<input data-note="m" value="${note.m===null?'r':noteCode(note.m)}" aria-label="Nota ${ni+1} del renglón ${li+1}" ${busy||recording>=0?'disabled':''}></label><div class="note-controls"><button class="btn sm" data-adjust="down" aria-label="Bajar semitono">−</button><span>${note.m===null?'Silencio':nnTxt(note.m)}</span><button class="btn sm" data-adjust="up" aria-label="Subir semitono">+</button></div><div class="note-controls"><button class="btn sm" data-adjust="shorter" aria-label="Quitar medio pulso">−</button><span>${note.d} pulsos</span><button class="btn sm" data-adjust="longer" aria-label="Agregar medio pulso">+</button></div>${Number.isFinite(note.t0)?`<label>Inicio · s<input type="number" min="0" max="600" step=".01" data-note="t0" value="${note.t0.toFixed(2)}"></label><label>Final · s<input type="number" min="0" max="600" step=".01" data-note="t1" value="${note.t1.toFixed(2)}"></label><div class="note-controls"><button class="btn sm" data-adjust="earlier" aria-label="Adelantar una décima">−0.1 s</button><button class="btn sm" data-adjust="later" aria-label="Retrasar una décima">+0.1 s</button></div>`:''}<div class="song-actions"><button class="btn sm" data-adjust="listen">Escuchar</button><button class="btn sm" data-adjust="delete">Borrar</button>${ni?'<button class="btn sm" data-adjust="join">Unir</button>':''}</div></div>`}).join('')}</div><details><summary>Escribir notas · avanzado</summary><label>Melodía<textarea data-mel="${li}" rows="2" placeholder="{mel: C4/1 D4/1 E4/2}" ${busy||recording>=0?'disabled':''}>${esc(melodyText(line.notes))}</textarea></label><p class="cap">Una nota por sílaba. + prolonga la sílaba anterior; r/1 es un silencio.</p><button class="btn" data-line="${li}" data-action="manual" ${busy||recording>=0?'disabled':''}>Aplicar notas</button></details></article>`;
      }).join(''):'<p class="cap">Pega la letra y separa las sílabas para empezar. También puedes subir primero el audio.</p>';
      if(busy||recording>=0)$$('[data-adjust],[data-note]',root).forEach(el=>el.disabled=true);
    }
    function applyLines(text){
      const texts=text.split('\n').map(s=>s.trim()).filter(Boolean);if(texts.length>160)throw Error('Usa hasta 160 renglones.');
      lines=texts.map((text,i)=>({text,notes:lines[i]?.text===text?lines[i].notes:assignNotes((lines[i]?.notes||[]).filter(n=>n.m!=null),count({text}))}));
      if(extracted.length){const distributed=distributeNotes(extracted,lines.map(count));lines.forEach((l,i)=>l.notes=distributed[i])}
      lyrics=text;$('#mine-syllables',root).value=text;$('#mine-lyrics',root).value=text.replaceAll('~','').replaceAll('_',' ');appliedPlain=$('#mine-lyrics',root).value;renderLines();
    }
    function draft(){
      if($('#mine-lyrics',root).value!==appliedPlain)throw Error('La letra cambió. Toca Separar en sílabas para actualizar los renglones.');
      for(let li=0;li<lines.length;li++){const field=$(`[data-mel="${li}"]`,root);if(field&&field.value.trim()!==melodyText(lines[li].notes))throw Error('Toca Aplicar notas en el renglón '+(li+1)+' para conservar tu cambio.');}
      const title=cleanMeta($('#mine-title',root).value);if(!title)throw Error('Dale un título a tu canción.');if(!lines.length)throw Error('Pega la letra y separa las sílabas.');
      const src=`{id:${songId}}{title:${title}}{artist:${cleanMeta($('#mine-artist',root).value)}}{bpm:${bpm()}}{time:4/4}{lvl:1}{gen:Mis canciones}\n`+lines.map(l=>l.text+(l.notes.length?'\n{mel:'+melodyText(l.notes)+'}':'')).join('\n');
      return validateSongRow({id:songId,src,created,notes:lines.map(l=>l.notes),duration,confidence,audioStored});
    }
    function preview(){
      stopListen();const row=draft(),s=songParse(row.src);if(!hasMelody(s)){$('#mine-tone',root).textContent='Sin melodía: al cantar elegirás una escala para Cantar libre.';return}
      ac();const sh=songShift(s),sp=songSpec(s,{shift:sh});$('#mine-tone',root).textContent=`Tono sugerido: ${nnTxt(sp.targets[0].m)} al empezar · ${sh>0?'+':''}${sh} semitonos.`;
      laneDraw($('#mine-preview',root),{C:laneColors(),targets:sp.targets,trail:[],sec:8},sp.targets[0].t0);
    }
    async function listen(notes){
      stopListen();if(!ac())throw Error('No se pudo iniciar el audio.');await AC.resume();const master=MASTER;previewBus=AC.createGain();previewBus.connect(master);let t=AC.currentTime+.1;
      try{MASTER=previewBus;for(const n of notes){if(n.m!=null)piano(n.m,t,n.d*60/bpm()*.9,.2);t+=n.d*60/bpm()}}finally{MASTER=master}
    }
    async function finishRecording(){
      if(recording<0)return;const li=recording;recording=-1;clearTimeout(recordTimer);micStop();
      const notes=segmentPitch(reads,bpm(),.04).map(({m,d})=>({m,d,cont:false}));if(notes.length){extracted=[];lines[li].notes=assignNotes(notes,count(lines[li]));status('Frase capturada. Escucha y corrige las notas.')}else status('No detecté una nota sostenida. Acércate al micrófono y vuelve a intentar.');renderLines();
    }
    async function recordLine(li){
      if(recording===li){await finishRecording();return}stopListen();reads=[];recording=li;renderLines();
      const ok=await micStart(d=>{if(recordOrigin===0)recordOrigin=d.t;reads.push({...d,t:d.t-recordOrigin})},k=>error(MICERR[k]));
      if(!alive||recording!==li){micStop();return}if(!ok){recording=-1;renderLines();return}recordOrigin=0;recordTimer=setTimeout(finishRecording,60000);
    }
    async function upload(file){
      if(!file)return;await finishRecording();stopListen();abort?.abort();abort=new AbortController();error('');setBusy(true);status('Leyendo audio…');
      try{
        const buffer=await decodeSongFile(file,{signal:abort.signal,onStatus:status});if(!alive)return;
        const samples=await prepareAudio(buffer);if(!alive)return;
        const result=await extractMelody(samples,buffer.sampleRate,bpm(),{signal:abort.signal,onProgress:p=>{if(alive){$('#extract-progress',root).value=p;status('Extrayendo melodía… '+Math.round(p*100)+' %')}}});
        if(!alive)return;pendingAudio=file;duration=result.duration;confidence=result.confidence;extracted=result.notes;
        const distributed=distributeNotes(extracted,lines.map(count));lines.forEach((l,i)=>l.notes=distributed[i]);
        status(`Confianza: ${Math.round(confidence*100)} % del tiempo con tono claro. ${extracted.length} notas detectadas. ${extracted.length?'Revisa la melodía antes de guardar.':'Puedes guardar la letra y cantar libre.'}`);
      }catch(e){if(alive){if(e.name==='AbortError')status('Extracción cancelada. Se conservó tu edición anterior.');else error(e)}}finally{if(alive){setBusy(false);$('#mine-file',root).value=''}}
    }
    async function store(sing){
      if(saving)return;saving=true;
      try{
      if(recording>=0)await finishRecording();stopListen();error('');
      // Aplica cambios pendientes del campo avanzado; nunca descarta texto editado.
      if($('#mine-syllables',root).value!==lyrics)applyLines($('#mine-syllables',root).value);
      const row=draft();let audioError='';
      persistMySongs([...DB.songs.filter(s=>s.id!==songId),{...row,audioStored:pendingAudio?false:audioStored}]);
      if(pendingAudio){try{await audioStore('put',songId,pendingAudio);row.audioStored=true}catch(e){row.audioStored=false;audioError='La melodía quedó guardada, pero no el audio: '+e.message}}
      persistMySongs([...DB.songs.filter(s=>s.id!==songId),row]);if(!alive)return;
      if(audioError){status(audioError);toast(esc(audioError),7000)}else toast('Tu canción quedó guardada.');
      audioStored=row.audioStored;pendingAudio=null;extracted=[];
      if(sing)location.hash='#/canciones/'+songId;else{status(audioError||'Tu canción quedó guardada. Puedes seguir editando.');}
      }finally{saving=false}
    }
    root.addEventListener('click',async e=>{
      const button=e.target.closest('button');if(!button||button.disabled)return;
      try{
        error('');const action=button.dataset.editor;
        if(action==='cancel'){abort?.abort();return}if(busy)return;
        if(action==='syllables'){await finishRecording();applyLines(syllabify($('#mine-lyrics',root).value))}
        if(action==='apply'){await finishRecording();applyLines($('#mine-syllables',root).value)}
        if(action==='preview')preview();if(action==='save'||action==='sing')await store(action==='sing');
        const li=Number(button.dataset.line),line=lines[li];
        if(button.dataset.action==='record')await recordLine(li);
        if(button.dataset.action==='listen')await listen(line.notes);
        if(button.dataset.action==='manual'){
          const notes=strictMelody($(`[data-mel="${li}"]`,root).value);
          if(notes.filter(n=>n.m!==null&&!n.cont).length!==count(line)&&notes.length)throw Error('El renglón tiene '+count(line)+' sílabas. Usa una nota por sílaba y + para prolongarla.');
          // Conserva tiempos solo si no cambió la estructura; escribir otras notas
          // exige extraer nuevamente para volver a cantar sobre el original.
          line.notes=notes.map((n,i)=>({...n,...(line.notes.length===notes.length&&line.notes[i].t0!=null?{t0:line.notes[i].t0,t1:line.notes[i].t1}:{})}));extracted=[];renderLines();
        }
        if(button.dataset.adjust){
          const card=button.closest('[data-li]'),line=lines[+card.dataset.li],ni=+card.dataset.ni,n=line.notes[ni],a=button.dataset.adjust;extracted=[];
          if(a==='listen'){await listen([n]);return}
          if(a==='up'||a==='down')n.m=Math.max(24,Math.min(96,(n.m??60)+(a==='up'?1:-1)));
          if(a==='longer'||a==='shorter')n.d=Math.max(.5,Math.min(64,n.d+(a==='longer'?.5:-.5)));
          if(a==='earlier'||a==='later'){const dt=a==='earlier'?-.1:.1;if(n.t0+dt>=0){n.t0+=dt;n.t1+=dt}}
          if(a==='delete'){line.notes.splice(ni,1);line.notes=assignNotes(line.notes.filter(n=>n.m!==null),count(line))}
          if(a==='join'&&ni){const prev=line.notes[ni-1];prev.d+=n.d;if(n.t1!=null)prev.t1=n.t1;line.notes.splice(ni,1);line.notes=assignNotes(line.notes.filter(n=>n.m!==null),count(line))}
          renderLines();
        }
      }catch(e){error(e)}
    });
    root.addEventListener('change',e=>{
      if(e.target.id==='mine-file'){upload(e.target.files[0]);return}
      if(e.target.dataset.note){const card=e.target.closest('[data-li]'),n=lines[+card.dataset.li].notes[+card.dataset.ni],k=e.target.dataset.note;
        try{let v=k==='m'?e.target.value==='r'?null:parseNote(e.target.value.trim()):Number(e.target.value);if(k==='m'&&v===null&&e.target.value!=='r'||v!==null&&!Number.isFinite(v))throw Error('Revisa el valor de la nota.');n[k]=v;extracted=[];renderLines();error('')}catch(err){error(err)}
      }
    });
    renderLines();if(confidence!=null)status('Confianza: '+Math.round(confidence*100)+' % del tiempo con tono claro.');
    const visibility=()=>{if(document.hidden){finishRecording();stopListen()}};document.addEventListener('visibilitychange',visibility);
    return()=>{alive=false;abort?.abort();clearTimeout(recordTimer);stopListen();micStop();document.removeEventListener('visibilitychange',visibility)};
  }};
}
