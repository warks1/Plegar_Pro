const fs = require('node:fs');
const assert = require('node:assert/strict');
const vm = require('node:vm');

const html = fs.readFileSync('index.html', 'utf8');
const engineeringOrder = fs.readFileSync('pp54-engineering.js', 'utf8');
const collision = fs.readFileSync('pp56-collision-review.js', 'utf8');
assert.doesNotMatch(collision, /\.pp56-seq-step\{flex:0 0 132px;scroll-snap-align:start\}/, 'sequence card sizing must not be split across duplicate selectors');
assert.match(collision, /\.pp56-seq-step\{position:relative;display:flex;flex:0 0 132px;scroll-snap-align:start;/, 'sequence card sizing and snap behavior must live in one selector');
assert.ok(collision.includes('pp56Sequence'), 'collision UI must expose a visible fold sequence strip');
assert.ok(collision.includes('function renderSequenceBar()'), 'fold sequence must render selectable step cards');
assert.match(collision, /previousSync=\{s2Step:typeof sim/ , 'sequence audit must snapshot the active simulation state before running U/Z/box regression cases');
assert.match(collision, /for\(const k of \['s2Step','s3Step','p3Active','machineTravel'\]\)/, 'sequence audit must restore 2D/3D fold and ram-travel state after testing');
const twin = fs.readFileSync('pp59-engineering-upgrade.js', 'utf8');
const runtime = fs.readFileSync('pp61-runtime-integrity.js', 'utf8');
assert.ok(runtime.includes("el.dataset.syncOk=String(!/^Error\\b/i.test(String(message||'')))"), 'runtime synchronization errors must not be marked as verified');
assert.match(runtime, /catch\(error\)\{\s*lastSyncError=String\(error\?\.stack\|\|error\);\s*updateStatus\('Error de sincronización · revisa consola'\)/, 'syncAll exceptions must set the visible synchronization state to error before rethrowing');
const sw = fs.readFileSync('sw.js', 'utf8');
assert.match(html, /Corrección definitiva del menú lateral/);
assert.match(html, /grid-template-columns:258px minmax\(0,1fr\)!important/);
assert.match(html, /#mainSidebar \.nav\{display:flex!important;flex-direction:column!important/);
assert.match(html, /#mainSidebar\.side\.open[\s\S]*transform:translateX\(0\)!important/);
assert.match(sw, /plegar-pro-v[0-9]+-[0-9]+/);
// Voice assistant delivery contract: UI script must be loaded and included in offline cache.
assert.ok(html.includes('pp64-ai-voice.js?v=1'));
assert.ok(sw.includes('./pp64-ai-voice.js?v=1'));
assert.match(sw, /plegar-pro-v[0-9]+-[0-9]+/);
const voice = fs.readFileSync('pp64-ai-voice.js', 'utf8');
assert.ok(voice.includes('window.SpeechRecognition||window.webkitSpeechRecognition'));
assert.ok(voice.includes('recognition.continuous=true'));
assert.ok(voice.includes('SpeechSynthesisUtterance'));
assert.ok(voice.includes('PLEGAR_PRO_VOICE'));
assert.ok(voice.includes('no tiene conectado un modelo conversacional remoto'));
assert.ok(voice.includes('data-page="collisions"'));
assert.ok(voice.includes('data-page="machineTwin"'));

assert.match(html, /const beamTravel=simulation\?Math\.max\(0,Math\.min\(100,Number\(sim\.machineTravel\)\|\|0\)\)\/100:0,beamDrop=simulation\?Math\.min\(76,beamTravel\*76\):12;/,
  'digital-twin ram travel must use the synchronized machine stroke');
assert.match(runtime, /plegarpro:machine-travel/);
assert.match(runtime, /sim\.machineTravel=Number\.isFinite\(Number\(detail\.travel\)\)/);

assert.match(html, /const active2DFold=canvas\.id==='canvasS2'/, '2D rendering must not read undefined simulation state');
assert.match(html, /i===Math\.min\(active2DFold,state\.bends\.length\)/);
assert.match(runtime, /const locatedPosition=order\.indexOf\(foldIndex\),syncPos=positionIsCanonical\?maxPos:\(locatedPosition>=0\?locatedPosition:maxPos\)/, 'canonical collision and twin positions must not be remapped through a stale physical index');
assert.match(runtime, /step:syncPos,foldIndex/, 'synchronization broadcasts must expose the canonical program position');



assert.match(html, /if\(ppExecutionRank\(i\)<step&&i<state\.bends\.length-1\)/,
  '3D fold-angle highlights must follow programmed execution rank, not physical bend index');
assert.match(html, /i===Math\.min\(active2DFold,state\.bends\.length\)/, '2D active marker must use the local programmed bend position');



assert.match(html, /PP3D MENU v3 · movimiento metálico ligero y accesible/);
assert.match(html, /@keyframes pp3dMetalReveal/);
assert.match(html, /@keyframes pp3dActivePulse/);
assert.match(html, /prefers-reduced-motion:reduce\)[\s\S]*?#mainSidebar \.nav button\.active\{animation:none!important/);



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
assert.match(html, /<script src="\.\/pp56-collision-review\.js\?v=168"><\/script>/, 'page and service worker must load the same collision module version');
assert.match(html, /id="s3ZoomRange" type="range" min="0\.25" max="6"/, '3D simulation must expose a continuous extended zoom slider');
assert.match(html, /id="canvasS3" width="1600" height="900"/, '3D simulation canvas must use the enlarged rendering viewport');
assert.match(html, /#sim3d \.s3Stage\{min-height:clamp\(420px,72vh,900px\)/, '3D simulation viewport must use a larger responsive stage');
assert.match(html, /Math\.min\(6,sim\[k\]\*\(d\/lastDistance\)\)/, '3D pinch zoom must allow up to 6x magnification');

assert.match(sw, /\.\/pp56-collision-review\.js\?v=168/);
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
assert.match(sw, /\.\/pp59-engineering-upgrade\.js\?v=156/);
assert.ok(sw.includes("'./pp55-cad-precision.js?v=64.9.1'"), 'offline cache must use the same versioned CAD URL as the page');
assert.ok(sw.includes("'./pp60-graphics-runtime.js?v=64.9.1'"), 'offline cache must use the same versioned graphics URL as the page');
assert.match(html, /pp61-runtime-integrity\.js\?v=62/);
assert.match(sw, /pp61-runtime-integrity\.js\?v=62/);
assert.match(runtime, /detail\.complete\?\(order\[maxPos\]\?\?maxPos\)/, 'completed collision playback must activate the final fold in the selected order');
assert.match(runtime, /const positionIsCanonical=source==='collisions'\|\|source==='pp59'\|\|source==='machineTwin'/, 'collision and twin selectors must preserve their canonical programmed position');
assert.match(runtime, /const requestedFold=detail\.complete\?\(order\[maxPos\]\?\?maxPos\):\(positionIsCanonical\?\(order\[maxPos\]\?\?maxPos\):\(Number\.isInteger\(detail\.foldIndex\)\?detail\.foldIndex:\(order\[maxPos\]\?\?maxPos\)\)\)/, 'all playback sources must resolve the active physical fold from the canonical programmed position');
assert.match(runtime, /sim\.s2Step=coreStep;sim\.s3Step=coreStep;sim\.p3Active=foldIndex/, 'both programming views and the active 3D fold must receive the same synchronized playback tick');
assert.match(runtime, /window\.addEventListener\('plegarpro:playback-step',e=>syncPlaybackStep\(e\.detail\)\)/, 'the runtime must be the single playback-step synchronization authority');
assert.match(twin, /lastEmittedTravel=-1/, 'digital twin must track travel progress separately from fold index');
assert.match(collision, /plegarpro:machine-travel/, 'collision playback must publish ram travel continuously, not only when the fold step changes');
assert.match(twin, /plegarpro:machine-travel/, 'digital twin must consume collision ram travel when its own playback is paused');
assert.match(twin, /externalTravel!==null\?externalTravel\/100/, 'digital twin ram position must follow externally synchronized travel');
assert.match(html, /pp59-engineering-upgrade\.js\?v=156/);
assert.match(sw, /pp59-engineering-upgrade\.js\?v=156/);
assert.match(sw, /plegar-pro-v[0-9]+-[0-9]+/);
assert.match(twin, /travelBucket!==lastEmittedTravel/, 'digital twin must publish meaningful travel changes during each ram cycle');
assert.match(twin, /source:'pp59',step:pos,foldIndex:executionOrder\(\)\[pos\]\?\?0,travel:travelBucket\*5/, 'digital twin events must carry the ram travel percentage');
assert.match(runtime, /else if\(source==='pp59'&&Number\.isFinite\(Number\(detail\.travel\)\)\)/, 'runtime must map twin ram travel into the collision review');
assert.match(runtime, /travel\.dispatchEvent\(new Event\('input',\{bubbles:true\}\)\)/, 'collision view must redraw when synchronized travel changes');
assert.match(html, /pp59-engineering-upgrade\.js\?v=156/);
assert.match(html, /pp61-runtime-integrity\.js\?v=62\.9/);
assert.match(html, /const meta=titles\[page\]\|\|\[/, 'navigation must tolerate dynamic pages without title metadata');
assert.match(html, /Error al actualizar el módulo/, 'navigation failures must be surfaced instead of silently swallowed');
assert.match(html, /window\.__PP_CLICK_TRACKER__=\{has:function\(el\)\{return ppClickBound\.has\(el\)\}\}/, 'button audit must account for addEventListener click handlers');
assert.match(html, /window\.__PP_CLICK_TRACKER__\?\.has\(b\)/, 'button audit must not misreport listener-bound controls as inert');
assert.match(html, /bindingAuditNote='unbound significa sin listener directo detectable/, 'audit must not equate missing direct listeners with missing button actions');
assert.match(html, /id="pp649-stability-core"/, 'dashboard contrast and live-machine visibility fixes must be loaded');
assert.match(html, /\.page#dashboard \.quick button small\{display:block;color:#496372!important/, 'dashboard quick-action descriptions must meet readable contrast');
assert.match(collision, /Sin matrices disponibles para V/, 'empty die catalogs must show a clear explanatory option');
assert.match(collision, /\.pp56-controls select option\{background:#fff!important;color:#173246!important\}/, 'collision selectors must keep readable option text');

assert.match(sw, /pp61-runtime-integrity\.js\?v=62\.9/);
assert.match(sw, /plegar-pro-v[0-9]+-[0-9]+/);
assert.match(twin, /collisionCertification|officialVerified|profilePointsMm/);


// Guard against conflicting machine labels: UI dimensions must agree with the
// declared reference model, and unknown variant-specific values stay explicit.
assert.match(twin, /name:'TRUMPF TruBend V85',capacity:'85 t',workingLength:'2050 mm\*'/, 'the selected Trumpf model must use the correct product name and show reference capacity/length');
assert.doesNotMatch(twin, /name:'TRUMABEND V85'/, 'the misspelled machine label must not return');
assert.match(twin, /throat:'410 mm\*',stroke:'215 mm\*',openHeight:'No verificada',overall:'2680 × 2100 × 2375 mm\*'/);
assert.match(twin, /throat:'No verificada',stroke:'250 mm\*',openHeight:'No verificada',overall:'3900 × 1900 × 2800 mm\*'/);
assert.match(twin, /cotas exteriores estimadas y carrera pendiente de cotejo/);


assert.match(html, /PP3D icon fix: retain the existing module symbols/);
assert.match(html, /data-page="dashboard"\]:before\{content:"⌂"!important\}/, '3D menu must preserve its dashboard icon');
assert.match(html, /PP3D MENU v2 · profundidad visible también en pantallas táctiles/);
assert.match(html, /rotateY\(-4deg\) rotateX\(1deg\)/, 'the mobile/touch menu must keep a visible 3D angle instead of flattening it');
assert.match(html, /border-bottom:4px solid #030a10/, 'navigation buttons must have a visible extruded lower bevel');

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


// Playback synchronization must use one event contract across 2D, 3D, collision
// review and both digital-twin controllers. Guard this wiring against regressions.
assert.match(html, /function simButtons\(prefix,key\)/);
assert.match(html, /source:key,step:Number\(sim\[key\+'Step'\]\)\|\|0/);
assert.match(html, /plegarpro:playback-start/);
assert.match(html, /plegarpro:playback-stop/);
assert.match(runtime, /function installPlaybackSync\(\)/);
assert.match(runtime, /if\(source==='collisions'\|\|source==='pp59'\|\|source==='machineTwin'\)stopCompetingPlayback\(source\)/, 'manual collision/twin step changes must stop competing playback before setting the active bend');
assert.match(runtime, /pp56Step ya sincroniza desde su propio onchange/, 'collision selector synchronization must have a single event path');
assert.doesNotMatch(runtime, /target\?\.id!=='pp56Step'[\s\S]{0,500}syncPlaybackStep\(\{source:'collisions'/, 'document must not process a second collision-step sync after the selector handler');
assert.match(runtime, /addEventListener\('plegarpro:playback-start'/);
assert.match(runtime, /addEventListener\('plegarpro:playback-step'/);
assert.match(runtime, /function stopCompetingPlayback\(source\)/);
assert.match(runtime, /sim\.s2Step=coreStep;sim\.s3Step=coreStep;sim\.p3Active=foldIndex/);
assert.match(runtime, /window\.PLEGAR_PRO_V61=\{/);
assert.match(runtime, /playback:auditPlayback/);
assert.match(collision, /plegarpro:playback-step/);
assert.match(twin, /plegarpro:playback-step/);

assert.match(collision, /BYSTRONIC TOUCH 15 · CONTROL CNC/, 'collision HMI must use the requested Bystronic Touch 15 reference');
assert.match(collision, /const hit=solid3D\.intersectPrisms\(seg,punchSolid\);return hit\.contact\?\?hit\.intersects/, 'active punch contact must classify tangency with a single geometry query');
assert.match(collision, /const hit=solid3D\.intersectPrisms\(seg,dieSolid\);return hit\.contact\?\?hit\.intersects/, 'active die contact must classify tangency with a single geometry query');
assert.match(collision, /id="pp56Timeline" type="range"/, 'collision playback must provide a seekable sequence timeline');
assert.match(collision, /id="pp56Speed" aria-label="Velocidad de reproducción"/, 'collision playback must provide selectable speed');
assert.match(collision, /p<\.42\?'PLEGANDO':p<\.52\?'PUNTO DE PLEGADO':'RETORNO'/, 'ram playback must animate downstroke, forming dwell, and return');
assert.match(collision, /▶ Continuar/, 'playback must resume instead of restarting the stroke');
assert.match(collision, /phase=1;stop\(\);return/, 'completed playback must retain a completion marker so Play restarts from the first fold');
assert.match(collision, /pp56TouchPulse/, 'HMI live status must animate');


// Repository hygiene regression guard: prevent stale versioned documents,
// duplicate HTML IDs, and references to missing/offline-uncached local scripts.
const htmlIds = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]);
assert.equal(new Set(htmlIds).size, htmlIds.length, 'index.html must not contain duplicate element IDs');
const localScripts = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)]
  .map(match => match[1].split('?')[0])
  .filter(src => src.startsWith('./') && !src.startsWith('//'));
const scriptSources = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)].map(match => match[1]);
assert.equal(new Set(scriptSources).size, scriptSources.length, 'index.html must not load the same script URL more than once');
for (const src of localScripts) {
  assert.ok(fs.existsSync(src.slice(2)), 'index.html references a missing local script: ' + src);
  assert.ok(sw.includes(src), 'offline service worker does not cache a referenced local script: ' + src);
}
const rootFiles = fs.readdirSync('.');
const staleDocs = rootFiles.filter(name => /^(?:CHANGELOG_v.*\.txt|PRUEBAS_v.*\.txt|README\.txt|README_IMPORTANTE\.txt)$/.test(name));
assert.deepEqual(staleDocs, [], 'obsolete versioned documentation must stay consolidated into README.md, CHANGELOG.md and PRUEBAS.md');
assert.ok(fs.existsSync('README.md') && fs.existsSync('CHANGELOG.md') && fs.existsSync('PRUEBAS.md'),
  'the three current consolidated project documents must remain present');
console.log('Repository hygiene passed: no duplicate IDs, missing/offline script references, or obsolete duplicate root documents.');

// The live machine twin must keep a light, readable surface and mirror collision playback/order edits.
assert.match(twin, /background:linear-gradient\(145deg,#f8fcff,#e8f5fc\)!important/);
assert.match(twin, /bg\.addColorStop\(0,'#fbfdff'\)/, 'twin canvas background must be light rather than dark blue');
assert.match(twin, /addEventListener\('plegarpro:state-changed',\(\)=>\{syncStepOptions\(\);draw\(\)\}\)/, 'twin must refresh when fold order changes');
assert.match(twin, /addEventListener\('plegarpro:playback-step',e=>\{const d=e\.detail\|\|\{\};if\(d\.source!=='collisions'\)return;/, 'twin must mirror the collision module playback position');
assert.match(html, /pp59-engineering-upgrade\.js\?v=156/);
assert.match(sw, /pp59-engineering-upgrade\.js\?v=156/);

// Programación 2D: the information overlay must not cover bend-selection targets.
assert.match(engineeringOrder, /function installCanvasPicking\(\)/, '2D/3D fold selection must retain its canvas-picking handler');
assert.match(engineeringOrder, /\['canvasP2',projected2D\],\['canvasP3',projected3D\]/, 'fold picking must be installed on both programming canvases');
assert.match(engineeringOrder, /c\.addEventListener\('click',e=>\{if\(sim\.drag\)return;const p=canvasXY\(c,e\),pts=project\(c\)/, 'canvas clicks must still map to projected bend targets after the overlay is removed');
assert.match(html, /id="pp70-program2d-clear-canvas"/);
assert.match(html, /#program2d #overlayP2\{display:none!important;visibility:hidden!important;pointer-events:none!important\}/);
assert.match(html, /#program2d #canvasP2\{position:relative;z-index:1;pointer-events:auto;touch-action:pan-y\}/);
assert.match(sw, /plegar-pro-v[0-9]+-[0-9]+/);


// CSS cascade hygiene: named style layers must remain uniquely identifiable so
// later cleanup can target a layer without accidentally removing another block.
const styleBlocks = [...html.matchAll(/<style\b([^>]*)>([\s\S]*?)<\/style>/gi)];
const styleIds = styleBlocks.map(([, attrs]) => (attrs.match(/\bid=["']([^"']+)["']/i) || [])[1]).filter(Boolean);
assert.ok(styleBlocks.length >= 20, 'the inline stylesheet audit must cover the current UI cascade');
assert.equal(new Set(styleIds).size, styleIds.length, 'named CSS layers must not reuse an id');
for (const id of ['pp70-program2d-clear-canvas', 'pp649-stability-core', 'pp70-light-readable-panels']) {
  assert.ok(styleIds.includes(id), 'required CSS layer is missing or no longer identifiable: ' + id);
}

// Visual regression guards for the approved light industrial interface.
// These assertions protect user-facing layout constraints without deleting
// CSS cascade layers whose functional impact has not been browser-verified.
assert.match(html, /#program2d #overlayP2\{display:none!important;visibility:hidden!important;pointer-events:none!important\}/,
  'the informational overlay must not cover fold-selection geometry in the 2D programming view');
assert.match(html, /--pp-ui-bg:#edf3f7;--pp-ui-panel:#fff;--pp-ui-panel2:#f5f9fc/,
  'the final interface layer must retain light, readable panel tokens');
assert.match(html, /#mainSidebar \.nav button\{[\s\S]*?animation:pp3dMetalReveal \.14s ease-out both!important;transition:background-color \.12s ease,border-color \.12s ease,color \.12s ease,transform \.12s ease!important/,
  'sidebar motion must remain brief and avoid slow hover animations');
assert.match(html, /body\{min-width:0;overflow-x:hidden\}/,
  'the document must not introduce horizontal overflow on phones');
assert.match(html, /@media\(max-width:900px\)\{[\s\S]*?#mainSidebar\.side\{position:fixed!important;inset:0 auto 0 0!important;width:min\(300px,88vw\)!important/,
  'the sidebar must switch to a bounded drawer on mobile');
