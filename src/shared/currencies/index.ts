/**
 * Currencies Module
 *
 * Centralized currency system for the game economy.
 *
 * @example
 * // Import what you need
 * import { CurrencyKey, Wallet, validatePurchase, getCurrencyConfig } from "shared/currencies";
 *
 * // Check if player can afford an item
 * const result = validatePurchase(player.wallet, catalogEntry, 1);
 * if (result.isValid) {
 *   // Process purchase
 * }
 *
 * @module currencies
 */

// ─────────────────────────────────────────────────────────────────
// Currency Keys & Type Guards
// ─────────────────────────────────────────────────────────────────
export {
	// Key constants
	SOFT_CURRENCY_KEYS,
	PREMIUM_CURRENCY_KEYS,
	EVENT_CURRENCY_KEYS,
	EARNABLE_CURRENCY_KEYS,
	ALL_CURRENCY_KEYS,

	// Types
	type SoftCurrencyKey,
	type PremiumCurrencyKey,
	type EventCurrencyKey,
	type EarnableCurrencyKey,
	type CurrencyKey,

	// Type guards
	isCurrencyKey,
	isPremiumCurrency,
	isSoftCurrency,
	isEventCurrency,
	isEarnableCurrency,
} from "./currency-keys";

// ─────────────────────────────────────────────────────────────────
// Currency Configuration
// ─────────────────────────────────────────────────────────────────
export {
	// Types
	type CurrencyConfig,

	// Registry
	CURRENCY_CONFIG,

	// Getters
	getCurrencyConfig,
	getCurrencyDisplayName,
	getCurrencyIcon,
	getCurrencyColor3,
	getCurrencyMax,
	getCurrencyDefault,

	// Collections
	getSortedCurrencies,
	getSoftCurrencies,
	getPremiumCurrencies,
	getEventCurrencies,

	// Formatting
	formatCurrencyAmount,
	formatCurrencyWithAbbr,
} from "./currency-config";

// ─────────────────────────────────────────────────────────────────
// Wallet Types & Utilities
// ─────────────────────────────────────────────────────────────────
export {
	// Types
	type Wallet,
	type MutableWallet,
	type CurrencyTransaction,
	type CurrencyModifyRequest,
	type CurrencyOperationResult,
	type CurrencyErrorCode,
	type TransactionReason,

	// Constants
	TRANSACTION_REASONS,
	CURRENCY_ERROR_CODES,

	// Wallet factory
	createDefaultWallet,
	createEmptyWallet,
	cloneWallet,

	// Wallet queries
	getBalance,
	hasAmount,
	wouldExceedMax,
	getRemainingCapacity,
	calculateWalletValue,

	// Wallet mutations (immutable - returns new wallet)
	withModifiedBalance,
	withAdjustedBalance,

	// Validation
	validateAndRepairWallet,
} from "./wallet-types";

// ─────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────
export {
	// Types
	type ValidationResult,
	type PurchaseValidationResult,
	type SaleValidationResult,
	type TradeValidationResult,

	// Core validators
	validateCurrencyKey,
	validateAmount,
	validateSufficientFunds,
	validateNotExceedingMax,

	// Purchase/Sale validators
	validatePurchase,
	validateCartPurchase,
	validateSale,

	// Trade validators
	validateTrade,
	getTradeableCurrencies,

	// Transaction validators
	validateModifyRequest,
	validatePremiumModification,
	validateEventCurrencyActive,

	// Composite validators
	validateEarnCurrency,
	validateSpendCurrency,
} from "./currency-validation";

// ─────────────────────────────────────────────────────────────────
// Premium Products (Robux purchases)
// ─────────────────────────────────────────────────────────────────
export {
	// Types
	type PremiumProductConfig,
	type PremiumPurchaseRequest,
	type PremiumPurchaseResult,
	type PremiumPassConfig,

	// Product registry
	PREMIUM_PRODUCTS,
	PREMIUM_PASSES,

	// Product lookups
	getProductById,
	getProductsByCurrency,
	getSortedProducts,
	getFeaturedProducts,
	getPassById,

	// Calculations
	calculateTotalAmount,
	calculateValuePerRobux,

	// Purchase processing
	validatePremiumPurchase,
} from "./premium-products";
