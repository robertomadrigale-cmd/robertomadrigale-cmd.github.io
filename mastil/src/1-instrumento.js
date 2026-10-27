/* Instrument defaults. Keep guitar values stable: its rendered HTML is a contract. */
const INST={id:'guitarra',nombre:'Om Guitarra',corto:'Guitarra',instrumento:'guitarra',art:'la guitarra',n:6,
 open:{1:64,2:59,3:55,4:50,5:45,6:40},labels:'eBGDAE',rango:[40,76],frets:17,
 color:'#2f7bff',db:'mastil-a-la-vista:v2',root:'',pack:'g',sampleRange:[37,79],sampleCache:'roka-muestras-v1',
 pitchMin:60,pitchMax:1200,fft:2048,cloud:{field:'progress',stats:'stats'},
 tunings:{std:{n:'Estándar',m:[40,45,50,55,59,64]},half:{n:'Medio tono abajo',m:[39,44,49,54,58,63]},dropd:{n:'Drop D',m:[38,45,50,55,59,64]},full:{n:'Un tono abajo',m:[38,43,48,53,57,62]},openg:{n:'Open G',m:[38,43,50,55,59,62]},opend:{n:'Open D',m:[38,45,50,54,57,62]},dadgad:{n:'DADGAD',m:[38,45,50,55,57,62]}}};
INST.strings=Array.from({length:INST.n},(_,i)=>i+1);
INST.desc=INST.strings.slice().reverse();
