import { describe, it, expect } from 'vitest';
import {
  calculateItemAmount,
  calculateInvoiceTotals,
  createEmptyItem,
  validateInvoice,
} from '../invoice';

describe('calculateItemAmount', () => {
  it('数量×単価を正しく計算する', () => {
    expect(calculateItemAmount(2, 1000)).toBe(2000);
    expect(calculateItemAmount(3, 500)).toBe(1500);
  });

  it('小数点を四捨五入する', () => {
    expect(calculateItemAmount(2, 333.33)).toBe(667);
  });
});

describe('calculateInvoiceTotals', () => {
  it('小計・税額・合計を正しく計算する', () => {
    const items = [
      { id: '1', description: 'A', quantity: 2, unitPrice: 1000, amount: 2000 },
      { id: '2', description: 'B', quantity: 1, unitPrice: 500, amount: 500 },
    ];
    const result = calculateInvoiceTotals(items, 10);
    expect(result.subtotal).toBe(2500);
    expect(result.taxAmount).toBe(250);
    expect(result.total).toBe(2750);
  });

  it('空の明細で0を返す', () => {
    const result = calculateInvoiceTotals([], 10);
    expect(result.subtotal).toBe(0);
    expect(result.taxAmount).toBe(0);
    expect(result.total).toBe(0);
  });
});

describe('createEmptyItem', () => {
  it('空の明細オブジェクトを返す', () => {
    const item = createEmptyItem();
    expect(item.description).toBe('');
    expect(item.quantity).toBe(1);
    expect(item.unitPrice).toBe(0);
    expect(item.amount).toBe(0);
    expect(typeof item.id).toBe('string');
    expect(item.id.length).toBeGreaterThan(0);
  });
});

describe('validateInvoice', () => {
  it('有効な請求書でエラーなし', () => {
    const invoice = {
      number: 'INV-0001',
      customerId: 'cust-1',
      items: [
        { id: '1', description: '商品A', quantity: 1, unitPrice: 1000, amount: 1000 },
      ],
      issueDate: '2024-01-01',
      dueDate: '2024-01-31',
    };
    expect(validateInvoice(invoice)).toEqual([]);
  });

  it('必須項目が空の場合エラーを返す', () => {
    const result = validateInvoice({
      number: '',
      customerId: '',
      items: [],
      issueDate: '',
      dueDate: '',
    });
    expect(result).toContain('請求書番号は必須です');
    expect(result).toContain('顧客を選択してください');
    expect(result).toContain('明細を1件以上追加してください');
    expect(result).toContain('発行日は必須です');
    expect(result).toContain('支払期限は必須です');
  });

  it('不正な明細でエラーを返す', () => {
    const result = validateInvoice({
      number: 'INV-001',
      customerId: 'c1',
      items: [
        { id: '1', description: '', quantity: 0, unitPrice: -1, amount: 0 },
      ],
      issueDate: '2024-01-01',
      dueDate: '2024-01-31',
    });
    expect(result).toContain('明細に不正な項目があります（説明・数量・単価を確認してください）');
  });
});
