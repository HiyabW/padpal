const imageCache = new Map();

/**
 * Preload an image URL and cache the result. Resolves true when decoded and ready to paint.
 */
export function preloadImage(src) {
  if (!src) return Promise.resolve(false);

  const cached = imageCache.get(src);
  if (cached) return cached;

  const promise = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });

  imageCache.set(src, promise);
  return promise;
}

export function preloadImages(urls) {
  return Promise.all(urls.filter(Boolean).map(preloadImage));
}
