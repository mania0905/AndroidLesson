'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { storage } from '@/lib/storage';
import type { Customer } from '@/types';

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [taxId, setTaxId] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const c = storage.getCustomers().find((x) => x.id === id);
    if (!c) return;
    setCustomer(c);
    setName(c.name);
    setEmail(c.email);
    setAddress(c.address);
    setPhone(c.phone ?? '');
    setTaxId(c.taxId ?? '');
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

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

    const updated: Customer = {
      ...customer,
      name: name.trim(),
      email: email.trim(),
      address: address.trim(),
      phone: phone.trim() || undefined,
      taxId: taxId.trim() || undefined,
    };

    const all = storage.getCustomers();
    const idx = all.findIndex((c) => c.id === customer.id);
    if (idx === -1) return;
    all[idx] = updated;
    storage.saveCustomers(all);
    router.push('/dashboard/customers');
  };

  if (!customer) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 dark:text-gray-400">顧客が見つかりません</p>
        <Link href="/dashboard/customers" className="text-emerald-600 hover:underline mt-4 inline-block">
          一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/dashboard/customers"
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        一覧に戻る
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">顧客の編集</h1>

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
