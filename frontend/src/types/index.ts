export interface User {
  id: string;
  email: string;
  full_name?: string;
  company_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  company?: string;
  address?: string;
  phone?: string;
  currency?: string;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  client_id?: string;
  name: string;
  description?: string;
  status: string;
  budget?: number;
  currency?: string;
  created_at: string;
}

export interface Transcript {
  id: string;
  user_id: string;
  project_id?: string;
  filename: string;
  file_type: string;
  raw_size: number;
  content: string;
  created_at: string;
}

export interface EvidenceItem {
  quote: string;
  speaker?: string;
  timestamp?: string;
}

export interface DeliverableItem {
  title: string;
  description?: string;
  deadline?: string;
  estimated_amount?: number;
  currency?: string;
  evidence: EvidenceItem[];
  confidence: number;
  requires_review: boolean;
  status: 'accepted' | 'proposed' | 'disputed';
}

export interface MilestoneItem {
  title: string;
  deadline?: string;
  amount?: number;
  status: string;
}

export interface FinancialTerms {
  currency: string;
  total_amount?: number;
  payment_terms: string;
  payment_schedule: string[];
  tax_rate?: number;
  discount?: number;
}

export interface AnalysisResult {
  client: {
    name?: string;
    company?: string;
    email?: string;
  };
  project: {
    name?: string;
    description?: string;
  };
  deliverables: DeliverableItem[];
  milestones: MilestoneItem[];
  financial_terms: FinancialTerms;
  missing_information: string[];
  contradictions: string[];
  risks: string[];
  summary: string;
  overall_confidence: number;
}

export interface AnalysisResponse {
  id: string;
  transcript_id: string;
  status: string;
  confidence: number;
  result: AnalysisResult;
  created_at: string;
}

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_id?: string;
  project_id?: string;
  analysis_id?: string;
  invoice_number: string;
  customer_name: string;
  billing_address?: string;
  issue_date: string;
  due_date: string;
  payment_terms: string;
  currency: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  notes?: string;
  status: 'draft' | 'approved' | 'pending_payment' | 'paid' | 'canceled' | 'overdue';
  paypal_order_id?: string;
  paid_at?: string;
  created_at: string;
  items: InvoiceItem[];
}

export interface RecentActivity {
  id: string;
  activity: string;
  order_id: string;
  date: string;
  time: string;
  price: number;
  currency: string;
  status: 'Completed' | 'Pending' | 'Canceled' | 'Draft';
}

export interface DashboardMetrics {
  balance: number;
  balance_change_pct: number;
  savings: number;
  savings_change_pct: number;
  portfolio: number;
  portfolio_change_pct: number;
  cash_flow_total: number;
  wallets: Array<{
    currency: string;
    symbol: string;
    flag: string;
    balance: string;
    limit: string;
    status: string;
  }>;
  cash_flow_monthly: Array<{
    month: string;
    value: number;
    height: string;
    highlighted?: boolean;
    date?: string;
    cashflow?: string;
    inflow?: string;
  }>;
  recent_activities: RecentActivity[];
  total_invoices: number;
  paid_invoices: number;
  pending_invoices: number;
  outstanding_amount: number;
}

export interface SettingsStatus {
  gemini_configured: boolean;
  gemini_model: string;
  paypal_mode: string;
  paypal_configured: boolean;
  paypal_client_id_preview?: string;
}
