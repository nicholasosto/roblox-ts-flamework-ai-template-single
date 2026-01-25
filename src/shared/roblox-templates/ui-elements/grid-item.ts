import { UIElementsFolder } from "../game-package";
export type GridItemInstance = Frame & {
	UIPadding: UIPadding;
	UIListLayout: UIListLayout;
	StateStroke: UIStroke;
	DisplayName: TextLabel;
	ItemButton: ImageButton & {
		RarityStroke: UIStroke;
		EquippedLabel: TextLabel;
		Frame: Frame & {
			UICorner: UICorner;
			TextLabel: TextLabel;
		};
		LockedOverlay: ImageLabel;
		UIAspectRatioConstraint: UIAspectRatioConstraint;
		ItemIcon: ImageLabel & {
			UICorner: UICorner;
		};
	};
};

const GRID_ITEM_TEMPLATE = UIElementsFolder.WaitForChild("GridItem") as GridItemInstance;
export const GridItemComponentTag = "GridItemComponent";
export function createGridItemInstance(): GridItemInstance {
	return GRID_ITEM_TEMPLATE.Clone() as GridItemInstance;
}
