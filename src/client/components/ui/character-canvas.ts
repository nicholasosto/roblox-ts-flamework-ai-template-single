import { Component, BaseComponent } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { createLogger } from "shared/utils";
import { ClientSignals } from "shared/network/client-network";

const logger = createLogger("component:CharacterCanvas");

interface CharacterCanvasAttributes {
	canvasKey: string;
}

@Component({
	tag: "CharacterCanvas",
	defaults: {
		canvasKey: "CharacterCanvas",
	},
})
export class CharacterCanvas extends BaseComponent<CharacterCanvasAttributes, CanvasGroup> implements OnStart {
	onStart(): void {
		this.instance.Visible = false;

		// Listen for canvas toggle requests
		ClientSignals.toggleCanvasRequest.Connect((canvasKey) => {
			this.onToggleCanvasRequest(canvasKey);
		});
	}

	private onToggleCanvasRequest(canvasKey?: string): void {
		if (canvasKey === this.attributes.canvasKey) {
			this.instance.Visible = !this.instance.Visible;
			logger.info(`Toggled CharacterCanvas visibility to: ${this.instance.Visible ? "Visible" : "Hidden"}`);
		} else {
			this.instance.Visible = false;
		}
	}
}
