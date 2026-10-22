const sharp=require('sharp'),fs=require('fs');
const svg=fs.readFileSync(__dirname+'/icon.svg');
(async()=>{
 const d=__dirname+'/../dist/icons/';
 await sharp(svg).resize(192,192).png().toFile(d+'icon-192.png');
 await sharp(svg).resize(512,512).png().toFile(d+'icon-512.png');
 await sharp(svg).resize(180,180).png().toFile(d+'apple-touch-icon.png');
 // maskable: contenido al 80% dentro del área segura
 const inner=await sharp(svg).resize(410,410).png().toBuffer();
 await sharp({create:{width:512,height:512,channels:4,background:'#0c111c'}}).composite([{input:inner,left:51,top:51}]).png().toFile(d+'icon-maskable-512.png');
})();
