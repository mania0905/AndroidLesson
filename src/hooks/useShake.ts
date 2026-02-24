'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseShakeOptions {
  threshold?: number;
  minInterval?: number;
  onShake: (intensity: number) => void;
  enabled?: boolean;
}

export function useShake({
  threshold = 18,
  minInterval = 400,
  onShake,
  enabled = true,
}: UseShakeOptions) {
  const lastShake = useRef(0);
  const lastAcc = useRef({ x: 0, y: 0, z: 0 });
  const callback = useRef(onShake);
  callback.current = onShake;

  useEffect(() => {
    if (!enabled) return;

    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;

      const x = acc.x ?? 0;
      const y = acc.y ?? 0;
      const z = acc.z ?? 0;

      const delta = Math.sqrt(
        (x - lastAcc.current.x) ** 2 +
        (y - lastAcc.current.y) ** 2 +
        (z - lastAcc.current.z) ** 2
      );

      lastAcc.current = { x, y, z };

      const now = Date.now();
      if (delta > threshold && now - lastShake.current > minInterval) {
        lastShake.current = now;
        const intensity = Math.min(150, Math.round((delta / threshold) * 100));
        callback.current(intensity);
        if (navigator.vibrate) navigator.vibrate([30, 20, 30]);
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [enabled, threshold, minInterval]);
}
