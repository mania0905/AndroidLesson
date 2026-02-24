'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { storage } from '@/lib/storage';
import { generateId, generateInvoiceNumber } from '@/lib/utils';
import {
  calculateItemAmount,
  calculateInvoiceTotals,
  createEmptyItem,
  validateInvoice,
} from '@/lib/invoice';
import type { Invoice, InvoiceItem, Customer } from '@/types';
import { format } from 'date-fns';

export default function NewInvoicePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [type, setType] = useState<'invoice' | 'quote'>('invoice');
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([createEmptyItem()]);
  const [taxRate, setTaxRate] = useState(10);
  const [issueDate, setIssueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dueDate, setDueDate] = useState(
    format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
  );
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    setCustomers(storage.getCustomers());
  }, []);

  const prefix = type === 'invoice' ? 'INV' : 'QUO';
  const existingInvoices = storage.getInvoices().filter((i) => i.type === type);
  const invoiceNumber = generateInvoiceNumber(prefix, existingInvoices);

  const updateItem = (id: string, updates: Partial<InvoiceItem>) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, ...updates };
        if ('quantity' in updates || 'unitPrice' in updates) {
          updated.amount = calculateItemAmount(updated.quantity, updated.unitPrice);
        }
        return updated;
      })
    );
  };

  const addItem = () => {
    setItems((prev) => [...prev, createEmptyItem()]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const { subtotal, taxAmount, total } = calculateInvoiceTotals(items, taxRate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    const invoice: Invoice = {
      id: generateId(),
      type,
      number: invoiceNumber,
      customerId,
      items,
      subtotal,
      taxRate,
      taxAmount,
      total,
      status: 'draft',
      issueDate,
      dueDate,
      notes: notes || undefined,
      createdAt: now,
      updatedAt: now,
    };

    const validationErrors = validateInvoice(invoice);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const all = storage.getInvoices();
    all.push(invoice);
    storage.saveInvoices(all);
    router.push(`/dashboard/invoices/${invoice.id}`);
  };

  return (
    <div>
      <Link
        href="/dashboard/invoices"
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        一覧に戻る
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        {type === 'invoice' ? '請求書' : '見積書'}の新規作成
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {errors.length > 0 && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <ul className="list-disc list-inside text-red-700 dark:text-red-400 space-y-1">
              {errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-6">
          <h2 className="font-semibold text-gray-900 dark:text-white">基本情報</h2>
          <div className="flex gap-6">
            <label className="flex-1">
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                種類
              </span>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'invoice' | 'quote')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="invoice">請求書</option>
                <option value="quote">見積書</option>
              </select>
            </label>
            <label className="flex-1">
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                番号
              </span>
              <input
                type="text"
                value={invoiceNumber}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              顧客
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">選択してください</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </select>
            {customers.length === 0 && (
              <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
                顧客が登録されていません。
                <Link href="/dashboard/customers/new" className="underline ml-1">
                  顧客を追加
                </Link>
              </p>
            )}
          </div>
          <div className="flex gap-6">
            <label className="flex-1">
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                発行日
              </span>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </label>
            <label className="flex-1">
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                支払期限
              </span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </label>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">明細</h2>
            <button
              type="button"
              onClick={addItem}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              + 行を追加
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    説明
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400 w-24">
                    数量
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400 w-32">
                    単価（円）
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400 w-32">
                    金額（円）
                  </th>
                  <th className="w-12" />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, { description: e.target.value })}
                        placeholder="商品・サービス名"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(item.id, { quantity: parseInt(e.target.value, 10) || 0 })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min={0}
                        value={item.unitPrice || ''}
                        onChange={(e) =>
                          updateItem(item.id, {
                            unitPrice: parseInt(e.target.value, 10) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </td>
                    <td className="py-2 px-2 text-gray-600 dark:text-gray-400">
                      ¥{item.amount.toLocaleString()}
                    </td>
                    <td className="py-2 px-2">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length <= 1}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end gap-6">
            <div className="text-right space-y-1">
              <p className="text-gray-600 dark:text-gray-400">
                小計: ¥{subtotal.toLocaleString()}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                消費税（{taxRate}%）: ¥{taxAmount.toLocaleString()}
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                合計: ¥{total.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            備考
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="支払い方法、振込先など"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            保存する
          </button>
          <Link
            href="/dashboard/invoices"
            className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  );
}
