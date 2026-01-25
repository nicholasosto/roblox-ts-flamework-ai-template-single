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
 */
export const ABILITY_CATALOG: Record<string, AbilityCatalogEntry> = {
	// ─────────────────────────────────────────────────────────────────
	// BASIC ABILITIES
	// ─────────────────────────────────────────────────────────────────
	slash: {
		CatalogId: "slash",
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
	fireball: {
		CatalogId: "fireball",
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

	rain_fire: {
		CatalogId: "rain_fire",
		DisplayName: "Rain of Fire",
		Description: "Call down a devastating rain of fire on a targeted location.",
		CatalogCategory: "Ability",
		IconId: ManagedImageAssets.AbilityIcons.HallowHold, // Placeholder
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

	chain_lightning: {
		CatalogId: "chain_lightning",
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

	// ─────────────────────────────────────────────────────────────────
	// UTILITY / SUPPORT ABILITIES
	// ─────────────────────────────────────────────────────────────────
	healing_light: {
		CatalogId: "healing_light",
		DisplayName: "Healing Light",
		Description: "Channel restorative energy to heal yourself or an ally.",
		CatalogCategory: "Ability",
		IconId: ManagedImageAssets.AbilityIcons.Whirlwind, // Placeholder
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
	test_holdable: {
		CatalogId: "test_holdable",
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
