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
import InvoiceHistory from './pages/ClientHistory';
import ClientDetails from './pages/ClientDetails';
import BankingPreviewStep from './components/invoice/BankingPreviewStep';
import { Toaster } from "sonner";
import ExpenseTracker from './pages/ClientExpenses';
import Reports from './pages/Reports';


function App() {
  return (
    <Router>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        <Route path="/" element={<DashboardLayout />}>
  <Route path="dashboard" element={<DashBoard />} />
  <Route path="create-invoice" element={<CreateInvoice />} />
  <Route path="create-invoice/:id/edit" element={<CreateInvoice />} />
  <Route path="clients" element={<ClientManagement />} />
  <Route path="clients/new" element={<AddEditClient />} />
  <Route path="clients/:id" element={<ClientDetails />} />
  <Route path="clients/:id/edit" element={<AddEditClient />} />
  <Route path="invoices" element={<InvoiceHistory />} />
  <Route path="invoices/:id/preview" element={<BankingPreviewStep />} />
  <Route path="invoices/:id/edit" element={<CreateInvoice />} /> 
  <Route path="settings" element={<SettingsPage />} />
  <Route path="expenses" element={<ExpenseTracker />} />
  <Route path='reports' element={<Reports />} />
  
</Route>


      </Routes>
    </Router>
  );
}

export default App;
