import { ItemCategory, OwnedItem, SlotKey } from "../interfaces";
import { ScreenKey } from "../types";
import { GlobalEvents, GlobalFunctions } from "./flamework-remotes";
import Signal from "@rbxts/sleitnick-signal";

/**
 * Client-side networking exports.
 * Import these in client-side controllers to send events to server
 * and receive events from server.
 */

export const ClientSignals = {
	// Inventory item actions
	itemUseRequest: new Signal<[catalogId: string]>(),
	itemPurchaseRequest: new Signal<[catalogId: string]>(),

	// UI Events
	itemSelected: new Signal<[itemId: string]>(),
	itemSlotSelected: new Signal<[slotKey: SlotKey]>(),

	// Grid Events - items are passed directly to avoid duplicate caching
	updateGridItems: new Signal<[items: OwnedItem[], filter?: ItemCategory]>(),
	setCategoryFilter: new Signal<[category: ItemCategory]>(),

	// Toggle Screen
	toggleScreenRequest: new Signal<[screenName?: ScreenKey]>(),

	// Toggle Canvas
	toggleCanvasRequest: new Signal<[canvasName?: string]>(),
};
export const Events = GlobalEvents.createClient({});
export const Functions = GlobalFunctions.createClient({});
