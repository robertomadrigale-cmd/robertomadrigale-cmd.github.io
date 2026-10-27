/* Accompaniment remains a six-string guitar with its original samples and dynamics. */
const GUITAR_PC={1:4,2:11,3:7,4:2,5:9,6:4},GUITAR_MIDI={1:64,2:59,3:55,4:50,5:45,6:40},GUITAR_VCACHE={};
const GUITAR_OC=[
['C',0,[null,3,2,0,1,0]],['D',2,[null,null,0,2,3,2]],['E',4,[0,2,2,1,0,0]],['F',5,[1,3,3,2,1,1]],['G',7,[3,2,0,0,0,3]],['A',9,[null,0,2,2,2,0]],
['Am',9,[null,0,2,2,1,0]],['Bm',11,[null,2,4,4,3,2]],['Dm',2,[null,null,0,2,3,1]],['Em',4,[0,2,2,0,0,0]],
['C7',0,[null,3,2,3,1,0]],['D7',2,[null,null,0,2,1,2]],['E7',4,[0,2,0,1,0,0]],['G7',7,[3,2,0,0,0,1]],['A7',9,[null,0,2,0,2,0]],['B7',11,[null,2,1,2,0,2]],
['Cmaj7',0,[null,3,2,0,0,0]],['Fmaj7',5,[null,null,3,2,1,0]],['Amaj7',9,[null,0,2,1,2,0]],['Am7',9,[null,0,2,0,1,0]],['Dm7',2,[null,null,0,2,1,1]],['Em7',4,[0,2,0,0,0,0]],
['Dsus4',2,[null,null,0,2,3,3]],['Asus2',9,[null,0,2,2,0,0]],['Cadd9',0,[null,3,2,0,3,0]],['Bm7♭5',11,[null,2,3,2,3,null]]];
function guitarVoicing(p,shift){
  const pc=(p.pc+shift+120)%12,t=chType(p.suf),bass=p.bass==null?null:(p.bass+shift+120)%12,key=pc+'|'+t+'|'+bass;
  if(GUITAR_VCACHE[key])return GUITAR_VCACHE[key];
  let frets=null;
  const nm=US12S[pc].replace('♯','#')+TSUF[t],oc=GUITAR_OC.find(c=>c[0]===nm);
  if(oc)frets=oc[2].slice();
  else{
    const e=(pc-4+12)%12,a=(pc-9+12)%12,eS=ESHAPE[t],aS=ASHAPE[t]||ASHAPE.maj;
    const useE=eS&&(e<=a||!aS)&&e>0,base=useE?e:a,sh=useE?eS:aS;
    frets=sh.map(f=>f==null?null:f+base);
  }
  // acorde con bajo (G/B, E/G♯): el bajo va en la cuerda más grave que lo alcance sin estirar la mano; si no cabe, lo toca el bajista
  if(bass!=null){const fr=frets.filter(x=>x!=null&&x>0),lo=fr.length?Math.min(...fr):0,hi=fr.length?Math.max(...fr):0;
    for(let i=0;i<3;i++){const s=6-i;let f=(bass-GUITAR_PC[s]+12)%12;if(f>0&&f<lo-1&&f+12<=hi+2)f+=12;const ok=f===0||(Math.max(hi,f)-Math.min(lo||f,f)<=3);
      if(ok){for(let j=0;j<i;j++)frets[j]=null;frets[i]=f;break}}}
  const midi=frets.map((f,i)=>f==null?null:GUITAR_MIDI[6-i]+f).filter(x=>x!=null),strs=frets.map((f,i)=>f==null?null:6-i).filter(x=>x!=null);
  return GUITAR_VCACHE[key]={frets,midi,strs,root:36+((bass!=null?bass:pc)<4?(bass!=null?bass:pc)+12:(bass!=null?bass:pc))};
}
function guitarPluck(m,t,d,v,o){
  if(SMP.ready&&m>=37&&m<=79)return smpPlay('g',m,t,d,(v||.2)*1.15,o);
  const c=AC,K=ksBuffer(Math.round(m)),src=c.createBufferSource(),g=c.createGain(),lp=c.createBiquadFilter();
  src.buffer=K.b;src.playbackRate.value=K.rate;
  lp.type='lowpass';lp.frequency.value=m<55?3200:5200;lp.Q.value=.4;
  const vol=Math.min(1,(v||.2)*3.2),end=t+Math.min(d,2.3);
  g.gain.setValueAtTime(vol,t);g.gain.setValueAtTime(vol,Math.max(t,end-.12));g.gain.linearRampToValueAtTime(.0001,end);
  src.connect(lp);lp.connect(g);g.connect(out());src.start(t);src.stop(end+.02);
  return{g,end};
}
