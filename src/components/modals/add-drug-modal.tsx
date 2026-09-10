'use client';

import React, { useState } from 'react';
import { usePharmacy } from '@/lib/store';
import { DrugCategory } from '@/lib/types';
import { Icon } from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface AddDrugModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddDrugModal({ isOpen, onClose }: AddDrugModalProps) {
  const { addDrug, suppliers } = usePharmacy();

  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: 'antimalarials' as DrugCategory,
    quantity: 0,
    batchId: '',
    expireDate: '',
    price: 0,
    unitCost: 0,
    supplierEmail: suppliers[0]?.email || '',
    shelfLocation: '',
    nafdacReg: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const supplierMatch = suppliers.find(s => s.email === formData.supplierEmail);

    addDrug({
      name: formData.name,
      genericName: formData.genericName || formData.name,
      category: formData.category,
      quantity: Number(formData.quantity),
      batchId: formData.batchId,
      expireDate: formData.expireDate,
      price: Number(formData.price),
      unitCost: Number(formData.unitCost),
      supplierEmail: formData.supplierEmail,
      supplierName: supplierMatch?.name || 'Registered Pharmaceutical Supplier',
      shelfLocation: formData.shelfLocation,
      nafdacReg: formData.nafdacReg,
      imagePath: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=200'
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden rounded-3xl bg-white border border-slate-200">
        <DialogHeader className="bg-emerald-800 text-white px-6 py-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="add_circle" className="text-emerald-200 text-lg" />
            <div>
              <DialogTitle className="font-bold text-sm text-white tracking-wide">
                Receive New Stock / Add Medicine
              </DialogTitle>
              <DialogDescription className="text-emerald-200/80 text-xs">
                Log newly delivered medication batches into dispensary inventory
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Trade / Brand Name *
              </Label>
              <Input
                type="text"
                required
                placeholder="e.g. Coartem 80/480mg Tablets"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="rounded-xl border-slate-200 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Generic Formulation
              </Label>
              <Input
                type="text"
                placeholder="e.g. Artemether + Lumefantrine"
                value={formData.genericName}
                onChange={e => setFormData({ ...formData, genericName: e.target.value })}
                className="rounded-xl border-slate-200 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Clinical Category
              </Label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as DrugCategory })}
                className="w-full h-8 px-2.5 rounded-xl border border-input text-slate-900 text-xs focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none bg-white font-medium"
              >
                <option value="antimalarials">Antimalarials</option>
                <option value="antibiotics">Antibiotics</option>
                <option value="analgesics">Pain & Analgesics</option>
                <option value="diabetes">Chronic Care / Diabetes</option>
                <option value="pom">Prescription Only (POM)</option>
                <option value="otc">OTC / First Aid</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Batch ID Number *
              </Label>
              <Input
                type="text"
                required
                value={formData.batchId}
                onChange={e => setFormData({ ...formData, batchId: e.target.value })}
                className="rounded-xl border-slate-200 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Expiry Date *
              </Label>
              <Input
                type="date"
                required
                value={formData.expireDate}
                onChange={e => setFormData({ ...formData, expireDate: e.target.value })}
                className="rounded-xl border-slate-200 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Initial Stock Quantity *
              </Label>
              <Input
                type="number"
                min="0"
                required
                value={formData.quantity}
                onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="rounded-xl border-slate-200 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Wholesale Unit Cost (₦) *
              </Label>
              <Input
                type="number"
                min="0"
                required
                value={formData.unitCost}
                onChange={e => setFormData({ ...formData, unitCost: Number(e.target.value) })}
                className="rounded-xl border-slate-200 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Retail Selling Price (₦) *
              </Label>
              <Input
                type="number"
                min="0"
                required
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                className="rounded-xl border-slate-200 text-xs font-bold text-emerald-800"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Shelf / Bin Location
              </Label>
              <Input
                type="text"
                placeholder="e.g. Shelf A-02"
                value={formData.shelfLocation}
                onChange={e => setFormData({ ...formData, shelfLocation: e.target.value })}
                className="rounded-xl border-slate-200 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                NAFDAC Reg No.
              </Label>
              <Input
                type="text"
                value={formData.nafdacReg}
                onChange={e => setFormData({ ...formData, nafdacReg: e.target.value })}
                className="rounded-xl border-slate-200 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Licensed Supplier
              </Label>
              <select
                value={formData.supplierEmail}
                onChange={e => setFormData({ ...formData, supplierEmail: e.target.value })}
                className="w-full h-8 px-2.5 rounded-xl border border-input text-slate-900 text-xs focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none bg-white font-medium"
              >
                {suppliers.map(sup => (
                  <option key={sup.id} value={sup.email}>
                    {sup.name} ({sup.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-transparent">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="gap-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white shadow-sm"
            >
              <Icon name="inventory" className="text-sm" />
              <span>Confirm & Stock</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
