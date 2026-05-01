import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from "remotion";
import { theme } from "../theme";

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo scales up and fades in
  const logoProgress = spring({
    frame: frame - 10,
    fps,
    config: { damping: 14 }
  });
  const logoScale = interpolate(logoProgress, [0, 1], [0.8, 1]);
  const logoOpacity = interpolate(logoProgress, [0, 1], [0, 1]);

  // Text fades in
  const textProgress = spring({
    frame: frame - 30,
    fps,
    config: { damping: 14 }
  });
  const textY = interpolate(textProgress, [0, 1], [20, 0]);
  const textOpacity = interpolate(textProgress, [0, 1], [0, 1]);

  // CTA button scales in
  const ctaProgress = spring({
    frame: frame - 60,
    fps,
    config: { damping: 12, mass: 1.2 }
  });
  const ctaScale = interpolate(ctaProgress, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.bg, fontFamily: theme.fonts.base, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      
      {/* Logo */}
      <div style={{
        transform: `scale(${logoScale})`,
        opacity: logoOpacity,
        marginBottom: 32,
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <Img src={staticFile("assets/icon128.png")} style={{ width: 128, height: 128, borderRadius: 32, boxShadow: theme.shadows.lg, marginBottom: 24 }} />
        <h1 style={{ fontSize: 64, fontWeight: 800, color: theme.colors.textPrimary, letterSpacing: "-0.04em", margin: 0 }}>Shalaye</h1>
      </div>

      {/* Slogan */}
      <p style={{
        fontSize: 32,
        fontWeight: 500,
        color: theme.colors.textSecondary,
        transform: `translateY(${textY}px)`,
        opacity: textOpacity,
        marginBottom: 64
      }}>
        Understand anything instantly.
      </p>

      {/* CTA */}
      <div style={{
        transform: `scale(${ctaScale})`,
        background: theme.colors.gradient,
        padding: "20px 48px",
        borderRadius: 100,
        color: "white",
        fontSize: 24,
        fontWeight: 600,
        boxShadow: "0 20px 40px rgba(37, 99, 235, 0.3)",
        display: "flex",
        alignItems: "center",
        gap: 12
      }}>
        Coming to Chrome
      </div>

    </AbsoluteFill>
  );
};
