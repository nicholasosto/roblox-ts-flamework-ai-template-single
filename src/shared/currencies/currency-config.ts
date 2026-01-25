/**
 * Currency Configuration
 *
 * Static configuration for all currencies including display properties,
 * limits, and behavior flags. This is the single source of truth for
 * currency metadata.
 *
 * @module currencies/currency-config
 */

import {
	CurrencyKey,
	ALL_CURRENCY_KEYS,
	SOFT_CURRENCY_KEYS,
	PREMIUM_CURRENCY_KEYS,
	EVENT_CURRENCY_KEYS,
} from "./currency-keys";

/* ================================================================
   Currency Configuration Interface
   ================================================================ */

export interface CurrencyConfig {
	/** Unique identifier (matches CurrencyKey) */
	readonly key: CurrencyKey;

	/** Human-readable display name */
	readonly displayName: string;

	/** Short abbreviation for compact UI (e.g., "G" for Gold) */
	readonly abbreviation: string;

	/** Roblox asset ID for the currency icon */
	readonly iconId: string;

	/** Color for UI display (hex or Color3-compatible) */
	readonly color: {
		readonly r: number;
		readonly g: number;
		readonly b: number;
	};

	/** Maximum amount a player can hold (0 = unlimited) */
	readonly maxAmount: number;

	/** Default starting amount for new players */
	readonly defaultAmount: number;

	/** Can this currency be traded between players? */
	readonly isTradeable: boolean;

	/** Is this a premium currency (purchased with Robux)? */
	readonly isPremium: boolean;

	/** Is this an event currency (time-limited)? */
	readonly isEventCurrency: boolean;

	/** Should this currency persist after events end? */
	readonly persistsAfterEvent: boolean;

	/** Sort order for UI display (lower = first) */
	readonly displayOrder: number;

	/** Description shown in currency tooltips */
	readonly description: string;
}

/* ================================================================
   Currency Configuration Registry
   ================================================================ */

export const CURRENCY_CONFIG: Readonly<Record<CurrencyKey, CurrencyConfig>> = {
	// ─────────────────────────────────────────────────────────────────
	// SOFT CURRENCIES
	// ─────────────────────────────────────────────────────────────────
	Gold: {
		key: "Gold",
		displayName: "Gold",
		abbreviation: "G",
		iconId: "rbxassetid://0", // TODO: Replace with actual asset ID
		color: { r: 255, g: 215, b: 0 },
		maxAmount: 999_999_999, // ~1 billion cap
		defaultAmount: 100,
		isTradeable: true,
		isPremium: false,
		isEventCurrency: false,
		persistsAfterEvent: true,
		displayOrder: 1,
		description:
			"The standard currency of the realm. Earned through combat, quests, and trade.",
	},

	SoulShards: {
		key: "SoulShards",
		displayName: "Soul Shards",
		abbreviation: "SS",
		iconId: "rbxassetid://0", // TODO: Replace with actual asset ID
		color: { r: 148, g: 0, b: 211 },
		maxAmount: 99_999,
		defaultAmount: 0,
		isTradeable: false,
		isPremium: false,
		isEventCurrency: false,
		persistsAfterEvent: true,
		displayOrder: 2,
		description:
			"Mystical fragments used to craft and enhance Soul Gems. Obtained from defeating powerful enemies.",
	},

	// ─────────────────────────────────────────────────────────────────
	// PREMIUM CURRENCIES
	// ─────────────────────────────────────────────────────────────────
	Gems: {
		key: "Gems",
		displayName: "Gems",
		abbreviation: "💎",
		iconId: "rbxassetid://0", // TODO: Replace with actual asset ID
		color: { r: 0, g: 191, b: 255 },
		maxAmount: 999_999,
		defaultAmount: 0,
		isTradeable: false,
		isPremium: true,
		isEventCurrency: false,
		persistsAfterEvent: true,
		displayOrder: 10,
		description: "Premium currency. Purchase exclusive items and speed up progression.",
	},

	EternalTokens: {
		key: "EternalTokens",
		displayName: "Eternal Tokens",
		abbreviation: "ET",
		iconId: "rbxassetid://0", // TODO: Replace with actual asset ID
		color: { r: 255, g: 140, b: 0 },
		maxAmount: 9_999,
		defaultAmount: 0,
		isTradeable: false,
		isPremium: true,
		isEventCurrency: false,
		persistsAfterEvent: true,
		displayOrder: 11,
		description: "Rare premium tokens for exclusive legendary items and limited-time offers.",
	},

	// ─────────────────────────────────────────────────────────────────
	// EVENT CURRENCIES
	// ─────────────────────────────────────────────────────────────────
	HalloweenCandy: {
		key: "HalloweenCandy",
		displayName: "Halloween Candy",
		abbreviation: "🎃",
		iconId: "rbxassetid://0", // TODO: Replace with actual asset ID
		color: { r: 255, g: 140, b: 0 },
		maxAmount: 99_999,
		defaultAmount: 0,
		isTradeable: false,
		isPremium: false,
		isEventCurrency: true,
		persistsAfterEvent: false,
		displayOrder: 100,
		description:
			"Spooky treats collected during the Halloween event. Spend before the event ends!",
	},

	WinterSnowflakes: {
		key: "WinterSnowflakes",
		displayName: "Winter Snowflakes",
		abbreviation: "❄️",
		iconId: "rbxassetid://0", // TODO: Replace with actual asset ID
		color: { r: 135, g: 206, b: 250 },
		maxAmount: 99_999,
		defaultAmount: 0,
		isTradeable: false,
		isPremium: false,
		isEventCurrency: true,
		persistsAfterEvent: false,
		displayOrder: 101,
		description: "Frosty flakes collected during the Winter event. Melt away after the season!",
	},

	SpringPetals: {
		key: "SpringPetals",
		displayName: "Spring Petals",
		abbreviation: "🌸",
		iconId: "rbxassetid://0", // TODO: Replace with actual asset ID
		color: { r: 255, g: 182, b: 193 },
		maxAmount: 99_999,
		defaultAmount: 0,
		isTradeable: false,
		isPremium: false,
		isEventCurrency: true,
		persistsAfterEvent: false,
		displayOrder: 102,
		description:
			"Delicate petals collected during the Spring event. Wilt away after the season!",
	},
};

