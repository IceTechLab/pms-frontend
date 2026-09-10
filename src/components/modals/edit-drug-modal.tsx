'use client';

import React, { useState, useEffect } from 'react';
import { usePharmacy } from '@/lib/store';
import { InventoryDrug, DrugCategory } from '@/lib/types';
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

interface EditDrugModalProps {
  drug: InventoryDrug | null;
  onClose: () => void;
}

export function EditDrugModal({ drug, onClose }: EditDrugModalProps) {
  const { updateDrug } = usePharmacy();

  const [formData, setFormData] = useState<Partial<InventoryDrug>>({});

  useEffect(() => {
    if (drug) {
      setFormData({
        name: drug.name,
        genericName: drug.genericName,
        category: drug.category,
        quantity: drug.quantity,
        batchId: drug.batchId,
        expireDate: drug.expireDate,
        price: drug.price,
        unitCost: drug.unitCost,
        shelfLocation: drug.shelfLocation,
        nafdacReg: drug.nafdacReg
      });
    }
  }, [drug]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drug) return;
    updateDrug(drug.id, formData);
    onClose();
  };

  return (
    <Dialog open={!!drug} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden rounded-3xl bg-white border border-slate-200">
        <DialogHeader className="bg-slate-900 text-white px-6 py-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="edit_note" className="text-emerald-400 text-lg" />
            <div>
              <DialogTitle className="font-bold text-sm text-white tracking-wide">
                Edit Medicine: {drug?.name}
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs">
                Update formulation specs, pricing, batch tracking, or shelf placement
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Trade Name
              </Label>
              <Input
                type="text"
                required
                value={formData.name || ''}
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
                value={formData.genericName || ''}
                onChange={e => setFormData({ ...formData, genericName: e.target.value })}
                className="rounded-xl border-slate-200 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Clinical Category
              </Label>
              <select
                value={formData.category || 'antimalarials'}
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
                Current Stock Quantity
              </Label>
              <Input
                type="number"
                min="0"
                required
                value={formData.quantity ?? 0}
                onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="rounded-xl border-slate-200 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Expiry Date
              </Label>
              <Input
                type="date"
                required
                value={formData.expireDate || ''}
                onChange={e => setFormData({ ...formData, expireDate: e.target.value })}
                className="rounded-xl border-slate-200 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Retail Price (₦)
              </Label>
              <Input
                type="number"
                min="0"
                required
                value={formData.price ?? 0}
                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                className="rounded-xl border-slate-200 text-xs font-bold text-emerald-800"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Wholesale Unit Cost (₦)
              </Label>
              <Input
                type="number"
                min="0"
                required
                value={formData.unitCost ?? 0}
                onChange={e => setFormData({ ...formData, unitCost: Number(e.target.value) })}
                className="rounded-xl border-slate-200 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Shelf Location
              </Label>
              <Input
                type="text"
                value={formData.shelfLocation || ''}
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
                value={formData.nafdacReg || ''}
                onChange={e => setFormData({ ...formData, nafdacReg: e.target.value })}
                className="rounded-xl border-slate-200 text-xs font-mono"
              />
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
              className="gap-1.5 rounded-xl bg-slate-900 text-white hover:bg-black shadow-sm"
            >
              <Icon name="save" className="text-sm" />
              <span>Save Changes</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
