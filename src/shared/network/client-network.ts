import { ScreenKey } from "../types";
import { GlobalEvents, GlobalFunctions } from "./flamework-remotes";
import Signal from "@rbxts/sleitnick-signal";

/**
 * Client-side networking exports.
 * Import these in client-side controllers to send events to server
 * and receive events from server.
 */

export const ClientSignals = {
	// Structured example signal
	onExampleEvent: new Signal<[data: string]>(),

	// Inventory item actions
	itemUseRequest: new Signal<[itemId: number]>(),
	itemEquipRequest: new Signal<[itemId: number]>(),
	itemUnequipRequest: new Signal<[itemId: number]>(),
	itemPurchaseRequest: new Signal<[itemId: number]>(),

	// Toggle Screen
	toggleScreenRequest: new Signal<[screenName?: ScreenKey]>(),
};
export const Events = GlobalEvents.createClient({});
export const Functions = GlobalFunctions.createClient({});
