'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Smartphone, Zap } from 'lucide-react';

export default function ShakeLandingPage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [shakeCount, setShakeCount] = useState(0);
  const [motionEnabled, setMotionEnabled] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const ua = navigator.userAgent;
      const isMobileDevice = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
      const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const requestMotionPermission = useCallback(async () => {
    const dm = typeof DeviceMotionEvent !== 'undefined' && (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission;
    if (dm) {
      try {
        const p = await (DeviceMotionEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
        if (p === 'granted') setMotionEnabled(true);
      } catch {
        setMotionEnabled(true);
      }
    } else {
      setMotionEnabled(true);
    }
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    if (!motionEnabled) return;

    let lastShake = 0;
    const threshold = 15;
    const minInterval = 500;

    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;

      const force = Math.sqrt(
        (acc.x ?? 0) ** 2 + (acc.y ?? 0) ** 2 + (acc.z ?? 0) ** 2
      );
      const now = Date.now();

      if (force > threshold && now - lastShake > minInterval) {
        lastShake = now;
        setShakeCount((c) => {
          const next = c + 1;
          if (next >= 3) {
            router.push('/shake/create');
            return 0;
          }
          return next;
        });
        if (navigator.vibrate) navigator.vibrate(50);
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [isMobile, motionEnabled, router]);

  if (isMobile === null) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="animate-pulse">読み込み中...</div>
      </div>
    );
  }

  if (!isMobile) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 rounded-full bg-amber-500/20 flex items-center justify-center mb-6">
          <Smartphone className="w-12 h-12 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold mb-4">スマホで開いて！</h1>
        <p className="text-gray-400 mb-6 max-w-sm">
          振る請求はスマートフォン専用。
          <br />
          このページをスマホで開くか、QRコードをスキャンしてください。
        </p>
        <p className="text-sm text-gray-500">
          URL: {typeof window !== 'undefined' ? window.location.href : ''}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 pb-[env(safe-area-inset-bottom)]">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-black mb-2 tracking-tight">
          振る請求
        </h1>
        <p className="text-amber-400/90 text-sm font-medium">
          世界初・スマホを振って送る請求書
        </p>
      </div>

      <div className="w-40 h-40 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-600/20 flex items-center justify-center mb-8 border-2 border-amber-500/40">
        <Zap className="w-16 h-16 text-amber-400" />
      </div>

      <p className="text-xl font-bold mb-2">
        スマホを<span className="text-amber-400">3回振って</span>スタート
      </p>
      <p className="text-gray-500 text-sm mb-6">
        {shakeCount > 0 && (
          <span className="text-amber-400 font-bold">
            {shakeCount}/3 回目！
          </span>
        )}
        {shakeCount === 0 && !motionEnabled && 'まず下のボタンをタップ'}
        {shakeCount === 0 && motionEnabled && '振るたびにバイブで反応'}
      </p>

      {!motionEnabled ? (
        <button
          onClick={requestMotionPermission}
          className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-full transition-colors mb-4"
        >
          振ってスタートを有効化
        </button>
      ) : null}

      <button
        onClick={() => router.push('/shake/create')}
        className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-full transition-colors border border-white/20"
      >
        タップでスキップ
      </button>
    </div>
  );
}
