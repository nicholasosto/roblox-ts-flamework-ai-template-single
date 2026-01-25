import { Controller, OnStart } from "@flamework/core";
import { Components } from "@flamework/components";
import { createLogger } from "shared/utils";
import { ScreenKey } from "../../../shared/types";
import { ClientSignals } from "../../../shared/network/client-network";
import { GameScreen } from "../../components/ui";

const logger = createLogger("Controller:UI");

@Controller({})
export class UIController implements OnStart {
	constructor(private components: Components) {}
	onStart(): void {
		// Register client signals
		this.registerClientSignals();
		logger.info("UIController started.");
	}

	private registerClientSignals(): void {
		// Toggle screen request
		ClientSignals.toggleScreenRequest.Connect((screenName?: ScreenKey) => this.onToggleScreenRequest(screenName));
	}

	private onToggleScreenRequest(screenName?: ScreenKey): void {
		this.components.getAllComponents<GameScreen>().mapFiltered((screen) => {
			if (screenName !== screen.screenKey) {
				screen.hide();
			} else {
				if (screen.isVisible()) {
					screen.hide();
				} else {
					screen.show();
				}
			}
		});
	}
}
