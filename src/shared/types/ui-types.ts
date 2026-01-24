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
