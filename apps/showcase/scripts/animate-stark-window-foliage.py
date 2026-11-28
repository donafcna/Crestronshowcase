"""Complete gentle foliage motion for every glazed room. Silent video output.
The browser applies the calibrated glazing and foreground masks, never the room.
Existing Runway takes remain the source for Living/Dining/Master.
"""
from pathlib import Path
import concurrent.futures,subprocess,json
import cv2,numpy as np,imageio_ffmpeg
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/showcases/villa-stark/assets/video'
PROOF=ROOT/'docs/verification/2026-11-28-exterieur'
W,H,FPS,N=1280,720,24,383
cv2.setNumThreads(2)
y,x=np.mgrid[:H,:W].astype(np.float32)
def run(room):
 photo=cv2.resize(cv2.imread(str(ROOT/f'public/showcases/villa-stark/assets/original/room-{room}.webp')),(W,H))
 hsv=cv2.cvtColor(photo,cv2.COLOR_BGR2HSV)
 # Leaf clusters, including pale blossoms surrounded by foliage. Dilated soft
 # support keeps movement continuous instead of cutting out individual leaves.
 leaves=((hsv[:,:,0]>=24)&(hsv[:,:,0]<=94)&(hsv[:,:,1]>32)&(hsv[:,:,2]>28)).astype(np.uint8)*255
 leaves=cv2.dilate(leaves,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(21,21)))
 support=cv2.GaussianBlur(leaves.astype(np.float32)/255,(0,0),5)
 source=OUT/f'landscape-{room.lower()}-loop-v1.mp4'
 cap=cv2.VideoCapture(str(source)) if source.exists() else None
 target=OUT/f'landscape-{room.lower()}-loop-v2.mp4'
 p=subprocess.Popen([imageio_ffmpeg.get_ffmpeg_exe(),'-hide_banner','-loglevel','error','-y','-f','rawvideo','-pixel_format','bgr24','-video_size',f'{W}x{H}','-framerate',str(FPS),'-i','pipe:0','-an','-c:v','libx264','-threads','2','-preset','medium','-crf','17','-pix_fmt','yuv420p','-movflags','+faststart',str(target)],stdin=subprocess.PIPE)
 for n in range(N):
  if cap:
   ok,frame=cap.read()
   if not ok:raise RuntimeError(room+' source incomplete')
  else:frame=photo
  t=2*np.pi*n/N
  # Different phases across leaf clusters; no movement of the camera or rails.
  dx=support*(1.65*np.sin(t+x/170+y/230)+.65*np.sin(2*t+x/65-y/110))
  dy=support*.45*np.sin(t+x/130+y/85)
  p.stdin.write(cv2.remap(frame,x+dx,y+dy,cv2.INTER_CUBIC,borderMode=cv2.BORDER_REFLECT_101).tobytes())
 if cap:cap.release()
 p.stdin.close()
 if p.wait():raise RuntimeError(room+' encoding failed')
 result={'room':room,'file':target.name,'bytes':target.stat().st_size,'source':'Runway + local foliage wind' if cap else 'original photograph + local foliage wind','frames':N,'fps':FPS}
 print(json.dumps(result),flush=True);return result
if __name__=='__main__':
 with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:results=list(pool.map(run,['Living','Dining','Master','Kitchen','Office','Fitness','Entry','Bedroom']))
 PROOF.mkdir(exist_ok=True,parents=True)
 (PROOF/'window-media.json').write_text(json.dumps(results,indent=2))
