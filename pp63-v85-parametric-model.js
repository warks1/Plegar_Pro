(function(){
'use strict';
/*
 * PP63 — TRUMABEND V85, reference model for the 2006 configuration.
 * Source dimensions are seller-published, not an OEM CAD file:
 * Vanto Machines, 2006: 2050 mm bending length, 1750 mm between uprights,
 * 410 mm throat, 215 mm max stroke, 2680 x 2100 x 2375 mm envelope, 8900 kg.
 * These are reference dimensions for a parametric visualization, not verified
 * manufacturing geometry. Component shapes remain estimated from public photos.
 */
const SPEC = Object.freeze({
 id:'TRUMPF-TRUMABEND-V85-2006-REFERENCE',
 maker:'TRUMPF', model:'TrumaBend V85', year:2006, forceTonnes:85,
 bendingLengthMm:2050, betweenUprightsMm:1750, throatMm:410, maxStrokeMm:215,
 envelopeMm:{length:2680,width:2100,height:2375}, massKg:8900,
 sourceUrl:'https://www.vantomachines.com/en/trumpf-trumabend-v85-cnc-bending-machine-2006-id10857',
 sourceType:'public used-machine listing; not OEM CAD',
 geometryStatus:'PARAMETRIC_ESTIMATE_NOT_OEM_CAD'
});
function boxMesh(min,max,name){
 const v=[
 [min.x,min.y,min.z],[max.x,min.y,min.z],[max.x,max.y,min.z],[min.x,max.y,min.z],
 [min.x,min.y,max.z],[max.x,min.y,max.z],[max.x,max.y,max.z],[min.x,max.y,max.z]
 ];
 const f=[[0,2,1],[0,3,2],[4,5,6],[4,6,7],[0,1,5],[0,5,4],[1,2,6],[1,6,5],[2,3,7],[2,7,6],[3,0,4],[3,4,7]];
 return {name,vertices:v,triangles:f,source:'estimated envelope-derived box'};
}
function machineMesh(){
 const e=SPEC.envelopeMm, halfL=SPEC.bendingLengthMm/2, halfW=e.width/2;
 const col=SPEC.betweenUprightsMm/2, baseY=120, topY=e.height-180, depth=260;
 return [
  boxMesh({x:-halfL-315,y:0,z:-halfW},{x:-halfL-120,y:topY,z:halfW},'left-side-frame'),
  boxMesh({x:halfL+120,y:0,z:-halfW},{x:halfL+315,y:topY,z:halfW},'right-side-frame'),
  boxMesh({x:-halfL-315,y:topY-220,z:-halfW},{x:halfL+315,y:topY,z:halfW},'upper-crown'),
  boxMesh({x:-halfL-315,y:baseY,z:-halfW},{x:halfL+315,y:baseY+170,z:halfW},'lower-bed'),
  boxMesh({x:-col,y:topY-330,z:-depth/2},{x:col, y:topY-230,z:depth/2},'ram-estimate'),
  boxMesh({x:-col,y:baseY+170,z:-depth/2},{x:col,y:baseY+260,z:depth/2},'table-estimate')
 ];
}
function prismMesh(section,zMin,zMax,name){
 const clean=(section||[]).filter(p=>Number.isFinite(+p.x)&&Number.isFinite(+p.y)).map(p=>[+p.x,+p.y]);
 if(clean.length<3||!Number.isFinite(zMin)||!Number.isFinite(zMax)||zMax<=zMin)return null;
 const n=clean.length,vertices=[];
 clean.forEach(p=>vertices.push([p[0],p[1],zMin]));
 clean.forEach(p=>vertices.push([p[0],p[1],zMax]));
 const triangles=[];
 for(let i=1;i<n-1;i++){triangles.push([0,i+1,i],[n,n+i,n+i+1]);}
 for(let i=0;i<n;i++){const j=(i+1)%n;triangles.push([i,j,n+j],[i,n+j,n+i]);}
 return {name,vertices,triangles,section:clean,zMin,zMax,source:'extruded measured/parametric section'};
}
function bounds(mesh){
 if(!mesh||!mesh.vertices?.length)return null;
 const out={min:{x:Infinity,y:Infinity,z:Infinity},max:{x:-Infinity,y:-Infinity,z:-Infinity}};
 for(const p of mesh.vertices){for(let i=0;i<3;i++){const k=['x','y','z'][i];out.min[k]=Math.min(out.min[k],p[i]);out.max[k]=Math.max(out.max[k],p[i]);}}
 return out;
}
function orient(a,b,c){return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);}
function onSegment(a,b,p,eps=1e-8){return Math.abs(orient(a,b,p))<=eps&&p[0]>=Math.min(a[0],b[0])-eps&&p[0]<=Math.max(a[0],b[0])+eps&&p[1]>=Math.min(a[1],b[1])-eps&&p[1]<=Math.max(a[1],b[1])+eps;}
function edgesCross(a,b,c,d){const o1=orient(a,b,c),o2=orient(a,b,d),o3=orient(c,d,a),o4=orient(c,d,b);return ((o1>0&&o2<0)||(o1<0&&o2>0))&&((o3>0&&o4<0)||(o3<0&&o4>0))||onSegment(a,b,c)||onSegment(a,b,d)||onSegment(c,d,a)||onSegment(c,d,b);}
function inPolygon(p,poly){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if(onSegment(a,b,p))return true;const crosses=((a[1]>p[1])!==(b[1]>p[1]))&&(p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0]);if(crosses)inside=!inside;}return inside;}
function crossSectionOverlap(a,b){
 const A=a?.section,B=b?.section;if(!A||!B||A.length<3||B.length<3)return false;
 for(let i=0;i<A.length;i++)for(let j=0;j<B.length;j++)if(edgesCross(A[i],A[(i+1)%A.length],B[j],B[(j+1)%B.length]))return true;
 return inPolygon(A[0],B)||inPolygon(B[0],A);
}
/*
 * For prismatic solids whose cross-sections are constant along Z, this is an
 * exact 3D intersection test for the modeled prisms: Z intervals must overlap
 * AND their 2D cross-sections must intersect/contain one another.
 */
function intersectPrisms(a,b){
 if(!a||!b)return {intersects:false,reason:'invalid-mesh'};
 const zOverlap=Math.min(a.zMax,b.zMax)-Math.max(a.zMin,b.zMin);
 const sectionOverlap=crossSectionOverlap(a,b);
 return {intersects:zOverlap>1e-8&&sectionOverlap,zOverlapMm:Math.max(0,zOverlap),sectionOverlap,method:'3D-prism intersection (Z interval + cross-section polygon intersection)',geometryStatus:'PARAMETRIC_ESTIMATE_NOT_OEM_CAD'};
}
window.PP63V85Model={SPEC,machineMesh,boxMesh,prismMesh,bounds,intersectPrisms};
})();
