import { ItemCategory, RarityKey, SlotKey } from "./inventory-keys";

/** Static catalog definition for an item type */
export interface CatalogEntry {
	/** Human-readable unique identifier */
	CatalogId: string;
	DisplayName: string;
	Description: string;
	CatalogCategory: ItemCategory;
	IconId: string;
	Rarity: RarityKey;
	RequiredLevel?: number;
	PurchasePrice: number;
	SellPrice: number;
	CurrencyKey: string; // e.g., "Gold", "Gems", etc.
	StatModifiers: Record<string, number>; // Optional stat modifiers
	SlotRestriction?: SlotKey; // For equipment items now. Use will be expanded later.
	StatusEffects: string[]; // For soul gems now. Use will be expanded later.
	GrantedAbilities?: string[]; // For abilities now. Use will be expanded later.
	AccessoryId?: string; // Optional accessory linkage
}

/** Player-owned instance of an item */
export type OwnedItem = {
    CatalogId: string;
	ItemCategory: ItemCategory;
    Qty: number;
    CurrentSlotKey: 'Backpack' | SlotKey;
    UUID: string;
}

/* -------------------------------------------------------------------- /
/ ================= Inventory Catalog Entry Types ===================== /
/ -------------------------------------------------------------------- */

export interface AbilityCatalogEntry extends CatalogEntry {
	CatalogCategory: "Ability"; // Predefined as Ability
	Cooldown?: number;
	ResourceCost?: number;
	ResourceType?: string;
    CastTime?: number;
}
