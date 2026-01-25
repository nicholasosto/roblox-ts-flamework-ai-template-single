import { OwnedItem } from "shared/interfaces";
import { Wallet, createDefaultWallet } from "shared/currencies";

/* ================================================================
   Player Profile Template
   ================================================================ */

export interface PlayerProfileTemplate {
	/** Player's currency wallet */
	wallet: Wallet;

	/** Player's inventory (items in backpack) */
	backpack: OwnedItem[];

	/** Profile version for migrations */
	version: number;
}

/* ================================================================
   DataStore Configuration
   ================================================================ */

export const PLAYER_PROFILE_DATASTORE_KEY = "Soul-Steel-Test-Profiles";

/** Current profile version - increment when schema changes */
export const PLAYER_PROFILE_VERSION = 1;

/* ================================================================
   Default Profile
   ================================================================ */

export const defaultPlayerProfileTemplate: PlayerProfileTemplate = {
	wallet: createDefaultWallet(),
	backpack: [],
	version: PLAYER_PROFILE_VERSION,
};

/* ================================================================
   Profile Migration (for future schema changes)
   ================================================================ */

/**
 * Migrates a profile from an older version to the current version.
 * Add migration logic here when PLAYER_PROFILE_VERSION increases.
 */
export function migrateProfile(profile: Partial<PlayerProfileTemplate>): PlayerProfileTemplate {
	const currentVersion = profile.version ?? 0;

	// Start with defaults, overlay saved data
	const migrated: PlayerProfileTemplate = {
		...defaultPlayerProfileTemplate,
		...profile,
	};

	// Version 0 -> 1: Added wallet
	if (currentVersion < 1) {
		if (!migrated.wallet) {
			migrated.wallet = createDefaultWallet();
		}
	}

	// Always update to current version
	migrated.version = PLAYER_PROFILE_VERSION;

	return migrated;
}
