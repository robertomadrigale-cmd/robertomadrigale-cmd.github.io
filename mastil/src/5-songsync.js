/* ---------- karaoke sobre la grabación original: la app escucha la canción y se sincroniza sola ----------
   1) decodifica a ~11 kHz mono; 2) flujo espectral → tempo (autocorrelación, prefiere el bpm esperado) y pulsos
   (programación dinámica, Ellis 2007); 3) croma por pulso; 4) alinea con DTW la sucesión de acordes de la canción,
   pulso a pulso, contra los pulsos reales (probando los tonos más probables: capo o afinación medio tono abajo).
   5) voz: en las mezclas de estudio la voz va al centro y las guitarras a los lados; cuando (L+R) sube contra (L−R)
   en la banda de la voz, alguien canta. Así la letra espera en las partes solo musicales y las sílabas se reparten
   en lo que de verdad se canta. En grabaciones mono no hay pista y se usa solo lo demás.
   Resultado: el tiempo real donde empieza cada renglón, la rejilla de pulsos y la voz por pulso. */
const SR_AN=11025,SYNC_OFS=.018;
// ajuste fino: ventana (pulsos) a cada lado del cambio, castigo por moverse y mejora mínima para moverse (renglones / acordes)
const SYN={lw:2,lp:.02,lm:.01,cw:2,cp:.04,cm:.05,v:1};
function fftRI(re,im){
  const n=re.length;
  for(let i=1,j=0;i<n;i++){let b=n>>1;for(;j&b;b>>=1)j^=b;j^=b;if(i<j){let t=re[i];re[i]=re[j];re[j]=t;t=im[i];im[i]=im[j];im[j]=t}}
  for(let len=2;len<=n;len<<=1){const a=-2*Math.PI/len,wr=Math.cos(a),wi=Math.sin(a),h=len>>1;
    for(let i=0;i<n;i+=len){let cr=1,ci=0;for(let k=0;k<h;k++){const p=i+k,q=p+h,tr=re[q]*cr-im[q]*ci,ti=re[q]*ci+im[q]*cr;re[q]=re[p]-tr;im[q]=im[p]-ti;re[p]+=tr;im[p]+=ti;const nr=cr*wr-ci*wi;ci=cr*wi+ci*wr;cr=nr}}}
}
const hannW=n=>{const w=new Float32Array(n);for(let i=0;i<n;i++)w[i]=.5-.5*Math.cos(2*Math.PI*i/n);return w};
const syncIdle=()=>new Promise(r=>setTimeout(r,0));
function decodeAB(ctx,ab){return new Promise((res,rej)=>{const p=ctx.decodeAudioData(ab,res,rej);if(p&&p.then)p.then(res,rej)})}
async function syncDecode(blob){
  const ab=await blob.arrayBuffer(),OAC=window.OfflineAudioContext||window.webkitOfflineAudioContext;let buf=null;
  // el contexto de 11 kHz ya entrega el audio remuestreado (si el navegador no lo permite, se usa el normal)
  try{buf=await decodeAB(new OAC(1,1,SR_AN),ab.slice(0))}catch(e){}
  if(!buf){ac();buf=await decodeAB(AC,ab)}
  const sr=buf.sampleRate,d=Math.max(1,Math.round(sr/SR_AN)),n=Math.floor(buf.length/d),x=new Float32Array(n),C=buf.numberOfChannels,xs=C>1?new Float32Array(n):null;
  for(let c=0;c<C;c++){const s=buf.getChannelData(c);for(let i=0;i<n;i++){let a=0;const o=i*d;for(let k=0;k<d;k++)a+=s[o+k];x[i]+=a/(d*C);if(xs&&c<2)xs[i]+=(c?-a:a)/(2*d)}}
  return{x,xs,sr:sr/d};
}
async function syncAnalyze(x,sr,bpm0,prog,xs){
  prog=prog||(()=>{});
  // 1) flujo espectral: ventana 1024, salto 128 (≈ 11.6 ms)
  const N1=1024,H1=128,nf=Math.max(8,Math.floor((x.length-N1)/H1)),w1=hannW(N1),fr=sr/H1;
  let re=new Float32Array(N1),im=new Float32Array(N1);const prev=new Float32Array(N1/2),od=new Float32Array(nf),lf=new Float32Array(nf),kLo=Math.round(160*N1/sr);
  for(let f=0;f<nf;f++){const o=f*H1;for(let i=0;i<N1;i++){re[i]=(x[o+i]||0)*w1[i];im[i]=0}fftRI(re,im);
    let s=0;for(let k=2;k<N1/2;k++){const m=Math.log(1+100*Math.sqrt(re[k]*re[k]+im[k]*im[k])),df=m-prev[k];if(df>0){s+=df;if(k<=kLo)lf[f]+=df}prev[k]=m}od[f]=s;
    if(f%1500===0){prog(.6*f/nf);await syncIdle()}}
  // quitar la media local y normalizar
  const ma=Math.round(fr*.2),ps=new Float64Array(nf+1);for(let i=0;i<nf;i++)ps[i+1]=ps[i]+od[i];
  const on=new Float32Array(nf);let sd=0;
  for(let i=0;i<nf;i++){const a=Math.max(0,i-ma),b=Math.min(nf,i+ma+1);on[i]=Math.max(0,od[i]-(ps[b]-ps[a])/(b-a));sd+=on[i]*on[i]}
  sd=Math.sqrt(sd/nf)||1;for(let i=0;i<nf;i++)on[i]/=sd;
  // 2) tempo: autocorrelación + su doble, con preferencia por el bpm esperado (o ~115 si no se sabe)
  const lo=Math.floor(fr*60/208),hi=Math.ceil(fr*60/52),acf=new Float32Array(2*hi+3);
  for(let L=lo;L<acf.length;L++){let s=0;for(let i=L;i<nf;i++)s+=on[i]*on[i-L];acf[L]=s/(nf-L)}
  const c0=bpm0||115,sg=bpm0?.45:.9;let bestL=lo,bv=-1;
  for(let L=lo;L<=hi;L++){const bpm=60*fr/L,v=(acf[L]+.5*acf[2*L])*Math.exp(-.5*Math.pow(Math.log2(bpm/c0)/sg,2));if(v>bv){bv=v;bestL=L}}
  let per=bestL;{const a=acf[bestL-1],b=acf[bestL],c=acf[bestL+1],dn=a-2*b+c;if(dn<0)per+=.5*(a-c)/dn}
  // 3) pulsos: programación dinámica (cada pulso cae en un ataque y la distancia entre pulsos casi no cambia)
  const sw=Math.max(1,per/32),gk=[];for(let k=-Math.ceil(3*sw);k<=Math.ceil(3*sw);k++)gk.push([k,Math.exp(-.5*(k/sw)*(k/sw))]);
  const ls=new Float32Array(nf);for(let i=0;i<nf;i++){let s=0;for(const[k,g]of gk){const j=i+k;if(j>=0&&j<nf)s+=on[j]*g}ls[i]=s}
  const sc=new Float32Array(nf),bk=new Int32Array(nf).fill(-1),pmin=Math.round(per/2),pmax=Math.round(per*2);
  for(let t=0;t<nf;t++){let best=-1e9,arg=-1;for(let q=t-pmax;q<=t-pmin;q++){if(q<0)continue;const l=Math.log((t-q)/per),v=sc[q]-100*l*l;if(v>best){best=v;arg=q}}
    sc[t]=ls[t]+(arg>=0?Math.max(0,best):0);bk[t]=arg>=0&&best>0?arg:-1;if(t%4000===0){prog(.6+.2*t/nf);await syncIdle()}}
  let end=nf-1;for(let t=Math.max(0,nf-Math.round(per*1.5));t<nf;t++)if(sc[t]>sc[end])end=t;
  let bf=[];for(let t=end;t>=0;t=bk[t])bf.push(t);bf.reverse();
  // ¿pulso o contratiempo? (en cumbia, reggae o ska el acento va en el «y»): el bombo y el bajo caen en el pulso
  const lowAt=t=>{let m=0;for(let d=-2;d<=2;d++){const v=lf[Math.round(t)+d]||0;if(v>m)m=v}return m};
  let s0=0,s1=0;for(let i=0;i+1<bf.length;i++){s0+=lowAt(bf[i]);s1+=lowAt((bf[i]+bf[i+1])/2)}
  if(s1>s0*1.25)bf=bf.slice(0,-1).map((t,i)=>Math.round((t+bf[i+1])/2));
  // rellenar hacia el inicio con el mismo pulso, para que también la intro tenga rejilla
  while(bf.length&&bf[0]-per>0)bf.unshift(Math.round(bf[0]-per));
  const ft=f=>(f*H1+N1/2)/sr+SYNC_OFS,beats=bf.map(ft);
  // 4) croma: ventana 4096, salto 1024 (≈ 93 ms). Medios (180 Hz – 2.2 kHz) para el tipo de acorde y graves (55–180 Hz)
  //    aparte para la raíz: si van juntos, el bajo en la quinta parece el acorde siguiente
  const N2=4096,H2=1024,nc=Math.max(1,Math.floor((x.length-N2)/H2)+1),w2=hannW(N2),pcOf=new Int8Array(N2/2).fill(-1),lowB=new Uint8Array(N2/2);
  for(let k=1;k<N2/2;k++){const f=k*sr/N2;if(f>=55&&f<=2200){pcOf[k]=((Math.round(12*Math.log2(f/440))+69)%12+12)%12;lowB[k]=f<180?1:0}}
  re=new Float32Array(N2);im=new Float32Array(N2);const chroma=new Float32Array(nc*12),bassC=new Float32Array(nc*12),en=new Float32Array(nc);
  // banda de la voz (300 Hz – 3 kHz) en el centro (vm) y en los lados (vs)
  const k1=Math.round(300*N2/sr),k2=Math.round(3000*N2/sr),vm=new Float32Array(nc),vs=xs?new Float32Array(nc):null;
  for(let f=0;f<nc;f++){const o=f*H2;for(let i=0;i<N2;i++){re[i]=(x[o+i]||0)*w2[i];im[i]=0}fftRI(re,im);
    for(let k=1;k<N2/2;k++){const p=pcOf[k];const m=Math.sqrt(re[k]*re[k]+im[k]*im[k]);en[f]+=m;if(p>=0)(lowB[k]?bassC:chroma)[f*12+p]+=m;if(k>=k1&&k<=k2)vm[f]+=m}
    if(vs){for(let i=0;i<N2;i++){re[i]=(xs[o+i]||0)*w2[i];im[i]=0}fftRI(re,im);for(let k=k1;k<=k2;k++)vs[f]+=Math.sqrt(re[k]*re[k]+im[k]*im[k])}
    if(f%400===0){prog(.8+.2*f/nc);await syncIdle()}}
  prog(1);
  return{beats,bpm:60*fr/per,chroma,bassC,en,vm,vs,nc,ct:f=>(f*H2+N2/2)/sr,cq:N2/4/sr};
}
// croma promedio de cada tramo de la rejilla (normalizado), con su energía
// solo las ventanas que caen casi enteras dentro del tramo, para no «oír» el acorde antes de que suene
function gridChroma(A,grid){
  const out=[],BS=[],E=[],R=[],MS=[];let f=0;
  for(let j=0;j<grid.length;j++){const a0=grid[j],b0=j+1<grid.length?grid[j+1]:a0+(grid[j]-(grid[j-1]||a0-.5)),q=Math.min(A.cq,(b0-a0)/3),a=a0+q,b=b0-q,v=new Float32Array(12),u=new Float32Array(12);let e=0,n=0,m=0,s2=0;
    while(f<A.nc&&A.ct(f)<a)f++;
    for(let g=f;g<A.nc&&A.ct(g)<b;g++){for(let p=0;p<12;p++){v[p]+=A.chroma[g*12+p];u[p]+=A.bassC[g*12+p]}e+=A.en[g];m+=A.vm[g];if(A.vs)s2+=A.vs[g];n++}
    if(!n){const g=Math.min(A.nc-1,f);for(let p=0;p<12;p++){v[p]=A.chroma[g*12+p];u[p]=A.bassC[g*12+p]}e=A.en[g];n=1}
    nrm(v);nrm(u);out.push(v);BS.push(u);E.push(e/n);R.push(Math.log((m/n+1e-3)/(s2/n+1e-3)));MS.push(s2/(m||1))}
  // casi sin lados = grabación mono (o casi): no hay forma de oír la voz aparte
  const side=MS.slice().sort((a,b)=>a-b)[MS.length>>1]||0;
  return{C:out,BS,E,V:A.vs&&side>.04?vocalOf(R,E):null};
}
// voz por pulso (0 a 1), relativa a la misma canción; null si no se distingue (mono o mezcla muy angosta)
function vocalOf(R,E){
  const eMed=E.slice().sort((a,b)=>a-b)[E.length>>1]||1,ok=R.filter((r,j)=>E[j]>eMed*.1).sort((a,b)=>a-b);if(ok.length<16)return null;
  const lo=ok[Math.floor(ok.length*.15)],hi=ok[Math.floor(ok.length*.85)];if(hi-lo<.3)return null;
  return R.map((r,j)=>E[j]<eMed*.1?0:Math.max(0,Math.min(1,(r-lo)/(hi-lo))));
}
const nrm=v=>{let s=0;for(let i=0;i<v.length;i++)s+=v[i]*v[i];s=Math.sqrt(s)||1;for(let i=0;i<v.length;i++)v[i]/=s;return v};
// qué tanto suena el acorde en el pulso j: 72 % los medios (tipo de acorde) y 28 % los graves (raíz, algo de quinta)
function chordMatch(p,k,c,b,wb){
  wb=wb??.28;
  if(p._k!==k){p._k=k;p._t=chordTpl(p,k);const u=new Float32Array(12);u[(p.pc+k+127)%12]+=.3;u[((p.bass??p.pc)+k+120)%12]+=1;p._b=nrm(u)}
  const t=p._t,bb=p._b;
  let d=0,e=0;for(let q=0;q<12;q++){d+=t[q]*c[q];e+=bb[q]*b[q]}return(1-wb)*d+wb*e;
}
function chordTpl(p,k){
  const t=new Float32Array(12),r=(p.pc+k+120)%12,ty=chType(p.suf),mi=p.minor||/^(min|m7|m7b5|dim)$/.test(ty);
  const iv=[0,ty==='sus4'?5:ty==='sus2'?2:mi?3:4,ty==='dim'||ty==='m7b5'?6:ty==='aug'?8:7];
  if(/7|9/.test(ty))iv.push(ty==='maj7'?11:10);
  iv.forEach((v,i)=>t[(r+v)%12]+=[1.2,1.1,.75,.55][i]); // la tercera distingue el acorde de su vecino por quintas
  if(p.bass!=null)t[(p.bass+k+120)%12]+=.8;
  let s=0;for(let i=0;i<12;i++)s+=t[i]*t[i];s=Math.sqrt(s);for(let i=0;i<12;i++)t[i]/=s;return t;
}
/* DTW con inicio y final libres en la grabación (intro y final sin letra no cuestan).
   Diagonal = la canción y la grabación avanzan juntas; los otros pasos estiran o encogen y cuestan un poco. */
