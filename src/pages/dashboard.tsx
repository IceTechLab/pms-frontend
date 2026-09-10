'use client';

import React from 'react';
import { Link } from 'react-router-dom';
import { usePharmacy } from '@/lib/store';
import { Icon } from '@/components/ui/icon';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';

export default function DashboardPage() {
  const { metrics, sales, doctorOrders, inventory, currentUser } = usePharmacy();

  return (
    <div className="flex flex-col gap-8 max-w-[1700px] mx-auto">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-800 text-white p-8 relative overflow-hidden shadow-lg">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 text-xs font-semibold mb-3 border border-white/10">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Victoria Island Flagship Dispensary • System v2.4 Live</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {currentUser.name}
          </h1>
          <p className="text-emerald-100/90 text-sm mt-2 leading-relaxed">
            PharmaCare Dispensary operating system is online. Monitor drug batch shelf-life countdowns, verify incoming tele-prescriptions, and process rapid Point of Sale checkouts.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/pos"
              className={buttonVariants({
                className: "bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl px-5 h-10 font-bold shadow-sm"
              })}
            >
              <Icon name="point_of_sale" className="text-base mr-1.5" />
              Launch Point of Sale (POS)
            </Link>
            <Link
              to="/doctor-orders"
              className={buttonVariants({
                variant: "outline",
                className: "border-emerald-500/40 bg-emerald-700/80 text-white hover:bg-emerald-700 rounded-xl px-5 h-10 font-bold"
              })}
            >
              <Icon name="clinical_notes" className="text-base mr-1.5" />
              Review Prescriptions ({metrics.pendingDocOrders})
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Micro Telemetry Grid using shadcn Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Gross Revenue
              </span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                ₦{metrics.totalRevenue.toLocaleString()}
              </div>
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                <Icon name="trending_up" className="text-sm" />
                <span>{sales.length} transaction{sales.length !== 1 ? 's' : ''}</span>
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Icon name="payments" className="text-2xl" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Prescription Orders
              </span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {metrics.rxCount} <span className="text-xs font-normal text-slate-400">dispensed</span>
              </div>
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                <Icon name="check_circle" className="text-sm" />
                <span>{metrics.pendingDocOrders} awaiting review</span>
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Icon name="clinical_notes" className="text-2xl" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Expiring Soon
              </span>
              <div className="text-2xl font-bold text-amber-700 mt-1">
                {metrics.expiringCount} Batches
              </div>
              <span className="text-xs text-amber-700 font-semibold flex items-center gap-1 mt-1">
                <Icon name="schedule" className="text-sm" />
                <span>&lt;60 days shelf life</span>
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Icon name="warning" className="text-2xl" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Inventory Value
              </span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                ₦{metrics.totalInventoryValue.toLocaleString()}
              </div>
              <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <Icon name="verified" className="text-sm text-emerald-600" />
                <span>{inventory.length} formulations</span>
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Icon name="inventory_2" className="text-2xl" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4 Core Module Launchpads using shadcn Cards */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-4">Core Clinical Operational Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Link to="/pos" className="group">
            <Card className="h-full rounded-3xl border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-600/40 transition-all bg-white flex flex-col justify-between p-5">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Icon name="point_of_sale" className="text-xl" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-800 transition-colors">
                  Point of Sale (POS)
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Fast barcode scanning, drug formulations, multi-tender payments (Cash, Card, Transfer), and instant receipt printing.
                </p>
              </div>
              <span className="text-xs text-emerald-700 font-bold mt-4 flex items-center gap-1">
                <span>Open Register</span>
                <Icon name="arrow_forward" className="text-sm" />
              </span>
            </Card>
          </Link>

          <Link to="/inventory" className="group">
            <Card className="h-full rounded-3xl border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-600/40 transition-all bg-white flex flex-col justify-between p-5">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Icon name="inventory_2" className="text-xl" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-800 transition-colors">
                  Inventory & Shelf Life
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Batch number tracking, shelf locations, expiration countdowns, and automated return claims to suppliers.
                </p>
              </div>
              <span className="text-xs text-blue-700 font-bold mt-4 flex items-center gap-1">
                <span>Manage Stock</span>
                <Icon name="arrow_forward" className="text-sm" />
              </span>
            </Card>
          </Link>

          <Link to="/doctor-orders" className="group">
            <Card className="h-full rounded-3xl border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-600/40 transition-all bg-white flex flex-col justify-between p-5">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Icon name="clinical_notes" className="text-xl" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-purple-800 transition-colors">
                  Doctor Prescriptions
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Clinical safety checks, beta-lactam allergy safeguards, POM regulatory sign-offs, and push-to-POS dispensing.
                </p>
              </div>
              <span className="text-xs text-purple-700 font-bold mt-4 flex items-center gap-1">
                <span>Review Queue ({metrics.pendingDocOrders})</span>
                <Icon name="arrow_forward" className="text-sm" />
              </span>
            </Card>
          </Link>

          <Link to="/analytics" className="group">
            <Card className="h-full rounded-3xl border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-600/40 transition-all bg-white flex flex-col justify-between p-5">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Icon name="monitoring" className="text-xl" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-amber-800 transition-colors">
                  Revenue & Analytics
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Sales telemetry, FIRS VAT 7.5% audit reports, seasonal malaria surge monitoring, and cashier reconciliation.
                </p>
              </div>
              <span className="text-xs text-amber-700 font-bold mt-4 flex items-center gap-1">
                <span>View Financials</span>
                <Icon name="arrow_forward" className="text-sm" />
              </span>
            </Card>
          </Link>
        </div>
      </div>

      {/* Two-Column Activity & Prescriptions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Prescriptions Pending Verification (7 cols) */}
        <Card className="lg:col-span-7 rounded-3xl border-slate-200/90 shadow-sm bg-white">
          <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900">Live Prescription Intake Queue</CardTitle>
              <CardDescription className="text-xs text-slate-500">Tele-prescriptions awaiting clinical pharmacist validation</CardDescription>
            </div>
            <Link
              to="/doctor-orders"
              className="text-xs text-emerald-800 font-bold hover:underline"
            >
              View Full Queue
            </Link>
          </CardHeader>

          <CardContent className="p-6 pt-3 space-y-3">
            {doctorOrders.slice(0, 3).map(order => (
              <div
                key={order.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{order.patientName}</span>
                    <Badge variant="outline" className="font-mono text-[10px] bg-slate-200/70 text-slate-700 border-none">
                      #{order.orderNumber}
                    </Badge>
                    {order.priority === 'stat' && (
                      <Badge variant="destructive" className="text-[10px] uppercase font-bold">
                        Stat
                      </Badge>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {order.doctorName} • {order.prescribedItems.length} items • Total: ₦{order.totalAmount.toLocaleString()}
                  </div>
                </div>

                <Link
                  to="/doctor-orders"
                  className={buttonVariants({
                    size: "sm",
                    className: "bg-emerald-800 text-white hover:bg-emerald-900 rounded-xl font-semibold text-xs h-8"
                  })}
                >
                  Verify
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Right Column: Recent Sales Activity (5 cols) */}
        <Card className="lg:col-span-5 rounded-3xl border-slate-200/90 shadow-sm bg-white">
          <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900">Dispensary Sales Feed</CardTitle>
              <CardDescription className="text-xs text-slate-500">Latest completed register transactions</CardDescription>
            </div>
            <Link
              to="/analytics"
              className="text-xs text-emerald-800 font-bold hover:underline"
            >
              Audit Trail
            </Link>
          </CardHeader>

          <CardContent className="p-6 pt-3 space-y-3">
            {sales.slice(0, 4).map(sale => (
              <div
                key={sale.id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-900">{sale.patientName}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {sale.receiptNumber} • {sale.tenderType}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">₦{sale.totalPrice.toLocaleString()}</div>
                  <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-200 font-semibold mt-0.5">
                    Settled
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
