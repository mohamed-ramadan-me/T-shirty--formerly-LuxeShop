import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/api';
import ProductCard from '../components/ProductCard';
import './Home.css';

const Home = ({ onCartUpdate }) => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFeaturedProducts();
    }, []);

    const loadFeaturedProducts = async () => {
        try {
            const response = await productService.getProducts({ sort: 'rating' });
            setFeaturedProducts(response.products.slice(0, 6));
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="container">
                    <div className="hero-content animate-fade-in">
                        <h1 className="hero-title">
                            Discover Premium
                            <br />
                            <span className="gradient-text">Lifestyle Products</span>
                        </h1>
                        <p className="hero-subtitle">
                            Experience luxury shopping with our curated collection of high-quality products.
                            From electronics to fashion, find everything you need in one place.
                        </p>
                        <div className="hero-actions">
                            <Link to="/products" className="btn btn-primary btn-lg">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.35-4.35" />
                                </svg>
                                Explore Products
                            </Link>
                            <Link to="/products?category=Electronics" className="btn btn-outline btn-lg">
                                Shop Electronics
                            </Link>
                        </div>

                        <div className="hero-stats">
                            <div className="stat-item">
                                <div className="stat-value">1000+</div>
                                <div className="stat-label">Products</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-value">50K+</div>
                                <div className="stat-label">Happy Customers</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-value">4.8★</div>
                                <div className="stat-label">Average Rating</div>
                            </div>
                        </div>
                    </div>

                    <div className="hero-visual animate-scale-in">
                        <div className="floating-card card-1">
                            <div className="mini-product">
                                <div className="mini-product-icon">🎧</div>
                                <div className="mini-product-info">
                                    <div className="mini-product-name">Headphones</div>
                                    <div className="mini-product-price">$299</div>
                                </div>
                            </div>
                        </div>
                        <div className="floating-card card-2">
                            <div className="mini-product">
                                <div className="mini-product-icon">⌚</div>
                                <div className="mini-product-info">
                                    <div className="mini-product-name">Smart Watch</div>
                                    <div className="mini-product-price">$399</div>
                                </div>
                            </div>
                        </div>
                        <div className="floating-card card-3">
                            <div className="mini-product">
                                <div className="mini-product-icon">👟</div>
                                <div className="mini-product-info">
                                    <div className="mini-product-name">Running Shoes</div>
                                    <div className="mini-product-price">$149</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <div className="features-grid">
                        <div className="feature-card glass">
                            <div className="feature-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                            </div>
                            <h3>Free Shipping</h3>
                            <p>Free delivery on orders over $50</p>
                        </div>

                        <div className="feature-card glass">
                            <div className="feature-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>
                            <h3>Secure Payment</h3>
                            <p>100% secure payment processing</p>
                        </div>

                        <div className="feature-card glass">
                            <div className="feature-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                    <polyline points="9 22 9 12 15 12 15 22" />
                                </svg>
                            </div>
                            <h3>Easy Returns</h3>
                            <p>30-day return policy</p>
                        </div>

                        <div className="feature-card glass">
                            <div className="feature-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                            </div>
                            <h3>24/7 Support</h3>
                            <p>Always here to help you</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="featured-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Featured Products</h2>
                        <p className="section-subtitle">Handpicked items just for you</p>
                    </div>

                    {loading ? (
                        <div className="grid grid-3">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="skeleton" style={{ height: '400px' }}></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-3">
                            {featuredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} onAddToCart={onCartUpdate} />
                            ))}
                        </div>
                    )}

                    <div className="section-footer">
                        <Link to="/products" className="btn btn-primary">
                            View All Products
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-card glass">
                        <h2>Ready to Start Shopping?</h2>
                        <p>Join thousands of satisfied customers and discover amazing products today!</p>
                        <Link to="/products" className="btn btn-secondary btn-lg">
                            Start Shopping Now
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
