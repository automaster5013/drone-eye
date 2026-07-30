import cv2
import threading
import asyncio
import json
import os
import time
import csv
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ultralytics import YOLO

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("🚀 Loading YOLO26 Models (m체급 초격차 라인업)...")
model_det = YOLO('best.pt')
model_pose = YOLO('yolo26m-pose.pt')
model_seg = YOLO('yolo26m-seg.pt')

# 🚀 [추가] 영상 소스 스왑 설정
current_source = "live"
RTSP_URL = "rtsp://localhost:8554/drone-eye"
VIDEO_PATH = "test_video.mp4"

current_mode = "Tactical HUD"

# 🚀 [수정 1] 초기 데이터 상태를 안전모 기준으로 변경
latest_data = {
    "hardhat": 0,
    "no_hardhat": 0,
    "log": "AI System Initialized. Waiting for objects..."
}

CSV_FILE = "drone_eye_analytics.csv"
if not os.path.exists(CSV_FILE):
    with open(CSV_FILE, mode='w', newline='', encoding='utf-8-sig') as f:
        writer = csv.writer(f)
        # 🚀 CSV 헤더도 안전모(Hardhat) 기준으로 변경
        writer.writerow(["Timestamp", "AI_Mode", "Video_Source", "Hardhat_Count", "NO_Hardhat_Count"])

class ModeRequest(BaseModel):
    mode: str

class SourceRequest(BaseModel):
    source: str

@app.post("/change_mode")
async def change_mode(req: ModeRequest):
    global current_mode
    current_mode = req.mode
    print(f"🔄 AI Processing Mode Switched to: {current_mode}")
    return {"status": "success", "mode": current_mode}

# 🚀 [추가] 영상 소스 변경 API
@app.post("/change_source")
async def change_source(req: SourceRequest):
    global current_source
    current_source = req.source
    print(f"📡 Video Source Switched to: {'LIVE DRONE' if current_source == 'live' else 'SIMULATION VIDEO'}")
    return {"status": "success", "source": current_source}

# 🚀 [수정] 라이브와 MP4를 동적으로 스왑하는 스마트 리더 스레드
def frame_reader():
    global latest_raw_frame, current_source
    cap = None
    last_source = None

    while True:
        # 소스가 변경되었거나 캡처 객체가 없으면 새로 연결
        if cap is None or last_source != current_source:
            if cap is not None:
                cap.release()
            source_path = RTSP_URL if current_source == "live" else VIDEO_PATH
            print(f"📡 Connecting to stream: {source_path}")
            cap = cv2.VideoCapture(source_path)
            last_source = current_source
            time.sleep(1)

        ret, frame = cap.read()

        # 프레임을 못 읽었을 때 (영상이 끊기거나 끝났을 때)
        if not ret:
            if current_source == "video":
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0) # 동영상이 끝나면 처음부터 무한 반복
                continue
            else:
                cap.release()
                cap = None
                time.sleep(2)
                continue

        latest_raw_frame = cv2.resize(frame, (640, 480))

        # 동영상 재생 속도 조절 (너무 빨리 읽어버리는 것 방지)
        if current_source == "video":
            time.sleep(0.03)

def run_inference():
    global latest_data, latest_frame, latest_raw_frame, current_mode, current_source

    print("🚀 AI Vision Engine Started. 실시간 추론 대기 중...")
    last_csv_save_time = time.time()

    while True:
        if latest_raw_frame is None:
            time.sleep(0.1)
            continue

        frame_to_process = latest_raw_frame.copy()

        if current_mode == "Tactical HUD":
            results = model_seg(frame_to_process, verbose=False)
            gray_frame = cv2.cvtColor(frame_to_process, cv2.COLOR_BGR2GRAY)
            gray_bgr = cv2.cvtColor(gray_frame, cv2.COLOR_GRAY2BGR)
            annotated_frame = results[0].plot(img=gray_bgr)
        elif current_mode == "Detection":
            results = model_det(frame_to_process, verbose=False)
            annotated_frame = results[0].plot()
        elif current_mode == "Tracking":
            results = model_det.track(frame_to_process, persist=True, tracker="bytetrack.yaml", verbose=False)
            annotated_frame = results[0].plot()
        elif current_mode == "Pose":
            results = model_pose(frame_to_process, verbose=False)
            annotated_frame = results[0].plot()
        elif current_mode == "Segmentation":
            results = model_seg(frame_to_process, verbose=False)
            annotated_frame = results[0].plot()
        else:
            results = model_det(frame_to_process, verbose=False)
            annotated_frame = results[0].plot()

        success, buffer = cv2.imencode('.jpg', annotated_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
        if success:
            latest_frame = buffer.tobytes()

        # 🚀 [수정 2] 안전모 카운팅 로직으로 변경
        hardhat_count = 0
        no_hardhat_count = 0

        if current_mode in ["Detection", "Tracking", "Tactical HUD"]:
            for r in results:
                for box in r.boxes:
                    cls_id = int(box.cls[0])
                    if cls_id == 0:      # 0번 클래스: Hardhat
                        hardhat_count += 1
                    elif cls_id == 1:    # 1번 클래스: NO-Hardhat
                        no_hardhat_count += 1

            latest_data["hardhat"] = hardhat_count
            latest_data["no_hardhat"] = no_hardhat_count
            latest_data["log"] = f"[{current_mode}] Detected -> Hardhat: {hardhat_count}, NO-Hardhat: {no_hardhat_count}"
        else:
            latest_data["log"] = f"[{current_mode}] Mode Active - Analyzing structural data."

        # 🚀 [수정 3] CSV에 기록될 데이터 변경
        current_time = time.time()
        if current_time - last_csv_save_time >= 1.0:
            try:
                with open(CSV_FILE, mode='a', newline='', encoding='utf-8-sig') as f:
                    writer = csv.writer(f)
                    timestamp_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    writer.writerow([timestamp_str, current_mode, current_source, latest_data["hardhat"], latest_data["no_hardhat"]])
                last_csv_save_time = current_time
            except Exception as e:
                pass

@app.on_event("startup")
def startup_event():
    reader_thread = threading.Thread(target=frame_reader, daemon=True)
    inference_thread = threading.Thread(target=run_inference, daemon=True)
    reader_thread.start()
    inference_thread.start()

async def video_generator():
    global latest_frame
    while True:
        if latest_frame is not None:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + latest_frame + b'\r\n')
        await asyncio.sleep(0.03)

@app.get("/video_feed")
async def video_feed():
    return StreamingResponse(video_generator(), media_type="multipart/x-mixed-replace; boundary=frame")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            await websocket.send_text(json.dumps(latest_data))
            await asyncio.sleep(0.5)
    except WebSocketDisconnect:
        pass