import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence } from "remotion";
import { theme } from "../theme";
import { UIFrame } from "../components/UIFrame";
import { Header } from "../components/Header";

export const ResultScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Content lines stagger in
  const lines = [
    "Shalaye uses advanced AI to instantly summarize long web pages.",
    "It helps you save time by extracting the core meaning.",
    "You can customize the depth of the summary at any time."
  ];

  // Cinematic overlay text
  const overlayWords = ["Clear.", "Fast.", "Simple."];

  return (
    <AbsoluteFill style={{ backgroundColor: "#f8fafc", fontFamily: theme.fonts.base }}>
      {/* Blurred background */}
      <div style={{ padding: "60px 100px", width: 800, filter: `blur(15px)`, transform: `scale(1.15)` }}>
        <div style={{ height: 48, width: "70%", backgroundColor: "#cbd5e1", borderRadius: 8, marginBottom: 40 }}></div>
      </div>

      <UIFrame>
        <Header />
        
        <div style={{ padding: 20, flex: 1, overflowY: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 16 }}>✨</span>
            <span style={{ fontSize: 15, fontWeight: 600 }}>Summary</span>
            
            <div style={{
              marginLeft: "auto", fontSize: 11, fontWeight: 500, color: theme.colors.bluePrimary,
              padding: "4px 12px", borderRadius: 20, border: `1px solid rgba(37, 99, 235, 0.2)`,
              background: "rgba(37, 99, 235, 0.08)"
            }}>
              ⚡ Standard
            </div>
          </div>

          <p style={{ fontSize: 14, lineHeight: 1.75, color: theme.colors.textSecondary, marginBottom: 20 }}>
            Here are the key takeaways from this article:
          </p>

          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {lines.map((line, i) => {
              const startFrame = i * 15 + 10;
              const progress = spring({
                frame: frame - startFrame,
                fps,
                config: { damping: 14 }
              });
              const y = interpolate(progress, [0, 1], [20, 0]);
              const opacity = interpolate(progress, [0, 1], [0, 1]);

              return (
                <li key={i} style={{
                  position: "relative",
                  padding: "8px 0 8px 20px",
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: theme.colors.textSecondary,
                  borderTop: i > 0 ? `1px solid ${theme.colors.border}` : "none",
                  transform: `translateY(${y}px)`,
                  opacity
                }}>
                  <div style={{ position: "absolute", left: 4, top: 15, width: 6, height: 6, borderRadius: "50%", background: theme.colors.bluePrimary }} />
                  {line}
                </li>
              );
            })}
          </ul>
        </div>
      </UIFrame>

      {/* Cinematic Text Overlay left aligned, large scale */}
      <AbsoluteFill style={{ paddingLeft: 120, justifyContent: "center" }}>
        {overlayWords.map((word, i) => {
          const startFrame = i * 45 + 30;
          const progress = spring({
            frame: frame - startFrame,
            fps,
            config: { damping: 16 }
          });
          const x = interpolate(progress, [0, 1], [-50, 0]);
          const opacity = interpolate(progress, [0, 1], [0, 1]);

          return (
            <div key={i} style={{
              fontSize: 140,
              fontWeight: 800,
              color: theme.colors.textPrimary,
              letterSpacing: "-0.04em",
              transform: `translateX(${x}px)`,
              opacity,
              lineHeight: 1.1,
              textShadow: "0 20px 40px rgba(0,0,0,0.15)"
            }}>
              {word}
            </div>
          );
        })}
      </AbsoluteFill>

    </AbsoluteFill>
  );
};
