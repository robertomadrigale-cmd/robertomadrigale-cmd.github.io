/* Essential rudiments. Lower-case sticking in the description means a grace stroke. */
const RUDIMENTS=[
 ['simple','Redoble simple','DIDIDIDIDIDIDIDI','XxxxXxxxXxxxXxxx','Alterna derecha (D) e izquierda (I). Deja rebotar ambas baquetas.'],
 ['doble','Redoble doble','DDIIDDIIDDIIDDII','XxxxXxxxXxxxXxxx','Dos golpes con cada mano. El segundo rebote conserva volumen y espacio.'],
 ['paradiddle','Paradiddle','DIDDIDIIDIDDIDII','XxxxXxxxXxxxXxxx','D I D D, I D I I: alterna dos golpes y termina con un doble.'],
 ['doblepara','Doble paradiddle','DIDIDDIDIDII','XxxxxxXxxxxx','D I D I D D, I D I D I I. Cada grupo tiene seis golpes.',0,3],
 ['triplepara','Triple paradiddle','DIDIDIDDIDIDIDII','XxxxxxxxXxxxxxxx','D I D I D I D D; después invierte las manos.'],
 ['paradiddlediddle','Paradiddle-diddle','DIDDIIIDIIDD','XxxxxxXxxxxx','D I D D I I: un par alternado y dos pares dobles; invierte al repetir.',0,3],
 ['flam','Flam','D---I---D---I---','X---X---X---X---','Un golpe muy suave precede al fuerte de la otra mano: iD, dI. No caen exactamente juntos.',1],
 ['drag','Drag','D---I---D---I---','X---X---X---X---','Dos golpes de adorno suaves preceden al principal: iiD, ddI.',2],
 ['ruff','Ruff de cuatro','D---I---D---I---','X---X---X---X---','Tres golpes suaves alternados preparan el principal: idiD, didI.',3],
 ['roll5','Redoble de 5','DDIID---IIDDI---','xxxxX---xxxxX---','D D I I D: dos dobles y un cierre acentuado. Repite empezando con I.'],
 ['roll7','Redoble de 7','DDIIDDI-IIDDIID-','xxxxxxX-xxxxxxX-','D D I I D D I: tres dobles y un cierre. Invierte al repetir.'],
 ['roll9','Redoble de 9','DDIIDDIID-------','xxxxxxxxX-------','Cuatro dobles y un golpe de cierre. Cuenta también el silencio posterior.'],
 ['flamtap','Flam tap','DDIIDDIIDDIIDDII','XxXxXxXxXxXxXxXx','Flam derecho y toque derecho; flam izquierdo y toque izquierdo. Adorna solo los acentos.',1],
 ['flamaccent','Flam accent','DIDIDIDIDIDI','XxxXxxXxxXxx','Flam y dos golpes alternados por pulso. Cuenta 1 ta ti; cambia la mano principal.',1,3],
 ['flampara','Flam paradiddle','DIDDIDIIDIDDIDII','XxxxXxxxXxxxXxxx','Paradiddle con un flam en cada acento inicial.',1],
 ['dragpara','Drag paradiddle','DIDDIDIIDIDDIDII','XxxxXxxxXxxxXxxx','Paradiddle con dos adornos antes de cada acento.',2]
].map(([id,n,hands,line,tip,grace=0,sub=4])=>{
 const g={id:'rud-'+id,n,cat:'Rudimentos',meter:4,sub,rows:{sn:line},hands,bpm:60,grace};G[g.id]=g;TIPS[g.id]=tip;return{...g,tip};
});
function viewChordDictionary(id){
 const selected=RUDIMENTS.find(x=>x.id===id)||RUDIMENTS[0],x={id:selected.id,t:selected.n,fig:{type:'drum',groove:selected.id},bpm:selected.bpm};
 return{title:'Diccionario de rudimentos',back:'#/referencia',html:`<div class="lhead"><h1>Rudimentos</h1><p class="sub">Un rudimento es un patrón básico de manos. D = derecha, I = izquierda. Un adorno es un golpe suave justo antes del principal.</p></div><div class="chips">${RUDIMENTS.map(g=>`<a class="chip" href="#/acordes/${g.id}" aria-current="${g===selected?'page':'false'}">${g.n}</a>`).join('')}</div><section class="card"><h2>${selected.n}</h2><p>${selected.tip}</p><p class="cap">${selected.grace?'La guía toca los adornos; la calificación mide los golpes principales. Revisa por oído la suavidad de los adornos.':'La calificación mide el tiempo; revisa por tu cuenta la mano y el rebote.'}</p>${figHTML(x)}<a class="btn" href="#/practicar/ej/${selected.id}?k=rud">Practicar con coach</a></section>`,mount(r){paintFig(r);return drumFigStop}};
}
