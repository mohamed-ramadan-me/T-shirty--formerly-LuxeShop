import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService, cartService } from '../services/api';
import './Checkout.css';

const Checkout = ({ onCartUpdate }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [cartTotal, setCartTotal] = useState(0);
    const [cartCount, setCartCount] = useState(0);
    
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        address: '',
        city: '',
        zipCode: '',
        country: '',
        paymentMethod: 'credit-card'
    });

    // Fetch cart data to display summary
    useEffect(() => {
        const loadCartSummary = async () => {
            try {
                const res = await cartService.getCart();
                if (res.success) {
                    const total = res.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
                    setCartTotal(total);
                    setCartCount(res.cart.length);
                }
            } catch (error) {
                console.error("Could not load cart summary");
            }
        };
        loadCartSummary();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // CRITICAL FIX: Format address as a string for the backend Schema
            const formattedAddress = `${formData.fullName}, ${formData.address}, ${formData.city}, ${formData.zipCode}, ${formData.country}`;

            const response = await orderService.createOrder({
                shippingAddress: formattedAddress,
                paymentMethod: formData.paymentMethod
            });

            if (response.success) {
                // Update global cart state
                if (onCartUpdate) onCartUpdate();
                // Navigate to orders page
                navigate('/orders?success=true');
            } else {
                alert(response.error || 'Failed to create order');
            }
        } catch (error) {
            console.error('Error creating order:', error);
            alert('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="checkout-page">
            <div className="container">
                <h1 className="page-title">Checkout</h1>

                <div className="checkout-layout">
                    <form onSubmit={handleSubmit} className="checkout-form">
                        <div className="form-section card">
                            <h2 className="section-title">Shipping Information</h2>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        className="input"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="input"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label className="form-label">Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        className="input"
                                        value={formData.address}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        className="input"
                                        value={formData.city}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">ZIP Code</label>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        className="input"
                                        value={formData.zipCode}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label className="form-label">Country</label>
                                    <input
                                        type="text"
                                        name="country"
                                        className="input"
                                        value={formData.country}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-section card">
                            <h2 className="section-title">Payment Method</h2>

                            <div className="payment-methods">
                                <label className="payment-option">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="credit-card"
                                        checked={formData.paymentMethod === 'credit-card'}
                                        onChange={handleChange}
                                    />
                                    <div className="payment-option-content">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                                            <line x1="1" y="10" x2="23" y2="10" />
                                        </svg>
                                        <span>Credit Card</span>
                                    </div>
                                </label>

                                <label className="payment-option">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="paypal"
                                        checked={formData.paymentMethod === 'paypal'}
                                        onChange={handleChange}
                                    />
                                    <div className="payment-option-content">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M12 6v6l4 2" />
                                        </svg>
                                        <span>PayPal</span>
                                    </div>
                                </label>

                                <label className="payment-option">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cash"
                                        checked={formData.paymentMethod === 'cash'}
                                        onChange={handleChange}
                                    />
                                    <div className="payment-option-content">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="12" y1="1" x2="12" y2="23" />
                                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                        </svg>
                                        <span>Cash on Delivery</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
                            {loading ? (
                                <>
                                    <div className="spinner"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Place Order (${(cartTotal * 1.1).toFixed(2)})
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="order-summary-sidebar">
                        <div className="card glass">
                            <h3 className="summary-title">Order Summary</h3>
                            
                            <div className="summary-row">
                                <span>Items ({cartCount})</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Tax (10%)</span>
                                <span>${(cartTotal * 0.1).toFixed(2)}</span>
                            </div>
                            <div className="summary-row" style={{fontWeight: 'bold', marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '10px'}}>
                                <span>Total</span>
                                <span>${(cartTotal * 1.1).toFixed(2)}</span>
                            </div>

                            <p className="summary-note" style={{marginTop: '20px'}}>
                                Review your cart before placing the order
                            </p>
                            <button className="btn btn-ghost" onClick={() => navigate('/cart')}>
                                View Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;