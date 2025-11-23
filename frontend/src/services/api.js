import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Single API call function
const callAPI = async (action, data = {}) => {
    try {
        const response = await api.post('/api', { action, data });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Network error' };
    }
};

// Auth Services
export const authService = {
    register: (userData) => callAPI('register', userData),
    login: (credentials) => callAPI('login', credentials),
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },
};

// Product Services
export const productService = {
    getProducts: (filters = {}) => callAPI('getProducts', filters),
    getProduct: (id) => callAPI('getProduct', { id }),
    getCategories: () => callAPI('getCategories'),
};

// Cart Services
export const cartService = {
    getCart: () => callAPI('getCart'),
    addToCart: (productId, quantity = 1) => callAPI('addToCart', { productId, quantity }),
    updateCartItem: (cartItemId, quantity) => callAPI('updateCartItem', { cartItemId, quantity }),
    removeFromCart: (cartItemId) => callAPI('removeFromCart', { cartItemId }),
};

// Order Services
export const orderService = {
    createOrder: (orderData) => callAPI('createOrder', orderData),
    getOrders: () => callAPI('getOrders'),
    getOrder: (orderId) => callAPI('getOrder', { orderId }),
};

// Wishlist Services
export const wishlistService = {
    addToWishlist: (productId) => callAPI('addToWishlist', { productId }),
    removeFromWishlist: (productId) => callAPI('removeFromWishlist', { productId }),
};

// Review Services
export const reviewService = {
    addReview: (productId, review) => callAPI('addReview', { productId, ...review }),
};

// Admin Services
export const adminService = {
    getDashboardStats: () => callAPI('getDashboardStats'),
    getAllUsers: () => callAPI('getAllUsers'),
    getAllOrders: () => callAPI('getAllOrders'),
    updateOrderStatus: (orderId, status) => callAPI('updateOrderStatus', { orderId, status }),
    updateProduct: (productData) => callAPI('updateProduct', productData),
};

// Profile Services
export const profileService = {
    getUserProfile: () => callAPI('getUserProfile'),
};

export default api;
