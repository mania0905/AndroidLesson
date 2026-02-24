'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Users, Settings, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { href: '/dashboard/invoices', label: '請求書・見積書', icon: FileText },
  { href: '/dashboard/customers', label: '顧客管理', icon: Users },
  { href: '/dashboard/settings', label: '設定', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
        <div className="p-6">
          <Link href="/" className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            InvoiceFlow
          </Link>
        </div>
        <nav className="px-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                pathname === href || pathname.startsWith(href + '/')
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}
