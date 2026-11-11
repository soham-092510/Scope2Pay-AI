import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { Dashboard } from './pages/Dashboard';
import { TranscriptStudio } from './pages/TranscriptStudio';
import { InvoiceBuilder } from './pages/InvoiceBuilder';
import { Invoices } from './pages/Invoices';
import { Transactions } from './pages/Transactions';
import { Projects } from './pages/Projects';
import { Clients } from './pages/Clients';
import { PaymentCenter } from './pages/PaymentCenter';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#F8FAFC]">
        {/* Left Sticky Sidebar */}
        <Sidebar />

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/transcripts" element={<TranscriptStudio />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/invoices/new" element={<InvoiceBuilder />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/payments" element={<PaymentCenter />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
