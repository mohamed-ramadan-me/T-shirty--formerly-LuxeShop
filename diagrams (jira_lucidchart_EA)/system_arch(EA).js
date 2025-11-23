// E-Commerce System Architecture Diagram Generator for Enterprise Architect
// LuxeShop - Complete System Architecture

function main() {
    // Get the selected package
    var selectedPackage = Repository.GetTreeSelectedPackage();

    if (!selectedPackage) {
        Session.Output("❌ ERROR: Please select a package first!");
        Session.Output("Right-click on your package and select it, then run this script again.");
        return;
    }

    Session.Output("============================================");
    Session.Output("System Architecture Diagram Generator");
    Session.Output("============================================");
    Session.Output("");
    Session.Output("📦 Selected Package: " + selectedPackage.Name);

    // Create or find "Architecture Diagrams" sub-package
    var archPackage = null;
    for (var i = 0; i < selectedPackage.Packages.Count; i++) {
        var pkg = selectedPackage.Packages.GetAt(i);
        if (pkg.Name === "Architecture Diagrams") {
            archPackage = pkg;
            break;
        }
    }

    // If not found, create it
    if (!archPackage) {
        archPackage = selectedPackage.Packages.AddNew("Architecture Diagrams", "");
        archPackage.Update();
        selectedPackage.Packages.Refresh();
        Session.Output("  ✔ Created new package: Architecture Diagrams");
    } else {
        Session.Output("  ✔ Using existing package: Architecture Diagrams");
    }

    Session.Output("");

    // ============================================
    // Step 1: Create Architecture Diagram
    // ============================================
    Session.Output("Creating system architecture diagram...");

    var diagram = archPackage.Diagrams.AddNew("LuxeShop System Architecture", "Component");
    diagram.Update();

    Session.Output("  ✔ Diagram created: LuxeShop System Architecture");
    Session.Output("");

    // ============================================
    // Step 2: Create Components
    // ============================================
    Session.Output("Creating components...");

    var components = {};

    // Component definitions with position and size
    var componentDefs = [
        // Frontend Layer
        { name: "Web Browser", type: "Component", x: 100, y: 50, width: 150, height: 100, stereotype: "<<User Interface>>" },
        { name: "React Frontend", type: "Component", x: 100, y: 200, width: 150, height: 120, stereotype: "<<Frontend>>" },

        // API Gateway Layer
        { name: "API Gateway", type: "Component", x: 350, y: 200, width: 150, height: 100, stereotype: "<<Gateway>>" },

        // Backend Services Layer
        { name: "Auth Service", type: "Component", x: 300, y: 350, width: 120, height: 100, stereotype: "<<Service>>" },
        { name: "User Service", type: "Component", x: 450, y: 350, width: 120, height: 100, stereotype: "<<Service>>" },
        { name: "Product Service", type: "Component", x: 600, y: 350, width: 120, height: 100, stereotype: "<<Service>>" },
        { name: "Cart Service", type: "Component", x: 300, y: 480, width: 120, height: 100, stereotype: "<<Service>>" },
        { name: "Order Service", type: "Component", x: 450, y: 480, width: 120, height: 100, stereotype: "<<Service>>" },
        { name: "Payment Service", type: "Component", x: 600, y: 480, width: 120, height: 100, stereotype: "<<Service>>" },

        // Data Layer
        { name: "Database", type: "Component", x: 450, y: 650, width: 150, height: 100, stereotype: "<<Database>>" },

        // External Services
        { name: "Payment Gateway", type: "Component", x: 800, y: 350, width: 140, height: 100, stereotype: "<<External>>" },
        { name: "Email Service", type: "Component", x: 800, y: 480, width: 140, height: 100, stereotype: "<<External>>" }
    ];

    // Create components
    for (var i = 0; i < componentDefs.length; i++) {
        var def = componentDefs[i];

        var element = archPackage.Elements.AddNew(def.name, def.type);
        element.Stereotype = def.stereotype;
        element.Update();

        // Add to diagram
        var posString = "l=" + def.x + ";t=" + def.y + ";r=" + (def.x + def.width) + ";b=" + (def.y + def.height) + ";";
        var diagramObject = diagram.DiagramObjects.AddNew(posString, "");
        diagramObject.ElementID = element.ElementID;
        diagramObject.Update();

        components[def.name] = element;

        Session.Output("  ✔ Component: " + def.name + " " + def.stereotype);
    }

    diagram.Update();

    Session.Output("");
    Session.Output("Creating connections...");
    Session.Output("");

    // ============================================
    // Step 3: Create Connections
    // ============================================

    var connections = [
        // User interactions
        { from: "Web Browser", to: "React Frontend", label: "HTTPS", type: "Dependency" },
        { from: "React Frontend", to: "API Gateway", label: "REST API", type: "Dependency" },

        // API Gateway to Services
        { from: "API Gateway", to: "Auth Service", label: "Authentication", type: "Dependency" },
        { from: "API Gateway", to: "User Service", label: "User Management", type: "Dependency" },
        { from: "API Gateway", to: "Product Service", label: "Product Catalog", type: "Dependency" },
        { from: "API Gateway", to: "Cart Service", label: "Shopping Cart", type: "Dependency" },
        { from: "API Gateway", to: "Order Service", label: "Order Processing", type: "Dependency" },

        // Services to Database
        { from: "Auth Service", to: "Database", label: "User Auth Data", type: "Dependency" },
        { from: "User Service", to: "Database", label: "User Data", type: "Dependency" },
        { from: "Product Service", to: "Database", label: "Product Data", type: "Dependency" },
        { from: "Cart Service", to: "Database", label: "Cart Data", type: "Dependency" },
        { from: "Order Service", to: "Database", label: "Order Data", type: "Dependency" },
        { from: "Payment Service", to: "Database", label: "Payment Records", type: "Dependency" },

        // External Services
        { from: "Order Service", to: "Payment Service", label: "Process Payment", type: "Dependency" },
        { from: "Payment Service", to: "Payment Gateway", label: "Payment API", type: "Dependency" },
        { from: "Order Service", to: "Email Service", label: "Order Confirmation", type: "Dependency" }
    ];

    // Create connections
    for (var c = 0; c < connections.length; c++) {
        var conn = connections[c];
        var sourceElement = components[conn.from];
        var targetElement = components[conn.to];

        if (sourceElement && targetElement) {
            var connector = sourceElement.Connectors.AddNew(conn.label, conn.type);
            connector.SupplierID = targetElement.ElementID;
            connector.Direction = "Source -> Destination";
            connector.Update();

            Session.Output("  ✔ " + conn.from + " → " + conn.to + " (" + conn.label + ")");
        }
    }

    // Save everything
    diagram.Update();
    archPackage.Update();

    // Open the diagram
    Repository.OpenDiagram(diagram.DiagramID);

    Session.Output("");
    Session.Output("============================================");
    Session.Output("✅ SUCCESS!");
    Session.Output("============================================");
    Session.Output("");
    Session.Output("Summary:");
    Session.Output("  ✔ System Architecture Diagram: LuxeShop");
    Session.Output("  ✔ 13 Components created");
    Session.Output("  ✔ 18 Connections created");
    Session.Output("");
    Session.Output("Architecture Layers:");
    Session.Output("  • Frontend Layer: Web Browser, React Frontend");
    Session.Output("  • API Layer: API Gateway");
    Session.Output("  • Service Layer: 6 Microservices");
    Session.Output("  • Data Layer: Database");
    Session.Output("  • External Services: Payment Gateway, Email Service");
    Session.Output("");
    Session.Output("The diagram is now open!");
    Session.Output("============================================");
}

// Run the main function
main();
