'use client';

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePharmacy } from '@/lib/store';
import { Icon } from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface NavItem {
  name: string;
  href: string;
  icon: string;
  badge?: number | string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  badgeClassName?: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { pathname } = useLocation();
  const { metrics } = usePharmacy();

  const navItems: NavItem[] = [
    {
      name: 'Point of Sale (POS)',
      href: '/pos',
      icon: 'point_of_sale'
    },
    {
      name: 'Inventory & Expiry',
      href: '/inventory',
      icon: 'inventory_2',
      badge: metrics.expiringCount + metrics.oosCount > 0 ? `${metrics.expiringCount + metrics.oosCount}` : undefined,
      badgeVariant: 'outline',
      badgeClassName: 'bg-amber-100 text-amber-800 border-amber-200'
    },
    {
      name: 'Doctor Orders',
      href: '/doctor-orders',
      icon: 'clinical_notes',
      badge: metrics.pendingDocOrders > 0 ? `${metrics.pendingDocOrders}` : undefined,
      badgeVariant: 'destructive',
      badgeClassName: 'bg-rose-100 text-rose-800 border-rose-200'
    },
    {
      name: 'Analytics & Sales',
      href: '/analytics',
      icon: 'monitoring'
    },
    {
      name: 'Suppliers & Procurement',
      href: '/suppliers',
      icon: 'local_shipping'
    },
    {
      name: 'Settings & Users',
      href: '/settings',
      icon: 'tune'
    }
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200/80 flex flex-col z-50 select-none shadow-xs transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center gap-3 border-b border-slate-200/70 bg-white">
        <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-sm shrink-0">
          <Icon name="local_pharmacy" className="text-2xl" />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-bold text-slate-900 leading-none tracking-tight truncate text-base">
            PharmaCare NG
          </span>
          <span className="text-xs text-slate-500 truncate mt-1">
            Victoria Island Branch
          </span>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 shrink-0"
          aria-label="Close menu"
        >
          <Icon name="close" className="text-xl" />
        </button>
      </div>

      {/* System Status Pill */}
      <div className="px-4 py-2.5 border-b border-slate-100">
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/50">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pharmacy OS</span>
          <Badge variant="outline" className="gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border-emerald-200/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            v2.4 Live
          </Badge>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/pos' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  name={item.icon}
                  className={`transition-transform shrink-0 ${
                    isActive ? 'text-emerald-200' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                  size={20}
                />
                <span className="truncate">{item.name}</span>
              </div>
              {item.badge && (
                <Badge
                  variant={isActive ? 'secondary' : item.badgeVariant || 'secondary'}
                  className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ml-2 shrink-0 ${
                    isActive ? 'bg-white/20 text-white border-none' : item.badgeClassName || 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}

        <div className="py-2">
          <Separator className="bg-slate-200/60" />
        </div>

        {/* Quick Help / Info Link */}
        <div className="px-3 py-2 rounded-lg bg-emerald-50/70 border border-emerald-100 text-emerald-900 text-xs">
          <div className="flex items-center gap-1.5 font-semibold">
            <Icon name="verified" className="text-sm text-emerald-700" />
            <span>NAFDAC & PCN Validated</span>
          </div>
          <p className="text-[11px] text-emerald-700/80 mt-1 leading-snug">
            All drug schedules synchronized with National Drug Formulary.
          </p>
        </div>
      </nav>

      {/* System Footer Status */}
      <div className="p-3.5 border-t border-slate-200/70 bg-slate-50/70">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-800">Dispensary Online</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
            Shift A
          </span>
        </div>
        <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
          <span>PCN Lic: 0492-LG</span>
          <span className="text-slate-400">VAT 7.5%</span>
        </div>
      </div>
    </aside>
  );
}
