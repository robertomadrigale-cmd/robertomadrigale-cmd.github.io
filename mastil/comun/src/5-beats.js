/* Estilos de beat por género. Cada parte (A, B, F = relleno) escribe UN compás celda por celda (4 celdas por tiempo).
   Batería: k bombo · s tarola · r aro · l palmas · h hi-hat · o hi-hat abierto · p pedal · y ride · c crash · t tom · f tom de piso
            · m maracas/güiro · a pandero · w cencerro.   X fuerte · x suave · - nada.
   Bajo (b): R raíz · 3 tercera · 5 quinta · O octava · 7 séptima · A nota que se acerca a la raíz del siguiente acorde · . sostiene · - silencio.
   Armonía (g): D d rasgueo abajo · U u arriba · x golpe apagado · X x acorde (piano/órgano) · 0–4 arpegio (notas del acorde de grave a agudo) · . sostiene.
   Metales (x): X x golpe de acorde (trompeta arriba, trombón abajo) · . sostiene.
   inst: qué pack toca cada pista (bajo eléctrico o tuba; guitarra, piano u órgano). Las aproximaciones se marcan con aprox. */
const BEATS=[
 {id:'tumbado',n:'Corrido tumbado',gen:'Regional',beats:3,bpm:[100,135,116],swing:0,key:'La m',prog:[['i','VI','VII','i'],['i','iv','VII','III'],['i','VII','VI','V']],
  inst:{bajo:'bajo',arm:'guitarra'},aprox:'El tololoche se aproxima con el bajo eléctrico.',
  parts:{A:{b:'R...5...O...',g:'0-2-1-3-2-1-',h:'----x---x---'},B:{b:'R...5...3...',g:'0-1-2-3-4-3-',h:'----x---x-x-'},F:{b:'R...5.3.A...',g:'4-3-2-1-0-0-',f:'--------x-x-'}}},
 {id:'norteno',n:'Corrido norteño',gen:'Regional',beats:4,bpm:[110,150,128],swing:0,key:'Sol',prog:[['I','V7','V7','I'],['I','IV','V7','I']],
  inst:{bajo:'bajo',arm:'guitarra'},aprox:'Sin acordeón: la guitarra hace el bajo sexto.',
  parts:{A:{k:'X-------X-------',s:'----X-------X---',b:'R-------5-------',g:'----D-------D---'},B:{k:'X-------X-------',s:'----X-------X--x',b:'R-------5---A---',g:'----D-u-----D-u-'},F:{k:'X-------X---X---',s:'----X---X-xxXXXX',b:'R-------5-3-A---',g:'----D-------D---'}}},
 {id:'banda',n:'Banda (polka)',gen:'Regional',beats:4,bpm:[115,150,132],swing:0,key:'Fa',prog:[['I','V7','V7','I'],['I','IV','V7','I'],['I','I','V7','V7']],
  inst:{bajo:'tuba',arm:null,met:true},
  parts:{A:{k:'X-------X-------',s:'----X--x----X--x',y:'--x---x---x---x-',b:'R-------5-------',x:'----X-------X---'},B:{k:'X-------X-------',s:'----X--x----X--x',y:'--x---x---x---x-',b:'R---3---5---O---',x:'----X-x-----X-x-'},F:{k:'X-------X-------',s:'----X---XxXxXXXX',c:'X---------------',b:'R-------5---A---',x:'X.......X...X...'}}},
 {id:'cumbia',n:'Cumbia',gen:'Tropical',beats:4,bpm:[85,110,96],swing:0,key:'La m',prog:[['i','iv','V7','i'],['i','VII','VI','V7'],['I','IV','V7','I']],
  inst:{bajo:'bajo',arm:'guitarra'},
  parts:{A:{k:'X-------X-------',m:'X-x-X-x-X-x-X-x-',a:'--x---x---x---x-',b:'R-----5-5-----O-',g:'--U---U---U---U-'},B:{k:'X-------X-------',m:'X-xxX-x-X-xxX-x-',w:'--x---x---x---x-',b:'R-----5-5---3-O-',g:'--U-x-U---U-x-U-'},F:{k:'X-------X---X---',m:'X-x-X-x-X-x-X-x-',t:'--------x-x-',f:'------------x-x-',b:'R-----5-5-----A-',g:'--U---U---U---U-'}}},
 {id:'sonidera',n:'Cumbia sonidera',gen:'Tropical',beats:4,bpm:[78,95,86],swing:0,key:'Re m',prog:[['i','VII','VI','V7'],['i','iv','i','V7']],
  inst:{bajo:'bajo',arm:'organo'},
  parts:{A:{k:'X-------X-------',m:'X-x-X-x-X-x-X-x-',w:'--x---x---x---x-',b:'R.....5.5.....O.',g:'--X---X---X---X-'},B:{k:'X-------X-------',m:'X-xxX-x-X-xxX-x-',a:'--x---x---x---x-',b:'R.....5.5...3.O.',g:'--X.X.X---X.X.X-'},F:{k:'X-------X-X-X-X-',m:'X-x-X-x-X-x-X-x-',b:'R.....5.5.....A.',g:'--X---X---X---X-'}}},
 {id:'vals',n:'Ranchera (vals)',gen:'Regional',beats:3,bpm:[90,140,110],swing:0,key:'Re',prog:[['I','I','V7','V7','V7','V7','I','I'],['I','IV','V7','I']],
  inst:{bajo:'bajo',arm:'guitarra',met:true},
  parts:{A:{b:'R-----------',g:'----D---D---'},B:{b:'5-----------',g:'----D---D---',x:'----x---x---'},F:{b:'R---5---3---',g:'D.......D---',x:'X.......X---'}}},
 {id:'polka',n:'Ranchera (polka)',gen:'Regional',beats:4,bpm:[120,160,140],swing:0,key:'Sol',prog:[['I','I','V7','V7','V7','V7','I','I']],
  inst:{bajo:'bajo',arm:'guitarra',met:true},
  parts:{A:{k:'X-------X-------',b:'R-------5-------',g:'----D-------D---',x:'----x-------x---'},B:{k:'X-------X-------',s:'----x-------x---',b:'R-------5---A---',g:'----D-u-----D-u-',x:'----X-------X---'},F:{k:'X-------X---X---',s:'----X---X-X-XXXX',b:'R-------5-3-A---',g:'D.......D...D---',x:'X.......X...X---'}}},
 {id:'bolero',n:'Bolero',gen:'Romántico',beats:4,bpm:[70,95,80],swing:0,key:'Do',prog:[['Imaj7','vi','ii','V7'],['Imaj7','iii','vi','ii','V7']],
  inst:{bajo:'bajo',arm:'guitarra'},
  parts:{A:{r:'x--x--x---x-x---',m:'x-x-x-x-x-x-x-x-',b:'R.....5.5.......',g:'0-1-2-3-2-1-2-3-'},B:{r:'x--x--x---x-x---',m:'x-x-x-x-x-x-x-x-',t:'------x-------x-',b:'R.....5.3.......',g:'0-2-1-3-0-2-1-3-'},F:{r:'x--x--x---x-x---',f:'--------x-x-x-x-',b:'R.....5.A.......',g:'4-3-2-1-0-1-2-3-'}}},
 {id:'balada',n:'Balada pop',gen:'Pop',beats:4,bpm:[64,88,74],swing:0,key:'Do',prog:[['I','V','vi','IV'],['vi','IV','I','V'],['I','iii','IV','V']],
  inst:{bajo:'bajo',arm:'piano'},
  parts:{A:{k:'X-------x-X-----',s:'----x-------x---',h:'x-x-x-x-x-x-x-x-',b:'R.......5.......',g:'X.......x.......'},B:{k:'X-------x-X-----',s:'----X-------X---',h:'x-x-x-x-x-x-x-x-',b:'R.......3...5...',g:'X...x...X...x...'},F:{k:'X-------x-X-----',s:'----X-------x-xx',t:'--------x-x-',f:'------------x-x-',b:'R.......5...A...',g:'X.......x.......'}}},
 {id:'reggaeton',n:'Reggaetón (dembow)',gen:'Urbano',beats:4,bpm:[85,100,92],swing:0,key:'La m',prog:[['i','VI','III','VII'],['i','iv','VI','V']],
  inst:{bajo:'bajo',arm:'piano'},aprox:'El 808 se aproxima con el bajo eléctrico grave.',
  parts:{A:{k:'X---X---X---X---',l:'---X--X----X--X-',r:'---x--x----x--x-',h:'x-x-x-x-x-x-x-x-',b:'R.......R...5...',g:'X.......X.......'},B:{k:'X---X---X---X---',l:'---X--X----X--X-',h:'x-xxx-x-x-xxx-x-',b:'R.......R..5O...',g:'X...X...X...X...'},F:{k:'X---X---X-X-X-X-',l:'---X--X---XXXXXX',b:'R.......R...A...',g:'X.......X.......'}}},
 {id:'bachata',n:'Bachata',gen:'Tropical',beats:4,bpm:[120,140,128],swing:0,key:'Mi m',prog:[['i','iv','V7','i'],['i','VI','VII','i']],
  inst:{bajo:'bajo',arm:'guitarra'},
  parts:{A:{m:'X-xxX-xxX-xxX-xx',t:'--x---x---xx--x-',b:'R-----5---R-5---',g:'0121312101213121'},B:{m:'X-xxX-xxX-xxX-xx',t:'--x---x---xx--x-',f:'------------x---',b:'R-----5---3-5---',g:'0213021302130213'},F:{m:'X-xxX-xxX-xxX-xx',t:'x-x-x-x-',f:'--------x-x-x-x-',b:'R-----5---A-----',g:'4321432143214321'}}},
 {id:'rock',n:'Rock',gen:'Rock',beats:4,bpm:[90,150,112],swing:0,key:'Mi',prog:[['I','IV','V','IV'],['I','bVII','IV','I'],['vi','IV','I','V']],
  inst:{bajo:'bajo',arm:'guitarra'},
  parts:{A:{k:'X-----x-X-------',s:'----X-------X---',h:'x-x-x-x-x-x-x-x-',b:'R-R-R-R-R-R-R-R-',g:'D-d-D-d-D-d-D-d-'},B:{k:'X-----xxX-------',s:'----X-------X--x',o:'x-------x-------',h:'--x-x-x---x-x-x-',b:'R-R-5-R-O-R-5-R-',g:'D-d-D-d-D-d-D-d-'},F:{k:'X-------X-------',s:'----X---X-x-XXXX',c:'X---------------',t:'--------x-x-',f:'------------x-xx',b:'R-R-R-R-5-5-A-A-',g:'D.......D.......'}}},
 {id:'pop',n:'Pop',gen:'Pop',beats:4,bpm:[96,128,110],swing:0,key:'Sol',prog:[['I','V','vi','IV'],['vi','IV','I','V']],
  inst:{bajo:'bajo',arm:'guitarra'},
  parts:{A:{k:'X---X---X---X---',s:'----X-------X---',l:'----X-------X---',h:'--x---x---x---x-',b:'R-----R-R-----5-',g:'D---d-U---U-d-U-'},B:{k:'X---X---X---X---',s:'----X-------X---',l:'----X-------X---',o:'--x---x---x---x-',b:'R-R---R-R-5---O-',g:'D-d-U-U-D-d-U-U-'},F:{k:'X---X---X-X-X-X-',s:'----X---X-xxXXXX',c:'X---------------',b:'R-----R-5---A---',g:'D.......D.......'}}},
 {id:'trap',n:'Trap / hip hop',gen:'Urbano',beats:4,bpm:[130,150,140],swing:0,key:'Do m',prog:[['i','VI','III','VII'],['i','i','VI','V']],
  inst:{bajo:'bajo',arm:'piano'},aprox:'El 808 se aproxima con el bajo eléctrico grave.',
  parts:{A:{k:'X------X--X-----',s:'--------X-------',l:'--------X-------',h:'x-x-x-x-x-x-x-x-',b:'R.......R..5....',g:'X...............'},B:{k:'X------X--X--X--',s:'--------X-------',l:'--------X-------',h:'x-x-xxx-x-x-xxxx',b:'R.......R..5O...',g:'X.......X.......'},F:{k:'X------X--X-----',s:'--------X---XXXX',h:'xxxxxxxxxxxxxxxx',b:'R.......A.......',g:'X...............'}}},
 {id:'bossa',n:'Bossa nova',gen:'Jazz',beats:4,bpm:[110,140,124],swing:0,key:'Do',prog:[['Imaj7','ii','V7','Imaj7'],['ii','V7','Imaj7','vi']],
  inst:{bajo:'bajo',arm:'guitarra'},
  parts:{A:{r:'x--x--x---x--x--',k:'x--xx--xx--xx--x',h:'x-x-x-x-x-x-x-x-',b:'R..5R..5R..5R..5',g:'D--U--D---D--U--'},B:{r:'x--x---x--x--x--',k:'x--xx--xx--xx--x',h:'x-x-x-x-x-x-x-x-',b:'R..5R..5R..3A..5',g:'D--U--D--U--D---'},F:{r:'x--x--x---x--x--',k:'x--xx--xx--xx--x',b:'R..5R..5A..5A..5',g:'D.....D.....D...'}}}
];
const beatById=id=>BEATS.find(b=>b.id===id);
const BEAT_GENRES=[...new Set(BEATS.map(b=>b.gen))];
// valida que cada línea mida un compás exacto (beats×4 celdas) y use solo símbolos conocidos
function beatCheck(b){
  const errs=[],L=b.beats*4,ok={drum:/^[Xx-]+$/,b:/^[R357OA.\-]+$/,g:/^[DdUuXx0-4.\-]+$/,x:/^[Xx.\-]+$/};
  for(const[pn,p]of Object.entries(b.parts))for(const[k,v]of Object.entries(p)){
    const re=k==='b'?ok.b:k==='g'?ok.g:k==='x'?ok.x:ok.drum;
    if(!re.test(v))errs.push(`${b.id}.${pn}.${k}: símbolo desconocido`);
    if(v.length!==L&&!(re===ok.drum&&v.length<L))errs.push(`${b.id}.${pn}.${k}: mide ${v.length}, debe medir ${L}`);
  }
  return errs;
}
