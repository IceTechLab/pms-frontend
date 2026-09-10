'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { usePharmacy } from '@/lib/store';
import { UserRole } from '@/lib/types';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const navigate = useNavigate();
  const {
    currentUser,
    switchRole,
    users,
    metrics,
    inventory,
    doctorOrders,
    globalSearch,
    setGlobalSearch,
    addToCart
  } = usePharmacy();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.getElementById('global-search-input');
        input?.focus();
        setIsSearchOpen(true);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const searchResults = React.useMemo(() => {
    if (!globalSearch.trim()) return { drugs: [], orders: [] };
    const query = globalSearch.toLowerCase();
    const drugs = inventory.filter(
      d => d.name.toLowerCase().includes(query) ||
           d.genericName.toLowerCase().includes(query) ||
           d.batchId.toLowerCase().includes(query) ||
           d.nafdacReg.toLowerCase().includes(query)
    ).slice(0, 5);

    const orders = doctorOrders.filter(
      o => o.patientName.toLowerCase().includes(query) ||
           o.orderNumber.toLowerCase().includes(query) ||
           o.nhisNumber.toLowerCase().includes(query)
    ).slice(0, 3);

    return { drugs, orders };
  }, [globalSearch, inventory, doctorOrders]);

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 z-40 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors shrink-0"
        aria-label="Open menu"
      >
        <Icon name="menu" className="text-2xl" />
      </button>

      {/* Left side: breadcrumb & search */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="hidden xl:flex items-center gap-1.5 text-xs font-medium text-slate-500 shrink-0">
          <span className="hover:text-slate-800 transition-colors cursor-pointer">Workspace</span>
          <Icon name="chevron_right" className="text-sm text-slate-400" />
          <span className="text-slate-800 font-semibold">Victoria Island Dispensary</span>
        </div>

        {/* Global Search */}
        <div className="relative flex-1 min-w-0 max-w-md" ref={searchRef}>
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none" />
          <Input
            id="global-search-input"
            type="text"
            className="w-full pl-9 pr-10 sm:pr-14 py-2 h-9 bg-slate-100/90 hover:bg-slate-100 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-xs focus-visible:bg-white focus-visible:border-emerald-600 focus-visible:ring-emerald-600/20 shadow-xs"
            placeholder="Search drugs, batch #, patient… (⌘K)"
            value={globalSearch}
            onChange={(e) => {
              setGlobalSearch(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-500 shadow-2xs hidden sm:block">
            ⌘K
          </kbd>

          {/* Search Results Dropdown */}
          {isSearchOpen && globalSearch.trim().length > 0 && (
            <Card className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden z-50 p-0 gap-0">
              <div className="p-3 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50">
                <span>Results for &quot;{globalSearch}&quot;</span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setIsSearchOpen(false)}
                  className="hover:text-slate-800"
                >
                  <Icon name="close" />
                </Button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {searchResults.drugs.length > 0 && (
                  <div className="p-2">
                    <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Medications & Stock
                    </div>
                    {searchResults.drugs.map(drug => (
                      <div
                        key={drug.id}
                        className="px-3 py-2 hover:bg-slate-50 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                        onClick={() => {
                          addToCart(drug);
                          setIsSearchOpen(false);
                          setGlobalSearch('');
                          navigate('/pos');
                        }}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-900 truncate">{drug.name}</div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {drug.genericName} · Batch: {drug.batchId} · Stock: {drug.quantity}
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <div className="text-xs font-bold text-emerald-700">₦{drug.price.toLocaleString()}</div>
                          <span className="text-[10px] text-emerald-600 font-medium">+ Add to POS</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.orders.length > 0 && (
                  <div className="p-2">
                    <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Doctor Prescriptions
                    </div>
                    {searchResults.orders.map(order => (
                      <div
                        key={order.id}
                        className="px-3 py-2 hover:bg-slate-50 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                        onClick={() => {
                          setIsSearchOpen(false);
                          setGlobalSearch('');
                          navigate('/doctor-orders');
                        }}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                            <span className="truncate">{order.patientName}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-600 shrink-0">
                              #{order.orderNumber}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {order.doctorName} · {order.prescribedItems.length} items · {order.status}
                          </div>
                        </div>
                        <Icon name="arrow_forward" className="text-sm text-slate-400 shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.drugs.length === 0 && searchResults.orders.length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No matching medicines or prescriptions found.
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Alert badges — hidden on xs */}
        <div className="hidden sm:flex items-center gap-2">
          {metrics.expiringCount > 0 && (
            <Link to="/inventory?filter=EXPIRING" title="Expiring medicines">
              <Badge variant="outline" className="gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 border-amber-200/80 hover:bg-amber-100 transition-colors text-xs font-semibold cursor-pointer">
                <Icon name="warning" className="text-sm" />
                <span className="hidden md:inline">{metrics.expiringCount} Expiry</span>
                <span className="md:hidden">{metrics.expiringCount}</span>
              </Badge>
            </Link>
          )}

          {metrics.oosCount > 0 && (
            <Link to="/inventory?filter=OUT_OF_STOCK" title="Out of stock">
              <Badge variant="destructive" className="gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200/80 hover:bg-rose-100 transition-colors text-xs font-semibold cursor-pointer">
                <Icon name="inventory" className="text-sm" />
                <span className="hidden md:inline">{metrics.oosCount} OOS</span>
                <span className="md:hidden">{metrics.oosCount}</span>
              </Badge>
            </Link>
          )}
        </div>

        {/* Active shift — desktop only */}
        <div className="hidden lg:flex flex-col items-end border-l border-slate-200 pl-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Active Shift</span>
          <span className="text-xs font-semibold text-slate-800 truncate max-w-[160px]">
            Morning · {currentUser.name}
          </span>
        </div>

        {/* User dropdown */}
        <div className="border-l border-slate-200 pl-2 sm:pl-4">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer border-none bg-transparent">
              <div className="relative">
                <Avatar className="w-8 h-8 sm:w-9 sm:h-9 ring-2 ring-emerald-600/30">
                  {currentUser.avatar && <AvatarImage src={currentUser.avatar} alt={currentUser.name} />}
                  <AvatarFallback className="bg-emerald-800 text-white font-bold text-xs">
                    {currentUser.name[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"></span>
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-800 leading-tight">{currentUser.name}</span>
                <span className="text-[11px] text-emerald-700 capitalize font-medium">{currentUser.role}</span>
              </div>
              <Icon name="expand_more" className="text-slate-400 text-sm hidden sm:block" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50">
              <div className="p-3 border-b border-slate-100 mb-1">
                <div className="text-xs font-bold text-slate-900">{currentUser.name}</div>
                <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                <div className="mt-1">
                  <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-semibold">
                    Role: {currentUser.role}
                  </Badge>
                </div>
              </div>

              <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Quick Switch Account / Role:
              </DropdownMenuLabel>

              <div className="space-y-1">
                {users.map(u => (
                  <DropdownMenuItem
                    key={u.id}
                    onClick={() => switchRole(u.role)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                      currentUser.id === u.id
                        ? 'bg-emerald-50 text-emerald-900 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon
                        name={u.role === 'pharmacist' ? 'medical_services' : u.role === 'doctor' ? 'stethoscope' : 'person'}
                        className="text-base text-slate-400"
                      />
                      <div>
                        <div className="leading-tight">{u.name}</div>
                        <div className="text-[10px] text-slate-400 capitalize">{u.role}</div>
                      </div>
                    </div>
                    {currentUser.id === u.id && (
                      <Icon name="check" className="text-sm text-emerald-600" />
                    )}
                  </DropdownMenuItem>
                ))}
              </div>

              <DropdownMenuSeparator className="my-1 border-slate-100" />

              <DropdownMenuItem
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 transition-colors w-full font-medium cursor-pointer"
              >
                <Icon name="logout" className="text-base" />
                <span>Logout / Switch User</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
