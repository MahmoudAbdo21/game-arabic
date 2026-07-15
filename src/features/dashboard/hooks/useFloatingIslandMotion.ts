import { useEffect, useRef } from 'react';

export function useFloatingIslandMotion(index: number) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Deterministic parameters based on index
    // index typically 1, 2, 3, 4
    const durations = [6200, 7100, 6700, 7600]; // in ms
    const delays = [0, -1300, -2100, -800]; // in ms
    const travels = [5, 6, 4, 7]; // in px
    const rotations = [0.2, -0.15, 0.25, -0.2]; // in deg

    const idx = (index - 1) % 4;
    const duration = durations[idx];
    const delay = delays[idx];
    const travel = travels[idx];
    const rotation = rotations[idx];

    // Optional: scale down travel for mobile
    const isMobile = window.innerWidth < 600;
    const finalTravel = isMobile ? travel * 0.5 : travel;

    const animation = element.animate(
      [
        { transform: `translateY(0px) rotate(0deg)` },
        { transform: `translateY(-${finalTravel}px) rotate(${rotation}deg)` }
      ],
      {
        duration,
        delay,
        direction: 'alternate',
        iterations: Infinity,
        easing: 'ease-in-out'
      }
    );

    return () => {
      animation.cancel();
    };
  }, [index]);

  return elementRef;
}
