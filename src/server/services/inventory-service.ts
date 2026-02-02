import { Service, OnStart } from "@flamework/core";
import { HttpService } from "@rbxts/services";
import { createLogger } from "shared/utils";
import { PlayerProfileService } from "./player-profile-service";
import { Events, ServerSignals } from "shared/network/server-network";
import { OwnedItem, SlotKey, getCategoryForSlot } from "shared/interfaces";
import { getCatalogEntryById } from "shared/catalogs";
import { MutableWallet } from "shared/currencies";

const log = createLogger("service:Inventory");

/**
 * InventoryService
 *
 * Server-authoritative service for all inventory mutations.
 * Responsibilities:
 * - Purchase items from catalog
 * - Equip/unequip items to slots
 * - Grant items (rewards, drops)
 * - Sell items
 *
 * After any mutation, syncs the full backpack to the client via network event
 * and fires ServerSignals.backpackUpdated for other services (e.g., WCSService).
 */
@Service()
export class InventoryService implements OnStart {
	constructor(private readonly playerProfileService: PlayerProfileService) {}

	onStart(): void {
		this.registerNetworkEvents();
		this.registerProfileListeners();
		log.info("InventoryService started");
	}

	/* ================================================================
	   Network Event Handlers
	   ================================================================ */

	private registerNetworkEvents(): void {
		// Equip request from client
		Events.inventory.requestEquip.connect((player, itemId, slotKey) => this.equipItem(player, itemId, slotKey));

		// Unequip request from client
		Events.inventory.requestUnequip.connect((player, slotKey) => this.unequipItem(player, slotKey));

		// Purchase request from client
		Events.inventory.requestPurchase.connect((player, catalogId) => this.purchaseItem(player, catalogId));

		// Sell request from client
		Events.inventory.requestSell.connect((player, itemId, quantity) => this.sellItem(player, itemId, quantity));
	}

	private registerProfileListeners(): void {
		// Send initial backpack sync when profile loads
		this.playerProfileService.profileLoaded.Connect((player) => this.syncBackpackToClient(player));
	}

	/* ================================================================
	   Public API (for other services)
	   ================================================================ */

	/**
	 * Grant an item to a player (rewards, drops, starting items)
	 * Creates a new OwnedItem from catalog data
	 */
	public grantItem(player: Player, catalogId: string, quantity = 1): OwnedItem | undefined {
		const catalogEntry = getCatalogEntryById(catalogId);
		if (!catalogEntry) {
			log.warn(`Cannot grant item - catalog entry not found: ${catalogId}`);
			return undefined;
		}

		const backpack = this.getBackpack(player);
		if (!backpack) return undefined;

		// Create new owned item
		const newItem: OwnedItem = {
			UUID: HttpService.GenerateGUID(false),
			CatalogId: catalogId,
			ItemCategory: catalogEntry.CatalogCategory,
			Qty: quantity,
			CurrentSlotKey: "Backpack",
		};

		backpack.push(newItem);
		log.info(`Granted ${catalogId} x${quantity} to ${player.Name}`);

		this.syncBackpackToClient(player);
		return newItem;
	}

	/* ================================================================
	   Inventory Mutations (Server Authority)
	   ================================================================ */

	/**
	 * Equip an item to a slot
	 * - Auto-unequips any existing item in the target slot
	 * - Validates slot compatibility
	 */
	private equipItem(player: Player, itemId: string, slotKey: SlotKey): boolean {
		const backpack = this.getBackpack(player);
		if (!backpack) return false;

		// Find the item to equip
		const item = backpack.find((i) => i.UUID === itemId);
		if (!item) {
			log.warn(`Equip failed - item not found: ${itemId}`);
			return false;
		}

		// Validate slot compatibility
		const expectedCategory = getCategoryForSlot(slotKey);
		if (item.ItemCategory !== expectedCategory) {
			log.warn(`Equip failed - ${item.ItemCategory} cannot go in ${slotKey} (expects ${expectedCategory})`);
			return false;
		}

		// Validate equipment slot restriction if applicable
		const catalogEntry = getCatalogEntryById(item.CatalogId);
		if (catalogEntry?.SlotRestriction && catalogEntry.SlotRestriction !== slotKey) {
			log.warn(`Equip failed - ${item.CatalogId} restricted to ${catalogEntry.SlotRestriction}`);
			return false;
		}

		// Auto-unequip existing item in this slot
		const existingItem = backpack.find((i) => i.CurrentSlotKey === slotKey);
		if (existingItem) {
			existingItem.CurrentSlotKey = "Backpack";
			log.info(`Auto-unequipped ${existingItem.CatalogId} from ${slotKey}`);
		}

		// Equip the new item
		item.CurrentSlotKey = slotKey;
		log.info(`Equipped ${item.CatalogId} to ${slotKey} for ${player.Name}`);

		this.syncBackpackToClient(player);
		return true;
	}

