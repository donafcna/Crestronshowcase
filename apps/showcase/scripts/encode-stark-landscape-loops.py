"""Final constant-quantizer delivery from the previously stabilized slow takes."""
from pathlib import Path
import concurrent.futures,json,subprocess,sys
import cv2,numpy as np,imageio_ffmpeg
ROOT=Path(__file__).resolve().parents[1]
PROOF=ROOT/'docs/verification/2026-11-28-paysages'
FF=imageio_ffmpeg.get_ffmpeg_exe()
cv2.setNumThreads(2)
def encode(room):
 c=cv2.VideoCapture(str(PROOF/'source'/f'{room}-slow.mp4'));frames=[]
 while True:
  ok,f=c.read()
  if not ok:break
  frames.append(f)
 c.release();fade=48;sequence=frames[fade:-fade]
 for n in range(fade):
  a=n/(fade-1);a=a*a*(3-2*a);sequence.append(cv2.addWeighted(frames[-fade+n],1-a,frames[n],a,0))
 target=ROOT/'public/showcases/villa-stark/assets/video'/f'landscape-{room.lower()}-loop-v1.mp4'
 writer=subprocess.Popen([FF,'-hide_banner','-loglevel','error','-y','-f','rawvideo','-pixel_format','bgr24','-video_size','1280x720','-framerate','24','-i','pipe:0','-an','-c:v','libx264','-threads','2','-preset','slow','-qp','16','-x264-params','ipratio=1:pbratio=1:aq-mode=0:keyint=96:min-keyint=96:scenecut=0','-pix_fmt','yuv420p','-movflags','+faststart',str(target)],stdin=subprocess.PIPE)
 for f in sequence:writer.stdin.write(f.tobytes())
 writer.stdin.close()
 if writer.wait():raise RuntimeError('encode failed')
 del sequence,frames
 c=cv2.VideoCapture(str(target));first=None;last=None;first_blur=None;last_blur=None;d=[];smooth=[]
 while True:
  ok,f=c.read()
  if not ok:break
  b=cv2.GaussianBlur(f,(0,0),3)
  if first is None:first=f;first_blur=b
  if last is not None:d.append(float(cv2.absdiff(last,f).mean()));smooth.append(float(cv2.absdiff(last_blur,b).mean()))
  last=f;last_blur=b
 c.release()
 result={'room':room,'bytes':target.stat().st_size,'encodedSeamDifference':float(cv2.absdiff(last,first).mean()),'encodedAdjacentP95':float(np.percentile(d,95)),'encodedAdjacentMedian':float(np.median(d)),'smoothSeamDifference':float(cv2.absdiff(last_blur,first_blur).mean()),'smoothAdjacentP95':float(np.percentile(smooth,95))}
 print(json.dumps(result),flush=True);return result
if __name__=='__main__':
 rooms=sys.argv[1:] or ['Living','Dining','Master','Exterior']
 with concurrent.futures.ThreadPoolExecutor(max_workers=2) as p:results=list(p.map(encode,rooms))
 previous=json.loads((PROOF/'video-metrics.json').read_text())
 for result in results:
  next(r for r in previous if r['room']==result['room']).update(result)
 (PROOF/'video-metrics.json').write_text(json.dumps(previous,indent=2))
