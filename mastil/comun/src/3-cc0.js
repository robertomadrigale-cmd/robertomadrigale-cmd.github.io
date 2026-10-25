/* Metales y teclados CC0 (VSCO 2 Community Edition, Versilian Studios; piano y órgano de Simon Dalzell / Ivy Audio).
   Notas medidas con YIN (nota MIDI real y centésimos) en samples/cc0/manifest.json; aquí van copiadas para funcionar sin conexión. */
(()=>{
  const V='Versilian Studios — VSCO 2 Community Edition',U='https://github.com/sgossner/VSCO-2-CE',L='CC0 1.0 (dominio público)';
  const mk=(id,nombre,pref,list,extra)=>PACKS[id]=Object.assign({id,nombre,autor:V,licencia:L,url:U,tipo:'instrumento',base:'../samples/cc0/',
    credito:'Notas sueltas recortadas con desvanecido, normalizadas, mono, MP3 64 kbps.',notas:Object.fromEntries(list.map(([m,c])=>[m,{archivo:pref+'-'+m+'.mp3',cents:c}]))},extra||{});
  mk('trompeta','Trompeta','tp',[[53,-2],[57,-4],[60,-13],[63,2],[67,6],[70,-2],[74,0],[77,-9],[81,3],[84,2]]);
  mk('trombon','Trombón tenor','tbn',[[41,1],[46,-1],[50,-1],[53,-1],[60,0],[61,0],[63,1]]);
  mk('tuba','Tuba','tuba',[[34,1],[39,5],[41,-3],[46,5],[50,-10],[53,-2],[58,13]]);
  mk('piano','Piano vertical','piano',[[33,-2],[37,-10],[41,6],[45,-6],[49,-1],[53,0],[57,2],[61,2],[65,1],[69,2],[73,5],[77,5],[81,8]],{autor:'Simon Dalzell (Ivy Audio) · Versilian Studios'});
  mk('organo','Órgano de tubos','organ',[[30,4],[33,2],[36,3],[39,0],[42,1],[45,-1],[48,-3],[51,-2],[54,0],[57,0],[60,-1],[63,-2],[66,0]],{autor:'Simon Dalzell (Ivy Audio) · Versilian Studios'});
})();
