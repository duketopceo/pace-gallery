import { useEffect, useState } from 'react';

/**
 * True when the browser can give us a WebGL2 context. Three.js r163+ dropped WebGL1, so WebGL2 is
 * the only thing that counts. Detection allocates a throwaway context once per page load.
 */
let cachedWebGL2: boolean | null = null;

export function detectWebGL2(): boolean {
  if (cachedWebGL2 !== null) return cachedWebGL2;
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    cachedWebGL2 = canvas.getContext('webgl2') !== null;
    canvas.remove();
  } catch {
    cachedWebGL2 = false;
  }
  return cachedWebGL2;
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Live `prefers-reduced-motion` state. Upstream treats reduced motion as a hint; this gallery
 * treats it as a switch that replaces every animated scene with a still.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(REDUCED_MOTION_QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const query = window.matchMedia(REDUCED_MOTION_QUERY);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
