/* M/Y Jewel Riviera: continuous two-dimensional water flow, isolated from architecture. */
(() => {
  'use strict';
  if (new URLSearchParams(location.search).get('mode') === 'panel') {
    window.JEWEL_MARINE = { mount() {} };
    return;
  }
  const scenes = window.JEWEL_SCENES;
  const exterior = { image:'assets/hero.png', horizon:.64, water:[[[0,66],[100,66],[100,100],[0,100]]] };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mounted = new Map(), imageCache = new Map();
  let animation = 0, previous = 0;
  const vertex = `attribute vec2 position; varying vec2 screenUV; void main(){ screenUV=position*.5+.5; gl_Position=vec4(position,0.,1.); }`;
  const fragment = `precision highp float;
    varying vec2 screenUV;
    uniform sampler2D photograph; uniform sampler2D waterMask;
    uniform vec2 pixel; uniform float seconds; uniform float horizon; uniform float motion;
    void main(){
      vec2 uv=vec2(screenUV.x,1.-screenUV.y);
      float mask=texture2D(waterMask,uv).r;
      if(mask<.003){gl_FragColor=vec4(0.);return;}
      float depth=smoothstep(horizon,horizon+.23,uv.y);
      float t=seconds;
      float a=dot(uv,vec2(23.,67.))-t*1.06;
      float b=dot(uv,vec2(-39.,113.))+t*.79;
      float c=dot(uv,vec2(156.,327.))-t*1.83;
      vec2 flow=vec2(sin(a)*.72+sin(b)*.28,cos(a*.81)*.61+sin(b*.92)*.39);
      flow+=vec2(sin(c),cos(c*.87))*.12;
      float distanceFade=smoothstep(0.,.035,uv.y-horizon);
      vec2 displacement=flow*pixel*vec2(3.2+4.5*depth,1.7+2.4*depth)*motion*distanceFade;
      vec2 sampleUV=clamp(uv+displacement,vec2(0.),vec2(1.));
      // Displacement cannot pull a frame, coastline or furnishing into the water.
      float safe=texture2D(waterMask,sampleUV).r;
      float alpha=smoothstep(.02,.97,min(mask,safe));
      vec3 color=texture2D(photograph,sampleUV).rgb;
      float glint=pow(max(0.,sin(a)*.55+sin(b)*.35+sin(c)*.1),8.);
      color+=vec3(.075,.086,.085)*glint*(.25+.75*depth)*motion;
      gl_FragColor=vec4(color,alpha);
    }`;
  function maskFor(scene,img){
    const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;
    const ctx=c.getContext('2d');ctx.fillStyle='#000';ctx.fillRect(0,0,c.width,c.height);
    ctx.fillStyle='#fff';ctx.beginPath();for(const poly of scene.water){poly.forEach(([x,y],i)=>ctx[i?'lineTo':'moveTo'](x*c.width/100,y*c.height/100));ctx.closePath();}ctx.fill();return c;
  }
  function createGPU(canvas){
    const gl=canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:false,preserveDrawingBuffer:true,powerPreference:'low-power'});
    if(!gl)return null;
    const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
    const program=gl.createProgram(),vs=shader(gl.VERTEX_SHADER,vertex),fs=shader(gl.FRAGMENT_SHADER,fragment);
    gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.deleteShader(vs);gl.deleteShader(fs);gl.useProgram(program);
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const pos=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
    const textures=[0,1].map(i=>{const texture=gl.createTexture();gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,texture);for(const key of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,key,gl.CLAMP_TO_EDGE);for(const key of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,key,gl.LINEAR);return texture;});
    const uniforms=Object.fromEntries(['photograph','waterMask','pixel','seconds','horizon','motion'].map(k=>[k,gl.getUniformLocation(program,k)]));gl.uniform1i(uniforms.photograph,0);gl.uniform1i(uniforms.waterMask,1);
    return {
      upload(scene,img){for(const [i,source]of [img,maskFor(scene,img)].entries()){gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,textures[i]);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);}gl.uniform1f(uniforms.horizon,scene.horizon);},
      draw(t,w,h){gl.viewport(0,0,w,h);gl.useProgram(program);gl.uniform2f(uniforms.pixel,1/w,1/h);gl.uniform1f(uniforms.seconds,t);gl.uniform1f(uniforms.motion,reduced.matches?0:1);gl.drawArrays(gl.TRIANGLES,0,6);},
      dispose(){textures.forEach(t=>gl.deleteTexture(t));gl.deleteBuffer(buffer);gl.deleteProgram(program);}
    };
  }
  function createFallback(canvas){
    const ctx=canvas.getContext('2d');let scene,img;
    return {upload(s,i){scene=s;img=i;},draw(t,w,h){ctx.clearRect(0,0,w,h);ctx.save();ctx.beginPath();for(const poly of scene.water){poly.forEach(([x,y],i)=>ctx[i?'lineTo':'moveTo'](x*w/100,y*h/100));ctx.closePath();}ctx.clip();for(let y=0;y<h;y+=2){const d=Math.max(0,Math.min(1,(y/h-scene.horizon)/.23)),a=reduced.matches?0:(Math.sin(y*.04-t*1.06)*.72+Math.sin(y*.075+t*.79)*.28)*(3.2+4.5*d);const sy=y/h*img.naturalHeight;ctx.drawImage(img,0,sy,img.naturalWidth,Math.min(2/h*img.naturalHeight,img.naturalHeight-sy),a,y,w,2);}ctx.restore();},dispose(){}};
  }
  function loadImage(url){if(!imageCache.has(url)){const img=new Image();img.decoding='async';imageCache.set(url,new Promise((resolve,reject)=>{img.onload=()=>resolve(img);img.onerror=()=>reject(Error('Image introuvable : '+url));img.src=url;}));}return imageCache.get(url);}
  function mount(host,id){
    const scene=id?scenes[id]:exterior;let item=mounted.get(host);if(item?.id===id)return;
    if(!item){const canvas=host.querySelector('.jewel-water');if(!canvas)return;const gpu=createGPU(canvas);item={canvas,renderer:gpu||createFallback(canvas),ticks:0};canvas.dataset.renderer=gpu?'webgl-water':'canvas-water';mounted.set(host,item);}
    item.id=id;item.ready=false;item.canvas.style.opacity='0';item.ticks=0;item.scene=scene;item.canvas.dataset.scene=id||'exterior';item.canvas.dataset.frames='0';
    loadImage(scene.image).then(img=>{if(item.scene!==scene)return;item.renderer.upload(scene,img);item.ready=true;item.canvas.dataset.imageWidth=img.naturalWidth;if(!animation)animation=requestAnimationFrame(draw);}).catch(e=>{item.canvas.dataset.error=e.message;console.error(e);});
  }
  function draw(t){animation=requestAnimationFrame(draw);if(document.hidden||t-previous<1000/30-.75)return;previous=t;
    for(const [host,item]of mounted){if(!item.ready||item.id&&!host.classList.contains('open')||!item.id&&host.classList.contains('zoomed'))continue;
      const rect=host.getBoundingClientRect(),w=Math.min(1920,Math.round(rect.width)),h=Math.round(w*rect.height/Math.max(1,rect.width));if(w<2||h<2)continue;
      const changed=item.canvas.width!==w||item.canvas.height!==h;if(changed){item.canvas.width=w;item.canvas.height=h;}if(reduced.matches&&item.ticks&&!changed)continue;
      item.renderer.draw(t/1000,w,h);item.canvas.style.opacity='1';item.canvas.dataset.frames=String(++item.ticks);
    }
  }
  reduced.addEventListener('change',()=>{for(const item of mounted.values())item.ticks=0;});
  window.JEWEL_MARINE={mount};window.addEventListener('pagehide',()=>{cancelAnimationFrame(animation);for(const item of mounted.values())item.renderer.dispose();mounted.clear();});
})();
