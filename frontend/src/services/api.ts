import {
  User, Client, Project, Transcript, AnalysisResponse, AnalysisResult,
  Invoice, DashboardMetrics, SettingsStatus
} from '../types';

const API_BASE = '/api/v1';

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('scope2pay_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMsg = 'An unexpected error occurred';
      try {
        const errorData = await response.json();
        errorMsg = errorData.detail || errorData.message || errorMsg;
      } catch (e) {
        errorMsg = response.statusText;
      }
      throw new Error(errorMsg);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string): Promise<{ access_token: string; user: User }> {
    const data = await this.request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('scope2pay_token', data.access_token);
    return data;
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  logout() {
    localStorage.removeItem('scope2pay_token');
  }

  // Dashboard
  async getDashboard(): Promise<DashboardMetrics> {
    return this.request<DashboardMetrics>('/dashboard');
  }

  // Clients
  async getClients(): Promise<Client[]> {
    return this.request<Client[]>('/clients');
  }

  async createClient(data: Partial<Client>): Promise<Client> {
    return this.request<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return this.request<Project[]>('/projects');
  }

  async createProject(data: Partial<Project>): Promise<Project> {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Transcripts
  async getTranscripts(): Promise<Transcript[]> {
    return this.request<Transcript[]>('/transcripts');
  }

  async createTranscriptText(content: string, filename = 'meeting_transcript.txt', project_id?: string): Promise<Transcript> {
    return this.request<Transcript>('/transcripts', {
      method: 'POST',
      body: JSON.stringify({ content, filename, project_id }),
    });
  }

  async uploadTranscriptFile(file: File, project_id?: string): Promise<Transcript> {
    const formData = new FormData();
    formData.append('file', file);
    if (project_id) {
      formData.append('project_id', project_id);
    }

    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/transcripts/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'File upload failed');
    }

    return response.json();
  }

  // AI Analysis
  async runAnalysis(transcript_id: string): Promise<AnalysisResponse> {
    return this.request<AnalysisResponse>(`/analysis?transcript_id=${transcript_id}`, {
      method: 'POST',
    });
  }

  async getAnalysis(id: string): Promise<AnalysisResponse> {
    return this.request<AnalysisResponse>(`/analysis/${id}`);
  }

  async reviewAnalysis(id: string, result: AnalysisResult): Promise<AnalysisResponse> {
    return this.request<AnalysisResponse>(`/analysis/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ result }),
    });
  }

  // Invoices
  async getInvoices(status?: string): Promise<Invoice[]> {
    const url = status ? `/invoices?status=${status}` : '/invoices';
    return this.request<Invoice[]>(url);
  }

  async getInvoice(id: string): Promise<Invoice> {
    return this.request<Invoice>(`/invoices/${id}`);
  }

  async createInvoice(data: any): Promise<Invoice> {
    return this.request<Invoice>('/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInvoice(id: string, data: any): Promise<Invoice> {
    return this.request<Invoice>(`/invoices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async approveInvoice(id: string): Promise<Invoice> {
    return this.request<Invoice>(`/invoices/${id}/approve`, {
      method: 'POST',
    });
  }

  // PayPal Payments
  async createPayPalOrder(invoice_id: string, return_url?: string, cancel_url?: string): Promise<{
    order_id: string;
    status: string;
    approve_url?: string;
    amount: number;
    currency: string;
  }> {
    return this.request('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ invoice_id, return_url, cancel_url }),
    });
  }

  async capturePayPalOrder(invoice_id: string, order_id: string): Promise<{
    capture_id: string;
    order_id: string;
    status: string;
    amount: number;
    currency: string;
    payer_email?: string;
    payer_name?: string;
    invoice_status: string;
  }> {
    return this.request('/payments/capture-order', {
      method: 'POST',
      body: JSON.stringify({ invoice_id, order_id }),
    });
  }

  async getPaymentStatus(id: string): Promise<{
    order_id: string;
    status: string;
    amount: number;
    currency: string;
    invoice_id: string;
    is_paid: boolean;
  }> {
    return this.request(`/payments/${id}`);
  }

  // Settings
  async getSettings(): Promise<SettingsStatus> {
    return this.request<SettingsStatus>('/settings');
  }

  async updateSettings(data: {
    gemini_api_key?: string;
    paypal_client_id?: string;
    paypal_client_secret?: string;
    paypal_mode?: string;
  }): Promise<SettingsStatus> {
    return this.request<SettingsStatus>('/settings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiService();
