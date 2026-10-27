/* YIN con reducción a ~12 kHz. Ventana original 8192: >5 ciclos de Si0 a 48 kHz. */
function detectPitch(input,sr,minHz=28,maxHz=420){
 const stride=Math.max(1,Math.floor(sr/12000)),n=Math.floor(input.length/stride),rate=sr/stride,b=new Float32Array(n);
 let mean=0;for(let i=0;i<n;i++){let v=0;for(let j=0;j<stride;j++)v+=input[i*stride+j];b[i]=v/stride;mean+=b[i]}mean/=n;
 let energy=0;for(let i=0;i<n;i++){b[i]-=mean;energy+=b[i]*b[i]}const rms=Math.sqrt(energy/n);if(rms<.003)return null;
 const max=Math.min(Math.floor(rate/minHz),Math.floor(n/2)-1),min=Math.max(2,Math.floor(rate/maxHz)),span=n-max,cm=new Float64Array(max+1);let sum=0;
 for(let tau=1;tau<=max;tau++){let d=0;for(let i=0;i<span;i++){const v=b[i]-b[i+tau];d+=v*v}sum+=d;cm[tau]=sum?d*tau/sum:1}
 for(let tau=min;tau<max;tau++){if(cm[tau]>.12)continue;while(tau+1<max&&cm[tau+1]<cm[tau])tau++;const a=cm[tau-1],v=cm[tau],z=cm[tau+1],den=a-2*v+z,shift=den?(a-z)/(2*den):0,f=rate/(tau+shift);if(f<minHz||f>maxHz)return null;return {f,c:1-v,rms,m:f2m(f)}}return null;
}
const MIC={stream:null,node:null,source:null,timer:0,epoch:0,on:null};
function micStop(){MIC.epoch++;clearInterval(MIC.timer);MIC.stream?.getTracks().forEach(t=>t.stop());MIC.source?.disconnect();MIC.node?.disconnect();MIC.stream=null;MIC.on=null}
async function micStart(on){
 micStop();const epoch=MIC.epoch;
 if(!navigator.mediaDevices?.getUserMedia)throw Error('El micrófono necesita HTTPS o localhost y un navegador compatible.');
 let stream;try{stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false},video:false})}catch(e){throw Error(e.name==='NotAllowedError'?'Permite el micrófono en los ajustes del navegador.':'No se pudo abrir el micrófono. Revisa que esté conectado y disponible.')}
 if(epoch!==MIC.epoch){stream.getTracks().forEach(t=>t.stop());return false}
 const c=ac();try{if(navigator.audioSession)navigator.audioSession.type='play-and-record'}catch(_){}
 MIC.stream=stream;MIC.source=c.createMediaStreamSource(stream);MIC.node=c.createAnalyser();MIC.node.fftSize=8192;MIC.source.connect(MIC.node);MIC.on=on;
 const buf=new Float32Array(8192);MIC.timer=setInterval(()=>{MIC.node.getFloatTimeDomainData(buf);const p=detectPitch(buf,c.sampleRate);MIC.on?.(p?{...p,t:c.currentTime-outLat(c)-buf.length/c.sampleRate/2}:null)},50);return true;
}
