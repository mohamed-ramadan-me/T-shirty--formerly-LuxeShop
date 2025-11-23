// LuxeShop Class Diagram Generator for Enterprise Architect
// Script Library Version - Compatible with EA Script Library context

// Get the current model
var model = Models.GetAt(0);
var repository = model.Repository;

// Create a new package for LuxeShop
var rootPackage = model;
var classPackage = rootPackage.Packages.AddNew("LuxeShop", "");
classPackage.Update();

// Store created classes for later reference
var createdClasses = {};

// Define classes with their attributes and methods
var classDefinitions = {
    "User": {
        "attributes": [
            { "name": "userId", "type": "String", "visibility": "private" },
            { "name": "email", "type": "String", "visibility": "private" },
            { "name": "passwordHash", "type": "String", "visibility": "private" },
            { "name": "username", "type": "String", "visibility": "private" },
            { "name": "firstName", "type": "String", "visibility": "private" },
            { "name": "lastName", "type": "String", "visibility": "private" },
            { "name": "phoneNumber", "type": "String", "visibility": "private" },
            { "name": "role", "type": "String", "visibility": "private" },
            { "name": "createdAt", "type": "Date", "visibility": "private" },
            { "name": "updatedAt", "type": "Date", "visibility": "private" }
        ],
        "methods": [
            { "name": "register", "params": "(email: String, password: String)", "returnType": "Boolean", "visibility": "public" },
            { "name": "login", "params": "(email: String, password: String)", "returnType": "Token", "visibility": "public" },
            { "name": "updateProfile", "params": "(profileData: Object)", "returnType": "void", "visibility": "public" },
            { "name": "getProfile", "params": "()", "returnType": "Profile", "visibility": "public" },
            { "name": "changePassword", "params": "(oldPassword: String, newPassword: String)", "returnType": "Boolean", "visibility": "public" }
        ]
    },

    "Admin": {
        "attributes": [
            { "name": "adminId", "type": "String", "visibility": "private" },
            { "name": "userId", "type": "String", "visibility": "private" },
            { "name": "permissions", "type": "Array", "visibility": "private" },
            { "name": "accessLevel", "type": "int", "visibility": "private" }
        ],
        "methods": [
            { "name": "manageProducts", "params": "()", "returnType": "void", "visibility": "public" },
            { "name": "manageOrders", "params": "()", "returnType": "void", "visibility": "public" },
            { "name": "viewDashboard", "params": "()", "returnType": "DashboardData", "visibility": "public" },
            { "name": "manageUsers", "params": "()", "returnType": "void", "visibility": "public" }
        ]
    },

    "Product": {
        "attributes": [
            { "name": "productId", "type": "String", "visibility": "private" },
            { "name": "name", "type": "String", "visibility": "private" },
            { "name": "description", "type": "String", "visibility": "private" },
            { "name": "price", "type": "double", "visibility": "private" },
            { "name": "stock", "type": "int", "visibility": "private" },
            { "name": "categoryId", "type": "String", "visibility": "private" },
            { "name": "imageUrl", "type": "String", "visibility": "private" },
            { "name": "featured", "type": "Boolean", "visibility": "private" },
            { "name": "rating", "type": "double", "visibility": "private" },
            { "name": "createdAt", "type": "Date", "visibility": "private" },
            { "name": "updatedAt", "type": "Date", "visibility": "private" }
        ],
        "methods": [
            { "name": "create", "params": "(productData: Object)", "returnType": "Product", "visibility": "public" },
            { "name": "update", "params": "(productId: String, updates: Object)", "returnType": "void", "visibility": "public" },
            { "name": "delete", "params": "(productId: String)", "returnType": "Boolean", "visibility": "public" },
            { "name": "updateStock", "params": "(quantity: int)", "returnType": "void", "visibility": "public" },
            { "name": "getDetails", "params": "()", "returnType": "Object", "visibility": "public" }
        ]
    },

    "Category": {
        "attributes": [
            { "name": "categoryId", "type": "String", "visibility": "private" },
            { "name": "name", "type": "String", "visibility": "private" },
            { "name": "description", "type": "String", "visibility": "private" },
            { "name": "imageUrl", "type": "String", "visibility": "private" },
            { "name": "parentCategoryId", "type": "String", "visibility": "private" }
        ],
        "methods": [
            { "name": "create", "params": "(categoryData: Object)", "returnType": "Category", "visibility": "public" },
            { "name": "update", "params": "(categoryId: String, updates: Object)", "returnType": "void", "visibility": "public" },
            { "name": "delete", "params": "(categoryId: String)", "returnType": "Boolean", "visibility": "public" },
            { "name": "getProducts", "params": "()", "returnType": "Array", "visibility": "public" }
        ]
    },

    "Cart": {
        "attributes": [
            { "name": "cartId", "type": "String", "visibility": "private" },
            { "name": "userId", "type": "String", "visibility": "private" },
            { "name": "createdAt", "type": "Date", "visibility": "private" },
            { "name": "updatedAt", "type": "Date", "visibility": "private" },
            { "name": "totalAmount", "type": "double", "visibility": "private" }
        ],
        "methods": [
            { "name": "addItem", "params": "(productId: String, quantity: int)", "returnType": "void", "visibility": "public" },
            { "name": "removeItem", "params": "(cartItemId: String)", "returnType": "void", "visibility": "public" },
            { "name": "updateQuantity", "params": "(cartItemId: String, quantity: int)", "returnType": "void", "visibility": "public" },
            { "name": "clear", "params": "()", "returnType": "void", "visibility": "public" },
            { "name": "calculateTotal", "params": "()", "returnType": "double", "visibility": "public" },
            { "name": "getItems", "params": "()", "returnType": "Array", "visibility": "public" }
        ]
    },

    "CartItem": {
        "attributes": [
            { "name": "cartItemId", "type": "String", "visibility": "private" },
            { "name": "cartId", "type": "String", "visibility": "private" },
            { "name": "productId", "type": "String", "visibility": "private" },
            { "name": "quantity", "type": "int", "visibility": "private" },
            { "name": "price", "type": "double", "visibility": "private" },
            { "name": "subtotal", "type": "double", "visibility": "private" }
        ],
        "methods": [
            { "name": "updateQuantity", "params": "(quantity: int)", "returnType": "void", "visibility": "public" },
            { "name": "calculateSubtotal", "params": "()", "returnType": "double", "visibility": "public" }
        ]
    },

    "Order": {
        "attributes": [
            { "name": "orderId", "type": "String", "visibility": "private" },
            { "name": "userId", "type": "String", "visibility": "private" },
            { "name": "orderNumber", "type": "String", "visibility": "private" },
            { "name": "status", "type": "String", "visibility": "private" },
            { "name": "totalAmount", "type": "double", "visibility": "private" },
            { "name": "shippingAddress", "type": "String", "visibility": "private" },
            { "name": "billingAddress", "type": "String", "visibility": "private" },
            { "name": "paymentMethod", "type": "String", "visibility": "private" },
            { "name": "createdAt", "type": "Date", "visibility": "private" },
            { "name": "updatedAt", "type": "Date", "visibility": "private" }
        ],
        "methods": [
            { "name": "create", "params": "(orderData: Object)", "returnType": "Order", "visibility": "public" },
            { "name": "updateStatus", "params": "(status: String)", "returnType": "void", "visibility": "public" },
            { "name": "cancel", "params": "()", "returnType": "Boolean", "visibility": "public" },
            { "name": "getDetails", "params": "()", "returnType": "Object", "visibility": "public" },
            { "name": "getOrderItems", "params": "()", "returnType": "Array", "visibility": "public" }
        ]
    },

    "OrderItem": {
        "attributes": [
            { "name": "orderItemId", "type": "String", "visibility": "private" },
            { "name": "orderId", "type": "String", "visibility": "private" },
            { "name": "productId", "type": "String", "visibility": "private" },
            { "name": "quantity", "type": "int", "visibility": "private" },
            { "name": "price", "type": "double", "visibility": "private" },
            { "name": "subtotal", "type": "double", "visibility": "private" }
        ],
        "methods": [
            { "name": "calculateSubtotal", "params": "()", "returnType": "double", "visibility": "public" },
            { "name": "getProductDetails", "params": "()", "returnType": "Product", "visibility": "public" }
        ]
    },

    "Payment": {
        "attributes": [
            { "name": "paymentId", "type": "String", "visibility": "private" },
            { "name": "orderId", "type": "String", "visibility": "private" },
            { "name": "amount", "type": "double", "visibility": "private" },
            { "name": "method", "type": "String", "visibility": "private" },
            { "name": "status", "type": "String", "visibility": "private" },
            { "name": "transactionId", "type": "String", "visibility": "private" },
            { "name": "createdAt", "type": "Date", "visibility": "private" }
        ],
        "methods": [
            { "name": "processPayment", "params": "(paymentData: Object)", "returnType": "Boolean", "visibility": "public" },
            { "name": "refund", "params": "(amount: double)", "returnType": "Boolean", "visibility": "public" },
            { "name": "verifyPayment", "params": "()", "returnType": "Boolean", "visibility": "public" }
        ]
    },

    "Review": {
        "attributes": [
            { "name": "reviewId", "type": "String", "visibility": "private" },
            { "name": "productId", "type": "String", "visibility": "private" },
            { "name": "userId", "type": "String", "visibility": "private" },
            { "name": "rating", "type": "int", "visibility": "private" },
            { "name": "comment", "type": "String", "visibility": "private" },
            { "name": "createdAt", "type": "Date", "visibility": "private" },
            { "name": "updatedAt", "type": "Date", "visibility": "private" }
        ],
        "methods": [
            { "name": "create", "params": "(reviewData: Object)", "returnType": "Review", "visibility": "public" },
            { "name": "update", "params": "(reviewId: String, updates: Object)", "returnType": "void", "visibility": "public" },
            { "name": "delete", "params": "(reviewId: String)", "returnType": "Boolean", "visibility": "public" }
        ]
    },

    "Address": {
        "attributes": [
            { "name": "addressId", "type": "String", "visibility": "private" },
            { "name": "userId", "type": "String", "visibility": "private" },
            { "name": "street", "type": "String", "visibility": "private" },
            { "name": "city", "type": "String", "visibility": "private" },
            { "name": "state", "type": "String", "visibility": "private" },
            { "name": "zipCode", "type": "String", "visibility": "private" },
            { "name": "country", "type": "String", "visibility": "private" },
            { "name": "isDefault", "type": "Boolean", "visibility": "private" }
        ],
        "methods": [
            { "name": "create", "params": "(addressData: Object)", "returnType": "Address", "visibility": "public" },
            { "name": "update", "params": "(addressId: String, updates: Object)", "returnType": "void", "visibility": "public" },
            { "name": "delete", "params": "(addressId: String)", "returnType": "Boolean", "visibility": "public" },
            { "name": "setAsDefault", "params": "()", "returnType": "void", "visibility": "public" }
        ]
    }
};

