import { Controller, OnStart } from "@flamework/core";
import { Components } from "@flamework/components";
import { UserInputService } from "@rbxts/services";
import Signal from "@rbxts/signal";
import { ScreenKey, ScreenChangeEvent } from "shared/types/ui-types";
import { GameScreen } from "client/components/ui/game-screen";
import { createLogger } from "shared/utils";

const log = createLogger("controller:UI");

/**
 * Keybind configuration for screens
 * Add entries here to enable keyboard shortcuts
 */
const SCREEN_KEYBINDS: Partial<Record<ScreenKey, Enum.KeyCode>> = {
	Inventory: Enum.KeyCode.I,
	Character: Enum.KeyCode.C,
	Settings: Enum.KeyCode.Escape,
};

/**
 * UIController
 *
 * The "traffic cop" for all game screens. Responsibilities:
 * - Discovers and tracks all GameScreen components
 * - Manages screen visibility (open/close/toggle)
 * - Handles keyboard shortcuts
 * - Ensures only one screen is open at a time (or manages stacking)
 * - Fires events for other systems to react to screen changes
 *
 * Other controllers (InventoryController, CharacterController, etc.) should
 * NOT manage their own screen visibility. They handle data and logic only.
 */
@Controller({})
export class UIController implements OnStart {
	/** Currently open screen (undefined = all closed) */
	private currentScreen: ScreenKey | undefined;

	/** Cache of discovered screens */
	private screens = new Map<ScreenKey, GameScreen>();

	/** Fired when a screen is opened or closed */
	public readonly screenChanged = new Signal<(event: ScreenChangeEvent) => void>();

	/** Fired when any screen is opened */
	public readonly screenOpened = new Signal<(screenKey: ScreenKey) => void>();

	/** Fired when any screen is closed */
	public readonly screenClosed = new Signal<(screenKey: ScreenKey) => void>();

	constructor(private components: Components) {}

	onStart(): void {
		log.info("UIController starting...");

		// Wait a frame for components to initialize
		task.defer(() => {
			this.discoverScreens();
			this.bindInputs();
			log.info(`UIController ready. Found ${this.screens.size()} screens.`);
		});
	}

	/* ================================================================
	   Public API
	   ================================================================ */

	/**
	 * Open a screen by key. Closes any currently open screen first.
	 */
	openScreen(screenKey: ScreenKey): boolean {
		const screen = this.screens.get(screenKey);
		if (!screen) {
			log.warn(`Screen not found: ${screenKey}`);
			return false;
		}

		// Close current screen if different
		if (this.currentScreen && this.currentScreen !== screenKey) {
			this.closeScreen(this.currentScreen);
		}

		// Already open? Do nothing
		if (this.currentScreen === screenKey) {
			return true;
		}

		const previousScreen = this.currentScreen;
		this.currentScreen = screenKey;
		screen.show();

		// Fire events
		this.screenOpened.Fire(screenKey);
		this.screenChanged.Fire({ from: previousScreen, to: screenKey });

		log.info(`Opened screen: ${screenKey}`);
		return true;
	}

	/**
	 * Close a specific screen (or any open screen if no key provided)
	 */
	closeScreen(screenKey?: ScreenKey): boolean {
		const keyToClose = screenKey ?? this.currentScreen;
		if (!keyToClose) return false;

		const screen = this.screens.get(keyToClose);
		if (!screen) return false;

		// Only close if it's actually the current screen
		if (this.currentScreen !== keyToClose) return false;

		this.currentScreen = undefined;
		screen.hide();

		// Fire events
		this.screenClosed.Fire(keyToClose);
		this.screenChanged.Fire({ from: keyToClose, to: undefined });

		log.info(`Closed screen: ${keyToClose}`);
		return true;
	}

	/**
	 * Toggle a screen open/closed
	 */
	toggleScreen(screenKey: ScreenKey): void {
		if (this.currentScreen === screenKey) {
			this.closeScreen(screenKey);
		} else {
			this.openScreen(screenKey);
		}
	}

	/**
	 * Close all screens
	 */
	closeAllScreens(): void {
		if (this.currentScreen) {
			this.closeScreen(this.currentScreen);
		}
	}

	/**
	 * Check if a specific screen is currently open
	 */
	isScreenOpen(screenKey: ScreenKey): boolean {
		return this.currentScreen === screenKey;
	}

	/**
	 * Check if any screen is currently open
	 */
	isAnyScreenOpen(): boolean {
		return this.currentScreen !== undefined;
	}

	/**
	 * Get the currently open screen key
	 */
	getCurrentScreen(): ScreenKey | undefined {
		return this.currentScreen;
	}

	/**
	 * Get a screen component by key (for other controllers to access)
	 */
	getScreen(screenKey: ScreenKey): GameScreen | undefined {
		return this.screens.get(screenKey);
	}

	/* ================================================================
	   Private Methods
	   ================================================================ */

	/**
	 * Discover all GameScreen components in the game
	 */
	private discoverScreens(): void {
		const allScreens = this.components.getAllComponents<GameScreen>();

		for (const screen of allScreens) {
			if (this.screens.has(screen.screenKey)) {
				log.warn(`Duplicate screen key found: ${screen.screenKey}`);
				continue;
			}
			this.screens.set(screen.screenKey, screen);
			log.info(`Discovered screen: ${screen.screenKey}`);
		}

		// Also listen for new screens added at runtime
		this.components.onComponentAdded<GameScreen>((screen) => {
			if (!this.screens.has(screen.screenKey)) {
				this.screens.set(screen.screenKey, screen);
				log.info(`Screen added at runtime: ${screen.screenKey}`);
			}
		});

		this.components.onComponentRemoved<GameScreen>((screen) => {
			if (this.screens.get(screen.screenKey) === screen) {
				this.screens.delete(screen.screenKey);
				if (this.currentScreen === screen.screenKey) {
					this.currentScreen = undefined;
				}
				log.info(`Screen removed: ${screen.screenKey}`);
			}
		});
	}

	/**
	 * Bind keyboard shortcuts for screens
	 */
	private bindInputs(): void {
		UserInputService.InputBegan.Connect((input, gameProcessed) => {
			// Ignore if typing in a TextBox
			if (gameProcessed) return;

			// Check for screen keybinds
			for (const [screenKey, keyCode] of pairs(SCREEN_KEYBINDS)) {
				if (input.KeyCode === keyCode) {
					// Escape is special - always closes
					if (keyCode === Enum.KeyCode.Escape && this.currentScreen) {
						this.closeAllScreens();
					} else if (keyCode !== Enum.KeyCode.Escape) {
						this.toggleScreen(screenKey);
					}
					break;
				}
			}
		});

		log.info("Input bindings registered");
	}
}
