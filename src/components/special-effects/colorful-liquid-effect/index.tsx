import type { ComponentProps } from "react";
import "./styles.css";
import Effect from "./pages/home/page";

export type ColorfulLiquidEffectHeroProps = ComponentProps<typeof Effect>;

export function ColorfulLiquidEffectHero(props: ColorfulLiquidEffectHeroProps) {
  return (
    <div className="special-effect-root" data-special-effect="colorful-liquid-effect">
      <Effect {...props} />
    </div>
  );
}

export default ColorfulLiquidEffectHero;
