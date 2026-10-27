/* Bass-specific presentation and note lines. Shared navigation/audio remain in mastil/src. */
function bassPosition(m){
 const candidates=[];for(const s of INST.desc){const f=m-OPEN_MIDI[s];if(f>=0&&f<=INST.frets)candidates.push({s,f,m})}
 if(candidates.length)return candidates.reduce((a,b)=>b.f<a.f?b:a);
 for(const shift of [12,-12,24,-24]){const n=m+shift;for(const s of INST.desc){const f=n-OPEN_MIDI[s];if(f>=0&&f<=INST.frets)return{s,f,m:n}}}
 return{s:INST.n,f:0,m:OPEN_MIDI[INST.n]};
}
function bassVoicing(p,shift){
 const pc=(p.pc+shift+120)%12,low=INST.rango[0],root=low+((pc-low%12+12)%12),intervals=CT[chType(p.suf)].semis;
 const dots=intervals.map(iv=>{const d=bassPosition(root+iv);return{...d,t:PCS[d.m%12][0],k:iv===0?'root':'note'}});autoFingers(dots);
 return {root,midi:dots.map(d=>d.m),strs:dots.map(d=>d.s),dots,frets:INST.desc.map(s=>dots.find(d=>d.s===s)?.f??null)};
}
function bassChordSVG(v){
 const r=bassPosition(v.root),f=bassPosition(v.root+7),o=bassPosition(v.root+12),dots=[r,f,o].map((d,i)=>({...d,t:['R','5','8'][i],k:i?'note':'root'}));autoFingers(dots);
 return fretboard({to:Math.max(5,...dots.map(d=>d.f+1)),dots,label:'Bajo: raíz, quinta y octava'});
}
function bassCaged(s){const root=KEYS[s.k].pc,dots=pos([root,(root+4)%12,(root+7)%12],0,12).map(([st,f])=>({s:st,f,k:(OPEN_PC[st]+f)%12===root?'root':'note',t:PCS[(OPEN_PC[st]+f)%12][0]}));return{dots,muted:[],shift:0,min:0,max:12}}
function bassArpeggios(r,t){
 const pc=Number.isFinite(+r)?((+r%12)+12)%12:0,type=CT[t]?t:'maj',C=CT[type],root=pcName(pc,false),notes=chordNotes(root,type),pcs=notes.map(n=>n.pc);
 const dots=pos(pcs,0,12).map(([s,f])=>({s,f,t:PCS[(OPEN_PC[s]+f)%12][0],k:(OPEN_PC[s]+f)%12===pc?'root':'note'}));
 const base=INST.rango[0]+((pc-INST.rango[0]%12+12)%12),seq=C.semis.map(iv=>bassPosition(base+iv)),fingerDots=autoFingers(seq.map(d=>({...d,t:PCS[d.m%12][0],k:d.m%12===pc?'root':'note'})));
 return{title:'Arpegios en el bajo',back:'#/referencia',html:`<div class="lhead"><h1>Arpegios en el bajo</h1><p class="sub">Un arpegio toca las notas de un acorde una después de otra. Elige la raíz y el tipo; escucha y recorre su digitación.</p></div><div class="chips hscroll">${PCS.map((n,i)=>`<a class="chip" aria-pressed="${pc===i}" href="#/acordes/${i}/${type}">${n[0]}</a>`).join('')}</div><div class="chips hscroll">${Object.entries(CT).map(([k,c])=>`<a class="chip" aria-pressed="${type===k}" href="#/acordes/${pc}/${k}">${c.label}</a>`).join('')}</div><div class="bass-arps"><section class="card"><h2>${root.es} ${C.label}</h2><p>${C.f.join(' · ')} = ${notes.map(n=>n.es).join(' · ')}</p><p>${C.ch}</p>${fretboard({dots:fingerDots,to:Math.max(5,...seq.map(d=>d.f+1)),label:'Digitación del arpegio'})}${playBtn(seq.map(d=>d.m),'seq','Escuchar arpegio',.65)}<p class="cap">${seq.map((d,i)=>`${notes[i].es}: cuerda ${d.s}, traste ${d.f}`).join(' · ')}</p></section><section class="card"><h2>Encuentra las mismas notas</h2>${fretboard({dots,to:12,tap:true,label:'Notas del acorde en todas las cuerdas'})}</section></div>`,mount(host){host.addEventListener('click',e=>{const hit=e.target.closest('[data-s][data-f]');if(hit&&ac())pluck(midiOf(+hit.dataset.s,+hit.dataset.f),AC.currentTime+.02,.8,.22)})}};
}
function bassPlayer(){return DB.bassPlayer!==false}
/* One mapping for the audible groove, the illuminated diagram and the challenge. */
function bassCell(id,beats,i,p,sh,bar,ci){
 if(!p)return null;const G=GROOVES[grooveFor(id,beats)],L=beats*G.sub,B=G[beats===3?3:4].b;
 const bi=((G.walk&&ci!=null?ci:i)%L+L)%L,c=B&&B[bi];if(!c||c==='-'||c==='.')return null;
 const w=c==='A'?(bar%2?'F':'R'):c,minor=p.minor||/^(m(?!aj)|min|-)/.test(p.suf),pc=((p.bass??p.pc)+sh+120)%12,root=28+((pc-4+12)%12);
 let m=root+({R:0,F:7,O:12,'3':minor?3:4,'6':9,'7':10}[w]||0);if(w==='F'&&m>40)m-=12;
 let n=1;while(bi+n<L&&B[bi+n]==='-')n++;return{...bassPosition(m),d:n/G.sub,degree:w,cell:bi};
}
function bassSide(p,st){
 const id=grooveFor(st.style,st.beats),G=GROOVES[id],line=G[st.beats===3?3:4].b,cells=[...line].map((c,i)=>{const n=bassCell(id,st.beats,i,p,st.shift,0,i);return`<span class="bass-cell" data-bcell="${i}"><b>${n?PCS[n.m%12][0]:c==='.'?'sil.':'—'}</b><small>${n?`${n.s}/${n.f}`:'sigue'}</small></span>`}).join('');
 const dots=[];for(let i=0;i<line.length;i++){const n=bassCell(id,st.beats,i,p,st.shift,0,i);if(n&&!dots.some(d=>d.s===n.s&&d.f===n.f))dots.push({...n,t:PCS[n.m%12][0]})}autoFingers(dots);
 return`<span class="cl">Línea de bajo · ${G.n}</span><p class="ks-tip">R: raíz · F: quinta · O: octava · 3: tercera · 6: sexta · 7: séptima menor · A: alterna raíz/quinta · punto: silencio · guion: sostén.</p><div class="bass-line" data-bassline><div class="bass-cells hscroll">${cells}</div><div data-bassboard>${fretboard({dots,to:Math.max(5,...dots.map(d=>d.f+1)),label:'Línea de bajo del groove'})}</div><p class="cap" data-bassnote>Escucha la banda o toca tú el bajo.</p></div><div id="ksch">${p?bassChordSVG(bassVoicing(p,st.shift)):''}</div>`;
}
function bassLight(host,x){
 const line=$('[data-bassline]',host);if(!line||!x||!x.p)return;
 const key=JSON.stringify([x.G,x.bt,x.p,x.sh,x.bar%2]);if(line.dataset.chord!==key){const side=$('#kside',host);side.innerHTML=bassSide(x.p,{style:x.G,beats:x.bt,shift:x.sh});$('[data-bassline]',host).dataset.chord=key}
 const G=GROOVES[grooveFor(x.G,x.bt)],L=x.bt*G.sub,bi=((G.walk?x.ci:x.i)%L+L)%L,n=bassCell(x.G,x.bt,x.i,x.p,x.sh,x.bar,x.ci);
 $$('.bass-cell',host).forEach(e=>e.classList.toggle('on',+e.dataset.bcell===bi));
 if(n){$$('[data-bassboard] .dg',host).forEach(e=>e.classList.toggle('on',+e.dataset.s===n.s&&+e.dataset.f===n.f));const status=$('[data-bassnote]',host);status.textContent=`${PCS[n.m%12][0]} · cuerda ${n.s}, traste ${n.f}`}
 else if(G[x.bt===3?3:4].b[bi]==='.'){$$('[data-bassboard] .dg.on',host).forEach(e=>e.classList.remove('on'));$('[data-bassnote]',host).textContent='Silencio: apaga la cuerda.'}
}
function bassSongNotes(P,TL,sh,style,beats){
 const id=grooveFor(style,beats),G=GROOVES[id],Q=G.sub,L=beats*Q,events=TL.ev.filter(e=>e.type==='chord').sort((a,b)=>a.b-b.b),out=[];let j=-1,cs=0;
 for(let k=0;k<Math.ceil(TL.total*Q);k++){while(j+1<events.length&&Math.round(events[j+1].b*Q)<=k){j++;cs=Math.round(events[j].b*Q)}if(j<0)continue;const rel=k-Math.round(P.pickup*Q),n=bassCell(id,beats,((rel%L)+L)%L,events[j].p,sh,Math.floor(rel/L),k-cs);if(n)out.push({...n,b:k/Q,d:Math.min(n.d,TL.total-k/Q)})}return out;
}
function bassChallenges(){return LESSONS.filter(l=>[1,3,4,6,8,10].includes(l.id)).map(l=>{const x=l.blocks.find(b=>b.ex).ex;return{id:x.id,n:x.t,sub:l.title,lvl:l.id<4?1:l.id<8?2:3,bpm:x.bpm||60,sty:'rock',chb:'0:Em',src:x.fig.arr.map(([s,f],i)=>[s,f,x.fig.durs[i]].join(',')).join(' ')}})}
function bassFigStart(x,preview){
 const F=x.fig,st=figState(x),own='fig:'+x.id+(preview?':p':''),base=F.arr.map(([s,f],i)=>({s,f,d:(F.durs||[])[i]||1}));
 const order=preview||!st.updown||base.length<3?base:base.concat(base.slice(1,-1).reverse()),per=preview?1:st.per,Q=2,count=preview?0:(F.beats||4)*Q;
 const starts=[];let total=0;order.forEach(n=>{starts.push(total);total+=Math.round(n.d*Q)});OWNER=own;
 seqStart('fig',(preview?'Escuchando · ':'Siguiendo · ')+x.t,()=>preview?.75/Q:60/figBpm(x)/per/Q,(s,t)=>{
  if(s<count){if(s%Q===0)tick(t,s===0?'acc':'beat');return}const k=s-count;if(preview&&k>=total)return;const at=k%total,i=starts.indexOf(at);
  if(!preview&&k%Q===0)tick(t,(k/Q)%(F.beats||4)===0?'acc':'beat');if(i>=0&&(preview||st.guide&&!st.mic))pluck(midiOf(order[i].s,order[i].f),t,(preview?.75:60/figBpm(x)/per)*order[i].d*.9,.22);
 },s=>{if(s<count){figStatus(x.id,'Cuenta: '+(Math.floor(s/Q)+1));return}const k=s-count;if(preview&&k>=total){seqStop();return}const i=starts.indexOf(k%total);if(i<0)return;
  if(!preview&&st.mic)fmStep(x,i,order.map(n=>[n.s,n.f]));const n=order[i];figLight(x.id,n.s,n.f);figStatus(x.id,`Nota ${i+1} de ${order.length} · ${figWhere(F,n.s,n.f)} · ${n.d/per} pulsos`);
 });paintFig();
}
function bassSettings(){return`<section class="card"><h2>Ajustes del bajo</h2><p>Elige tu instrumento. Al cambiar se guarda el avance y se recarga la app.</p><div class="bass-setting">${[4,5].map(n=>`<button class="btn" data-bass-strings="${n}" aria-pressed="${INST.n===n}">${n} cuerdas</button>`).join('')}</div></section>`}
document.addEventListener('click',e=>{const b=e.target.closest('[data-bass-strings]');if(b){DB.strings=+b.dataset.bassStrings;DB.tuning='std';save();location.reload()}});
function bassAdaptView(v){
 v.title=v.title.replace('Punteo','Técnica de bajo').replace('Acordes abiertos','Arpegios');
 v.html=v.html.replace(/con la guitarra/g,'con el bajo').replace(/tu guitarra/g,'tu bajo').replace(/la guitarra real/g,'el bajo real').replace(/Escuchando tu guitarra/g,'Escuchando tu bajo').replace(/Aprende guitarra/g,'Aprende bajo').replace(/Guitarra real/g,'Bajo real').replace(/cerca de la guitarra/g,'cerca del bajo').replace(/guitarra acústica/g,'bajo amplificado').replace(/cuerdas 6 a 1/g,`cuerdas ${INST.n} a 1`).replace(/teclas 1 a 6/g,`teclas 1 a ${INST.n}`).replace(/cuerda 6 a la 1/g,`cuerda ${INST.n} a la 1`);
 if(v.title==='Apariencia')v.html=bassSettings()+v.html;
 return v;
}
