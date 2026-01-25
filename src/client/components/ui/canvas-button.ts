import { BaseComponent, Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { createLogger } from "shared/utils";
import { ClientSignals } from "shared/network/client-network";
import { ScreenKey } from "shared/types/ui-types";

const logger = createLogger("component:CanvasButton");

const CANVAS_BUTTON_TAG = "CharacterCanvasButton";
interface CanvasButtonAttributes {
	canvasKey: string;
}
type CanvasButtonType = Frame & {
	MenuButton: ImageButton;
};

@Component({
	tag: CANVAS_BUTTON_TAG,
	defaults: {
		canvasKey: "MainCanvas",
	},
})
export class CanvasButton extends BaseComponent<CanvasButtonAttributes, CanvasButtonType> implements OnStart {
	onStart(): void {
		this.instance.MenuButton.Activated.Connect(() => {
			const key = this.attributes.canvasKey as ScreenKey;
			ClientSignals.toggleCanvasRequest.Fire(key);
			logger.info(`Fired toggleCanvasRequest for key: ${key}`);
		});
	}
}