function syncDTW(X,C,BS,E,k,pen,LY,V){
  const M=X.length,N=C.length,eMed=E.slice().sort((a,b)=>a-b)[N>>1]||1,P0=[...new Set(X.filter(Boolean))],S=new Map(P0.map(p=>[p,new Float32Array(N)]));
  // cada acorde distinto contra cada pulso, una sola vez
  P0.forEach(p=>{const a=S.get(p);for(let j=0;j<N;j++)a[j]=chordMatch(p,k,C[j],BS[j])});
  // con voz: la letra cae donde se canta, lo instrumental donde no, y estirar sobre partes sin voz cuesta poco
  const cost0=(i,j)=>{if(E[j]<eMed*.06)return .6;const p=X[i];return p?1-S.get(p)[j]:.5};
  // esperar (la grabación avanza y la canción no): sobre una parte sin voz casi no cuesta, aunque el acorde no coincida
  const cost=V?(i,j)=>cost0(i,j)+(LY[i]?.3*(1-V[j]):.18*V[j]):cost0,wait=V?(i,j)=>pen*.3+.1+.6*V[j]:(i,j)=>pen+cost0(i,j);
  // encoger dentro de la letra cuesta menos: lo que dura cada renglón cantado es lo más incierto de la estimación
  const squeeze=V?i=>LY[i]&&LY[i-1]?pen*.4:pen:()=>pen;
  const D=new Float32Array(M*N),B=new Uint8Array(M*N);
  for(let j=0;j<N;j++)D[j]=cost(0,j)-.005*Math.min(j,64); // en empates (intro con el mismo acorde) entra lo más tarde
  for(let i=1;i<M;i++){const r=i*N,rp=r-N;D[r]=D[rp]+pen+cost(i,0);B[r]=2;
    for(let j=1;j<N;j++){const ci=cost(i,j),a=D[rp+j-1]+ci,b=D[r+j-1]+wait(i,j),c=D[rp+j]+squeeze(i)+ci;let m=a,s=0;if(b<m){m=b;s=1}if(c<m){m=c;s=2}D[r+j]=m;B[r+j]=s}}
  let jb=0;const L=(M-1)*N;for(let j=1;j<N;j++)if(D[L+j]<D[L+jb])jb=j;
  // de atrás hacia adelante: F[i] se queda con el primer pulso de la grabación que le tocó a cada pulso de la canción
  let i=M-1,j=jb;const F=new Int32Array(M).fill(-1);
  while(i>=0){F[i]=j;const s=B[i*N+j];if(i===0)break;if(s===0){i--;j--}else if(s===1)j--;else i--}
  return{cost:D[L+jb]/M,J:F};
}
// TL = línea de tiempo de la canción (en pulsos); A = análisis de la grabación
function syncAlign(A,TL,bt){
  bt=bt||4;
  const grid=A.beats;if(grid.length<8||!TL.lines.length)return null;
  const M=Math.max(1,Math.ceil(TL.total)),X=[];for(let i=0;i<M;i++)X.push(TL.chAt[Math.round(i*TL.res)]||null);
  if(!X.some(Boolean))return null;
  const{C,BS,E,V}=gridChroma(A,grid);
  // pulsos de la canción con letra: de la primera a la última sílaba de cada renglón
  const LY=new Uint8Array(M);TL.lines.forEach(L=>{const b=TL.ev.filter(e=>e.type==='lit'&&e.li===L.li).map(e=>e.b);if(!b.length)return;
    for(let i=Math.max(0,Math.floor(Math.min(...b)));i<=Math.min(M-1,Math.floor(Math.max(...b)));i++)LY[i]=1});
  // los 12 tonos (capo, afinación medio tono abajo…): gana el que mejor alinea; el escrito tiene una pequeña ventaja
  const all=[];for(let k=-5;k<=6;k++){const r=syncDTW(X,C,BS,E,k,.18,LY,V);r.k=k;if(k)r.cost+=.01;all.push(r)}
  all.sort((a,b)=>a.cost-b.cost);const best=all[0],sure=all[1].cost-best.cost>.015;
  const F=best.J,at=b=>{const i=Math.max(0,Math.min(M-1,Math.floor(b))),fr=Math.max(0,b-i),j=F[i],a=grid[j],n=grid[j+1]??a+60/A.bpm;return a+fr*(n-a)};
  const T={};TL.lines.forEach(L=>{T[L.li]=+at(Math.max(0,L.start)).toFixed(3)});
  // ajuste fino: el renglón empieza donde de verdad entra su primer acorde (busca ±4 pulsos alrededor)
  // aquí solo los medios: la guitarra cambia justo en el cambio; el bajo a veces se adelanta con la quinta
  const mt=(j,p)=>j<0||j>=C.length?0:chordMatch(p,best.k,C[j],BS[j],0);
  const same=(a,b)=>a&&b&&a.pc===b.pc&&chType(a.suf)===chType(b.suf);
  TL.lines.forEach((L,g)=>{const ce=TL.ev.find(e=>e.type==='chord'&&e.li===L.li);if(!ce)return;const bc=Math.round(ce.b),pv=X[bc-1];if(bc<1||bc>=M||!pv||same(pv,ce.p))return;
    // un compás después contra un compás antes (con arpegios, un solo pulso es muy ruidoso); solo se mueve si mejora claro
    // contraste: después del inicio suena más el acorde nuevo que el anterior, y antes al revés
    const jc=F[bc],w=SYN.lw||bt,df=(j,a,b)=>{let s=0;for(let i=a;i<b;i++)s+=mt(j+i,ce.p)-mt(j+i,pv);return s/(b-a)};
    let bd=0,bs=df(jc,0,w)-df(jc,-w,0);for(let d=-4;d<=4;d++){const s=df(jc+d,0,w)-df(jc+d,-w,0)-SYN.lp*Math.abs(d);if(s>bs+SYN.lm){bs=s;bd=d}}
    if(!bd)return;const nt=+gridT(grid,gridIdx(grid,T[L.li])+bd).toFixed(3),pr=g?T[TL.lines[g-1].li]:-1e9,nx=TL.lines[g+1]?T[TL.lines[g+1].li]:1e9;
    if(nt>pr+.2&&nt<nx-.2)T[L.li]=nt});
  // con voz: el primer renglón con letra empieza donde entra la voz (si la intro toca el mismo acorde, los acordes no lo dicen)
  const L0=TL.lines.find(L=>TL.ev.some(e=>e.type==='lit'&&e.li===L.li));
  if(V&&L0&&SYN.v){const j0=Math.round(gridIdx(grid,T[L0.li]));let bj=-1;for(let d=0;d<=12&&bj<0;d++)for(const j of d?[j0-d,j0+d]:[j0])if(bj<0&&j>=0&&j+1<V.length&&V[j]>=.5&&V[j+1]>=.5&&((V[j-1]??0)+(V[j-2]??0)+(V[j-3]??0))/3<.4)bj=j; // antes, ~3 pulsos sin voz (no una pausa entre sílabas)
    const g=TL.lines.indexOf(L0),nx=TL.lines[g+1]?T[TL.lines[g+1].li]:1e9;if(bj>=0&&grid[bj]<nx-.2)T[L0.li]=+grid[bj].toFixed(3)}
  // anclas por acorde: cada cambio de acorde dentro de un renglón, donde de verdad suena (±2 pulsos de lo que dijo el DTW).
  // Con ellas la letra y los acordes siguen a la grabación aunque el renglón dure distinto de lo estimado.
  const anc=[],starts=new Set(TL.lines.map(L=>Math.round(L.start*4)));let pv=null;
  TL.ev.filter(e=>e.type==='chord').sort((a,b)=>a.b-b.b).forEach(e=>{const prev=pv;pv=e.p;if(!prev||same(prev,e.p)||starts.has(Math.round(e.b*4)))return;
    const bc=Math.round(e.b);if(bc<1||bc>=M)return;const jc=F[bc],df=(j,a,b)=>{let s=0;for(let i=a;i<b;i++)s+=mt(j+i,e.p)-mt(j+i,prev);return s/(b-a)};
    const cw=SYN.cw;let bd=0,bs=df(jc,0,cw)-df(jc,-cw,0);for(let d=-2;d<=2;d++){if(!d)continue;const s=df(jc+d,0,cw)-df(jc+d,-cw,0)-SYN.cp*Math.abs(d);if(s>bs+SYN.cm){bs=s;bd=d}}
    anc.push([+e.b.toFixed(3),+gridT(grid,jc+bd+(e.b-bc)).toFixed(3)])});
  return{T,anc,grid:grid.map(t=>+t.toFixed(3)),voc:V?V.map(v=>+v.toFixed(2)):null,bpm:Math.round(A.bpm),k:best.k,sure,cost:best.cost};
}
// posición (en pulsos, con fracción) de un tiempo dentro de la rejilla, y su inversa
function gridIdx(g,t){const n=g.length;if(n<2)return 0;if(t<=g[0])return(t-g[0])/(g[1]-g[0]);if(t>=g[n-1])return n-1+(t-g[n-1])/(g[n-1]-g[n-2]);
  let lo=0,hi=n-1;while(hi-lo>1){const m=(lo+hi)>>1;if(g[m]<=t)lo=m;else hi=m}return lo+(t-g[lo])/(g[hi]-g[lo])}
