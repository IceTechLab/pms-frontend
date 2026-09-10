'use client';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePharmacy } from '@/lib/store';
import { UserRole } from '@/lib/types';
import { Icon } from '@/components/ui/icon';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LoginPage() {
  const navigate = useNavigate();
  const { users, setCurrentUser, showToast } = usePharmacy();

  const [activeTab, setActiveTab] = useState<'staff' | 'doctor'>('staff');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      showToast('Welcome back', `Signed in as ${user.name} (${user.role})`);
      if (user.role === 'doctor') {
        navigate('/doctor-orders');
      } else {
        navigate('/pos');
      }
    } else {
      showToast('Login Failed', 'No account found with that email address.', 'error');
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    const user = users.find(u => u.role === role) || users[0];
    setCurrentUser(user);
    showToast('Quick Demo Access', `Active shift authorized as ${user.name} (${user.role})`);
    if (role === 'doctor') {
      navigate('/doctor-orders');
    } else {
      navigate('/pos');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background soft ambient glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-100 rounded-full blur-3xl pointer-events-none opacity-60"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-100 rounded-full blur-3xl pointer-events-none opacity-60"></div>

      <Card className="rounded-3xl border-slate-200/90 shadow-xl max-w-md w-full overflow-hidden z-10 p-0 gap-0">
        {/* Brand Banner */}
        <div className="bg-emerald-800 text-white p-8 text-center relative">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Icon name="local_pharmacy" className="text-3xl text-emerald-200" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">PharmaCare Nigeria</h1>
          <p className="text-xs text-emerald-200 mt-1 flex items-center justify-center gap-1.5">
            <span>Clinical Pharmacy Operating System</span>
            <span>•</span>
            <Badge variant="outline" className="bg-emerald-900/50 text-emerald-200 border-emerald-700/60 text-[10px] py-0 px-1.5">v2.4 Live</Badge>
          </p>
        </div>

        {/* Tab switch */}
        <CardContent className="p-6">
          <Tabs
            value={activeTab}
            onValueChange={(val) => {
              const tab = val as 'staff' | 'doctor';
              setActiveTab(tab);
              setEmail('');
            }}
            className="w-full mb-6"
          >
            <TabsList className="w-full bg-slate-100 p-1 rounded-2xl h-auto grid grid-cols-2">
              <TabsTrigger
                value="staff"
                className="py-2 rounded-xl text-xs font-semibold data-active:bg-white data-active:text-slate-900 data-active:shadow-xs text-slate-500"
              >
                Pharmacist / Staff
              </TabsTrigger>
              <TabsTrigger
                value="doctor"
                className="py-2 rounded-xl text-xs font-semibold data-active:bg-white data-active:text-slate-900 data-active:shadow-xs text-slate-500"
              >
                Prescribing Doctor
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Authorized Email Address
              </Label>
              <Input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="rounded-xl border-slate-200 text-slate-900 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Security Password
              </Label>
              <Input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="rounded-xl border-slate-200 text-slate-900 font-mono"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md mt-2 gap-1.5"
            >
              <Icon name="login" className="text-base" />
              <span>Sign In to Dispensary</span>
            </Button>
          </form>

          {/* Quick 1-Click Role Logins */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center mb-2.5">
              Quick Access by Role
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleQuickLogin('pharmacist')}
                className="p-2 h-auto rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-semibold border-purple-200 justify-center gap-1 text-[11px]"
              >
                <span>Pharmacist</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleQuickLogin('assistantPharmacist')}
                className="p-2 h-auto rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 font-semibold border-blue-200 justify-center gap-1 text-[11px]"
              >
                <span>Assistant Pharmacist</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleQuickLogin('cashier')}
                className="p-2 h-auto rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-semibold border-emerald-200 justify-center gap-1 text-[11px]"
              >
                <span>POS Cashier</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleQuickLogin('doctor')}
                className="p-2 h-auto rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold border-slate-300 justify-center gap-1 text-[11px]"
              >
                <span>Doctor</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
