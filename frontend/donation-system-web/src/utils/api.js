import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5016/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API functions
export const donationAPI = {
  getAll: () => api.get('/donation'),
  getById: (id) => api.get(`/donation/${id}`),
  create: (data) => api.post('/donation', data),
  update: (id, data) => api.put(`/donation/${id}`, data),
  delete: (id) => api.delete(`/donation/${id}`),
};

export const routeAPI = {
  optimize: (data) => api.post('/routeoptimization/optimize', data),
  nearest: (officerId, count) => api.get(`/routeoptimization/nearest/${officerId}?count=${count}`),
  getGraph: () => api.get('/routeoptimization/graph'),
};

// Donors API
export const getDonors = async () => {
    const response = await api.get('/Donors');
    return response.data;
};

export const getDonorById = async (id) => {
    const response = await api.get(`/Donors/${id}`);
    return response.data;
};

export const checkNicExists = (nicNumber, donors) => {
    // Check against provided donors list (already fetched)
    if (!nicNumber || !donors || donors.length === 0) return false;
    return donors.some(donor => 
        donor.nicNumber && 
        donor.nicNumber.toLowerCase().trim() === nicNumber.toLowerCase().trim()
    );
};

export const createDonor = async (donor) => {
    const response = await api.post('/Donors', donor);
    return response.data;
};

export const updateDonor = async (id, donor) => {
    const response = await api.put(`/Donors/${id}`, donor);
    return response.data;
};

export const deleteDonor = async (id) => {
    const response = await api.delete(`/Donors/${id}`);
    return response.data;
};

// Officers API
export const getOfficers = async () => {
    const response = await api.get('/Officers');
    return response.data;
};

export const getOfficerById = async (id) => {
    const response = await api.get(`/Officers/${id}`);
    return response.data;
};

export const createOfficer = async (officer) => {
    const response = await api.post('/Officers', officer);
    return response.data;
};

export const updateOfficer = async (id, officer) => {
    const response = await api.put(`/Officers/${id}`, officer);
    return response.data;
};

export const deleteOfficer = async (id) => {
    const response = await api.delete(`/Officers/${id}`);
    return response.data;
};

// Receivers API
export const getReceivers = async () => {
    const response = await api.get('/Receivers');
    return response.data;
};

export const getReceiverById = async (id) => {
    const response = await api.get(`/Receivers/${id}`);
    return response.data;
};

export const createReceiver = async (receiver) => {
    const response = await api.post('/Receivers', receiver);
    return response.data;
};

export const updateReceiver = async (id, receiver) => {
    const response = await api.put(`/Receivers/${id}`, receiver);
    return response.data;
};

export const deleteReceiver = async (id) => {
    const response = await api.delete(`/Receivers/${id}`);
    return response.data;
};

// Donations API
export const getDonations = async () => {
    const response = await api.get('/Donation');
    return response.data;
};

export const getDonationDetails = async (id) => {
    const response = await api.get(`/Donation/details/${id}`);
    return response.data;
};

export const createDonation = async (donation) => {
    const response = await api.post('/Donation', donation);
    return response.data;
};

export const updateDonation = async (id, donation) => {
    const response = await api.put(`/Donation/${id}`, donation);
    return response.data;
};

export const deleteDonation = async (id) => {
    const response = await api.delete(`/Donation/${id}`);
    return response.data;
};

// Distributions API
export const getDistributions = async () => {
    const response = await api.get('/Distributions');
    return response.data;
};

export const getDistributionDetails = async (id) => {
    const response = await api.get(`/Distributions/${id}`);
    return response.data;
};

export const createDistribution = async (distribution) => {
    const response = await api.post('/Distributions', distribution);
    return response.data;
};

export const updateDistribution = async (id, distribution) => {
    const response = await api.put(`/Distributions/${id}`, distribution);
    return response.data;
};

export const deleteDistribution = async (id) => {
    const response = await api.delete(`/Distributions/${id}`);
    return response.data;
};

// Routes API
export const getRoutes = async () => {
    const response = await api.get('/Route');
    return response.data;
};

export const getRouteById = async (id) => {
    const response = await api.get(`/Route/${id}`);
    return response.data;
};

export const createRoute = async (route) => {
    const response = await api.post('/Route', route);
    return response.data;
};

export const deleteRoute = async (id) => {
    const response = await api.delete(`/Route/${id}`);
    return response.data;
};

export default api;