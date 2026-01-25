/**
 * Currency Validation
 *
 * Validation utilities for currency operations including purchases, sales,
 * trades, and general transactions. All validation is pure (no side effects).
 *
 * @module currencies/currency-validation
 */

import {
	CurrencyKey,
	ALL_CURRENCY_KEYS,
	isCurrencyKey,
	isPremiumCurrency,
	isEventCurrency,
} from "./currency-keys";
import { getCurrencyConfig, getCurrencyMax } from "./currency-config";
import {
	Wallet,
	CurrencyErrorCode,
	CurrencyModifyRequest,
	hasAmount,
	wouldExceedMax,
	getBalance,
} from "./wallet-types";
import { CatalogEntry } from "../interfaces";

/* ================================================================
   Validation Result Types
   ================================================================ */

export interface ValidationResult {
	readonly isValid: boolean;
	readonly errorCode?: CurrencyErrorCode;
	readonly errorMessage?: string;
}

export interface PurchaseValidationResult extends ValidationResult {
	/** The total cost that would be deducted */
	readonly totalCost?: number;
	/** Balance after purchase (if valid) */
	readonly balanceAfter?: number;
}

export interface SaleValidationResult extends ValidationResult {
	/** The total value that would be received */
	readonly totalValue?: number;
	/** Balance after sale (if valid) */
	readonly balanceAfter?: number;
}

export interface TradeValidationResult extends ValidationResult {
	/** Currencies that can be traded */
	readonly tradeableCurrencies?: CurrencyKey[];
	/** Currencies blocked from trading */
	readonly blockedCurrencies?: CurrencyKey[];
}

/* ================================================================
   Core Validation Functions
   ================================================================ */

/**
 * Validates a currency key string.
 */
export function validateCurrencyKey(key: string): ValidationResult {
	if (!isCurrencyKey(key)) {
		return {
			isValid: false,
			errorCode: "INVALID_CURRENCY",
			errorMessage: `Invalid currency key: ${key}`,
		};
	}
	return { isValid: true };
}

/**
 * Validates an amount for currency operations.
 */
export function validateAmount(amount: number): ValidationResult {
	if (!typeIs(amount, "number") || amount !== amount) {
		return {
			isValid: false,
			errorCode: "INVALID_AMOUNT",
			errorMessage: "Amount must be a valid number",
		};
	}

	if (amount < 0) {
		return {
			isValid: false,
			errorCode: "INVALID_AMOUNT",
			errorMessage: "Amount cannot be negative",
		};
	}

	if (amount !== math.floor(amount)) {
		return {
			isValid: false,
			errorCode: "INVALID_AMOUNT",
			errorMessage: "Amount must be a whole number",
		};
	}

	return { isValid: true };
}

/**
 * Validates that a wallet has sufficient funds for a debit.
 */
export function validateSufficientFunds(
	wallet: Wallet,
	currencyKey: CurrencyKey,
	amount: number,
): ValidationResult {
	if (!hasAmount(wallet, currencyKey, amount)) {
		const config = getCurrencyConfig(currencyKey);
		const currentBalance = getBalance(wallet, currencyKey);
		return {
			isValid: false,
			errorCode: "INSUFFICIENT_FUNDS",
			errorMessage: `Insufficient ${config.displayName}. Have: ${currentBalance}, Need: ${amount}`,
		};
	}
	return { isValid: true };
}

/**
 * Validates that a credit won't exceed the currency's maximum.
 */
export function validateNotExceedingMax(
	wallet: Wallet,
	currencyKey: CurrencyKey,
	amount: number,
): ValidationResult {
	if (wouldExceedMax(wallet, currencyKey, amount)) {
		const config = getCurrencyConfig(currencyKey);
		const maxAmount = getCurrencyMax(currencyKey);
		return {
			isValid: false,
			errorCode: "EXCEEDS_MAX_AMOUNT",
			errorMessage: `Would exceed maximum ${config.displayName} (${maxAmount})`,
		};
	}
	return { isValid: true };
}

/* ================================================================
   Purchase Validation
   ================================================================ */

/**
 * Validates a purchase from the catalog.
 */
