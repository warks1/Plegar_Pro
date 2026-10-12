/* Plegar Pro v61 — integridad de módulos, sincronización compartida y diagnóstico de reproducción. */
(function(){
  'use strict';
  if(window.PLEGAR_PRO_V61?.installed)return;
  const $=id=>document.getElementById(id);
  let installed=false, syncing=false, timer=0, lastFingerprint='', syncCount=0, externalChanges=0, lastSyncError='';
  const getState=()=>{try{return typeof state!=='undefined'?state:(window.state||null)}catch(e){return window.state||null}};
  function fingerprint(){
    const s=getState(); if(!s)return '';
    try{return JSON.stringify({
      project:s.project||{},
      bends:(s.bends||[]).map(b=>({leg:b.leg,angle:b.angle,radius:b.radius,v:b.v,punch:b.punch,die:b.die,direction:b.direction,material:b.material,thickness:b.thickness})),
      bendOrder:s.bendOrder||[],
      programMeta:s.programMeta||{},
      development:s.development?{thickness:s.development.thickness,material:s.development.material,kfactor:s.development.kfactor,bendLength:s.development.bendLength}:null
    })}catch(e){return ''}
  }
  function normalizeWorkspace(){
    const main=document.querySelector('main.main');
    if(!main)return;
    // All navigation pages are intended to be siblings directly inside the main workspace.
    document.querySelectorAll('section.page').forEach(page=>{
      if(page.parentElement!==main)main.appendChild(page);
    });
    const page=main.querySelector(':scope > section.page#program3d');
    const twin=$('pp59Twin');
    if(page&&twin&&!page.contains(twin)){
      const host=page.querySelector('.grid')||page;
      host.appendChild(twin);
    }
  }
  function activeEditor(){
    const el=document.activeElement;
    return !!el&&(/^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName)||el.isContentEditable);
  }
  function updateStatus(message){
    document.querySelectorAll('[data-pp58-sync-status]').forEach(el=>{
      const s=getState();
      el.textContent=message||('Sincronización verificada · '+(s?.bends?.length||0)+' tramos · '+(s?.project?.material||'—')+' · '+(s?.project?.thickness??'—')+' mm');
      el.dataset.syncOk='true';
    });
  }
  function synchronize(reason,force){
    if(syncing||(!force&&activeEditor()))return false;
    const fn=window.syncAll;
    if(typeof fn!=='function')return false;
    syncing=true;
    try{
      fn();
      lastFingerprint=fingerprint();
      syncCount++;
      updateStatus();
      window.dispatchEvent(new CustomEvent('plegarpro:modules-synchronized',{detail:{reason:reason||'state-change',count:syncCount}}));
      return true;
    }catch(error){
      lastSyncError=String(error?.stack||error);
      console.error('[Plegar Pro Runtime] Falló la sincronización compartida',error);
      updateStatus('Error de sincronización · revisa consola');
      return false;
    }finally{syncing=false}
  }
  function installSyncHook(){
    const fn=window.syncAll;
    if(typeof fn!=='function'||fn.__pp61)return;
    const wrapped=function(){
      const result=fn.apply(this,arguments);
      lastFingerprint=fingerprint();
      syncCount++;
      updateStatus();
      try{window.PLEGAR_PRO_COLLISIONS?.refresh?.()}catch(error){console.warn('[Plegar Pro Runtime] No se pudo refrescar colisiones tras sincronizar',error)}
      try{window.PLEGAR_PRO_V59?.refresh?.()}catch(error){console.warn('[Plegar Pro Runtime] No se pudo refrescar el gemelo tras sincronizar',error)}
      window.dispatchEvent(new CustomEvent('plegarpro:modules-synchronized',{detail:{reason:'syncAll',count:syncCount}}));
      return result;
    };
    wrapped.__pp61=true;
    window.syncAll=wrapped;
  }
  function auditPlayback(){
    const collision=$('pp56Play'), twin=$('pp58Pause'), machine=$('pp59play');
    return {
      collision:{present:!!collision,hasHandler:!!collision?.onclick,label:collision?.textContent?.trim()||''},
      machineTwin:{present:!!twin,hasHandler:!!twin?.onclick,label:twin?.textContent?.trim()||''},
      engineeringTwin:{present:!!machine,hasHandler:!!machine?.onclick,label:machine?.textContent?.trim()||''},
      canvases:[...document.querySelectorAll('#pp55MachineCanvas,#pp58Twin,#pp59canvas,#pp56Collision')].map(c=>({id:c.id,width:c.width,height:c.height,visible:c.getBoundingClientRect().width>0})),
      syncCount,externalChanges
    };
  }
  let syncingPlayback=false;
  function stopCompetingPlayback(source){
    if(source!=='s2'&&$('s2Play')?.dataset.playing==='true')$('s2Pause')?.click();
    if(source!=='s3'&&$('s3Play')?.dataset.playing==='true')$('s3Pause')?.click();
    if(source!=='collisions'&&$('pp56Play')?.textContent?.includes('Pausar'))$('pp56Play').click();
    if(source!=='pp59'&&$('pp59play')?.textContent?.includes('Pausar'))$('pp59play').click();
  }
  function syncPlaybackStep(detail){
    if(syncingPlayback||!detail)return;
    const source=String(detail.source||'');
    const s=getState(),bends=s?.bends||[];
    if(!bends.length)return;
    let pos=Math.max(0,Number(detail.step)||0);
    if(detail.complete)pos=Math.max(0,order.length-1);
    const order=Array.isArray(s?.bendOrder)&&s.bendOrder.length?s.bendOrder:[...bends.keys()].slice(0,Math.max(0,bends.length-1));
    const maxPos=Math.max(0,Math.min(Math.max(0,order.length-1),pos));
    const foldIndex=Number.isInteger(detail.foldIndex)?detail.foldIndex:(order[maxPos]??maxPos);
    const coreStep=detail.complete?Math.max(0,Math.min(Math.max(0,bends.length-1),maxPos+1)):((source==='s2'||source==='s3')?Math.max(0,Number(detail.step)||0):maxPos);
    syncingPlayback=true;
    try{
      if(typeof sim!=='undefined'&&sim){
        sim.s2Step=coreStep;sim.s3Step=coreStep;sim.p3Active=foldIndex;
        if($('p3Active'))$('p3Active').value=String(foldIndex);
        if(typeof drawAll==='function')drawAll();
      }
      const collisionStep=$('pp56Step');
      if(collisionStep&&source!=='collisions'&&Number(collisionStep.value)!==maxPos){
        collisionStep.value=String(maxPos);
        collisionStep.dispatchEvent(new Event('change',{bubbles:true}));
      }
      // The collision module's change handler also updates sim steps; reapply the originating step last
      // so a collision selector cannot overwrite a running 2D/3D playback tick.
      if(typeof sim!=='undefined'&&sim){sim.s2Step=coreStep;sim.s3Step=coreStep;sim.p3Active=foldIndex;if($('p3Active'))$('p3Active').value=String(foldIndex);if(typeof drawAll==='function')drawAll()}
      if(source==='s2'||source==='s3'){
        const travel=$('pp56Travel');
        if(travel)travel.value=(Number(detail.step)||0)>=order.length?'100':'0';
        try{window.PLEGAR_PRO_COLLISIONS?.refresh?.()}catch(e){}
      }
      const twinStep=$('pp59step');
      if(twinStep&&source!=='pp59'&&Number(twinStep.value)!==maxPos){
        twinStep.value=String(Math.min(Math.max(0,twinStep.options.length-1),maxPos));
        twinStep.dispatchEvent(new Event('change',{bubbles:true}));
      }
      lastFingerprint=fingerprint();
      window.dispatchEvent(new CustomEvent('plegarpro:modules-synchronized',{detail:{reason:'playback-step',source,step:maxPos,foldIndex}}));
    }catch(error){console.error('[Plegar Pro Runtime] Error al sincronizar el paso de reproducción',error)}
    finally{syncingPlayback=false}
  }
  function installPlaybackSync(){
    window.addEventListener('plegarpro:playback-start',e=>stopCompetingPlayback(String(e.detail?.source||'')));
    window.addEventListener('plegarpro:playback-step',e=>syncPlaybackStep(e.detail));
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden){
        if($('s2Play')?.dataset.playing==='true')$('s2Pause')?.click();
        if($('s3Play')?.dataset.playing==='true')$('s3Pause')?.click();
        if($('pp56Play')?.textContent?.includes('Pausar'))$('pp56Play').click();
      }
    });
  }
  function check(){
    installSyncHook();
    const next=fingerprint();
    if(!next){lastFingerprint='';return}
    if(!lastFingerprint){lastFingerprint=next;return}
    if(next!==lastFingerprint){
      externalChanges++;
      if(!activeEditor())synchronize('state-fingerprint');
    }
  }
  function init(){
    if(installed)return;
    if(!getState()||typeof window.syncAll!=='function'){timer=window.setTimeout(init,350);return}
    installed=true;
    normalizeWorkspace();
    window.setTimeout(normalizeWorkspace,700);
    window.setTimeout(normalizeWorkspace,1800);
    installSyncHook();
    installPlaybackSync();
    lastFingerprint=fingerprint();
    document.addEventListener('focusout',()=>window.setTimeout(()=>{if(fingerprint()!==lastFingerprint)synchronize('editor-blur')},60),true);
    document.addEventListener('change',e=>{
      if(!e.target?.matches?.('input,select,textarea'))return;
      window.setTimeout(()=>{if(fingerprint()!==lastFingerprint)synchronize('field-change')},0);
    },true);
    window.addEventListener('pageshow',()=>window.setTimeout(()=>{normalizeWorkspace();synchronize('pageshow')},250));
    window.addEventListener('plegarpro:state-changed',()=>synchronize('state-event'));
    window.setInterval(check,650);
    window.PLEGAR_PRO_V61={
      installed:true,
      refresh:()=>synchronize('manual',true),
      audit:()=>({installed:true,stateAvailable:!!getState(),syncFunction:typeof window.syncAll==='function',fingerprint:!!fingerprint(),syncing,syncCount,externalChanges,lastSyncError,playback:auditPlayback()}),
      workspace:{program3dIsMainPage:!!document.querySelector('main.main > section.page#program3d'),engineeringTwinMounted:!!document.querySelector('main.main > section.page#program3d #pp59Twin')},
      playback:auditPlayback
    };
    updateStatus();
    console.info('[Plegar Pro Runtime] Guardián de sincronización instalado.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>window.setTimeout(init,1800),{once:true});
  else window.setTimeout(init,1800);
})();
