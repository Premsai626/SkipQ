import { Order, OrderStatus, PrintConfiguration, DocumentItem, PriceBreakdown, User, NotificationItem, OperationalMetrics, StoreItem } from '../types';

export const API_BASE = '/api/v1';

// Token storage helper
export function getAuthToken(): string | null {
  return localStorage.getItem('xeroxflow_jwt_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('xeroxflow_jwt_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('xeroxflow_jwt_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is NOT FormData, set json content type
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      removeAuthToken();
    }
    const errorMsg = json.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return json.data as T;
}

// 1. Auth & Profile API
export const authApi = {
  login: async (email: string, password: string) => {
    return request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role?: 'student' | 'staff';
    department?: string;
    collegeId?: string;
    phone?: string;
    institution?: string;
    yearOfStudy?: string;
  }) => {
    return request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getMe: async () => {
    return request<User>('/auth/me');
  },

  updateProfile: async (data: Partial<User>) => {
    return request<User>('/profiles/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  getProfileById: async (id: string) => {
    return request<User>(`/profiles/${id}`);
  },

  syncGoogleUser: async (data: {
    supabaseToken: string;
    role?: 'student' | 'staff';
    email?: string;
    name?: string;
    avatar?: string;
    department?: string;
    collegeId?: string;
    phone?: string;
    institution?: string;
    yearOfStudy?: string;
  }) => {
    return request<{ user: User; token: string }>('/auth/google-sync', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// 2. Documents API (Real Multipart Upload)
export const documentsApi = {
  upload: async (file: File): Promise<DocumentItem> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'File upload failed');
    }

    return json.data as DocumentItem;
  },

  getViewUrl: async (
    documentId: string
  ): Promise<{
    id: string;
    filename: string;
    name: string;
    mimeType: string;
    signedUrl: string;
    downloadUrl?: string;
    viewUrl?: string;
  }> => {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}/documents/${encodeURIComponent(documentId)}/view`, {
      method: 'GET',
      headers,
    });

    const json = await response.json();
    if (!response.ok || !json.success) {
      throw new Error(json.message || 'Unable to access document');
    }

    return json.data;
  },
};

// 3. Pricing API
export const pricingApi = {
  calculate: async (documents: DocumentItem[], config: PrintConfiguration): Promise<PriceBreakdown & { estimatedMinutes: number }> => {
    return request('/pricing/calculate', {
      method: 'POST',
      body: JSON.stringify({ documents, config }),
    });
  },
};

// 4. Store API (Stationery Catalog)
export const storeApi = {
  getItems: async (params: { category?: string; search?: string; availableOnly?: boolean } = {}): Promise<StoreItem[]> => {
    const qs = new URLSearchParams();
    if (params.category) qs.append('category', params.category);
    if (params.search) qs.append('search', params.search);
    if (params.availableOnly !== undefined) qs.append('availableOnly', String(params.availableOnly));
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return request<StoreItem[]>(`/store/items${query}`);
  },

  getItemById: async (id: string): Promise<StoreItem> => {
    return request<StoreItem>(`/store/items/${id}`);
  },

  createItem: async (item: {
    name: string;
    description?: string;
    category?: string;
    price: number;
    stock: number;
    imageUrl?: string;
    isAvailable?: boolean;
  }): Promise<StoreItem> => {
    return request<StoreItem>('/store/items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  updateItem: async (id: string, updates: Partial<StoreItem>): Promise<StoreItem> => {
    return request<StoreItem>(`/store/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  deleteItem: async (id: string): Promise<{ success: boolean; message: string }> => {
    return request<{ success: boolean; message: string }>(`/store/items/${id}`, {
      method: 'DELETE',
    });
  },
};

// 5. Orders API (Print & Stationery Orders)
export const ordersApi = {
  create: async (payload: {
    orderType?: 'PRINT' | 'STORE';
    documents?: DocumentItem[];
    config?: PrintConfiguration;
    items?: Array<{ itemId: string; quantity: number }>;
    paymentMethod: string;
    pickupCounter?: string;
  }): Promise<Order> => {
    return request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getById: async (idOrToken: string): Promise<Order> => {
    return request<Order>(`/orders/${idOrToken}`);
  },

  getAll: async (filters: { status?: string; studentId?: string; search?: string; limit?: number; offset?: number } = {}): Promise<Order[]> => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.studentId) params.append('studentId', filters.studentId);
    if (filters.search) params.append('search', filters.search);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());

    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<Order[]>(`/orders${qs}`);
  },

  updateStatus: async (idOrToken: string, status: OrderStatus, rejectionReason?: string): Promise<Order> => {
    return request<Order>(`/orders/${idOrToken}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, rejectionReason }),
    });
  },

  verifyPayment: async (idOrToken: string): Promise<Order> => {
    return request<Order>(`/orders/${idOrToken}/verify-payment`, {
      method: 'POST',
    });
  },

  cancel: async (idOrToken: string): Promise<Order> => {
    return request<Order>(`/orders/${idOrToken}/cancel`, {
      method: 'POST',
    });
  },
};

// 6. Queue API
export const queueApi = {
  getQueue: async (): Promise<Order[]> => {
    return request<Order[]>('/queue');
  },
};

// 7. Analytics API
export const analyticsApi = {
  getMetrics: async (): Promise<OperationalMetrics> => {
    return request<OperationalMetrics>('/analytics');
  },
};

// 8. Notifications API
export const notificationsApi = {
  getAll: async (): Promise<NotificationItem[]> => {
    return request<NotificationItem[]>('/notifications');
  },
  markRead: async (id: string): Promise<NotificationItem> => {
    return request<NotificationItem>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },
};
