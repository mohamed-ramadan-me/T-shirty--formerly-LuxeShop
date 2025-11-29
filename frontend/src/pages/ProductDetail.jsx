import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService, cartService, authService } from '../services/api';
import './ProductDetail.css';

const ProductDetail = ({ onCartUpdate }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const user = authService.getCurrentUser();

    useEffect(() => {
        loadProduct();
    }, [id]);

    const loadProduct = async () => {
        try {
            // CRITICAL CHANGE: Do NOT use parseInt(). MongoDB IDs are strings.
            const response = await productService.getProduct(id);
            setProduct(response.product);
        } catch (error) {
            console.error('Error loading product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        setIsAdding(true);
        try {
            // CRITICAL CHANGE: Use product._id
            await cartService.addToCart(product._id, quantity);
            
            if (onCartUpdate) onCartUpdate();
            navigate('/cart');
        } catch (error) {
            console.error('Error adding to cart:', error);
            if (error.error === 'Authentication required' || error.error === 'Auth required') {
                navigate('/login');
            }
        } finally {
            setIsAdding(false);
        }
    };

    if (loading) {
        return (
            <div className="product-detail-page">
                <div className="container">
                    <div className="skeleton" style={{ height: '500px' }}></div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-detail-page">
                <div className="container">
                    <div className="empty-state">
                        <h2>Product not found</h2>
                        <button className="btn btn-primary" onClick={() => navigate('/products')}>
                            Back to Products
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="product-detail-page">
            <div className="container">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                    Back
                </button>

                <div className="product-detail-content">
                    <div className="product-image-section">
                        <img src={product.image} alt={product.name} className="product-detail-image" />
                    </div>

                    <div className="product-info-section">
                        <div className="product-category-badge">{product.category}</div>
                        <h1 className="product-detail-name">{product.name}</h1>

                        <div className="product-rating-section">
                            <div className="stars">
                                {[...Array(5)].map((_, i) => (
                                    <svg
                                        key={i}
                                        width="24"
                                        height="24"
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

                        <div className="product-price-section">
                            <span className="price-label">Price:</span>
                            <span className="product-detail-price">${product.price.toFixed(2)}</span>
                        </div>

                        <p className="product-detail-description">{product.description}</p>

                        <div className="stock-info">
                            {product.stock > 0 ? (
                                <span className="in-stock">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    In Stock ({product.stock} available)
                                </span>
                            ) : (
                                <span className="out-of-stock">Out of Stock</span>
                            )}
                        </div>

                        {user?.role !== 'admin' && (
                            <>
                                <div className="quantity-section">
                                    <label>Quantity:</label>
                                    <div className="quantity-control-large">
                                        <button
                                            className="quantity-btn"
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="5" y1="12" x2="19" y2="12" />
                                            </svg>
                                        </button>
                                        <span className="quantity-value">{quantity}</span>
                                        <button
                                            className="quantity-btn"
                                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                            disabled={quantity >= product.stock}
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="12" y1="5" x2="12" y2="19" />
                                                <line x1="5" y1="12" x2="19" y2="12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div className="action-buttons">
                                    <button
                                        className="btn btn-primary btn-large"
                                        onClick={handleAddToCart}
                                        disabled={isAdding || product.stock === 0}
                                    >
                                        {isAdding ? (
                                            <>
                                                <div className="spinner"></div>
                                                Adding to Cart...
                                            </>
                                        ) : (
                                            <>
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <circle cx="9" cy="21" r="1" />
                                                    <circle cx="20" cy="21" r="1" />
                                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                                </svg>
                                                Add to Cart
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;