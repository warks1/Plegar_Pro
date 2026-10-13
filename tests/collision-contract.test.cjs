const fs = require('node:fs');
const assert = require('node:assert/strict');
const vm = require('node:vm');

const html = fs.readFileSync('index.html', 'utf8');
const engineeringOrder = fs.readFileSync('pp54-engineering.js', 'utf8');
const collision = fs.readFileSync('pp56-collision-review.js', 'utf8');
const twin = fs.readFileSync('pp59-engineering-upgrade.js', 'utf8');
const runtime = fs.readFileSync('pp61-runtime-integrity.js', 'utf8');
const sw = fs.readFileSync('sw.js', 'utf8');

// Fold-order edits must notify the shared runtime immediately, rather than relying
// on the periodic fingerprint poll to eventually refresh the collision and twin views.
assert.match(engineeringOrder, /function signalOrderChange\(\)\{window\.dispatchEvent\(new CustomEvent\('plegarpro:state-changed'/);
assert.ok((engineeringOrder.match(/signalOrderChange\(\);/g) || []).length >= 4,
  'moving, resetting, completing, and removing a fold number must trigger immediate module synchronization');
assert.match(html, /<script src="\.\/pp54-engineering\.js\?v=55"><\/script>/);
assert.match(sw, /\.\/pp54-engineering\.js\?v=55/);

// Keep the collision UI honest: estimated parametric checks must never be
// presented as certified full-solid CAD collision results.
assert.match(collision, /collisionCertification\s*:\s*false/);
assert.match(collision, /activeBendContact/);
assert.match(collision, /machineBodyCollisionCheck:\{available:false,reason:/);
assert.match(collision, /bastidor NO se comprueban como colisión/i);
assert.match(collision, /INTERFERENCIA ESTIMADA CON ALAS PREVIAMENTE PLEGADAS/);
assert.match(collision, /no es un CAD 3D de sólidos completo ni una certificación de seguridad/i);
assert.match(collision, /getSelectedToolProfiles\s*\(/);
assert.match(collision, /toolProfileSource:\{punch:measuredPunch\?/);
assert.match(collision, /die:measuredDie\?/);
assert.match(collision, /parametric prism intersection: 2D cross-section polygons plus Z-span overlap/i);
assert.match(collision, /modelo prismático\/2D/i);

// The 3D canvas must visually separate prior-flange interference from active
// punch/die contact and identify the machine body as a visual reconstruction.
assert.ok(html.includes('INTERFERENCIA ESTIMADA · PRISMA/2D'));
assert.match(html, /CONTACTO ACTIVO · REVISAR PENETRACIÓN/);
assert.match(html, /GEOMETRÍA EXTERIOR: RECONSTRUCCIÓN VISUAL, NO CAD OEM/);
assert.match(html, /Build a thin sheet-metal wall/);
assert.match(html, /getSelectedToolProfiles/);

// Keep the deployed offline shell wired to the same collision/twin modules.
assert.match(html, /<script src="\.\/pp56-collision-review\.js\?v=160"><\/script>/, 'page and service worker must load the same collision module version');
assert.match(sw, /\.\/pp56-collision-review\.js\?v=160/);
assert.match(collision, /function setStep\(n,forceSync=false\)/);
assert.match(collision, /signature=o\.join\(','\),sequenceChanged=sel\.dataset\.sequence!==signature/ , 'a changed fold order must force a playback-sync event even when the selected step index stays the same');
assert.match(collision, /setStep\(step,sequenceChanged\)/, 'sequence changes must propagate to 2D/3D and machine-twin playback');
assert.match(collision, /previousStep!==step\|\|forceSync/);
// A straight tangent adjacent to a bend must not be misclassified as the active arc;
// otherwise the collision scan skips a real sheet segment and can miss flange hits.
assert.match(collision, /activeArc=a\.bendIndex===foldIndex&&z\.bendIndex===foldIndex/);
assert.match(collision, /pts\[pts\.length-1\]\.bendIndex=i;const sign=Math\.sign\(theta\)/);
assert.match(collision, /activeBendArcSegments>0/, 'U/Z/box sequence regression must contain actual sampled segments for the active bend arc');
assert.match(collision, /activeBendArcSegments:Number\.isFinite\(g\?\.activeBendContact\?\.arcSegments\)/);
assert.match(collision, /code===42&&vertices\.length/ , 'DXF LWPOLYLINE bulge arcs must be preserved');
assert.match(collision, /parseDxfProfileForTest\(text,unitFactor=1,type='Matriz'\)/, 'DXF parser must expose a testable profile audit');
assert.match(collision, /\$\('pp56Step'\)\.onchange=\(\)=>setStep\(Number\(\$\('pp56Step'\)\.value\)\|\|0,true\)/);
assert.match(sw, /\.\/pp59-engineering-upgrade\.js\?v=152/);
assert.match(html, /pp61-runtime-integrity\.js\?v=62/);
assert.match(sw, /pp61-runtime-integrity\.js\?v=62/);
assert.match(runtime, /detail\.complete\?\(order\[maxPos\]\?\?maxPos\)/, 'completed collision playback must activate the final fold in the selected order');
assert.match(runtime, /const requestedFold=detail\.complete\?\(order\[maxPos\]\?\?maxPos\):\(Number\.isInteger\(detail\.foldIndex\)\?detail\.foldIndex:\(order\[maxPos\]\?\?maxPos\)\)/, '2D/3D playback positions without an explicit fold index must resolve through the shared execution order');
assert.match(runtime, /sim\.s2Step=coreStep;sim\.s3Step=coreStep;sim\.p3Active=foldIndex/, 'both programming views and the active 3D fold must receive the same synchronized playback tick');
assert.match(runtime, /window\.addEventListener\('plegarpro:playback-step',e=>syncPlaybackStep\(e\.detail\)\)/, 'the runtime must be the single playback-step synchronization authority');
assert.match(twin, /lastEmittedTravel=-1/, 'digital twin must track travel progress separately from fold index');
assert.match(twin, /travelBucket!==lastEmittedTravel/, 'digital twin must publish meaningful travel changes during each ram cycle');
assert.match(twin, /source:'pp59',step:pos,foldIndex:executionOrder\(\)\[pos\]\?\?0,travel:travelBucket\*5/, 'digital twin events must carry the ram travel percentage');
assert.match(runtime, /else if\(source==='pp59'&&Number\.isFinite\(Number\(detail\.travel\)\)\)/, 'runtime must map twin ram travel into the collision review');
assert.match(runtime, /travel\.dispatchEvent\(new Event\('input',\{bubbles:true\}\)\)/, 'collision view must redraw when synchronized travel changes');
assert.match(html, /pp59-engineering-upgrade\.js\?v=152/);
assert.match(html, /pp61-runtime-integrity\.js\?v=62\.2/);
assert.match(html, /const meta=titles\[page\]\|\|\[/, 'navigation must tolerate dynamic pages without title metadata');
assert.match(html, /Error al actualizar el módulo/, 'navigation failures must be surfaced instead of silently swallowed');
assert.match(html, /window\.__PP_CLICK_TRACKER__=\{has:function\(el\)\{return ppClickBound\.has\(el\)\}\}/, 'button audit must account for addEventListener click handlers');
assert.match(html, /window\.__PP_CLICK_TRACKER__\?\.has\(b\)/, 'button audit must not misreport listener-bound controls as inert');
assert.match(html, /bindingAuditNote='unbound significa sin listener directo detectable/, 'audit must not equate missing direct listeners with missing button actions');
assert.match(html, /id="pp649-stability-core"/, 'dashboard contrast and live-machine visibility fixes must be loaded');
assert.match(html, /\.page#dashboard \.quick button small\{display:block;color:#496372!important/, 'dashboard quick-action descriptions must meet readable contrast');
assert.match(collision, /Sin matrices disponibles para V/, 'empty die catalogs must show a clear explanatory option');
assert.match(collision, /\.pp56-controls select option\{background:#fff!important;color:#173246!important\}/, 'collision selectors must keep readable option text');

assert.match(sw, /pp61-runtime-integrity\.js\?v=62\.2/);
assert.match(sw, /plegar-pro-v151-32/);
assert.match(twin, /collisionCertification|officialVerified|profilePointsMm/);


// Guard against conflicting machine labels: UI dimensions must agree with the
// declared reference model, and unknown variant-specific values stay explicit.
assert.match(twin, /name:'TRUMPF TruBend V85',capacity:'85 t',workingLength:'2050 mm\*'/, 'the selected Trumpf model must use the correct product name and show reference capacity/length');
assert.doesNotMatch(twin, /name:'TRUBEND V85'/, 'the misspelled machine label must not return');
assert.match(twin, /throat:'410 mm\*',stroke:'215 mm\*',openHeight:'No verificada',overall:'2680 × 2100 × 2375 mm\*'/);
assert.match(twin, /throat:'No verificada',stroke:'250 mm\*',openHeight:'No verificada',overall:'3900 × 1900 × 2800 mm\*'/);
assert.match(twin, /cotas exteriores estimadas y carrera pendiente de cotejo/);

console.log('Collision UI contract verified: prior-flange interference, active contact, OEM-CAD disclosure, tool-profile integration and offline cache wiring.');

const modelSource = fs.readFileSync('pp63-v85-parametric-model.js', 'utf8');
const modelWindow = {};
vm.runInNewContext(modelSource, { window: modelWindow, Math, Number, String, Object, Array });
const prismEngine = modelWindow.PP63V85Model;
assert.ok(prismEngine, '3D prism geometry engine must export its testable API');

const rect = (x1, y1, x2, y2) => [
  { x: x1, y: y1 }, { x: x2, y: y1 },
  { x: x2, y: y2 }, { x: x1, y: y2 }
];
const base = prismEngine.prismMesh(rect(0, 0, 10, 10), -5, 5, 'base');
const overlap = prismEngine.prismMesh(rect(5, 5, 15, 15), -5, 5, 'overlap');
const outside = prismEngine.prismMesh(rect(11, 0, 20, 10), -5, 5, 'outside');
const zSeparated = prismEngine.prismMesh(rect(2, 2, 8, 8), 5.1, 10, 'z-separated');
const zTouching = prismEngine.prismMesh(rect(2, 2, 8, 8), 5, 10, 'z-touching');
const xyTouching = prismEngine.prismMesh(rect(10, 0, 20, 10), -5, 5, 'xy-touching');
const xyCornerTouching = prismEngine.prismMesh(rect(10, 10, 20, 20), -5, 5, 'xy-corner-touching');

assert.ok(base && overlap && outside && zSeparated && zTouching && xyTouching && xyCornerTouching, 'valid rectangular prisms should build');
assert.equal(prismEngine.intersectPrisms(base, overlap).intersects, true,
  'overlapping cross-sections and overlapping Z spans should intersect');
assert.equal(prismEngine.intersectPrisms(base, outside).intersects, false,
  'separated cross-sections must not intersect');
assert.equal(prismEngine.intersectPrisms(base, zSeparated).intersects, false,
  'separated Z spans must not intersect');
assert.equal(prismEngine.intersectPrisms(base, zTouching).intersects, false,
  'face-only Z contact must not be reported as volumetric overlap');
assert.equal(prismEngine.intersectPrisms(base, xyTouching).intersects, false,
  'face-only XY contact must not be reported as volumetric overlap');
assert.equal(prismEngine.intersectPrisms(base, xyCornerTouching).intersects, false,
  'point-only XY contact must not be reported as volumetric overlap');

const concave = prismEngine.prismMesh([
  { x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 4 }, { x: 3, y: 4 },
  { x: 3, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 4 }, { x: 0, y: 4 }
], -2, 2, 'concave-U');
assert.ok(concave, 'ear-clipped concave sections should produce a prism');
assert.equal(prismEngine.intersectPrisms(concave, prismEngine.prismMesh(rect(1.5, 2, 2.5, 3), -1, 1, 'inside-notch')).intersects, false,
  'a prism entirely in the concave notch must not be a false positive');
assert.equal(prismEngine.intersectPrisms(concave, prismEngine.prismMesh(rect(.2, 2, .8, 3), -1, 1, 'inside-material')).intersects, true,
  'a prism inside the concave material section should intersect');


const sameConcave = prismEngine.prismMesh([
  { x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 4 }, { x: 3, y: 4 },
  { x: 3, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 4 }, { x: 0, y: 4 }
], -1, 1, 'same-concave');
const reversedConcave = prismEngine.prismMesh([
  { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 1, y: 1 }, { x: 3, y: 1 },
  { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 4, y: 0 }, { x: 0, y: 0 }
], -1, 1, 'reversed-concave');
assert.ok(sameConcave && reversedConcave, 'concave sections should triangulate in either winding direction');
assert.equal(prismEngine.intersectPrisms(concave, sameConcave).intersects, true,
  'identical concave material volumes must be detected as overlapping');
assert.equal(prismEngine.intersectPrisms(concave, reversedConcave).intersects, true,
  'identical concave volumes with opposite polygon winding must be detected');

console.log('Prism geometry tests passed: XY overlap/separation/touching, Z separation/touching, concave sections, and identical/reversed-winding solids.');

assert.doesNotMatch(html, /TrumaBend|TRUMABEND/, 'the machine selector and digital twin must consistently use the correct TruBend model spelling');
