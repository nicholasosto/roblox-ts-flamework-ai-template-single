import { CatalogEntry } from "../interfaces";

export const EQUIPMENT_CATALOG: Record<string, CatalogEntry> = {
	// ─────────────────────────────────────────────────────────────────
	// HEAD SLOT
	// ─────────────────────────────────────────────────────────────────
	bronze_helm: {
		CatalogId: "bronze_helm",
		DisplayName: "Bronze Helm",
		RequiredLevel: 1,
        Description: "A sturdy bronze helm that offers basic protection for the head.",
		CatalogCategory: "Equipment",
		IconId: "rbxassetid://120886988612649",
		Rarity: "Common",
		PurchasePrice: 100,
		SellPrice: 25,
		CurrencyKey: "Gold",
		SlotRestriction: "HeadSlot",
		AccessoryId: "DemonicHalo",
		StatModifiers: { Vitality: 2, PhysicalResistance: 5 },
		StatusEffects: [],
	},

	demonic_halo: {
		RequiredLevel: 10,
		CatalogId: "demonic_halo",
		DisplayName: "Demonic Halo",
        Description: "A halo imbued with dark energy, enhancing intelligence and mental power.",
		CatalogCategory: "Equipment",
		IconId: "rbxassetid://100823924200826",
		Rarity: "Epic",
		PurchasePrice: 5000,
		SellPrice: 1250,
		CurrencyKey: "Gold",
		SlotRestriction: "HeadSlot",
		AccessoryId: "DemonicHalo",
		StatModifiers: { Intelligence: 10, MentalPower: 20, MentalResistance: 15 },
		StatusEffects: [],
	},

	// ─────────────────────────────────────────────────────────────────
	// CHEST SLOT
	// ─────────────────────────────────────────────────────────────────
	basic_armor: {
		CatalogId: "basic_armor",
		DisplayName: "Basic Armor",
        Description: "A simple chest armor that provides basic protection.",
		CatalogCategory: "Equipment",
		IconId: "rbxassetid://81143206579336",
		Rarity: "Common",
		PurchasePrice: 150,
		SellPrice: 35,
		CurrencyKey: "Gold",
		SlotRestriction: "ChestSlot",
		AccessoryId: "BasicArmor",
		StatModifiers: { Vitality: 3, PhysicalResistance: 10 },
		StatusEffects: [],
	},

	legendary_platron: {
		CatalogId: "legendary_platron",
		DisplayName: "Legendary Platron",
        Description: "A legendary chest armor that offers unparalleled protection and vitality.",
		CatalogCategory: "Equipment",
		IconId: "rbxassetid://136889833528991",
		Rarity: "Legendary",
		PurchasePrice: 25000,
		SellPrice: 6250,
		CurrencyKey: "Gold",
		SlotRestriction: "ChestSlot",
		AccessoryId: "Plate_Legendary_RB",
		StatModifiers: { Vitality: 15, PhysicalResistance: 40, Strength: 5 },
		StatusEffects: [],
	},

	// ─────────────────────────────────────────────────────────────────
	// MAIN HAND SLOT
	// ─────────────────────────────────────────────────────────────────
	bronze_sword: {
		CatalogId: "bronze_sword",
		DisplayName: "Bronze Sword",
        Description: "A basic bronze sword that enhances the wielder's strength and physical power.",
		CatalogCategory: "Equipment",
		IconId: "rbxassetid://121475161731571",
		Rarity: "Common",
		PurchasePrice: 120,
		SellPrice: 30,
		CurrencyKey: "Gold",
		SlotRestriction: "MainHandSlot",
		AccessoryId: "Blade_Decaying",
		StatModifiers: { Strength: 3, PhysicalPower: 8 },
		StatusEffects: [],
	},

	iron_sword: {
		CatalogId: "iron_sword",
		DisplayName: "Iron Sword",
        Description: "A sturdy iron sword that offers balanced strength and power.",
		CatalogCategory: "Equipment",
		IconId: "rbxassetid://121475161731571",
		Rarity: "Rare",
		PurchasePrice: 800,
		SellPrice: 200,
		CurrencyKey: "Gold",
		SlotRestriction: "MainHandSlot",
		AccessoryId: "Blade_Decaying",
		StatModifiers: { Strength: 5, PhysicalPower: 15, CritChance: 2 },
		StatusEffects: [],
	},

	red_claw: {
		CatalogId: "red_claw",
		DisplayName: "Red Claw",
        Description: "A claw imbued with fiery energy, enhancing the wielder's strength and power.",
		CatalogCategory: "Equipment",
		IconId: "rbxassetid://79484036913795",
		Rarity: "Epic",
		PurchasePrice: 4500,
		SellPrice: 1125,
		CurrencyKey: "Gold",
		SlotRestriction: "MainHandSlot",
		AccessoryId: "Claw_Technorage",
		StatModifiers: { Strength: 8, PhysicalPower: 25, CritChance: 5 },
		StatusEffects: [],
	},
};

export function getEquipmentCatalogEntries(): CatalogEntry[] {
	const equipment: CatalogEntry[] = [];
	for (const [_, entry] of pairs(EQUIPMENT_CATALOG)) {
		equipment.push(entry);
	}
	return equipment;
}