/* ================================================================
   Helper Functions
   ================================================================ */

/** Get configuration for a specific currency */
export function getCurrencyConfig(key: CurrencyKey): CurrencyConfig {
	return CURRENCY_CONFIG[key];
}

/** Get display name for a currency */
export function getCurrencyDisplayName(key: CurrencyKey): string {
	return CURRENCY_CONFIG[key].displayName;
}

/** Get icon asset ID for a currency */
export function getCurrencyIcon(key: CurrencyKey): string {
	return CURRENCY_CONFIG[key].iconId;
}

/** Get Color3 for a currency (Roblox-compatible) */
export function getCurrencyColor3(key: CurrencyKey): Color3 {
	const { r, g, b } = CURRENCY_CONFIG[key].color;
	return Color3.fromRGB(r, g, b);
}

/** Get maximum amount for a currency */
export function getCurrencyMax(key: CurrencyKey): number {
	return CURRENCY_CONFIG[key].maxAmount;
}

/** Get default starting amount for a currency */
export function getCurrencyDefault(key: CurrencyKey): number {
	return CURRENCY_CONFIG[key].defaultAmount;
}

/** Get all currencies sorted by display order */
export function getSortedCurrencies(): readonly CurrencyConfig[] {
	const configs = ALL_CURRENCY_KEYS.map((key) => CURRENCY_CONFIG[key]);
	return configs.sort((a, b) => a.displayOrder < b.displayOrder);
}

/** Get all soft currencies */
export function getSoftCurrencies(): readonly CurrencyConfig[] {
	return SOFT_CURRENCY_KEYS.map((key) => CURRENCY_CONFIG[key]);
}

/** Get all premium currencies */
export function getPremiumCurrencies(): readonly CurrencyConfig[] {
	return PREMIUM_CURRENCY_KEYS.map((key) => CURRENCY_CONFIG[key]);
}

/** Get all event currencies */
export function getEventCurrencies(): readonly CurrencyConfig[] {
	return EVENT_CURRENCY_KEYS.map((key) => CURRENCY_CONFIG[key]);
}

/** Format currency amount with abbreviations (e.g., 1.5M, 2.3K) */
export function formatCurrencyAmount(amount: number, abbreviated = true): string {
	if (!abbreviated || amount < 1000) {
		return tostring(math.floor(amount));
	}

	if (amount >= 1_000_000_000) {
		return string.format("%.1fB", amount / 1_000_000_000);
	}
	if (amount >= 1_000_000) {
		return string.format("%.1fM", amount / 1_000_000);
	}
	if (amount >= 1_000) {
		return string.format("%.1fK", amount / 1_000);
	}

	return tostring(math.floor(amount));
}

/** Format currency with icon abbreviation (e.g., "1.5K G") */
export function formatCurrencyWithAbbr(key: CurrencyKey, amount: number): string {
	const config = CURRENCY_CONFIG[key];
	return `${formatCurrencyAmount(amount)} ${config.abbreviation}`;
}
