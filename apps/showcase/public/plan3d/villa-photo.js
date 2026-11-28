import * as T from './vendor/three.module.min.js';
import { PHOTO_ROOMS } from './villa-photo-layouts.js';

// One shared renderer, two visible photograph layers during a dissolve, at most
// four decoded pairs retained. No second animation loop or duplicated GUI state.
export function createVillaPhoto(renderer) {
  const scene = new T.Scene();
  const camera = new T.OrthographicCamera(0, 1, 0, 1, -1, 1);
  const geometry = new T.PlaneGeometry(1, 1);
  const cache = new Map(), pending = new Map(), failures = new Set();
  let disposed = false, current = null, previous = null, wanted = 0, mix = 1, serial = 0, lastState = null, lastRect = null;
  const vertexShader = 'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}';
  const fragmentShader = `
    uniform sampler2D dayMap, offMap;
    uniform float opacity, lightLevel, time, naturalLight, overview, audioLevel, hvac, heating, steam, heat;
    uniform vec3 motors;
    uniform vec4 windowRect, steamRect;
    uniform vec2 heatPoint;
    uniform vec2 water[5]; uniform int waterCount;
    varying vec2 vUv;
    float inside(vec2 p,vec4 r){return step(r.x,p.x)*step(r.y,p.y)*step(p.x,r.x+r.z)*step(p.y,r.y+r.w);}
    float waterMask(vec2 p){
      if(waterCount<3)return 0.;float hit=0.;
      for(int i=0;i<5;i++){if(i>=waterCount)break;int j=i+1;if(j>=waterCount)j=0;
        vec2 a=water[i],b=water[j];
        if((a.y>p.y)!=(b.y>p.y) && p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)hit=1.-hit;
      }return hit;
    }
    void main(){
      vec2 p=vec2(vUv.x,1.-vUv.y),uv=vUv;
      float wet=waterMask(p);
      uv.x+=wet*.0007*sin(p.y*170.+time*1.3);uv.y+=wet*.0005*sin(p.x*140.+time*.9);
      vec3 onColor=texture2D(dayMap,uv).rgb,offColor=texture2D(offMap,uv).rgb;
      vec3 color=mix(offColor,onColor,overview>.5?naturalLight:lightLevel);
      if(overview<.5){
        float closed=1.-(1.-motors.x)*(1.-motors.y*.75)*(1.-motors.z*.7);
        color*=1.-closed*(.28+(1.-lightLevel)*.42);
        color*=.42+.58*naturalLight+.32*lightLevel*(1.-naturalLight);
        if(windowRect.z>0. && inside(p,windowRect)>.5){
          vec2 q=(p-windowRect.xy)/windowRect.zw;
          // Shutter slats, woven blind, pleated curtain; movements use room motor feedback.
          if(q.y<motors.x){float slat=.29+.035*sin(q.y*235.);color=vec3(slat)*(.45+.55*max(lightLevel,naturalLight));}
          if(q.y<motors.y){float weave=.47+.012*sin(q.y*1800.)+.008*sin(q.x*1400.);color=vec3(weave,weave*.94,weave*.81)*(.5+.5*max(lightLevel,naturalLight));}
          if(q.x<motors.z*.5||q.x>1.-motors.z*.5){float fold=.28+.19*pow(.5+.5*cos(q.x*150.),2.);color=vec3(fold,fold*.91,fold*.76)*(.5+.5*max(lightLevel,naturalLight));}
        }
        if(steam>0. && inside(p,steamRect)>.5){float mist=.5+.5*sin(p.y*22.+time*.4+sin(p.x*35.+time*.25));color=mix(color,vec3(.72),steam*(.05+.09*mist));}
        color+=vec3(.18,.035,.005)*heat*exp(-distance(p,heatPoint)*55.);
        // Subtle room air movement and audio pulse, never random simulated feedback.
        float flow=exp(-pow((p.x-.91)*35.,2.))*exp(-pow((p.y-.75)*8.,2.));
        color+=mix(vec3(.015,.035,.06),vec3(.055,.025,.008),heating)*hvac*flow*(.6+.4*sin(time*3.+p.y*80.));
        float wave=abs(fract(distance(p,vec2(.89,.68))*8.-time*.65)-.5);
        color+=vec3(.025,.04,.045)*audioLevel*(1.-smoothstep(0.,.08,wave))*exp(-distance(p,vec2(.89,.68))*12.);
      }
      color+=wet*vec3(.01,.018,.02)*(.5+.5*sin(p.x*210.+p.y*150.+time));
      gl_FragColor=vec4(color,opacity);
      #include <colorspace_fragment>
    }`;
  function layer() {
    const uniforms = {dayMap:{value:null},offMap:{value:null},opacity:{value:1},lightLevel:{value:1},time:{value:0},naturalLight:{value:1},overview:{value:0},audioLevel:{value:0},hvac:{value:0},heating:{value:0},steam:{value:0},heat:{value:0},motors:{value:new T.Vector3()},windowRect:{value:new T.Vector4()},steamRect:{value:new T.Vector4()},heatPoint:{value:new T.Vector2()},water:{value:Array.from({length:5},()=>new T.Vector2())},waterCount:{value:0}};
    const material = new T.ShaderMaterial({uniforms,vertexShader,fragmentShader,transparent:true,side:T.DoubleSide,depthTest:false,depthWrite:false,toneMapped:false});
    const mesh = new T.Mesh(geometry,material); mesh.frustumCulled=false; scene.add(mesh);
    const backgroundMaterial=new T.MeshBasicMaterial({color:0x101719,side:T.DoubleSide,transparent:true,depthTest:false,depthWrite:false,toneMapped:false});
    const background=new T.Mesh(geometry,backgroundMaterial);background.frustumCulled=false;scene.add(background);
    const tvMaterial=new T.MeshBasicMaterial({side:T.DoubleSide,transparent:true,depthTest:false,depthWrite:false,toneMapped:false});
    const tv=new T.Mesh(geometry,tvMaterial);tv.frustumCulled=false;scene.add(tv);
    return {mesh,tv,material,tvMaterial,uniforms,background,backgroundMaterial};
  }
  const layers=[layer(),layer()];
  function url(id,suffix) {
    if(id===1)return new URL(`./salon-photo/salon-${suffix==='off'?'off':'on'}.png`,import.meta.url).href;
    return new URL(`./villa-photo/${PHOTO_ROOMS[id].key}${suffix==='off'?'-off':''}.jpg`,import.meta.url).href;
  }
  function load(id) {
    if(cache.has(id))return Promise.resolve(cache.get(id));
    if(pending.has(id))return pending.get(id);
    if(failures.has(id))return Promise.resolve(null);
    const loader=new T.TextureLoader();
    const promise=Promise.allSettled(['on','off'].map(async suffix=>{
      const texture=await loader.loadAsync(url(id,suffix));texture.colorSpace=T.SRGBColorSpace;
      texture.generateMipmaps=false;texture.minFilter=T.LinearFilter;return texture;
    })).then(results=>{
      const textures=results.filter(r=>r.status==='fulfilled').map(r=>r.value);
      if(disposed||textures.length!==2){textures.forEach(t=>t.dispose());if(!disposed){failures.add(id);console.warn('[Villa photo] décor indisponible',id);}return null;}
      const entry={id,on:textures[0],off:textures[1],used:++serial};cache.set(id,entry);trim();return entry;
    }).finally(()=>pending.delete(id));pending.set(id,promise);return promise;
  }
  function trim() {
    const protectedIds=new Set([current?.id,previous?.id,wanted]);
    for(const entry of [...cache.values()].sort((a,b)=>a.used-b.used)){
      if(cache.size<=4)break;if(protectedIds.has(entry.id))continue;
      entry.on.dispose();entry.off.dispose();cache.delete(entry.id);
    }
  }
  function request(id) {
    wanted=PHOTO_ROOMS[id]?id:0;
    load(wanted).then(entry=>{
      if(!entry||disposed||entry.id!==wanted||current===entry)return;
      previous=current;current=entry;entry.used=++serial;mix=previous?0:1;trim();
    });
  }
  function place(mesh,x,y,w,h){mesh.position.set(x+w/2,y+h/2,0);mesh.scale.set(w,-h,1);}
  const clamp=v=>Math.max(0,Math.min(1,Number(v)||0));
  function paint(layer,entry,alpha,order,rooms,rect,time,day,width,height){
    layer.mesh.visible=!!entry;layer.background.visible=!!entry;layer.tv.visible=false;if(!entry)return;
    place(layer.background,0,0,width,height);layer.backgroundMaterial.opacity=alpha;layer.background.renderOrder=order;
    const def=PHOTO_ROOMS[entry.id],R=rooms[entry.id],u=layer.uniforms;
    const coverW=Math.max(width,height*1672/941),coverH=coverW*941/1672;
    const {x,y,w,h}=entry.id===0?{x:(width-coverW)/2,y:(height-coverH)/2,w:coverW,h:coverH}:rect;
    place(layer.mesh,x,y,w,h);layer.mesh.renderOrder=order+1;
    u.dayMap.value=entry.on;u.offMap.value=entry.off;u.opacity.value=alpha;u.time.value=time;
    u.naturalLight.value=day;u.overview.value=entry.id===0?1:0;
    const level=R?R.renderLevels.reduce((a,v)=>a+v,0)/Math.max(1,R.renderLevels.length):1;
    u.lightLevel.value=level;
    u.motors.value.set(clamp(R?.shades?.volet?.pos),clamp(R?.shades?.store?.pos),clamp(R?.shades?.rideau?.pos));
    u.windowRect.value.fromArray(def.window||[0,0,0,0]);
    u.waterCount.value=def.water?.length||0;def.water?.forEach((p,i)=>u.water.value[i].fromArray(p));
    u.steamRect.value.fromArray(def.steam||[0,0,0,0]);u.heatPoint.value.fromArray(def.heat||[0,0]);
    u.steam.value=R?.wellness?.hammamOn?clamp((R.wellness.humidity||50)/100):0;
    u.heat.value=R?.wellness?.saunaOn?1:0;
    const audio=R?.audio;
    u.audioLevel.value=audio&&(audio.source>0||audio.music)&&!audio.mute&&!(audio.paused&&!audio.music)?clamp(audio.music?audio.mediaVolume:audio.volume):0;
    u.hvac.value=R?.hvac?.enabled?1:0;u.heating.value=R?.hvac?.thermo.st.chauffe?1:0;
    if(def.tv&&R?.tv?.source>0){
      const [tx,ty,tw,th]=def.tv,screenW=Math.min(tw*w,th*h*16/9),screenH=screenW*9/16;
      place(layer.tv,x+tx*w+(tw*w-screenW)/2,y+ty*h+(th*h-screenH)/2,screenW,screenH);
      layer.tv.visible=true;layer.tv.renderOrder=order+2;layer.tvMaterial.opacity=alpha;
      if(layer.tvMaterial.map!==R.tv.on.map){layer.tvMaterial.map=R.tv.on.map;layer.tvMaterial.needsUpdate=true;}
    }
    if(entry===current)lastState={room:entry.id,name:def.name,level,motors:u.motors.value.toArray(),source:R?.tv?.source||0,paused:!!R?.tv?.screen.st.paused,hvac:u.hvac.value,steam:u.steam.value,heat:u.heat.value};
  }
  request(0);
  return {
    render(rooms,id,rect,width,height,dt,time,day){
      if(id!==wanted)request(id);
      if(!current){request(wanted);return;}
      mix=Math.min(1,mix+dt/.55);if(mix===1&&previous){previous=null;trim();}
      camera.left=0;camera.right=width;camera.top=0;camera.bottom=height;camera.updateProjectionMatrix();
      const z=rect||{x:0,y:0,w:width,h:height},w=Math.min(z.w,z.h*1672/941),h=w*941/1672;
      lastRect={x:z.x+(z.w-w)/2,y:z.y+(z.h-h)/2,w,h};
      paint(layers[0],previous,1,0,rooms,lastRect,time,day,width,height);
      paint(layers[1],current,mix,3,rooms,lastRect,time,day,width,height);
      renderer.render(scene,camera);
    },
    metrics(){return {ready:!!current,room:current?.id,wanted,transition:mix,cacheSize:cache.size,pending:pending.size,failed:[...failures],state:lastState,rect:lastRect};},
    dispose(){disposed=true;cache.forEach(e=>{e.on.dispose();e.off.dispose();});cache.clear();layers.forEach(l=>{l.material.dispose();l.tvMaterial.dispose();l.backgroundMaterial.dispose();});geometry.dispose();},
  };
}
