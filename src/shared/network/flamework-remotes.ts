import { Networking } from "@flamework/networking";
import { OwnedItem, SlotKey } from "../interfaces";

/**
 * Define all client-to-server events here.
 * Organize by namespace for clarity.
 */
export interface ClientToServerEvents {
	/** Example namespace for player-related events */
	player: {
		/** Example: Client notifies server of action */
		onAction: (actionName: string) => void;
	};

	/** Inventory management events */
	inventory: {
		/** Request to equip an item to a slot */
		requestEquip: (itemId: string, slotKey: SlotKey) => void;
		/** Request to unequip an item from a slot */
		requestUnequip: (slotKey: SlotKey) => void;
		/** Request to purchase an item from catalog */
		requestPurchase: (catalogId: string) => void;
		/** Request to sell an item */
		requestSell: (itemId: string, quantity: number) => void;
	};
}

/**
 * Define all server-to-client events here.
 * Organize by namespace for clarity.
 */
export interface ServerToClientEvents {
	/** Example namespace for notifications */
	notification: {
		/** Example: Server sends notification to client */
		show: (message: string, duration: number) => void;
	};

	/** Inventory sync events */
	inventory: {
		/** Full backpack sync from server */
		backpackSync: (backpack: OwnedItem[]) => void;
		/** Purchase result notification */
		purchaseResult: (success: boolean, catalogId: string, message?: string) => void;
	};
}

/**
 * Define all server functions callable from client here.
 */
export interface ServerFunctions {
	/** Example namespace for data requests */
	data: {
		/** Example: Client requests data from server */
		getData: (dataId: string) => Promise<string>;
	};
}

/**
 * Define all client functions callable from server here.
 */
export interface ClientFunctions {
	/** Example namespace for client actions */
	actions: {
		/** Example: Server requests client to perform action */
		performAction: (actionType: string) => Promise<boolean>;
	};
}

// Export the networking definitions
export const GlobalEvents = Networking.createEvent<ClientToServerEvents, ServerToClientEvents>();
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>();
