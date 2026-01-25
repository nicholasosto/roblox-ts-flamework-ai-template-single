import { BaseComponent, Component, Components } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { CollectionService } from "@rbxts/services";
import { createLogger } from "shared/utils";
import { ClientSignals, Events } from "shared/network/client-network";
import { OwnedItem, ItemCategory } from "shared/interfaces";
import { createGridItemInstance, GridItemComponentTag } from "shared/roblox-templates/ui-elements/grid-item";
import { GridItemComponent } from "./grid-item-component";

const logger = createLogger("component:ItemGrid");

export interface ItemGridAttributes {
	mode: "Inventory" | "Catalog";
}

/**
 * ItemGridComponent
 *
 * Manages a scrolling grid of inventory items.
 * - Inventory mode: Shows player's owned items
 * - Catalog mode: Shows all catalog items (for shop)
 *
 * Listens to filterGridRequest signal to filter by category.
 * Listens to backpackSync event to get items from server.
 * Spawns GridItemComponent instances and manages pooling.
 */
@Component({
	tag: "ItemGrid",
	defaults: {
		mode: "Inventory",
	},
})
export class ItemGridComponent extends BaseComponent<ItemGridAttributes, ScrollingFrame> implements OnStart {
	// Pool of grid item instances for reuse
	private itemPool: GridItemComponent[] = [];
	private activeItems: GridItemComponent[] = [];

	// Current filter state
	private currentFilter?: ItemCategory;

	// Cached backpack data (received from server)
	private backpack: OwnedItem[] = [];

	// Components service for managing grid items
	private components!: Components;

	constructor(components: Components) {
		super();
		this.components = components;
	}

	onStart(): void {
		logger.info(`ItemGridComponent started in ${this.attributes.mode} mode`);

		// Listen for backpack sync from server
		Events.inventory.backpackSync.connect((backpack) => {
			this.backpack = backpack;
			this.refreshGrid();
		});

		// Listen for filter changes
		ClientSignals.filterGridRequest.Connect((categoryKey) => {
			this.onFilterChanged(categoryKey);
		});

		// Initial render (will be empty until backpackSync fires)
		this.refreshGrid();
	}

	/**
	 * Handle filter change from slot selection
	 */
	private onFilterChanged(categoryKey?: ItemCategory): void {
		this.currentFilter = categoryKey;
		logger.debug(`Filter changed to: ${categoryKey ?? "all"}`);
		this.refreshGrid();
	}

	/**
	 * Refresh the grid with current filter
	 */
	public refreshGrid(): void {
		// Get items based on mode
		let items: OwnedItem[];

		if (this.attributes.mode === "Inventory") {
			items = this.getFilteredInventoryItems();
		} else {
			// Catalog mode - would show purchasable items
			// For now, just show inventory
			items = this.getFilteredInventoryItems();
		}

		this.renderItems(items);
	}

	/**
	 * Get inventory items with current filter applied
	 */
	private getFilteredInventoryItems(): OwnedItem[] {
		if (!this.currentFilter) {
			// No filter - show all items
			return [...this.backpack];
		}

		// Filter by category
		return this.backpack.filter((item) => item.ItemCategory === this.currentFilter);
	}

	/**
	 * Render items to the grid using pooling
	 */
	private renderItems(items: OwnedItem[]): void {
		// Return all active items to pool
		for (const gridItem of this.activeItems) {
			gridItem.clearItem();
			gridItem.instance.Visible = false;
			this.itemPool.push(gridItem);
		}
		this.activeItems = [];

		// Render each item
		for (const item of items) {
			const gridItem = this.acquireGridItem();
			if (gridItem) {
				gridItem.setItem(item);
				gridItem.instance.Visible = true;
				this.activeItems.push(gridItem);
			}
		}

		logger.debug(`Rendered ${items.size()} items (pool size: ${this.itemPool.size()})`);
	}

	/**
	 * Get a grid item from pool or create new one
	 */
	private acquireGridItem(): GridItemComponent | undefined {
		// Try to get from pool
		const pooled = this.itemPool.pop();
		if (pooled) {
			return pooled;
		}

		// Create new instance
		const instance = createGridItemInstance();
		instance.Parent = this.instance;

		// Add the component tag so Flamework picks it up
		CollectionService.AddTag(instance, GridItemComponentTag);

		// Get the component (may need a frame for Flamework to pick it up)
		const component = this.components.getComponent<GridItemComponent>(instance);
		if (component) {
			return component;
		}

		// Component not ready yet - wait and try again
		task.defer(() => {
			const deferredComponent = this.components.getComponent<GridItemComponent>(instance);
			if (deferredComponent) {
				deferredComponent.instance.Visible = false;
				this.itemPool.push(deferredComponent);
			}
		});

		return undefined;
	}

	/**
	 * Clean up on destroy
	 */
	destroy(): void {
		// Clean up all grid items
		for (const item of this.activeItems) {
			item.instance.Destroy();
		}
		for (const item of this.itemPool) {
			item.instance.Destroy();
		}
		this.activeItems = [];
		this.itemPool = [];

		super.destroy();
	}
}
