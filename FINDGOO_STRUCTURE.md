# 찾구 웹 프로젝트 구조 및 수정 가이드

찾구 웹은 화면, 상태, Supabase 연동을 역할별로 분리했습니다. 화면에 적힌 기능명과 코드의 `[기능명]` 주석이 같아서 전체 검색으로 수정 위치를 찾을 수 있습니다.

## 사용 기술

- 언어: TypeScript, TSX, CSS, SQL
- UI: React 19
- 웹 프레임워크: Next.js 16 App Router
- 백엔드: Supabase(Postgres, Auth, Storage, Realtime) — `findgoo-app`(모바일)과 같은 프로젝트

## 전체 구조

```text
src/
├── components/          # 공통 UI와 찾구 앱 화면
│   ├── feature/         # 전체 기능·회원·고객센터 패널
│   ├── mypage/          # 마이페이지 하위 섹션
│   ├── modals/          # 글 상세, 제안, 채팅, 마이페이지 등 모달
│   └── screens/         # app 라우트가 재사용하는 공통 화면
├── constants/           # 기능명세, 카테고리, 지역, FAQ
├── hooks/                # 화면별 상태와 동작 (마켓/제안/채팅/알림/마이페이지)
├── lib/supabase/         # 브라우저·서버 Supabase 클라이언트
├── services/             # 이미지 업로드(Storage), 코스메틱 설정 저장
├── state/                 # AuthProvider(로그인·프로필), AppDataProvider(글/제안/채팅/찜/알림)
├── theme/                # 앱 색상 팔레트
├── types/                # 공통 TypeScript 데이터 타입 (Supabase 스키마 기준)
└── utils/                # 금액 표시, 상대 시간 표시 같은 순수 함수

app/
├── (auth)/signin, signup/  # 로그인·회원가입 화면
├── (tabs)/                 # 기본 홈 탭 그룹
├── buy/, urgent/           # 구매글/급구 목록 전용 화면
├── chat/, profile/         # 채팅·마이페이지 진입 화면
├── globals.css             # 전체 앱 UI 스타일
└── layout.tsx              # 메타데이터, Providers(Auth/AppData) 공통 레이아웃

proxy.ts                    # 요청마다 Supabase 세션 쿠키를 갱신 (구 middleware.ts)
```

Supabase 테이블·RLS 정책·트리거는 이 저장소가 아니라 `findgoo-app/supabase/schema.sql`과 `findgoo-app/supabase/migrations/*.sql`에서 관리합니다(두 앱이 같은 프로젝트를 씀).

## 기능별 수정 위치

| 수정하려는 내용 | 파일·주석 |
|---|---|
| 홈, 마켓, 글쓰기 화면 조립 | `src/components/FindgooApp.tsx` |
| 화면 상태를 하나로 엮는 지점 | `src/hooks/use-findgoo-app.ts` |
| 글 목록/검색/작성/수정/삭제 | `src/hooks/use-post-market.ts` |
| 제안 보내기/수정/취소/수락/거절 | `src/hooks/use-offer-actions.ts` |
| 1:1 채팅(대화방/메시지/이미지) | `src/hooks/use-chat.ts` |
| 로그인/회원가입/프로필 수정 | `src/state/AuthProvider.tsx`, `app/(auth)/signin`, `app/(auth)/signup` |
| 글/제안/대화방/찜/알림 Supabase 연동 | `src/state/AppDataProvider.tsx` |
| 카테고리, 지역, FAQ, 전체 기능명세 | `src/constants/feature-spec.ts` |
| 색상 이름과 미리보기 | `src/theme/palettes.ts`의 `[앱 색상]` |
| 실제 색상과 하단 버튼 모양 | `app/globals.css`의 `[앱 색상]`, `[하단 메뉴]` |
| 관심지역·관심카테고리·키워드 등 기기 로컬 설정 | `src/hooks/use-local-preferences.ts`, `src/services/device-storage.ts` |

## 수정 후 반영

로컬 개발 서버(`npm run dev`)에서는 파일을 저장하면 바로 갱신됩니다. `.env.local`에 findgoo-app과 같은 `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`가 설정되어 있어야 실제 데이터가 보입니다.
