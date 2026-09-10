'use client';

import React, { useState } from 'react';
import { usePharmacy } from '@/lib/store';
import { UserRole } from '@/lib/types';
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

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddUserModal({ isOpen, onClose }: AddUserModalProps) {
  const { addUser } = usePharmacy();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [nic, setNic] = useState('');
  const [docId, setDocId] = useState('');
  const [role, setRole] = useState<UserRole>('cashier');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    addUser({
      name,
      email,
      contact,
      nic: role !== 'doctor' ? nic : undefined,
      docId: role === 'doctor' ? docId : undefined,
      role,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-3xl bg-white border border-slate-200">
        <DialogHeader className="bg-emerald-800 text-white px-6 py-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="person_add" className="text-emerald-200 text-lg" />
            <div>
              <DialogTitle className="font-bold text-sm text-white tracking-wide">
                Create Staff / Doctor Account
              </DialogTitle>
              <DialogDescription className="text-emerald-200/80 text-xs">
                Authorize clinical pharmacist, cashier, or prescriber credentials
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="space-y-1.5">
            <Label className="font-bold text-slate-700 uppercase tracking-wider">
              Account Role / Permission Level *
            </Label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as UserRole)}
              className="w-full h-8 px-2.5 rounded-xl border border-input text-slate-900 outline-none bg-white font-semibold"
            >
              <option value="cashier">Cashier (Point of Sale)</option>
              <option value="assistantPharmacist">Assistant Pharmacist (Dispensary & Inventory)</option>
              <option value="pharmacist">Chief Pharmacist (Admin / Verification / Procurement)</option>
              <option value="doctor">Prescribing Doctor (Tele-medicine Ingest)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="font-bold text-slate-700 uppercase tracking-wider">
              Full Name *
            </Label>
            <Input
              type="text"
              required
              placeholder="e.g. Dr. Babatunde Fashola"
              value={name}
              onChange={e => setName(e.target.value)}
              className="rounded-xl border-slate-200 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 uppercase tracking-wider">
                Email Address *
              </Label>
              <Input
                type="email"
                required
                placeholder="staff@pms.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="rounded-xl border-slate-200 text-slate-900 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 uppercase tracking-wider">
                Mobile Contact *
              </Label>
              <Input
                type="text"
                required
                placeholder="+234 802 000 1122"
                value={contact}
                onChange={e => setContact(e.target.value)}
                className="rounded-xl border-slate-200 text-slate-900"
              />
            </div>
          </div>

          {role === 'doctor' ? (
            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 uppercase tracking-wider">
                Medical & Dental Council Folio ID (MDCN) *
              </Label>
              <Input
                type="text"
                required
                placeholder="MDCN-64921"
                value={docId}
                onChange={e => setDocId(e.target.value)}
                className="rounded-xl border-slate-200 text-slate-900 font-mono"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 uppercase tracking-wider">
                National Identity Number (NIN / Staff ID) *
              </Label>
              <Input
                type="text"
                required
                placeholder="NIN-94820194821"
                value={nic}
                onChange={e => setNic(e.target.value)}
                className="rounded-xl border-slate-200 text-slate-900 font-mono"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="font-bold text-slate-700 uppercase tracking-wider">
              Initial Temporary Password
            </Label>
            <Input
              type="password"
              defaultValue="password123"
              className="rounded-xl border-slate-200 text-slate-900 font-mono"
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
              <span>Register Account</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
