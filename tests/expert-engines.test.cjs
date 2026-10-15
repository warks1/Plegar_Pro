const assert = require('node:assert/strict');
const e = require('../pp65-expert-engines.js');

assert.equal(e.VERSION, '65.1');
assert.ok(Math.abs(e.bendAllowance({thickness:2,insideRadius:2,angleDeg:90,kFactor:.33}) - Math.PI*(2+.66)/2) < 1e-10);
assert.ok(Number.isFinite(e.bendDeduction({thickness:2,insideRadius:2,angleDeg:90,kFactor:.33})));
assert.throws(()=>e.bendAllowance({thickness:0,insideRadius:2,angleDeg:90}), /thickness/);
assert.throws(()=>e.bendAllowance({thickness:2,insideRadius:2,angleDeg:181}), /angleDeg/);
assert.throws(()=>e.bendAllowance({thickness:2,insideRadius:2,angleDeg:90,kFactor:1.2}), /kFactor/);

const force=e.pressForce({tensileStrengthMPa:450,thickness:2,foldLengthMm:1000,dieOpeningMm:16,angleDeg:90});
assert.ok(force.kN>0 && force.tonnesForce>0);
assert.ok(Math.abs(force.kN - (1.42*450*1000*4/16/1000))<1e-10);
assert.equal(force.estimated,true);

const clear=e.validateDimensions({thickness:2,insideRadius:2,dieOpeningMm:16,foldLengthMm:1000,tensileStrengthMPa:450,machineCapacityTonnes:85,angleDeg:90});
assert.equal(clear.valid,true);
assert.equal(clear.certified,false);
const blocked=e.validateDimensions({thickness:10,insideRadius:1,dieOpeningMm:20,foldLengthMm:3100,tensileStrengthMPa:450,machineCapacityTonnes:10,angleDeg:90});
assert.equal(blocked.valid,false);
assert.ok(blocked.errors.length>0);

const meshA={vertices:[[0,0,0],[10,10,10]]};
const meshB={vertices:[[5,5,5],[12,12,12]]};
const meshC={vertices:[[11,11,11],[12,12,12]]};
assert.equal(e.aabbIntersection(meshA,meshB).intersects,true);
assert.equal(e.aabbIntersection(meshA,meshC).intersects,false);
assert.equal(e.aabbIntersection({vertices:[]},meshB).valid,false);
assert.throws(()=>e.flatLength({straightLengths:[10,20],bends:[],unit:'inch'}),/millimetres/);
assert.ok(e.flatLength({straightLengths:[100,100],bends:[],unit:'mm'}).valueMm===200);

console.log('PP65 expert calculation, validation, and 3D broad-phase tests passed');
const die2=e.recommendDieOpening({thickness:2});
assert.equal(die2.targetV,16);
assert.equal(die2.recommendedV,16);
assert.equal(die2.ratio,8);
assert.equal(e.recommendDieOpening({thickness:3}).recommendedV,24);
assert.equal(e.recommendDieOpening({thickness:2.5}).recommendedV,20);
assert.throws(()=>e.recommendDieOpening({thickness:0}),/thickness/);
