'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { storage } from '@/lib/storage';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Invoice, Customer } from '@/types';

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

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const inv = storage.getInvoices().find((i) => i.id === id);
    if (!inv) return;
    setInvoice(inv);
    const cust = storage.getCustomers().find((c) => c.id === inv.customerId);
    setCustomer(cust ?? null);
  }, [id]);

  const updateStatus = (status: Invoice['status']) => {
    if (!invoice) return;
    const all = storage.getInvoices();
    const idx = all.findIndex((i) => i.id === invoice.id);
    if (idx === -1) return;
    all[idx] = { ...all[idx], status, updatedAt: new Date().toISOString() };
    storage.saveInvoices(all);
    setInvoice(all[idx]);
  };

  if (!invoice) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 dark:text-gray-400">請求書が見つかりません</p>
        <Link href="/dashboard/invoices" className="text-emerald-600 hover:underline mt-4 inline-block">
          一覧に戻る
        </Link>
      </div>
    );
  }

  const business = storage.getBusiness();

  return (
    <div>
      <Link
        href="/dashboard/invoices"
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        一覧に戻る
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {typeLabels[invoice.type]} {invoice.number}
        </h1>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
              invoice.status === 'paid'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : invoice.status === 'overdue'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {statusLabels[invoice.status]}
          </span>
          {invoice.status === 'draft' && (
            <>
              <button
                onClick={() => updateStatus('sent')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm"
              >
                送付済みにする
              </button>
              <button
                onClick={() => updateStatus('paid')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm"
              >
                入金済みにする
              </button>
            </>
          )}
          {invoice.status === 'sent' && (
            <button
              onClick={() => updateStatus('paid')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm"
            >
              入金済みにする
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 print:border-0 print:shadow-none">
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              発行元
            </h3>
            <p className="font-semibold text-gray-900 dark:text-white">
              {business?.name ?? '会社名'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
              {business?.address ?? '住所'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{business?.email ?? ''}</p>
          </div>
          <div className="text-right">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              {typeLabels[invoice.type]}番号
            </h3>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{invoice.number}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              発行日: {formatDate(invoice.issueDate)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              支払期限: {formatDate(invoice.dueDate)}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            請求先
          </h3>
          {customer ? (
            <>
              <p className="font-semibold text-gray-900 dark:text-white">{customer.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                {customer.address}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{customer.email}</p>
            </>
          ) : (
            <p className="text-gray-500">顧客情報がありません</p>
          )}
        </div>

        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                説明
              </th>
              <th className="text-right py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                数量
              </th>
              <th className="text-right py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                単価
              </th>
              <th className="text-right py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                金額
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 text-gray-900 dark:text-white">{item.description}</td>
                <td className="py-3 text-right text-gray-600 dark:text-gray-400">
                  {item.quantity}
                </td>
                <td className="py-3 text-right text-gray-600 dark:text-gray-400">
                  {formatCurrency(item.unitPrice)}
                </td>
                <td className="py-3 text-right text-gray-900 dark:text-white font-medium">
                  {formatCurrency(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-6">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>小計</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>消費税（{invoice.taxRate}%）</span>
              <span>{formatCurrency(invoice.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
              <span>合計</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">備考</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={() => window.print()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          PDFで印刷
        </button>
        <Link
          href={`/dashboard/invoices/${invoice.id}/edit`}
          className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          編集
        </Link>
      </div>
    </div>
  );
}
