import * as THREE from "/plan3d/vendor/three.module.min.js";
import { createTVStage } from "/plan3d/tv-stage.js?v=2026-11-23-race-2";

// Reuse Villa FTV's real 3D sports programmes in the photographic television.
// One lazy renderer, one visible screen, 640 × 360 at 15 fps, without audio.
export function createTVBroadcast() {
  const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:false, powerPreference:"low-power" });
  renderer.setPixelRatio(1); renderer.setSize(640,360,false);
  const stage = createTVStage(renderer,{realisticRace:true,detailedRaceMaterials:true});
  const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-1,1,1,-1,0,2);
  camera.position.z = 1;
  const geometry = new THREE.PlaneGeometry(2,2);
  const material = new THREE.MeshBasicMaterial({map:stage.texture,depthTest:false,depthWrite:false,toneMapped:false});
  scene.add(new THREE.Mesh(geometry,material));
  return {
    render(source,seconds,channel) {
      this.programme = stage.render(source,seconds,channel);
      renderer.setRenderTarget(null); renderer.clear(); renderer.render(scene,camera);
      return renderer.domElement;
    },
    dispose() { stage.dispose(); geometry.dispose(); material.dispose(); renderer.dispose(); }
  };
}
