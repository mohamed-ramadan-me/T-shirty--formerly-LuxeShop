# T-shirty - E-Commerce Platform

A production-ready e-commerce application built with React and Node.js, featuring a unified API architecture and comprehensive admin dashboard.

[![React](https://img.shields.io/badge/React-19.2-blue)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22%2B-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.1-lightgrey)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/)
[![Mongoose](https://img.shields.io/badge/Mongoose-8.0-red)](https://mongoosejs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Overview

**T-shirty (formerly LuxeShop)** is a full-featured e-commerce platform with 9 pages, **25 API actions**, and 24 pre-loaded products across 6 categories. Built with modern web technologies and a premium dark theme UI.

### Key Features

- **Single API Endpoint** - All operations through `/api` with action-based routing
- **User Profile** - Complete user profile management with `getUserProfile` endpoint
- **Admin Dashboard** - Complete store management (orders, products, analytics)
- **Authentication** - JWT-based with role-based access control
- **Responsive Design** - Glassmorphism effects, smooth animations, mobile-first
- **Complete E-Commerce Flow** - Browse → Cart → Checkout → Orders

---

## Quick Start

### Prerequisites

- **Node.js** 16+ ([Download](https://nodejs.org/))
- **npm** 8+ (comes with Node.js)
- **Text Editor** (VS Code, WebStorm, etc.)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/mohamed-ramadan-me/T-shirty--formerly-LuxeShop.git
   cd T-shirty--formerly-LuxeShop
   ```

2. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the `backend/` directory:

   ```bash
   cd backend
   touch .env
   ```

   Add your MongoDB connection string:

   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```

   > 💡 **Note:** Get your MongoDB URI from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or use a local MongoDB instance.

4. **Install frontend dependencies**

   ```bash
   cd ../frontend
   npm install
   ```

5. **Start the backend server**

   ```bash
   cd ../backend
   npm start
   ```

   Server runs on: `http://localhost:5000`

6. **Start the frontend (new terminal)**

   ```bash
   cd frontend
   npm run dev
   ```

   Frontend runs on: `http://localhost:5173`

7. **Open in browser**
   Navigate to `http://localhost:5173`

## Project Structure

```
T-shirty_E-commerce platform Project/
├── README.md                       # Project documentation
├── backend/                        # Backend API server
│   ├── server.js                   # Express server with API endpoints
│   ├── package.json                # Backend dependencies
│   ├── package-lock.json           # Dependency lock file
│   └── node_modules/               # Backend dependencies (npm install)
├── frontend/                       # React frontend application
│   ├── src/
│   │   ├── components/             # Reusable components (Navbar, ProductCard)
│   │   ├── pages/                  # Page components (Home, Products, Cart, etc.)
│   │   └── services/api.js         # Unified API client
│   ├── package.json                # Frontend dependencies
│   ├── index.html                  # HTML template
│   └── node_modules/               # Frontend dependencies (npm install)
└── diagrams (jira_lucidchart_EA)/  # UML diagrams and EA project
    ├── T-shirty.qea                # Enterprise Architect project file (legacy name)
    ├── README.md                   # Diagrams documentation
    ├── class_diagram(EA).js        # Class diagram generator
    ├── system_arch(EA).js          # System architecture generator
    ├── sequence_*.js               # 6 sequence diagram generators
    ├── *-diagram(lucidchart).*     # Activity & Use Case diagrams
    └── jira-kanban.png             # Project management board
```

---

## API Documentation

### Endpoint

All requests: `POST http://localhost:5000/api`

### Request Format

```json
{
  "action": "actionName",
  "data": { /* action-specific data */ }
}
```

### Available Actions

| Category       | Actions |
|----------------|---------|
| **Auth**       | `register`, `login`, `getUserProfile` |
| **Products**   | `getProducts`, `getProduct`, `getCategories` |
| **Cart**       | `addToCart`, `getCart`, `updateCartItem`, `removeFromCart` |
| **Orders**     | `createOrder`, `getOrders`, `getOrder` |
| **Wishlist**   | `addToWishlist`, `removeFromWishlist` |
| **Reviews**    | `addReview` |
| **Admin**      | `getDashboardStats`, `getAllUsers`, `getAllOrders`, `updateOrderStatus`, `updateProduct`, `addProduct`, `deleteProduct` |

### Quick Examples

**Login:**

```javascript
const callAPI = async (action, data) => {
  const response = await fetch('http://localhost:5000/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, data })
  });
  return response.json();
};

// Usage
const result = await callAPI('login', { 
  email: 'user@example.com', 
  password: 'password123' 
});
```

**With Authentication:**

```javascript
const token = localStorage.getItem('token');

await fetch('http://localhost:5000/api', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    action: 'addToCart',
    data: { productId: 1, quantity: 2 }
  })
});
```

### Axios Setup (Recommended)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const callAPI = async (action, data = {}) => {
  const response = await api.post('/api', { action, data });
  return response.data;
};
```

---

## Admin Access

### Credentials

- **Email:** `admin@gmail.com`
- **Password:** `asdasd`

### Features

| Feature         | Description |
|-----------------|-------------|
| Overview        | Revenue, orders, users (role-based count), products analytics |
| Orders          | View, filter, and update order statuses |
| Products        | Add new products, edit details, delete products, manage catalog |

**Access:** Navigate to `/admin` after logging in with admin credentials.

> ⚠️ **Security Note:** Use environment variables for credentials in production.

---

## Tech Stack

**Frontend:** React 19.2, React Router 7.9, Axios 1.13, Vite 7.2  
**Backend:** Node.js 16+, Express 5.1, JWT, bcryptjs  
**Styling:** CSS3 (Glassmorphism, Gradients, Animations)  
**Diagrams:** Enterprise Architect generators (JavaScript), Lucidchart (Activity/Use Case)

---

## UML Diagrams

The `diagrams (jira_lucidchart_EA)/` folder contains comprehensive UML documentation:

### Enterprise Architect Project File

**T-shirty.qea** (legacy filename) - Complete Enterprise Architect project ( 1.7 MB)

- Pre-built EA project with all diagrams ready to open
- Includes class diagrams, sequence diagrams, and system architecture
- Compatible with Enterprise Architect 7.0+
- Simply open this file in EA to view all UML diagrams

### Enterprise Architect (EA) Generators

JavaScript-based diagram generators that can be imported into EA:

| Diagram | File | Description |
|---------|------|-------------|
| **Class Diagram** | `class_diagram(EA).js` | Complete system object model |
| **System Architecture** | `system_arch(EA).js` | Frontend, API, Backend layers |
| **User Registration** | `sequence_UserRegistration(EA).js` | Registration workflow |
| **User Login** | `sequence_UserLogin(EA).js` | Authentication flow |
| **Add to Cart** | `sequence_AddToCart(EA).js` | Cart management |
| **Checkout Order** | `sequence_CheckoutOrder(EA).js` | Order placement |
| **Admin Orders** | `sequence_AdminOrders(EA).js` | Order management |
| **Admin Products** | `sequence_AdminProducts(EA).js` | Product management |

### Lucidchart Diagrams

Pre-designed diagrams in multiple formats:

- **Use Case Diagram** - `.xml`, `.pdf`, `.png` (System functionality overview)
- **Activity Diagram** - `.xml`, `.pdf`, `.png` (User journey flows)

### Project Management

- **Jira Kanban Board** - `jira-kanban.png` (planning visualization)

📖 **See `diagrams (jira_lucidchart_EA)/README.md` for detailed import instructions and diagram documentation.**

---

## Pages

1. **Home** - Hero section, features, product showcase
2. **Products** - Catalog with filters, search, sorting
3. **Product Detail** - Individual product view with reviews and ratings
4. **Cart** - Quantity controls, real-time totals
5. **Checkout** - Shipping form, payment selection
6. **Orders** - Order history and tracking
7. **Auth** - Login/Register
8. **Admin Dashboard** - Store management (orders, products, analytics)
9. **Profile** - User account details and preferences

---

## Environment Variables

### Backend Configuration

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/luxeshop

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# Server
PORT=5000
```

### Security Notes

- ✅ `.env` file is gitignored by default
- ⚠️ Never commit `.env` to version control
- 🔒 Use strong, unique secrets in production
- 📝 Share `.env.example` template with your team

---

## Configuration

### Change Colors

Edit `frontend/src/index.css`:

```css
:root {
  --primary: #667eea;
  --secondary: #f5576c;
}
```

### Add Products

Edit `backend/server.js` in the `db.products` array.

### Database Integration

Replace the in-memory `db` object in `backend/server.js` with your database (MongoDB, PostgreSQL, etc.).

---

## Error Handling

### Response Format

**Success:**

```json
{ "success": true, "data": { ... } }
```

**Error:**

```json
{ "error": "Error message" }
```

### Common Errors

| Code | Error |
|------|-------|
| 401  | Access token required |
| 403  | Invalid or expired token |
| 400  | Bad request (e.g., user exists) |
| 404  | Resource not found |

---

## Design System

- **Dark Theme:** Navy background (#0f0f1e, #1a1a2e)
- **Gradients:** Purple/Pink/Blue
- **Effects:** Glassmorphism, backdrop blur, box shadows
- **Typography:** Inter font, responsive scaling
- **Animations:** Fade-ins, hover transforms (0.2s-0.5s)

---

## Troubleshooting

**Port in use:** Change ports in `backend/server.js` (backend) or `frontend/vite.config.js` (frontend)  
**CORS issues:** Ensure backend is running first  
**Auth issues:** Clear localStorage: `localStorage.clear()`

---

## Future Enhancements

- Real database integration
- Payment gateway (Stripe/PayPal)
- Product reviews and ratings
- Wishlist functionality
- Email notifications
- Advanced analytics
- Multi-language support

---

## License

MIT License - Open source and free to use

---

## Contributing

Contributions, issues, and feature requests are welcome!

---

## Changelog

### Version 2.1.0 - Enhanced Admin Features (2025-11-29)

**New Features:**

- ✨ Add Product: Admins can create new products via dashboard
- 🗑️ Delete Product: Remove products with confirmation dialog
- 📊 User Count: Dashboard now shows only users with 'user' role (excludes admins)
- 🔒 Environment Variables: Secure configuration with `.env` support
- 📝 Updated API count: 25 total API actions

**Security Improvements:**

- Environment variables for sensitive data (MongoDB URI, JWT secret)
- `.gitignore` configured to exclude `.env` files
- Improved admin role-based access control

### Version 2.0.0 - T-shirty Rebranding (2025-11-29)

**Breaking Changes:**

- Database name remains `luxeshop` for backward compatibility

**Admin Credentials:**

- Email: `admin@gmail.com`
- Password: `asdasd`

---

**Built with ❤️ using MERN stack**
