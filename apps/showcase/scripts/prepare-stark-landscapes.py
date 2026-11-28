"""Prepare existing Runway takes; no new generation. Video processing only.
Run from apps/showcase. Originals stay in the local verification source folder.
"""
from pathlib import Path
import concurrent.futures
import json
import subprocess
import cv2
import numpy as np
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[1]
PROOF = ROOT / 'docs/verification/2026-11-28-paysages'
SOURCE = PROOF / 'source'
OUT = ROOT / 'public/showcases/villa-stark/assets/video'
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
W, H, FPS = 1280, 720, 24
cv2.setNumThreads(2)

def run(room):
    photo_name = 'hero-on.webp' if room == 'Exterior' else f'room-{room}.webp'
    photo = cv2.resize(cv2.imread(str(ROOT / 'public/showcases/villa-stark/assets/original' / photo_name)), (W,H))
    ref = cv2.cvtColor(cv2.resize(photo,(640,360)),cv2.COLOR_BGR2GRAY).astype(np.float32)/255
    mask = np.zeros((360,640),np.uint8)
    if room == 'Living': mask[:,:] = 255; mask[40:300,:290] = 0
    elif room == 'Dining': mask[:,:295] = 255; mask[:75,:] = 255
    elif room == 'Master': mask[:,:305] = 255; mask[:55,:] = 255
    else: mask[155:240,135:570] = 255
    cap = cv2.VideoCapture(str(SOURCE / f'{room}.mp4'))
    frames=[]
    while True:
        ok,frame=cap.read()
        if not ok:break
        frames.append(frame)
    cap.release()
    samples=[]
    for i in range(0,len(frames),8):
        gray=cv2.cvtColor(cv2.resize(frames[i],(640,360)),cv2.COLOR_BGR2GRAY).astype(np.float32)/255
        try:
            score,m=cv2.findTransformECC(ref,gray,np.eye(2,3,dtype=np.float32),cv2.MOTION_AFFINE,(cv2.TERM_CRITERIA_COUNT|cv2.TERM_CRITERIA_EPS,60,1e-5),mask,5)
            if not .97<np.linalg.det(m[:,:2])<1.03:raise ValueError('Excessive affine scale')
        except (cv2.error,ValueError):
            m=samples[-1][1].copy() if samples else np.eye(2,3,dtype=np.float32);score=0
        m[:,2]*=2
        samples.append((i,m,float(score)))
    idx=np.array([s[0] for s in samples]); matrices=np.stack([s[1] for s in samples])
    transforms=np.empty((len(frames),2,3),np.float32)
    for y in range(2):
        for x in range(3):transforms[:,y,x]=np.interp(np.arange(len(frames)),idx,matrices[:,y,x])
    stable=SOURCE / f'{room}-stable.mp4'
    writer=subprocess.Popen([FFMPEG,'-hide_banner','-loglevel','error','-y','-f','rawvideo','-pixel_format','bgr24','-video_size',f'{W}x{H}','-framerate',str(FPS),'-i','pipe:0','-an','-c:v','libx264','-threads','2','-crf','14','-pix_fmt','yuv420p',str(stable)],stdin=subprocess.PIPE)
    for f,m in zip(frames,transforms):
        aligned=cv2.warpAffine(f,m,(W,H),flags=cv2.INTER_LINEAR|cv2.WARP_INVERSE_MAP,borderMode=cv2.BORDER_REFLECT_101)
        writer.stdin.write(aligned.tobytes())
    writer.stdin.close()
    if writer.wait():raise RuntimeError('Stable encode failed')
    del frames
    slow=SOURCE / f'{room}-slow.mp4'
    subprocess.run([FFMPEG,'-hide_banner','-loglevel','error','-y','-i',str(stable),'-vf','setpts=1.8*PTS,minterpolate=fps=24:mi_mode=mci:mc_mode=aobmc:vsbmc=1','-an','-c:v','libx264','-threads','2','-crf','16','-pix_fmt','yuv420p',str(slow)],check=True)
    cap=cv2.VideoCapture(str(slow)); frames=[]
    while True:
        ok,f=cap.read()
        if not ok:break
        frames.append(f)
    cap.release()
    fade=48
    # Tail-to-head moving dissolve, then continue from the next source frame.
    # Last output -> first output is an ordinary pair of adjacent source frames.
    sequence=frames[fade:-fade]
    for n in range(fade):
        a=n/(fade-1);a=a*a*(3-2*a)
        sequence.append(cv2.addWeighted(frames[-fade+n],1-a,frames[n],a,0))
    target=OUT / f'landscape-{room.lower()}-loop-v1.mp4'
    writer=subprocess.Popen([FFMPEG,'-hide_banner','-loglevel','error','-y','-f','rawvideo','-pixel_format','bgr24','-video_size',f'{W}x{H}','-framerate',str(FPS),'-i','pipe:0','-an','-c:v','libx264','-threads','2','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',str(target)],stdin=subprocess.PIPE)
    for f in sequence:writer.stdin.write(f.tobytes())
    writer.stdin.close()
    if writer.wait():raise RuntimeError('Loop encode failed')
    step=[float(cv2.absdiff(sequence[i],sequence[i-1]).mean()) for i in range(1,len(sequence))]
    result={'room':room,'frames':len(sequence),'duration':len(sequence)/FPS,'fps':FPS,'speed':1/1.8,'crossfadeSeconds':fade/FPS,'seamDifference':float(cv2.absdiff(sequence[-1],sequence[0]).mean()),'adjacentMedian':float(np.median(step)),'adjacentP95':float(np.percentile(step,95)),'alignmentMedianScore':float(np.median([s[2] for s in samples])),'translationRangePixels':(transforms[:,:,2].max(axis=0)-transforms[:,:,2].min(axis=0)).tolist(),'bytes':target.stat().st_size}
    print(json.dumps(result),flush=True)
    return result

if __name__ == '__main__':
    OUT.mkdir(exist_ok=True,parents=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:results=list(pool.map(run,['Living','Dining','Master','Exterior']))
    (PROOF/'video-metrics.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
