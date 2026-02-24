'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Plus } from 'lucide-react';
import { storage } from '@/lib/storage';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Invoice } from '@/types';

const statusLabels: Record<string, string> = {
  draft: '下書き',
  sent: '送付済み',
  paid: '入金済み',
  overdue: '期限超過',
};

const typeLabels: Record<string, string> = {
  invoice: '請求書',
  quote: '見積書',
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filter, setFilter] = useState<'all' | 'invoice' | 'quote'>('all');

  useEffect(() => {
    setInvoices(storage.getInvoices());
  }, []);

  const filtered = invoices.filter((inv) => {
    if (filter === 'all') return true;
    return inv.type === filter;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">請求書・見積書</h1>
        <Link
          href="/dashboard/invoices/new"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          新規作成
        </Link>
      </div>

      <div className="flex gap-2 mb-6">
        {(['all', 'invoice', 'quote'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f
                ? 'bg-emerald-600 text-white'
                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {f === 'all' ? 'すべて' : typeLabels[f]}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-16 text-center text-gray-500 dark:text-gray-400">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">請求書・見積書がありません</p>
            <p className="mb-6">最初の請求書または見積書を作成しましょう</p>
            <Link
              href="/dashboard/invoices/new"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              新規作成
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    種類
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    番号
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    金額
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    ステータス
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    発行日
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    支払期限
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {typeLabels[inv.type]}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{inv.number}</td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                      {formatCurrency(inv.total)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          inv.status === 'paid'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : inv.status === 'overdue'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {statusLabels[inv.status] ?? inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {formatDate(inv.issueDate)}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {formatDate(inv.dueDate)}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/invoices/${inv.id}`}
                        className="text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        表示
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
