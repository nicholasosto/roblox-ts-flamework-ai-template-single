/**
 * NPC Catalog
 * Static definitions for all NPCs in the game
 */

import { NPCDefinition } from "./npc-types";

/**
 * Master NPC Catalog
 * All NPC types are defined here with their stats, abilities, and behavior
 */
export const NPC_CATALOG: Record<string, NPCDefinition> = {
	// ─────────────────────────────────────────────────────────────────
	// TRAINING / TEST
	// ─────────────────────────────────────────────────────────────────
	training_dummy: {
		id: "training_dummy",
		displayName: "Training Dummy",
		rigKey: "Robot_Worker",
		tier: "Normal",
		aiType: "stationary",
		level: 1,
		baseStats: {
			maxHealth: 9999,
			walkSpeed: 0,
			damage: 0,
			defense: 0,
		},
		combat: {
			abilities: [],
			attackRange: 0,
			aggroRange: 0,
			deaggroRange: 0,
			attackCooldown: 999,
		},
		experienceReward: 0,
		respawnTime: 5,
		leashRange: 0,
	},

	// ─────────────────────────────────────────────────────────────────
	// VOID FACTION
	// ─────────────────────────────────────────────────────────────────
	void_wendigo: {
		id: "void_wendigo",
		displayName: "Void Wendigo",
		rigKey: "Void_Wendigo",
		tier: "Normal",
		aiType: "hostile",
		level: 10,
		baseStats: {
			maxHealth: 150,
			walkSpeed: 18,
			damage: 1.0,
			defense: 5,
		},
		combat: {
			abilities: ["MeleeAttack"],
			attackRange: 5,
			aggroRange: 30,
			deaggroRange: 50,
			attackCooldown: 1.5,
		},
		lootTableId: "void_common",
		experienceReward: 25,
		respawnTime: 30,
		leashRange: 60,
	},

	void_master: {
		id: "void_master",
		displayName: "Void Master",
		rigKey: "Void_Master",
		tier: "Elite",
		aiType: "hostile",
		level: 20,
		baseStats: {
			maxHealth: 500,
			walkSpeed: 16,
			damage: 1.5,
			defense: 15,
		},
		combat: {
			abilities: ["MeleeAttack", "Fireball"],
			attackRange: 15,
			aggroRange: 40,
			deaggroRange: 60,
			attackCooldown: 1.0,
		},
		lootTableId: "void_elite",
		experienceReward: 100,
		respawnTime: 120,
		leashRange: 80,
	},

	// ─────────────────────────────────────────────────────────────────
	// ROBOT FACTION
	// ─────────────────────────────────────────────────────────────────
	robot_worker: {
		id: "robot_worker",
		displayName: "Malfunctioning Worker",
		rigKey: "Robot_Worker",
		tier: "Minion",
		aiType: "neutral",
		level: 5,
		baseStats: {
			maxHealth: 50,
			walkSpeed: 12,
			damage: 0.5,
			defense: 10,
		},
		combat: {
			abilities: ["MeleeAttack"],
			attackRange: 4,
			aggroRange: 15,
			deaggroRange: 25,
			attackCooldown: 2.0,
		},
		lootTableId: "robot_scrap",
		experienceReward: 10,
		respawnTime: 20,
		leashRange: 40,
	},

	robot_steambot: {
		id: "robot_steambot",
		displayName: "Steambot Guardian",
		rigKey: "Robot_Steambot",
		tier: "Normal",
		aiType: "hostile",
		level: 12,
		baseStats: {
			maxHealth: 200,
			walkSpeed: 14,
			damage: 1.2,
			defense: 20,
		},
		combat: {
			abilities: ["MeleeAttack"],
			attackRange: 6,
			aggroRange: 25,
			deaggroRange: 40,
			attackCooldown: 1.8,
		},
		lootTableId: "robot_common",
		experienceReward: 35,
		respawnTime: 45,
		leashRange: 50,
	},

	robot_evil_hal: {
		id: "robot_evil_hal",
		displayName: "HAL-9000X",
		rigKey: "Robot_Evil_Hal",
		tier: "Boss",
		aiType: "hostile",
		level: 30,
		baseStats: {
			maxHealth: 2000,
			walkSpeed: 10,
			damage: 2.0,
			defense: 30,
		},
		combat: {
			abilities: ["MeleeAttack", "Fireball", "LakeOfDecay"],
			attackRange: 20,
			aggroRange: 50,
			deaggroRange: 80,
			attackCooldown: 0.8,
		},
		lootTableId: "robot_boss",
		experienceReward: 500,
		respawnTime: 300,
		leashRange: 100,
	},

	// ─────────────────────────────────────────────────────────────────
	// DECAY FACTION
	// ─────────────────────────────────────────────────────────────────
	decay_zombie: {
		id: "decay_zombie",
		displayName: "Shambling Corpse",
		rigKey: "Decay_Zombie",
		tier: "Minion",
		aiType: "hostile",
		level: 3,
		baseStats: {
			maxHealth: 40,
			walkSpeed: 8,
			damage: 0.8,
			defense: 0,
		},
		combat: {
			abilities: ["MeleeAttack"],
			attackRange: 4,
			aggroRange: 20,
			deaggroRange: 35,
			attackCooldown: 2.5,
		},
		lootTableId: "decay_common",
		experienceReward: 8,
		respawnTime: 15,
		leashRange: 30,
	},

	decay_zombie_hipster: {
		id: "decay_zombie_hipster",
		displayName: "Hipster Zombie",
		rigKey: "Decay_Zombie_Hipster",
		tier: "Normal",
		aiType: "hostile",
		level: 8,
		baseStats: {
			maxHealth: 80,
			walkSpeed: 10,
			damage: 1.0,
			defense: 5,
		},
		combat: {
			abilities: ["MeleeAttack"],
			attackRange: 4,
			aggroRange: 25,
			deaggroRange: 40,
			attackCooldown: 2.0,
		},
		lootTableId: "decay_common",
		experienceReward: 20,
		respawnTime: 25,
		leashRange: 40,
	},

	// ─────────────────────────────────────────────────────────────────
	// SPIRIT FACTION
	// ─────────────────────────────────────────────────────────────────
	spirit_elemental: {
		id: "spirit_elemental",
		displayName: "Spirit Elemental",
		rigKey: "Spirit_Elemental",
		tier: "Normal",
		aiType: "neutral",
		level: 15,
		baseStats: {
			maxHealth: 120,
			walkSpeed: 20,
			damage: 1.0,
			defense: 10,
		},
		combat: {
			abilities: ["Fireball"],
			attackRange: 25,
			aggroRange: 20,
			deaggroRange: 35,
			attackCooldown: 2.0,
		},
		lootTableId: "spirit_common",
		experienceReward: 40,
		respawnTime: 40,
		leashRange: 50,
	},

	spirit_dragon_boy: {
		id: "spirit_dragon_boy",
		displayName: "Dragon Spirit",
		rigKey: "Spirit_Dragon_Boy",
		tier: "Elite",
		aiType: "hostile",
		level: 25,
		baseStats: {
			maxHealth: 400,
			walkSpeed: 22,
			damage: 1.8,
			defense: 20,
		},
		combat: {
			abilities: ["MeleeAttack", "Fireball"],
			attackRange: 20,
			aggroRange: 35,
			deaggroRange: 55,
			attackCooldown: 1.2,
		},
		lootTableId: "spirit_elite",
		experienceReward: 150,
		respawnTime: 90,
		leashRange: 70,
	},

	// ─────────────────────────────────────────────────────────────────
	// SPECIAL / FRIENDLY
	// ─────────────────────────────────────────────────────────────────
	blood_toad: {
		id: "blood_toad",
		displayName: "Blood Toad",
		rigKey: "Blood_Toad",
		tier: "Normal",
		aiType: "passive",
		level: 5,
		baseStats: {
			maxHealth: 30,
			walkSpeed: 6,
			damage: 0,
			defense: 0,
		},
		combat: {
			abilities: [],
			attackRange: 0,
			aggroRange: 0,
			deaggroRange: 0,
			attackCooldown: 999,
		},
		lootTableId: "critter_common",
		experienceReward: 5,
		respawnTime: 60,
		leashRange: 20,
	},
};

/**
 * Get an NPC definition by ID
 */
export function getNPCDefinition(id: string): NPCDefinition | undefined {
	return NPC_CATALOG[id];
}

/**
 * Get all NPC definitions of a specific tier
 */
export function getNPCsByTier(tier: NPCDefinition["tier"]): NPCDefinition[] {
	const results: NPCDefinition[] = [];
	for (const [, def] of pairs(NPC_CATALOG)) {
		if (def.tier === tier) {
			results.push(def);
		}
	}
	return results;
}

/**
 * Get all NPC definitions that use a specific rig
 */
export function getNPCsByRig(rigKey: NPCDefinition["rigKey"]): NPCDefinition[] {
	const results: NPCDefinition[] = [];
	for (const [, def] of pairs(NPC_CATALOG)) {
		if (def.rigKey === rigKey) {
			results.push(def);
		}
	}
	return results;
}
