// E-Commerce Sequence Diagram Generator for Enterprise Architect
// User Login - Complete Flow

function main() {
    // Get the selected package
    var selectedPackage = Repository.GetTreeSelectedPackage();

    if (!selectedPackage) {
        Session.Output("❌ ERROR: Please select a package first!");
        Session.Output("Right-click on your package and select it, then run this script again.");
        return;
    }

    Session.Output("============================================");
    Session.Output("User Login Sequence Diagram Generator");
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

    var diagram = sequencePackage.Diagrams.AddNew("User Login", "Sequence");
    diagram.Update();

    Session.Output("  ✔ Diagram created: User Login");
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
    var lifelineNames = ["User", "LoginUI", "AuthController", "UserService", "Database"];

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
        { from: "User", to: "LoginUI", message: "1: enterCredentials(email, password)", type: "Synchronous" },
        { from: "LoginUI", to: "AuthController", message: "2: login(email, password)", type: "Synchronous" },
        { from: "AuthController", to: "UserService", message: "3: findUserByEmail(email)", type: "Synchronous" },
        { from: "UserService", to: "Database", message: "4: getUserByEmail(email)", type: "Synchronous" },
        { from: "Database", to: "UserService", message: "5: userData({id, hash...})", type: "ReturnMessage" },
        { from: "UserService", to: "AuthController", message: "6: user(UserObject)", type: "ReturnMessage" },
        { from: "AuthController", to: "UserService", message: "7: verifyPassword(password, hash)", type: "Synchronous" },
        { from: "UserService", to: "AuthController", message: "8: passwordValid(true)", type: "ReturnMessage" },
        { from: "AuthController", to: "UserService", message: "9: generateToken(userId)", type: "Synchronous" },
        { from: "UserService", to: "AuthController", message: "10: authToken(jwt_token)", type: "ReturnMessage" },
        { from: "AuthController", to: "LoginUI", message: "11: loginSuccess(token, user)", type: "ReturnMessage" },
        { from: "LoginUI", to: "User", message: "12: redirectToDashboard", type: "Synchronous" }
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
    Session.Output("  ✔ Sequence Diagram: User Login");
    Session.Output("  ✔ 5 Lifelines created");
    Session.Output("  ✔ 12 Messages created");
    Session.Output("");
    Session.Output("The diagram is now open with all messages!");
    Session.Output("============================================");
}

// Run the main function
main();
