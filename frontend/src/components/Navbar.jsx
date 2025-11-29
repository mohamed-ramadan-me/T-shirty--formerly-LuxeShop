import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import './Navbar.css';

const Navbar = ({ cartCount = 0 }) => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const isAuthenticated = authService.isAuthenticated();
    const user = authService.getCurrentUser();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="container">
                <div className="navbar-content">
                    <Link to="/" className="navbar-logo">
                        <div className="logo-icon">
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                <path d="M16 2L2 9L16 16L30 9L16 2Z" fill="url(#gradient1)" />
                                <path d="M2 23L16 30L30 23V9L16 16L2 9V23Z" fill="url(#gradient2)" />
                                <defs>
                                    <linearGradient id="gradient1" x1="2" y1="2" x2="30" y2="16" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#667eea" />
                                        <stop offset="1" stopColor="#764ba2" />
                                    </linearGradient>
                                    <linearGradient id="gradient2" x1="2" y1="9" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#f093fb" />
                                        <stop offset="1" stopColor="#f5576c" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        <span className="logo-text gradient-text">LuxeShop</span>
                    </Link>

                    <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
                        <Link to="/" className="nav-link">Home</Link>
                        <Link to="/products" className="nav-link">Products</Link>
                        {isAuthenticated && user?.role !== 'admin' && <Link to="/orders" className="nav-link">Orders</Link>}
                    </div>

                    <div className="navbar-actions">
                        {(!isAuthenticated || user?.role !== 'admin') && (
                            <Link to="/cart" className="nav-icon-btn">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="9" cy="21" r="1" />
                                    <circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                </svg>
                                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                            </Link>
                        )}

                        {isAuthenticated ? (
                            <div className="user-menu">
                                <button className="user-btn">
                                    <div className="user-avatar">
                                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <span className="hide-mobile">{user?.name}</span>
                                </button>
                                <div className="user-dropdown">
                                    <Link to="/profile" className="dropdown-item">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                        Profile
                                    </Link>
                                    {user?.role === 'admin' && (
                                        <Link to="/admin" className="dropdown-item">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="3" width="7" height="7" />
                                                <rect x="14" y="3" width="7" height="7" />
                                                <rect x="14" y="14" width="7" height="7" />
                                                <rect x="3" y="14" width="7" height="7" />
                                            </svg>
                                            Admin Dashboard
                                        </Link>
                                    )}
                                    {user?.role !== 'admin' && (
                                        <Link to="/orders" className="dropdown-item">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                            </svg>
                                            Orders
                                        </Link>
                                    )}
                                    <button onClick={handleLogout} className="dropdown-item">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                            <polyline points="16 17 21 12 16 7" />
                                            <line x="21" y1="12" x2="9" y2="12" />
                                        </svg>
                                        Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link to="/login" className="btn btn-primary">
                                Sign In
                            </Link>
                        )}

                        <button className="mobile-menu-btn show-mobile" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                {isMenuOpen ? (
                                    <path d="M18 6L6 18M6 6l12 12" />
                                ) : (
                                    <path d="M3 12h18M3 6h18M3 18h18" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;