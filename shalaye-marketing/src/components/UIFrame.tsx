import React from "react";
import { theme } from "../theme";

export const UIFrame: React.FC<{
  children: React.ReactNode;
  opacity?: number;
  scale?: number;
  y?: number;
  x?: number;
}> = ({ children, opacity = 1, scale = 1, y = 0, x = 0 }) => {
  return (
    <div
      style={{
        position: "absolute",
        right: 80 + x,
        top: 80 + y,
        width: 380,
        height: 520,
        backgroundColor: theme.colors.bg,
        borderRadius: theme.radius.base,
        boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "top right",
        border: `1px solid ${theme.colors.border}`,
        fontFamily: theme.fonts.base,
        color: theme.colors.textPrimary,
      }}
    >
      {children}
    </div>
  );
};
