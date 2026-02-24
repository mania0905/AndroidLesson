import type { Invoice, InvoiceItem } from '@/types';

export function calculateItemAmount(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice);
}

export function calculateInvoiceTotals(
  items: InvoiceItem[],
  taxRate: number
): { subtotal: number; taxAmount: number; total: number } {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = Math.round(subtotal * (taxRate / 100));
  const total = subtotal + taxAmount;
  return { subtotal, taxAmount, total };
}

export function createEmptyItem(): InvoiceItem {
  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    description: '',
    quantity: 1,
    unitPrice: 0,
    amount: 0,
  };
}

export function validateInvoice(invoice: Partial<Invoice>): string[] {
  const errors: string[] = [];
  if (!invoice.number?.trim()) errors.push('請求書番号は必須です');
  if (!invoice.customerId) errors.push('顧客を選択してください');
  if (!invoice.items?.length) errors.push('明細を1件以上追加してください');
  if (!invoice.issueDate) errors.push('発行日は必須です');
  if (!invoice.dueDate) errors.push('支払期限は必須です');

  const invalidItems = invoice.items?.filter(
    (item) => !item.description.trim() || item.quantity <= 0 || item.unitPrice < 0
  );
  if (invalidItems?.length) {
    errors.push('明細に不正な項目があります（説明・数量・単価を確認してください）');
  }

  return errors;
}
