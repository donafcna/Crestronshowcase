/* Procedural maritime sky: no external media, follows the scene lighting. */
window.createFtvSky=function(T,scene){
 const uniforms={zenith:{value:new T.Color()},horizon:{value:new T.Color()},cloudColor:{value:new T.Color()},sunDirection:{value:new T.Vector3()},night:{value:0},time:{value:0}};
 const material=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,toneMapped:false,uniforms,
 vertexShader:`varying vec3 direction;void main(){direction=position;vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position=p.xyww;}`,
 fragmentShader:`varying vec3 direction;uniform vec3 zenith,horizon,cloudColor,sunDirection;uniform float night,time;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
 float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=mat2(1.6,1.2,-1.2,1.6)*p;a*=.5;}return v;}
 void main(){vec3 d=normalize(direction);float elevation=max(d.y,0.);vec3 col=mix(horizon,zenith,pow(elevation,.45));float sun=max(dot(d,sunDirection),0.);
 col+=vec3(1.,.66,.32)*pow(sun,22.)*.28*(1.-night);col+=vec3(1.,.89,.65)*smoothstep(.9997,.99993,sun)*(1.-night)*2.;
 vec2 p=d.xz/(max(d.y,0.)+.23)*2.7+vec2(time*.0015,0.);float n=fbm(p);float clouds=smoothstep(.48,.72,n)*smoothstep(.015,.16,d.y);vec3 shade=cloudColor*(.72+.28*fbm(p+vec2(4.1,2.7)));col=mix(col,shade,clouds*.85);
 vec2 starUV=vec2(atan(d.z,d.x),asin(d.y))*600.;float star=step(.9987,hash(floor(starUV)))*pow(max(0.,1.-length(fract(starUV)-.5)*2.),5.);col+=star*night*smoothstep(.04,.3,d.y)*(1.-clouds);
 gl_FragColor=vec4(col,1.);
 #include <colorspace_fragment>
 }`.replace(';#include',';\n#include')});
 const mesh=new T.Mesh(new T.SphereGeometry(600,32,16),material);mesh.name='Maritime sky';mesh.frustumCulled=false;mesh.renderOrder=-100;scene.add(mesh);
 const palettes={day:['#287bb9','#bed7de','#f3f3e7',0,.65],sunset:['#35466f','#eda67f','#eeb599',0,.12],evening:['#111e3f','#666679','#8a8295',.45,.035],night:['#030b20','#182a43','#25344e',1,-.12]};
 function setScene(key){const p=palettes[key]||palettes.day;uniforms.zenith.value.set(p[0]);uniforms.horizon.value.set(p[1]);uniforms.cloudColor.value.set(p[2]);uniforms.night.value=p[3];uniforms.sunDirection.value.set(-.55,p[4],.6).normalize();scene.fog.color.copy(uniforms.horizon.value);}
 setScene('day');return {mesh,uniforms,setScene,update(dt,camera){mesh.position.copy(camera.position);if(!matchMedia('(prefers-reduced-motion: reduce)').matches)uniforms.time.value+=dt;}};
};
