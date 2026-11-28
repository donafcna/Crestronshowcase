import * as T from './vendor/three.module.min.js';

// Presentation-only layer. All states come from the existing room/CH5 bridge.
// Shares the renderer and TV texture; no second WebGL context or feedback simulation.
export function createSalonPhoto() {
  const scene=new T.Scene(),camera=new T.OrthographicCamera(0,1,1,0,-1,1),geometry=new T.PlaneGeometry(1,1),materials=[],textures=[];
  let ready=false,disposed=false,opacity=0,lastState=null;
  const loader=new T.TextureLoader();
  function plane(color,order){const material=new T.MeshBasicMaterial({color,side:T.DoubleSide,transparent:true,depthTest:false,depthWrite:false,toneMapped:false});materials.push(material);const mesh=new T.Mesh(geometry,material);mesh.renderOrder=order;scene.add(mesh);return mesh;}
  const backdrop=plane(0x101719,0),base=plane(0xffffff,1),lit=plane(0xffffff,2),ambient=plane(0x0d1521,3),volet=plane(0xaaa99f,4),store=plane(0xc5bfad,5),left=plane(0xa49b86,6),right=plane(0xa49b86,6),tv=plane(0xffffff,7);
  const cloth=document.createElement('canvas');cloth.width=64;cloth.height=64;const c=cloth.getContext('2d');c.fillStyle='#c5bfad';c.fillRect(0,0,64,64);for(let i=0;i<64;i+=4){c.fillStyle=i%8?'#b9b29e':'#d0c9b9';c.fillRect(0,i,64,1);}const texture=new T.CanvasTexture(cloth);texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;textures.push(texture);store.material.map=texture;store.material.color.set(0xffffff);
  const folds=document.createElement('canvas');folds.width=64;folds.height=4;const g=folds.getContext('2d'),gradient=g.createLinearGradient(0,0,64,0);gradient.addColorStop(0,'#746b59');gradient.addColorStop(.45,'#d4c7ad');gradient.addColorStop(1,'#867a65');g.fillStyle=gradient;g.fillRect(0,0,64,4);const curtain=new T.CanvasTexture(folds);curtain.colorSpace=T.SRGBColorSpace;curtain.wrapS=T.RepeatWrapping;curtain.repeat.x=8;textures.push(curtain);left.material.map=right.material.map=curtain;left.material.color.set(0xffffff);right.material.color.set(0xffffff);
  Promise.all(['salon-off.png','salon-on.png'].map(async name=>{const t=await loader.loadAsync(new URL('./salon-photo/'+name,import.meta.url).href);t.colorSpace=T.SRGBColorSpace;if(disposed)t.dispose();else textures.push(t);return t;})).then(([off,on])=>{if(disposed)return;base.material.map=off;lit.material.map=on;base.material.needsUpdate=lit.material.needsUpdate=true;ready=true;}).catch(error=>console.warn('[Salon photo] chargement impossible, vue 3D conservée',error));
  function place(mesh,x,y,w,h){mesh.position.set(x+w/2,y+h/2,0);mesh.scale.set(w,-h,1);mesh.visible=w>0&&h>0;}
  const clamp=v=>Math.max(0,Math.min(1,v||0));
  return {
    advance(show,dt){opacity=T.MathUtils.damp(opacity,show&&ready?1:0,12,dt);if(opacity>.999)opacity=1;if(opacity<.001)opacity=0;return opacity;},
    render(renderer,R,rect,width,height){if(!opacity||!ready)return;camera.left=0;camera.right=width;camera.top=0;camera.bottom=height;camera.updateProjectionMatrix();const z=rect||{x:0,y:0,w:width,h:height},w=Math.min(z.w,z.h*1672/941),h=w*941/1672,x=z.x+(z.w-w)/2,y=z.y+(z.h-h)/2;const level=R.renderLevels.reduce((a,v)=>a+v,0)/Math.max(1,R.renderLevels.length),v=clamp(R.shades?.volet?.pos),s=clamp(R.shades?.store?.pos),r=clamp(R.shades?.rideau?.pos),dark=1-(1-v)*(1-s*.75)*(1-r*.65);
      place(backdrop,0,0,width,height);backdrop.material.opacity=opacity;
      for(const mesh of [base,lit,ambient])place(mesh,x,y,w,h);base.material.opacity=opacity;lit.material.opacity=opacity*level;ambient.material.opacity=opacity*dark*(.12+(1-level)*.32);
      const wx=x+w*.1555,wy=y+h*.2435,ww=w*.347,wh=h*.431;
      place(volet,wx,wy,ww,wh*v);place(store,wx,wy,ww,wh*s);place(left,wx,wy,ww*r/2,wh);place(right,wx+ww*(1-r/2),wy,ww*r/2,wh);for(const mesh of [volet,store,left,right])mesh.material.opacity=opacity;
      place(tv,x+w*.6035,y+h*.3195,w*.2305,h*.2315);tv.visible=R.tv?.source>0;tv.material.opacity=opacity;if(tv.material.map!==R.tv?.on.map){tv.material.map=R.tv?.on.map;tv.material.needsUpdate=true;}
      renderer.render(scene,camera);lastState={level,volet:v,store:s,rideau:r,source:R.tv?.source||0,paused:!!R.tv?.screen.st.paused};
    },
    metrics(){return {ready,opacity,state:lastState};},
    dispose(){disposed=true;geometry.dispose();materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}
  };
}
