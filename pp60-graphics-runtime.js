/* Plegar Pro · Graphics Runtime v1.0
   Non-destructive graphics reliability, responsive rendering and motion polish. */
(function(){
'use strict';
if(window.PLEGAR_PRO_GRAPHICS&&window.PLEGAR_PRO_GRAPHICS.ready)return;
const reduced=()=>window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const stats={ready:false,version:'1.0',canvases:0,webgl:0,resizeEvents:0,contextLosses:0,lastRefresh:0};
function addStyle(){
 if(document.getElementById('pp60-graphics-runtime-style'))return;
 const s=document.createElement('style');s.id='pp60-graphics-runtime-style';
 s.textContent=`
 :root{--pp-motion-fast:160ms;--pp-motion-mid:260ms;--pp-glow:rgba(55,205,255,.22)}
 button,.nav button,.sidebar button,.menu button{transition:transform var(--pp-motion-fast) ease,box-shadow var(--pp-motion-fast) ease,filter var(--pp-motion-fast) ease}
 button:hover,.nav button:hover,.sidebar button:hover,.menu button:hover{filter:brightness(1.08)}
 button:active,.nav button:active,.sidebar button:active,.menu button:active{transform:translateY(1px)}
 canvas{max-width:100%;touch-action:pan-y}
 canvas:focus-visible{outline:2px solid #48d8ff;outline-offset:3px}
 .pp60-rendering{position:relative}
 .pp60-rendering:after{content:"";position:absolute;inset:0;pointer-events:none;border-radius:inherit;box-shadow:inset 0 0 0 1px rgba(72,216,255,.12)}
 @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.01ms!important}}
 @media(max-width:760px){canvas{touch-action:pan-y pinch-zoom}}
 `;
 document.head.appendChild(s);
}
function refreshRenderers(){
 stats.lastRefresh=Date.now();
 try{window.dispatchEvent(new Event('resize'));}catch(e){}
 ['drawCollision','drawAll','draw','renderProg','syncAll'].forEach(n=>{
  try{if(typeof window[n]==='function')window[n]();}catch(e){}
 });
 try{
  document.querySelectorAll('canvas').forEach(c=>{
   const gl=c.getContext('webgl2')||c.getContext('webgl')||c.getContext('experimental-webgl');
   if(gl&&gl.getExtension){stats.webgl++;const ext=gl.getExtension('WEBGL_lose_context');if(ext&&gl.isContextLost())stats.contextLosses++;}
  });
 }catch(e){}
}
function observeCanvas(c){
 if(c.dataset.pp60Observed)return;c.dataset.pp60Observed='1';stats.canvases++;
 c.classList.add('pp60-rendering');
 c.addEventListener('webglcontextlost',e=>{stats.contextLosses++;console.warn('[Plegar Pro Graphics] Contexto WebGL perdido; se intentará recuperar.');},false);
 c.addEventListener('webglcontextrestored',()=>{setTimeout(refreshRenderers,100);},false);
 if('ResizeObserver'in window){
  let pending=false;
  new ResizeObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;stats.resizeEvents++;try{window.dispatchEvent(new Event('resize'));}catch(e){}});}).observe(c.parentElement||c);
 }
}
function tuneKnownRenderers(){
 // Tune already-instantiated renderers only; never replaces the project's 2D/CAD engine.
 ['renderer','webglRenderer','threeRenderer','ppRenderer'].forEach(k=>{
  try{const r=window[k];if(r&&typeof r.setPixelRatio==='function')r.setPixelRatio(Math.min(window.devicePixelRatio||1,2));if(r&&typeof r.setSize==='function'&&r.domElement){const p=r.domElement.parentElement;if(p&&p.clientWidth&&p.clientHeight)r.setSize(p.clientWidth,p.clientHeight,false);}}catch(e){}
 });
}
function init(){
 addStyle();document.querySelectorAll('canvas').forEach(observeCanvas);
 if('MutationObserver'in window)new MutationObserver(ms=>{for(const m of ms){m.addedNodes&&m.addedNodes.forEach(n=>{if(n.nodeType!==1)return;if(n.matches&&n.matches('canvas'))observeCanvas(n);n.querySelectorAll&&n.querySelectorAll('canvas').forEach(observeCanvas);});}}).observe(document.body,{childList:true,subtree:true});
 tuneKnownRenderers();setTimeout(refreshRenderers,350);setTimeout(()=>{document.querySelectorAll('canvas').forEach(observeCanvas);tuneKnownRenderers();},1800);
 stats.ready=true;window.PLEGAR_PRO_GRAPHICS=Object.assign(stats,{refresh:refreshRenderers,diagnostics:()=>({...stats,canvasCount:document.querySelectorAll('canvas').length,reducedMotion:reduced(),dpr:window.devicePixelRatio||1,webglAvailable:(()=>{try{const c=document.createElement('canvas');return !!(c.getContext('webgl2')||c.getContext('webgl'));}catch(e){return false}})()})});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.addEventListener('pageshow',()=>setTimeout(refreshRenderers,250));
window.addEventListener('orientationchange',()=>setTimeout(refreshRenderers,350));
})();
