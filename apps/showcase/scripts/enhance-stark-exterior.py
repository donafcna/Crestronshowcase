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
fields=[(mask(p),a,phase) for p,a,phase in regions]
sky=mask([(585,0),(1550,0),(1540,160),(1440,205),(1070,207),(990,227),(954,187),(723,204),(708,163),(585,142)])
fog=mask([(1413,310),(1450,294),(1547,304),(1605,339),(1605,415),(1490,418),(1484,353)])
c=cv2.VideoCapture(str(OUT/'landscape-exterior-loop-v1.mp4'))
count=int(c.get(cv2.CAP_PROP_FRAME_COUNT)); fps=c.get(cv2.CAP_PROP_FPS)
target=OUT/'landscape-exterior-loop-v2.mp4'
p=subprocess.Popen([imageio_ffmpeg.get_ffmpeg_exe(),'-hide_banner','-loglevel','error','-y','-f','rawvideo','-pixel_format','bgr24','-video_size',f'{W}x{H}','-framerate',str(fps),'-i','pipe:0','-an','-c:v','libx264','-preset','slow','-crf','17','-pix_fmt','yuv420p','-movflags','+faststart',str(target)],stdin=subprocess.PIPE)
for n in range(count):
 ok,frame=c.read()
 if not ok:raise RuntimeError('Missing source frame')
 t=2*np.pi*n/count; dx=np.zeros_like(x);dy=np.zeros_like(y)
 for m,a,phase in fields:
  sway=np.sin(t+phase)*.72+np.sin(2*t+phase+x/160)*.28
  dx+=m*a*sway;dy+=m*a*.18*np.sin(2*t+phase+y/110)
 dx+=sky*5*np.sin(t-.7)+fog*4*np.sin(t+.8)
 dy+=fog*.55*np.sin(t)
 result=cv2.remap(frame,x+dx,y+dy,cv2.INTER_CUBIC,borderMode=cv2.BORDER_REFLECT_101)
 p.stdin.write(result.tobytes())
c.release();p.stdin.close()
if p.wait():raise RuntimeError('Encoding failed')
print(target, target.stat().st_size)
