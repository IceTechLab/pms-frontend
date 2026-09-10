'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { usePharmacy } from '@/lib/store';
import { DrugCategory, InventoryDrug, Sale } from '@/lib/types';
import { ReceiptModal } from '@/components/modals/receipt-modal';
import { Icon } from '@/components/ui/icon';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function PosPage() {
  const {
    inventory,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    processSale,
    metrics
  } = usePharmacy();

  const [selectedCategory, setSelectedCategory] = useState<DrugCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [patientName, setPatientName] = useState('Walk-in Customer');
  const [patientNhis, setPatientNhis] = useState('');
  const [tenderType, setTenderType] = useState<'CASH' | 'CARD' | 'TRANSFER' | 'HMO'>('CARD');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [isTaxExempt, setIsTaxExempt] = useState(false);
  const [laserOn, setLaserOn] = useState(true);
  const [latestSale, setLatestSale] = useState<Sale | null>(null);
  const [sales, setSales] = useState([])
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Focus barcode input on F2
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'F2') {
        e.preventDefault();
        barcodeInputRef.current?.focus();
        setLaserOn(prev => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter drugs
  const filteredDrugs = useMemo(() => {
    return inventory.filter(drug => {
      const matchesCat = selectedCategory === 'all' || drug.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q ||
        drug.name.toLowerCase().includes(q) ||
        drug.genericName.toLowerCase().includes(q) ||
        drug.batchId.toLowerCase().includes(q) ||
        drug.nafdacReg.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [inventory, selectedCategory, searchQuery]);

  // Cart financial calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.lineTotal, 0);
  }, [cart]);

  const tax = useMemo(() => {
    if (isTaxExempt) return 0;
    return Math.round((subtotal - discount) * 0.075 * 100) / 100;
  }, [subtotal, discount, isTaxExempt]);

  const totalDue = useMemo(() => {
    return Math.max(0, Math.round((subtotal - discount + tax) * 100) / 100);
  }, [subtotal, discount, tax]);

  // Set paid amount default when totalDue changes
  useEffect(() => {
    if (tenderType !== 'CASH') {
      setPaidAmount(totalDue);
    } else if (paidAmount < totalDue) {
      setPaidAmount(totalDue);
    }
  }, [totalDue, tenderType]);

  const changeDue = Math.max(0, paidAmount - totalDue);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const sale = processSale({
      patientName: patientName.trim() || 'Walk-in Customer',
      patientNhis: patientNhis.trim() || undefined,
      tenderType,
      paidAmount,
      discount,
      isTaxExempt
    });

    setLatestSale(sale);
    setPatientName('Walk-in Customer');
    setPatientNhis('');
    setDiscount(0);
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1700px] mx-auto">
      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Today&apos;s Dispensary Cash
              </span>
              <div className="text-xl font-bold text-slate-900 mt-1">
                ₦{metrics.totalRevenue.toLocaleString()}
              </div>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                <Icon name="payments" className="text-sm" />
                <span>{sales.length} transaction{sales.length !== 1 ? 's' : ''} recorded</span>
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Icon name="payments" className="text-2xl" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Prescriptions Dispensed
              </span>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {metrics.rxCount} <span className="text-xs font-normal text-slate-400">orders</span>
              </div>
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                <Icon name="check_circle" className="text-sm" />
                <span>--% fulfillment SLA</span>
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Icon name="clinical_notes" className="text-2xl" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                NAFDAC Reg Verify
              </span>
              <div className="text-xl font-bold text-emerald-700 mt-1">--% Passed</div>
              <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <Icon name="verified_user" className="text-sm text-emerald-600" />
                <span>API Synchronized</span>
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Icon name="verified" className="text-2xl" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                POS Speed Benchmark
              </span>
              <div className="text-xl font-bold text-slate-900 mt-1">
                -- <span className="text-xs font-normal text-slate-400">sec/cart</span>
              </div>
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                <Icon name="bolt" className="text-sm" />
                <span>High Throughput Peak</span>
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Icon name="speed" className="text-2xl" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Two-Column POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Drug Catalog & Rapid Barcode Search (70% - 8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Barcode Search & Fast Filters */}
          <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white">
            <CardContent className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Icon name="barcode_scanner" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-700 text-xl" />
                <Input
                  ref={barcodeInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Scan barcode or type drug / generic name (e.g. Coartem, Amoxicillin)..."
                  className="w-full pl-11 pr-28 py-3 h-11 rounded-xl bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus-visible:bg-white focus-visible:border-emerald-600 focus-visible:ring-emerald-600/20 shadow-inner"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                  <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-500 shadow-2xs">
                    F2
                  </kbd>
                  <Badge
                    variant={laserOn ? "default" : "outline"}
                    className={`text-[9px] font-bold uppercase tracking-wider ${
                      laserOn ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {laserOn ? 'LASER ON' : 'OFF'}
                  </Badge>
                </div>
              </div>

              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="h-9 px-3 text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <Icon name="close" className="text-sm" /> Clear
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs select-none">
            {[
              { id: 'all', label: `All Medications (${inventory.length})` },
              { id: 'antimalarials', label: 'Antimalarials' },
              { id: 'antibiotics', label: 'Antibiotics' },
              { id: 'analgesics', label: 'Analgesics & NSAIDs' },
              { id: 'diabetes', label: 'Hypertension & Diabetes' },
              { id: 'pom', label: 'Prescription Only (POM)' },
              { id: 'otc', label: 'OTC / First Aid' }
            ].map(tab => (
              <Button
                key={tab.id}
                size="sm"
                variant={selectedCategory === tab.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(tab.id as DrugCategory)}
                className={`rounded-xl text-xs font-medium cursor-pointer whitespace-nowrap ${
                  selectedCategory === tab.id
                    ? 'bg-emerald-800 text-white shadow-sm font-semibold hover:bg-emerald-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Catalog Drug Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredDrugs.map(drug => {
              const inCart = cart.find(c => c.drug.id === drug.id);
              const isOutOfStock = drug.quantity <= 0;
              const isLowStock = drug.quantity > 0 && drug.quantity <= 15;
              const isExpiring = drug.status === 'EXPIRING';

              return (
                <Card
                  key={drug.id}
                  className={`rounded-2xl border p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between bg-white ${
                    isOutOfStock
                      ? 'border-slate-200/60 opacity-60'
                      : inCart
                      ? 'border-emerald-500 ring-1 ring-emerald-500/30'
                      : 'border-slate-200/80 hover:border-emerald-600/40'
                  }`}
                >
                  <div>
                    {/* Top Status & Category badges */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border-none">
                        {drug.category}
                      </Badge>

                      {isOutOfStock ? (
                        <Badge variant="destructive" className="text-[10px] font-bold uppercase">
                          Out of Stock
                        </Badge>
                      ) : isExpiring ? (
                        <Badge variant="outline" className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border-amber-200">
                          Expiring Soon
                        </Badge>
                      ) : isLowStock ? (
                        <Badge variant="outline" className="text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border-amber-200">
                          {drug.quantity} packs left
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border-emerald-200">
                          {drug.quantity} in stock
                        </Badge>
                      )}
                    </div>

                    {/* Drug Title & Generic */}
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{drug.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{drug.genericName}</p>

                    {/* Meta Info */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Batch: <strong className="text-slate-600 font-mono">{drug.batchId}</strong></span>
                      <span>Loc: <strong className="text-slate-600">{drug.shelfLocation}</strong></span>
                    </div>
                  </div>

                  {/* Price & Add to Cart button */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block leading-none">Retail Unit</span>
                      <div className="text-base font-bold text-slate-900 mt-0.5">
                        ₦{drug.price.toLocaleString()}
                      </div>
                    </div>

                    {inCart ? (
                      <div className="flex items-center bg-emerald-50 border border-emerald-300 rounded-xl p-0.5 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(drug.id, inCart.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-emerald-800 hover:bg-emerald-200/60 rounded-lg text-sm font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-emerald-900">
                          {inCart.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => addToCart(drug, 1)}
                          disabled={inCart.quantity >= drug.quantity}
                          className="w-7 h-7 flex items-center justify-center text-emerald-800 hover:bg-emerald-200/60 rounded-lg text-sm font-bold disabled:opacity-40 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => addToCart(drug, 1)}
                        disabled={isOutOfStock}
                        className="gap-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs disabled:opacity-40 cursor-pointer h-8 px-3.5"
                      >
                        <Icon name="add_shopping_cart" className="text-base" />
                        <span>Dispense</span>
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {filteredDrugs.length === 0 && (
            <Card className="p-12 text-center rounded-2xl border-slate-200 bg-white">
              <Icon name="search_off" className="text-4xl text-slate-300" />
              <p className="text-sm font-semibold text-slate-700 mt-2">No medications match your filter.</p>
              <p className="text-xs text-slate-400 mt-1">Try resetting the category filter or searching for another term.</p>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN: Active Cart & Multi-Tender Checkout (30% - 4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4 lg:sticky lg:top-20">
          <form
            onSubmit={handleCheckout}
            className="rounded-3xl border border-slate-200/90 shadow-md p-5 flex flex-col gap-4 bg-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Icon name="shopping_bag" className="text-emerald-700 text-xl" />
                <h2 className="font-bold text-slate-900 text-sm">Dispensary Cart ({cart.length})</h2>
              </div>
              {cart.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={clearCart}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold gap-0.5 cursor-pointer h-7 px-2"
                >
                  <Icon name="delete_sweep" className="text-sm" />
                  Clear
                </Button>
              )}
            </div>

            {/* Patient Demographics Input */}
            <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Customer / Patient Name
                </label>
                <Input
                  type="text"
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  placeholder="e.g. Walk-in or Mrs. Adeleke"
                  className="w-full h-8 px-3 rounded-xl border-slate-200 bg-white text-slate-900 text-xs focus-visible:border-emerald-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  NHIS / Insurance Member ID (Optional)
                </label>
                <Input
                  type="text"
                  value={patientNhis}
                  onChange={e => setPatientNhis(e.target.value)}
                  placeholder="NHIS-88492-B"
                  className="w-full h-8 px-3 rounded-xl border-slate-200 bg-white text-slate-900 text-xs font-mono focus-visible:border-emerald-600"
                />
              </div>
            </div>

            {/* Cart Line Items */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <Icon name="production_quantity_limits" className="text-3xl text-slate-300 block mb-1" />
                  No drugs in cart. Click &quot;Dispense&quot; on any medication to begin.
                </div>
              ) : (
                cart.map(item => (
                  <div
                    key={item.drug.id}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 truncate">{item.drug.name}</div>
                      <div className="text-[11px] text-slate-500">
                        ₦{item.drug.price.toLocaleString()} each
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.drug.id, item.quantity - 1)}
                          className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-bold text-slate-900 text-xs">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => addToCart(item.drug, 1)}
                          disabled={item.quantity >= item.drug.quantity}
                          className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded font-bold disabled:opacity-30 cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right min-w-[70px]">
                        <span className="font-bold text-slate-900 text-xs">
                          ₦{item.lineTotal.toLocaleString()}
                        </span>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.drug.id)}
                        className="h-6 w-6 text-slate-400 hover:text-rose-600"
                      >
                        <Icon name="delete" className="text-sm" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900">₦{subtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <div className="flex items-center gap-2 cursor-pointer select-none">
                  <Checkbox
                    id="vat-exempt"
                    checked={isTaxExempt}
                    onCheckedChange={(checked) => setIsTaxExempt(checked === true)}
                  />
                  <Label htmlFor="vat-exempt" className="text-xs text-slate-600 font-normal cursor-pointer">
                    VAT Exempt (Prescription POM)
                  </Label>
                </div>
                <span className="font-semibold text-slate-900">
                  {isTaxExempt ? '₦0' : `₦${tax.toLocaleString()}`}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span>Discount (₦):</span>
                <Input
                  type="number"
                  min="0"
                  max={subtotal}
                  value={discount || ''}
                  onChange={e => setDiscount(Number(e.target.value))}
                  placeholder="0"
                  className="w-20 h-7 px-2 py-0.5 rounded-lg border-slate-200 text-right text-xs focus-visible:border-emerald-600"
                />
              </div>

              <Separator className="my-1" />

              <div className="flex justify-between items-baseline">
                <span className="font-bold text-sm text-slate-900">TOTAL DUE:</span>
                <span className="font-extrabold text-xl text-emerald-800">
                  ₦{totalDue.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Tender Options */}
            <div className="pt-2 border-t border-slate-100 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Payment Tender
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'CARD', label: 'POS Card', icon: 'credit_card' },
                    { id: 'CASH', label: 'Cash', icon: 'payments' },
                    { id: 'TRANSFER', label: 'Transfer', icon: 'account_balance' },
                    { id: 'HMO', label: 'HMO / Ins', icon: 'health_and_safety' }
                  ].map(tender => (
                    <Button
                      key={tender.id}
                      type="button"
                      variant={tenderType === tender.id ? "default" : "outline"}
                      onClick={() => setTenderType(tender.id as any)}
                      className={`h-auto py-2 px-1 rounded-xl flex flex-col items-center gap-1 text-[11px] font-semibold cursor-pointer ${
                        tenderType === tender.id
                          ? 'bg-emerald-800 text-white hover:bg-emerald-900 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Icon name={tender.icon} className="text-base" />
                      <span>{tender.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Amount Paid & Change */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Amount Tendered (₦)
                  </label>
                  <Input
                    type="number"
                    min={totalDue}
                    value={paidAmount || ''}
                    onChange={e => setPaidAmount(Number(e.target.value))}
                    className="w-full h-8 px-2.5 rounded-xl border-slate-200 bg-white font-bold text-slate-900 text-xs focus-visible:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Change Due (₦)
                  </label>
                  <div className="w-full h-8 px-2.5 flex items-center rounded-xl bg-emerald-50 border border-emerald-200 font-bold text-emerald-800 text-xs">
                    ₦{changeDue.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Complete Transaction Button */}
            <Button
              type="submit"
              disabled={cart.length === 0}
              size="lg"
              className="w-full h-12 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs gap-2 transition-all shadow-md disabled:opacity-40 cursor-pointer active:scale-[0.98]"
            >
              <Icon name="check_circle" className="text-lg" />
              <span>Complete Transaction & Print Receipt</span>
            </Button>
          </form>
        </div>
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        sale={latestSale}
        onClose={() => setLatestSale(null)}
      />
    </div>
  );
}
