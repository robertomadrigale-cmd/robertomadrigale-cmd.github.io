function viewSongs(){return{title:'Canciones',html:`<div class="lhead"><span class="eyebrow">Ponle letra a tu práctica</span><h1>Canciones</h1><p class="sub">Busca una melodía o practica con tu propia grabación.</p></div><div class="song-actions"><a class="btn pri" href="#/canciones/nueva">Agregar mi canción</a></div><div class="song-filters card"><label>Buscar<input type="search" id="song-search" placeholder="Título o artista"></label><label>Colección<select id="song-collection"><option value="">Todas</option><option>Mis canciones</option>${Object.keys(COLLECTION_HUE).filter(x=>x!=='Mis canciones').map(x=>`<option>${esc(x)}</option>`).join('')}</select></label><label>Dificultad<select id="song-level"><option value="">Todas</option><option value="1">1 · Fácil</option><option value="2">2 · Media</option><option value="3">3 · Difícil</option></select></label><label>Orden<select id="song-order"><option value="voice">Para tu voz primero</option><option value="title">Título</option></select></label></div><p id="song-count" class="cap" role="status"></p><div id="song-list"></div><details class="card song-backup"><summary>Respaldo de mis canciones</summary><p class="cap">Incluye letra, notas y tiempos. El audio permanece en este dispositivo y no está en el código.</p><div class="song-actions"><button class="btn" data-backup="copy">Copiar código de mis canciones</button><button class="btn" data-backup="paste">Pegar código</button></div><label>Código de respaldo<textarea id="song-code" rows="4" spellcheck="false" placeholder="RCV1:"></textarea></label><button class="btn" data-backup="import">Importar código</button><p id="backup-status" role="status"></p></details>`,mount(root){
    const normalized=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');let alive=true;
    function render(){
      const search=normalized($('#song-search',root).value),collection=$('#song-collection',root).value,lvl=$('#song-level',root).value;
      const list=allSongs().filter(s=>normalized(s.title+' '+s.artist).includes(search)&&(!collection||(s.mine?'Mis canciones':s.meta.gen)===collection)&&(!lvl||String(s.meta.lvl||1)===lvl));
      list.sort((a,b)=>($('#song-order',root).value==='voice'?songFit(a).extra-songFit(b).extra:0)||a.title.localeCompare(b.title,'es'));
      $('#song-count',root).textContent=list.length+' canciones · '+DB.songs.length+' tuyas';
      $('#song-list',root).innerHTML=list.length?list.map(s=>`<article class="srow vocal-srow"><a class="song-cover" href="#/canciones/${s.id}" aria-label="Cantar ${esc(s.title)}">${songArt(s)}</a><div class="song-info"><a href="#/canciones/${s.id}"><h2>${esc(s.title)}</h2></a><p>${esc(s.artist)} · ${esc(s.mine?'Mis canciones':s.meta.gen)} · Nivel ${esc(s.meta.lvl||1)}</p><p>${esc(songFit(s).text)}</p>${s.meta.version?`<p>${esc(s.meta.version)}</p>`:''}<span aria-label="${DB.stars['song:'+s.id]||0} estrellas">${starText(DB.stars['song:'+s.id]||0)}</span> · ${scoreText(DB.best['song:'+s.id])}${s.mine?`<div class="song-actions"><a class="btn sm" href="#/canciones/editar/${s.id}">Editar</a><button class="btn sm" data-delete="${s.id}">Borrar</button></div>`:''}</div><a class="icon-btn" href="#/canciones/${s.id}" aria-label="Cantar ${esc(s.title)}">${IC.play}</a></article>`).join(''):'<p class="card">No hay canciones con esos filtros.</p>';
    }
    root.addEventListener('input',e=>{if(e.target.id==='song-search')render()});root.addEventListener('change',e=>{if(e.target.closest('.song-filters'))render()});
    root.addEventListener('click',async e=>{
      const del=e.target.closest('[data-delete]');
      if(del){
        const id=del.dataset.delete,s=songById(id),dialog=document.createElement('dialog');dialog.className='coach-dialog';dialog.innerHTML=`<h2>¿Borrar esta canción?</h2><p>${esc(s.title)} y su grabación se quitarán de este dispositivo.</p><div class="song-actions"><button class="btn" data-cancel>Conservar</button><button class="btn pri" data-confirm>Borrar canción</button></div><p role="status"></p>`;root.appendChild(dialog);dialog.showModal();
        $('[data-cancel]',dialog).onclick=()=>{dialog.close();dialog.remove()};dialog.oncancel=()=>dialog.remove();
        $('[data-confirm]',dialog).onclick=async()=>{
          try{await audioStore('delete',id);persistMySongs(DB.songs.filter(s=>s.id!==id));delete DB['original:'+id];save();dialog.close();dialog.remove();render()}catch(err){$('p[role]',dialog).textContent='No se pudo borrar: '+err.message}
        };return;
      }
      const action=e.target.closest('[data-backup]')?.dataset.backup;if(!action)return;const code=$('#song-code',root),status=$('#backup-status',root);
      try{
        if(action==='copy'){code.value=songBackup();try{await navigator.clipboard.writeText(code.value);status.textContent='Código copiado.'}catch(e){code.focus();code.select();status.textContent='Selecciona y copia el código del campo.'}}
        if(action==='paste'){try{const text=await navigator.clipboard.readText();if(alive)code.value=text}catch(e){code.focus();status.textContent='Pega tu código en el campo y toca Importar código.'}}
        if(action==='import'){const rows=parseSongBackup(code.value.trim()),fresh=rows.filter(s=>!DB.songs.some(x=>x.id===s.id));persistMySongs([...DB.songs,...fresh]);render();status.textContent=fresh.length+' canciones importadas. '+(rows.length-fresh.length)+' ya estaban aquí y se conservaron. Sube sus audios de nuevo para cantar sobre ellos.'}
      }catch(err){status.textContent=err.message}
    });render();return()=>{alive=false};
  }}}
