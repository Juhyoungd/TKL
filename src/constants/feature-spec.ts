import type { FeatureGroup } from "@/src/types/findgoo";

// 이 파일은 찾구의 중앙 기능명세와 예시 데이터를 관리합니다.
// 화면의 버튼명과 아래 [주석 이름]을 동일하게 맞췄으므로 Ctrl+F로 바로 찾을 수 있습니다.

// [검색]
export const categories = ["전체", "디지털", "가구·생활", "명품·패션", "취미", "티켓·굿즈", "식품", "반려동물", "사람·일손", "심부름", "전문 도움", "공간·대여"];
export const regions = ["성수동1가", "성수동2가", "역삼1동", "망원1동", "여의동", "연남동", "잠실본동", "한남동", "서교동", "압구정동", "판교동"];
export const sortOptions = [
  { value: "latest", label: "최신순" },
  { value: "popular", label: "인기순" },
  { value: "price-low", label: "낮은 가격순" },
  { value: "price-high", label: "높은 가격순" },
] as const;

// [회원]
const memberFeatures = [
  ["signup", "회원가입", "이메일과 휴대폰 번호로 새 계정을 만듭니다."],
  ["login", "로그인", "이메일과 비밀번호로 로그인합니다."],
  ["logout", "로그아웃", "현재 계정의 세션을 종료합니다."],
  ["account-edit", "회원정보 수정", "닉네임과 프로필 정보를 수정합니다."],
  ["withdraw", "회원 탈퇴", "보관 기간 안내 후 계정을 삭제합니다."],
  ["recover-account", "아이디/비밀번호 찾기", "이메일 인증으로 계정을 복구합니다."],
  ["identity-check", "본인인증", "거래 안전을 위한 본인인증 상태를 확인합니다."],
  ["terms", "이용약관", "서비스 약관과 개인정보 안내를 확인합니다."],
  ["region-setting", "지역 설정", "거주지와 활동 지역을 설정합니다."],
  ["category-setting", "관심 카테고리 설정", "맞춤 추천에 사용할 관심사를 정합니다."],
];

// [구매글]
const purchaseFeatures = [
  ["purchase-create", "구매글 작성", "찾는 물건과 희망 가격을 등록합니다."], ["purchase-edit", "구매글 수정", "내 구매글의 조건을 바꿉니다."],
  ["purchase-delete", "구매글 삭제", "내 구매글을 삭제합니다."], ["purchase-view", "구매글 조회", "지역의 구매 요청을 둘러봅니다."],
  ["purchase-search", "구매글 검색", "키워드·가격·지역으로 검색합니다."], ["purchase-status", "거래 상태 변경", "거래 가능·진행 중·완료로 변경합니다."],
  ["offer-receive", "판매 제안 받기", "판매자가 보낸 가격과 메시지를 확인합니다."],
];

// [판매 제안]
const offerFeatures = [
  ["offer-create", "제안 작성", "구매글 또는 급구에 제안을 보냅니다."], ["offer-edit", "제안 수정", "상대가 수락하기 전 가격과 내용을 수정합니다."],
  ["offer-cancel", "제안 취소", "대기 중인 제안을 취소합니다."], ["offer-accept", "제안 수락", "선택한 제안으로 거래를 시작합니다."],
  ["offer-reject", "제안 거절", "맞지 않는 제안을 거절합니다."],
];

// [채팅]
const chatFeatures = [
  ["chat-create", "채팅방 생성", "제안 수락 시 1:1 채팅방을 만듭니다."], ["chat-send", "메시지 전송", "거래 상대에게 메시지를 보냅니다."],
  ["chat-image", "이미지 전송", "상태 사진이나 현장 인증 이미지를 보냅니다."],
];

// [거래]
const dealFeatures = [
  ["deal-complete", "거래 완료", "거래를 완료하고 후기를 남길 수 있게 합니다."], ["deal-cancel", "거래 취소", "사유를 선택하고 거래를 취소합니다."],
  ["review-create", "후기 작성", "별점과 거래 후기를 남깁니다."], ["trust-view", "신뢰도", "거래 횟수·평점·받은 후기를 확인합니다."],
  ["report", "신고", "문제가 있는 회원이나 글을 신고합니다."], ["block", "차단", "상대의 글과 메시지를 더 이상 받지 않습니다."],
];

// [급구]
const urgentFeatures = [
  ["urgent-create", "급구 작성", "사람·심부름·현장 도움을 등록합니다."], ["urgent-edit", "급구 수정", "시간·금액·조건을 수정합니다."],
  ["urgent-delete", "급구 삭제", "내 급구 글을 삭제합니다."], ["urgent-view", "급구 조회", "지금 필요한 현장 미션을 확인합니다."],
  ["urgent-apply", "급구 신청", "가능한 시간과 금액으로 지원합니다."], ["urgent-cancel", "신청 취소", "대기 중인 지원을 취소합니다."],
  ["urgent-close", "급구 마감", "지원 접수를 마감합니다."],
];

// [찜]
const favoriteFeatures = [
  ["favorite-purchase", "구매글 찜", "나중에 볼 구매글을 저장합니다."], ["favorite-urgent", "급구 찜", "지원할 급구를 저장합니다."],
  ["favorite-list", "찜 목록", "저장한 구매글과 급구를 모아봅니다."],
];

