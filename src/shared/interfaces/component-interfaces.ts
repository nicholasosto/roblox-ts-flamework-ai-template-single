


export type ItemGridType = ScrollingFrame & {
    UIGridLayout: UIGridLayout;
}


/* ==============================================
   Item Slot
   ============================================ */
export type ItemSlotType = Frame & {
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
