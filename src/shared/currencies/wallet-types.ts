/**
 * Wallet Types
 *
 * Type definitions for player wallets, transactions, and currency operations.
 * This module defines the data structures used for currency management.
 *
 * @module currencies/wallet-types
 */

import { CurrencyKey, ALL_CURRENCY_KEYS } from "./currency-keys";
import { getCurrencyDefault, getCurrencyMax } from "./currency-config";

/* ================================================================
   Wallet Structure
   ================================================================ */

/**
 * Player's wallet containing all currency balances.
 * Uses a typed record to ensure all currencies are accounted for.
 */
export type Wallet = {
	readonly [K in CurrencyKey]: number;
};

/**
 * Mutable wallet for internal operations.
 * Use Wallet for external APIs to maintain immutability.
 */
export type MutableWallet = {
	-readonly [K in CurrencyKey]: number;
};

/* ================================================================
   Transaction Types
   ================================================================ */

/** Reason codes for currency transactions (for analytics/logging) */
export const TRANSACTION_REASONS = [
	// Earning
	"quest_reward",
	"combat_drop",
	"boss_drop",
	"achievement",
	"daily_login",
	"event_reward",
	"trade_received",
	"admin_grant",

	// Spending
	"item_purchase",
	"upgrade_cost",
	"crafting_cost",
	"repair_cost",
	"trade_sent",
	"admin_remove",

	// Premium
	"robux_purchase",
	"refund",

	// System
	"migration",
	"correction",
	"event_expiry",
] as const;

export type TransactionReason = (typeof TRANSACTION_REASONS)[number];

/** A single currency transaction record */
export interface CurrencyTransaction {
	/** Unique transaction ID */
	readonly transactionId: string;

	/** Player who owns this transaction */
	readonly playerId: number;

	/** Currency involved */
	readonly currencyKey: CurrencyKey;

	/** Amount changed (positive = credit, negative = debit) */
	readonly amount: number;

	/** Balance after transaction */
	readonly balanceAfter: number;

	/** Why this transaction occurred */
	readonly reason: TransactionReason;

	/** Optional metadata (e.g., item ID, quest ID) */
	readonly metadata?: Record<string, unknown>;

	/** Unix timestamp of transaction */
	readonly timestamp: number;
}

/** Request to modify currency balance */
export interface CurrencyModifyRequest {
	/** Currency to modify */
	readonly currencyKey: CurrencyKey;

	/** Amount to add (positive) or remove (negative) */
	readonly amount: number;

	/** Why this modification is happening */
	readonly reason: TransactionReason;

	/** Optional metadata for logging */
	readonly metadata?: Record<string, unknown>;
}

/** Result of a currency operation */
export interface CurrencyOperationResult {
	/** Whether the operation succeeded */
	readonly success: boolean;

	/** New balance after operation (if successful) */
	readonly newBalance?: number;

	/** Error code if operation failed */
	readonly errorCode?: CurrencyErrorCode;

	/** Human-readable error message */
	readonly errorMessage?: string;

	/** Transaction record (if successful) */
	readonly transaction?: CurrencyTransaction;
}

/** Error codes for currency operations */
export const CURRENCY_ERROR_CODES = [
	"INSUFFICIENT_FUNDS",
	"EXCEEDS_MAX_AMOUNT",
	"INVALID_AMOUNT",
	"INVALID_CURRENCY",
	"PREMIUM_CURRENCY_RESTRICTION",
	"EVENT_CURRENCY_EXPIRED",
	"TRADE_NOT_ALLOWED",
	"RATE_LIMITED",
	"INTERNAL_ERROR",
] as const;

export type CurrencyErrorCode = (typeof CURRENCY_ERROR_CODES)[number];

/* ================================================================
   Wallet Factory & Utilities
   ================================================================ */

/**
 * Creates a new wallet with default currency amounts.
 * Use this when initializing a new player's profile.
 */
export function createDefaultWallet(): Wallet {
	const wallet = {} as MutableWallet;

	for (const key of ALL_CURRENCY_KEYS) {
		wallet[key] = getCurrencyDefault(key);
	}

	return wallet as Wallet;
}

