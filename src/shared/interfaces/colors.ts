import { RarityKey } from "./inventory-keys";

export const RARITY_COLORS: Record<RarityKey, Color3> = {
	Common: Color3.fromRGB(169, 169, 169),    // Dark Gray
	Uncommon: Color3.fromRGB(30, 144, 255),   // Dodger Blue
	Rare: Color3.fromRGB(138, 43, 226),       // Blue Violet
	Epic: Color3.fromRGB(255, 0, 255),        // Magenta
	Legendary: Color3.fromRGB(255, 140, 0),   // Dark Orange
	Mythic: Color3.fromRGB(255, 215, 0),      // Gold
};
