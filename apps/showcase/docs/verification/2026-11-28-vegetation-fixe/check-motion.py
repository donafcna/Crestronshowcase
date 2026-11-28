from pathlib import Path
import ast,cv2,numpy as np,json,concurrent.futures
ROOT=Path.cwd();D=ROOT/'docs/verification/2026-11-28-vegetation-fixe'
ROIS=json.loads((D/'rois.json').read_text())
cv2.setNumThreads(2)
def run(room):
 p=ROOT/f'public/showcases/villa-stark/assets/video/landscape-{room.lower()}-loop-v4.mp4'
 cap=cv2.VideoCapture(str(p));frames=[]
 for n in [0,48,96,144,192,240,288,336]:
  cap.set(cv2.CAP_PROP_POS_FRAMES,n);ok,f=cap.read()
  if not ok:raise RuntimeError(str(p))
  frames.append(cv2.cvtColor(f,cv2.COLOR_BGR2GRAY))
 cap.release();h,w=frames[0].shape;result={}
 for name,(x,y,rw,rh) in ROIS[room].items():
  mask=np.zeros((h,w),np.uint8);xx=int(x*w/1672);yy=int(y*h/941);ww=max(2,int(rw*w/1672));hh=max(2,int(rh*h/941));mask[yy:yy+hh,xx:xx+ww]=255
  pts=cv2.goodFeaturesToTrack(frames[0],maxCorners=40,qualityLevel=.015,minDistance=2,mask=mask);distances=[]
  if pts is not None:
   for f in frames[1:]:
    q,status,err=cv2.calcOpticalFlowPyrLK(frames[0],f,pts,None,winSize=(15,15),maxLevel=2);good=status[:,0]==1;distances.extend(np.linalg.norm(q[good]-pts[good],axis=2).flatten().tolist())
  result[name]={'p90':round(float(np.percentile(distances,90)),3) if distances else None,'samples':len(distances)}
 print(room,result,flush=True);return {'room':room,'regions':result}
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:results=list(pool.map(run,ROIS))
(D/'motion-v4.json').write_text(json.dumps(results,indent=2))
fail=[(r['room'],k,v['p90']) for r in results for k,v in r['regions'].items() if k!='foliage' and v['p90'] is not None and v['p90']>.75]
fail += [(r['room'],'foliage too still',r['regions']['foliage']['p90']) for r in results if r['regions']['foliage']['p90'] is None or r['regions']['foliage']['p90']<1.5]
print('FAILURES',fail)
if fail:raise SystemExit(1)
