const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function load(){
  const ctx={console,performance,setTimeout,clearTimeout,TextEncoder,TextDecoder,Uint8Array,Float32Array,ArrayBuffer,DOMException,AbortController,structuredClone,btoa,atob,localStorage:{getItem:()=>null,setItem(){}},AC:{currentTime:0},document:{},window:{}};
  vm.createContext(ctx);let src=fs.readFileSync(path.join(__dirname,'1-base.js'),'utf8').split('/* ---------- temas')[0];
  for(const name of ['3-pitch.js','4-content.js','5-lane.js','5-coach.js','5-song-data.js','5-song-library.js'])src+='\n'+fs.readFileSync(path.join(__dirname,name),'utf8');
  vm.runInContext(src+'\nthis.api={DB,SONGS,SONGLIST,CATALOG_ADDITIONS,songParse,songSpec,songShift,songFit,allSongs,songById,silabas,syllabify,strictMelody,validateSongRow,persistMySongs,songBackup,parseSongBackup,smoothPitch,segmentPitch,extractMelody,prepareSamples,distributeNotes,assignNotes,melodyText,m2f,detectPitch,scaleNotes,freePitchStats,timedSongSpec};',ctx);
  return{a:ctx.api,ctx};
}
function signal(notes,{sr=48000,stereo=false,noise=.015}={}){
  const duration=notes.at(-1).t1+.2,L=new Float32Array(Math.ceil(duration*sr)),R=new Float32Array(L.length);let seed=13;
  for(let i=0;i<L.length;i++){
    const t=i/sr,n=notes.find(n=>t>=n.t0&&t<n.t1-.09);let voice=0;
    if(n){const f=440*2**((n.m-69)/12),age=t-n.t0,end=n.t1-.09-t,env=Math.min(1,age/.015,end/.02);voice=env*(.26*Math.sin(2*Math.PI*f*t)+.1*Math.sin(4*Math.PI*f*t)+.04*Math.sin(6*Math.PI*f*t))}
    seed=(1664525*seed+1013904223)>>>0;const random=seed/4294967296*2-1;
    const chord=.10*Math.sin(2*Math.PI*130.8128*t)+.07*Math.sin(2*Math.PI*164.8138*t)+.06*Math.sin(2*Math.PI*195.9977*t);
    const side=stereo?chord+noise*random:0;
    L[i]=voice+side;R[i]=voice-side*.85; // fuga del 7.5 % al centro, no cancelación ideal
  }
  return{channels:stereo?[L,R]:[L],sr,duration};
}
function wav(data){
  const {channels,sr}=data,frames=channels[0].length,n=channels.length,bytes=frames*n*2,out=Buffer.alloc(44+bytes);
  out.write('RIFF');out.writeUInt32LE(36+bytes,4);out.write('WAVE',8);out.write('fmt ',12);out.writeUInt32LE(16,16);out.writeUInt16LE(1,20);out.writeUInt16LE(n,22);out.writeUInt32LE(sr,24);out.writeUInt32LE(sr*n*2,28);out.writeUInt16LE(n*2,32);out.writeUInt16LE(16,34);out.write('data',36);out.writeUInt32LE(bytes,40);
  for(let i=0;i<frames;i++)for(let c=0;c<n;c++)out.writeInt16LE(Math.round(Math.max(-1,Math.min(1,channels[c][i]))*32767),44+(i*n+c)*2);return out;
}
module.exports={load,signal,wav};
