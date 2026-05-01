import { AbsoluteFill, Sequence, Audio, staticFile } from "remotion";
import { HookScene } from "./scenes/HookScene";
import { RevealScene } from "./scenes/RevealScene";
import { ActionScene } from "./scenes/ActionScene";
import { ResultScene } from "./scenes/ResultScene";
import { PowerScene } from "./scenes/PowerScene";
import { OutroScene } from "./scenes/OutroScene";
import { theme } from "./theme";

export const ShalayeIntro = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.bg }}>
      
      {/* 0-3s: Hook */}
      <Sequence from={0} durationInFrames={90}>
        <HookScene />
      </Sequence>

      {/* 3-6s: Reveal */}
      <Sequence from={90} durationInFrames={90}>
        <RevealScene />
      </Sequence>

      {/* 6-10s: Action */}
      <Sequence from={180} durationInFrames={120}>
        <ActionScene />
      </Sequence>

      {/* 10-18s: Result */}
      <Sequence from={300} durationInFrames={240}>
        <ResultScene />
      </Sequence>

      {/* 18-24s: Power */}
      <Sequence from={540} durationInFrames={180}>
        <PowerScene />
      </Sequence>

      {/* 24-30s: Outro */}
      <Sequence from={720} durationInFrames={180}>
        <OutroScene />
      </Sequence>

    </AbsoluteFill>
  );
};
