# 찾구 — 리버스 로컬 마켓 (웹)

찾구는 구매자가 원하는 물건이나 급한 도움을 먼저 올리고, 판매자·지원자가 가격과 조건을 제안하는 리버스 마켓입니다. 제안이 수락된 거래만 1:1 채팅이 열립니다.

이 폴더는 `findgoo-app`(모바일, Expo)과 **같은 Supabase 프로젝트**를 사용하는 웹 버전입니다. 앱과 웹이 같은 회원·글·제안·채팅 데이터를 봅니다.

## 기술 스택

- TypeScript + React 19 + Next.js 16 App Router
- Supabase Auth + Postgres + Storage + Realtime

## 실행

Node.js 20 이상이 필요합니다.

```bash
npm install
cp .env.local.example .env.local   # findgoo-app/.env.local과 같은 값으로 채우기
npm run dev
npm run build
```

## 주요 폴더

- `src/components`: 앱 UI와 기능 패널
- `src/constants`: 기능명세와 카테고리/지역/FAQ
- `src/state`: 인증(AuthProvider)과 실데이터(AppDataProvider) — Supabase와 통신하는 핵심 로직
- `src/hooks`: 화면별 상태와 동작(마켓, 채팅, 제안, 마이페이지 등)
- `src/lib/supabase`: 브라우저/서버 Supabase 클라이언트
- `src/services`: 이미지 업로드(Supabase Storage), 기기 저장(코스메틱 설정)
- `src/theme`: 색상 팔레트
- `app`: Next.js 화면 라우트 (`/signin`, `/signup`, `/buy`, `/urgent`, `/chat`, `/profile`)

세부 수정 위치는 `FINDGOO_STRUCTURE.md`를 확인하세요.

## 이번 범위

로그인/회원가입, 홈, 구매글·급구 목록/검색, 글 등록·수정·삭제, 제안 보내기/받기/수락·거절, 1:1 채팅(실시간), 마이페이지(프로필·찜·최근활동)까지 Supabase에 연결되어 있습니다.

관리자 대시보드, 신고, 매너온도 후기, 공지사항, 고객센터 접수, 서버 발송 푸시는 아직 화면만 있고 백엔드에는 연결되지 않았습니다(후속 작업).
