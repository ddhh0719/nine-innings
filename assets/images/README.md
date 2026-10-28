# 이미지 업로드 폴더 안내

이 폴더는 그림 파일을 직접 업로드하는 용도입니다. 기본 일러스트 SVG는 전부 삭제했습니다.

## 폴더

- backgrounds/ : 게임 배경. 현재 코드 연결 파일은 stadium.webp 입니다.
- events/ : 드래프트, 데뷔, 부상, 계약, 우승 등 상황 그림.
- players/ : 추후 선수 얼굴/카드 그림용. 현재 자동 표시 기능은 없음.
- teams/ : 추후 구단 엠블럼/로고용. 현재 자동 표시 기능은 없음.

## 현재 index.html에 바로 연결되어 있는 파일명

- backgrounds/stadium.webp : 상시 배경
- events/draft.webp : 드래프트
- events/debut.webp : 프로 데뷔
- events/injury.webp : 부상 재활
- events/contract.webp : FA 계약
- events/champion.webp : 우승

## 준비만 된 파일명

events/training.webp, events/batting.webp, events/pitching.webp

위 3개는 이름이 허용되어 있지만 아직 화면에 해당 sceneArt() 호출이 연결되어 있지 않아 업로드만으로는 나타나지 않습니다.
그 외에 직접 추가하는 이미지도 업로드는 가능하지만 화면 이벤트 연결은 별도 코드 수정이 필요합니다.

## 업로드 방법

1. GitHub 저장소에서 feature/realistic-season-v1 브랜치를 선택하세요.
2. assets/images 로 들어와 원하는 폴더를 클릭하세요.
3. Add file > Upload files를 누르고 WebP 이미지 파일을 올리세요.
4. Commit changes를 누르세요.

이미지는 반드시 정확한 영어 파일명과 .webp 확장자를 유지해야 표시됩니다.
.gitkeep 파일은 빈 폴더를 GitHub에서 유지하기 위해 사용합니다. 지우지 않아도 됩니다.
업로드되지 않은 이미지는 게임 화면에 표시되지 않으며, 일반 UI는 그대로 작동합니다.

이전에 받은 이미지 ZIP은 최상위 assets/images/를 기준으로 만들어졌습니다.
이번 폴더 정리 이후에는 stadium.webp는 backgrounds/ 안으로, 나머지 이벤트 그림은 events/ 안으로 이동해 업로드하세요.
