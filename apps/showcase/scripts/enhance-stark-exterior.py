"""Localized, cyclic wind on existing Runway footage; architecture stays fixed."""
from pathlib import Path
import cv2, numpy as np, subprocess, imageio_ffmpeg
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/showcases/villa-stark/assets/video'
W,H=1280,720
cv2.setNumThreads(2)
y,x=np.mgrid[:H,:W].astype(np.float32)
def mask(points):
 m=np.zeros((H,W),np.float32)
 cv2.fillPoly(m,[np.array(points,np.float32).__mul__([W/1672,H/941]).astype(np.int32)],1)
 return cv2.GaussianBlur(m,(0,0),3)
# Independent anchored plants; rock faces, steps, building and trunks are excluded.
regions=[
 ([(0,0),(570,0),(510,105),(300,180),(165,300),(0,335)],2.0,0),
 ([(575,185),(644,179),(710,274),(600,250)],1.7,1),
 ([(834,230),(921,219),(952,280),(829,278)],1.4,2),
 ([(1601,65),(1672,43),(1672,484),(1551,426),(1541,268)],2.4,3),
 ([(82,676),(173,647),(265,666),(244,723),(100,738)],2.4,4),
 ([(502,676),(541,628),(586,619),(620,654),(685,657),(716,695),(644,716),(568,704)],3.2,5),
 ([(455,810),(490,757),(534,739),(555,703),(596,718),(650,734),(612,791),(561,823)],3.0,6),
 ([(0,806),(80,775),(184,804),(254,841),(245,941),(0,941)],2.4,7),
 ([(804,766),(843,711),(940,719),(985,665),(1081,632),(1196,646),(1279,735),(1190,821),(1038,836),(940,788),(849,804)],3.2,8),
 ([(1205,821),(1343,819),(1435,779),(1554,780),(1672,824),(1672,885),(1320,899),(1211,877)],2.4,9)]
fields=[]
for polygon,amplitude,phase in regions[:4]:
 m=mask(polygon)
 top=min(p[1] for p in polygon)*H/941;bottom=max(p[1] for p in polygon)*H/941
 anchor=np.clip((bottom-y)/max(1,bottom-top),0,1)**.8
 fields.append((m*anchor,amplitude*2.8,phase))
tree_mask=np.maximum.reduce([mask(p) for p,_,_ in regions[:4]])
# The original photograph is sharper than the generated foreground. Rebuild
# these beds from that fixed source, bending foliage rather than smearing it.
photo=cv2.resize(cv2.imread(str(ROOT/'public/showcases/villa-stark/assets/original/hero-on.webp')),(W,H))
foreground=np.clip((y-475)/18,0,1).astype(np.float32)
foreground*=1-mask([(1280,635),(1672,635),(1672,766),(1450,766)])
# Polygon, anchored foot in photo coordinates, tip amplitude, phase.
plants=[
 (regions[4][0],(183,738),5.8,.2),
 (regions[5][0],(589,714),7.8,1.1),
 (regions[6][0],(550,821),9.0,2.3),
 (regions[7][0],(145,935),6.2,.8),
 (regions[8][0],(1100,844),8.5,1.7),
 (regions[9][0],(1445,884),5.5,3.1)]
plant_fields=[]
for polygon,foot,amplitude,phase in plants:
 m=mask(polygon);bx,by=foot[0]*W/1672,foot[1]*H/941
 reach=np.clip(np.hypot(x-bx,y-by)/95,0,1)**1.5
 plant_fields.append((m*reach,amplitude,phase,bx,by))
sky=mask([(585,0),(1550,0),(1540,160),(1440,205),(1070,207),(990,227),(954,187),(723,204),(708,163),(585,142)])
fog=mask([(1413,310),(1450,294),(1547,304),(1605,339),(1605,415),(1490,418),(1484,353)])
c=cv2.VideoCapture(str(OUT/'landscape-exterior-loop-v1.mp4'))
count=int(c.get(cv2.CAP_PROP_FRAME_COUNT)); fps=c.get(cv2.CAP_PROP_FPS)
target=OUT/'landscape-exterior-loop-v3.mp4'
p=subprocess.Popen([imageio_ffmpeg.get_ffmpeg_exe(),'-hide_banner','-loglevel','error','-y','-f','rawvideo','-pixel_format','bgr24','-video_size',f'{W}x{H}','-framerate',str(fps),'-i','pipe:0','-an','-c:v','libx264','-preset','slow','-crf','17','-pix_fmt','yuv420p','-movflags','+faststart',str(target)],stdin=subprocess.PIPE)
for n in range(count):
 ok,frame=c.read()
 if not ok:raise RuntimeError('Missing source frame')
 t=2*np.pi*n/count; dx=np.zeros_like(x);dy=np.zeros_like(y)
 for m,a,phase in fields:
  sway=np.sin(2*t+phase)*.65+np.sin(3*t+phase+x/160)*.25+np.sin(7*t+x/70+phase)*.1
  dx+=m*a*sway;dy+=m*a*.18*np.sin(2*t+phase+y/110)
 dx+=sky*5*np.sin(t-.7)+fog*4*np.sin(t+.8)
 dy+=fog*.55*np.sin(t)
 result=cv2.remap(frame,x+dx,y+dy,cv2.INTER_CUBIC,borderMode=cv2.BORDER_REFLECT_101)
 sharp_trees=cv2.remap(photo,x+dx,y+dy,cv2.INTER_CUBIC,borderMode=cv2.BORDER_REFLECT_101)
 result=np.clip(result*(1-tree_mask[:,:,None])+sharp_trees*tree_mask[:,:,None],0,255).astype(np.uint8)
 # Shared gusts with phase delays, plus smaller independent tip motion. The
 # weight is zero at each foot, increasing towards the fronds and flower heads.
 px=np.zeros_like(x);py=np.zeros_like(y)
 for m,a,phase,bx,by in plant_fields:
  gust=(.68*np.sin(2*t+phase)+.23*np.sin(3*t+phase*.7)+.09*np.sin(5*t+phase))
  flutter=.18*np.sin(7*t+x/30+y/45+phase)
  px+=m*a*(gust+flutter)
  py+=m*a*(.22*np.sin(2*t+phase+.6)+.08*np.sin(5*t+x/40+phase))
 foliage=cv2.remap(photo,x+px,y+py,cv2.INTER_CUBIC,borderMode=cv2.BORDER_REFLECT_101)
 result=np.clip(result*(1-foreground[:,:,None])+foliage*foreground[:,:,None],0,255).astype(np.uint8)
 p.stdin.write(result.tobytes())
c.release();p.stdin.close()
if p.wait():raise RuntimeError('Encoding failed')
print(target, target.stat().st_size)
