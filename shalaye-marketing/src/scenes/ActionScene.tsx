import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile, Sequence } from "remotion";
import { theme } from "../theme";
import { UIFrame } from "../components/UIFrame";
import { Header } from "../components/Header";
import { Cursor } from "../components/Cursor";

export const ActionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Click happens at frame 45 (1.5s into this scene)
  const clickFrame = 45;

  // Transition to loading UI after click
  const loadingProgress = spring({
    frame: frame - clickFrame - 10,
    fps,
    config: { damping: 16 }
  });
  
  const defaultOpacity = interpolate(loadingProgress, [0, 1], [1, 0]);
  const loadingOpacity = interpolate(loadingProgress, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#f8fafc", fontFamily: theme.fonts.base }}>
      {/* Blurred background */}
      <div style={{ padding: "60px 100px", width: 800, filter: `blur(15px)`, transform: `scale(1.15)` }}>
        <div style={{ height: 48, width: "70%", backgroundColor: "#cbd5e1", borderRadius: 8, marginBottom: 40 }}></div>
      </div>

      <UIFrame>
        <Header />
        
        {/* Default UI State (fades out) */}
        <AbsoluteFill style={{ top: 67, padding: "32px 28px 24px", opacity: defaultOpacity, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ width: 260, height: 200, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(37, 99, 235, 0.04)", borderRadius: 24 }}>
              <Img src={staticFile("assets/icon128.png")} style={{ width: 100, height: 100, borderRadius: 24, boxShadow: theme.shadows.md }} />
            </div>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: theme.colors.textPrimary, marginBottom: 8 }}>Summarize this page</h2>
          <p style={{ fontSize: 13, color: theme.colors.textSecondary, lineHeight: 1.6, maxWidth: 280, marginBottom: 28, textAlign: "center" }}>
            Shalaye will analyze the content and give you a clear, concise summary in seconds.
          </p>

          <button style={{
            width: "100%", padding: "14px 24px", border: "none", borderRadius: theme.radius.base,
            background: theme.colors.gradient, color: "white", fontSize: 15, fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: theme.shadows.button,
            transform: frame >= clickFrame && frame < clickFrame + 5 ? "scale(0.98)" : "scale(1)"
          }}>
            <svg width="18" height="18" viewBox="0 0 36 36" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M7.5 3C8.32843 3 9 3.67157 9 4.5V6H10.5C11.3284 6 12 6.67157 12 7.5C12 8.32843 11.3284 9 10.5 9H9V10.5C9 11.3284 8.32843 12 7.5 12C6.67157 12 6 11.3284 6 10.5V9H4.5C3.67157 9 3 8.32843 3 7.5C3 6.67157 3.67157 6 4.5 6H6V4.5C6 3.67157 6.67157 3 7.5 3ZM19.5 3C20.1456 3 20.7189 3.41315 20.923 4.02566L24.1253 13.6325L32.0267 16.5955C32.6121 16.8151 33 17.3747 33 18C33 18.6253 32.6121 19.1849 32.0267 19.4045L24.1253 22.3675L20.923 31.9743C20.7189 32.5869 20.1456 33 19.5 33C18.8544 33 18.2811 32.5869 18.077 31.9743L14.8747 22.3675L6.97332 19.4045C6.38786 19.1849 6 18.6253 6 18C6 17.3747 6.38786 16.8151 6.97332 16.5955L14.8747 13.6325L18.077 4.02566C18.2811 3.41315 18.8544 3 19.5 3ZM19.5 9.24342L17.4945 15.2601C17.3513 15.6895 17.0219 16.0313 16.5981 16.1902L11.772 18L16.5981 19.8098C17.0219 19.9687 17.3513 20.3105 17.4945 20.7399L19.5 26.7566L21.5055 20.7399C21.6487 20.3105 21.9781 19.9687 22.4019 19.8098L27.228 18L22.4019 16.1902C21.9781 16.0313 21.6487 15.6895 21.5055 15.2601L19.5 9.24342ZM9 24C9.82843 24 10.5 24.6716 10.5 25.5V27H12C12.8284 27 13.5 27.6716 13.5 28.5C13.5 29.3284 12.8284 30 12 30H10.5V31.5C10.5 32.3284 9.82843 33 9 33C8.17157 33 7.5 32.3284 7.5 31.5V30H6C5.17157 30 4.5 29.3284 4.5 28.5C4.5 27.6716 5.17157 27 6 27H7.5V25.5C7.5 24.6716 8.17157 24 9 24Z" fill="currentColor"/></svg>
            Summarize Page
          </button>
        </AbsoluteFill>

        {/* Loading UI State (fades in) */}
        <AbsoluteFill style={{ top: 67, padding: "40px 28px", opacity: loadingOpacity, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          
          <div style={{ width: 240, height: 184, position: "relative", marginBottom: 24 }}>
            <Img src={staticFile("assets/motion/soft-shadow.png")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "contain" }} />
            <Img src={staticFile("assets/motion/document-bg.png")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "contain" }} />
            
            <Img src={staticFile("assets/motion/orbit-line.png")} style={{ 
              position: "absolute", width: "100%", height: "100%", objectFit: "contain",
              transform: `rotate(${(frame * 360) / 82.5}deg)` // ~2.75s per rotation
            }} />
            
            <Img src={staticFile("assets/motion/sparkles.png")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "contain" }} />
            
            <Img src={staticFile("assets/motion/chat-icon.png")} style={{ 
              position: "absolute", width: "100%", height: "100%", objectFit: "contain",
              transform: `scale(${1 + Math.sin((frame * Math.PI * 2) / 40.5) * 0.05})` // ~1.35s per pulse
            }} />
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 600, color: theme.colors.textPrimary, marginBottom: 6 }}>Analyzing this page...</h2>
          <p style={{ fontSize: 13, color: theme.colors.textSecondary, lineHeight: 1.5, textAlign: "center" }}>
            Breaking it down for you.<br/>This usually takes a few seconds.
          </p>

        </AbsoluteFill>
      </UIFrame>

      {/* Animated Cursor */}
      <Sequence from={0} durationInFrames={70}>
        <Cursor startX={1600} startY={800} endX={1650} endY={560} clickFrame={clickFrame} startDelay={10} />
      </Sequence>

    </AbsoluteFill>
  );
};
