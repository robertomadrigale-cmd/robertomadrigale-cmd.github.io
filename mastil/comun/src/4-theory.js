/* Teoría mínima compartida: nombres de notas, tonalidades y acordes por grado (I, ii, V7, ♭VII…). */
const NOTE_ES=['Do','Do♯','Re','Mi♭','Mi','Fa','Fa♯','Sol','La♭','La','Si♭','Si'];
const NOTE_US=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
const pcMod=n=>((n%12)+12)%12;
const noteName=(pc,us)=>(us?NOTE_US:NOTE_ES)[pcMod(pc)];
// «La», «Fa#», «Sib», «C», «Bb», «am» → clase de altura (y menor si termina en m)
function parseKey(s){
  if(s==null)return null;s=String(s).trim();const minor=/m(enor)?$/i.test(s)&&!/^mi$/i.test(s);s=s.replace(/\s*m(enor)?$/i,'');
  const es={do:0,re:2,mi:4,fa:5,sol:7,la:9,si:11},us={c:0,d:2,e:4,f:5,g:7,a:9,b:11};
  const m=s.toLowerCase().match(/^(do|re|mi|fa|sol|la|si|[a-g])\s*([#♯b♭])?/);if(!m)return null;
  let pc=(es[m[1]]??us[m[1]]);if(m[2]==='#'||m[2]==='♯')pc++;if(m[2]==='b'||m[2]==='♭')pc--;return{pc:pcMod(pc),minor};
}
const SCALE_MAJ=[0,2,4,5,7,9,11],SCALE_MIN=[0,2,3,5,7,8,10];
const ROMAN={i:0,ii:1,iii:2,iv:3,v:4,vi:5,vii:6};
// grado → {pc, q:'maj'|'min'|'dim'|'7'|'m7'} en la tonalidad (keyPc, menor)
function chordOf(deg,keyPc,minor){
  const m=String(deg).match(/^([♭b#♯]?)(vii|vi|v|iv|iii|ii|i)(°|7|m7|maj7)?$/i);if(!m)return{pc:keyPc,q:'maj'};
  const idx=ROMAN[m[2].toLowerCase()],sc=minor?SCALE_MIN:SCALE_MAJ;let pc=keyPc+sc[idx];
  if(m[1]==='b'||m[1]==='♭')pc--;if(m[1]==='#'||m[1]==='♯')pc++;
  const upper=m[2]===m[2].toUpperCase();let q=m[3]==='°'?'dim':upper?'maj':'min';if(m[3]==='7')q=upper?'7':'m7';if(m[3]==='m7')q='m7';if(m[3]==='maj7')q='maj7';
  return{pc:pcMod(pc),q,deg};
}
const QUAL={maj:[0,4,7],min:[0,3,7],dim:[0,3,6],'7':[0,4,7,10],m7:[0,3,7,10],maj7:[0,4,7,11]};
const chordTones=c=>QUAL[c.q]||QUAL.maj;
const chordLabel=(c,us)=>noteName(c.pc,us)+({maj:'',min:'m',dim:'°','7':'7',m7:'m7',maj7:'maj7'}[c.q]||'');
// nota MIDI de la clase pc dentro de [lo, lo+11]
const pcIn=(pc,lo)=>lo+pcMod(pc-lo);
