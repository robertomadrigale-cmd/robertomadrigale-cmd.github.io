// Pruebas de lógica de Roka Batería (no entran al build). Uso, desde mastil/bateria:  node src/bateria.test.cjs
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const S=f=>fs.readFileSync(path.join(__dirname,f),'utf8');
const cut=(src,a,b)=>{const i=src.indexOf(a),j=src.indexOf(b,i+1);if(i<0||j<0)throw Error('no encontré '+a);return src.slice(i,j)};
const ctx={console,DB:{stars:{},spd:{},gbpm:{},best:{}},coverArt:()=>'',mean:a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null,
  sd:a=>{if(a.length<2)return 0;const m=a.reduce((s,x)=>s+x,0)/a.length;return Math.sqrt(a.reduce((s,x)=>s+(x-m)*(x-m),0)/(a.length-1))}};
vm.createContext(ctx);
const run=code=>vm.runInContext(code,ctx);
run(fs.readFileSync(path.join(__dirname,'../../comun/src/5-beats.js'),'utf8').replace(/^const /gm,'var '));
const eng=S('3-engine.js');
run((cut(eng,'const ROWS=','const PADS=')+cut(eng,'const PADS=','// toca una fila')).replace(/^const /gm,'var '));
run((S('4-content.js')+S('4-plan.js')).replace(/^const /gm,'var '));
const sc=S('5-score.js');
run(cut(sc,'function expectedHits','/* ---------- micrófono').replace(/^const /gm,'var '));
let n=0,fail=0;const t=(name,f)=>{n++;try{f();console.log('ok  ',name)}catch(e){fail++;console.log('FALLA',name,'\n   ',e.message)}};
const {G,LESSONS,ALLEX,LVL,ROWS,BEATS,BANDFOR,TRACKG,TRACKST,gSteps,howFor,expectedHits,scoreHits,bandFor,limbOf}=ctx;
t('29 grooves y 12 lecciones',()=>{assert.strictEqual(Object.keys(G).length,29);assert.strictEqual(LESSONS.length,12)});
t('cada fila mide un compás exacto y usa símbolos conocidos',()=>{for(const id in G){const g=G[id],L=gSteps(g);
  for(const r in g.rows){assert.ok(ROWS[r],id+': fila desconocida '+r);assert.strictEqual(g.rows[r].length,L,`${id}.${r} mide ${g.rows[r].length}, debe medir ${L}`);assert.ok(/^[-xXog]+$/.test(g.rows[r]),id+'.'+r+' símbolo raro')}
  if(g.hands){assert.strictEqual(g.hands.length,L,id+' manos');assert.ok(/^[DI]+$/.test(g.hands))}}});
t('cada groove está en exactamente un nivel',()=>{const all=[].concat(LVL[1],LVL[2],LVL[3]);assert.strictEqual(all.length,29);assert.strictEqual(new Set(all).size,29);all.forEach(id=>assert.ok(G[id],id))});
t('las lecciones apuntan a grooves que existen',()=>{LESSONS.forEach(l=>l.blocks.forEach(b=>{if(b.groove)assert.ok(G[b.groove],'bloque '+b.groove);if(b.ex&&b.ex.groove)assert.ok(G[b.ex.groove],'ej '+b.ex.id)}))});
t('las pistas de lección tienen groove y estilo de banda',()=>{ALLEX.filter(x=>x.track).forEach(x=>{assert.ok(G[TRACKG[x.id]],'groove de '+x.id);assert.ok(BEATS.find(b=>b.id===TRACKST[x.track.st]),'estilo de '+x.id)})});
t('la banda de cada groove existe y tiene su mismo compás',()=>{Object.values(BANDFOR).forEach(id=>assert.ok(BEATS.find(b=>b.id===id),id));
  for(const id in G){const b=bandFor(id),g=G[id];if(g.sub===3){assert.strictEqual(b,null,id+' ternario sin banda');continue}const beat=BEATS.find(x=>x.id===b);assert.ok(beat,id);assert.strictEqual(beat.beats,g.meter===3?3:4,id)}});
t('«Cómo se hace» describe todas las filas y nombra manos o pies',()=>{for(const id in G){const h=howFor(id);assert.strictEqual(h.rows.length,Object.keys(G[id].rows).length);h.rows.forEach(r=>{assert.ok(r.where.length>0,id+'.'+r.row);assert.ok(/mano|pie/.test(r.limbs),id)})}});
t('manos: rudimentos siguen D/I y el bombo es pie derecho',()=>{assert.strictEqual(limbOf(G.para,'sn',3),'D');assert.strictEqual(limbOf(G.para,'sn',4),'I');assert.strictEqual(limbOf(G.rock,'bd',0),'PD');assert.strictEqual(limbOf(G.rock,'hh',0),'D');assert.strictEqual(limbOf(G.rock,'sn',2),'I')});
const exp=expectedHits(G.rock,10,60/90/2,4,'tap'),expM=expectedHits(G.rock,10,60/90/2,4,'mic');
const perfect=(e,j)=>e.map((x,k)=>({t:x.t+((k*7919)%41-20)/1000*(j==null?1:j),pad:x.pad}));
t('golpes esperados: rock con toques = 12 por vuelta (8 platillo + 2 tarola + 2 bombo), con micrófono 8',()=>{assert.strictEqual(exp.length,4*(8+2+2));assert.strictEqual(expM.length,4*8)});
t('golpes a ±20 ms dan ~100 %',()=>{const R=scoreHits(exp,perfect(exp));assert.ok(R.pct>=.99,'pct '+R.pct);assert.strictEqual(R.miss,0);assert.ok(Math.abs(R.mean)<20)});
t('quitar la mitad de los golpes da ~50 %',()=>{const h=perfect(exp).filter((_,k)=>k%2===0),R=scoreHits(exp,h);assert.ok(Math.abs(R.pct-.5)<.03,'pct '+R.pct)});
t('golpes 50 ms tarde: ámbar, tendencia +50 y 60 %',()=>{const R=scoreHits(expM,expM.map(x=>({t:x.t+.05})),{pads:false});assert.ok(Math.abs(R.mean-50)<1);assert.ok(Math.abs(R.pct-.6)<.01);assert.ok(R.items.every(i=>i.cls==='mid'))});
t('golpear a lo loco no da buena calificación',()=>{const h=[];for(let x=10;x<10+16*60/90;x+=.037)h.push({t:x,pad:'tar'});const R=scoreHits(exp,h);assert.ok(R.pct<.4,'pct '+R.pct)});
t('con toques el pad equivocado no cuenta',()=>{const R=scoreHits(exp,exp.map(x=>({t:x.t,pad:x.pad==='bom'?'plat':'bom'})));assert.ok(R.pct<.5,'pct '+R.pct)});
t('todos los estilos del núcleo son válidos (beatCheck)',()=>{BEATS.forEach(b=>assert.strictEqual(ctx.beatCheck(b).join('; '),''))});
console.log(`\n${n-fail}/${n} pruebas pasan`);process.exit(fail?1:0);
