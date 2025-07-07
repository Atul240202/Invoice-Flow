import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPasswordPage from './pages/ResetPassword';
import DashboardLayout from './layout/DashboardLayout';
import SettingsPage from './pages/Settings';
import DashBoard from './pages/DashBoard';  
import CreateInvoice from './pages/CreateInvoice';
import ClientManagement from './pages/ClientManagement';
import AddEditClient from './pages/EditClient';
// You can import other pages like Reports, Clients, etc., as needed.

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Dashboard Routes with Layout */}
        <Route path="/" element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashBoard />} />
          <Route path="/settings"  element={<SettingsPage />} />
          <Route path="/create-invoice" element={<CreateInvoice />} />
          <Route path="/clients" element={<ClientManagement />} />
          <Route path="clients/new" element={<AddEditClient />} />
          <Route path="clients/:id/edit" element={<AddEditClient />} />
          {/* Add more nested routes here */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