// Create classes
for (var className in classDefinitions) {
    var classData = classDefinitions[className];

    // Create the class element using Elements.AddNew
    var element = classPackage.Elements.AddNew(className, "Class");
    element.Update();

    // Store reference for associations
    createdClasses[className] = element;

    // Add attributes
    for (var i = 0; i < classData.attributes.length; i++) {
        var attr = classData.attributes[i];
        var attribute = element.Attributes.AddNew(attr.name, attr.type);
        attribute.Visibility = attr.visibility.charAt(0).toUpperCase();
        attribute.Update();
    }

    // Add methods
    for (var j = 0; j < classData.methods.length; j++) {
        var method = classData.methods[j];
        var operation = element.Methods.AddNew(method.name, method.returnType);
        operation.Visibility = method.visibility.charAt(0).toUpperCase();
        operation.Update();
    }

    element.Update();
}

// Create associations/relationships
var associations = [
    // User relationships
    { "source": "User", "target": "Cart", "name": "has", "sourceCard": "1", "targetCard": "0..1" },
    { "source": "User", "target": "Order", "name": "places", "sourceCard": "1", "targetCard": "*" },
    { "source": "User", "target": "Review", "name": "writes", "sourceCard": "1", "targetCard": "*" },
    { "source": "User", "target": "Address", "name": "has", "sourceCard": "1", "targetCard": "*" },
    { "source": "Admin", "target": "User", "name": "extends", "sourceCard": "1", "targetCard": "1" },

    // Product relationships
    { "source": "Category", "target": "Product", "name": "contains", "sourceCard": "1", "targetCard": "*" },
    { "source": "Product", "target": "Review", "name": "has", "sourceCard": "1", "targetCard": "*" },

    // Cart relationships
    { "source": "Cart", "target": "CartItem", "name": "contains", "sourceCard": "1", "targetCard": "*" },
    { "source": "CartItem", "target": "Product", "name": "references", "sourceCard": "*", "targetCard": "1" },

    // Order relationships
    { "source": "Order", "target": "OrderItem", "name": "contains", "sourceCard": "1", "targetCard": "*" },
    { "source": "OrderItem", "target": "Product", "name": "references", "sourceCard": "*", "targetCard": "1" },
    { "source": "Order", "target": "Payment", "name": "has", "sourceCard": "1", "targetCard": "1" },

    // Admin relationships
    { "source": "Admin", "target": "Product", "name": "manages", "sourceCard": "1", "targetCard": "*" },
    { "source": "Admin", "target": "Order", "name": "manages", "sourceCard": "1", "targetCard": "*" }
];