function gridT(g,x){const n=g.length;if(n<2)return g[0]||0;if(x<=0)return g[0]+x*(g[1]-g[0]);if(x>=n-1)return g[n-1]+(x-n+1)*(g[n-1]-g[n-2]);const i=Math.floor(x);return g[i]+(x-i)*(g[i+1]-g[i])}
/* ---------- acordes desde el audio (sin IA, como Moises) ----------
   Con la rejilla de pulsos y el croma de cada pulso (medios + graves) se compara contra las 24 tríadas mayores y
   menores; Viterbi elige la sucesión más probable (cambiar de acorde cuesta, para no saltar en cada pulso).
   Pulsos casi en silencio = sin acorde. Devuelve un acorde (o null) por pulso. */
function chordsFromAudio(A){
  const grid=A.beats;if(grid.length<8)return null;
  const{C,BS,E}=gridChroma(A,grid),N=grid.length,eMed=E.slice().sort((a,b)=>a-b)[N>>1]||1;
  const TP=[];for(let pc=0;pc<12;pc++){TP.push({pc,suf:'',bass:null,minor:false});TP.push({pc,suf:'m',bass:null,minor:true})}
  const K=TP.length+1,SW=.11,score=(j,k)=>k===TP.length?(E[j]<eMed*.08?.9:.2):(E[j]<eMed*.08?0:chordMatch(TP[k],0,C[j],BS[j]));
  let D=new Float32Array(K),B=[];for(let k=0;k<K;k++)D[k]=score(0,k);
  for(let j=1;j<N;j++){let bk=0;for(let k=1;k<K;k++)if(D[k]>D[bk])bk=k;const nd=new Float32Array(K),bb=new Uint8Array(K);
    for(let k=0;k<K;k++){const stay=D[k],sw=D[bk]-SW;if(stay>=sw){nd[k]=stay;bb[k]=k}else{nd[k]=sw;bb[k]=bk}nd[k]+=score(j,k)}B.push(bb);D=nd}
  let k=0;for(let q=1;q<K;q++)if(D[q]>D[k])k=q;const path=new Array(N);path[N-1]=k;for(let j=N-1;j>0;j--){k=B[j-1][k];path[j-1]=k}
  // cambios de un solo pulso entre dos iguales se quitan (suelen ser notas de paso)
  for(let j=1;j+1<N;j++)if(path[j]!==path[j-1]&&path[j-1]===path[j+1])path[j]=path[j-1];
  return{grid,ch:path.map(q=>q===TP.length?null:TP[q]),bpm:A.bpm};
}
/* la canción completa en ChordPro a partir de los acordes por pulso y (si hay) la letra con tiempos de la IA:
   lyr = [{t: segundo en que empieza, text, sec}] */
