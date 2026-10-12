/* Plegar Pro v61 — integridad de módulos, sincronización compartida y diagnóstico de reproducción. */
(function(){
  'use strict';
  if(window.PLEGAR_PRO_V61?.installed)return;
  const $=id=>document.getElementById(id);
  let installed=false, syncing=false, timer=0, lastFingerprint='', syncCount=0, externalChanges=0;
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
  function activeEditor(){
    const el=document.activeElement;
    return !!el&&(/^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName)||el.isContentEditable);
  }
  function updateStatus(message){
    document.querySelectorAll('#pp58SyncStatus').forEach(el=>{
      const s=getState();
      el.textContent=message||('Sincronización verificada · '+(s?.bends?.length||0)+' tramos · '+(s?.project?.material||'—')+' · '+(s?.project?.thickness??'—')+' mm');
      el.dataset.syncOk='true';
    });
  }
  function synchronize(reason){
    if(syncing||activeEditor())return false;
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
    installSyncHook();
    lastFingerprint=fingerprint();
    document.addEventListener('focusout',()=>window.setTimeout(()=>{if(fingerprint()!==lastFingerprint)synchronize('editor-blur')},60),true);
    document.addEventListener('change',e=>{
      if(!e.target?.matches?.('input,select,textarea'))return;
      window.setTimeout(()=>{if(fingerprint()!==lastFingerprint)synchronize('field-change')},0);
    },true);
    window.addEventListener('pageshow',()=>window.setTimeout(()=>synchronize('pageshow'),250));
    window.addEventListener('plegarpro:state-changed',()=>synchronize('state-event'));
    window.setInterval(check,650);
    window.PLEGAR_PRO_V61={
      installed:true,
      refresh:()=>synchronize('manual'),
      audit:()=>({installed:true,stateAvailable:!!getState(),syncFunction:typeof window.syncAll==='function',fingerprint:!!fingerprint(),playback:auditPlayback()}),
      playback:auditPlayback
    };
    updateStatus();
    console.info('[Plegar Pro Runtime] Guardián de sincronización instalado.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>window.setTimeout(init,1800),{once:true});
  else window.setTimeout(init,1800);
})();
