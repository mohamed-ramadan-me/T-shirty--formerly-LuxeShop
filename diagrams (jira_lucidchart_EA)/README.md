# T-shirty - UML Diagrams & Documentation

Complete UML documentation for the T-shirty E-Commerce Platform, including Enterprise Architect project, JavaScript generators, and Lucidchart diagrams.

---

## 📦 Quick Start

### Option 1: Open EA Project (Recommended)

**Fastest way to view all diagrams:**

1. Open **Enterprise Architect** (version 7.0+)
2. Open file: `LuxeShop.qea` (legacy filename - contains T-shirty diagrams)
3. All diagrams are ready to view in the project browser

### Option 2: Use JavaScript Generators

Import diagram generators into an existing EA project:

1. Open Enterprise Architect
2. Navigate to: `Tools` → `Scripting` → `Run Script`
3. Select any `.js` file from this folder
4. Diagram will be generated automatically

---

## 📁 Files Overview

### Enterprise Architect Project

| File | Size | Description |
|------|------|-------------|
| **LuxeShop.qea** | 1.7 MB | Complete EA project with all UML diagrams (legacy filename) |

### EA Diagram Generators (JavaScript)

| File | Diagram Type |
|------|--------------|
| `class_diagram(EA).js` | Class Diagram - System object model |
| `system_arch(EA).js` | System Architecture - 3-tier architecture |
| `sequence_UserRegistration(EA).js` | User Registration workflow |
| `sequence_UserLogin(EA).js` | Authentication flow |
| `sequence_AddToCart(EA).js` | Shopping cart management |
| `sequence_CheckoutOrder(EA).js` | Order placement process |
| `sequence_AdminOrders(EA).js` | Admin order management |
| `sequence_AdminProducts(EA).js` | Admin product management |

### Lucidchart Diagrams

| Diagram | Formats | Description |
|---------|---------|-------------|
| **Use Case** | XML, PDF, PNG | Complete system functionality overview |
| **Activity** | XML, PDF, PNG | User journey and process flows |

### Project Management

| File | Description |
|------|-------------|
| `jira-kanban.png` | Sprint planning and task tracking board |

---

## 🎯 Diagram Contents

### Class Diagram

- Complete system object model
- User, Product, Order, Cart entities
- Relationships and associations

### System Architecture

- Frontend (React)
- API Layer (Unified endpoint)
- Backend (Express/Node.js)
- Data Store (In-memory/Database)

### Sequence Diagrams (6 total)

- User registration and authentication
- Shopping cart operations
- Checkout and order placement
- Admin dashboard operations

### Use Case Diagram

- **3 Actors**: Guest User, Registered User, Administrator
- **28 Use Cases**: Complete system functionality
- Actor inheritance and relationships

### Activity Diagram

- User journey flows
- Decision points and process paths

---

## 🔧 EA Generator Usage

Each JavaScript file can be run in Enterprise Architect to generate diagrams:

**To run a generator:**

```
1. Tools → Scripting → Run Script
2. Select generator file (e.g., class_diagram(EA).js)
3. Click "Run"
4. Diagram appears in current package
```

**Requirements:**

- Enterprise Architect 7.0 or higher
- Scripting enabled in EA settings

---

## 📊 Technical Details

### Format Compatibility

| Format | Tool | Compatibility |
|--------|------|---------------|
| `.qea` | Enterprise Architect | EA 7.0+ (all editions) |
| `.js` | EA Scripting | EA 7.0+ with scripting enabled |
| `.xml` | Lucidchart/EA | Import to various UML tools |
| `.pdf` | Any PDF reader | Universal viewing |
| `.png` | Any image viewer | Universal viewing |

### Architecture Overview

**Frontend**

- React 19.2 with React Router 7.9
- Axios for API communication
- 9 pages with responsive design

**Backend**

- Node.js 16+ with Express 5.1
- Single unified API endpoint (`POST /api`)
- JWT authentication with bcrypt
- 21 API actions across 7 categories

**Data**

- In-memory storage (development)
- Ready for database integration
- 12 products across 5 categories

---

## 🚀 System Features

### User Features

- Product browsing with filters and search
- Shopping cart management
- Checkout and order placement
- Order history and tracking
- User profile management

### Admin Features

- Dashboard with analytics
- Order management and status updates
- Product catalog management
- User overview

---

## 📖 Additional Information

### Diagram Statistics

| Type | Count | Elements |
|------|-------|----------|
| Class Diagrams | 1 | 10+ classes |
| Sequence Diagrams | 6 | 30+ lifelines, 150+ messages |
| Use Case Diagrams | 1 | 3 actors, 28 use cases |
| Activity Diagrams | 1 | Multiple flows |
| Architecture Diagrams | 1 | 4-layer system |

### Import Notes

- **LuxeShop.qea** (legacy filename): Open directly in EA, no import needed
- **JavaScript files**: Run as scripts in EA to generate diagrams
- **XML files**: Import via `Import Package from XMI` in EA or Lucidchart
- **PDF/PNG files**: View directly, no import needed

---

## 🛠️ Troubleshooting

**Q: LuxeShop.qea won't open**  
A: Ensure you have Enterprise Architect 7.0 or higher installed

**Q: JavaScript generators don't run**  
A: Enable scripting in EA: `Tools` → `Options` → `Automation`

**Q: Where are the diagrams in the .qea file?**  
A: Expand the package structure in Project Browser to see all diagrams

**Q: Can I edit the diagrams?**  
A: Yes, open LuxeShop.qea in EA and modify as needed

---

## 📝 Version Information

- **Created**: 2025-11-23
- **Format**: XMI 1.1 (UML 1.3)
- **EA Compatibility**: 7.0+
- **Project**: T-shirty E-Commerce Platform

---

**Ready to explore?** Open `LuxeShop.qea` (legacy filename) in Enterprise Architect to view all T-shirty diagrams instantly! 🎨
