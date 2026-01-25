import { BaseComponent, Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { createLogger } from "shared/utils";
import { getCatalogEntryById } from "shared/catalogs";
import { RARITY_COLORS, OwnedItem } from "shared/interfaces";
import { ClientSignals } from "shared/network/client-network";
import { GridItemInstance, GridItemComponentTag } from "shared/roblox-templates/ui-elements/grid-item";

const logger = createLogger("component:GridItem");

const EMPTY_ICON = "rbxassetid://420";
const DEFAULT_STROKE_COLOR = Color3.fromRGB(60, 60, 60);
const SELECTED_STROKE_COLOR = Color3.fromRGB(255, 215, 0); // Gold

export interface GridItemAttributes {
	itemId: string;
	catalogId: string;
	quantity: number;
	isEquipped: boolean;
	isLocked: boolean;
	isSelected: boolean;
}

/**
 * GridItemComponent
 *
 * Represents a single item in the inventory grid.
 * Shows item icon, rarity border, quantity, equipped status, and locked state.
 * Clicking fires itemSelected signal for the InventoryController to handle.
 */
@Component({
	tag: GridItemComponentTag,
	defaults: {
		itemId: "",
		catalogId: "",
		quantity: 1,
		isEquipped: false,
		isLocked: false,
		isSelected: false,
	},
})
export class GridItemComponent extends BaseComponent<GridItemAttributes, GridItemInstance> implements OnStart {
	onStart(): void {
		// Reactive attribute bindings
		this.onAttributeChanged("catalogId", () => this.render());
		this.onAttributeChanged("isEquipped", () => this.renderEquippedState());
		this.onAttributeChanged("isSelected", () => this.renderSelectedState());
		this.onAttributeChanged("isLocked", () => this.renderLockedState());
		this.onAttributeChanged("quantity", () => this.renderQuantity());

		// Click handler - fires itemSelected signal
		this.instance.ItemButton.Activated.Connect(() => this.handleClick());

		// Initial render
		this.render();
	}

	/**
	 * Set item data from an OwnedItem
	 */
	public setItem(item: OwnedItem): void {
		this.attributes.itemId = item.UUID;
		this.attributes.catalogId = item.CatalogId;
		this.attributes.quantity = item.Qty;
		this.attributes.isEquipped = item.CurrentSlotKey !== "Backpack";
		this.render();
	}

	/**
	 * Clear item data (for pooling/reuse)
	 */
	public clearItem(): void {
		this.attributes.itemId = "";
		this.attributes.catalogId = "";
		this.attributes.quantity = 0;
		this.attributes.isEquipped = false;
		this.attributes.isSelected = false;
		this.render();
	}

	/**
	 * Set selection state
	 */
	public setSelected(selected: boolean): void {
		this.attributes.isSelected = selected;
	}

	/**
	 * Full render based on current attributes
	 */
	private render(): void {
		const catalogEntry = getCatalogEntryById(this.attributes.catalogId);
		const btn = this.instance.ItemButton;

		// Update icon
		btn.ItemIcon.Image = catalogEntry?.IconId ?? EMPTY_ICON;

		// Update display name
		this.instance.DisplayName.Text = catalogEntry?.DisplayName ?? "";

		// Update rarity stroke color
		const rarityColor = catalogEntry ? (RARITY_COLORS[catalogEntry.Rarity] ?? DEFAULT_STROKE_COLOR) : DEFAULT_STROKE_COLOR;
		btn.RarityStroke.Color = rarityColor;

		// Render sub-states
		this.renderEquippedState();
		this.renderSelectedState();
		this.renderLockedState();
		this.renderQuantity();
	}

	private renderEquippedState(): void {
		this.instance.ItemButton.EquippedLabel.Visible = this.attributes.isEquipped;
	}

	private renderSelectedState(): void {
		const catalogEntry = getCatalogEntryById(this.attributes.catalogId);
		const baseColor = catalogEntry ? (RARITY_COLORS[catalogEntry.Rarity] ?? DEFAULT_STROKE_COLOR) : DEFAULT_STROKE_COLOR;

		// StateStroke shows selection - gold when selected, transparent when not
		this.instance.StateStroke.Color = this.attributes.isSelected ? SELECTED_STROKE_COLOR : baseColor;
		this.instance.StateStroke.Thickness = this.attributes.isSelected ? 3 : 0;
	}

	private renderLockedState(): void {
		this.instance.ItemButton.LockedOverlay.Visible = this.attributes.isLocked;
	}

	private renderQuantity(): void {
		const qtyFrame = this.instance.ItemButton.Frame;
		qtyFrame.Visible = this.attributes.quantity > 1;
		qtyFrame.TextLabel.Text = tostring(this.attributes.quantity);
	}

	private handleClick(): void {
		if (this.attributes.isLocked) {
			logger.debug(`Grid item locked: ${this.attributes.catalogId}`);
			return;
		}

		if (!this.attributes.itemId) {
			logger.debug("Grid item clicked but no itemId set");
			return;
		}

		logger.debug(`Grid item clicked: ${this.attributes.itemId} (${this.attributes.catalogId})`);
		ClientSignals.itemSelected.Fire(this.attributes.itemId);
	}
}
