/**
 * NPC Loot Tables
 * Defines drop tables for NPCs
 */

import { NPCLootTable } from "./npc-types";

/**
 * Master loot table registry
 */
export const LOOT_TABLES: Record<string, NPCLootTable> = {
	// ─────────────────────────────────────────────────────────────────
	// VOID FACTION LOOT
	// ─────────────────────────────────────────────────────────────────
	void_common: {
		id: "void_common",
		guaranteedDrops: [],
		randomDrops: [
			{ catalogId: "VoidEssence", weight: 50, minQty: 1, maxQty: 3 },
			{ catalogId: "DarkShard", weight: 30, minQty: 1, maxQty: 2 },
			{ catalogId: "ShadowCloth", weight: 20, minQty: 1, maxQty: 1 },
		],
		dropCount: { min: 0, max: 2 },
		currencyDrops: {
			Gold: { min: 5, max: 15 },
		},
	},

	void_elite: {
		id: "void_elite",
		guaranteedDrops: [{ catalogId: "VoidEssence", weight: 100, minQty: 3, maxQty: 5 }],
		randomDrops: [
			{ catalogId: "DarkShard", weight: 40, minQty: 2, maxQty: 4 },
			{ catalogId: "ShadowCloth", weight: 30, minQty: 1, maxQty: 2 },
			{ catalogId: "VoidCore", weight: 15, minQty: 1, maxQty: 1 },
			{ catalogId: "Fireball", weight: 5, minQty: 1, maxQty: 1 }, // Ability drop!
		],
		dropCount: { min: 1, max: 3 },
		currencyDrops: {
			Gold: { min: 25, max: 75 },
			Gems: { min: 1, max: 3 },
		},
	},

	// ─────────────────────────────────────────────────────────────────
	// ROBOT FACTION LOOT
	// ─────────────────────────────────────────────────────────────────
	robot_scrap: {
		id: "robot_scrap",
		guaranteedDrops: [],
		randomDrops: [
			{ catalogId: "ScrapMetal", weight: 60, minQty: 1, maxQty: 3 },
			{ catalogId: "WornGear", weight: 30, minQty: 1, maxQty: 2 },
			{ catalogId: "SparkPlug", weight: 10, minQty: 1, maxQty: 1 },
		],
		dropCount: { min: 0, max: 2 },
		currencyDrops: {
			Gold: { min: 2, max: 8 },
		},
	},

	robot_common: {
		id: "robot_common",
		guaranteedDrops: [],
		randomDrops: [
			{ catalogId: "ScrapMetal", weight: 40, minQty: 2, maxQty: 4 },
			{ catalogId: "WornGear", weight: 35, minQty: 1, maxQty: 3 },
			{ catalogId: "SparkPlug", weight: 20, minQty: 1, maxQty: 2 },
			{ catalogId: "CircuitBoard", weight: 5, minQty: 1, maxQty: 1 },
		],
		dropCount: { min: 1, max: 2 },
		currencyDrops: {
			Gold: { min: 10, max: 25 },
		},
	},

	robot_boss: {
		id: "robot_boss",
		guaranteedDrops: [
			{ catalogId: "CircuitBoard", weight: 100, minQty: 3, maxQty: 5 },
			{ catalogId: "PowerCore", weight: 100, minQty: 1, maxQty: 1 },
		],
		randomDrops: [
			{ catalogId: "ScrapMetal", weight: 30, minQty: 5, maxQty: 10 },
			{ catalogId: "RareAlloy", weight: 25, minQty: 1, maxQty: 3 },
			{ catalogId: "MeleeAttack", weight: 10, minQty: 1, maxQty: 1 }, // Ability drop
			{ catalogId: "Fireball", weight: 5, minQty: 1, maxQty: 1 }, // Rare ability
		],
		dropCount: { min: 2, max: 4 },
		currencyDrops: {
			Gold: { min: 100, max: 300 },
			Gems: { min: 5, max: 15 },
		},
	},

	// ─────────────────────────────────────────────────────────────────
	// DECAY FACTION LOOT
	// ─────────────────────────────────────────────────────────────────
	decay_common: {
		id: "decay_common",
		guaranteedDrops: [],
		randomDrops: [
			{ catalogId: "RottenFlesh", weight: 50, minQty: 1, maxQty: 2 },
			{ catalogId: "BoneFragment", weight: 35, minQty: 1, maxQty: 3 },
			{ catalogId: "TatteredCloth", weight: 15, minQty: 1, maxQty: 1 },
		],
		dropCount: { min: 0, max: 2 },
		currencyDrops: {
			Gold: { min: 1, max: 5 },
		},
	},

	// ─────────────────────────────────────────────────────────────────
	// SPIRIT FACTION LOOT
	// ─────────────────────────────────────────────────────────────────
	spirit_common: {
		id: "spirit_common",
		guaranteedDrops: [],
		randomDrops: [
			{ catalogId: "EtherealDust", weight: 45, minQty: 1, maxQty: 3 },
			{ catalogId: "SpiritOrb", weight: 35, minQty: 1, maxQty: 2 },
			{ catalogId: "GhostThread", weight: 20, minQty: 1, maxQty: 1 },
		],
		dropCount: { min: 0, max: 2 },
		currencyDrops: {
			Gold: { min: 8, max: 20 },
		},
	},

	spirit_elite: {
		id: "spirit_elite",
		guaranteedDrops: [{ catalogId: "SpiritOrb", weight: 100, minQty: 2, maxQty: 4 }],
		randomDrops: [
			{ catalogId: "EtherealDust", weight: 35, minQty: 2, maxQty: 5 },
			{ catalogId: "GhostThread", weight: 30, minQty: 1, maxQty: 3 },
			{ catalogId: "DragonScale", weight: 20, minQty: 1, maxQty: 2 },
			{ catalogId: "Fireball", weight: 10, minQty: 1, maxQty: 1 },
		],
		dropCount: { min: 1, max: 3 },
		currencyDrops: {
			Gold: { min: 40, max: 100 },
			Gems: { min: 2, max: 5 },
		},
	},

	// ─────────────────────────────────────────────────────────────────
	// CRITTER / PASSIVE LOOT
	// ─────────────────────────────────────────────────────────────────
	critter_common: {
		id: "critter_common",
		guaranteedDrops: [],
		randomDrops: [{ catalogId: "AnimalHide", weight: 80, minQty: 1, maxQty: 1 }],
		dropCount: { min: 0, max: 1 },
		currencyDrops: {
			Gold: { min: 1, max: 3 },
		},
	},
};

