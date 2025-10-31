'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { FileText, FolderOpen, Plus, Home } from 'lucide-react';

const adminNavItems = [
  {
    href: '/',
    label: 'Home',
    icon: Home,
  },
  {
    href: '/admin/create-post',
    label: 'Create Post',
    icon: Plus,
  },
  {
    href: '/posts',
    label: 'All Posts',
    icon: FileText,
  },
  {
    href: '/admin/categories',
    label: 'Categories',
    icon: FolderOpen,
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200 mb-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center space-x-8 py-4">
          <Link href="/" className="text-xl font-bold text-gray-900">
            Blog Admin
          </Link>
          <div className="flex space-x-6">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}