'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mic, MicOff, ChevronRight, Send, Sparkles } from 'lucide-react';
import { storage } from '@/lib/storage';
import { useShake } from '@/hooks/useShake';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { generateId, generateInvoiceNumber } from '@/lib/utils';
import { createEmptyItem, calculateInvoiceTotals } from '@/lib/invoice';
import type { Customer, Invoice } from '@/types';

const STEPS = ['customer', 'amount', 'description', 'send'] as const;
type Step = (typeof STEPS)[number];

export default function ShakeCreatePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('customer');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [shakePower, setShakePower] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    setCustomers(storage.getCustomers());
    if (storage.getCustomers().length > 0 && !customerId) {
      setCustomerId(storage.getCustomers()[0].id);
    }
  }, [customerId]);

  const parseVoiceAmount = useCallback((text: string) => {
    const match = text.match(/(\d+)\s*万?/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (text.includes('万')) return String(num * 10000);
      return match[1];
    }
    const nums = text.replace(/[^\d]/g, '');
    if (nums) return nums;
    return text;
  }, []);

  const { isListening, transcript, startListening, stopListening } = useVoiceInput((text) => {
    if (step === 'amount') setAmount((a) => parseVoiceAmount(text) || a);
    if (step === 'description') setDescription((d) => (d ? `${d} ${text}` : text));
  });

  useShake({
    enabled: step === 'send' && !isSending && !sent,
    onShake: (intensity) => {
      setShakePower(intensity);
      if (intensity >= 50) {
        handleSend();
      }
    },
  });

  const handleSend = useCallback(() => {
    if (isSending || sent) return;
    const cust = customers.find((c) => c.id === customerId);
    if (!cust) return;
    const amt = parseInt(amount.replace(/\D/g, ''), 10) || 0;
    if (amt <= 0) return;

    setIsSending(true);
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    const items = [
      {
        ...createEmptyItem(),
        description: description || 'サービス提供',
        quantity: 1,
        unitPrice: amt,
        amount: amt,
      },
    ];
    const { subtotal, taxAmount, total } = calculateInvoiceTotals(items, 10);
    const existing = storage.getInvoices().filter((i) => i.type === 'invoice');
    const inv: Invoice = {
      id: generateId(),
      type: 'invoice',
      number: generateInvoiceNumber('INV', existing),
      customerId: cust.id,
      items,
      subtotal,
      taxRate: 10,
      taxAmount,
      total,
      status: 'sent',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const all = storage.getInvoices();
    all.push(inv);
    storage.saveInvoices(all);
    setSent(true);

    setTimeout(() => {
      router.push('/shake/success');
    }, 800);
  }, [customerId, customers, amount, description, isSending, sent, router]);

  const stepIndex = STEPS.indexOf(step);
  const customer = customers.find((c) => c.id === customerId);

  const goNext = () => {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  };

  const goBack = () => {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  };

  if (customers.length === 0) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6">
        <p className="text-center text-gray-400 mb-6">
          まず顧客を登録してください
        </p>
        <Link
          href="/dashboard/customers/new"
          className="px-6 py-3 bg-amber-500 text-black font-bold rounded-full"
        >
          顧客を追加
        </Link>
        <Link href="/dashboard" className="mt-4 text-amber-400 text-sm">
          ダッシュボードへ
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col pb-[env(safe-area-inset-bottom)]">
      <header className="flex items-center justify-between p-4 border-b border-white/10">
        <button onClick={goBack} className="text-amber-400 text-sm">
          ← 戻る
        </button>
        <span className="text-sm text-gray-500">
          {stepIndex + 1} / {STEPS.length}
        </span>
        <div className="w-12" />
      </header>

      <div className="flex-1 flex flex-col justify-center p-6">
        {step === 'customer' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">誰に請求？</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {customers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setCustomerId(c.id);
                    goNext();
                  }}
                  className={`w-full p-4 rounded-2xl text-left flex items-center justify-between transition-all ${
                    customerId === c.id
                      ? 'bg-amber-500/30 border-2 border-amber-500'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <span className="font-medium">{c.name}</span>
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'amount' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">いくら？</h2>
            <div className="flex items-center gap-2">
              <span className="text-3xl">¥</span>
              <input
                type="tel"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                placeholder="50000"
                className="flex-1 text-4xl font-bold bg-white/5 border border-white/20 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-amber-500"
                inputMode="numeric"
                autoFocus
              />
            </div>
            <button
              onClick={isListening ? stopListening : startListening}
              className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all ${
                isListening
                  ? 'bg-red-500/30 border-2 border-red-500'
                  : 'bg-amber-500/20 border border-amber-500/50 hover:bg-amber-500/30'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-6 h-6" />
                  音声入力停止
                </>
              ) : (
                <>
                  <Mic className="w-6 h-6" />
                  声で入力（例：「5万円」）
                </>
              )}
            </button>
            {transcript && (
              <p className="text-sm text-gray-400">認識: {transcript}</p>
            )}
          </div>
        )}

        {step === 'description' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">内容は？</h2>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ウェブ制作、コンサル料など"
              className="w-full text-lg bg-white/5 border border-white/20 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              onClick={isListening ? stopListening : startListening}
              className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all ${
                isListening
                  ? 'bg-red-500/30 border-2 border-red-500'
                  : 'bg-amber-500/20 border border-amber-500/50 hover:bg-amber-500/30'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-6 h-6" />
                  停止
                </>
              ) : (
                <>
                  <Mic className="w-6 h-6" />
                  声で入力
                </>
              )}
            </button>
            {transcript && (
              <p className="text-sm text-gray-400">認識: {transcript}</p>
            )}
          </div>
        )}

        {step === 'send' && (
          <div className="space-y-8 text-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">振って送信！</h2>
              <p className="text-gray-400 text-sm">
                スマホを振ると送信パワーが溜まる
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-4xl font-black text-amber-400">
                {customer?.name}
              </p>
              <p className="text-3xl font-bold">
                ¥{parseInt(amount || '0', 10).toLocaleString()}
              </p>
              {description && (
                <p className="text-gray-400">{description}</p>
              )}
            </div>

            <div className="h-24 flex items-center justify-center">
              {isSending || sent ? (
                <div className="flex flex-col items-center gap-2">
                  <Sparkles className="w-16 h-16 text-amber-400 animate-pulse" />
                  <p className="font-bold text-amber-400">送信中...</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-5xl font-black text-amber-400 mb-1">
                    {shakePower > 0 ? `${Math.min(shakePower, 150)}%` : '---'}
                  </p>
                  <p className="text-sm text-gray-500">送信パワー</p>
                </div>
              )}
            </div>

            <button
              onClick={handleSend}
              disabled={isSending || sent || !amount || parseInt(amount, 10) <= 0}
              className="w-full py-5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-2xl flex items-center justify-center gap-2 transition-all"
            >
              <Send className="w-6 h-6" />
              タップで送信
            </button>
          </div>
        )}
      </div>

      {step !== 'send' && (
        <div className="p-6 pt-0">
          <button
            onClick={goNext}
            className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-2xl transition-colors"
          >
            次へ
          </button>
        </div>
      )}
    </div>
  );
}
