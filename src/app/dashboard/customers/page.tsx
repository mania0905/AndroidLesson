'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Plus } from 'lucide-react';
import { storage } from '@/lib/storage';
import type { Customer } from '@/types';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    setCustomers(storage.getCustomers());
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">顧客管理</h1>
        <Link
          href="/dashboard/customers/new"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          新規追加
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {customers.length === 0 ? (
          <div className="p-16 text-center text-gray-500 dark:text-gray-400">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">顧客が登録されていません</p>
            <p className="mb-6">請求書を作成する前に、顧客を登録しましょう</p>
            <Link
              href="/dashboard/customers/new"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              最初の顧客を追加
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors flex items-center justify-between"
              >
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{customer.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{customer.email}</p>
                  {customer.address && (
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      {customer.address}
                    </p>
                  )}
                </div>
                <Link
                  href={`/dashboard/customers/${customer.id}/edit`}
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  編集
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
