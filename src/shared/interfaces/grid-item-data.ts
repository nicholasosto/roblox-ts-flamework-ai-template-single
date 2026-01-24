import { ItemCategory, SlotKey } from "./inventory-keys";
import { CatalogEntry, OwnedItem } from "./item-interfaces";

/* ================================================================
   Item Action Types - Actions that can be performed on items
   ================================================================ */
export type ItemAction = "Use" | "Equip" | "Unequip" | "Inspect" | "Unlock" | "";

/* ================================================================
   Item State - Computed state that drives UI behavior
   ================================================================ */
export const ITEM_STATES = [
	"owned-equipped",   // Player owns, currently in a loadout slot
	"owned-backpack",   // Player owns, sitting in backpack
	"unlockable",       // Catalog item, player meets requirements
	"locked",           // Catalog item, player doesn't meet requirements
	"preview",          // View-only (e.g., tooltip preview)
] as const;

export type ItemState = (typeof ITEM_STATES)[number];

/* ================================================================
   Grid Item Data - Unified view model for grid items
   ================================================================ */

/** Ownership information for items the player owns */
export interface ItemOwnership {
	uuid: string;
	quantity: number;
	currentSlot: SlotKey | "Backpack";
}

/** Unlock/purchase state for catalog items */
export interface ItemUnlockInfo {
	isUnlocked: boolean;              // Has player unlocked this catalog entry?
	canPurchase: boolean;             // Meets currency/level requirements?
}

/** Unified view model for grid items - works for both inventory and catalog modes */
export interface GridItemData {
	// Identity (always present)
	catalogId: string;
	catalogEntry: CatalogEntry;

	// Ownership state (present if player owns this item)
	ownership?: ItemOwnership;

	// Unlock/purchase state (present in catalog mode)
	unlockInfo?: ItemUnlockInfo;
}

/* ================================================================
   State Derivation Helpers
   ================================================================ */

/** Derive ItemState from GridItemData */
export function deriveItemState(data: GridItemData): ItemState {
	// Owned items take priority
	if (data.ownership) {
		return data.ownership.currentSlot !== "Backpack"
			? "owned-equipped"
			: "owned-backpack";
	}

	// Catalog items
	if (data.unlockInfo) {
		if (data.unlockInfo.isUnlocked) return "owned-backpack"; // Already unlocked
		return data.unlockInfo.canPurchase ? "unlockable" : "locked";
	}

	return "preview";
}

/** Check if item is owned (either equipped or in backpack) */
export function isOwned(data: GridItemData): boolean {
	return data.ownership !== undefined;
}

/** Check if item is currently equipped */
export function isEquipped(data: GridItemData): boolean {
	return data.ownership?.currentSlot !== undefined && data.ownership.currentSlot !== "Backpack";
}

/** Check if item can be purchased/unlocked */
export function canUnlock(data: GridItemData): boolean {
	return data.unlockInfo?.canPurchase === true && !data.unlockInfo.isUnlocked;
}

/** Get available actions based on item state */
export function getAvailableActions(state: ItemState): ItemAction[] {
	switch (state) {
		case "owned-equipped":
			return ["Unequip", "Inspect"];
		case "owned-backpack":
			return ["Equip", "Inspect"];
		case "unlockable":
			return ["Unlock", "Inspect"];
		case "locked":
			return ["Inspect"]; // Can only view details
		case "preview":
			return ["Inspect"];
		default:
			return [];
	}
}

/** Get the primary (default) action for an item state */
export function getPrimaryAction(state: ItemState): ItemAction {
	const actions = getAvailableActions(state);
	return actions[0] ?? "";
}

/* ================================================================
   Selection Payload - Rich context for item selection events
   ================================================================ */

/** Payload sent when an item is selected in the grid */
export interface ItemSelectionPayload {
	catalogId: string;
	uuid?: string;
	state: ItemState;
	category: ItemCategory;
}

/* ================================================================
   Conversion Helpers
   ================================================================ */

export function inventoryToGridItemData(ownedItem: OwnedItem, catalogEntry: CatalogEntry): GridItemData {
	return {
		catalogId: ownedItem.CatalogId,
		catalogEntry: catalogEntry,
		ownership: {
			uuid: ownedItem.UUID,
			quantity: ownedItem.Qty,
			currentSlot: ownedItem.CurrentSlotKey,
		},
	};
}
export function catalogEntryToGridItemData(catalogEntry: CatalogEntry, unlockInfo?: ItemUnlockInfo): GridItemData {
	return {
		catalogId: catalogEntry.CatalogId,
		catalogEntry: catalogEntry,
		unlockInfo: unlockInfo,
	};
}
