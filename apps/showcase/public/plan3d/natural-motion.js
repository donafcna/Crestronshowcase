import * as T from './vendor/three.module.min.js';

// Procedural waves and shared GPU wind: no extra asset, simulation or draw pass.
export function addNaturalMotion(pool, landscape) {
  const uniforms={time:{value:0},strength:{value:1}};
  if(pool?.eau){
    const base=pool.eau,old=base.geometry;base.geometry=new T.PlaneGeometry(pool.cfg.w*.7,pool.cfg.d*.55,40,24);base.geometry.rotateX(-Math.PI/2);old.dispose();base.position.y=.32;
    const m=base.material;m.transparent=false;m.opacity=1;
    m.onBeforeCompile=shader=>{
      shader.uniforms.natureTime=uniforms.time;shader.uniforms.natureStrength=uniforms.strength;
      shader.vertexShader='uniform float natureTime;uniform float natureStrength;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>',`#include <beginnormal_vertex>
        float x=position.x,z=position.z,t=natureTime;
        float dx=.034*2.7*cos(x*2.7+z*.8+t*.85)+.018*5.1*cos(x*5.1-z*2.3-t*1.15);
        float dz=.034*.8*cos(x*2.7+z*.8+t*.85)-.018*2.3*cos(x*5.1-z*2.3-t*1.15);
        objectNormal=normalize(vec3(-dx*natureStrength,1.,-dz*natureStrength));`);
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
        transformed.y+=(.034*sin(position.x*2.7+position.z*.8+natureTime*.85)+.018*sin(position.x*5.1-position.z*2.3-natureTime*1.15))*natureStrength;`);
    };
    m.customProgramCacheKey=()=> 'villa-water-1';m.needsUpdate=true;
  }
  const trees=landscape?.trees;
  if(trees){
    trees.material.onBeforeCompile=shader=>{
      shader.uniforms.natureTime=uniforms.time;shader.uniforms.natureStrength=uniforms.strength;
      shader.vertexShader='uniform float natureTime;uniform float natureStrength;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
        float seed=instanceMatrix[3].x+instanceMatrix[3].z;
        float subset=step(.65,fract(sin(seed*12.98)*43758.54));
        float height=max(0.,position.y+1.9)/3.8;
        transformed.x+=sin(natureTime*.72+seed)*.10*height*height*subset*natureStrength;
        transformed.z+=sin(natureTime*.53+seed*1.4)*.055*height*height*subset*natureStrength;`);
    };
    trees.material.customProgramCacheKey=()=> 'villa-wind-1';trees.material.needsUpdate=true;
  }
  let lastTick=0;
  return {update(time,quality){const interval=quality<1.25?1/15:1/30;if(time-lastTick<interval)return;lastTick=time;uniforms.time.value=time;uniforms.strength.value=quality<1.25?.45:1;},get strength(){return uniforms.strength.value;}};
}
