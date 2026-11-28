from pathlib import Path
import cv2,numpy as np,json
ROOT=Path.cwd();D=ROOT/'docs/verification/2026-11-28-exterieur-fixe'
ROIS={'left_trunk':[13,420,22,80],'right_trunk':[1635,340,18,100],'rock_main':[552,726,42,30],'rock_right':[900,805,65,35],'rock_left':[125,806,40,24],'lower_steps':[646,773,85,35],'upper_steps':[805,672,80,22],'roof':[810,294,55,15],'fern_left':[487,779,43,30],'fern_right':[843,741,67,28],'tree_leaves':[250,15,80,45],'grass':[1050,680,85,70],'above_roof_leaves':[650,237,35,25]}
MOVING=['fern_left','fern_right','tree_leaves','grass','above_roof_leaves']
cv2.setNumThreads(2)
c=cv2.VideoCapture(str(ROOT/'public/showcases/villa-stark/assets/video/landscape-exterior-loop-v4.mp4'));frames=[]
for n in [0,48,96,144,192,240,288,336]:
 c.set(cv2.CAP_PROP_POS_FRAMES,n);ok,f=c.read()
 if not ok:raise RuntimeError('Incomplete video')
 frames.append(cv2.cvtColor(f,cv2.COLOR_BGR2GRAY))
c.release();h,w=frames[0].shape;result={}
for name,(x,y,rw,rh) in ROIS.items():
 mask=np.zeros((h,w),np.uint8);xx=int(x*w/1672);yy=int(y*h/941);ww=max(2,int(rw*w/1672));hh=max(2,int(rh*h/941));mask[yy:yy+hh,xx:xx+ww]=255
 pts=cv2.goodFeaturesToTrack(frames[0],maxCorners=40,qualityLevel=.015,minDistance=2,mask=mask);distances=[]
 if pts is not None:
  for f in frames[1:]:
   q,status,err=cv2.calcOpticalFlowPyrLK(frames[0],f,pts,None,winSize=(15,15),maxLevel=2);good=status[:,0]==1;distances.extend(np.linalg.norm(q[good]-pts[good],axis=2).flatten().tolist())
 result[name]={'roiPhoto':[x,y,rw,rh],'p90':round(float(np.percentile(distances,90)),3) if distances else None,'samples':len(distances)}
 print(name,result[name],flush=True)
(D/'motion-v4.json').write_text(json.dumps(result,indent=2))
fail=[(k,v['p90']) for k,v in result.items() if k not in MOVING and (v['p90'] is None or v['p90']>.5)]
fail += [(k,v['p90']) for k,v in result.items() if k in MOVING and (v['p90'] is None or v['p90']<(1.0 if k=='above_roof_leaves' else 1.5))]
print('FAILURES',fail)
if fail:raise SystemExit(1)
