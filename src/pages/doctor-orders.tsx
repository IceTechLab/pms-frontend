'use client';

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePharmacy } from '@/lib/store';
import { DoctorOrder, DoctorOrderStatus } from '@/lib/types';
import { NewOrderModal } from '@/components/modals/new-order-modal';
import { Icon } from '@/components/ui/icon';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function DoctorOrdersPage() {
  const navigate = useNavigate();
  const {
    doctorOrders,
    verifyDoctorOrder,
    rejectDoctorOrder,
    sendOrderToPos,
    pickupDoctorOrder,
    showToast,
    metrics
  } = usePharmacy();

  const [activeFilter, setActiveFilter] = useState<DoctorOrderStatus | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);

  // Verification Checklist State
  const [checklist, setChecklist] = useState({
    dosingVerified: true,
    allergiesCrossChecked: true,
    inventoryReserved: true,
    pomComplianceSignoff: false
  });

  const [pharmacistNotes, setPharmacistNotes] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return doctorOrders.filter(order => {
      const matchesStatus = activeFilter === 'all' || order.status === activeFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        order.patientName.toLowerCase().includes(q) ||
        order.orderNumber.toLowerCase().includes(q) ||
        order.nhisNumber.toLowerCase().includes(q) ||
        order.doctorName.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [doctorOrders, activeFilter, searchQuery]);

  // Selected active order
  const activeOrder: DoctorOrder | undefined = useMemo(() => {
    if (selectedOrderId) {
      const found = doctorOrders.find(o => o.id === selectedOrderId);
      if (found) return found;
    }
    return filteredOrders[0] || doctorOrders[0];
  }, [selectedOrderId, doctorOrders, filteredOrders]);

  // Update notes when activeOrder changes
  React.useEffect(() => {
    if (activeOrder) {
      setPharmacistNotes(
        activeOrder.pharmacistNotes ||
        'Substituted generic brand per patient consent. Advised patient on complete adherence and hydration.'
      );
      setChecklist({
        dosingVerified: true,
        allergiesCrossChecked: true,
        inventoryReserved: true,
        pomComplianceSignoff: activeOrder.pomComplianceChecked || false
      });
    }
  }, [activeOrder?.id]);

  const handleVerifyAndSendToPos = () => {
    if (!activeOrder) return;

    if (!checklist.pomComplianceSignoff) {
      showToast(
        'Compliance Check Required',
        'You must check the "PCN POM Sign-off" compliance box before routing to POS dispensing.',
        'error'
      );
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      verifyDoctorOrder(activeOrder.id, pharmacistNotes);
      sendOrderToPos(activeOrder.id);
      setIsVerifying(false);
      navigate('/pos');
    }, 600);
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1700px] mx-auto">
      {/* Top Hub Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
              Tele-Prescription Clinical Workflow
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-500 text-xs">MDCN Regulatory Validated</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Prescription Orders & Clinical Verification
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review tele-prescriptions, clinical allergy safeguards, POM regulatory checks, and authorize dispensary checkout.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => showToast('Queue Synced', 'Prescription queue up to date with hospital network', 'info')}
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold gap-1.5 h-9 cursor-pointer"
          >
            <Icon name="refresh" className="text-base text-slate-500" />
            <span>Sync Hospital Queue</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setIsNewOrderOpen(true)}
            className="rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold gap-1.5 h-9 cursor-pointer shadow-sm"
          >
            <Icon name="add" className="text-base" />
            <span>New Order Ingest</span>
          </Button>
        </div>
      </div>

      {/* KPI Micro Telemetry Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Pending Queue
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900">{metrics.pendingDocOrders}</span>
              <span className="text-xs text-rose-600 font-semibold">Requires clinical review</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Verified Today
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900">
                {doctorOrders.filter(o => o.status === 'verified' || o.status === 'completed').length}
              </span>
              <span className="text-xs text-emerald-700 font-semibold">+--% fulfillment rate</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Average SLA Turnaround
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900">--</span>
              <span className="text-xs text-slate-400">minutes per intake</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Search */}
      <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white">
        <CardContent className="p-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {[
              { id: 'pending', label: 'Pending Verification', count: metrics.pendingDocOrders },
              { id: 'verified', label: 'Verified', count: metrics.verifiedDocOrders },
              { id: 'completed', label: 'Picked Up / Completed', count: doctorOrders.filter(o => o.status === 'completed').length },
              { id: 'all', label: 'All Prescriptions', count: doctorOrders.length }
            ].map(tab => (
              <Button
                key={tab.id}
                size="sm"
                variant={activeFilter === tab.id ? "default" : "ghost"}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`rounded-xl font-semibold gap-2 cursor-pointer h-8 px-3.5 ${
                  activeFilter === tab.id
                    ? 'bg-emerald-800 text-white hover:bg-emerald-900 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold border-none ${
                    activeFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </Badge>
              </Button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <Input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search patient, doctor, or RX #..."
              className="w-full pl-8 pr-3 py-1.5 h-8 rounded-xl bg-slate-50 border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus-visible:bg-white focus-visible:border-emerald-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Master-Detail Split Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL: Prescription Queue (40% / 5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Queue ({filteredOrders.length})
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              Live Synced
            </span>
          </div>

          <div className="space-y-3">
            {filteredOrders.map(order => {
              const isSelected = activeOrder?.id === order.id;
              const isStat = order.priority === 'stat';
              const isPediatric = order.priority === 'pediatric';

              return (
                <Card
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs bg-white ${
                    isSelected
                      ? 'border-l-4 border-l-emerald-700 border-slate-300 ring-2 ring-emerald-600/20'
                      : 'border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">{order.patientName}</h3>
                        {isStat && (
                          <Badge variant="destructive" className="px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wide">
                            Stat
                          </Badge>
                        )}
                        {isPediatric && (
                          <Badge variant="secondary" className="px-1.5 py-0.2 text-[9px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wide border-none">
                            Pediatric
                          </Badge>
                        )}
                        {order.status === 'verified' && (
                          <Badge variant="outline" className="px-1.5 py-0.2 text-[9px] font-bold bg-emerald-50 text-emerald-800 border-emerald-200 uppercase tracking-wide">
                            Verified
                          </Badge>
                        )}
                        {order.status === 'completed' && (
                          <Badge variant="secondary" className="px-1.5 py-0.2 text-[9px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wide border-none">
                            Picked Up
                          </Badge>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 mt-0.5">
                        #{order.orderNumber} • {order.patientAge} yrs • {order.address}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="truncate max-w-[200px]">{order.doctorName}</span>
                    <span className="font-bold text-emerald-800">
                      {order.prescribedItems.length} Items (₦{order.totalAmount.toLocaleString()})
                    </span>
                  </div>
                </Card>
              );
            })}

            {filteredOrders.length === 0 && (
              <Card className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                No prescription orders match the selected tab.
              </Card>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Active Prescription Review & Clinical Verification Card (60% / 7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {activeOrder ? (
            <Card className="bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden py-0 gap-0">
              {/* Header Banner: Patient Demographics & Risk Warning */}
              <div className="p-6 bg-slate-50 border-b border-slate-200/70 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-xl font-bold text-slate-900">{activeOrder.patientName}</h2>
                      <Badge variant="outline" className="text-xs font-mono text-slate-600 bg-white border-slate-200">
                        {activeOrder.nhisNumber}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {activeOrder.patientAge} yrs • {activeOrder.patientGender} • {activeOrder.patientWeight} • Blood Group: {activeOrder.patientBloodGroup || 'Unknown'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={activeOrder.priority === 'stat' ? 'destructive' : 'secondary'}
                      className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                        activeOrder.priority === 'stat'
                          ? ''
                          : activeOrder.priority === 'pediatric'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {activeOrder.priority} Priority
                    </Badge>
                  </div>
                </div>

                {/* Critical Allergy Safeguard Alert */}
                {activeOrder.allergyAlert && (
                  <Alert variant="destructive" className="p-3 bg-rose-50 border-rose-200 text-rose-900 rounded-xl">
                    <Icon name="warning" className="text-rose-600 text-lg shrink-0 mt-0.5" />
                    <AlertTitle className="font-bold text-rose-800 text-xs mb-0">Critical Clinical Alert</AlertTitle>
                    <AlertDescription className="text-xs text-rose-700">
                      {activeOrder.allergyAlert}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Physician Authenticity Banner */}
              <div className="p-6 flex flex-col gap-6">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <Icon name="verified" className="text-xl" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{activeOrder.doctorName}</div>
                      <div className="text-[11px] text-slate-500">
                        {activeOrder.hospital} • {activeOrder.folioNumber} • {activeOrder.doctorContact}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => showToast('Digital Slip Loaded', `Displaying prescription #${activeOrder.orderNumber} cryptographic token`, 'info')}
                      className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium cursor-pointer gap-1"
                    >
                      <Icon name="description" className="text-sm" />
                      <span>View Slip</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => showToast('Doctor Hotline', `Dialing ${activeOrder.doctorName} at ${activeOrder.doctorContact}...`, 'info')}
                      className="rounded-xl border-slate-200 text-emerald-800 hover:bg-emerald-50 text-xs font-medium cursor-pointer gap-1"
                    >
                      <Icon name="call" className="text-sm" />
                      <span>Call Doctor</span>
                    </Button>
                  </div>
                </div>

                {/* Prescribed Medications List */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs">
                      Prescribed Formulations ({activeOrder.prescribedItems.length})
                    </h3>
                    <span className="text-[11px] text-slate-400">Target Pickup: {activeOrder.pickupDate}</span>
                  </div>

                  <div className="space-y-3">
                    {activeOrder.prescribedItems.map((item, idx) => (
                      <Card
                        key={idx}
                        className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-1.5 py-4"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-bold text-slate-900 text-sm">
                              {idx + 1}. {item.drugName}
                            </div>
                            <div className="text-xs text-emerald-700 font-medium mt-0.5">
                              {item.dosage}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {item.instructions}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-bold text-slate-900 text-sm">
                              ₦{(item.price * item.quantity).toLocaleString()}
                            </div>
                            <Badge variant="outline" className="text-[10px] text-emerald-700 font-semibold mt-0.5 bg-emerald-50 border-emerald-200">
                              Qty: {item.quantity} In Stock
                            </Badge>
                          </div>
                        </div>

                        {item.notes && (
                          <div className="text-[11px] text-slate-400 italic">
                            * {item.notes}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Clinical Pharmacist Interactive Verification Checklist */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-xs">
                      Clinical Dispensing Checklist
                    </span>
                    <Badge variant="secondary" className="text-xs text-slate-600 bg-white border-slate-200">
                      {Object.values(checklist).filter(Boolean).length} of 4 verified
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200">
                      <Checkbox
                        id="check-dosing"
                        checked={checklist.dosingVerified}
                        onCheckedChange={checked => setChecklist({ ...checklist, dosingVerified: checked === true })}
                      />
                      <Label htmlFor="check-dosing" className="text-slate-800 font-medium cursor-pointer text-xs">
                        Patient & Dosing verified
                      </Label>
                    </div>

                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200">
                      <Checkbox
                        id="check-allergies"
                        checked={checklist.allergiesCrossChecked}
                        onCheckedChange={checked => setChecklist({ ...checklist, allergiesCrossChecked: checked === true })}
                      />
                      <Label htmlFor="check-allergies" className="text-slate-800 font-medium cursor-pointer text-xs">
                        Allergies cross-checked
                      </Label>
                    </div>

                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200">
                      <Checkbox
                        id="check-inventory"
                        checked={checklist.inventoryReserved}
                        onCheckedChange={checked => setChecklist({ ...checklist, inventoryReserved: checked === true })}
                      />
                      <Label htmlFor="check-inventory" className="text-slate-800 font-medium cursor-pointer text-xs">
                        Inventory reserved in dispensary
                      </Label>
                    </div>

                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-emerald-300 ring-1 ring-emerald-500/20">
                      <Checkbox
                        id="check-pom"
                        checked={checklist.pomComplianceSignoff}
                        onCheckedChange={checked => setChecklist({ ...checklist, pomComplianceSignoff: checked === true })}
                      />
                      <Label htmlFor="check-pom" className="text-emerald-900 font-bold cursor-pointer text-xs">
                        PCN POM regulatory sign-off
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Clinical Pharmacist Notes Textarea */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pharmacist-notes" className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Clinical Pharmacist Verification Notes
                    </Label>
                    <span className="text-[11px] text-slate-400">Recorded on Patient Chart</span>
                  </div>
                  <Textarea
                    id="pharmacist-notes"
                    rows={2}
                    value={pharmacistNotes}
                    onChange={e => setPharmacistNotes(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white resize-none"
                  />
                </div>

                <Separator />

                {/* Financial Snapshot & Action Bar */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">
                      Total Gross (Prescription Tax Exempt)
                    </span>
                    <div className="text-xl font-bold text-slate-900">
                      ₦{activeOrder.totalAmount.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {activeOrder.status === 'pending' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const reason = prompt('Specify clarification question for Dr. ' + activeOrder.doctorName);
                            if (reason) showToast('Clarification Request Dispatched', `Transmitted inquiry to ${activeOrder.doctorEmail}`);
                          }}
                          className="rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                        >
                          Request Clarification
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (confirm('Reject this prescription order?')) {
                              rejectDoctorOrder(activeOrder.id, 'Clinical discrepancy');
                            }
                          }}
                          className="rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleVerifyAndSendToPos}
                          disabled={isVerifying}
                          className="rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-sm cursor-pointer gap-1.5"
                        >
                          <Icon name="check_circle" className="text-base" />
                          <span>{isVerifying ? 'Transmitting...' : 'Verify & Send to POS'}</span>
                        </Button>
                      </>
                    )}

                    {activeOrder.status === 'verified' && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => sendOrderToPos(activeOrder.id)}
                          className="rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 text-xs font-semibold cursor-pointer gap-1.5"
                        >
                          <Icon name="point_of_sale" className="text-base" />
                          <span>Push to POS Cart</span>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => pickupDoctorOrder(activeOrder.id)}
                          className="rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-sm cursor-pointer gap-1.5"
                        >
                          <Icon name="done_all" className="text-base" />
                          <span>Mark as Picked Up</span>
                        </Button>
                      </>
                    )}

                    {activeOrder.status === 'completed' && (
                      <Badge className="gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border-emerald-200 px-3 py-1.5 rounded-xl">
                        <Icon name="verified" className="text-sm" />
                        <span>Dispensed and Picked Up by Patient</span>
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
              Select an order from the queue to view clinical details.
            </Card>
          )}
        </div>
      </div>

      {/* New Order Modal */}
      <NewOrderModal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
      />
    </div>
  );
}
