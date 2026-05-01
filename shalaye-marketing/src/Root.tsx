import "./index.css";
import { Composition } from "remotion";
import { ShalayeIntro } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ShalayeIntro"
        component={ShalayeIntro}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
