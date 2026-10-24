const assert=require('node:assert/strict'),{load}=require('./song-test-utils.cjs');const{a,ctx}=load();let tests=0;
function test(name,fn){fn();tests++;console.log('PASS',name)}
test('40 canciones, 35 nuevas, IDs originales y únicos',()=>{assert.equal(a.SONGLIST.length,40);assert.equal(a.CATALOG_ADDITIONS.length,35);assert.equal(new Set(a.SONGLIST.map(s=>s.id)).size,40);for(const id of ['escala-do','vocales','cumple','estrellita','grace'])assert(a.songById(id))});
for(const s of a.SONGLIST)test(s.id+': sílabas, rango, compás y metadatos',()=>{
  assert([1,2,3].includes(+s.meta.lvl));assert(s.meta.gen);assert(s.bpm>=40&&s.bpm<=200);assert(/^[34]\/4$/.test(s.meta.time));let total=0;const pitches=[];
  for(const line of s.lines){assert(line.mel?.length);assert.equal(line.syl.length,line.mel.filter(n=>n.m!==null&&!n.cont).length,s.id+' '+line.syl.map(s=>s.x).join(' '));assert(!line.mel.find(n=>n.m!==null)?.cont);
    for(const n of line.mel){assert(Number.isFinite(n.d)&&n.d>0);assert.equal(n.d*4,Math.round(n.d*4));total+=n.d;if(n.m!==null){assert(Number.isFinite(n.m));pitches.push(n.m)}}}
  assert(Math.max(...pitches)-Math.min(...pitches)<=14,s.id+' rango '+(Math.max(...pitches)-Math.min(...pitches)));assert(Math.abs(total/s.beats-Math.round(total/s.beats))<1e-8,s.id+' compás');
});
test('Sílabas: diptongos, hiatos y grupos consonánticos',()=>{for(const [word,parts] of Object.entries({canción:'can-ción',guitarra:'gui-ta-rra',llave:'lla-ve',muchacho:'mu-cha-cho',perro:'pe-rro',país:'pa-ís',poeta:'po-e-ta',aire:'ai-re',ciudad:'ciu-dad',pingüino:'pin-güi-no',transporte:'trans-por-te',plato:'pla-to',agua:'a-gua',río:'rí-o'}))assert.equal(a.silabas(word).join('-'),parts,word)});
test('Melismas y notas faltantes conservan sílabas y tiempos',()=>{
  const notes=[{m:60,d:1,t0:2,t1:3},{m:62,d:2,t0:3,t1:5}];const rows=a.distributeNotes(notes,[2,3]);assert.deepEqual(Array.from(rows,r=>r.filter(n=>!n.cont).length),[2,3]);let last=0;for(const n of rows.flat()){assert(n.t0>=last);assert(n.t1>n.t0);last=n.t1}assert.equal(last,5);
  const extra=a.assignNotes(Array.from({length:8},(_,i)=>({m:60+i,d:1})),3);assert.equal(extra.filter(n=>!n.cont).length,3);assert.equal(extra.length,8);
});
test('Mis canciones dinámicas, respaldo UTF-8 y validación',()=>{
  const row={id:'mine-test',src:'{id:mine-test}{title:Mi canción ñ}{bpm:90}\ncan~ción\n{mel:C4/1 D4/1}',created:1,notes:[[{m:60,d:1,cont:false,t0:0,t1:1},{m:62,d:1,cont:false,t0:1,t1:2}]],audioStored:true};
  a.persistMySongs([a.validateSongRow(row)]);assert.equal(a.allSongs().length,41);assert.equal(a.songById(row.id).title,'Mi canción ñ');const restored=a.parseSongBackup(a.songBackup());assert.equal(restored[0].audioStored,false);assert.equal(restored[0].notes[0][1].t0,1);assert.equal(restored[0].src,row.src);
  assert.throws(()=>a.parseSongBackup('BAD:abc'));assert.throws(()=>a.validateSongRow({...row,id:'../evil'}));assert.throws(()=>a.validateSongRow({...row,src:row.src.replace('D4/1','Q4/1')}));assert.throws(()=>a.validateSongRow({...row,notes:[[{m:60,d:1,t0:0,t1:2},{m:62,d:1,t0:1,t1:3}]]}));
  ctx.localStorage.setItem=()=>{throw Error('quota')};assert.throws(()=>a.persistMySongs([]));assert.equal(a.DB.songs.length,1);ctx.localStorage.setItem=()=>{};
});
test('Rango transpuesto y canciones sin melodía',()=>{a.DB.range={lo:60,hi:69};assert.equal(a.songFit(a.songById('estrellita')).extra,0);a.DB['shift:estrellita']=5;assert.match(a.songFit(a.songById('estrellita')).text,/Pide subir 5/);assert.equal(a.songShift(a.songParse('hola')),0)});
test('Canto libre: porcentaje vocal, silencio y estabilidad',()=>{const scale=a.scaleNotes(0,false);assert.equal(a.freePitchStats([{m:60},{m:61},{m:null},{m:64}],scale).score,2/3);assert.equal(a.freePitchStats([{m:null}],scale).score,null);assert.equal(a.freePitchStats([{m:60},{m:64}],scale).stability,0)});
console.log(tests+' pruebas de canciones aprobadas.');
