(function(){
'use strict';
/* PP65 Expert Engineering Kernel — independent, testable calculations and visualization.
   All lengths are millimetres; this module does not certify a CNC program. */
const VERSION='65.1';
const finite=(n,name)=>{const v=Number(n);if(!Number.isFinite(v))throw new TypeError(name+' must be finite');return v};
const positive=(n,name,allowZero=false)=>{const v=finite(n,name);if(allowZero?v<0:v<=0)throw new RangeError(name+(allowZero?' must be >= 0':' must be > 0'));return v};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function bendAllowance({thickness,insideRadius,angleDeg,kFactor=0.33}){
 const t=positive(thickness,'thickness'),r=positive(insideRadius,'insideRadius',true),a=finite(angleDeg,'angleDeg'),k=finite(kFactor,'kFactor');
 if(a<=0||a>180)throw new RangeError('angleDeg must be in (0,180]');
 if(k<0||k>1)throw new RangeError('kFactor must be between 0 and 1');
 return (Math.PI*a/180)*(r+k*t);
}
function bendDeduction({thickness,insideRadius,angleDeg,kFactor=0.33}){
 const t=positive(thickness,'thickness'),r=positive(insideRadius,'insideRadius',true),a=finite(angleDeg,'angleDeg');
 if(a<=0||a>180)throw new RangeError('angleDeg must be in (0,180]');
 const outsideSetback=(r+t)*Math.tan((Math.PI*a/180)/2);
 return 2*outsideSetback-bendAllowance({thickness:t,insideRadius:r,angleDeg:a,kFactor});
}
function flatLength({straightLengths, bends, unit='mm'}){
 if(unit!=='mm')throw new RangeError('Only millimetres are accepted');
 if(!Array.isArray(straightLengths)||!Array.isArray(bends))throw new TypeError('straightLengths and bends must be arrays');
 const straights=straightLengths.reduce((s,v)=>s+positive(v,'straight length',true),0);
 const deductions=bends.reduce((s,b)=>s+bendDeduction(b),0);
 const result=straights-deductions;
 if(result<=0)throw new RangeError('Computed flat length is not positive; verify dimension convention and bend data');
 return {valueMm:result,straightTotalMm:straights,totalBendDeductionMm:deductions,unit:'mm',method:'sum of supplied outside straight lengths minus bend deductions',estimated:true};
}
function pressForce({tensileStrengthMPa=450,thickness,foldLengthMm,dieOpeningMm,angleDeg=90,factor=1.42}){
 const Rm=positive(tensileStrengthMPa,'tensileStrengthMPa'),t=positive(thickness,'thickness'),L=positive(foldLengthMm,'foldLengthMm'),V=positive(dieOpeningMm,'dieOpeningMm'),f=positive(factor,'factor');
 const a=finite(angleDeg,'angleDeg');if(a<=0||a>180)throw new RangeError('angleDeg must be in (0,180]');
 // Conventional air-bending estimate. Output is not a machine-specific force rating.
 const kN=f*Rm*L*t*t/V/1000;
 return {kN,tonnesForce:kN/9.80665,method:'air-bending estimate: factor × Rm × L × t² / V',inputs:{tensileStrengthMPa:Rm,thicknessMm:t,foldLengthMm:L,dieOpeningMm:V,angleDeg:a},estimated:true,warning:'Confirm material data, tooling chart, machine load limits and load distribution before use.'};
}
function validateDimensions(d){
 const errors=[],warnings=[];
 const t=Number(d.thickness),r=Number(d.insideRadius),v=Number(d.dieOpeningMm),L=Number(d.foldLengthMm),capacity=Number(d.machineCapacityTonnes);
 if(!Number.isFinite(t)||t<=0)errors.push('Espesor debe ser mayor que cero.');
 if(!Number.isFinite(r)||r<0)errors.push('Radio interior debe ser cero o positivo.');
 if(!Number.isFinite(v)||v<=0)errors.push('Abertura V debe ser mayor que cero.');
 if(!Number.isFinite(L)||L<=0)errors.push('Longitud de plegado debe ser mayor que cero.');
 if(Number.isFinite(t)&&Number.isFinite(v)&&t>0&&v>0&&(v/t<4||v/t>12))warnings.push('Relación V/espesor fuera del intervalo orientativo 4–12; revisar tabla del material y utillaje.');
 if(Number.isFinite(r)&&Number.isFinite(t)&&t>0&&r<t*.5)warnings.push('Radio interior inferior a 0,5×espesor: verificar capacidad real de material y punzón.');
 let force=null;
 if(!errors.length&&Number.isFinite(Number(d.tensileStrengthMPa))&&Number.isFinite(capacity)&&capacity>0){
  force=pressForce({tensileStrengthMPa:d.tensileStrengthMPa,thickness:t,foldLengthMm:L,dieOpeningMm:v,angleDeg:d.angleDeg||90});
  if(force.tonnesForce>capacity)errors.push('La fuerza estimada supera la capacidad nominal indicada de la máquina.');
  else if(force.tonnesForce>capacity*.8)warnings.push('La fuerza estimada supera el 80 % de la capacidad nominal; confirmar carga por metro y distribución.');
 }
 return {valid:errors.length===0,errors,warnings,force,classification:errors.length?'BLOCKED':warnings.length?'REVIEW':'PRELIMINARY_OK',certified:false};
}
function aabb(mesh){
 if(!mesh||!Array.isArray(mesh.vertices)||!mesh.vertices.length)return null;
 const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(const p of mesh.vertices){if(!Array.isArray(p)||p.length<3||p.some(v=>!Number.isFinite(v)))return null;for(let i=0;i<3;i++){min[i]=Math.min(min[i],p[i]);max[i]=Math.max(max[i],p[i]);}}
 return {min,max};
}
function aabbIntersection(a,b,epsilon=1e-6){
 const A=aabb(a),B=aabb(b);if(!A||!B)return {valid:false,intersects:false,reason:'invalid mesh'};
 const overlap=A.min.map((v,i)=>Math.min(A.max[i],B.max[i])-Math.max(v,B.min[i]));
 const intersects=overlap.every(v=>v>epsilon);
 return {valid:true,intersects,touching:!intersects&&overlap.every(v=>v>=-epsilon),overlapMm:overlap,method:'axis-aligned bounding box broad phase',certified:false};
}
function project([x,y,z],w,h,rot,pitch,scale){
 const xr=x*Math.cos(rot)-z*Math.sin(rot),zr=x*Math.sin(rot)+z*Math.cos(rot);
 const yr=y*Math.cos(pitch)-zr*Math.sin(pitch),depth=y*Math.sin(pitch)+zr*Math.cos(pitch);
 const perspective=clamp(900/(900+depth),.45,1.8);
 return [w*.5+xr*scale*perspective,h*.55-yr*scale*perspective];
}
function drawWireframe(canvas,opts={}){
 if(!canvas||typeof canvas.getContext!=='function')return false;
 const ctx=canvas.getContext('2d');if(!ctx)return false;
 const w=Math.max(1,canvas.clientWidth||canvas.width||600),h=Math.max(1,Math.min(460,w*.58));
 const dpr=clamp(Number(opts.dpr)||1,1,2);
 canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);canvas.style.width='100%';canvas.style.height='auto';ctx.scale(dpr,dpr);
 ctx.clearRect(0,0,w,h);
 const rot=Number(opts.rotation)||0,pitch=Number(opts.pitch)||-.2,scale=Number(opts.scale)||.75;
 ctx.fillStyle='#071a2b';ctx.fillRect(0,0,w,h);
 ctx.strokeStyle='rgba(66,194,229,.10)';ctx.lineWidth=1;
 for(let x=w%28;x<w;x+=28){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}
 for(let y=h%28;y<h;y+=28){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
 const line=(points,color,width=1.8)=>{ctx.beginPath();points.forEach((p,i)=>{const q=project(p,w,h,rot,pitch,scale);if(i)ctx.lineTo(q[0],q[1]);else ctx.moveTo(q[0],q[1])});ctx.closePath();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()};
 const depth=115,half=205;
 // Sheet section: open U profile extruded in Z; schematic geometry only.
 const section=[[-half,0],[half,0],[half,150],[half-22,150],[half-22,22],[-half+22,22],[-half+22,150],[-half,150]];
 for(const z of [-depth,depth])line(section.map(p=>[p[0],p[1],z]),'#4bd8f4',2);
 for(let i=0;i<section.length;i++){const a=section[i],b=section[(i+1)%section.length];line([[a[0],a[1],-depth],[b[0],b[1],-depth],[b[0],b[1],depth],[a[0],a[1],depth]],'#4bd8f4',1)}
 // Punch and die wireframe blocks, separated from sheet for visual inspection.
 line([[-120,225,-75],[120,225,-75],[120,270,-75],[-120,270,-75]],'#ffb84a',2);
 line([[-120,225,75],[120,225,75],[120,270,75],[-120,270,75]],'#ffb84a',2);
 for(const x of [-120,120])for(const z of [-75,75])line([[x,225,z],[x,270,z]],'#ffb84a',1);
 line([[-155,-70,-95],[155,-70,-95],[155,-35,-95],[-155,-35,-95]],'#b59bff',2);
 line([[-155,-70,95],[155,-70,95],[155,-35,95],[-155,-35,95]],'#b59bff',2);
 for(const x of [-155,155])for(const z of [-95,95])line([[x,-70,z],[x,-35,z]],'#b59bff',1);
 ctx.fillStyle='#d9f7ff';ctx.font='700 11px system-ui';ctx.fillText('PP65 · VISTA HOLOGRÁFICA WIREFRAME',14,20);
 ctx.fillStyle='#83a9bd';ctx.font='11px system-ui';ctx.fillText('Chapa cian · punzón ámbar · matriz violeta · geometría esquemática',14,h-14);
 return true;
}
function mount(){
 const page=document.querySelector('.page#collisions');if(!page||document.getElementById('pp65-expert-card'))return;
 const host=page.querySelector('.grid')||page;
 const card=document.createElement('section');card.className='card c12';card.id='pp65-expert-card';
 card.innerHTML='<style>#pp65-expert-card{grid-column:1/-1;min-width:0;background:linear-gradient(145deg,#f5fbff,#e8f5fb);border:1px solid #c8e0ed;color:#173246}#pp65-expert-card .pp65-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(135px,1fr));gap:10px}#pp65-expert-card label{display:block;font-size:12px;font-weight:700;margin-bottom:5px;color:#36566b}#pp65-expert-card input,#pp65-expert-card select{width:100%;min-height:40px;background:#fff;color:#173246;border:1px solid #bfd2df;border-radius:8px;padding:8px}#pp65-expert-card .pp65-metric{border:1px solid #c8e0ed;background:#fff;border-radius:10px;padding:10px;min-width:0}#pp65-expert-card .pp65-metric span{display:block;color:#60798a;font-size:11px}#pp65-expert-card .pp65-metric b{display:block;margin-top:5px;font-size:18px;overflow-wrap:anywhere}#pp65-expert-card .pp65-status{margin-top:12px;border-radius:10px;padding:10px;background:#e3f5fb;border:1px solid #b6dce9;font-weight:700}#pp65-expert-card .pp65-status.warn{background:#fff2d8;border-color:#eed08a;color:#79510b}#pp65-expert-card .pp65-status.bad{background:#fde8e8;border-color:#efb1b1;color:#8d2020}#pp65-expert-card canvas{display:block;width:100%;border-radius:12px;touch-action:pan-y}#pp65-expert-card .pp65-hint{font-size:12px;line-height:1.5;color:#5b7485}@media(max-width:480px){#pp65-expert-card .pp65-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}</style><div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><small style="letter-spacing:.13em;font-weight:900;color:#087ea4">PP65 · ENGINEERING KERNEL</small><h2 style="margin:5px 0">Motores expertos de cálculo, 3D y holograma</h2></div><span style="background:#d8f1fa;border-radius:999px;padding:6px 10px;font-size:12px;font-weight:800">Cálculo verificable · visualización orientativa</span></div><div class="pp65-grid" style="margin:14px 0"><div><label for="pp65-t">Espesor (mm)</label><input id="pp65-t" type="number" min=".1" step=".1" value="2"></div><div><label for="pp65-r">Radio interior (mm)</label><input id="pp65-r" type="number" min="0" step=".1" value="2"></div><div><label for="pp65-a">Ángulo de plegado (°)</label><input id="pp65-a" type="number" min="1" max="180" step="1" value="90"></div><div><label for="pp65-k">Factor K calibrado</label><input id="pp65-k" type="number" min="0" max="1" step=".01" value=".33"></div><div><label for="pp65-v">Abertura V (mm)</label><input id="pp65-v" type="number" min="1" step="1" value="16"></div><div><label for="pp65-l">Longitud plegado (mm)</label><input id="pp65-l" type="number" min="1" step="1" value="1000"></div><div><label for="pp65-rm">Resistencia Rm (MPa)</label><input id="pp65-rm" type="number" min="1" step="10" value="450"></div><div><label for="pp65-cap">Capacidad máquina (t)</label><input id="pp65-cap" type="number" min="1" step="5" value="85"></div></div><div class="pp65-grid" id="pp65-metrics"><div class="pp65-metric"><span>BA estimado</span><b id="pp65-ba">—</b></div><div class="pp65-metric"><span>BD estimado</span><b id="pp65-bd">—</b></div><div class="pp65-metric"><span>Fuerza estimada</span><b id="pp65-force">—</b></div><div class="pp65-metric"><span>Relación V/t</span><b id="pp65-vt">—</b></div></div><div id="pp65-status" class="pp65-status" role="status" aria-live="polite">Calculando comprobaciones…</div><h3 style="margin:18px 0 8px">Vista holográfica técnica 3D</h3><canvas id="pp65-canvas" width="800" height="460" aria-label="Vista 3D wireframe esquemática de chapa, punzón y matriz"></canvas><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="btn secondary" type="button" id="pp65-rotate">Girar vista</button><button class="btn secondary" type="button" id="pp65-reset">Restablecer vista</button></div><p class="pp65-hint">La visualización wireframe es una ayuda de inspección, no una holografía física ni un gemelo CAD certificado. BA/BD y tonelaje son estimaciones: valida el factor K con una probeta medida, las tablas del material y utillaje, la carga por metro y los límites del fabricante antes de fabricar.</p>';
 host.appendChild(card);
 const $=id=>document.getElementById(id),number=id=>Number($(id).value);let rot=.35,pitch=-.2,scale=.75;
 function calc(){
  try{
   const d={thickness:number('pp65-t'),insideRadius:number('pp65-r'),angleDeg:number('pp65-a'),kFactor:number('pp65-k')};
   const ba=bendAllowance(d),bd=bendDeduction(d),force=pressForce({thickness:d.thickness,insideRadius:d.insideRadius,angleDeg:d.angleDeg,kFactor:d.kFactor,tensileStrengthMPa:number('pp65-rm'),foldLengthMm:number('pp65-l'),dieOpeningMm:number('pp65-v')});
   $('pp65-ba').textContent=ba.toFixed(3)+' mm';$('pp65-bd').textContent=bd.toFixed(3)+' mm';$('pp65-force').textContent=force.tonnesForce.toFixed(2)+' t';$('pp65-vt').textContent=(number('pp65-v')/d.thickness).toFixed(2);
   const result=validateDimensions({thickness:d.thickness,insideRadius:d.insideRadius,dieOpeningMm:number('pp65-v'),foldLengthMm:number('pp65-l'),tensileStrengthMPa:number('pp65-rm'),machineCapacityTonnes:number('pp65-cap'),angleDeg:d.angleDeg});
   const el=$('pp65-status');el.className='pp65-status'+(result.errors.length?' bad':result.warnings.length?' warn':'');
   el.textContent=result.errors.length?'BLOQUEADO · '+result.errors.join(' '):result.warnings.length?'REVISAR · '+result.warnings.join(' '):'REVISIÓN PRELIMINAR · sin alertas en las reglas básicas; no es una aprobación de fabricación.';
  }catch(e){$('pp65-status').className='pp65-status bad';$('pp65-status').textContent='ENTRADA NO VÁLIDA · '+e.message;['pp65-ba','pp65-bd','pp65-force','pp65-vt'].forEach(id=>$(id).textContent='—')}
 }
 ['pp65-t','pp65-r','pp65-a','pp65-k','pp65-v','pp65-l','pp65-rm','pp65-cap'].forEach(id=>$(id).addEventListener('input',calc));
 $('pp65-rotate').addEventListener('click',()=>{rot+=.45;pitch=clamp(pitch+.08,-.9,.9);drawWireframe($('pp65-canvas'),{rotation:rot,pitch,scale})});
 $('pp65-reset').addEventListener('click',()=>{rot=.35;pitch=-.2;scale=.75;drawWireframe($('pp65-canvas'),{rotation:rot,pitch,scale})});
 let drag=null;
 $('pp65-canvas').addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY};$('pp65-canvas').setPointerCapture?.(e.pointerId)});
 $('pp65-canvas').addEventListener('pointermove',e=>{if(!drag)return;rot+=(e.clientX-drag.x)*.012;pitch=clamp(pitch+(e.clientY-drag.y)*.008,-1,1);drag={x:e.clientX,y:e.clientY};drawWireframe($('pp65-canvas'),{rotation:rot,pitch,scale})});
 ['pointerup','pointercancel','lostpointercapture'].forEach(ev=>$('pp65-canvas').addEventListener(ev,()=>drag=null));
 calc();drawWireframe($('pp65-canvas'),{rotation:rot,pitch,scale});
}
const api={VERSION,bendAllowance,bendDeduction,flatLength,pressForce,validateDimensions,aabb,aabbIntersection,drawWireframe};
if(typeof window!=='undefined'){window.PP65ExpertEngines=api;const start=()=>{try{mount()}catch(e){console.error('[PP65] Mount failed',e)}};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();}
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})();