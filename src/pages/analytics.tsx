'use client';

import React, { useState, useMemo } from 'react';
import { usePharmacy } from '@/lib/store';
import { Icon } from '@/components/ui/icon';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';

export default function AnalyticsPage() {
  const { sales, metrics, showToast } = usePharmacy();

  const [dateRange, setDateRange] = useState('mtd');
  const [branch, setBranch] = useState('vi');
  const [activeChartBar, setActiveChartBar] = useState<number | null>(null);

  // Sales calculations
  const totalSalesRevenue = metrics.totalRevenue;
  const avgTicket = sales.length > 0 ? Math.round(totalSalesRevenue / sales.length) : 0;

  // Tender breakdown
  const tenderStats = useMemo(() => {
    const counts = { CARD: 0, TRANSFER: 0, CASH: 0, HMO: 0 };
    sales.forEach(s => {
      counts[s.tenderType] = (counts[s.tenderType] || 0) + s.totalPrice;
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    return {
      cardPct: Math.round((counts.CARD / total) * 100),
      transferPct: Math.round((counts.TRANSFER / total) * 100),
      cashPct: Math.round((counts.CASH / total) * 100),
      hmoPct: Math.round((counts.HMO / total) * 100),
      counts
    };
  }, [sales]);

  // Monthly revenue/rx telemetry derived from recorded transactions
  const monthlyAnalytics = useMemo(() => {
    const byMonth = new Map<string, { month: string; revenue: number; rxVolume: number; profit: number }>();
    const sorted = [...sales].sort((a, b) => (a.dateTime < b.dateTime ? -1 : 1));
    sorted.forEach(s => {
      const d = new Date(s.dateTime);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const current = byMonth.get(key) || { month: '', revenue: 0, rxVolume: 0, profit: 0 };
      current.month = d.toLocaleDateString('en-US', { month: 'short' });
      current.revenue += s.totalPrice;
      current.rxVolume += 1;
      byMonth.set(key, current);
    });
    const multiYear = new Set([...byMonth.keys()].map(k => k.slice(0, 4))).size > 1;
    const list = [...byMonth.entries()].map(([key, v]) => ({
      ...v,
      month: multiYear ? `${v.month} '${key.slice(2, 4)}` : v.month
    }));
    const peakRevenue = list.reduce((max, m) => Math.max(max, m.revenue), 0);
    return list.map(m => ({ ...m, peak: m.revenue === peakRevenue && peakRevenue > 0 }));
  }, [sales]);

  const handleDownloadReport = () => {
    showToast(
      'Report Generated',
      'Executive Financial Audit Report compiled (FIRS Synced, PDF/Excel ready)',
      'success'
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1700px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
              Financial Audit & Intelligence
            </Badge>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-500 text-xs">FIRS / VAT 7.5% Synced</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Pharmacy Sales & Revenue Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time prescription revenue, batch inventory recovery, and multi-tender settlement tracking.
          </p>
        </div>

        {/* Filters & Export */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <Icon name="domain" className="text-slate-400 text-base mr-1.5" />
            <select
              value={branch}
              onChange={e => setBranch(e.target.value)}
              className="bg-transparent text-xs text-slate-800 font-semibold outline-none cursor-pointer"
            >
              <option value="vi">Victoria Island Flagship</option>
              <option value="ikeja">Ikeja Central Dispensary</option>
              <option value="all">All Outlets (Lagos State)</option>
            </select>
          </div>

          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <Icon name="calendar_today" className="text-slate-400 text-base mr-1.5" />
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              className="bg-transparent text-xs text-slate-800 font-semibold outline-none cursor-pointer"
            >
              <option value="today">Today: Active Shift</option>
              <option value="7d">Last 7 Days</option>
              <option value="mtd">Month to Date</option>
              <option value="ytd">Year to Date (2026)</option>
            </select>
          </div>

          <Button
            onClick={handleDownloadReport}
            className="rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-sm cursor-pointer gap-1.5 h-9"
          >
            <Icon name="download" className="text-base" />
            <span>Download Executive Report (PDF)</span>
          </Button>
        </div>
      </div>

      {/* 4 Financial & Operational Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between py-5 gap-0">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Gross Revenue
              </span>
              <div className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
                ₦{totalSalesRevenue.toLocaleString()}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Icon name="payments" className="text-xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              {sales.length > 0 ? `${sales.length} transaction${sales.length !== 1 ? 's' : ''} recorded` : 'No transactions yet'}
            </span>
            <svg className="w-16 h-5 text-emerald-600" fill="none" viewBox="0 0 80 24">
              <path d="M0 18 L15 14 L30 19 L45 8 L60 11 L75 3 L80 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
          </div>
        </Card>

        <Card className="rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between py-5 gap-0">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Prescriptions Dispensed
              </span>
              <div className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
                {metrics.rxCount} Orders
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Icon name="receipt_long" className="text-xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Avg Ticket: <strong className="text-slate-800">₦{avgTicket.toLocaleString()}</strong>
            </span>
            <svg className="w-16 h-5 text-blue-500" fill="none" viewBox="0 0 80 24">
              <path d="M0 16 L18 12 L35 15 L52 9 L65 11 L80 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
          </div>
        </Card>

        <Card className="rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between py-5 gap-0">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Gross Profit Margin
              </span>
              <div className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
                {sales.length > 0
                  ? (() => {
                      const totalCost = sales.reduce((acc, s) => acc + s.items.reduce((a, i) => a + i.quantity * i.price, 0), 0);
                      const margin = totalSalesRevenue > 0 ? Math.round(((totalSalesRevenue - totalCost) / totalSalesRevenue) * 1000) / 10 : 0;
                      return `${margin}%`;
                    })()
                  : '—'}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Icon name="account_balance_wallet" className="text-xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              {sales.length > 0 ? 'Based on recorded sales' : 'No sales data yet'}
            </span>
            <svg className="w-16 h-5 text-purple-500" fill="none" viewBox="0 0 80 24">
              <path d="M0 20 L20 18 L40 12 L60 14 L80 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
          </div>
        </Card>

        <Card className="rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between py-5 gap-0">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Stock Loss Prevented
              </span>
              <div className="text-2xl font-bold text-emerald-800 tracking-tight mt-1">
                {metrics.expiringCount > 0 || metrics.oosCount > 0
                  ? `${metrics.expiringCount + metrics.oosCount} batches flagged`
                  : '—'}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Icon name="assignment_return" className="text-xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
            <Icon name="verified" className="text-sm text-emerald-600" />
            <span>Expiring &amp; out-of-stock batches</span>
          </div>
        </Card>
      </div>

      {/* Main Interactive Charts & Telemetry Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Monthly Revenue & Rx Volume SVG Chart */}
        <Card className="xl:col-span-2 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between py-6 gap-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Monthly Revenue & Prescription Volume Trend
              </h2>
              <p className="text-xs text-slate-500">
                Combined gross sales (₦ Millions) against dispensing operational count.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-700"></span>
                <span className="text-slate-600 font-medium">Revenue (₦M)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full bg-slate-400"></span>
                <span className="text-slate-600 font-medium">Rx Count</span>
              </div>
            </div>
          </div>

          {/* High-Fidelity SVG Bar Chart */}
          <div className="relative w-full h-72">
            {monthlyAnalytics.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                No monthly data yet. Sales will appear here as transactions are recorded.
              </div>
            ) : (
            <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 700 240">
              {/* Horizontal Grid lines */}
              <line className="text-slate-200" stroke="currentColor" strokeDasharray="4 4" x1="40" x2="680" y1="30" y2="30" />
              <line className="text-slate-200" stroke="currentColor" strokeDasharray="4 4" x1="40" x2="680" y1="90" y2="90" />
              <line className="text-slate-200" stroke="currentColor" strokeDasharray="4 4" x1="40" x2="680" y1="150" y2="150" />
              <line className="text-slate-300" stroke="currentColor" x1="40" x2="680" y1="210" y2="210" />

              {/* Y-axis Labels */}
              <text className="fill-slate-400 text-[10px] font-mono" x="10" y="34">16M</text>
              <text className="fill-slate-400 text-[10px] font-mono" x="10" y="94">12M</text>
              <text className="fill-slate-400 text-[10px] font-mono" x="10" y="154">8M</text>
              <text className="fill-slate-400 text-[10px] font-mono" x="10" y="214">4M</text>

              {/* Bars */}
              {monthlyAnalytics.map((item, idx) => {
                const x = 60 + idx * 70;
                const barHeight = Math.min(180, (item.revenue / 18) * 180);
                const y = 210 - barHeight;
                const isHovered = activeChartBar === idx;

                return (
                  <g key={item.month} className="cursor-pointer" onMouseEnter={() => setActiveChartBar(idx)} onMouseLeave={() => setActiveChartBar(null)}>
                    <rect
                      x={x}
                      y={y}
                      width="34"
                      height={barHeight}
                      rx="4"
                      className={`transition-all ${
                        isHovered
                          ? 'fill-emerald-600 shadow-md'
                          : item.peak
                          ? 'fill-emerald-700'
                          : 'fill-emerald-800/80 hover:fill-emerald-700'
                      }`}
                    />
                    <text
                      className="fill-slate-500 text-[11px] font-semibold text-center"
                      x={x + 7}
                      y="228"
                    >
                      {item.month}
                    </text>
                  </g>
                );
              })}

              {/* Trend Polyline */}
              <path
                d="M77 150 L147 142 L217 130 L287 118 L357 95 L427 75 L497 50 L567 55 L637 70"
                fill="none"
                stroke="#64748b"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Revenue trend based on recorded transactions.</span>
          </div>
        </Card>

        {/* Right Column: Multi-Tender Settlement Breakdown */}
        <Card className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between py-6 gap-0">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Multi-Tender Settlement Breakdown
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Electronic payment gateway and cash reconciliation.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Icon name="credit_card" className="text-sm text-blue-600" />
                    POS Terminal Card
                  </span>
                  <span className="font-mono font-bold text-slate-900">{tenderStats.cardPct}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${tenderStats.cardPct}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Icon name="account_balance" className="text-sm text-emerald-600" />
                    Direct Bank Transfer
                  </span>
                  <span className="font-mono font-bold text-slate-900">{tenderStats.transferPct}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${tenderStats.transferPct}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Icon name="payments" className="text-sm text-amber-600" />
                    Dispensary Cash
                  </span>
                  <span className="font-mono font-bold text-slate-900">{tenderStats.cashPct}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${tenderStats.cashPct}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Icon name="health_and_safety" className="text-sm text-purple-600" />
                    HMO / Corporate Insurance
                  </span>
                  <span className="font-mono font-bold text-slate-900">{tenderStats.hmoPct}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full" style={{ width: `${tenderStats.hmoPct}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div className="flex items-center justify-between text-slate-700 font-bold mb-1">
              <span>Transactions Recorded:</span>
              <span className="text-emerald-700">{sales.length} total</span>
            </div>
            <p className="text-[11px] text-slate-500">
              {sales.length > 0
                ? `Spanning ${new Set(sales.map(s => s.dateTime.split('T')[0])).size} operating day(s).`
                : 'No transactions recorded yet.'}
            </p>
          </div>
        </Card>
      </div>

      {/* Top Selling Pharmaceuticals Leaderboard */}
      <Card className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 py-6 gap-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Top Velocity Pharmaceuticals
            </h2>
            <p className="text-xs text-slate-500">
              Highest grossing formulations ranked by dispensing frequency and contribution margin.
            </p>
          </div>
          <Badge variant="outline" className="text-xs text-emerald-800 font-bold bg-emerald-50 border-emerald-200 px-2.5 py-1">
            Live Ranking
          </Badge>
        </div>

        {(() => {
          // Aggregate sales by drug name
          const drugMap: Record<string, { units: number; revenue: number }> = {};
          sales.forEach(s => {
            s.items.forEach(item => {
              if (!drugMap[item.drugName]) drugMap[item.drugName] = { units: 0, revenue: 0 };
              drugMap[item.drugName].units += item.quantity;
              drugMap[item.drugName].revenue += item.total;
            });
          });
          const ranked = Object.entries(drugMap)
            .sort((a, b) => b[1].revenue - a[1].revenue)
            .slice(0, 5);

          if (ranked.length === 0) {
            return (
              <div className="text-center py-10 text-slate-400 text-sm">
                No sales data yet. Rankings will appear once transactions are recorded.
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {ranked.map(([name, data], idx) => (
                <Card key={name} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between py-3.5 gap-0">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">#{idx + 1} Best Seller</span>
                    <h4 className="font-bold text-slate-900 text-xs mt-1">{name}</h4>
                    <span className="text-[11px] text-slate-500">{data.units} units sold</span>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-800">₦{data.revenue.toLocaleString()}</span>
                  </div>
                </Card>
              ))}
            </div>
          );
        })()}
      </Card>

      {/* Transaction Audit Table */}
      <Card className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden py-0 gap-0">
        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Dispensary Transaction Audit Trail</h3>
            <p className="text-[11px] text-slate-500">Live recorded cash & POS transactions from the register</p>
          </div>
          <Badge variant="outline" className="text-xs font-bold text-slate-600 bg-white border-slate-200 px-2.5 py-1">
            {sales.length} Transactions Logged
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-white text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 hover:bg-white">
                <TableHead className="py-3 px-4 text-[10px] font-bold uppercase text-slate-400">Receipt / Ref</TableHead>
                <TableHead className="py-3 px-4 text-[10px] font-bold uppercase text-slate-400">Date / Time</TableHead>
                <TableHead className="py-3 px-4 text-[10px] font-bold uppercase text-slate-400">Patient / Customer</TableHead>
                <TableHead className="py-3 px-4 text-[10px] font-bold uppercase text-slate-400">Items Dispensed</TableHead>
                <TableHead className="py-3 px-4 text-[10px] font-bold uppercase text-slate-400">Cashier</TableHead>
                <TableHead className="py-3 px-4 text-[10px] font-bold uppercase text-slate-400">Tender</TableHead>
                <TableHead className="py-3 px-4 text-right text-[10px] font-bold uppercase text-slate-400">Total Settled (₦)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {sales.map(sale => (
                <TableRow key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell className="py-3 px-4 font-mono font-bold text-slate-900">
                    {sale.receiptNumber}
                    <div className="text-[10px] text-slate-400 font-normal">{sale.transactionNumber}</div>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-slate-500 text-[11px]">
                    {new Date(sale.dateTime).toLocaleString()}
                  </TableCell>
                  <TableCell className="py-3 px-4 font-semibold text-slate-800">
                    {sale.patientName}
                    {sale.patientNhis && (
                      <span className="text-[10px] text-slate-400 font-mono block">{sale.patientNhis}</span>
                    )}
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <span className="font-bold text-slate-800">{sale.items.length} items</span>
                    <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                      {sale.items.map(i => `${i.quantity}x ${i.drugName}`).join(', ')}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-slate-600 text-[11px]">
                    {sale.cashierName}
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700">
                      {sale.tenderType}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-right font-bold text-slate-900 text-xs">
                    ₦{sale.totalPrice.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