function songFromAudio(R,lyr,meta){
  const g=R.grid,ch=R.ch,nm=p=>p?US12F[p.pc].replace('♭','b')+p.suf:'',bt=4,beatAt=t=>Math.max(0,Math.min(g.length-1,Math.round(gridIdx(g,t))));
  const chordAtBeat=j=>{for(let q=j;q>=0;q--)if(ch[q])return ch[q];return null};
  // compases de solo acordes entre dos pulsos (4 compases por renglón)
  const barsLine=(j0,j1)=>{const out=[];let row=[],last=null;for(let j=j0;j<j1;j+=bt){const seg=[];for(let q=j;q<Math.min(j+bt,j1);q++){const c=ch[q];if(c&&(!seg.length||nm(seg[seg.length-1])!==nm(c)))seg.push(c)}
      const s=seg.length?seg:[chordAtBeat(j)].filter(Boolean);s.forEach(c=>{row.push('['+nm(c)+']')});if(row.length>=4){out.push(row.join(' '));row=[]}}if(row.length)out.push(row.join(' '));return out};
  const L=[];const all=ch.map(nm).filter(Boolean);
  const key=(()=>{try{const k=detectKey(all.map(x=>chParse(x)));return chName(k,0,k,false)+(k.minor&&!/m/.test(k.suf||'')?'m':'')}catch(e){return''}})();
  L.push(`{title:${meta.title||'Mi canción'}}`);if(meta.artist)L.push(`{artist:${meta.artist}}`);L.push(`{bpm:${Math.round(R.bpm)}}`);if(key)L.push(`{key:${key}}`);L.push('');
  const lines=(lyr||[]).filter(x=>x&&x.text&&isFinite(x.t)).sort((a,b)=>a.t-b.t);
  if(!lines.length){L.push('{c:Acordes de la grabación}');barsLine(0,g.length).forEach(x=>L.push(x));return L.join('\n')}
  let sec=null;const j0=beatAt(lines[0].t);
  if(j0>=bt){L.push('{c:Intro}');barsLine(0,j0).forEach(x=>L.push(x))}
  lines.forEach((x,i)=>{
    if(x.sec&&x.sec!==sec){sec=x.sec;L.push('');L.push(`{c:${sec}}`)}
    const t0=x.t,tn=i+1<lines.length?lines[i+1].t:g[g.length-1],words=x.text.trim().split(/\s+/),txt=words.join(' ');
    // lo que dura lo cantado: ~0.3 s por sílaba, sin pasar del siguiente renglón
    const syl=(txt.match(/[aeiouáéíóúü]+/gi)||[]).length||words.length,tend=Math.min(tn,t0+Math.max(1.4,syl*.38)),ja=beatAt(t0),jb=Math.max(ja+1,beatAt(tend));
    const marks=[];let prev=null;const c0=chordAtBeat(ja);if(c0){marks.push([0,nm(c0)]);prev=nm(c0)}
    for(let j=ja+1;j<jb;j++){const c=ch[j];if(c&&nm(c)!==prev){prev=nm(c);marks.push([(g[j]-t0)/Math.max(.5,tend-t0),prev])}}
    // cada acorde va al inicio de la palabra más cercana a su momento
    const pos=[];let acc=0;words.forEach(w=>{pos.push(acc/txt.length);acc+=w.length+1});const at={};
    marks.forEach(([f,c])=>{let w=0,bd=9;pos.forEach((p,k)=>{const d=Math.abs(p-f);if(d<bd){bd=d;w=k}});at[w]=(at[w]||[]);if(!at[w].includes(c))at[w].push(c)});
    // interludio: si hasta el siguiente renglón quedan 3 compases o más sin canto, van como renglones de acordes;
    // si es menos, los cambios de acorde mientras se sostiene la nota quedan al final del renglón
    const jn=i+1<lines.length?beatAt(lines[i+1].t):g.length,inter=jn-jb>=bt*3,tail=[];
    if(!inter)for(let j=jb;j<jn;j++){const c=ch[j];if(c&&nm(c)!==prev){prev=nm(c);tail.push('['+prev+']')}}
    L.push(words.map((w,k)=>(at[k]?at[k].map(c=>'['+c+']').join(''):'')+w).join(' ')+(tail.length?' '+tail.join(' '):''));
    if(inter){const ins=barsLine(jb+(jb%bt?bt-jb%bt:0),jn);if(ins.length){L.push('');L.push(i+1<lines.length?'{c:Instrumental}':'{c:Final}');ins.forEach(y=>L.push(y));sec=null}}
  });
  return L.join('\n');
}
