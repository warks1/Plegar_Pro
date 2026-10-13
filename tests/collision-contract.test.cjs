const fs = require('node:fs');
const assert = require('node:assert/strict');

const html = fs.readFileSync('index.html', 'utf8');
const collision = fs.readFileSync('pp56-collision-review.js', 'utf8');
const twin = fs.readFileSync('pp59-engineering-upgrade.js', 'utf8');
const sw = fs.readFileSync('sw.js', 'utf8');

// Keep the collision UI honest: estimated parametric checks must never be
// presented as certified full-solid CAD collision results.
assert.match(collision, /collisionCertification\s*:\s*false/);
assert.match(collision, /activeBendContact/);
assert.match(collision, /INTERFERENCIA ESTIMADA CON ALAS PREVIAMENTE PLEGADAS/);
assert.match(collision, /no es un CAD 3D de sólidos completo ni una certificación de seguridad/i);
assert.match(collision, /getSelectedToolProfiles\s*\(/);

// The 3D canvas must visually separate prior-flange interference from active
// punch/die contact and identify the machine body as a visual reconstruction.
assert.match(html, /INTERFERENCIA ESTIMADA · MODELO 2D/);
assert.match(html, /CONTACTO ACTIVO · REVISAR PENETRACIÓN/);
assert.match(html, /GEOMETRÍA EXTERIOR: RECONSTRUCCIÓN VISUAL, NO CAD OEM/);
assert.match(html, /Build a thin sheet-metal wall/);
assert.match(html, /getSelectedToolProfiles/);

// Keep the deployed offline shell wired to the same collision/twin modules.
assert.match(sw, /\.\/pp56-collision-review\.js\?v=152/);
assert.match(sw, /\.\/pp59-engineering-upgrade\.js\?v=149/);
assert.match(twin, /collisionCertification|officialVerified|profilePointsMm/);

console.log('Collision UI contract verified: prior-flange interference, active contact, OEM-CAD disclosure, tool-profile integration and offline cache wiring.');