	/**
	 * Unequip an item from a slot
	 * - Finds item by slot key and moves to backpack
	 */
	private unequipItem(player: Player, slotKey: SlotKey): boolean {
		const backpack = this.getBackpack(player);
		if (!backpack) return false;

		// Find item in this slot
		const item = backpack.find((i) => i.CurrentSlotKey === slotKey);
		if (!item) {
			log.warn(`Unequip failed - no item in slot: ${slotKey}`);
			return false;
		}

		item.CurrentSlotKey = "Backpack";
		log.info(`Unequipped ${item.CatalogId} from ${slotKey} for ${player.Name}`);

		this.syncBackpackToClient(player);
		return true;
	}

	/**
	 * Purchase an item from the catalog
	 * - Validates currency
	 * - Creates new OwnedItem
	 */
	private purchaseItem(player: Player, catalogId: string): boolean {
		const profile = this.playerProfileService.getProfile(player);
		if (!profile) return false;

		const catalogEntry = getCatalogEntryById(catalogId);
		if (!catalogEntry) {
			log.warn(`Purchase failed - catalog entry not found: ${catalogId}`);
			return false;
		}

		const { PurchasePrice, CurrencyKey } = catalogEntry;
		// Cast to MutableWallet for internal mutations
		const wallet = profile.Data.wallet as MutableWallet;

		// Check if player has enough currency
		if (wallet[CurrencyKey] < PurchasePrice) {
			log.warn(`Purchase failed - insufficient ${CurrencyKey}: has ${wallet[CurrencyKey]}, needs ${PurchasePrice}`);
			Events.inventory.purchaseResult.fire(player, false, catalogId, "Insufficient funds");
			return false;
		}

		// Deduct currency
		wallet[CurrencyKey] -= PurchasePrice;

		// Grant the item
		const newItem = this.grantItem(player, catalogId);
		if (!newItem) {
			// Refund on failure
			wallet[CurrencyKey] += PurchasePrice;
			Events.inventory.purchaseResult.fire(player, false, catalogId, "Failed to create item");
			return false;
		}

		log.info(`${player.Name} purchased ${catalogId} for ${PurchasePrice} ${CurrencyKey}`);
		Events.inventory.purchaseResult.fire(player, true, catalogId);
		return true;
	}

	/**
	 * Sell an item for currency
	 * - Validates ownership
	 * - Removes item and grants currency
	 */
	private sellItem(player: Player, itemId: string, quantity = 1): boolean {
		const profile = this.playerProfileService.getProfile(player);
		if (!profile) return false;

		const backpack = profile.Data.backpack;
		const itemIndex = backpack.findIndex((i) => i.UUID === itemId);

		if (itemIndex === -1) {
			log.warn(`Sell failed - item not found: ${itemId}`);
			return false;
		}

		const item = backpack[itemIndex];
		const catalogEntry = getCatalogEntryById(item.CatalogId);
		if (!catalogEntry) {
			log.warn(`Sell failed - catalog entry not found for: ${item.CatalogId}`);
			return false;
		}

		const sellAmount = quantity * catalogEntry.SellPrice;
		const { CurrencyKey } = catalogEntry;

		// Handle quantity
		if (item.Qty <= quantity) {
			// Remove entire stack
			backpack.remove(itemIndex);
		} else {
			// Reduce quantity
			item.Qty -= quantity;
		}

		// Grant currency (cast to MutableWallet for internal mutations)
		const wallet = profile.Data.wallet as MutableWallet;
		wallet[CurrencyKey] += sellAmount;

		log.info(`${player.Name} sold ${item.CatalogId} x${quantity} for ${sellAmount} ${CurrencyKey}`);
		this.syncBackpackToClient(player);
		return true;
	}

	/* ================================================================
	   Sync & Helpers
	   ================================================================ */

	/**
	 * Public: Get a player's backpack (for other services)
	 */
	public getPlayerBackpack(player: Player): OwnedItem[] | undefined {
		return this.getBackpack(player);
	}

	/**
	 * Get backpack array from player profile
	 */
	private getBackpack(player: Player): OwnedItem[] | undefined {
		const profile = this.playerProfileService.getProfile(player);
		if (!profile) {
			log.warn(`Cannot get backpack - no profile for ${player.Name}`);
			return undefined;
		}
		return profile.Data.backpack;
	}

	/**
	 * Sync full backpack to client and notify other services
	 */
	private syncBackpackToClient(player: Player): void {
		const backpack = this.getBackpack(player);
		if (!backpack) return;

		// Send to client via network event
		Events.inventory.backpackSync.fire(player, backpack);

		// Notify other services (e.g., WCSService for skill registration)
		ServerSignals.backpackUpdated.Fire(player, backpack);

		log.info(`Synced backpack to ${player.Name} (${backpack.size()} items)`);
	}
}
