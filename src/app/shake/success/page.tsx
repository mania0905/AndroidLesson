'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Zap } from 'lucide-react';

export default function ShakeSuccessPage() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 pb-[env(safe-area-inset-bottom)]">
      <div
        className={`transition-all duration-500 ${
          show ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}
      >
        <div className="w-32 h-32 rounded-full bg-amber-500/20 flex items-center justify-center mb-8 border-4 border-amber-500/50">
          <CheckCircle2 className="w-16 h-16 text-amber-400" />
        </div>
      </div>

      <h1 className="text-2xl font-black mb-2">送信完了！</h1>
      <p className="text-gray-400 mb-12">請求書を送信しました</p>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link
          href="/shake/create"
          className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-2xl text-center transition-colors flex items-center justify-center gap-2"
        >
          <Zap className="w-5 h-5" />
          もう1件請求する
        </Link>
        <Link
          href="/dashboard"
          className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-2xl text-center transition-colors border border-white/20"
        >
          ダッシュボードへ
        </Link>
      </div>
    </div>
  );
}
