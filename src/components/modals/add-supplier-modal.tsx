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

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddSupplierModal({ isOpen, onClose }: AddSupplierModalProps) {
  const { addSupplier, suppliers } = usePharmacy();

  const [formData, setFormData] = useState({
    supplierID: 'SUP00' + (suppliers.length + 1),
    name: '',
    email: '',
    contact: '',
    address: 'Lagos Industrial Zone',
    drugsAvailable: '',
    tier: 'Tier-1 National'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    addSupplier({
      supplierID: formData.supplierID,
      name: formData.name,
      email: formData.email,
      contact: formData.contact,
      address: formData.address,
      drugsAvailable: formData.drugsAvailable,
      tier: formData.tier
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-3xl bg-white border border-slate-200">
        <DialogHeader className="bg-emerald-800 text-white px-6 py-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="domain_add" className="text-emerald-200 text-lg" />
            <div>
              <DialogTitle className="font-bold text-sm text-white tracking-wide">
                Register Approved Pharmaceutical Supplier
              </DialogTitle>
              <DialogDescription className="text-emerald-200/80 text-xs">
                Add licensed drug distributor or manufacturer credentials
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 uppercase tracking-wider">
                Supplier Code ID *
              </Label>
              <Input
                type="text"
                required
                value={formData.supplierID}
                onChange={e => setFormData({ ...formData, supplierID: e.target.value })}
                className="rounded-xl border-slate-200 text-slate-900 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 uppercase tracking-wider">
                Tier / Classification
              </Label>
              <select
                value={formData.tier}
                onChange={e => setFormData({ ...formData, tier: e.target.value })}
                className="w-full h-8 px-2.5 rounded-xl border border-input text-slate-900 outline-none bg-white font-medium"
              >
                <option value="Tier-1 Multinational">Tier-1 Multinational</option>
                <option value="Tier-1 Indigenous Manufacturer">Tier-1 Indigenous Manufacturer</option>
                <option value="Tier-2 Regional">Tier-2 Regional Distributor</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="font-bold text-slate-700 uppercase tracking-wider">
              Company / Manufacturer Name *
            </Label>
            <Input
              type="text"
              required
              placeholder="e.g. Fidson Healthcare Plc"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="rounded-xl border-slate-200 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 uppercase tracking-wider">
                Official Orders Email *
              </Label>
              <Input
                type="email"
                required
                placeholder="orders@fidson.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="rounded-xl border-slate-200 text-slate-900 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 uppercase tracking-wider">
                Contact Telephone *
              </Label>
              <Input
                type="text"
                required
                placeholder="+234 1 234 5678"
                value={formData.contact}
                onChange={e => setFormData({ ...formData, contact: e.target.value })}
                className="rounded-xl border-slate-200 text-slate-900"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="font-bold text-slate-700 uppercase tracking-wider">
              Warehouse Physical Address
            </Label>
            <Input
              type="text"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="rounded-xl border-slate-200 text-slate-900"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="font-bold text-slate-700 uppercase tracking-wider">
              Authorized Available Drug Formulations
            </Label>
            <Textarea
              rows={2}
              placeholder="e.g. Ciprotab, Astymin, Asmotone, Ciklav"
              value={formData.drugsAvailable}
              onChange={e => setFormData({ ...formData, drugsAvailable: e.target.value })}
              className="rounded-xl border-slate-200 text-slate-900 resize-none min-h-16"
            />
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3 bg-transparent">
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
              <Icon name="check" className="text-sm" />
              <span>Register Vendor</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
