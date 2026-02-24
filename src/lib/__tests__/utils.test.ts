import { describe, it, expect } from 'vitest';
import {
  cn,
  generateId,
  formatCurrency,
  formatDate,
  generateInvoiceNumber,
} from '../utils';

describe('cn', () => {
  it('クラス名を結合する', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('条件付きクラスを処理する', () => {
    expect(cn('base', false && 'hidden', true && 'visible')).toBe('base visible');
  });
});

describe('generateId', () => {
  it('一意のIDを生成する', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
    expect(typeof id1).toBe('string');
    expect(id1.length).toBeGreaterThan(0);
  });
});

describe('formatCurrency', () => {
  it('日本円でフォーマットする', () => {
    expect(formatCurrency(1000)).toContain('1,000');
    expect(formatCurrency(1234567)).toContain('1,234,567');
  });
});

describe('formatDate', () => {
  it('日付を日本語形式でフォーマットする', () => {
    const result = formatDate('2024-01-15');
    expect(result).toMatch(/\d/);
  });
});

describe('generateInvoiceNumber', () => {
  it('既存がない場合0001から開始', () => {
    expect(generateInvoiceNumber('INV', [])).toBe('INV-0001');
  });

  it('既存の番号から連番を生成', () => {
    expect(generateInvoiceNumber('INV', [{ number: 'INV-0001' }])).toBe('INV-0002');
    expect(generateInvoiceNumber('INV', [{ number: 'INV-0005' }])).toBe('INV-0006');
  });

  it('複数の既存から最大+1を返す', () => {
    expect(
      generateInvoiceNumber('QUO', [
        { number: 'QUO-0001' },
        { number: 'QUO-0003' },
        { number: 'QUO-0002' },
      ])
    ).toBe('QUO-0004');
  });
});
