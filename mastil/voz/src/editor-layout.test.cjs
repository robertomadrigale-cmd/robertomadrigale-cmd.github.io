const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),puppeteer=require('puppeteer');
(async()=>{
  const browser=await puppeteer.launch({headless:true,executablePath:process.env.CHROME,args:['--no-sandbox']}),page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
    await page.goto('http://localhost:8765/mastil/voz/');await page.evaluate(()=>{DB.onb=1;DB.songs=[{id:'mine-layout',created:1,src:'{id:mine-layout}{title:Mi canción de prueba}{bpm:90}\ncan~ta con~mi~go\n{mel:C4/1 D4/1 E4/1 F4/1 G4/1}',notes:[[60,62,64,65,67].map((m,i)=>({m,d:1,cont:false,t0:i*.7,t1:i*.7+.6}))],audioStored:true}];save();route()});
    for(const [width,scale] of [[320,1],[390,1.25],[400,1],[1280,1]]){
      await page.setViewport({width,height:850});
      for(const route of ['#/canciones/editar/mine-layout','#/canciones/mine-layout']){
        await page.evaluate(hash=>{location.hash=hash},route);await new Promise(r=>setTimeout(r,130));
        if(route.includes('/editar/'))await page.$eval('#mine-lines',el=>el.scrollIntoView());
        else{await page.$eval('.coach-settings',el=>el.open=true);await page.$eval('[data-setting="original:mine-layout"]',el=>{if(!el.checked)el.click()});await page.$eval('.coach-settings',el=>el.scrollIntoView())}
        const issues=await page.evaluate(scale=>{
          document.querySelectorAll('#page *').forEach(el=>{if(!el.closest('svg'))el.style.fontSize=(parseFloat(getComputedStyle(el).fontSize)*scale)+'px'});
          const issues=[];if(document.documentElement.scrollWidth>innerWidth+1)issues.push('scroll');
          for(const el of document.querySelectorAll('#page button,#page .btn,#page input,#page select')){const r=el.getBoundingClientRect();if(!r.width)continue;if(r.left<0||r.right>innerWidth+1)issues.push(el.textContent||el.id);if(el.matches('button,.btn')&&el.scrollWidth>el.clientWidth+2)issues.push('texto cortado '+el.textContent)}return issues;
        },scale);assert.deepEqual(issues,[],width+' '+route);
        if(width===400)await page.screenshot({path:path.join(__dirname,'test-evidence',route.includes('/editar/')?'400-notas-editor.png':'400-original-ajustes.png')});
      }
    }
    assert.deepEqual(errors,[]);console.log('PASS editor con tiempos y ajustes del original a 320, 390 × 1.25, 400 y 1280 px');
    fs.writeFileSync(path.join(__dirname,'test-evidence/editor-layout.txt'),'PASS editor con tiempos y ajustes del original: 320, 390 x 1.25, 400, 1280; sin desbordes ni excepciones.\n');
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