// Add associations
for (var k = 0; k < associations.length; k++) {
    var assoc = associations[k];
    var sourceClass = createdClasses[assoc.source];
    var targetClass = createdClasses[assoc.target];

    if (sourceClass && targetClass) {
        var connector = sourceClass.Connectors.AddNew(assoc.name, "Association");
        connector.SupplierID = targetClass.ElementID;
        connector.SourceMultiplicity = assoc.sourceCard;
        connector.TargetMultiplicity = assoc.targetCard;
        connector.Update();
    }
}

// Create a class diagram and add all classes to it
var diagram = classPackage.Diagrams.AddNew("LuxeShop Class Diagram", "Class");
diagram.Update();

// Add all classes to the diagram
var xPos = 50;
var yPos = 50;
var itemsPerRow = 3;
var itemCount = 0;

for (var className in createdClasses) {
    var element = createdClasses[className];
    var diagramObject = diagram.DiagramObjects.AddNew("", "");
    diagramObject.ElementID = element.ElementID;

    // Position classes in a grid layout
    diagramObject.left = xPos;
    diagramObject.top = yPos;
    diagramObject.right = xPos + 150;
    diagramObject.bottom = yPos + 200;

    diagramObject.Update();

    // Move to next position
    itemCount++;
    if (itemCount % itemsPerRow === 0) {
        xPos = 50;
        yPos += 250;
    } else {
        xPos += 200;
    }
}

// Reposition diagram objects for better layout
diagram.RepositionDiagramObjects(true);
diagram.Update();

// Save the package
classPackage.Update();

// Open the diagram
Repository.OpenDiagram(diagram.DiagramID);

// Output success message
Session.Output("LuxeShop Class Diagram created successfully!");
Session.Output("Package: " + classPackage.Name);
Session.Output("Diagram opened in workspace.");
