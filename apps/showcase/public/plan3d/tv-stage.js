import * as T from './vendor/three.module.min.js';
import { buildSportsVenue } from './tv-venues.js?v=2026-09-17-stadiums-1';

// One small render target, shared by the visible television. No video downloads,
// extra WebGL context, shadows or post-processing; 10–15 updates/second.
export function createTVStage(renderer) {
  const target=new T.WebGLRenderTarget(640,360,{depthBuffer:true,stencilBuffer:false});
  target.samples=2;
  target.texture.name='Live 3D television';
  const boxGeo=new T.BoxGeometry(1,1,1),ballGeo=new T.SphereGeometry(1,12,8),coneGeo=new T.ConeGeometry(1,1,8);
  const materials=new Map(),scenes=new Map(),clearColor=new T.Color();let draws=0,currentKind='film';
  const material=color=>{if(!materials.has(color))materials.set(color,new T.MeshLambertMaterial({color}));return materials.get(color);};
  function mesh(g,geo,color,x,y,z,w,h=w,d=w){const m=new T.Mesh(geo,material(color));m.position.set(x,y,z);m.scale.set(w,h,d);g.add(m);return m;}
  const box=(g,c,x,y,z,w,h,d)=>mesh(g,boxGeo,c,x,y,z,w,h,d);
  const ball=(g,c,x,y,z,r)=>mesh(g,ballGeo,c,x,y,z,r);
  function person(g,color,x,z){const p=new T.Group();p.position.set(x,0,z);g.add(p);box(p,color,0,.75,0,.38,.52,.22);ball(p,0xd0a17c,0,1.12,0,.15);for(const s of [-1,1])box(p,0x273039,s*.11,.27,0,.12,.5,.13);return p;}
  function create(kind){
    const scene=new T.Scene();scene.background=new T.Color(kind===0?0xadc3ca:0x849ba8);scene.fog=new T.Fog(scene.background,kind?95:45,kind?180:125);
    scene.add(new T.HemisphereLight(0xeaf4ff,0x3b4031,2));const sun=new T.DirectionalLight(0xffdfb6,2.3);sun.position.set(-15,30,10);scene.add(sun);
    const camera=new T.PerspectiveCamera(43,16/9,.1,180),objects=[];
    if(kind===0){
      box(scene,0x3e797b,0,-.2,0,130,.2,110);
      for(let i=0;i<18;i++){const x=(i%9)*11-44,z=-18-Math.floor(i/9)*20,h=12+(i*7)%20;mesh(scene,coneGeo,i%3?0x668079:0xd5ded7,x,h/2-1,z,12,h,10);}
      box(scene,0x606964,0,2,0,100,.3,2.4);for(let x=-45;x<=45;x+=6)box(scene,0x858a7c,x,.7,0,.9,2.6,1.5);
      for(let i=0;i<5;i++){const carriage=new T.Group();scene.add(carriage);box(carriage,0xb83e31,0,3.1,0,4.3,1.6,1.65);box(carriage,0xdbd9c9,0,4,0,4.5,.18,1.8);for(let k=0;k<5;k++)box(carriage,0x233f51,-1.7+k*.8,3.3,.84,.55,.65,.03);objects.push(carriage);}
      camera.position.set(16,12,27);camera.lookAt(0,3,0);
    }else if(kind===1){
      box(scene,0x526b38,0,-.2,0,70,.2,55);
      const shape=new T.Shape();shape.absellipse(0,0,22,14,0,Math.PI*2,false);const hole=new T.Path();hole.absellipse(0,0,14,6,0,Math.PI*2,true);shape.holes.push(hole);
      const road=new T.Mesh(new T.ShapeGeometry(shape,64),material(0x42474d));road.rotation.x=-Math.PI/2;scene.add(road);
      for(let i=0;i<64;i++){const a=i/64*Math.PI*2;const kerb=box(scene,i%2?0xf1e9db:0xc04b3c,22*Math.cos(a),.035,14*Math.sin(a),.7,.08,.28);kerb.rotation.y=-a;}
      for(let i=0;i<7;i++){const car=new T.Group();scene.add(car);box(car,[0xd44330,0x28a4a7,0xe7a62c,0x1e4780][i%4],0,.36,0,.8,.35,1.8);box(car,0x1b2429,0,.68,-.15,.4,.22,.5);for(const x of [-.52,.52])for(const z of [-.55,.55])box(car,0x121719,x,.22,z,.3,.44,.38);box(car,0x181e25,0,.33,.82,1.3,.08,.18);objects.push(car);}
      camera.position.set(38,30,43);camera.lookAt(0,1,-2);
    }else if(kind===2){
      for(let i=0;i<10;i++)box(scene,i%2?0x427d43:0x4d8a49,-18+i*4,-.025,0,4,.05,26);
      for(const z of [-12,12])box(scene,0xeaece0,0,.02,z,38,.025,.06);for(const x of [-19,0,19])box(scene,0xeaece0,x,.02,0,.06,.025,24);
      const circle=new T.Mesh(new T.RingGeometry(3.2,3.25,48),material(0xeaece0));circle.rotation.x=-Math.PI/2;circle.position.y=.025;scene.add(circle);
      for(const side of [-1,1]){
        for(const z of [-3,3])box(scene,0xeaece0,side*19,1.5,z,.12,3,.12);box(scene,0xeaece0,side*19,3,0,.12,.12,6.1);
        for(let n=0;n<8;n++)box(scene,0xb6c5be,side*19.5,1.5,-3+n*.85,.035,3,.035);
      }
      for(let team=0;team<2;team++)for(let i=0;i<11;i++)objects.push(person(scene,team?0xeceadf:0xb83c35,-14+(i%4)*7+team*2,-9+Math.floor(i/4)*8));
      objects.push(ball(scene,0xf5f3df,0,.2,0,.22));camera.position.set(31,31,41);camera.lookAt(0,1,0);
    }else{
      box(scene,0x45674e,0,-.15,0,32,.2,42);box(scene,0xb5714f,0,-.015,0,12,.025,25);
      for(const x of [-5,-3.8,3.8,5])box(scene,0xf2ebd7,x,.012,0,.045,.02,23);
      for(const z of [-11.5,-6,6,11.5])box(scene,0xf2ebd7,0,.012,z,10,.02,.045);box(scene,0xf2ebd7,0,.012,0,.045,.02,12);
      for(let x=-6;x<=6;x+=.35)box(scene,0x37443e,x,.65,0,.012,1.3,.012);for(const y of [.1,.4,.7,1,1.3])box(scene,0xb4b9a5,0,y,0,12,.018,.018);
      for(const z of [-9,9]){const player=person(scene,z<0?0xe6e0cf:0x385589,0,z);const racket=new T.Mesh(new T.TorusGeometry(.29,.018,5,16),material(0xdfdacc));racket.position.set(.53,.8,0);player.add(racket);objects.push(player);}
      box(scene,0xf2ebd7,0,1.32,0,12,.055,.035);
      objects.push(ball(scene,0xd9e955,0,.4,0,.13));camera.position.set(22,22,31);camera.lookAt(0,1.1,0);
    }
    const venue=kind?buildSportsVenue(scene,kind):null;
    const item={scene,camera,objects,venue};scenes.set(kind,item);return item;
  }
  return {
    texture:target.texture,
    render(source,time,channel=0){
      const kind=(source-1+channel)%4,{scene,camera,objects}=scenes.get(kind)||create(kind);currentKind=['film','race','football','tennis'][kind];
      if(kind===0){const x=(time*2.4)%70-35;objects.forEach((o,i)=>o.position.x=x-i*4.7);camera.position.x=12+Math.sin(time*.12)*5;camera.lookAt(x*.18,3,0);}
      else if(kind===1)objects.forEach((o,i)=>{const a=time*.4+i*.75;o.position.set(18*Math.cos(a),0,10*Math.sin(a));o.rotation.y=Math.atan2(-18*Math.sin(a),10*Math.cos(a));});
      else if(kind===2){objects.slice(0,22).forEach((o,i)=>{o.position.x=-14+(i%11%4)*7+Math.floor(i/11)*2+Math.sin(time+i)*.8;o.position.z=-9+Math.floor(i%11/4)*8+Math.cos(time*.8+i);o.rotation.z=Math.sin(time*5+i)*.055;});objects[22].position.set(Math.sin(time*.8)*11,.25+Math.abs(Math.sin(time*2))*.5,Math.sin(time*1.3)*7);}
      else{objects.slice(0,2).forEach((o,i)=>{o.position.x=Math.sin(time*1.6+i)*3;o.rotation.y=Math.sin(time*4+i)*.25;});objects[2].position.set(Math.sin(time*1.6)*3,.2+Math.abs(Math.cos(time*2.5))*2.5,Math.sin(time*2.5)*9);}
      const previous=renderer.getRenderTarget(),alpha=renderer.getClearAlpha();renderer.getClearColor(clearColor);
      renderer.setRenderTarget(target);renderer.clear();renderer.render(scene,camera);renderer.setRenderTarget(previous);renderer.setClearColor(clearColor,alpha);draws++;
      return currentKind;
    },
    metrics(){return {mode:'3d',version:'stadiums-1',width:640,height:360,programmes:scenes.size,draws,currentKind,venues:Object.fromEntries([...scenes].filter(([,v])=>v.venue).map(([k,v])=>[['film','race','football','tennis'][k],v.venue.metrics]))};},
    dispose(){const geometries=new Set([boxGeo,ballGeo,coneGeo]);scenes.forEach(({scene,venue})=>{scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);});venue?.dispose();});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());target.dispose();}
  };
}
