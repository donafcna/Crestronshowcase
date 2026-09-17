import * as T from './vendor/three.module.min.js';

// One shared definition for terrain carving, water meshes and vegetation exclusions.
export function createValley(baseHeight) {
  const lakes=[
    {name:'Lac des Mélèzes',x:-34,z:-26,rx:10,rz:7,level:4.4},
    {name:'Lac des Roches',x:54,z:-23,rx:10,rz:6.5,level:4.6}
  ];
  const streams=lakes.map((lake,i)=>{
    const points=i===0?[[lake.x,lake.z+2],[-32,-18],[-27,-9],[-25,0],[-20,23],[-24,46],[-26,74],[-32,112],[-36,150]]:
      [[lake.x,lake.z+2],[52,-15],[46,-7],[41,4],[45,16],[46,38],[48,73],[57,115],[60,150]];
    const curve=new T.CatmullRomCurve3(points.map(([x,z])=>new T.Vector3(x,0,z))),samples=[];
    for(let n=0;n<=360;n++){
      const t=n/360,p=curve.getPoint(t),tangent=curve.getTangent(t);
      // Monotonic hydraulic profile: steep outlet, then a gentle valley stream.
      const drop=T.MathUtils.smoothstep(p.z,lake.z+3,8);
      p.y=T.MathUtils.lerp(lake.level-.015,-.82,drop)-Math.max(0,p.z-8)*.003;
      samples.push({x:p.x,z:p.z,level:p.y,normal:new T.Vector2(-tangent.z,tangent.x).normalize()});
    }
    return {lake,curve,samples};
  });
  const cells=new Map(),cellSize=8;
  streams.forEach(s=>s.samples.forEach(p=>{const key=Math.floor(p.x/cellSize)+','+Math.floor(p.z/cellSize);if(!cells.has(key))cells.set(key,[]);cells.get(key).push(p);}));
  function nearest(x,z){
    let distance=Infinity,point=null;const cx=Math.floor(x/cellSize),cz=Math.floor(z/cellSize);
    for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)for(const p of cells.get((cx+dx)+','+(cz+dz))||[]){const d=(x-p.x)**2+(z-p.z)**2;if(d<distance){distance=d;point=p;}}
    return {distance:Math.sqrt(distance),point};
  }
  function radius(l,x,z){const a=Math.atan2((z-l.z)/l.rz,(x-l.x)/l.rx);return Math.hypot((x-l.x)/l.rx,(z-l.z)/l.rz)/(1+.065*Math.sin(a*3)+.045*Math.cos(a*5));}
  function height(x,z){
    let h=baseHeight(x,z);
    for(const lake of lakes){
      const r=radius(lake,x,z);
      if(r<.98)h=lake.level-.3-2.1*(1-r*r);
      else if(r<1.55)h=T.MathUtils.lerp(lake.level+.13,h,T.MathUtils.smoothstep(r,.98,1.55));
    }
    const n=nearest(x,z);
    if(n.point&&n.distance<3.8){const bed=n.point.level-.43,weight=1-T.MathUtils.smoothstep(n.distance,1.25,3.8);h=T.MathUtils.lerp(h,bed,weight);}
    return h;
  }
  const wet=(x,z,margin=0)=>lakes.some(l=>radius(l,x,z)<1+margin/Math.min(l.rx,l.rz))||nearest(x,z).distance<1.8+margin;
  return {lakes,streams,height,wet,radius,nearest};
}

