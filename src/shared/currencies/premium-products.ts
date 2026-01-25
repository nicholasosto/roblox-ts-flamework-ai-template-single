/**
 * Premium Products
 *
 * Configuration for Robux-to-Premium currency products.
 * Handles Developer Product mappings and purchase processing.
 *
 * @module currencies/premium-products
 */

import { PremiumCurrencyKey } from "./currency-keys";

/* ================================================================
   Product Configuration Types
   ================================================================ */

export interface PremiumProductConfig {
	/** Roblox Developer Product ID */
	readonly productId: number;

	/** Currency to grant on purchase */
	readonly currencyKey: PremiumCurrencyKey;

	/** Amount of currency granted */
	readonly amount: number;

	/** Bonus percentage (0-100, for bundle deals) */
	readonly bonusPercent: number;

	/** Display name for the product */
	readonly displayName: string;

	/** Price in Robux */
	readonly robuxPrice: number;

	/** Is this a featured/best value product? */
	readonly isFeatured: boolean;

	/** Sort order in the shop */
	readonly displayOrder: number;
}

/* ================================================================
   Product Registry
   ================================================================ */

/**
 * All premium currency products available for purchase.
 *
 * IMPORTANT: Product IDs must match your Roblox Developer Products.
 * Update these IDs after creating products in the Roblox Creator Dashboard.
 */
export const PREMIUM_PRODUCTS: readonly PremiumProductConfig[] = [
	// ─────────────────────────────────────────────────────────────────
	// GEMS PRODUCTS
	// ─────────────────────────────────────────────────────────────────
	{
		productId: 0, // TODO: Replace with actual product ID
		currencyKey: "Gems",
		amount: 100,
		bonusPercent: 0,
		displayName: "100 Gems",
		robuxPrice: 75,
		isFeatured: false,
		displayOrder: 1,
	},
	{
		productId: 0, // TODO: Replace with actual product ID
		currencyKey: "Gems",
		amount: 500,
		bonusPercent: 10,
		displayName: "550 Gems", // 500 + 10% bonus
		robuxPrice: 350,
		isFeatured: false,
		displayOrder: 2,
	},
	{
		productId: 0, // TODO: Replace with actual product ID
		currencyKey: "Gems",
		amount: 1200,
		bonusPercent: 20,
		displayName: "1,440 Gems", // 1200 + 20% bonus
		robuxPrice: 800,
		isFeatured: true, // Best value
		displayOrder: 3,
	},
	{
		productId: 0, // TODO: Replace with actual product ID
		currencyKey: "Gems",
		amount: 2500,
		bonusPercent: 25,
		displayName: "3,125 Gems", // 2500 + 25% bonus
		robuxPrice: 1500,
		isFeatured: false,
		displayOrder: 4,
	},
	{
		productId: 0, // TODO: Replace with actual product ID
		currencyKey: "Gems",
		amount: 6000,
		bonusPercent: 35,
		displayName: "8,100 Gems", // 6000 + 35% bonus
		robuxPrice: 3500,
		isFeatured: false,
		displayOrder: 5,
	},

	// ─────────────────────────────────────────────────────────────────
	// ETERNAL TOKENS PRODUCTS
	// ─────────────────────────────────────────────────────────────────
	{
		productId: 0, // TODO: Replace with actual product ID
		currencyKey: "EternalTokens",
		amount: 10,
		bonusPercent: 0,
		displayName: "10 Eternal Tokens",
		robuxPrice: 200,
		isFeatured: false,
		displayOrder: 10,
	},
	{
		productId: 0, // TODO: Replace with actual product ID
		currencyKey: "EternalTokens",
		amount: 50,
		bonusPercent: 10,
		displayName: "55 Eternal Tokens",
		robuxPrice: 900,
		isFeatured: true,
		displayOrder: 11,
	},
	{
		productId: 0, // TODO: Replace with actual product ID
		currencyKey: "EternalTokens",
		amount: 100,
		bonusPercent: 20,
		displayName: "120 Eternal Tokens",
		robuxPrice: 1600,
		isFeatured: false,
		displayOrder: 12,
	},
];

/* ================================================================
   Product Lookup Functions
   ================================================================ */

/**
 * Get product configuration by product ID.
 */
export function getProductById(productId: number): PremiumProductConfig | undefined {
	return PREMIUM_PRODUCTS.find((p) => p.productId === productId);
}

