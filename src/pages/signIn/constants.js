const base = `${process.env.PUBLIC_URL}/sign-in/bubbles`;

export const SIGN_IN_BUBBLE_IMAGES = {
  bubble1: `${base}/bubblePic1.jpg`,
  bubble2: `${base}/bubblePic2.jpg`,
  bubble3: `${base}/bubblePic3.jpg`,
  card0: `${base}/card-0.jpeg`,
  card1: `${base}/card-1.jpeg`,
  card2: `${base}/card-2.jpeg`,
};

/** Scattered bubble layout for the landing hero (mobile mockup). */
export const LANDING_BUBBLES = [
  { src: SIGN_IN_BUBBLE_IMAGES.bubble1, top: "6%", left: "12%", size: "lg", floatVariant: 0 },
  { src: SIGN_IN_BUBBLE_IMAGES.card0, top: "4%", left: "62%", size: "md", floatVariant: 1 },
  { src: SIGN_IN_BUBBLE_IMAGES.bubble2, top: "20%", left: "72%", size: "md", floatVariant: 2 },
  { src: SIGN_IN_BUBBLE_IMAGES.card1, top: "32%", left: "6%", size: "sm", floatVariant: 0 },
  { src: SIGN_IN_BUBBLE_IMAGES.bubble3, top: "26%", left: "42%", size: "sm", floatVariant: 1 },
  { src: SIGN_IN_BUBBLE_IMAGES.card2, top: "14%", left: "28%", size: "md", floatVariant: 2 },
];

export const SPLASH_DURATION_MS = 2000;
