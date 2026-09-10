import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/app-shell';
import DashboardPage from '@/pages/dashboard';
import LoginPage from '@/pages/login';
import PosPage from '@/pages/pos';
import InventoryPage from '@/pages/inventory';
import DoctorOrdersPage from '@/pages/doctor-orders';
import AnalyticsPage from '@/pages/analytics';
import SuppliersPage from '@/pages/suppliers';
import SettingsPage from '@/pages/settings';

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<DashboardPage />} />
        <Route path="/pos" element={<PosPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/doctor-orders" element={<DoctorOrdersPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
