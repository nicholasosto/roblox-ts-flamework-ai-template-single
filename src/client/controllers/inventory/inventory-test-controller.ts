import { Controller, OnStart } from "@flamework/core";
import { createLogger } from "shared/utils";
import { InventoryController } from "./inventory-controller";

const logger = createLogger("controller:InventoryTest");

@Controller({})
export class InventoryTestController implements OnStart {
	constructor(private readonly inventoryController: InventoryController) {}
	onStart() {
		logger.info("InventoryTestController initialized.");
		let playerItems = this.inventoryController.getUnequippedItems();
		while (playerItems.size() <= 0) {
			task.wait(1);
			playerItems = this.inventoryController.getUnequippedItems();
			logger.info("Waiting for unequipped items...");
		}
		logger.info(`Player has ${playerItems.size()} unequipped items.`, playerItems);
		this.inventoryController.requestEquip(playerItems[0].UUID, "SoulSlot1");
		this.inventoryController.requestUnequip("HeadSlot");
		logger.info(
			`Equipped item ${playerItems[0].UUID} to SoulSlot1.`,
			this.inventoryController.getBackpackItems().filter((item) => item.CurrentSlotKey !== "Backpack"),
		);
	}
}
