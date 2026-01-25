/**
 * Canonical Asset Registry
 *
 * Single source of truth for all Roblox asset IDs used in this package.
 * All values are typed to their asset category, preventing mix-ups at compile time.
 *
 * @example Usage
 * ```ts
 * import { AssetId } from "shared/assets";
 *
 * // Animation – set on an Animation instance
 * const animation = new Instance("Animation");
 * animation.AnimationId = AssetId.Animation.Humanoid.Run;
 *
 * // Image – set on an ImageLabel
 * const imageLabel = new Instance("ImageLabel");
 * imageLabel.Image = AssetId.Image.UI.InventorySlot;
 *
 * // Audio – set on a Sound instance
 * const sound = new Instance("Sound");
 * sound.SoundId = AssetId.Audio.SFX.SwordHit;
 * ```
 */

import type { AnimationAsset, AudioAsset, ImageAsset } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Animation Assets
// ─────────────────────────────────────────────────────────────────────────────

const Animation = {
	Humanoid: {
		Idle: "rbxassetid://1234567890" as AnimationAsset,
		Walk: "rbxassetid://1234567891" as AnimationAsset,
		Run: "rbxassetid://1234567892" as AnimationAsset,
		Jump: "rbxassetid://1234567893" as AnimationAsset,
		Fall: "rbxassetid://1234567894" as AnimationAsset,
	},
	Combat: {
		SwordSlash: "rbxassetid://1234567900" as AnimationAsset,
		SwordThrust: "rbxassetid://1234567901" as AnimationAsset,
		Block: "rbxassetid://1234567902" as AnimationAsset,
		Dodge: "rbxassetid://1234567903" as AnimationAsset,
	},
	Emote: {
		Wave: "rbxassetid://1234567910" as AnimationAsset,
		Dance: "rbxassetid://1234567911" as AnimationAsset,
		Sit: "rbxassetid://1234567912" as AnimationAsset,
	},
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Image Assets
// ─────────────────────────────────────────────────────────────────────────────

const Image = {
    AbilityIcon: {
        Fireball: "rbxassetid://2345678900" as ImageAsset,
        IceSpike: "rbxassetid://2345678901" as ImageAsset,
        LightningBolt: "rbxassetid://2345678902" as ImageAsset,
        Heal: "rbxassetid://2345678903" as ImageAsset,
        Shield: "rbxassetid://2345678904" as ImageAsset,
        Stealth: "rbxassetid://2345678905" as ImageAsset,
        Teleport: "rbxassetid://2345678906" as ImageAsset,
        Summon: "rbxassetid://2345678907" as ImageAsset,
        TestHoldable: "rbxassetid://106194862083123" as ImageAsset,
    },
	UI: {
		InventorySlot: "rbxassetid://2345678900" as ImageAsset,
		SkillSlot: "rbxassetid://2345678901" as ImageAsset,
		EquipmentSlot: "rbxassetid://2345678902" as ImageAsset,
		ButtonDefault: "rbxassetid://2345678903" as ImageAsset,
		ButtonHover: "rbxassetid://2345678904" as ImageAsset,
		ButtonPressed: "rbxassetid://2345678905" as ImageAsset,
		PanelBackground: "rbxassetid://2345678906" as ImageAsset,
		HealthBar: "rbxassetid://2345678907" as ImageAsset,
		ManaBar: "rbxassetid://2345678908" as ImageAsset,
	},
	Icon: {
		Sword: "rbxassetid://2345678920" as ImageAsset,
		Shield: "rbxassetid://2345678921" as ImageAsset,
		Potion: "rbxassetid://2345678922" as ImageAsset,
		Coin: "rbxassetid://2345678923" as ImageAsset,
		Gem: "rbxassetid://2345678924" as ImageAsset,
	},
	Effect: {
		Glow: "rbxassetid://2345678930" as ImageAsset,
		Sparkle: "rbxassetid://2345678931" as ImageAsset,
		Smoke: "rbxassetid://2345678932" as ImageAsset,
	},
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Audio Assets
// ─────────────────────────────────────────────────────────────────────────────

const Audio = {
	SFX: {
		SwordHit: "rbxassetid://3456789000" as AudioAsset,
		SwordSwing: "rbxassetid://3456789001" as AudioAsset,
		Footstep: "rbxassetid://3456789002" as AudioAsset,
		Jump: "rbxassetid://3456789003" as AudioAsset,
		Land: "rbxassetid://3456789004" as AudioAsset,
		ItemPickup: "rbxassetid://3456789005" as AudioAsset,
		ItemDrop: "rbxassetid://3456789006" as AudioAsset,
		ButtonClick: "rbxassetid://3456789007" as AudioAsset,
		ButtonHover: "rbxassetid://3456789008" as AudioAsset,
	},
	Music: {
		MainMenu: "rbxassetid://3456789020" as AudioAsset,
		Battle: "rbxassetid://3456789021" as AudioAsset,
		Exploration: "rbxassetid://3456789022" as AudioAsset,
		Victory: "rbxassetid://3456789023" as AudioAsset,
		Defeat: "rbxassetid://3456789024" as AudioAsset,
	},
	Ambient: {
		Wind: "rbxassetid://3456789030" as AudioAsset,
		Rain: "rbxassetid://3456789031" as AudioAsset,
		Fire: "rbxassetid://3456789032" as AudioAsset,
		Water: "rbxassetid://3456789033" as AudioAsset,
	},
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Master asset registry namespace.
 *
 * Access pattern: `AssetId.Category.Subcategory.Name`
 */
export const AssetId = {
	Animation,
	Image,
	Audio,
} as const;

/** Type representing the entire AssetId registry */
export type AssetIdRegistry = typeof AssetId;
