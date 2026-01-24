import { BaseComponent, Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { ScreenButtonAttributes, ScreenKey } from "shared/types/ui-types";
import { UIController } from "client/controllers/ui/ui-controller";
import { createLogger } from "shared/utils";

const log = createLogger("component:ScreenButton");

/**
 * ScreenButton Component
 *
 * Attach this to any ImageButton/TextButton by adding the tag "ScreenButton"
 * and setting the "screenKey" attribute to match a GameScreen.
 *
 * Clicking the button will toggle the corresponding screen.
 */
@Component({ tag: "ScreenButton" })
export class ScreenButton
	extends BaseComponent<ScreenButtonAttributes, ImageButton | TextButton>
	implements OnStart
{
	/** The screen key this button controls */
	public readonly screenKey: ScreenKey = this.attributes.screenKey;

	constructor(private uiController: UIController) {
		super();
	}

	onStart(): void {
		// Connect button click to toggle screen
		this.instance.Activated.Connect(() => {
			this.uiController.toggleScreen(this.screenKey);
		});

		log.info(`Registered: ${this.screenKey}`);
	}
}
