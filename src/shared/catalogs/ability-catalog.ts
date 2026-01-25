/**
 * Ability Catalog
 *
 * Static catalog of slotable ability items.
 * Each entry links to the skill system via SkillId.
 */

import { AssetId } from "shared/common";
import { ManagedImageAssets } from "shared/common";
import { AbilityCatalogEntry } from "../interfaces";

/**
 * Static catalog of all slotable ability items.
 *
 * NOTE: CatalogId must match the WCS skill class name exactly (PascalCase)
 * for automatic skill registration to work.
 */
export const ABILITY_CATALOG: Record<string, AbilityCatalogEntry> = {
	// ─────────────────────────────────────────────────────────────────
	// BASIC ABILITIES
	// ─────────────────────────────────────────────────────────────────
	MeleeAttack: {
		CatalogId: "MeleeAttack",
		DisplayName: "Slash",
		Description: "A reliable close-range strike available to every combatant.",
		CatalogCategory: "Ability",
		IconId: ManagedImageAssets.AbilityIcons.Blood_Siphon,
		Rarity: "Common",
		PurchasePrice: 0,
		SellPrice: 0,
		CurrencyKey: "Gold",
		Cooldown: 0.4,
		ResourceCost: 0,
		CastTime: 0.2,
		StatModifiers: {},
		StatusEffects: [],
	},

	// ─────────────────────────────────────────────────────────────────
	// MAGE ABILITIES
	// ─────────────────────────────────────────────────────────────────
	Fireball: {
		CatalogId: "Fireball",
		DisplayName: "Fireball",
		Description: "Hurl a blazing projectile that explodes on impact.",
		CatalogCategory: "Ability",
		IconId: ManagedImageAssets.AbilityIcons.Fireball,
		Rarity: "Rare",
		PurchasePrice: 500,
		SellPrice: 125,
		CurrencyKey: "Gold",
		Cooldown: 3,
		ResourceCost: 20,
		CastTime: 0.5,
		StatModifiers: {},
		StatusEffects: [],
	},

	RainOfFire: {
		CatalogId: "RainOfFire",
		DisplayName: "Rain of Fire",
		Description: "Call down a devastating rain of fire on a targeted location.",
		CatalogCategory: "Ability",
		IconId: ManagedImageAssets.AbilityIcons.HallowHold, // Placeholder - skill not yet implemented
		Rarity: "Epic",
		PurchasePrice: 2500,
		SellPrice: 625,
		CurrencyKey: "Gold",
		Cooldown: 8,
		ResourceCost: 35,
		CastTime: 0.3,
		StatModifiers: {},
		StatusEffects: [],
	},

	ChainLightning: {
		CatalogId: "ChainLightning",
		DisplayName: "Chain Lightning",
		Description: "Unleash a bolt of lightning that arcs between multiple targets.",
		CatalogCategory: "Ability",
		IconId: ManagedImageAssets.AbilityIcons.Lightning_Bolt,
		Rarity: "Epic",
		PurchasePrice: 2000,
		SellPrice: 500,
		CurrencyKey: "Gold",
		Cooldown: 5,
		ResourceCost: 30,
		CastTime: 0.4,
		StatModifiers: {},
		StatusEffects: [],
	},

	LakeOfDecay: {
		CatalogId: "LakeOfDecay",
		DisplayName: "Lake of Decay",
		Description: "Create a poison lake that damages enemies standing in it.",
		CatalogCategory: "Ability",
		IconId: ManagedImageAssets.AbilityIcons.HallowHold, // Placeholder
		Rarity: "Epic",
		PurchasePrice: 1800,
		SellPrice: 450,
		CurrencyKey: "Gold",
		Cooldown: 10,
		ResourceCost: 40,
		CastTime: 0.5,
		StatModifiers: {},
		StatusEffects: [],
	},

	// ─────────────────────────────────────────────────────────────────
	// UTILITY / SUPPORT ABILITIES
	// ─────────────────────────────────────────────────────────────────
	HealingLight: {
		CatalogId: "HealingLight",
		DisplayName: "Healing Light",
		Description: "Channel restorative energy to heal yourself or an ally.",
		CatalogCategory: "Ability",
		IconId: ManagedImageAssets.AbilityIcons.Whirlwind, // Placeholder - skill not yet implemented
		Rarity: "Rare",
		PurchasePrice: 750,
		SellPrice: 185,
		CurrencyKey: "Gold",
		Cooldown: 6,
		ResourceCost: 25,
		CastTime: 0.8,
		StatModifiers: {},
		StatusEffects: [],
	},

	// ─────────────────────────────────────────────────────────────────
	// TEST ABILITIES
	// ─────────────────────────────────────────────────────────────────
	TestHoldable: {
		CatalogId: "TestHoldable",
		DisplayName: "Test Holdable",
		Description: "A test skill for holdable abilities. Hold to charge, release to fire.",
		CatalogCategory: "Ability",
		IconId: AssetId.Image.AbilityIcon.TestHoldable,
		Rarity: "Common",
		PurchasePrice: 0,
		SellPrice: 0,
		CurrencyKey: "Gold",
		Cooldown: 2,
		ResourceCost: 10,
		CastTime: 0,
		StatModifiers: {},
		StatusEffects: [],
	},
};

/**
 * Retrieves all ability catalog entries as an array.
 */
export function getAbilityCatalogEntries(): AbilityCatalogEntry[] {
	const abilities: AbilityCatalogEntry[] = [];
	for (const [_, entry] of pairs(ABILITY_CATALOG)) {
		abilities.push(entry);
	}
	return abilities;
}
