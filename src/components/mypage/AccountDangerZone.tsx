"use client";

type AccountDangerZoneProps = {
  onOpenAdmin: () => void;
  onLogout: () => void;
  onWithdraw: () => void;
};

// [로그아웃] + [회원 탈퇴] + [관리자]
export function AccountDangerZone({ onOpenAdmin, onLogout, onWithdraw }: AccountDangerZoneProps) {
  return (
    <section className="account-danger-zone">
      <button onClick={onOpenAdmin}>관리자 데모</button>
      <button onClick={onLogout}>로그아웃</button>
      <button className="danger" onClick={onWithdraw}>회원 탈퇴</button>
    </section>
  );
}
