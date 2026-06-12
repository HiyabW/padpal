import React from "react";
import GlassBubble from "../../../../components/match/GlassBubble";
import { LANDING_BUBBLES } from "../../constants";
import "./styles.css";

function LandingBubbles() {
  return (
    <div className="pp-sign-in-bubbles" aria-hidden="true">
      {LANDING_BUBBLES.map((bubble, index) => (
        <div
          key={`${bubble.src}-${index}`}
          className="pp-sign-in-bubbles__item"
          style={{ top: bubble.top, left: bubble.left }}
        >
          <GlassBubble
            size={bubble.size}
            imageSrc={bubble.src}
            floatVariant={bubble.floatVariant}
          />
        </div>
      ))}
    </div>
  );
}

export default LandingBubbles;
