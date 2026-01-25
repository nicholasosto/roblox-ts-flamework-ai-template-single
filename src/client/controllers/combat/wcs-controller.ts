import { Controller, OnStart } from "@flamework/core";
import { Players, ReplicatedStorage, UserInputService } from "@rbxts/services";
import { Character, CreateClient, GetRegisteredSkillConstructor } from "@rbxts/wcs";
import { createLogger } from "shared/utils";
import { ClientSignals } from "../../../shared/network/client-network";

const log = createLogger("controller:WCS");

/**
 * WCS Combat Controller
 * Handles client-side WCS initialization and input handling
 */
@Controller()
export class WCSController implements OnStart {
	private wcsClient = CreateClient();
	private localCharacter?: Character;

	onStart() {
		log.info("Starting...");

		// Register skills directory (WCS needs to know where skills are)
		this.wcsClient.RegisterDirectory(ReplicatedStorage.WaitForChild("TS").WaitForChild("combat") as Folder);

		// Start the WCS client
		this.wcsClient.Start();
		log.info("WCS Client started");

		const localPlayer = Players.LocalPlayer;

		// Set up character tracking
		localPlayer.CharacterAdded.Connect((characterModel) => {
			this.onCharacterAdded(characterModel);
		});

		// Handle existing character
		if (localPlayer.Character) {
			this.onCharacterAdded(localPlayer.Character);
		}

		// Set up input handling
		this.setupInputHandling();

		log.info("Initialized");
	}

	private onCharacterAdded(characterModel: Model) {
		// Wait a frame for WCS Character to be created on server
		task.defer(() => {
			const wcsCharacter = Character.GetCharacterFromInstance(characterModel);
			if (wcsCharacter) {
				this.localCharacter = wcsCharacter;
				log.info(`Found WCS Character for ${characterModel.Name}`);
			} else {
				// Retry after a short delay if not found
				task.delay(0.5, () => {
					const retryCharacter = Character.GetCharacterFromInstance(characterModel);
					if (retryCharacter) {
						this.localCharacter = retryCharacter;
						log.info(`Found WCS Character on retry`);
					} else {
						log.warn("Could not find WCS Character");
					}
				});
			}
		});
	}

	private setupInputHandling() {
		// Attack on left mouse click
		UserInputService.InputBegan.Connect((input, gameProcessedEvent) => {
			// Ignore if UI is handling the input
			if (gameProcessedEvent) return;

			// Left mouse button for melee attack
			if (input.UserInputType === Enum.UserInputType.MouseButton1) {
				this.tryMeleeAttack();
			}

			// Keyboard key "F" as alternative melee attack
			if (input.KeyCode === Enum.KeyCode.F) {
				this.tryMeleeAttack();
			}

			// Keyboard key "E" for Fireball
			if (input.KeyCode === Enum.KeyCode.E) {
				this.tryFireball();
			}
		});
		ClientSignals.itemUseRequest.Connect((catalogId: string) => {
			this.startAbilityByName(catalogId);
		});
	}

	private startAbilityByName(abilityName: string) {
		if (!this.localCharacter) {
			log.warn("No local WCS character");
			return;
		}
		const skill = this.localCharacter.GetSkillFromString(abilityName);
		if (!skill) {
			log.warn(`Ability not found on character: ${abilityName}`);
			return;
		}
		skill.Start();
		log.info(`Started ability: ${abilityName}`);
	}

	private tryMeleeAttack() {
		if (!this.localCharacter) {
			log.warn("No local WCS character");
			return;
		}

		// Get the MeleeAttack skill from the character using registered constructor
		const MeleeAttack = GetRegisteredSkillConstructor("MeleeAttack");
		if (!MeleeAttack) {
			log.warn("MeleeAttack not registered");
			return;
		}

		const meleeSkill = this.localCharacter.GetSkillFromConstructor(MeleeAttack);

		if (!meleeSkill) {
			log.warn("MeleeAttack skill not found on character");
			return;
		}

		// Start the skill (automatically sends request to server)
		meleeSkill.Start();
		log.info("Started MeleeAttack");
	}

	private tryFireball() {
		if (!this.localCharacter) {
			log.warn("No local WCS character");
			return;
		}

		// Get the Fireball skill from the character using registered constructor
		const Fireball = GetRegisteredSkillConstructor("Fireball");
		if (!Fireball) {
			log.warn("Fireball not registered");
			return;
		}

		const fireballSkill = this.localCharacter.GetSkillFromConstructor(Fireball);

		if (!fireballSkill) {
			log.warn("Fireball skill not found on character");
			return;
		}

		// Start the skill (automatically sends request to server)
		fireballSkill.Start();
		log.info("Started Fireball");
	}
}
