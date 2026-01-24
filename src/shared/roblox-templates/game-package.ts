import { ReplicatedStorage } from "@rbxts/services";
import { createLogger } from "../utils";

const logger = createLogger("game-package");

export const GamePackageFolder = ReplicatedStorage.WaitForChild("SS Game Package") as Folder;
export const AbilityFolder = GamePackageFolder.WaitForChild("Abilities") as Folder;
export const BeamsFolder = GamePackageFolder.WaitForChild("Beams") as Folder;
export const UIElementsFolder = GamePackageFolder.WaitForChild("UIElements") as Folder;
export const EffectsFolder = GamePackageFolder.WaitForChild("Effects") as Folder;

logger.info("Game package folders initialized.");
