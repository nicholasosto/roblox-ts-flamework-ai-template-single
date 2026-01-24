import { BaseComponent, Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { GameScreenAttributes, ScreenKey } from "shared/types/ui-types";
import { createLogger } from "shared/utils";

const log = createLogger("component:GameScreen");

/**
 * GameScreen Component
 *
 * Attach this to any ScreenGui by adding the tag "GameScreen"
 * and setting the "screenKey" attribute (e.g., "Inventory", "Character")
 *
 * The UIController will automatically discover and manage these screens.
 */
@Component({ tag: "GameScreen" })
export class GameScreen extends BaseComponent<GameScreenAttributes, ScreenGui> implements OnStart {
	/** The screen key identifier */
	public readonly screenKey: ScreenKey = this.attributes.screenKey;

	/** The main content frame (first Frame child, if any) */
	public contentFrame?: Frame;

	onStart(): void {
		// Find the main content frame for animations
		this.contentFrame = this.instance.FindFirstChildOfClass("Frame");

		// Start hidden by default - UIController will manage visibility
		this.instance.Enabled = false;

		log.info(`Registered: ${this.screenKey}`);
	}

	/** Show this screen */
	show(): void {
		this.instance.Enabled = true;
		// TODO: Add tween animation here if desired
	}

	/** Hide this screen */
	hide(): void {
		this.instance.Enabled = false;
		// TODO: Add tween animation here if desired
	}

	/** Check if currently visible */
	isVisible(): boolean {
		return this.instance.Enabled;
	}
}
