import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService, authService, productService } from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Orders state
    const [allOrders, setAllOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [orderFilter, setOrderFilter] = useState('all');

    // Products state
    const [allProducts, setAllProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }
        loadDashboardStats();
    }, [navigate]);

    useEffect(() => {
        if (activeTab === 'orders') {
            loadAllOrders();
        } else if (activeTab === 'products') {
            loadAllProducts();
        }
    }, [activeTab]);

    const loadDashboardStats = async () => {
        try {
            const response = await adminService.getDashboardStats();
            if (response.success) {
                setStats(response.stats);
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadAllOrders = async () => {
        setOrdersLoading(true);
        try {
            const response = await adminService.getAllOrders();
            setAllOrders(response.orders || []);
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setOrdersLoading(false);
        }
    };

    const loadAllProducts = async () => {
        setProductsLoading(true);
        try {
            const response = await productService.getProducts();
            setAllProducts(response.products || []);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setProductsLoading(false);
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            // Updated to use the correct service call
            await adminService.updateOrderStatus(orderId, newStatus);
            // Refresh orders
            loadAllOrders();
            loadDashboardStats();
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Failed to update order status');
        }
    };

    const handleEditProduct = (product) => {
        setEditingProduct({ ...product });
        setShowEditModal(true);
    };

    const handleSaveProduct = async () => {
        try {
            // IMPORTANT: Map _id to id for the backend
            const payload = {
                ...editingProduct,
                id: editingProduct._id 
            };
            
            await adminService.updateProduct(payload);
            setShowEditModal(false);
            setEditingProduct(null);
            loadAllProducts();
            loadDashboardStats();
            alert('Product updated successfully!');
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Failed to update product');
        }
    };

    const handleProductInputChange = (field, value) => {
        setEditingProduct(prev => ({
            ...prev,
            [field]: field === 'price' || field === 'stock' || field === 'rating'
                ? parseFloat(value) || 0
                : value
        }));
    };

    const getFilteredOrders = () => {
        if (orderFilter === 'all') return allOrders;
        return allOrders.filter(order => order.status.toLowerCase() === orderFilter.toLowerCase());
    };

    if (loading) {
        return (
            <div className="admin-dashboard">
                <div className="container">
                    <div className="skeleton" style={{ height: '400px' }}>Loading Dashboard...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <div className="container">
                <div className="dashboard-header">
                    <h1 className="dashboard-title">Admin Dashboard</h1>
                    <p className="dashboard-subtitle">Manage your e-commerce store</p>
                </div>

                <div className="dashboard-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        Orders
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        Products
                    </button>
                </div>

                {activeTab === 'overview' && (
                    <div className="dashboard-content animate-fade-in">
                        <div className="stats-grid">
                            <div className="stat-card card glass">
                                <div className="stat-icon revenue">💰</div>
                                <div className="stat-info">
                                    <div className="stat-label">Total Revenue</div>
                                    <div className="stat-value">${stats?.totalRevenue?.toFixed(2) || '0.00'}</div>
                                </div>
                            </div>

                            <div className="stat-card card glass">
                                <div className="stat-icon orders">📦</div>
                                <div className="stat-info">
                                    <div className="stat-label">Total Orders</div>
                                    <div className="stat-value">{stats?.totalOrders || 0}</div>
                                </div>
                            </div>

                            <div className="stat-card card glass">
                                <div className="stat-icon users">👥</div>
                                <div className="stat-info">
                                    <div className="stat-label">Total Users</div>
                                    <div className="stat-value">{stats?.totalUsers || 0}</div>
                                </div>
                            </div>

                            <div className="stat-card card glass">
                                <div className="stat-icon products">👕</div>
                                <div className="stat-info">
                                    <div className="stat-label">Total Products</div>
                                    <div className="stat-value">{stats?.totalProducts || 0}</div>
                                </div>
                            </div>
                        </div>

                        {stats?.lowStockProducts > 0 && (
                            <div className="alert-card card">
                                <div>
                                    <strong>⚠️ Low Stock Alert!</strong>
                                    <p>{stats.lowStockProducts} products have low stock (less than 20 units)</p>
                                </div>
                            </div>
                        )}

                        <div className="dashboard-section">
                            <h2>Recent Orders</h2>
                            <div className="orders-table card glass">
                                {stats?.recentOrders?.length > 0 ? (
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Order ID</th>
                                                <th>Items</th>
                                                <th>Total</th>
                                                <th>Status</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.recentOrders.map((order) => (
                                                <tr key={order._id}>
                                                    <td>#{order._id.slice(-6)}</td>
                                                    <td>{order.items.length} items</td>
                                                    <td>${order.total.toFixed(2)}</td>
                                                    <td><span className={`status-badge badge-${order.status.toLowerCase()}`}>{order.status}</span></td>
                                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="empty-message">No orders yet</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="dashboard-content animate-fade-in">
                        <div className="management-header">
                            <h2>Orders Management</h2>
                            <div className="filter-controls">
                                <select
                                    value={orderFilter}
                                    onChange={(e) => setOrderFilter(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="all">All Orders</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        {ordersLoading ? (
                            <div className="loading-spinner">Loading orders...</div>
                        ) : (
                            <div className="orders-management-table card glass">
                                {getFilteredOrders().length > 0 ? (
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Order ID</th>
                                                <th>Customer</th>
                                                <th>Items</th>
                                                <th>Total</th>
                                                <th>Status</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {getFilteredOrders().map((order) => (
                                                <tr key={order._id}>
                                                    <td><strong>#{order._id.slice(-6)}</strong></td>
                                                    <td>User #{order.userId ? order.userId.slice(-4) : 'Unknown'}</td>
                                                    <td>
                                                        <div className="order-items-preview">
                                                            {order.items.slice(0, 2).map((item, idx) => (
                                                                <span key={idx} className="item-name">{item.name}</span>
                                                            ))}
                                                            {order.items.length > 2 && (
                                                                <span className="more-items">+{order.items.length - 2} more</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td><strong>${order.total.toFixed(2)}</strong></td>
                                                    <td>
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                                                            className={`status-select status-${order.status.toLowerCase()}`}
                                                        >
                                                            <option value="Processing">Processing</option>
                                                            <option value="Shipped">Shipped</option>
                                                            <option value="Delivered">Delivered</option>
                                                            <option value="Cancelled">Cancelled</option>
                                                        </select>
                                                    </td>
                                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="empty-message">No orders found</p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'products' && (
                    <div className="dashboard-content animate-fade-in">
                        <div className="management-header">
                            <h2>Products Management</h2>
                        </div>

                        {productsLoading ? (
                            <div className="loading-spinner">Loading products...</div>
                        ) : (
                            <div className="products-grid">
                                {allProducts.map((product) => (
                                    <div key={product._id} className="product-management-card card glass">
                                        <img src={product.image} alt={product.name} className="product-img" />
                                        <div className="product-details">
                                            <h3>{product.name}</h3>
                                            <p className="product-category">{product.category}</p>
                                            <div className="product-info-row">
                                                <span className="product-price">${product.price.toFixed(2)}</span>
                                                <span className={`product-stock ${product.stock < 20 ? 'low-stock' : ''}`}>
                                                    Stock: {product.stock}
                                                </span>
                                            </div>
                                            <div className="product-rating">
                                                <span>⭐ {product.rating}</span>
                                                <span className="reviews-count">({product.reviews} reviews)</span>
                                            </div>
                                            <button
                                                className="btn btn-primary btn-edit"
                                                onClick={() => handleEditProduct(product)}
                                            >
                                                Edit Product
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Edit Product Modal */}
            {showEditModal && editingProduct && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit Product</h2>
                            <button className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Product Name</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={editingProduct.name}
                                    onChange={(e) => handleProductInputChange('name', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    className="input"
                                    rows="3"
                                    value={editingProduct.description}
                                    onChange={(e) => handleProductInputChange('description', e.target.value)}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="input"
                                        value={editingProduct.price}
                                        onChange={(e) => handleProductInputChange('price', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Stock</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={editingProduct.stock}
                                        onChange={(e) => handleProductInputChange('stock', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    className="input"
                                    value={editingProduct.category}
                                    onChange={(e) => handleProductInputChange('category', e.target.value)}
                                >
                                    <option value="Basic">Basic</option>
                                    <option value="Premium">Premium</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Image URL</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={editingProduct.image}
                                    onChange={(e) => handleProductInputChange('image', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleSaveProduct}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;