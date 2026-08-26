import type { ComponentProps } from "react";
import "./styles.css";
import Effect from "./pages/home/page";

export type PatelScrollEffectHeroProps = ComponentProps<typeof Effect>;

export function PatelScrollEffectHero(props: PatelScrollEffectHeroProps) {
  return (
    <div className="special-effect-root" data-special-effect="patel-scroll-effect">
      <Effect {...props} />
    </div>
  );
}

export default PatelScrollEffectHero;
