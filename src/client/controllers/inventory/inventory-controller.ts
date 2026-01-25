import { Controller, OnStart } from "@flamework/core";
import { Components } from "@flamework/components";
import { createLogger } from "shared/utils";
import { Events, ClientSignals } from "shared/network/client-network";
import { OwnedItem, SlotKey, ItemCategory, getCategoryForSlot } from "shared/interfaces";
import { ItemSlotComponent } from "../../components/ui/item-slot-component";

const logger = createLogger("controller:Inventory");

/**
 * InventoryController
 *
 * Client-side controller for inventory state and UI reconciliation.
 * Responsibilities:
 * - Cache backpack state from server sync
 * - Reconcile UI components when backpack changes
 * - Send equip/unequip/purchase requests to server
 * - Track selected slot for grid filtering
 * - Push filtered items to grid via updateGridItems signal
 *
 * Design:
 * - Single source of truth for backpack data
 * - Signal-driven updates from server events
 * - Full backpack sync model (no incremental updates)
 */
@Controller({})
export class InventoryController implements OnStart {
	// Local cache of backpack (updated by server sync)
	private backpack: OwnedItem[] = [];

	// Currently selected slot (for filtering and equip target)
	private selectedSlotKey?: SlotKey;

	// Current filter category
	private currentFilter?: ItemCategory;

	constructor(private components: Components) {}

	onStart(): void {
		this.registerNetworkEvents();
		this.registerClientSignals();
		logger.info("InventoryController started");
	}

	/* ================================================================
	   Network Event Handlers
	   ================================================================ */

	private registerNetworkEvents(): void {
		// Full backpack sync from server
		Events.inventory.backpackSync.connect((backpack) => {
			this.onBackpackSync(backpack);
		});

		// Purchase result feedback
		Events.inventory.purchaseResult.connect((success, catalogId, message) => {
			if (success) {
				logger.info(`Purchase successful: ${catalogId}`);
			} else {
				logger.warn(`Purchase failed: ${catalogId} - ${message ?? "Unknown error"}`);
			}
			// TODO: Show UI notification
		});
	}

	private registerClientSignals(): void {
		// Slot selected - track for filtering and equip target
		ClientSignals.itemSlotSelected.Connect((slotKey) => {
			this.onSlotSelected(slotKey);
		});

		// Item selected from grid - equip to selected slot
		ClientSignals.itemSelected.Connect((itemId) => {
			this.onItemSelected(itemId);
		});

		// Category filter button pressed
		ClientSignals.setCategoryFilter.Connect((category) => {
			this.setFilterCategory(category);
		});

		// Purchase request from UI
		ClientSignals.itemPurchaseRequest.Connect((catalogId) => {
			this.requestPurchase(catalogId);
		});
	}

	/* ================================================================
	   Backpack Sync & UI Reconciliation
	   ================================================================ */

	private onBackpackSync(backpack: OwnedItem[]): void {
		logger.info(`Backpack sync received: ${backpack.size()} items`);
		this.backpack = backpack;

		// Reconcile slot components
		this.reconcileSlotComponents();

		// Push items to grid (filtered if a slot is selected)
		this.pushItemsToGrid();
	}

	/**
	 * Update all ItemSlotComponents based on current backpack state
	 * Each slot finds the item where CurrentSlotKey matches
	 */
	private reconcileSlotComponents(): void {
		// Index items by their current slot
		const itemsBySlot = new Map<SlotKey | "Backpack", OwnedItem>();
		for (const item of this.backpack) {
			// For equipped slots, store the item (only one per slot)
			if (item.CurrentSlotKey !== "Backpack") {
				itemsBySlot.set(item.CurrentSlotKey, item);
			}
		}

		// Update all slot components
		this.components.getAllComponents<ItemSlotComponent>().forEach((component) => {
			const slotKey = component.attributes.slotKey;
			const itemForSlot = itemsBySlot.get(slotKey);

			if (itemForSlot) {
				component.setItem(itemForSlot);
			} else {
				component.clearItem();
			}
		});

		logger.debug("Slot components reconciled");
	}

	/**
	 * Push filtered items to the grid via signal
	 */
	private pushItemsToGrid(): void {
		const items = this.getFilteredItems();
		ClientSignals.updateGridItems.Fire(items, this.currentFilter);
		logger.debug(`Pushed ${items.size()} items to grid (filter: ${this.currentFilter ?? "none"})`);
	}

	/**
	 * Get items filtered by current category
	 */
	private getFilteredItems(): OwnedItem[] {
		if (!this.currentFilter) {
			return [...this.backpack];
		}
		return this.backpack.filter((item) => item.ItemCategory === this.currentFilter);
	}

