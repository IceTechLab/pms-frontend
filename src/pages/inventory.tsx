'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePharmacy } from '@/lib/store';
import { DrugCategory, InventoryDrug, StockStatus } from '@/lib/types';
import { AddDrugModal } from '@/components/modals/add-drug-modal';
import { EditDrugModal } from '@/components/modals/edit-drug-modal';
import { EmailSupplierModal } from '@/components/modals/email-supplier-modal';
import { Icon } from '@/components/ui/icon';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function InventoryContent() {
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') as StockStatus | null;

  const { inventory, deleteDrug, receiveStock, metrics } = usePharmacy();

  const [selectedCategory, setSelectedCategory] = useState<DrugCategory>('all');
  const [selectedStatus, setSelectedStatus] = useState<StockStatus | 'ALL'>(initialFilter || 'ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingDrug, setEditingDrug] = useState<InventoryDrug | null>(null);
  const [claimingDrug, setClaimingDrug] = useState<InventoryDrug | null>(null);
  const [quickRestockId, setQuickRestockId] = useState<string | null>(null);
  const [restockQty, setRestockQty] = useState(50);

  // Filtered Inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter(drug => {
      const matchesCategory = selectedCategory === 'all' || drug.category === selectedCategory;
      const matchesStatus = selectedStatus === 'ALL' || drug.status === selectedStatus;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        drug.name.toLowerCase().includes(q) ||
        drug.genericName.toLowerCase().includes(q) ||
        drug.batchId.toLowerCase().includes(q) ||
        drug.nafdacReg.toLowerCase().includes(q) ||
        drug.supplierName.toLowerCase().includes(q);

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [inventory, selectedCategory, selectedStatus, searchQuery]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedStatus('ALL');
    setSearchQuery('');
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['Trade Name', 'Generic Name', 'Category', 'Batch ID', 'Stock Qty', 'Retail Price', 'Wholesale Cost', 'Expiry Date', 'Status', 'Shelf Location', 'NAFDAC Reg', 'Supplier'];
    const rows = filteredInventory.map(d => [
      `"${d.name}"`,
      `"${d.genericName}"`,
      d.category,
      d.batchId,
      d.quantity,
      d.price,
      d.unitCost,
      d.expireDate,
      d.status,
      `"${d.shelfLocation}"`,
      d.nafdacReg,
      `"${d.supplierName}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pharmacare_inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1700px] mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
              Clinical Formulary & Batch Audit
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-500 text-xs">NAFDAC Reg Validated</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Inventory & Shelf-Life Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor medication batch shelf-life countdown, safety reorder thresholds, and regulatory warranty returns.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold gap-1.5 h-9 cursor-pointer"
          >
            <Icon name="file_download" className="text-base text-slate-500" />
            <span>Export CSV</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setIsAddOpen(true)}
            className="rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold gap-1.5 h-9 cursor-pointer shadow-sm"
          >
            <Icon name="add" className="text-base" />
            <span>Receive Stock / Add Drug</span>
          </Button>
        </div>
      </div>

      {/* 4 Clinical Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Inventory Value
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-2 tracking-tight">
              ₦{metrics.totalInventoryValue.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 mt-2 text-slate-500 text-xs font-semibold">
              <Icon name="inventory_2" className="text-sm" />
              <span>{metrics.totalInventoryValue > 0 ? `${metrics.lowStockCount + metrics.oosCount} items need attention` : 'No stock added yet'}</span>
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => setSelectedStatus(selectedStatus === 'EXPIRING' ? 'ALL' : 'EXPIRING')}
          className={`rounded-2xl border shadow-xs flex flex-col justify-between cursor-pointer transition-all bg-white ${
            selectedStatus === 'EXPIRING' ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20' : 'border-slate-200/80 hover:border-amber-400'
          }`}
        >
          <CardContent className="p-4 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Expiring Soon (&lt;60 Days)
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-amber-700 tracking-tight">
                {metrics.expiringCount} Batches
              </span>
              <span className="text-xs text-slate-400">· Active shelf alert</span>
            </div>
            <div className="text-xs text-amber-700 mt-2 flex items-center gap-1 font-semibold">
              <Icon name="schedule" className="text-sm" />
              <span>Click to filter expiring batches</span>
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => setSelectedStatus(selectedStatus === 'EXPIRED' ? 'ALL' : 'EXPIRED')}
          className={`rounded-2xl border shadow-xs flex flex-col justify-between cursor-pointer transition-all bg-white ${
            selectedStatus === 'EXPIRED' ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-200/80 hover:border-rose-400'
          }`}
        >
          <CardContent className="p-4 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Expired (Quarantine Required)
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-rose-700 tracking-tight">
                {inventory.filter(d => d.status === 'EXPIRED').length} SKUs
              </span>
              <span className="text-xs text-slate-400">· Ready for return</span>
            </div>
            <div className="text-xs text-rose-700 mt-2 flex items-center gap-1 font-semibold">
              <Icon name="assignment_return" className="text-sm" />
              <span>Warranty credit claim available</span>
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => setSelectedStatus(selectedStatus === 'OUT_OF_STOCK' ? 'ALL' : 'OUT_OF_STOCK')}
          className={`rounded-2xl border shadow-xs flex flex-col justify-between cursor-pointer transition-all bg-white ${
            selectedStatus === 'OUT_OF_STOCK' ? 'border-slate-800 ring-2 ring-slate-800/20 bg-slate-50' : 'border-slate-200/80 hover:border-slate-400'
          }`}
        >
          <CardContent className="p-4 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Stock Depleted / Out of Stock
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-2 tracking-tight">
              {metrics.oosCount} SKUs
            </div>
            <div className="text-xs text-slate-500 mt-2 flex items-center gap-1 font-medium">
              <Icon name="inventory_2" className="text-sm text-slate-400" />
              <span>Below safety replenishment level</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white">
        <CardContent className="p-4 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
              <Input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search drug trade name, formulation, batch #, or NAFDAC reg..."
                className="w-full pl-10 pr-4 py-2.5 h-10 bg-slate-50 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-xs focus-visible:bg-white focus-visible:border-emerald-600 focus-visible:ring-emerald-600/20 shadow-inner"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Select
                value={selectedStatus}
                onValueChange={val => setSelectedStatus(val as StockStatus | 'ALL')}
              >
                <SelectTrigger className="h-10 px-3.5 rounded-xl bg-slate-50 border-slate-200 text-slate-800 font-semibold text-xs min-w-[180px]">
                  <SelectValue placeholder="Status: All Records" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Status: All Records</SelectItem>
                  <SelectItem value="GOOD">Good Status</SelectItem>
                  <SelectItem value="EXPIRING">Expiring Soon (&lt;60d)</SelectItem>
                  <SelectItem value="EXPIRED">Expired Batches</SelectItem>
                  <SelectItem value="LOW">Low Stock Alert</SelectItem>
                  <SelectItem value="OUT_OF_STOCK">Out of Stock (0)</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-10 px-3 text-slate-500 hover:text-slate-900 text-xs font-semibold gap-1 cursor-pointer"
              >
                <Icon name="refresh" className="text-sm" /> Reset
              </Button>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto text-xs pt-1 select-none">
            {[
              { id: 'all', label: `All Formulations (${inventory.length})` },
              { id: 'antimalarials', label: 'Antimalarials' },
              { id: 'antibiotics', label: 'Antibiotics' },
              { id: 'analgesics', label: 'Pain & Analgesics' },
              { id: 'diabetes', label: 'Hypertension & Diabetes' },
              { id: 'pom', label: 'Prescription Only (POM)' },
              { id: 'otc', label: 'OTC / First Aid' }
            ].map(cat => (
              <Button
                key={cat.id}
                size="xs"
                variant={selectedCategory === cat.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat.id as DrugCategory)}
                className={`rounded-xl text-xs font-medium cursor-pointer whitespace-nowrap h-7 px-3 ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-800 text-white font-semibold shadow-xs hover:bg-emerald-900'
                    : 'bg-slate-100 text-slate-600 border-none hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main High-Density Data Table using shadcn Table */}
      <Card className="rounded-3xl border-slate-200/90 shadow-sm overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <Table className="w-full text-left text-xs">
            <TableHeader className="bg-slate-50 border-b border-slate-200/80">
              <TableRow className="hover:bg-transparent">
                <TableHead className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-slate-500">Medication & Formulation</TableHead>
                <TableHead className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-slate-500">Batch & Shelf Loc</TableHead>
                <TableHead className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-slate-500">Current Stock</TableHead>
                <TableHead className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-slate-500">Shelf-Life Status</TableHead>
                <TableHead className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-right">Wholesale / Retail</TableHead>
                <TableHead className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100 text-slate-800">
              {filteredInventory.map(drug => {
                const isOutOfStock = drug.quantity <= 0;
                const isExpired = drug.status === 'EXPIRED';
                const isExpiring = drug.status === 'EXPIRING';
                const isLowStock = drug.status === 'LOW';

                return (
                  <TableRow
                    key={drug.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Medication & Formulation */}
                    <TableCell className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-xs">{drug.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <span>{drug.genericName}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-400">NAFDAC: {drug.nafdacReg}</span>
                      </div>
                    </TableCell>

                    {/* Batch & Shelf Loc */}
                    <TableCell className="py-3.5 px-4">
                      <div className="font-mono font-semibold text-slate-800">{drug.batchId}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{drug.shelfLocation}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[160px]">{drug.supplierName}</div>
                    </TableCell>

                    {/* Stock Level & Progress Bar */}
                    <TableCell className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{drug.quantity}</span>
                        <span className="text-[10px] text-slate-400">packs</span>
                      </div>
                      <div className="w-28 h-1.5 rounded-full bg-slate-100 overflow-hidden mt-1.5">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isOutOfStock
                              ? 'w-0'
                              : isLowStock
                              ? 'w-1/4 bg-amber-500'
                              : isExpired
                              ? 'w-full bg-rose-500'
                              : 'w-3/4 bg-emerald-600'
                          }`}
                        ></div>
                      </div>
                    </TableCell>

                    {/* Expiry Status */}
                    <TableCell className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">
                        {new Date(drug.expireDate).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="mt-1">
                        {isExpired ? (
                          <Badge variant="destructive" className="gap-1 text-[10px] font-bold">
                            <Icon name="error" className="text-xs" />
                            Expired ({Math.abs(drug.daysToExpiry)}d ago)
                          </Badge>
                        ) : isExpiring ? (
                          <Badge variant="outline" className="gap-1 text-[10px] font-bold bg-amber-100 text-amber-800 border-amber-200">
                            <Icon name="schedule" className="text-xs" />
                            Expiring in {drug.daysToExpiry} days
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border-emerald-200">
                            <Icon name="check_circle" className="text-xs" />
                            Good ({drug.daysToExpiry}d left)
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* Unit Cost & Retail Price */}
                    <TableCell className="py-3.5 px-4 text-right">
                      <div className="font-bold text-slate-900 text-xs">
                        ₦{drug.price.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Cost: ₦{drug.unitCost.toLocaleString()}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick Restock Dialog */}
                        {quickRestockId === drug.id ? (
                          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                            <Input
                              type="number"
                              min="1"
                              value={restockQty}
                              onChange={e => setRestockQty(Number(e.target.value))}
                              className="w-14 h-7 px-1.5 py-0.5 rounded bg-white text-center font-bold text-xs border-slate-200"
                            />
                            <Button
                              size="xs"
                              onClick={() => {
                                receiveStock(drug.id, restockQty);
                                setQuickRestockId(null);
                              }}
                              className="bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-bold h-7 px-2 cursor-pointer"
                            >
                              Add
                            </Button>
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => setQuickRestockId(null)}
                              className="text-slate-400 hover:text-slate-600 text-xs h-7 px-1 cursor-pointer"
                            >
                              ✕
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                              setQuickRestockId(drug.id);
                              setRestockQty(50);
                            }}
                            title="Quick restock quantity"
                            className="rounded-lg text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                          >
                            <Icon name="add_box" className="text-base" />
                          </Button>
                        )}

                        {/* Edit Drug */}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setEditingDrug(drug)}
                          title="Edit drug details"
                          className="rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                        >
                          <Icon name="edit" className="text-base" />
                        </Button>

                        {/* Supplier Warranty Return (For expired or expiring) */}
                        {(isExpired || isExpiring) && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setClaimingDrug(drug)}
                            title="Send warranty recall request to supplier"
                            className="rounded-lg text-amber-700 hover:bg-amber-50 cursor-pointer"
                          >
                            <Icon name="mail" className="text-base" />
                          </Button>
                        )}

                        {/* Delete Drug */}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            if (confirm(`Are you sure you want to remove ${drug.name} from dispensary inventory?`)) {
                              deleteDrug(drug.id);
                            }
                          }}
                          title="Delete medication"
                          className="rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <Icon name="delete" className="text-base" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {filteredInventory.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <Icon name="inventory_2" className="text-4xl text-slate-300 block mb-1" />
            <p className="font-semibold text-slate-700">No inventory matches the selected criteria.</p>
            <p className="text-xs text-slate-400 mt-1">Try switching filters or adding a new medication batch.</p>
          </div>
        )}
      </Card>

      {/* Modals */}
      <AddDrugModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />

      <EditDrugModal
        drug={editingDrug}
        onClose={() => setEditingDrug(null)}
      />

      <EmailSupplierModal
        drug={claimingDrug}
        onClose={() => setClaimingDrug(null)}
      />
    </div>
  );
}

export default InventoryContent;
