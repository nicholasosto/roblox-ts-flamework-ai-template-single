/**
 * NPC Type Definitions
 * Core interfaces for the NPC system
 */

import { RigKey } from "../roblox-templates/game-package";

/** AI behavior patterns */
export type NPCAIType = "passive" | "hostile" | "neutral" | "stationary";

/** NPC difficulty tiers affecting stat scaling */
export type NPCTier = "Minion" | "Normal" | "Elite" | "Boss";

/** Base stats that can be modified */
export interface NPCBaseStats {
	maxHealth: number;
	walkSpeed: number;
	damage: number; // Base damage multiplier
	defense: number; // Damage reduction
}

/** Combat configuration */
export interface NPCCombatConfig {
	abilities: string[]; // CatalogIds from ABILITY_CATALOG (WCS skill names)
	attackRange: number; // Range to use abilities
	aggroRange: number; // Range to detect players
	deaggroRange: number; // Range to lose interest
	attackCooldown: number; // Global cooldown between attacks
}

/** Loot drop configuration */
export interface NPCLootEntry {
	catalogId: string; // Item CatalogId
	weight: number; // Drop weight (higher = more likely)
	minQty: number;
	maxQty: number;
}

/** Loot table definition */
export interface NPCLootTable {
	id: string;
	guaranteedDrops: NPCLootEntry[]; // Always drop these
	randomDrops: NPCLootEntry[]; // Roll from these
	dropCount: { min: number; max: number }; // How many random drops
	currencyDrops: {
		Gold?: { min: number; max: number };
		Gems?: { min: number; max: number };
	};
}

/** Complete NPC Definition */
export interface NPCDefinition {
	// Identity
	id: string; // Unique identifier: "void_wendigo_elite"
	displayName: string; // "Void Wendigo"
	rigKey: RigKey; // Which rig template to use

	// Classification
	tier: NPCTier;
	aiType: NPCAIType;
	level: number;

	// Stats
	baseStats: NPCBaseStats;

	// Combat
	combat: NPCCombatConfig;

	// Rewards
	lootTableId?: string; // Reference to loot table
	experienceReward: number;

	// Behavior
	respawnTime: number; // Seconds (0 = no respawn)
	leashRange: number; // Max distance from spawn before reset
}

/** Runtime NPC instance data (stored on spawned NPCs) */
export interface NPCInstanceData {
	definitionId: string;
	spawnPosition: Vector3;
	uuid: string;
	currentHealth: number;
	isInCombat: boolean;
	currentTarget?: Player;
}

/** NPC AI States */
export type NPCAIState = "idle" | "patrol" | "chase" | "attack" | "return" | "dead";

/** NPC Component Attributes (for Flamework components) */
export interface NPCAttributes {
	npcDefinitionId: string;
	npcUUID: string;
	spawnX: number;
	spawnY: number;
	spawnZ: number;
}
