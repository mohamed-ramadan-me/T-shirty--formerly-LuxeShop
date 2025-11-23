// E-Commerce Sequence Diagram Generator for Enterprise Architect
// Checkout Order - Complete Flow

function main() {
    // Get the selected package
    var selectedPackage = Repository.GetTreeSelectedPackage();

    if (!selectedPackage) {
        Session.Output("❌ ERROR: Please select a package first!");
        Session.Output("Right-click on your package and select it, then run this script again.");
        return;
    }

    Session.Output("============================================");
    Session.Output("Checkout Order Sequence Diagram Generator");
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

    var diagram = sequencePackage.Diagrams.AddNew("Checkout Order", "Sequence");
    diagram.Update();

    Session.Output("  ✔ Diagram created: Checkout Order");
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
    var lifelineNames = ["User", "CheckoutUI", "OrderController", "CartService", "OrderService", "PaymentService", "Database"];

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
        { from: "User", to: "CheckoutUI", message: "1: proceedToCheckout", type: "Synchronous" },
        { from: "CheckoutUI", to: "OrderController", message: "2: initiateCheckout(userId)", type: "Synchronous" },
        { from: "OrderController", to: "CartService", message: "3: getCart(userId)", type: "Synchronous" },
        { from: "CartService", to: "Database", message: "4: fetchCartItems(userId)", type: "Synchronous" },
        { from: "Database", to: "CartService", message: "5: cartItems([item1, item2])", type: "ReturnMessage" },
        { from: "CartService", to: "OrderController", message: "6: cart(CartObject)", type: "ReturnMessage" },
        { from: "OrderController", to: "CheckoutUI", message: "7: cartDetails(DisplayData)", type: "ReturnMessage" },
        { from: "CheckoutUI", to: "User", message: "8: displayCheckoutForm", type: "Synchronous" },
        { from: "User", to: "CheckoutUI", message: "9: submitOrder(address, paymentMethod)", type: "Synchronous" },
        { from: "CheckoutUI", to: "OrderController", message: "10: createOrder(orderData)", type: "Synchronous" },
        { from: "OrderController", to: "OrderService", message: "11: createOrder(userId, items, address)", type: "Synchronous" },
        { from: "OrderService", to: "Database", message: "12: insertOrder(orderData)", type: "Synchronous" },
        { from: "Database", to: "OrderService", message: "13: orderId(55555)", type: "ReturnMessage" },
        { from: "OrderService", to: "Database", message: "14: insertOrderItems(orderId, items)", type: "Synchronous" },
        { from: "Database", to: "OrderService", message: "15: success(true)", type: "ReturnMessage" },
        { from: "OrderService", to: "OrderController", message: "16: order(OrderObject)", type: "ReturnMessage" },
        { from: "OrderController", to: "PaymentService", message: "17: processPayment(orderId, amount, method)", type: "Synchronous" },
        { from: "PaymentService", to: "Database", message: "18: insertPayment(paymentData)", type: "Synchronous" },
        { from: "Database", to: "PaymentService", message: "19: paymentId(PAY-123)", type: "ReturnMessage" },
        { from: "PaymentService", to: "OrderController", message: "20: paymentSuccess(true)", type: "ReturnMessage" },
        { from: "OrderController", to: "CartService", message: "21: clearCart(userId)", type: "Synchronous" },
        { from: "CartService", to: "Database", message: "22: deleteCartItems(userId)", type: "Synchronous" },
        { from: "Database", to: "CartService", message: "23: success(true)", type: "ReturnMessage" },
        { from: "CartService", to: "OrderController", message: "24: cartCleared(true)", type: "ReturnMessage" },
        { from: "OrderController", to: "CheckoutUI", message: "25: orderSuccess(orderId)", type: "ReturnMessage" },
        { from: "CheckoutUI", to: "User", message: "26: displayOrderConfirmation", type: "Synchronous" }
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
    Session.Output("  ✔ Sequence Diagram: Checkout Order");
    Session.Output("  ✔ 7 Lifelines created");
    Session.Output("  ✔ 26 Messages created");
    Session.Output("");
    Session.Output("The diagram is now open with all messages!");
    Session.Output("============================================");
}

// Run the main function
main();
