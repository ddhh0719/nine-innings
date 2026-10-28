# 나인 이닝즈 이미지 파일명 안내

**브랜치: `feature/realistic-season-v1`**

이미지를 올리지 않아도 게임은 실행됩니다. 이미지가 없을 때 구단 로고, 라이프 아이템, 분류 이벤트는 기본 텍스트/아이콘을 보여주며, 커리어 큰 그림은 생략합니다. 기존에 올린 이미지는 그대로 유지합니다.

## 업로드 방법

1. [이미지 폴더](https://github.com/ddhh0719/nine-innings/tree/feature/realistic-season-v1/assets/images)를 엽니다.
2. 원하는 하위 폴더를 선택합니다.
3. **Add file → Upload files**를 눌러 아래에 적힌 **정확한 영문 파일명**으로 업로드합니다.
4. 아래쪽 **Commit changes**를 누릅니다.

모든 이미지 확장자는 `.webp`로 통일되어 있습니다. `.gitkeep` 파일은 삭제하지 않아도 됩니다. 이벤트·배경은 권장 16:9, 구단 로고는 1:1, 상품 썸네일은 4:3 비율입니다.

## 1. 항상 보이는 야구장 배경

`backgrounds/stadium.webp` — 전반적인 게임 배경.

## 2. 기존 주요 이벤트 장면

`events/`에 업로드: `draft.webp`, `debut.webp`, `injury.webp`, `contract.webp`, `champion.webp`.

*참고: `events/training.webp`, `events/batting.webp`, `events/pitching.webp`는 폴더에 올릴 수 있지만 아직 자동으로 화면에 나오지는 않습니다.*

## 3. 트레이드, 퍼포먼스 등 이벤트 분류 그림

`categories/`에 업로드합니다. 화면의 작은 기호 대신 **넓은 삽화 카드**가 나옵니다.

| 파일명 | 상황 |
|---|---|
| `performance.webp` | 경기 활약, 타격·투구·수비, 승부처, 포지션별 경기 |
| `trade.webp` | 트레이드, 구단 이동 |
| `health.webp` | 부상, 재활, 건강 |
| `contract.webp` | 협상, 계약 |
| `team.webp` | 구단 내부, 감독, 동료 |
| `training.webp` | 훈련, 육성, 성장 방향 |
| `media.webp` | 인터뷰, 기사, 기자회견 |
| `milestone.webp` | 기록 달성, 주요 이정표 |
| `national_team.webp` | 국가대표 경기 |
| `default.webp` | 분류가 지정되지 않은 기타 이벤트 |

이미지 파일이 없으면 기존 기호가 그대로 표시됩니다. 이미지가 생기면 자동 교체됩니다.

## 4. 가상 구단 10팀 로고

`teams/`에 넣습니다. **정사각형 1:1**, 투명 배경 WebP 권장.

| 구단 | 파일명 |
|---|---|
| 서울 코메츠 | `seoul_comets.webp` |
| 인천 실버웨일스 | `incheon_silverwhales.webp` |
| 수원 팰컨스 | `suwon_falcons.webp` |
| 대전 볼케이노스 | `daejeon_volcanoes.webp` |
| 대구 스콜피온스 | `daegu_scorpions.webp` |
| 부산 타이푼스 | `busan_typhoons.webp` |
| 광주 파이오니어스 | `gwangju_pioneers.webp` |
| 창원 로켓츠 | `changwon_rockets.webp` |
| 청주 그리폰스 | `cheongju_gryphons.webp` |
| 제주 드래곤테일즈 | `jeju_dragontails.webp` |

구단 로고는 선수 카드, 드래프트 결과, 리그 순위표에서 표시됩니다. 없다면 구단 고유색의 한 글자 대체 로고가 나타납니다.

## 5. 커리어 주요 장면 그림

`career/`에 넣습니다. **16:9** 권장.

현재 코드에 연결된 파일:
- `callup.webp`: 2군에서 1군 콜업
- `futures.webp`: 퓨처스리그 잔류
- `trade.webp`: 2차 드래프트를 통한 구단 변경
- `mvp.webp`: MVP 시상
- `gold_glove.webp`: 골든글러브 시상
- `retirement.webp`: 은퇴식

향후 확장용으로 미리 예약된 파일명(현재 업로드해도 자동 표시되지 않음):
`allstar.webp`, `record.webp`, `comeback.webp`, `military.webp`, `rookie.webp`, `first_hit.webp`, `first_home_run.webp`, `championship.webp`.

## 6. 라이프 상품·활동 개별 이미지

**`life/` 폴더에 다음 파일명 그대로 넣으면 라이프 탭의 해당 상품 카드에 자동 표시됩니다.** 4:3 비율 권장.

| 종류 | 파일 |
|---|---|
| 타자용 맞춤 경기화 | `cleats.webp` |
| 투수용 안정화 | `pitchshoes.webp` |
| 프로 수비 글러브 | `glove.webp` |
| 프리미엄 배트 | `bat.webp` |
| 타격 분석 장비 | `cage.webp` |
| 투구 분석 장비 | `pitchlab.webp` |
| 고급 회복 장비 | `armcare.webp` |
| 개인 운동 시설 | `fitness.webp` |
| 전담 훈련 센터 | `elitecamp.webp` |
| 전문 회복 프로그램 | `rest.webp` |
| 해외 휴양 여행 | `travel.webp` |
| 지역 사회 기부 | `charity.webp` |
| 팬미팅 | `fanmeet.webp` |
| 클럽 대관 | `club.webp` |
| 개인 영상 제작 | `media.webp` |
| 심리 상담 | `focus.webp` |
| 특별 합숙 훈련 | `training.webp` |
| 한정판 시계 | `watch.webp` |
| 고급 스포츠카 | `sports_car.webp` |
| 휴양 별장 | `villa.webp` |
| 트레이닝 센터 설립 | `academy.webp` |

## 추가 주의사항

- **동일한 파일명이 다른 폴더에 있어도 괜찮습니다.** 예: `categories/trade.webp`와 `career/trade.webp`는 표시되는 위치가 다릅니다.
- 구단 로고와 라이프 썸네일은 이미지 업로드 즉시 기존 대체 그림 대신 표시됩니다.
- 커리어 특별 이미지는 해당 **중요 이벤트가 발생했을 때만** 나타납니다.
- 선수 프로필용 `players/` 폴더도 유지합니다. 현재는 자동으로 선수 초상화를 불러오지 않습니다.
