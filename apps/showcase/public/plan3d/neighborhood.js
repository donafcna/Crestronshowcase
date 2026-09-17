import * as T from './vendor/three.module.min.js';

// Landscape context stays outside the villa boundary; no changes to camera fitting.
export function buildNeighborhood(scene,height,kit){
 const g=new T.Group();g.name='Alpine neighborhood';scene.add(g);
 const mat=c=>new T.MeshStandardMaterial({color:c,roughness:.95}),road=mat(0x626565),gravel=mat(0xb7af96),meadow=mat(0x718553),hay=mat(0x9b9964),earth=mat(0x8e866b),water=mat(0x498786),timber=mat(0x68503d),stone=mat(0xb3ad97),roof=mat(0x555b60),glass=mat(0x41616c),leaf=mat(0x3e5d3d);
 const box=(p,m,x,y,z,w,h,d)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);p.add(o);o.receiveShadow=true;return o;};
 const paths=[],sites=[],fields=[];
 function ribbon(points,width,material,lift=.045){
  const curve=new T.CatmullRomCurve3(points.map(([x,z])=>new T.Vector3(x,0,z))),v=[],ix=[];const samples=280,cross=4;
  for(let n=0;n<=samples;n++){const q=curve.getPoint(n/samples),t=curve.getTangent(n/samples),normal=new T.Vector3(-t.z,0,t.x).normalize().multiplyScalar(width/2);for(let j=0;j<=cross;j++){const sign=j/cross*2-1,x=q.x+normal.x*sign,z=q.z+normal.z*sign;v.push(x,height(x,z)+lift+.09,z);}if(n<samples)for(let j=0;j<cross;j++){const a=n*(cross+1)+j,b=a+cross+1;ix.push(a,a+1,b,a+1,b+1,b);}}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(v,3));geo.setIndex(ix);geo.computeVertexNormals();const mesh=new T.Mesh(geo,material);mesh.receiveShadow=true;g.add(mesh);paths.push({curve,width});return curve;
 }
 const lane=ribbon([[-100,61],[-52,48],[0,45],[36,45],[70,56],[110,70]],6.2,road);
 // Shoulders, a restrained dashed centreline, and a short gate approach.
 for(let i=0;i<70;i++){const p=lane.getPoint(i/69),t=lane.getTangent(i/69);if(i%2===0){const dash=box(g,stone,p.x,height(p.x,p.z)+.16,p.z,.1,.012,1.8);dash.rotation.y=Math.atan2(t.x,t.z);}}
 ribbon([[15.5,39],[15.5,41],[15.5,45]],5.8,road,.12);
 ribbon([[-8,39],[-9,17],[-8,-6],[13,-7],[34,-5],[35,15],[34,39]],1.25,gravel);
 ribbon([[-8,39],[2,40],[10,40]],1.25,gravel);ribbon([[21,40],[28,40],[34,39]],1.25,gravel);
 // Quiet streams serve as buffers between the estate and neighboring plots.
 for(const points of [[[-26,74],[-24,46],[-20,23],[-25,0],[-21,-30],[-30,-55]],[[48,73],[46,38],[45,16],[41,-8],[48,-34]]]){
  ribbon(points,3.3,earth,.04);ribbon(points,1.35,water,.09);
 }
 // The public road crosses the streams on bridges, never through the water.
 for(const [x,z] of [[-24,46],[47,49]]){
  box(g,road,x,height(x,z)+.34,z,4.8,.27,7);
  for(const side of [-1,1])box(g,stone,x,height(x,z)+.63,z+side*3.4,4.9,.36,.18);
 }
 function field(x,z,w,d,m){
  fields.push({x,z,w,d,color:m.color.clone()});
  for(let i=0;i<=w;i+=4){const xx=x-w/2+i,zz=z+d/2;box(g,timber,xx,height(xx,zz)+.43,zz,.075,.85,.075);}
  sites.push({x,z,w:w+2,d:d+2});
 }
 field(-48,14,25,23,hay);field(67,16,24,25,meadow);field(2,-17,24,13,meadow);field(28,-19,15,13,hay);
 function chalet(x,z,scale,modern=false){
  const y=height(x,z),h=new T.Group();h.position.set(x,y+.07,z);h.scale.setScalar(scale);g.add(h);sites.push({x,z,w:12*scale,d:11*scale});
  box(h,stone,0,.25,0,8,.5,6);box(h,modern?stone:timber,0,2.1,0,7.5,3.7,5.5);
  for(const sx of [-2.4,0,2.4]){box(h,glass,sx,1.85,2.77,1.8,2.4,.03);box(h,stone,sx,1.05,2.81,1.9,.09,.1);}
  box(h,timber,0,.48,3.25,8.2,.16,1.8);for(const sx of [-3.8,-2,0,2,3.8])box(h,timber,sx,1.03,4,.08,1.12,.08);box(h,timber,0,1.59,4,7.7,.07,.1);
  for(const side of [-1,1]){const plane=box(h,roof,side*2.15,4.3,0,4.9,.18,6.7);plane.rotation.z=-side*.36;}
  box(h,stone,2.2,4.7,-1.3,.65,1.8,.65);box(h,darkRoof,2.2,5.63,-1.3,.8,.09,.8);
  const accessX=x<15?-34:55;
  ribbon(z<-35?[[x,z+4*scale],[x,z+8*scale],[accessX,-28],[accessX,-5],[accessX,45]]:[[x,z+4*scale],[x+4,z+10*scale],[x+9,45]],2.2,gravel);
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
 return {group:g,sites,fields,reserved(x,z){return sites.some(s=>Math.abs(x-s.x)<s.w/2&&Math.abs(z-s.z)<s.d/2)||paths.some(({curve,width})=>{for(let i=0;i<=35;i++){const p=curve.getPoint(i/35);if(Math.hypot(x-p.x,z-p.z)<width/2+1)return true;}return false;});}};
}
