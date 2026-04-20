import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const contentType = config.headers?.['Content-Type'];

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Don't override Content-Type for FormData (axios sets it automatically with boundary)
    if (contentType === undefined) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const loginUser = async (email, password) => {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const response = await api.post('/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Products
export const getProducts = async (skip = 0, limit = 100) => {
  const response = await api.get(`/products/?skip=${skip}&limit=${limit}`);
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const getProductsByCategory = async (categoryId, skip = 0, limit = 100) => {
  const response = await api.get(`/products/by-category/${categoryId}?skip=${skip}&limit=${limit}`);
  return response.data;
};

export const getProductsBySubcategory = async (subcategoryId, skip = 0, limit = 100) => {
  const response = await api.get(`/products/by-subcategory/${subcategoryId}?skip=${skip}&limit=${limit}`);
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await api.post('/products/', productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await api.patch(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

// Prices
export const getProductPrices = async (productId, skip = 0, limit = 100) => {
  const response = await api.get(`/products/${productId}/prices?skip=${skip}&limit=${limit}`);
  return response.data;
};

export const getCurrentPrices = async (productId) => {
  const response = await api.get(`/products/${productId}/prices/current`);
  return response.data;
};

export const createPrice = async (productId, priceData) => {
  const dataWithProductId = { ...priceData, product_id: productId };
  const response = await api.post(`/products/${productId}/prices`, dataWithProductId);
  return response.data;
};

export const deletePrice = async (productId, priceId) => {
  const response = await api.delete(`/products/${productId}/prices/${priceId}`);
  return response.data;
};

// Upload
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return api.post('/upload/image', formData);
};

// Stores
export const getStores = async (skip = 0, limit = 100) => {
  const response = await api.get(`/stores/?skip=${skip}&limit=${limit}`);
  return response.data;
};

export const getStoreById = async (id) => {
  const response = await api.get(`/stores/${id}`);
  return response.data;
};

export const createStore = async (storeData) => {
  const response = await api.post('/stores/', storeData);
  return response.data;
};

export const updateStore = async (id, storeData) => {
  const response = await api.patch(`/stores/${id}`, storeData);
  return response.data;
};

export const deleteStore = async (id) => {
  const response = await api.delete(`/stores/${id}`);
  return response.data;
};

// Categories
export const getCategories = async (skip = 0, limit = 100) => {
  const response = await api.get(`/categories/?skip=${skip}&limit=${limit}`);
  return response.data;
};

export const getCategoryById = async (id) => {
  const response = await api.get(`/categories/${id}`);
  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await api.post('/categories/', categoryData);
  return response.data;
};

export const updateCategory = async (id, categoryData) => {
  const response = await api.patch(`/categories/${id}`, categoryData);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};

// Subcategories
export const getSubcategories = async (skip = 0, limit = 100) => {
  const response = await api.get(`/subcategories/?skip=${skip}&limit=${limit}`);
  return response.data;
};

export const getSubcategoriesByCategory = async (categoryId) => {
  const response = await api.get(`/subcategories/by-category/${categoryId}`);
  return response.data;
};

export const createSubcategory = async (subcategoryData) => {
  const response = await api.post('/subcategories/', subcategoryData);
  return response.data;
};

export const deleteSubcategory = async (id) => {
  const response = await api.delete(`/subcategories/${id}`);
  return response.data;
};

// Users
export const getUsers = async (skip = 0, limit = 100) => {
  const response = await api.get(`/users/?skip=${skip}&limit=${limit}`);
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post('/users/', userData);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.patch(`/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export default api;