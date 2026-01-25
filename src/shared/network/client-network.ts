import { ItemCategory, SlotKey } from "../interfaces";
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
	itemUseRequest: new Signal<[catalogId: string]>(),
	itemEquipRequest: new Signal<[itemId: string]>(),
	itemUnequipRequest: new Signal<[itemId: string]>(),
	itemPurchaseRequest: new Signal<[itemId: string]>(),

	// UI Events
	itemSelected: new Signal<[itemId: string]>(),
	itemSlotSelected: new Signal<[itemSlotComponent: SlotKey]>(),

	// Grid Events
	filterGridRequest: new Signal<[itemCategory?: ItemCategory]>(),
	sortGridRequest: new Signal<[]>(),

	// Toggle Screen
	toggleScreenRequest: new Signal<[screenName?: ScreenKey]>(),
};
export const Events = GlobalEvents.createClient({});
export const Functions = GlobalFunctions.createClient({});
