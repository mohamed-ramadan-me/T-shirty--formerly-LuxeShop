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
            setStats(response.stats);
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
            await adminService.updateProduct(editingProduct);
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
                    <div className="skeleton" style={{ height: '400px' }}></div>
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
                                <div className="stat-icon revenue">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="12" y1="1" x2="12" y2="23" />
                                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                    </svg>
                                </div>
                                <div className="stat-info">
                                    <div className="stat-label">Total Revenue</div>
                                    <div className="stat-value">${stats?.totalRevenue?.toFixed(2) || '0.00'}</div>
                                </div>
                            </div>

                            <div className="stat-card card glass">
                                <div className="stat-icon orders">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                    </svg>
                                </div>
                                <div className="stat-info">
                                    <div className="stat-label">Total Orders</div>
                                    <div className="stat-value">{stats?.totalOrders || 0}</div>
                                </div>
                            </div>

                            <div className="stat-card card glass">
                                <div className="stat-icon users">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                </div>
                                <div className="stat-info">
                                    <div className="stat-label">Total Users</div>
                                    <div className="stat-value">{stats?.totalUsers || 0}</div>
                                </div>
                            </div>

                            <div className="stat-card card glass">
                                <div className="stat-icon products">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                        <line x1="12" y1="22.08" x2="12" y2="12" />
                                    </svg>
                                </div>
                                <div className="stat-info">
                                    <div className="stat-label">Total Products</div>
                                    <div className="stat-value">{stats?.totalProducts || 0}</div>
                                </div>
                            </div>
                        </div>

                        {stats?.lowStockProducts > 0 && (
                            <div className="alert-card card">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                                <div>
                                    <strong>Low Stock Alert!</strong>
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
                                                <tr key={order.id}>
                                                    <td>#{order.id}</td>
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

                        <div className="dashboard-section">
                            <h2>Top Selling Products</h2>
                            <div className="top-products-grid">
                                {stats?.topProducts?.length > 0 ? (
                                    stats.topProducts.map((product, index) => (
                                        <div key={index} className="top-product-card card glass">
                                            <img src={product.image} alt={product.name} />
                                            <div className="top-product-info">
                                                <h4>{product.name}</h4>
                                                <p className="sold-count">{product.totalSold} sold</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="empty-message">No sales data yet</p>
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
                                                <tr key={order.id}>
                                                    <td><strong>#{order.id}</strong></td>
                                                    <td>User #{order.userId}</td>
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
                                                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
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
                            <p className="subtitle">Manage your product catalog</p>
                        </div>

                        {productsLoading ? (
                            <div className="loading-spinner">Loading products...</div>
                        ) : (
                            <div className="products-grid">
                                {allProducts.map((product) => (
                                    <div key={product.id} className="product-management-card card glass">
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
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                </svg>
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
                            <button className="modal-close" onClick={() => setShowEditModal(false)}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
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
                                    <option value="Electronics">Electronics</option>
                                    <option value="Fashion">Fashion</option>
                                    <option value="Sports">Sports</option>
                                    <option value="Home">Home</option>
                                    <option value="Accessories">Accessories</option>
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
