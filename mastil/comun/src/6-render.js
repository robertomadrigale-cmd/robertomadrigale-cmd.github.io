/* Genera un beat en pistas separadas (batería, bajo, armonía, metales) con OfflineAudioContext y los packs grabados.
   renderBeat({id, parte:'A'|'B'|'F', compases, bpm, tono:{pc,minor}, prog:índice}) → {bateria,bajo,armonia,metales, dur, acordes}
   Los AudioBuffer resultantes se usan como clips en cualquier app (estudio, bajo, batería…). */
const DRUM_MAP={k:['kick2','kick1',.95,-.03,.04],s:['snare2','snare1',.72,.04,.22],r:['rim','rim',.6,.1,.12],l:['clap','clap',.55,-.05,.2],
  h:['hat2','hat1',.4,.3,.06],o:['hato','hato',.42,.3,.15],p:['hatp','hatp',.35,.3,.05],y:['ride','ride',.4,-.25,.14],c:['crash','crash',.5,-.2,.22],
  t:['tom','tom',.6,.15,.18],f:['ftom','ftom',.65,-.15,.18],m:['mara','mara',.38,.2,.08],a:['tamb','tamb',.38,-.2,.1],w:['cow','cow',.4,.12,.1]};
const BEAT_PACKS=b=>['bateria',b.inst.bajo||'bajo',b.inst.arm,b.inst.met?'trompeta':null,b.inst.met?'trombon':null].filter(Boolean);
async function beatPacks(b){await Promise.all(BEAT_PACKS(b).map(id=>loadPack(id)))}
function beatChords(b,tono,progIdx,compases){
  const prog=b.prog[progIdx%b.prog.length]||b.prog[0],key=tono||parseKey(b.key);
  return Array.from({length:compases},(_,i)=>chordOf(prog[i%prog.length],key.pc,key.minor));
}
// pequeñas variaciones para que no suene a máquina (siempre las mismas para el mismo beat: generador con semilla)
function rng(seed){let s=seed|0||1;return()=>((s=Math.imul(s^s>>>15,2246822507)^Math.imul(s^s>>>13,3266489909))>>>0)/4294967296}
async function renderBeat(o){
  const b=beatById(o.id);if(!b)throw Error('Beat desconocido: '+o.id);
  await beatPacks(b);
  const bpm=o.bpm||b.bpm[2],comp=o.compases||4,part=b.parts[o.parte||'A']||b.parts.A,L=b.beats*4,step=60/bpm/4;
  const chords=beatChords(b,o.tono,o.prog||0,comp),dur=comp*L*step+1.2,sr=44100;
  const swing=t=>t; // reservado: swing por estilo
  const make=async(fill)=>{const c=new OfflineAudioContext(2,Math.ceil(dur*sr),sr),bus=c.createGain();bus.connect(c.destination);
    const rev=RokaAudio.reverb(c,bus,.9);const any=fill(c,bus,rev);if(!any)return null;return c.startRendering()};
  const R=rng((o.seed||7)+comp*31+bpm);
  const tAt=(bar,i)=>bar*L*step+i*step+(i%4===2?b.swing*step:0);
  const lineFor=k=>Object.prototype.hasOwnProperty.call(part,k)?part[k]:null;
  // batería
  const bateria=await make((c,bus,rev)=>{let n=0;
    for(let bar=0;bar<comp;bar++)for(const k of Object.keys(DRUM_MAP)){const line=lineFor(k);if(!line)continue;const[strong,soft,lvl,pan,wet]=DRUM_MAP[k];
      for(let i=0;i<line.length;i++){const ch=line[i];if(ch!=='X'&&ch!=='x')continue;
        const hum=(bar===0&&i===0)||k==='k'&&i===0?0:(R()-.5)*.010,v=(ch==='X'?1:.62)*lvl*(.92+R()*.16);
        drumHit(ch==='X'?strong:soft,Math.max(0,tAt(bar,i)+hum),v,{context:c,destination:bus,pan,reverb:rev,wet});n++}}
    // crash de entrada en estilos con platillo
    if(o.entrada&&/rock|pop|banda|polka|norteno/.test(b.id)){drumHit('crash',0,.45,{context:c,destination:bus,pan:-.2,reverb:rev,wet:.2});n++}
    return n});
  // bajo (o tuba)
  const bp=b.inst.bajo||'bajo',bLo=bp==='tuba'?34:28;
  const bajo=await make((c,bus,rev)=>{const line=lineFor('b');if(!line)return 0;let n=0;
    for(let bar=0;bar<comp;bar++){const ch=chords[bar],nx=chords[(bar+1)%comp],root=pcIn(ch.pc,bLo),tones=chordTones(ch);
      for(let i=0;i<line.length;i++){const s=line[i];if(!'R357OA'.includes(s))continue;
        let j=i+1;while(j<line.length&&line[j]==='.')j++;
        const m=s==='R'?root:s==='3'?root+tones[1]:s==='5'?root+7:s==='O'?root+12:s==='7'?root+10:pcIn(nx.pc,bLo)-1;
        playSample(bp,m,tAt(bar,i)+(R()-.5)*.008,(j-i)*step*.95,(i%4===0?.9:.72)*(.94+R()*.12),{context:c,destination:bus,lowpass:b.id==='trap'||b.id==='reggaeton'?600:2400,reverb:rev,wet:.04});n++}}
    return n});
  // armonía (guitarra, piano u órgano)
  const ap=b.inst.arm;
  const armonia=!ap?null:await make((c,bus,rev)=>{const line=lineFor('g');if(!line)return 0;let n=0;
    for(let bar=0;bar<comp;bar++){const ch=chords[bar],tones=chordTones(ch),r=pcIn(ch.pc,ap==='guitarra'?47:48);
      const voic=[r,...tones.slice(1).map(x=>r+x),r+12],arp=[r-12+ (ap==='guitarra'?12:0),r+tones[1],r+tones[2],r+12,r+12+tones[1]];
      for(let i=0;i<line.length;i++){const s=line[i];if(s==='-'||s==='.')continue;let j=i+1;while(j<line.length&&line[j]==='.')j++;
        const t=tAt(bar,i)+(R()-.5)*.008,len=Math.max(step*.9,(j-i)*step*.98),acc=i%4===0?1:.8;
        if(/[0-4]/.test(s)){playSample(ap,arp[+s],t,Math.max(len,step*3),.5*acc*(.9+R()*.2),{context:c,destination:bus,reverb:rev,wet:.18,pan:.15});n++;continue}
        const strong=s==='D'||s==='U'||s==='X',up=s==='U'||s==='u',mute=s==='x'&&ap==='guitarra';
        const notes=up?[...voic].reverse().slice(0,3):voic,gap=ap==='guitarra'?(strong?.011:.016):.004;
        notes.forEach((m,q)=>{playSample(ap,m,t+q*gap,mute?.06:len,(strong?.5:.32)*acc*(.9+R()*.2),{context:c,destination:bus,reverb:rev,wet:ap==='organo'?.22:.15,pan:ap==='guitarra'?.15:0,lowpass:mute?1800:9000});n++})}}
    return n});
  // metales (trompeta arriba, trombón abajo)
  const metales=!b.inst.met?null:await make((c,bus,rev)=>{const line=lineFor('x');if(!line)return 0;let n=0;
    for(let bar=0;bar<comp;bar++){const ch=chords[bar],tones=chordTones(ch),tp=pcIn(ch.pc+tones[1],64),tp2=pcIn(ch.pc+tones[2],64),tb=pcIn(ch.pc,48);
      for(let i=0;i<line.length;i++){const s=line[i];if(s!=='X'&&s!=='x')continue;let j=i+1;while(j<line.length&&line[j]==='.')j++;
        const len=Math.min(.9,Math.max(step*1.6,(j-i)*step*.95)),v=(s==='X'?.55:.38)*(.92+R()*.14),t=tAt(bar,i)+(R()-.5)*.01;
        playSample('trompeta',tp,t,len,v,{context:c,destination:bus,reverb:rev,wet:.2,pan:-.2});playSample('trompeta',tp2,t+.006,len,v*.85,{context:c,destination:bus,reverb:rev,wet:.2,pan:.2});
        playSample('trombon',tb,t+.004,len,v*.9,{context:c,destination:bus,reverb:rev,wet:.18,pan:0});n+=3}}
    return n});
  return{bateria,bajo,armonia,metales,dur:comp*L*step,acordes:chords.map(c=>chordLabel(c)),beat:b};
}
