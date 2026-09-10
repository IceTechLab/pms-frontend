'use client';

import React from 'react';
import { Sale } from '@/lib/types';
import { Icon } from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ReceiptModalProps {
  sale: Sale | null;
  onClose: () => void;
}

export function ReceiptModal({ sale, onClose }: ReceiptModalProps) {
  if (!sale) return null;

  return (
    <Dialog open={Boolean(sale)} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden rounded-3xl bg-white border border-slate-200">
        {/* Modal Top Header */}
        <DialogHeader className="bg-emerald-800 text-white px-6 py-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="receipt_long" className="text-emerald-200 text-lg" />
            <div>
              <DialogTitle className="font-bold text-sm text-white tracking-wide">
                Official Dispensary Receipt
              </DialogTitle>
              <DialogDescription className="text-emerald-200/80 text-xs">
                Transaction proof and medication schedule summary
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Receipt Printable Slip */}
        <div className="p-6 text-slate-800 font-mono text-xs max-h-[75vh] overflow-y-auto">
          {/* Pharmacy Info */}
          <div className="text-center pb-4 border-b border-dashed border-slate-300">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-tight">PharmaCare NG (VI Flagship)</h3>
            <p className="text-[11px] text-slate-500 font-sans mt-0.5">Plot 14B, Adeola Odeku Street, Victoria Island, Lagos</p>
            <p className="text-[11px] text-slate-500 font-sans">PCN Reg Lic: 0492-LG • TIN: 10492819-0001</p>
            <div className="mt-2">
              <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-bold uppercase font-sans">
                Transaction Approved
              </Badge>
            </div>
          </div>

          {/* Meta Info */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Receipt No:</span>
              <span className="font-bold">{sale.receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tx Ref:</span>
              <span>{sale.transactionNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date/Time:</span>
              <span>{new Date(sale.dateTime).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Dispenser / Cashier:</span>
              <span>{sale.cashierName} ({sale.cashierRole})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Patient:</span>
              <span className="font-semibold">{sale.patientName}</span>
            </div>
            {sale.patientNhis && (
              <div className="flex justify-between">
                <span className="text-slate-500">NHIS / HMO Ref:</span>
                <span>{sale.patientNhis}</span>
              </div>
            )}
          </div>

          {/* Itemized Table */}
          <div className="py-3 border-b border-dashed border-slate-300">
            <div className="flex justify-between font-bold text-slate-900 pb-1.5 border-b border-slate-200 uppercase text-[10px]">
              <span>Item Description</span>
              <span>Qty x Price</span>
              <span>Total (₦)</span>
            </div>
            <div className="divide-y divide-slate-100 pt-1 space-y-1">
              {sale.items.map((item, idx) => (
                <div key={idx} className="pt-1.5 flex justify-between items-start">
                  <div className="flex-1 pr-2">
                    <div className="font-semibold text-slate-900">{item.drugName}</div>
                    <div className="text-[10px] text-slate-400">Batch: {item.batchId}</div>
                  </div>
                  <div className="text-slate-600 whitespace-nowrap px-2">
                    {item.quantity} x {item.price.toLocaleString()}
                  </div>
                  <div className="font-bold text-slate-900 whitespace-nowrap">
                    {item.total.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Calculation */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>₦{sale.subtotal.toLocaleString()}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount Applied:</span>
                <span>-₦{sale.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>VAT (FIRS 7.5%):</span>
              <span>₦{sale.tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
              <span>TOTAL DUE:</span>
              <span>₦{sale.totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-700 pt-1">
              <span>Payment Tender ({sale.tenderType}):</span>
              <span>₦{sale.paidAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-800">
              <span>Change Due:</span>
              <span>₦{sale.balance.toLocaleString()}</span>
            </div>
          </div>

          {/* Regulatory Warning & Footnotes */}
          <div className="pt-4 text-center font-sans text-[10px] text-slate-400 space-y-1">
            <p>Thank you for choosing PharmaCare Dispensary!</p>
            <p className="text-slate-500 font-medium">Keep medicines in a cool, dry place away from direct sunlight.</p>
            <p className="text-[9px]">Verified Dispensation • PCN Reg No. 0492-LG</p>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <DialogFooter className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-end gap-3 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              window.print();
            }}
            className="rounded-xl border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold gap-1.5 shadow-2xs"
          >
            <Icon name="print" className="text-base" />
            <span>Print Receipt</span>
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onClose}
            className="rounded-xl bg-emerald-800 text-white hover:bg-emerald-900 font-semibold shadow-sm gap-1.5"
          >
            <span>Close Window</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
