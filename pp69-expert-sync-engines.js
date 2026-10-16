/* PP69 · Motores de sincronización experta entre módulos Plegar Pro.
 * Sin dependencia obligatoria de ningún módulo; contrato público y eventos versionados.
 * La geometría y las decisiones CNC siguen siendo responsabilidad de sus motores especializados.
 */
(function (root) {
  'use strict';
  const VERSION = '69.3';
  const FIELDS = Object.freeze(['material','thickness','bendLength','machine','bendOrder','activeStep']);
  const adapters = new Map();
  const listeners = new Set();
  const conflicts = [];
  let revision = 0, lastSignature = '', syncing = false;
  const now = () => Date.now();
  const safe = fn => { try { return fn(); } catch (_) { return undefined; } };
  function appState() {
    return safe(() => typeof state !== 'undefined' && state && typeof state === 'object' ? state : null) || root.PLEGAR_PRO_STATE || null;
  }
  function readFirst(obj, keys) {
    if (!obj) return undefined;
    for (const key of keys) if (obj[key] !== undefined && obj[key] !== null) return obj[key];
    return undefined;
  }
  function number(v) { const n = Number(v); return Number.isFinite(n) ? n : null; }
  function bendCount(s) {
    const a = s && Array.isArray(s.bends) ? s.bends : [];
    if (a.length) return Math.max(0, a.length - 1);
    const order = s && Array.isArray(s.bendOrder) ? s.bendOrder : [];
    return order.length;
  }
  function canonicalOrder(s = appState()) {
    const count = bendCount(s);
    if (!count) return [];
    const raw = s && Array.isArray(s.bendOrder) ? s.bendOrder : [];
    const out = [], seen = new Set();
    for (const value of raw) {
      const n = Number(value);
      if (Number.isInteger(n) && n >= 0 && n < count && !seen.has(n)) { seen.add(n); out.push(n); }
    }
    const rank = i => safe(() => root.PLEGAR_PRO_V54?.orderIndex?.(i));
    const remaining = Array.from({length:count}, (_,i)=>i).filter(i=>!seen.has(i));
    remaining.sort((a,b) => {
      const ra=number(rank(a)), rb=number(rank(b));
      return (ra===null?a:ra)-(rb===null?b:rb);
    });
    return out.concat(remaining).slice(0,count);
  }
  function snapshot() {
    const s=appState() || {};
    const machine = readFirst(s,['machine','machineId','selectedMachine']);
    const material = readFirst(s,['material','materialName','selectedMaterial']);
    const thickness = number(readFirst(s,['thickness','sheetThickness','selectedThickness']));
    const bendLength = number(readFirst(s,['bendLength','length','sheetLength']));
    const order=canonicalOrder(s);
    const activeStep=number(readFirst(s,['activeStep','currentStep','bendStep','stepIndex']));
    return Object.freeze({version:VERSION,revision,at:now(),machine:machine??null,material:material??null,thickness,bendLength,bendOrder:order,activeStep, bendCount:bendCount(s)});
  }
  function signature(s) { return JSON.stringify([s.machine,s.material,s.thickness,s.bendLength,s.bendOrder,s.activeStep,s.bendCount]); }
  function emit(type, detail) {
    const payload=Object.freeze({type,version:VERSION,revision,at:now(),...detail});
    if (typeof root.dispatchEvent==='function' && typeof root.CustomEvent==='function') safe(()=>root.dispatchEvent(new root.CustomEvent('plegarpro:sync',{detail:payload})));
    for(const fn of [...listeners]) safe(()=>fn(payload));
    return payload;
  }
  function register(id, adapter) {
    if(!id || !adapter || typeof adapter!=='object') throw new TypeError('Se requiere id y adaptador de módulo');
    adapters.set(String(id),adapter);
    safe(()=>adapter.apply?.(snapshot(),{source:'initialization',revision}));
    return () => adapters.delete(String(id));
  }
  function subscribe(fn) { if(typeof fn!=='function') throw new TypeError('El suscriptor debe ser una función');listeners.add(fn);return()=>listeners.delete(fn); }
  function publish(source, patch) {
    if(syncing) return {ok:false,reason:'reentrant-sync',revision};
    if(!patch || typeof patch!=='object') return {ok:false,reason:'invalid-patch',revision};
    const allowed={};
    for(const key of FIELDS) if(Object.prototype.hasOwnProperty.call(patch,key)) allowed[key]=patch[key];
    if(!Object.keys(allowed).length) return {ok:false,reason:'no-supported-fields',revision};
    const s=appState();
    if(!s) { conflicts.push({source,reason:'master-state-unavailable',at:now()});return {ok:false,reason:'master-state-unavailable',revision}; }
    syncing=true;
    const acceptedFields=[];
    try {
      for(const [key,value] of Object.entries(allowed)) {
        if(key==='bendOrder') {
          if(!Array.isArray(value)) return {ok:false,reason:'invalid-bend-order',revision};
          const n=bendCount(s), seen=new Set(), valid=[];
          for(const item of value) { const i=Number(item);if(Number.isInteger(i)&&i>=0&&i<n&&!seen.has(i)){seen.add(i);valid.push(i);} }
          for(let i=0;i<n;i++)if(!seen.has(i))valid.push(i);
          s.bendOrder=valid.slice(0,n);
          acceptedFields.push(key);
        } else if(key==='thickness'||key==='bendLength'||key==='activeStep') {
          const n=number(value);if(n===null) {conflicts.push({source,key,reason:'non-finite-number',at:now()});continue;}
          if(key==='thickness'&&n<=0||key==='bendLength'&&n<=0||key==='activeStep'&&n<0) {conflicts.push({source,key,reason:'out-of-range',value:n,at:now()});continue;}
          if(key==='activeStep') {
            const step=Math.min(bendCount(s),Math.max(0,Math.floor(n)));
            if('activeStep' in s)s.activeStep=step;else if('currentStep' in s)s.currentStep=step;else s.stepIndex=step;
          }
          else if(key==='bendLength') { if('bendLength' in s)s.bendLength=n;else if('length' in s)s.length=n;else s.bendLength=n; }
          else { if('thickness' in s)s.thickness=n;else if('sheetThickness' in s)s.sheetThickness=n;else s.thickness=n; }
          acceptedFields.push(key);
        } else if(key==='machine'||key==='material') {
          if(typeof value!=='string'||!value.trim()) {conflicts.push({source,key,reason:'invalid-value',at:now()});continue;}
          const aliases=key==='machine'?['machine','machineId','selectedMachine']:['material','materialName','selectedMaterial'];
          const target=aliases.find(name=>name in s)||key;
          s[target]=value.trim();
          acceptedFields.push(key);
        }
      }
      if(!acceptedFields.length)return {ok:false,reason:'no-valid-fields',revision};
      revision++;
      const snap=snapshot();
      for(const [id,adapter] of adapters) if(id!==String(source)) safe(()=>adapter.apply?.(snap,{source:String(source||'unknown'),revision}));
      emit('commit',{source:String(source||'unknown'),snapshot:snap,changed:acceptedFields.slice()});
      return {ok:true,revision,snapshot:snap};
    } finally { syncing=false; }
  }
  function check() {
    const snap=snapshot(), sig=signature(snap);
    if(sig===lastSignature)return;
    const previous=lastSignature;lastSignature=sig;revision++;
    for(const [id,adapter] of adapters) safe(()=>adapter.apply?.(snap,{source:'master-state-observer',revision}));
    emit('master-change',{source:'observer',previousSignature:previous,snapshot:snap});
  }
  const DOM_FIELDS = Object.freeze({
    material:['material','progMaterial','p2Material','p3Material','devMaterial','quoteMaterial'],
    thickness:['thickness','progThickness','p2Thickness','p3Thickness','devThickness','curveThickness','dcThickness','pp527Thickness','quoteThickness','visualThickness'],
    bendLength:['importBendLength','progBendLength','p2BendLength','p3BendLength','devBendLength','dcBendLength','pp524BendLength'],
    machine:['machine','s3Machine','pp530MachineSelect']
  });
  const DOM_OWNER = Object.freeze({
    material:{material:'dashboard',progMaterial:'program',p2Material:'program2d',p3Material:'program3d',devMaterial:'development',quoteMaterial:'quotes'},
    thickness:{thickness:'dashboard',progThickness:'program',p2Thickness:'program2d',p3Thickness:'program3d',devThickness:'development',curveThickness:'curve',dcThickness:'devcalculator',pp527Thickness:'technical',quoteThickness:'quotes',visualThickness:'machineTwin'},
    bendLength:{importBendLength:'import',progBendLength:'program',p2BendLength:'program2d',p3BendLength:'program3d',devBendLength:'development',dcBendLength:'devcalculator',pp524BendLength:'machineTwin'},
    machine:{machine:'dashboard',s3Machine:'sim3d',pp530MachineSelect:'tooling'}
  });
  function mirrorControls(snap, source) {
    if(typeof document==='undefined')return;
    syncing=true;
    try {
      for(const [field,ids] of Object.entries(DOM_FIELDS)) {
        const value=snap[field]; if(value===null||value===undefined)continue;
        for(const id of ids) {
          const el=document.getElementById(id);if(!el||el.id===source||document.activeElement===el)continue;
          if(el.tagName==='SELECT' && !Array.from(el.options||[]).some(o=>o.value===String(value)))continue;
          if(String(el.value)!==String(value))el.value=String(value);
        }
      }
    } finally { syncing=false; }
  }
  function installDomBridge() {
    if(typeof document==='undefined'||typeof document.addEventListener!=='function'||document.__pp69BridgeInstalled)return;
    document.__pp69BridgeInstalled=true;
    const capture=e=>{
      if(syncing||!e.target||!e.target.id)return;
      const el=e.target, id=el.id;
      for(const [field,ids] of Object.entries(DOM_FIELDS)) {
        if(!ids.includes(id))continue;
        let value=el.value;
        if(field==='thickness'||field==='bendLength')value=number(value);
        const owner=DOM_OWNER[field]?.[id]||id;
        publish(owner,{[field]:value});
        break;
      }
    };
    document.addEventListener('change',capture,true);
    for(const id of ['dashboard','import','program','program2d','program3d','development','curve','devcalculator','quotes','machineTwin','sim3d','tooling','technical']) {
      register(id,{apply:(snap,meta)=>mirrorControls(snap,meta?.source===id?'':null)});
    }
  }
  function installPlaybackBridge() {
    if(typeof root.addEventListener!=='function'||root.__pp69PlaybackBridge)return;
    root.__pp69PlaybackBridge=true;
    root.addEventListener('plegarpro:playback-step',e=>{
      const d=e.detail||{};
      if(d.complete||!Number.isFinite(Number(d.step)))return;
      const step=Math.max(0,Math.floor(Number(d.step)));
      const source=String(d.source||'unknown');
      const twin=document.getElementById('pp59step');
      if(twin&&source!=='pp59'&&twin.options.length){
        const next=Math.min(twin.options.length-1,step);
        if(Number(twin.value)!==next){twin.value=String(next);twin.dispatchEvent(new Event('input',{bubbles:true}));}
      }
      if(source!=='collisions'){
        const button=document.querySelector('#pp56Sequence [data-pp56-step="'+step+'"]');
        if(button&&button.getAttribute('aria-current')!=='true')button.click();
      }
      publish(source,{activeStep:step});
    });
  }
  function status() { return Object.freeze({version:VERSION,revision,modules:[...adapters.keys()],listeners:listeners.size,conflicts:conflicts.slice(-25),snapshot:snapshot()}); }
  const api=Object.freeze({version:VERSION,fields:FIELDS,register,subscribe,publish,snapshot,canonicalOrder,status,check});
  root.PP69Sync=api;
  if(typeof root.addEventListener==='function') {
    root.addEventListener('plegarpro:module-ready',e=>{const d=e.detail||{};if(d.id&&d.adapter)register(d.id,d.adapter);});
    root.addEventListener('plegarpro:sync-request',e=>{const d=e.detail||{};if(d.source&&d.patch)publish(d.source,d.patch);});
  }
  if(typeof document!=='undefined') {
    const start=()=>{installDomBridge();check(); if(typeof root.setInterval==='function')root.setInterval(check,350);};
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  }
})(typeof window!=='undefined'?window:globalThis);
