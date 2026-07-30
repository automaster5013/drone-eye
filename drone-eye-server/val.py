from ultralytics import YOLO

# 1. 파인튜닝된 나만의 최첨단 모델 로드
model = YOLO('best.pt') 

# 2. 검증(Validation) 시작
# VisDrone 데이터셋의 검증용 이미지들을 사용해 모델의 성능을 채점합니다.
print("🚀 YOLO26m (VisDrone) 성능 검증을 시작합니다...")
metrics = model.val(data='VisDrone.yaml', split='val', device=0)

# 3. 핵심 성적표 출력
print(f"🎯 mAP50 (객체 탐지 정확도): {metrics.box.map50:.3f}")
print(f"🎯 mAP50-95 (박스의 정교함): {metrics.box.map:.3f}")