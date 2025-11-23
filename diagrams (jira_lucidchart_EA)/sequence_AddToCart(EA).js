// E-Commerce Sequence Diagram Generator for Enterprise Architect
// Add to Cart - Complete Flow

function main() {
    // Get the selected package
    var selectedPackage = Repository.GetTreeSelectedPackage();

    if (!selectedPackage) {
        Session.Output("❌ ERROR: Please select a package first!");
        Session.Output("Right-click on your package and select it, then run this script again.");
        return;
    }

    Session.Output("============================================");
    Session.Output("Add to Cart Sequence Diagram Generator");
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

    var diagram = sequencePackage.Diagrams.AddNew("Add to Cart", "Sequence");
    diagram.Update();

    Session.Output("  ✔ Diagram created: Add to Cart");
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
    var lifelineNames = ["User", "ProductUI", "CartController", "ProductService", "CartService", "Database"];

    for (var i = 0; i < lifelineNames.length; i++) {
        var name = lifelineNames[i];

        // Create element - User is Actor, others are Objects
        var elementType = (name === "User") ? "Actor" : "Object";
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
        { from: "User", to: "ProductUI", message: "1: clickAddToCart(productId, quantity)", type: "Synchronous" },
        { from: "ProductUI", to: "CartController", message: "2: addToCart(productId, quantity)", type: "Synchronous" },
        { from: "CartController", to: "ProductService", message: "3: getProduct(productId)", type: "Synchronous" },
        { from: "ProductService", to: "Database", message: "4: fetchProduct(productId)", type: "Synchronous" },
        { from: "Database", to: "ProductService", message: "5: productData({name, price, stock})", type: "ReturnMessage" },
        { from: "ProductService", to: "CartController", message: "6: product(ProductObject)", type: "ReturnMessage" },
        { from: "CartController", to: "ProductService", message: "7: checkStock(productId, quantity)", type: "Synchronous" },
        { from: "ProductService", to: "CartController", message: "8: stockAvailable(true)", type: "ReturnMessage" },
        { from: "CartController", to: "CartService", message: "9: getCart(userId)", type: "Synchronous" },
        { from: "CartService", to: "Database", message: "10: fetchCart(userId)", type: "Synchronous" },
        { from: "Database", to: "CartService", message: "11: cartData({items: []})", type: "ReturnMessage" },
        { from: "CartService", to: "CartController", message: "12: cart(CartObject)", type: "ReturnMessage" },
        { from: "CartController", to: "CartService", message: "13: addItemToCart(cartId, productId, qty, price)", type: "Synchronous" },
        { from: "CartService", to: "Database", message: "14: insertCartItem(cartItemData)", type: "Synchronous" },
        { from: "Database", to: "CartService", message: "15: cartItemId(98765)", type: "ReturnMessage" },
        { from: "CartService", to: "CartController", message: "16: itemAdded(true)", type: "ReturnMessage" },
        { from: "CartController", to: "ProductUI", message: "17: success(updatedCart)", type: "ReturnMessage" },
        { from: "ProductUI", to: "User", message: "18: displayCartUpdated", type: "Synchronous" }
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
    Session.Output("  ✔ Sequence Diagram: Add to Cart");
    Session.Output("  ✔ 6 Lifelines created");
    Session.Output("  ✔ 18 Messages created");
    Session.Output("");
    Session.Output("The diagram is now open with all messages!");
    Session.Output("============================================");
}

// Run the main function
main();
