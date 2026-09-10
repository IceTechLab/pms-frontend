'use client';

import React, { useState } from 'react';
import { usePharmacy } from '@/lib/store';
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface CreatePoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePoModal({ isOpen, onClose }: CreatePoModalProps) {
  const { createPurchaseOrder, suppliers, inventory } = usePharmacy();

  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [expectedDate, setExpectedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([
    {
      drugName: inventory[0]?.name || '',
      quantity: 0,
      unitCost: inventory[0]?.unitCost || 0
    }
  ]);

  const selectedSupplier = suppliers.find(s => s.id === supplierId) || suppliers[0];

  const handleAddItem = () => {
    const nextDrug = inventory[items.length % inventory.length] || inventory[0];
    setItems([
      ...items,
      {
        drugName: nextDrug?.name || '',
        quantity: 0,
        unitCost: nextDrug?.unitCost || 0
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    createPurchaseOrder({
      supplierId: selectedSupplier.id,
      supplierName: selectedSupplier.name,
      items: items.map(it => ({
        drugName: it.drugName,
        quantity: Number(it.quantity),
        unitCost: Number(it.unitCost),
        total: Number(it.quantity) * Number(it.unitCost)
      })),
      totalAmount,
      expectedDate,
      status: 'submitted',
      notes
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden rounded-3xl bg-white border border-slate-200">
        <DialogHeader className="bg-emerald-800 text-white px-6 py-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="add_shopping_cart" className="text-emerald-200 text-lg" />
            <div>
              <DialogTitle className="font-bold text-sm text-white tracking-wide">
                Generate Electronic Purchase Order (PO)
              </DialogTitle>
              <DialogDescription className="text-emerald-200/80 text-xs">
                Create verified replenishment PO for pharmaceutical distributors
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 uppercase tracking-wider">
                Authorized Supplier
              </Label>
              <select
                value={supplierId}
                onChange={e => setSupplierId(e.target.value)}
                className="w-full h-8 px-2.5 rounded-xl border border-input text-slate-900 outline-none bg-white font-semibold"
              >
                {suppliers.map(sup => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 uppercase tracking-wider">
                Expected Consignment Date
              </Label>
              <Input
                type="date"
                required
                value={expectedDate}
                onChange={e => setExpectedDate(e.target.value)}
                className="rounded-xl border-slate-200 text-slate-900"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-700 uppercase tracking-wider">Line Items ({items.length})</span>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={handleAddItem}
                className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Icon name="add" className="text-sm" /> Add SKU
              </Button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Medication description"
                      value={item.drugName}
                      onChange={e => {
                        const val = e.target.value;
                        setItems(items.map((it, i) => i === idx ? { ...it, drugName: val } : it));
                      }}
                      className="rounded-xl border-slate-200 bg-white font-semibold text-xs h-8"
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={e => {
                        const q = Number(e.target.value);
                        setItems(items.map((it, i) => i === idx ? { ...it, quantity: q } : it));
                      }}
                      className="rounded-xl border-slate-200 bg-white text-center font-bold text-xs h-8"
                    />
                  </div>
                  <div className="w-28">
                    <Input
                      type="number"
                      min="0"
                      placeholder="Unit Cost"
                      value={item.unitCost}
                      onChange={e => {
                        const c = Number(e.target.value);
                        setItems(items.map((it, i) => i === idx ? { ...it, unitCost: c } : it));
                      }}
                      className="rounded-xl border-slate-200 bg-white text-right font-bold text-xs h-8"
                    />
                  </div>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-slate-400 hover:text-rose-600 shrink-0"
                    >
                      <Icon name="delete" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="font-bold text-slate-700 uppercase tracking-wider">
              Procurement Officer Notes
            </Label>
            <Textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="rounded-xl border-slate-200 text-slate-900 resize-none min-h-16"
            />
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-between bg-transparent">
            <div>
              <span className="text-[11px] text-slate-500">Total Purchase Commitment:</span>
              <div className="text-base font-bold text-slate-900">₦{totalAmount.toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-3">
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
                <Icon name="local_shipping" className="text-sm" />
                <span>Issue Purchase Order</span>
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
