'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Users, TrendingUp, Plus } from 'lucide-react';
import { storage } from '@/lib/storage';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    invoiceCount: 0,
    customerCount: 0,
    totalRevenue: 0,
    unpaidAmount: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState<Array<{
    id: string;
    number: string;
    total: number;
    status: string;
    dueDate: string;
  }>>([]);

  useEffect(() => {
    const invoices = storage.getInvoices();
    const customers = storage.getCustomers();

    const paidTotal = invoices
      .filter((i) => i.status === 'paid')
      .reduce((sum, i) => sum + i.total, 0);
    const unpaidTotal = invoices
      .filter((i) => i.status === 'sent' || i.status === 'overdue')
      .reduce((sum, i) => sum + i.total, 0);

    setStats({
      invoiceCount: invoices.length,
      customerCount: customers.length,
      totalRevenue: paidTotal,
      unpaidAmount: unpaidTotal,
    });

    const recent = invoices
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map((i) => ({
        id: i.id,
        number: i.number,
        total: i.total,
        status: i.status,
        dueDate: i.dueDate,
      }));
    setRecentInvoices(recent);
  }, []);

  const statCards = [
    { label: '請求書数', value: stats.invoiceCount, icon: FileText, color: 'emerald' },
    { label: '顧客数', value: stats.customerCount, icon: Users, color: 'blue' },
    { label: '入金済み', value: formatCurrency(stats.totalRevenue), icon: TrendingUp, color: 'green' },
    { label: '未収金', value: formatCurrency(stats.unpaidAmount), icon: FileText, color: 'amber' },
  ];

  const statusLabels: Record<string, string> = {
    draft: '下書き',
    sent: '送付済み',
    paid: '入金済み',
    overdue: '期限超過',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ダッシュボード</h1>
        <Link
          href="/dashboard/invoices/new"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          新規作成
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400">{label}</span>
              <Icon className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">最近の請求書</h2>
        </div>
        <div className="overflow-x-auto">
          {recentInvoices.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>請求書がまだありません</p>
              <Link
                href="/dashboard/invoices/new"
                className="inline-block mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
              >
                最初の請求書を作成 →
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
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
                    支払期限
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {inv.number}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
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
          )}
        </div>
      </div>
    </div>
  );
}
