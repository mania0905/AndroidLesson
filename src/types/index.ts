export interface Customer {
  id: string;
  name: string;
  email: string;
  address: string;
  phone?: string;
  taxId?: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  type: 'invoice' | 'quote';
  number: string;
  customerId: string;
  customer?: Customer;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  issueDate: string;
  dueDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionPlan = 'free' | 'pro' | 'business';

export interface User {
  id: string;
  email: string;
  name: string;
  companyName: string;
  plan: SubscriptionPlan;
  stripeCustomerId?: string;
}

export interface BusinessProfile {
  name: string;
  address: string;
  email: string;
  phone: string;
  taxId?: string;
  logo?: string;
}
