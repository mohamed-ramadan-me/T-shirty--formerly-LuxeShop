require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const MONGO_URI = process.env.MONGO_URI;


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

            // ========== PROFILE ACTIONS ==========
            case 'getUserProfile':
                const userIdProfile = getUserIdFromToken();
                const userProfile = await User.findById(userIdProfile).select('-password');
                if (!userProfile) return res.status(404).json({ error: 'User not found' });
                return res.json({ success: true, profile: userProfile });

            // ========== ADMIN ACTIONS ==========
            case 'getDashboardStats':
                checkAdmin();

                const totalRevenueResult = await Order.aggregate([{ $group: { _id: null, total: { $sum: "$total" } } }]);
                const totalRevenue = totalRevenueResult[0]?.total || 0;

                const totalOrders = await Order.countDocuments();
                const totalUsers = await User.countDocuments({ role: 'user' });
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

            case 'addProduct':
                checkAdmin();
                const newProduct = await Product.create({
                    name: data.name,
                    price: data.price,
                    category: data.category,
                    image: data.image,
                    description: data.description,
                    stock: data.stock,
                    rating: data.rating || 4.5,
                    reviews: data.reviews || 0
                });
                return res.json({ success: true, message: 'Product added successfully', product: newProduct });

            case 'deleteProduct':
                checkAdmin();
                const deletedProduct = await Product.findByIdAndDelete(data.id);
                return res.json({ success: true, message: 'Product deleted successfully', product: deletedProduct });

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
                // Basic Collection (6 products)
                { name: 'Classic Black T-Shirt', price: 19.99, category: 'Basic', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', description: 'Premium 100% cotton black t-shirt. Available in sizes S-XXL. Perfect everyday essential with superior comfort and durability.', stock: 150, rating: 4.8, reviews: 342 },
                { name: 'Pure White T-Shirt', price: 18.99, category: 'Basic', image: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=500', description: 'Crisp white t-shirt in premium cotton. Classic fit, sizes S-XXL. Versatile wardrobe staple that never goes out of style.', stock: 200, rating: 4.7, reviews: 298 },
                { name: 'Navy Blue T-Shirt', price: 19.99, category: 'Basic', image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500', description: 'Deep navy blue t-shirt in soft cotton blend. Sizes S-XXL. Perfect for casual and semi-formal occasions.', stock: 120, rating: 4.6, reviews: 215 },
                { name: 'Heather Grey T-Shirt', price: 17.99, category: 'Basic', image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500', description: 'Comfortable heather grey tee with relaxed fit. 100% cotton, sizes S-XXL. Ideal for layering or wearing solo.', stock: 180, rating: 4.7, reviews: 267 },
                { name: 'Olive Green T-Shirt', price: 18.99, category: 'Basic', image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500', description: 'Trendy olive green t-shirt in premium fabric. Regular fit, sizes S-XXL. Adds color to your casual wardrobe.', stock: 95, rating: 4.5, reviews: 189 },
                { name: 'Burgundy Red T-Shirt', price: 19.99, category: 'Basic', image: 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=500', description: 'Rich burgundy red tee in soft cotton. Classic cut, sizes S-XXL. Bold yet versatile color option.', stock: 110, rating: 4.6, reviews: 178 },

                // Premium Collection (4 products)
                { name: 'Midnight Black Premium', price: 29.99, category: 'Premium', image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500', description: 'Luxurious Pima cotton black t-shirt. Tailored fit with reinforced stitching. Sizes S-XXL. Premium quality that lasts.', stock: 75, rating: 4.9, reviews: 234 },
                { name: 'Pearl White Premium', price: 28.99, category: 'Premium', image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500', description: 'Elegant pearl white tee in Supima cotton. Slim fit, sizes S-XXL. Exceptional softness and color retention.', stock: 85, rating: 4.8, reviews: 201 },
                { name: 'Royal Blue Premium', price: 27.99, category: 'Premium', image: 'https://images.unsplash.com/photo-1588117305388-c2631a279f82?w=500', description: 'Sophisticated royal blue in premium Egyptian cotton. Modern fit, sizes S-XXL. Breathable and ultra-comfortable.', stock: 60, rating: 4.9, reviews: 156 },
                { name: 'Charcoal Grey Premium', price: 26.99, category: 'Premium', image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500', description: 'Refined charcoal grey premium tee. Organic cotton blend, sizes S-XXL. Perfect balance of style and comfort.', stock: 70, rating: 4.7, reviews: 187 },

                // Graphic Collection (4 products)
                { name: 'Mountain Adventure Print', price: 24.99, category: 'Graphic', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500', description: 'Outdoor-inspired mountain graphic on quality cotton. Regular fit, sizes S-XXL. For adventure enthusiasts.', stock: 90, rating: 4.6, reviews: 223 },
                { name: 'Ocean Waves Design', price: 23.99, category: 'Graphic', image: 'https://images.unsplash.com/photo-1598032895397-62085f3ca70b?w=500', description: 'Coastal vibes with ocean wave print. Soft blend fabric, sizes S-XXL. Relaxed beach-inspired style.', stock: 100, rating: 4.5, reviews: 198 },
                { name: 'Sunset Vibes Tee', price: 25.99, category: 'Graphic', image: 'https://images.unsplash.com/photo-1618453292507-4959ece6429e?w=500', description: 'Vibrant sunset gradient graphic tee. Premium print quality, sizes S-XXL. Stand out with artistic flair.', stock: 80, rating: 4.7, reviews: 245 },
                { name: 'Urban Street Art', price: 27.99, category: 'Graphic', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500', description: 'Bold street art inspired design. High-quality print on cotton, sizes S-XXL. Urban culture statement piece.', stock: 65, rating: 4.8, reviews: 267 },

                // Vintage Collection (4 products)
                { name: 'Faded Denim Blue', price: 23.99, category: 'Vintage', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500', description: 'Vintage-washed denim blue tee. Soft worn-in feel, sizes S-XXL. Retro style with modern comfort.', stock: 95, rating: 4.6, reviews: 178 },
                { name: 'Vintage Mustard Yellow', price: 24.99, category: 'Vintage', image: 'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=500', description: 'Retro mustard yellow with distressed finish. Comfortable relaxed fit, sizes S-XXL. \'70s inspired color.', stock: 70, rating: 4.5, reviews: 134 },
                { name: 'Retro Orange', price: 22.99, category: 'Vintage', image: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=500', description: 'Burnt orange vintage tee with faded effect. Soft cotton blend, sizes S-XXL. Throwback style perfect for layering.', stock: 85, rating: 4.4, reviews: 145 },
                { name: 'Washed Pink', price: 26.99, category: 'Vintage', image: 'https://images.unsplash.com/photo-1618354691551-44de113f0164?w=500', description: 'Soft washed pink with vintage appeal. Premium fabric, sizes S-XXL. Gentle color with retro charm.', stock: 60, rating: 4.7, reviews: 167 },

                // Sports Collection (3 products)
                { name: 'Athletic Black', price: 22.99, category: 'Sports', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500', description: 'Performance athletic tee in moisture-wicking fabric. Active fit, sizes S-XXL. Built for workouts and sports.', stock: 130, rating: 4.7, reviews: 312 },
                { name: 'Performance White', price: 21.99, category: 'Sports', image: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=500', description: 'Breathable white sports tee with quick-dry technology. Athletic cut, sizes S-XXL. Ideal for active lifestyles.', stock: 145, rating: 4.6, reviews: 289 },
                { name: 'Sport Grey', price: 19.99, category: 'Sports', image: 'https://images.unsplash.com/photo-1594938328870-f57daacb06c8?w=500', description: 'Versatile grey athletic tee in technical fabric. Flexible fit, sizes S-XXL. From gym to street effortlessly.', stock: 125, rating: 4.5, reviews: 234 },

                // Oversized Collection (3 products)
                { name: 'Oversized Black', price: 32.99, category: 'Oversized', image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500', description: 'Trendy oversized black tee in premium heavy cotton. Relaxed boxy fit, sizes M-XXL. Contemporary streetwear essential.', stock: 55, rating: 4.8, reviews: 198 },
                { name: 'Oversized Cream', price: 34.99, category: 'Oversized', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500', description: 'Luxe cream oversized tee with dropped shoulders. Premium cotton, sizes M-XXL. Elevated casual style.', stock: 50, rating: 4.9, reviews: 176 },
                { name: 'Oversized Sage Green', price: 39.99, category: 'Oversized', image: 'https://images.unsplash.com/photo-1618354691229-88d47f285158?w=500', description: 'On-trend sage green in oversized silhouette. Heavyweight fabric, sizes M-XXL. Fashion-forward statement piece.', stock: 45, rating: 4.9, reviews: 203 }
            ];
            await Product.insertMany(initialProducts);
            console.log("✅ Database seeded!");
        }
    } catch (e) {
        console.error("Seeding error:", e);
    }
});