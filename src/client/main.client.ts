import { Flamework } from "@flamework/core";

// Add paths to scan for Flamework decorators
Flamework.addPaths("src/client/controllers");
Flamework.addPaths("src/client/components");
Flamework.addPaths("src/shared");

// Start Flamework
Flamework.ignite();

print("[Client] Flamework initialized successfully!");
