"use client";

import { categories } from "@/src/constants/feature-spec";

type InterestSectionProps = {
  interestCategories: string[];
  onToggleInterest: (category: string) => void;
};

export function InterestSection({ interestCategories, onToggleInterest }: InterestSectionProps) {
  return (
    <section className="my-section">
      <div className="my-title"><div><small>INTERESTS</small><h3>관심 카테고리</h3></div><span>맞춤 추천에 사용</span></div>
      <div className="choice-chips">
        {categories.slice(1).map((item) => (
          <button className={interestCategories.includes(item) ? "selected" : ""} key={item} onClick={() => onToggleInterest(item)}>{interestCategories.includes(item) ? "✓ " : "+ "}{item}</button>
        ))}
      </div>
    </section>
  );
}
