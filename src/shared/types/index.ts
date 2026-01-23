/**
 * Shared type definitions for the game.
 * Add interfaces, types, and enums here that are used across client and server.
 */

/** Example: Player data structure */
export interface PlayerData {
	userId: number;
	displayName: string;
	coins: number;
	level: number;
}

/** Example: Game state enum */
export enum GameState {
	Lobby = "Lobby",
	Playing = "Playing",
	Ended = "Ended",
}
