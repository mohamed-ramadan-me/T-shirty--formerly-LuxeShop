import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartService, authService } from '../services/api';
import './ProductCard.css';

const ProductCard = ({ product, onAddToCart }) => {
    const navigate = useNavigate();
    const [isAdding, setIsAdding] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const user = authService.getCurrentUser();

    const handleAddToCart = async (e) => {
        e.stopPropagation();
        setIsAdding(true);
        try {
            await cartService.addToCart(product._id);
            setShowSuccess(true);
            if (onAddToCart) onAddToCart();
            setTimeout(() => setShowSuccess(false), 2000);
        } catch (error) {
            console.error('Error adding to cart:', error);
            if (error.error === 'Authentication required') {
                navigate('/login');
            }
        } finally {
            setIsAdding(false);
        }
    };

    const handleCardClick = () => {
        navigate(`/product/${product._id}`);
    };

    const handleQuickView = (e) => {
        e.stopPropagation();
        navigate(`/product/${product._id}`);
    };

    return (
        <div className="product-card animate-fade-in" onClick={handleCardClick}>
            <div className="product-image-wrapper">
                <img src={product.image} alt={product.name} className="product-image" />
                <div className="product-overlay">
                    <button className="quick-view-btn" onClick={handleQuickView}>Quick View</button>
                </div>
                {product.stock < 20 && (
                    <div className="stock-badge">Only {product.stock} left!</div>
                )}
            </div>

            <div className="product-info">
                <div className="product-category">{product.category}</div>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>

                <div className="product-rating">
                    <div className="stars">
                        {[...Array(5)].map((_, i) => (
                            <svg
                                key={i}
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'}
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                        ))}
                    </div>
                    <span className="rating-text">
                        {product.rating} ({product.reviews} reviews)
                    </span>
                </div>

                <div className="product-footer">
                    <div className="product-price">
                        <span className="price-currency">$</span>
                        <span className="price-amount">{product.price.toFixed(2)}</span>
                    </div>

                    {user?.role !== 'admin' && (
                        <button
                            className={`add-to-cart-btn ${isAdding ? 'loading' : ''} ${showSuccess ? 'success' : ''}`}
                            onClick={handleAddToCart}
                            disabled={isAdding || product.stock === 0}
                        >
                            {showSuccess ? (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    Added!
                                </>
                            ) : isAdding ? (
                                <>
                                    <div className="spinner"></div>
                                    Adding...
                                </>
                            ) : product.stock === 0 ? (
                                'Out of Stock'
                            ) : (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="9" cy="21" r="1" />
                                        <circle cx="20" cy="21" r="1" />
                                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                    </svg>
                                    Add to Cart
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
