const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
module.exports=function(){const state={};const ctx=vm.createContext({console,Float32Array,Float64Array,Map,Set,WeakMap,URL,URLSearchParams,localStorage:{getItem:k=>state[k]||null,setItem:(k,v)=>state[k]=v},setTimeout,clearTimeout,setInterval,clearInterval});
 const dirs=[path.resolve(__dirname,'../../comun/src'),path.resolve(__dirname,'../src')];
 for(const dir of dirs)for(const f of fs.readdirSync(dir).filter(f=>/^[1-9]-.*\.js$/.test(f)&&f!=='6-app.js').sort())vm.runInContext(fs.readFileSync(path.join(dir,f),'utf8'),ctx,{filename:f});
 return {ctx,run:code=>vm.runInContext(code,ctx),json:code=>JSON.parse(vm.runInContext('JSON.stringify('+code+')',ctx)),state};
};