/**
 * Creates an empty wallet (all zeros).
 * Useful for testing or specific scenarios.
 */
export function createEmptyWallet(): Wallet {
	const wallet = {} as MutableWallet;

	for (const key of ALL_CURRENCY_KEYS) {
		wallet[key] = 0;
	}

	return wallet as Wallet;
}

/**
 * Clones a wallet (creates a new object with same values).
 */
export function cloneWallet(wallet: Wallet): Wallet {
	const clone = {} as MutableWallet;

	for (const key of ALL_CURRENCY_KEYS) {
		clone[key] = wallet[key];
	}

	return clone as Wallet;
}

/**
 * Gets the balance for a specific currency.
 */
export function getBalance(wallet: Wallet, currencyKey: CurrencyKey): number {
	return wallet[currencyKey];
}

/**
 * Checks if a wallet has at least the specified amount of a currency.
 */
export function hasAmount(wallet: Wallet, currencyKey: CurrencyKey, amount: number): boolean {
	return wallet[currencyKey] >= amount;
}

/**
 * Checks if adding an amount would exceed the max for a currency.
 */
export function wouldExceedMax(wallet: Wallet, currencyKey: CurrencyKey, amount: number): boolean {
	const maxAmount = getCurrencyMax(currencyKey);
	if (maxAmount === 0) return false; // 0 = unlimited
	return wallet[currencyKey] + amount > maxAmount;
}

/**
 * Calculates how much of a currency can be added before hitting max.
 */
export function getRemainingCapacity(wallet: Wallet, currencyKey: CurrencyKey): number {
	const maxAmount = getCurrencyMax(currencyKey);
	if (maxAmount === 0) return math.huge; // Unlimited
	return math.max(0, maxAmount - wallet[currencyKey]);
}

/**
 * Creates a new wallet with a modified balance.
 * Does NOT validate - use validation functions first.
 */
export function withModifiedBalance(
	wallet: Wallet,
	currencyKey: CurrencyKey,
	newBalance: number,
): Wallet {
	const clone = cloneWallet(wallet);
	(clone as MutableWallet)[currencyKey] = math.max(0, newBalance);
	return clone;
}

/**
 * Creates a new wallet with an adjusted balance (add/subtract).
 * Clamps to 0 and max automatically.
 */
export function withAdjustedBalance(
	wallet: Wallet,
	currencyKey: CurrencyKey,
	delta: number,
): Wallet {
	const currentBalance = wallet[currencyKey];
	const maxAmount = getCurrencyMax(currencyKey);
	let newBalance = currentBalance + delta;

	// Clamp to valid range
	newBalance = math.max(0, newBalance);
	if (maxAmount > 0) {
		newBalance = math.min(maxAmount, newBalance);
	}

	return withModifiedBalance(wallet, currencyKey, newBalance);
}

/**
 * Calculates total value of wallet in a base currency equivalent.
 * Useful for analytics and progression tracking.
 */
export function calculateWalletValue(wallet: Wallet, baseKey: CurrencyKey = "Gold"): number {
	// Simple implementation - just return the base currency amount
	// Can be extended with exchange rates if needed
	return wallet[baseKey];
}

/**
 * Validates wallet structure (ensures all keys exist and values are valid).
 * Returns repaired wallet if issues found.
 */
export function validateAndRepairWallet(wallet: Partial<Wallet>): Wallet {
	const repaired = {} as MutableWallet;

	for (const key of ALL_CURRENCY_KEYS) {
		const value = wallet[key];

		if (value === undefined || !typeIs(value, "number") || value !== value) {
			// Missing, wrong type, or NaN - use default
			repaired[key] = getCurrencyDefault(key);
		} else {
			// Clamp to valid range
			const maxAmount = getCurrencyMax(key);
			let clampedValue = math.max(0, math.floor(value));
			if (maxAmount > 0) {
				clampedValue = math.min(maxAmount, clampedValue);
			}
			repaired[key] = clampedValue;
		}
	}

	return repaired as Wallet;
}
