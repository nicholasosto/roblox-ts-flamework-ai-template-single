import { BaseComponent, Component } from "@flamework/components";
import { OnRender, OnStart } from "@flamework/core";
import { createLogger } from "shared/utils";
import { getCatalogEntryById } from "shared/catalogs";
import { RARITY_COLORS, OwnedItem, AbilityCatalogEntry, SlotKey } from "shared/interfaces";
import { ClientSignals } from "shared/network/client-network";

const logger = createLogger("component:ItemSlotComponent");
type ItemSlotType = Frame & {
	QuantityBadge: Frame & {
		UICorner: UICorner;
		QuantityLabel: TextLabel & {
			UIStroke: UIStroke;
		};
	};
	CooldownBar: Frame & {
		UICorner: UICorner;
		FillFrame: Frame & {
			UICorner: UICorner;
			UIGradient: UIGradient;
		};
		CooldownLabel: TextLabel;
	};
	SlotButton: ImageButton & {
		DisabledOverlay: Frame & {
			UICorner: UICorner;
		};
		LockOverlay: ImageLabel & {
			UICorner: UICorner;
		};
		UICorner: UICorner;
		UIStroke: UIStroke;
		UIAspectRatioConstraint: UIAspectRatioConstraint;
		ItemIcon: ImageLabel & {
			UICorner: UICorner;
		};
	};
};

export interface ItemSlotAttributes {
	slotMode: "Activate" | "Select";
	slotKey: SlotKey;
	catalogId?: string;
	itemId?: string;
	quantity: number;
	isLocked: boolean;
	isDisabled: boolean;
	isSelected: boolean;
}

const EMPTY_SLOT_ICON = "rbxassetid://420";
const DEFAULT_STROKE_COLOR = Color3.fromRGB(60, 60, 60);

@Component({
	tag: "ItemSlotComponent",
	defaults: {
		slotMode: "Select",
		slotKey: "HeadSlot",
		catalogId: "demonic_halo",
		quantity: 1,
		isLocked: false,
		isDisabled: false,
		isSelected: false,
	},
})
export class ItemSlotComponent extends BaseComponent<ItemSlotAttributes, ItemSlotType> implements OnStart, OnRender {
	// Cooldown state
	private cooldownEndTime = 0;
	private cooldownDuration = 0;

	onStart(): void {
		// Slot activation
		this.instance.SlotButton.Activated.Connect(() => this.handleActivation());

		// Initial render
		this.render();
	}

	/** Flamework render loop - smooth cooldown animation at 60fps */
	onRender(): void {
		while (this.isOnCooldown()) {
			const now = os.clock();
			const timeLeft = this.cooldownEndTime - now;
			const progress = math.clamp(timeLeft / this.cooldownDuration, 0, 1);

			// Update cooldown bar UI
			this.instance.CooldownBar.FillFrame.Size = new UDim2(1 - progress, 0, 1, 0);
			this.instance.CooldownBar.CooldownLabel.Text = tostring(math.ceil(timeLeft * 10) / 10);

			// Yield until next frame
			task.wait();
		}
		this.resetCooldown();
	}

	/** Cleanup handled automatically by BaseComponent's destroy() */

	private isOnCooldown(): boolean {
		return this.cooldownEndTime > os.clock();
	}

	public setItem(item: OwnedItem): void {
		logger.debug(`Setting item in slot ${this.attributes.slotKey}: ${item.UUID}`);
		this.attributes.itemId = item.UUID;
		this.attributes.catalogId = item.CatalogId;
		this.attributes.quantity = item.Qty;
		this.render();
	}

	public clearItem(): void {
		logger.debug(`Clearing item from slot ${this.attributes.slotKey}`);
		this.attributes.catalogId = undefined;
		this.attributes.itemId = undefined;
		this.attributes.quantity = 0;
		this.render();
	}

