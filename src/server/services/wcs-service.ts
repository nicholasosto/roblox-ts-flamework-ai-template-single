import { Service, OnStart } from "@flamework/core";
import { Players, ReplicatedStorage } from "@rbxts/services";
import { Character, DamageContainer, CreateServer, GetRegisteredSkillConstructor } from "@rbxts/wcs";
import { createLogger } from "shared/utils/logger";
import { ServerSignals } from "../../shared/network/server-network";
import { OwnedItem } from "../../shared/interfaces";

const logger = createLogger("WCSService");

/**
 * WCS Combat Service
 * Handles server-side WCS initialization and character management
 */
@Service()
export class WCSService implements OnStart {
	private wcsServer = CreateServer();

	onStart() {
		logger.info("WCS Service starting...");

		// Register skills directory (WCS needs to know where skills are)
		// This will scan the folder and run SkillDecorator on all skills
		this.wcsServer.RegisterDirectory(ReplicatedStorage.WaitForChild("TS").WaitForChild("combat") as Folder);

		// Start the WCS server - MUST be called before creating characters
		this.wcsServer.Start();
		logger.info("WCS Server started");

		// Set up character creation for players
		Players.PlayerAdded.Connect((player) => this.onPlayerAdded(player));

		// Handle existing players (in case of late server start)
		for (const player of Players.GetPlayers()) {
			this.onPlayerAdded(player);
		}
		this.registerServerSignals();
		logger.info("WCS Service initialized");
	}

	private registerServerSignals() {
		// Example signal registration
		// ServerSignals.onExampleEvent.Connect((data: string) => {
		// 	logger.info(`Received example event with data: ${data}`);
		// });

		ServerSignals.backpackUpdated.Connect((player: Player, backpack: OwnedItem[]) => {
			backpack.mapFiltered((item) => {
				if (item.ItemCategory === "Ability") {
					logger.info(`Player ${player.Name} has ability item: ${item.UUID} (Catalog: ${item.CatalogId})`);
				}
			});
		});
	}

	private onPlayerAdded(player: Player) {
		// Handle character spawning
		player.CharacterAdded.Connect((characterModel) => {
			this.setupCharacter(characterModel);
		});

		// Handle existing character
		if (player.Character) {
			this.setupCharacter(player.Character);
		}
	}

	private setupCharacter(characterModel: Model) {
		// Create WCS Character wrapper
		const wcsCharacter = new Character(characterModel);

		logger.info(`Created WCS Character for ${characterModel.Name}`);

		// Give the character combat skills using registered constructors
		// Skills are registered by SkillDecorator when RegisterDirectory scans them
		const MeleeAttack = GetRegisteredSkillConstructor("MeleeAttack");
		const Fireball = GetRegisteredSkillConstructor("Fireball");

		if (MeleeAttack) {
			new MeleeAttack(wcsCharacter);
		} else {
			logger.warn("MeleeAttack skill not registered");
		}

		if (Fireball) {
			new Fireball(wcsCharacter);
		} else {
			logger.warn("Fireball skill not registered");
		}

		logger.info(`Applied combat skills to ${characterModel.Name}`);

		// Clean up on death
		const humanoid = characterModel.WaitForChild("Humanoid") as Humanoid;
		humanoid.Died.Once(() => {
			wcsCharacter.Destroy();
			logger.info(`Destroyed WCS Character for ${characterModel.Name}`);
		});

		// Listen for damage events
		wcsCharacter.DamageTaken.Connect((damageContainer: DamageContainer) => {
			logger.info(`${characterModel.Name} took ${damageContainer.Damage} damage`);
		});

		wcsCharacter.DamageDealt.Connect((target: Character | undefined, damageContainer: DamageContainer) => {
			if (target) {
				logger.info(`${characterModel.Name} dealt ${damageContainer.Damage} damage to ${target.Instance.Name}`);
			}
		});
	}
}