/**
 * Get a loot table by ID
 */
export function getLootTable(id: string): NPCLootTable | undefined {
	return LOOT_TABLES[id];
}

/**
 * Roll drops from a loot table
 * Returns array of { catalogId, quantity } for items to drop
 */
export function rollLootTable(tableId: string): { catalogId: string; quantity: number }[] {
	const lootTable = LOOT_TABLES[tableId];
	if (!lootTable) return [];

	const drops: { catalogId: string; quantity: number }[] = [];

	// Add guaranteed drops
	for (const entry of lootTable.guaranteedDrops) {
		const qty = math.random(entry.minQty, entry.maxQty);
		drops.push({ catalogId: entry.catalogId, quantity: qty });
	}

	// Roll random drops
	const dropCount = math.random(lootTable.dropCount.min, lootTable.dropCount.max);
	if (dropCount > 0 && lootTable.randomDrops.size() > 0) {
		// Calculate total weight
		let totalWeight = 0;
		for (const entry of lootTable.randomDrops) {
			totalWeight += entry.weight;
		}

		// Roll for each drop
		for (let i = 0; i < dropCount; i++) {
			const roll = math.random() * totalWeight;
			let cumulative = 0;

			for (const entry of lootTable.randomDrops) {
				cumulative += entry.weight;
				if (roll <= cumulative) {
					const qty = math.random(entry.minQty, entry.maxQty);
					drops.push({ catalogId: entry.catalogId, quantity: qty });
					break;
				}
			}
		}
	}

	return drops;
}

/**
 * Roll currency drops from a loot table
 */
export function rollCurrencyDrops(tableId: string): { currency: string; amount: number }[] {
	const lootTable = LOOT_TABLES[tableId];
	if (!lootTable) return [];

	const currencies: { currency: string; amount: number }[] = [];

	if (lootTable.currencyDrops.Gold) {
		const amount = math.random(lootTable.currencyDrops.Gold.min, lootTable.currencyDrops.Gold.max);
		currencies.push({ currency: "Gold", amount });
	}

	if (lootTable.currencyDrops.Gems) {
		const amount = math.random(lootTable.currencyDrops.Gems.min, lootTable.currencyDrops.Gems.max);
		currencies.push({ currency: "Gems", amount });
	}

	return currencies;
}
