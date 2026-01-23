import { GlobalEvents, GlobalFunctions } from "./flamework-remotes";

/**
 * Server-side networking exports.
 * Import these in server-side services to send events to clients
 * and receive events from clients.
 */
export const Events = GlobalEvents.createServer({});
export const Functions = GlobalFunctions.createServer({});
