V132 iPad Safari 독립 저장소용 테스트 패치

기존 AstraeOratio_ARCHIVE 저장소는 변경하지 마세요.
이 ZIP에는 실행 코드와 진입 페이지가 들어 있으며, 대용량 assets는 포함하지 않습니다.

새 저장소 준비
1. GitHub에서 기존 AstraeOratio_ARCHIVE의 Code → Download ZIP으로 현재 파일을 받습니다.
2. 새 저장소를 만듭니다. 예: AstraeOratio_IPAD_TEST
3. 기존 ZIP을 풀고 그 안의 사이트 파일 전체를 새 저장소의 루트에 복사합니다.
   index.html, combat.html, assets 폴더가 저장소 루트에 있어야 합니다.
   바깥쪽 AstraeOratio_ARCHIVE-main 폴더 자체를 올리면 경로가 달라질 수 있습니다.
4. 이번 ZIP을 풀어 새 저장소 루트에 덮어씁니다.
   index.html / combat.html / combat-safari.js / combat-safari.css / safari-audio.js
   .nojekyll도 포함되어 있습니다. README와 tests는 실행에 필수는 아닙니다.
5. 새 저장소에서 GitHub Pages를 설정합니다.
   Settings → Pages → Deploy from a branch → main / (root) → Save
6. 배포 완료 후 GitHub Pages가 표시하는 새 사이트 주소로 iPad Safari에서 접속합니다.
   저장소명을 위 예시로 정했다면 예상 주소:
   https://newdesgiienr.github.io/AstraeOratio_IPAD_TEST/
   이 주소는 실제 생성·배포 후에만 열립니다. 제가 저장소 생성/배포를 실행한 것은 아닙니다.

독립 동작
- 모든 전투 자산 경로는 새 저장소의 assets/combat/... 를 사용합니다.
- 원래 PC 사이트 주소와 파일은 수정하지 않습니다.
- 새 사이트 루트 접속 시 combat.html로 이동하며 Safari 개선 코드를 실행합니다.
- PC로 새 테스트 주소에 접속하면 개선판이 실행됩니다. PC 원래 주소는 그대로입니다.

홀드 개선
- 전투 영역과 스킬 버튼 하위 이미지/숫자에 WebKit 텍스트 선택·길게 누르기 메뉴 방지를 적용했습니다.
- 스킬 버튼 이미지 드래그 및 contextmenu/selectstart를 차단했습니다.
- 한 손가락의 Pointer ID를 추적하고 포인터 캡처를 사용합니다.
- 손가락을 떼거나 포인터가 취소될 때 차지를 한 번만 종료합니다.
- 차지 종료 뒤 Safari가 발생시키는 합성 클릭에 의한 추가 스킬 사용을 차단합니다.
- Pointer Events 없는 구형 환경에는 touch 이벤트 대체 처리가 있습니다.
- 페이지 전체의 확대 기능은 비활성화하지 않았습니다. 전투 조작 영역에 제스처 방지를 적용했습니다.

오디오 개선 유지
- 하나의 AudioContext로 BGM/효과음 재생, 시작 터치에서 활성화.
- 소리 준비 완료 후 전투 진행. 화면 표시 → BGM → 0.45초 후 시작 로고.
- 일시정지/오디오 중단/탭 복귀 시 복구 버튼.
- 영상 자동 재생 차단 시 터치로 재시도.

검증 및 한계
- JavaScript 구문 검사, 오디오 상태 테스트, 전투 시작/대기/복구 통합 테스트 통과.
- 차지 종료 1회 및 추가 클릭 중복 방지 테스트 통과.
- 실제 iPad Safari에서 돋보기, 청취, 터치 전 과정은 직접 확인하지 못했습니다.
- iPadOS 접근성 확대 기능 등 운영체제 동작은 웹 CSS로 제어할 수 없습니다.
- 새 사이트에서 카논/울브헤른 차지 1·2단, 버튼 바깥에서 손가락 떼기, 일시정지 후 차지를 확인해주세요.
