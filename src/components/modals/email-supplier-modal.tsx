'use client';

import React, { useState } from 'react';
import { usePharmacy } from '@/lib/store';
import { InventoryDrug } from '@/lib/types';
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

interface EmailSupplierModalProps {
  drug: InventoryDrug | null;
  onClose: () => void;
}

export function EmailSupplierModal({ drug, onClose }: EmailSupplierModalProps) {
  const { submitExpiryClaim } = usePharmacy();
  const [returnQty, setReturnQty] = useState(drug ? drug.quantity : 1);
  const [notes, setNotes] = useState(
    'Notice of expired/damaged medication batch. In accordance with our pharmaceutical distributor supply agreement, we request a return merchandise authorization (RMA) credit note.'
  );

  const totalCredit = drug ? returnQty * drug.unitCost : 0;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drug) return;
    submitExpiryClaim(drug.id, returnQty);
    onClose();
  };

  return (
    <Dialog open={!!drug} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-3xl bg-white border border-slate-200">
        <DialogHeader className="bg-amber-600 text-white px-6 py-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="mail" className="text-amber-200 text-lg" />
            <div>
              <DialogTitle className="font-bold text-sm text-white tracking-wide">
                Supplier Return & Warranty Claim
              </DialogTitle>
              <DialogDescription className="text-amber-100 text-xs">
                Transmit recall or credit authorization notice to distributor
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {drug && (
          <form onSubmit={handleSend} className="p-6 space-y-4 text-xs">
            <div className="p-3 bg-amber-50 border border-amber-200/70 rounded-2xl flex items-start gap-3 text-amber-900">
              <Icon name="inventory_2" className="text-lg text-amber-700 shrink-0" />
              <div>
                <div className="font-bold">{drug.name}</div>
                <div className="text-[11px] text-amber-800">
                  Batch: {drug.batchId} • Expiry: {drug.expireDate} • NAFDAC: {drug.nafdacReg}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 uppercase tracking-wider">
                Recipient Supplier Email
              </Label>
              <Input
                type="email"
                readOnly
                value={drug.supplierEmail}
                className="rounded-xl bg-slate-100 border-slate-200 text-slate-700 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 uppercase tracking-wider">
                  Quantity for Return
                </Label>
                <Input
                  type="number"
                  min="1"
                  max={drug.quantity || 1000}
                  value={returnQty}
                  onChange={e => setReturnQty(Number(e.target.value))}
                  className="rounded-xl border-slate-200 text-slate-900 font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 uppercase tracking-wider">
                  Expected Credit Value
                </Label>
                <div className="w-full h-8 px-2.5 flex items-center rounded-xl bg-slate-100 border border-slate-200 text-slate-900 font-bold text-emerald-800">
                  ₦{totalCredit.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 uppercase tracking-wider">
                Official Claim Justification / Notes
              </Label>
              <Textarea
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="rounded-xl border-slate-200 text-slate-900 resize-none min-h-20"
              />
            </div>

            <DialogFooter className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 bg-transparent">
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
                className="gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
              >
                <Icon name="send" className="text-sm" />
                <span>Transmit RMA Claim</span>
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
