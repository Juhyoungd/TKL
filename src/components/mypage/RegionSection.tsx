"use client";

import { regions } from "@/src/constants/feature-spec";

type RegionSectionProps = {
  region: string;
  setRegion: (region: string) => void;
  activityRegions: string[];
  onToggleRegion: (region: string) => void;
};

export function RegionSection({ region, setRegion, activityRegions, onToggleRegion }: RegionSectionProps) {
  return (
    <section className="my-section">
      <div className="my-title"><div><small>MY AREA</small><h3>거주 및 활동 지역</h3></div><span>최대 3곳</span></div>
      <label className="primary-region"><span>대표 동네</span><select value={region} onChange={(event) => setRegion(event.target.value)}>{regions.map((item) => <option key={item}>{item}</option>)}</select></label>
      <div className="choice-chips">
        {regions.map((item) => (
          <button className={activityRegions.includes(item) ? "selected" : ""} key={item} onClick={() => onToggleRegion(item)}>{activityRegions.includes(item) ? "✓ " : "+ "}{item}</button>
        ))}
      </div>
    </section>
  );
}
