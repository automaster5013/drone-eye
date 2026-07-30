# 🚁 Drone-Eye (드론 아이)

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Python](https://img.shields.io/badge/Python-3.8%2B-blue)
![YOLO](https://img.shields.io/badge/YOLO-v8%20%7C%20v11-yellow)
![License](https://img.shields.io/badge/License-MIT-green.svg)

**Drone-Eye**는 영상 데이터(CCTV, 드론 등)를 활용하여 실시간으로 객체를 탐지하고 추적하는 지능형 비전 관제 시스템입니다. 최신 딥러닝 모델을 적용하여 빠르고 정확한 판별이 가능하며, 사용자 친화적인 시각화 UI를 제공합니다.

<br>

## ✨ 주요 기능 (Key Features)

- **👀 실시간 객체 탐지 및 추적:** 고성능 객체 인식 모델(YOLO)을 기반으로 영상 내 타겟을 실시간으로 식별하고 이동 경로를 추적합니다.
- **🦺 안전 및 규정 위반 모니터링:** 특정 경계 범위 내에서 헬멧 등 안전 장비 착용 여부를 판별하여 시각적 알림을 제공합니다.
- **🖥️ 세련된 관제 UI:** 탐지된 객체의 Bounding Box, FPS, 신뢰도(Confidence) 등 주요 메타데이터를 직관적이고 깔끔한 화면으로 렌더링합니다.
- **⚡ 하드웨어 가속 지원:** NVIDIA GPU를 활용하여 실시간 스트리밍 환경에서도 병목 현상 없는 고속 추론을 지원합니다.

<br>

## 🛠️ 기술 스택 (Tech Stack)

- **Language:** Pure Python
- **Computer Vision:** OpenCV, PyTorch, YOLO
- **Environment:** Windows 11 / Ubuntu 24.04 지원

<br>

## 💻 권장 사양 (Prerequisites)

최적의 실시간 추론(Inference) 속도를 얻기 위해 GPU 환경을 권장합니다.
- **CPU:** AMD Ryzen 7 / Intel Core i7 이상
- **GPU:** NVIDIA GeForce RTX 3060 / 4060 / 5060 이상 (CUDA 지원 필수)
- **RAM:** 16GB 이상

<br>

## 🚀 시작하기 (Getting Started)

### 1. 저장소 클론 (Clone the repository)
```bash
git clone [https://github.com/](https://github.com/)[본인아이디]/drone-eye.git
cd drone-eye
```
### 2. 가상환경 설정 및 의존성 패키지 설치 (Install Dependencies)
```
# 가상환경 생성 및 활성화 (선택 사항)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 패키지 설치
pip install -r requirements.txt
```
### 3. 프로그램 실행 (Run)
```
# 샘플 비디오 또는 웹캠으로 실행
python main.py --source data/sample.mp4
```
## 📂 프로젝트 구조 (Project Structure)

```
drone-eye/
├── models/             # 학습된 가중치 모델 파일 (.pt)
├── data/               # 테스트용 영상 및 이미지 데이터
├── utils/              # 시각화 및 데이터 처리 유틸리티 함수
├── main.py             # 시스템 실행 메인 스크립트
├── requirements.txt    # 필요 패키지 목록
└── README.md           # 프로젝트 설명서
```

📸 시연 화면 (Screenshots)
(여기에 시스템이 실행되는 캡처 화면이나 GIF 애니메이션을 추가하세요. 시각적인 자료는 프로젝트의 완성도를 크게 높여줍니다.)

## 🤝 기여 및 문의 (Contributing & Contact)

버그 리포트나 기능 제안은 Issues 탭을 이용해 주세요.

Author: [본인 이름 또는 닉네임]

Email: [본인 이메일 주소]


**적용 팁:**
1. GitHub 리포지토리의 `README.md` 편집 버튼(연필 모양 아이콘)을 누릅니다.
2. 위 코드를 붙여넣습니다.
3. `[본인아이디]`, `[본인 이름 또는 닉네임]`, `[본인 이메일 주소]` 부분을 실제 정보로 수정합니다.
4. 나중에 프로젝트 실행 화면을 캡처해서 GitHub에 업로드한 뒤, **📸 시연 화면** 부분의 `[이미지 URL을 여기에 삽입하세요]`에 해당 이미지 링크를 넣어주면 훨씬 완성도 높은 페이지가 됩니다.

















