/** Background music tracks */
export const MUSIC_CATALOG = {
	epic_main: "rbxassetid://88797678675646",
	camp_fire: "rbxassetid://88801445687612",
	light_rain: "rbxassetid://123071170017486",
	tribal_camp: "rbxassetid://134608032579135",
	// Add more tracks here...
} as const;

/** Sound effects */
export const SFX_CATALOG = {
	// UI sounds
	button_click: "rbxassetid://75822150781541", // TODO: Add real asset ID
	panel_open: "rbxassetid://83030444600776",
	panel_close: "rbxassetid://83030444600776",

	// Combat sounds
	hit_light: "rbxassetid://86267666947038",
	hit_heavy: "rbxassetid://75822150781541",
	ability_cast: "rbxassetid://87346703835485",
	ability_validation_fail: "rbxassetid://131912667805687",
	power_charge: "rbxassetid://87346703835485",
	stomp_heavy: "rbxassetid://97240293345639",

	// Status effect sounds
	status_poison_apply: "rbxassetid://9119633594", // Wet bubble/poison apply
	status_poison_tick: "rbxassetid://9119633594", // Subtle damage tick
	status_poison_cure: "rbxassetid://9119633594", // Cleanse/relief sound
	status_burn_apply: "rbxassetid://9119633594", // Ignite sound
	status_burn_tick: "rbxassetid://9119633594", // Fire crackle
	status_stun_apply: "rbxassetid://9119633594", // Impact/daze sound
	status_slow_apply: "rbxassetid://9119633594", // Heavy/sluggish sound

	// Feedback sounds
	level_up: "rbxassetid://135831492234192",
	item_pickup: "rbxassetid://135831492234192",
	error: "rbxassetid://131912667805687",
} as const;

export type MusicKey = keyof typeof MUSIC_CATALOG;
export type SFXKey = keyof typeof SFX_CATALOG;