export function validatePurchase(
	wallet: Wallet,
	catalogEntry: CatalogEntry,
	quantity: number = 1,
): PurchaseValidationResult {
	// Validate quantity
	const quantityValidation = validateAmount(quantity);
	if (!quantityValidation.isValid) {
		return quantityValidation;
	}

	// Validate currency key
	const currencyValidation = validateCurrencyKey(catalogEntry.CurrencyKey);
	if (!currencyValidation.isValid) {
		return currencyValidation;
	}

	const currencyKey = catalogEntry.CurrencyKey as CurrencyKey;
	const totalCost = catalogEntry.PurchasePrice * quantity;

	// Validate sufficient funds
	const fundsValidation = validateSufficientFunds(wallet, currencyKey, totalCost);
	if (!fundsValidation.isValid) {
		return fundsValidation;
	}

	const currentBalance = getBalance(wallet, currencyKey);
	return {
		isValid: true,
		totalCost,
		balanceAfter: currentBalance - totalCost,
	};
}

/**
 * Validates multiple purchases at once (cart validation).
 */
export function validateCartPurchase(
	wallet: Wallet,
	items: Array<{ catalogEntry: CatalogEntry; quantity: number }>,
): PurchaseValidationResult {
	// Group items by currency
	const costsByCurrency = new Map<CurrencyKey, number>();

	for (const { catalogEntry, quantity } of items) {
		// Validate each item's currency
		const currencyValidation = validateCurrencyKey(catalogEntry.CurrencyKey);
		if (!currencyValidation.isValid) {
			return currencyValidation;
		}

		const currencyKey = catalogEntry.CurrencyKey as CurrencyKey;
		const itemCost = catalogEntry.PurchasePrice * quantity;
		const currentCost = costsByCurrency.get(currencyKey) ?? 0;
		costsByCurrency.set(currencyKey, currentCost + itemCost);
	}

	// Validate sufficient funds for each currency
	for (const [currencyKey, totalCost] of costsByCurrency) {
		const fundsValidation = validateSufficientFunds(wallet, currencyKey, totalCost);
		if (!fundsValidation.isValid) {
			return fundsValidation;
		}
	}

	return { isValid: true };
}

/* ================================================================
   Sale Validation
   ================================================================ */

/**
 * Validates selling an item.
 */
export function validateSale(
	wallet: Wallet,
	catalogEntry: CatalogEntry,
	quantity: number = 1,
): SaleValidationResult {
	// Validate quantity
	const quantityValidation = validateAmount(quantity);
	if (!quantityValidation.isValid) {
		return quantityValidation;
	}

	// Validate currency key
	const currencyValidation = validateCurrencyKey(catalogEntry.CurrencyKey);
	if (!currencyValidation.isValid) {
		return currencyValidation;
	}

	const currencyKey = catalogEntry.CurrencyKey as CurrencyKey;
	const totalValue = catalogEntry.SellPrice * quantity;

	// Validate won't exceed max
	const maxValidation = validateNotExceedingMax(wallet, currencyKey, totalValue);
	if (!maxValidation.isValid) {
		return maxValidation;
	}

	const currentBalance = getBalance(wallet, currencyKey);
	return {
		isValid: true,
		totalValue,
		balanceAfter: currentBalance + totalValue,
	};
}

/* ================================================================
   Trade Validation
   ================================================================ */

/**
 * Validates a currency trade between players.
 */
export function validateTrade(
	senderWallet: Wallet,
	currencyKey: CurrencyKey,
	amount: number,
): TradeValidationResult {
	// Validate amount
	const amountValidation = validateAmount(amount);
	if (!amountValidation.isValid) {
		return amountValidation;
	}

	// Check if currency is tradeable
	const config = getCurrencyConfig(currencyKey);
	if (!config.isTradeable) {
		return {
			isValid: false,
			errorCode: "TRADE_NOT_ALLOWED",
			errorMessage: `${config.displayName} cannot be traded`,
		};
	}

	// Premium currencies cannot be traded
	if (isPremiumCurrency(currencyKey)) {
		return {
			isValid: false,
			errorCode: "PREMIUM_CURRENCY_RESTRICTION",
			errorMessage: "Premium currencies cannot be traded",
		};
	}

	// Validate sufficient funds
	return validateSufficientFunds(senderWallet, currencyKey, amount);
}

