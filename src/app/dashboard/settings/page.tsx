'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import type { BusinessProfile } from '@/types';

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [taxId, setTaxId] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const business = storage.getBusiness();
    if (business) {
      setName(business.name);
      setAddress(business.address);
      setEmail(business.email);
      setPhone(business.phone);
      setTaxId(business.taxId ?? '');
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const business: BusinessProfile = {
      name: name.trim(),
      address: address.trim(),
      email: email.trim(),
      phone: phone.trim(),
      taxId: taxId.trim() || undefined,
    };
    storage.saveBusiness(business);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">設定</h1>

      <div className="max-w-2xl">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            事業者情報
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            請求書・見積書に表示される発行元の情報を設定します。
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label>
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                会社名・屋号
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="株式会社サンプル"
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
                メールアドレス
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="contact@example.com"
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
            <div className="flex items-center gap-4">
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                保存する
              </button>
              {saved && (
                <span className="text-green-600 dark:text-green-400 font-medium">
                  保存しました
                </span>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            サブスクリプション
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            現在のプラン: <span className="font-semibold text-emerald-600">無料トライアル</span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            月額980円のProプランにアップグレードすると、無制限の請求書作成やクラウド保存が利用できます。
            <Link href="/pricing" className="text-emerald-600 hover:underline ml-1">
              料金プランを確認
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
