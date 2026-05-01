import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence } from "remotion";
import { theme } from "../theme";
import { UIFrame } from "../components/UIFrame";
import { Header } from "../components/Header";
import { Cursor } from "../components/Cursor";

export const PowerScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Zoom into the top section of the UI frame
  const zoomProgress = spring({
    frame: frame - 15,
    fps,
    config: { damping: 14 }
  });
  
  const scale = interpolate(zoomProgress, [0, 1], [1, 2.5]);
  const translateX = interpolate(zoomProgress, [0, 1], [0, 250]);
  const translateY = interpolate(zoomProgress, [0, 1], [0, 100]);

  // Click Quick
  const clickFrame1 = 60;
  // Click Detailed
  const clickFrame2 = 120;

  // Determine active depth based on frame
  let activeDepth = "Standard";
  if (frame >= clickFrame1 && frame < clickFrame2) activeDepth = "Quick";
  if (frame >= clickFrame2) activeDepth = "Detailed";

  const getPillStyle = (depth: string) => {
    const isActive = activeDepth === depth;
    return {
      padding: "6px 14px",
      fontSize: 12,
      fontWeight: 500,
      borderRadius: 16,
      transition: "all 0.3s ease",
      color: isActive ? theme.colors.bluePrimary : theme.colors.textSecondary,
      background: isActive ? "white" : "transparent",
      boxShadow: isActive ? "0 2px 6px rgba(0,0,0,0.06)" : "none"
    };
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "#f8fafc", fontFamily: theme.fonts.base }}>
      {/* Cinematic Background Text fading out */}
      <AbsoluteFill style={{ paddingLeft: 120, justifyContent: "center" }}>
        <div style={{ fontSize: 140, fontWeight: 800, color: theme.colors.textPrimary, opacity: interpolate(frame, [0, 20], [1, 0]), lineHeight: 1.1, letterSpacing: "-0.04em", textShadow: "0 20px 40px rgba(0,0,0,0.15)" }}>
          Clear.<br/>Fast.<br/>Simple.
        </div>
      </AbsoluteFill>

      {/* Blurred background */}
      <div style={{ padding: "60px 100px", width: 800, filter: `blur(15px)`, transform: `scale(1.15)` }}>
        <div style={{ height: 48, width: "70%", backgroundColor: "#cbd5e1", borderRadius: 8, marginBottom: 40 }}></div>
      </div>

      <AbsoluteFill style={{ transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`, transformOrigin: "right top" }}>
        <UIFrame>
          <Header />
          <div style={{ padding: 20, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 16 }}>✨</span>
              <span style={{ fontSize: 15, fontWeight: 600 }}>Summary</span>
              
              <div style={{
                marginLeft: "auto", fontSize: 11, fontWeight: 500, color: theme.colors.bluePrimary,
                padding: "4px 12px", borderRadius: 20, border: `1px solid rgba(37, 99, 235, 0.2)`,
                background: "rgba(37, 99, 235, 0.08)",
                display: "flex", gap: 4, transition: "all 0.3s"
              }}>
                ⚡ {activeDepth}
              </div>
            </div>

            {/* Depth Selector (borrowed from Main screen for visual) */}
            <div style={{
              display: "flex",
              background: theme.colors.bgSecondary,
              borderRadius: 20,
              padding: 4,
              marginBottom: 20,
              width: "fit-content",
              border: `1px solid ${theme.colors.border}`
            }}>
              <div style={getPillStyle("Quick")}>Quick</div>
              <div style={getPillStyle("Standard")}>Standard</div>
              <div style={getPillStyle("Detailed")}>Detailed</div>
            </div>

            <p style={{ fontSize: 14, lineHeight: 1.75, color: theme.colors.textSecondary, marginBottom: 20, transition: "opacity 0.2s", opacity: frame % 60 > 50 && frame > 50 ? 0.5 : 1 }}>
              {activeDepth === "Quick" && "Short, 3 bullet points."}
              {activeDepth === "Standard" && "Standard length summary with 5 key points."}
              {activeDepth === "Detailed" && "In-depth summary covering all nuances and 8 key points."}
            </p>
          </div>
        </UIFrame>
      </AbsoluteFill>

      {/* Animated Cursor */}
      <Sequence from={0} durationInFrames={150}>
        {/* Click Quick */}
        <Cursor startX={1600} startY={800} endX={1280} endY={330} clickFrame={clickFrame1} startDelay={20} />
        {/* Click Detailed */}
        {frame > clickFrame1 + 20 && (
          <Cursor startX={1280} startY={330} endX={1430} endY={330} clickFrame={clickFrame2} startDelay={clickFrame1 + 20} />
        )}
      </Sequence>

    </AbsoluteFill>
  );
};
