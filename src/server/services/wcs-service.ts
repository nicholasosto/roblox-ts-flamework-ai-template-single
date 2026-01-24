import { Service, OnStart } from "@flamework/core";
import { Players, ReplicatedStorage } from "@rbxts/services";
import { Character, DamageContainer, CreateServer } from "@rbxts/wcs";
import { MeleeAttack, Fireball } from "shared/combat/skills";
import { createLogger } from "shared/utils/logger";

const logger = createLogger("WCSService");

// Create WCS Server instance
const wcsServer = CreateServer();

/**
 * WCS Combat Service
 * Handles server-side WCS initialization and character management
 */
@Service()
export class WCSService implements OnStart {
	onStart() {
		logger.info("WCS Service starting...");

		// Register skills directory (WCS needs to know where skills are)
		wcsServer.RegisterDirectory(
			ReplicatedStorage.WaitForChild("TS").WaitForChild("combat") as Folder,
		);

		// Start the WCS server - MUST be called before creating characters
		wcsServer.Start();
		logger.info("WCS Server started");

		// Set up character creation for players
		Players.PlayerAdded.Connect((player) => this.onPlayerAdded(player));

		// Handle existing players (in case of late server start)
		for (const player of Players.GetPlayers()) {
			this.onPlayerAdded(player);
		}

		logger.info("WCS Service initialized");
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

		// Give the character combat skills
		new MeleeAttack(wcsCharacter);
		new Fireball(wcsCharacter);
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

		wcsCharacter.DamageDealt.Connect(
			(target: Character | undefined, damageContainer: DamageContainer) => {
				if (target) {
					logger.info(
						`${characterModel.Name} dealt ${damageContainer.Damage} damage to ${target.Instance.Name}`,
					);
				}
			},
		);
	}
}
