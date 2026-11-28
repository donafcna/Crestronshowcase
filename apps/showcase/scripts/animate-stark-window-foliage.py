"""Complete gentle foliage motion for every glazed room. Silent video output.
The browser applies the calibrated glazing and foreground masks, never the room.
Sharp original photographs prevent the soft generated texture from smearing leaves.
"""
from pathlib import Path
import concurrent.futures,subprocess,json,runpy,sys
import cv2,numpy as np,imageio_ffmpeg
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/showcases/villa-stark/assets/video'
PROOF=ROOT/'docs/verification/2026-11-28-vegetation-fixe'
MASKS=runpy.run_path(str(ROOT/'scripts/stark-foliage-masks.py'))['MASKS']
W,H,FPS,N=1280,720,24,383
cv2.setNumThreads(2)
y,x=np.mgrid[:H,:W].astype(np.float32)
def run(room):
 photo=cv2.resize(cv2.imread(str(ROOT/f'public/showcases/villa-stark/assets/original/room-{room}.webp')),(W,H))
 hsv=cv2.cvtColor(photo,cv2.COLOR_BGR2HSV)
 # Leaf clusters, including pale blossoms surrounded by foliage. Dilated soft
 # support keeps movement continuous instead of cutting out individual leaves.
 leaves=((hsv[:,:,0]>=16)&(hsv[:,:,0]<=94)&(hsv[:,:,1]>30)&(hsv[:,:,2]>28)).astype(np.uint8)*255
 leaves=cv2.dilate(leaves,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(21,21)))
 support=cv2.GaussianBlur(leaves.astype(np.float32)/255,(0,0),5)
 # Preserve long rigid dark structures (window rails and tree trunks), including
 # a safety margin wider than the maximum displacement of neighbouring leaves.
 dark=(hsv[:,:,2]<105).astype(np.uint8)*255
 vertical=cv2.morphologyEx(dark,cv2.MORPH_OPEN,np.ones((95,3),np.uint8))
 horizontal=cv2.morphologyEx(dark,cv2.MORPH_OPEN,np.ones((3,95),np.uint8))
 rigid=cv2.dilate(cv2.max(vertical,horizontal),np.ones((25,25),np.uint8))
 if room!='Entry':support*=1-cv2.GaussianBlur(rigid.astype(np.float32)/255,(0,0),3)
 cfg=MASKS[room];allowed=np.zeros((H,W),np.uint8);locked=np.zeros_like(allowed)
 def points(p):return np.round(np.array(p)*[W/1672,H/941]).astype(np.int32)
 for poly in cfg['crowns']:cv2.fillPoly(allowed,[points(poly)],255)
 for line,width in cfg['lines']:cv2.polylines(locked,[points(line)],False,255,max(1,round((width+24)*W/1672)))
 for poly in cfg['rocks']:cv2.fillPoly(locked,[points(poly)],255)
 locked=cv2.dilate(locked,np.ones((9,9),np.uint8))
 distance=cv2.distanceTransform(255-locked,cv2.DIST_L2,5)
 clearance=np.clip(distance/14,0,1);clearance=clearance*clearance*(3-2*clearance)
 support*=cv2.GaussianBlur(allowed.astype(np.float32)/255,(0,0),4)*clearance
 cap=None
 target=OUT/f'landscape-{room.lower()}-loop-v4.mp4'
 p=subprocess.Popen([imageio_ffmpeg.get_ffmpeg_exe(),'-hide_banner','-loglevel','error','-y','-f','rawvideo','-pixel_format','bgr24','-video_size',f'{W}x{H}','-framerate',str(FPS),'-i','pipe:0','-an','-c:v','libx264','-threads','2','-preset','medium','-crf','17','-pix_fmt','yuv420p','-movflags','+faststart',str(target)],stdin=subprocess.PIPE)
 for n in range(N):
  if cap:
   ok,frame=cap.read()
   if not ok:raise RuntimeError(room+' source incomplete')
  else:frame=photo
  t=2*np.pi*n/N
  # Different phases across leaf clusters; no movement of the camera or rails.
  gust=.68*np.sin(2*t+x/210+y/290)+.23*np.sin(3*t+x/170)+.09*np.sin(5*t+y/230)
  # Slow branch flexion plus smaller leaf-tip response; staggered local phases.
  dx=support*(5.8*gust+.8*np.sin(7*t+x/45-y/90))
  dy=support*(1.1*np.sin(2*t+x/190+y/160)+.25*np.sin(5*t+x/55))
  warped=cv2.remap(frame,x+dx,y+dy,cv2.INTER_CUBIC,borderMode=cv2.BORDER_REFLECT_101)
  warped[locked>0]=photo[locked>0]
  p.stdin.write(warped.tobytes())
 if cap:cap.release()
 p.stdin.close()
 if p.wait():raise RuntimeError(room+' encoding failed')
 result={'room':room,'file':target.name,'bytes':target.stat().st_size,'source':'Runway + local foliage wind' if cap else 'original photograph + local foliage wind','frames':N,'fps':FPS}
 print(json.dumps(result),flush=True);return result
if __name__=='__main__':
 rooms=sys.argv[1:] or ['Living','Dining','Master','Kitchen','Office','Fitness','Entry','Bedroom']
 with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:results=list(pool.map(run,rooms))
 PROOF.mkdir(exist_ok=True,parents=True)
 if (PROOF/'window-media.json').exists():
  results=[r for r in json.loads((PROOF/'window-media.json').read_text()) if r['room'] not in rooms]+results
 (PROOF/'window-media.json').write_text(json.dumps(results,indent=2))
