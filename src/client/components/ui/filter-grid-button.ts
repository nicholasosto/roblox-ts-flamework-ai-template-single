import { BaseComponent, Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { createLogger } from "shared/utils";
import { ClientSignals } from "shared/network/client-network";
import { ItemCategory } from "shared/interfaces";

const logger = createLogger("component:FilterGridButton");

/**
 * FilterGridButton Component
 *
 * Attach this to any ImageButton/TextButton by adding the tag "FilterGridButton"
 * and setting the "categoryKey" attribute to match an ItemCategory.
 *
 * Clicking the button will filter the item grid by the corresponding category.
 */
interface GridControlBtnAttributes {
	categoryKey: ItemCategory;
}
@Component({
	tag: "FilterGridButton",
	defaults: {
		categoryKey: "Equipment",
	},
})
export class GridFilterButton extends BaseComponent<GridControlBtnAttributes, ImageButton | TextButton> implements OnStart {
	/** The category key this button controls */

	onStart(): void {
		// Connect button click to filter grid by category
		this.instance.Activated.Connect(() => {
			const category = this.attributes.categoryKey;
			ClientSignals.setCategoryFilter.Fire(category);
		});
		logger.info(`Registered filter button for category: ${this.attributes.categoryKey}`);
	}
}
