const base = `${process.env.PUBLIC_URL}/sign-in/bubbles`;

export const SIGN_IN_BUBBLE_IMAGES = {
  bubble1: `${base}/bubblePic1.jpg`,
  bubble2: `${base}/bubblePic2.jpg`,
  bubble3: `${base}/bubblePic3.jpg`,
  card0: `${base}/card-0.jpeg`,
  card1: `${base}/card-1.jpeg`,
  card2: `${base}/card-2.jpeg`,
};

/**
 * Scattered glass bubbles — same GlassBubble component + rim treatment as MatchOverlay,
 * with Hero scatter positions from padpal-landing-page (fixed px wrapper per bubble).
 */
export const LANDING_BUBBLES = [
  {
    src: SIGN_IN_BUBBLE_IMAGES.bubble1,
    size: "clamp(72px, 11vw, 150px)",
    top: "16%",
    left: "9%",
    floatVariant: 0,
  },
  {
    src: SIGN_IN_BUBBLE_IMAGES.card0,
    size: "clamp(48px, 7vw, 92px)",
    top: "12%",
    left: "72%",
    floatVariant: 1,
  },
  {
    src: SIGN_IN_BUBBLE_IMAGES.bubble2,
    size: "clamp(80px, 10vw, 136px)",
    top: "62%",
    left: "84%",
    floatVariant: 2,
  },
  {
    src: SIGN_IN_BUBBLE_IMAGES.card1,
    size: "clamp(52px, 6vw, 84px)",
    top: "68%",
    left: "7%",
    floatVariant: 0,
  },
  {
    src: SIGN_IN_BUBBLE_IMAGES.bubble3,
    size: "clamp(64px, 8vw, 96px)",
    top: "38%",
    left: "88%",
    floatVariant: 1,
  },
  {
    src: SIGN_IN_BUBBLE_IMAGES.card2,
    size: "clamp(72px, 9vw, 108px)",
    top: "76%",
    left: "26%",
    floatVariant: 2,
  },
];

export const SPLASH_DURATION_MS = 2000;
