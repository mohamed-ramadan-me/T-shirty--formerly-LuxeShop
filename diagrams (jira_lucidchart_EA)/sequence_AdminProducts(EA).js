// E-Commerce Sequence Diagram Generator for Enterprise Architect
// Admin Products Management - Complete Flow

function main() {
    // Get the selected package
    var selectedPackage = Repository.GetTreeSelectedPackage();

    if (!selectedPackage) {
        Session.Output("❌ ERROR: Please select a package first!");
        Session.Output("Right-click on your package and select it, then run this script again.");
        return;
    }

    Session.Output("============================================");
    Session.Output("Admin Products Management Sequence Diagram Generator");
    Session.Output("============================================");
    Session.Output("");
    Session.Output("📦 Selected Package: " + selectedPackage.Name);

    // Create or find "Sequence Diagrams" sub-package
    var sequencePackage = null;
    for (var i = 0; i < selectedPackage.Packages.Count; i++) {
        var pkg = selectedPackage.Packages.GetAt(i);
        if (pkg.Name === "Sequence Diagrams") {
            sequencePackage = pkg;
            break;
        }
    }

    // If not found, create it
    if (!sequencePackage) {
        sequencePackage = selectedPackage.Packages.AddNew("Sequence Diagrams", "");
        sequencePackage.Update();
        selectedPackage.Packages.Refresh();
        Session.Output("  ✔ Created new package: Sequence Diagrams");
    } else {
        Session.Output("  ✔ Using existing package: Sequence Diagrams");
    }

    Session.Output("");

    // ============================================
    // Step 1: Create Sequence Diagram
    // ============================================
    Session.Output("Creating sequence diagram...");

    var diagram = sequencePackage.Diagrams.AddNew("Admin Products Management", "Sequence");
    diagram.Update();

    Session.Output("  ✔ Diagram created: Admin Products Management");
    Session.Output("");

    // ============================================
    // Step 2: Create Actors/Objects (Lifelines)
    // ============================================
    Session.Output("Creating lifelines...");

    var lifelines = {};
    var xPos = 100;
    var yPos = 50;
    var spacing = 200;
    var boxWidth = 120;
    var boxHeight = 80;

    // Define lifelines in order
    var lifelineNames = ["Admin", "AdminDashboardUI", "AdminController", "ProductService", "Database"];

    for (var i = 0; i < lifelineNames.length; i++) {
        var name = lifelineNames[i];

        // Create element - Admin is Actor, others are Objects
        var elementType = (name === "Admin") ? "Actor" : "Object";
        var element = sequencePackage.Elements.AddNew(name, elementType);
        element.Update();

        // Add to diagram
        var posString = "l=" + xPos + ";t=" + yPos + ";r=" + (xPos + boxWidth) + ";b=" + (yPos + boxHeight) + ";";
        var diagramObject = diagram.DiagramObjects.AddNew(posString, "");
        diagramObject.ElementID = element.ElementID;
        diagramObject.Sequence = i + 1;
        diagramObject.Update();

        lifelines[name] = element;
        xPos += spacing;

        Session.Output("  ✔ Lifeline: " + name + " (" + elementType + ")");
    }

    diagram.Update();

    Session.Output("");
    Session.Output("Creating messages...");
    Session.Output("");

    // ============================================
    // Step 3: Create Messages (Interactions)
    // ============================================

    var messages = [
        { from: "Admin", to: "AdminDashboardUI", message: "1: navigateToProducts", type: "Synchronous" },
        { from: "AdminDashboardUI", to: "AdminController", message: "2: getProducts", type: "Synchronous" },
        { from: "AdminController", to: "ProductService", message: "3: fetchAllProducts", type: "Synchronous" },
        { from: "ProductService", to: "Database", message: "4: getAllProducts", type: "Synchronous" },
        { from: "Database", to: "ProductService", message: "5: productsData([p1, p2...])", type: "ReturnMessage" },
        { from: "ProductService", to: "AdminController", message: "6: products(List<Product>)", type: "ReturnMessage" },
        { from: "AdminController", to: "AdminDashboardUI", message: "7: productsList(DisplayData)", type: "ReturnMessage" },
        { from: "AdminDashboardUI", to: "Admin", message: "8: displayProductsTable", type: "Synchronous" },
        { from: "Admin", to: "AdminDashboardUI", message: "9: createNewProduct(productData)", type: "Synchronous" },
        { from: "AdminDashboardUI", to: "AdminController", message: "10: addProduct(productData)", type: "Synchronous" },
        { from: "AdminController", to: "ProductService", message: "11: createProduct(productData)", type: "Synchronous" },
        { from: "ProductService", to: "Database", message: "12: insertProduct(productData)", type: "Synchronous" },
        { from: "Database", to: "ProductService", message: "13: productId(PROD-999)", type: "ReturnMessage" },
        { from: "ProductService", to: "AdminController", message: "14: productCreated(true)", type: "ReturnMessage" },
        { from: "AdminController", to: "AdminDashboardUI", message: "15: success(newProduct)", type: "ReturnMessage" },
        { from: "AdminDashboardUI", to: "Admin", message: "16: displaySuccessMessage", type: "Synchronous" },
        { from: "Admin", to: "AdminDashboardUI", message: "17: updateProduct(productId, updates)", type: "Synchronous" },
        { from: "AdminDashboardUI", to: "AdminController", message: "18: updateProduct(productId, updates)", type: "Synchronous" },
        { from: "AdminController", to: "ProductService", message: "19: updateProduct(productId, updates)", type: "Synchronous" },
        { from: "ProductService", to: "Database", message: "20: updateProduct(productId, updates)", type: "Synchronous" },
        { from: "Database", to: "ProductService", message: "21: success(true)", type: "ReturnMessage" },
        { from: "ProductService", to: "AdminController", message: "22: productUpdated(true)", type: "ReturnMessage" },
        { from: "AdminController", to: "AdminDashboardUI", message: "23: updateSuccess(true)", type: "ReturnMessage" },
        { from: "AdminDashboardUI", to: "Admin", message: "24: displayUpdateSuccess", type: "Synchronous" },
        { from: "Admin", to: "AdminDashboardUI", message: "25: deleteProduct(productId)", type: "Synchronous" },
        { from: "AdminDashboardUI", to: "AdminController", message: "26: deleteProduct(productId)", type: "Synchronous" },
        { from: "AdminController", to: "ProductService", message: "27: deleteProduct(productId)", type: "Synchronous" },
        { from: "ProductService", to: "Database", message: "28: deleteProduct(productId)", type: "Synchronous" },
        { from: "Database", to: "ProductService", message: "29: success(true)", type: "ReturnMessage" },
        { from: "ProductService", to: "AdminController", message: "30: productDeleted(true)", type: "ReturnMessage" },
        { from: "AdminController", to: "AdminDashboardUI", message: "31: deleteSuccess(true)", type: "ReturnMessage" },
        { from: "AdminDashboardUI", to: "Admin", message: "32: displayDeleteConfirmation", type: "Synchronous" }
    ];

    // Create the messages
    for (var m = 0; m < messages.length; m++) {
        var msg = messages[m];
        var sourceElement = lifelines[msg.from];
        var targetElement = lifelines[msg.to];

        if (sourceElement && targetElement) {
            var connector = sourceElement.Connectors.AddNew(msg.message, "Sequence");
            connector.SupplierID = targetElement.ElementID;

            // Set message type
            if (msg.type === "ReturnMessage") {
                connector.Subtype = "Return";
            } else if (msg.type === "Synchronous") {
                connector.Subtype = "Synchronous";
            }

            connector.SequenceNo = m + 1;
            connector.Update();

            Session.Output("  ✔ " + msg.message);
        }
    }

    // Save everything
    diagram.Update();
    sequencePackage.Update();

    // Open the diagram
    Repository.OpenDiagram(diagram.DiagramID);

    Session.Output("");
    Session.Output("============================================");
    Session.Output("✅ SUCCESS!");
    Session.Output("============================================");
    Session.Output("");
    Session.Output("Summary:");
    Session.Output("  ✔ Sequence Diagram: Admin Products Management");
    Session.Output("  ✔ 5 Lifelines created");
    Session.Output("  ✔ 32 Messages created");
    Session.Output("");
    Session.Output("The diagram is now open with all messages!");
    Session.Output("============================================");
}

// Run the main function
main();
