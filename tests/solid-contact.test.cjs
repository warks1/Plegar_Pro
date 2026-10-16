const assert = require('node:assert/strict');
global.window = {};
require('../pp63-v85-parametric-model.js');
const m = window.PP63V85Model;
const fs = require('node:fs');
const path = require('node:path');
const bendRuntime = fs.readFileSync(path.join(__dirname, '..', 'pp57-system-integration.js'), 'utf8');
assert.ok(bendRuntime.includes('[[-430,20,-30],[-130,20,-30],[-60,-35,-30],[0,-72,-30],[60,-35,-30],[130,20,-30],[430,20,-30]'), 'die V profile must be centered under the punch');
assert.ok(bendRuntime.includes('const flatHalf=355,thicknessPx=Math.max(3,Math.min(8,t*2.2)),bendHalf=130,kneeHalf=60;'), 'sheet bend zone must span the centered V shoulders');
assert.ok(bendRuntime.includes('const q=ax/bendHalf,rest=20+thicknessPx*.5+8*(1-q);'), 'resting sheet must have a small raised crown above the die');
assert.ok(bendRuntime.includes('const vY=ax<=kneeHalf?-72+(37/kneeHalf)*ax:-35+(55/(bendHalf-kneeHalf))*(ax-kneeHalf);'), 'sheet profile must follow the two real V-face segments');
assert.ok(bendRuntime.includes('py=rest+(vY+thicknessPx*.5-rest)*contact;'), 'sheet thickness must remain above the die surface during contact');
assert.ok(bendRuntime.includes('const sheetRestY=20;'), 'backgauge reference must align with the sheet resting height');
assert.ok(bendRuntime.includes('const gaugeX=-310, gaugeY=144;'), 'backgauge should remain behind the tooling');
assert.ok(bendRuntime.includes('[gaugeX-34,gaugeY-112,90],[gaugeX+34,gaugeY-112,90],[gaugeX+34,gaugeY-124,90],[gaugeX-34,gaugeY-124,90]'), 'backgauge contact pad should terminate at the sheet resting height');
assert.ok(bendRuntime.includes('const wingSlope=Math.tan(Math.max(0,Math.min(Math.PI/3,(180-angle)*Math.PI/360)))*contact;'), 'wing rotation must be driven by the selected bend angle and contact progress');
assert.ok(bendRuntime.includes('for(let j=0;j<=160;j++)'), 'sheet profile must be sampled finely enough for continuous bending');
assert.ok(bendRuntime.includes('const punchY=(-72+thicknessPx+punchHeight+8)+(1-contact)*145+release*145'), 'punch travel must terminate at the sheet surface at the V apex');
const rect = (x1,y1,x2,y2,z1=0,z2=10,name='rect') =>
  m.prismMesh([{x:x1,y:y1},{x:x2,y:y1},{x:x2,y:y2},{x:x1,y:y2}],z1,z2,name);

const overlap = m.intersectPrisms(rect(0,0,10,10), rect(5,5,12,12));
assert.equal(overlap.intersects, true, 'positive-volume overlap must be penetration');
assert.equal(overlap.touching, false);
assert.equal(overlap.contact, true);

const sideTouch = m.intersectPrisms(rect(0,0,10,10), rect(10,2,12,8));
assert.equal(sideTouch.intersects, false, 'face contact is not positive-volume penetration');
assert.equal(sideTouch.touching, true, 'coplanar side contact must be classified');
assert.equal(sideTouch.contact, true);

const cornerTouch = m.intersectPrisms(rect(0,0,10,10), rect(10,10,12,12));
assert.equal(cornerTouch.touching, true, 'point contact must be classified');

const zTouch = m.intersectPrisms(rect(0,0,10,10,0,10), rect(2,2,8,8,10,20));
assert.equal(zTouch.intersects, false, 'Z-face contact has no positive volume');
assert.equal(zTouch.touching, true, 'Z-face contact must be classified separately');

const clear = m.intersectPrisms(rect(0,0,10,10,0,10), rect(0,0,10,10,10.1,20));
assert.equal(clear.intersects, false);
assert.equal(clear.touching, false);
assert.equal(clear.contact, false, 'separated Z intervals must remain clear');

const distant = m.intersectPrisms(rect(0,0,10,10), rect(11,0,12,1));
assert.equal(distant.intersects, false);
assert.equal(distant.touching, false);

assert.equal(m.intersectPrisms(null, rect(0,0,1,1)).contact, false);
console.log('PP66 solid penetration/contact classification tests passed');
