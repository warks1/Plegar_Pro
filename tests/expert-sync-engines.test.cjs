const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const listeners = {};
const window = {
  PLEGAR_PRO_STATE: { material:'S235', thickness:2, bendLength:1000, machine:'TRUMPF TruBend V85', bends:[{},{},{},{}], bendOrder:[2,0], activeStep:0 },
  addEventListener:(n,fn)=>(listeners[n]||(listeners[n]=[])).push(fn),
  dispatchEvent:e=>{(listeners[e.type]||[]).forEach(fn=>fn(e));return true;},
  CustomEvent:function(type,init){this.type=type;this.detail=init.detail;},
  setInterval:()=>0
};
const context={window,globalThis:window,document:{readyState:'complete'},setInterval:()=>0,console,Date,Map,Set,Object,Array,Number,JSON,TypeError};
vm.runInNewContext(fs.readFileSync('pp69-expert-sync-engines.js','utf8'),context);
const sync=window.PP69Sync;
assert.ok(sync,'sync engine exports API');
assert.equal(sync.version,'69.3','exported runtime version must match the cache-busted script version');
assert.deepEqual(Array.from(sync.canonicalOrder()),[2,0,1]);
let applied=0,events=0;
sync.register('program2d',{apply:s=>{applied++;assert.equal(s.thickness,2)}});
sync.register('program3d',{apply:s=>{applied++;}});
sync.subscribe(e=>{if(e.type==='commit')events++});
const result=sync.publish('program2d',{thickness:3,bendOrder:[1,1,99,0],activeStep:1});
assert.equal(result.ok,true);
assert.equal(window.PLEGAR_PRO_STATE.thickness,3);
assert.deepEqual(Array.from(window.PLEGAR_PRO_STATE.bendOrder),[1,0,2]);
assert.ok(applied>=3,'registered modules receive initial and committed snapshots');
assert.equal(events,1);
// Adapters must not be able to recursively commit while a publish is being fanned out.
let nestedPublish=null;
sync.register('reentrant-guard',{apply:(snapshot,meta)=>{
  if(meta?.source==='program2d') nestedPublish=sync.publish('reentrant-guard',{activeStep:2});
}});
sync.publish('program2d',{activeStep:0});
assert.equal(nestedPublish?.ok,false);
assert.equal(nestedPublish?.reason,'reentrant-sync');
// Alias-only master states must update the field actually read by snapshot().
delete window.PLEGAR_PRO_STATE.machine;
window.PLEGAR_PRO_STATE.selectedMachine='Old machine';
delete window.PLEGAR_PRO_STATE.material;
window.PLEGAR_PRO_STATE.materialName='Old material';
sync.publish('program3d',{machine:'TRUMPF TruBend V85',material:'S235'});
assert.equal(window.PLEGAR_PRO_STATE.selectedMachine,'TRUMPF TruBend V85');
assert.equal(window.PLEGAR_PRO_STATE.materialName,'S235');
assert.equal(sync.snapshot().machine,'TRUMPF TruBend V85');
assert.equal(sync.snapshot().material,'S235');
// Playback indices are zero-based and must never exceed the available folds.
sync.publish('program3d',{activeStep:999});
assert.equal(sync.snapshot().activeStep,3);
assert.equal(window.PLEGAR_PRO_STATE.activeStep,3);
const revisionBeforeInvalid=sync.status().revision;
const invalidResult=sync.publish('bad',{thickness:NaN});
assert.equal(invalidResult.ok,false,'patch with no valid fields must not report success');
assert.equal(invalidResult.reason,'no-valid-fields');
assert.equal(sync.status().revision,revisionBeforeInvalid,'invalid patch must not increment revision');
assert.equal(sync.snapshot().thickness,3);
assert.equal(sync.status().modules.length,3);
console.log('PP69 expert synchronization engine tests passed');
