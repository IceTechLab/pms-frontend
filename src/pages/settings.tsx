'use client';

import React, { useState } from 'react';
import { usePharmacy } from '@/lib/store';
import { AddUserModal } from '@/components/modals/add-user-modal';
import { UserRole } from '@/lib/types';
import { Icon } from '@/components/ui/icon';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';

export default function SettingsPage() {
  const {
    users,
    deleteUser,
    currentUser,
    switchRole,
    showToast
  } = usePharmacy();

  const [activeTab, setActiveTab] = useState<'staff' | 'doctors' | 'branch'>('staff');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // Pharmacy Branch Configuration state
  const [branchConfig, setBranchConfig] = useState({
    name: 'PharmaCare NG (Victoria Island Flagship)',
    address: 'Plot 14B, Adeola Odeku Street, Victoria Island, Lagos State',
    pcnLicense: '0492-LG',
    tin: '10492819-0001',
    vatRate: 7.5,
    currency: 'NGN (₦)',
    operatingHours: '24 Hours Emergency Dispensary'
  });

  const staffUsers = users.filter(u => u.role !== 'doctor');
  const doctorUsers = users.filter(u => u.role === 'doctor');

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Settings Saved', 'Pharmacy dispensary tax & branch credentials updated', 'success');
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1700px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
              Administration & System Governance
            </Badge>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-500 text-xs">Role-Based Access Control</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Settings & User Accounts Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure dispensary credentials, tax rates, pharmacist authorization levels, and prescribing physician accounts.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsAddUserOpen(true)}
          className="gap-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold transition-all shadow-sm self-start md:self-auto h-9"
        >
          <Icon name="person_add" className="text-base" />
          <span>Add New Account</span>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
        <div className="border-b border-slate-200 pb-2">
          <TabsList className="bg-slate-100 p-1 rounded-xl h-auto flex flex-wrap gap-1">
            <TabsTrigger
              value="staff"
              className="rounded-lg px-3.5 py-1.5 text-xs font-bold data-active:bg-emerald-800 data-active:text-white"
            >
              Dispensary Staff Accounts ({staffUsers.length})
            </TabsTrigger>
            <TabsTrigger
              value="doctors"
              className="rounded-lg px-3.5 py-1.5 text-xs font-bold data-active:bg-emerald-800 data-active:text-white"
            >
              Prescribing Physicians ({doctorUsers.length})
            </TabsTrigger>
            <TabsTrigger
              value="branch"
              className="rounded-lg px-3.5 py-1.5 text-xs font-bold data-active:bg-emerald-800 data-active:text-white"
            >
              Branch Configuration & Tax (VAT 7.5%)
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Staff Accounts */}
        <TabsContent value="staff" className="mt-4">
          <Card className="rounded-3xl border-slate-200/90 shadow-sm overflow-hidden p-0">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Authorized Dispensary Roles (Chief Pharmacists, Assistants, Cashiers)
              </h3>
              <span className="text-[11px] text-slate-500">
                Active Shift: <strong>{currentUser.name}</strong>
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {staffUsers.map(user => {
                const isCurrent = currentUser.id === user.id;

                return (
                  <div key={user.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="w-10 h-10 ring-2 ring-slate-200 shrink-0">
                        {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                        <AvatarFallback className="bg-emerald-800 text-white font-bold text-xs">
                          {user.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm truncate">{user.name}</h4>
                          {isCurrent && (
                            <Badge variant="outline" className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border-emerald-200">
                              Current Active Session
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                          <span className="font-mono">{user.email}</span>
                          <span>•</span>
                          <span>{user.contact}</span>
                          {user.nic && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-slate-400">{user.nic}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={`text-xs font-bold capitalize ${
                          user.role === 'pharmacist'
                            ? 'bg-purple-100 text-purple-800 border-purple-200'
                            : user.role === 'assistantPharmacist'
                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                            : 'bg-slate-100 text-slate-800 border-slate-200'
                        }`}
                      >
                        {user.role}
                      </Badge>

                      {!isCurrent && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => switchRole(user.role as UserRole)}
                          className="rounded-xl border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 h-8"
                        >
                          Switch To Shift
                        </Button>
                      )}

                      {staffUsers.length > 1 && !isCurrent && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm(`Delete account for ${user.name}?`)) {
                              deleteUser(user.id);
                            }
                          }}
                          className="h-8 w-8 text-slate-400 hover:text-rose-600"
                        >
                          <Icon name="delete" className="text-base" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        {/* Tab 2: Doctor Accounts */}
        <TabsContent value="doctors" className="mt-4">
          <Card className="rounded-3xl border-slate-200/90 shadow-sm overflow-hidden p-0">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Credentialed Tele-Medicine & Hospital Prescribers
              </h3>
              <span className="text-[11px] text-slate-500">
                MDCN Verification: 100% Passed
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {doctorUsers.map(doc => (
                <div key={doc.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="w-10 h-10 ring-2 ring-slate-200 shrink-0">
                      {doc.avatar && <AvatarImage src={doc.avatar} alt={doc.name} />}
                      <AvatarFallback className="bg-blue-700 text-white font-bold text-xs">
                        {doc.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{doc.name}</h4>
                        <Icon name="verified" className="text-emerald-600 text-sm" title="MDCN Verified Physician" />
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                        <span className="font-mono">{doc.email}</span>
                        <span>•</span>
                        <span>{doc.contact}</span>
                        <span>•</span>
                        <span className="font-mono text-emerald-700 font-bold">{doc.docId || 'MDCN-54821'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs font-bold bg-blue-50 text-blue-800 border-blue-200">
                      Physician Prescriber
                    </Badge>

                    {doctorUsers.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`Remove physician credentials for ${doc.name}?`)) {
                            deleteUser(doc.id);
                          }
                        }}
                        className="h-8 w-8 text-slate-400 hover:text-rose-600"
                      >
                        <Icon name="delete" className="text-base" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Tab 3: Branch & Tax Configuration */}
        <TabsContent value="branch" className="mt-4">
          <Card className="rounded-3xl border-slate-200/90 shadow-sm p-6 max-w-2xl">
            <form onSubmit={handleSaveConfig}>
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
                Dispensary Facility & Tax Configuration
              </h3>

              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <Label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    Pharmacy Name & Branch Title
                  </Label>
                  <Input
                    type="text"
                    value={branchConfig.name}
                    onChange={e => setBranchConfig({ ...branchConfig, name: e.target.value })}
                    className="rounded-xl border-slate-200 text-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    Physical Dispensary Address
                  </Label>
                  <Input
                    type="text"
                    value={branchConfig.address}
                    onChange={e => setBranchConfig({ ...branchConfig, address: e.target.value })}
                    className="rounded-xl border-slate-200 text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                      Pharmacists Council License # (PCN)
                    </Label>
                    <Input
                      type="text"
                      value={branchConfig.pcnLicense}
                      onChange={e => setBranchConfig({ ...branchConfig, pcnLicense: e.target.value })}
                      className="rounded-xl border-slate-200 text-slate-900 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                      Tax Identification Number (TIN)
                    </Label>
                    <Input
                      type="text"
                      value={branchConfig.tin}
                      onChange={e => setBranchConfig({ ...branchConfig, tin: e.target.value })}
                      className="rounded-xl border-slate-200 text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                      Standard VAT Rate (%)
                    </Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={branchConfig.vatRate}
                      onChange={e => setBranchConfig({ ...branchConfig, vatRate: Number(e.target.value) })}
                      className="rounded-xl border-slate-200 text-slate-900 font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                      Operating Currency Symbol
                    </Label>
                    <Input
                      type="text"
                      value={branchConfig.currency}
                      onChange={e => setBranchConfig({ ...branchConfig, currency: e.target.value })}
                      className="rounded-xl border-slate-200 text-slate-900 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    Dispensary Shift Hours
                  </Label>
                  <Input
                    type="text"
                    value={branchConfig.operatingHours}
                    onChange={e => setBranchConfig({ ...branchConfig, operatingHours: e.target.value })}
                    className="rounded-xl border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  className="gap-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold shadow-sm h-9"
                >
                  <Icon name="save" className="text-base" />
                  <span>Save Facility Configuration</span>
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
      />
    </div>
  );
}
