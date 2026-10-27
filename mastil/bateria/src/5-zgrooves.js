/* Arrangements with no percussion in Guitar receive a drum practice part here only.
   It is used by bandStep, the displayed grid and song challenges alike. */
for(const groove of Object.values(GROOVES))for(const beats of [3,4]){
 const part=groove[beats];if(!part)continue;
 if(!Object.keys(DRUM_MAP).some(k=>part[k]&&/[^-.]/.test(part[k]))){
  const base=beats===3?G.vals:G.rock;
  for(const [key,row] of [['k','bd'],['s','sn'],['h','hh']])part[key]=Array.from({length:beats*groove.sub},(_,i)=>i%(groove.sub/base.sub)===0?base.rows[row][Math.floor(i/(groove.sub/base.sub))]||'-':'-').join('');
 }
}
