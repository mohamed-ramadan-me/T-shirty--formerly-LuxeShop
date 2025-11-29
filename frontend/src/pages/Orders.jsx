import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { orderService } from '../services/api';
import './Orders.css';

const Orders = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const showSuccess = searchParams.get('success') === 'true';

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const response = await orderService.getOrders();
            if (response.success) {
                setOrders(response.orders);
            } else {
                // Handle API errors (like expired token)
                if (response.error && (response.error.includes('token') || response.error.includes('Auth'))) {
                    navigate('/login');
                }
            }
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="orders-page">
                <div className="container">
                    <div className="skeleton" style={{ height: '400px' }}>Loading orders...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="orders-page">
            <div className="container">
                <h1 className="page-title">My Orders</h1>

                {showSuccess && (
                    <div className="success-message animate-fade-in">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <div>
                            <strong>Order placed successfully!</strong>
                            <p>Thank you for your purchase. We'll send you a confirmation email shortly.</p>
                        </div>
                    </div>
                )}

                {!orders || orders.length === 0 ? (
                    <div className="empty-orders">
                        <div className="empty-icon">
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                            </svg>
                        </div>
                        <h2>No orders yet</h2>
                        <p>Start shopping to see your orders here!</p>
                        <button className="btn btn-primary" onClick={() => navigate('/products')}>
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map((order) => (
                            // CRITICAL CHANGE: Use order._id here
                            <div key={order._id} className="order-card card animate-fade-in">
                                <div className="order-header">
                                    <div className="order-info">
                                        {/* Display a cleaner, shorter ID */}
                                        <h3 className="order-id">Order #{order._id.slice(-6)}</h3>
                                        <p className="order-date">{formatDate(order.createdAt)}</p>
                                    </div>
                                    <div className="order-status">
                                        <span className={`status-badge badge-${order.status.toLowerCase()}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="order-items">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="order-item">
                                            <img src={item.image} alt={item.name} className="order-item-image" />
                                            <div className="order-item-details">
                                                <h4 className="order-item-name">{item.name}</h4>
                                                <p className="order-item-quantity">Quantity: {item.quantity}</p>
                                            </div>
                                            <div className="order-item-price">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="order-footer">
                                    <div className="order-address">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        {/* CRITICAL CHANGE: Display address string directly */}
                                        <span>
                                            {order.shippingAddress}
                                        </span>
                                    </div>
                                    <div className="order-total">
                                        <span>Total:</span>
                                        <span className="total-amount">${order.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;