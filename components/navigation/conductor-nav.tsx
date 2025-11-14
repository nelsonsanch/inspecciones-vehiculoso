
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import {
  ClipboardList,
  Plus,
  History,
  LogOut,
  Shield,
  Car,
  Menu
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: 'Nueva Inspección', href: '/conductor/nueva-inspeccion', icon: Plus },
  { name: 'Mis Inspecciones', href: '/conductor/inspecciones', icon: History },
];

export default function ConductorNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Car className="h-8 w-8 text-green-600" />
                <Shield className="absolute -bottom-1 -right-1 h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Inspecciones</h1>
                <p className="text-sm text-gray-500">Conductor</p>
              </div>
            </div>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={cn(
                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors',
                            pathname === item.href
                              ? 'bg-green-50 text-green-600'
                              : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                          )}
                        >
                          <Icon
                            className={cn(
                              'h-6 w-6 shrink-0',
                              pathname === item.href ? 'text-green-600' : 'text-gray-400 group-hover:text-green-600'
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
              <li className="mt-auto">
                <div className="px-2 py-4 border-t border-gray-200">
                  <div className="flex items-center gap-x-4 mb-3">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-green-600">
                        {user?.name?.charAt(0)?.toUpperCase() || 'C'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{user?.name || 'Conductor'}</p>
                      <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </Button>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="lg:hidden">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Abrir menú</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">
            Panel de Conductor
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-gray-700 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="relative z-50 lg:hidden">
            <div className="fixed inset-0 bg-gray-900/80" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed inset-0 flex">
              <div className="relative mr-16 flex w-full max-w-xs flex-1">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Car className="h-6 w-6 text-green-600" />
                        <Shield className="absolute -bottom-0.5 -right-0.5 h-3 w-3 text-blue-600" />
                      </div>
                      <div>
                        <h1 className="text-lg font-bold text-gray-900">Inspecciones</h1>
                        <p className="text-xs text-gray-500">Conductor</p>
                      </div>
                    </div>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                              <li key={item.name}>
                                <Link
                                  href={item.href}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className={cn(
                                    'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold',
                                    pathname === item.href
                                      ? 'bg-green-50 text-green-600'
                                      : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                                  )}
                                >
                                  <Icon
                                    className={cn(
                                      'h-6 w-6 shrink-0',
                                      pathname === item.href ? 'text-green-600' : 'text-gray-400 group-hover:text-green-600'
                                    )}
                                    aria-hidden="true"
                                  />
                                  {item.name}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
