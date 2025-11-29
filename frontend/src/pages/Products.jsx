import { useEffect, useState } from 'react';
import { productService } from '../services/api';
import ProductCard from '../components/ProductCard';
import './Products.css';

const Products = ({ onCartUpdate }) => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: 'All',
        search: '',
        sort: 'popular'
    });

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        loadProducts();
    }, [filters]);

    const loadCategories = async () => {
        try {
            const response = await productService.getCategories();
            if (response.success) {
                setCategories(response.categories);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadProducts = async () => {
        setLoading(true);
        try {
            const response = await productService.getProducts(filters);
            if (response.success) {
                setProducts(response.products);
            } else {
                setProducts([]); // Fallback to empty array on error
            }
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="products-page">
            <div className="container">
                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Explore Products</h1>
                        <p className="page-subtitle">
                            Discover our full collection of premium products
                        </p>
                    </div>
                    <div className="results-count">
                        {products.length} {products.length === 1 ? 'Product' : 'Products'}
                    </div>
                </div>

                {/* Filters */}
                <div className="filters-section">
                    <div className="search-box">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="search-input"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Category</label>
                        <div className="category-pills">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    className={`category-pill ${filters.category === category ? 'active' : ''}`}
                                    onClick={() => handleFilterChange('category', category)}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Sort By</label>
                        <select
                            className="sort-select"
                            value={filters.sort}
                            onChange={(e) => handleFilterChange('sort', e.target.value)}
                        >
                            <option value="popular">Most Popular</option>
                            <option value="rating">Highest Rated</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="grid grid-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="skeleton" style={{ height: '450px' }}></div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" />
                            </svg>
                        </div>
                        <h3>No products found</h3>
                        <p>Try adjusting your filters or search terms</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => setFilters({ category: 'All', search: '', sort: 'popular' })}
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-4 products-grid">
                        {products.map((product) => (
                            // CRITICAL CHANGE: Use product._id here
                            <ProductCard 
                                key={product._id} 
                                product={product} 
                                onAddToCart={onCartUpdate} 
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;