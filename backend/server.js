require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://alik69599:314DBpwCT60k9ewi@cluster0.ofici.mongodb.net/luxeshop?retryWrites=true&w=majority&appName=Cluster0';


// Middleware
app.use(cors());
app.use(express.json());


// ============================================
// MONGODB CONNECTION & SCHEMAS
// ============================================

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// 1. User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// 2. Product Schema
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    category: String,
    image: String,
    description: String,
    stock: Number,
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 }
});
const Product = mongoose.model('Product', productSchema);

// 3. Cart Schema
const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, default: 1 },
    addedAt: { type: Date, default: Date.now }
});
const Cart = mongoose.model('Cart', cartSchema);

// 4. Order Schema
const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [{
        productId: String, // Store ID as string for history
        name: String,
        price: Number,
        quantity: Number,
        image: String
    }],
    total: Number,
    shippingAddress: String,
    paymentMethod: String,
    status: { type: String, default: 'Processing' },
    createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access token required' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = user;
        next();
    });
};

// ============================================
// SINGLE UNIFIED API ENDPOINT (Refactored)
// ============================================
app.post('/api', async (req, res) => {
    const { action, data } = req.body;

    // Helper: Get user ID from token inside the endpoint
    const getUserIdFromToken = () => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) throw new Error('No token');
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded.id; // This is now a MongoDB ObjectId string
    };

    // Helper: Check Admin
    const checkAdmin = () => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) throw new Error('No token');
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'admin') throw new Error('Not admin');
        return decoded;
    };

    try {
        switch (action) {
            // ========== AUTH ACTIONS ==========
            case 'register':
                const existingUser = await User.findOne({ email: data.email });
                if (existingUser) return res.status(400).json({ error: 'User already exists' });

                const hashedPassword = await bcrypt.hash(data.password, 10);
                const newUser = await User.create({
                    name: data.name,
                    email: data.email,
                    password: hashedPassword,
                    role: 'user'
                });

                const registerToken = jwt.sign(
                    { id: newUser._id, email: newUser.email, role: newUser.role },
                    JWT_SECRET, { expiresIn: '7d' }
                );

                return res.json({
                    success: true,
                    token: registerToken,
                    user: { id: newUser._id, email: newUser.email, name: newUser.name, role: newUser.role }
                });


        case 'login':
            
            const user = await User.findOne({ email: data.email });
            
            if (!user) return res.status(400).json({ error: 'Invalid credentials' });

            const validPassword = await bcrypt.compare(data.password, user.password);
            if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

            // Important: We pull the 'role' directly from the database document
            const loginToken = jwt.sign(
                { 
                    id: user._id, 
                    email: user.email, 
                    role: user.role 
                },
                JWT_SECRET, 
                { expiresIn: '7d' }
            );

            // 5. Return response
            return res.json({
                success: true,
                token: loginToken,
                user: { 
                    id: user._id, 
                    email: user.email, 
                    name: user.name, 
                    role: user.role 
                }
            });
            // ========== PRODUCT ACTIONS ==========
            case 'getProducts':
                let query = {};
                if (data?.category && data.category !== 'All') {
                    query.category = data.category;
                }
                if (data?.search) {
                    query.$or = [
                        { name: { $regex: data.search, $options: 'i' } },
                        { description: { $regex: data.search, $options: 'i' } }
                    ];
                }

                let productsQuery = Product.find(query);

                if (data?.sort) {
                    if (data.sort === 'price-low') productsQuery.sort({ price: 1 });
                    if (data.sort === 'price-high') productsQuery.sort({ price: -1 });
                    if (data.sort === 'rating') productsQuery.sort({ rating: -1 });
                    if (data.sort === 'popular') productsQuery.sort({ reviews: -1 });
                }

                const products = await productsQuery;
                return res.json({ success: true, products });

            case 'getProduct':
                const product = await Product.findById(data.id);
                if (!product) return res.status(404).json({ error: 'Product not found' });
                return res.json({ success: true, product });

            case 'getCategories':
                const distinctCategories = await Product.distinct('category');
                return res.json({ success: true, categories: ['All', ...distinctCategories] });

            // ========== CART ACTIONS ==========
            case 'addToCart':
                const userIdCart = getUserIdFromToken();
                const existingItem = await Cart.findOne({ userId: userIdCart, productId: data.productId });

                if (existingItem) {
                    existingItem.quantity += data.quantity || 1;
                    await existingItem.save();
                } else {
                    await Cart.create({
                        userId: userIdCart,
                        productId: data.productId,
                        quantity: data.quantity || 1
                    });
                }
                return res.json({ success: true, message: 'Added to cart' });

            case 'getCart':
                const userIdGetCart = getUserIdFromToken();
                // .populate() automatically fetches the product details based on the ObjectId
                const cartItems = await Cart.find({ userId: userIdGetCart }).populate('productId');
                
                // Format matches frontend expectation
                const formattedCart = cartItems.map(item => ({
                    _id: item._id, // cart item id
                    userId: item.userId,
                    quantity: item.quantity,
                    productId: item.productId._id,
                    product: item.productId // populated product object
                }));

                return res.json({ success: true, cart: formattedCart });

            case 'updateCartItem':
                getUserIdFromToken(); // Just verify token
                await Cart.findByIdAndUpdate(data.cartItemId, { quantity: data.quantity });
                return res.json({ success: true, message: 'Cart updated' });

            case 'removeFromCart':
                getUserIdFromToken(); // Just verify token
                await Cart.findByIdAndDelete(data.cartItemId);
                return res.json({ success: true, message: 'Item removed' });

            // ========== ORDER ACTIONS ==========
            case 'createOrder':
                const userIdOrder = getUserIdFromToken();
                
                // Get cart with product details
                const userCart = await Cart.find({ userId: userIdOrder }).populate('productId');
                
                if (userCart.length === 0) return res.status(400).json({ error: 'Cart is empty' });

                const orderItems = userCart.map(item => ({
                    productId: item.productId._id,
                    name: item.productId.name,
                    price: item.productId.price,
                    quantity: item.quantity,
                    image: item.productId.image
                }));

                const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

                const newOrder = await Order.create({
                    userId: userIdOrder,
                    items: orderItems,
                    total,
                    shippingAddress: data.shippingAddress,
                    paymentMethod: data.paymentMethod
                });

                // Clear Cart
                await Cart.deleteMany({ userId: userIdOrder });

                return res.json({ success: true, order: newOrder });

            case 'getOrders':
                const userIdOrders = getUserIdFromToken();
                const orders = await Order.find({ userId: userIdOrders }).sort({ createdAt: -1 });
                return res.json({ success: true, orders });

            case 'getOrder':
                const userIdSingleOrder = getUserIdFromToken();
                const singleOrder = await Order.findOne({ _id: data.orderId, userId: userIdSingleOrder });
                if (!singleOrder) return res.status(404).json({ error: 'Order not found' });
                return res.json({ success: true, order: singleOrder });

            // ========== REVIEWS & WISHLIST ==========
            case 'addToWishlist':
            case 'removeFromWishlist':
                return res.json({ success: true, message: 'Wishlist updated' });

            case 'addReview':
                await Product.findByIdAndUpdate(data.productId, { $inc: { reviews: 1 } });
                return res.json({ success: true, message: 'Review added' });

            // ========== ADMIN ACTIONS ==========
            case 'getDashboardStats':
                checkAdmin();
                
                const totalRevenueResult = await Order.aggregate([{ $group: { _id: null, total: { $sum: "$total" } } }]);
                const totalRevenue = totalRevenueResult[0]?.total || 0;
                
                const totalOrders = await Order.countDocuments();
                const totalUsers = await User.countDocuments();
                const totalProducts = await Product.countDocuments();
                const lowStockProducts = await Product.countDocuments({ stock: { $lt: 20 } });
                
                const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);
                const topProducts = await Product.find().sort({ reviews: -1 }).limit(5); // Simplified "top" based on reviews

                return res.json({
                    success: true,
                    stats: { totalRevenue, totalOrders, totalUsers, totalProducts, lowStockProducts, recentOrders, topProducts }
                });

            case 'getAllUsers':
                checkAdmin();
                const users = await User.find().select('-password'); // Exclude password
                return res.json({ success: true, users });

            case 'getAllOrders':
                checkAdmin();
                const allOrders = await Order.find().sort({ createdAt: -1 });
                return res.json({ success: true, orders: allOrders });

            case 'updateOrderStatus':
                checkAdmin();
                const updatedOrder = await Order.findByIdAndUpdate(data.orderId, { status: data.status }, { new: true });
                return res.json({ success: true, message: 'Order status updated', order: updatedOrder });

            case 'updateProduct':
                checkAdmin();
                const updatedProd = await Product.findByIdAndUpdate(data.id, data, { new: true });
                return res.json({ success: true, message: 'Product updated', product: updatedProd });

            default:
                return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error('API Error:', error);
        // Handle Token Errors specifically
        if (error.message === 'No token' || error.message === 'jwt malformed') return res.status(401).json({ error: 'Auth required' });
        if (error.message === 'Not admin') return res.status(403).json({ error: 'Admin access required' });
        
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, async () => {
    console.log(`🚀 API Server running on port ${PORT}`);
    
    // SEED INITIAL DATA IF EMPTY
    try {
        const count = await Product.countDocuments();
        if (count === 0) {
            console.log("🌱 Seeding initial products...");
            const initialProducts = [
                 { name: 'Classic Black T-Shirt', price: 19.99, category: 'Basic', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', description: 'Premium cotton black t-shirt.', stock: 150, rating: 4.8, reviews: 342 },
                 { name: 'Pure White T-Shirt', price: 18.99, category: 'Basic', image: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=500', description: 'Crisp white t-shirt.', stock: 200, rating: 4.7, reviews: 298 },
                 { name: 'Navy Blue T-Shirt', price: 22.99, category: 'Premium', image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500', description: 'Deep navy blue premium t-shirt.', stock: 120, rating: 4.6, reviews: 215 }
                 // Add the rest of your products here...
            ];
            await Product.insertMany(initialProducts);
            console.log("✅ Database seeded!");
        }
    } catch (e) {
        console.error("Seeding error:", e);
    }
});