/* YIN con reducción a ~12 kHz. Ventana original 8192: >5 ciclos de Si0 a 48 kHz. */
function bassPitch(input,sr,minHz=INST.pitchMin,maxHz=INST.pitchMax){
 const stride=Math.max(1,Math.floor(sr/12000)),n=Math.floor(input.length/stride),rate=sr/stride,b=new Float32Array(n);
 let mean=0;for(let i=0;i<n;i++){let v=0;for(let j=0;j<stride;j++)v+=input[i*stride+j];b[i]=v/stride;mean+=b[i]}mean/=n;
 let energy=0;for(let i=0;i<n;i++){b[i]-=mean;energy+=b[i]*b[i]}const rms=Math.sqrt(energy/n);if(rms<.003)return -1;
 const max=Math.min(Math.floor(rate/minHz),Math.floor(n/2)-1),min=Math.max(2,Math.floor(rate/maxHz)),span=n-max,cm=new Float64Array(max+1);let sum=0;
 for(let tau=1;tau<=max;tau++){let d=0;for(let i=0;i<span;i++){const v=b[i]-b[i+tau];d+=v*v}sum+=d;cm[tau]=sum?d*tau/sum:1}
 for(let tau=min;tau<max;tau++){if(cm[tau]>.12)continue;while(tau+1<max&&cm[tau+1]<cm[tau])tau++;const a=cm[tau-1],v=cm[tau],z=cm[tau+1],den=a-2*v+z,shift=den?(a-z)/(2*den):0,f=rate/(tau+shift);if(f<minHz||f>maxHz)return -1;return f}return -1;
}
