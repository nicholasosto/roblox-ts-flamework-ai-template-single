/**
 * Soul Gem Catalog
 *
 * Static definitions for all soul gems in the game.
 * Each entry defines the gem's properties and stat modifiers.
 */

import { CatalogEntry } from "../interfaces";

/**
 * Soul Gem Catalog Registry
 * All available soul gems organized by their unique ID
 */
export const SOUL_GEM_CATALOG: Record<string, CatalogEntry> = {
	// ─────────────────────────────────────────────────────────────────
	// BOSS DROP GEMS
	// ─────────────────────────────────────────────────────────────────

	penitent_knight_soul: {
		CatalogId: "penitent_knight_soul",
		DisplayName: "Penitent Knight's Soul",
		Description: "The soul of a fallen knight, granting enhanced vitality and resilience.",
		CatalogCategory: "SoulGem",
		IconId: "rbxassetid://76174031397497",
		Rarity: "Epic",
		PurchasePrice: 5000,
		SellPrice: 1250,
		CurrencyKey: "Gold",
		StatModifiers: {
			Vitality: 5,
			PhysicalResistance: 10,
		},
		StatusEffects: ["RegenerativeShield"],
	},

	shadow_lord_essence: {
		CatalogId: "shadow_lord_essence",
		DisplayName: "Shadow Lord's Essence",
		Description:
			"A fragment of the Shadow Lord's essence, boosting strength and critical chance.",
		CatalogCategory: "SoulGem",
		IconId: "rbxassetid://137115253994988",
		Rarity: "Legendary",
		PurchasePrice: 15000,
		SellPrice: 3750,
		CurrencyKey: "Gold",
		StatModifiers: {
			Strength: 8,
			Intelligence: 4,
			CritChance: 5,
		},
		StatusEffects: ["LifeSteal"],
	},

	infernal_guardian_core: {
		CatalogId: "infernal_guardian_core",
		DisplayName: "Infernal Guardian's Core",
		Description: "The core of an infernal guardian, enhancing vitality and essence resistance.",
		CatalogCategory: "SoulGem",
		IconId: "rbxassetid://90530068222238",
		Rarity: "Epic",
		PurchasePrice: 4000,
		SellPrice: 1000,
		CurrencyKey: "Gold",
		StatModifiers: {
			Vitality: 6,
			EssenceResistance: 15,
		},
		StatusEffects: ["DamageReflect"],
	},

	// ─────────────────────────────────────────────────────────────────
	// QUEST REWARD GEMS
	// ─────────────────────────────────────────────────────────────────

	wanderers_blessing: {
		CatalogId: "wanderers_blessing",
		DisplayName: "Wanderer's Blessing",
		Description: "A gem blessed by ancient wanderers, enhancing agility and movement speed.",
		CatalogCategory: "SoulGem",
		IconId: "rbxassetid://114675020831306",
		Rarity: "Rare",
		PurchasePrice: 1500,
		SellPrice: 375,
		CurrencyKey: "Gold",
		StatModifiers: {
			Agility: 6,
			MovementSpeed: 5,
		},
		StatusEffects: ["MovementBoost"],
	},

	scholars_insight: {
		CatalogId: "scholars_insight",
		DisplayName: "Scholar's Insight",
		Description: "A gem that sharpens the mind, boosting intelligence and spirit.",
		CatalogCategory: "SoulGem",
		IconId: "rbxassetid://0",
		Rarity: "Rare",
		PurchasePrice: 1500,
		SellPrice: 375,
		CurrencyKey: "Gold",
		StatModifiers: {
			Intelligence: 8,
			Spirit: 4,
		},
		StatusEffects: ["ResourceRegen"],
	},

	veterans_resolve: {
		CatalogId: "veterans_resolve",
		DisplayName: "Veteran's Resolve",
		Description:
			"A gem embodying the steadfastness of a veteran, increasing strength and resilience.",
		CatalogCategory: "SoulGem",
		IconId: "rbxassetid://115888614111404",
		Rarity: "Epic",
		PurchasePrice: 5000,
		SellPrice: 1250,
		CurrencyKey: "Gold",
		StatModifiers: {
			Strength: 5,
			Vitality: 5,
			PhysicalResistance: 8,
		},
		StatusEffects: ["DamageReduction"],
	},

	// ─────────────────────────────────────────────────────────────────
	// SECRET LOCATION GEMS
	// ─────────────────────────────────────────────────────────────────

	forgotten_souls_whisper: {
		CatalogId: "forgotten_souls_whisper",
		DisplayName: "Forgotten Soul's Whisper",
		Description:
			"A gem that carries the whispers of forgotten souls, enhancing luck and critical chance.",
		CatalogCategory: "SoulGem",
		IconId: "rbxassetid://0",
		Rarity: "Legendary",
		PurchasePrice: 12000,
		SellPrice: 3000,
		CurrencyKey: "Gold",
		StatModifiers: {
			Luck: 10,
			CritChance: 8,
		},
		StatusEffects: ["CriticalEnhance"],
	},

	moonlit_sanctuary_gem: {
		CatalogId: "moonlit_sanctuary_gem",
		DisplayName: "Moonlit Sanctuary Gem",
		Description:
			"A gem infused with the serene energy of a moonlit sanctuary, boosting spirit and mental resistance.",
		CatalogCategory: "SoulGem",
		IconId: "rbxassetid://72332862236934",
		Rarity: "Epic",
		PurchasePrice: 4500,
		SellPrice: 1125,
		CurrencyKey: "Gold",
		StatModifiers: {
			Spirit: 7,
			MentalResistance: 10,
		},
		StatusEffects: ["RegenerativeShield"],
	},

	// ─────────────────────────────────────────────────────────────────
	// STARTER/COMMON GEMS
	// ─────────────────────────────────────────────────────────────────

	fledgling_soul_shard: {
		CatalogId: "fledgling_soul_shard",
		DisplayName: "Fledgling Soul Shard",
		Description:
			"A small shard containing the fledgling soul energy, enhancing vitality and strength.",
		CatalogCategory: "SoulGem",
		IconId: "rbxassetid://94792536824771",
		Rarity: "Common",
		PurchasePrice: 100,
		SellPrice: 25,
		CurrencyKey: "Gold",
		StatModifiers: {
			Vitality: 2,
			Strength: 1,
		},
		StatusEffects: [],
	},

	travelers_comfort: {
		CatalogId: "travelers_comfort",
		DisplayName: "Traveler's Comfort",
		Description: "A gem that soothes the weary traveler, boosting vitality and spirit.",
		CatalogCategory: "SoulGem",
		IconId: "rbxassetid://72225362452862",
		Rarity: "Common",
		PurchasePrice: 250,
		SellPrice: 60,
		CurrencyKey: "Gold",
		AccessoryId: "TravelersComfort",
		StatModifiers: {
			Vitality: 1,
			Spirit: 2,
		},
		StatusEffects: ["ResourceRegen"],
	},

	ironhide_fragment: {
		CatalogId: "ironhide_fragment",
		DisplayName: "Ironhide Fragment",
		Description:
			"A fragment that hardens the soul, enhancing physical resistance and vitality.",
		CatalogCategory: "SoulGem",
		IconId: "rbxassetid://76174031397497",
		Rarity: "Rare",
		PurchasePrice: 2000,
		SellPrice: 500,
		CurrencyKey: "Gold",
		StatModifiers: {
			Vitality: 4,
			PhysicalResistance: 12,
		},
		StatusEffects: ["DamageReduction"],
	},

	// ─────────────────────────────────────────────────────────────────
	// MYTHIC TIER GEMS (End-game)
	// ─────────────────────────────────────────────────────────────────

	primordial_soul_nexus: {
		CatalogId: "primordial_soul_nexus",
		DisplayName: "Primordial Soul Nexus",
		Description: "A nexus of primordial soul energy, vastly enhancing all major attributes.",
		CatalogCategory: "SoulGem",
		IconId: "rbxassetid://116316685367117",
		Rarity: "Mythic",
		PurchasePrice: 50000,
		SellPrice: 12500,
		CurrencyKey: "Gold",
		StatModifiers: {
			Strength: 15,
			Vitality: 15,
			Intelligence: 10,
			Spirit: 10,
			Agility: 10,
			Luck: 5,
		},
		StatusEffects: ["RegenerativeShield"],
	},
};

export function getSoulGemCatalogEntries(): CatalogEntry[] {
	const soulGems: CatalogEntry[] = [];
	for (const [_, entry] of pairs(SOUL_GEM_CATALOG)) {
		soulGems.push(entry);
	}
	return soulGems;
}
