초등 저학년 아이들이 수학을 더 재미있고 직관적으로 배울 수 있도록 하는 '드래그 앤 드롭(Drag & Drop)' 방식의 인터렉티브 문제

# 초기 구조 설계

## 1. 서비스 정의

- 목표: 정답을 입력하는 기존 문제 풀이 방식 대신, 달빛약속 언어 박스를 직접 옮기며 수학 개념을 체득하는 저학년 맞춤 학습.
- 사용자: 초등 저학년 학생.
- 핵심 경험: 손으로 상자를 끌어다 놓으면서 문제를 해결하고, 올바르게 배치했을 때 보상, 틀렸을 때 반발 애니메이션으로 직관적 피드백을 받는 학습.

## 2. MVP 핵심 기능

### 2.1 드래그 인터랙션 문제

- 화면에 달빛약속 언어 박스(`CommandBox`)를 렌더링.
- 사용자는 박스를 끌어다가 정답 칸(`DropZone`)에 올려놓음.
- 드래그가 끝나면 정오답 판정이 실행됨.

### 2.2 정답 칸에 알맞은 달빛약속 언어 박스

- 각 문제는 최소 1개 이상의 `DropZone`과 1개 이상의 `CommandBox`를 포함.
- `DropZone`은 해당 위치에 놓여야 하는 박스의 정답 키를 가짐.
- 사용자가 박스를 놓으면, `DropZone`에 설정된 정답과 비교하여 판정.

### 2.3 오답 피드백: 원래 자리로 튕겨 나가기

- 정답: 박스가 `DropZone`에 고정되거나 성공 애니메이션이 재생.
- 오답: 박스가 원래 출발 위치로 되돌아가며 튕기는 시각적 피드백을 제공.
- 시각적 피드백은 GSAP 애니메이션으로 구현.

## 3. 기술 설계 가이드

- React: UI 구성, 컴포넌트 단위 상태 및 렌더링.
- GSAP: 드래그/드롭과 피드백 애니메이션.
- Zustand: 문제 상태, 박스 위치, 판정 결과, 정답/오답 플래그를 전역으로 관리.

## 4. proposed architecture

### 4.1 컴포넌트 구조

- `App`
  - `ExercisePage`
    - `ExerciseHeader` (문제 제목, 현재 단계)
    - `ExerciseBoard`
      - `DropZoneList`
        - `DropZone`
      - `CommandBoxList`
        - `CommandBox`
      - `FeedbackLayer`

### 4.2 상태 모델 (Zustand)

- `problemId`
- `blocks`: 배열 of `{ id, label, type, startPosition, currentPosition, isPlaced, isDraggable }`
- `zones`: 배열 of `{ id, label, expectedBlockId, rect, isActive, isCorrect }`
- `answers`: `{ [zoneId]: blockId | null }`
- `result`: `idle | checking | correct | incorrect`
- `history`: 사용자의 판정 기록 또는 시도 횟수

### 4.3 인터랙션 플로우

1. 초기 렌더링
   - `ExerciseBoard`가 `blocks`와 `zones`를 렌더링.
   - 각 `CommandBox`는 GSAP 드래그 설정.
2. 드래그 시작
   - 박스의 `isDraggable`이 true인 경우 마우스/터치로 이동.
3. 드롭 위치 판정
   - 드롭이 끝나면 현재 좌표와 `DropZone` 간 충돌 검사를 수행.
   - 충돌한 `DropZone`이 있으면 해당 `zone.expectedBlockId`와 `block.id`를 비교.
4. 판정 후 피드백
   - 정답: `block.isPlaced = true`, `zone.isCorrect = true`, 성공 애니메이션.
   - 오답: GSAP으로 `CommandBox`를 원래 `startPosition`으로 튕겨 돌려보냄.

## 5. GSAP 적용 방향

- `CommandBox` 드래그: GSAP `Draggable` 또는 pointer event 기반 드래그 + GSAP tween.
- 오답 피드백: `gsap.to(boxRef, { x: startX, y: startY, ease: 'elastic.out(1, 0.6)' })`
- 정답 고정: `gsap.to(boxRef, { x: zoneX, y: zoneY, duration: 0.3, scale: 1.05 })`
- `DropZone` 강조: 드래그 중 `onDrag` 이벤트로 가까운 `DropZone` 하이라이트.

## 6. 구현 우선순위

1. 기본 문제 화면 + 상태 구조 설계
2. `CommandBox` drag & drop 동작 구현
3. 정답/오답 판정 로직 및 GSAP 피드백
4. 문제 데이터 모델 확장: 여러 칸, 여러 박스, 문장형 문제
5. 성공/오답 시 시각적 보강 (아이콘, 색상, 소리 등)

## 7. 추가 검토 사항

- `@dalbit-yaksok/core` 패키지를 활용한다면 도메인 언어 데이터를 `blocks`로 매핑.
- 추후에는 문제를 템플릿화하여 JSON으로 문제를 정의하면 재사용성이 높아짐.
- 접근성: 터치/마우스 모두 지원, 색상 외 텍스트·모션 피드백 병행.

---

### 요약

- 서비스: 달빛약속 언어 박스를 직접 옮기며 수학 원리를 배우는 저학년 학습 경험.
- MVP: 드래그 드롭, 정답 판정, 오답 시 튕겨 나가는 시각적 피드백.
- 기술: React + GSAP + Zustand.
- 구조: `ExerciseBoard` + `CommandBox` + `DropZone` + 전역 상태 관리.
