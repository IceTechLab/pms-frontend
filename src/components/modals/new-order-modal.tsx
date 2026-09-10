'use client';

import React, { useState } from 'react';
import { usePharmacy } from '@/lib/store';
import { PrescribedItem } from '@/lib/types';
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

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewOrderModal({ isOpen, onClose }: NewOrderModalProps) {
  const { createDoctorOrder, inventory, currentUser } = usePharmacy();

  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState(0);
  const [patientGender, setPatientGender] = useState<'Male' | 'Female'>('Female');
  const [patientWeight, setPatientWeight] = useState('');
  const [patientBloodGroup, setPatientBloodGroup] = useState('');
  const [nhisNumber, setNhisNumber] = useState('');
  const [address, setAddress] = useState('');
  const [priority, setPriority] = useState<'stat' | 'pediatric' | 'routine'>('routine');
  const [allergyAlert, setAllergyAlert] = useState('');
  const [pickupDate, setPickupDate] = useState('');

  // Prescribed items list
  const [items, setItems] = useState<PrescribedItem[]>([
    {
      drugName: inventory[0]?.name || '',
      drugId: inventory[0]?.id,
      dosage: '',
      instructions: '',
      quantity: 1,
      price: inventory[0]?.price || 3200,
      inStock: true
    }
  ]);

  const handleAddItem = () => {
    const nextDrug = inventory[items.length % inventory.length] || inventory[0];
    setItems([
      ...items,
      {
        drugName: nextDrug?.name || '',
        drugId: nextDrug?.id,
        dosage: '',
        instructions: '',
        quantity: 1,
        price: nextDrug?.price || 0,
        inStock: (nextDrug?.quantity || 0) > 0
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleDrugSelect = (index: number, drugId: string) => {
    const selected = inventory.find(d => d.id === drugId);
    if (!selected) return;
    setItems(items.map((it, idx) => idx === index ? {
      ...it,
      drugId: selected.id,
      drugName: selected.name,
      price: selected.price,
      inStock: selected.quantity > 0
    } : it));
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || items.length === 0) return;

    createDoctorOrder({
      patientName,
      patientAge: Number(patientAge),
      patientGender,
      patientWeight,
      patientBloodGroup,
      nhisNumber,
      address,
      priority,
      doctorName: currentUser.role === 'doctor' ? currentUser.name : currentUser.name,
      doctorId: currentUser.role === 'doctor' ? currentUser.docId || currentUser.id : currentUser.id,
      doctorEmail: currentUser.role === 'doctor' ? currentUser.email : currentUser.email,
      doctorContact: currentUser.role === 'doctor' ? currentUser.contact : currentUser.contact,
      hospital: '',
      folioNumber: '',
      prescribedItems: items,
      totalAmount,
      pickupDate,
      allergyAlert: allergyAlert.trim() || undefined,
      pomComplianceChecked: false,
      pharmacistNotes: 'Awaiting clinical check by dispensing pharmacist.'
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden rounded-3xl bg-white border border-slate-200">
        <DialogHeader className="bg-emerald-800 text-white px-6 py-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="clinical_notes" className="text-emerald-200 text-lg" />
            <div>
              <DialogTitle className="font-bold text-sm text-white tracking-wide">
                Ingest Tele-Prescription / Doctor Order
              </DialogTitle>
              <DialogDescription className="text-emerald-200/80 text-xs">
                Record new electronic prescription for clinical pharmacist review
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto text-xs">
          {/* Patient Details */}
          <div>
            <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2 text-[11px] border-b pb-1">
              Patient Demographics
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="font-semibold text-slate-600">Full Patient Name *</Label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Folashade Adeleke"
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  className="rounded-xl border-slate-200 text-slate-900"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-semibold text-slate-600">Priority Classification</Label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as any)}
                  className="w-full h-8 px-2.5 rounded-xl border border-input text-slate-900 outline-none bg-white font-semibold text-emerald-800 text-xs"
                >
                  <option value="routine">Routine</option>
                  <option value="stat">STAT Priority</option>
                  <option value="pediatric">Pediatric</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-slate-600">Age (Years)</Label>
                <Input
                  type="number"
                  min="0"
                  value={patientAge}
                  onChange={e => setPatientAge(Number(e.target.value))}
                  className="rounded-xl border-slate-200 text-slate-900"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-semibold text-slate-600">Gender</Label>
                <select
                  value={patientGender}
                  onChange={e => setPatientGender(e.target.value as any)}
                  className="w-full h-8 px-2.5 rounded-xl border border-input text-slate-900 outline-none bg-white text-xs"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="font-semibold text-slate-600">Weight / Blood Group</Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={patientWeight}
                    onChange={e => setPatientWeight(e.target.value)}
                    className="w-1/2 rounded-xl border-slate-200 text-slate-900"
                  />
                  <Input
                    type="text"
                    value={patientBloodGroup}
                    onChange={e => setPatientBloodGroup(e.target.value)}
                    className="w-1/2 rounded-xl border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label className="font-semibold text-slate-600">NHIS / Medical Record #</Label>
                <Input
                  type="text"
                  value={nhisNumber}
                  onChange={e => setNhisNumber(e.target.value)}
                  className="rounded-xl border-slate-200 text-slate-900 font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-semibold text-slate-600">Pickup Target Date</Label>
                <Input
                  type="date"
                  value={pickupDate}
                  onChange={e => setPickupDate(e.target.value)}
                  className="rounded-xl border-slate-200 text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Allergy Warning Alert */}
          <div className="space-y-1.5">
            <Label className="font-semibold text-slate-600">
              Allergy Alert Warnings (Critical Clinical Safeguard)
            </Label>
            <Input
              type="text"
              placeholder="e.g. Penicillin & Sulfa allergy · Do not dispense beta-lactams"
              value={allergyAlert}
              onChange={e => setAllergyAlert(e.target.value)}
              className="rounded-xl border-rose-200 bg-rose-50/50 text-rose-900 placeholder:text-rose-400 focus-visible:border-rose-500 font-medium"
            />
          </div>

          {/* Prescribed Items */}
          <div>
            <div className="flex items-center justify-between mb-2 border-b pb-1">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Prescribed Drug Regimen ({items.length})
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddItem}
                className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 font-bold h-7 gap-1"
              >
                <Icon name="add" className="text-sm" />
                <span>Add Medication</span>
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl relative space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-slate-500 text-[11px]">{idx + 1}.</span>
                    <select
                      value={item.drugId}
                      onChange={e => handleDrugSelect(idx, e.target.value)}
                      className="flex-1 h-8 px-2.5 rounded-xl border border-input bg-white text-slate-900 font-semibold outline-none text-xs"
                    >
                      {inventory.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name} (₦{d.price.toLocaleString()} · Stock: {d.quantity})
                        </option>
                      ))}
                    </select>
                    <div className="w-20">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e => {
                          const q = Number(e.target.value);
                          setItems(items.map((it, i) => i === idx ? { ...it, quantity: q } : it));
                        }}
                        className="rounded-xl border-slate-200 bg-white text-slate-900 text-center font-bold"
                      />
                    </div>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(idx)}
                        className="h-8 w-8 text-slate-400 hover:text-rose-600"
                      >
                        <Icon name="delete" className="text-base" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="text"
                      placeholder="Dosage, e.g. PO BD x 7 days"
                      value={item.dosage}
                      onChange={e => {
                        const v = e.target.value;
                        setItems(items.map((it, i) => i === idx ? { ...it, dosage: v } : it));
                      }}
                      className="rounded-xl border-slate-200 bg-white text-slate-800 text-[11px]"
                    />
                    <Input
                      type="text"
                      placeholder="Patient instructions (e.g. Take with meals)"
                      value={item.instructions}
                      onChange={e => {
                        const v = e.target.value;
                        setItems(items.map((it, i) => i === idx ? { ...it, instructions: v } : it));
                      }}
                      className="rounded-xl border-slate-200 bg-white text-slate-800 text-[11px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Summary & Submit */}
          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-between sm:justify-between bg-transparent">
            <div>
              <span className="text-[11px] text-slate-500">Estimated Total:</span>
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
                <Icon name="send" className="text-sm" />
                <span>Queue for Clinical Verification</span>
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
