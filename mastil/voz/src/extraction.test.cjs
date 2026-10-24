const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{load,signal}=require('./song-test-utils.cjs');const{a}=load();
(async()=>{
  const midi=[60,64,67,65,62,69,67,60,62,64,65,67,69,71,72,67,64,62,60,55];let t=.3;
  const expected=midi.map((m,i)=>{const n={m,t0:t,t1:t+(i%3===0?1:.5)};t=n.t1;return n});
  const data=signal(expected,{stereo:true}),result=await a.extractMelody(a.prepareSamples(data.channels,data.sr),data.sr,120);
  // Todos los objetivos cuentan, incluso los omitidos; emparejamiento uno a uno
  // por solapamiento temporal, nunca por buscar la nota correcta en el resultado.
  const used=new Set(),errors=expected.map(target=>{
    let best=-1,overlap=0;result.notes.forEach((n,i)=>{if(used.has(i))return;const v=Math.max(0,Math.min(n.t1,target.t1)-Math.max(n.t0,target.t0));if(v>overlap){overlap=v;best=i}});
    if(best<0)return null;used.add(best);return Math.abs(result.notes[best].m-target.m);
  });
  const correct=errors.filter(x=>x!==null&&x<=1).length,precision=correct/expected.length,extra=result.notes.length-used.size;
  const report={test:'Voz sintética central con armónicos + acorde y ruido laterales, fuga central 7.5 %',sampleRate:data.sr,expected:expected.length,detected:result.notes.length,matchedWithinOneSemitone:correct,precision,extraNotes:extra,meanAbsoluteError:errors.filter(x=>x!==null).reduce((a,b)=>a+b,0)/errors.filter(x=>x!==null).length,confidence:result.confidence,errors,limitations:'Prueba sintética, no mide canciones comerciales ni voces reales. No es separación de fuentes.'};
  fs.writeFileSync(path.join(__dirname,'extraction-results.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));assert(precision>=.8,'se exige ≥80 %');assert(extra<=expected.length*.2,'demasiadas notas espurias');
  const aborted=new AbortController();aborted.abort();await assert.rejects(a.extractMelody(data.channels[0],data.sr,120,{signal:aborted.signal}),{name:'AbortError'});
  console.log('PASS extracción estéreo y cancelación.');
})().catch(e=>{console.error(e);process.exitCode=1});
