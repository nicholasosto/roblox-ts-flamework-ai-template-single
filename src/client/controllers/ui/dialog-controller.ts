import { Controller, OnStart } from "@flamework/core";
import { Components } from "@flamework/components";
import { Players } from "@rbxts/services";
import { DialogBoxComponent, DialogResult } from "client/components/ui/dialog-box";
import { dialogBoxTemplate, DialogBoxComponentTag } from "shared/roblox-templates/ui-elements";
import { Events } from "shared/network/client-network";
import { createLogger } from "shared/utils";

const log = createLogger("controller:Dialog");

/**
 * DialogController
 *
 * Centralized manager for showing dialogs to the player.
 *
 * Usage:
 * ```ts
 * // Simple message
 * const result = await dialogController.message("Welcome!", "Thanks for playing!");
 *
 * // Confirmation dialog
 * const result = await dialogController.confirm("Delete?", "Are you sure?");
 * if (result === "primary") { // User confirmed }
 * ```
 */
@Controller({})
export class DialogController implements OnStart {
	/** The active dialog component */
	private dialogComponent?: DialogBoxComponent;

	constructor(private components: Components) {}

	onStart(): void {
		log.info("DialogController starting...");

		task.defer(() => {
			this.initializeDialogBox();
			this.bindNetworkEvents();
			log.info("DialogController ready");
		});
	}

	/* ================================================================
	   Public API
	   ================================================================ */

	/**
	 * Show a simple message dialog with an OK button.
	 * @param title Dialog title
	 * @param message Dialog message
	 * @param autoCloseDuration Optional auto-close duration in seconds (0 = no auto-close)
	 */
	message(title: string, message: string, autoCloseDuration = 0): Promise<DialogResult> {
		return this.showDialog(title, message, "message", false, autoCloseDuration);
	}

	/**
	 * Show a confirmation dialog with Confirm/Cancel buttons.
	 */
	confirm(title: string, message: string): Promise<DialogResult> {
		return this.showDialog(title, message, "confirmation", true);
	}

	/**
	 * Show a warning dialog.
	 */
	warning(title: string, message: string): Promise<DialogResult> {
		return this.showDialog(title, message, "warning", false);
	}

	/**
	 * Show an error dialog.
	 */
	error(title: string, message: string): Promise<DialogResult> {
		return this.showDialog(title, message, "error", false);
	}

	/* ================================================================
	   Private Methods
	   ================================================================ */

	private showDialog(
		title: string,
		message: string,
		dialogType: string,
		showSecondary: boolean,
		autoCloseDuration = 0,
	): Promise<DialogResult> {
		if (!this.dialogComponent) {
			log.warn("Dialog component not ready");
			return Promise.resolve("closed" as DialogResult);
		}

		// Update the component's instance attributes
		const instance = this.dialogComponent.instance;
		instance.SetAttribute("title", title);
		instance.SetAttribute("message", message);
		instance.SetAttribute("dialogType", dialogType);
		instance.SetAttribute("showSecondaryButton", showSecondary);
		instance.SetAttribute("autoCloseDuration", autoCloseDuration);

		if (dialogType === "confirmation") {
			instance.SetAttribute("primaryButtonText", "Confirm");
			instance.SetAttribute("secondaryButtonText", "Cancel");
		} else {
			instance.SetAttribute("primaryButtonText", "OK");
		}

		// Show the dialog
		return this.dialogComponent.showWithText(title, message);
	}

	private initializeDialogBox(): void {
		const player = Players.LocalPlayer;
		const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;

		log.info("Initializing dialog box...");

		// Check if dialog already exists
		let dialogScreen = playerGui.FindFirstChild("DialogScreen") as ScreenGui | undefined;

		if (!dialogScreen) {
			log.info("Creating new DialogScreen...");

			// Create ScreenGui for dialog
			dialogScreen = new Instance("ScreenGui");
			dialogScreen.Name = "DialogScreen";
			dialogScreen.ResetOnSpawn = false;
			dialogScreen.DisplayOrder = 100; // Above most UI
			dialogScreen.IgnoreGuiInset = true;
			dialogScreen.ZIndexBehavior = Enum.ZIndexBehavior.Sibling; // Important for layering!
			dialogScreen.Parent = playerGui;

			// Clone the dialog template
			log.info("Cloning dialog template...");
			const dialogBox = dialogBoxTemplate.Clone();
			dialogBox.Name = "DialogBox";
			dialogBox.AnchorPoint = new Vector2(0.5, 0.5);
			dialogBox.Position = new UDim2(0.5, 0, 0.5, 0);

			// Add component tag - this triggers Flamework to create the component
			dialogBox.AddTag(DialogBoxComponentTag);
			dialogBox.Parent = dialogScreen;

			log.info("Dialog box created and tagged");
		}

		// Wait for Flamework to create the component, then grab reference
		task.defer(() => {
			task.wait(0.1); // Give Flamework time to create component

			const dialogBox = dialogScreen!.FindFirstChild("DialogBox");
			if (dialogBox) {
				log.info("Found DialogBox instance, getting component...");

				const component = this.components.getComponent<DialogBoxComponent>(dialogBox);
				if (component) {
					this.dialogComponent = component;
					log.info("✓ Dialog component linked successfully");
				} else {
					log.warn("✗ Failed to get DialogBoxComponent from instance");
				}
			} else {
				log.warn("✗ DialogBox instance not found in DialogScreen");
			}
		});
	}

	private bindNetworkEvents(): void {
		// Listen for server notification events using centralized Events
		Events.notification.show.connect((message, _duration) => {
			this.message("Server Message", message);
		});

		log.info("Network events bound");
	}
}
