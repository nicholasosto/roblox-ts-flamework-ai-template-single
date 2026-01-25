import { BaseComponent, Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { createLogger } from "shared/utils";
import { ClientSignals } from "../../../shared/network/client-network";
import { ItemCategory } from "../../../shared/interfaces";

const logger = createLogger("component:ItemGrid");

export interface ItemGridAttributes {
	mode: "Inventory" | "Catalog";
}

@Component({
	tag: "ItemGrid",
	defaults: {
		mode: "Inventory",
	},
})
export class ItemGridComponent extends BaseComponent<ItemGridAttributes, ScrollingFrame> implements OnStart {
	onStart(): void {
		logger.info(`ItemGridComponent started in ${this.attributes.mode} mode.`);
		ClientSignals.filterGridRequest.Connect((categoryKey) => {
			this.filterGridByCategory(categoryKey);
		});
	}
	filterGridByCategory(categoryKey?: ItemCategory): void {
		if (!categoryKey) {
			logger.info("Clearing item grid filter.");
			// Implementation for clearing the filter goes here
			return;
		}
		logger.info(`Filtering item grid by category: ${categoryKey}`);
		// Implementation for filtering the item grid goes here
	}
}