// [알림]
const notificationFeatures = [
  ["notice-deal", "거래 알림", "거래 요청·수락·완료 상태를 알려줍니다."], ["notice-chat", "채팅 알림", "새 1:1 메시지를 알려줍니다."],
  ["notice-favorite", "찜 알림", "찜한 글의 상태 변화를 알려줍니다."], ["notice-keyword", "키워드 알림", "관심 검색어와 맞는 새 글을 알려줍니다."],
  ["notice-urgent", "급구 알림", "내 지역의 마감 임박 급구를 알려줍니다."],
];

// [고객센터]
const supportFeatures = [
  ["faq", "FAQ", "자주 묻는 질문과 이용 방법을 확인합니다."], ["inquiry-create", "1:1 문의", "고객센터에 문의를 접수합니다."],
  ["inquiry-list", "문의 조회", "내 문의와 답변 상태를 확인합니다."],
];

// [관리자]
const adminFeatures = [
  ["admin-member", "회원 관리", "회원 상태와 본인인증 여부를 관리합니다."], ["admin-report", "신고 관리", "신고 접수와 처리 상태를 관리합니다."],
  ["admin-post", "게시글 관리", "구매글의 노출·삭제 상태를 관리합니다."], ["admin-urgent", "급구 관리", "안전 기준에 맞지 않는 급구를 관리합니다."],
  ["admin-notice", "공지사항 관리", "앱 공지사항을 작성하고 게시합니다."], ["admin-support", "고객센터 답변", "접수된 문의에 답변합니다."],
];

// [마이페이지]
const myPageFeatures = [
  ["my-profile", "내 정보", "프로필·회원정보·지역·관심 카테고리를 관리합니다."], ["my-posts", "내가 작성한 글", "내 구매글과 급구글을 모아봅니다."],
  ["my-offers", "판매 제안 관리", "받은 제안과 보낸 제안을 관리합니다."], ["my-deals", "거래 내역", "진행 중·완료·취소 거래를 확인합니다."],
  ["my-favorites", "찜 목록", "저장한 글을 확인합니다."], ["my-chats", "채팅방", "최근 1:1 거래 채팅을 확인합니다."],
  ["my-notices", "알림 설정", "알림 종류별 수신 여부를 설정합니다."], ["my-trust", "신뢰도", "거래 횟수·평점·받은 후기를 확인합니다."],
  ["my-support", "고객센터", "FAQ와 1:1 문의로 이동합니다."], ["my-logout", "로그아웃", "현재 계정에서 로그아웃합니다."],
  ["my-withdraw", "회원 탈퇴", "계정과 개인정보 삭제를 요청합니다."],
];

function group(id: string, label: string, icon: string, summary: string, items: string[][]): FeatureGroup {
  return { id, label, icon, summary, actions: items.map(([actionId, actionLabel, description]) => ({ id: actionId, label: actionLabel, description, status: "ready" })) };
}

export const featureSpecification: FeatureGroup[] = [
  group("member", "회원", "♙", "가입부터 본인인증과 설정까지", memberFeatures),
  group("purchase", "구매글", "◎", "찾는 물건을 먼저 등록하는 리버스 마켓", purchaseFeatures),
  group("offer", "판매 제안", "⇄", "가격을 제안하고 거래를 연결", offerFeatures),
  group("chat", "채팅", "●", "거래 성사 후 열리는 1:1 대화", chatFeatures),
  group("deal", "거래", "✓", "완료·후기·신뢰와 안전 관리", dealFeatures),
  group("urgent", "급구", "ϟ", "사람과 현장 도움을 빠르게 모집", urgentFeatures),
  group("favorite", "찜", "♥", "관심 글을 저장하고 다시 확인", favoriteFeatures),
  group("search", "검색", "⌕", "키워드·카테고리·지역·가격·정렬", [["search-keyword", "키워드 검색", "제목과 내용에서 단어를 찾습니다."], ["search-category", "카테고리 검색", "관심 카테고리로 좁힙니다."], ["search-region", "지역 검색", "활동 지역의 글만 찾습니다."], ["search-price", "가격 검색", "최대 예산으로 범위를 좁힙니다."], ["sort-latest", "최신순", "새로 등록된 순서로 봅니다."], ["sort-popular", "인기순", "조회와 제안이 많은 순서로 봅니다."]]),
  group("notice", "알림", "♧", "거래·채팅·찜·키워드·급구 소식", notificationFeatures),
  group("support", "고객센터", "?", "FAQ와 1:1 문의", supportFeatures),
  group("admin", "관리자", "◆", "운영자용 관리 도구", adminFeatures),
  group("mypage", "마이페이지", "♙", "내 활동과 계정 설정을 한곳에서", myPageFeatures),
];

// [고객센터]
export const faqItems = [
  { question:"제안 수락 전에도 채팅할 수 있나요?", answer:"아니요. 개인정보 보호를 위해 제안이 수락되어 거래가 연결된 뒤에만 1:1 채팅방이 열립니다." },
  { question:"급구 지원을 취소하려면 어떻게 하나요?", answer:"마이페이지의 판매 제안 관리에서 대기 중인 지원을 선택해 취소할 수 있습니다." },
  { question:"신뢰도는 어떻게 올라가나요?", answer:"거래 완료, 약속 준수, 상대 후기와 신고 이력을 바탕으로 단계적으로 반영됩니다." },
  { question:"직거래 중 문제가 생기면 어떻게 하나요?", answer:"거래 채팅의 거래 관리에서 신고하거나 고객센터 1:1 문의로 증빙을 접수해 주세요." },
];
