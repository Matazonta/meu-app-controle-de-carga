/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CargoProvider } from './contexts/CargoContext';
import ProtectedRoute from './components/ProtectedRoute';
import StatusBanner from './components/StatusBanner';
import Login from './pages/Login';
import DriverDashboard from './pages/DriverDashboard';
import CargoRegistration from './pages/CargoRegistration';
import KMRegistration from './pages/KMRegistration';
import AdminDashboard from './pages/AdminDashboard';
import DriverManagement from './pages/DriverManagement';
import ExportConfig from './pages/ExportConfig';
import SuccessScreen from './pages/SuccessScreen';

export default function App() {
  return (
    <AuthProvider>
      <CargoProvider>
        <StatusBanner />
        <Router>
          <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Driver Routes */}
          <Route path="/driver/dashboard" element={
            <ProtectedRoute allowedType="driver">
              <DriverDashboard />
            </ProtectedRoute>
          } />
          <Route path="/driver/cargo" element={
            <ProtectedRoute allowedType="driver">
              <CargoRegistration />
            </ProtectedRoute>
          } />
          <Route path="/driver/km" element={
            <ProtectedRoute allowedType="driver">
              <KMRegistration />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/productivity" element={
            <ProtectedRoute allowedType="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/drivers" element={
            <ProtectedRoute allowedType="admin">
              <DriverManagement />
            </ProtectedRoute>
          } />
          <Route path="/export" element={
            <ProtectedRoute allowedType="admin">
              <ExportConfig />
            </ProtectedRoute>
          } />
          <Route path="/success" element={<SuccessScreen />} />
          
          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
      </CargoProvider>
    </AuthProvider>
  );
}
