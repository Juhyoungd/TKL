# 찾구 프로젝트 구조 및 수정 가이드

찾구는 기능을 삭제하지 않고 화면, 상태, API, 저장소, 테마를 역할별로 분리했습니다. 화면에 적힌 기능명과 코드의 `[기능명]` 주석이 같아서 전체 검색으로 수정 위치를 찾을 수 있습니다.

## 사용 기술

- 언어: TypeScript, TSX, CSS, SQL
- UI: React 19
- 웹·앱 프레임워크: Next.js 16 App Router
- Cloudflare 실행·빌드: vinext, Vite, Cloudflare Workers
- 데이터베이스: Cloudflare D1(SQLite), Drizzle ORM
- 파일 저장: Cloudflare R2
- 앱 설치·푸시: PWA manifest, Service Worker

## 전체 구조

```text
src/
├── api/                 # 화면에서 서버 API를 호출하는 함수
├── assets/              # 앱 내부 아이콘·에셋 상수
├── components/          # 공통 UI와 찾구 앱 화면
│   ├── feature/         # 전체 기능·회원·고객센터 패널
│   └── screens/         # app 라우트가 재사용하는 공통 화면
├── constants/           # 기능명세, 카테고리, 지역, 예시글, FAQ
├── hooks/               # 앱 설치와 최초 화면 진입 로직
├── lib/                 # 인증, API 공통 처리, DB 연결
│   ├── api/
│   └── auth/
├── services/            # 기기 저장소
├── store/               # 앱 기본 상태와 메뉴 상태 규칙
├── theme/               # 앱 색상 팔레트
├── types/               # 공통 TypeScript 데이터 타입
└── utils/               # 금액 표시와 식별자 같은 순수 함수

app/
├── (auth)/signin/       # 로그인 화면 그룹
├── (tabs)/              # 기본 홈 탭 그룹
├── buy/                 # 구매글 진입 화면
├── urgent/              # 급구 진입 화면
├── chat/                # 거래 채팅 진입 화면
├── profile/             # 마이페이지 진입 화면
├── api/                 # Next.js 서버 API 진입점
├── globals.css          # 전체 앱 UI 스타일
└── layout.tsx           # 메타데이터와 공통 레이아웃

db/
└── schema.ts            # D1 전체 테이블 정의

drizzle/
└── *.sql                # 순서대로 실행되는 DB 마이그레이션

public/
├── manifest.webmanifest # 앱 설치 설정
├── sw.js                # 푸시 알림 Service Worker
└── og.png               # 공유 이미지
```

## 기능별 수정 위치

| 수정하려는 내용 | 파일·주석 |
|---|---|
| 홈, 구매글, 급구, 제안, 채팅, 마이페이지 동작 | `src/components/FindgooApp.tsx`의 같은 이름 주석 |
| 예시글, 카테고리, 지역, FAQ, 전체 기능명세 | `src/constants/feature-spec.ts` |
| 색상 이름과 미리보기 | `src/theme/palettes.ts`의 `[앱 색상]` |
| 실제 색상과 하단 버튼 모양 | `app/globals.css`의 `[앱 색상]`, `[하단 메뉴]` |
| 기기 저장 키 | `src/services/device-storage.ts` |
| 기본 관심지역·카테고리·키워드 | `src/store/app-store.ts` |
| 로그인 | `src/lib/auth/chatgpt-auth.ts`, `app/(auth)/signin/page.tsx` |
| 서버 API 공통 오류·입력 처리 | `src/lib/api/route-helpers.ts` |
| DB 테이블 | `db/schema.ts`와 새 `drizzle/*.sql` |

## 수정 후 반영

로컬 개발 서버에서는 파일을 저장하면 바로 갱신됩니다. 공개 `chatgpt.site` 앱에는 타입 검사와 빌드를 통과한 소스를 새 버전으로 배포해야 반영됩니다.
