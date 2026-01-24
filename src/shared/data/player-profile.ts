import { OwnedItem } from "shared/interfaces";
export interface PlayerProfileTemplate {
	backpack: OwnedItem[];
}

export const PLAYER_PROFILE_DATASTORE_KEY = "Soul-Steel-Test-Profiles";

export const defaultPlayerProfileTemplate: PlayerProfileTemplate = {
	backpack: [],
};
