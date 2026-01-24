import { Flamework } from "@flamework/core";
import { createLogger } from "shared/utils/logger";

const logger = createLogger("main.server");

logger.info("Initializing Flamework...");

// Add paths to scan for Flamework decorators
Flamework.addPaths("src/server/services");
Flamework.addPaths("src/server/components");
Flamework.addPaths("src/shared");

// Start Flamework
Flamework.ignite();

logger.info("Flamework initialized successfully2.");
