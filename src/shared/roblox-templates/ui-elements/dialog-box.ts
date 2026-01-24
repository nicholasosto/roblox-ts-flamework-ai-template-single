import { UIElementsFolder } from "../game-package";

export type DialogBox = Frame & {
	["UIStroke "]: UIStroke;
	Close: Frame & {
		UIAspectRatioConstraint: UIAspectRatioConstraint;
		UISizeConstraint: UISizeConstraint;
		ImageButton: ImageButton & {
			UICorner: UICorner;
			["UIStroke "]: UIStroke;
			Background: Frame & {
				Color2: Frame & {
					UICorner: UICorner;
				};
				Shadow: Frame & {
					UICorner: UICorner;
				};
				Color1: Frame & {
					UICorner: UICorner;
				};
			};
		};
	};
	UICorner: UICorner;
	Background: Frame & {
		Color: Frame & {
			UICorner: UICorner;
		};
		Shadow: Frame & {
			UICorner: UICorner;
		};
		Highlight: Frame & {
			UICorner: UICorner;
		};
		Gradient: Frame & {
			ImageLabel: ImageLabel & {
				UIAspectRatioConstraint: UIAspectRatioConstraint;
			};
		};
	};
	Content: Frame & {
		Body: Frame & {
			Text: Frame & {
				TextLabel: TextLabel & {
					UITextSizeConstraint: UITextSizeConstraint;
				};
			};
		};
		Header: Frame & {
			Line: Frame & {
				ImageLabel: ImageLabel;
			};
			Title: Frame & {
				Text: Frame & {
					TextLabel: TextLabel & {
						UITextSizeConstraint: UITextSizeConstraint;
						UIStroke: UIStroke;
					};
					["TextLabel - Stroke"]: TextLabel & {
						UITextSizeConstraint: UITextSizeConstraint;
					};
				};
			};
			UISizeConstraint: UISizeConstraint;
		};
		Footer: Frame & {
			UIListLayout: UIListLayout;
			TextButton1: TextButton & {
				Hover: Frame & {
					UICorner: UICorner;
				};
				["UIStroke "]: UIStroke;
				UISizeConstraint: UISizeConstraint;
				UICorner: UICorner;
				Background: Frame & {
					Shadow: Frame & {
						UICorner: UICorner;
					};
				};
			};
			UISizeConstraint: UISizeConstraint;
			TextButton2: TextButton & {
				Hover: Frame & {
					UICorner: UICorner;
				};
				["UIStroke "]: UIStroke;
				UISizeConstraint: UISizeConstraint;
				UICorner: UICorner;
				Background: Frame & {
					Shadow: Frame & {
						UICorner: UICorner;
					};
				};
			};
		};
	};
};

export const dialogBoxTemplate: DialogBox = UIElementsFolder.WaitForChild("DialogBox") as DialogBox;
export const DialogBoxComponentTag = "DialogBoxComponent";
