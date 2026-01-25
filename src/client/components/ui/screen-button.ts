import { BaseComponent, Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { ScreenKey } from "shared/types/ui-types";
import { createLogger } from "shared/utils";
import { ClientSignals } from "../../../shared/network/client-network";

const log = createLogger("component:ScreenButton");

/**
 * ScreenButton Component
 *
 * Attach this to any ImageButton/TextButton by adding the tag "ScreenButton"
 * and setting the "screenKey" attribute to match a GameScreen.
 *
 * Clicking the button will toggle the corresponding screen.
 */
interface ScreenButtonAttributes {
	screenKey: ScreenKey;
}
@Component({
	tag: "ScreenButton",
	defaults: {
		screenKey: "Inventory",
	},
})
export class ScreenButton
	extends BaseComponent<ScreenButtonAttributes, ImageButton | TextButton>
	implements OnStart
{
	/** The screen key this button controls */
	public readonly screenKey: ScreenKey = this.attributes.screenKey;

	onStart(): void {
		// Connect button click to toggle screen
		this.instance.Activated.Connect(() => {
			const key = this.attributes.screenKey as ScreenKey;
			ClientSignals.toggleScreenRequest.Fire(key);
		});

		log.info(`Registered: ${this.screenKey}`);
	}
}
