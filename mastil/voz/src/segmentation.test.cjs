const assert=require('node:assert/strict'),{load,signal}=require('./song-test-utils.cjs');const{a}=load();
(async()=>{
  const midi=[60,60,67,67,69,69,67,65,65,64,64,62,62,60];let t=.3;
  const expected=midi.map((m,i)=>{const d=i===6||i===13?2:1,n={m,t0:t,t1:t+d*.5,d};t=n.t1;return n});
  const data=signal(expected),result=await a.extractMelody(data.channels[0],data.sr,120);
  assert.equal(result.notes.length,expected.length,'cantidad de notas');
  result.notes.forEach((n,i)=>{assert.equal(n.m,expected[i].m,'nota '+i);assert.equal(n.d,expected[i].d,'duración '+i);assert(Math.abs(n.t0-expected[i].t0)<.1)});
  const reads=Array.from({length:60},(_,i)=>({t:i*.03,m:i===15||i===16?72:i>=32?64:60}));const notes=a.segmentPitch(reads,120);assert.deepEqual(Array.from(notes,n=>n.m),[60,64]);
  console.log('PASS Estrellita: 14/14 notas exactas (±0 semitonos), 14/14 duraciones cuantizadas correctas.');
  console.log('PASS salto de octava aislado eliminado; cambio sostenido conservado.');
})().catch(e=>{console.error(e);process.exitCode=1});
