// E-Commerce Sequence Diagram Generator for Enterprise Architect
// Admin Orders Management - Complete Flow

function main() {
    // Get the selected package
    var selectedPackage = Repository.GetTreeSelectedPackage();

    if (!selectedPackage) {
        Session.Output("❌ ERROR: Please select a package first!");
        Session.Output("Right-click on your package and select it, then run this script again.");
        return;
    }

    Session.Output("============================================");
    Session.Output("Admin Orders Management Sequence Diagram Generator");
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

    var diagram = sequencePackage.Diagrams.AddNew("Admin Orders Management", "Sequence");
    diagram.Update();

    Session.Output("  ✔ Diagram created: Admin Orders Management");
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
    var lifelineNames = ["Admin", "AdminDashboardUI", "AdminController", "OrderService", "Database"];

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
        { from: "Admin", to: "AdminDashboardUI", message: "1: navigateToOrders", type: "Synchronous" },
        { from: "AdminDashboardUI", to: "AdminController", message: "2: getOrders", type: "Synchronous" },
        { from: "AdminController", to: "OrderService", message: "3: fetchAllOrders", type: "Synchronous" },
        { from: "OrderService", to: "Database", message: "4: getAllOrders", type: "Synchronous" },
        { from: "Database", to: "OrderService", message: "5: ordersData([order1, order2...])", type: "ReturnMessage" },
        { from: "OrderService", to: "AdminController", message: "6: orders(List<Order>)", type: "ReturnMessage" },
        { from: "AdminController", to: "AdminDashboardUI", message: "7: ordersList(DisplayData)", type: "ReturnMessage" },
        { from: "AdminDashboardUI", to: "Admin", message: "8: displayOrdersTable", type: "Synchronous" },
        { from: "Admin", to: "AdminDashboardUI", message: "9: updateOrderStatus(orderId, newStatus)", type: "Synchronous" },
        { from: "AdminDashboardUI", to: "AdminController", message: "10: updateStatus(orderId, newStatus)", type: "Synchronous" },
        { from: "AdminController", to: "OrderService", message: "11: updateOrderStatus(orderId, newStatus)", type: "Synchronous" },
        { from: "OrderService", to: "Database", message: "12: updateOrder(orderId, status)", type: "Synchronous" },
        { from: "Database", to: "OrderService", message: "13: success(true)", type: "ReturnMessage" },
        { from: "OrderService", to: "AdminController", message: "14: statusUpdated(true)", type: "ReturnMessage" },
        { from: "AdminController", to: "AdminDashboardUI", message: "15: updateSuccess(true)", type: "ReturnMessage" },
        { from: "AdminDashboardUI", to: "Admin", message: "16: displaySuccessMessage", type: "Synchronous" }
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
    Session.Output("  ✔ Sequence Diagram: Admin Orders Management");
    Session.Output("  ✔ 5 Lifelines created");
    Session.Output("  ✔ 16 Messages created");
    Session.Output("");
    Session.Output("The diagram is now open with all messages!");
    Session.Output("============================================");
}

// Run the main function
main();
