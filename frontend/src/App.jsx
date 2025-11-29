import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import { authService, cartService } from './services/api';
import './index.css';

function App() {
  const [cartCount, setCartCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

  useEffect(() => {
    if (isAuthenticated) {
      updateCartCount();
    }
  }, [isAuthenticated]);

  const updateCartCount = async () => {
    try {
      const response = await cartService.getCart();
      // FIX: Check for success before reducing
      if (response.success && response.cart) {
        const count = response.cart.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(count);
      }
    } catch (error) {
      console.error('Error updating cart count:', error);
    }
  };

  const ProtectedRoute = ({ children }) => {
    if (!authService.isAuthenticated()) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Router>
      <div className="app">
        <Navbar cartCount={cartCount} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home onCartUpdate={updateCartCount} />} />
            <Route path="/products" element={<Products onCartUpdate={updateCartCount} />} />
            <Route path="/product/:id" element={<ProductDetail onCartUpdate={updateCartCount} />} />
            <Route path="/login" element={<Auth />} />
            
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart onCartUpdate={updateCartCount} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout onCartUpdate={updateCartCount} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;