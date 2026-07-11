"""Extrai landmarks (33 pontos MediaPipe) por frame para os clipes selecionados.
Usa PoseLandmarker Lite (mesmo modelo que a produção via @mediapipe/tasks-vision 0.10.35).
Saída: /tmp/qevd/landmarks/<sample_id>.json com {t, landmarks[]}.
"""
import json, os, cv2, sys
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision as mp_vision
import mediapipe as mp

MODEL='/tmp/qevd/pose_landmarker_lite.task'
PLAN=json.load(open('/tmp/qevd/samples_plan.json'))

opts = mp_vision.PoseLandmarkerOptions(
    base_options=mp_python.BaseOptions(model_asset_path=MODEL),
    running_mode=mp_vision.RunningMode.VIDEO,
    num_poses=1,
)
os.makedirs('/tmp/qevd/landmarks', exist_ok=True)

for row in PLAN:
    sid=row['sample_id']; vid=row['video']
    src=f'/tmp/qevd/videos/{vid}.mp4'
    cap=cv2.VideoCapture(src)
    fps=cap.get(cv2.CAP_PROP_FPS) or 30.0
    start_f=int(round(row['start']*fps)); end_f=int(round(row['end']*fps))
    cap.set(cv2.CAP_PROP_POS_FRAMES, start_f)
    frames=[]
    with mp_vision.PoseLandmarker.create_from_options(opts) as pl:
      idx=start_f
      while idx<=end_f:
        ok,frame=cap.read()
        if not ok: break
        t=(idx-start_f)/fps
        rgb=cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mpimg=mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
        res=pl.detect_for_video(mpimg, int(t*1000))
        if res.pose_landmarks:
          lms=[{"x":lm.x,"y":lm.y,"z":lm.z,"visibility":lm.visibility} for lm in res.pose_landmarks[0]]
        else:
          lms=[]
        frames.append({"t":round(t,4),"landmarks":lms})
        idx+=1
    cap.release()
    out={"sample_id":sid,"video":vid,"start_s":row['start'],"end_s":row['end'],"fps":fps,"frames":frames}
    json.dump(out, open(f'/tmp/qevd/landmarks/{sid}.json','w'))
    valid=sum(1 for f in frames if f['landmarks'])
    print(f"{sid} {row['exercise']:15s} frames={len(frames):4d} valid={valid:4d}", flush=True)
