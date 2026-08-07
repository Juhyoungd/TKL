"use client";

import type { ChangeEvent, Dispatch, SetStateAction } from "react";

type ProfileCardProps = {
  profileImage: string;
  nickname: string;
  setNickname: Dispatch<SetStateAction<string>>;
  onChangeProfileImage: (event: ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
};

export function ProfileCard({ profileImage, nickname, setNickname, onChangeProfileImage, onSave }: ProfileCardProps) {
  return (
    <section className="profile-card">
      <label className="avatar-upload">
        {profileImage ? <img src={profileImage} alt="프로필 사진" /> : <span>{nickname[0]}</span>}
        <input type="file" accept="image/*" onChange={onChangeProfileImage} />
        <b>사진 변경</b>
      </label>
      <div>
        <small>내 찾구 프로필</small>
        <input value={nickname} minLength={2} maxLength={20} aria-label="닉네임" onChange={(event) => setNickname(event.target.value)} />
        <p>매너 신뢰도 <strong>36.5</strong> · 공개 베타 회원</p>
      </div>
      <button onClick={onSave}>저장</button>
    </section>
  );
}
