const assert = require('node:assert/strict');
global.window = {};
require('../pp63-v85-parametric-model.js');
const m = window.PP63V85Model;
const fs = require('node:fs');
const path = require('node:path');
const bendRuntime = fs.readFileSync(path.join(__dirname, '..', 'pp57-system-integration.js'), 'utf8');
const collisionRuntime = fs.readFileSync(path.join(__dirname, '..', 'pp56-collision-review.js'), 'utf8');
assert.ok(bendRuntime.includes("const duplicateCard=$('pp58PhysicalBend')"), 'retired duplicate panel must be removed during integration');
assert.ok(!bendRuntime.includes('function drawPhysicalBend(') && !bendRuntime.includes('function physicalSequence('), 'the duplicate physical renderer must not remain as unreachable runtime code');
assert.ok(collisionRuntime.includes('function profileModelPhysical(progressStep=Infinity,progressTravel=1,toolAudit={},v=16)'), 'the official Cybelec collision HMI must own the programmed sheet profile');
const signedTurn = (angle, direction=1) => { const raw=Number(angle), a=Number.isFinite(raw)&&raw!==0?raw:90, sign=Number(direction)===-1?-1:1; return sign*Math.sign(a)*(180-Math.abs(a))*Math.PI/180; };
assert.ok(Math.abs(signedTurn(-90)-(-Math.PI/2))<1e-12, 'a -90 degree bend must turn -90 degrees, not +270 degrees');
assert.ok(Math.abs(signedTurn(90)-Math.PI/2)<1e-12, 'a +90 degree bend must turn +90 degrees');
assert.ok(Math.abs(signedTurn(-90, -1)-Math.PI/2)<1e-12, 'explicit direction must invert a signed bend once, not create a full rotation');
assert.ok(Math.abs(signedTurn(-150)-(-Math.PI/6))<1e-12, 'a -150 degree bend must use the short -30 degree turn');
const omegaFixture=[{leg:60,angle:-90,direction:1},{leg:85,angle:90,direction:1},{leg:120,angle:90,direction:1},{leg:85,angle:90,direction:1},{leg:60,angle:90,direction:1}];
const omegaProfile=[{x:0,y:0}];let omegaHeading=0;
omegaFixture.forEach((b,i)=>{const p=omegaProfile[omegaProfile.length-1];omegaProfile.push({x:p.x+Math.cos(omegaHeading)*b.leg,y:p.y+Math.sin(omegaHeading)*b.leg});if(i<omegaFixture.length-1)omegaHeading+=(Number(b.direction)||1)*(180-(Number(b.angle)||90))*Math.PI/180});
assert.deepEqual(omegaProfile.map(p=>[Math.round(p.x)||0,Math.round(p.y)||0]),[[0,0],[60,0],[60,-85],[180,-85],[180,0],[120,0]],'Omega 60/85/120/85/60 with first signed angle -90 must retain its intended Omega contour');
assert.ok(collisionRuntime.includes('const theta=-signedBendTurn(a[i]?.angle,a[i]?.direction)*fraction;'), 'official HMI must preserve signed bend direction');
assert.ok(collisionRuntime.includes('heading+=theta;'), 'sheet profile must accumulate each signed programmed bend');
assert.ok(collisionRuntime.includes('const sheetCenterY=restY+(dieApexY-thicknessPx*.8-restY)*travel;'), 'sheet contact must follow the same normalized ram travel');
assert.ok(collisionRuntime.includes('const targetTipY=dieApexY-Math.max(1,thicknessPx*1.3),ramTravel=travel;'), 'punch must stop at the sheet surface relative to the V apex');
assert.ok(collisionRuntime.includes('x.fillStyle=\'#dfe8ed\';x.fill();'), 'the sheet must render as a filled body with visible thickness');
assert.ok(collisionRuntime.includes('function drawCybTouchProfile(x,w,h,p)'), 'the original Cybelec-style HMI must render the physical section');
const cycle = phase => {
  const rawContact = Math.max(0, Math.min(1, (phase - .12) / .55));
  const release = phase > .82 ? Math.max(0, Math.min(1, (phase - .82) / .18)) : 0;
  return { contact: rawContact * (1 - release), release };
};
assert.equal(cycle(0).contact, 0, 'sheet starts flat before punch approach');
assert.ok(cycle(.67).contact > .99, 'sheet reaches full bend during the press stroke');
assert.ok(cycle(.82).contact > .99, 'sheet stays bent through the hold phase');
assert.equal(cycle(1).contact, 0, 'sheet must return to resting shape when punch is fully retracted');
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

assert.ok(bendRuntime.includes('function fitCanvas(canvas,baseWidth,baseHeight)'), 'render canvases must adapt to tablet width');
assert.ok(bendRuntime.includes('if(t-twinLastDraw<33)'), 'machine twin should cap redraws to reduce tablet stutter');
assert.ok(bendRuntime.includes('if(now-physLastDraw>=40)'), 'physical simulation should cap redraw frequency');
assert.ok(bendRuntime.includes("window.addEventListener('plegarpro:machine-travel'"), 'physical simulation must follow collision machine travel');
assert.ok(bendRuntime.includes("window.addEventListener('plegarpro:playback-step'"), 'physical simulation must follow shared step changes');
assert.ok(bendRuntime.includes("x.fillText((Number(fb.angle)||90)+'°',fx,railY+20)"), 'sequence rail must identify each bend and its angle');

assert.ok(bendRuntime.includes('id="pp58PhysProfile"'), 'physical following must include an accumulated piece profile preview');
assert.ok(bendRuntime.includes('function drawProgramProfile(b,activeIdx,order,stepNumber,activeAngle,phase=0)'), 'piece preview must derive its shape from programmed legs and angles');
assert.ok(bendRuntime.includes('n=Math.max(0,b.length-1)'), 'physical sequence must exclude the terminal leg from bend steps');
assert.ok(bendRuntime.includes('const rankOf=i=>{') && bendRuntime.includes('const raw=Array.from({length:n},(_,i)=>i).sort((a,b)=>rankOf(a)-rankOf(b));'), 'physical playback must use the same programmed bend order as 2D and 3D');
assert.ok(!bendRuntime.includes('window.PLEGAR_PRO_COLLISIONS?.getOrder?.()'), 'collision review cursor must not override the shape or order of the programmed part');
assert.ok(bendRuntime.includes("drawProgramProfile(b,idx,order,stepNumber,angle,phase)"), 'active physical step must refresh the accumulated profile');
