/* Adapt the old coach/band contract to the shared GROOVES and offline renderer. */
function drumPlayer(){return DB.drumPlayer!==false}
function drumKey(key){const p=chParse(key||'C');return{pc:p?.pc||0,minor:!!p?.minor}}
function drumBeatById(id){const g=GROOVES[id];return g?{id,n:g.n,key:'C',beats:id==='vals'?3:4}:null}
function drumBandStyles(g){return Object.keys(GROOVES).filter(id=>GROOVES[id][g.meter===3?3:4]&&(g.sub===3?GROOVES[id].sub===3:GROOVES[id].sub!==3)).map(id=>({...drumBeatById(id),beats:g.meter===3?3:4}))}
const DRUM_BAND={nodes:[],rendering:Promise.resolve()};
function drumBandRender(id,bpm,key,meter){
 const work=async()=>{await loadSamples();const beats=meter===3?3:4,Q=GROOVES[id].sub,spb=60/bpm,pc=key?.pc||0;
  const names=[0,5,7,0].map(iv=>US_NAMES[(pc+iv)%12]+(key?.minor?'m':''));
  const steps=Array.from({length:4*beats*Q},(_,k)=>({G:id,bt:beats,i:k%(beats*Q),p:chParse(names[Math.floor(k/(beats*Q))]),sh:0,spb,bar:Math.floor(k/(beats*Q)),ci:k%(beats*Q)}));
  const before=DB.drumPlayer;DB.drumPlayer=true;let buf;try{buf=await bandRender(steps,spb/Q)}finally{DB.drumPlayer=before}
  return{parts:[buf],loop:4*beats*spb,bars:4,acordes:names,beat:{...drumBeatById(id),beats}};
 };const promise=DRUM_BAND.rendering.then(work);DRUM_BAND.rendering=promise.catch(()=>{});return promise;
}
function drumBandPlay(res,t0,vol){drumBandStop();const c=ac();for(const buf of res.parts){const node=c.createBufferSource(),gain=c.createGain();node.buffer=buf;node.loop=true;node.loopEnd=res.loop;gain.gain.value=vol??.9;node.connect(gain);gain.connect(out());node.start(t0);DRUM_BAND.nodes.push({node,gain})}}
function drumBandStop(){for(const {node,gain} of DRUM_BAND.nodes){try{node.stop();gain.disconnect()}catch(e){}}DRUM_BAND.nodes=[];bandStop()}
const DRUM_MAP={k:'bd',s:'sn',r:'rim',h:'hh',p:'mara',g2:'tamb',c:'cb'};
Object.assign(ROWS,{mara:{n:'Maracas',a:'MA',pad:'plat',k:['mara','mara',.42,.2,.1,0]},tamb:{n:'Pandero',a:'PA',pad:'plat',k:['tamb','tamb',.45,.2,.1,0]}});
ROW_ORDER.push('mara','tamb');
function drumSongGroove(id,beats,bar=0){
 const name=grooveFor(id,beats),groove=GROOVES[name],src=groove[beats===3?3:4],rows={};
 for(const [key,row] of Object.entries(DRUM_MAP))if(src[key]&&/[^-.]/.test(src[key]))rows[row]=src[key].replace(/\./g,'-');
 if(['rock','pop','country'].includes(name))rows.cr=(bar%8===0?'X':'-')+'-'.repeat(beats*groove.sub-1);
 return{id:name,n:groove.n,meter:beats,sub:groove.sub,cat:'Estilos',rows};
}
function drumSide(st){const g=drumSongGroove(st.style,st.beats);return`<span class="cl">Batería · ${esc(g.n)}</span><p class="cap">BO: bombo · TA: tarola · HH: hi-hat. La columna encendida indica cuándo tocar.</p><div data-drumline class="gridbox">${grooveGrid(g,{limbs:false})}</div>`}
function drumLight(root,x){const box=$('[data-drumline]',root);if(!box)return;const bar=x.bar||0,key=x.G+'|'+x.bt+'|'+(bar%8===0);if(box.dataset.pattern!==key){box.innerHTML=grooveGrid(drumSongGroove(x.G,x.bt,bar),{limbs:false});box.dataset.pattern=key}gridNow(box,x.i%(x.bt*GROOVES[grooveFor(x.G,x.bt)].sub))}