	/* ================================================================
	   Selection & Filtering
	   ================================================================ */

	private onSlotSelected(slotKey: SlotKey): void {
		// Toggle selection if same slot clicked
		if (this.selectedSlotKey === slotKey) {
			this.selectedSlotKey = undefined;
			this.currentFilter = undefined;
			this.clearSlotSelection();
		} else {
			this.selectedSlotKey = slotKey;
			this.currentFilter = getCategoryForSlot(slotKey);
			this.updateSlotSelection(slotKey);
		}

		// Push filtered items to grid
		this.pushItemsToGrid();

		logger.debug(`Slot selected: ${this.selectedSlotKey ?? "none"}`);
	}

	private onItemSelected(itemId: string): void {
		const item = this.getItemById(itemId);
		if (!item) {
			logger.warn(`Item not found: ${itemId}`);
			return;
		}

		// If a slot is selected and item is compatible, equip it
		if (this.selectedSlotKey) {
			const expectedCategory = getCategoryForSlot(this.selectedSlotKey);
			if (item.ItemCategory === expectedCategory) {
				this.requestEquip(itemId, this.selectedSlotKey);
			} else {
				logger.warn(`Item category ${item.ItemCategory} doesn't match slot ${this.selectedSlotKey}`);
			}
		}
	}

	private updateSlotSelection(selectedSlot: SlotKey): void {
		this.components.getAllComponents<ItemSlotComponent>().forEach((component) => {
			component.setSelected(component.attributes.slotKey === selectedSlot);
		});
	}

	private clearSlotSelection(): void {
		this.components.getAllComponents<ItemSlotComponent>().forEach((component) => {
			component.setSelected(false);
		});
	}

	/**
	 * Set filter category (called by FilterGridButton)
	 * Clears slot selection and filters grid by category
	 */
	public setFilterCategory(category?: ItemCategory): void {
		// Clear slot selection when using category buttons
		this.selectedSlotKey = undefined;
		this.clearSlotSelection();

		// Toggle filter if same category clicked
		if (this.currentFilter === category) {
			this.currentFilter = undefined;
		} else {
			this.currentFilter = category;
		}

		this.pushItemsToGrid();
		logger.debug(`Filter category set: ${this.currentFilter ?? "none"}`);
	}

	/* ================================================================
	   Server Requests
	   ================================================================ */

	public requestEquip(itemId: string, slotKey: SlotKey): void {
		logger.info(`Requesting equip: ${itemId} → ${slotKey}`);
		Events.inventory.requestEquip.fire(itemId, slotKey);
	}

	public requestUnequip(slotKey: SlotKey): void {
		logger.info(`Requesting unequip: ${slotKey}`);
		Events.inventory.requestUnequip.fire(slotKey);
	}

	public requestPurchase(catalogId: string): void {
		logger.info(`Requesting purchase: ${catalogId}`);
		Events.inventory.requestPurchase.fire(catalogId);
	}

	public requestSell(itemId: string, quantity = 1): void {
		logger.info(`Requesting sell: ${itemId} x${quantity}`);
		Events.inventory.requestSell.fire(itemId, quantity);
	}

	/* ================================================================
	   Query API (for UI components)
	   ================================================================ */

	/**
	 * Get all items in backpack (including equipped)
	 */
	public getBackpackItems(): readonly OwnedItem[] {
		return this.backpack;
	}

	/**
	 * Get items filtered by category
	 */
	public getItemsByCategory(category: ItemCategory): OwnedItem[] {
		return this.backpack.filter((item) => item.ItemCategory === category);
	}

	/**
	 * Get items that are in the backpack (not equipped)
	 */
	public getUnequippedItems(): OwnedItem[] {
		return this.backpack.filter((item) => item.CurrentSlotKey === "Backpack");
	}

	/**
	 * Get item equipped to a specific slot
	 */
	public getEquippedItem(slotKey: SlotKey): OwnedItem | undefined {
		return this.backpack.find((item) => item.CurrentSlotKey === slotKey);
	}

	/**
	 * Get item by UUID
	 */
	public getItemById(itemId: string): OwnedItem | undefined {
		return this.backpack.find((item) => item.UUID === itemId);
	}

	/**
	 * Check if an item is equipped (not in backpack)
	 */
	public isItemEquipped(itemId: string): boolean {
		const item = this.getItemById(itemId);
		return item !== undefined && item.CurrentSlotKey !== "Backpack";
	}

	/**
	 * Get currently selected slot key
	 */
	public getSelectedSlotKey(): SlotKey | undefined {
		return this.selectedSlotKey;
	}
}
