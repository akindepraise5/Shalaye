import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from "remotion";
import { theme } from "../theme";
import { UIFrame } from "../components/UIFrame";
import { Header } from "../components/Header";

export const RevealScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // The UI Frame slides in from the right
  const slideProgress = spring({
    frame,
    fps,
    config: { damping: 16, mass: 0.8 }
  });
  
  const uiX = interpolate(slideProgress, [0, 1], [800, 0]);
  const uiOpacity = interpolate(slideProgress, [0, 1], [0, 1]);

  // Main empty state content fades in slightly after UI frame
  const contentProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 14 }
  });
  
  const contentY = interpolate(contentProgress, [0, 1], [30, 0]);
  const contentOpacity = interpolate(contentProgress, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#f8fafc", fontFamily: theme.fonts.base }}>
      {/* Background blurred article continues from previous scene */}
      <div style={{ padding: "60px 100px", width: 800, filter: `blur(15px)`, transform: `scale(1.15)` }}>
        <div style={{ height: 48, width: "70%", backgroundColor: "#cbd5e1", borderRadius: 8, marginBottom: 40 }}></div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ marginBottom: 20 }}>
            <div style={{ height: 20, width: "100%", backgroundColor: "#e2e8f0", borderRadius: 4, marginBottom: 8 }}></div>
            <div style={{ height: 20, width: "95%", backgroundColor: "#e2e8f0", borderRadius: 4, marginBottom: 8 }}></div>
            <div style={{ height: 20, width: "98%", backgroundColor: "#e2e8f0", borderRadius: 4, marginBottom: 8 }}></div>
            <div style={{ height: 20, width: "80%", backgroundColor: "#e2e8f0", borderRadius: 4 }}></div>
          </div>
        ))}
      </div>

      <UIFrame opacity={uiOpacity} x={uiX}>
        <Header />
        
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "32px 28px 24px",
          transform: `translateY(${contentY}px)`,
          opacity: contentOpacity
        }}>
          
          <div style={{ marginBottom: 24, display: "flex", justifyContent: "center" }}>
            <div style={{
              width: 260, height: 200, 
              display: "flex", alignItems: "center", justifyContent: "center",
              backgroundColor: "rgba(37, 99, 235, 0.04)", borderRadius: 24
            }}>
              <Img src={staticFile("assets/icon128.png")} style={{ width: 100, height: 100, borderRadius: 24, boxShadow: theme.shadows.md }} />
            </div>
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 600, color: theme.colors.textPrimary, marginBottom: 8 }}>
            Summarize this page
          </h2>
          <p style={{ fontSize: 13, color: theme.colors.textSecondary, lineHeight: 1.6, maxWidth: 280, marginBottom: 28 }}>
            Shalaye will analyze the content and give you a clear, concise summary in seconds.
          </p>

          <div style={{
            display: "flex",
            background: theme.colors.bgSecondary,
            borderRadius: 20,
            padding: 4,
            marginBottom: 20,
            border: `1px solid ${theme.colors.border}`
          }}>
            <div style={{ padding: "6px 14px", fontSize: 12, fontWeight: 500, color: theme.colors.textSecondary, borderRadius: 16 }}>Quick</div>
            <div style={{ padding: "6px 14px", fontSize: 12, fontWeight: 500, color: theme.colors.bluePrimary, background: "white", borderRadius: 16, boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>Standard</div>
            <div style={{ padding: "6px 14px", fontSize: 12, fontWeight: 500, color: theme.colors.textSecondary, borderRadius: 16 }}>Detailed</div>
          </div>

          <button style={{
            width: "100%", padding: "14px 24px", border: "none", borderRadius: theme.radius.base,
            background: theme.colors.gradient, color: "white", fontSize: 15, fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: theme.shadows.button
          }}>
            <svg width="18" height="18" viewBox="0 0 36 36" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M7.5 3C8.32843 3 9 3.67157 9 4.5V6H10.5C11.3284 6 12 6.67157 12 7.5C12 8.32843 11.3284 9 10.5 9H9V10.5C9 11.3284 8.32843 12 7.5 12C6.67157 12 6 11.3284 6 10.5V9H4.5C3.67157 9 3 8.32843 3 7.5C3 6.67157 3.67157 6 4.5 6H6V4.5C6 3.67157 6.67157 3 7.5 3ZM19.5 3C20.1456 3 20.7189 3.41315 20.923 4.02566L24.1253 13.6325L32.0267 16.5955C32.6121 16.8151 33 17.3747 33 18C33 18.6253 32.6121 19.1849 32.0267 19.4045L24.1253 22.3675L20.923 31.9743C20.7189 32.5869 20.1456 33 19.5 33C18.8544 33 18.2811 32.5869 18.077 31.9743L14.8747 22.3675L6.97332 19.4045C6.38786 19.1849 6 18.6253 6 18C6 17.3747 6.38786 16.8151 6.97332 16.5955L14.8747 13.6325L18.077 4.02566C18.2811 3.41315 18.8544 3 19.5 3ZM19.5 9.24342L17.4945 15.2601C17.3513 15.6895 17.0219 16.0313 16.5981 16.1902L11.772 18L16.5981 19.8098C17.0219 19.9687 17.3513 20.3105 17.4945 20.7399L19.5 26.7566L21.5055 20.7399C21.6487 20.3105 21.9781 19.9687 22.4019 19.8098L27.228 18L22.4019 16.1902C21.9781 16.0313 21.6487 15.6895 21.5055 15.2601L19.5 9.24342ZM9 24C9.82843 24 10.5 24.6716 10.5 25.5V27H12C12.8284 27 13.5 27.6716 13.5 28.5C13.5 29.3284 12.8284 30 12 30H10.5V31.5C10.5 32.3284 9.82843 33 9 33C8.17157 33 7.5 32.3284 7.5 31.5V30H6C5.17157 30 4.5 29.3284 4.5 28.5C4.5 27.6716 5.17157 27 6 27H7.5V25.5C7.5 24.6716 8.17157 24 9 24Z" fill="currentColor"/></svg>
            Summarize Page
          </button>
        </div>
      </UIFrame>

    </AbsoluteFill>
  );
};
