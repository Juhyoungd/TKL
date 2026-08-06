# 찾구 — 리버스 로컬 마켓

찾구는 구매자가 원하는 물건이나 급한 도움을 먼저 올리고, 판매자·지원자가 가격과 조건을 제안하는 앱형 웹서비스입니다. 제안이 수락된 거래만 1:1 채팅이 열립니다.

## 기술 스택

- TypeScript + React 19 + Next.js 16 App Router
- vinext + Vite + Cloudflare Workers
- Cloudflare D1(SQLite) + Drizzle ORM
- Cloudflare R2 이미지 저장
- PWA + Service Worker 푸시 알림

## 실행

Node.js 22.13 이상이 필요합니다.

```bash
pnpm install
pnpm dev
pnpm build
pnpm test
```

## 주요 폴더

- `src/components`: 앱 UI와 기능 패널
- `src/constants`: 기능명세와 예시 데이터
- `src/api`: 브라우저 API 클라이언트
- `src/hooks`: 앱 설치·라우트 진입 훅
- `src/services`: 기기 저장
- `src/store`: 기본 앱 상태
- `src/types`: 공통 데이터 타입
- `src/utils`: 공통 유틸리티
- `src/lib`: 인증·서버 API·DB 연결
- `src/theme`: 색상 팔레트
- `src/assets`: 앱 내부 아이콘
- `app`: Next.js 화면과 API 라우트

세부 수정 위치는 `FINDGOO_STRUCTURE.md`를 확인하세요.
