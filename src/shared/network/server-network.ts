import Signal from "@rbxts/sleitnick-signal";
import { GlobalEvents, GlobalFunctions } from "./flamework-remotes";
import { OwnedItem } from "../interfaces";

/**
 * Server-side networking exports.
 * Import these in server-side services to send events to clients
 * and receive events from clients.
 */

export const ServerSignals = {
	// Structured example signal
	onExampleEvent: new Signal<[data: string]>(),

	// Inventory item actions
	backpackUpdated: new Signal<[player: Player, backpack: OwnedItem[]]>(),
};
export const Events = GlobalEvents.createServer({});
export const Functions = GlobalFunctions.createServer({});
