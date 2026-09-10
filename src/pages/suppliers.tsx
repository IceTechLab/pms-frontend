'use client';

import React, { useState } from 'react';
import { usePharmacy } from '@/lib/store';
import { AddSupplierModal } from '@/components/modals/add-supplier-modal';
import { CreatePoModal } from '@/components/modals/create-po-modal';
import { Icon } from '@/components/ui/icon';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';

export default function SuppliersPage() {
  const {
    suppliers,
    deleteSupplier,
    purchaseOrders,
    receivePurchaseOrder,
    expiryClaims,
    showToast
  } = usePharmacy();

  const [activeTab, setActiveTab] = useState<'directory' | 'orders' | 'claims'>('directory');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isPoOpen, setIsPoOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Total credit note balance
  const totalCreditBalance = suppliers.reduce((acc, s) => acc + (s.creditBalance || 0), 0);
  const inTransitCount = purchaseOrders.filter(p => p.status === 'in_transit' || p.status === 'submitted').length;

  const filteredSuppliers = suppliers.filter(s => {
    const q = searchQuery.toLowerCase().trim();
    return !q ||
      s.name.toLowerCase().includes(q) ||
      s.supplierID.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.drugsAvailable.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col gap-6 max-w-[1700px] mx-auto">
      {/* Top Command Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
              Procurement Matrix
            </Badge>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-500 text-xs">Victoria Island Supply Chain Hub</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Suppliers & Procurement Hub
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage licensed pharmaceutical manufacturers, regional distributors, electronic purchase orders, and return credits.
          </p>
        </div>

        {/* Actions & Credit Pill */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-200 rounded-full shadow-2xs">
            <Icon name="account_balance_wallet" className="text-emerald-700 text-base" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase leading-tight">Supplier Credit Notes</span>
              <span className="text-xs font-bold text-slate-900 leading-tight">
                ₦{totalCreditBalance.toLocaleString()}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddOpen(true)}
            className="gap-1.5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold shadow-2xs h-9"
          >
            <Icon name="domain_add" className="text-base text-slate-500" />
            <span>Add New Supplier</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsPoOpen(true)}
            className="gap-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold shadow-sm h-9"
          >
            <Icon name="add_shopping_cart" className="text-base" />
            <span>+ Create Purchase Order (PO)</span>
          </Button>
        </div>
      </div>

      {/* KPI Matrix Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-slate-200/80 shadow-xs">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Active Suppliers
                </span>
                <div className="text-2xl font-bold text-slate-900 mt-1">{suppliers.length}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Icon name="factory" className="text-xl" />
              </div>
            </div>
            <div className="mt-3 text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <Icon name="verified" className="text-sm" />
              <span>100% Licensed & Tiered</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-xs">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Open Orders (In-Transit)
                </span>
                <div className="text-2xl font-bold text-slate-900 mt-1">
                  {inTransitCount} <span className="text-xs font-normal text-slate-400">Consignments</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Icon name="local_shipping" className="text-xl" />
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-500 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Priority cold-chain active</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-xs">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Pending Expiry Returns
                </span>
                <div className="text-2xl font-bold text-amber-700 mt-1">
                  {expiryClaims.length} <span className="text-xs font-normal text-slate-400">Claims</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Icon name="assignment_return" className="text-xl" />
              </div>
            </div>
            <div className="mt-3 text-xs text-amber-700 font-semibold">
              Under Supplier Warranty Audit
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-xs">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  NAFDAC Quality Check
                </span>
                <div className="text-2xl font-bold text-emerald-700 mt-1">100%</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <Icon name="gavel" className="text-xl" />
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-500">
              Certified Pharmacopeia Specs
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
          <TabsList className="bg-slate-100 p-1 rounded-xl h-auto">
            <TabsTrigger
              value="directory"
              className="rounded-lg px-3.5 py-1.5 text-xs font-bold data-active:bg-emerald-800 data-active:text-white"
            >
              Suppliers Directory ({suppliers.length})
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="rounded-lg px-3.5 py-1.5 text-xs font-bold data-active:bg-emerald-800 data-active:text-white"
            >
              Purchase Orders ({purchaseOrders.length})
            </TabsTrigger>
            <TabsTrigger
              value="claims"
              className="rounded-lg px-3.5 py-1.5 text-xs font-bold data-active:bg-emerald-800 data-active:text-white"
            >
              Expiry Return Claims ({expiryClaims.length})
            </TabsTrigger>
          </TabsList>

          {activeTab === 'directory' && (
            <div className="relative w-64">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <Input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search vendor name, code, drugs..."
                className="w-full pl-8 pr-3 py-1.5 h-8 rounded-xl bg-white border-slate-200 text-xs text-slate-900"
              />
            </div>
          )}
        </div>

        {/* Tab 1: Suppliers Directory */}
        <TabsContent value="directory" className="mt-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-slate-500">Vendor & Code</TableHead>
                  <TableHead className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-slate-500">Tier & Rating</TableHead>
                  <TableHead className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-slate-500">Contact & Communication</TableHead>
                  <TableHead className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-slate-500">Drugs Supplied</TableHead>
                  <TableHead className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-right">Credit Balance</TableHead>
                  <TableHead className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map(sup => (
                  <TableRow key={sup.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <span>{sup.name}</span>
                        {sup.verified && (
                          <Icon name="verified" className="text-emerald-600 text-sm" title="NAFDAC Approved Vendor" />
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">{sup.supplierID}</div>
                      {sup.address && (
                        <div className="text-[10px] text-slate-500 mt-0.5">{sup.address}</div>
                      )}
                    </TableCell>

                    <TableCell className="py-3.5 px-4">
                      <Badge variant="secondary" className="text-[10px] font-bold bg-slate-100 text-slate-700">
                        {sup.tier || 'Tier-1 National'}
                      </Badge>
                      <div className="text-[11px] text-amber-600 font-bold flex items-center gap-1 mt-1">
                        <Icon name="star" className="text-xs" />
                        <span>{sup.rating || 4.8} / 5.0</span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5 px-4">
                      <div className="font-mono text-slate-800">{sup.email}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{sup.contact}</div>
                    </TableCell>

                    <TableCell className="py-3.5 px-4 max-w-xs">
                      <p className="text-slate-600 line-clamp-2 text-[11px]">{sup.drugsAvailable}</p>
                    </TableCell>

                    <TableCell className="py-3.5 px-4 text-right">
                      <div className="font-bold text-slate-900 text-xs">
                        ₦{(sup.creditBalance || 0).toLocaleString()}
                      </div>
                      <span className="text-[10px] text-slate-400">Available return credit</span>
                    </TableCell>

                    <TableCell className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setIsPoOpen(true);
                          }}
                          title="Generate Purchase Order"
                          className="h-8 w-8 text-emerald-700 hover:bg-emerald-50"
                        >
                          <Icon name="add_shopping_cart" className="text-base" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            showToast('Email Dispatch', `Opened direct communication channel with ${sup.email}`, 'info');
                          }}
                          title="Contact Vendor"
                          className="h-8 w-8 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                        >
                          <Icon name="mail" className="text-base" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm(`Remove ${sup.name} from directory?`)) {
                              deleteSupplier(sup.id);
                            }
                          }}
                          title="Delete Supplier"
                          className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Icon name="delete" className="text-base" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Purchase Orders */}
        <TabsContent value="orders" className="mt-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-slate-500">PO Number & Date</TableHead>
                  <TableHead className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-slate-500">Supplier Partner</TableHead>
                  <TableHead className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-slate-500">Consignment SKUs</TableHead>
                  <TableHead className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-slate-500">Expected Delivery</TableHead>
                  <TableHead className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-slate-500">Commitment (₦)</TableHead>
                  <TableHead className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-slate-500">Status</TableHead>
                  <TableHead className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrders.map(po => (
                  <TableRow key={po.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {po.poNumber}
                      <div className="text-[10px] text-slate-400 font-normal">
                        {new Date(po.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 font-semibold text-slate-800">
                      {po.supplierName}
                    </TableCell>
                    <TableCell className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        {po.items.map((it, i) => (
                          <div key={i} className="text-[11px] text-slate-600">
                            <strong>{it.quantity}x</strong> {it.drugName}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 font-mono text-slate-700">
                      {po.expectedDate}
                    </TableCell>
                    <TableCell className="py-3.5 px-4 font-bold text-slate-900">
                      ₦{po.totalAmount.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-3.5 px-4">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          po.status === 'received'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : po.status === 'in_transit'
                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}
                      >
                        {po.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 text-right">
                      {po.status !== 'received' ? (
                        <Button
                          size="sm"
                          onClick={() => receivePurchaseOrder(po.id)}
                          className="gap-1 rounded-xl bg-emerald-800 text-white hover:bg-emerald-900 text-xs font-semibold shadow-2xs h-8"
                        >
                          <Icon name="inventory_2" className="text-sm" />
                          <span>Receive Stock</span>
                        </Button>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-bold flex items-center justify-end gap-1">
                          <Icon name="check_circle" className="text-sm" />
                          Restocked
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Expiry Return Claims */}
        <TabsContent value="claims" className="mt-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-slate-500">Claim Ref</TableHead>
                  <TableHead className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-slate-500">Supplier</TableHead>
                  <TableHead className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-slate-500">Medication & Batch</TableHead>
                  <TableHead className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-slate-500">Returned Qty</TableHead>
                  <TableHead className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-slate-500">Credit Value (₦)</TableHead>
                  <TableHead className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-slate-500">Email Status</TableHead>
                  <TableHead className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-right">Claim Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiryClaims.map(claim => (
                  <TableRow key={claim.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {claim.claimNumber}
                      <div className="text-[10px] text-slate-400 font-normal">{claim.dateIssued}</div>
                    </TableCell>
                    <TableCell className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{claim.supplierName}</div>
                      <div className="text-[11px] font-mono text-slate-400">{claim.supplierEmail}</div>
                    </TableCell>
                    <TableCell className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{claim.drugName}</div>
                      <div className="text-[11px] font-mono text-slate-500">Batch: {claim.batchId}</div>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 font-bold text-slate-800">
                      {claim.quantity} units
                    </TableCell>
                    <TableCell className="py-3.5 px-4 font-bold text-emerald-800">
                      ₦{claim.totalCredit.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-3.5 px-4">
                      <Badge variant="outline" className="gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border-emerald-200">
                        <Icon name="done" className="text-xs" />
                        Dispatched
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 text-right">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          claim.status === 'credited'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}
                      >
                        {claim.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AddSupplierModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />

      <CreatePoModal
        isOpen={isPoOpen}
        onClose={() => setIsPoOpen(false)}
      />
    </div>
  );
}

