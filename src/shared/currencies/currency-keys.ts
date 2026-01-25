/**
 * Currency Keys
 *
 * Type-safe currency key definitions for the game economy.
 * All currency types must be defined here to ensure type safety across the codebase.
 *
 * @module currencies/currency-keys
 */

/* ================================================================
   Soft Currencies (Earned through gameplay)
   ================================================================ */
export const SOFT_CURRENCY_KEYS = [
	"Gold", // Primary soft currency - general purchases
	"SoulShards", // Secondary soft currency - soul gem crafting/upgrades
] as const;

export type SoftCurrencyKey = (typeof SOFT_CURRENCY_KEYS)[number];

/* ================================================================
   Premium Currencies (Purchased with Robux)
   ================================================================ */
export const PREMIUM_CURRENCY_KEYS = [
	"Gems", // Primary premium currency
	"EternalTokens", // Limited/seasonal premium currency
] as const;

export type PremiumCurrencyKey = (typeof PREMIUM_CURRENCY_KEYS)[number];

/* ================================================================
   Event Currencies (Time-limited, earned during events)
   ================================================================ */
export const EVENT_CURRENCY_KEYS = ["HalloweenCandy", "WinterSnowflakes", "SpringPetals"] as const;

export type EventCurrencyKey = (typeof EVENT_CURRENCY_KEYS)[number];

/* ================================================================
   Union Types
   ================================================================ */

/** All currency keys that can be earned (non-premium) */
export const EARNABLE_CURRENCY_KEYS = [...SOFT_CURRENCY_KEYS, ...EVENT_CURRENCY_KEYS] as const;
export type EarnableCurrencyKey = SoftCurrencyKey | EventCurrencyKey;

/** All currency keys in the game */
export const ALL_CURRENCY_KEYS = [
	...SOFT_CURRENCY_KEYS,
	...PREMIUM_CURRENCY_KEYS,
	...EVENT_CURRENCY_KEYS,
] as const;

export type CurrencyKey = (typeof ALL_CURRENCY_KEYS)[number];

/* ================================================================
   Type Guards
   ================================================================ */

/** Check if a string is a valid CurrencyKey */
export function isCurrencyKey(value: string): value is CurrencyKey {
	return (ALL_CURRENCY_KEYS as readonly string[]).includes(value);
}

/** Check if a currency is premium (purchased with Robux) */
export function isPremiumCurrency(key: CurrencyKey): key is PremiumCurrencyKey {
	return (PREMIUM_CURRENCY_KEYS as readonly string[]).includes(key);
}

/** Check if a currency is soft (earned through gameplay) */
export function isSoftCurrency(key: CurrencyKey): key is SoftCurrencyKey {
	return (SOFT_CURRENCY_KEYS as readonly string[]).includes(key);
}

/** Check if a currency is event-based (time-limited) */
export function isEventCurrency(key: CurrencyKey): key is EventCurrencyKey {
	return (EVENT_CURRENCY_KEYS as readonly string[]).includes(key);
}

/** Check if a currency can be earned (non-premium) */
export function isEarnableCurrency(key: CurrencyKey): key is EarnableCurrencyKey {
	return isSoftCurrency(key) || isEventCurrency(key);
}
