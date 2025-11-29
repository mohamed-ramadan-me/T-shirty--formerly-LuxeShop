import axios from 'axios';

// Ensure this matches your backend port
const API_URL = 'http://localhost:5000/api';
const BASE_URL = 'http://localhost:5000';

// Create axios instance
const api = axios.create({
    baseURL: BASE_URL,
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
        // This matches the unified endpoint structure: { action, data }
        const response = await api.post('/api', { action, data });
        
        // Return the whole response (success, data, error)
        return response.data;
    } catch (error) {
        console.error(`API Error (${action}):`, error);
        
        // Handle Axios errors (4xx, 5xx) vs Network errors
        if (error.response && error.response.data) {
             // Return the error message from backend so UI can show it
            return { success: false, error: error.response.data.error };
        }
        return { success: false, error: 'Network error or server unreachable' };
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
    getProduct: (id) => callAPI('getProduct', { id }), // Ensure 'id' here is the MongoDB _id string
    getCategories: () => callAPI('getCategories'),
};

// Cart Services
export const cartService = {
    getCart: () => callAPI('getCart'),
    addToCart: (productId, quantity = 1) => callAPI('addToCart', { productId, quantity }),
    // Important: cartItemId is now the MongoDB _id of the cart entry
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