import { Controller, OnStart } from "@flamework/core";
import { RunService, UserInputService } from "@rbxts/services";
import { DialogController } from "./dialog-controller";
import { DialogResult } from "client/components/ui/dialog-box";
import { createLogger } from "shared/utils";

const log = createLogger("controller:DialogTest");

/**
 * Enable/disable test controller.
 * Set to false in production builds.
 */
const DEBUG_ENABLED = RunService.IsStudio();

/**
 * DialogTestController
 *
 * Test controller for the dialog system.
 * Only active in Studio (DEBUG_ENABLED = true).
 *
 * Keybinds:
 * - P: Confirmation dialog
 * - O: Message dialog (auto-close)
 * - I: Warning dialog
 * - U: Error dialog
 * - Y: Test all types
 * - T: Queue multiple dialogs
 */
@Controller({})
export class DialogTestController implements OnStart {
	constructor(private dialogController: DialogController) {}

	onStart(): void {
		// Skip initialization if debug is disabled
		if (!DEBUG_ENABLED) {
			log.info("DialogTestController disabled (not in Studio)");
			return;
		}

		log.info("DialogTestController ready - Press P, O, I, U, Y, T to test dialogs");

		UserInputService.InputBegan.Connect((input, gameProcessed) => {
			if (gameProcessed) return;

			if (input.KeyCode === Enum.KeyCode.P) {
				this.testConfirmation();
			} else if (input.KeyCode === Enum.KeyCode.O) {
				this.testMessage();
			} else if (input.KeyCode === Enum.KeyCode.I) {
				this.testWarning();
			} else if (input.KeyCode === Enum.KeyCode.U) {
				this.testError();
			} else if (input.KeyCode === Enum.KeyCode.Y) {
				this.testAllTypes();
			} else if (input.KeyCode === Enum.KeyCode.T) {
				this.testQueue();
			}
		});
	}

	private testConfirmation(): void {
		log.info("Testing confirmation dialog...");

		this.dialogController
			.confirm(
				"Delete Item?",
				"Are you sure you want to delete this item? This cannot be undone.",
			)
			.then((result: DialogResult) => {
				log.info(`Confirmation result: ${result}`);
				if (result === "primary") {
					print("✅ User confirmed!");
				} else {
					print("❌ User cancelled or closed");
				}
			});
	}

	private testMessage(): void {
		log.info("Testing message dialog (auto-close in 3s)...");

		this.dialogController
			.message(
				"Welcome!",
				"Thanks for playing our game! This dialog will close automatically.",
				3,
			)
			.then((result: DialogResult) => {
				log.info(`Message result: ${result}`);
			});
	}

	private testWarning(): void {
		log.info("Testing warning dialog...");

		this.dialogController
			.warning("Low Health!", "Your health is critically low. Find a healing station nearby!")
			.then((result: DialogResult) => {
				log.info(`Warning result: ${result}`);
			});
	}

	private testError(): void {
		log.info("Testing error dialog...");

		this.dialogController
			.error(
				"Connection Failed",
				"Unable to connect to the server. Please check your internet connection and try again.",
			)
			.then((result: DialogResult) => {
				log.info(`Error result: ${result}`);
			});
	}

	private testAllTypes(): void {
		log.info("Testing all dialog types in sequence...");

		this.dialogController
			.message("Message", "This is a standard message.")
			.then(() => {
				return this.dialogController.warning("Warning", "This is a warning!");
			})
			.then(() => {
				return this.dialogController.error("Error", "This is an error!");
			})
			.then(() => {
				return this.dialogController.confirm("Confirm", "Did you see all dialog types?");
			})
			.then((result: DialogResult) => {
				log.info(`All types test complete. Final result: ${result}`);
			});
	}

	private testQueue(): void {
		log.info("Testing dialog queue (3 dialogs)...");

		// Fire all three - they should queue up
		this.dialogController.message("First Dialog", "This is dialog 1 of 3").then(() => {
			print("Dialog 1 closed");
		});

		this.dialogController.message("Second Dialog", "This is dialog 2 of 3").then(() => {
			print("Dialog 2 closed");
		});

		this.dialogController.message("Third Dialog", "This is dialog 3 of 3").then(() => {
			print("Dialog 3 closed - Queue test complete!");
		});
	}
}
