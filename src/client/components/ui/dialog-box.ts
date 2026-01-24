import { BaseComponent, Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import {
	DialogBox as DialogBoxType,
	DialogBoxComponentTag,
} from "shared/roblox-templates/ui-elements";
import { createLogger } from "shared/utils";

const log = createLogger("component:DialogBox");

/* ================================================================
   PART 1: ATTRIBUTES
   
   Attributes are values stored on the Roblox instance that can be
   read/written at runtime. Flamework automatically syncs them.
   ================================================================ */

/**
 * Attributes interface - defines what can be configured via instance attributes.
 * These are read from the Roblox instance's Attributes property.
 */
export interface DialogBoxAttributes {
	/** The title text displayed in the header */
	title: string;
	/** The message text displayed in the body */
	message: string;
	/** Dialog style: "confirmation" | "message" | "warning" | "error" */
	dialogType: string;
	/** Text for the primary (right) button */
	primaryButtonText: string;
	/** Text for the secondary (left) button */
	secondaryButtonText: string;
	/** Whether to show the secondary button */
	showSecondaryButton: boolean;
	/** Auto-close duration in seconds (0 = no auto-close) */
	autoCloseDuration: number;
}

/**
 * Default attribute values - Flamework uses these when attributes aren't set on the instance.
 * This ensures the component always has valid values to work with.
 */
const DEFAULT_ATTRIBUTES: DialogBoxAttributes = {
	title: "Dialog Title",
	message: "Dialog message goes here.",
	dialogType: "message",
	primaryButtonText: "OK",
	secondaryButtonText: "Cancel",
	showSecondaryButton: false,
	autoCloseDuration: 0,
};

/* ================================================================
   PART 2: TYPES
   
   Additional types used by the component.
   ================================================================ */

/** Result returned when dialog closes */
export type DialogResult = "primary" | "secondary" | "closed" | "timeout";

/** Color schemes for different dialog types */
const DIALOG_COLORS: Record<string, Color3> = {
	confirmation: Color3.fromRGB(70, 130, 180), // Steel blue
	message: Color3.fromRGB(100, 149, 237), // Cornflower blue
	warning: Color3.fromRGB(255, 193, 7), // Amber
	error: Color3.fromRGB(220, 53, 69), // Red
};

/* ================================================================
   PART 3: COMPONENT DEFINITION
   
   The @Component decorator links this class to instances with the tag.
   BaseComponent<Attributes, InstanceType> provides:
   - this.instance: The Roblox instance
   - this.attributes: The typed attributes
   ================================================================ */

@Component({
	tag: DialogBoxComponentTag,
	defaults: DEFAULT_ATTRIBUTES as unknown as { [key: string]: unknown },
})
export class DialogBoxComponent
	extends BaseComponent<DialogBoxAttributes, DialogBoxType>
	implements OnStart
{
	/* ================================================================
	   PART 4: PRIVATE STATE
	   
	   Internal state that doesn't need to be attributes.
	   ================================================================ */

	/** Promise resolver for dialog result */
	private resultResolver?: (result: DialogResult) => void;

	/** Auto-close thread reference */
	private autoCloseThread?: thread;

	/** Button click connections - we need to clean these up */
	private connections: RBXScriptConnection[] = [];

	/* ================================================================
	   PART 5: LIFECYCLE - onStart
	   
	   Called once when the component is created (instance gets tagged).
	   Use this for initial setup.
	   ================================================================ */

	onStart(): void {
		log.info(`DialogBox component starting on: ${this.instance.Name}`);

		// Debug: Print the actual structure
		this.debugPrintStructure();

		// Log the attributes we received (defaults or from instance)
		log.info(`Attributes received:`);
		log.info(`  title: "${this.attributes.title}"`);
		log.info(`  message: "${this.attributes.message}"`);
		log.info(`  dialogType: "${this.attributes.dialogType}"`);

		// Start hidden
		this.instance.Visible = false;

		// Setup button click handlers
		this.setupButtons();

		// Apply initial configuration from attributes
		this.applyAttributesToUI();

		log.info("DialogBox component ready");
	}

	/** Debug helper to print the actual structure */
	private debugPrintStructure(): void {
		log.info("=== DEBUG: Dialog Structure ===");

		const content = this.instance.FindFirstChild("Content");
		log.info(`Content found: ${content !== undefined}`);

		if (content) {
			for (const child of content.GetChildren()) {
				log.info(`  Content/${child.Name} (${child.ClassName})`);
				if (child.IsA("Frame")) {
					for (const grandchild of child.GetChildren()) {
						log.info(
							`    Content/${child.Name}/${grandchild.Name} (${grandchild.ClassName})`,
						);
					}
				}
			}
		}

		// Check specific paths
		const headerTitle = this.instance.Content?.Header?.Title;
		log.info(`Header/Title found: ${headerTitle !== undefined}`);

		const titleText = this.instance.Content?.Header?.Title?.Text;
		log.info(`Header/Title/Text found: ${titleText !== undefined}`);

		const titleLabel = this.instance.Content?.Header?.Title?.Text?.TextLabel;
		log.info(`Header/Title/Text/TextLabel found: ${titleLabel !== undefined}`);

		if (titleLabel) {
			log.info(`  TextLabel.Text = "${titleLabel.Text}"`);
			log.info(`  TextLabel.Visible = ${titleLabel.Visible}`);
			log.info(`  TextLabel.TextTransparency = ${titleLabel.TextTransparency}`);
			log.info(`  TextLabel.TextColor3 = ${titleLabel.TextColor3}`);
		}

		const bodyLabel = this.instance.Content?.Body?.Text?.TextLabel;
		log.info(`Body/Text/TextLabel found: ${bodyLabel !== undefined}`);

		const footer = this.instance.Content?.Footer;
		log.info(`Footer found: ${footer !== undefined}`);
		if (footer) {
			log.info(`  TextButton1 found: ${footer.FindFirstChild("TextButton1") !== undefined}`);
			log.info(`  TextButton2 found: ${footer.FindFirstChild("TextButton2") !== undefined}`);
		}

		log.info("=== END DEBUG ===");
	}

	/* ================================================================
	   PART 6: PUBLIC API
	   
	   Methods that can be called from outside (e.g., from a Controller).
	   ================================================================ */

	/**
	 * Show the dialog and wait for user interaction.
	 * Uses the current attributes for configuration.
	 * @returns Promise that resolves with the user's choice
	 */
	show(): Promise<DialogResult> {
		log.info("show() called");

		// Cancel any existing dialog
		if (this.resultResolver) {
			this.resultResolver("closed");
			this.resultResolver = undefined;
		}

		// Re-apply attributes in case they changed
		this.applyAttributesToUI();

		// Make visible
		this.instance.Visible = true;
		log.info("Dialog is now visible");

		// Setup auto-close if duration > 0
		const duration = this.attributes.autoCloseDuration;
		if (duration > 0) {
			this.setupAutoClose(duration);
		}

		// Return promise that resolves when user makes a choice
		return new Promise((resolve) => {
			this.resultResolver = resolve;
		});
	}

	/**
	 * Show the dialog with custom text (overrides attributes temporarily).
	 * Useful when you want to reuse the same dialog for different messages.
	 */
	showWithText(title: string, message: string): Promise<DialogResult> {
		log.info(`showWithText() called: title="${title}", message="${message}"`);

		// Cancel any existing dialog
		if (this.resultResolver) {
			this.resultResolver("closed");
			this.resultResolver = undefined;
		}

		// Update the TextLabels directly (doesn't change attributes)
		this.setTitle(title);
		this.setMessage(message);

		// Apply other settings from attributes
		this.setPrimaryButtonText(this.attributes.primaryButtonText);
		this.setSecondaryButtonText(this.attributes.secondaryButtonText);
		this.setSecondaryButtonVisible(this.attributes.showSecondaryButton);
		this.applyColorScheme(this.attributes.dialogType);

		// Make visible
		this.instance.Visible = true;
		log.info("Dialog is now visible");

		// Return promise
		return new Promise((resolve) => {
			this.resultResolver = resolve;
		});
	}

	/**
	 * Hide the dialog programmatically.
	 */
	hide(): void {
		this.close("closed");
	}

	/**
	 * Check if dialog is currently visible.
	 */
	isVisible(): boolean {
		return this.instance.Visible;
	}

	/* ================================================================
	   PART 7: PRIVATE - Apply Attributes to UI
	   
	   These methods update the Roblox UI elements based on attributes.
	   ================================================================ */

	private applyAttributesToUI(): void {
		log.info("Applying attributes to UI...");

		this.setTitle(this.attributes.title);
		this.setMessage(this.attributes.message);
		this.setPrimaryButtonText(this.attributes.primaryButtonText);
		this.setSecondaryButtonText(this.attributes.secondaryButtonText);
		this.setSecondaryButtonVisible(this.attributes.showSecondaryButton);
		this.applyColorScheme(this.attributes.dialogType);

		log.info("Attributes applied");
	}

	/* ================================================================
	   PART 8: PRIVATE - UI Setters
	   
	   Safe methods to set values on UI elements with null checks.
	   ================================================================ */

	private setTitle(text: string): void {
		// Path: Content > Header > Title > Text > TextLabel
		const titleLabel = this.instance.Content?.Header?.Title?.Text?.TextLabel;
		if (titleLabel) {
			titleLabel.Text = text;
			log.info(`✓ Set title: "${text}"`);
		} else {
			log.warn("✗ Title TextLabel not found");
		}

		// Also set stroke label if it exists (for text outline effect)
		const strokeLabel = this.instance.Content?.Header?.Title?.Text?.["TextLabel - Stroke"];
		if (strokeLabel) {
			strokeLabel.Text = text;
		}
	}

	private setMessage(text: string): void {
		// Path: Content > Body > Text > TextLabel
		const bodyLabel = this.instance.Content?.Body?.Text?.TextLabel;
		if (bodyLabel) {
			bodyLabel.Text = text;
			log.info(`✓ Set message: "${text}"`);
		} else {
			log.warn("✗ Body TextLabel not found");
		}
	}

	private setPrimaryButtonText(text: string): void {
		// Primary button is TextButton2 (right side)
		const button = this.instance.Content?.Footer?.TextButton2;
		if (button) {
			button.Text = text;
			log.info(`✓ Set primary button: "${text}"`);
		} else {
			log.warn("✗ Primary button (TextButton2) not found");
		}
	}

	private setSecondaryButtonText(text: string): void {
		// Secondary button is TextButton1 (left side)
		const button = this.instance.Content?.Footer?.TextButton1;
		if (button) {
			button.Text = text;
			log.info(`✓ Set secondary button: "${text}"`);
		} else {
			log.warn("✗ Secondary button (TextButton1) not found");
		}
	}

	private setSecondaryButtonVisible(visible: boolean): void {
		const button = this.instance.Content?.Footer?.TextButton1;
		if (button) {
			button.Visible = visible;
			log.info(`✓ Secondary button visible: ${visible}`);
		}
	}

	private applyColorScheme(dialogType: string): void {
		const color = DIALOG_COLORS[dialogType] ?? DIALOG_COLORS.message;

		// Apply to header line accent
		const headerLine = this.instance.Content?.Header?.Line?.ImageLabel;
		if (headerLine) {
			headerLine.ImageColor3 = color;
		}

		// Apply to main stroke (note: key has trailing space in template)
		const mainStroke = this.instance["UIStroke "];
		if (mainStroke) {
			mainStroke.Color = color;
		}

		log.info(`✓ Applied color scheme: ${dialogType}`);
	}

	/* ================================================================
	   PART 9: PRIVATE - Button Setup
	   
	   Connect button click events. Store connections for cleanup.
	   ================================================================ */

	private setupButtons(): void {
		log.info("Setting up button connections...");

		// Close button (X in corner)
		const closeButton = this.instance.Close?.ImageButton;
		if (closeButton) {
			this.connections.push(
				closeButton.MouseButton1Click.Connect(() => {
					log.info("Close (X) button clicked");
					this.close("closed");
				}),
			);
			log.info("✓ Close button connected");
		} else {
			log.warn("✗ Close button not found at Close.ImageButton");
		}

		// Secondary button (left - typically Cancel)
		const secondaryButton = this.instance.Content?.Footer?.TextButton1;
		if (secondaryButton) {
			this.connections.push(
				secondaryButton.MouseButton1Click.Connect(() => {
					log.info("Secondary button clicked");
					this.close("secondary");
				}),
			);
			log.info("✓ Secondary button connected");
		} else {
			log.warn("✗ Secondary button not found at Content.Footer.TextButton1");
		}

		// Primary button (right - typically OK/Confirm)
		const primaryButton = this.instance.Content?.Footer?.TextButton2;
		if (primaryButton) {
			this.connections.push(
				primaryButton.MouseButton1Click.Connect(() => {
					log.info("Primary button clicked");
					this.close("primary");
				}),
			);
			log.info("✓ Primary button connected");
		} else {
			log.warn("✗ Primary button not found at Content.Footer.TextButton2");
		}

		log.info(`Total connections: ${this.connections.size()}`);
	}

	/* ================================================================
	   PART 10: PRIVATE - Close & Cleanup
	   ================================================================ */

	private close(result: DialogResult): void {
		log.info(`Closing dialog with result: "${result}"`);

		// Cancel auto-close timer if running
		if (this.autoCloseThread) {
			task.cancel(this.autoCloseThread);
			this.autoCloseThread = undefined;
		}

		// Hide the dialog
		this.instance.Visible = false;

		// Resolve the promise (this triggers the .then() in calling code)
		if (this.resultResolver) {
			this.resultResolver(result);
			this.resultResolver = undefined;
		}
	}

	private setupAutoClose(duration: number): void {
		log.info(`Setting up auto-close in ${duration} seconds`);

		// Cancel existing timer
		if (this.autoCloseThread) {
			task.cancel(this.autoCloseThread);
		}

		this.autoCloseThread = task.delay(duration, () => {
			if (this.instance.Visible) {
				log.info("Auto-close triggered");
				this.close("timeout");
			}
		});
	}

	/* ================================================================
	   PART 11: LIFECYCLE - destroy
	   
	   Called when the instance is destroyed or untagged.
	   CRITICAL: Clean up all connections and pending operations!
	   ================================================================ */

	destroy(): void {
		log.info("DialogBox component destroying...");

		// Disconnect all button connections
		for (const connection of this.connections) {
			connection.Disconnect();
		}
		this.connections = [];

		// Cancel auto-close timer
		if (this.autoCloseThread) {
			task.cancel(this.autoCloseThread);
			this.autoCloseThread = undefined;
		}

		// Resolve any pending promise so callers don't hang
		if (this.resultResolver) {
			this.resultResolver("closed");
			this.resultResolver = undefined;
		}

		// Call parent destroy (required!)
		super.destroy();

		log.info("DialogBox component destroyed");
	}
}