	/** Full UI refresh based on catalogId */
	private render(): void {
		const catalogItem = getCatalogEntryById(this.attributes.catalogId ?? "");
		const btn = this.instance.SlotButton;

		// Update icon and stroke - use empty/default when no catalog item
		btn.ItemIcon.Image = catalogItem?.IconId ?? EMPTY_SLOT_ICON;
		btn.UIStroke.Color = catalogItem ? (RARITY_COLORS[catalogItem.Rarity] ?? DEFAULT_STROKE_COLOR) : DEFAULT_STROKE_COLOR;

		this.renderSelectedState();
		this.renderQuantity();
		this.renderLockState();
		this.renderDisabledState();
		this.resetCooldown();
	}

	private renderQuantity(): void {
		const badge = this.instance.QuantityBadge;
		badge.Visible = this.attributes.quantity > 1;
		badge.QuantityLabel.Text = tostring(this.attributes.quantity);
	}

	private renderLockState(): void {
		this.instance.SlotButton.LockOverlay.Visible = this.attributes.isLocked;
	}

	private renderDisabledState(): void {
		this.instance.SlotButton.DisabledOverlay.Visible = this.attributes.isDisabled;
	}

	private renderSelectedState(): void {
		const catalogItem = getCatalogEntryById(this.attributes.catalogId ?? "");
		const baseColor = catalogItem ? (RARITY_COLORS[catalogItem.Rarity] ?? DEFAULT_STROKE_COLOR) : DEFAULT_STROKE_COLOR;

		// Selected: gold highlight, unselected: rarity color or default
		const SELECTED_COLOR = Color3.fromRGB(255, 215, 0); // Gold
		this.instance.SlotButton.UIStroke.Color = this.attributes.isSelected ? SELECTED_COLOR : baseColor;
		this.instance.SlotButton.UIStroke.Thickness = this.attributes.isSelected ? 4 : 2;
		//logger.debug(`Slot ${this.attributes.slotKey} selection state: ${this.attributes.isSelected}`);
	}

	/** Public method to set selection state */
	public setSelected(selected: boolean): void {
		this.attributes.isSelected = selected;
	}

	private resetCooldown(): void {
		this.cooldownEndTime = 0;
		this.cooldownDuration = 0;
		this.instance.CooldownBar.Visible = false;
		this.attributes.isDisabled = false;
		this.instance.CooldownBar.FillFrame.Size = new UDim2(1, 0, 1, 0);
		this.instance.CooldownBar.CooldownLabel.Text = "";
	}

	/** Handle slot activation with cooldown support */
	private handleActivation(): void {
		const { slotKey, catalogId, isLocked, isDisabled } = this.attributes;

		if (isLocked || isDisabled || this.isOnCooldown()) {
			logger.warn(`Slot ${slotKey} blocked: locked=${isLocked}, disabled=${isDisabled}, cooldown=${this.isOnCooldown()}`);
			return;
		}

		logger.debug(`Slot activated: ${slotKey} (${catalogId ?? "empty"})`);

		// Fire the signal - different behavior based on mode
		if (this.attributes.slotMode === "Select") {
			ClientSignals.itemSlotSelected.Fire(this.attributes.slotKey);
			return;
		} else if (this.attributes.slotMode === "Activate") {
			ClientSignals.itemUseRequest.Fire(this.attributes.catalogId ?? "");
		}

		// Start cooldown if ability has one
		const entry = catalogId ? getCatalogEntryById(catalogId) : undefined;
		if (entry && "Cooldown" in entry) {
			this.startCooldown((entry as AbilityCatalogEntry).Cooldown ?? 0);
		}
	}

	/** Initialize cooldown - animation handled by onRender */
	private startCooldown(duration: number): void {
		if (duration <= 0) return;

		this.cooldownDuration = duration;
		this.cooldownEndTime = os.clock() + duration;
		this.attributes.isDisabled = true;
		this.instance.CooldownBar.Visible = true;
	}
}
