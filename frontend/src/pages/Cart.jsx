import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartService } from '../services/api';
import './Cart.css';

const Cart = ({ onCartUpdate }) => {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            const response = await cartService.getCart();
            if (response.success) {
                setCart(response.cart);
                if (onCartUpdate) onCartUpdate();
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            // Check based on how your api.js returns errors
            if (error.error === 'Authentication required' || error.error === 'Auth required') {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (cartItemId, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            // cartItemId corresponds to the MongoDB _id of the cart entry
            await cartService.updateCartItem(cartItemId, newQuantity);
            loadCart();
        } catch (error) {
            console.error('Error updating cart:', error);
        }
    };

    const removeItem = async (cartItemId) => {
        try {
            await cartService.removeFromCart(cartItemId);
            loadCart();
        } catch (error) {
            console.error('Error removing item:', error);
        }
    };

    const getTotal = () => {
        return cart.reduce((sum, item) => {
            // Safety check in case product was deleted but remains in cart
            if (!item.product) return sum; 
            return sum + (item.product.price * item.quantity);
        }, 0);
    };

    const handleCheckout = () => {
        navigate('/checkout');
    };

    if (loading) {
        return (
            <div className="cart-page">
                <div className="container">
                    <div className="skeleton" style={{ height: '400px' }}>Loading Cart...</div>
                </div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="cart-page">
                <div className="container">
                    <div className="empty-cart">
                        <div className="empty-icon">
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="9" cy="21" r="1" />
                                <circle cx="20" cy="21" r="1" />
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                            </svg>
                        </div>
                        <h2>Your cart is empty</h2>
                        <p>Add some products to get started!</p>
                        <button className="btn btn-primary" onClick={() => navigate('/products')}>
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="container">
                <h1 className="page-title">Shopping Cart</h1>

                <div className="cart-layout">
                    <div className="cart-items">
                        {cart.map((item) => (
                            // CRITICAL CHANGE: Use item._id (MongoDB ID)
                            <div key={item._id} className="cart-item card animate-fade-in">
                                <img src={item.product.image} alt={item.product.name} className="cart-item-image" />

                                <div className="cart-item-details">
                                    <h3 className="cart-item-name">{item.product.name}</h3>
                                    <p className="cart-item-category">{item.product.category}</p>
                                    <div className="cart-item-price">
                                        ${item.product.price.toFixed(2)}
                                    </div>
                                </div>

                                <div className="cart-item-actions">
                                    <div className="quantity-control">
                                        <button
                                            className="quantity-btn"
                                            // CRITICAL CHANGE: Pass item._id
                                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="5" y1="12" x2="19" y2="12" />
                                            </svg>
                                        </button>
                                        <span className="quantity-value">{item.quantity}</span>
                                        <button
                                            className="quantity-btn"
                                            // CRITICAL CHANGE: Pass item._id
                                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                            disabled={item.quantity >= item.product.stock}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="12" y1="5" x2="12" y2="19" />
                                                <line x1="5" y1="12" x2="19" y2="12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="cart-item-total">
                                        ${(item.product.price * item.quantity).toFixed(2)}
                                    </div>

                                    <button
                                        className="remove-btn"
                                        // CRITICAL CHANGE: Pass item._id
                                        onClick={() => removeItem(item._id)}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary card glass">
                        <h2 className="summary-title">Order Summary</h2>

                        <div className="summary-row">
                            <span>Subtotal ({cart.length} items)</span>
                            <span>${getTotal().toFixed(2)}</span>
                        </div>

                        <div className="summary-row">
                            <span>Shipping</span>
                            <span className="free-badge">FREE</span>
                        </div>

                        <div className="summary-row">
                            <span>Tax</span>
                            <span>${(getTotal() * 0.1).toFixed(2)}</span>
                        </div>

                        <div className="summary-divider"></div>

                        <div className="summary-row summary-total">
                            <span>Total</span>
                            <span>${(getTotal() * 1.1).toFixed(2)}</span>
                        </div>

                        <button className="btn btn-primary checkout-btn" onClick={handleCheckout}>
                            Proceed to Checkout
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                            </svg>
                        </button>

                        <button className="btn btn-ghost" onClick={() => navigate('/products')}>
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;