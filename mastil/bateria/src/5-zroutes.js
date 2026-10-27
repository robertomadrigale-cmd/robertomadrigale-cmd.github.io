function drumLinks(){return`<div class="drum-links"><a class="btn" href="#/sesion">Sesión diaria</a><a class="btn" href="#/grooves">Grooves</a><a class="btn" href="#/progreso">Progreso</a><a class="btn" href="#/ajustes">Ajustes</a><a class="btn" href="#/cuenta">Mi cuenta</a><a class="btn" href="#/logros">Logros</a><a class="btn" href="#/apariencia">Apariencia</a></div>`}
function drumRoute(raw){
 const [path,qs]=raw.split('?'),p=path.split('/'),q=new URLSearchParams(qs||'');
 if(!path)return viewDrumHome();
 if(p[0]==='sesion')return viewCoach();
 if(p[0]==='grooves')return viewGrooves();
 if(p[0]==='groove')return viewGroove(p[1])||viewGrooves();
 if(p[0]==='glosario')return viewGlossary();
 if(p[0]==='progreso')return viewProgress();if(p[0]==='ajustes')return viewSettings();
 if(p[0]==='practicar'){
  if(p[1]==='ej'&&G[p[2]])return levelOpen(lvlOf(p[2]))||q.get('k')==='band'?viewCoach(p[2],KIND[q.get('k')]?q.get('k'):G[p[2]].cat==='Rudimentos'?'rud':'groove'):viewLocked(p[2]);
  const views={metronomo:viewDrumMetronome,afinador:viewTiming,precision:viewTiming,medidor:viewTiming,banda:()=>viewBand(q),pistas:()=>viewBand(q),setlist:viewSetlist,juego:viewDrumGame};
  if(views[p[1]])return views[p[1]]();
 }
 if(p[0]==='referencia'){
  if(p[1]==='glosario')return viewGlossary();if(p[1]==='acordes')return viewChordDictionary();
  if(p[1]==='canciones')return viewSongbook();return viewDrumReference();
 }
 return null;
}
function drumAdaptView(v){
 v.html=v.html.replace(/Calentamiento, mástil, lección e improvisación/g,'Rudimentos, groove, lección y banda').replace(/mira el mástil y haz los ejercicios con la guitarra en la mano/g,'mira la rejilla y toca con tu batería o los pads').replace(/Juego del mástil/g,'Lectura de rejilla').replace(/Encuentra notas contra reloj\./g,'Escucha e identifica el patrón.').replace(/Afina con el micrófono o de oído\./g,'Mide el tiempo de cada golpe.').replace(/Afinador/g,'Precisión').replace(/Pistas para improvisar/g,'Banda sin batería').replace(/Toca canciones con notas que caen\./g,'Toca golpes que caen en tres carriles.').replace(/Marcar como hecho/g,'Marcar hecho');
 if(v.title==='Practicar')v.html+=toolList()+drumLinks();
 if(v.title==='Lecciones')v.html+='<a class="btn" href="#/sesion">Practicar con coach</a>';
 if(v.title==='Cancionero')v.html+='<a class="btn" href="#/practicar/setlist">Setlist de tu banda</a>';
 return v;
}
function drumExAction(b){const x=ALLEX.find(x=>x.id===b.dataset.id);if(!x)return false;
 if(b.dataset.x==='trk'&&x.drumTrack){location.hash=`#/practicar/banda?g=${x.fig.groove}&st=${TRACKST[x.drumTrack.st]}&bpm=${figBpm(x)}`;return true}
 if(b.dataset.x==='met'){if(SEQ.id==='met'&&OWNER==='ex:'+x.id)seqStop();else{OWNER='ex:'+x.id;drumMetStart({...x.met,bpm:figBpm(x),meter:x.met?.meter||G[x.fig.groove].meter+'/4',sub:x.met?.sub||1})}paintEx();return true}
 return false;
}
function viewDrumReference(){return{title:'Referencia de batería',back:'#/',html:`<div class="lhead"><h1>Conoce tu batería</h1><p class="sub">Una fila por pieza, una columna por instante. Se lee de izquierda a derecha.</p></div><section class="card">${kitSVG(G.rock)}<dl class="glos">${ROW_ORDER.map(row=>`<dt>${ROWS[row].a}: ${ROWS[row].n}</dt><dd>${['bd','hf'].includes(row)?'Se toca con el pie.':'Se toca con la mano o baqueta.'}</dd>`).join('')}</dl></section><section class="card"><h2>Cómo leer la rejilla</h2>${grooveGrid(G.rock)}<p>Cuenta 1 y 2 y 3 y 4 y. Punto lleno: golpe normal. Punto de color: acento. Punto pequeño: nota fantasma suave. Círculo vacío: hi-hat abierto. Casilla vacía: silencio. D e I indican mano derecha e izquierda; PD y PI, pies.</p><a class="btn" href="#/groove/rock">Escuchar la rejilla</a></section><div class="drum-links"><a class="btn" href="#/acordes">Rudimentos</a><a class="btn" href="#/referencia/glosario">Glosario</a><a class="btn" href="#/punteo">Técnica</a></div>`}}
function viewDrumGame(){return{title:'Lectura de rejilla',back:'#/practicar',html:`<div class="lhead"><h1>¿Qué patrón suena?</h1><p class="sub">Escucha e identifica negras, corcheas o tresillos.</p></div><button class="btn pri" id="dglisten">Escuchar</button><div id="dgoptions"></div><p id="dgresult" role="status"></p><button class="btn" id="dgnext">Otro patrón</button>`,mount(r){let answer='q',correct=0;const ids=['q','e','tr'];const next=()=>{grooveStop();answer=ids[Math.floor(Math.random()*ids.length)];$('#dgresult',r).textContent='Escucha antes de elegir.';$('#dgoptions',r).innerHTML=ids.map(id=>`<button class="card drum-choice" data-choice="${id}"><b>${G[id].n}</b>${grooveGrid(G[id],{limbs:false})}</button>`).join('')};$('#dglisten',r).onclick=async()=>{await kitLoad();grooveRun({id:'drumgame',g:G[answer],bpm:70,loops:1,drums:true,click:true})};$('#dgnext',r).onclick=next;r.addEventListener('click',e=>{const b=e.target.closest('[data-choice]');if(!b||b.disabled)return;const ok=b.dataset.choice===answer;$('#dgresult',r).textContent=ok?'Correcto: '+G[answer].n:'Escucha otra vez y cuenta las notas por pulso.';if(ok){correct++;DB.game.lectura=Math.max(DB.game.lectura||0,correct);markDay();save();$$('[data-choice]',r).forEach(el=>el.disabled=true)}});next();return grooveStop}}}
/* Rutina diaria de batería: reemplaza los bloques de guitarra (cromático, juego del mástil, blues). */
function rtBlocks(){
 const ex=nextEx(),sc={10:[2,2,4,2],15:[3,3,6,3],30:[5,5,14,6]}[RT.len];
 return[
  {t:'Rudimentos',d:'Redoble simple y doble con el metrónomo: D I D I y D D I I, parejos y relajados. Sube 4 bpm cuando salga limpio.',min:sc[0],met:60},
  {t:'Groove',d:'Toca el groove de rock: hi-hat en corcheas, bombo en 1 y 3, tarola en 2 y 4. Cuenta en voz alta.',min:sc[1],met:80},
  {t:'Lección',d:ex?`Lección ${ex.lesson} · ${ex.t}`:'Repasa el ejercicio que más te costó.',min:sc[2],ex},
  {t:'Con la banda',d:'Abre «Tocar con la banda» y sostén el groove sin parar; un fill de 1 tiempo cada 4 compases.',min:sc[3]}];
}
