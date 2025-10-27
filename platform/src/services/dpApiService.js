// This flag allows you to switch between the mock data and the real backend.
// true = use mock data, false = use real API
const useMock = false;

// This is the URL of the backend server you are running.
const API_BASE_URL = 'http://127.0.0.1:8000';


// --- REAL API SERVICE ---
// This object makes actual network requests to your backend.
const realApiService = {
  async getDashboardKpis() {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/kpis`);
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  },
  async getDatasets() {
    const response = await fetch(`${API_BASE_URL}/api/datasets`);
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  },
  async getDataset(id) {
    const response = await fetch(`${API_BASE_URL}/api/datasets/${id}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  },
  async deleteDataset(id) {
    const response = await fetch(`${API_BASE_URL}/api/datasets/${id}`, {
      method: 'DELETE',
    });
    // A successful delete (204 No Content) has no JSON body to parse.
    if (!response.ok && response.status !== 204) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to delete dataset' }));
      throw new Error(errorData.detail || 'Network response was not ok');
    }
  },
  async getQueries() {
    const response = await fetch(`${API_BASE_URL}/api/queries`);
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  },
  async getJob(id) {
    const response = await fetch(`${API_BASE_URL}/api/jobs/${id}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  },
  async getPrivacyBudget() {
    const response = await fetch(`${API_BASE_URL}/api/privacy_budget`);
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  },
  async getPolicy() {
    const response = await fetch(`${API_BASE_URL}/api/policy`);
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  },
  async executeQuery(jobData) {
    const response = await fetch(`${API_BASE_URL}/api/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Network response was not ok');
    }
    return response.json();
  },
  async updatePolicy(policyData) {
    const response = await fetch(`${API_BASE_URL}/api/policy`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(policyData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Network response was not ok');
    }
    return response.json();
  },

  resetBudget: async (budgetId) => {
    const response = await fetch(`${API_BASE_URL}/api/budgets/${budgetId}/reset`, {
      method: 'POST',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to reset budget');
    }
    return response.json();
  },

  updateBudget: async (budgetId, budgetData) => {
    const payload = {
        epsilon_to_add: budgetData.total_epsilon,
        delta_to_add: budgetData.total_delta
    };
    const response = await fetch(`${API_BASE_URL}/api/budgets/${budgetId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update budget');
    }
    return response.json();
  },

  // *** FIX START ***

  getAlerts: async (datasetId) => {
    // Corrected URL: GET /api/v1/alerts/{dataset_id}
    const response = await fetch(`${API_BASE_URL}/api/v1/alerts/${datasetId}`);
    if (!response.ok) throw new Error(`Failed to fetch alerts. Status: ${response.status}`);
    return response.json();
  },

  createAlert: async (alertData) => {
    // Corrected URL: POST /api/v1/alerts/
    const response = await fetch(`${API_BASE_URL}/api/v1/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alertData),
    });
    if (!response.ok) throw new Error('Failed to create alert');
    return response.json();
  },

  deleteAlert: async (alertId) => {
    // Corrected URL: DELETE /api/v1/alerts/{alert_id}
    const response = await fetch(`${API_BASE_URL}/api/v1/alerts/${alertId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete alert');
  },

  async getAuditLogs(filters = {}) {
    const params = new URLSearchParams();
    // Only add params if they have a value
    Object.entries(filters).forEach(([key, value]) => {
        if (value) {
            // Map frontend state names to backend query param names
            if (key === 'startDate') params.append('start_date', value);
            else if (key === 'endDate') params.append('end_date', value);
            else if (key === 'action') params.append('action', value);
            else params.append(key, value);
        }
    });
    const response = await fetch(`${API_BASE_URL}/api/audit-logs?${params.toString()}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  },
  // this for audit log download PDF
  async getReport(reportName, filters = {}) {  
    const params = new URLSearchParams();
     Object.entries(filters).forEach(([key, value]) => {
        if (value) {
            if (key === 'startDate') params.append('start_date', value);
            else if (key === 'endDate') params.append('end_date', value);
            else if (key === 'action') params.append('action', value);
            else params.append(key, value);
        }
    });
    const response = await fetch(`${API_BASE_URL}/api/${reportName}/report?${params.toString()}`);
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Failed to generate report');
    }
    return response.blob(); // Return the PDF as a blob
  },
  
  async getReports() {
    const response = await fetch(`${API_BASE_URL}/api/v1/reports/`);
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  },

  async generateReport(reportData) {
    const response = await fetch(`${API_BASE_URL}/api/v1/reports/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate report');
    }
    return response.json();
  },

  getReportDownloadUrl(reportId) {
    return `${API_BASE_URL}/api/v1/reports/${reportId}/download`;
  },

  async runSimulation(simulationData) {
    const response = await fetch(`${API_BASE_URL}/api/v1/simulations/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(simulationData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to run simulation');
    }
    return response.json();
  },

  async getSettings() {
    const response = await fetch(`${API_BASE_URL}/api/settings`);
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  },

  async updateSettings(settingsData) {
    const response = await fetch(`${API_BASE_URL}/api/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settingsData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update settings');
    }
    return response.json();
  },
  async getDatasetPreview(id) {
    const response = await fetch(`${API_BASE_URL}/api/datasets/${id}/preview`);
    if (!response.ok) throw new Error('Failed to fetch dataset preview');
    return response.json();
  },
  async importSchema(schemaData) {
    const response = await fetch(`${API_BASE_URL}/datasets/import-schema`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schemaData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to import schema');
    }
    return response.json();
  },
  async updateDataset(id, datasetData) {
    const response = await fetch(`${API_BASE_URL}/api/datasets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datasetData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update dataset');
    }
    return response.json();
  },
  async getTemplates() {
    const response = await fetch(`${API_BASE_URL}/api/templates`);
    if (!response.ok) throw new Error('Failed to fetch query templates');
    return response.json();
  },

  async createTemplate(templateData) {
    const response = await fetch(`${API_BASE_URL}/api/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(templateData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create template');
    }
    return response.json();
  },

  async updateTemplate(id, templateData) {
    const response = await fetch(`${API_BASE_URL}/api/templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(templateData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update template');
    }
    return response.json();
  },

  async deleteTemplate(id) {
    const response = await fetch(`${API_BASE_URL}/api/templates/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to delete template');
    }
  },
  async getSchedules() {
    const response = await fetch(`${API_BASE_URL}/api/schedules`);
    if (!response.ok) throw new Error('Failed to fetch report schedules');
    return response.json();
  },

  async createSchedule(scheduleData) {
    const response = await fetch(`${API_BASE_URL}/api/schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scheduleData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create schedule');
    }
    return response.json();
  },

  async deleteSchedule(scheduleId) {
    const response = await fetch(`${API_BASE_URL}/api/schedules/${scheduleId}`, {
      method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to delete schedule');
    }
  },

  
  // *** FIX END ***
};


// --- MOCK API SERVICE ---
// This is your original mock service code.
const mockApiService = {
  async getDatasets() { return [{ id: 'ds_001', name: 'customer_events', description: 'Mock customer data', columns: [], created_at: new Date().toISOString() }] },
  async getDataset(id) { return { id: id, name: 'customer_events', description: 'Mock customer data', columns: [], created_at: new Date().toISOString() } },
  async getJobs() { return [{ id: 'dp_001', dataset_name: 'customer_events', status: 'Completed', query_type: 'COUNT', created_at: new Date().toISOString(), epsilon_spent: 0.1 }] },
  async getJob(id) { return { id: id, dataset_name: 'customer_events', status: 'Completed', query_type: 'COUNT', created_at: new Date().toISOString(), epsilon_spent: 0.1, result: { count: 12345 } } },
  async getBudgets() { return [{ id: 1, dataset_id: 1, dataset_name: 'customer_events', total_epsilon: 10.0, consumed_epsilon: 0.5 }] },
  async getPolicy() { return { max_epsilon_per_job: 1.0, default_delta: 0.00001 } },
  async getDashboardKpis() { return { total_queries: 1, total_datasets: 1, epsilon_spent: 0.5, queries_by_type: { "count": 1 }, recent_queries: [] } },
  async createJob(jobData) { return { id: 'job_new', status: 'Completed', ...jobData } },
  async updatePolicy(policyData) { return policyData },
};


// This line exports the correct service based on the useMock flag.
export const dpApiService = useMock ? mockApiService : realApiService;