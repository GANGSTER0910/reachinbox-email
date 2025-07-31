import axios from 'axios';

import { config } from '@/config/env';

// API base configuration
const API_BASE_URL = config.apiUrl;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Types for API responses
export interface Email {
  id: string;
  subject: string;
  from: string;
  to: string;
  text: string;
  html?: string;
  folder: string;
  accountId: string;
  date: string;
  messageId: string;
  category: 'Interested' | 'Meeting Booked' | 'Not Interested' | 'Spam' | 'Out of Office' | 'Uncategorized';
  bodyPreview?: string;
}

export interface SearchResponse {
  hits: Email[];
  total: number;
  page: number;
  limit: number;
}

export interface StatsResponse {
  total: number;
  categories: Array<{ key: string; doc_count: number }>;
  folders: Array<{ key: string; doc_count: number }>;
  accounts: Array<{ key: string; doc_count: number }>;
}

export interface CategoryResponse {
  category: string;
}

// API service functions
export const emailApi = {
  // Search emails with filters
  search: async (params: {
    query?: string;
    folder?: string;
    accountId?: string;
    category?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }): Promise<SearchResponse> => {
    const response = await api.get('/search', { params });
    return response.data;
  },

  // Get email statistics
  getStats: async (): Promise<StatsResponse> => {
    const response = await api.get('/stats');
    return response.data;
  },

  // Categorize email content
  categorizeEmail: async (emailContent: string): Promise<CategoryResponse> => {
    const response = await api.post('/category', { emailContent });
    return response.data;
  },

  // Test notifications
  testNotifications: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/test-notifications');
    return response.data;
  },
};

export default api; 