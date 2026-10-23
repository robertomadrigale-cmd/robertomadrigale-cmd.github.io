/* ---------- detección de tono de la voz (YIN) ----------
   YIN compara la señal con ella misma recorrida en el tiempo; el retraso en que más se parece es el periodo.
   Es más estable con la voz que la autocorrelación simple del afinador de guitarra (menos saltos de octava).
   Devuelve {f, c} (frecuencia y claridad 0–1) o null si hay silencio o ruido. */
let YD=null;
function detectPitch(buf,sr){
  const n=buf.length;let rms=0;for(let i=0;i<n;i++)rms+=buf[i]*buf[i];rms=Math.sqrt(rms/n);
  if(rms<.008)return null;
  const W=n>>1,minT=Math.max(2,Math.floor(sr/1100)),maxT=Math.min(W-1,Math.floor(sr/65));
  if(!YD||YD.length<maxT+2)YD=new Float32Array(maxT+2);
  const d=YD;d[0]=1;let run=0;
  for(let tau=1;tau<=maxT+1;tau++){
    let s=0;for(let j=0;j<W;j++){const x=buf[j]-buf[j+tau];s+=x*x}
    run+=s;d[tau]=run?s*tau/run:1; // diferencia normalizada acumulada
  }
  let tau=-1;
  for(let t=minT;t<=maxT;t++){if(d[t]<.15){while(t+1<=maxT&&d[t+1]<d[t])t++;tau=t;break}}
  if(tau<0){let mv=1;for(let t=minT;t<=maxT;t++)if(d[t]<mv){mv=d[t];tau=t}if(mv>.32)return null}
  let T=tau;const x0=d[tau-1],x1=d[tau],x2=d[tau+1];const a=(x0+x2-2*x1)/2,b=(x2-x0)/2;if(a>0)T=tau-b/(2*a);
  const f=sr/T;if(f<65||f>1100)return null;
  return{f,c:1-d[tau],rms};
}
/* ---------- micrófono ----------
   MIC.on(data) recibe cada 40 ms {m (nota MIDI con decimales) | null, rms, t (tiempo de audio corregido)}. */
const MIC={stream:null,src:null,an:null,iv:null,buf:null,hist:[],on:null,level:0};
async function micStart(onData,onErr){
  MIC.on=onData;
  if(MIC.stream)return true;
  if(!window.isSecureContext||!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){onErr&&onErr('nosupport');return false}
  try{
    const s=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
    const c=ac();MIC.stream=s;MIC.src=c.createMediaStreamSource(s);MIC.an=c.createAnalyser();MIC.an.fftSize=2048;
    MIC.src.connect(MIC.an);MIC.buf=new Float32Array(MIC.an.fftSize);MIC.hist=[];
    MIC.iv=setInterval(()=>{
      if(!MIC.an)return;
      MIC.an.getFloatTimeDomainData(MIC.buf);const r=detectPitch(MIC.buf,c.sampleRate);
      let rms=0;for(let i=0;i<MIC.buf.length;i+=4)rms+=MIC.buf[i]*MIC.buf[i];rms=Math.sqrt(rms/(MIC.buf.length/4));MIC.level=rms;
      // el sonido que llega al micrófono corresponde a lo que se programó hace outLat + media ventana de análisis
      const t=c.currentTime-outLat()-.025;
      let m=null;
      if(r&&r.c>.6){
        const mm=f2m(r.f);
        // mediana de 3 lecturas: quita saltos sueltos de octava
        MIC.hist.push(mm);if(MIC.hist.length>3)MIC.hist.shift();
        const so=[...MIC.hist].sort((a,b)=>a-b);m=so[so.length>>1];
        if(Math.abs(m-mm)>1)m=mm; // si de verdad cambiaste de nota, síguela
      }else MIC.hist=[];
      if(MIC.on)MIC.on({m,rms,t});
    },40);
    WAKE++;wake(true);emitState();return true;
  }catch(e){onErr&&onErr(e&&e.name==='NotAllowedError'?'denied':e&&e.name==='NotFoundError'?'nomic':'other');return false}
}
function micStop(){
  if(MIC.iv)clearInterval(MIC.iv);MIC.iv=null;MIC.on=null;
  if(MIC.stream){MIC.stream.getTracks().forEach(t=>t.stop());WAKE=Math.max(0,WAKE-1);wake(false)}
  try{MIC.src&&MIC.src.disconnect()}catch(e){}
  MIC.stream=MIC.src=MIC.an=null;emitState();
}
const MICERR={denied:'El micrófono está bloqueado. Permite el acceso al micrófono para este sitio en los ajustes del navegador y vuelve a intentarlo.',nomic:'No se encontró un micrófono en este dispositivo.',nosupport:'Este navegador no permite usar el micrófono aquí. Abre la app instalada o el sitio en Chrome o Safari.',other:'No se pudo iniciar el micrófono. Vuelve a intentarlo.'};
const micErrHTML=k=>`<p class="msg err">${MICERR[k]||MICERR.other}</p>`;
