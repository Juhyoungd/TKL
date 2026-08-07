"use client";

type TermsModalProps = {
  onClose: () => void;
};

// [베타 이용 안내]
export function TermsModal({ onClose }: TermsModalProps) {
  return (
    <div className="modal-layer" onMouseDown={onClose}>
      <section className="terms-modal" onMouseDown={(event) => event.stopPropagation()}>
        <header><button onClick={onClose}>×</button><strong>베타 이용 안내</strong><span></span></header>
        <div>
          <h3>로그인 없는 체험판</h3>
          <p>현재 버전은 기능과 화면 흐름을 확인하는 공개 베타입니다. 작성한 글, 제안, 채팅은 사용 중인 브라우저에만 저장됩니다.</p>
          <h3>안전한 이용</h3>
          <p>실제 개인정보, 계좌번호, 연락처를 입력하지 마세요. 불법 물품이나 타인의 권리를 침해하는 요청은 등록할 수 없습니다.</p>
          <h3>초기화</h3>
          <p>브라우저의 사이트 데이터를 삭제하면 직접 작성한 베타 데이터도 함께 사라집니다.</p>
        </div>
        <button onClick={onClose}>확인했어요</button>
      </section>
    </div>
  );
}