/**
 * Gets all tradeable currencies and their tradeability status.
 */
export function getTradeableCurrencies(): TradeValidationResult {
	const tradeable: CurrencyKey[] = [];
	const blocked: CurrencyKey[] = [];

	for (const currencyKey of ALL_CURRENCY_KEYS) {
		const config = getCurrencyConfig(currencyKey);
		if (config.isTradeable && !isPremiumCurrency(currencyKey)) {
			tradeable.push(currencyKey);
		} else {
			blocked.push(currencyKey);
		}
	}

	return {
		isValid: true,
		tradeableCurrencies: tradeable,
		blockedCurrencies: blocked,
	};
}

/* ================================================================
   Transaction Validation
   ================================================================ */

/**
 * Validates a generic currency modification request.
 */
export function validateModifyRequest(
	wallet: Wallet,
	request: CurrencyModifyRequest,
): ValidationResult {
	const { currencyKey, amount } = request;

	// Validate amount (allow negative for debits)
	if (!typeIs(amount, "number") || amount !== amount) {
		return {
			isValid: false,
			errorCode: "INVALID_AMOUNT",
			errorMessage: "Amount must be a valid number",
		};
	}

	if (amount === 0) {
		return {
			isValid: false,
			errorCode: "INVALID_AMOUNT",
			errorMessage: "Amount cannot be zero",
		};
	}

	// Debit (negative amount)
	if (amount < 0) {
		return validateSufficientFunds(wallet, currencyKey, math.abs(amount));
	}

	// Credit (positive amount)
	return validateNotExceedingMax(wallet, currencyKey, amount);
}

/**
 * Validates that premium currency can only be modified through authorized means.
 */
export function validatePremiumModification(
	currencyKey: CurrencyKey,
	reason: string,
): ValidationResult {
	if (!isPremiumCurrency(currencyKey)) {
		return { isValid: true };
	}

	// Only allow specific reasons for premium currency modifications
	const allowedReasons = [
		"robux_purchase",
		"refund",
		"admin_grant",
		"admin_remove",
		"migration",
		"correction",
	];

	if (!allowedReasons.includes(reason)) {
		return {
			isValid: false,
			errorCode: "PREMIUM_CURRENCY_RESTRICTION",
			errorMessage: "Premium currency can only be modified through authorized transactions",
		};
	}

	return { isValid: true };
}

/* ================================================================
   Event Currency Validation
   ================================================================ */

/**
 * Validates event currency operations (checks if event is active).
 * Note: This is a placeholder - actual event status would come from a service.
 */
export function validateEventCurrencyActive(
	currencyKey: CurrencyKey,
	_isEventActive: boolean = true, // Would be passed from event service
): ValidationResult {
	if (!isEventCurrency(currencyKey)) {
		return { isValid: true };
	}

	if (!_isEventActive) {
		const config = getCurrencyConfig(currencyKey);
		return {
			isValid: false,
			errorCode: "EVENT_CURRENCY_EXPIRED",
			errorMessage: `${config.displayName} event has ended`,
		};
	}

	return { isValid: true };
}

/* ================================================================
   Composite Validators
   ================================================================ */

/**
 * Performs full validation for earning currency (e.g., quest rewards).
 */
export function validateEarnCurrency(
	wallet: Wallet,
	currencyKey: CurrencyKey,
	amount: number,
): ValidationResult {
	// Amount validation
	const amountValidation = validateAmount(amount);
	if (!amountValidation.isValid) return amountValidation;

	// Can't earn premium currency through gameplay
	if (isPremiumCurrency(currencyKey)) {
		return {
			isValid: false,
			errorCode: "PREMIUM_CURRENCY_RESTRICTION",
			errorMessage: "Premium currency cannot be earned through gameplay",
		};
	}

	// Max validation
	return validateNotExceedingMax(wallet, currencyKey, amount);
}

/**
 * Performs full validation for spending currency.
 */
export function validateSpendCurrency(
	wallet: Wallet,
	currencyKey: CurrencyKey,
	amount: number,
): ValidationResult {
	// Amount validation
	const amountValidation = validateAmount(amount);
	if (!amountValidation.isValid) return amountValidation;

	// Sufficient funds validation
	return validateSufficientFunds(wallet, currencyKey, amount);
}
