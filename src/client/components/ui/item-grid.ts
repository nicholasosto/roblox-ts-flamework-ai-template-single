import { BaseComponent, Component, Components } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { CollectionService } from "@rbxts/services";
import { createLogger } from "shared/utils";
import { ClientSignals } from "shared/network/client-network";
import { OwnedItem } from "shared/interfaces";
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
 * Receives items via updateGridItems signal from InventoryController.
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

	// Components service for managing grid items
	private components!: Components;

	constructor(components: Components) {
		super();
		this.components = components;
	}

	onStart(): void {
		logger.info(`ItemGridComponent started in ${this.attributes.mode} mode`);

		// Listen for item updates from InventoryController
		ClientSignals.updateGridItems.Connect((items, _filter) => {
			this.renderItems(items);
		});
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
