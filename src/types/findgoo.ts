// [공통 타입] 화면과 데이터 계층이 함께 사용하는 데이터 모양을 한곳에서 관리합니다.
// findgoo-app(모바일)과 같은 Supabase 스키마를 기준으로 합니다.
export type PostType = "buy" | "urgent";
export type PostStatus = "open" | "reserved" | "closed";
export type ThemeId = "dusk" | "warm" | "ocean" | "forest" | "berry";

export type Post = {
  id: string;
  authorId?: string;
  type: PostType;
  category: string;
  title: string;
  description: string;
  price: number;
  region: string;
  deadline?: string;
  author: string;
  manner: number;
  views: number;
  offerCount: number;
  created: string;
  status: PostStatus;
  mine?: boolean;
};

export type Offer = {
  id: string;
  postId: string;
  offererId?: string;
  nickname: string;
  price: number;
  message: string;
  direction: "incoming" | "outgoing";
  status: "pending" | "accepted" | "canceled" | "rejected";
  created: string;
};

// [1:1 거래 채팅] 글(post) 단위가 아니라 대화방(conversation) 단위입니다.
// 같은 글이라도 문의한 사람마다 별도의 대화방이 생깁니다.
export type Conversation = {
  id: string;
  postId: string;
  postTitle: string;
  postPrice: number;
  sellerId: string;
  buyerId: string;
  counterpartyId: string;
  counterpartyName: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  mine: boolean;
  text: string;
  time: string;
  imageUrl?: string | null;
};

export type AppNotice = {
  id: string;
  kind: "offer" | "trade" | "chat" | "favorite" | "keyword" | "urgent" | "system";
  title: string;
  body: string;
  time: string;
  read: boolean;
  postId?: string;
  conversationId?: string;
};

export type FeatureAction = {
  id: string;
  label: string;
  description: string;
  status?: "ready" | "connected" | "planned";
  danger?: boolean;
};

export type FeatureGroup = {
  id: string;
  label: string;
  icon: string;
  summary: string;
  actions: FeatureAction[];
};

export type FeaturePanelKey = "all" | "account" | "activity" | "deal" | "support" | "admin" | "trust";

export type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};
