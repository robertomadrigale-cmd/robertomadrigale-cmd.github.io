/* ---------- pantallas: sesiones, estudio y licencias ---------- */
const KEYOPTS=NOTE_ES.map((n,i)=>`<option value="${i}">${n}</option>`).join('');
function viewHome(){
  return{html:`<div class="page"><div class="top"><span class="logo">${logo()}</span><div class="grow"><span class="eyebrow">Roka Estudio</span><h1>Tus sesiones</h1></div><a class="btn sm" href="../roka/?cambiar">Apps</a></div>
    <p class="muted" style="margin:0">Elige un beat por género, cambia el tono y el tempo, y graba tu instrumento o tu voz encima.</p>
    <div class="toolbar"><button class="btn pri" data-h="new">${IC.plus}Nueva sesión</button><label class="btn">${IC.file}Abrir respaldo<input type="file" accept=".json,application/json" data-h="imp" hidden></label><a class="btn" href="#/licencias">${IC.info}Sonidos y licencias</a></div>
    <div id="cont"></div><h2>Sesiones guardadas</h2><div class="grid" id="list"><p class="muted">Cargando…</p></div>
    <p class="cap">Todo se guarda en este dispositivo. Batería: AVL Drumkits (CC BY-SA 3.0) · guitarra y bajo: tonejs-instruments (CC BY 3.0) · metales y teclados: VSCO 2 CE (CC0).</p></div>`,
  async mount(r){
    const list=await sesAll().catch(()=>[]);list.sort((a,b)=>b.editada-a.editada);
    $('#list',r).innerHTML=list.length?list.map(S=>{const b=S.genero&&beatById(S.genero);return`<a class="scard" href="#/s/${S.id}"><span class="cov">${b?beatArt(b):coverArt(218,'<path d="M10 50h80"/>','s'+S.id)}</span><span class="grow"><b>${esc(S.nombre)}</b><small>${noteName(S.tono.pc)}${S.tono.minor?' menor':''} · ${S.bpm} bpm · ${S.pistas.length} pistas</small></span></a>`}).join(''):'<p class="muted">Todavía no tienes sesiones. Crea una con el botón de arriba.</p>';
    const last=list.find(s=>s.id===DB.last);if(last)$('#cont',r).innerHTML=`<a class="scard" href="#/s/${last.id}" style="border-color:var(--accent)"><span class="cov">${last.genero&&beatById(last.genero)?beatArt(beatById(last.genero)):coverArt(218,'<path d="M10 50h80"/>','c')}</span><span class="grow"><span class="eyebrow">Continuar</span><b>${esc(last.nombre)}</b><small>Abierta por última vez ${new Date(last.editada).toLocaleString('es-MX',{dateStyle:'medium',timeStyle:'short'})}</small></span></a>`;
    r.addEventListener('click',async e=>{const b=e.target.closest('[data-h="new"]');if(!b)return;const S=newSession();await sesPut(S);location.hash='#/s/'+S.id+'?beats=1'});
    r.addEventListener('change',async e=>{const f=e.target.closest('[data-h="imp"]');if(!f||!f.files[0])return;try{const S=sessionFromJSON(await f.files[0].text());await sesPut(S);location.hash='#/s/'+S.id}catch(err){toast(esc(err.message))}});
  }};
}
function viewLicenses(){
  return{html:`<div class="page lic"><div class="top"><a class="btn sm" href="#/">${IC.back}Sesiones</a></div><span class="eyebrow">Créditos</span><h1>Sonidos y licencias</h1>
    <p class="muted" style="margin:0">Todos los sonidos tienen licencia que permite compartirlos. Los beats los genera la app con estos sonidos; tus grabaciones son tuyas y no salen de tu dispositivo.</p>
    ${Object.values(PACKS).map(p=>`<div class="card"><b>${esc(p.nombre)}</b><span class="muted">${esc(p.autor)} · <b style="display:inline">${esc(p.licencia)}</b></span><p class="cap" style="margin:6px 0 0">${esc(p.credito||'')}</p><a href="${p.url}" target="_blank" rel="noopener">${esc(p.url)}</a></div>`).join('')}
    <div class="card"><b>Aproximaciones</b><p class="cap" style="margin:6px 0 0">${BEATS.filter(b=>b.aprox).map(b=>`${esc(b.n)}: ${esc(b.aprox)}`).join('<br>')}</p></div></div>`};
}
/* ---------- estudio ---------- */
function viewStudio(id,q){
  return{full:true,html:`<div class="studio" data-tab="${q.get('beats')?'beats':'pistas'}">
   <aside class="lib" aria-label="Biblioteca de beats"><div class="lib-h"><div class="toolbar"><a class="btn sm" href="#/">${IC.back}Sesiones</a><b class="spacer"></b><a class="btn sm" href="#/licencias">${IC.info}</a></div>
     <div><span class="eyebrow">Beats · ${BEATS.length} estilos</span><h2>Biblioteca</h2></div>
     <div class="chips hscroll" id="gens"><button class="chip" data-gen="" aria-pressed="true">Todos</button>${BEAT_GENRES.map(g=>`<button class="chip" data-gen="${g}" aria-pressed="false">${g}</button>`).join('')}</div>
     <div class="chips" id="comp"><button class="chip" data-comp="" aria-pressed="true">Todos</button><button class="chip" data-comp="3" aria-pressed="false">3/4</button><button class="chip" data-comp="4" aria-pressed="false">4/4</button></div></div>
     <div class="lib-list" id="libl"></div></aside>
   <section class="main"><div class="mtabs" role="tablist">${[["pistas","Pistas"],["beats","Beats"],["mezcla","Mezcla"]].map(([k,l])=>`<button class="chip" data-tab="${k}" aria-pressed="${(q.get('beats')?'beats':'pistas')===k}">${l}</button>`).join('')}</div>
    <div class="transport"><span class="clock" id="clock">00:00.000</span>
     <button class="tbtn play" id="tplay" aria-label="Reproducir">${IC.play}</button><button class="tbtn" id="tstop" aria-label="Detener e ir al inicio">${IC.stop}</button><button class="tbtn rec" id="trec" aria-label="Grabar">${IC.rec}</button>
     <button class="tbtn" id="tloop" aria-pressed="false" aria-label="Ciclo">${IC.loop}</button><button class="tbtn" id="tmet" aria-pressed="${!!DB.metro}" aria-label="Metrónomo">${IC.metro}</button>
     <label class="tsel">BPM<input id="tbpm" type="number" min="50" max="200" inputmode="numeric"></label>
     <label class="tsel">Tono<select id="tkey">${KEYOPTS}</select><select id="tmin"><option value="0">mayor</option><option value="1">menor</option></select></label>
     <span class="spacer"></span>
     <button class="tbtn" id="zout" aria-label="Alejar">${IC.zout}</button><button class="tbtn" id="zin" aria-label="Acercar">${IC.zin}</button>
     <label class="tbtn" aria-label="Importar audio">${IC.file}<input type="file" id="fimp" accept="audio/*,video/mp4" hidden></label></div>
    <div class="tl"><div class="heads"><div class="heads-in" id="heads"></div></div><div class="lanes" id="lanes"><div class="lanes-in" id="lin"><div class="ruler" id="ruler"><div class="loopband" id="loopband"></div></div><div id="rows"></div><div class="playhead" id="ph"></div></div><div class="empty" id="empty" hidden></div></div></div>
    <div class="dock"><div class="dtabs"><button class="chip" data-dt="clip" aria-pressed="true">Clip</button><button class="chip" data-dt="mezcla" aria-pressed="false">Mezcla</button><button class="chip" data-dt="ajustes" aria-pressed="false">Ajustes</button></div><div class="dbody" id="dbody"></div></div>
   </section></div>`,
  async mount(r){
    let S=await sesGet(id);if(!S){r.innerHTML='<div class="page"><h1>No encontré esa sesión</h1><a class="btn" href="#/">Volver</a></div>';return}
    E.S=S;E.cursor=0;E.loop={on:false,a:0,b:barDur(S)*4};DB.last=S.id;save();
    const had=S.pistas.some(t=>t.clips.length);
    let pps=innerWidth<860?40:64,sel=null,dt='clip',gen='',comp='',raf=0,alive=true,saveT=0,preview=null;
    const studio=$('.studio',r),lanes=$('#lanes',r),lin=$('#lin',r),rows=$('#rows',r),heads=$('#heads',r);
    const persist=()=>{clearTimeout(saveT);saveT=setTimeout(()=>{S.editada=Date.now();sesPut(S).catch(()=>toast('No se pudo guardar.'))},500)};
    const snap=t=>{const g=beatDur(S)/2;return Math.max(0,Math.round(t/g)*g)};
    const clipOf=cid=>{for(const t of S.pistas){const c=t.clips.find(x=>x.id===cid);if(c)return[t,c]}return[null,null]};
    // ---------- pintar ----------
    function paintHeads(){heads.innerHTML=S.pistas.map(t=>`<div class="head" data-t="${t.id}" style="--tc:${ROLES[t.rol].c}"><div class="hn"><b title="${esc(t.nombre)}">${esc(t.nombre)}</b><button class="sm m" data-hm="mute" aria-pressed="${t.mute}" aria-label="Silenciar">M</button><button class="sm s" data-hm="solo" aria-pressed="${t.solo}" aria-label="Solo">S</button></div><input type="range" min="0" max="1" step=".01" value="${t.vol}" data-hv aria-label="Volumen de ${esc(t.nombre)}"></div>`).join('')}
    function paintLanes(){
      const total=Math.max(songEnd(S)+barDur(S)*8,40),W=Math.ceil(total*pps);lin.style.width=W+'px';
      const bd=beatDur(S);let marks='';for(let k=0;k*bd<=total;k++){const bar=k%S.compas===0;if(!bar&&pps*bd<14)continue;marks+=`<i class="${bar?'bar':''}" style="left:${(k*bd*pps).toFixed(1)}px"></i>${bar?`<span style="left:${(k*bd*pps).toFixed(1)}px">${k/S.compas+1}</span>`:''}`}
      $('#ruler',r).innerHTML=marks+'<div class="loopband" id="loopband"></div>';paintLoop();
      rows.innerHTML=S.pistas.map(t=>`<div class="lane" data-t="${t.id}" style="--tc:${ROLES[t.rol].c}">${t.clips.map(c=>`<div class="clip${BUF.has(c.id)?'':' loading'}${c.id===sel?' sel':''}" data-c="${c.id}" style="left:${c.inicio*pps}px;width:${Math.max(8,c.dur*pps)}px"><span class="hl"></span><span class="cn">${esc(c.nombre||ROLES[t.rol].n)}</span><canvas></canvas><span class="hr"></span></div>`).join('')}</div>`).join('');
      $$('.clip',rows).forEach(el=>drawClip(el));
      const em=$('#empty',r);em.hidden=S.pistas.length>0;em.innerHTML=`<p>Tu sesión está vacía.</p><button class="btn pri" data-go="beats">${IC.music}Elegir un beat</button> <label class="btn">${IC.file}Importar audio<input type="file" accept="audio/*,video/mp4" data-imp2 hidden></label>`;
    }
    function drawClip(el){const[t,c]=clipOf(el.dataset.c);const b=c&&BUF.get(c.id),cv=$('canvas',el);if(!b||!cv)return;
      const dpr=Math.min(2,devicePixelRatio||1),w=Math.max(1,el.clientWidth),h=Math.max(1,el.clientHeight-18);cv.width=w*dpr;cv.height=h*dpr;const x=cv.getContext('2d');x.scale(dpr,dpr);
      const p=peaks(b),i0=c.offset/b.duration*p.length,i1=(c.offset+c.dur)/b.duration*p.length;x.fillStyle=getComputedStyle(el.parentNode).getPropertyValue('--tc')||'#5b9cff';x.globalAlpha=.9;
      for(let px=0;px<w;px++){const k=Math.floor(i0+(i1-i0)*px/w),v=p[Math.min(p.length-1,k)]||0,hh=Math.max(1,v*h*.92);x.fillRect(px,(h-hh)/2,1,hh)}}
    function paintLoop(){const lb=$('#loopband',r);if(!lb)return;lb.classList.toggle('on',E.loop.on);lb.style.left=E.loop.a*pps+'px';lb.style.width=(E.loop.b-E.loop.a)*pps+'px';$('#tloop',r).setAttribute('aria-pressed',String(E.loop.on))}
    function paintTransport(){$('#tplay',r).innerHTML=E.playing?IC.stop.replace('rect','rect'):IC.play;$('#tplay',r).setAttribute('aria-label',E.playing?'Pausa':'Reproducir');$('#trec',r).classList.toggle('on',!!E.rec);$('#tbpm',r).value=S.bpm;$('#tkey',r).value=S.tono.pc;$('#tmin',r).value=S.tono.minor?1:0}
    function paintLib(){const list=BEATS.filter(b=>(!gen||b.gen===gen)&&(!comp||String(b.beats)===comp));
      $('#libl',r).innerHTML=list.map(b=>`<div class="bcard" data-b="${b.id}"><div class="row1"><span class="cov">${beatArt(b)}</span><div style="min-width:0;flex:1"><b>${esc(b.n)}</b><small>${esc(b.gen)} · ${b.beats}/4 · ${b.bpm[0]}–${b.bpm[1]} bpm</small></div><button class="tbtn" data-bp aria-label="Escuchar ${esc(b.n)}">${IC.play}</button></div>
        <div class="row2"><select class="chip" data-bpart aria-label="Parte"><option value="A">Parte A</option><option value="B">Parte B</option><option value="F">Relleno</option></select><select class="chip" data-bbars aria-label="Compases"><option value="4">4 compases</option><option value="8">8 compases</option><option value="2">2 compases</option></select>
        <select class="chip" data-bprog aria-label="Progresión">${b.prog.map((p,i)=>`<option value="${i}">${p.join('–')}</option>`).join('')}</select><button class="btn sm pri" data-badd>${IC.plus}Agregar</button></div>${b.aprox?`<small>${esc(b.aprox)}</small>`:''}</div>`).join('')}
    function paintDock(){const d=$('#dbody',r);$$('[data-dt]',r).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.dt===dt)));
      if(dt==='clip'){const[t,c]=sel?clipOf(sel):[null,null];
        d.innerHTML=!c?`<p class="cap" style="margin:0">Toca un clip para moverlo, recortarlo desde sus orillas, duplicarlo o dividirlo. Toca la regla de arriba para mover el cursor. Atajos: espacio = reproducir, R = grabar, Supr = borrar.</p>`
        :`<div class="toolbar"><b style="margin-right:6px">${esc(c.nombre||t.nombre)}</b><button class="btn sm" data-ca="dup">${IC.copy}Duplicar</button><button class="btn sm" data-ca="split">${IC.cut}Dividir en el cursor</button><button class="btn sm" data-ca="loop">${IC.loop}Ciclo con este clip</button><button class="btn sm danger" data-ca="del">${IC.trash}Borrar</button>
        ${c.fuente.beat?`<select class="chip" data-cpart>${['A','B','F'].map(p=>`<option value="${p}" ${c.fuente.beat.parte===p?'selected':''}>${p==='F'?'Relleno':'Parte '+p}</option>`).join('')}</select>`:''}</div>
        <p class="cap" style="margin:8px 0 0">Empieza en ${fmtT(c.inicio)} · dura ${c.dur.toFixed(2)} s${c.fuente.beat?` · ${esc(beatById(c.fuente.beat.id).n)}`:''}</p>`}
      else if(dt==='mezcla'){d.innerHTML=`<div class="mix">${S.pistas.map(t=>`<div class="strip" data-t="${t.id}" style="--tc:${ROLES[t.rol].c}"><b>${esc(t.nombre)}</b><div class="meter"><i data-meter="${t.id}"></i></div>
          <label>Volumen<input type="range" min="0" max="1" step=".01" value="${t.vol}" data-mx="vol"></label><label>Paneo (izq · der)<input type="range" min="-1" max="1" step=".05" value="${t.pan}" data-mx="pan"></label>
          <label>Graves<input type="range" min="-12" max="12" step="1" value="${t.eq[0]}" data-mx="eq0"></label><label>Medios<input type="range" min="-12" max="12" step="1" value="${t.eq[1]}" data-mx="eq1"></label><label>Agudos<input type="range" min="-12" max="12" step="1" value="${t.eq[2]}" data-mx="eq2"></label>
          <label>Sala (reverb)<input type="range" min="0" max=".8" step=".02" value="${t.rev}" data-mx="rev"></label><button class="btn sm danger" data-tdel>${IC.trash}Quitar pista</button></div>`).join('')}
          <div class="strip" style="--tc:var(--fg)"><b>Master</b><div class="meter"><i data-meter="master"></i></div><label>Volumen<input type="range" min="0" max="1.2" step=".01" value="${S.master.vol}" data-mx="master"></label></div></div>`}
      else d.innerHTML=`<div class="toolbar" style="flex-direction:column;align-items:stretch;gap:12px;max-width:520px">
        <label class="tsel" style="justify-content:space-between">Nombre<input id="sname" value="${esc(S.nombre)}" style="max-width:none;width:100%"></label>
        <label class="tsel" style="justify-content:space-between">Sincronizar grabación <input type="range" id="roff" min="-250" max="250" step="5" value="${DB.recOff||0}" style="max-width:none;width:160px"><b id="roffv">${DB.recOff||0} ms</b></label>
        <label class="tsel" style="justify-content:space-between">Cuenta de un compás antes de grabar<input type="checkbox" id="cnt" ${DB.count?'checked':''}></label>
        <div class="toolbar"><button class="btn" data-s="wav">${IC.down}Exportar mezcla (WAV)</button><button class="btn" data-s="stems">${IC.down}Exportar pistas</button><button class="btn" data-s="json">${IC.save}Respaldo (.roka.json)</button><button class="btn danger" data-s="delete">${IC.trash}Borrar sesión</button></div>
        <p class="cap" style="margin:0">Usa audífonos al grabar para que la banda no se meta en el micrófono. Si tu grabación suena adelantada o atrasada, mueve «Sincronizar grabación» y vuelve a grabar.</p></div>`;
    }
    const repaint=()=>{paintHeads();paintLanes();paintDock();paintTransport()};
    // ---------- cargar audio ----------
    repaint();paintLib();
    ensureBuffers(S,c=>{const el=$(`.clip[data-c="${c.id}"]`,rows);if(el){el.classList.remove('loading');el.style.width=Math.max(8,c.dur*pps)+'px';drawClip(el)}}).then(()=>{paintLanes();if(had)toast('Sesión recuperada')});
    // ---------- beats ----------
    async function addBeat(card){
      const b=beatById(card.dataset.b),parte=$('[data-bpart]',card).value,compases=+$('[data-bbars]',card).value,prog=+$('[data-bprog]',card).value;
      const empty=!S.pistas.some(t=>t.clips.length);
      if(empty){S.bpm=b.bpm[2];S.tono=parseKey(b.key);S.compas=b.beats;S.genero=b.id}
      else if(b.beats!==S.compas)toast(`Ojo: este beat es de ${b.beats}/4 y tu sesión de ${S.compas}/4.`);
      const btn=$('[data-badd]',card);btn.disabled=true;btn.textContent='Generando…';
      try{const f={id:b.id,parte,compases,prog,entrada:empty};const res=await beatRender(S,f);
        const at=Math.max(0,...S.pistas.filter(t=>['bateria','bajo','armonia','metales'].includes(t.rol)).flatMap(t=>t.clips.map(c=>c.inicio+c.dur)));
        for(const rol of ['bateria','bajo','armonia','metales']){if(!res[rol])continue;const t=trackFor(S,rol,rol==='bajo'&&b.inst.bajo==='tuba'?'Tuba':rol==='armonia'?({guitarra:'Guitarra',piano:'Piano',organo:'Órgano'}[b.inst.arm]):ROLES[rol].n);
          const c={id:uid(),inicio:at,dur:res.dur,offset:0,nombre:`${b.n} · ${parte==='F'?'relleno':parte}`,fuente:{beat:Object.assign({rol},f)}};t.clips.push(c);BUF.set(c.id,res[rol])}
        if(empty){E.loop={on:false,a:0,b:res.dur}}persist();if(innerWidth<860){studio.dataset.tab='pistas';$$('.mtabs [data-tab]',r).forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.tab==='pistas')))}repaint();toast(`${esc(b.n)} agregado · ${res.acordes.join(' – ')}`);
      }catch(e){toast('No se pudo generar el beat: '+esc(e.message))}finally{btn.disabled=false;btn.innerHTML=IC.plus+'Agregar'}
    }
    async function previewBeat(card,btn){
      if(preview){preview.forEach(s=>{try{s.stop()}catch(e){}});const was=preview.card;preview=null;$$('[data-bp]',r).forEach(x=>x.innerHTML=IC.play);if(was===card)return}
      const b=beatById(card.dataset.b);btn.innerHTML='…';
      try{const res=await renderBeat({id:b.id,parte:'A',compases:2,prog:+$('[data-bprog]',card).value,bpm:S.pistas.length?S.bpm:b.bpm[2],tono:S.pistas.length?S.tono:parseKey(b.key)});
        const c=ac(),t=c.currentTime+.05;preview=['bateria','bajo','armonia','metales'].filter(k=>res[k]).map(k=>{const s=c.createBufferSource();s.buffer=res[k];s.connect(c.destination);s.start(t);return s});preview.card=card;btn.innerHTML=IC.stop;
        setTimeout(()=>{if(preview&&preview.card===card){preview=null;btn.innerHTML=IC.play}},res.dur*1000+1300)}catch(e){btn.innerHTML=IC.play;toast('No se pudo escuchar: '+esc(e.message))}
    }
    // ---------- tono y tempo ----------
    async function retune(newBpm,newKey){
      const old=S.bpm;if(newBpm)S.bpm=Math.max(50,Math.min(200,Math.round(newBpm)));if(newKey)S.tono=newKey;
      const ratio=old/S.bpm;let audio=false;for(const t of S.pistas)for(const c of t.clips){if(c.fuente.beat){c.inicio*=ratio;c.dur*=ratio;BUF.delete(c.id)}else audio=true}
      E.loop.a*=ratio;E.loop.b*=ratio;stop();persist();paintLanes();await ensureBuffers(S);paintLanes();if(audio)toast('Los beats cambiaron; tus grabaciones y audios no cambian de tono ni de tempo.');
    }
    // ---------- eventos ----------
    r.addEventListener('click',async e=>{
      const tb=e.target.closest('.mtabs [data-tab]');if(tb){studio.dataset.tab=tb.dataset.tab;$$('.mtabs [data-tab]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===tb)));if(tb.dataset.tab==='pistas')requestAnimationFrame(paintLanes);return}
      const go=e.target.closest('[data-go]');if(go){studio.dataset.tab=innerWidth<860?'beats':'pistas';if(innerWidth>=860)$('#libl',r).scrollTop=0;return}
      const g=e.target.closest('[data-gen]');if(g){gen=g.dataset.gen;$$('[data-gen]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===g)));paintLib();return}
      const cp=e.target.closest('[data-comp]');if(cp){comp=cp.dataset.comp;$$('[data-comp]',r).forEach(x=>x.setAttribute('aria-pressed',String(x===cp)));paintLib();return}
      const bp=e.target.closest('[data-bp]');if(bp){previewBeat(bp.closest('.bcard'),bp);return}
      const ba=e.target.closest('[data-badd]');if(ba){addBeat(ba.closest('.bcard'));return}
      const d=e.target.closest('[data-dt]');if(d){dt=d.dataset.dt;paintDock();return}
      const hm=e.target.closest('[data-hm]');if(hm){const t=S.pistas.find(p=>p.id===hm.closest('[data-t]').dataset.t);t[hm.dataset.hm]=!t[hm.dataset.hm];refreshMix();persist();paintHeads();return}
      const ca=e.target.closest('[data-ca]');if(ca){const[t,c]=clipOf(sel);if(!c)return;const a=ca.dataset.ca;
        if(a==='del'){t.clips=t.clips.filter(x=>x!==c);if(c.fuente.audio&&!S.pistas.some(p=>p.clips.some(x=>x.fuente.audio===c.fuente.audio)))audDel(c.fuente.audio).catch(()=>{});sel=null}
        else if(a==='dup'){const n=Object.assign({},c,{id:uid(),inicio:c.inicio+c.dur,fuente:JSON.parse(JSON.stringify(c.fuente))});t.clips.push(n);BUF.set(n.id,BUF.get(c.id));sel=n.id}
        else if(a==='split'){const at=position();if(at<=c.inicio+.05||at>=c.inicio+c.dur-.05){toast('Pon el cursor dentro del clip para dividirlo.');return}const n=Object.assign({},c,{id:uid(),inicio:at,offset:c.offset+(at-c.inicio),dur:c.inicio+c.dur-at,fuente:JSON.parse(JSON.stringify(c.fuente))});c.dur=at-c.inicio;t.clips.push(n);BUF.set(n.id,BUF.get(c.id))}
        else if(a==='loop'){E.loop={on:true,a:c.inicio,b:c.inicio+c.dur};if(E.playing)play(S,E.loop.a)}
        persist();paintLanes();paintDock();paintLoop();return}
      const tdel=e.target.closest('[data-tdel]');if(tdel){const id=tdel.closest('[data-t]').dataset.t,t=S.pistas.find(p=>p.id===id);if(!confirm(`¿Quitar la pista «${t.nombre}» y sus clips?`))return;S.pistas=S.pistas.filter(p=>p!==t);E.chains.delete(id);persist();repaint();return}
      const st=e.target.closest('[data-s]');if(st){const a=st.dataset.s;
        if(a==='wav'){toast('Preparando la mezcla…');try{download(await exportMix(S),S.nombre.replace(/[^\wáéíóúñ -]/gi,'')+'.wav')}catch(err){toast(esc(err.message))}}
        else if(a==='stems'){toast('Preparando las pistas…');for(const t of S.pistas){if(!t.clips.length)continue;try{download(await exportMix(S,t.id),S.nombre+' - '+t.nombre+'.wav')}catch(err){}}}
        else if(a==='json')download(new Blob([sessionJSON(S)],{type:'application/json'}),S.nombre+'.roka.json');
        else if(a==='delete'){if(!confirm('¿Borrar esta sesión y sus grabaciones? No se puede deshacer.'))return;stop();for(const t of S.pistas)for(const c of t.clips)if(c.fuente.audio)audDel(c.fuente.audio).catch(()=>{});await sesDel(S.id);location.hash='#/'}
        return}
    });
    r.addEventListener('input',e=>{
      const hv=e.target.closest('[data-hv]');if(hv){const t=S.pistas.find(p=>p.id===hv.closest('[data-t]').dataset.t);t.vol=+hv.value;refreshMix();persist();return}
      const mx=e.target.closest('[data-mx]');if(mx){const k=mx.dataset.mx,v=+mx.value;if(k==='master'){S.master.vol=v}else{const t=S.pistas.find(p=>p.id===mx.closest('[data-t]').dataset.t);if(k==='vol'||k==='pan'||k==='rev')t[k]=v;else t.eq[+k.slice(2)]=v}refreshMix();persist();return}
      if(e.target.id==='roff'){DB.recOff=+e.target.value;save();$('#roffv',r).textContent=DB.recOff+' ms'}
      if(e.target.id==='sname'){S.nombre=e.target.value.slice(0,60)||'Sesión';persist()}
    });
    r.addEventListener('change',async e=>{
      if(e.target.id==='cnt'){DB.count=e.target.checked;save();return}
      if(e.target.id==='tbpm'){retune(+e.target.value,null);return}
      if(e.target.id==='tkey'||e.target.id==='tmin'){retune(null,{pc:+$('#tkey',r).value,minor:$('#tmin',r).value==='1'});return}
      const cpart=e.target.closest('[data-cpart]');if(cpart){const[t,c]=clipOf(sel);c.fuente.beat.parte=cpart.value;BUF.delete(c.id);c.nombre=c.nombre.replace(/· .*$/,'· '+(cpart.value==='F'?'relleno':cpart.value));await ensureBuffers(S);persist();paintLanes();return}
      const fi=e.target.id==='fimp'||e.target.matches('[data-imp2]');if(fi&&e.target.files[0]){const f=e.target.files[0];e.target.value='';
        toast('Importando '+esc(f.name)+'…');try{const b=await ac().decodeAudioData(await f.arrayBuffer());const aid=uid();await audPut(aid,f);const t={id:uid(),nombre:f.name.replace(/\.[^.]+$/,'').slice(0,28),rol:'audio',vol:.85,pan:0,mute:false,solo:false,eq:[0,0,0],rev:0,clips:[]};
          const c={id:uid(),inicio:snap(E.cursor),dur:b.duration,offset:0,nombre:t.nombre,fuente:{audio:aid}};t.clips.push(c);S.pistas.push(t);BUF.set(c.id,b);persist();repaint();toast('Audio importado')}catch(err){toast('No pude leer ese archivo. Prueba con MP3, M4A o WAV.')}}
    });
    // transporte
    $('#tplay',r).onclick=()=>{if(E.rec){finishRec();return}if(E.playing)stop();else play(S,E.cursor);paintTransport()};
    $('#tstop',r).onclick=()=>{if(E.rec){finishRec();return}stop();E.cursor=E.loop.on?E.loop.a:0;paintTransport()};
    $('#trec',r).onclick=async()=>{if(E.rec){finishRec();return}if(await recStart(S))paintTransport()};
    $('#tloop',r).onclick=()=>{E.loop.on=!E.loop.on;if(E.loop.b<=E.loop.a)E.loop.b=E.loop.a+barDur(S)*4;paintLoop();if(E.playing)play(S,position())};
    $('#tmet',r).onclick=e=>{DB.metro=!DB.metro;save();e.currentTarget.setAttribute('aria-pressed',String(DB.metro));if(E.playing)play(S,position())};
    $('#zin',r).onclick=()=>{pps=Math.min(260,pps*1.4);paintLanes()};$('#zout',r).onclick=()=>{pps=Math.max(12,pps/1.4);paintLanes()};
    async function finishRec(){const res=await recStop(S);paintTransport();if(!res){toast('La grabación fue muy corta.');return}
      const aid=uid();await audPut(aid,wavBlob(res.buf));const n=S.pistas.filter(p=>p.rol==='voz').length+1;const t={id:uid(),nombre:'Grabación '+n,rol:'voz',vol:.9,pan:0,mute:false,solo:false,eq:[0,0,0],rev:.18,clips:[]};
      const c={id:uid(),inicio:res.start,dur:res.buf.duration,offset:0,nombre:'Grabación '+n,fuente:{audio:aid}};t.clips.push(c);S.pistas.push(t);BUF.set(c.id,res.buf);sel=c.id;persist();repaint();toast('Grabación guardada')}
    // regla: mover el cursor (Mayús + arrastrar = región de ciclo)
    $('#ruler',r).addEventListener('pointerdown',e=>{const x0=e.clientX-lin.getBoundingClientRect().left,t0=snap(x0/pps);
      if(e.shiftKey){const mv=ev=>{const t1=snap((ev.clientX-lin.getBoundingClientRect().left)/pps);E.loop={on:true,a:Math.min(t0,t1),b:Math.max(t0,t1)+.001};paintLoop()};const up=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up)};addEventListener('pointermove',mv);addEventListener('pointerup',up);return}
      E.cursor=x0/pps;if(E.playing)play(S,E.cursor)});
    // clips: mover y recortar (se ajustan a medio tiempo)
    rows.addEventListener('pointerdown',e=>{const el=e.target.closest('.clip');if(!el)return;const[t,c]=clipOf(el.dataset.c);if(!c)return;
      sel=c.id;$$('.clip.sel',rows).forEach(x=>x.classList.remove('sel'));el.classList.add('sel');paintDock();
      const mode=e.target.classList.contains('hl')?'l':e.target.classList.contains('hr')?'r':'m',x0=e.clientX,o={inicio:c.inicio,dur:c.dur,offset:c.offset},b=BUF.get(c.id),maxD=b?b.duration:1e9;el.setPointerCapture(e.pointerId);let moved=false;
      const mv=ev=>{const dx=(ev.clientX-x0)/pps;if(Math.abs(ev.clientX-x0)>3)moved=true;
        if(mode==='m')c.inicio=snap(o.inicio+dx);
        else if(mode==='l'){let ni=snap(o.inicio+dx);ni=Math.max(o.inicio-o.offset,Math.min(o.inicio+o.dur-.1,ni));c.offset=o.offset+(ni-o.inicio);c.dur=o.dur-(ni-o.inicio);c.inicio=ni}
        else{let ne=snap(o.inicio+o.dur+dx);ne=Math.max(o.inicio+.1,Math.min(o.inicio+(maxD-o.offset),ne));c.dur=ne-o.inicio}
        el.style.left=c.inicio*pps+'px';el.style.width=Math.max(8,c.dur*pps)+'px';if(mode!=='m')drawClip(el)};
      const up=()=>{el.removeEventListener('pointermove',mv);el.removeEventListener('pointerup',up);if(moved){persist();paintDock();if(mode!=='m')drawClip(el)}};
      el.addEventListener('pointermove',mv);el.addEventListener('pointerup',up)});
    // desplazamiento vertical sincronizado de cabeceras y carriles
    lanes.addEventListener('scroll',()=>{heads.parentNode.scrollTop=lanes.scrollTop});
    const key=e=>{if(e.target.matches('input,select,textarea'))return;if(e.code==='Space'){e.preventDefault();$('#tplay',r).click()}else if(e.key==='r'||e.key==='R')$('#trec',r).click();else if((e.key==='Delete'||e.key==='Backspace')&&sel){const b=$('[data-ca="del"]',r);if(b)b.click()}};
    document.addEventListener('keydown',key);
    let rz=0;const onRz=()=>{clearTimeout(rz);rz=setTimeout(paintLanes,200)};addEventListener('resize',onRz);
    const onT=()=>paintTransport();document.addEventListener('transport',onT);
    // cursor, reloj, medidores
    const meterBuf=new Uint8Array(512);const lvl=an=>{an.getByteTimeDomainData(meterBuf);let m=0;for(const v of meterBuf)m=Math.max(m,Math.abs(v-128));return m/128};
    const frame=()=>{if(!alive)return;const p=position();$('#ph',r).style.left=p*pps+'px';$('#clock',r).textContent=fmtT(p);
      if(E.playing){const x=p*pps;if(x>lanes.scrollLeft+lanes.clientWidth-40||x<lanes.scrollLeft)lanes.scrollLeft=Math.max(0,x-60)}
      if(dt==='mezcla'&&E.master){for(const t of S.pistas){const ch=E.chains.get(t.id),el=$(`[data-meter="${t.id}"]`,r);if(ch&&el)el.style.width=Math.min(100,lvl(ch.an)*140)+'%'}const mm=$('[data-meter="master"]',r);if(mm)mm.style.width=Math.min(100,lvl(E.master.an)*140)+'%'}
      raf=requestAnimationFrame(frame)};frame();
    return()=>{alive=false;cancelAnimationFrame(raf);removeEventListener('resize',onRz);document.removeEventListener('keydown',key);document.removeEventListener('transport',onT);if(E.rec)recStop(S);stop(true);if(preview)preview.forEach(s=>{try{s.stop()}catch(e){}});E.chains.clear();clearTimeout(saveT);S.editada=Date.now();sesPut(S).catch(()=>{})};
  }};
}
