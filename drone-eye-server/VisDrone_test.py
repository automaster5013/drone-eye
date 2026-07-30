from ultralytics import YOLO

# 1. 파인튜닝된 나만의 최첨단 모델 로드
model = YOLO('best.pt') 

print("🚀 YOLO26m (VisDrone) 실전 성능 검증을 시작합니다...")

# 2. stream=True 옵션을 추가하여 RAM 메모리 폭발을 방지합니다.
results = model.predict(source='test_video.mp4', show=True, save=True, stream=True)

# 3. stream=True를 사용하면 제너레이터가 반환되므로, for문으로 돌려주어야 영상이 재생됩니다.
for r in results:
    pass 

print("✅ 영상 추론 및 저장이 완료되었습니다!")