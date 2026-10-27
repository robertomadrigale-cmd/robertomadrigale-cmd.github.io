const ROWS={
 cr:{n:'Platillo',a:'PL',k:['crash','crash',.5,-.25,.22,0],pad:'plat'},
 rd:{n:'Ride',a:'RI',k:['ride','ride',.45,.3,.14,0],pad:'plat'},
 hh:{n:'Hi-hat',a:'HH',k:['hat2','hat1',.42,-.3,.06,0],pad:'plat'},
 cb:{n:'Cencerro',a:'CE',k:['cow','cow',.42,.15,.1,0],pad:'plat'},
 t1:{n:'Tom 1',a:'T1',k:['tom','tom',.6,-.1,.18,4],pad:'tar'},
 t2:{n:'Tom 2',a:'T2',k:['tom','tom',.62,.1,.18,0],pad:'tar'},
 sn:{n:'Tarola',a:'TA',k:['snare2','snare1',.72,.04,.2,0],pad:'tar'},
 rim:{n:'Aro',a:'AR',k:['rim','rim',.6,.08,.12,0],pad:'tar'},
 ft:{n:'Tom de piso',a:'TP',k:['ftom','ftom',.68,.3,.18,0],pad:'tar'},
 bd:{n:'Bombo',a:'BO',k:['kick2','kick1',.95,0,.04,0],pad:'bom'},
 hf:{n:'Pedal HH',a:'PH',k:['hatp','hatp',.38,-.3,.05,0],pad:'bom'}};
const ROW_ORDER=['cr','rd','hh','cb','t1','t2','sn','rim','ft','bd','hf'];
const VEL={X:1,x:.72,o:.8,g:.25};
const PADS={plat:{n:'Platillos',key:'J'},tar:{n:'Tarola',key:'F'},bom:{n:'Bombo',key:'Espacio'}};

let KIT=null;
async function kitLoad(){await loadSamples();KIT=Object.keys(SMP.d).length?SMP.d:false;return KIT}
function hit(row,t,ch){
 const R=ROWS[row];if(!R)return;const [strong,soft,level,pan,wet,semi]=R.k,v=VEL[ch]||.72;
 const name=row==='hh'&&ch==='o'?'hato':ch==='X'?strong:soft;
 if(drumHit(name,t,v,{level,pan,wet,rate:2**(semi/12)}))return;
 if(row==='bd')kick(t,v);else if(['sn','rim'].includes(row))snare(t,v*.5);else if(['hh','hf','rd','cr','cb'].includes(row))hat(t,v*.25,ch==='o');
 else{const c=AC,o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime(row==='ft'?110:row==='t1'?220:170,t);o.frequency.exponentialRampToValueAtTime(row==='ft'?65:100,t+.18);g.gain.setValueAtTime(v*.6,t);g.gain.exponentialRampToValueAtTime(.0001,t+.4);o.connect(g);g.connect(out());o.start(t);o.stop(t+.42)}
}
document.addEventListener('pointerdown',()=>{kitLoad()},{once:true});
