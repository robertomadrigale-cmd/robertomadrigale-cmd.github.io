/* Same audio clock and tick/pulsebar as the shared app; extra click placements. */
function metSilent(bar){return MET.gapOn>0&&MET.gapOff>0&&bar%(MET.gapOn+MET.gapOff)>=MET.gapOn}
function drumMetStart(opts,ui,label){
 Object.assign(MET,{mode:'all',gapOn:0,gapOff:0,tr:null},opts||{});const cs=MET.mode==='off'&&MET.sub<2?2:MET.sub;
 return seqStart('met',label||'Metrónomo '+MET.bpm,()=>60/MET.bpm/cs,(s,t)=>{
  const m=METERS[MET.meter],per=m.b*cs,bar=Math.floor(s/per),at=s%per,b=Math.floor(at/cs),p=at%cs;
  if(at===0&&bar>0&&MET.tr&&bar%MET.tr.every===0)MET.bpm=Math.min(MET.tr.max,MET.bpm+MET.tr.step);
  let k=null;if(!metSilent(bar)){
   if(MET.mode==='all')k=p===0?(m.acc.includes(b)?'acc':'beat'):'sub';
   else if(MET.mode==='24'&&p===0&&b%2===1)k='beat';else if(MET.mode==='1'&&p===0&&b===0)k='acc';else if(MET.mode==='off'&&p===Math.floor(cs/2))k='beat';
  }
  if(k)tick(t,k,p===0?(b===0?'bar':'beat'):null);else if(p===0)setTimeout(()=>pulseBeat(b===0),Math.max(0,(t-AC.currentTime+outLat())*1000));
 },s=>{const f=ui||MET.ui,m=METERS[MET.meter],per=m.b*cs,bar=Math.floor(s/per),at=s%per;if(f)f(Math.floor(at/cs),at%cs===0,bar,metSilent(bar))});
}
const DRUM_TAPS=[];
function drumTapTempo(btn,set){const n=performance.now();if(DRUM_TAPS.length&&n-DRUM_TAPS.at(-1)>2000)DRUM_TAPS.length=0;DRUM_TAPS.push(n);if(DRUM_TAPS.length>6)DRUM_TAPS.shift();ac();tick(AC.currentTime+.01,'beat');if(DRUM_TAPS.length>1)set(60000*(DRUM_TAPS.length-1)/(n-DRUM_TAPS[0]))}
