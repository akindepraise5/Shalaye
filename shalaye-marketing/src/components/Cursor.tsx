import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

export const Cursor: React.FC<{
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  clickFrame: number;
  startDelay?: number;
}> = ({ startX, startY, endX, endY, clickFrame, startDelay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - startDelay,
    fps,
    config: { damping: 14, mass: 0.8 },
  });

  const x = interpolate(progress, [0, 1], [startX, endX]);
  const y = interpolate(progress, [0, 1], [startY, endY]);

  // Click animation (scale down and back up at clickFrame)
  const clickScale = spring({
    frame: frame - clickFrame,
    fps,
    config: { damping: 10, mass: 0.5 },
  });
  
  const isClicking = frame >= clickFrame && frame < clickFrame + 5;
  const scale = isClicking ? 0.8 : interpolate(clickScale, [0, 1], [0.8, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const finalScale = frame < clickFrame ? 1 : scale;

  return (
    <AbsoluteFill style={{ zIndex: 9999, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          transform: `scale(${finalScale})`,
          transformOrigin: "top left",
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.5 3L18.5 11L11.5 12.5L8.5 19L5.5 3Z" fill="black" stroke="white" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      </div>
    </AbsoluteFill>
  );
};
