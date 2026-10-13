(function(){
'use strict';
/*
 * PP63 — TRUBEND V85, reference model for the 2006 configuration.
 * Source dimensions are seller-published, not an OEM CAD file:
 * Vanto Machines, 2006: 2050 mm bending length, 1750 mm between uprights,
 * 410 mm throat, 215 mm max stroke, 2680 x 2100 x 2375 mm envelope, 8900 kg.
 * These are reference dimensions for a parametric visualization, not verified
 * manufacturing geometry. Component shapes remain estimated from public photos.
 */
const SPEC = Object.freeze({
 id:'TRUMPF-TRUBEND-V85-2006-REFERENCE',
 maker:'TRUMPF', model:'TruBend V85', year:2006, forceTonnes:85,
 bendingLengthMm:2050, betweenUprightsMm:1750, throatMm:410, maxStrokeMm:215,
 envelopeMm:{length:2680,width:2100,height:2375}, massKg:8900,
 sourceUrl:'https://www.vantomachines.com/en/trumpf-trumabend-v85-cnc-bending-machine-2006-id10857',
 sourceType:'public used-machine listing; not OEM CAD',
 geometryStatus:'PARAMETRIC_ESTIMATE_NOT_OEM_CAD'
});
const BYSTRONIC = Object.freeze({
 id:'BYSTRONIC-XPERT-PRO-100-3100-REFERENCE',
 maker:'Bystronic', model:'Xpert Pro 100/3100', year:null, forceTonnes:100,
 forceKN:1000, bendingLengthMm:3100, betweenUprightsMm:null, throatMm:null, maxStrokeMm:250,
 envelopeMm:{length:3900,width:1900,height:2800}, massKg:12200,
 sourceUrl:'https://bystronic.com/sites/default/files/2026-03/tp007-BE-Techdaten-Xpert%20Pro_es.pdf',
 sourceType:'official Xpert Pro datasheet for 100/3100 capacity and weight; envelope values are estimated, not OEM dimensions',
 geometryStatus:'PARAMETRIC_ESTIMATE_NOT_OEM_CAD'
});
function resolveSpec(id){
 const q=String(id||'').toLowerCase();
 return q.includes('bystronic')||q.includes('xpert')?BYSTRONIC:SPEC;
}
function boxMesh(min,max,name){
 const v=[
 [min.x,min.y,min.z],[max.x,min.y,min.z],[max.x,max.y,min.z],[min.x,max.y,min.z],
 [min.x,min.y,max.z],[max.x,min.y,max.z],[max.x,max.y,max.z],[min.x,max.y,max.z]
 ];
 const f=[[0,2,1],[0,3,2],[4,5,6],[4,6,7],[0,1,5],[0,5,4],[1,2,6],[1,6,5],[2,3,7],[2,7,6],[3,0,4],[3,4,7]];
 return {name,vertices:v,triangles:f,source:'estimated envelope-derived box'};
}
function machineMesh(machineId){
 const spec=resolveSpec(machineId),e=spec.envelopeMm,halfL=spec.bendingLengthMm/2,halfW=e.width/2;
 const col=(spec.betweenUprightsMm||Math.round(spec.bendingLengthMm*.82))/2,baseY=120,topY=e.height-180,depth=260;
 return [
  boxMesh({x:-halfL-315,y:0,z:-halfW},{x:-halfL-120,y:topY,z:halfW},'left-side-frame'),
  boxMesh({x:halfL+120,y:0,z:-halfW},{x:halfL+315,y:topY,z:halfW},'right-side-frame'),
  boxMesh({x:-halfL-315,y:topY-220,z:-halfW},{x:halfL+315,y:topY,z:halfW},'upper-crown'),
  boxMesh({x:-halfL-315,y:baseY,z:-halfW},{x:halfL+315,y:baseY+170,z:halfW},'lower-bed'),
  boxMesh({x:-col,y:topY-330,z:-depth/2},{x:col, y:topY-230,z:depth/2},'ram-estimate'),
  boxMesh({x:-col,y:baseY+170,z:-depth/2},{x:col,y:baseY+260,z:depth/2},'table-estimate')
 ];
}
function triangulateSection(poly){
 const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 const area=poly.reduce((s,p,i)=>s+p[0]*poly[(i+1)%poly.length][1]-poly[(i+1)%poly.length][0]*p[1],0);
 if(Math.abs(area)<1e-10)return [];
 const sign=Math.sign(area),remaining=poly.map((_,i)=>i),out=[];
 const inTriangle=(p,a,b,c)=>{const x=cross(a,b,p)*sign,y=cross(b,c,p)*sign,z=cross(c,a,p)*sign;return x>=-1e-9&&y>=-1e-9&&z>=-1e-9};
 let guard=poly.length*poly.length;
 while(remaining.length>3&&guard-->0){
  let clipped=false;
  for(let k=0;k<remaining.length;k++){
   const ia=remaining[(k+remaining.length-1)%remaining.length],ib=remaining[k],ic=remaining[(k+1)%remaining.length],a=poly[ia],b=poly[ib],c=poly[ic];
   if(cross(a,b,c)*sign<=1e-9)continue;
   let occupied=false;
   for(const ix of remaining){if(ix!==ia&&ix!==ib&&ix!==ic&&inTriangle(poly[ix],a,b,c)){occupied=true;break}}
   if(occupied)continue;
   out.push([ia,ib,ic]);remaining.splice(k,1);clipped=true;break;
  }
  if(!clipped)return [];
 }
 if(remaining.length===3&&Math.abs(cross(poly[remaining[0]],poly[remaining[1]],poly[remaining[2]]))>1e-9)out.push(remaining.slice());
 return out;
}
function prismMesh(section,zMin,zMax,name){
 const raw=(section||[]).filter(p=>Number.isFinite(+p.x)&&Number.isFinite(+p.y)).map(p=>[+p.x,+p.y]),clean=[];
 for(const p of raw){const q=clean[clean.length-1];if(!q||Math.hypot(p[0]-q[0],p[1]-q[1])>1e-8)clean.push(p)}
 if(clean.length>2&&Math.hypot(clean[0][0]-clean[clean.length-1][0],clean[0][1]-clean[clean.length-1][1])<1e-8)clean.pop();
 if(clean.length<3||!Number.isFinite(zMin)||!Number.isFinite(zMax)||zMax<=zMin)return null;
 const n=clean.length,vertices=[];
 clean.forEach(p=>vertices.push([p[0],p[1],zMin]));
 clean.forEach(p=>vertices.push([p[0],p[1],zMax]));
 const cap=triangulateSection(clean);
 if(cap.length!==n-2)return null;
 const triangles=[];
 cap.forEach(t=>{triangles.push([t[0],t[2],t[1]],[n+t[0],n+t[1],n+t[2]])});
 for(let i=0;i<n;i++){const j=(i+1)%n;triangles.push([i,j,n+j],[i,n+j,n+i]);}
 return {name,vertices,triangles,section:clean,zMin,zMax,source:'extruded measured/parametric section; ear-clipped polygon caps'};
}
function segmentPrism(a,b,thickness,zMin,zMax,name){
 const dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy)||1,nx=-dy/L*(Math.max(0,thickness)/2),ny=dx/L*(Math.max(0,thickness)/2);
 return prismMesh([{x:a.x+nx,y:a.y+ny},{x:b.x+nx,y:b.y+ny},{x:b.x-nx,y:b.y-ny},{x:a.x-nx,y:a.y-ny}],zMin,zMax,name||'sheet-segment');
}
function bounds(mesh){
 if(!mesh||!mesh.vertices?.length)return null;
 const out={min:{x:Infinity,y:Infinity,z:Infinity},max:{x:-Infinity,y:-Infinity,z:-Infinity}};
 for(const p of mesh.vertices){for(let i=0;i<3;i++){const k=['x','y','z'][i];out.min[k]=Math.min(out.min[k],p[i]);out.max[k]=Math.max(out.max[k],p[i]);}}
 return out;
}
function orient(a,b,c){return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);}
function onSegment(a,b,p,eps=1e-8){return Math.abs(orient(a,b,p))<=eps&&p[0]>=Math.min(a[0],b[0])-eps&&p[0]<=Math.max(a[0],b[0])+eps&&p[1]>=Math.min(a[1],b[1])-eps&&p[1]<=Math.max(a[1],b[1])+eps;}
function properEdgesCross(a,b,c,d){const o1=orient(a,b,c),o2=orient(a,b,d),o3=orient(c,d,a),o4=orient(c,d,b);return ((o1>1e-8&&o2< -1e-8)||(o1< -1e-8&&o2>1e-8))&&((o3>1e-8&&o4< -1e-8)||(o3< -1e-8&&o4>1e-8));}
function pointInTriangleStrict(p,a,b,c){const x=orient(a,b,p),y=orient(b,c,p),z=orient(c,a,p);return (x>1e-8&&y>1e-8&&z>1e-8)||(x< -1e-8&&y< -1e-8&&z< -1e-8);}
function triangleCentroid(t){return [(t[0][0]+t[1][0]+t[2][0])/3,(t[0][1]+t[1][1]+t[2][1])/3];}
function trianglesOverlapArea(A,B){
 for(const p of A)if(pointInTriangleStrict(p,B[0],B[1],B[2]))return true;
 for(const p of B)if(pointInTriangleStrict(p,A[0],A[1],A[2]))return true;
 if(pointInTriangleStrict(triangleCentroid(A),B[0],B[1],B[2])||pointInTriangleStrict(triangleCentroid(B),A[0],A[1],A[2]))return true;
 for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(properEdgesCross(A[i],A[(i+1)%3],B[j],B[(j+1)%3]))return true;
 return false;
}
function crossSectionOverlap(a,b){
 const A=a?.section,B=b?.section;if(!A||!B||A.length<3||B.length<3)return false;
 const ta=triangulateSection(A),tb=triangulateSection(B);
 if(ta.length!==A.length-2||tb.length!==B.length-2)return false;
 const trisA=ta.map(t=>t.map(i=>A[i])),trisB=tb.map(t=>t.map(i=>B[i]));
 for(const x of trisA)for(const y of trisB)if(trianglesOverlapArea(x,y))return true;
 return false;
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
window.PP63V85Model={SPEC,BYSTRONIC,resolveSpec,machineMesh,boxMesh,prismMesh,segmentPrism,bounds,intersectPrisms};
})();
