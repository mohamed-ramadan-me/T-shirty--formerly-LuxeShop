const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Admin credentials
const ADMIN_EMAIL = 'admin@luxeshop.com';
const ADMIN_PASSWORD = 'admin123'; // In production, this should be hashed

// In-memory database (replace with real database in production)
const db = {
    users: [],
    products: [
        {
            id: 1,
            name: 'Premium Wireless Headphones',
            price: 299.99,
            category: 'Electronics',
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
            description: 'High-quality wireless headphones with noise cancellation',
            stock: 50,
            rating: 4.5,
            reviews: 128
        },
        {
            id: 2,
            name: 'Smart Watch Pro',
            price: 399.99,
            category: 'Electronics',
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
            description: 'Advanced smartwatch with health tracking features',
            stock: 30,
            rating: 4.7,
            reviews: 256
        },
        {
            id: 3,
            name: 'Designer Backpack',
            price: 89.99,
            category: 'Fashion',
            image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
            description: 'Stylish and durable backpack for everyday use',
            stock: 100,
            rating: 4.3,
            reviews: 89
        },
        {
            id: 4,
            name: 'Running Shoes Elite',
            price: 149.99,
            category: 'Sports',
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
            description: 'Professional running shoes with advanced cushioning',
            stock: 75,
            rating: 4.6,
            reviews: 342
        },
        {
            id: 5,
            name: 'Laptop Stand Aluminum',
            price: 59.99,
            category: 'Accessories',
            image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500',
            description: 'Ergonomic laptop stand made from premium aluminum',
            stock: 120,
            rating: 4.4,
            reviews: 67
        },
        {
            id: 6,
            name: 'Mechanical Keyboard RGB',
            price: 179.99,
            category: 'Electronics',
            image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
            description: 'Gaming mechanical keyboard with customizable RGB lighting',
            stock: 45,
            rating: 4.8,
            reviews: 423
        },
        {
            id: 7,
            name: 'Yoga Mat Premium',
            price: 49.99,
            category: 'Sports',
            image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500',
            description: 'Extra thick yoga mat with non-slip surface',
            stock: 200,
            rating: 4.5,
            reviews: 156
        },
        {
            id: 8,
            name: 'Coffee Maker Deluxe',
            price: 129.99,
            category: 'Home',
            image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500',
            description: 'Programmable coffee maker with thermal carafe',
            stock: 60,
            rating: 4.2,
            reviews: 234
        },
        {
            id: 9,
            name: 'Sunglasses Aviator',
            price: 159.99,
            category: 'Fashion',
            image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
            description: 'Classic aviator sunglasses with UV protection',
            stock: 85,
            rating: 4.6,
            reviews: 178
        },
        {
            id: 10,
            name: 'Portable Charger 20000mAh',
            price: 39.99,
            category: 'Electronics',
            image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500',
            description: 'High-capacity portable charger with fast charging',
            stock: 150,
            rating: 4.7,
            reviews: 512
        },
        {
            id: 11,
            name: 'Desk Lamp LED',
            price: 69.99,
            category: 'Home',
            image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500',
            description: 'Adjustable LED desk lamp with touch controls',
            stock: 90,
            rating: 4.4,
            reviews: 145
        },
        {
            id: 12,
            name: 'Water Bottle Insulated',
            price: 34.99,
            category: 'Sports',
            image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500',
            description: 'Stainless steel insulated water bottle keeps drinks cold for 24h',
            stock: 180,
            rating: 4.8,
            reviews: 289
        }
    ],
    orders: [],
    cart: []
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// ============================================
// SINGLE UNIFIED API ENDPOINT
// ============================================
app.post('/api', async (req, res) => {
    const { action, data } = req.body;

    try {
        switch (action) {
            // ========== AUTH ACTIONS ==========
            case 'register':
                const existingUser = db.users.find(u => u.email === data.email);
                if (existingUser) {
                    return res.status(400).json({ error: 'User already exists' });
                }

                const hashedPassword = await bcrypt.hash(data.password, 10);
                const newUser = {
                    id: db.users.length + 1,
                    email: data.email,
                    name: data.name,
                    password: hashedPassword,
                    role: 'user',
                    createdAt: new Date()
                };
                db.users.push(newUser);

                const registerToken = jwt.sign(
                    { id: newUser.id, email: newUser.email, role: newUser.role },
                    JWT_SECRET,
                    { expiresIn: '7d' }
                );

                return res.json({
                    success: true,
                    token: registerToken,
                    user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role }
                });

            case 'login':
                // Check if admin login
                if (data.email === ADMIN_EMAIL && data.password === ADMIN_PASSWORD) {
                    const adminToken = jwt.sign(
                        { id: 0, email: ADMIN_EMAIL, role: 'admin' },
                        JWT_SECRET,
                        { expiresIn: '7d' }
                    );

                    return res.json({
                        success: true,
                        token: adminToken,
                        user: { id: 0, email: ADMIN_EMAIL, name: 'Admin', role: 'admin' }
                    });
                }

                const user = db.users.find(u => u.email === data.email);
                if (!user) {
                    return res.status(400).json({ error: 'Invalid credentials' });
                }

                const validPassword = await bcrypt.compare(data.password, user.password);
                if (!validPassword) {
                    return res.status(400).json({ error: 'Invalid credentials' });
                }

                const loginToken = jwt.sign(
                    { id: user.id, email: user.email, role: user.role || 'user' },
                    JWT_SECRET,
                    { expiresIn: '7d' }
                );

                return res.json({
                    success: true,
                    token: loginToken,
                    user: { id: user.id, email: user.email, name: user.name, role: user.role || 'user' }
                });

            // ========== PRODUCT ACTIONS ==========
            case 'getProducts':
                let products = [...db.products];

                // Filter by category
                if (data?.category && data.category !== 'All') {
                    products = products.filter(p => p.category === data.category);
                }

                // Search
                if (data?.search) {
                    const searchLower = data.search.toLowerCase();
                    products = products.filter(p =>
                        p.name.toLowerCase().includes(searchLower) ||
                        p.description.toLowerCase().includes(searchLower)
                    );
                }

                // Sort
                if (data?.sort) {
                    switch (data.sort) {
                        case 'price-low':
                            products.sort((a, b) => a.price - b.price);
                            break;
                        case 'price-high':
                            products.sort((a, b) => b.price - a.price);
                            break;
                        case 'rating':
                            products.sort((a, b) => b.rating - a.rating);
                            break;
                        case 'popular':
                            products.sort((a, b) => b.reviews - a.reviews);
                            break;
                    }
                }

                return res.json({ success: true, products });

            case 'getProduct':
                const product = db.products.find(p => p.id === data.id);
                if (!product) {
                    return res.status(404).json({ error: 'Product not found' });
                }
                return res.json({ success: true, product });

            case 'getCategories':
                const categories = ['All', ...new Set(db.products.map(p => p.category))];
                return res.json({ success: true, categories });

            // ========== CART ACTIONS ==========
            case 'addToCart':
                const authHeader = req.headers['authorization'];
                const token = authHeader && authHeader.split(' ')[1];

                if (!token) {
                    return res.status(401).json({ error: 'Authentication required' });
                }

                let userId;
                try {
                    const decoded = jwt.verify(token, JWT_SECRET);
                    userId = decoded.id;
                } catch (err) {
                    return res.status(403).json({ error: 'Invalid token' });
                }

                const cartItem = db.cart.find(
                    item => item.userId === userId && item.productId === data.productId
                );

                if (cartItem) {
                    cartItem.quantity += data.quantity || 1;
                } else {
                    db.cart.push({
                        id: db.cart.length + 1,
                        userId,
                        productId: data.productId,
                        quantity: data.quantity || 1,
                        addedAt: new Date()
                    });
                }

                return res.json({ success: true, message: 'Added to cart' });

            case 'getCart':
                const authHeader2 = req.headers['authorization'];
                const token2 = authHeader2 && authHeader2.split(' ')[1];

                if (!token2) {
                    return res.status(401).json({ error: 'Authentication required' });
                }

                let userId2;
                try {
                    const decoded = jwt.verify(token2, JWT_SECRET);
                    userId2 = decoded.id;
                } catch (err) {
                    return res.status(403).json({ error: 'Invalid token' });
                }

                const userCart = db.cart.filter(item => item.userId === userId2);
                const cartWithProducts = userCart.map(item => {
                    const product = db.products.find(p => p.id === item.productId);
                    return {
                        ...item,
                        product
                    };
                });

                return res.json({ success: true, cart: cartWithProducts });

            case 'updateCartItem':
                const authHeader3 = req.headers['authorization'];
                const token3 = authHeader3 && authHeader3.split(' ')[1];

                if (!token3) {
                    return res.status(401).json({ error: 'Authentication required' });
                }

                let userId3;
                try {
                    const decoded = jwt.verify(token3, JWT_SECRET);
                    userId3 = decoded.id;
                } catch (err) {
                    return res.status(403).json({ error: 'Invalid token' });
                }

                const itemToUpdate = db.cart.find(
                    item => item.id === data.cartItemId && item.userId === userId3
                );

                if (!itemToUpdate) {
                    return res.status(404).json({ error: 'Cart item not found' });
                }

                itemToUpdate.quantity = data.quantity;
                return res.json({ success: true, message: 'Cart updated' });

            case 'removeFromCart':
                const authHeader4 = req.headers['authorization'];
                const token4 = authHeader4 && authHeader4.split(' ')[1];

                if (!token4) {
                    return res.status(401).json({ error: 'Authentication required' });
                }

                let userId4;
                try {
                    const decoded = jwt.verify(token4, JWT_SECRET);
                    userId4 = decoded.id;
                } catch (err) {
                    return res.status(403).json({ error: 'Invalid token' });
                }

                const itemIndex = db.cart.findIndex(
                    item => item.id === data.cartItemId && item.userId === userId4
                );

                if (itemIndex === -1) {
                    return res.status(404).json({ error: 'Cart item not found' });
                }

                db.cart.splice(itemIndex, 1);
                return res.json({ success: true, message: 'Item removed from cart' });

            // ========== ORDER ACTIONS ==========
            case 'createOrder':
                const authHeader5 = req.headers['authorization'];
                const token5 = authHeader5 && authHeader5.split(' ')[1];

                if (!token5) {
                    return res.status(401).json({ error: 'Authentication required' });
                }

                let userId5;
                try {
                    const decoded = jwt.verify(token5, JWT_SECRET);
                    userId5 = decoded.id;
                } catch (err) {
                    return res.status(403).json({ error: 'Invalid token' });
                }

                const userCartItems = db.cart.filter(item => item.userId === userId5);
                if (userCartItems.length === 0) {
                    return res.status(400).json({ error: 'Cart is empty' });
                }

                const orderItems = userCartItems.map(item => {
                    const product = db.products.find(p => p.id === item.productId);
                    return {
                        productId: item.productId,
                        name: product.name,
                        price: product.price,
                        quantity: item.quantity,
                        image: product.image
                    };
                });

                const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

                const newOrder = {
                    id: db.orders.length + 1,
                    userId: userId5,
                    items: orderItems,
                    total,
                    shippingAddress: data.shippingAddress,
                    paymentMethod: data.paymentMethod,
                    status: 'Processing',
                    createdAt: new Date()
                };

                db.orders.push(newOrder);

                // Clear user's cart
                db.cart = db.cart.filter(item => item.userId !== userId5);

                return res.json({ success: true, order: newOrder });

            case 'getOrders':
                const authHeader6 = req.headers['authorization'];
                const token6 = authHeader6 && authHeader6.split(' ')[1];

                if (!token6) {
                    return res.status(401).json({ error: 'Authentication required' });
                }

                let userId6;
                try {
                    const decoded = jwt.verify(token6, JWT_SECRET);
                    userId6 = decoded.id;
                } catch (err) {
                    return res.status(403).json({ error: 'Invalid token' });
                }

                const userOrders = db.orders.filter(order => order.userId === userId6);
                return res.json({ success: true, orders: userOrders });

            case 'getOrder':
                const authHeader7 = req.headers['authorization'];
                const token7 = authHeader7 && authHeader7.split(' ')[1];

                if (!token7) {
                    return res.status(401).json({ error: 'Authentication required' });
                }

                let userId7;
                try {
                    const decoded = jwt.verify(token7, JWT_SECRET);
                    userId7 = decoded.id;
                } catch (err) {
                    return res.status(403).json({ error: 'Invalid token' });
                }

                const order = db.orders.find(o => o.id === data.orderId && o.userId === userId7);
                if (!order) {
                    return res.status(404).json({ error: 'Order not found' });
                }

                return res.json({ success: true, order });

            // ========== WISHLIST ACTIONS ==========
            case 'addToWishlist':
                // Simplified - in production, store in database
                return res.json({ success: true, message: 'Added to wishlist' });

            case 'removeFromWishlist':
                return res.json({ success: true, message: 'Removed from wishlist' });

            // ========== REVIEW ACTIONS ==========
            case 'addReview':
                const productToReview = db.products.find(p => p.id === data.productId);
                if (!productToReview) {
                    return res.status(404).json({ error: 'Product not found' });
                }

                // Simplified - in production, store reviews separately
                productToReview.reviews += 1;
                return res.json({ success: true, message: 'Review added' });

            // ========== ADMIN ACTIONS ==========
            case 'getDashboardStats':
                const authHeaderAdmin = req.headers['authorization'];
                const tokenAdmin = authHeaderAdmin && authHeaderAdmin.split(' ')[1];

                if (!tokenAdmin) {
                    return res.status(401).json({ error: 'Authentication required' });
                }

                let userAdmin;
                try {
                    userAdmin = jwt.verify(tokenAdmin, JWT_SECRET);
                } catch (err) {
                    return res.status(403).json({ error: 'Invalid token' });
                }

                if (userAdmin.role !== 'admin') {
                    return res.status(403).json({ error: 'Admin access required' });
                }

                // Calculate stats
                const totalRevenue = db.orders.reduce((sum, order) => sum + order.total, 0);
                const totalOrders = db.orders.length;
                const totalUsers = db.users.length;
                const totalProducts = db.products.length;
                const lowStockProducts = db.products.filter(p => p.stock < 20).length;

                // Recent orders
                const recentOrders = db.orders
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 5);

                // Top products by sales
                const productSales = {};
                db.orders.forEach(order => {
                    order.items.forEach(item => {
                        if (!productSales[item.productId]) {
                            productSales[item.productId] = { ...item, totalSold: 0 };
                        }
                        productSales[item.productId].totalSold += item.quantity;
                    });
                });

                const topProducts = Object.values(productSales)
                    .sort((a, b) => b.totalSold - a.totalSold)
                    .slice(0, 5);

                return res.json({
                    success: true,
                    stats: {
                        totalRevenue,
                        totalOrders,
                        totalUsers,
                        totalProducts,
                        lowStockProducts,
                        recentOrders,
                        topProducts
                    }
                });

            case 'getAllUsers':
                const authHeaderUsers = req.headers['authorization'];
                const tokenUsers = authHeaderUsers && authHeaderUsers.split(' ')[1];

                if (!tokenUsers) {
                    return res.status(401).json({ error: 'Authentication required' });
                }

                let userUsers;
                try {
                    userUsers = jwt.verify(tokenUsers, JWT_SECRET);
                } catch (err) {
                    return res.status(403).json({ error: 'Invalid token' });
                }

                if (userUsers.role !== 'admin') {
                    return res.status(403).json({ error: 'Admin access required' });
                }

                const usersWithoutPasswords = db.users.map(u => ({
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    role: u.role,
                    createdAt: u.createdAt
                }));

                return res.json({ success: true, users: usersWithoutPasswords });

            case 'getAllOrders':
                const authHeaderAllOrders = req.headers['authorization'];
                const tokenAllOrders = authHeaderAllOrders && authHeaderAllOrders.split(' ')[1];

                if (!tokenAllOrders) {
                    return res.status(401).json({ error: 'Authentication required' });
                }

                let userAllOrders;
                try {
                    userAllOrders = jwt.verify(tokenAllOrders, JWT_SECRET);
                } catch (err) {
                    return res.status(403).json({ error: 'Invalid token' });
                }

                if (userAllOrders.role !== 'admin') {
                    return res.status(403).json({ error: 'Admin access required' });
                }

                return res.json({ success: true, orders: db.orders });

            case 'updateOrderStatus':
                const authHeaderUpdateOrder = req.headers['authorization'];
                const tokenUpdateOrder = authHeaderUpdateOrder && authHeaderUpdateOrder.split(' ')[1];

                if (!tokenUpdateOrder) {
                    return res.status(401).json({ error: 'Authentication required' });
                }

                let userUpdateOrder;
                try {
                    userUpdateOrder = jwt.verify(tokenUpdateOrder, JWT_SECRET);
                } catch (err) {
                    return res.status(403).json({ error: 'Invalid token' });
                }

                if (userUpdateOrder.role !== 'admin') {
                    return res.status(403).json({ error: 'Admin access required' });
                }

                const orderToUpdate = db.orders.find(o => o.id === data.orderId);
                if (!orderToUpdate) {
                    return res.status(404).json({ error: 'Order not found' });
                }

                orderToUpdate.status = data.status;
                return res.json({ success: true, message: 'Order status updated', order: orderToUpdate });

            case 'updateProduct':
                const authHeaderUpdateProduct = req.headers['authorization'];
                const tokenUpdateProduct = authHeaderUpdateProduct && authHeaderUpdateProduct.split(' ')[1];

                if (!tokenUpdateProduct) {
                    return res.status(401).json({ error: 'Authentication required' });
                }

                let userUpdateProduct;
                try {
                    userUpdateProduct = jwt.verify(tokenUpdateProduct, JWT_SECRET);
                } catch (err) {
                    return res.status(403).json({ error: 'Invalid token' });
                }

                if (userUpdateProduct.role !== 'admin') {
                    return res.status(403).json({ error: 'Admin access required' });
                }

                const productToUpdate = db.products.find(p => p.id === data.id);
                if (!productToUpdate) {
                    return res.status(404).json({ error: 'Product not found' });
                }

                Object.assign(productToUpdate, data);
                return res.json({ success: true, message: 'Product updated', product: productToUpdate });

            case 'getUserProfile':
                const authHeaderProfile = req.headers['authorization'];
                const tokenProfile = authHeaderProfile && authHeaderProfile.split(' ')[1];

                if (!tokenProfile) {
                    return res.status(401).json({ error: 'Authentication required' });
                }

                let userProfile;
                try {
                    userProfile = jwt.verify(tokenProfile, JWT_SECRET);
                } catch (err) {
                    return res.status(403).json({ error: 'Invalid token' });
                }

                if (userProfile.role === 'admin') {
                    return res.json({
                        success: true,
                        profile: {
                            id: 0,
                            name: 'Admin',
                            email: ADMIN_EMAIL,
                            role: 'admin',
                            createdAt: new Date()
                        }
                    });
                }

                const userProfileData = db.users.find(u => u.id === userProfile.id);
                if (!userProfileData) {
                    return res.status(404).json({ error: 'User not found' });
                }

                return res.json({
                    success: true,
                    profile: {
                        id: userProfileData.id,
                        name: userProfileData.name,
                        email: userProfileData.email,
                        role: userProfileData.role,
                        createdAt: userProfileData.createdAt
                    }
                });

            default:
                return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

app.listen(PORT, () => {
    console.log(`🚀 E-commerce API Server running on http://localhost:${PORT}`);
    console.log(`📡 Single API endpoint: POST http://localhost:${PORT}/api`);
});
