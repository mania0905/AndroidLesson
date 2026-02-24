'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { storage } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import type { Customer } from '@/types';

export default function NewCustomerPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [taxId, setTaxId] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: string[] = [];
    if (!name.trim()) newErrors.push('名前は必須です');
    if (!email.trim()) newErrors.push('メールアドレスは必須です');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.push('有効なメールアドレスを入力してください');
    }
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    const customer: Customer = {
      id: generateId(),
      name: name.trim(),
      email: email.trim(),
      address: address.trim(),
      phone: phone.trim() || undefined,
      taxId: taxId.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const all = storage.getCustomers();
    all.push(customer);
    storage.saveCustomers(all);
    router.push('/dashboard/customers');
  };

  return (
    <div>
      <Link
        href="/dashboard/customers"
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        一覧に戻る
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">顧客の新規追加</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {errors.length > 0 && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <ul className="list-disc list-inside text-red-700 dark:text-red-400 space-y-1">
              {errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <label>
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              名前 *
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="株式会社サンプル"
            />
          </label>
          <label>
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              メールアドレス *
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="contact@example.com"
            />
          </label>
          <label>
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              住所
            </span>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="〒100-0001 東京都千代田区..."
            />
          </label>
          <label>
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              電話番号
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="03-1234-5678"
            />
          </label>
          <label>
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              法人番号・税番
            </span>
            <input
              type="text"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="1234567890123"
            />
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            保存する
          </button>
          <Link
            href="/dashboard/customers"
            className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  );
}
