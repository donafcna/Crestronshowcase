import * as T from './vendor/three.module.min.js';

// Static scenery: three instanced batches, no downloaded assets, shadows or crowd animation.
export function buildSportsVenue(scene, kind) {
  const root=new T.Group(),batches=new Map(),textures=[],boards=[];
  const boxGeo=new T.BoxGeometry(1,1,1),headGeo=new T.IcosahedronGeometry(1,0);
  const surface=new T.MeshLambertMaterial({color:0xffffff});
  const palette=[0x273b53,0xc3b69d,0x944b45,0x718b90,0xd4cebc,0x414b5d,0x557561];
  let spectators=0,stands=0,seed=1709;
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  function item(parent,geo,color,x,y,z,w,h,d,angle=0){
    const o=new T.Object3D();o.position.set(x,y,z);o.scale.set(w,h,d);o.rotation.y=angle;o.userData={geo,color};parent.add(o);return o;
  }
  const box=(p,c,x,y,z,w,h,d,a=0)=>item(p,boxGeo,c,x,y,z,w,h,d,a);
  function stand(length,rows,x,z,yaw,seatColor,roof=false){
    stands++;const g=new T.Group();g.position.set(x,0,z);g.rotation.y=yaw;root.add(g);
    for(let r=0;r<rows;r++){
      const y=.48+r*.53,depth=r*.83;
      box(g,0xa2a49e,0,y/2,depth,length,y,.83);
      for(let n=0;n<Math.floor(length/.78);n++){
        const sx=-length/2+.5+n*.78;
        if(n%14<2)continue; // Visible access stairs break up the seating blocks.
        box(g,seatColor,sx,y+.17,depth,.56,.14,.43);
        box(g,seatColor,sx,y+.39,depth+.2,.56,.44,.08);
        if(random()<.13)continue;
        const c=palette[Math.floor(random()*palette.length)],h=.39+random()*.15;
        box(g,c,sx,y+.23+h/2,depth-.04,.31,h,.23);
        item(g,headGeo,random()>.45?0xbc9172:0x785746,sx,y+.29+h,depth-.04,.13,.16,.13);
        spectators++;
      }
    }
    const back=(rows-1)*.83,height=.48+(rows-1)*.53;
    box(g,0x30414b,0,height+.45,back+.45,length,.9,.18);
    for(let x=-length/2;x<=length/2;x+=6){
      box(g,0xc7ccca,x,.62,-.56,.07,1.24,.07);
      if(roof){box(g,0x505c62,x,(height+3)/2,back+.55,.2,height+3,.2);box(g,0xc0c7c8,x,height+2.8,back/2,.15,.18,back+2.4);}
    }
    box(g,0xc7ccca,0,1.15,-.56,length,.055,.065);
    if(roof){box(g,0xd1d3cb,0,height+3,back/2,length+1,.18,back+2.8);box(g,0x333e49,0,height+2.78,back/2,length+1,.1,back+2.7);}
  }
  function board(text,sub,x,y,z,width=9,yaw=0){
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=160;
    const c=canvas.getContext('2d');c.fillStyle='#10242b';c.fillRect(0,0,512,160);c.fillStyle='#66d8c5';c.fillRect(0,0,512,7);
    c.textAlign='center';c.fillStyle='#ffffff';c.font='bold 34px Arial';c.fillText(text,256,67);c.fillStyle='#bcd8dc';c.font='22px Arial';c.fillText(sub,256,114);
    const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;textures.push(tex);
    const m=new T.Mesh(new T.PlaneGeometry(width,width*160/512),new T.MeshBasicMaterial({map:tex,side:T.DoubleSide}));m.position.set(x,y,z);m.rotation.y=yaw;scene.add(m);boards.push(m);
    box(root,0x1e2932,x,y-.13,z-.15,width+.25,width*160/512+.28,.24,yaw);
  }
  function lights(x,z,height=12){
    box(root,0x77868c,x,height/2,z,.22,height,.22);
    box(root,0x31464f,x,height,z,2.6,.82,.22);
    for(let i=0;i<5;i++)box(root,0xf5f4d8,x-1+i*.5,height,z+.14,.34,.5,.06);
  }
  function hoardings(length,x,z,yaw){
    const g=new T.Group();g.position.set(x,0,z);g.rotation.y=yaw;root.add(g);
    for(let i=0;i<length;i+=3.2){box(g,i%6.4===0?0x14767a:0x172f50,-length/2+i+1.6,.4,0,3.1,.75,.1);box(g,0xb3cece,-length/2+i+1.6,.5,-.06,1.65,.07,.015);}
  }
  if(kind===3){
    box(root,0x38584b,0,-.23,0,48,.12,57);
    box(root,0xa96e4e,0,-.065,0,15,.07,30);
    stand(34,8,-8.8,0,-Math.PI/2,0x365653,true);
    stand(34,7,8.8,0,Math.PI/2,0x365653,false);
    stand(18,7,0,-16.5,Math.PI,0x365653,false);
    stand(18,3,0,16.5,0,0x365653,false);
    hoardings(30,-7.6,0,-Math.PI/2);hoardings(30,7.6,0,Math.PI/2);
    hoardings(14,0,-15.3,Math.PI);hoardings(14,0,15.3,0);
    board('CENTRE COURT','6  4  30     /     4  6  15',0,6.4,-21,10);
    // Umpire chair, player benches and ball crew outside the doubles lines.
    box(root,0xe0dfc9,-6.7,1.1,0,.65,2.2,.7);box(root,0x163d45,-6.7,2.3,0,.8,.2,.85);
    for(const z of [-5,5]){box(root,0xe1dfca,6.65,.45,z,.6,.18,2.5);box(root,0x284b52,7,.8,z,.09,.8,2.5);}
    for(const x of [-19,19])for(const z of [-21,21])lights(x,z,11);
  }else if(kind===2){
    box(root,0x405946,0,-.22,0,78,.2,60);
    box(root,0x2f6550,0,-.12,0,46,.12,32);
    stand(49,10,0,-16.6,Math.PI,0x405b73,true);
    stand(49,4,0,16.6,0,0x405b73,false);
    stand(33,8,-24.5,0,-Math.PI/2,0x8d413e,true);
    stand(33,6,24.5,0,Math.PI/2,0x8d413e,false);
    hoardings(42,0,-14,Math.PI);hoardings(42,0,14,0);
    hoardings(27,-22,0,-Math.PI/2);hoardings(27,22,0,Math.PI/2);
    board('MONTANA   2 : 1   ALPES','72:18     GRAND MONTANA CUP',0,8,-26,13);
    for(const x of [-33,33])for(const z of [-24,24])lights(x,z,14);
    for(const x of [-9,9]){box(root,0x293e4c,x,.5,-13.1,5,.5,.6);box(root,0xc3cbc8,x,1.85,-13.5,5.6,.12,1.3);for(const dx of [-2.65,2.65])box(root,0x6f818b,x+dx,1,-13.5,.1,2,.1);}
    // Penalty areas, six-yard boxes, centre spot and corner flags.
    for(const s of [-1,1]){
      for(const [depth,half] of [[6,7.4],[2.6,4.5]]){
        box(root,0xebe9d8,s*(19-depth),.035,0,.07,.02,half*2);
        for(const z of [-half,half])box(root,0xebe9d8,s*(19-depth/2),.035,z,depth,.02,.07);
      }
      for(const z of [-12,12]){box(root,0xf4e7c6,s*19,.65,z,.04,1.3,.04);box(root,0xe3bf48,s*19+.16,1.18,z,.3,.22,.035);}
    }
    box(root,0xebe9d8,0,.035,0,.19,.02,.19);
  }else if(kind===1){
    box(root,0x63754f,0,-.27,0,87,.1,74);
    stand(43,8,0,-25,Math.PI,0xa1403d,true);
    stand(31,3,0,18.6,0,0x46667b,false);
    stand(25,6,-27,0,-Math.PI/2,0x46667b,true);
    stand(25,5,27,0,Math.PI/2,0xa1403d,false);
    // Runoff, armco and safety fencing stay outside the racing surface.
    for(let n=0;n<100;n++){
      const a=n/100*Math.PI*2,x=24.8*Math.cos(a),z=16.6*Math.sin(a),yaw=Math.atan2(-16.6*Math.cos(a),-24.8*Math.sin(a));
      box(root,0xc9c5ac,x,-.035,z,1.55,.05,2.5,yaw);
      box(root,n%10<5?0xd7d7cc:0x973d35,x,.37,z,1.45,.64,.16,yaw);
      if(n%3===0){box(root,0x718183,x,1.32,z,.075,2,.075);}
    }
    box(root,0x5b6469,0,.015,-19.9,36,.07,4);
    for(let i=0;i<9;i++){
      const x=-14.4+i*3.6;
      box(root,0xc4c6bd,x,1.8,-22.1,3.5,3.6,3.5);
      box(root,0x283d46,x,1.28,-20.32,2.9,2.5,.045);
      box(root,[0xb94538,0x2e6a83,0xd4a446][i%3],x,2.9,-20.27,3,.33,.07);
      box(root,0x627f86,x,3.1,-20.31,2.8,.45,.05);
    }
    box(root,0xddd9ca,0,3.72,-21.9,34,.2,4.5);
    box(root,0x3b5058,0,4.6,-22.6,27,1.65,2.1);
    box(root,0x8ca3a7,0,4.8,-21.53,26,.9,.04);
    // Start line, bridge with race timing and striped infield landscaping.
    for(let i=0;i<12;i++)for(let j=0;j<2;j++)box(root,(i+j)%2?0xe4e2d5:0x2b3237,(j-.5)*.45,.022,-14+(i+.5)*.67,.45,.03,.67);
    for(const z of [-15.5,-4.7])box(root,0x454f55,0,2.7,z,.22,5.4,.22);
    box(root,0x434e55,0,5.4,-10.1,.4,.6,11.5);
    board('GRAND PRIX','LAP  18 / 52      LIVE',-6,8.2,-27.4,13);
    for(const x of [-34,34])for(const z of [-23,23])lights(x,z,12);
    for(let i=0;i<7;i++)box(root,i%2?0x536d44:0x647b4c,-9+i*3,.015,0,3,.02,7);
  }
  root.updateMatrixWorld(true);
  root.traverse(o=>{if(!o.userData.geo)return;const key=o.userData.geo;if(!batches.has(key))batches.set(key,[]);batches.get(key).push({matrix:o.matrixWorld.clone(),color:o.userData.color});});
  const instances=[];
  batches.forEach((items,geo)=>{const m=new T.InstancedMesh(geo,surface,items.length);items.forEach((o,i)=>{m.setMatrixAt(i,o.matrix);m.setColorAt(i,new T.Color(o.color));});m.instanceMatrix.needsUpdate=true;m.instanceColor.needsUpdate=true;m.computeBoundingSphere();scene.add(m);instances.push(m);});
  return {
    metrics:{stands,spectators,staticDrawCalls:instances.length+boards.length,instances:instances.reduce((s,m)=>s+m.count,0)},
    dispose(){instances.forEach(m=>m.dispose());boxGeo.dispose();headGeo.dispose();surface.dispose();textures.forEach(t=>t.dispose());boards.forEach(b=>{b.geometry.dispose();b.material.dispose();});}
  };
}
