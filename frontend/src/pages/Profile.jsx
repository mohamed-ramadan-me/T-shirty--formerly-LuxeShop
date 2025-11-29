import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileService, orderService, authService } from '../services/api';
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authService.isAuthenticated()) {
            navigate('/login');
            return;
        }
        loadData();
    }, [navigate]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load profile and orders in parallel
            const [profileRes, ordersRes] = await Promise.all([
                profileService.getUserProfile(),
                orderService.getOrders()
            ]);

            if (profileRes.success) {
                setProfile(profileRes.profile);
            }
            
            if (ordersRes.success) {
                setOrders(ordersRes.orders);
            }
        } catch (error) {
            console.error('Error loading profile data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="profile-page">
                <div className="container">
                    <div className="skeleton" style={{ height: '400px' }}>Loading Profile...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="container">
                <h1 className="page-title">My Profile</h1>

                <div className="profile-layout">
                    <div className="profile-sidebar">
                        <div className="profile-card card glass">
                            <div className="profile-avatar">
                                {profile?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <h2 className="profile-name">{profile?.name}</h2>
                            <p className="profile-email">{profile?.email}</p>
                            <div className="profile-badge">
                                {profile?.role === 'admin' ? (
                                    <span className="badge badge-warning">Admin</span>
                                ) : (
                                    <span className="badge badge-primary">Customer</span>
                                )}
                            </div>
                            <div className="profile-meta">
                                <p>Member since</p>
                                <p className="meta-value">
                                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }) : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="profile-content">
                        <div className="profile-section card glass">
                            <h3>Account Information</h3>
                            <div className="info-grid">
                                <div className="info-item">
                                    <label>Full Name</label>
                                    <p>{profile?.name}</p>
                                </div>
                                <div className="info-item">
                                    <label>Email Address</label>
                                    <p>{profile?.email}</p>
                                </div>
                                <div className="info-item">
                                    <label>Account Type</label>
                                    <p>{profile?.role === 'admin' ? 'Administrator' : 'Customer'}</p>
                                </div>
                                <div className="info-item">
                                    <label>User ID</label>
                                    {/* CRITICAL CHANGE: Use _id for MongoDB */}
                                    <p className="id-text">#{profile?._id}</p>
                                </div>
                            </div>
                        </div>

                        <div className="profile-section card glass">
                            <h3>Order History</h3>
                            {orders && orders.length > 0 ? (
                                <div className="orders-summary">
                                    <div className="summary-stat">
                                        <div className="summary-value">{orders.length}</div>
                                        <div className="summary-label">Total Orders</div>
                                    </div>
                                    <div className="summary-stat">
                                        <div className="summary-value">
                                            ${orders.reduce((sum, order) => sum + (order.total || 0), 0).toFixed(2)}
                                        </div>
                                        <div className="summary-label">Total Spent</div>
                                    </div>
                                    <div className="summary-stat">
                                        <div className="summary-value">
                                            {orders.filter(o => o.status === 'Processing').length}
                                        </div>
                                        <div className="summary-label">Pending</div>
                                    </div>
                                </div>
                            ) : (
                                <p className="empty-message">No orders yet</p>
                            )}
                            <button className="btn btn-primary" onClick={() => navigate('/orders')}>
                                View All Orders
                            </button>
                        </div>

                        {profile?.role === 'admin' && (
                            <div className="profile-section card glass admin-section">
                                <h3>Admin Access</h3>
                                <p>You have administrator privileges for this store.</p>
                                <button className="btn btn-secondary" onClick={() => navigate('/admin')}>
                                    Go to Admin Dashboard
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;