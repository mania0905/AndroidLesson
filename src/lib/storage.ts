'use client';

import type { Customer, Invoice, User, BusinessProfile } from '@/types';

const STORAGE_KEYS = {
  CUSTOMERS: 'invoiceflow_customers',
  INVOICES: 'invoiceflow_invoices',
  USER: 'invoiceflow_user',
  BUSINESS: 'invoiceflow_business',
} as const;

function safeParse<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    return JSON.parse(stored) as T;
  } catch {
    return defaultValue;
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.error('Failed to save to localStorage');
  }
}

export const storage = {
  getCustomers(): Customer[] {
    return safeParse(STORAGE_KEYS.CUSTOMERS, []);
  },

  saveCustomers(customers: Customer[]): void {
    safeSet(STORAGE_KEYS.CUSTOMERS, customers);
  },

  getInvoices(): Invoice[] {
    return safeParse(STORAGE_KEYS.INVOICES, []);
  },

  saveInvoices(invoices: Invoice[]): void {
    safeSet(STORAGE_KEYS.INVOICES, invoices);
  },

  getUser(): User | null {
    return safeParse(STORAGE_KEYS.USER, null);
  },

  saveUser(user: User | null): void {
    safeSet(STORAGE_KEYS.USER, user);
  },

  getBusiness(): BusinessProfile | null {
    return safeParse(STORAGE_KEYS.BUSINESS, null);
  },

  saveBusiness(business: BusinessProfile | null): void {
    safeSet(STORAGE_KEYS.BUSINESS, business);
  },
};