/**
 * Get all products for a specific currency.
 */
export function getProductsByCurrency(
	currencyKey: PremiumCurrencyKey,
): readonly PremiumProductConfig[] {
	return PREMIUM_PRODUCTS.filter((p) => p.currencyKey === currencyKey);
}

/**
 * Get all products sorted by display order.
 */
export function getSortedProducts(): readonly PremiumProductConfig[] {
	return [...PREMIUM_PRODUCTS].sort((a, b) => a.displayOrder < b.displayOrder);
}

/**
 * Get featured (best value) products.
 */
export function getFeaturedProducts(): readonly PremiumProductConfig[] {
	return PREMIUM_PRODUCTS.filter((p) => p.isFeatured);
}

/**
 * Calculate total amount including bonus.
 */
export function calculateTotalAmount(product: PremiumProductConfig): number {
	return math.floor(product.amount * (1 + product.bonusPercent / 100));
}

/**
 * Calculate value per Robux (for comparison).
 */
export function calculateValuePerRobux(product: PremiumProductConfig): number {
	const totalAmount = calculateTotalAmount(product);
	return totalAmount / product.robuxPrice;
}

/* ================================================================
   Purchase Processing Types
   ================================================================ */

export interface PremiumPurchaseRequest {
	/** Player making the purchase */
	readonly playerId: number;

	/** Developer Product ID */
	readonly productId: number;

	/** Roblox receipt ID (for validation) */
	readonly receiptId: string;
}

export interface PremiumPurchaseResult {
	/** Whether the purchase was processed successfully */
	readonly success: boolean;

	/** Currency granted (if successful) */
	readonly currencyKey?: PremiumCurrencyKey;

	/** Amount granted including bonus (if successful) */
	readonly amountGranted?: number;

	/** Error message (if failed) */
	readonly errorMessage?: string;
}

/**
 * Process a premium currency purchase.
 * This is a stub - actual implementation would be in a server service
 * that handles the MarketplaceService callbacks.
 *
 * @example
 * // In your ProcessReceipt callback:
 * const result = processPremiumPurchase({
 *   playerId: receiptInfo.PlayerId,
 *   productId: receiptInfo.ProductId,
 *   receiptId: receiptInfo.PurchaseId,
 * });
 */
export function validatePremiumPurchase(request: PremiumPurchaseRequest): PremiumPurchaseResult {
	const product = getProductById(request.productId);

	if (!product) {
		return {
			success: false,
			errorMessage: `Unknown product ID: ${request.productId}`,
		};
	}

	const totalAmount = calculateTotalAmount(product);

	return {
		success: true,
		currencyKey: product.currencyKey,
		amountGranted: totalAmount,
	};
}

/* ================================================================
   Subscription / Game Pass Integration (Future)
   ================================================================ */

export interface PremiumPassConfig {
	/** Roblox Game Pass ID */
	readonly gamePassId: number;

	/** Pass name */
	readonly displayName: string;

	/** One-time currency grant on purchase */
	readonly oneTimeGrant?: {
		readonly currencyKey: PremiumCurrencyKey;
		readonly amount: number;
	};

	/** Multiplier for earning soft currency */
	readonly earnMultiplier?: number;

	/** Daily login bonus */
	readonly dailyBonus?: {
		readonly currencyKey: PremiumCurrencyKey;
		readonly amount: number;
	};
}

/**
 * Premium game passes configuration.
 * Update with your actual Game Pass IDs.
 */
export const PREMIUM_PASSES: readonly PremiumPassConfig[] = [
	{
		gamePassId: 0, // TODO: Replace with actual Game Pass ID
		displayName: "VIP Pass",
		oneTimeGrant: {
			currencyKey: "Gems",
			amount: 500,
		},
		earnMultiplier: 2.0, // 2x Gold earnings
		dailyBonus: {
			currencyKey: "Gems",
			amount: 25,
		},
	},
	{
		gamePassId: 0, // TODO: Replace with actual Game Pass ID
		displayName: "Starter Pack",
		oneTimeGrant: {
			currencyKey: "Gems",
			amount: 200,
		},
	},
];

/**
 * Get game pass configuration by ID.
 */
export function getPassById(gamePassId: number): PremiumPassConfig | undefined {
	return PREMIUM_PASSES.find((p) => p.gamePassId === gamePassId);
}
