import { GlobalEvents, GlobalFunctions } from "./flamework-remotes";

/**
 * Client-side networking exports.
 * Import these in client-side controllers to send events to server
 * and receive events from server.
 */
export const Events = GlobalEvents.createClient({});
export const Functions = GlobalFunctions.createClient({});