export function buildValleyWater(parent,valley,surfaceHeight,kit){
  const water=new T.MeshStandardMaterial({vertexColors:true,roughness:.32,metalness:.18,side:T.DoubleSide});
  const shallows=new T.MeshStandardMaterial({color:0x89a8a0,roughness:.75});
  const stone=new T.MeshStandardMaterial({color:0x858d7c,roughness:1});
  const foam=new T.MeshStandardMaterial({color:0xb9cbc1,roughness:.6});
  const details=new T.Group();parent.add(details);const rand=kit.random;
  for(const lake of valley.lakes){
    const vertices=[lake.x,lake.level,lake.z],colors=new T.Color(0x365e68).toArray(),indices=[],segments=96;
    for(let n=0;n<=segments;n++){const a=n/segments*Math.PI*2,r=1+.065*Math.sin(a*3)+.045*Math.cos(a*5);vertices.push(lake.x+Math.cos(a)*lake.rx*r,lake.level,lake.z+Math.sin(a)*lake.rz*r);colors.push(...new T.Color(0x598c88).toArray());if(n<segments)indices.push(0,n+2,n+1);}
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.setIndex(indices);geo.computeVertexNormals();const mesh=new T.Mesh(geo,water);mesh.name=lake.name;mesh.userData.lake={...lake};parent.add(mesh);
    // A stony edge and reeds soften the engineered basin without covering its outlet.
    for(let n=0;n<55;n++){const a=n/55*Math.PI*2,r=1.03+.065*Math.sin(a*3)+.045*Math.cos(a*5),x=lake.x+Math.cos(a)*lake.rx*r,z=lake.z+Math.sin(a)*lake.rz*r;if(valley.nearest(x,z).distance<2.5)continue;
      const b=new T.Mesh(new T.IcosahedronGeometry(.22+rand()*.35,0),stone);b.position.set(x,surfaceHeight(x,z)+.12,z);b.scale.set(1.6,.65,1);details.add(b);
      if(n%3===0)for(let k=0;k<4;k++){const reed=new T.Mesh(new T.BoxGeometry(.035,.55+rand()*.25,.035),kit.materials.oak);reed.position.set(x+(rand()-.5)*.35,surfaceHeight(x,z)+.3,z+(rand()-.5)*.35);details.add(reed);}
    }
  }
  for(const stream of valley.streams){
    const v=[],ix=[],colors=[];
    stream.samples.forEach((p,n)=>{
      const width=.92+.22*Math.sin(n*.13)+.1*Math.sin(n*.41),tint=new T.Color(0x467f84).lerp(new T.Color(0x698f88),.22+.16*Math.sin(n*.09));
      for(const side of [-1,1]){v.push(p.x+p.normal.x*width*side,p.level,p.z+p.normal.y*width*side);colors.push(tint.r,tint.g,tint.b);}
      if(n<stream.samples.length-1){const a=n*2;ix.push(a,a+2,a+1,a+1,a+2,a+3);}
      if(n%13===0&&n>4&&p.z<7){
        const rock=new T.Mesh(new T.IcosahedronGeometry(.55,0),stone);rock.position.set(p.x+p.normal.x*1.3,p.level-.12,p.z+p.normal.y*1.3);rock.scale.set(1,.5,1.4);details.add(rock);
        // Small irregular flecks beside a rock, never white bars across the flow.
        for(let k=0;k<4;k++){const ripple=new T.Mesh(new T.CircleGeometry(.025+rand()*.04,5),foam);ripple.rotation.x=-Math.PI/2;ripple.position.set(p.x+p.normal.x*(.7+rand()*.3)+(rand()-.5)*.18,p.level+.025,p.z+p.normal.y*.8+rand()*.25);details.add(ripple);}
      }
    });
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(v,3));geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.setIndex(ix);geo.computeVertexNormals();const m=new T.Mesh(geo,new T.MeshStandardMaterial({vertexColors:true,roughness:.38,metalness:.18,side:T.DoubleSide}));m.name='Ruisseau depuis '+stream.lake.name;parent.add(m);
  }
  // Low, stable reflective bands suggest ripples without another per-frame pass.
  for(const lake of valley.lakes)for(let n=0;n<7;n++){
    const geo=new T.RingGeometry(1+n*.43,1.012+n*.43,48,1,.12,1.7),r=new T.Mesh(geo,shallows);r.rotation.x=-Math.PI/2;r.scale.set(1,.4,1);r.position.set(lake.x-2,lake.level+.016,lake.z-1);details.add(r);
  }
  kit.batch(details);
}
