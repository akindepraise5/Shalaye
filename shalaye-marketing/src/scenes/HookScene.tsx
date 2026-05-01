import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { theme } from "../theme";

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Blur kicks in around frame 45 (1.5 seconds)
  const blurAmount = interpolate(frame, [45, 60], [0, 15], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  
  // Text scales and fades in after blur
  const textScale = spring({
    frame: frame - 55,
    fps,
    config: { damping: 14 }
  });
  const textOpacity = interpolate(frame, [55, 65], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  // Generate fake cluttered article paragraphs
  const paragraphs = Array.from({ length: 8 }).map((_, i) => (
    <div key={i} style={{ marginBottom: 20 }}>
      <div style={{ height: 20, width: "100%", backgroundColor: "#e2e8f0", borderRadius: 4, marginBottom: 8 }}></div>
      <div style={{ height: 20, width: "95%", backgroundColor: "#e2e8f0", borderRadius: 4, marginBottom: 8 }}></div>
      <div style={{ height: 20, width: "98%", backgroundColor: "#e2e8f0", borderRadius: 4, marginBottom: 8 }}></div>
      <div style={{ height: 20, width: "80%", backgroundColor: "#e2e8f0", borderRadius: 4 }}></div>
    </div>
  ));

  return (
    <AbsoluteFill style={{ backgroundColor: "#f8fafc", fontFamily: theme.fonts.base }}>
      
      {/* Article Background */}
      <div style={{ 
        padding: "60px 100px", 
        width: 800, 
        filter: `blur(${blurAmount}px)`,
        transform: `scale(${1 + blurAmount/100})`,
        transition: "transform 0.1s"
      }}>
        <div style={{ height: 48, width: "70%", backgroundColor: "#cbd5e1", borderRadius: 8, marginBottom: 40 }}></div>
        {paragraphs}
      </div>

      {/* Overlay Text */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <h1 style={{
          fontSize: 100,
          fontWeight: 800,
          color: theme.colors.textPrimary,
          letterSpacing: "-0.04em",
          transform: `scale(${textScale})`,
          opacity: textOpacity,
          textShadow: "0 10px 30px rgba(0,0,0,0.1)"
        }}>
          Too much to read?
        </h1>
      </AbsoluteFill>

    </AbsoluteFill>
  );
};
