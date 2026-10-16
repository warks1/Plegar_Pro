const assert = require('node:assert/strict');
global.window = {};
require('../pp63-v85-parametric-model.js');
const m = window.PP63V85Model;
const fs = require('node:fs');
const path = require('node:path');
const bendRuntime = fs.readFileSync(path.join(__dirname, '..', 'pp57-system-integration.js'), 'utf8');
assert.ok(bendRuntime.includes('[[-430,20,-30],[-130,20,-30],[-60,-35,-30],[0,-72,-30],[60,-35,-30],[130,20,-30],[430,20,-30]'), 'die V profile must be centered under the punch');
assert.ok(bendRuntime.includes('const profilePts=[{x:0,y:0}];let profileHeading=0;'), 'physical follow-up must rebuild the complete programmed sheet profile');
assert.ok(bendRuntime.includes('profileHeading+=foldDirection*(180-foldAngle)*Math.PI/180*foldProgress;'), 'physical follow-up must preserve negative programmed bend angles instead of clamping them to positive angles');
const omegaFixture=[{leg:60,angle:-90,direction:1},{leg:85,angle:90,direction:1},{leg:120,angle:90,direction:1},{leg:85,angle:90,direction:1},{leg:60,angle:90,direction:1}];
const omegaProfile=[{x:0,y:0}];let omegaHeading=0;
omegaFixture.forEach((b,i)=>{const p=omegaProfile[omegaProfile.length-1];omegaProfile.push({x:p.x+Math.cos(omegaHeading)*b.leg,y:p.y+Math.sin(omegaHeading)*b.leg});if(i<omegaFixture.length-1)omegaHeading+=(Number(b.direction)||1)*(180-(Number(b.angle)||90))*Math.PI/180});
assert.deepEqual(omegaProfile.map(p=>[Math.round(p.x)||0,Math.round(p.y)||0]),[[0,0],[60,0],[60,-85],[180,-85],[180,0],[120,0]],'Omega 60/85/120/85/60 with first signed angle -90 must retain its intended Omega contour');
assert.ok(bendRuntime.includes('const foldAngle=Number(b[legIndex]?.angle)||90;')&&!bendRuntime.includes('Math.max(30,Math.min(150,Number(b[legIndex]?.angle)||90))'),'Omega profile must not clamp a negative bend angle to a positive 30-degree angle');
assert.ok(bendRuntime.includes('const rankOf=i=>{') && bendRuntime.includes('const raw=Array.from({length:n},(_,i)=>i).sort((a,b)=>rankOf(a)-rankOf(b));'), 'physical follow-up sequence must match the bend ranking shared by 2D/3D');
assert.ok(bendRuntime.includes('const seqPosition=order.indexOf(legIndex),isCompleted=seqPosition>=0&&seqPosition<stepNumber,isActive=legIndex===idx;'), 'physical follow-up must retain completed bends according to programmed sequence');
assert.ok(bendRuntime.includes('const activeTurnProgress=phase<.12?0:phase<.67?Math.max(0,Math.min(1,(phase-.12)/.55)):1;'), 'active bend must progress and remain formed after punch retraction');
assert.ok(bendRuntime.includes('const sheetCenterY=20-74*contact;'), 'active bend vertex must descend into the V and rise when the punch retracts');
assert.ok(bendRuntime.includes('const sheetPts=profilePts.map(p=>[p.x-activeVertex.x,p.y-activeVertex.y+sheetCenterY,5]);'), 'complete sheet must be positioned around the active bend over the V die');
assert.ok(bendRuntime.includes('const sheetRestY=20;'), 'backgauge reference must align with the sheet resting height');
assert.ok(bendRuntime.includes('const gaugeX=-310, gaugeY=144;'), 'backgauge should remain behind the tooling');
assert.ok(bendRuntime.includes('[gaugeX-34,gaugeY-112,90],[gaugeX+34,gaugeY-112,90],[gaugeX+34,gaugeY-124,90],[gaugeX-34,gaugeY-124,90]'), 'backgauge contact pad should terminate at the sheet resting height');
assert.ok(bendRuntime.includes('rawContact=Math.max(0,Math.min(1,(phase-.12)/.55)),release=phase>.82?Math.max(0,Math.min(1,(phase-.82)/.18)):0;const contact=rawContact*(1-release);'), 'sheet contact must release in sync with punch retraction');
assert.ok(bendRuntime.includes('const punchY=(-54+thicknessPx+punchHeight+8)+(1-contact)*74,tipHalf='), 'punch travel must retract as sheet contact returns to zero');
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
