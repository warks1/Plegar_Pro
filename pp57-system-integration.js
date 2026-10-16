/* Plegar Pro v58 — integración de ingeniería, gemelo digital y oficina técnica. */
(function(){
'use strict';
const $=id=>document.getElementById(id), KEY='plegarPro.v58';
let prefs={};try{prefs=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){}
let raf=0,start=0,paused=false,zoom=1,rotation=0,drag=null,twinInView=false,twinVisibilityReady=false,twinObserver=null,physRaf=0,physPlaying=false,physLast=0,physProgress=0,twinLastDraw=0,physLastDraw=0;
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const S=()=>{try{return typeof state!=='undefined'?state:null}catch(e){return null}};
const T=()=>Array.isArray(window.tools)?window.tools:[];
const sources=[
 ['MECOS · catálogo general','https://mecos.es/files/productos/utillaje-plegadora/MECOS-Catalogo-General-de-Utillaje-2022.pdf'],
 ['AMADA · catálogo AFH','https://cdn.amada.eu/fileadmin/Repository/Products/Brochures/Catalog_AFH_EN_2024.pdf'],
 ['TRUMPF · herramientas de plegado','https://www.trumpf.com/en_INT/products/services/services-machines-systems-and-lasers/tools/bending-tools/'],
 ['Eurostamp · catálogo','https://www.eurostamp-abkantwerkzeuge.de/online-shop/']
];
function msg(s){if(typeof window.toast==='function')window.toast(s);else console.info(s)}
function dl(name,data,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type:type||'application/json'}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function fitCanvas(canvas,baseWidth,baseHeight){
 if(!canvas)return;
 const box=canvas.getBoundingClientRect(),cssWidth=Math.round(box.width||canvas.parentElement?.clientWidth||baseWidth);
 if(cssWidth<2)return;
 const width=Math.max(280,Math.min(1000,cssWidth)),height=Math.max(160,Math.round(width/(baseWidth/baseHeight)));
 if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height}
 if(!canvas.dataset.pp58ResizeBound&&'ResizeObserver'in window){
  canvas.dataset.pp58ResizeBound='1';
  const parent=canvas.parentElement||canvas;let resizeRaf=0,lastObservedWidth=-1;
  const observer=new ResizeObserver(entries=>{
   const entry=entries[entries.length-1],observedWidth=Math.round(entry?.contentRect?.width||parent.clientWidth||0);
   if(Math.abs(observedWidth-lastObservedWidth)<2)return;
   lastObservedWidth=observedWidth;
   if(resizeRaf)cancelAnimationFrame(resizeRaf);
   resizeRaf=requestAnimationFrame(()=>{resizeRaf=0;fitCanvas(canvas,baseWidth,baseHeight)});
  });
  canvas.__pp58ResizeObserver=observer;observer.observe(parent);
 }
}
function fitKnownCanvases(){fitCanvas($('pp58Twin'),1440,760);fitCanvas($('pp58PhysicalCanvas'),1440,660);fitCanvas($('pp58PhysProfile'),900,170)}
function style(){if($('pp58style'))return;const s=document.createElement('style');s.id='pp58style';s.textContent='.pp58card{grid-column:1/-1;min-width:0;padding:clamp(14px,2vw,24px)!important;border:1px solid #a8cbdc!important;border-radius:17px!important;background:linear-gradient(145deg,#f9fcff,#e8f4fa)!important;color:#173246!important;box-shadow:0 12px 32px #0b2c4214!important}.pp58head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap}.pp58kicker{font-size:10px;font-weight:900;letter-spacing:.15em;color:#087fa5}.pp58controls{display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:10px;margin:12px 0}.pp58controls label{display:block;font-size:12px;font-weight:750;margin-bottom:5px}.pp58controls input,.pp58controls select{width:100%;min-width:0;min-height:39px;border:1px solid #b7d0df!important;border-radius:9px;padding:8px;background:#fff!important;color:#173246!important}.pp58canvas{width:100%;height:auto;display:block;border:1px solid #bfd7e4;border-radius:12px;background:#f9fcff;touch-action:none;user-select:none;-webkit-user-select:none}.pp58metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:9px;margin:12px 0}.pp58metric{border:1px solid #c5dce7;background:#fff;border-radius:11px;padding:12px;min-width:0}.pp58metric small{display:block;color:#5c7586;font-size:11px}.pp58metric b{display:block;font-size:clamp(14px,2vw,20px);margin-top:5px;overflow-wrap:anywhere}.pp58status{padding:12px;border-radius:11px;background:#e3f5fb;border:1px solid #b4dce9;color:#17465c;font-size:12px;line-height:1.5;margin:8px 0}.pp58toolgrid{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(220px,.8fr);gap:12px}.pp58source{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 0;border-bottom:1px solid #d4e4ec}.pp58source a{color:#087da3;font-weight:800}.pp58checks{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px}.pp58check{display:flex;gap:8px;align-items:center;padding:10px;background:#fff;border:1px solid #c8dce7;border-radius:9px}.pp58check input{width:auto}body:not(.light) .pp58card{background:linear-gradient(145deg,#122a3b,#0b1c29)!important;color:#e5f4fb!important;border-color:#2c5369!important}body:not(.light) .pp58metric,body:not(.light) .pp58check{background:#0c202e;border-color:#294b5d}body:not(.light) .pp58metric b{color:#e5f4fb}body:not(.light) .pp58controls input,body:not(.light) .pp58controls select{background:#081923!important;color:#e5f4fb!important}@media(max-width:740px){.pp58toolgrid{grid-template-columns:1fr}.pp58controls{grid-template-columns:repeat(2,minmax(0,1fr))}}';document.head.appendChild(s)}
function addMachine(){
 const old=$('pp55MachineCanvas')?.closest('.pp55-card');if(!old)return;const existing=$('pp58TwinCard');if(existing){existing.style.display='';existing.hidden=false;existing.removeAttribute('aria-hidden');existing.setAttribute('aria-label','LIVE MACHINE PREVIEW · Gemelo digital de prensa plegadora');const stage=$('pp55MachineCanvas')?.closest('.pp55-stage');if(stage)stage.style.display='none';if(!paused&&!raf)runTwin();return;}
 const c=document.createElement('section');c.id='pp58TwinCard';c.className='card pp58card';
 c.innerHTML='<div class="pp58head"><div><span class="pp58kicker">LIVE MACHINE PREVIEW · 3D</span><h2>Gemelo digital · prensa plegadora animada</h2><p>Bastidor industrial, montantes, travesaño, trancha móvil, portapunzón, punzón, chapa, matriz, mesa y mando.</p></div><b>ANIMACIÓN CAD/CAM</b></div><div class="pp58controls"><div><label>Modelo visual</label><select id="pp58Model"><option value="generic">Plegadora industrial genérica</option><option value="trumpf">Estilo Trumpf TruBend V85</option><option value="bystronic">Estilo Bystronic 100 t</option></select></div><div><label>Cámara</label><select id="pp58Camera"><option value="iso">Isométrica</option><option value="front">Frontal</option><option value="side">Lateral</option><option value="top">Superior</option></select></div><div><label>Velocidad</label><input id="pp58Speed" type="range" min=".35" max="2" step=".05" value="1"></div><div><label>Zoom</label><input id="pp58Zoom" type="range" min=".65" max="1.45" step=".05" value="0.85"></div></div><canvas id="pp58Twin" class="pp58canvas" width="1440" height="760" aria-label="Gemelo digital animado de una prensa plegadora"></canvas><div class="pp58metrics"><div class="pp58metric"><small>FASE DE CICLO</small><b id="pp58Phase">Preparado</b></div><div class="pp58metric"><small>TRANCHA · EJE Y</small><b id="pp58Ram">Posición superior</b></div><div class="pp58metric"><small>PIEZA ACTIVA</small><b id="pp58Piece">—</b></div><div class="pp58metric"><small>MODELO</small><b id="pp58ModelLabel">Genérico</b></div></div><div class="actions"><button class="btn" id="pp58Pause">Ⅱ Pausar animación</button><button class="btn secondary" id="pp58Home">Restablecer cámara</button><button class="btn secondary" id="pp58Cycle">Reiniciar ciclo</button></div><div class="pp58status" id="pp58TwinStatus">Gemelo visual, no réplica CAD oficial. Para fidelidad dimensional de una máquina concreta se necesitan planos del fabricante y modelo exacto.</div>';
 old.insertAdjacentElement('afterend',c);$('pp55MachineCanvas').closest('.pp55-stage').style.display='none';c.style.display='';paused=false;
 ['pp58Model','pp58Camera','pp58Speed','pp58Zoom'].forEach(id=>$(id).addEventListener('input',()=>drawTwin(performance.now())));
 $('pp58Pause').onclick=()=>{paused=!paused;$('pp58Pause').textContent=paused?'▶ Reanudar animación':'Ⅱ Pausar animación';if(!paused){start=performance.now();runTwin()}};
 $('pp58Home').onclick=()=>{$('pp58Camera').value='iso';$('pp58Zoom').value='1';rotation=0;drawTwin(performance.now())};
 $('pp58Cycle').onclick=()=>{start=performance.now();paused=false;$('pp58Pause').textContent='Ⅱ Pausar animación';runTwin()};
 const cv=$('pp58Twin');cv.addEventListener('pointerdown',e=>{if(e.isPrimary===false)return;drag={x:e.clientX,y:e.clientY,r:rotation,pointerId:e.pointerId};try{cv.setPointerCapture(e.pointerId)}catch(_){}});cv.addEventListener('pointermove',e=>{if(drag&&drag.pointerId===e.pointerId){rotation=drag.r+(e.clientX-drag.x)*.008;drawTwin(performance.now())}});const endDrag=e=>{if(!drag||!e||drag.pointerId===e.pointerId)drag=null};cv.addEventListener('pointerup',endDrag);cv.addEventListener('pointercancel',endDrag);cv.addEventListener('lostpointercapture',endDrag);
 fitCanvas($('pp58Twin'),1440,760);setupTwinVisibility();runTwin();
}
function setupTwinVisibility(){
 const canvas=$('pp58Twin');if(!canvas)return;
 if(!twinVisibilityReady){
  twinVisibilityReady=true;
  document.addEventListener('visibilitychange',()=>{
   if(document.hidden){if(raf)cancelAnimationFrame(raf);raf=0;}
   else runTwin();
  });
 }
 if('IntersectionObserver'in window){
  if(twinObserver)twinObserver.disconnect();
  twinObserver=new IntersectionObserver(entries=>{
   const entry=entries[entries.length-1];twinInView=!!entry?.isIntersecting&&entry.intersectionRatio>0;
   if(twinInView)runTwin();else{if(raf)cancelAnimationFrame(raf);raf=0;}
  },{threshold:0.01});
  twinObserver.observe(canvas);
 }else twinInView=true;
}
function drawTwin(now){
 const c=$('pp58Twin');if(!c)return;fitCanvas(c,1440,760);const x=c.getContext('2d'),w=c.width,h=c.height;if(!start)start=now;
 const phase=((now-start)/5200*(Number($('pp58Speed')?.value||1))%1),down=phase<.2?0:phase<.47?Math.sin((phase-.2)/.27*Math.PI):phase<.68?0:Math.sin((phase-.68)/.32*Math.PI);
 x.clearRect(0,0,w,h);const bg=x.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#fcfeff');bg.addColorStop(1,'#dcebf3');x.fillStyle=bg;x.fillRect(0,0,w,h);x.strokeStyle='#d1e1ea';for(let i=0;i<w;i+=40){x.beginPath();x.moveTo(i,0);x.lineTo(i,h);x.stroke()}for(let i=0;i<h;i+=40){x.beginPath();x.moveTo(0,i);x.lineTo(w,i);x.stroke()}
 const cam=$('pp58Camera').value,model=$('pp58Model').value,sc=(cam==='top'?.62:.68)*(Number($('pp58Zoom').value)||.85),rot=cam==='front'?0:cam==='side'?Math.PI/2:cam==='top'?0:rotation-.42,ox=w*.5,oy=h*.65;
 function P(p){let a=rot,xx=p.x*Math.cos(a)-p.z*Math.sin(a),zz=p.x*Math.sin(a)+p.z*Math.cos(a);return{x:ox+xx*sc,y:oy-(p.y-zz*.34)*sc}}
 function poly(ps,fill,edge){
  const q=ps.map(P);if(q.length<3)return;
  const minX=Math.min(...q.map(p=>p.x)),maxX=Math.max(...q.map(p=>p.x)),minY=Math.min(...q.map(p=>p.y)),maxY=Math.max(...q.map(p=>p.y));
  x.save();x.beginPath();q.forEach((p,i)=>i?x.lineTo(p.x,p.y):x.moveTo(p.x,p.y));x.closePath();
  x.shadowColor='rgba(9,30,43,.22)';x.shadowBlur=7;x.shadowOffsetX=2;x.shadowOffsetY=4;
  const grad=x.createLinearGradient(minX,minY,maxX,Math.max(minY+1,maxY));
  grad.addColorStop(0,'#f1f6f8');grad.addColorStop(.16,fill);grad.addColorStop(.58,fill);grad.addColorStop(1,'#243b49');
  x.fillStyle=grad;x.fill();x.shadowColor='transparent';x.shadowBlur=0;x.shadowOffsetX=0;x.shadowOffsetY=0;
  x.strokeStyle=edge||'#4b687a';x.lineWidth=1.6;x.stroke();
  x.globalAlpha=.32;x.strokeStyle='#ffffff';x.lineWidth=1;x.stroke();x.restore();
 }
 function box(a,b,z,dx,dy,dz,col){poly([{x:a,y:b,z},{x:a+dx,y:b,z},{x:a+dx,y:b+dy,z},{x:a,y:b+dy,z}],col);poly([{x:a,y:b,z:z+dz},{x:a+dx,y:b,z:z+dz},{x:a+dx,y:b+dy,z:z+dz},{x:a,y:b+dy,z:z+dz}],col);poly([{x:a,y:b,z},{x:a,y:b,z:z+dz},{x:a,y:b+dy,z:z+dz},{x:a,y:b+dy,z}],col)}
 function beam(y,th,col){box(-450,y,-75,900,th,150,col)}
 box(-540,-205,-180,1080,45,360,'#788f9c','#3e5c6c');box(-500,-160,-165,105,390,330,'#9fb4bf','#486777');box(395,-160,-165,105,390,330,'#9fb4bf','#486777');
 box(-395,-115,-130,790,65,260,'#637e8d','#405e6e');box(-455,-120,-170,26,305,24,'#d6e1e7','#718d9b');box(429,-120,146,26,305,24,'#d6e1e7','#718d9b');
 beam(175,70,model==='trumpf'?'#e1c84e':model==='bystronic'?'#d9e3e8':'#a9bbc5');beam(105-down*112,64,model==='trumpf'?'#dfc33e':model==='bystronic'?'#6c8797':'#527f95');box(-430,105-down*112,-100,860,64,200,'#5d8295','#36596d');
 function cyl(px,pz,y0,y1,r){let a=P({x:px,y:y0,z:pz}),b=P({x:px,y:y1,z:pz});x.lineCap='round';x.strokeStyle='#4e6877';x.lineWidth=r*2*sc;x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke();x.strokeStyle='#c7d6df';x.lineWidth=r*sc;x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke()}
 cyl(-360,-90,180,240,32);cyl(360,-90,180,240,32);
 box(-395,34-down*74,-82,790,24,164,'#344f61','#233c4b');poly([{x:-390,y:34-down*74,z:-65},{x:390,y:34-down*74,z:-65},{x:320,y:-8-down*74,z:-42},{x:-320,y:-8-down*74,z:-42}],'#b9c8d2');poly([{x:-390,y:-8-down*74,z:-55},{x:390,y:-8-down*74,z:-55},{x:65,y:-17-down*74,z:-30},{x:-65,y:-17-down*74,z:-30}],'#8c9eaa');poly([{x:-65,y:-17-down*74,z:-30},{x:65,y:-17-down*74,z:-30},{x:0,y:-25-down*74,z:-20}],'#d9e2e8');
 // La V de la matriz es un canal cóncavo abierto hacia arriba, con caras a 90° aproximados; no una cresta invertida.
 box(-405,-172,-100,810,32,200,'#475e6e','#293f4d');poly([{x:-390,y:-30,z:-82},{x:-80,y:-30,z:-82},{x:0,y:-110,z:-82},{x:80,y:-30,z:-82},{x:390,y:-30,z:-82},{x:390,y:-140,z:-82},{x:-390,y:-140,z:-82}],'#8d9fa9');
 const bend=down>.05?Math.PI/2*down:.035,sheetDrop=down*74,p1=P({x:-345,y:-30,z:0}),p2=P({x:-100,y:-30-sheetDrop*.12,z:0}),p3=P({x:0,y:-30-sheetDrop,z:0}),p4=P({x:100,y:-30-sheetDrop*.12,z:0}),p5=P({x:345,y:-30,z:0});
 x.beginPath();x.moveTo(p1.x,p1.y);x.lineTo(p2.x,p2.y);x.quadraticCurveTo((p2.x+p3.x)/2,p3.y-6,p3.x,p3.y);x.quadraticCurveTo((p3.x+p4.x)/2,p3.y-6,p4.x,p4.y);x.lineTo(p5.x,p5.y);x.strokeStyle='#1686c2';x.lineWidth=10;x.lineJoin='round';x.stroke();x.strokeStyle='#d8f2ff';x.lineWidth=3;x.stroke();
 box(-420,-235,-200,840,24,400,'#465d6a','#2e4653');
 // Carenados y detalles de fabricación: paneles de fundición, nervios, tornillería y resguardos.
 const accent=model==='trumpf'?'#e4c52d':model==='bystronic'?'#11a8a2':'#1596c0';
 const shell=model==='trumpf'?'#d5dce0':model==='bystronic'?'#e8eef1':'#c7d4dc';
 poly([{x:-510,y:185,z:-174},{x:-445,y:185,z:-174},{x:-430,y:120,z:-174},{x:-430,y:-95,z:-174},{x:-485,y:-135,z:-174},{x:-510,y:-105,z:-174}],shell,'#657d8a');
 poly([{x:445,y:185,z:-174},{x:510,y:185,z:-174},{x:510,y:-105,z:-174},{x:485,y:-135,z:-174},{x:430,y:-95,z:-174},{x:430,y:120,z:-174}],shell,'#657d8a');
 poly([{x:-498,y:142,z:-176},{x:-462,y:142,z:-176},{x:-462,y:-85,z:-176},{x:-498,y:-105,z:-176}],accent,'#526b79');
 poly([{x:462,y:142,z:-176},{x:498,y:142,z:-176},{x:498,y:-105,z:-176},{x:462,y:-85,z:-176}],accent,'#526b79');
 // Siluetas de carenado diferenciadas por familia visual; no se presentan como planos OEM.
 if(model==='trumpf'){
  poly([{x:-505,y:108,z:-178},{x:-465,y:130,z:-178},{x:-448,y:72,z:-178},{x:-448,y:-78,z:-178},{x:-485,y:-105,z:-178},{x:-505,y:-76,z:-178}], '#e5c92f','#8d7b28');
  poly([{x:465,y:130,z:-178},{x:505,y:108,z:-178},{x:505,y:-76,z:-178},{x:485,y:-105,z:-178},{x:448,y:-78,z:-178},{x:448,y:72,z:-178}], '#e5c92f','#8d7b28');
  for(let i=0;i<4;i++){const yy=82-i*31;poly([{x:-496,y:yy,z:-180},{x:-470,y:yy-12,z:-180},{x:-470,y:yy-17,z:-180},{x:-496,y:yy-5,z:-180}],'#7a8790','#f4df66');poly([{x:470,y:yy-12,z:-180},{x:496,y:yy,z:-180},{x:496,y:yy-5,z:-180},{x:470,y:yy-17,z:-180}],'#7a8790','#f4df66');}
 }else if(model==='bystronic'){
  poly([{x:-492,y:105,z:-180},{x:-465,y:118,z:-180},{x:-455,y:55,z:-180},{x:-455,y:-78,z:-180},{x:-485,y:-99,z:-180},{x:-492,y:-70,z:-180}],'#10aaa4','#4c7f83');
  poly([{x:465,y:118,z:-180},{x:492,y:105,z:-180},{x:492,y:-70,z:-180},{x:485,y:-99,z:-180},{x:455,y:-78,z:-180},{x:455,y:55,z:-180}],'#10aaa4','#4c7f83');
  box(-300,158,-181,600,13,5,'#10aaa4','#477c80');
  box(-300,146,-181,600,4,5,'#eff7f8','#819ca4');
 }else{
  for(let i=0;i<5;i++){const yy=95-i*34;box(-493,yy,-180,25,3,3,'#8fa5b1','#526d7b');box(468,yy,-180,25,3,3,'#8fa5b1','#526d7b');}
 }
 // Panelería frontal: juntas de puertas, rejillas de ventilación, pilotos y fijaciones.
 for(const side of [-1,1]){
  const seam=side<0?-446:446;
  const seamPts=side<0? [{x:-446,y:78,z:-181},{x:-446,y:-86,z:-181}]:[{x:446,y:78,z:-181},{x:446,y:-86,z:-181}];
  const sp=seamPts.map(P);x.beginPath();x.moveTo(sp[0].x,sp[0].y);x.lineTo(sp[1].x,sp[1].y);x.strokeStyle='#647c89';x.lineWidth=2;x.stroke();
  for(let k=0;k<5;k++){
   const yy=52-k*18,slat=[{x:side<0?-493:467,y:yy,z:-182},{x:side<0?-468:492,y:yy-5,z:-182},{x:side<0?-468:492,y:yy-9,z:-182},{x:side<0?-493:467,y:yy-4,z:-182}];
   poly(slat,'#536a77','#d5e0e6');
  }
  const lamp=P({x:side<0?-482:482,y:118,z:-183});x.beginPath();x.arc(lamp.x,lamp.y,5,0,Math.PI*2);x.fillStyle=accent;x.fill();x.strokeStyle='#f7fcff';x.lineWidth=1.5;x.stroke();
  for(const yy of [165,-118]){const bolt=P({x:side<0?-480:480,y:yy,z:-183});x.beginPath();x.arc(bolt.x,bolt.y,3.5,0,Math.PI*2);x.fillStyle='#304653';x.fill();x.strokeStyle='#e5eef2';x.lineWidth=1;x.stroke();}
 }
 // Nervios frontales de la viga y estaciones de amarre del portautillaje.
 for(let i=0;i<13;i++){
  const bx=-360+i*60,topY=166;
  const q1=P({x:bx,y:topY,z:-178}),q2=P({x:bx+3,y:topY-23,z:-178});
  x.beginPath();x.moveTo(q1.x,q1.y);x.lineTo(q2.x,q2.y);x.strokeStyle='#536d7c';x.lineWidth=2;x.stroke();
 }
 // Tapa superior mecanizada y guías lineales del eje Y.
 box(-410,242,-125,820,18,250,model==='trumpf'?'#d7dfe3':'#eef3f5','#6c8290');
 box(-390,222,-145,780,14,18,'#526d7d','#314d5e');
 box(-390,222,127,780,14,18,'#526d7d','#314d5e');
 // Cilindros hidráulicos, vástagos cromados y soportes superiores.
 cyl(-330,0,190,266,24);cyl(330,0,190,266,24);
 cyl(-330,0,218,272,9);cyl(330,0,218,272,9);
 box(-365,205,-35,70,18,70,'#879ba6','#435d6b');box(295,205,-35,70,18,70,'#879ba6','#435d6b');
 // Frente de la trancha: banda de acabado, juntas y segmentos de fijación del portautillaje.
 box(-420,105-down*112,-104,840,10,12,accent,'#526d7b');
 for(let i=0;i<11;i++){const bx=-380+i*76;box(bx,72-down*112,-108,44,8,10,'#d5e0e6','#536c7a');}
 // Mesa de trabajo segmentada y línea de referencia longitudinal.
 box(-430,-83,-112,860,12,224,'#8499a5','#405b6a');
 box(-410,-69,-116,820,4,8,'#d7e1e6','#718793');
 for(let i=0;i<17;i++){const bx=-400+i*50;box(bx,-65,-118,2,5,12,'#425d6c','#334b59');}
 // Resguardos laterales y escala de alineación; no sustituyen protecciones reales de seguridad.
 box(-445,-15,150,18,230,18,'#d4e0e6','#637d8b');box(427,-15,150,18,230,18,'#d4e0e6','#637d8b');
 for(let i=0;i<9;i++){const bx=-385+i*96;box(bx,-59,-125,2,7,3,'#eef5f8','#738b98');}
 // Consola CNC articulada en el lateral derecho, con pantalla y teclas dibujadas en su cara.
 box(470,55,175,46,112,38,'#536e7e','#2d4655');
 poly([{x:478,y:145,z:215},{x:510,y:145,z:215},{x:510,y:88,z:215},{x:478,y:88,z:215}], '#152c39','#8299a6');
 poly([{x:482,y:139,z:218},{x:506,y:139,z:218},{x:506,y:96,z:218},{x:482,y:96,z:218}], '#8ed7e9','#d6f7ff');
 poly([{x:485,y:134,z:220},{x:503,y:134,z:220},{x:503,y:121,z:220},{x:485,y:121,z:220}], '#174d66','#c5f4ff');
 for(let i=0;i<3;i++)for(let j=0;j<2;j++){const q=P({x:486+j*10,y:112-i*7,z:221});x.beginPath();x.arc(q.x,q.y,2.3,0,Math.PI*2);x.fillStyle='#e8f7fc';x.fill();}
 // Pies, anclajes y panel inferior de servicio.
 box(-490,-250,-150,125,18,285,'#314a58','#203845');box(365,-250,-150,125,18,285,'#314a58','#203845');
 box(-470,-225,-152,85,7,290,'#8fa3ae','#425b69');box(385,-225,-152,85,7,290,'#8fa3ae','#425b69');
 poly([{x:-395,y:-155,z:-180},{x:-275,y:-155,z:-180},{x:-275,y:-205,z:-180},{x:-395,y:-205,z:-180}], '#dce5e9','#6c8491');
 poly([{x:275,y:-155,z:-180},{x:395,y:-155,z:-180},{x:395,y:-205,z:-180},{x:275,y:-205,z:-180}], '#dce5e9','#6c8491');
 // Tornillos de fijación proyectados sobre las placas frontales.
 for(const side of [-1,1])for(const yy of [155,90,20,-60,-105]){const q=P({x:side*477,y:yy,z:-179});x.beginPath();x.arc(q.x,q.y,4.2,0,Math.PI*2);x.fillStyle='#314b5a';x.fill();x.strokeStyle='#d8e3e8';x.lineWidth=1;x.stroke();x.beginPath();x.moveTo(q.x-2,q.y);x.lineTo(q.x+2,q.y);x.stroke();}
 // Iluminación de zona de trabajo y guía de profundidad, mantenidas fuera del área de contacto.
 const ledA=P({x:-350,y:-48,z:-128}),ledB=P({x:350,y:-48,z:-128});
 x.beginPath();x.moveTo(ledA.x,ledA.y);x.lineTo(ledB.x,ledB.y);x.strokeStyle='#8ee6f4';x.lineWidth=3;x.globalAlpha=.85;x.stroke();x.globalAlpha=1;
 const label=(txt,px,py)=>{x.fillStyle='#17445a';x.font='bold 18px system-ui';x.fillText(txt,px,py)};label('BASTIDOR',w*.08,h*.22);label('TRANCHA MÓVIL',w*.36,h*.22);label('PORTAPUNZÓN / PUNZÓN',w*.57,h*.4);label('CHAPA EN PROCESO',w*.37,h*.73);label('MATRIZ V',w*.59,h*.78);
 x.fillStyle='#eaf6fb';x.fillRect(24,22,280,42);x.fillStyle='#16445b';x.font='bold 15px system-ui';x.fillText(model==='trumpf'?'ESTILO TRUBEND V85':model==='bystronic'?'ESTILO BYSTRONIC 100 T':'PLEGADORA INDUSTRIAL',36,49);
 $('pp58Phase').textContent=phase<.2?'Aproximación':phase<.47?'Plegado en carrera':phase<.68?'Retención':'Retorno de trancha';$('pp58Ram').textContent=down>.12?'Eje Y · carrera descendente':'Eje Y · posición superior';$('pp58Piece').textContent=S()?.project?.ref||'Sin referencia';$('pp58ModelLabel').textContent=model==='trumpf'?'Estilo TruBend V85':model==='bystronic'?'Estilo Bystronic 100 t':'Bastidor industrial';
}
function runTwin(){
 const canvas=$('pp58Twin');
 if(raf||paused||!canvas||document.hidden||(!twinInView&&'IntersectionObserver'in window))return;
 if(!canvas.getClientRects().length)return;
 if(!start)start=performance.now();
 const loop=t=>{
  raf=0;
  if(paused||!$('pp58Twin')||document.hidden||(!twinInView&&'IntersectionObserver'in window)||!$('pp58Twin').getClientRects().length){raf=0;return;}
  try{
   if(t-twinLastDraw<33){raf=requestAnimationFrame(loop);return;}twinLastDraw=t;
   drawTwin(t);
   const status=$('pp58TwinStatus');
   if(status&&status.dataset.renderError==='1'){
    status.textContent='Gemelo visual, no réplica CAD oficial. Para fidelidad dimensional de una máquina concreta se necesitan planos del fabricante y modelo exacto.';
    delete status.dataset.renderError;
   }
  }catch(error){
   console.error('[Plegar Pro] Error al dibujar la vista de máquina:',error);
   const status=$('pp58TwinStatus');
   if(status){status.dataset.renderError='1';status.textContent='Error de renderizado: '+String(error?.message||error).slice(0,180)+'. Revisa controles y vuelve a iniciar la reproducción.';}
   raf=0;
   return;
  }
  if(!paused)raf=requestAnimationFrame(loop);
 };
 raf=requestAnimationFrame(loop);
}

function addPhysicalBendSimulation(){
 const host=$('sim3d');if(!host||$('pp58PhysicalBend'))return;
 const card=document.createElement('section');card.id='pp58PhysicalBend';card.className='card pp58card';
 card.innerHTML='<div class="pp58head"><div><span class="pp58kicker">BEND FOLLOW · 3D</span><h2>Seguimiento físico del plegado</h2><p>Vista ampliada de punzón, matriz, tope trasero y chapa durante el contacto. La secuencia utiliza el orden de plegado del programa activo.</p></div><b id="pp58PhysStepLabel">LISTO</b></div><div class="pp58controls"><div><label>Seguimiento del ciclo</label><input id="pp58PhysProgress" type="range" min="0" max="100" step="1" value="0"></div><div><label>Punzón instalado</label><select id="pp58PhysPunch"></select></div><div><label>Matriz instalada</label><select id="pp58PhysDie"></select></div><div><label>Velocidad de reproducción</label><select id="pp58PhysSpeed"><option value="0.5">Lenta · 0,5×</option><option value="1" selected>Normal · 1×</option><option value="1.5">Rápida · 1,5×</option></select></div><div><label>Vista del conjunto</label><select id="pp58PhysView"><option value="profile" selected>Perfil lateral · plegado</option><option value="iso">Isométrica</option><option value="section">Sección de contacto</option><option value="front">Frontal de herramientas</option></select></div></div><canvas id="pp58PhysicalCanvas" class="pp58canvas" width="1440" height="660" aria-label="Vista de perfil lateral del punzón, matriz, tope trasero y chapa durante el plegado"></canvas><h3>Perfil acumulado de la pieza · pliegue activo resaltado</h3><canvas id="pp58PhysProfile" class="pp58canvas" width="900" height="170" aria-label="Perfil esquemático acumulado de la pieza y paso de plegado activo"></canvas><div class="pp58metrics"><div class="pp58metric"><small>ELEMENTO ACTIVO</small><b id="pp58PhysActive">Punzón + chapa</b></div><div class="pp58metric"><small>ORDEN DE PLEGADO</small><b id="pp58PhysOrder">Sin secuencia</b></div><div class="pp58metric"><small>ÁNGULO OBJETIVO</small><b id="pp58PhysAngle">90°</b></div><div class="pp58metric"><small>ESPESOR DE CHAPA</small><b id="pp58PhysThickness">— mm</b></div></div><div class="actions"><button class="btn" id="pp58PhysPlay">▶ Reproducir ciclo</button><button class="btn secondary" id="pp58PhysPrev">◀ Paso anterior</button><button class="btn secondary" id="pp58PhysNext">Paso siguiente ▶</button><button class="btn secondary" id="pp58PhysReset">Restablecer</button></div><div class="pp58status" id="pp58PhysStatus">Modelo visual esquemático sincronizado con la secuencia activa. Verifica perfiles, medidas y topes reales con los datos del utillaje antes de usarlo para validar una operación.</div>';
 host.appendChild(card);
 const punchSel=$('pp58PhysPunch'),dieSel=$('pp58PhysDie'),tools=T();
 const punches=tools.map((t,i)=>({t,i})).filter(a=>/punz|punch|gooseneck|recto/i.test(String(a.t.type||a.t.name||'')));
 const dies=tools.map((t,i)=>({t,i})).filter(a=>/matriz|die|matrix/i.test(String(a.t.type||a.t.name||'')));
 punchSel.innerHTML='<option value="-1">Punzón genérico · estimado</option>'+punches.map(a=>'<option value="'+a.i+'">'+esc((a.t.maker||'')+' · '+(a.t.name||a.t.id||a.t.type||'Punzón'))+'</option>').join('');
 dieSel.innerHTML='<option value="-1">Matriz en V · estimada</option>'+dies.map(a=>'<option value="'+a.i+'">'+esc((a.t.maker||'')+' · '+(a.t.name||a.t.id||a.t.type||'Matriz'))+'</option>').join('');
 ['pp58PhysPunch','pp58PhysDie'].forEach(id=>$(id).addEventListener('change',drawPhysicalBend));
 $('pp58PhysProgress').addEventListener('input',()=>{physPlaying=false;if(physRaf)cancelAnimationFrame(physRaf);physRaf=0;$('pp58PhysPlay').textContent='▶ Reproducir ciclo';physProgress=Number($('pp58PhysProgress').value)/100;drawPhysicalBend()});
 $('pp58PhysView').addEventListener('change',drawPhysicalBend);
 $('pp58PhysPlay').onclick=()=>{physPlaying=!physPlaying;$('pp58PhysPlay').textContent=physPlaying?'Ⅱ Pausar ciclo':'▶ Reproducir ciclo';physLast=0;if(physPlaying)runPhysicalBend();else if(physRaf){cancelAnimationFrame(physRaf);physRaf=0}};
 $('pp58PhysPrev').onclick=()=>{const q=physicalSequence(),count=Math.max(1,q.order.length),step=Math.max(0,q.stepNumber-1);physProgress=step/count;$('pp58PhysProgress').value=String(Math.round(physProgress*100));drawPhysicalBend()};
 $('pp58PhysNext').onclick=()=>{const q=physicalSequence(),count=Math.max(1,q.order.length),step=Math.min(count-1,q.stepNumber+1);physProgress=step/count;$('pp58PhysProgress').value=String(Math.round(physProgress*100));drawPhysicalBend()};
 $('pp58PhysReset').onclick=()=>{physPlaying=false;physProgress=0;physLast=0;if(physRaf)cancelAnimationFrame(physRaf);physRaf=0;$('pp58PhysProgress').value='0';$('pp58PhysPlay').textContent='▶ Reproducir ciclo';drawPhysicalBend()};
 const canvas=$('pp58PhysicalCanvas');fitCanvas(canvas,1440,660);fitCanvas($('pp58PhysProfile'),900,170);canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,r:rotation,pointerId:e.pointerId,physical:true};try{canvas.setPointerCapture(e.pointerId)}catch(_){}});
 canvas.addEventListener('pointermove',e=>{if(drag?.physical&&drag.pointerId===e.pointerId){rotation=drag.r+(e.clientX-drag.x)*.008;drawPhysicalBend()}});
 const end=e=>{if(drag?.physical&&(!e||drag.pointerId===e.pointerId))drag=null};canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
 drawPhysicalBend();
 window.addEventListener('plegarpro:playback-step',e=>{
  const d=e.detail||{},q=physicalSequence(),count=Math.max(1,q.order.length);
  if(d.source==='physical')return;
  const pos=d.complete?1:Math.max(0,Math.min(count-1,Number(d.step)||0));
  physPlaying=false;if(physRaf)cancelAnimationFrame(physRaf);physRaf=0;
  physProgress=d.complete?1:(pos+.5)/count;
  if($('pp58PhysProgress'))$('pp58PhysProgress').value=String(Math.round(physProgress*100));
  if($('pp58PhysPlay'))$('pp58PhysPlay').textContent='▶ Reproducir ciclo';
  drawPhysicalBend();
 });
 window.addEventListener('plegarpro:machine-travel',e=>{
  const d=e.detail||{},q=physicalSequence(),count=Math.max(1,q.order.length);
  if(d.source!=='collisions'||!q.order.length)return;
  const pos=q.order.indexOf(Number(d.foldIndex));if(pos<0)return;
  physPlaying=false;if(physRaf)cancelAnimationFrame(physRaf);physRaf=0;
  physProgress=(pos+Math.max(0,Math.min(100,Number(d.travel)||0))/100)/count;
  if($('pp58PhysProgress'))$('pp58PhysProgress').value=String(Math.round(physProgress*100));
  if($('pp58PhysPlay'))$('pp58PhysPlay').textContent='▶ Reproducir ciclo';
  drawPhysicalBend();
 });
 window.addEventListener('resize',()=>{fitKnownCanvases();drawTwin(performance.now());drawPhysicalBend()},{passive:true});
}
function physicalSequence(){
 const s=S()||{},b=Array.isArray(s.bends)?s.bends:[],n=Math.max(0,b.length-1);
 // Follow the exact execution ranking used by the existing 2D and 3D
 // simulators. Collision review may keep a separate playback cursor; it must
 // never redefine the programmed Omega geometry or its bend order.
 const stored=Array.isArray(s.bendOrder)?s.bendOrder:null;
 const rankOf=i=>{
  const explicit=stored?stored.indexOf(i):-1;if(explicit>=0)return explicit;
  try{const r=window.PLEGAR_PRO_V54?.orderIndex?.(i);if(Number.isFinite(r))return r}catch(_){}
  return i;
 };
 const raw=Array.from({length:n},(_,i)=>i).sort((a,b)=>rankOf(a)-rankOf(b));
 let order=raw.filter((v,i)=>Number.isInteger(v)&&v>=0&&v<n&&raw.indexOf(v)===i);
 for(let i=0;i<n;i++)if(!order.includes(i))order.push(i);
 const stepCount=Math.max(1,order.length),stepPos=physProgress>=1?stepCount:physProgress*stepCount,stepNumber=Math.min(stepCount-1,Math.floor(stepPos)),localPhase=physProgress>=1?1:stepPos-stepNumber;
 const idx=order[stepNumber]??0,tools=T(),punch=tools[Number($('pp58PhysPunch')?.value)]||null,die=tools[Number($('pp58PhysDie')?.value)]||null;
 return {s,b,order,idx,bend:b[idx]||{},n,localPhase,stepNumber,punch,die};
}
function drawProgramProfile(b,activeIdx,order,stepNumber,activeAngle,phase=0){
 const cv=$('pp58PhysProfile');if(!cv)return;fitCanvas(cv,900,170);
 const c=cv.getContext('2d'),w=cv.width,h=cv.height;c.clearRect(0,0,w,h);
 c.fillStyle='#f7fbfd';c.fillRect(0,0,w,h);c.strokeStyle='#d8e7ee';c.lineWidth=1;
 for(let x=20;x<w;x+=40){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke()}
 const segments=(b||[]).slice(0,Math.max(1,b.length)),pts=[{x:0,y:0}];let heading=0;
 segments.forEach((seg,i)=>{
  const len=Math.max(1,Number(seg.leg)||0),prev=pts[pts.length-1];
  pts.push({x:prev.x+Math.cos(heading)*len,y:prev.y+Math.sin(heading)*len});
  if(i<segments.length-1){
   const seqPosition=order.indexOf(i),done=seqPosition>=0&&seqPosition<stepNumber,active=i===activeIdx;
   const progress=done?1:active?(phase<.12?0:phase<.67?Math.max(0,Math.min(1,(phase-.12)/.55)):1):0;
   const direction=Number(seg.direction)||1;
   heading+=direction*(180-(Number(seg.angle)||90))*Math.PI/180*progress;
  }
 });
 const minX=Math.min(...pts.map(p=>p.x)),maxX=Math.max(...pts.map(p=>p.x)),minY=Math.min(...pts.map(p=>p.y)),maxY=Math.max(...pts.map(p=>p.y)),scale=Math.min((w-90)/Math.max(1,maxX-minX),(h-55)/Math.max(1,maxY-minY)),ox=(w-(maxX-minX)*scale)/2-minX*scale,oy=h*.62-(maxY+minY)*scale*.5;
 const q=pts.map(p=>({x:ox+p.x*scale,y:oy-p.y*scale}));
 c.fillStyle='#17445a';c.font='bold 13px system-ui';c.fillText('PASO '+(stepNumber+1)+' / '+Math.max(1,order.length)+' · P'+(activeIdx+1)+' · OBJETIVO '+activeAngle+'°',14,20);
 for(let i=0;i<q.length-1;i++){const seqPosition=order.indexOf(i),done=seqPosition>=0&&seqPosition<stepNumber,active=i===activeIdx;c.beginPath();c.moveTo(q[i].x,q[i].y);c.lineTo(q[i+1].x,q[i+1].y);c.strokeStyle=active?'#087fb5':done?'#23845d':'#8da7b5';c.lineWidth=active?5:3;c.lineCap='round';c.stroke();c.beginPath();c.arc(q[i+1].x,q[i+1].y,active?5:3,0,Math.PI*2);c.fillStyle=active?'#087fb5':done?'#23845d':'#8da7b5';c.fill()}
 c.fillStyle='#526f80';c.font='11px system-ui';c.fillText('Seguimiento acumulado: pliegues terminados en verde; pliegue actual en azul. No es un perfil CAD validado.',14,h-8);
}
function drawPhysicalBend(){
 const cv=$('pp58PhysicalCanvas');if(!cv)return;fitCanvas(cv,1440,660);const x=cv.getContext('2d'),w=cv.width,h=cv.height,{s,b,order,idx,bend,n,localPhase,stepNumber,punch,die}=physicalSequence();
 const t=Math.max(.1,Number(s.project?.thickness||s.development?.thickness||1)),angle=Number(bend.angle)||90,punchAngle=Math.max(20,Math.min(90,Number(punch?.angle)||30)),punchHeight=Math.max(20,Math.min(260,Number(punch?.height)||120)),v=Math.max(6,Number(die?.v||bend.v||s.project?.selectedV||16)),dieAngle=Math.max(30,Math.min(120,Number(die?.angle)||88)),phase=Math.max(0,Math.min(1,localPhase)),rawContact=Math.max(0,Math.min(1,(phase-.12)/.55)),release=phase>.82?Math.max(0,Math.min(1,(phase-.82)/.18)):0;const contact=rawContact*(1-release);
 x.clearRect(0,0,w,h);const bg=x.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#f9fdff');bg.addColorStop(1,'#d9e9f2');x.fillStyle=bg;x.fillRect(0,0,w,h);
 x.strokeStyle='#d3e3eb';x.lineWidth=1;for(let i=20;i<w;i+=40){x.beginPath();x.moveTo(i,0);x.lineTo(i,h);x.stroke()}for(let i=20;i<h;i+=40){x.beginPath();x.moveTo(0,i);x.lineTo(w,i);x.stroke()}
 const view=$('pp58PhysView')?.value||'profile',cx=view==='profile'?w*.53:w*.52,base=h*.69,sc=view==='front'?.82:view==='section'?.9:view==='profile'?.88:.78,rot=view==='iso'?rotation*.08:0;
 const P=(px,py,pz=0)=>view==='profile'?({x:cx+px*sc,y:base-py*sc}):({x:cx+(px*Math.cos(rot)-pz*Math.sin(rot))*sc,y:base-(py-(px*Math.sin(rot)+pz*Math.cos(rot))*.16)*sc});
 const poly=(pts,fill,stroke='#526f80')=>{x.beginPath();pts.forEach((p,i)=>{const q=P(p[0],p[1],p[2]||0);i?x.lineTo(q.x,q.y):x.moveTo(q.x,q.y)});x.closePath();const g=x.createLinearGradient(cx-280,base-200,cx+280,base+80);g.addColorStop(0,'#f3f7f9');g.addColorStop(.4,fill);g.addColorStop(1,'#526a78');x.fillStyle=g;x.fill();x.strokeStyle=stroke;x.lineWidth=2;x.stroke()};
 const line=(pts,color,width=3)=>{x.beginPath();pts.forEach((p,i)=>{const q=P(p[0],p[1],p[2]||0);i?x.lineTo(q.x,q.y):x.moveTo(q.x,q.y)});x.strokeStyle=color;x.lineWidth=width;x.lineJoin='round';x.lineCap='round';x.stroke()};
 const label=(txt,px,py,color='#17445a')=>{x.fillStyle=color;x.font='bold 19px system-ui';x.fillText(txt,px,py)};
 // Matriz en V abierta: el contorno superior baja hacia el vértice; el volumen queda debajo de las caras.
 const vHalf=Math.max(24,Math.min(150,v*3)),vDepth=Math.max(16,vHalf/Math.tan(dieAngle*Math.PI/360)),dieApexY=20-vDepth,dieBaseY=Math.min(-28,dieApexY-18);
 const dieProfile=[[-430,20],[-vHalf,20],[0,dieApexY],[vHalf,20],[430,20],[430,dieBaseY],[-430,dieBaseY]];
 poly(dieProfile.map(([px,py])=>[px,py,-30]),'#879eab','#405b6a');
 poly(dieProfile.map(([px,py])=>[px,py,30]),'#a9bbc5','#405b6a');
 poly([[-430,20,-30],[-430,20,30],[-430,dieBaseY,30],[-430,dieBaseY,-30]],'#536e7d');
 line([[-vHalf,20,-31],[0,dieApexY,-31],[vHalf,20,-31]],'#d7e4eb',4);
 // Topes traseros situados detrás de la matriz; sus dedos de apoyo quedan en la cota de la chapa.
 const gaugeX=-310, gaugeY=144;
 // El plano superior del tope coincide con la cota de apoyo de la chapa en reposo.
 const sheetRestY=20;
 poly([[gaugeX-28,gaugeY+30,90],[gaugeX+28,gaugeY+30,90],[gaugeX+18,gaugeY-95,90],[gaugeX-18,gaugeY-95,90]],'#536f80','#2f4c5e');
 poly([[gaugeX-52,gaugeY-95,90],[gaugeX+52,gaugeY-95,90],[gaugeX+52,gaugeY-112,90],[gaugeX-52,gaugeY-112,90]],'#d1dfe6','#526c7b');
 poly([[gaugeX-34,gaugeY-112,90],[gaugeX+34,gaugeY-112,90],[gaugeX+34,gaugeY-124,90],[gaugeX-34,gaugeY-124,90]],'#e5a34b','#91612d');
 // Secondary finger gives a sense of machine width; visibility stays separately labelled.
 poly([[gaugeX+410,gaugeY+30,90],[gaugeX+466,gaugeY+30,90],[gaugeX+456,gaugeY-95,90],[gaugeX+420,gaugeY-95,90]],'#536f80','#2f4c5e');
 poly([[gaugeX+386,gaugeY-95,90],[gaugeX+490,gaugeY-95,90],[gaugeX+490,gaugeY-112,90],[gaugeX+386,gaugeY-112,90]],'#d1dfe6','#526c7b');
 // Chapa dinámica: apoyada sobre los hombros de la matriz, llega al tope trasero y se curva al bajar el punzón.
 // En reposo tiene una ligera ampolla; durante el contacto, el centro entra en la V y las dos alas suben.
 const thicknessPx=Math.max(3,Math.min(8,t*2.2));
 // SEGUIMIENTO FÍSICO ACUMULATIVO: reconstruye el perfil completo de la pieza a partir
 // de las patas programadas. Los pliegues ya ejecutados permanecen; el actual se forma
 // durante el contacto y no se deshace cuando el punzón retorna. Los futuros quedan planos.
 const activeTurnProgress=phase<.12?0:phase<.67?Math.max(0,Math.min(1,(phase-.12)/.55)):1;
 const profilePts=[{x:0,y:0}];let profileHeading=0;
 for(let legIndex=0;legIndex<b.length;legIndex++){
  const legLength=Math.max(1,Number(b[legIndex]?.leg)||0);
  const prev=profilePts[profilePts.length-1];
  profilePts.push({x:prev.x+Math.cos(profileHeading)*legLength,y:prev.y+Math.sin(profileHeading)*legLength});
  if(legIndex<b.length-1){
   const seqPosition=order.indexOf(legIndex),isCompleted=seqPosition>=0&&seqPosition<stepNumber,isActive=legIndex===idx;
   const foldProgress=isCompleted?1:isActive?activeTurnProgress:0;
   const foldAngle=Number(b[legIndex]?.angle)||90;
   const foldDirection=Number(b[legIndex]?.direction)||1;
   profileHeading+=foldDirection*(180-foldAngle)*Math.PI/180*foldProgress;
  }
 }
 const activeVertex=profilePts[Math.min(profilePts.length-1,Math.max(0,idx+1))]||{x:0,y:0};
 const sheetCenterY=20+(dieApexY+Math.max(2,thicknessPx*.65)-20)*contact;
 const sheetPts=profilePts.map(p=>[p.x-activeVertex.x,p.y-activeVertex.y+sheetCenterY,5]);
 line(sheetPts,'#087fb5',Math.max(5,thicknessPx));
 line(sheetPts.map(p=>[p[0],p[1]+thicknessPx*.5,p[2]+1]),'#e0f7ff',1.8);
 // Línea de contacto sobre la matriz: cambia con el descenso real del punzón.
 const contactPts=[[-130,20,6],[-60,-35,6],[0,-72,6],[60,-35,6],[130,20,6]];
 line(contactPts,'rgba(8,127,181,.28)',2);
 // Punch body and pointed nose; motion is driven by the same cycle progress slider.
 const punchTipY=sheetCenterY+Math.max(2,thicknessPx*.65),punchY=punchTipY+punchHeight+8,tipHalf=Math.max(2,Math.min(24,Math.tan(punchAngle*Math.PI/360)*8)),shoulder=Math.max(42,Math.min(82,punchHeight*.55));
 poly([[-100,punchY,0],[100,punchY,0],[76,punchY-shoulder,0],[tipHalf,punchY-punchHeight,0],[0,punchY-punchHeight-8,0],[-tipHalf,punchY-punchHeight,0],[-76,punchY-shoulder,0]],'#718c9b','#334f60');
 line([[-tipHalf,punchY-punchHeight,1],[0,punchY-punchHeight-8,1],[tipHalf,punchY-punchHeight,1]],'#edf5f8',3);
 // Work-zone glow shows the contact path, not a safety-certified collision envelope.
 const contactP=P(0,29+contact*18,7);x.beginPath();x.arc(contactP.x,contactP.y,14+contact*18,0,Math.PI*2);x.fillStyle='rgba(18,139,196,'+(.05+contact*.12)+')';x.fill();
 label('PUNZÓN '+(punch?.name||punch?.id||'GENÉRICO'),w*.43,75);label('MATRIZ V'+v+' · '+dieAngle+'°',w*.43,h*.82);label('TOPE TRASERO · REFERENCIA '+sheetRestY,w*.08,h*.35);label('CHAPA · CONTACTO '+Math.round(contact*100)+'%',w*.63,h*.35);
 const railX=24,railY=h-42,railW=Math.max(120,w-48),railN=Math.max(1,order.length),slot=railW/railN;
 x.fillStyle='#e5f1f6';x.fillRect(railX,railY-13,railW,26);
 for(let k=0;k<railN;k++){const foldIdx=order[k]??k,fb=b[foldIdx]||{},fx=railX+slot*(k+.5);x.fillStyle=k<stepNumber?'#23845d':k===stepNumber?'#087fb5':'#a9bdc8';x.beginPath();x.arc(fx,railY,Math.max(4,Math.min(9,slot*.22)),0,Math.PI*2);x.fill();x.fillStyle=k===stepNumber?'#073e58':'#315366';x.font='bold 12px system-ui';x.textAlign='center';x.fillText('P'+(foldIdx+1),fx,railY-15);x.font='10px system-ui';x.fillText((Number(fb.angle)||90)+'°',fx,railY+20)}x.textAlign='start';
 x.fillStyle='#eaf6fb';x.fillRect(24,22,360,42);x.fillStyle='#17445a';x.font='bold 15px system-ui';x.fillText(view==='profile'?'PERFIL LATERAL · SEGUIMIENTO DEL PLEGADO':view==='section'?'SECCIÓN DE CONTACTO':view==='front'?'VISTA FRONTAL':'VISTA ISOMÉTRICA DE SEGUIMIENTO',36,49);
 const phaseLabel=phase<.12?'APROXIMACIÓN':phase<.67?'CONTACTO / PLEGADO':phase<.84?'RETENCIÓN':'RETORNO';$('pp58PhysStepLabel').textContent=phaseLabel;$('pp58PhysActive').textContent=phase<.12?'Punzón acercándose':phase<.84?'Punzón + chapa + matriz':'Retorno y liberación';$('pp58PhysOrder').textContent=order.length?('P'+(idx+1)+' · '+(stepNumber+1)+'/'+order.length+' · '+Math.max(1,Number(bend.leg)||100).toFixed(0)+' mm'):'Sin pliegues definidos';$('pp58PhysAngle').textContent=angle+'°';$('pp58PhysThickness').textContent=t.toFixed(2)+' mm';
 $('pp58PhysStatus').textContent='Paso '+(stepNumber+1)+' · '+(punch?(punch.maker||'Utillaje')+' '+(punch.name||punch.id||'punzón'):'punzón genérico estimado')+' · '+(die?(die.maker||'Utillaje')+' '+(die.name||die.id||'matriz'):'matriz V estimada')+'. Geometría representada con los metadatos locales disponibles; no sustituye un perfil CAD oficial.';
 drawProgramProfile(b,idx,order,stepNumber,angle,phase);
 const status=$('pp58PhysStatus');if(status)status.textContent='Paso '+(stepNumber+1)+' · V'+v+' · objetivo '+angle+'° · '+(punch?(punch.maker||'')+' '+(punch.name||punch.id||'punzón'):'punzón genérico estimado')+' · '+(die?(die.maker||'')+' '+(die.name||die.id||'matriz'):'matriz V estimada')+' · material '+String(s.project?.material||s.development?.material||'sin especificar')+'. La representación usa metadatos locales; verifica el perfil CAD y las cotas oficiales antes de validar el plegado.';
}
function runPhysicalBend(){
 if(physRaf||!physPlaying||!$('pp58PhysicalCanvas')||document.hidden)return;
 const tick=now=>{physRaf=0;if(!physPlaying||document.hidden)return;if(!physLast)physLast=now;physProgress+=((now-physLast)/8500)*Number($('pp58PhysSpeed')?.value||1);physLast=now;if(physProgress>=1){physProgress=0}if($('pp58PhysProgress'))$('pp58PhysProgress').value=String(Math.round(physProgress*100));if(now-physLastDraw>=40){physLastDraw=now;drawPhysicalBend()}physRaf=requestAnimationFrame(tick)};
 physRaf=requestAnimationFrame(tick);
}

