// Revisa que cada tema de THEMES (mastil/src/6-app.js) se lea bien: node tools/contraste-temas.cjs
const fs=require('fs'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'../mastil/src/6-app.js'),'utf8');
const a=src.indexOf('const THEMES=['),b=src.indexOf('\n];',a);
const THEMES=Function('return '+src.slice(a+'const THEMES='.length,b+3).replace(/;$/,''))();
const K='bg surface surface2 fg muted line accent accentInk accentText root rootInk good bad blue'.split(' ');
const lum=h=>{h=h.replace('#','');if(h.length===3)h=h.split('').map(x=>x+x).join('');const c=[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]};
const cr=(x,y)=>{const l1=lum(x),l2=lum(y);return(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05)};
// botones y fichas llevan texto en negritas: basta 3:1 (texto grande/negrita de WCAG)
// extra: acentos de bajo y batería sobre el tema Estudio
const extra=[['estudio-bajo','#34d399','#052e22','#6ee7b7'],['estudio-bateria','#ff5c8a','#1f0010','#ff85a7']];
const rules=[['fg','bg',7],['fg','surface',7],['muted','bg',4.5],['muted','surface',4.5],['accentInk','accent',3],['accentText','bg',4.5],['accentText','surface',4.5],['rootInk','root',3],['good','surface',3],['bad','surface',3]];
let bad=0;
const check=(name,c)=>rules.forEach(([f,g,min])=>{const r=cr(c[f],c[g]);if(r<min){bad++;console.log(`${name}: ${f} sobre ${g} = ${r.toFixed(2)} (mínimo ${min})`)}});
for(const t of THEMES){const v=t[4].split(' '),c={};K.forEach((k,i)=>c[k]=v[i]);check(t[0],c);
  if(t[0]==='estudio')for(const[n,acc,ink,txt]of extra)check(n,Object.assign({},c,{accent:acc,accentInk:ink,accentText:txt}))}
console.log(bad?`${bad} combinaciones con poco contraste`:`${THEMES.length} temas: contraste correcto`);process.exitCode=bad?1:0;
