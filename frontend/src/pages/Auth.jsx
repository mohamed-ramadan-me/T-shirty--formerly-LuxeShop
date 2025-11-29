import { useState } from 'react';
import { authService } from '../services/api';
import './Auth.css';

const Auth = () => {
  
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let response;
            if (isLogin) {
                response = await authService.login({
                    email: formData.email,
                    password: formData.password
                });
            } else {
                response = await authService.register(formData);
            }

            if (response.success) {
                // Success: Save token and user data
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                
                // Optional: Force a window reload or use a Context to update header state immediately
                window.location.href = '/'; 
            } else {
                // Handle API-returned errors (like "User already exists")
                setError(response.error || 'Authentication failed');
            }

        } catch (err) {
            console.error("Auth Error:", err);
            setError(err.error || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-visual">
                    <div className="visual-content">
                        <h1 className="visual-title gradient-text">LuxeShop</h1>
                        <p className="visual-subtitle">
                            Your premium destination for quality products and exceptional shopping experience
                        </p>
                        <div className="visual-features">
                            <div className="visual-feature">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                <span>Premium Quality Products</span>
                            </div>
                            <div className="visual-feature">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                <span>Fast & Free Shipping</span>
                            </div>
                            <div className="visual-feature">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                <span>Secure Payments</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="auth-form-container">
                    <div className="auth-form-wrapper">
                        <div className="auth-header">
                            <h2 className="auth-title">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                            <p className="auth-subtitle">
                                {isLogin ? 'Sign in to continue shopping' : 'Join us for an amazing experience'}
                            </p>
                        </div>

                        {error && (
                            <div className="error-message">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            {!isLogin && (
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="input"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required={!isLogin}
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="input"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    className="input"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
                                {loading ? (
                                    <>
                                        <div className="spinner"></div>
                                        {isLogin ? 'Signing In...' : 'Creating Account...'}
                                    </>
                                ) : (
                                    isLogin ? 'Sign In' : 'Create Account'
                                )}
                            </button>
                        </form>

                        <div className="auth-footer">
                            <p>
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <button className="auth-switch-btn" onClick={() => setIsLogin(!isLogin)}>
                                    {isLogin ? 'Sign Up' : 'Sign In'}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;