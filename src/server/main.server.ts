import { Flamework } from "@flamework/core";

// Add paths to scan for Flamework decorators
Flamework.addPaths("src/server/services");
Flamework.addPaths("src/shared");

// Start Flamework
Flamework.ignite();

print("[Server] Flamework initialized successfully!");
