/* ================================================================
   Screen Keys - All possible screen identifiers
   ================================================================ */
export const SCREEN_KEYS = ["Inventory", "Character", "Settings", "Shop"] as const;
export type ScreenKey = (typeof SCREEN_KEYS)[number];

/* ================================================================
   UI Component Attributes
   ================================================================ */

/** Attributes for GameScreen tagged ScreenGui instances */
export interface GameScreenAttributes {
	screenKey: ScreenKey;
}

/** Attributes for ScreenButton tagged ImageButton instances */
export interface ScreenButtonAttributes {
	screenKey: ScreenKey;
}

/* ================================================================
   UI Events
   ================================================================ */
export interface ScreenChangeEvent {
	from: ScreenKey | undefined;
	to: ScreenKey | undefined;
}

/* ================================================================
   Dialog System Types
   ================================================================ */

/** Dialog type determines visual style and default button configuration */
export type DialogType = "confirmation" | "message" | "warning" | "error";

/** Button configuration for dialogs */
export interface DialogButton {
	text: string;
	/** Callback returns true to close dialog, false to keep open */
	callback?: () => boolean | void;
}

/** Configuration for showing a dialog */
export interface DialogConfig {
	/** Dialog type affects styling */
	type: DialogType;
	/** Title text displayed in header */
	title: string;
	/** Body message text */
	message: string;
	/** Primary button (right side, e.g., "Confirm", "OK") */
	primaryButton?: DialogButton;
	/** Secondary button (left side, e.g., "Cancel") */
	secondaryButton?: DialogButton;
	/** Auto-close after duration (seconds). Undefined = no auto-close */
	duration?: number;
}

/** Result from a dialog interaction */
export type DialogResult = "primary" | "secondary" | "closed" | "timeout";

/** Event fired when dialog state changes */
export interface DialogStateEvent {
	isOpen: boolean;
	config?: DialogConfig;
}
