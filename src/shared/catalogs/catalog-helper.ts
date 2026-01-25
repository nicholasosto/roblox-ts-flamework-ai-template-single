import { ABILITY_CATALOG } from "./ability-catalog";
import { EQUIPMENT_CATALOG } from "./equipment-catalog";
import { SOUL_GEM_CATALOG } from "./soul-gem-catalog";

export function getCatalogEntryById(catalogId: string) {
	if (ABILITY_CATALOG[catalogId]) {
		return ABILITY_CATALOG[catalogId];
	} else if (EQUIPMENT_CATALOG[catalogId]) {
		return EQUIPMENT_CATALOG[catalogId];
	} else if (SOUL_GEM_CATALOG[catalogId]) {
		return SOUL_GEM_CATALOG[catalogId];
	} else {
		return undefined;
	}
}
