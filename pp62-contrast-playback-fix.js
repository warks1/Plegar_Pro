/* Plegar Pro PP62 — corrección de contraste y guardián de reproducción.
   Mantiene la geometría paramétrica existente; no convierte el motor en CAD de sólidos certificado. */
(function(){
 'use strict';
 if(window.PLEGAR_PRO_PP62?.installed)return;
 let css=`
 /* Los formularios añadidos dinámicamente ya no usan paneles azul marino con texto de bajo contraste. */
 html body .page .pp-module-form,
 html body .page [class*="pp56-rail"],
 html body .page [class*="pp56-readout"],
 html body .page [class*="pp56-controls"] > div,
 html body .page [class*="pp56-data"] > div,
 html body .page [class*="pp56-metric"],
 html body .page [class*="pp56-kpi"],
 html body .page [class*="pp58readout"],
 html body .page [class*="pp58metric"],
 html body .page [class*="pp58status"] {
   background:#f2f7fa!important;
   background-image:linear-gradient(145deg,#fff,#edf5f9)!important;
   color:#183448!important;
   border-color:#c5d9e4!important;
   text-shadow:none!important;
 }
 html body .page .pp-module-form *,
 html body .page [class*="pp56-rail"] *,
 html body .page [class*="pp56-readout"] *,
 html body .page [class*="pp56-controls"] > div *,
 html body .page [class*="pp56-data"] > div *,
 html body .page [class*="pp56-metric"] *,
 html body .page [class*="pp56-kpi"] *,
 html body .page [class*="pp58readout"] *,
 html body .page [class*="pp58metric"] *,
 html body .page [class*="pp58status"] * {
   color:#183448!important;
   text-shadow:none!important;
 }
 html body .page .pp-module-form button,
 html body .page [class*="pp56-rail"] button {
   color:#fff!important;background:linear-gradient(135deg,#075a78,#087fa4)!important;border-color:#087fa4!important;
 }
 html body .page .pp-module-form button.secondary {
   color:#183448!important;background:#dcecf4!important;border-color:#b9d2e1!important;
 }
 html body .page .pp-module-form input,
 html body .page .pp-module-form select,
 html body .page .pp-module-form textarea,
 html body .page [class*="pp56-rail"] input,
 html body .page [class*="pp56-rail"] select {
   color:#173246!important;background:#fff!important;border-color:#9fb9c9!important;
 }
 /* La cabecera HMI conserva su identidad industrial; el panel de lecturas se hace claro y legible. */
 html body #collisions .pp56-hmi-top,
 html body #collisions .pp56-hmi-top * {color:#f4fbff!important}
 html body #collisions .pp56-hmi-live {background:#14533e!important;color:#f4fbff!important}
 html body #collisions .pp56-hmi-live * {color:#f4fbff!important}
 html body #collisions .pp56-hmi-rail {background:linear-gradient(145deg,#f7fbfd,#eaf3f7)!important;color:#183448!important;border-color:#c5d9e4!important}
 html body #collisions .pp56-hmi-rail * {color:#183448!important}
 html body #collisions .pp56-readout {background:#fff!important;border-color:#c5d9e4!important}
 html body #collisions .pp56-readout small {color:#526f82!important}
 html body #collisions .pp56-readout b {color:#183448!important}
 /* PP73: corregir también los paneles anidados; no basta con aclarar el contenedor padre. */
 html body .page .pp-module-form [class*="card"],
 html body .page .pp-module-form [class*="panel"],
 html body .page .pp-module-form [class*="field"],
 html body .page .pp-module-form [class*="metric"],
 html body .page .pp-module-form [class*="kpi"],
 html body .page .pp-module-form [class*="readout"],
 html body .page [class*="pp-form-section"] [class*="card"],
 html body .page [class*="pp-form-section"] [class*="panel"],
 html body .page [class*="pp-form-section"] [class*="field"],
 html body .page [class*="pp-form-section"] [class*="metric"],
 html body .page [class*="pp-form-section"] [class*="kpi"],
 html body .page [class*="pp-module-panel"] [class*="card"],
 html body .page [class*="pp-module-panel"] [class*="panel"],
 html body .page [class*="pp-module-panel"] [class*="field"],
 html body .page [class*="pp-module-panel"] [class*="metric"],
 html body .page [class*="pp-module-panel"] [class*="kpi"],
 html body .page [class*="pp523-kpi"],
 html body .page [class*="pp523-detail"] > div,
 html body .page [class*="pp-library-summary"] > div {
   background:#f2f7fa!important;
   background-image:linear-gradient(145deg,#fff,#edf5f9)!important;
   color:#183448!important;
   border-color:#c5d9e4!important;
   text-shadow:none!important;
 }
 html body .page .pp-module-form [class*="card"] *,
 html body .page .pp-module-form [class*="panel"] *,
 html body .page .pp-module-form [class*="field"] *,
 html body .page .pp-module-form [class*="metric"] *,
 html body .page .pp-module-form [class*="kpi"] *,
 html body .page [class*="pp-form-section"] [class*="card"] *,
 html body .page [class*="pp-form-section"] [class*="panel"] *,
 html body .page [class*="pp-form-section"] [class*="field"] *,
 html body .page [class*="pp-form-section"] [class*="metric"] *,
 html body .page [class*="pp-form-section"] [class*="kpi"] *,
 html body .page [class*="pp-module-panel"] [class*="card"] *,
 html body .page [class*="pp-module-panel"] [class*="panel"] *,
 html body .page [class*="pp-module-panel"] [class*="field"] *,
 html body .page [class*="pp-module-panel"] [class*="metric"] *,
 html body .page [class*="pp-module-panel"] [class*="kpi"] *,
 html body .page [class*="pp523-kpi"] *,
 html body .page [class*="pp523-detail"] > div * ,
 html body .page [class*="pp-library-summary"] > div * {
   color:#183448!important;
   text-shadow:none!important;
 }
 /* PP72: contraste de los subpaneles creados por los módulos internos. */
 html body .page .pp-module-form,
 html body .page [class*="pp-form-section"],
 html body .page [class*="pp-form-tabs"],
 html body .page [class*="pp-module-panel"],
 html body .page [class*="pp-settings-card"],
 html body .page [class*="pp-control-card"],
 html body .page [class*="pp-field-card"] {
   background:#f2f7fa!important;
   background-image:linear-gradient(145deg,#fff,#edf5f9)!important;
   color:#183448!important;
   border-color:#c5d9e4!important;
   text-shadow:none!important;
 }
 html body .page .pp-module-form :not(button):not(input):not(select):not(textarea),
 html body .page [class*="pp-form-section"] :not(button):not(input):not(select):not(textarea),
 html body .page [class*="pp-module-panel"] :not(button):not(input):not(select):not(textarea),
 html body .page [class*="pp-settings-card"] :not(button):not(input):not(select):not(textarea),
 html body .page [class*="pp-control-card"] :not(button):not(input):not(select):not(textarea),
 html body .page [class*="pp-field-card"] :not(button):not(input):not(select):not(textarea) {
   color:#183448!important;
   text-shadow:none!important;
 }
 html body .page .pp-module-form button,
 html body .page [class*="pp-form-section"] button,
 html body .page [class*="pp-module-panel"] button {
   color:#fff!important;
   background:linear-gradient(135deg,#075a78,#087fa4)!important;
 }
 `;
 /* PP62.2: neutralizar tarjetas oscuras anidadas que dejan texto ilegible en los módulos técnicos. */
 css += `
 html body .page .card:not(.pp56-hmi-top):not(.pp56-hmi-live),
 html body .page .panel:not(.pp56-hmi-top):not(.pp56-hmi-live),
 html body .page .note,
 html body .page [class*="readout"]:not(.pp56-hmi-live),
 html body .page [class*="metric"]:not(.pp56-hmi-live),
 html body .page [class*="kpi"]:not(.pp56-hmi-live),
 html body .page [class*="data-box"],
 html body .page [class*="info-box"] {
   background-color:#f2f7fa!important;
   background-image:linear-gradient(145deg,#fff,#edf5f9)!important;
   color:#183448!important;
   border-color:#c5d9e4!important;
   text-shadow:none!important;
 }
 html body .page .card:not(.pp56-hmi-top):not(.pp56-hmi-live) :not(button):not(input):not(select):not(textarea),
 html body .page .panel:not(.pp56-hmi-top):not(.pp56-hmi-live) :not(button):not(input):not(select):not(textarea),
 html body .page .note :not(button):not(input):not(select):not(textarea),
 html body .page [class*="readout"]:not(.pp56-hmi-live) :not(button):not(input):not(select):not(textarea),
 html body .page [class*="metric"]:not(.pp56-hmi-live) :not(button):not(input):not(select):not(textarea),
 html body .page [class*="kpi"]:not(.pp56-hmi-live) :not(button):not(input):not(select):not(textarea),
 html body .page [class*="data-box"] :not(button):not(input):not(select):not(textarea),
 html body .page [class*="info-box"] :not(button):not(input):not(select):not(textarea) {
   color:#183448!important;
   text-shadow:none!important;
 }
 html body .page .card button,
 html body .page .panel button,
 html body .page .note button {text-shadow:none!important}
 `;
 const style=document.createElement('style');style.id='pp62-contrast-playback-fix';style.textContent=css;document.head.appendChild(style);
 let syncing=false,lastStep=-1,ignoreCollisionEvent=false;
 const $=id=>document.getElementById(id);
 function getState(){try{return typeof state!=='undefined'?state:window.state||null}catch(e){return window.state||null}}
 function maxStep(source){const api=window.PLEGAR_PRO_COLLISIONS;const order=api?.getOrder?.();const st=getState();if(source==='collisions'&&Array.isArray(order)&&order.length)return order.length-1;return Math.max(0,(st?.bends?.length||0)-1)}
 function syncStep(detail){
   if(syncing||!detail)return;
   const s=getState();if(!s||!Array.isArray(s.bends)||!s.bends.length)return;
   syncing=true;
   try{
     const max=maxStep(detail.source),step=Math.max(0,Math.min(max,Number(detail.step)||0));
     const order=window.PLEGAR_PRO_COLLISIONS?.getOrder?.()||s.bendOrder||[];
     const fold=Number.isInteger(detail.foldIndex)?detail.foldIndex:(order[step]??step);
     if(typeof sim!=='undefined'&&sim){
       sim.s2Step=step;sim.s3Step=step;sim.p3Active=fold;
       if($('p3Active'))$('p3Active').value=String(fold);
       if(typeof drawAll==='function')drawAll();
     }
     const collision=$('pp56Step');
     if(detail.source!=='collisions'&&collision&&Number(collision.value)!==step&&window.PLEGAR_PRO_COLLISIONS?.setStep){
       ignoreCollisionEvent=true;
       window.PLEGAR_PRO_COLLISIONS.setStep(step);
     }
     const twin=$('pp59step');
     if(detail.source!=='pp59'&&twin&&twin.options.length){
       twin.value=String(Math.min(twin.options.length-1,step));
       twin.dispatchEvent(new Event('change',{bubbles:true}));
     }
     const travel=$('pp56Travel');
     if(travel&&detail.source!=='collisions')travel.value=detail.complete?'100':'0';
     lastStep=step;
   }catch(e){console.warn('[Plegar Pro PP62] No se pudo sincronizar el paso:',e)}
   finally{syncing=false}
 }
 window.addEventListener('plegarpro:playback-step',e=>{
   /* PP61 is the playback authority; PP62 must not write stale steps over it. */
   if(window.PLEGAR_PRO_V61?.installed)return;
   if(e.detail?.source==='collisions'&&ignoreCollisionEvent){ignoreCollisionEvent=false;return}
   requestAnimationFrame(()=>syncStep(e.detail))
 });
 window.addEventListener('plegarpro:state-changed',()=>{lastStep=-1});
 window.PLEGAR_PRO_PP62={installed:true,version:'62.3',contrastStyle:true,playbackGuard:true,audit:()=>({installed:true,step:lastStep,maxStep:maxStep(),bends:getState()?.bends?.length||0,collisionApi:!!window.PLEGAR_PRO_COLLISIONS?.setStep,sim2d:!!$('s2Play'),sim3d:!!$('s3Play')})};
 console.info('[Plegar Pro PP62] Contraste y sincronización de reproducción instalados.');
})();