function addToolDetail(){
 const host=$('tooling')?.querySelector('.grid');if(!host||$('pp58ToolCard'))return;
 const c=document.createElement('section');c.className='card pp58card';c.id='pp58ToolCard';
 c.innerHTML='<div class="pp58head"><div><span class="pp58kicker">TOOLING ENGINEERING</span><h2>Utillaje · perfil CAD/CAM acotado</h2><p>Sección técnica y vista axonométrica de la referencia seleccionada. Las cotas ausentes se marcan como estimadas.</p></div><b>2D + AXONOMETRÍA</b></div><div class="pp58controls"><div><label>Herramienta</label><select id="pp58Tool"></select></div><div><label>Vista</label><select id="pp58ToolView"><option value="both">Sección + axonometría</option><option value="section">Solo sección</option><option value="iso">Solo axonometría</option></select></div><div><label>Escala</label><input id="pp58ToolScale" type="range" min=".65" max="1.4" step=".05" value="1"></div></div><div class="pp58toolgrid"><div><canvas id="pp58Section" class="pp58canvas" width="1200" height="650"></canvas><canvas id="pp58Iso" class="pp58canvas" width="1200" height="650" style="margin-top:10px"></canvas></div><div><div class="pp58metrics"><div class="pp58metric"><small>FABRICANTE</small><b id="pp58Maker">—</b></div><div class="pp58metric"><small>REFERENCIA</small><b id="pp58Name">—</b></div><div class="pp58metric"><small>ÁNGULO</small><b id="pp58Angle">—</b></div><div class="pp58metric"><small>V / ABERTURA</small><b id="pp58V">—</b></div><div class="pp58metric"><small>ALTURA</small><b id="pp58Height">—</b></div><div class="pp58metric"><small>RADIO</small><b id="pp58Radius">—</b></div></div><div id="pp58ToolSource" class="pp58status">Selecciona un útil.</div><div class="actions"><button class="btn secondary" id="pp58Manufacturer">Abrir catálogo oficial</button><button class="btn secondary" id="pp58ExportTool">Exportar ficha</button></div></div></div>';
 host.appendChild(c);const old=$('pp55ToolSelect'),all=T();$('pp58Tool').innerHTML=all.map((t,i)=>'<option value="'+i+'">'+esc((t.maker||'Sin fabricante')+' · '+(t.type||'Útil')+' · '+(t.name||t.id||i))+'</option>').join('')||'<option value="-1">Sin referencias</option>';if(old)$('pp58Tool').value=old.value;
 $('pp58Tool').addEventListener('change',()=>{if(old)old.value=$('pp58Tool').value;drawTool()});['pp58ToolView','pp58ToolScale'].forEach(id=>$(id).addEventListener('input',drawTool));
 $('pp58Manufacturer').onclick=()=>{const t=T()[Number($('pp58Tool').value)]||{},m=String(t.maker||'').toLowerCase(),u=m.includes('mecos')?sources[0][1]:m.includes('amada')?sources[1][1]:m.includes('trumpf')?sources[2][1]:sources[3][1];window.open(u,'_blank','noopener')};
 $('pp58ExportTool').onclick=()=>{const t=T()[Number($('pp58Tool').value)]||{};dl('PlegarPro_ficha_util.json',JSON.stringify({version:'58.0',tool:t,warning:'Contrastar con plano oficial antes de fabricación.'},null,2))};drawTool();
}
function drawTool(){
 if(!$('pp58Section'))return;const all=T(),t=all[Number($('pp58Tool').value)]||{maker:'Sin dato',name:'Sin referencia',type:'Matriz',v:16,angle:88,radius:2,height:60},punch=/punz[oó]n|punch/i.test(String(t.type||t.name||'')),v=Math.max(4,Number(t.v)||16),a=Math.max(30,Math.min(120,Number(t.angle)||88)),r=Math.max(.2,Number(t.radius)||1.5),h=Math.max(15,Number(t.height)||60),sc=Number($('pp58ToolScale').value)||1;
 $('pp58Maker').textContent=t.maker||'No indicado';$('pp58Name').textContent=t.name||t.id||t.type||'Útil';$('pp58Angle').textContent=a+'°'+(t.angle?'':' · estimado');$('pp58V').textContent=punch?'—':'V'+v+' mm';$('pp58Height').textContent=h+' mm'+(t.height?'':' · estimada');$('pp58Radius').textContent='R'+r+' mm'+(t.radius?'':' · estimado');
 $('pp58ToolSource').textContent=t.source||t.url||'No hay plano CAD oficial enlazado a esta referencia. La imagen es una representación geométrica, no una reproducción certificada.';
 const view=$('pp58ToolView').value;$('pp58Section').style.display=view==='iso'?'none':'block';$('pp58Iso').style.display=view==='section'?'none':'block';
 const c=$('pp58Section'),x=c.getContext('2d'),w=c.width,hh=c.height;x.clearRect(0,0,w,hh);x.fillStyle='#fbfdff';x.fillRect(0,0,w,hh);x.strokeStyle='#e0ebf1';for(let i=20;i<w;i+=25){x.beginPath();x.moveTo(i,0);x.lineTo(i,hh);x.stroke()}for(let i=20;i<hh;i+=25){x.beginPath();x.moveTo(0,i);x.lineTo(w,i);x.stroke()}
 const cx=w*.45,base=hh*.69,unit=sc*Math.min(7,320/Math.max(v,20)),half=v*unit/2,top=base-h*unit*.48;
 x.fillStyle='#173e54';x.font='bold 24px system-ui';x.fillText((t.maker||'')+' · '+(t.name||t.type||'Útil'),30,40);x.font='15px system-ui';x.fillStyle='#587588';x.fillText('SECCIÓN TRANSVERSAL · MM',30,66);
 x.beginPath();if(punch){x.moveTo(cx-half*1.9,top);x.lineTo(cx+half*1.9,top);x.lineTo(cx+half*.7,base-h*unit*.14);x.quadraticCurveTo(cx+half*.25,base-h*unit*.02,cx,base);x.quadraticCurveTo(cx-half*.25,base-h*unit*.02,cx-half*.7,base-h*unit*.14);x.closePath()}else{x.moveTo(cx-half*2.1,top);x.lineTo(cx-half*.7,top);x.quadraticCurveTo(cx-half*.4,top+r*unit*.65,cx-half*.3,top+r*unit*.5);x.lineTo(cx,top+r*unit*1.45);x.lineTo(cx+half*.3,top+r*unit*.5);x.quadraticCurveTo(cx+half*.4,top+r*unit*.65,cx+half*.7,top);x.lineTo(cx+half*2.1,top);x.lineTo(cx+half*2.1,base);x.lineTo(cx-half*2.1,base);x.closePath()}
 const g=x.createLinearGradient(cx-half*2,top,cx+half*2,base);g.addColorStop(0,'#d9e3e9');g.addColorStop(.35,'#8fa7b5');g.addColorStop(.6,'#c7d4dc');g.addColorStop(1,'#708b9b');x.fillStyle=g;x.fill();x.strokeStyle='#314e60';x.lineWidth=4;x.stroke();
 function dim(x1,y1,x2,y2,label){x.strokeStyle='#d27d16';x.lineWidth=2;x.beginPath();x.moveTo(x1,y1);x.lineTo(x2,y2);x.stroke();x.fillStyle='#9b5b0d';x.font='bold 19px system-ui';x.textAlign='center';x.fillText(label,(x1+x2)/2,(y1+y2)/2-10)}dim(cx-half,base+44,cx+half,base+44,punch?'Punta / nominal':'Abertura V'+v+' mm');dim(cx+half*2.3,top,cx+half*2.3,base,'H '+h+' mm');x.fillStyle='#c77a12';x.font='bold 18px system-ui';x.textAlign='left';x.fillText('Ángulo '+a+'°',w*.7,hh*.32);x.fillText('Radio R'+r+' mm',w*.7,hh*.39);
 const d=$('pp58Iso'),z=d.getContext('2d'),ww=d.width,hhh=d.height;z.clearRect(0,0,ww,hhh);z.fillStyle='#f7fbfe';z.fillRect(0,0,ww,hhh);z.strokeStyle='#e3edf3';for(let i=20;i<ww;i+=35){z.beginPath();z.moveTo(i,0);z.lineTo(i,hhh);z.stroke()}z.fillStyle='#15394f';z.font='bold 24px system-ui';z.fillText('AXONOMETRÍA · PERFIL EXTRUIDO',30,40);
 const ox=ww*.45,oy=hhh*.68,u=sc*3.5,half2=Math.min(150,v*u),height=Math.min(230,h*u*.52),depth=160,profile=punch?[[-half2*1.9,height],[half2*1.9,height],[half2*.65,height*.15],[half2*.2,0],[-half2*.2,0],[-half2*.65,height*.15]]:[[-half2*2,height],[-half2*.55,height],[0,height*.62],[half2*.55,height],[half2*2,height],[half2*2,0],[-half2*2,0]];
 function poly(ps,fill){z.beginPath();ps.forEach((p,i)=>i?z.lineTo(p[0],p[1]):z.moveTo(p[0],p[1]));z.closePath();z.fillStyle=fill;z.fill();z.strokeStyle='#405f70';z.lineWidth=3;z.stroke()}
 const front=profile.map(p=>[ox+p[0],oy-p[1]]),back=profile.map(p=>[ox+p[0]+depth,oy-p[1]-depth*.45]);poly(back,'#8099a7');
 for(let i=0;i<front.length;i++){const j=(i+1)%front.length;poly([front[i],front[j],back[j],back[i]],i%2?'#9fb4c0':'#c4d2da')}
 poly(front,'#d8e2e8');z.fillStyle='#173e54';z.font='bold 18px system-ui';z.fillText(punch?'PUNZÓN EXTRUIDO':'MATRIZ EXTRUIDA',ww*.68,hhh*.32);z.font='15px system-ui';z.fillStyle='#587588';z.fillText('Sólido esquemático, no CAD oficial',ww*.68,hhh*.39);
}
function addDatabase(){
 const g=$('settings')?.querySelector('.grid');if(!g||$('pp58DbCard'))return;
 const c=document.createElement('section');c.id='pp58DbCard';c.className='card pp58card';c.innerHTML='<div class="pp58head"><div><span class="pp58kicker">DATABASE CONNECTOR</span><h2>Actualizar bases de datos</h2><p>Comprueba el sitio publicado, conserva las referencias locales y revisa las fuentes oficiales configuradas.</p></div><b>MANTENIMIENTO</b></div><div class="pp58metrics"><div class="pp58metric"><small>REFERENCIAS LOCALES</small><b id="pp58DbCount">—</b></div><div class="pp58metric"><small>FUENTES OFICIALES</small><b>4</b></div><div class="pp58metric"><small>ÚLTIMA REVISIÓN</small><b id="pp58DbDate">Pendiente</b></div></div><div class="actions"><button class="btn" id="pp58DbRefresh">⟳ Actualizar bases de datos</button><button class="btn secondary" id="pp58DbExport">Exportar índice local</button></div><div id="pp58DbStatus" class="pp58status">La actualización comprueba las fuentes accesibles; los PDF o páginas con restricciones no se marcarán como importados.</div><div id="pp58DbSources"></div>';g.appendChild(c);
 $('pp58DbCount').textContent=T().length;$('pp58DbSources').innerHTML=sources.map(s=>'<div class="pp58source"><b>'+esc(s[0])+'</b><a href="'+s[1]+'" target="_blank" rel="noopener">Abrir catálogo ↗</a></div>').join('');
 $('pp58DbExport').onclick=()=>dl('PlegarPro_indice_utiles.json',JSON.stringify({version:'v58',generatedAt:new Date().toISOString(),tools:T(),sources:sources,warning:'El índice representa solo datos disponibles localmente.'},null,2));
 $('pp58DbRefresh').onclick=async()=>{const btn=$('pp58DbRefresh'),st=$('pp58DbStatus');btn.disabled=true;btn.textContent='Comprobando…';const checks=[];try{const r=await fetch('./index.html?dbcheck='+Date.now(),{cache:'no-store'});checks.push(['Repositorio web Plegar Pro',r.ok,'HTTP '+r.status])}catch(e){checks.push(['Repositorio web Plegar Pro',false,'No se pudo comprobar la versión publicada'])}
 for(const src of sources){let ok=false,detail='No legible automáticamente: posible CORS, PDF o restricción de red.';try{const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),3500),r=await fetch(src[1],{method:'HEAD',mode:'cors',cache:'no-store',signal:ctl.signal});clearTimeout(timer);ok=r.ok;detail='HTTP '+r.status+'; contenido no importado automáticamente.'}catch(e){}checks.push([src[0],ok,detail])}
 const date=new Date();prefs.lastDbCheck=date.toISOString();try{localStorage.setItem(KEY,JSON.stringify(prefs))}catch(e){}$('pp58DbDate').textContent=date.toLocaleString('es-ES');$('pp58DbCount').textContent=T().length;$('pp58DbSources').innerHTML=checks.map(a=>'<div class="pp58source"><span><b>'+(a[1]?'✓ ':'⚠ ')+esc(a[0])+'</b><br><small>'+esc(a[2])+'</small></span><b>'+(a[1]?'Verificada':'Manual')+'</b></div>').join('');st.className='pp58status';st.textContent='Comprobación terminada: '+checks.filter(a=>a[1]).length+'/'+checks.length+' fuentes con respuesta verificable. Las fuentes no legibles siguen enlazadas, pero no se inventan cotas ni se declara importación de datos no descargados.';btn.disabled=false;btn.textContent='⟳ Actualizar bases de datos'};
 if(prefs.lastDbCheck)$('pp58DbDate').textContent=new Date(prefs.lastDbCheck).toLocaleString('es-ES');
 const mini=document.createElement('div');mini.className='card pp58card';mini.innerHTML='<div class="pp58head"><div><span class="pp58kicker">DATABASE MAINTENANCE</span><h2>Actualizar bases de datos</h2><p>Acceso rápido al panel de mantenimiento de Ajustes.</p></div><button class="btn" id="pp58DbGo">Actualizar bases de datos</button></div>';const t=$('tooling')?.querySelector('.grid');if(t)t.appendChild(mini);$('pp58DbGo').onclick=()=>{document.querySelector('[data-page="settings"]')?.click();setTimeout(()=>$('pp58DbCard')?.scrollIntoView({behavior:'smooth',block:'start'}),150)};
}
function addOffice(){
 const g=$('office')?.querySelector('.grid');if(!g||$('pp58Office'))return;const c=document.createElement('section');c.className='card pp58card';c.id='pp58Office';
 c.innerHTML='<div class="pp58head"><div><span class="pp58kicker">TECHNICAL OFFICE · WORKFLOW</span><h2>Oficina técnica · preparación y liberación</h2><p>Ficha de proceso, trazabilidad, tolerancias, controles, lista de comprobación y exportación.</p></div><b>DOCUMENTACIÓN</b></div><div class="pp58controls"><div><label>Responsable técnico</label><input id="pp58Owner" placeholder="Técnico / programador"></div><div><label>Máquina prevista</label><input id="pp58Machine" placeholder="Modelo y tonelaje"></div><div><label>Revisión de plano</label><input id="pp58Revision" value="A"></div><div><label>Prioridad</label><select id="pp58Priority"><option>Normal</option><option>Urgente</option><option>Planificada</option><option>Bloqueada por validación</option></select></div><div><label>Tolerancia lineal (mm)</label><input id="pp58Linear" type="number" min="0" step=".1" value=".5"></div><div><label>Tolerancia angular (°)</label><input id="pp58Angular" type="number" min="0" step=".1" value="1"></div><div><label>Control dimensional</label><select id="pp58Control"><option>Primera pieza + muestreo</option><option>100% de piezas</option><option>Según plan de calidad</option></select></div><div><label>Acabado / observaciones</label><input id="pp58Finish" placeholder="Desbarbado, cara vista…"></div></div><h3>Checklist de liberación técnica</h3><div class="pp58checks">'+[['drawing','Plano / revisión confirmados'],['material','Material y espesor verificados'],['tools','Punzón y matriz contrastados'],['sequence','Secuencia revisada'],['collision','Colisiones comprobadas'],['force','Fuerza y longitud verificadas'],['firstPart','Primera pieza medida'],['quality','Tolerancias definidas'],['cnc','Programa CNC revisado por autorizado'],['backup','Copia de seguridad creada']].map(a=>'<label class="pp58check"><input type="checkbox" data-pp58check="'+a[0]+'"><span>'+a[1]+'</span></label>').join('')+'</div><div class="actions"><button class="btn" id="pp58OfficeSave">Guardar ficha técnica</button><button class="btn secondary" id="pp58OfficeReport">Generar informe</button><button class="btn secondary" id="pp58OfficeCsv">Exportar pliegues CSV</button><button class="btn secondary" id="pp58OfficeJson">Exportar paquete técnico JSON</button></div><div id="pp58OfficeStatus" class="pp58status">Ficha pendiente de guardar.</div>';g.appendChild(c);
 const s=S(),o=s?.settings?.officeEngineering||{};[['pp58Owner','owner'],['pp58Machine','machine'],['pp58Revision','revision'],['pp58Priority','priority'],['pp58Linear','linear'],['pp58Angular','angular'],['pp58Control','control'],['pp58Finish','finish']].forEach(a=>{if(o[a[1]]!==undefined)$(a[0]).value=o[a[1]]});document.querySelectorAll('[data-pp58check]').forEach(el=>el.checked=!!o.checks?.[el.dataset.pp58check]);
 $('pp58OfficeSave').onclick=()=>{const st=S();if(!st)return;st.settings=st.settings||{};const out={owner:$('pp58Owner').value,machine:$('pp58Machine').value,revision:$('pp58Revision').value,priority:$('pp58Priority').value,linear:$('pp58Linear').value,angular:$('pp58Angular').value,control:$('pp58Control').value,finish:$('pp58Finish').value,checks:{},updatedAt:new Date().toISOString()};document.querySelectorAll('[data-pp58check]').forEach(el=>out.checks[el.dataset.pp58check]=el.checked);st.settings.officeEngineering=out;try{localStorage.setItem('plegarProV43',JSON.stringify(st));localStorage.setItem('plegarPro.v58.office',JSON.stringify(out))}catch(e){}$('pp58OfficeStatus').textContent='Ficha guardada · '+new Date(out.updatedAt).toLocaleString('es-ES')+'. La checklist no certifica la seguridad por sí sola.';msg('Ficha técnica guardada')};
 $('pp58OfficeReport').onclick=()=>{const st=S()||{},lines=['PLEGAR PRO · INFORME DE OFICINA TÉCNICA','Referencia: '+(st.project?.ref||'—'),'Cliente: '+(st.project?.client||'—'),'Material: '+(st.project?.material||'—'),'Espesor: '+(st.project?.thickness||'—')+' mm','Máquina: '+$('pp58Machine').value,'Responsable: '+$('pp58Owner').value,'Revisión: '+$('pp58Revision').value,'Prioridad: '+$('pp58Priority').value,'Tolerancia lineal: '+$('pp58Linear').value+' mm','Tolerancia angular: '+$('pp58Angular').value+'°','Control: '+$('pp58Control').value,'Acabado: '+$('pp58Finish').value,'','SECUENCIA'];(st.bends||[]).forEach((b,i)=>lines.push('P'+(i+1)+'; ala='+b.leg+' mm; ángulo='+b.angle+'°; R='+b.radius+' mm; V='+b.v+'; punzón='+b.punch));lines.push('','CHECKLIST');document.querySelectorAll('[data-pp58check]').forEach(el=>lines.push((el.checked?'[X] ':'[ ] ')+el.parentElement.innerText.trim()));lines.push('','Verificar cotas con documentación oficial y primera pieza.');dl('PlegarPro_'+(st.project?.ref||'pieza')+'_oficina_tecnica.txt',lines.join('\n'),'text/plain')};
 $('pp58OfficeCsv').onclick=()=>{const st=S()||{},rows=[['Paso','Ala mm','Ángulo °','Radio mm','V mm','Punzón','Tope mm','Dirección'],...(st.bends||[]).map((b,i)=>[i+1,b.leg,b.angle,b.radius,b.v,b.punch,b.gauge,b.direction])];dl('PlegarPro_pliegues.csv','\ufeff'+rows.map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(';')).join('\r\n'),'text/csv;charset=utf-8')};
 $('pp58OfficeJson').onclick=()=>{const st=S()||{};dl('PlegarPro_paquete_tecnico.json',JSON.stringify({app:'Plegar Pro',version:'58.0',exportedAt:new Date().toISOString(),project:st.project,bends:st.bends,programMeta:st.programMeta,development:st.development,office:st.settings?.officeEngineering,warning:'Verificar la geometría y el programa antes de fabricar.'},null,2))};
}
function addSettings(){
 const g=$('settings')?.querySelector('.grid');if(!g||$('pp58Settings'))return;const c=document.createElement('section');c.className='card pp58card';c.id='pp58Settings';c.innerHTML='<div class="pp58head"><div><span class="pp58kicker">APPLICATION CONTROL</span><h2>Ajustes avanzados del programa</h2><p>Preferencias visuales, calidad, respaldos, confirmaciones y comportamiento de módulos.</p></div><b>CONFIGURACIÓN</b></div><div class="pp58controls"><div><label>Modo</label><select id="pp58Mode"><option>Ingeniería completa</option><option>Programación rápida</option><option>Producción</option><option>Formación / demo</option></select></div><div><label>Unidades</label><select id="pp58Units"><option value="mm">Milímetros / grados</option><option value="inch">Pulgadas / grados</option></select></div><div><label>Calidad gráfica</label><select id="pp58Quality"><option>Alta</option><option>Ultra</option><option>Rendimiento</option></select></div><div><label>Copias de seguridad</label><select id="pp58Backup"><option value="manual">Solo manual</option><option value="change">Tras cambios</option><option value="session">Por sesión</option></select></div><div><label>Confirmar borrados</label><select id="pp58Confirm"><option value="yes">Siempre</option><option value="no">No preguntar</option></select></div><div><label>Sincronización</label><select id="pp58Sync"><option value="live">En vivo + guardar</option><option value="save">Al cambiar / guardar</option></select></div><div><label>Advertencias</label><select id="pp58Warnings"><option value="all">Todas</option><option value="critical">Solo importantes</option></select></div><div><label>Inicio preferido</label><select id="pp58Home"><option value="dashboard">Panel de control</option><option value="program">Programar</option><option value="program2d">Programación 2D</option><option value="program3d">Programación 3D</option><option value="collisions">Colisiones</option><option value="office">Oficina técnica</option></select></div></div><div class="actions"><button class="btn" id="pp58SaveSettings">Guardar ajustes</button><button class="btn secondary" id="pp58ExportSettings">Exportar preferencias</button><button class="btn secondary" id="pp58ResetSettings">Restaurar estos ajustes</button></div><div id="pp58SettingsStatus" class="pp58status">Los ajustes se guardan por separado de la geometría.</div>';g.appendChild(c);
 const defs={mode:'Ingeniería completa',units:'mm',quality:'Ultra',backup:'change',confirm:'yes',sync:'live',warnings:'all',home:'dashboard'},v={...defs,...prefs.advanced},map={pp58Mode:'mode',pp58Units:'units',pp58Quality:'quality',pp58Backup:'backup',pp58Confirm:'confirm',pp58Sync:'sync',pp58Warnings:'warnings',pp58Home:'home'};Object.entries(map).forEach(a=>$(a[0]).value=v[a[1]]);
 $('pp58SaveSettings').onclick=()=>{const out={};Object.entries(map).forEach(a=>out[a[1]]=$(a[0]).value);prefs.advanced=out;try{localStorage.setItem(KEY,JSON.stringify(prefs))}catch(e){}$('pp58SettingsStatus').textContent='Ajustes guardados · sincronización '+out.sync+' · calidad '+out.quality;msg('Ajustes guardados')};
 $('pp58ExportSettings').onclick=()=>dl('PlegarPro_preferencias.json',JSON.stringify({version:'58.0',prefs},null,2));$('pp58ResetSettings').onclick=()=>{prefs.advanced=defs;try{localStorage.setItem(KEY,JSON.stringify(prefs))}catch(e){}Object.entries(map).forEach(a=>$(a[0]).value=defs[a[1]]);$('pp58SettingsStatus').textContent='Ajustes restaurados; los datos de la pieza no se han modificado.'};
}
function syncLinked(){
 const s=S();if(!s)return;try{
  if(typeof ensureDevelopment==='function')ensureDevelopment();
  if(s.development){s.development.material=s.project.material;s.development.thickness=s.project.thickness;s.development.kfactor=s.project.kfactor;s.development.bendLength=Number(s.programMeta?.bendLength||s.development.bendLength||1000);s.development.bends=(s.bends||[]).map((b,i)=>({...b,terminal:i===s.bends.length-1}))}
  if(s.curve)s.curve.thickness=s.project.thickness;
  [['progMaterial',s.project.material],['p2Material',s.project.material],['p3Material',s.project.material],['progThickness',s.project.thickness],['p2Thickness',s.project.thickness],['p3Thickness',s.project.thickness],['progSheetLength',s.programMeta?.sheetLength||1200],['p2SheetLength',s.programMeta?.sheetLength||1200],['p3SheetLength',s.programMeta?.sheetLength||1200],['progBendLength',s.programMeta?.bendLength||1000],['p2BendLength',s.programMeta?.bendLength||1000],['p3BendLength',s.programMeta?.bendLength||1000],['progSheetWidth',s.programMeta?.sheetWidth||''],['p2SheetWidth',s.programMeta?.sheetWidth||''],['p3SheetWidth',s.programMeta?.sheetWidth||'']].forEach(a=>{const el=$(a[0]);if(el&&document.activeElement!==el)el.value=a[1]});['progSpecialGeometry','p2SpecialGeometry','p3SpecialGeometry'].forEach(id=>{const el=$(id);if(el&&document.activeElement!==el)el.checked=!!s.programMeta?.specialGeometry});
  document.querySelectorAll('[data-pp58-sync-status]').forEach(el=>el.textContent='Sincronización activa · '+(s.bends?.length||0)+' tramos · '+s.project.material+' · '+s.project.thickness+' mm · '+new Date().toLocaleTimeString('es-ES'));
 }catch(e){console.warn('Sincronización de módulos',e)}
}
function hookSync(){
 if(typeof window.syncAll==='function'&&!window.syncAll.__pp58){const old=window.syncAll;const fn=function(){const r=old.apply(this,arguments);syncLinked();try{drawTool()}catch(e){}try{drawTwin(performance.now())}catch(e){}try{drawPhysicalBend()}catch(e){}return r};fn.__pp58=true;window.syncAll=fn}
}
function addSync(){
 ['program','program2d','program3d','sim2d','sim3d','development','curve','vcompare','collisions'].forEach(id=>{const p=$(id);if(!p||p.querySelector('[data-pp58-sync-status]'))return;const el=document.createElement('div');el.id='pp58SyncStatus-'+id;el.dataset.pp58SyncStatus='true';el.className='pp58status';el.style.margin='10px 0';el.textContent='Sincronización compartida de pieza';const host=p.querySelector('.grid,.split')||p.firstElementChild;if(host)host.insertBefore(el,host.firstChild)});
 const fields={progMaterial:'material',p2Material:'material',p3Material:'material',progThickness:'thickness',p2Thickness:'thickness',p3Thickness:'thickness',progSheetLength:'sheetLength',p2SheetLength:'sheetLength',p3SheetLength:'sheetLength',progBendLength:'bendLength',p2BendLength:'bendLength',p3BendLength:'bendLength',progSheetWidth:'sheetWidth',p2SheetWidth:'sheetWidth',p3SheetWidth:'sheetWidth',progSpecialGeometry:'specialGeometry',p2SpecialGeometry:'specialGeometry',p3SpecialGeometry:'specialGeometry'};
 let pending=false;document.addEventListener('input',e=>{const el=e.target;if(!el?.id||!fields[el.id])return;const s=S();if(!s)return;const key=fields[el.id],v=key==='specialGeometry'?!!el.checked:el.value;if(key==='material')s.project.material=v;if(key==='thickness')s.project.thickness=Math.max(.1,Number(String(v).replace(',','.'))||1);if(key==='sheetLength'){s.programMeta=s.programMeta||{};s.programMeta.sheetLength=Math.max(1,Number(String(v).replace(',','.'))||1200)}if(key==='bendLength'){s.programMeta=s.programMeta||{};s.programMeta.bendLength=Math.max(1,Number(String(v).replace(',','.'))||1000)}if(key==='sheetWidth'){s.programMeta=s.programMeta||{};s.programMeta.sheetWidth=String(v).trim()?Math.max(1,Number(String(v).replace(',','.'))||1):null}if(key==='specialGeometry'){s.programMeta=s.programMeta||{};s.programMeta.specialGeometry=!!v}if(!pending){pending=true;requestAnimationFrame(()=>{pending=false;syncLinked();if(typeof drawAll==='function')drawAll()})}},true);
 document.addEventListener('change',e=>{if(!e.target?.id||!fields[e.target.id])return;setTimeout(()=>{try{if(typeof window.syncAll==='function')window.syncAll();if(typeof window.autoSave==='function')window.autoSave()}catch(e){}},0)},true);
}
function init(){if(!$('settings')||!$('tooling'))return;style();addMachine();window.setTimeout(addMachine,500);addPhysicalBendSimulation();addToolDetail();addDatabase();addOffice();addSettings();addSync();hookSync();syncLinked();window.PLEGAR_PRO_V58={audit:()=>({version:'58.0',tools:T().length,modules:['program','program2d','program3d','sim2d','sim3d','development','curve','vcompare','collisions','tooling','office','settings'].filter(id=>!!$(id)),sync:!!window.syncAll?.__pp58}),refresh:()=>{hookSync();syncLinked();window.syncAll?.();drawTool();drawTwin(performance.now());drawPhysicalBend()}};document.documentElement.dataset.ppVersion='58.0'}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,650),{once:true});else setTimeout(init,650);
window.addEventListener('pageshow',()=>setTimeout(()=>{if(!$('pp58Twin')){addMachine();window.setTimeout(addMachine,500);window.setTimeout(addMachine,1400)}else{const card=$('pp58TwinCard');if(card){card.style.display='';card.hidden=false;card.removeAttribute('aria-hidden')}const stage=$('pp55MachineCanvas')?.closest('.pp55-stage');if(stage)stage.style.display='none';hookSync();syncLinked();drawTool();drawTwin(performance.now());addPhysicalBendSimulation();drawPhysicalBend()}},450));
// Recuperación de arranque: PP55 puede montar la tarjeta base después del primer init.
let machineBootAttempts=0,machineObserver=null,machineRetryTimer=0;
function ensureMachine(){
  addMachine();
  const card=$('pp58TwinCard'),canvas=$('pp58Twin');
  if(card&&canvas){
    card.style.display='';card.hidden=false;card.removeAttribute('aria-hidden');
    if(!paused&&!raf)runTwin();
    if(machineObserver){machineObserver.disconnect();machineObserver=null;}
    if(machineRetryTimer){clearTimeout(machineRetryTimer);machineRetryTimer=0;}
    return;
  }
  if(machineBootAttempts++<24)machineRetryTimer=window.setTimeout(ensureMachine,400);
}
function watchMachineMount(){
  ensureMachine();
  if(!$('pp58TwinCard')&&'MutationObserver'in window&&!machineObserver){
    machineObserver=new MutationObserver(()=>{
      if($('pp55MachineCanvas'))ensureMachine();
    });
    machineObserver.observe(document.body,{childList:true,subtree:true});
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>window.setTimeout(watchMachineMount,900),{once:true});else window.setTimeout(watchMachineMount,900);
window.addEventListener('pp:boot-complete',()=>window.setTimeout(watchMachineMount,250));
})();