function scaleNotes(root,minor){return(minor?[0,2,3,5,7,8,10]:[0,2,4,5,7,9,11]).map(n=>(n+root)%12)}
function freePitchStats(samples,scale,tol=.5){
  const voiced=samples.filter(s=>s.m!=null),hits=voiced.filter(s=>scale.some(pc=>Math.abs(((s.m-pc+6)%12+12)%12-6)<=tol));
  const residual=voiced.map(s=>s.m-Math.round(s.m)),avg=residual.length?residual.reduce((a,b)=>a+b,0)/residual.length:0;
  const stability=residual.length?Math.sqrt(residual.reduce((n,x)=>n+(x-avg)**2,0)/residual.length)*100:null;
  return{score:voiced.length?hits.length/voiced.length:null,stability,voiced:voiced.length,total:samples.length};
}
function viewFreeSong(song){return{title:'Cantar libre',back:'#/canciones',html:`<div class="song-free"><h1>${esc(song.title)}</h1><p>Cantar libre · mide cuánto tiempo cantas dentro de la escala. No compara la melodía de la canción.</p><div class="song-fields"><label>Tonalidad<select id="free-root">${PCS.map((p,i)=>`<option value="${i}">${p[0]}</option>`).join('')}</select></label><label>Escala<select id="free-mode"><option value="major">Mayor</option><option value="minor">Menor natural</option></select></label></div><div id="free-scale" class="scale-chips" aria-label="Notas de la escala"></div><div class="free-meter"><b id="free-note">—</b><span id="free-cents">Activa el micrófono</span><meter id="free-meter" min="-50" max="50" value="0" aria-label="Desviación en cents"></meter></div><canvas id="free-lane" class="lane" aria-label="Línea de tu voz sin objetivos"></canvas><div class="song-actions"><button class="btn pri" id="free-start">Cantar libre</button><button class="btn" id="free-stop" disabled>Terminar</button><a class="btn" href="#/canciones/editar/${song.id}">Editar canción</a></div><div id="free-result" role="status"></div><div class="lyrics">${lyricHTML(song)}</div></div>`,mount(root){
    let alive=true,running=false,starting=false,samples=[],raf=0,st=null,scale=scaleNotes(0,false),last=null;
    const paintScale=()=>{scale=scaleNotes(+$('#free-root',root).value,$('#free-mode',root).value==='minor');$('#free-scale',root).innerHTML=PCS.map((p,i)=>`<span class="scale-chip ${scale.includes(i)?'in-scale':''}" data-pc="${i}">${p[0]}</span>`).join('')};
    const frame=()=>{if(!running)return;laneDraw($('#free-lane',root),st,AC.currentTime-outLat());raf=requestAnimationFrame(frame)};
    function stop(report=true){
      if(!running)return;running=false;cancelAnimationFrame(raf);micStop();$('#free-start',root).disabled=false;$('#free-stop',root).disabled=true;$('#free-root',root).disabled=$('#free-mode',root).disabled=false;
      if(!report)return;const stats=freePitchStats(samples,scale,(DB.tol||50)/100),id='free:'+song.id;
      if(stats.score!==null){DB.best[id]=Math.max(DB.best[id]||0,stats.score);DB.stars[id]=Math.max(DB.stars[id]||0,starsFor(stats.score));DB.hist.push({d:today(),id,s:stats.score});DB.hist=DB.hist.slice(-400);DB.sung++;markDay()}
      const tip=stats.score===null?'No se registró voz. Acércate al micrófono y vuelve a intentar.':stats.stability>35?'Tu nota se movía: sostén el aire parejo.':stats.score>=.85?'Tu voz se mantuvo en la escala. Prueba ahora una melodía.':'Escucha las notas de la escala e intenta mantenerte cerca de ellas.';
      $('#free-result',root).innerHTML=`<div class="card"><h2>${scoreText(stats.score)} dentro de la escala</h2><p>${stats.score===null?'Sin estrellas':starText(starsFor(stats.score))}</p><p>${stats.stability===null?'':`Variación de afinación: ${stats.stability.toFixed(1)} cents · menor es más estable.`}</p><p>${tip}</p><p class="cap">Se mide solo el tiempo con voz. Esta marca se guarda aparte de la afinación de la melodía.</p></div>`;
    }
    $('#free-start',root).onclick=async()=>{
      if(running||starting)return;starting=true;$('#free-start',root).disabled=true;samples=[];last=null;
      const ok=await micStart(d=>{
        if(!running)return;samples.push(d);if(samples.length>15000)samples.shift();const hit=d.m!=null&&scale.includes(pcOf(d.m))&&Math.abs(d.m-Math.round(d.m))<=(DB.tol||50)/100;
        st.trail.push({...d,hit,off:d.m!=null&&!hit});if(st.trail.length>400)st.trail.shift();
        $('#free-note',root).textContent=d.m==null?'—':nnTxt(d.m);$('#free-cents',root).textContent=d.m==null?'No detecto voz':Math.round((d.m-Math.round(d.m))*100)+' cents';$('#free-meter',root).value=d.m==null?0:(d.m-Math.round(d.m))*100;
        if(last!==pcOf(d.m)&&d.m!=null){last=pcOf(d.m);$$('[data-pc]',root).forEach(el=>el.classList.toggle('singing',+el.dataset.pc===last))}
      },k=>{$('#free-result',root).innerHTML=micErrHTML(k)});
      starting=false;if(!alive){micStop();return}if(!ok){$('#free-start',root).disabled=false;return}running=true;st={targets:[],trail:[],C:laneColors(),labels:true,fixed:[comfy().lo,comfy().hi]};$('#free-stop',root).disabled=false;$('#free-root',root).disabled=$('#free-mode',root).disabled=true;frame();
    };
    $('#free-stop',root).onclick=()=>stop();$('#free-root',root).onchange=$('#free-mode',root).onchange=paintScale;
    $('#free-scale',root).onclick=e=>{const chip=e.target.closest('[data-pc]');if(chip){ac();piano(60+ +chip.dataset.pc,AC.currentTime+.05,.7,.18)}};
    const visibility=()=>{if(document.hidden)stop()};document.addEventListener('visibilitychange',visibility);paintScale();
    return()=>{alive=false;stop(false);micStop();document.removeEventListener('visibilitychange',visibility)};
  }}}
