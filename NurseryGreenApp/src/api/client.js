// The Nursery Green — API Client
const BASE_URL = 'https://backend-production-f128.up.railway.app';

class ApiClient {
  constructor() {
    this.baseURL = BASE_URL;
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw { status: response.status || 500, message: `Server error (${response.status})`, data: null };
      }
      if (!response.ok) {
        throw { status: response.status, message: data.message || data.error || 'Request failed', data };
      }
      return data;
    } catch (error) {
      if (error.status) throw error;
      throw { status: 0, message: 'Network error. Please check your connection.', data: null };
    }
  }

  // Auth
  async verifyToken() {
    return this.request('/auth/verify-token', { method: 'POST' });
  }

  async getProfile() {
    return this.request('/api/users/profile');
  }

  async updateProfile(data) {
    return this.request('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Orders
  async createOrder(orderData) {
    return this.request('/api/orders/create', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getMyOrders() {
    return this.request('/api/orders/my-orders');
  }

  async getOrder(orderId) {
    return this.request(`/api/orders/${orderId}`);
  }

  async trackOrder(orderId) {
    return this.request(`/api/orders/track/${orderId}`);
  }

  // Community
  async getCommunityPosts() {
    return this.request('/api/community');
  }

  async createPost(postData) {
    return this.request('/api/community', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async likePost(postId) {
    return this.request(`/api/community/${postId}/like`, {
      method: 'POST',
    });
  }

  async commentOnPost(postId, text) {
    return this.request(`/api/community/${postId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async googleOneTapLogin(idToken) {
    return this.request('/api/community/login-google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
  }

  // Plant Scanner
  async analyzePlant(data) {
    return this.request('/api/plant-scanner/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Plant Energy
  async matchEnergy(plantName, imageHints, limit) {
    return this.request('/api/plant-scanner/energy/match', {
      method: 'POST',
      body: JSON.stringify({ plantName, imageHints, limit }),
    });
  }

  async searchEnergy(query, limit = 5) {
    return this.request(`/api/plant-scanner/energy/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  }

  async getEnergyBySlug(slug) {
    return this.request(`/api/plant-scanner/energy/${slug}`);
  }

  // Plant Knowledge
  async diagnose(observation) {
    return this.request('/api/plant-knowledge/diagnose', {
      method: 'POST',
      body: JSON.stringify(observation),
    });
  }

  async chatAssist(query, context) {
    return this.request('/api/plant-knowledge/chat-assist', {
      method: 'POST',
      body: JSON.stringify({ query, context }),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const api = new ApiClient();
export default api;
