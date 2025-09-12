// Mock DP API Service for standalone prototype
const mockDatasets = [
  {
    id: 'ds_001',
    name: 'customer_events',
    description: 'Customer interaction events dataset',
    source_type: 'database_table',
    total_records: 125000,
    linf_sensitivity: 1,
    l0_sensitivity: 1,
    columns: [
      { name: 'customer_id', type: 'string', min_val: null, max_val: null },
      { name: 'event_time', type: 'timestamp', min_val: null, max_val: null },
      { name: 'age', type: 'integer', min_val: 18, max_val: 95 },
      { name: 'revenue', type: 'decimal', min_val: 0, max_val: 10000 }
    ],
    privacy_budget_used: 0.3,
    created_at: '2024-09-01T10:00:00Z',
    updated_at: '2024-09-05T15:30:00Z',
    status: 'active'
  },
  {
    id: 'ds_002', 
    name: 'user_profiles',
    description: 'User demographic and profile information',
    source_type: 'csv_file',
    total_records: 87500,
    linf_sensitivity: 1,
    l0_sensitivity: 1,
    columns: [
      { name: 'user_id', type: 'string', min_val: null, max_val: null },
      { name: 'age', type: 'integer', min_val: 16, max_val: 85 },
      { name: 'income', type: 'decimal', min_val: 20000, max_val: 200000 },
      { name: 'region', type: 'string', min_val: null, max_val: null }
    ],
    privacy_budget_used: 0.15,
    created_at: '2024-08-28T09:15:00Z',
    updated_at: '2024-09-03T11:20:00Z',
    status: 'active'
  },
  {
    id: 'ds_003',
    name: 'sales_data', 
    description: 'Sales transactions and metrics',
    source_type: 'api_endpoint',
    total_records: 234500,
    linf_sensitivity: 1,
    l0_sensitivity: 1,
    columns: [
      { name: 'transaction_id', type: 'string', min_val: null, max_val: null },
      { name: 'amount', type: 'decimal', min_val: 1, max_val: 50000 },
      { name: 'quantity', type: 'integer', min_val: 1, max_val: 100 }
    ],
    privacy_budget_used: 0.45,
    created_at: '2024-08-25T14:45:00Z', 
    updated_at: '2024-09-07T16:10:00Z',
    status: 'active'
  }
];

const mockQueries = [
  {
    id: 'dp_001',
    query: 'COUNT(*)',
    status: 'Completed',
    dataset: 'customer_events',
    epsilon: 0.1,
    mechanism: 'Laplace',
    time: '2 mins ago',
    result: 124987,
    created_at: '2024-09-08T10:45:00Z'
  },
  {
    id: 'dp_002',
    query: 'AVG(age)',
    status: 'Running',
    dataset: 'user_profiles',
    epsilon: 0.5,
    mechanism: 'Gaussian',
    time: '5 mins ago',
    result: null,
    created_at: '2024-09-08T10:42:00Z'
  },
  {
    id: 'dp_003',
    query: 'HISTOGRAM(region)',
    status: 'Completed',
    dataset: 'sales_data',
    epsilon: 0.2,
    mechanism: 'Exponential',
    time: '12 mins ago',
    result: { 'North': 45, 'South': 32, 'East': 28, 'West': 35 },
    created_at: '2024-09-08T10:35:00Z'
  },
  {
    id: 'dp_004',
    query: 'SUM(revenue)',
    status: 'Failed',
    dataset: 'financial_q3',
    epsilon: 1.0,
    mechanism: 'Laplace',
    time: '20 mins ago',
    result: null,
    error: 'Dataset not found',
    created_at: '2024-09-08T10:27:00Z'
  }
];

const mockMechanisms = [
  {
    id: 'laplace',
    name: 'Laplace Mechanism',
    description: 'Adds noise from Laplace distribution',
    type: 'additive_noise',
    parameters: ['epsilon', 'sensitivity'],
    use_cases: ['COUNT', 'SUM', 'histogram'],
    performance_rating: 4.2,
    privacy_guarantee: 'epsilon-DP'
  },
  {
    id: 'gaussian',
    name: 'Gaussian Mechanism', 
    description: 'Adds noise from Gaussian distribution',
    type: 'additive_noise',
    parameters: ['epsilon', 'delta', 'sensitivity'],
    use_cases: ['AVG', 'statistical_queries'],
    performance_rating: 4.5,
    privacy_guarantee: '(epsilon,delta)-DP'
  },
  {
    id: 'exponential',
    name: 'Exponential Mechanism',
    description: 'Selects outputs based on exponential probability',
    type: 'output_perturbation',
    parameters: ['epsilon', 'quality_function'],
    use_cases: ['median', 'mode', 'optimization'],
    performance_rating: 3.8,
    privacy_guarantee: 'epsilon-DP'
  }
];

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const dpApiService = {
  // Dataset operations
  async getDatasets() {
    await delay(800);
    return mockDatasets;
  },

  async getDataset(id) {
    await delay(600);
    return mockDatasets.find(ds => ds.id === id);
  },

  async createDataset(data) {
    await delay(1000);
    const newDataset = {
      id: `ds_${Date.now()}`,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'active',
      privacy_budget_used: 0
    };
    mockDatasets.push(newDataset);
    return newDataset;
  },

  // Query operations
  async getQueries() {
    await delay(700);
    return mockQueries;
  },

  async executeQuery(queryData) {
    await delay(1500);
    const newQuery = {
      id: `dp_${Date.now()}`,
      ...queryData,
      status: 'Completed',
      created_at: new Date().toISOString(),
      result: Math.floor(Math.random() * 10000)
    };
    mockQueries.unshift(newQuery);
    return newQuery;
  },

  // Mechanism operations
  async getMechanisms() {
    await delay(500);
    return mockMechanisms;
  },

  // Privacy accounting
  async getPrivacyBudget() {
    await delay(400);
    return {
      total_budget: 10.0,
      used_budget: 3.2,
      remaining_budget: 6.8,
      percentage_used: 32,
      datasets: mockDatasets.map(ds => ({
        name: ds.name,
        budget_used: ds.privacy_budget_used
      }))
    };
  },

  // Reports and analytics
  async getAnalytics() {
    await delay(900);
    return {
      total_queries: 1247,
      success_rate: 99.2,
      avg_query_time: 1.2,
      active_datasets: 23,
      data_volume: '2.1TB',
      system_status: {
        privacy_engine: 'Online',
        query_processor: 'Active', 
        budget_accountant: 'Healthy',
        data_storage: '78% Used'
      }
    };
  }
};
