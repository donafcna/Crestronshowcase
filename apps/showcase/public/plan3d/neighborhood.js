import * as T from './vendor/three.module.min.js';

// Landscape context stays outside the villa boundary; no changes to camera fitting.
export function buildNeighborhood(scene,height,kit,valley){
 const g=new T.Group();g.name='Alpine neighborhood';scene.add(g);
 const mat=c=>new T.MeshStandardMaterial({color:c,roughness:.95}),road=mat(0x626565),gravel=mat(0x8d8876),meadow=mat(0x73834d),hay=mat(0xb3a168),timber=mat(0x68503d),stone=mat(0xb3ad97),roof=mat(0x555b60),glass=mat(0x41616c),leaf=mat(0x3e5d3d);
 const box=(p,m,x,y,z,w,h,d)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);p.add(o);o.receiveShadow=true;return o;};
 const paths=[],sites=[],fields=[];
 function ribbon(points,width,material,lift=.045){
  const curve=new T.CatmullRomCurve3(points.map(([x,z])=>new T.Vector3(x,0,z))),v=[],ix=[];const samples=280,cross=4;
  for(let n=0;n<=samples;n++){const q=curve.getPoint(n/samples),t=curve.getTangent(n/samples),normal=new T.Vector3(-t.z,0,t.x).normalize().multiplyScalar(width/2);for(let j=0;j<=cross;j++){const sign=j/cross*2-1,x=q.x+normal.x*sign,z=q.z+normal.z*sign;v.push(x,roadHeight(x,z)+lift+.09,z);}if(n<samples)for(let j=0;j<cross;j++){const a=n*(cross+1)+j,b=a+cross+1;ix.push(a,a+1,b,a+1,b+1,b);}}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(v,3));geo.setIndex(ix);geo.computeVertexNormals();const mesh=new T.Mesh(geo,material);mesh.receiveShadow=true;g.add(mesh);paths.push({points:curve.getPoints(160),width});return curve;
 }
 // A deck remains above the stream, smoothly meeting the two road approaches.
 function roadHeight(x,z){const n=valley.nearest(x,z);return n.point&&n.distance<6?Math.max(height(x,z),n.point.level+.85*(1-T.MathUtils.smoothstep(n.distance,3,6))):height(x,z);}
 const lane=ribbon([[-100,61],[-52,48],[0,45],[36,45],[70,56],[110,70]],6.2,road);
 // Shoulders, a restrained dashed centreline, and a short gate approach.
 for(let i=0;i<70;i++){const p=lane.getPoint(i/69),t=lane.getTangent(i/69);if(i%2===0){const dash=box(g,stone,p.x,roadHeight(p.x,p.z)+.16,p.z,.1,.012,1.8);dash.rotation.y=Math.atan2(t.x,t.z);}}
 ribbon([[15.5,39],[15.5,41],[15.5,45]],5.8,road,.12);
 ribbon([[-8,39],[-9,17],[-8,-6],[13,-7],[34,-5],[35,15],[34,39]],1.25,gravel);
 ribbon([[-8,39],[2,40],[10,40]],1.25,gravel);ribbon([[21,40],[28,40],[34,39]],1.25,gravel);
 // Water is supplied by the shared lake/stream plan; no truncated ribbons here.
 // The public road crosses the streams on bridges, never through the water.
 for(const stream of valley.streams){
  let crossing=null,distance=Infinity;
  for(let i=0;i<=500;i++){const p=lane.getPoint(i/500);const d=Math.min(...stream.samples.map(s=>Math.hypot(s.x-p.x,s.z-p.z)));if(d<distance){distance=d;crossing=p;}}
  const {x,z}=crossing,level=roadHeight(x,z);
  box(g,road,x,level-.08,z,6,.25,7);
  for(const side of [-1,1])box(g,stone,x,level+.36,z+side*3.4,6.2,.55,.18);
 }
 function field(x,z,w,d,m){
  fields.push({x,z,w,d,color:m.color.clone()});
  for(let i=0;i<=w;i+=4){const xx=x-w/2+i,zz=z+d/2;box(g,timber,xx,height(xx,zz)+.43,zz,.075,.85,.075);}
  sites.push({x,z,w:w+2,d:d+2});
 }
 field(-48,14,25,23,hay);field(67,16,24,25,meadow);field(2,-17,24,13,meadow);field(28,-19,15,13,hay);
 field(-83,8,30,28,meadow);field(-77,64,32,23,hay);field(-45,83,22,28,meadow);
 field(7,82,42,32,hay);field(36,106,28,24,meadow);field(82,72,30,27,hay);field(106,12,29,28,meadow);
 function chalet(x,z,scale,modern=false){
  const y=height(x,z),h=new T.Group();h.position.set(x,y+.07,z);h.scale.setScalar(scale);g.add(h);sites.push({x,z,w:12*scale,d:11*scale});
  const lowest=Math.min(...[-4,4].flatMap(dx=>[-3,3].map(dz=>height(x+dx*scale,z+dz*scale))));
  const foundationDepth=Math.max(.5,(y-lowest)/scale+.65);
  box(h,stone,0,.5-foundationDepth/2,0,8,foundationDepth,6);box(h,modern?stone:timber,0,2.1,0,7.5,3.7,5.5);
  for(const sx of [-2.4,0,2.4]){box(h,glass,sx,1.85,2.77,1.8,2.4,.03);box(h,stone,sx,1.05,2.81,1.9,.09,.1);}
  box(h,timber,0,.48,3.25,8.2,.16,1.8);for(const sx of [-3.8,-2,0,2,3.8])box(h,timber,sx,1.03,4,.08,1.12,.08);box(h,timber,0,1.59,4,7.7,.07,.1);
  for(const sx of [-3.8,3.8]){const bottom=height(x+sx*scale,z+4*scale),top=y+.5*scale;box(g,timber,x+sx*scale,(bottom+top)/2,z+4*scale,.13*scale,Math.max(.1,top-bottom),.13*scale);}
  for(let n=0;n<7;n++){const zz=z+(4.15+n*.3)*scale,base=height(x,zz),top=T.MathUtils.lerp(y+.56*scale,height(x,z+6.2*scale)+.12,n/7);if(top>base)box(g,stone,x,(base+top)/2,zz,1.2*scale,top-base,.32*scale);}
  for(const side of [-1,1]){const plane=box(h,roof,side*2.15,4.3,0,4.9,.18,6.7);plane.rotation.z=-side*.36;}
  box(h,stone,2.2,4.7,-1.3,.65,1.8,.65);box(h,darkRoof,2.2,5.63,-1.3,.8,.09,.8);
  // Narrow paths skirt the lakes, descend the slope and end on the public road.
  // No beige ribbon starts at an arbitrary point on the mountainside.
  const via=z<-35?(x<0?[[-39,-40],[-48,-32],[-49,-16],[-44,14]]:x<20?[[-11,-43],[-17,-33],[-18,-17],[-14,9],[-13,34]]:[[62,-40],[68,-30],[69,-12],[64,22]]):[[x+3,z+7*scale]];
  const last=via.at(-1);let endpoint=null,nearest=Infinity;
  for(let i=0;i<=500;i++){const p=lane.getPoint(i/500),d=Math.hypot(last[0]-p.x,last[1]-p.z);if(d<nearest){nearest=d;endpoint=[p.x,p.z];}}
  ribbon([[x,z+6.2*scale],...via,endpoint],z<-35?.8:1.4,gravel);
 }
 const darkRoof=mat(0x323b40);
 chalet(-45,-11,1);chalet(64,-8,.95,true);chalet(-63,31,1.05);chalet(85,33,1.1,true);
 // More distant chalets sit on measured terrain elevations, not floating scenery.
 chalet(-24,-46,.75);chalet(48,-48,.7);chalet(4,-53,.58);
 function deciduous(x,z,s){
  const y=height(x,z);box(g,timber,x,y+s*1.2,z,.22,s*2.4,.22);
  for(let k=0;k<3;k++){const crown=new T.Mesh(new T.IcosahedronGeometry(s*(.95-k*.15),1),leaf);crown.position.set(x+Math.sin(k*3)*s*.25,y+s*(2+k*.35),z);crown.scale.y=.78;g.add(crown);}
 }
 for(let i=0;i<13;i++){deciduous(-13,37-i*3.8,.9+(i%3)*.14);deciduous(38,37-i*3.8,.8+(i%4)*.12);}
 // Merge fixed scenery by material; hundreds of details become a few draw calls.
 kit.batch(g);
 return {group:g,sites,fields,reserved(x,z){return valley.wet(x,z,1.3)||sites.some(s=>Math.abs(x-s.x)<s.w/2&&Math.abs(z-s.z)<s.d/2)||paths.some(({points,width})=>points.some(p=>(x-p.x)**2+(z-p.z)**2<(width/2+1)**2));}};
}
