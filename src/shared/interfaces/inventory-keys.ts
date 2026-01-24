/* ================================================================
   Item Categories
   ================================================================ */
export const ITEM_CATEGORIES = ["Ability", "SoulGem", "Consumable", "Equipment"] as const;
export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

/* ================================================================
   Rarity Keys (drives UI, drops, economy, etc.)
   ================================================================ */
export const RARITY_KEYS = ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic"] as const;
export type RarityKey = (typeof RARITY_KEYS)[number];

/* ================================================================
   Inventory Slot Keys
   ================================================================ */

// Ability Slots
export const ABILITY_SLOT_KEYS = ["AbilitySlot1", "AbilitySlot2", "AbilitySlot3", "AbilitySlot4", "AbilitySlot5"] as const;
export type AbilitySlotKey = (typeof ABILITY_SLOT_KEYS)[number];

// Soul Gem Slots
export const SOUL_GEM_SLOT_KEYS = ["SoulSlot1", "SoulSlot2", "SoulSlot3"] as const;
export type SoulGemSlotKey = (typeof SOUL_GEM_SLOT_KEYS)[number];

// Consumable Slots
export const CONSUMABLE_SLOT_KEYS = ["ConsumableSlot1", "ConsumableSlot2"] as const;
export type ConsumableSlotKey = (typeof CONSUMABLE_SLOT_KEYS)[number];

// Equipment Slots
export const EQUIPMENT_SLOT_KEYS = ["HeadSlot", "ChestSlot", "LegsSlot", "FeetSlot", "HandsSlot", "MainHandSlot", "OffHandSlot"] as const;
export type EquipmentSlotKey = (typeof EQUIPMENT_SLOT_KEYS)[number];

// Union of all slot keys
export type SlotKey = AbilitySlotKey | SoulGemSlotKey | ConsumableSlotKey | EquipmentSlotKey;

/* ================================================================
   Slot-to-Category Mapping (for validation)
   ================================================================ */
export type SlotCategoryMap = {
	[K in AbilitySlotKey]: "Ability";
} & {
	[K in SoulGemSlotKey]: "SoulGem";
} & {
	[K in ConsumableSlotKey]: "Consumable";
} & {
	[K in EquipmentSlotKey]: "Equipment";
};

/** Helper to get category for a slot key */
export function getCategoryForSlot(slotKey: SlotKey): ItemCategory {
	if (ABILITY_SLOT_KEYS.includes(slotKey as AbilitySlotKey)) return "Ability";
	if (SOUL_GEM_SLOT_KEYS.includes(slotKey as SoulGemSlotKey)) return "SoulGem";
	if (CONSUMABLE_SLOT_KEYS.includes(slotKey as ConsumableSlotKey)) return "Consumable";
	return "Equipment";
}
