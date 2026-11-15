/* ---------- importar canciones desde archivo: PDF de Ultimate Guitar, TXT o ChordPro ----------
   El PDF se lee con pdf.js (se descarga de cdnjs la primera vez que se usa; el resto de la app sigue sin conexión).
   Cada texto del PDF trae su posición: se rearma renglón por renglón respetando las columnas (Ultimate Guitar usa dos)
   y los espacios de la letra monoespaciada, para que los acordes queden encima de su sílaba. Luego se lee el encabezado
   (título «X by Artista», Key, Capo, bpm) y se convierte a ChordPro. */
const PDFJS_URL='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
function loadPdfJs(){
  if(window.pdfjsLib)return Promise.resolve(window.pdfjsLib);
  return new Promise((res,rej)=>{const s=document.createElement('script');s.src=PDFJS_URL+'pdf.min.js';
    s.onload=()=>{try{window.pdfjsLib.GlobalWorkerOptions.workerSrc=PDFJS_URL+'pdf.worker.min.js';res(window.pdfjsLib)}catch(e){rej(e)}};
    s.onerror=()=>rej(new Error('Para leer el PDF la app necesita internet la primera vez.'));document.head.appendChild(s)});
}
async function pdfLines(file){
  const lib=await loadPdfJs(),doc=await lib.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise,out=[];
  for(let n=1;n<=doc.numPages;n++){
    const pg=await doc.getPage(n),W=pg.getViewport({scale:1}).width,tc=await pg.getTextContent();
    const it=tc.items.filter(i=>i.str&&i.str.trim()).map(i=>({s:i.str,x:i.transform[4],y:i.transform[5],w:i.width,h:Math.abs(i.transform[3])||10}));
    if(!it.length)continue;
    // ancho de letra de la fuente monoespaciada (la de la canción)
    const cws=it.filter(i=>i.s.length>=4).map(i=>i.w/i.s.length).sort((a,b)=>a-b),cw=cws[cws.length>>1]||5;
    // dos columnas: hay textos que empiezan pasada la mitad y nada del lado izquierdo cruza la mitad
    const mid=W*.47,R=it.filter(i=>i.x>=mid),cols=R.length>2&&!it.some(i=>i.x<mid&&i.x+i.w>mid+cw*2)?[it.filter(i=>i.x<mid),R]:[it];
    cols.forEach(col=>{
      const x0=Math.min(...col.map(i=>i.x)),L=[];
      col.sort((a,b)=>b.y-a.y||a.x-b.x).forEach(i=>{let l=L.find(q=>Math.abs(q.y-i.y)<Math.max(2,i.h*.45));if(!l){l={y:i.y,h:i.h,it:[]};L.push(l)}l.it.push(i)});
      L.sort((a,b)=>b.y-a.y);
      const gaps=L.slice(1).map((l,k)=>L[k].y-l.y).sort((a,b)=>a-b),gm=gaps[gaps.length>>1]||12;
      L.forEach((l,k)=>{if(k&&L[k-1].y-l.y>gm*1.55)out.push('');
        let s='';l.it.sort((a,b)=>a.x-b.x).forEach(i=>{const c=Math.max(0,Math.round((i.x-x0)/cw));if(c>s.length)s+=' '.repeat(c-s.length);else if(s&&!/\s$/.test(s))s+=' ';s+=i.s});
        out.push(s.replace(/\s+$/,''))});
      out.push('');
    });
  }
  return out;
}
const UG_SEC={intro:'Intro',verse:'Verso','pre-chorus':'Pre-coro',prechorus:'Pre-coro',chorus:'Coro',bridge:'Puente',outro:'Final',interlude:'Interludio',solo:'Solo',instrumental:'Instrumental',hook:'Coro',refrain:'Coro','post-chorus':'Coro',breakdown:'Puente',riff:'Riff'};
// texto de Ultimate Guitar (de PDF o copiado) → ChordPro con encabezado
function ugToChordPro(lines){
  lines=lines.map(l=>l.replace(/ /g,' ')).filter(l=>!/^\s*Page \d+\s*\/\s*\d+\s*$/i.test(l)&&!/^\s*Página \d+/i.test(l));
  const isSec=l=>/^\s*\[[^\]]{2,30}\]\s*$/.test(l);
  let first=lines.findIndex(isSec);if(first<0)first=lines.findIndex(l=>/^\s*Tuning:|^\s*Key:/i.test(l))+1||0;
  const head=lines.slice(0,first).join('\n'),meta={};
  // título: la primera línea con texto («Laid Official by James»)
  const t0=lines.slice(0,first).find(l=>l.trim()&&!/^(Tuning|Key|Capo|CHORDS|STRUMMING)/i.test(l.trim()));
  if(t0){const m=/^(.*?)\s+(?:by|de)\s+(.+)$/i.exec(t0.trim());if(m){meta.title=m[1].replace(/\s+(Official|Chords|Tab|Ver \d+)\s*$/ig,'').trim();meta.artist=m[2].trim()}else meta.title=t0.trim()}
  let m=/Key:\s*([A-G][#b]?m?)/i.exec(head);if(m)meta.key=m[1];
  m=/(\d{2,3})\s*bpm/i.exec(head);if(m)meta.bpm=+m[1];
  m=/Capo:\s*(?:fret\s*)?(\d+)/i.exec(head);if(m&&+m[1])meta.capo=+m[1];
  const body=lines.slice(first).map(l=>{const s=/^\s*\[([^\]]+)\]\s*$/.exec(l);if(s){const k=s[1].trim(),base=k.toLowerCase().replace(/\s*\d+$/,'').trim(),num=(/\d+$/.exec(k)||[''])[0];return'['+(UG_SEC[base]?UG_SEC[base]+(num?' '+num:''):k)+']'}
    return l.replace(/_/g,' ')});
  // quitar renglones vacíos repetidos
  const clean=[];body.forEach(l=>{if(!l.trim()&&clean.length&&!clean[clean.length-1].trim())return;clean.push(l)});
  const hd=(meta.title?`{title:${meta.title}}\n`:'')+(meta.artist?`{artist:${meta.artist}}\n`:'')+(meta.key?`{key:${meta.key}}\n`:'')+(meta.bpm?`{bpm:${meta.bpm}}\n`:'')+(meta.capo?`{comment:Capo en el traste ${meta.capo}}\n`:'');
  return{src:hd+'\n'+clean.join('\n').trim()+'\n',meta};
}
// cualquier archivo de canción → ChordPro
async function importSongFile(f){
  const name=(f.name||'').toLowerCase();
  if(/\.pdf$/.test(name)||f.type==='application/pdf'){
    // con texto (PDF de LaCuerda, Cifra Club, Word…) se lee sin IA; si viene como dibujo (Ultimate Guitar), la lee la IA
    let lines=null,err=null;try{lines=await pdfLines(f)}catch(e){err=e}
    const txt=lines?lines.join('\n'):'',chords=txt.split('\n').filter(l=>l.trim()&&isChordLine(l)).length;
    if(chords>=2&&!iaReadsPdf())return ugToChordPro(lines);
    if(iaReadsPdf()){try{return await iaReadSongPdf(f)}catch(e){if(chords>=2)return ugToChordPro(lines);throw e}}
    if(chords>=2)return ugToChordPro(lines);
    throw new Error(err&&!lines?err.message:'Este PDF trae la canción como dibujo, no como texto. Conecta Gemini, ChatGPT o Claude en Asistente IA y la app lo lee sola.');
  }
  const t=await f.text();
  return /\{\s*(title|t)\s*:/i.test(t)?{src:t,meta:{}}:ugToChordPro(t.split(/\r?\n/));
}
