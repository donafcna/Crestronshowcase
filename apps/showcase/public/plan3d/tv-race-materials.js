import * as T from './vendor/three.module.min.js';

// Painted once at construction; mipmapped textures, no per-frame material work.
export function raceMaterials(textures){
  let seed=41329;
  const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
  function texture(c){const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=2;textures.push(t);return t;}
  const asphalt=canvas(512,256),a=asphalt.getContext('2d');
  a.fillStyle='#b2b5b6';a.fillRect(0,0,512,256);
  // Aggregate at multiple scales, subtly patched rather than a uniform grey plane.
  for(let i=0;i<180;i++){const x=rand()*512,y=rand()*256,r=8+rand()*35,g=a.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,i%2?'#89919735':'#e5dfd526');g.addColorStop(1,'#a0a0a000');a.fillStyle=g;a.fillRect(x-r,y-r,r*2,r*2);}
  for(let i=0;i<29000;i++){const v=130+Math.floor(rand()*95);a.fillStyle=`rgba(${v},${v+2},${v+3},.34)`;a.fillRect(rand()*512,rand()*256,.6+rand()*1.4,.6+rand()*1.4);}
  // Fine repair seams; the existing darker racing-line ribbon is kept separately.
  a.strokeStyle='#46515730';a.lineWidth=.7;
  for(let j=0;j<3;j++){a.beginPath();let y=35+j*83;for(let x=0;x<=512;x+=24){y+=(rand()-.5)*7;a.lineTo(x,y);}a.stroke();}

  const grass=canvas(512,512),g=grass.getContext('2d');g.fillStyle='#758253';g.fillRect(0,0,512,512);
  for(let i=0;i<220;i++){const x=rand()*512,y=rand()*512,r=15+rand()*65;for(const dx of [-512,0,512])for(const dy of [-512,0,512]){const px=x+dx,py=y+dy;if(px+r<0||px-r>512||py+r<0||py-r>512)continue;const q=g.createRadialGradient(px,py,0,px,py,r);q.addColorStop(0,i%3?'#36512c45':'#b6a27365');q.addColorStop(1,'#65714b00');g.fillStyle=q;g.fillRect(px-r,py-r,r*2,r*2);}}
  for(let x=0;x<512;x+=128){g.fillStyle='rgba(221,230,169,.045)';g.fillRect(x,0,64,512);}
  for(let i=0;i<36000;i++){g.fillStyle=i%3?'rgba(35,60,27,.20)':'rgba(192,194,118,.25)';const x=rand()*512,y=rand()*512;g.fillRect(x,y,.5+rand(),1+rand()*3);}
  const grassMap=texture(grass);grassMap.repeat.set(36,28);

  // Four atlas tiles let the merged buildings retain one draw call.
  const atlas=canvas(512,512),c=atlas.getContext('2d');c.fillStyle='#ffffff';c.fillRect(0,0,512,512);
  // Upper-right: concrete panels, recessed joints and rain staining.
  c.save();c.beginPath();c.rect(256,0,256,256);c.clip();c.fillStyle='#dfded8';c.fillRect(256,0,256,256);
  for(let i=0;i<4500;i++){const v=165+rand()*70;c.fillStyle=`rgba(${v},${v},${v-6},.2)`;c.fillRect(256+rand()*256,rand()*256,1+rand()*3,1);}
  for(let y=48;y<256;y+=52){c.fillStyle='#62645c50';c.fillRect(256,y,256,1);c.fillStyle='#f9f8ee90';c.fillRect(256,y+1,256,1);}
  for(let x=288;x<512;x+=64){c.fillStyle='#767a7138';c.fillRect(x,0,1,256);const stain=c.createLinearGradient(0,0,0,256);stain.addColorStop(0,'#37403700');stain.addColorStop(1,'#37403745');c.fillStyle=stain;c.fillRect(x-3,0,6,256);}c.restore();
  // Lower-left: roller shutter, lintel, frame and restrained dirt at the base.
  c.save();c.translate(0,256);c.fillStyle='#bec6c5';c.fillRect(0,0,256,256);
  for(let y=8;y<256;y+=12){c.fillStyle='#617174';c.fillRect(8,y,240,2);c.fillStyle='#e3e7de';c.fillRect(8,y+2,240,1);}
  c.fillStyle='#445156';c.fillRect(0,0,8,256);c.fillRect(248,0,8,256);c.fillRect(0,0,256,12);
  const dirt=c.createLinearGradient(0,180,0,256);dirt.addColorStop(0,'#4e4b3c00');dirt.addColorStop(1,'#4e4b3c90');c.fillStyle=dirt;c.fillRect(8,180,240,76);
  c.fillStyle='#dce1d5';c.fillRect(114,140,28,5);c.restore();
  // Lower-right: tinted glazing with static sky reflection, mullions and soffit.
  c.save();c.translate(256,256);const sky=c.createLinearGradient(0,0,0,256);sky.addColorStop(0,'#e6f1f0');sky.addColorStop(.45,'#a1b4b7');sky.addColorStop(1,'#485c63');c.fillStyle=sky;c.fillRect(0,0,256,256);
  c.fillStyle='#eef5ef28';for(let x=-100;x<256;x+=100){c.beginPath();c.moveTo(x,0);c.lineTo(x+65,0);c.lineTo(x+165,256);c.lineTo(x+100,256);c.fill();}
  c.fillStyle='#34494d';for(let x=0;x<256;x+=64)c.fillRect(x,0,4,256);c.fillRect(0,0,256,8);c.fillRect(0,245,256,11);c.restore();
  const atlasMap=texture(atlas);
  function atlasUV(geo,kind){
    const uv=geo.attributes.uv,tx=kind%2,ty=kind<2?1:0;
    for(let i=0;i<uv.count;i++)uv.setXY(i,(tx+.012+uv.getX(i)*.976)/2,(ty+.012+uv.getY(i)*.976)/2);
  }
  return {asphalt,grassMap,atlasMap,atlasUV};
}
