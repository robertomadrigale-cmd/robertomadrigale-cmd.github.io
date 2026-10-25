/* Cuerda 1 = Sol; añadir Si grave no renumera las otras cuatro. */
const BASS_OPEN={1:43,2:38,3:33,4:28,5:23};
function openStrings(count=DB.strings,drop=false){return Array.from({length:count},(_,i)=>({s:i+1,m:drop&&i===3?26:BASS_OPEN[i+1]}))}
function midiOf(s,f,count=DB.strings){if(!Number.isInteger(s)||s<1||s>count||!Number.isInteger(f)||f<0||f>15)throw Error('Cuerda o traste fuera del mástil');return BASS_OPEN[s]+f}
function autoFingers(notes){let base=1;return notes.map(n=>{if(n.f>0&&(n.f<base||n.f>base+3))base=n.f;return {...n,fg:n.f? n.f-base+1:0,pos:base}})}
function notesOf(ex,count=DB.strings){return autoFingers((count===5&&ex.fig.five?ex.fig.five:ex.fig.notes).map(n=>({...n,m:midiOf(n.s,n.f,count)})))}
function tablature(notes,count=DB.strings){return openStrings(count).map(({s,m})=>noteName(m).padEnd(3,' ')+'|'+notes.map(n=>n.s===s?String(n.f).padStart(2,'-')+'-':'---').join('')+'|').join('\n')}
function fretboard({dots=[],count=DB.strings,lefty=DB.lefty,label='Mástil de bajo: trastes 0 a 15'}={}){
 const W=850,H=50+count*42,x=f=>lefty?W-44-f*48:44+f*48,y=s=>30+(s-1)*42;
 let g='';for(let f=0;f<=15;f++){g+=`<text x="${x(f)}" y="${H-9}" text-anchor="middle">${f}</text>`;if(f)g+=`<path d="M${x(f)+(lefty?24:-24)} 16V${H-38}" class="fret"/>`}
 for(const {s,m} of openStrings(count))g+=`<path d="M24 ${y(s)}H820" class="string" stroke-width="${1+s*.5}"/><text x="${lefty?835:12}" y="${y(s)+5}" text-anchor="middle">${s}</text>`;
 dots.forEach((d,i)=>{if(d.s>count)return;g+=`<g class="dot${d.k==='root'?' root':''}" data-s="${d.s}" data-f="${d.f}"><circle cx="${x(d.f)}" cy="${y(d.s)}" r="17"/><text x="${x(d.f)}" y="${y(d.s)+4}" text-anchor="middle">${esc(d.t||noteName(midiOf(d.s,d.f,count)))}</text>${d.fg?`<circle class="finger" cx="${x(d.f)+14}" cy="${y(d.s)-13}" r="8"/><text class="fingertext" x="${x(d.f)+14}" y="${y(d.s)-10}" text-anchor="middle">${d.fg}</text>`:''}</g>`});
 return `<div class="boardscroll" tabindex="0" aria-label="Desliza para explorar el mástil"${lefty?' dir="rtl"':''}><svg class="fretboard" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">${g}</svg></div><p class="caption">Desliza el mástil. 0 = cuerda al aire. Cuerdas: ${openStrings(count).map(o=>o.s+' '+noteName(o.m)).join(' · ')}.<br>Dedos: 1 índice · 2 medio · 3 anular · 4 meñique. Mueve la mano al cambiar de posición.</p>`;
}
function chordDots(ch,count=DB.strings){const dots=[];for(let s=1;s<=count;s++)for(let f=0;f<=15;f++){const pc=midiOf(s,f,count)%12;if(pc===ch.pc||pc===pcMod(ch.pc+7))dots.push({s,f,t:pc===ch.pc?'R':'5',k:pc===ch.pc?'root':''})}return dots}
