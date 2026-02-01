import { ReplicatedStorage } from "@rbxts/services";
import { createLogger } from "../utils";

const logger = createLogger("game-package");

export const GamePackageFolder = ReplicatedStorage.WaitForChild("SS Game Package") as Folder;
export const AbilityFolder = GamePackageFolder.WaitForChild("Abilities") as Folder;
export const BeamsFolder = GamePackageFolder.WaitForChild("Beams") as Folder;
export const UIElementsFolder = GamePackageFolder.WaitForChild("UIElements") as Folder;
export const EffectsFolder = GamePackageFolder.WaitForChild("Effects") as Folder;

export const RigsFolder = GamePackageFolder.WaitForChild("Rigs") as Folder;
export const RigNames = RigsFolder.GetChildren().map((rig) => rig.Name);
logger.debug(`Available rigs: ${RigNames.join(", ")}`);
logger.info("Game package folders initialized.");

/** All available character rig names */
export const RIG_KEYS = [
	"Robot_Freddy_Faz",
	"Anime_Female",
	"Blood_Toad",
	"Void_Master",
	"Robot_Monkey_Mecha",
	"Robot_Evil_Hal",
	"Spirit_Dragon_Boy",
	"Spirit_Dragon_Girl",
	"Spirit_Elemental",
	"Decay_Zombie",
	"Decay_Zombie_Hipster",
	"Robot_Steambot",
	"Void_Wendigo",
	"Robot_Worker",
] as const;

/** Type for rig key values */
export type RigKey = (typeof RIG_KEYS)[number];
